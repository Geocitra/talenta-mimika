# ==============================================================================
# TEST HARNESS: HYBRID AI & COGNITIVE AGENT FLOW (MIMIKA TALENTA)
# Menguji integrasi OpenAI / Graceful Fallback, AI Task Polisher, Criteria Suggester,
# Sourcing Radar, serta Perangkaian Draf Surat Penawaran & Pesan WhatsApp Resmi.
# ==============================================================================

$BaseUrl = "http://localhost:3000/api/v1"
$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  MIMIKA TALENTA - TEST HARNESS: HYBRID AI & COGNITIVE AGENTS    " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Login sebagai Employer Terverifikasi
Write-Host "`n[1/5] Melakukan autentikasi Akun Perusahaan..." -ForegroundColor Yellow
$loginPayload = @{
    identifier = "hrd@freeport.co.id"
    password = "PasswordKuat123!"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" -Method Post -Body $loginPayload -ContentType "application/json" -SessionVariable webSession
Write-Host "  -> Berhasil login sebagai $($loginRes.data.email)! Sesi tersimpan." -ForegroundColor Green

# 2. Uji Agen 1: AI Task Polisher (POST /vacancies/ai-assist - POLISH_TASKS)
Write-Host "`n[2/5] Menguji Agen 1 (POLISH_TASKS: Merapikan Tugas Kasar menjadi SOP K3)..." -ForegroundColor Yellow
$polishPayload = @{
    action = "POLISH_TASKS"
    title = "Juru Las Pipa Bawah Tanah (Pipe Welder 6G)"
    rawTasks = "ngelas pipa air dan pipa angin di area tambang basah, cek sambungan biar ga bocor, bawa mesin las sendiri"
    opportunityType = "JOB"
} | ConvertTo-Json

$polishRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/ai-assist" -Method Post -WebSession $webSession -Body $polishPayload -ContentType "application/json"
Write-Host "  -> Status: $($polishRes.status) | Provider: $($polishRes.data.providerUsed)" -ForegroundColor Green
Write-Host "  -> Ringkasan: $($polishRes.data.summary)" -ForegroundColor Gray
Write-Host "  -> Hasil Poles SOP K3:" -ForegroundColor DarkCyan
Write-Host "$($polishRes.data.polishedTasks)" -ForegroundColor White

# 3. Uji Agen 1: AI Criteria Suggester (POST /vacancies/ai-assist - SUGGEST_CRITERIA)
Write-Host "`n[3/5] Menguji Agen 1 (SUGGEST_CRITERIA: Rekomendasi Keahlian & Alat Kerja)..." -ForegroundColor Yellow
$criteriaPayload = @{
    action = "SUGGEST_CRITERIA"
    title = "Operator Excavator PC-200"
    opportunityType = "JOB"
} | ConvertTo-Json

$criteriaRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/ai-assist" -Method Post -WebSession $webSession -Body $criteriaPayload -ContentType "application/json"
Write-Host "  -> Status: $($criteriaRes.status) | Kluster: $($criteriaRes.data.categoryLabel) | Provider: $($criteriaRes.data.providerUsed)" -ForegroundColor Green
Write-Host "  -> Saran Keahlian: $($criteriaRes.data.suggestedSkills -join ', ')" -ForegroundColor DarkCyan
Write-Host "  -> Saran Alat/APD: $($criteriaRes.data.suggestedTools -join ', ')" -ForegroundColor DarkCyan

# 4. Menerbitkan Lowongan Baru Berbasis Input AI
Write-Host "`n[4/5] Menerbitkan Lowongan Baru Menggunakan Hasil Formulir AI..." -ForegroundColor Yellow
$vacancyPayload = @{
    title = "Juru Las Pipa Bawah Tanah 6G (Welder)"
    opportunityType = "JOB"
    quota = 2
    taskDescription = $polishRes.data.polishedTasks
    projectDuration = "12 Bulan (Kontrak PKWT)"
    requiredSkills = @("Welding 3G/4G", "GTAW 6G Pipa", "K3 Pertambangan")
    minEducation = "SMK"
    minExperienceYears = 2
    allowEquivalence = $true
    salaryMin = 9500000
    salaryMax = 14000000
    benefits = @("MESS_AKOMODASI", "KANTIN_MAKAN", "BUS_JEMPUTAN", "BPJS_LENGKAP")
    workTools = @("Mesin Las Inverter", "Kedok Las Auto-Darkening", "APD K3 Tahan Panas")
    isSameAsOfficeLocation = $true
    workZone = "HIGHLAND_TEMBAGAPURA"
    workSchedule = "ROSTER_FIELD"
} | ConvertTo-Json

$createVacRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies" -Method Post -WebSession $webSession -Body $vacancyPayload -ContentType "application/json"
$vacancyId = $createVacRes.data.id
Write-Host "  -> Lowongan berhasil diterbitkan! Vacancy ID: $vacancyId" -ForegroundColor Green

# 5. Menguji Discovery Radar & Agen 3 (Approach + Draft Surat Penawaran & WhatsApp)
Write-Host "`n[5/5] Menguji AI Radar Kandidat & Perangkaian Penawaran Resmi (Agen 3)..." -ForegroundColor Yellow
$radarRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$vacancyId/candidates" -Method Get -WebSession $webSession
Write-Host "  -> Jumlah talenta terpindai radar: $($radarRes.candidates.Count) orang." -ForegroundColor Green

if ($radarRes.candidates.Count -gt 0) {
    $topCandidate = $radarRes.candidates[0]
    Write-Host "  -> Kandidat Peringkat #1: $($topCandidate.fullName) | Skor: $($topCandidate.overallScore)%" -ForegroundColor Cyan
    Write-Host "  -> Reasoning AI: $($topCandidate.aiReasoning)" -ForegroundColor Gray

    # Eksekusi Pendekatan Resmi (Approach)
    Write-Host "`n  -> Mengeksekusi tombol 'Approach' untuk menyodorkan tawaran resmi..." -ForegroundColor Yellow
    $approachRes = Invoke-RestMethod -Uri "$BaseUrl/vacancies/$vacancyId/approach/$($topCandidate.talentId)" -Method Post -WebSession $webSession
    Write-Host "  -> Status: $($approachRes.status) | $($approachRes.message)" -ForegroundColor Green
    
    $prop = $approachRes.data.proposalDetails
    Write-Host "`n  --- HASIL DRAF SURAT PENAWARAN RESMI (AGEN 3) ---" -ForegroundColor DarkYellow
    Write-Host "$($prop.officialLetterDraft)" -ForegroundColor White
    Write-Host "`n  --- HASIL DRAF PESAN WHATSAPP PIC HRD (AGEN 3) ---" -ForegroundColor DarkGreen
    Write-Host "$($prop.whatsAppOutreachDraft)" -ForegroundColor White
} else {
    Write-Host "  -> Tidak ada kandidat tersedia untuk di-approach saat ini." -ForegroundColor Yellow
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  SELURUH UJI INTEGRASI HYBRID AI BERHASIL 100%!                " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
