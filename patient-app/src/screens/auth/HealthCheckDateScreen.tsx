// src/screens/auth/HealthCheckDateScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface HealthCheckDateScreenProps {
  navigation: any;
  route: {
    params: {
      authData: any;
      userInfo: any;
      healthData: any;
    };
  };
}

const HealthCheckDateScreen: React.FC<HealthCheckDateScreenProps> = ({ navigation, route }) => {
  const { authData, userInfo, healthData } = route.params;
  const [latestCheckupDate, setLatestCheckupDate] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('HealthCheckDateScreen - healthData:', healthData);
    parseLatestHealthCheckDate();
  }, [healthData]);

  const parseLatestHealthCheckDate = () => {
    try {
      console.log('=== 건강검진 날짜 파싱 시작 ===');
      //console.log('전체 healthData:', JSON.stringify(healthData, null, 2));
      //console.log('healthCheckupData:', healthData?.healthCheckupData);
      //console.log('ResultList:', healthData?.healthCheckupData?.ResultList);

      if (healthData?.healthCheckup?.ResultList && healthData.healthCheckup.ResultList.length > 0) {
        // 연도별로 정렬해서 가장 최근 검진 찾기
        const sortedCheckups = [...healthData.healthCheckupData.ResultList].sort((a, b) => {
          const yearA = parseInt(a.Year?.replace('년', '') || '0');
          const yearB = parseInt(b.Year?.replace('년', '') || '0');
          console.log(`정렬 비교: ${a.Year}(${yearA}) vs ${b.Year}(${yearB})`);
          return yearB - yearA; // 내림차순 정렬
        });

        // 가장 최근 검진 선택
        const latestCheckup = sortedCheckups[0];
        console.log('가장 최근 건강검진:', latestCheckup);

        // 날짜 포맷 변환
        const checkDate = latestCheckup.CheckUpDate ? latestCheckup.CheckUpDate.replace('/', '.') : '';
        const year = latestCheckup.Year ? latestCheckup.Year.replace('년', '') : '';

        const formattedDate = `${year}.${checkDate}`;
        console.log('포맷된 날짜:', formattedDate);

        setLatestCheckupDate(formattedDate);
        setHospitalName(latestCheckup.Location || '검진기관');
      } else {
        console.log('건강검진 데이터가 없습니다');
        setLatestCheckupDate('검진 기록 없음');
        setHospitalName('');
      }
    } catch (error) {
      console.error('건강검진 날짜 파싱 오류:', error);
      setLatestCheckupDate('정보 확인 불가');
      setHospitalName('');
    }
  };

  const handleNext = async () => {
    setLoading(true);

    try {
      // 최근 건강검진 정보 저장
      const checkupInfo = {
        date: latestCheckupDate,
        hospital: hospitalName,
      };
      await AsyncStorage.setItem('latestCheckupInfo', JSON.stringify(checkupInfo));

      // 복약 정보 기반 AI 기저질환 분석 요청
      let diseaseAnalysis;

      try {
        // 백엔드 API 호출 - 투약 데이터 기반 기저질환 분석
        const medicationData = healthData?.medicationData || {};
        console.log('기저질환 분석 요청 - medicationData:', medicationData);

        diseaseAnalysis = await api.post('/integrated/analyze-diseases', {
          medicationData: medicationData,
          userInfo: userInfo,
        });

        console.log('기저질환 분석 결과:', diseaseAnalysis);
      } catch (error) {
        console.error('기저질환 분석 API 오류:', error);

        // API 오류 시 기본값 설정
        diseaseAnalysis = {
          status: 'NO_DATA',
          message: '분석할 수 있는 복약 정보가 없습니다.',
          predictedDiseases: [],
          riskLevel: 'LOW',
        };
      }

      // 기저질환 분석 결과 저장
      await AsyncStorage.setItem('diseaseAnalysis', JSON.stringify(diseaseAnalysis));

      // 기저질환 정보 화면으로 이동
      navigation.navigate('DiseaseInfo', {
        authData,
        userInfo,
        healthData,
        selectedCheckupDate: checkupInfo,
        diseaseAnalysis,
      });

    } catch (error) {
      console.error('다음 단계 진행 오류:', error);
      Alert.alert('오류', '처리 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Care Plus<Text style={styles.plus}>+</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>최근 건강검진을 받으신 날이</Text>
            <View style={styles.dateHighlight}>
              <Text style={styles.highlightText}>
                {latestCheckupDate || '검진 기록 없음'}
              </Text>
            </View>
            <Text style={styles.subtitle}>
              {hospitalName || '이시네요'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              회원님의 건강정보가{'\n'}성공적으로 연동되었습니다.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '처리중...' : '다음으로'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
  },
  plus: {
    color: '#999',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 20,
  },
  dateHighlight: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  highlightText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  subtitle: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: '#B8B8D1',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HealthCheckDateScreen;