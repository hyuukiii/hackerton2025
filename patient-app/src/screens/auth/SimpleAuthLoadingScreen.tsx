// src/screens/auth/SimpleAuthLoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface SimpleAuthLoadingScreenProps {
  navigation: any;
  route: {
    params: {
      authData: any;
      userName: string;
      birthDate: string;
      phoneNumber: string;
    };
  };
}

const SimpleAuthLoadingScreen: React.FC<SimpleAuthLoadingScreenProps> = ({
  navigation,
  route
}) => {
  const { authData, userName, birthDate, phoneNumber } = route.params;
  const [status, setStatus] = useState('건강정보를 받아오는 중...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      console.log('건강정보 조회 시작');
      console.log('authData:', authData);

      // 프로그레스 애니메이션
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // 1. 백엔드 통합 API 호출
      setStatus('건강보험공단에서 정보를 조회하는 중...');

      const integratedResponse = await api.post('/integrated/health-data', authData);

      console.log('통합 API 응답:', integratedResponse);

      clearInterval(progressInterval);
      setProgress(100);

      if (!integratedResponse || integratedResponse.status !== 'SUCCESS') {
        throw new Error(integratedResponse?.message || '건강정보 조회 실패');
      }

      // 2. 건강정보 파싱 및 정리
      setStatus('건강정보를 분석하는 중...');

      const healthData = {
        // 기본 정보
        name: userName,
        birthDate: birthDate,
        phoneNumber: phoneNumber,

        // 건강검진 데이터 파싱
        healthCheckup: integratedResponse.healthCheckupData || {},

        // 투약 데이터 파싱
        medications: integratedResponse.medicationData || {},

        // 신체 정보 (건강검진 데이터에서 추출)
        height: extractHealthValue(integratedResponse.healthCheckupData, 'height'),
        weight: extractHealthValue(integratedResponse.healthCheckupData, 'weight'),

        // 신기능 정보 (중요!)
        kidneyFunction: {
          creatinine: extractHealthValue(integratedResponse.healthCheckupData, 'creatinine'),
          eGFR: extractHealthValue(integratedResponse.healthCheckupData, 'eGFR'),
          stage: calculateCKDStage(extractHealthValue(integratedResponse.healthCheckupData, 'eGFR')),
          description: getCKDDescription(extractHealthValue(integratedResponse.healthCheckupData, 'eGFR')),
        },

        // 투석 여부 (투약내역에서 확인)
        dialysis: checkDialysisFromMedications(integratedResponse.medicationData),

        // 기저질환 (투약내역에서 추출)
        medicalHistory: extractDiseasesFromMedications(integratedResponse.medicationData),

        // 최근 검사 결과
        recentTests: {
          bloodPressure: extractHealthValue(integratedResponse.healthCheckupData, 'bloodPressure'),
          bloodSugar: extractHealthValue(integratedResponse.healthCheckupData, 'bloodSugar'),
          lastCheckup: extractHealthValue(integratedResponse.healthCheckupData, 'checkupDate'),
        },

        // 원본 데이터 (필요시 참조용)
        rawData: integratedResponse,
      };

      // 3. 데이터 저장
      setStatus('정보를 저장하는 중...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // 건강정보 저장
      await AsyncStorage.setItem('healthData', JSON.stringify(healthData));

      // 회원가입 데이터와 병합
      const registerDataStr = await AsyncStorage.getItem('registerData');
      const registerData = registerDataStr ? JSON.parse(registerDataStr) : {};

      const finalUserData = {
        ...registerData,
        healthInfo: healthData,
      };

      // 최종 사용자 데이터 저장
      await AsyncStorage.setItem('userData', JSON.stringify(finalUserData));

      // 성공 화면으로 이동
      navigation.replace('SimpleAuthSuccess', {
        healthData: healthData,
      });

    } catch (error: any) {
      console.error('건강정보 조회 오류:', error);

      let errorMessage = '건강정보를 가져오는 중 오류가 발생했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        '오류',
        errorMessage,
        [
          {
            text: '다시 시도',
            onPress: () => fetchHealthData(),
          },
          {
            text: '취소',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };

  // 건강검진 데이터에서 값 추출 헬퍼 함수
  const extractHealthValue = (healthData: any, key: string): any => {
    if (!healthData) return null;

    // Tilko API 응답 구조에 따라 파싱
    // 실제 응답 구조를 보고 수정 필요
    if (Array.isArray(healthData)) {
      // 최신 검진 결과 찾기
      const latest = healthData[0];
      return latest?.[key] || null;
    }

    return healthData[key] || null;
  };

  // 투약내역에서 투석 여부 확인
  const checkDialysisFromMedications = (medicationData: any): boolean => {
    if (!medicationData) return false;

    // 투석 관련 약물이나 처치 확인
    const dialysisKeywords = ['투석', '혈액투석', '복막투석', 'dialysis'];

    if (Array.isArray(medicationData)) {
      return medicationData.some((med: any) =>
        dialysisKeywords.some(keyword =>
          med.name?.includes(keyword) ||
          med.description?.includes(keyword)
        )
      );
    }

    return false;
  };

  // 투약내역에서 기저질환 추출
  const extractDiseasesFromMedications = (medicationData: any): any[] => {
    if (!medicationData || !Array.isArray(medicationData)) return [];

    const diseases = new Map();

    // 약물로부터 질환 추론
    medicationData.forEach((med: any) => {
      // 고혈압약
      if (med.name?.includes('암로디핀') ||
          med.name?.includes('로사르탄') ||
          med.name?.includes('텔미사르탄')) {
        diseases.set('hypertension', {
          id: 1,
          name: '고혈압',
          medications: [med.name],
        });
      }

      // 당뇨약
      if (med.name?.includes('메트포르민') ||
          med.name?.includes('글리메피리드') ||
          med.name?.includes('시타글립틴')) {
        diseases.set('diabetes', {
          id: 2,
          name: '당뇨병',
          medications: [med.name],
        });
      }

      // 추가 질환 매핑...
    });

    return Array.from(diseases.values());
  };

  // CKD Stage 계산
  const calculateCKDStage = (eGFR: number | null): number => {
    if (!eGFR) return 0;
    if (eGFR >= 90) return 1;
    if (eGFR >= 60) return 2;
    if (eGFR >= 30) return 3;
    if (eGFR >= 15) return 4;
    return 5;
  };

  // CKD 설명
  const getCKDDescription = (eGFR: number | null): string => {
    if (!eGFR) return '신기능 정보 없음';
    if (eGFR >= 90) return '정상 신기능';
    if (eGFR >= 60) return '경미한 신기능 저하';
    if (eGFR >= 30) return '중등도 신기능 저하';
    if (eGFR >= 15) return '중증 신기능 저하';
    return '말기 신부전';
  };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          Care Plus<Text style={styles.plus}>+</Text>
        </Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.statusText}>{status}</Text>

          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>

          <Text style={styles.subText}>
            안전하게 암호화된 통신으로{'\n'}
            건강보험공단에서 정보를 가져옵니다
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 조회 중인 정보</Text>
          <Text style={styles.infoItem}>• 신장, 체중 (건강검진)</Text>
          <Text style={styles.infoItem}>• 신기능 검사 결과 (크레아티닌, eGFR)</Text>
          <Text style={styles.infoItem}>• 투석 여부 (진료내역)</Text>
          <Text style={styles.infoItem}>• 기저질환 정보 (진료내역)</Text>
          <Text style={styles.infoItem}>• 현재 복용 중인 약물 (투약내역)</Text>
        </View>

        <Text style={styles.notice}>
          ※ 개인정보는 안전하게 보호됩니다
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 60,
  },
  plus: {
    color: '#C7D2FE',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 20,
    fontWeight: '600',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  subText: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginTop: 40,
  },
  infoTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 6,
  },
  notice: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 40,
  },
});

export default SimpleAuthLoadingScreen;