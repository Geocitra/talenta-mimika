Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: MICRO 1.4.2 (STUDIO PROGRAM & KURASI TIER-2)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$provPendingSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$provApprovedSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Setup User & Provider Data via Node Prisma Script
$rand = Get-Random -Minimum 100000 -Maximum 999999
$adminEmail = "admin.disnaker.$rand@mimika.go.id"
$provPendingEmail = "lpk.pending.$rand@mimika.go.id"
$provApprovedEmail = "lpk.approved.$rand@mimika.go.id"
$vinPending = "VIN-LPK-PEND-$rand"
$vinApproved = "VIN-LPK-APPR-$rand"

Write-Host "`n[SETUP] Mempersiapkan akun Admin Disnaker dan Provider Pelatihan..." -ForegroundColor Yellow
$env:NODE_PATH = "apps/backend/node_modules"
node apps/backend/seed_studio_curation.js $adminEmail $provPendingEmail $provApprovedEmail $vinPending $vinApproved

if ($LASTEXITCODE -ne 0) {
  Write-Host "[SETUP GAGAL] Tidak dapat menyiapkan akun pengujian." -ForegroundColor Red
  exit 1
}
Write-Host "[SETUP SELESAI] Akun Admin dan Lembaga siap." -ForegroundColor Green

# 2. Login All Roles
$pendingLogin = @{ identifier = $provPendingEmail; password = "PasswordKuat123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $pendingLogin -ContentType "application/json" -WebSession $provPendingSession | Out-Null

$approvedLogin = @{ identifier = $provApprovedEmail; password = "PasswordKuat123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $approvedLogin -ContentType "application/json" -WebSession $provApprovedSession | Out-Null

$adminLogin = @{ identifier = $adminEmail; password = "PasswordKuat123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $adminLogin -ContentType "application/json" -WebSession $adminSession | Out-Null

Write-Host "[STEP 1] Login 3 Akun (Admin, Provider Pending, Provider Approved)... [BERHASIL]" -ForegroundColor Green

# 3. UJI INVARIAN: Provider PENDING harus DITOLAK saat membuat program (403 Forbidden)
Write-Host "[STEP 2] Uji Invarian Guard: Provider PENDING membuat program..." -NoNewline
$progDraftBody = @{
    title = "Pelatihan Ditolak karena Belum Lolos Verifikasi"
    category = "WELDING"
    certificateType = "PELATIHAN_STTP"
    deliveryMode = "OFFLINE"
    description = "Deskripsi uji coba"
    targetSkills = @(
        @{ name = "Welding Basic"; level = "BEGINNER" }
    )
} | ConvertTo-Json -Depth 5

$pendingRejected = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/training-providers/programs" -Method Post -Body $progDraftBody -ContentType "application/json" -WebSession $provPendingSession | Out-Null
} catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        $pendingRejected = $true
    }
}

if ($pendingRejected) {
    Write-Host " [BERHASIL: 403 Forbidden - Guard Invarian Berjalan!]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Provider PENDING tidak ditolak]" -ForegroundColor Red
    exit 1
}

# 4. Provider APPROVED Membuat Program Baru & Mengajukan Kurasi Tier-2
Write-Host "[STEP 3] Provider APPROVED Membuat Program Studio (Sertifikasi Las Pipa 6G)..." -NoNewline
$progBody = @{
    title = "Sertifikasi Teknik Pengelasan Pipa 6G Standar ASME"
    category = "WELDING"
    subCategory = "Pengelasan Tekanan Tinggi"
    certificateType = "KOMBINASI_LENGKAP"
    deliveryMode = "OFFLINE"
    description = "Program intensif pelatihan pengelasan pipa 6G GTAW/SMAW dengan uji kompetensi BNSP di akhir kelas."
    durationDays = 25
    totalLessonHours = 180
    submitForApproval = $true
    targetSkills = @(
        @{ name = "Welding 6G GTAW/SMAW"; level = "EXPERT" }
        @{ name = "K3 Pengelasan"; level = "INTERMEDIATE" }
    )
} | ConvertTo-Json -Depth 5

$progRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/programs" -Method Post -Body $progBody -ContentType "application/json" -WebSession $provApprovedSession
$progId = $progRes.data.id
$progCode = $progRes.data.programCode

if ($progRes.status -eq "success" -and $progRes.data.approvalStatus -eq "PENDING_APPROVAL" -and $progCode.StartsWith("#MT-WELD-")) {
    Write-Host " [BERHASIL: ID=$progId, Code=$progCode, Status=PENDING_APPROVAL]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Pembuatan program tidak sesuai]" -ForegroundColor Red
    exit 1
}

# 5. Provider Membuka Batch 1 (Boarding, Kuota 20 Kursi, Fasilitas Hidup)
Write-Host "[STEP 4] Provider Membuka Batch 1 (Boarding + APBD Mimika Gratis)..." -NoNewline
$batchBody = @{
    batchName = "Batch 1 Tahun 2026 (Khusus Pemuda Mimika)"
    fundingType = "GRATIS_APBD_MIMIKA"
    trainingMethod = "BOARDING"
    quota = 20
    welfareBenefits = @("ASRAMA_MESS", "MAKAN_3X", "UANG_SAKU", "APD_LENGKAP", "BPJS_MAGANG")
    registrationStart = "2026-10-01"
    registrationEnd = "2026-10-15"
    trainingStart = "2026-10-20"
    trainingEnd = "2026-11-20"
} | ConvertTo-Json -Depth 5

$batchRes = Invoke-RestMethod -Uri "$baseUrl/training-providers/programs/$progId/batches" -Method Post -Body $batchBody -ContentType "application/json" -WebSession $provApprovedSession
$batchId = $batchRes.data.id

if ($batchRes.status -eq "success" -and $batchRes.data.quota -eq 20 -and $batchRes.data.batchNumber -eq 1) {
    Write-Host " [BERHASIL: BatchID=$batchId, Kuota=20, Method=BOARDING]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Pembukaan batch gagal]" -ForegroundColor Red
    exit 1
}

# 6. Admin Disnaker Meninjau Antrean Kurasi Tier-2
Write-Host "[STEP 5] Admin Disnaker Memeriksa Antrean Kurasi Tier-2..." -NoNewline
$pendingCurations = Invoke-RestMethod -Uri "$baseUrl/training-admin/programs/pending" -Method Get -WebSession $adminSession
$targetProg = $pendingCurations.data | Where-Object { $_.id -eq $progId }

if ($targetProg -and $targetProg.batches.Count -ge 1) {
    Write-Host " [BERHASIL: Program ditemukan di antrean kurasi dengan batch]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Program tidak masuk antrean kurasi]" -ForegroundColor Red
    exit 1
}

# 7. Admin Disnaker Mengesahkan Program (Tier-2 Approval -> Status: PUBLISHED)
Write-Host "[STEP 6] Admin Disnaker Menyetujui Program (APPROVED -> PUBLISHED)..." -NoNewline
$curateBody = @{
    status = "APPROVED"
    notes = "Silabus 180 JP dan modul praktik las 6G sesuai standar SKKNI dan ASME Section IX."
} | ConvertTo-Json

$curateRes = Invoke-RestMethod -Uri "$baseUrl/training-admin/programs/$progId/curate" -Method Patch -Body $curateBody -ContentType "application/json" -WebSession $adminSession

if ($curateRes.status -eq "success" -and $curateRes.data.approvalStatus -eq "APPROVED" -and $curateRes.data.status -eq "PUBLISHED") {
    Write-Host " [BERHASIL: Program Resmi Disahkan dan PUBLISHED]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Kurasi program gagal]" -ForegroundColor Red
    exit 1
}

# 8. Verifikasi Katalog Publik Skillhub
Write-Host "[STEP 7] Verifikasi Katalog Publik Skillhub Daerah..." -NoNewline
$catalogRes = Invoke-RestMethod -Uri "$baseUrl/trainings/catalog" -Method Get
$catalogProg = $catalogRes.data | Where-Object { $_.id -eq $progId }

if ($catalogProg -and $catalogProg.batches.Count -ge 1 -and $catalogProg.provider.institutionName -eq "LPK Teknik Pengelasan Kuala Kencana") {
    Write-Host " [BERHASIL: Program dan Batch Resmi Tampil di Katalog Publik!]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Program belum tampil di katalog publik]" -ForegroundColor Red
    exit 1
}

# 9. Verifikasi Dashboard Provider (My Programs & My Batches)
Write-Host "[STEP 8] Verifikasi Dashboard Studio dan Batch Provider..." -NoNewline
$myProgs = Invoke-RestMethod -Uri "$baseUrl/training-providers/programs" -Method Get -WebSession $provApprovedSession
$myBatches = Invoke-RestMethod -Uri "$baseUrl/training-providers/batches" -Method Get -WebSession $provApprovedSession

if ($myProgs.total -ge 1 -and $myBatches.total -ge 1) {
    Write-Host " [BERHASIL: Provider melihat 1 Program dan 1 Batch Cohort]" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Data dashboard provider tidak sinkron]" -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  MICRO 1.4.2 SELESAI: STUDIO PROGRAM DAN KURASI TIER-2 LULUS! " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
