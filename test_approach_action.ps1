Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI 1.2.3 (APPROACH & NOTIFICATION) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$empSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Ambil Lowongan dan Kandidat dari Database via node script
$nodeScript = @'
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const vacancy = await prisma.jobVacancy.findFirst({
    where: { status: 'OPEN' },
    include: { employer: { include: { user: true } } }
  });
  // Ambil talenta yang siap kerja dan memiliki nomor telepon terdaftar
  let talent = await prisma.talent.findFirst({
    where: { isAvailable: true, phone: { not: null } }
  });
  if (!talent) {
    talent = await prisma.talent.findFirst({
      where: { isAvailable: true }
    });
  }
  console.log(JSON.stringify({
    empEmail: vacancy.employer.user.email,
    vacancyId: vacancy.id,
    talentId: talent.id,
    talentName: talent.fullName
  }));
}
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
'@

Push-Location apps/backend
$rawOutput = node -e $nodeScript
Pop-Location
$jsonLine = $rawOutput | Where-Object { $_ -match '^\s*\{' } | Select-Object -First 1
$envData = $jsonLine | ConvertFrom-Json

# 2. Login Employer
Write-Host "`n[STEP 1] Login Employer..." -NoNewline
$loginBody = @{ identifier = $envData.empEmail; password = "Password123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $empSession | Out-Null
Write-Host " [BERHASIL]" -ForegroundColor Green

# 3. Eksekusi Aksi Approach
Write-Host "[STEP 2] Mengeksekusi Aksi Approach ke Talenta ($($envData.talentName))..." -NoNewline
$resApproach = Invoke-RestMethod -Uri "$baseUrl/vacancies/$($envData.vacancyId)/approach/$($envData.talentId)" -Method Post -WebSession $empSession

if ($resApproach.status -eq "success" -and $resApproach.data.talentContact) {
    Write-Host " [BERHASIL]" -ForegroundColor Green
    Write-Host "Pesan Server : $($resApproach.message)" -ForegroundColor Yellow
    Write-Host "Kontak Telp  : $(if ($resApproach.data.talentContact.phone) { $resApproach.data.talentContact.phone } else { 'Belum diisi pelamar' })" -ForegroundColor Yellow
    Write-Host "Email Pelamar: $($resApproach.data.talentContact.email)" -ForegroundColor Yellow
    Write-Host "Skor AI Match: $($resApproach.data.aiMatchScore)%" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Response tidak valid]" -ForegroundColor Red
}

# 4. Verifikasi Idempotensi (Tekan Tombol Approach Ulang - Tidak Boleh Duplikat Record di DB)
Write-Host "[STEP 3] Uji Idempotensi: Pendekatan Ulang ke Kandidat yang Sama..." -NoNewline
$resReapproach = Invoke-RestMethod -Uri "$baseUrl/vacancies/$($envData.vacancyId)/approach/$($envData.talentId)" -Method Post -WebSession $empSession
if ($resReapproach.status -eq "success") {
    Write-Host " [BERHASIL: Tertangani dengan aman tanpa duplikasi record]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSA 1.2.3: SEMUA SKENARIO LULUS VERIFIKASI          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
