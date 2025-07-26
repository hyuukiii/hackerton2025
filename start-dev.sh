#!/bin/bash

echo "🚀 Healthcare Hackathon 개발 환경 시작"

# MySQL 컨테이너 시작
echo "📦 MySQL 컨테이너 시작..."
docker-compose up -d

# MySQL이 준비될 때까지 대기
echo "⏳ MySQL 준비 대기 중..."
sleep 10

# Spring Boot 애플리케이션 시작
echo "🌱 Spring Boot 백엔드 시작..."
./gradlew bootRun &

# 프론트엔드 프로젝트들도 있다면 추가
echo "🌐 Next.js 의사용 웹 시작..."
cd ../doctor-web && npm run dev &

# echo "📱 Expo 환자용 앱 시작..."
cd ../patient-app && npm start &

echo "✅ 모든 서비스가 시작되었습니다!"
echo "📝 로그 확인: tail -f logs/spring.log"
echo "🔗 API 문서: http://localhost:8080/api/swagger-ui.html"
echo "💊 MySQL: localhost:3306"