// src/screens/auth/SimpleAuthLoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
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
      authMethod: string;
    };
  };
}

const SimpleAuthLoadingScreen: React.FC<SimpleAuthLoadingScreenProps> = ({
  navigation,
  route
}) => {
  const { authData, userName, birthDate, phoneNumber, authMethod } = route.params;
  const [status, setStatus] = useState('간편인증을 진행해주세요');
  const [progress, setProgress] = useState(0);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 인증 방법별 정보 가져오기
     const getAuthInfo = (method: string) => {
        switch (method) {
          case 'kakao':
            return {
              name: '카카오톡',
              icon: '💬',
              color: '#FEE500',
              textColor: '#000',
              description: '카카오톡 지갑에서',
              subDescription: '카카오톡 앱을 열고 지갑에서',
            };
          case 'payko':
            return {
              name: '페이코',
              icon: '💳',
              color: '#FF1744',
              textColor: '#FFF',
              description: '페이코 앱에서',
              subDescription: '페이코 앱을 열고 인증 알림에서',
            };
          case 'kukmin':
            return {
              name: 'KB국민은행',
              icon: '🏦',
              color: '#FFB300',
              textColor: '#000',
              description: 'KB스타뱅킹에서',
              subDescription: 'KB스타뱅킹 앱을 열고 인증센터에서',
            };
          case 'samsung':
            return {
              name: '삼성패스',
              icon: '📱',
              color: '#1565C0',
              textColor: '#FFF',
              description: '삼성패스에서',
              subDescription: '삼성패스 앱을 열고 인증 요청에서',
            };
          case 'pass':
            return {
              name: '통신사패스',
              icon: '📡',
              color: '#4527A0',
              textColor: '#FFF',
              description: 'PASS 앱에서',
              subDescription: 'PASS 앱을 열고 인증 알림에서',
            };
          case 'shinhan':
            return {
              name: '신한',
              icon: '💎',
              color: '#0288D1',
              textColor: '#FFF',
              description: '신한SOL에서',
              subDescription: '신한SOL 앱을 열고 인증센터에서',
            };
          case 'naver':
            return {
              name: '네이버',
              icon: 'N',
              color: '#03C75A',
              textColor: '#FFF',
              description: '네이버 앱에서',
              subDescription: '네이버 앱을 열고 인증 알림에서',
            };
          default:
            return {
              name: '간편인증',
              icon: '🔐',
              color: '#667eea',
              textColor: '#FFF',
              description: '인증 앱에서',
              subDescription: '인증 앱을 열고',
            };
        }
      };

  const authInfo = getAuthInfo(authMethod);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
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
            onPress: () => {
              setIsWaitingForAuth(true);
              setIsLoading(false);
              setProgress(0);
            },
          },
          {
            text: '취소',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 건강검진 데이터에서 값 추출 헬퍼 함수
  const extractHealthValue = (healthData: any, key: string): any => {
    if (!healthData) return null;

    // Tilko API 응답 구조에 따라 파싱
    if (Array.isArray(healthData)) {
      const latest = healthData[0];
      return latest?.[key] || null;
    }

    return healthData[key] || null;
  };

  // 투약내역에서 투석 여부 확인
  const checkDialysisFromMedications = (medicationData: any): boolean => {
    if (!medicationData) return false;

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
    if (!eGFR) return '정보 없음';
    if (eGFR >= 90) return '정상 또는 경미한 손상';
    if (eGFR >= 60) return '경도 감소';
    if (eGFR >= 30) return '중등도 감소';
    if (eGFR >= 15) return '중증 감소';
    return '신부전';
  };

  // 인증 대기 화면
  // 인증 대기 화면
    if (isWaitingForAuth && !isLoading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: authInfo.color }]}>
          <View style={styles.content}>
            <Text style={[styles.logo, { color: authInfo.textColor }]}>
              Care Plus<Text style={[styles.plus, { color: authInfo.textColor, opacity: 0.7 }]}>+</Text>
            </Text>

            <View style={styles.authWaitingContainer}>
              <View style={[styles.authIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Text style={styles.authIcon}>{authInfo.icon}</Text>
              </View>

              <Text style={[styles.waitingTitle, { color: authInfo.textColor }]}>
                {authInfo.description}{'\n'}인증을 진행해주세요
              </Text>

              <Text style={[styles.waitingSubText, { color: authInfo.textColor, opacity: 0.8 }]}>
                {authInfo.subDescription}{'\n'}간편인증을 완료해주세요
              </Text>

              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: authInfo.textColor === '#FFF' ? '#FFF' : 'rgba(0,0,0,0.1)' }]}
                onPress={() => {
                  setIsWaitingForAuth(false);
                  fetchHealthData();
                }}
              >
                <Text style={[styles.completeButtonText, { color: authInfo.color }]}>
                  인증을 완료했습니다
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.cancelButtonText, { color: authInfo.textColor, opacity: 0.8 }]}>
                  취소
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.notice, { color: authInfo.textColor, opacity: 0.6 }]}>
              ※ 2분 이내에 인증을 완료해주세요
            </Text>
          </View>
        </SafeAreaView>
      );
    }


  // 건강정보 조회 중 화면
  return (
     <SafeAreaView style={[styles.container, { backgroundColor: authInfo.color }]}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          Care Plus<Text style={styles.plus}>+</Text>
        </Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.statusText}>{status}</Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]}
            />
          </View>

          <Text style={styles.subText}>
            잠시만 기다려주세요{'\n'}
            건강정보를 안전하게 가져오고 있습니다
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>조회중인 정보</Text>
          <Text style={styles.infoItem}>• 최근 건강검진 결과</Text>
          <Text style={styles.infoItem}>• 신기능 검사 결과 (크레아티닌, eGFR)</Text>
          <Text style={styles.infoItem}>• 기저질환 정보 (고혈압, 당뇨 등)</Text>
          <Text style={styles.infoItem}>• 복용 중인 약물 (투약내역)</Text>
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
  // 인증 대기 화면 스타일
  authWaitingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  kakaoIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FEE500',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  kakaoIcon: {
    fontSize: 40,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  waitingSubText: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  completeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 280,
  },
  completeButtonText: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: '#E0E7FF',
    fontSize: 16,
    textAlign: 'center',
  },
  // 로딩 화면 스타일
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