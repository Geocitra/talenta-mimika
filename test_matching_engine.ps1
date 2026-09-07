Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI 1.2.1 (AI MATCHING ENGINE)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$empSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Setup lowongan dan kandidat via simulasi database script
$nodeScript = @'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // 1. Akun Employer Approved
  const empEmail = 'pt.matching.' + Date.now() + '@mimika.go.id';
  const hash = await bcrypt.hash('Password123!', 10);
  const empUser = await prisma.user.create({
    data: { email: empEmail, passwordHash: hash, role: 'EMPLOYER', isVerified: true }
  });
  const employer = await prisma.employer.create({
    data: {
      id: empUser.id,
      nib: 'NIB_MATCH_' + Date.now(),
      companyName: 'PT Freeport Heavy Equipment',
      verificationStatus: 'APPROVED'
    }
  });

  // 2. Buat Lowongan Kebutuhan Spesifik
  const vacancy = await prisma.jobVacancy.create({
    data: {
      employerId: employer.id,
      title: 'Operator Excavator PC-200 Site Kuala Kencana',
      taskDescription: 'Pengoperasian excavator di area tambang terbuka dengan pola kerja shift malam.',
      projectDuration: '1 Tahun Kontrak Proyek',
      requiredSkills: ['Excavator', 'K3 Pertambangan', 'Alat Berat'],
      minEducation: 'S1',
      minExperienceYears: 2,
      allowEquivalence: true,
      jobLocationLat: -4.431201,
      jobLocationLng: 136.883492,
      status: 'OPEN'
    }
  });

  // 3. Kandidat A: Lulusan SMK Pengalaman 5 Tahun (Fuzzy Equivalence Champion)
  const randA = Math.floor(1000000 + Math.random() * 9000000);
  const userA = await prisma.user.create({
    data: { email: 'kandidatA.' + Date.now() + '@talenta.id', passwordHash: hash, role: 'TALENT', isVerified: true }
  });
  await prisma.talent.create({
    data: {
      id: userA.id,
      nik: '91040188' + randA,
      fullName: 'Yulius Pigome (SMK Berpengalaman)',
      birthDate: new Date('1995-04-12'),
      phone: '081234567891',
      skills: [{ name: 'Excavator', level: 'EXPERT' }, { name: 'K3 Pertambangan', level: 'INTERMEDIATE' }],
      education: [{ institution: 'SMK Negeri 1 Mimika', degree: 'SMK', major: 'Otomotif Alat Berat', graduationYear: 2014 }],
      workExperience: [
        { companyName: 'PT Freeport Subcon', position: 'Operator', durationMonths: 60, description: 'Operasi alat berat' }
      ],
      socialDna: { workPreferences: ['Siap Shift Malam', 'Siap Remote Area'] },
      locationLat: -4.435000,
      locationLng: 136.885000,
      isAvailable: true,
      profileCompletenessScore: 100
    }
  });

  // 4. Kandidat B: Lulusan S1 Tapi Skill Tidak Relevan
  const randB = Math.floor(1000000 + Math.random() * 9000000);
  const userB = await prisma.user.create({
    data: { email: 'kandidatB.' + Date.now() + '@talenta.id', passwordHash: hash, role: 'TALENT', isVerified: true }
  });
  await prisma.talent.create({
    data: {
      id: userB.id,
      nik: '91040177' + randB,
      fullName: 'John Doe (S1 Tanpa Keahlian Tambang)',
      birthDate: new Date('2000-01-01'),
      phone: '081234567892',
      skills: [{ name: 'Microsoft Office', level: 'EXPERT' }],
      education: [{ institution: 'Universitas Mimika', degree: 'S1', major: 'Manajemen', graduationYear: 2022 }],
      workExperience: [],
      socialDna: { workPreferences: [] },
      isAvailable: true,
      profileCompletenessScore: 80
    }
  });

  console.log(JSON.stringify({ empEmail, vacancyId: vacancy.id }));
}
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
'@

Push-Location apps/backend
$initResult = node -e $nodeScript | ConvertFrom-Json
Pop-Location

# Login Employer
$loginBody = @{ identifier = $initResult.empEmail; password = "Password123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $empSession | Out-Null

# Jalankan AI Matching Engine!
Write-Host "`n[STEP 1] Memanggil AI Matching Engine (GET /vacancies/:id/candidates)..." -NoNewline
$matchRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/$($initResult.vacancyId)/candidates" -Method Get -WebSession $empSession

if ($matchRes.status -eq "success" -and $matchRes.totalEvaluated -ge 2) {
    Write-Host " [BERHASIL: $($matchRes.totalEvaluated) Kandidat Ter-Evaluasi]" -ForegroundColor Green
    
    $topCandidate = $matchRes.candidates[0]
    Write-Host "`nKANDIDAT PERINGKAT 1 TERTINGGI:" -ForegroundColor Yellow
    Write-Host "Nama           : $($topCandidate.fullName)"
    Write-Host "Total Skor     : $($topCandidate.overallScore)%"
    Write-Host "Alasan AI      : $($topCandidate.aiReasoning)"
    Write-Host "Top Skills     : $($topCandidate.topSkills -join ', ')"
    Write-Host "Pendidikan     : $($topCandidate.lastEducationDegree)"
    Write-Host "Pengalaman     : $($topCandidate.totalExperienceMonths) Bulan"
    Write-Host "Fuzzy Applied  : $($topCandidate.breakdown.isFuzzyEquivalenceApplied)"
    Write-Host "Skor Skills    : $($topCandidate.breakdown.skillMatchScore)% (Bobot 40%)"
    Write-Host "Skor Exp       : $($topCandidate.breakdown.experienceMatchScore)% (Bobot 30%)"
    Write-Host "Skor Social DNA: $($topCandidate.breakdown.socialDnaMatchScore)% (Bobot 20%)"
    Write-Host "Skor Jarak GIS : $($topCandidate.breakdown.distanceMatchScore)% (Bobot 10%)"
    if ($topCandidate.breakdown.distanceKm) {
        Write-Host "Jarak Lapangan : $($topCandidate.breakdown.distanceKm) Km"
    }

    if ($topCandidate.breakdown.isFuzzyEquivalenceApplied -eq $true -and $topCandidate.overallScore -gt 75) {
        Write-Host "`n[UJI FUZZY MATCHING LOGIC]: LULUS 100%!" -ForegroundColor Green
        Write-Host "Kandidat SMK dengan 5 tahun pengalaman berhasil mengalahkan pelamar S1 tanpa keahlian!"
    } else {
        Write-Host "`n[UJI FUZZY MATCHING LOGIC]: GAGAL" -ForegroundColor Red
    }
} else {
    Write-Host " [GAGAL: Response tidak sesuai]" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSA 1.2.1: SELESAI                                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
