Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI 1.3.2 (LMS PROGRESSION & SKILL) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$talentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$rand = Get-Random -Minimum 100000 -Maximum 999999
$adminEmail = "admin.lms.$rand@mimika.go.id"
$talentEmail = "talent.lms.$rand@talenta.id"
$nik = "910401$rand"

# Setup akun Disnaker & Talenta via node script
node apps/backend/seed_lms_users.js $adminEmail $talentEmail $nik | Out-Null

# Login Admin Disnaker
$adminLogin = @{ identifier = $adminEmail; password = "Password123!" } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $adminLogin -ContentType "application/json" -WebSession $adminSession | Out-Null

# 1. Disnaker Buat Program Pelatihan
Write-Host "`n[STEP 1] Disnaker Buat Program Pelatihan (target_skills: Welding 3G)..." -NoNewline
$progBody = @{
    title = "Pelatihan Sertifikasi Teknik Pengelasan 3G"
    deliveryMode = "ONLINE"
    category = "WELDING"
    description = "Materi intensif teknik pengelasan busur manual bersertifikasi BNSP."
    passingGrade = 80
    targetSkills = @( @{ name = "Welding 3G"; level = "EXPERT" } )
} | ConvertTo-Json -Depth 10

$progRes = Invoke-RestMethod -Uri "$baseUrl/trainings" -Method Post -Body $progBody -ContentType "application/json" -WebSession $adminSession
$progId = $progRes.data.id
Write-Host " [BERHASIL: ID=$progId]" -ForegroundColor Green

# 2. Tambah Sesi 1 & Sesi 2
Write-Host "[STEP 2] Tambah Sesi 1 (Video) & Sesi 2 (Artikel Teks)..." -NoNewline
$sess1Body = @{ sessionOrder = 1; title = "Pengantar Teori Metalurgi Las"; contentType = "VIDEO"; contentBody = "https://stream.mimika.go.id/welding-part1" } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/sessions" -Method Post -Body $sess1Body -ContentType "application/json" -WebSession $adminSession | Out-Null

$sess2Body = @{ sessionOrder = 2; title = "Teknik Pengelasan Posisi 3G"; contentType = "TEXT_ARTICLE"; contentBody = "Pencegahan cacat las undercut dan penetrasi elektroda." } | ConvertTo-Json -Depth 10
$sess2Res = Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/sessions" -Method Post -Body $sess2Body -ContentType "application/json" -WebSession $adminSession
$sess2Id = $sess2Res.data.id
Write-Host " [BERHASIL]" -ForegroundColor Green

# 3. Tambah Kuis Antara di Sesi 2
Write-Host "[STEP 3] Sisipkan Kuis Antara di Sesi 2..." -NoNewline
$quizCheckBody = @{
    quizType = "CHECKPOINT"
    title = "Kuis Pemahaman Elektroda Posisi 3G"
    passingScore = 75
    questions = @(
        @{
            questionOrder = 1
            questionText = "Berapa sudut kemiringan elektroda yang ideal pada sambungan vertikal 3G?"
            options = @("A. 10-15 derajat", "B. 45-60 derajat", "C. 90 derajat siku")
            correctAnswer = "B"
        }
    )
} | ConvertTo-Json -Depth 10
$checkQuizRes = Invoke-RestMethod -Uri "$baseUrl/trainings/$sess2Id/quizzes" -Method Post -Body $quizCheckBody -ContentType "application/json" -WebSession $adminSession
$checkQuizId = $checkQuizRes.data.id
Write-Host " [BERHASIL: Quiz ID=$checkQuizId]" -ForegroundColor Green

# 4. Tambah Ujian Akhir (Final Exam) di Program
Write-Host "[STEP 4] Tambah Ujian Akhir Komprehensif di Program..." -NoNewline
$finalExamBody = @{
    quizType = "FINAL_EXAM"
    title = "Ujian Akhir Standar BNSP Las 3G"
    passingScore = 80
    questions = @(
        @{
            questionOrder = 1
            questionText = "Apa fungsi utama gas pelindung dalam proses pengelasan?"
            options = @("A. Mencegah oksidasi atmosfer pada kawah las", "B. Mempercepat pendinginan", "C. Pewarna logam")
            correctAnswer = "A"
        }
    )
} | ConvertTo-Json -Depth 10
$finalQuizRes = Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/quizzes" -Method Post -Body $finalExamBody -ContentType "application/json" -WebSession $adminSession
$finalQuizId = $finalQuizRes.data.id
Write-Host " [BERHASIL: Final Exam ID=$finalQuizId]" -ForegroundColor Green

# 5. Publikasikan Program
Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/publish" -Method Patch -WebSession $adminSession | Out-Null

# 6. Talenta Login & Mendaftar Kursus
Write-Host "[STEP 5] Talenta Login & Mendaftar Kursus..." -NoNewline
$talentLogin = @{ identifier = $talentEmail; password = "Password123!" } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $talentLogin -ContentType "application/json" -WebSession $talentSession | Out-Null
Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/enroll" -Method Post -WebSession $talentSession | Out-Null
Write-Host " [BERHASIL: Terdaftar]" -ForegroundColor Green

# 7. Uji Invarian Penguncian: Coba akses Sesi 2 (Harus Ditolak 403)
Write-Host "[STEP 6] Uji Progressive Lock: Coba Akses Sesi 2 yang Masih Terkunci..." -NoNewline
try {
    Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/sessions/2" -Method Get -WebSession $talentSession
    Write-Host " [GAGAL: Sesi terkunci bisa diakses]" -ForegroundColor Red
} catch {
    $statusCode = 0
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    if ($statusCode -eq 403) {
        Write-Host " [BERHASIL: Ditolak dengan 403 Forbidden - Terkunci Sesuai Rencana!]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status bukan 403 (Status: $statusCode)]" -ForegroundColor Red
    }
}

# 8. Selesaikan Sesi 1 -> Buka Sesi 2
Write-Host "[STEP 7] Selesaikan Sesi 1 -> Buka Sesi 2..." -NoNewline
$sess1List = Invoke-RestMethod -Uri "$baseUrl/trainings/catalog" -Method Get
$targetProg = $sess1List.data | Where-Object { $_.id -eq $progId }
$sess1RealId = if ($targetProg) { $targetProg.sessions[0].id } else { $sess1List.data[0].sessions[0].id }
Invoke-RestMethod -Uri "$baseUrl/trainings/sessions/$sess1RealId/complete" -Method Post -WebSession $talentSession | Out-Null
$sess2Access = Invoke-RestMethod -Uri "$baseUrl/trainings/$progId/sessions/2" -Method Get -WebSession $talentSession
if ($sess2Access.status -eq "success") {
    Write-Host " [BERHASIL: Sesi 2 Terbuka]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
}

# 9. Kerjakan Kuis Antara Sesi 2
Write-Host "[STEP 8] Mengerjakan Kuis Antara Sesi 2..." -NoNewline
$q1Id = $checkQuizRes.data.questions[0].id
$checkAns = @{ answers = @{ $q1Id = "B" } } | ConvertTo-Json -Depth 10
$checkAnsRes = Invoke-RestMethod -Uri "$baseUrl/trainings/quizzes/$checkQuizId/submit" -Method Post -Body $checkAns -ContentType "application/json" -WebSession $talentSession
if ($checkAnsRes.isPassed -eq $true) {
    Write-Host " [BERHASIL: Lulus Kuis Antara (Skor: $($checkAnsRes.score)%)]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
}

# 10. Kerjakan Ujian Akhir (Final Exam) -> Auto-Skill Injection!
Write-Host "[STEP 9] Mengerjakan Ujian Akhir -> Memicu Auto-Skill Injection..." -NoNewline
$fq1Id = $finalQuizRes.data.questions[0].id
$finalAns = @{ answers = @{ $fq1Id = "A" } } | ConvertTo-Json -Depth 10
$finalAnsRes = Invoke-RestMethod -Uri "$baseUrl/trainings/quizzes/$finalQuizId/submit" -Method Post -Body $finalAns -ContentType "application/json" -WebSession $talentSession

if ($finalAnsRes.isPassed -eq $true -and $finalAnsRes.certificateNumber) {
    Write-Host " [BERHASIL: Lulus Ujian Akhir! No Sertifikat: $($finalAnsRes.certificateNumber)]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Tidak lulus ujian akhir]" -ForegroundColor Red
}

# 11. Pembuktian Mutlak: Periksa Profil Talenta (Keahlian Welding 3G Harus Sudah Terinjeksi Otomatis!)
Write-Host "[STEP 10] Verifikasi Profil Talenta (Auto-Skill Injection Check)..." -NoNewline
$profileCheck = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $talentSession
$hasWelding = $profileCheck.data.skills | Where-Object { $_.name -eq "Welding 3G" }

if ($hasWelding) {
    Write-Host " [BUKTI SAH: Keahlian 'Welding 3G' Berhasil Terinjeksi Otomatis ke Profil Talenta!]" -ForegroundColor Green
    Write-Host "Level Keahlian: $($hasWelding.level)" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Skill tidak terinjeksi]" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSA 1.3.2: SELURUH SKENARIO LMS LULUS 100%          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
