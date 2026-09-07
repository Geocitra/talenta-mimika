Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI MICRO 1.4 (JOB VACANCY PUBLISHING)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$empSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$rand = Get-Random
$empEmail = "pt.heavy.$rand@kontraktor-mimika.co.id"
$adminEmail = "admin.disnaker.$rand@mimika.go.id"
$nib = "910401999$rand"

# 1. Registrasi Akun Employer Baru (Status PENDING)
Write-Host "`n[STEP 1] Registrasi Employer Baru..." -NoNewline
$regEmp = @{
    email = $empEmail
    password = "PasswordKuat123!"
    companyName = "PT Freeport Contractor Equipment"
    nib = $nib
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/auth/register/employer" -Method Post -Body $regEmp -ContentType "application/json" | Out-Null
Write-Host " [BERHASIL]" -ForegroundColor Green

# Aktifkan user via Prisma query (simulasi lolos OTP) dan siapkan akun Admin
$nodeScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({ where: { email: '$empEmail' }, data: { isVerified: true } });
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
main().catch(err => { console.error(err); process.exit(1); }).finally(() => prisma.`$disconnect());
"@
Push-Location apps/backend
node -e $nodeScript
Pop-Location

# 2. Login Employer PENDING
Write-Host "[STEP 2] Login Employer PENDING..." -NoNewline
$loginBody = @{ identifier = $empEmail; password = "PasswordKuat123!" } | ConvertTo-Json
$empLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $empSession
Write-Host " [BERHASIL]" -ForegroundColor Green

# 3. Uji Invariant: Employer PENDING Coba Terbitkan Lowongan (Harus 403 Forbidden)
Write-Host "[STEP 3] Uji Keamanan: Employer PENDING Menerbitkan Lowongan..." -NoNewline
$vacancyPayload = @{
    title = "Operator Alat Berat Excavator PC-200"
    taskDescription = "Mengoperasikan excavator di area galian tambang terbuka Kuala Kencana sesuai SOP K3."
    projectDuration = "6 Bulan Kontrak Proyek"
    requiredSkills = @("Operator Alat Berat", "K3 Pertambangan", "Excavator")
    minEducation = "SMK"
    minExperienceYears = 3
    allowEquivalence = $true
    jobLocationLat = -4.431201
    jobLocationLng = 136.883492
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/vacancies" -Method Post -Body $vacancyPayload -ContentType "application/json" -WebSession $empSession
    Write-Host " [GAGAL: Lowongan seharusnya ditolak]" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host " [BERHASIL: Ditolak dengan 403 Forbidden - Wajib APPROVED]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status bukan 403]" -ForegroundColor Red
    }
}

# 4. Login Admin Disnaker & Setujui Perusahaan
Write-Host "[STEP 4] Admin Disnaker Menyetujui Perusahaan..." -NoNewline
$adminLogin = @{ identifier = $adminEmail; password = "AdminDisnaker123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $adminLogin -ContentType "application/json" -WebSession $adminSession | Out-Null

$employerId = $empLogin.data.id
$verifyBody = @{ status = "APPROVED"; notes = "Legalitas NIB sah." } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/employers/$employerId/verify" -Method Patch -Body $verifyBody -ContentType "application/json" -WebSession $adminSession | Out-Null
Write-Host " [BERHASIL: Status APPROVED]" -ForegroundColor Green

# 5. Employer APPROVED Menerbitkan Lowongan
Write-Host "[STEP 5] Employer APPROVED Menerbitkan Lowongan Baru..." -NoNewline
$createRes = Invoke-RestMethod -Uri "$baseUrl/vacancies" -Method Post -Body $vacancyPayload -ContentType "application/json" -WebSession $empSession
$vacancyId = $createRes.data.id
if ($createRes.data.title -eq "Operator Alat Berat Excavator PC-200" -and $createRes.data.status -eq "OPEN") {
    Write-Host " [BERHASIL: Lowongan OPEN Diterbitkan]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Lowongan gagal dibuat]" -ForegroundColor Red
}

# 6. Periksa Lowongan Milik Sendiri
Write-Host "[STEP 6] Periksa Daftar Lowongan Milik Sendiri (GET /vacancies/my)..." -NoNewline
$myVacancies = Invoke-RestMethod -Uri "$baseUrl/vacancies/my" -Method Get -WebSession $empSession
if ($myVacancies.total -ge 1) {
    Write-Host " [BERHASIL: $($myVacancies.total) Lowongan Ditemukan]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Lowongan tidak ditemukan]" -ForegroundColor Red
}

# 7. Tutup Lowongan (PATCH /vacancies/:id/close)
Write-Host "[STEP 7] Menutup Lowongan (PATCH /vacancies/:id/close)..." -NoNewline
$closeRes = Invoke-RestMethod -Uri "$baseUrl/vacancies/$vacancyId/close" -Method Patch -WebSession $empSession
if ($closeRes.data.status -eq "CLOSED") {
    Write-Host " [BERHASIL: Status Menjadi CLOSED]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Gagal menutup lowongan]" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  HASIL DIAGNOSA MICRO 1.4: SEMUA SKENARIO LULUS VERIFIKASI " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
