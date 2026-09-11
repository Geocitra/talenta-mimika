Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VALIDASI SUBSISTEM PROFIL PERUSAHAAN BARU" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$random = Get-Random
$email = "test.corp.$random@mimika.id"
$nib = "998877665$random"

# 1. Registrasi Employer Baru
Write-Host "`n[STEP 1] Registrasi Employer Baru..." -NoNewline
$regBody = @{
    email = $email
    password = "PasswordPT123!"
    companyName = "PT Freeport Mitra Mimika"
    nib = $nib
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register/employer" -Method Post -Body $regBody -ContentType "application/json"
Write-Host " [BERHASIL]" -ForegroundColor Green

# 2. Verifikasi Akun User
Push-Location apps/backend
$nodeScript = @"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  await p.user.update({ where: { email: '$email' }, data: { isVerified: true } });
}
main().catch(console.error).finally(() => p.`$disconnect());
"@
node -e $nodeScript
Pop-Location

# 3. Login Employer
Write-Host "[STEP 2] Login Employer & Cek Status Default PENDING..." -NoNewline
$loginBody = @{ identifier = $email; password = "PasswordPT123!" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session
$profileRes = Invoke-RestMethod -Uri "$baseUrl/employers/me" -Method Get -WebSession $session
if ($profileRes.data.verificationStatus -eq "PENDING") {
    Write-Host " [BERHASIL: PENDING]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Status bukan PENDING]" -ForegroundColor Red
    exit 1
}

# 4. Update Profil Lengkap dengan 4 Pilar & Skala Usaha (CompanySize)
Write-Host "[STEP 3] Update Profil Lengkap 4 Pilar & Skala Karyawan..." -NoNewline
$updateBody = @{
    brandName = "Mitra Mimika"
    industrySector = "Jasa Konstruksi, Alat Berat & Sipil"
    companySize = "SCALE_201_500"
    address = "Jl. Cenderawasih No. 100, Kuala Kencana"
    locationLat = -4.4312
    locationLng = 136.8835
    npwpNumber = "01.234.567.8-901.000"
    websiteUrl = "https://mitramimika.co.id"
    companyBio = "Kontraktor alat berat dan konstruksi sipil pertambangan Mimika."
    picName = "Johanes Magal, S.T."
    picRole = "HR & Operations Lead"
    picPhone = "081299887766"
    picEmail = "hrd@mitramimika.co.id"
} | ConvertTo-Json

$upRes = Invoke-RestMethod -Uri "$baseUrl/employers/me" -Method Put -Body $updateBody -ContentType "application/json" -WebSession $session

# Validasi nilai median otomatis employeeCount = 350 untuk SCALE_201_500
if ($upRes.data.employeeCount -eq 350 -and $upRes.data.companySize -eq "SCALE_201_500" -and $upRes.data.brandName -eq "Mitra Mimika" -and $upRes.data.picRole -eq "HR & Operations Lead") {
    Write-Host " [BERHASIL: Data 4 Pilar & Median 350 Tersimpan]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Data tidak sesuai]" -ForegroundColor Red
    exit 1
}

# 5. Simulasi Verifikasi Disnaker dengan Catatan
Write-Host "[STEP 4] Simulasi Verifikasi Disnaker dengan Catatan..." -NoNewline
Push-Location apps/backend
$nodeAdminScript = @"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const emp = await p.employer.findUnique({ where: { nib: '$nib' } });
  await p.employer.update({
    where: { id: emp.id },
    data: {
      verificationStatus: 'APPROVED',
      verificationNotes: 'NIB OSS telah diverifikasi sah.',
      verifiedAt: new Date()
    }
  });
}
main().catch(console.error).finally(() => p.`$disconnect());
"@
node -e $nodeAdminScript
Pop-Location

$verifiedProfile = Invoke-RestMethod -Uri "$baseUrl/employers/me" -Method Get -WebSession $session
if ($verifiedProfile.data.verificationStatus -eq "APPROVED" -and $verifiedProfile.data.verificationNotes -eq "NIB OSS telah diverifikasi sah.") {
    Write-Host " [BERHASIL: Status APPROVED dengan Catatan]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Status gagal diverifikasi]" -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  HASIL VALIDASI: SEMUA ATRIBUT & ALUR 100% SUKSES! " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
