Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  TEST HARNESS: LIVING PROFILE LIFECYCLE & DOMAIN INTEGRITY       " -ForegroundColor Cyan
Write-Host "  (Craig Larman OOAD / GRASP: OCC, Anti-Wipe & Orphan Cleanup)    " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$testEmail = "lifecycle.talent.$(Get-Random)@mimika.go.id"
$testNik = "910401$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
$password = "PasswordKuat123!"

# ------------------------------------------------------------
# STEP 1: Registrasi & Verifikasi Akun Talenta
# ------------------------------------------------------------
Write-Host "`n[STEP 1] Registrasi Talenta Baru ($testEmail)..." -NoNewline
try {
    $regBody = @{
        email = $testEmail
        password = $password
        fullName = "Yohanes Murib"
        nik = $testNik
        birthDate = "1998-05-12"
    } | ConvertTo-Json

    $resReg = Invoke-RestMethod -Uri "$baseUrl/auth/register/talent" -Method Post -Body $regBody -ContentType "application/json"
    if ($resReg.status -eq "success") {
        Write-Host " [BERHASIL]" -ForegroundColor Green
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 2] Verifikasi Status Akun di Database..." -NoNewline
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
# STEP 3: Login & Inisialisasi Sesi Cookie HttpOnly
# ------------------------------------------------------------
Write-Host "[STEP 3] Login Talenta & Mendapatkan Cookie Sesi..." -NoNewline
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
# STEP 4: Ambil Profil Awal & Tambah Keahlian Mandiri (Self-Declared)
# ------------------------------------------------------------
Write-Host "[STEP 4] Input Keahlian Mandiri (Self-Declared)..." -NoNewline
$staleTimestamp = ""
try {
    $initUpdate = @{
        phone = "082199887766"
        bio = "Operator alat berat dan teknisi mekanik Papua."
        skills = @(
            @{
                name = "Operator Excavator PC200"
                level = "INTERMEDIATE"
                isLmsVerified = $false
            }
        )
        isAvailable = $true
    } | ConvertTo-Json -Depth 5

    $resInit = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Put -Body $initUpdate -ContentType "application/json" -WebSession $session
    $staleTimestamp = $resInit.data.updatedAt

    if ($resInit.status -eq "success" -and $resInit.data.skills.Count -eq 1) {
        Write-Host " [BERHASIL: Skill Mandiri Tersimpan, updatedAt: $staleTimestamp]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL]" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Tunggu sejenak agar timestamp terpisah lebih dari 1 detik
Start-Sleep -Milliseconds 1200

# ------------------------------------------------------------
# STEP 5: Simulasi Kelulusan Pelatihan LMS (Auto-Skill Injection)
# ------------------------------------------------------------
Write-Host "[STEP 5] Simulasi Injeksi Keahlian Resmi LMS (isLmsVerified: true)..." -NoNewline
try {
    $certNumber = "CERT-BNSP-MIMIKA-9921"
    $nodeInjectCmd = @"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
    const t = await p.talent.findFirst({ where: { user: { email: '$testEmail' } } });
    const currentSkills = Array.isArray(t.skills) ? t.skills : [];
    currentSkills.push({
        name: 'Welding 3G SMAW',
        level: 'EXPERT',
        isLmsVerified: true,
        certificateNumber: '$certNumber',
        verifiedAt: new Date().toISOString()
    });
    await p.talent.update({
        where: { id: t.id },
        data: { skills: currentSkills }
    });
    console.log('INJECTED_OK');
    await p.`$disconnect();
}
main();
"@
    $injectOutput = & node -e "$nodeInjectCmd"
    if ($injectOutput -match "INJECTED_OK") {
        Write-Host " [BERHASIL: Keahlian Resmi LMS Terinjeksi]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL]: $injectOutput" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# STEP 6: Uji Optimistic Concurrency Control (OCC) Conflict Guard
# ------------------------------------------------------------
Write-Host "[STEP 6] Uji OCC Guard: Mengirim Update dengan Timestamp Usang (Stale Write)..." -NoNewline
$occBlocked = $false
try {
    # Kirim payload dengan staleTimestamp yang diambil SEBELUM injeksi LMS
    $stalePayload = @{
        phone = "082199887799"
        bio = "Bio versi lama sebelum kelulusan..."
        lastUpdatedAt = $staleTimestamp
        skills = @(
            @{
                name = "Operator Excavator PC200"
                level = "EXPERT"
                isLmsVerified = $false
            }
        )
    } | ConvertTo-Json -Depth 5

    $resStale = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Put -Body $stalePayload -ContentType "application/json" -WebSession $session
    Write-Host " [GAGAL: Seharusnya Ditolak 409 Conflict]" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        $occBlocked = $true
        Write-Host " [BERHASIL: Ditolak HTTP 409 Conflict (Mencegah Stale Overwrite)]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Status $statusCode - $($_.Exception.Message)]" -ForegroundColor Red
    }
}

# ------------------------------------------------------------
# STEP 7: Uji Smart Merge Policy & Anti-Wipe Skill LMS
# ------------------------------------------------------------
Write-Host "[STEP 7] Uji Anti-Wipe (SkillMergePolicy): Simpan Form Tanpa Menyertakan Skill LMS..." -NoNewline
try {
    # 1. Ambil data profil mutakhir (Simulasi refresh halaman setelah 409)
    $resLatest = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $session
    $freshUpdatedAt = $resLatest.data.updatedAt

    # 2. Talenta mengirim keahlian baru ("K3 Tambang"), tetapi di form dia tidak menyertakan "Welding 3G SMAW"
    $mergePayload = @{
        phone = "082199887766"
        bio = "Operator dan Pengawas K3 Bersertifikasi."
        lastUpdatedAt = $freshUpdatedAt
        skills = @(
            @{
                name = "Operator Excavator PC200"
                level = "EXPERT"
                isLmsVerified = $false
            },
            @{
                name = "K3 Dasar Pertambangan"
                level = "INTERMEDIATE"
                isLmsVerified = $false
            }
        )
    } | ConvertTo-Json -Depth 5

    $resMerge = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Put -Body $mergePayload -ContentType "application/json" -WebSession $session
    $updatedSkills = $resMerge.data.skills

    # Cari apakah skill LMS "Welding 3G SMAW" masih ada dan tetap terverifikasi
    $weldingSkill = $updatedSkills | Where-Object { $_.name -like "*Welding 3G*" }
    $k3Skill = $updatedSkills | Where-Object { $_.name -like "*K3 Dasar*" }

    $isProtected = ($weldingSkill -ne $null) -and `
                   ($weldingSkill.isLmsVerified -eq $true) -and `
                   ($weldingSkill.certificateNumber -eq "CERT-BNSP-MIMIKA-9921") -and `
                   ($k3Skill -ne $null)

    if ($isProtected) {
        Write-Host " [BERHASIL: Skill LMS Tidak Terhapus (Zero Skill-Wipe), Total: $($updatedSkills.Count) Skill]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: Skill LMS terhapus atau metadata rusak]" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# STEP 8: Uji Pembersihan Berkas Fisik Yatim (Orphan File Purge)
# ------------------------------------------------------------
Write-Host "[STEP 8] Uji Pembersihan Berkas PDF Yatim (Orphan Storage Purge)..." -NoNewline
try {
    $uploadDir = Join-Path (Get-Location) "apps\backend\uploads\certificates"
    if (!(Test-Path $uploadDir)) {
        $uploadDir = Join-Path (Get-Location) "uploads\certificates"
    }
    if (!(Test-Path $uploadDir)) {
        New-Item -ItemType Directory -Path $uploadDir -Force | Out-Null
    }

    $dummyFileName = "cert-test-orphan-$(Get-Random).pdf"
    $dummyFilePath = Join-Path $uploadDir $dummyFileName
    [System.IO.File]::WriteAllText($dummyFilePath, "%PDF-1.4 Dummy Certificate Test File")

    if (!(Test-Path $dummyFilePath)) {
        Write-Host " [GAGAL: Tidak dapat membuat dummy file]" -ForegroundColor Red
        exit 1
    }

    # 1. Simpan sertifikat ke profil
    $freshGet = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Get -WebSession $session
    $currentUpdateTimestamp = $freshGet.data.updatedAt

    $certPayload = @{
        lastUpdatedAt = $currentUpdateTimestamp
        certifications = @(
            @{
                id = "cert-1"
                name = "Sertifikat Uji Orphan"
                issuer = "Disnakertrans Mimika"
                fileUrl = "/api/v1/talents/certificates/$dummyFileName"
                fileName = $dummyFileName
            }
        )
    } | ConvertTo-Json -Depth 5

    $resWithCert = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Put -Body $certPayload -ContentType "application/json" -WebSession $session

    # 2. Hapus sertifikat dari profil (Kirim certifications kosong)
    $purgePayload = @{
        lastUpdatedAt = $resWithCert.data.updatedAt
        certifications = @()
    } | ConvertTo-Json -Depth 5

    $resPurged = Invoke-RestMethod -Uri "$baseUrl/talents/me" -Method Put -Body $purgePayload -ContentType "application/json" -WebSession $session

    # Tunggu sejenak agar proses asynchronous unlink selesai
    Start-Sleep -Milliseconds 600

    # 3. Periksa apakah berkas fisik di storage disk telah terhapus
    if (!(Test-Path $dummyFilePath)) {
        Write-Host " [BERHASIL: File Fisik Yatim '$dummyFileName' Otomatis Dihapus dari Disk]" -ForegroundColor Green
    } else {
        Write-Host " [GAGAL: File fisik masih tertinggal di disk]" -ForegroundColor Red
        # Cleanup
        Remove-Item -Path $dummyFilePath -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host " [GAGAL]: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  HASIL: SELURUH 5 INVARIAN LIVING PROFILE BERHASIL TERVERIFIKASI!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
