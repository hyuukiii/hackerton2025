#!/bin/bash

echo "🚀 Healthcare Hackathon 개발 환경 시작"

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
pkill -f "spring-boot" 2>/dev/null || true
sleep 2

# MySQL 컨테이너 시작
echo "📦 MySQL 컨테이너 시작..."
docker-compose up -d
sleep 10

# Spring Boot 백엔드 시작
echo "🌱 Spring Boot 백엔드 시작..."
cd backend
./gradlew bootRun &
BACKEND_PID=$!
cd ..

# 백엔드가 시작될 때까지 대기
echo "⏳ 백엔드 시작 대기 중..."
sleep 15

# Next.js 의사용 웹 시작
if [ -d "doctor-web" ] && [ -f "doctor-web/package.json" ]; then
    echo "🌐 Next.js 의사용 웹 시작..."
    (cd doctor-web && npm run dev) &
    FRONTEND_WEB_PID=$!
    sleep 3
fi

echo ""
echo "✅ 백엔드 서비스가 시작되었습니다!"
echo ""
echo "📝 접속 URL:"
echo "   - API 문서: http://localhost:8082/api/swagger-ui.html"
echo "   - 헬스체크: http://localhost:8082/api/health"
echo "   - MySQL: localhost:3306 (root/root)"
echo "   - 의사용 웹: http://localhost:3000"
echo ""
echo "📱 Expo는 대화형 모드로 실행해야 합니다:"
echo "   새 터미널에서: cd patient-app && npm start"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# 종료 시그널 처리
trap "echo '종료 중...'; kill $BACKEND_PID $FRONTEND_WEB_PID 2>/dev/null; docker-compose down; exit" INT TERM

# 프로세스가 종료될 때까지 대기
wait