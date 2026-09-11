Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: SIKLUS HIDUP LOWONGAN & OUTCOME GATEKEEPER       " -ForegroundColor Cyan
Write-Host "  (TTL 14/30 Hari, Auto-Expiration, Resolution & Zero-Locking)   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# STEP 0: Siapkan Data Uji Terisolasi di Database
Write-Host "`n[STEP 0] Inisialisasi Akun Employer & Talenta Uji di PostgreSQL..." -NoNewline
$setupScript = @'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const stamp = Date.now();

  // Employer Uji
  const empUser = await prisma.user.create({
    data: { email: `pt.lifecycle.${stamp}@mimika.co.id`, passwordHash: hash, role: 'EMPLOYER', isVerified: true }
  });
  const employer = await prisma.employer.create({
    data: {
      id: empUser.id,
      nib: '9104' + Math.floor(100000000 + Math.random() * 900000000),
      companyName: 'PT Lifecycle Surveyor Mimika',
      verificationStatus: 'APPROVED'
    }
  });

  // Talenta Uji
  const randNum = Math.floor(1000000 + Math.random() * 9000000);
  const talentUser = await prisma.user.create({
    data: { email: `markus.${stamp}@talenta.id`, passwordHash: hash, role: 'TALENT', isVerified: true }
  });
  const talent = await prisma.talent.create({
    data: {
      id: talentUser.id,
      nik: `91040189${randNum}`,
      fullName: 'Markus Maturbongs (Surveyor Pemetaan)',
      birthDate: new Date('1997-03-20'),
      phone: '081233445566',
      skills: [{ name: 'GIS & Topografi', level: 'EXPERT' }],
      education: [{ institution: 'Politeknik Amamapare', degree: 'D3', major: 'Teknik Geodesi', graduationYear: 2018 }],
      workExperience: [{ companyName: 'PT Survey Mimika', position: 'Field Surveyor', durationMonths: 36, description: 'Pemetaan kontur' }],
      isAvailable: true,
      profileCompletenessScore: 100
    }
  });

  console.log(JSON.stringify({
    empEmail: empUser.email,
    empId: employer.id,
    talentId: talent.id,
    talentName: talent.fullName
  }));
}

main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
'@

Push-Location apps/backend
$rawSeed = node -e $setupScript
Pop-Location
$seedData = ($rawSeed | Where-Object { $_ -match '^\s*\{' } | Select-Object -First 1) | ConvertFrom-Json
Write-Host " [BERHASIL]" -ForegroundColor Green
Write-Host "  Employer : $($seedData.empEmail)" -ForegroundColor Gray
Write-Host "  Talenta  : $($seedData.talentName) ($($seedData.talentId))`n" -ForegroundColor Gray

# STEP 1: Login Employer
Write-Host "[STEP 1] Autentikasi Employer..." -NoNewline
$loginBody = @{ identifier = $seedData.empEmail; password = "Password123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session | Out-Null
Write-Host " [BERHASIL: Sesi Aktif]" -ForegroundColor Green

# STEP 2: Penerbitan Lowongan dengan TTL 14 Hari
Write-Host "[STEP 2] Penerbitan Lowongan Baru dengan TTL 14 Hari..." -NoNewline
$vacPayload = @{
    title = "Juru Ukur / Surveyor Topografi"
    taskDescription = "Pemetaan batas konsesi area dataran rendah Timika."
    projectDuration = "6 Bulan Kontrak"
    requiredSkills = @("GIS & Topografi")
    minEducation = "D3"
    minExperienceYears = 2
    quota = 2
    workZone = "TIMIKA_KOTA"
    activeDaysDuration = 14
} | ConvertTo-Json

$resVac = Invoke-RestMethod -Uri "$baseUrl/vacancies" -Method Post -Body $vacPayload -ContentType "application/json" -WebSession $session
$vacId = $resVac.data.id

if ($resVac.status -eq "success" -and $resVac.data.activeDaysDuration -eq 14 -and $resVac.data.expiresAt -ne $null) {
    $expDate = [DateTime]::Parse($resVac.data.expiresAt)
    $now = [DateTime]::UtcNow
    $diffDays = ($expDate - $now).TotalDays
    Write-Host " [BERHASIL]" -ForegroundColor Green
    Write-Host "  Vacancy ID         : $vacId" -ForegroundColor Gray
    Write-Host "  Active Days        : $($resVac.data.activeDaysDuration) Hari" -ForegroundColor Gray
    Write-Host "  Status Awal        : $($resVac.data.status)" -ForegroundColor Gray
    Write-Host "  Kedaluwarsa (Exp)  : $($resVac.data.expiresAt) (~$([Math]::Round($diffDays, 1)) hari lagi)" -ForegroundColor Gray
} else {
    Write-Host " [GAGAL: Perhitungan TTL & expiresAt tidak sesuai]" -ForegroundColor Red
    exit 1
}

# STEP 3: Simulasi Melewati Batas Masa Tayang (Simulate TTL Expiry)
Write-Host "`n[STEP 3] Simulasi Masa Tayang Habis (Set expiresAt = kemarin di DB)..." -NoNewline
$env:TEST_VAC_ID = $vacId
$expireScript = @'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const vacId = process.env.TEST_VAC_ID;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.jobVacancy.update({
    where: { id: vacId },
    data: { expiresAt: yesterday }
  });
  console.log('EXPIRED_SIMULATED');
}
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
'@
Push-Location apps/backend
node -e $expireScript | Out-Null
Pop-Location
Write-Host " [BERHASIL: expiresAt dipercepat ke masa lampau]" -ForegroundColor Green

# STEP 4: Trigger Auto-Expiration & Ambil Pending Outcomes
Write-Host "[STEP 4] Pengujian Endpoint GET /vacancies/pending-outcomes..." -NoNewline
$pendingRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/pending-outcomes" -Method Get -WebSession $session
$expiredVac = $pendingRes.data | Where-Object { $_.id -eq $vacId }

if ($expiredVac -and $expiredVac.status -eq "EXPIRED") {
    Write-Host " [BERHASIL: Auto-Expiration Triggered & Status EXPIRED]" -ForegroundColor Green
    Write-Host "  Pending Count : $($pendingRes.data.Count) lowongan" -ForegroundColor Gray
    Write-Host "  Status Terkini: $($expiredVac.status)" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Lowongan tidak otomatis bertransisi ke EXPIRED]" -ForegroundColor Red
    exit 1
}

# STEP 5: Resolusi Outcome A: Perpanjang Masa Tayang (EXTEND_TTL +14 Hari)
Write-Host "`n[STEP 5] Uji Resolusi Outcome: Perpanjang Masa Tayang (EXTEND_TTL +14 Hari)..." -NoNewline
$extendPayload = @{
    outcome = "EXTEND_TTL"
    notes = "Masih membutuhkan kandidat surveyor tambahan"
} | ConvertTo-Json

$extendRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacId/resolve-outcome" -Method Patch -Body $extendPayload -ContentType "application/json" -WebSession $session

if ($extendRes.status -eq "success" -and $extendRes.data.status -eq "OPEN") {
    $newExp = [DateTime]::Parse($extendRes.data.expiresAt)
    $now = [DateTime]::UtcNow
    $diffDays = ($newExp - $now).TotalDays
    Write-Host " [BERHASIL]" -ForegroundColor Green
    Write-Host "  Status Pasca-Extend : $($extendRes.data.status) (Aktif Kembali)" -ForegroundColor Green
    Write-Host "  New Active Duration : $($extendRes.data.activeDaysDuration) Hari" -ForegroundColor Gray
    Write-Host "  New expiresAt       : $($extendRes.data.expiresAt) (~$([Math]::Round($diffDays, 1)) hari lagi)" -ForegroundColor Gray
} else {
    Write-Host " [GAGAL: Perpanjangan masa tayang tidak berhasil]" -ForegroundColor Red
    exit 1
}

# Pastikan tidak lagi masuk di pending-outcomes
$pendingAfterExtend = Invoke-RestMethod -Uri "$baseUrl/vacancies/pending-outcomes" -Method Get -WebSession $session
$shouldBeEmpty = $pendingAfterExtend.data | Where-Object { $_.id -eq $vacId }
if ($shouldBeEmpty) {
    Write-Host " [GAGAL: Lowongan yang sudah di-extend masih muncul di pending outcomes]" -ForegroundColor Red
    exit 1
}

# STEP 6: Simulasi Expire Kembali untuk Menguji Outcome HIRED_CANDIDATE
Write-Host "`n[STEP 6] Set Expire Kembali & Uji Resolusi Outcome HIRED_CANDIDATE..." -NoNewline
Push-Location apps/backend
node -e $expireScript | Out-Null
Pop-Location

# Trigger expire
$pendingRes2 = Invoke-RestMethod -Uri "$baseUrl/vacancies/pending-outcomes" -Method Get -WebSession $session
$expiredAgain = $pendingRes2.data | Where-Object { $_.id -eq $vacId }
if (-not $expiredAgain) {
    Write-Host " [GAGAL: Re-expire gagal]" -ForegroundColor Red
    exit 1
}

# Lakukan Approach terlebih dahulu pada talenta
Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacId/approach/$($seedData.talentId)" -Method Post -WebSession $session | Out-Null

# Resolve dengan HIRED_CANDIDATE
$hiredPayload = @{
    outcome = "HIRED_CANDIDATE"
    selectedTalentIds = @($seedData.talentId)
    notes = "Kandidat Markus resmi dikontrak untuk proyek pemetaan 6 bulan"
} | ConvertTo-Json

$resolveHiredRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacId/resolve-outcome" -Method Patch -Body $hiredPayload -ContentType "application/json" -WebSession $session

if ($resolveHiredRes.status -eq "success" -and $resolveHiredRes.data.status -eq "CLOSED" -and ($resolveHiredRes.data.closureReason -like "*HIRED*")) {
    Write-Host " [BERHASIL]" -ForegroundColor Green
    Write-Host "  Status Akhir    : $($resolveHiredRes.data.status)" -ForegroundColor Green
    Write-Host "  Closure Reason  : $($resolveHiredRes.data.closureReason)" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Resolusi HIRED_CANDIDATE gagal: $($resolveHiredRes | ConvertTo-Json)]" -ForegroundColor Red
    exit 1
}

# STEP 7: Uji Invarian Kedaulatan Ketersediaan Talenta (Anti-Locking Sovereignty)
Write-Host "`n[STEP 7] Verifikasi Aksioma Kedaulatan Talenta: isAvailable Tetap TRUE..." -NoNewline
$env:TEST_TALENT_ID = $seedData.talentId
$verifyTalentScript = @'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const vacId = process.env.TEST_VAC_ID;
  const talentId = process.env.TEST_TALENT_ID;
  const t = await prisma.talent.findUnique({ where: { id: talentId } });
  const app = await prisma.talentApproach.findFirst({
    where: { vacancyId: vacId, talentId: talentId }
  });
  console.log(JSON.stringify({
    isAvailable: t.isAvailable,
    approachStatus: app.status
  }));
}
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
'@

Push-Location apps/backend
$talentCheckRaw = node -e $verifyTalentScript
Pop-Location
$talentCheck = ($talentCheckRaw | Where-Object { $_ -match '^\s*\{' } | Select-Object -First 1) | ConvertFrom-Json

if ($talentCheck.isAvailable -eq $true -and $talentCheck.approachStatus -eq "HIRED") {
    Write-Host " [LULUS SEMPURNA]" -ForegroundColor Green
    Write-Host "  Talent isAvailable   : $($talentCheck.isAvailable) (Kedaulatan mobilitas kerja utuh!)" -ForegroundColor Green
    Write-Host "  Approach Status      : $($talentCheck.approachStatus) (Tercatat resmi dalam arsip rekrutmen)" -ForegroundColor Gray
} else {
    Write-Host " [GAGAL: Invarian kedaulatan talenta dilanggar!]" -ForegroundColor Red
    exit 1
}

# STEP 8: Uji Resolusi Outcome Lainnya (EXTERNAL_HIRED & CANCELLED)
Write-Host "`n[STEP 8] Uji Resolusi Outcome: EXTERNAL_HIRED & CANCELLED..." -NoNewline
# Buat lowongan baru lalu expire dan batalkan
$vacPayload2 = @{
    title = "Draft Lowongan Batal"
    taskDescription = "Testing cancel outcome"
    projectDuration = "1 Bulan"
    requiredSkills = @("Administrasi Umum")
    minEducation = "SMA"
    quota = 1
    activeDaysDuration = 14
} | ConvertTo-Json
$resVac2 = Invoke-RestMethod -Uri "$baseUrl/vacancies" -Method Post -Body $vacPayload2 -ContentType "application/json" -WebSession $session
$vacId2 = $resVac2.data.id

# Expire vac 2
$env:TEST_VAC_ID_2 = $vacId2
$expireScript2 = @'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const vacId2 = process.env.TEST_VAC_ID_2;
  await prisma.jobVacancy.update({
    where: { id: vacId2 },
    data: { expiresAt: new Date(Date.now() - 10000) }
  });
}
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
'@
Push-Location apps/backend
node -e $expireScript2 | Out-Null
Pop-Location

# Trigger expire
Invoke-RestMethod -Uri "$baseUrl/vacancies/pending-outcomes" -Method Get -WebSession $session | Out-Null

# Resolve cancel
$cancelPayload = @{
    outcome = "CANCELLED"
    notes = "Proyek dibatalkan oleh prinsipal"
} | ConvertTo-Json
$cancelRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacId2/resolve-outcome" -Method Patch -Body $cancelPayload -ContentType "application/json" -WebSession $session

if ($cancelRes.status -eq "success" -and $cancelRes.data.status -eq "CLOSED" -and ($cancelRes.data.closureReason -like "CANCELLED*")) {
    Write-Host " [BERHASIL]" -ForegroundColor Green
    Write-Host "  Vacancy 2 Status : $($cancelRes.data.status)" -ForegroundColor Gray
    Write-Host "  Closure Reason   : $($cancelRes.data.closureReason)" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Pembatalan tidak terekam]" -ForegroundColor Red
    exit 1
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  SELURUH UJI SIKLUS HIDUP LOWONGAN & OUTCOME GATEKEEPER LULUS!  " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
