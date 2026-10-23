$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path ".."
$AutomationDir = $PWD

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING FULL AUTOMATION & SECURITY SCAN" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ---------------------------------------------------------
# 1. PLAYWRIGHT E2E TESTS
# ---------------------------------------------------------
Write-Host "`n[1/4] 🎭 Running Playwright E2E Tests..." -ForegroundColor Yellow
npx playwright test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ E2E Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "❌ E2E Tests Failed. Check HTML report via 'npm run report'." -ForegroundColor Red
}

# ---------------------------------------------------------
# 2. TRIVY DEPENDENCY SCAN
# ---------------------------------------------------------
Write-Host "`n[2/4] 📦 Running Trivy Dependency Scans..." -ForegroundColor Yellow

Write-Host "Scanning Server..."
docker run --rm -v "$RootDir/server:/app" aquasec/trivy:latest fs /app --format json --output trivy-server.json

Write-Host "Scanning Client..."
docker run --rm -v "$RootDir/client:/app" aquasec/trivy:latest fs /app --format json --output trivy-client.json

Write-Host "✅ Trivy scans complete." -ForegroundColor Green

# ---------------------------------------------------------
# 3. OWASP ZAP SECURITY SCAN
# ---------------------------------------------------------
Write-Host "`n[3/4] 🛡️ Running OWASP ZAP Baseline Scan..." -ForegroundColor Yellow
Write-Host "Ensure your backend is running on port 5000 (Playwright should have started it)."

New-Item -ItemType Directory -Force -Path "$AutomationDir/zap-reports" | Out-Null

docker run --rm -v "$AutomationDir/zap-reports:/zap/wrk/:rw" -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:5000 -J baseline.json

Write-Host "✅ ZAP Scan complete. Check ./zap-reports/baseline.html" -ForegroundColor Green

# ---------------------------------------------------------
# 4. GENERATE EXCEL REPORTS
# ---------------------------------------------------------
Write-Host "`n[4/4] 📊 Generating Excel Reports..." -ForegroundColor Yellow

npx vuln-reporter --input trivy-server.json --reporter-title "Server Vulnerabilities" --output-file "Server-Issues.xlsx"
npx vuln-reporter --input trivy-client.json --reporter-title "Client Vulnerabilities" --output-file "Client-Issues.xlsx"

Write-Host "✅ Excel Reports generated successfully!" -ForegroundColor Green

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "🎉 AUTOMATION COMPLETE" -ForegroundColor Cyan
Write-Host "Please review the following files:" -ForegroundColor White
Write-Host " - playwright-report/ (UI Failures)" -ForegroundColor White
Write-Host " - zap-reports/baseline.html (Security Risks)" -ForegroundColor White
Write-Host " - Server-Issues.xlsx (Dependency Risks)" -ForegroundColor White
Write-Host " - Client-Issues.xlsx (Dependency Risks)" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan