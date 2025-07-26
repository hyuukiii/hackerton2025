# 🖥️ 크로스 플랫폼 명령어 가이드

## 🚀 빠른 시작

### Windows (PowerShell)
```powershell
# PowerShell 실행 정책 설정 (처음 한 번만)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 개발 환경 시작
.\start-dev.ps1
```

### Windows (Command Prompt)
```batch
# 개발 환경 시작
start-dev.bat
```

### macOS/Linux
```bash
# 실행 권한 부여 (처음 한 번만)
chmod +x start-dev.sh

# 개발 환경 시작
./start-dev.sh
```

## 🛠️ 수동 실행 방법 (모든 OS)

### 1. Docker로 MySQL 시작
```bash
# Windows/Mac/Linux 모두 동일
docker-compose up -d

# MySQL 컨테이너 상태 확인
docker ps

# MySQL 로그 확인
docker-compose logs mysql
```

### 2. Spring Boot 애플리케이션 실행

#### Windows
```batch
# Command Prompt 또는 PowerShell
gradlew.bat bootRun

# 특정 프로파일로 실행
gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

#### macOS/Linux
```bash
# Terminal
./gradlew bootRun

# 특정 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=dev'
```

## 📋 자주 사용하는 명령어

### 빌드 명령어
```bash
# Windows
gradlew.bat clean build

# macOS/Linux
./gradlew clean build
```

### 테스트 실행
```bash
# Windows
gradlew.bat test

# macOS/Linux
./gradlew test
```

### 의존성 업데이트
```bash
# Windows
gradlew.bat --refresh-dependencies

# macOS/Linux
./gradlew --refresh-dependencies
```

## 🔧 IntelliJ IDEA 설정

### 1. Gradle 설정
- File → Settings (Windows) / Preferences (Mac)
- Build, Execution, Deployment → Build Tools → Gradle
- "Build and run using": IntelliJ IDEA
- "Run tests using": IntelliJ IDEA

### 2. Run Configuration
1. Run → Edit Configurations
2. Add New Configuration → Spring Boot
3. Main class: `com.hackathon.HealthcareApplication`
4. Environment variables: `SPRING_PROFILES_ACTIVE=dev`

### 3. 터미널 설정 (Windows)
- File → Settings → Tools → Terminal
- Shell path: `powershell.exe` 또는 `C:\Program Files\Git\bin\bash.exe`

## 🐳 Docker 명령어

### MySQL 접속
```bash
# Windows PowerShell
docker exec -it $(docker ps -qf "name=mysql") mysql -uroot -proot

# Windows CMD (컨테이너 이름 직접 지정)
docker exec -it healthcare-hackathon-mysql-1 mysql -uroot -proot

# macOS/Linux
docker exec -it $(docker ps -qf "name=mysql") mysql -uroot -proot
```

### 데이터베이스 초기화
```sql
-- MySQL 접속 후
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;
```

### 컨테이너 정리
```bash
# 모든 컨테이너 중지 및 삭제
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

## 🆘 문제 해결

### Windows에서 gradlew.bat을 찾을 수 없을 때
```bash
# Git Bash 또는 PowerShell에서
gradle wrapper --gradle-version=8.5
```

### Permission denied (macOS/Linux)
```bash
chmod +x gradlew
chmod +x start-dev.sh
```

### Port already in use
```bash
# Windows - 8080 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>
```

### MySQL 연결 실패
```yaml
# application.yml에서 localhost를 127.0.0.1로 변경
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/healthcare_db
```

## 📱 팀 협업 가이드

### 처음 프로젝트 클론 후
```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd healthcare-hackathon

# 2. 로컬 설정 파일 생성
cp application.yml application-local.yml

# 3. 개발 환경 시작
# Windows: start-dev.bat 또는 start-dev.ps1
# Mac/Linux: ./start-dev.sh
```

### 브랜치 작업
```bash
# 기능 브랜치 생성
git checkout -b feature/patient-api

# 작업 후 커밋
git add .
git commit -m "feat: 환자 API 구현"

# 푸시
git push origin feature/patient-api
```