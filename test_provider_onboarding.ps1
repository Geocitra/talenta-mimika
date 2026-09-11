Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: MICRO 1.4.1 (TRAINING PROVIDER ONBOARDING)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$provSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$rand = Get-Random -Minimum 100000 -Maximum 999999
$provEmail = "lpk.welding.$rand@mimika.go.id"
$provPass = "ProviderMimika2026!"
$vin = "VIN-2026-9104-$rand"

# 1. Registrasi Akun Training Provider
Write-Host "`n[STEP 1] Registrasi Lembaga Pelatihan (POST /auth/register/provider)..." -NoNewline
$regBody = @{
    email = $provEmail
    password = $provPass
    institutionName = "LPK Las Logam Papua Mandiri $rand"
    institutionType = "LPK_SWASTA"
    vinNumber = $vin
    bnspLicenseNumber = "LSP-LOGAM-042"
    picName = "Markus Wamena"
    picRole = "Direktur Balai"
    picPhone = "081234567890"
    address = "Jl. Cenderawasih No. 45, Timika"
    locationLat = -4.5468
    locationLng = 136.8837
} | ConvertTo-Json -Depth 10

$regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register/provider" -Method Post -Body $regBody -ContentType "application/json"
if ($regRes.status -eq "success") {
    Write-Host " [BERHASIL]" -ForegroundColor Green
    Write-Host " Lembaga: $($regBody.institutionName) | Role: $($regRes.data.role)" -ForegroundColor Gray
} else {
    Write-Host " [GAGAL: $($regRes.message)]" -ForegroundColor Red
    exit 1
}

# 2. Aktivasi Akun Provider via Helper
Write-Host "[STEP 2] Aktivasi Akun Provider (Bypass Email OTP untuk Test Harness)..." -NoNewline
node apps/backend/seed_test_provider.js $provEmail $provPass | Out-Null
Write-Host " [BERHASIL]" -ForegroundColor Green

# 3. Login Akun Training Provider
Write-Host "[STEP 3] Login Akun Provider (POST /auth/login/password)..." -NoNewline
$loginBody = @{
    identifier = $provEmail
    password = $provPass
} | ConvertTo-Json -Depth 10

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $provSession
if ($loginRes.status -eq "success") {
    Write-Host " [BERHASIL]" -ForegroundColor Green
    $provId = $loginRes.data.id
    Write-Host " Provider User ID: $provId | Role: $($loginRes.data.role)" -ForegroundColor Gray
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
    exit 1
}

# 4. Ambil Profil Provider (Status Awal Wajib PENDING)
Write-Host "[STEP 4] Ambil Profil Provider (GET /training-providers/me)..." -NoNewline
$meRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/me" -Method Get -WebSession $provSession
if ($meRes.status -eq "success" -and $meRes.data.verificationStatus -eq "PENDING") {
    Write-Host " [BERHASIL - Status: PENDING (Menunggu Tier-1 Audit Disnaker)]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Status bukan PENDING]" -ForegroundColor Red
    exit 1
}

# 5. Perbarui Data Profil Provider
Write-Host "[STEP 5] Perbarui Profil Lembaga (PUT /training-providers/me)..." -NoNewline
$updateBody = @{
    accreditation = "TERAKREDITASI_A"
    institutionBio = "Pusat pelatihan pengelasan bersertifikat nasional BNSP di Mimika."
    websiteUrl = "https://lpkpapua.id"
} | ConvertTo-Json -Depth 10

$updateRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/me" -Method Put -Body $updateBody -ContentType "application/json" -WebSession $provSession
if ($updateRes.status -eq "success" -and $updateRes.data.accreditation -eq "TERAKREDITASI_A") {
    Write-Host " [BERHASIL]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
    exit 1
}

# 6. Login Superadmin / Disnaker Admin
Write-Host "[STEP 6] Login Disnaker Admin (POST /auth/login/password)..." -NoNewline
$adminLogin = @{
    identifier = "superadmin@mimika.go.id"
    password = "SuperAdminMimika2026!"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $adminLogin -ContentType "application/json" -WebSession $adminSession | Out-Null
Write-Host " [BERHASIL]" -ForegroundColor Green

# 7. Disnaker Cek Daftar Pending Provider
Write-Host "[STEP 7] Disnaker Audit Antrean Pending (GET /training-providers/pending)..." -NoNewline
$pendingRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/pending" -Method Get -WebSession $adminSession
$found = $false
foreach ($p in $pendingRes.data) {
    if ($p.id -eq $provId) {
        $found = $true
        break
    }
}
if ($found) {
    Write-Host " [BERHASIL: Lembaga baru terdaftar di antrean audit Disnaker]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Provider tidak ditemukan di antrean pending]" -ForegroundColor Red
    exit 1
}

# 8. Disnaker Sahkan Verifikasi Legalitas Tier-1 (APPROVED)
Write-Host "[STEP 8] Disnaker Sahkan Legalitas Tier-1 (PATCH /training-providers/:id/verify)..." -NoNewline
$verifyBody = @{
    status = "APPROVED"
    notes = "Legalitas VIN Kemnaker & Lisensi BNSP terverifikasi valid oleh Bidang Lattas Disnaker Mimika."
} | ConvertTo-Json -Depth 10

$verifyRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/$provId/verify" -Method Patch -Body $verifyBody -ContentType "application/json" -WebSession $adminSession
if ($verifyRes.status -eq "success" -and $verifyRes.data.verificationStatus -eq "APPROVED") {
    Write-Host " [BERHASIL: Disahkan Menjadi APPROVED!]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
    exit 1
}

# 9. Provider Cek Profil Kembali (Harus APPROVED)
Write-Host "[STEP 9] Provider Cek Profil Kembali (GET /training-providers/me)..." -NoNewline
$finalMe = Invoke-RestMethod -Uri "$baseUrl/training-providers/me" -Method Get -WebSession $provSession
if ($finalMe.data.verificationStatus -eq "APPROVED") {
    Write-Host " [BERHASIL - Status Resmi: APPROVED]" -ForegroundColor Green
    Write-Host "`n>>> MICRO 1.4.1 SELESAI: PONDASI DATABASE & ONBOARDING PROVIDER TERVERIFIKASI 100%! <<<`n" -ForegroundColor Cyan
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
    exit 1
}
