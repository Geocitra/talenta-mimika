# test_vacancy_studio_flow.ps1
# End-to-End Test for Sector-Free Vacancy Studio, AI Assistant, and Work Tools Separation

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:3000/api/v1"
$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " [MIMIKA TALENTA] VACANCY STUDIO & WORK TOOLS SUITE " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# -------------------------------------------------------------------
# 1. TEST AI SUGGESTION ENGINE (FAST LOCAL SEMANTIC ASSISTANT)
# -------------------------------------------------------------------
Write-Host "`n>>> [STEP 1] Testing Contextual AI Suggestions Endpoint..." -ForegroundColor Yellow

$queries = @("Barista Kafe", "Operator Dump Truck 777D", "Welder Fabrikasi 6G", "Software Engineer React")

foreach ($q in $queries) {
    $encoded = [System.Uri]::EscapeDataString($q)
    $sugRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/suggestions?title=$encoded" -Method Get
    
    if ($sugRes.status -eq "success" -and $sugRes.data) {
        $data = $sugRes.data
        Write-Host "  [+] Query: '$q'" -ForegroundColor Green
        Write-Host "      Category : $($data.inferredCategory) ($($data.categoryLabel))" -ForegroundColor White
        Write-Host "      Skills   : $($data.recommendedSkills -join ', ')" -ForegroundColor Gray
        Write-Host "      Tools    : $($data.recommendedTools -join ', ')" -ForegroundColor Gray
    } else {
        throw "Failed to get AI suggestions for '$q'"
    }
}

# -------------------------------------------------------------------
# 2. EMPLOYER AUTHENTICATION
# -------------------------------------------------------------------
Write-Host "`n>>> [STEP 2] Authenticating Employer (Freeport Indonesia)..." -ForegroundColor Yellow

$loginBody = @{
    identifier = "hrd@freeport.co.id"
    password = "PasswordKuat123!"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json" `
    -WebSession $Session

if ($loginRes.status -ne "success") {
    throw "Employer login failed: $($loginRes.message)"
}
Write-Host "  [+] Employer logged in successfully as: $($loginRes.data.user.email)" -ForegroundColor Green

# -------------------------------------------------------------------
# 3. CREATE VACANCY WITH LIVING BENEFITS AND WORK TOOLS
# -------------------------------------------------------------------
Write-Host "`n>>> [STEP 3] Publishing Regular Job Vacancy via Studio API..." -ForegroundColor Yellow

$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$jobTitle = "Teknisi Mekanik Alat Berat Grader #$randomSuffix"

$jobPayload = @{
    title = $jobTitle
    opportunityType = "JOB"
    quota = 2
    taskDescription = "Melakukan overhaul dan maintenance rutin unit heavy equipment Caterpillar di area tambang Mimika."
    projectDuration = "12 Bulan (Kontrak Tahunan)"
    requiredSkills = @("Mekanik Alat Berat", "Hydraulic System", "K3 Pertambangan")
    minEducation = "SMK"
    minExperienceYears = 2
    allowEquivalence = $true
    salaryMin = 9500000
    salaryMax = 14000000
    benefits = @("MESS_AKOMODASI", "KANTIN_MAKAN", "BUS_JEMPUTAN", "BPJS_LENGKAP")
    workTools = @(
        "Alat Pelindung Diri (APD) K3 Tambang",
        "Toolkit Mekanik Standar CAT",
        "Radio HT Komunikasi Operasional",
        "Kendaraan Service Truck Site"
    )
    isSameAsOfficeLocation = $true
    workZone = "KUALA_KENCANA"
    workSchedule = "ROSTER_FIELD"
} | ConvertTo-Json -Depth 5

$createJobRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies" `
    -Method Post `
    -Body $jobPayload `
    -ContentType "application/json" `
    -WebSession $Session

if ($createJobRes.status -ne "success" -or -not $createJobRes.data.id) {
    throw "Failed to create job vacancy: $($createJobRes.message)"
}

$jobVacancyId = $createJobRes.data.id
Write-Host "  [+] Vacancy created successfully!" -ForegroundColor Green
Write-Host "      ID         : $jobVacancyId" -ForegroundColor White
Write-Host "      Title      : $($createJobRes.data.title)" -ForegroundColor White
Write-Host "      Work Tools : $($createJobRes.data.workTools -join ' | ')" -ForegroundColor Cyan
Write-Host "      Benefits   : $($createJobRes.data.benefits -join ' | ')" -ForegroundColor Cyan

# -------------------------------------------------------------------
# 4. CREATE INTERNSHIP VACANCY (VOKASI) WITH SKILLS GAINED & WORK TOOLS
# -------------------------------------------------------------------
Write-Host "`n>>> [STEP 4] Publishing Vocational Internship Vacancy via Studio API..." -ForegroundColor Yellow

$internTitle = "Program Magang Vokasi Fabrikasi & Pengelasan #$randomSuffix"

$internPayload = @{
    title = $internTitle
    opportunityType = "INTERNSHIP"
    quota = 4
    taskDescription = "Program magang intensif industri dengan pendampingan mentor senior untuk pengelasan pipa tekanan tinggi."
    projectDuration = "6 Bulan"
    requiredSkills = @("Pengelasan Dasar SMAW", "Membaca Gambar Teknik")
    minEducation = "SMK"
    minExperienceYears = 0
    allowEquivalence = $true
    stipendAmount = 3750000
    benefits = @("BPJS_MAGANG", "SERTIFIKAT_INDUSTRI", "MAKAN_SIANG", "FAST_TRACK_HIRING")
    workTools = @(
        "Mesin Las Inverter & Stang Las",
        "Helm Las Auto-Darkening & Leather Apron",
        "Safety Shoes & Sarung Tangan Kulit Tahan Panas"
    )
    skillsGained = @(
        "Teknik Pengelasan Pipa 6G Standar ASME",
        "Prosedur Non-Destructive Testing (NDT)",
        "Keselamatan Kerja Fabrikasi Panas"
    )
    mentorName = "Yohanes K. Magai, S.T."
    mentorRole = "Superintendent Fabrikasi & Las"
    hasAbsorptionOpportunity = $true
    isSameAsOfficeLocation = $true
    workZone = "TIMIKA_KOTA"
    workSchedule = "NORMAL_DAY"
} | ConvertTo-Json -Depth 5

$createInternRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies" `
    -Method Post `
    -Body $internPayload `
    -ContentType "application/json" `
    -WebSession $Session

if ($createInternRes.status -ne "success" -or -not $createInternRes.data.id) {
    throw "Failed to create internship vacancy: $($createInternRes.message)"
}

$internVacancyId = $createInternRes.data.id
Write-Host "  [+] Internship vacancy created successfully!" -ForegroundColor Green
Write-Host "      ID           : $internVacancyId" -ForegroundColor White
Write-Host "      Work Tools   : $($createInternRes.data.workTools -join ' | ')" -ForegroundColor Cyan
Write-Host "      Skills Gained: $($createInternRes.data.skillsGained -join ' | ')" -ForegroundColor Cyan

# -------------------------------------------------------------------
# 5. TEST AI MATCHING RADAR FOR CANDIDATES
# -------------------------------------------------------------------
Write-Host "`n>>> [STEP 5] Checking AI Candidate Radar for Vacancy $jobVacancyId..." -ForegroundColor Yellow

$radarRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$jobVacancyId/candidates" `
    -Method Get `
    -WebSession $Session

$candidates = $radarRes.candidates
if (-not $candidates) {
    $candidates = @()
}
Write-Host "  [+] AI Radar evaluated $($candidates.Count) candidate(s)." -ForegroundColor Green
Write-Host "      Vacancy Work Tools in Radar: $($radarRes.vacancy.workTools -join ' | ')" -ForegroundColor Cyan

if ($candidates.Count -gt 0) {
    $first = $candidates[0]
    Write-Host "      Top Candidate: $($first.fullName) (Score: $($first.overallScore)%)" -ForegroundColor White
    $targetTalentId = $first.talentId
    
    # -------------------------------------------------------------------
    # 6. EMPLOYER SENDS APPROACH / PROPOSAL TO CANDIDATE
    # -------------------------------------------------------------------
    Write-Host "`n>>> [STEP 6] Sending Official Employment Proposal (Reverse Recruitment)..." -ForegroundColor Yellow
    
    $approachRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$jobVacancyId/approach/$targetTalentId" `
        -Method Post `
        -ContentType "application/json" `
        -WebSession $Session
        
    if ($approachRes.status -eq "success") {
        Write-Host "  [+] Official proposal sent successfully! Approach ID: $($approachRes.data.approach.id)" -ForegroundColor Green
    } else {
        Write-Host "  [!] Note: Approach might already exist or status returned: $($approachRes.message)" -ForegroundColor Yellow
    }
}

# -------------------------------------------------------------------
# 7. TALENT VERIFICATION: RECEIVE OFFICIAL OFFER CARD WITH WORK TOOLS
# -------------------------------------------------------------------
Write-Host "`n>>> [STEP 7] Authenticating Talent to verify Offer Card and Work Tools..." -ForegroundColor Yellow

$TalentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$talentLoginBody = @{
    identifier = "talenta.mimika@gmail.com"
    password = "PasswordKuat123!"
} | ConvertTo-Json

$talentLoginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" `
    -Method Post `
    -Body $talentLoginBody `
    -ContentType "application/json" `
    -WebSession $TalentSession

if ($talentLoginRes.status -ne "success") {
    throw "Talent login failed: $($talentLoginRes.message)"
}
Write-Host "  [+] Talent authenticated: $($talentLoginRes.data.user.email)" -ForegroundColor Green

# Fetch Talent Profile & Approaches
$meRes = Invoke-RestMethod -Uri "$BaseUrl/talents/me" `
    -Method Get `
    -WebSession $TalentSession

if ($meRes.status -ne "success") {
    throw "Failed to fetch talent profile: $($meRes.message)"
}

$approaches = $meRes.data.approaches
Write-Host "  [+] Talent has received $($approaches.Count) official employment proposal(s)." -ForegroundColor Green

$verifiedApproach = $approaches | Where-Object { $_.vacancy.id -eq $jobVacancyId }

if (-not $verifiedApproach) {
    Write-Host "  [*] Approaching talenta.mimika ($($meRes.data.id)) directly to assert offer card..." -ForegroundColor Yellow
    $null = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$jobVacancyId/approach/$($meRes.data.id)" `
        -Method Post `
        -ContentType "application/json" `
        -WebSession $Session
        
    $meRes2 = Invoke-RestMethod -Uri "$BaseUrl/talents/me" -Method Get -WebSession $TalentSession
    $verifiedApproach = $meRes2.data.approaches | Where-Object { $_.vacancy.id -eq $jobVacancyId }
}

if ($verifiedApproach) {
    Write-Host "  [PASS] Target Proposal matched in Talent's Inbox!" -ForegroundColor Green
    Write-Host "         Title      : $($verifiedApproach.vacancy.title)" -ForegroundColor White
    Write-Host "         Employer   : $($verifiedApproach.vacancy.employer.companyName)" -ForegroundColor White
    Write-Host "         Benefits   : $($verifiedApproach.vacancy.benefits -join ', ')" -ForegroundColor Cyan
    Write-Host "         Work Tools : $($verifiedApproach.vacancy.workTools -join ', ')" -ForegroundColor Cyan
    
    if ($verifiedApproach.vacancy.workTools.Count -gt 0) {
        Write-Host "  [SUCCESS] Work Tools verified end-to-end on Talent Official Offer Card!" -ForegroundColor Green
    } else {
        throw "Work tools field is empty in the received proposal!"
    }
} else {
    throw "Failed to match proposal in talent inbox after approach!"
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host " [ALL VERIFICATION CHECKS PASSED SUCCESSFULLY] " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
