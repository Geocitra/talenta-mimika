$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MIMIKA TALENTA: INTEGRATION TEST (EXTENDED REVERSE RECRUITMENT)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$BaseUrl = "http://localhost:3000/api/v1"
$EmployerCookieJar = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$TalentCookieJar = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# STEP 1: LOGIN AS EMPLOYER
Write-Host "`n[STEP 1] Login sebagai Employer (hrd@freeport.co.id)..." -ForegroundColor Yellow
$loginBody = @{
    identifier = "hrd@freeport.co.id"
    password = "PasswordKuat123!"
} | ConvertTo-Json

$empLogin = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $EmployerCookieJar
Write-Host "  -> Employer login OK: $($empLogin.data.user.email) ($($empLogin.data.user.role))" -ForegroundColor Green

# STEP 2: UPDATE EMPLOYER PROFILE WITH PIC DETAILS
Write-Host "`n[STEP 2] Update Profil Perusahaan (PIC & Kontak Resmi)..." -ForegroundColor Yellow
$updateEmpBody = @{
    picName = "Bpk. Yohanes Manurung"
    picPhone = "081298765432"
    address = "Kuala Kencana & Portsite Pomako, Kab. Mimika"
    industrySector = "Pertambangan & Logistik"
} | ConvertTo-Json

$updateEmpRes = Invoke-RestMethod -Uri "$BaseUrl/employers/me" -Method Put -Body $updateEmpBody -ContentType "application/json" -WebSession $EmployerCookieJar
Write-Host "  -> Profil Perusahaan Terupdate: PIC=$($updateEmpRes.data.picName), Phone=$($updateEmpRes.data.picPhone)" -ForegroundColor Green

# STEP 3: CREATE REGULAR JOB VACANCY (PEKERJAAN REGULER)
Write-Host "`n[STEP 3] Buat Lowongan Pekerjaan Reguler (JOB)..." -ForegroundColor Yellow
$jobBody = @{
    opportunityType = "JOB"
    title = "Mechanical Site Technician (Heavy Equipment)"
    taskDescription = "Pemeliharaan preventif dan perbaikan unit mekanikal alat berat di area Portsite Pomako"
    projectDuration = "12 Bulan (Kontrak PKWT)"
    quota = 3
    salaryMin = 12000000
    salaryMax = 16000000
    isSalaryDisclosed = $true
    benefits = @("Mess Karyawan (AC)", "Makan 3x Sehari", "Bus Antar-Jemput", "BPJS Ketenagakerjaan", "Tunjangan Kemahalan Site", "Tiket Cuti Roster PP")
    workZone = "PORTSITE_POMAKO"
    workSchedule = "ROSTER_FIELD"
    isSameAsOfficeLocation = $true
    allowEquivalence = $true
    minEducation = "SMK"
    minExperienceYears = 1
    requiredSkills = @("Welding", "Mechanical", "Maintenance")
} | ConvertTo-Json

$jobVacRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies" -Method Post -Body $jobBody -ContentType "application/json" -WebSession $EmployerCookieJar
$jobVacId = $jobVacRes.data.id
Write-Host "  -> Lowongan JOB Terbit: ID=$jobVacId, Judul=$($jobVacRes.data.title), Quota=$($jobVacRes.data.quota)" -ForegroundColor Green
Write-Host "     Gaji: Rp $($jobVacRes.data.salaryMin) - Rp $($jobVacRes.data.salaryMax), Zona: $($jobVacRes.data.workZone)" -ForegroundColor Gray

# STEP 4: CREATE VOCATIONAL INTERNSHIP VACANCY (PEMAGANGAN VOKASI)
Write-Host "`n[STEP 4] Buat Lowongan Pemagangan Vokasi (INTERNSHIP)..." -ForegroundColor Yellow
$internshipBody = @{
    opportunityType = "INTERNSHIP"
    title = "Program Magang Vokasi Otomasi & Kelistrikan"
    taskDescription = "Program transfer keterampilan industri bagi angkatan muda vokasi Mimika"
    projectDuration = "6 Bulan (Program Magang Vokasi)"
    quota = 5
    stipendAmount = 4500000
    mentorName = "Ir. Ahmad Subagyo"
    mentorRole = "Lead Automation Engineer"
    hasAbsorptionOpportunity = $true
    skillsGained = @("PLC Programming", "SCADA Industri", "Sensor Kalibrasi")
    preferredMajors = @("Teknik Elektro", "Teknik Mesin", "Otomasi")
    benefits = @("Uang Saku Bulanan", "Bus Antar-Jemput", "Makan Siang", "Sertifikat Industri", "APD Lengkap")
    workZone = "KUALA_KENCANA"
    workSchedule = "NORMAL_DAY"
    isSameAsOfficeLocation = $true
    allowEquivalence = $true
    minEducation = "SMK"
    requiredSkills = @("Kelistrikan")
} | ConvertTo-Json

$internVacRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies" -Method Post -Body $internshipBody -ContentType "application/json" -WebSession $EmployerCookieJar
$internVacId = $internVacRes.data.id
Write-Host "  -> Lowongan INTERNSHIP Terbit: ID=$internVacId, Judul=$($internVacRes.data.title), Quota=$($internVacRes.data.quota)" -ForegroundColor Green
Write-Host "     Uang Saku: Rp $($internVacRes.data.stipendAmount), Mentor: $($internVacRes.data.mentorName), MinExp=$($internVacRes.data.minExperienceYears)" -ForegroundColor Gray

# STEP 5: RUN AI MATCHING ON BOTH VACANCIES
Write-Host "`n[STEP 5] Evaluasi Kandidat Berbasis AI (Polymorphic Scoring)..." -ForegroundColor Yellow

$jobCandRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$jobVacId/candidates" -Method Get -WebSession $EmployerCookieJar
Write-Host "  -> JOB AI Evaluation: Total $($jobCandRes.totalEvaluated) talenta teranalisis" -ForegroundColor Green
if ($jobCandRes.candidates.Count -gt 0) {
    $topJob = $jobCandRes.candidates[0]
    Write-Host "     Top Candidate JOB: $($topJob.fullName), Skor=$($topJob.overallScore)%, SkillMatch=$($topJob.breakdown.skillMatchScore)%" -ForegroundColor Gray
}

$internCandRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$internVacId/candidates" -Method Get -WebSession $EmployerCookieJar
Write-Host "  -> INTERNSHIP AI Evaluation: Total $($internCandRes.totalEvaluated) talenta teranalisis" -ForegroundColor Green
if ($internCandRes.candidates.Count -gt 0) {
    $topIntern = $internCandRes.candidates[0]
    Write-Host "     Top Candidate INTERNSHIP: $($topIntern.fullName), Skor=$($topIntern.overallScore)%, MajorMatch=$($topIntern.breakdown.skillMatchScore)%" -ForegroundColor Gray
}

# STEP 6: APPROACH TOP CANDIDATE ON JOB VACANCY
$targetTalentId = "faffd7b4-1459-4094-96ae-3048de80f16f" # Yulius Pigome
Write-Host "`n[STEP 6] Lakukan Approach ke Talenta ($targetTalentId)..." -ForegroundColor Yellow
$approachRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$jobVacId/approach/$targetTalentId" -Method Post -WebSession $EmployerCookieJar
Write-Host "  -> Approach Result: $($approachRes.message)" -ForegroundColor Green
Write-Host "     Proposal Details Dispatched:" -ForegroundColor Gray
Write-Host "     - Title: $($approachRes.data.proposalDetails.vacancyTitle)" -ForegroundColor Gray
Write-Host "     - Type: $($approachRes.data.proposalDetails.opportunityType)" -ForegroundColor Gray
Write-Host "     - Quota: $($approachRes.data.proposalDetails.quota)" -ForegroundColor Gray
Write-Host "     - Compensation: $($approachRes.data.proposalDetails.compensationText)" -ForegroundColor Gray
Write-Host "     - PIC: $($approachRes.data.proposalDetails.picName) ($($approachRes.data.proposalDetails.picPhone))" -ForegroundColor Gray

# STEP 7: LOGIN AS TALENT & VERIFY DASHBOARD OFFER CARD
Write-Host "`n[STEP 7] Login sebagai Talenta (talenta.mimika@gmail.com)..." -ForegroundColor Yellow
$talentLoginBody = @{
    identifier = "talenta.mimika@gmail.com"
    password = "PasswordKuat123!"
} | ConvertTo-Json

$talentLogin = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" -Method Post -Body $talentLoginBody -ContentType "application/json" -WebSession $TalentCookieJar
Write-Host "  -> Talenta Login OK: $($talentLogin.data.user.email)" -ForegroundColor Green

$talentProfileRes = Invoke-RestMethod -Uri "$BaseUrl/talents/me" -Method Get -WebSession $TalentCookieJar
$approaches = $talentProfileRes.data.approaches

Write-Host "`n[STEP 8] Verifikasi Data Surat Penawaran Resmi pada Profil Talenta..." -ForegroundColor Yellow
Write-Host "  -> Total Pendekatan / Penawaran Diterima: $($approaches.Count)" -ForegroundColor Green

$found = $false
foreach ($app in $approaches) {
    if ($app.vacancy.id -eq $jobVacId) {
        $found = $true
        Write-Host "`n  >>> KARTU TAWARAN KERJA RESMI TERVERIFIKASI <<<" -ForegroundColor Cyan
        Write-Host "  Perusahaan : $($app.vacancy.employer.companyName) (NIB: $($app.vacancy.employer.nib))" -ForegroundColor White
        Write-Host "  Posisi     : $($app.vacancy.title) [$($app.vacancy.opportunityType)]" -ForegroundColor White
        Write-Host "  Kuota      : $($app.vacancy.quota) Talenta" -ForegroundColor White
        Write-Host "  Gaji       : Rp $($app.vacancy.salaryMin) - Rp $($app.vacancy.salaryMax) / bulan (Gross)" -ForegroundColor White
        Write-Host "  Penempatan : $($app.vacancy.workZone) (Jadwal: $($app.vacancy.workSchedule))" -ForegroundColor White
        Write-Host "  PIC HRD    : $($app.vacancy.employer.picName) (Telp/WA: $($app.vacancy.employer.picPhone))" -ForegroundColor White
        Write-Host "  Fasilitas  : $($app.vacancy.benefits -join ', ')" -ForegroundColor White
        Write-Host "  Skor AI    : $($app.aiMatchScore)%" -ForegroundColor White
    }
}

if (-not $found) {
    Write-Error "TEST FAILED: Surat penawaran untuk lowongan $jobVacId tidak ditemukan pada profil talenta!"
} else {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  SEMUA PENGUJIAN INTEGRASI BERHASIL 100%! ZERO ERRORS." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
}
