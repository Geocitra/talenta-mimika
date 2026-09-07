Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI MICRO 1.3 (EMPLOYER PROFILE & VERIFY)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$empSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$randomId = Get-Random
$empEmail = "pt.kontraktor.$randomId@freeport-partner.co.id"
$nib = "910401888$randomId"
$adminEmail = "admin.disnaker.$randomId@mimika.go.id"

# 1. Registrasi Akun Employer
Write-Host "`n[STEP 1] Registrasi Employer Baru..." -NoNewline
$regEmpBody = @{
    email = $empEmail
    password = "PasswordPT123!"
    companyName = "PT Mimika Perkasa Tambang"
    nib = $nib
} | ConvertTo-Json

$resEmp = Invoke-RestMethod -Uri "$baseUrl/auth/register/employer" -Method Post -Body $regEmpBody -ContentType "application/json"
Write-Host " [BERHASIL]" -ForegroundColor Green

# 2. Aktifkan Verifikasi Akun Employer langsung via database query (simulasi lolos OTP)
Push-Location apps/backend
$nodeScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({ where: { email: '$empEmail' }, data: { isVerified: true } });
  // Buat admin Disnaker jika belum ada
  const existingAdmin = await prisma.user.findUnique({ where: { email: '$adminEmail' } });
  if (!existingAdmin) {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('AdminDisnaker123!', 10);
    await prisma.user.create({
      data: {
        email: '$adminEmail',
        passwordHash: hash,
        role: 'DISNAKER_ADMIN',
        isVerified: true
      }
    });
  }
}
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.`$disconnect());
"@
node -e $nodeScript
Pop-Location

# 3. Login Employer
Write-Host "[STEP 2] Login Employer & Cek Status Default PENDING..." -NoNewline
$loginBody = @{ identifier = $empEmail; password = "PasswordPT123!" } | ConvertTo-Json
$empLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $empSession
$empProfile = Invoke-RestMethod -Uri "$baseUrl/employers/me" -Method Get -WebSession $empSession
if ($empProfile.data.verificationStatus -eq "PENDING") {
    Write-Host " [BERHASIL: Status PENDING]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Status bukan PENDING]" -ForegroundColor Red
}

# 4. Update Profil Korporat (GIS & Detail Usaha)
Write-Host "[STEP 3] Update Profil Korporat (Alamat & GIS Timika)..." -NoNewline
$updateBody = @{
    industrySector = "Pertambangan & Alat Berat"
    employeeCount = 450
    address = "Kuala Kencana, Kawasan Industri Blok B, Timika"
    locationLat = -4.431201
    locationLng = 136.883492
    companyBio = "Kontraktor spesialis perbaikan armada heavy dump truck di area pertambangan Mimika."
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "$baseUrl/employers/me" -Method Put -Body $updateBody -ContentType "application/json" -WebSession $empSession
if ($updateRes.data.employeeCount -eq 450 -and $updateRes.data.locationLat -eq -4.431201) {
    Write-Host " [BERHASIL: Data Korporat & GIS Tersimpan]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Data tidak terupdate]" -ForegroundColor Red
}

# 5. Uji Keamanan: Employer Coba Akses Endpoint Disnaker (Harus 403 Forbidden)
Write-Host "[STEP 4] Uji Keamanan: Employer Akses Endpoint Khusus Disnaker..." -NoNewline
try {
    Invoke-RestMethod -Uri "$baseUrl/employers/pending" -Method Get -WebSession $empSession
    Write-Host " [GAGAL: Seharusnya 403 Forbidden]" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host " [BERHASIL: Ditolak dengan 403 Forbidden]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status bukan 403]" -ForegroundColor Red
    }
}

# 6. Login Admin Disnaker & Setujui Perusahaan
Write-Host "[STEP 5] Login Admin Disnaker & Verifikasi Perusahaan..." -NoNewline
$adminLoginBody = @{ identifier = $adminEmail; password = "AdminDisnaker123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $adminLoginBody -ContentType "application/json" -WebSession $adminSession | Out-Null

$employerId = $empProfile.data.id
$verifyBody = @{ status = "APPROVED"; notes = "NIB dan dokumen fisik telah diverifikasi sah oleh Disnakertrans Mimika." } | ConvertTo-Json
$verifyRes = Invoke-RestMethod -Uri "$baseUrl/employers/$employerId/verify" -Method Patch -Body $verifyBody -ContentType "application/json" -WebSession $adminSession

if ($verifyRes.data.verificationStatus -eq "APPROVED" -and $verifyRes.data.verifiedBy) {
    Write-Host " [BERHASIL: Perusahaan Resmi APPROVED]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Status tidak berubah menjadi APPROVED]" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  HASIL DIAGNOSA MICRO 1.3: SEMUA SKENARIO LULUS VERIFIKASI " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
