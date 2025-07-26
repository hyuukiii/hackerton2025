// src/services/api/index.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 개발 환경에서 IP 주소 확인 방법:
// Windows: ipconfig
// Mac/Linux: ifconfig 또는 ip addr
// 보통 192.168.x.x 형태

// API URL 설정
const getApiUrl = () => {
if (__DEV__) {
    // 개발 환경
    if (Platform.OS === 'android') {
      // Android 에뮬레이터는 10.0.2.2 사용
      return 'http://10.0.2.2:8082/api';
    } else {
      // iOS 시뮬레이터나 실제 디바이스는 컴퓨터의 IP 주소 사용
      return 'http:://10.10.180.66:19000/api'; // 예시 IP - 실제 IP로 변경 필요
    }
  } else {
    // 프로덕션 환경
    return 'https://api.careplus.com/api';
  }
};

const API_URL = getApiUrl();

console.log('API URL:', API_URL); // 디버깅용

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30초로 증가
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  async (config) => {
    // 디버깅용 로그
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Request Data:', config.data);

    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response.data;
  },
  async (error) => {
    console.error('API Error:', error.message);
    console.error('Error Config:', error.config);
    console.error('Error Response:', error.response?.data);

    if (error.response?.status === 401) {
      // 토큰 만료 처리
      await AsyncStorage.removeItem('authToken');
      // 로그인 화면으로 이동
    }

    // 네트워크 에러 메시지 개선
    if (error.message === 'Network Error') {
      error.message = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }

    return Promise.reject(error);
  }
);

export default api;