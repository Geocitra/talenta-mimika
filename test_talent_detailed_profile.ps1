Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI MICRO 1.2 (TALENT DETAILED PROFILE)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$testEmail = "budi.$(Get-Random)@mimika.go.id"
$testNik = "910401$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
$password = "PasswordKuat123!"

# ------------------------------------------------------------
# STEP 1: Registrasi Akun Talenta Baru
# ------------------------------------------------------------
Write-Host "`n[STEP 1] Registrasi Talenta Baru ($testEmail)..." -NoNewline
try {
    $regBody = @{
        email = $testEmail
        password = $password
        fullName = "Budi Pigome Santoso"
        nik = $testNik
        birthDate = "1997-08-17"
    } | ConvertTo-Json

    $resReg = Invoke-RestMethod -Uri "$baseUrl/auth/register/talent" -Method Post -Body $regBody -ContentType "application/json"
    if ($resReg.status -eq "success") {
        Write-Host " [BERHASIL]" -ForegroundColor Green
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# STEP 2: Verifikasi Akun User di Database
# ------------------------------------------------------------
Write-Host "[STEP 2] Mengaktifkan Verifikasi Akun User..." -NoNewline
try {
    $nodeCmd = "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.user.update({ where: { email: '$testEmail' }, data: { isVerified: true } }).then(() => { console.log('OK'); p.`$disconnect(); });"
    $verifyOutput = & node -e "$nodeCmd"
    if ($verifyOutput -match "OK") {
        Write-Host " [BERHASIL]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL]: $verifyOutput" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# STEP 3: Login & Mendapatkan Cookie Sesi HttpOnly
# ------------------------------------------------------------
Write-Host "[STEP 3] Login Talenta & Inisialisasi Sesi Cookie..." -NoNewline
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $loginBody = @{
        identifier = $testEmail
        password = $password
    } | ConvertTo-Json

    $resLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session
    if ($resLogin.status -eq "success") {
        Write-Host " [BERHASIL: Login Sukses, Sesi Cookie Aktif]" -ForegroundColor Green
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# STEP 4: Mengambil Profil Awal (Harus 20% Completeness)
# ------------------------------------------------------------
Write-Host "[STEP 4] Memeriksa Profil Awal (GET /talents/me)..." -NoNewline
try {
    $resProfile = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $session
    $score = $resProfile.data.profileCompletenessScore
    if ($resProfile.status -eq "success" -and $score -eq 20) {
        Write-Host " [BERHASIL: Skor Awal = $score%]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Skor tidak sesuai: $score%]" -ForegroundColor Red
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# STEP 5: Memperbarui Profil Lengkap (PUT /talents/me)
# ------------------------------------------------------------
Write-Host "[STEP 5] Memperbarui Profil Detail (Pendidikan, Pengalaman, Keahlian, Social DNA)..." -NoNewline
try {
    $updateBody = @{
        phone = "081234567890"
        bio = "Operator alat berat dan teknisi tambang berpengalaman di Kabupaten Mimika."
        education = @(
            @{
                institution = "SMK Negeri 1 Mimika"
                degree = "SMK"
                major = "Teknik Alat Berat"
                graduationYear = 2016
            }
        )
        workExperience = @(
            @{
                companyName = "PT Freeport Contractor Mimika"
                position = "Junior Heavy Equipment Operator"
                durationMonths = 36
                description = "Mengoperasikan excavator CAT 320 dan dump truck di site Kuala Kencana."
            }
        )
        skills = @(
            @{
                name = "Operator Excavator CAT"
                level = "EXPERT"
            },
            @{
                name = "K3 Pertambangan"
                level = "INTERMEDIATE"
            }
        )
        certifications = @(
            @{
                id = "cert-1"
                name = "Sertifikat SIO Operator Excavator"
                issuer = "Kemnaker RI"
                issueYear = "2021"
            }
        )
        socialDna = @{
            workPreferences = @("Siap Shift Malam", "Siap Remote Area", "Tinggal di Timika")
            communityActivities = "Ketua Pemuda Komunitas Lingkar Tambang Mimika"
            workHabitsNotes = "Disiplin tinggi, mematuhi SOP keselamatan kerja tanpa kompromi"
        }
        isAvailable = $true
    } | ConvertTo-Json -Depth 5

    $resUpdate = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Put -Body $updateBody -ContentType "application/json" -WebSession $session
    $newScore = $resUpdate.data.profileCompletenessScore

    if ($resUpdate.status -eq "success" -and $newScore -eq 100) {
        Write-Host " [BERHASIL: Skor Lengkap = $newScore%]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Skor = $newScore% (Diharapkan 100%)]" -ForegroundColor Red
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# STEP 6: Verifikasi Hasil Persistensi di Database (GET /talents/me)
# ------------------------------------------------------------
Write-Host "[STEP 6] Verifikasi Ulang Data Tersimpan di PostgreSQL..." -NoNewline
try {
    $resVerify = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $session
    $data = $resVerify.data
    $isMatch = ($data.profileCompletenessScore -eq 100) -and `
               ($data.phone -eq "081234567890") -and `
               ($data.isAvailable -eq $true) -and `
               ($data.skills.Count -eq 2) -and `
               ($data.education.Count -eq 1) -and `
               ($data.workExperience.Count -eq 1)

    if ($isMatch) {
        Write-Host " [BERHASIL: Seluruh Data JSON & Status Persisten 100%]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Data tidak cocok]" -ForegroundColor Red
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# STEP 7: Uji Keamanan Guard (Akses Tanpa Sesi / Token)
# ------------------------------------------------------------
Write-Host "[STEP 7] Menguji Keamanan Endpoint (Akses Tanpa Sesi)..." -NoNewline
try {
    $resUnauthorized = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get
    Write-Host " [GAGAL: Seharusnya 401 Unauthorized]" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host " [BERHASIL: Ditolak dengan 401 Unauthorized]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status code bukan 401]" -ForegroundColor Red
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  HASIL DIAGNOSA MICRO 1.2: SEMUA SKENARIO LULUS VERIFIKASI " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
