// src/services/api/index.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 개발/프로덕션 환경에 따른 API URL 설정
const API_URL = __DEV__
? 'http://localhost:8082/api'  // API 서버는 8082 포트에서 실행
: 'https://api.careplus.com/api';

// 백엔드 없이 테스트 모드
const TEST_MODE = true; // 백엔드 준비되면 false로 변경

const api = axios.create({
baseURL: API_URL,
timeout: 10000,
headers: {
'Content-Type': 'application/json',
},
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 처리
      await AsyncStorage.removeItem('authToken');
      // 로그인 화면으로 이동
    }
    return Promise.reject(error);
  }
);

export default api;