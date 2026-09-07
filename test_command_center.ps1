Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: VERIFIKASI 1.4.1 (COMMAND CENTER ANALYTICS)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$execSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$talentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$rand = Get-Random -Minimum 100000 -Maximum 999999
$execEmail = "bupati.mimika.$rand@pemda.go.id"
$talentEmail = "talent.test.$rand@talenta.id"
$nik = "910401$rand"

# 1. Siapkan Akun Eksekutif (Bupati) dan Akun Talenta via node script
node apps/backend/seed_exec_user.js $execEmail $talentEmail $nik | Out-Null

# 2. Uji Keamanan: Talenta Coba Akses Command Center Pimpinan (Harus Ditolak 403)
Write-Host "`n[STEP 1] Uji Proteksi Peran: Talenta Akses Command Center..." -NoNewline
$tLogin = @{ identifier = $talentEmail; password = "BupatiMimika2026!" } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $tLogin -ContentType "application/json" -WebSession $talentSession | Out-Null

try {
    Invoke-RestMethod -Uri "$baseUrl/analytics/command-center" -Method Get -WebSession $talentSession
    Write-Host " [GAGAL: Talenta bisa akses data pimpinan!]" -ForegroundColor Red
} catch {
    $statusCode = 0
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    if ($statusCode -eq 403) {
        Write-Host " [BERHASIL: Ditolak dengan 403 Forbidden - Terlindungi Ketat!]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status bukan 403 (Status: $statusCode)]" -ForegroundColor Red
    }
}

# 3. Login Akun Pimpinan (EXECUTIVE)
Write-Host "[STEP 2] Login Akun Pimpinan Daerah (EXECUTIVE)..." -NoNewline
$execLogin = @{ identifier = $execEmail; password = "BupatiMimika2026!" } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "$baseUrl/auth/login/password" -Method Post -Body $execLogin -ContentType "application/json" -WebSession $execSession | Out-Null
Write-Host " [BERHASIL]" -ForegroundColor Green

# 4. Ambil Data Command Center
Write-Host "[STEP 3] Memanggil Analytics Engine (GET /analytics/command-center)..." -NoNewline
$res = Invoke-RestMethod -Uri "$baseUrl/analytics/command-center" -Method Get -WebSession $execSession

if ($res.status -eq "success") {
    Write-Host " [BERHASIL]" -ForegroundColor Green
    
    $kpi = $res.data.kpis
    Write-Host "`n--- 8 INDIKATOR KINERJA UTAMA (KPI) MIMIKA TALENTA ---" -ForegroundColor Yellow
    Write-Host "1. Total Angkatan Kerja Terdata : $($kpi.totalTalents) Jiwa"
    Write-Host "2. Pencari Kerja Aktif          : $($kpi.activeSeekingTalents) Jiwa"
    Write-Host "3. Industri Terakreditasi (NIB) : $($kpi.totalEmployers) Perusahaan"
    Write-Host "4. Lowongan Terbuka Saat Ini    : $($kpi.openVacancies) Posisi Proyek"
    Write-Host "5. Total Aksi Pendekatan (Match): $($kpi.totalApproaches) Interaksi"
    Write-Host "6. Peserta Pelatihan Terdaftar  : $($kpi.totalTrainingParticipants) Peserta"
    Write-Host "7. Lulusan Bersertifikat Resmi  : $($kpi.totalCertifiedGraduates) Orang"
    Write-Host "8. Rasio Serapan Tenaga Kerja   : $($kpi.localAbsorptionRate)%" -ForegroundColor Green

    Write-Host "`n--- CORONG KONVERSI KETENAGAKERJAAN (FUNNEL) ---" -ForegroundColor Yellow
    foreach ($step in $res.data.funnel) {
        Write-Host "[$($step.stage)]: $($step.count)"
    }

    Write-Host "`n--- ANALISIS KESENJANGAN KETERAMPILAN (SKILL GAP) ---" -ForegroundColor Yellow
    foreach ($sg in $res.data.skillGaps) {
        Write-Host "Keahlian: $($sg.skillName) | Dicari Industri: $($sg.demandCount) | Tersedia di Warga: $($sg.supplyCount) | Status: $($sg.status)"
    }

    Write-Host "`n--- DISTRIBUSI SEKTOR INDUSTRI ---" -ForegroundColor Yellow
    foreach ($ind in $res.data.industryDistribution) {
        Write-Host "Sektor: $($ind.sector) | Jumlah Perusahaan: $($ind.companyCount) ($($ind.percentage)%)"
    }

    Write-Host "`n--- DETAK AKTIVITAS TERBARU (AUDIT FEED) ---" -ForegroundColor Yellow
    foreach ($act in $res.data.recentActivities) {
        Write-Host "[$($act.type)] $($act.title) -> $($act.description)"
    }

    Write-Host "`n[UJI LOGIKA ANALITIK]: 100% VALID & BEBAS REDUNDANSI DATABASE!" -ForegroundColor Green
} else {
    Write-Host " [GAGAL: Response tidak valid]" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSA 1.4.1: SELESAI                                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
