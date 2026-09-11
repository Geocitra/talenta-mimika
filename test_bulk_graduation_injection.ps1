Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: MICRO 1.4.3 (BULK AUTO-SKILL INJECTION)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$provSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$talentASession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$talentBSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Setup Provider Approved, Program Published, & 2 Talenta Daerah via Node Script
$rand = Get-Random -Minimum 100000 -Maximum 999999
$provEmail = "lpk.welding.$rand@mimika.go.id"
$talentAEmail = "kandidatA.$rand@talenta.id"
$talentBEmail = "kandidatB.$rand@talenta.id"

Write-Host "`n[SETUP] Mempersiapkan akun Provider, Program, Batch, dan 2 Talenta Daerah..." -ForegroundColor Yellow
$env:NODE_PATH = "apps/backend/node_modules"
$rawOutput = node apps/backend/seed_bulk_graduation.js $provEmail $talentAEmail $talentBEmail $rand

if ($LASTEXITCODE -ne 0) {
  Write-Host "[SETUP GAGAL] Tidak dapat menyiapkan akun pengujian." -ForegroundColor Red
  exit 1
}

$initData = ($rawOutput | Where-Object { $_ -match '^\s*\{' } | Select-Object -First 1) | ConvertFrom-Json
Write-Host "[SETUP SELESAI] Data Program ID: $($initData.programId), Batch ID: $($initData.batchId)" -ForegroundColor Green

# 2. Login Talenta A & Talenta B
$loginA = @{ identifier = $talentAEmail; password = "PasswordKuat123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginA -ContentType "application/json" -WebSession $talentASession | Out-Null

$loginB = @{ identifier = $talentBEmail; password = "PasswordKuat123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $loginB -ContentType "application/json" -WebSession $talentBSession | Out-Null
Write-Host "[STEP 1] Login Akun Talenta A dan B... [BERHASIL]" -ForegroundColor Green

# 3. Talenta A & B Mendaftar ke Batch Pelatihan (POST /trainings/:id/batches/:batchId/enroll)
Write-Host "[STEP 2] Talenta A dan B Mendaftar ke Batch Pelatihan..." -NoNewline
$resEnrollA = Invoke-RestMethod -Uri "$baseUrl/trainings/$($initData.programId)/batches/$($initData.batchId)/enroll" -Method Post -WebSession $talentASession
$resEnrollB = Invoke-RestMethod -Uri "$baseUrl/trainings/$($initData.programId)/batches/$($initData.batchId)/enroll" -Method Post -WebSession $talentBSession

if ($resEnrollA.status -eq "success" -and $resEnrollB.status -eq "success" -and $resEnrollA.data.whatsAppOutreach.whatsAppDirectUrl) {
    Write-Host " [BERHASIL: Hand-Off WhatsApp Siap!]" -ForegroundColor Green
    Write-Host "  Narahubung Lembaga : $($resEnrollA.data.whatsAppOutreach.picName) ($($resEnrollA.data.whatsAppOutreach.picPhone))" -ForegroundColor Gray
    Write-Host "  Draft Pesan WA     : $($resEnrollA.data.whatsAppOutreach.draftMessage.Substring(0, 45))..." -ForegroundColor Gray
} else {
    Write-Host " [GAGAL]" -ForegroundColor Red
    exit 1
}

# 4. Login Provider & Cek Daftar Peserta Masuk
Write-Host "[STEP 3] Provider Cek Daftar Peserta Batch (GET /training-providers/batches/:batchId/participants)..." -NoNewline
$provLogin = @{ identifier = $provEmail; password = "PasswordKuat123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $provLogin -ContentType "application/json" -WebSession $provSession | Out-Null

$participantsRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/batches/$($initData.batchId)/participants" -Method Get -WebSession $provSession
if ($participantsRes.data.totalEnrolled -eq 2) {
    Write-Host " [BERHASIL: 2 Talenta Terdata di Kelas]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Peserta tidak sesuai]" -ForegroundColor Red
    exit 1
}

# 5. Provider / Disnaker Eksekusi Kelulusan Massal (Bulk Graduation)
Write-Host "[STEP 4] Eksekusi Kelulusan Massal dan Auto-Numbering Sertifikat..." -NoNewline
$testRun = (Get-Random -Minimum 1000 -Maximum 9999)
$bulkPayload = @{
    autoNumbering = $true
    certificatePrefix = "CERT-BNSP-MIMIKA-$testRun"
    participants = @(
        @{
            talentId = $initData.talentAId
            isPassed = $true
            finalScore = 92
            bnspCertificateNumber = "BNSP-WELD-9921"
        },
        @{
            talentId = $initData.talentBId
            isPassed = $true
            finalScore = 88
        }
    )
} | ConvertTo-Json -Depth 5

$gradRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/batches/$($initData.batchId)/graduate" -Method Post -Body $bulkPayload -ContentType "application/json" -WebSession $provSession

if ($gradRes.status -eq "success" -and $gradRes.data.passedCount -eq 2) {
    Write-Host " [BERHASIL: 2 Peserta Lulus Resmi!]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Eksekusi kelulusan massal gagal]" -ForegroundColor Red
    exit 1
}

# 6. PEMBUKTIAN MUTLAK: Periksa Profil Talenta A (Keahlian 'Welding 6G GTAW Pipa' Harus Terinjeksi Otomatis!)
Write-Host "[STEP 5] Verifikasi Profil Talenta A (Atomic Auto-Skill Injection Check)..." -NoNewline
$profileA = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $talentASession
$hasWelding = $profileA.data.skills | Where-Object { $_.name -like "*Welding 6G*" }

if ($hasWelding -and ($hasWelding.isLmsVerified -eq $true) -and ($hasWelding.certificateNumber -eq "BNSP-WELD-9921")) {
    $lvlA = $hasWelding.level
    $numA = $hasWelding.certificateNumber
    Write-Host " [BUKTI SAH: Keahlian 'Welding 6G GTAW Pipa' Terinjeksi Otomatis dengan Flag isLmsVerified = true!]" -ForegroundColor Green
    Write-Host "  Level Skill    : $lvlA" -ForegroundColor Yellow
    Write-Host "  No. Sertifikat : $numA" -ForegroundColor Yellow
} else {
    Write-Host " [GAGAL: Skill tidak terinjeksi pada Talenta A]" -ForegroundColor Red
    exit 1
}

# 7. PEMBUKTIAN MUTLAK: Periksa Profil Talenta B (Auto-Generated Certificate Number)
Write-Host "[STEP 6] Verifikasi Profil Talenta B (Auto-Generated Certificate Check)..." -NoNewline
$profileB = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $talentBSession
$hasWeldingB = $profileB.data.skills | Where-Object { $_.name -like "*Welding 6G*" }
$expectedPrefixB = "CERT-BNSP-MIMIKA-" + $testRun

if ($hasWeldingB -and ($hasWeldingB.isLmsVerified -eq $true) -and ($hasWeldingB.certificateNumber -like "$expectedPrefixB*")) {
    $numB = $hasWeldingB.certificateNumber
    Write-Host " [BUKTI SAH: Keahlian Terinjeksi dengan No Sertifikat Otomatis: $numB]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Skill tidak terinjeksi pada Talenta B]" -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  MICRO 1.4.3 SELESAI: KELULUSAN MASSAL DAN AUTO-SKILL LULUS! " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
