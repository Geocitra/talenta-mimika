$BaseUrl = "http://localhost:3000/api/v1"

# Login as Employer
$loginPayload = @{ identifier = "hrd@freeport.co.id"; password = "PasswordKuat123!" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login/password" -Method Post -Body $loginPayload -ContentType "application/json" -SessionVariable webSession

Write-Host "=== TEST 1: POLISH SALES EXECUTIVE ===" -ForegroundColor Cyan
$p1 = @{
    action = "POLISH_TASKS"
    title = "Sales Executive"
    rawTasks = "hubungi calon nasabah, tawarkan produk tabungan dan kredit, capai target omset bulanan, buat laporan kunjungan harian"
    opportunityType = "JOB"
} | ConvertTo-Json
$r1 = Invoke-RestMethod -Uri "$BaseUrl/vacancies/ai-assist" -Method Post -WebSession $webSession -Body $p1 -ContentType "application/json"
Write-Host $r1.data.polishedTasks -ForegroundColor Green

Write-Host "`n=== TEST 2: POLISH SOFTWARE ENGINEER ===" -ForegroundColor Cyan
$p2 = @{
    action = "POLISH_TASKS"
    title = "Fullstack Developer (Node.js & React)"
    rawTasks = "bikin fitur backend pake nestjs, bikin tampilan frontend pake nextjs, benerin bug, deploy ke docker"
    opportunityType = "JOB"
} | ConvertTo-Json
$r2 = Invoke-RestMethod -Uri "$BaseUrl/vacancies/ai-assist" -Method Post -WebSession $webSession -Body $p2 -ContentType "application/json"
Write-Host $r2.data.polishedTasks -ForegroundColor Green

Write-Host "`n=== TEST 3: SUGGEST CRITERIA STAFF AKUNTANSI ===" -ForegroundColor Cyan
$s1 = Invoke-RestMethod -Uri "$BaseUrl/vacancies/suggestions?title=Staff%20Akuntansi%20Keuangan" -Method Get
Write-Host "Kluster : $($s1.data.categoryLabel)" -ForegroundColor Yellow
Write-Host "Skills  : $($s1.data.recommendedSkills -join ', ')" -ForegroundColor White
Write-Host "Tools   : $($s1.data.recommendedTools -join ', ')" -ForegroundColor DarkCyan
