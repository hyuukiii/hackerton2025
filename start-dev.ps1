# Healthcare Hackathon 개발 환경 시작 스크립트 (PowerShell)
# 48시간 해커톤에 최적화된 버전

$ErrorActionPreference = "Stop"

# 색상 함수
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Info { Write-Host $args[0] -ForegroundColor Cyan }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }

# 아스키 아트 배너
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║     Healthcare Hackathon 2025 - CDSS Platform             ║
║     환자-의사 연동 신기능 기반 처방 적정성 평가 시스템     ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

Write-Success "`n🚀 개발 환경 시작 (48시간 해커톤 모드)"

# 시작 시간 기록
$startTime = Get-Date

# 1. 필수 도구 확인
Write-Info "`n📋 필수 도구 확인 중..."

# Docker 확인
try {
    $dockerVersion = docker --version
    Write-Success "✅ Docker 확인: $dockerVersion"
} catch {
    Write-Error "❌ Docker Desktop이 설치되지 않았거나 실행되지 않았습니다."
    Write-Warning "👉 https://www.docker.com/products/docker-desktop 에서 설치해주세요."
    exit 1
}

# Java 확인
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Success "✅ Java 확인: $javaVersion"
} catch {
    Write-Warning "⚠️ Java가 설치되지 않았습니다. Gradle이 자동으로 JDK를 다운로드합니다."
}

# Node.js 확인 (의사용 웹용)
try {
    $nodeVersion = node --version
    Write-Success "✅ Node.js 확인: $nodeVersion"
} catch {
    Write-Warning "⚠️ Node.js가 설치되지 않았습니다. 의사용 웹 개발시 필요합니다."
}

# 2. 포트 확인 및 정리
Write-Info "`n🔍 포트 사용 확인 중..."

$portsToCheck = @(
    @{Port=3306; Service="MySQL"},
    @{Port=8082; Service="Spring Boot API"},
    @{Port=3000; Service="Next.js 의사용 웹"}
)

foreach ($item in $portsToCheck) {
    $port = $item.Port
    $service = $item.Service

    $process = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($process) {
        Write-Warning "⚠️ 포트 $port 사용 중 ($service)"
        $confirm = Read-Host "해당 프로세스를 종료하시겠습니까? (y/n)"
        if ($confirm -eq 'y') {
            $pid = (Get-Process -Id $process.OwningProcess).Id
            Stop-Process -Id $pid -Force
            Write-Success "✅ 프로세스 종료 완료"
        }
    } else {
        Write-Success "✅ 포트 $port 사용 가능 ($service)"
    }
}

# 3. MySQL 컨테이너 시작
Write-Info "`n📦 MySQL 컨테이너 시작..."
Push-Location (Split-Path -Parent $PSScriptRoot)

# docker-compose.yml 존재 확인
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error "❌ docker-compose.yml 파일을 찾을 수 없습니다."
    exit 1
}

# 기존 컨테이너 정리
docker-compose down 2>$null

# 새 컨테이너 시작
docker-compose up -d

# MySQL 준비 확인 (최대 30초 대기)
Write-Info "⏳ MySQL 준비 대기 중..."
$mysqlReady = $false
$maxAttempts = 10
$attempts = 0

while (-not $mysqlReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 3
    try {
        # MySQL 컨테이너 이름 찾기
        $containerName = docker ps --format "table {{.Names}}" | Select-String "mysql" | Select-Object -First 1
        if ($containerName) {
            docker exec $containerName mysql -uroot -proot -e "SELECT 1" 2>$null | Out-Null
            if ($?) {
                $mysqlReady = $true
                Write-Success "✅ MySQL 준비 완료!"

                # 데이터베이스 초기화
                docker exec $containerName mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS healthcare_db;" 2>$null
                Write-Success "✅ 데이터베이스 생성 완료: healthcare_db"
            }
        }
    } catch {
        $attempts++
        Write-Info "MySQL 시작 중... ($attempts/$maxAttempts)"
    }
}

if (-not $mysqlReady) {
    Write-Error "❌ MySQL 시작 실패. 로그를 확인해주세요: docker-compose logs mysql"
    exit 1
}

# 4. Spring Boot 애플리케이션 시작
Write-Info "`n🌱 Spring Boot 백엔드 시작..."
Push-Location backend

# gradlew.bat 실행 권한 확인
if (-not (Test-Path "gradlew.bat")) {
    Write-Warning "⚠️ gradlew.bat 파일이 없습니다. Gradle Wrapper 생성 중..."
    gradle wrapper --gradle-version=8.5
}

# 새 창에서 Spring Boot 실행 (컬러 출력 지원)
$springBootScript = @"
Write-Host '🚀 Spring Boot 애플리케이션 시작' -ForegroundColor Green
Write-Host '📝 로그를 실시간으로 확인하세요' -ForegroundColor Cyan
Write-Host '🔄 코드 변경시 자동 재시작됩니다 (DevTools)' -ForegroundColor Yellow
Write-Host ''
./gradlew.bat bootRun --console=rich
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $springBootScript

Pop-Location

# 5. API 테스트 대기
Write-Info "`n⏳ API 서버 시작 대기 중 (최대 30초)..."
$apiReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $apiReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8082/api/health" -Method Get -ErrorAction SilentlyContinue
        if ($response) {
            $apiReady = $true
            Write-Success "✅ API 서버 준비 완료!"
        }
    } catch {
        $attempts++
        if ($attempts % 5 -eq 0) {
            Write-Info "API 서버 시작 중... ($attempts/$maxAttempts)"
        }
    }
}

# 6. 의사용 웹 확인
if (Test-Path "doctor-web/package.json") {
    Write-Info "`n🌐 의사용 웹 애플리케이션 확인..."
    Push-Location doctor-web

    # node_modules 확인
    if (-not (Test-Path "node_modules")) {
        Write-Warning "⚠️ 의존성이 설치되지 않았습니다. 설치를 시작합니다..."
        npm install
    }

    # 개발 서버 시작
    $nextScript = @"
Write-Host '🌐 Next.js 의사용 웹 시작' -ForegroundColor Green
Write-Host '🔄 Hot Reload 활성화됨' -ForegroundColor Yellow
npm run dev
"@

    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $nextScript"
    Pop-Location
}

# 7. 성공 메시지 및 정보 출력
$endTime = Get-Date
$duration = $endTime - $startTime

Pop-Location

Write-Host "`n"
Write-Success "╔════════════════════════════════════════════════════════════╗"
Write-Success "║          ✅ 모든 서비스가 성공적으로 시작되었습니다!         ║"
Write-Success "╚════════════════════════════════════════════════════════════╝"

Write-Host "`n📋 서비스 접속 정보:" -ForegroundColor Cyan
Write-Host "├─ 🔗 API 문서 (Swagger): " -NoNewline
Write-Host "http://localhost:8082/api/swagger-ui.html" -ForegroundColor Yellow
Write-Host "├─ 🏥 의사용 웹: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "├─ 💾 MySQL: " -NoNewline
Write-Host "localhost:3306 (root/root)" -ForegroundColor Yellow
Write-Host "└─ 🔍 헬스체크: " -NoNewline
Write-Host "http://localhost:8082/api/health" -ForegroundColor Yellow

Write-Host "`n📱 환자용 모바일 앱:" -ForegroundColor Cyan
Write-Host "├─ 새 터미널에서: " -NoNewline
Write-Host "cd patient-app && npm start" -ForegroundColor Yellow
Write-Host "└─ Expo Go 앱으로 QR코드 스캔" -ForegroundColor Gray

Write-Host "`n🛠️ 개발 팁:" -ForegroundColor Cyan
Write-Host "├─ Backend 코드 수정시 자동 재시작 (Spring DevTools)"
Write-Host "├─ Frontend 코드 수정시 자동 새로고침 (Hot Reload)"
Write-Host "├─ API 테스트: Swagger UI 또는 Postman 사용"
Write-Host "└─ DB 접속: MySQL Workbench 또는 DBeaver 사용"

Write-Host "`n⏱️ 시작 시간: $($duration.TotalSeconds.ToString('F2'))초" -ForegroundColor Gray
Write-Host "`n종료하려면 " -NoNewline
Write-Host "Ctrl+C" -ForegroundColor Yellow -NoNewline
Write-Host "를 누르거나 이 창을 닫으세요.`n"

# 프로세스 모니터링
Write-Warning "🔄 로그를 확인하려면 각 PowerShell 창을 참조하세요."

# 종료 대기
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Warning "`n🛑 종료 중..."
    docker-compose down
    Write-Success "✅ 모든 서비스가 정리되었습니다."
}