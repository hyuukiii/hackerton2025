# Healthcare Hackathon 개발 환경 시작 스크립트 (PowerShell)

Write-Host "🚀 Healthcare Hackathon 개발 환경 시작" -ForegroundColor Green

# Docker Desktop 실행 확인
$dockerRunning = docker version 2>$null
if (-not $?) {
    Write-Host "❌ Docker Desktop이 실행되지 않았습니다. Docker Desktop을 먼저 실행해주세요." -ForegroundColor Red
    exit 1
}

# MySQL 컨테이너 시작
Write-Host "📦 MySQL 컨테이너 시작..." -ForegroundColor Yellow
docker-compose up -d

# MySQL이 준비될 때까지 대기
Write-Host "⏳ MySQL 준비 대기 중..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# MySQL 연결 테스트
$mysqlReady = $false
$attempts = 0
while (-not $mysqlReady -and $attempts -lt 5) {
    try {
        docker exec $(docker ps -qf "name=mysql") mysql -uroot -proot -e "SELECT 1" 2>$null | Out-Null
        if ($?) {
            $mysqlReady = $true
            Write-Host "✅ MySQL 준비 완료!" -ForegroundColor Green
        }
    } catch {
        $attempts++
        Write-Host "⏳ MySQL 준비 중... ($attempts/5)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $mysqlReady) {
    Write-Host "⚠️ MySQL이 준비되지 않았습니다. 수동으로 확인해주세요." -ForegroundColor Yellow
}

# Spring Boot 애플리케이션 시작
Write-Host "🌱 Spring Boot 백엔드 시작..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ./gradlew.bat bootRun"

# 브라우저에서 API 문서 열기 (선택사항)
Start-Sleep -Seconds 5
# Start-Process "http://localhost:8080/api/swagger-ui.html"

Write-Host ""
Write-Host "✅ 모든 서비스가 시작되었습니다!" -ForegroundColor Green
Write-Host "📝 API 문서: http://localhost:8080/api/swagger-ui.html" -ForegroundColor Cyan
Write-Host "💊 MySQL: localhost:3306 (root/root)" -ForegroundColor Cyan
Write-Host "🔍 Health Check: http://localhost:8080/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "종료하려면 Ctrl+C를 누르거나 PowerShell 창을 닫으세요." -ForegroundColor Gray