// src/services/api/index.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL 설정  할리스 난곡점: 172.30.1.33, 서울대 시흥 캠퍼스: 10.10.180.66, 현기 핫스팟: 192.0.0.2
const getApiUrl = () => {
if (__DEV__) {
    // 개발 환경
    if (Platform.OS === 'android') {
      // Android 에뮬레이터는 10.0.2.2 사용
      return 'http://10.0.2.2:8082/api';
    } else {
      // iOS 시뮬레이터나 실제 디바이스는 컴퓨터의 IP 주소 사용
      return 'http://192.0.0.2:8082/api';
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
  timeout: 90000, // 90초로 증가 (건강정보 API를 위해)
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

    // 건강정보 API는 더 긴 타임아웃 설정
    if (config.url?.includes('/integrated/health-data')) {
      config.timeout = 120000; // 2분
      console.log('건강정보 API 타임아웃 설정: 120초');
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
    console.log('API Response:', response.status, 'Data size:', JSON.stringify(response.data).length, 'bytes');
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

    // 타임아웃 에러 메시지 개선
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      error.message = '서버 응답 시간이 초과되었습니다. 데이터가 많아 처리에 시간이 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
    }

    // 네트워크 에러 메시지 개선
    if (error.message === 'Network Error') {
      error.message = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }

    return Promise.reject(error);
  }
);

export default api;