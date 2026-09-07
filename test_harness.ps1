Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI FASE 1 - MODUL 1 (MIMIKA TALENTA) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1/auth"
$testEmailTalent = "uji.talenta.$(Get-Random)@mimika.go.id"
$testNik = "910401$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
$testEmailEmployer = "uji.pt.$(Get-Random)@perusahaan.co.id"
$testNib = "NIB$(Get-Random -Minimum 10000000 -Maximum 99999999)"

# ------------------------------------------------------------
# TEST 1: Registrasi Talenta (Skenario Positif)
# ------------------------------------------------------------
Write-Host "`n[TEST 1] Menguji Registrasi Talenta Baru..." -NoNewline
try {
    $body = @{
        email = $testEmailTalent
        password = "PasswordAman123!"
        fullName = "Test Candidate Mimika"
        nik = $testNik
        birthDate = "1998-05-12"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/register/talent" -Method Post -Body $body -ContentType "application/json"
    if ($res.status -eq "success") {
        Write-Host " [BERHASIL]" -ForegroundColor Green
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# TEST 2: Uji Anti-Duplikasi (Skenario Negatif / Integritas NIK)
# ------------------------------------------------------------
Write-Host "[TEST 2] Menguji Pencegahan Duplikasi NIK..." -NoNewline
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/register/talent" -Method Post -Body $body -ContentType "application/json"
    Write-Host " [GAGAL: Seharusnya Ditolak]" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host " [BERHASIL: Ditolak dengan 409 Conflict]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status code bukan 409]" -ForegroundColor Red
    }
}

# ------------------------------------------------------------
# TEST 3: Uji Anti-Spam / Cooldown OTP 60 Detik
# ------------------------------------------------------------
Write-Host "[TEST 3] Menguji Batas Jeda (Cooldown 60s) Kirim OTP..." -NoNewline
try {
    $bodyOtp = @{ identifier = $testEmailTalent } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/otp/send-login" -Method Post -Body $bodyOtp -ContentType "application/json"
    Write-Host " [GAGAL: Spam tidak tertangkap]" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host " [BERHASIL: Spam dicegah oleh Cooldown]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Eror tidak sesuai]" -ForegroundColor Red
    }
}

# ------------------------------------------------------------
# TEST 4: Registrasi Employer (Status Default PENDING)
# ------------------------------------------------------------
Write-Host "[TEST 4] Menguji Registrasi Perusahaan (NIB OSS)..." -NoNewline
try {
    $bodyEmp = @{
        email = $testEmailEmployer
        password = "PasswordPT123!"
        companyName = "PT Freeport Contractor Mimika"
        nib = $testNib
    } | ConvertTo-Json

    $resEmp = Invoke-RestMethod -Uri "$baseUrl/register/employer" -Method Post -Body $bodyEmp -ContentType "application/json"
    if ($resEmp.status -eq "success") {
        Write-Host " [BERHASIL]" -ForegroundColor Green
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# TEST 5: Login Kata Sandi Sebelum Verifikasi OTP (Harus Ditolak)
# ------------------------------------------------------------
Write-Host "[TEST 5] Menguji Login Akun yang Belum Verifikasi OTP..." -NoNewline
try {
    $bodyLogin = @{
        identifier = $testEmailTalent
        password = "PasswordAman123!"
    } | ConvertTo-Json

    $resLogin = Invoke-RestMethod -Uri "$baseUrl/login/password" -Method Post -Body $bodyLogin -ContentType "application/json"
    Write-Host " [GAGAL: Akun unverified bisa login]" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host " [BERHASIL: Login ditolak karena akun belum aktif]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  HASIL DIAGNOSA SISTEM FASE 1 - MODUL 1 SELESAI DIUJI     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
