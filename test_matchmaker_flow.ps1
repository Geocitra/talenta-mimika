Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI PARADIGMA AI WORKFORCE MATCHMAKER     " -ForegroundColor Cyan
Write-Host "  (Two-Sided Matching, 4-Vektor Engine, & Talent Sovereignty)    " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$sessionA = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$sessionB = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# STEP 0: Siapkan Data Uji Terisolasi di Database
Write-Host "`n[STEP 0] Inisialisasi Lingkungan Uji di PostgreSQL..." -NoNewline
$setupScript = @'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const stamp = Date.now();

  // 1. Employer A: PT Citra Geometrik Papua (Perusahaan Standar/UMK)
  const empAUser = await prisma.user.create({
    data: { email: `pt.citra.${stamp}@mimika.co.id`, passwordHash: hash, role: 'EMPLOYER', isVerified: true }
  });
  const employerA = await prisma.employer.create({
    data: {
      id: empAUser.id,
      nib: '9104' + Math.floor(100000000 + Math.random() * 900000000),
      companyName: 'PT Citra Geometrik Papua',
      verificationStatus: 'APPROVED'
    }
  });

  // 2. Employer B: PT Freeport Contractor Global (Perusahaan Upah Tinggi)
  const empBUser = await prisma.user.create({
    data: { email: `pt.freeport.${stamp}@mimika.co.id`, passwordHash: hash, role: 'EMPLOYER', isVerified: true }
  });
  const employerB = await prisma.employer.create({
    data: {
      id: empBUser.id,
      nib: '9104' + Math.floor(100000000 + Math.random() * 900000000),
      companyName: 'PT Freeport Contractor Global',
      verificationStatus: 'APPROVED'
    }
  });

  // 3. Talenta Unggulan: Yulius Pigome (Lulusan SMK, Jam Terbang 5 Tahun Excavator)
  const randNum = Math.floor(1000000 + Math.random() * 9000000);
  const talentUser = await prisma.user.create({
    data: { email: `yulius.${stamp}@talenta.id`, passwordHash: hash, role: 'TALENT', isVerified: true }
  });
  const talent = await prisma.talent.create({
    data: {
      id: talentUser.id,
      nik: `91040188${randNum}`,
      fullName: 'Yulius Pigome (Operator Senior)',
      birthDate: new Date('1996-06-15'),
      phone: '081299887766',
      skills: [
        { name: 'Excavator', level: 'EXPERT' },
        { name: 'K3 Pertambangan', level: 'INTERMEDIATE' }
      ],
      education: [
        { institution: 'SMK Negeri 1 Mimika', degree: 'SMK', major: 'Teknik Alat Berat', graduationYear: 2015 }
      ],
      workExperience: [
        { companyName: 'PT Subcon Papua', position: 'Operator Excavator PC-200', durationMonths: 60, description: 'Pengoperasian excavator tambang' }
      ],
      socialDna: {
        workPreferences: ['Siap Shift Malam', 'Siap Remote Area'],
        communityActivities: 'Aktif Pengurus Pemuda Karang Taruna Mimika'
      },
      locationLat: -4.435000,
      locationLng: 136.885000,
      isAvailable: true,
      profileCompletenessScore: 100
    }
  });

  console.log(JSON.stringify({
    empAEmail: empAUser.email,
    empBEmail: empBUser.email,
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
Write-Host "  Employer A : $($seedData.empAEmail)" -ForegroundColor Gray
Write-Host "  Employer B : $($seedData.empBEmail)" -ForegroundColor Gray
Write-Host "  Talenta    : $($seedData.talentName) ($($seedData.talentId))`n" -ForegroundColor Gray

# STEP 1: Login Kedua Employer
Write-Host "[STEP 1] Autentikasi Kedua Pemberi Kerja..." -NoNewline
$loginA = @{ identifier = $seedData.empAEmail; password = "Password123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginA -ContentType "application/json" -WebSession $sessionA | Out-Null

$loginB = @{ identifier = $seedData.empBEmail; password = "Password123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginB -ContentType "application/json" -WebSession $sessionB | Out-Null
Write-Host " [BERHASIL: Sesi A & B Terbit]" -ForegroundColor Green

# STEP 2: Employer A Menerbitkan Lowongan TANPA GAJI (Fleksibel / Negosiasi)
Write-Host "[STEP 2] Employer A Menerbitkan Lowongan Pekerjaan (Gaji Kosong/Negosiasi)..." -NoNewline
$vacPayloadA = @{
    title = "Operator Excavator Heavy Duty"
    taskDescription = "Pekerjaan galian site tambang terbuka sistem shift malam Kuala Kencana."
    projectDuration = "12 Bulan Kontrak PKWT"
    requiredSkills = @("Excavator", "K3 Pertambangan")
    minEducation = "S1" # Syarat formal S1 untuk menguji Fuzzy Affirmation SMK
    minExperienceYears = 2
    allowEquivalence = $true
    quota = 5
    # salaryMin dan salaryMax sengaja TIDAK disertakan (Opsional)
    workZone = "KUALA_KENCANA"
    workSchedule = "SHIFT_24H"
    jobLocationLat = -4.431201
    jobLocationLng = 136.883492
} | ConvertTo-Json

$resVacA = Invoke-RestMethod -Uri "$baseUrl/vacancies" -Method Post -Body $vacPayloadA -ContentType "application/json" -WebSession $sessionA
$vacAId = $resVacA.data.id

if ($resVacA.status -eq "success" -and $resVacA.data.salaryMin -eq $null) {
    Write-Host " [BERHASIL: Lowongan OPEN Diterbitkan Tanpa Gaji]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Pembuatan lowongan tanpa gaji bermasalah]" -ForegroundColor Red
    exit 1
}

# STEP 3: Pengujian Formula 4-Vektor (Skill 35%, Exp 30%, Edu 20% Fuzzy, DNA 15%)
Write-Host "[STEP 3] Evaluasi AI Matching Engine 4-Vektor pada Lowongan Employer A..." -NoNewline
$matchResA = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacAId/candidates" -Method Get -WebSession $sessionA
$candA = $matchResA.candidates | Where-Object { $_.talentId -eq $seedData.talentId }

if ($candA) {
    Write-Host " [BERHASIL: Talenta Terpindai di Radar]" -ForegroundColor Green
    Write-Host "  Skor Total       : $($candA.overallScore)%" -ForegroundColor Yellow
    Write-Host "  Vektor 1 (Skill) : $($candA.breakdown.skillMatchScore)% (Bobot 35%)" -ForegroundColor Gray
    Write-Host "  Vektor 2 (Exp)   : $($candA.breakdown.experienceMatchScore)% (Bobot 30%)" -ForegroundColor Gray
    Write-Host "  Vektor 3 (Edu)   : $($candA.breakdown.educationMatchScore)% (Bobot 20% - Fuzzy Applied: $($candA.breakdown.isFuzzyEquivalenceApplied))" -ForegroundColor Gray
    Write-Host "  Vektor 4 (DNA)   : $($candA.breakdown.socialDnaMatchScore)% (Bobot 15%)" -ForegroundColor Gray
    Write-Host "  Jarak Geospasial : $($candA.breakdown.distanceKm) Km (Score: $($candA.breakdown.distanceMatchScore)%)" -ForegroundColor Gray

    # Validasi Afirmasi Fuzzy Vokasi (SMK dengan jam terbang diakui setara S1 -> Edukasi 90%)
    if ($candA.breakdown.isFuzzyEquivalenceApplied -eq $true -and $candA.breakdown.educationMatchScore -eq 90) {
        Write-Host "  [UJI AFIRMASI FUZZY VOKASI]: LULUS (SMK Di-Boost ke 90% Skor Pendidikan)!" -ForegroundColor Green
    } else {
        Write-Host "  [UJI AFIRMASI FUZZY VOKASI]: GAGAL!" -ForegroundColor Red
        exit 1
    }

    # Validasi Formula 4-Vektor Matematis (Memperhitungkan Kalibrasi AI Kualitatif jika aktif)
    $rawMathScore = [Math]::Round(
        ($candA.breakdown.skillMatchScore * 0.35) +
        ($candA.breakdown.experienceMatchScore * 0.30) +
        ($candA.breakdown.educationMatchScore * 0.20) +
        ($candA.breakdown.socialDnaMatchScore * 0.15)
    )
    if ($candA.isAiEvaluated -eq $true -and $candA.qualitativeScore) {
        $qualScore = if ($candA.qualitativeScore -le 10) { $candA.qualitativeScore * 10 } else { $candA.qualitativeScore }
        $expectedScore = [Math]::Min(100, [Math]::Round(($rawMathScore * 0.65) + ($qualScore * 0.35)))
    } else {
        $expectedScore = $rawMathScore
    }

    if ([Math]::Abs($candA.overallScore - $expectedScore) -le 2) {
        Write-Host "  [UJI FORMULA 4-VEKTOR 100%]: LULUS (Skor riil $($candA.overallScore)% sesuai kalkulasi 4-vektor raw: $rawMathScore% terkalibrasi AI: $expectedScore%)!" -ForegroundColor Green
    } else {
        Write-Host "  [UJI FORMULA 4-VEKTOR 100%]: GAGAL (Riil: $($candA.overallScore)%, Harapan: $expectedScore%)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host " [GAGAL: Talenta tidak ditemukan di rekomendasi]" -ForegroundColor Red
    exit 1
}

# STEP 4: Employer A Melakukan Approach & Finalisasi Rekrutmen
Write-Host "`n[STEP 4] Employer A Melakukan Approach & Menyelesaikan Rekrutmen..." -NoNewline
# 4a. Approach
Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacAId/approach/$($seedData.talentId)" -Method Post -WebSession $sessionA | Out-Null
# 4b. Select
Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacAId/select/$($seedData.talentId)" -Method Post -WebSession $sessionA | Out-Null
# 4c. Finalize
$finRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacAId/finalize-recruitment" -Method Post -WebSession $sessionA
Write-Host " [BERHASIL: Lowongan A CLOSED]" -ForegroundColor Green

# STEP 5: PENEGAKAN AKSIOMA KEDAULATAN TALENTA (ANTI-LOCKING VERIFICATION)
Write-Host "[STEP 5] Memeriksa Integritas Status Ketersediaan Talenta di Database..." -NoNewline
$checkTalentScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.talent.findUnique({ where: { id: '$($seedData.talentId)' } });
  const vac = await prisma.jobVacancy.findUnique({ where: { id: '$vacAId' } });
  console.log(JSON.stringify({ isAvailable: t.isAvailable, vacStatus: vac.status }));
}
main().finally(() => prisma.`$disconnect());
"@
Push-Location apps/backend
$rawStatus = node -e $checkTalentScript
Pop-Location
$talentDbStatus = ($rawStatus | Where-Object { $_ -match '^\s*\{' } | Select-Object -First 1) | ConvertFrom-Json

if ($talentDbStatus.vacStatus -eq "CLOSED" -and $talentDbStatus.isAvailable -eq $true) {
    Write-Host " [LULUS 100%]" -ForegroundColor Green
    Write-Host "  Status Lowongan A : $($talentDbStatus.vacStatus) (Kebutuhan Perusahaan Selesai)" -ForegroundColor Gray
    Write-Host "  Status Talenta    : isAvailable = $($talentDbStatus.isAvailable) (Kedaulatan Talenta Terjaga, TIDAK DIKUNCI!)" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Status talenta terkunci isAvailable = $($talentDbStatus.isAvailable)]" -ForegroundColor Red
    exit 1
}

# STEP 6: UJI MOBILITAS WAGE: Employer B Mencari Talenta untuk Posisi Bergaji Rp 8.5 Juta
Write-Host "`n[STEP 6] Employer B Membuka Lowongan Bergaji Rp 8.500.000 - Rp 12.000.000..." -NoNewline
$vacPayloadB = @{
    title = "Senior Excavator Operator - Highland Project"
    taskDescription = "Proyek tambang skala besar dengan remunerasi kompetitif kelas dunia."
    projectDuration = "24 Bulan Kontrak Proyek"
    requiredSkills = @("Excavator", "Alat Berat")
    minEducation = "SMK"
    minExperienceYears = 3
    allowEquivalence = $true
    quota = 10
    salaryMin = 8500000
    salaryMax = 12000000
    workZone = "HIGHLAND_TEMBAGAPURA"
    workSchedule = "ROSTER_FIELD"
} | ConvertTo-Json

$resVacB = Invoke-RestMethod -Uri "$baseUrl/vacancies" -Method Post -Body $vacPayloadB -ContentType "application/json" -WebSession $sessionB
$vacBId = $resVacB.data.id
Write-Host " [BERHASIL: Lowongan B Diterbitkan]" -ForegroundColor Green

Write-Host "[STEP 7] Memverifikasi Radar AI Employer B (Wage Mobility Proof)..." -NoNewline
$matchResB = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacBId/candidates" -Method Get -WebSession $sessionB
$candInRadarB = $matchResB.candidates | Where-Object { $_.talentId -eq $seedData.talentId }

if ($candInRadarB) {
    Write-Host " [BERHASIL: TALENTA TETAP MUNCUL DI RADAR PERUSAHAAN LAIN!]" -ForegroundColor Green
    Write-Host "  Nama Kandidat   : $($candInRadarB.fullName)" -ForegroundColor Yellow
    Write-Host "  Skor Kecocokan  : $($candInRadarB.overallScore)% di Radar PT Freeport" -ForegroundColor Yellow
    Write-Host "  Status Mobilitas: Bebas berpindah untuk penghidupan yang lebih baik (Labor Wage Mobility)" -ForegroundColor Cyan
} else {
    Write-Host " [GAGAL: Talenta terblokir dari radar Employer B]" -ForegroundColor Red
    Write-Host "  Total Kandidat di Radar B : $($matchResB.candidates.Count)" -ForegroundColor Gray
    Write-Host "  Total Evaluated           : $($matchResB.totalEvaluated)" -ForegroundColor Gray
    Write-Host "  Kandidat yang Muncul      : $($matchResB.candidates.fullName -join ', ')" -ForegroundColor Gray
    exit 1
}

# STEP 8: Employer B Sukses Melakukan Approach ke Yulius Pigome
Write-Host "[STEP 8] Employer B Menghubungi Kandidat (Approach)..." -NoNewline
$approachB = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacBId/approach/$($seedData.talentId)" -Method Post -WebSession $sessionB

if ($approachB.status -eq "success") {
    Write-Host " [BERHASIL: Kontak Terbuka Resmi]" -ForegroundColor Green
    Write-Host "  Pesan Notifikasi: $($approachB.message)" -ForegroundColor Gray
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
    exit 1
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  KESIMPULAN: SELURUH AKSIOMA AI WORKFORCE MATCHMAKER TERBUKTI!  " -ForegroundColor Green
Write-Host "  1. Gaji Fleksibel/Opsional: LULUS                              " -ForegroundColor Green
Write-Host "  2. Formula 4-Vektor (35%-30%-20%-15%): LULUS                   " -ForegroundColor Green
Write-Host "  3. Afirmasi Fuzzy Vokasi (SMK 90%): LULUS                      " -ForegroundColor Green
Write-Host "  4. Anti-Locking Status (isAvailable = true): LULUS             " -ForegroundColor Green
Write-Host "  5. Cross-Employer Wage Mobility: LULUS                         " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
