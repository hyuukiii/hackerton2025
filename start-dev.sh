#!/bin/bash

echo "🚀 Healthcare Hackathon 개발 환경 시작"

# MySQL 컨테이너 시작
echo "📦 MySQL 컨테이너 시작..."
docker-compose up -d

# MySQL이 준비될 때까지 대기
echo "⏳ MySQL 준비 대기 중..."
sleep 10

# MySQL 연결 테스트
echo "🔍 MySQL 연결 테스트..."
docker exec $(docker ps -qf "name=mysql") mysql -uroot -proot -e "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MySQL 연결 성공!"
else
    echo "❌ MySQL 연결 실패. Docker 상태를 확인하세요."
fi

# Spring Boot 애플리케이션 시작
echo "🌱 Spring Boot 백엔드 시작..."
cd backend && ./gradlew bootRun &
BACKEND_PID=$!
cd ..

# 백엔드가 시작될 때까지 대기
echo "⏳ 백엔드 시작 대기 중..."
sleep 15

# Next.js 의사용 웹 시작 (있는 경우)
if [ -d "doctor-web" ]; then
    echo "🌐 Next.js 의사용 웹 시작..."
    cd doctor-web && npm run dev &
    FRONTEND_WEB_PID=$!
    cd ..
fi

# Expo 환자용 앱 시작 (있는 경우)
if [ -d "patient-app" ]; then
    echo "📱 Expo 환자용 앱 시작..."
    cd patient-app && npm start &
    FRONTEND_APP_PID=$!
    cd ..
fi

echo ""
echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "📝 접속 URL:"
echo "   - API 문서: http://localhost:8080/api/swagger-ui.html"
echo "   - 헬스체크: http://localhost:8080/api/health"
echo "   - MySQL: localhost:3306 (root/root)"

if [ -d "doctor-web" ]; then
    echo "   - 의사용 웹: http://localhost:3000"
fi

if [ -d "patient-app" ]; then
    echo "   - 환자용 앱: http://localhost:19006 (Expo Web)"
    echo "   - Expo 모바일: Expo Go 앱에서 QR 코드 스캔"
fi

echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# 종료 시그널 처리
trap "echo '종료 중...'; kill $BACKEND_PID $FRONTEND_WEB_PID $FRONTEND_APP_PID 2>/dev/null; docker-compose down; exit" INT TERM

# 프로세스가 종료될 때까지 대기
wait