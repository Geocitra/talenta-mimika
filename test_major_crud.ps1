$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:3000/api/v1"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "TESTING CRUD MASTER JURUSAN & PRODI (SUPERADMIN)" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Login sebagai Superadmin
Write-Host "`n[STEP 1] Login Superadmin..." -ForegroundColor Yellow
$loginBody = @{
    identifier = "superadmin@mimika.go.id"
    password = "SuperAdminMimika2026!"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" -Method POST -Body $loginBody -ContentType "application/json" -WebSession $session
Write-Host "Login sukses! User: $($loginRes.data.user.email) Role: $($loginRes.data.user.role)" -ForegroundColor Green

# 2. Get All Master Majors (Paginated)
Write-Host "`n[STEP 2] Mengambil list Master Majors..." -ForegroundColor Yellow
$listRes = Invoke-RestMethod -Uri "$BaseUrl/majors/master?page=1&limit=10" -Method GET -WebSession $session
Write-Host "Total Master Data Jurusan di DB: $($listRes.meta.total)" -ForegroundColor Green
if ($listRes.meta.total -lt 30) {
    throw "Jumlah master majors kurang dari 30!"
}

# 3. Create New Master Major
$testName = "Teknik Robotika & Otomasi Industri Mimika"
$testCat = "TEKNOLOGI_INFORMASI"
Write-Host "`n[STEP 3] Menambahkan jurusan baru: '$testName'..." -ForegroundColor Yellow
$createBody = @{
    name = $testName
    category = $testCat
} | ConvertTo-Json

$createRes = Invoke-RestMethod -Uri "$BaseUrl/majors/master" -Method POST -Body $createBody -ContentType "application/json" -WebSession $session
$newId = $createRes.data.id
Write-Host "Berhasil ditambahkan dengan ID: $newId" -ForegroundColor Green

# 4. Duplicate Name Check (Expect 409 Conflict)
Write-Host "`n[STEP 4] Uji deteksi duplikasi nama (Expect 409 Conflict)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BaseUrl/majors/master" -Method POST -Body $createBody -ContentType "application/json" -WebSession $session
    throw "Harusnya gagal duplikat tetapi berhasil!"
} catch {
    Write-Host "Penolakan duplikasi berhasil (Expected error): $($_.Exception.Message)" -ForegroundColor Green
}

# 5. Update Master Major
$updatedName = "Teknik Robotika & Mekatronika Cerdas"
$updatedCat = "TEKNIK_MESIN"
Write-Host "`n[STEP 5] Memperbarui jurusan menjadi: '$updatedName' ($updatedCat)..." -ForegroundColor Yellow
$updateBody = @{
    name = $updatedName
    category = $updatedCat
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "$BaseUrl/majors/master/$newId" -Method PUT -Body $updateBody -ContentType "application/json" -WebSession $session
Write-Host "Berhasil diupdate! Nama baru: $($updateRes.data.name), Kategori: $($updateRes.data.category)" -ForegroundColor Green

# 6. Verify via Search
Write-Host "`n[STEP 6] Verifikasi pencarian Master..." -ForegroundColor Yellow
$searchRes = Invoke-RestMethod -Uri "$BaseUrl/majors/master?q=Mekatronika" -Method GET -WebSession $session
if ($searchRes.data.Count -eq 0 -or $searchRes.data[0].id -ne $newId) {
    throw "Jurusan yang baru diupdate tidak ditemukan dalam pencarian!"
}
Write-Host "Ditemukan dalam pencarian: $($searchRes.data[0].name)" -ForegroundColor Green

# 7. Delete Master Major
Write-Host "`n[STEP 7] Menghapus jurusan yang dibuat..." -ForegroundColor Yellow
$delRes = Invoke-RestMethod -Uri "$BaseUrl/majors/master/$newId" -Method DELETE -WebSession $session
Write-Host "Hapus sukses: $($delRes.message)" -ForegroundColor Green

# 8. Verify Deletion
Write-Host "`n[STEP 8] Verifikasi bahwa jurusan telah terhapus..." -ForegroundColor Yellow
$verifyDel = Invoke-RestMethod -Uri "$BaseUrl/majors/master?q=Mekatronika" -Method GET -WebSession $session
if ($verifyDel.data.Count -ne 0) {
    throw "Jurusan masih ditemukan setelah dihapus!"
}
Write-Host "Jurusan terkonfirmasi terhapus dari master database." -ForegroundColor Green

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "SELURUH TEST CRUD MASTER JURUSAN LULUS 100%! 🏆" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
