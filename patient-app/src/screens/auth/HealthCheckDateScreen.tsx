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

interface HealthCheckDate {
  date: string;
  hospital: string;
  isSelected: boolean;
}

const HealthCheckDateScreen: React.FC<HealthCheckDateScreenProps> = ({ navigation, route }) => {
  const { authData, userInfo, healthData } = route.params;
  const [checkDates, setCheckDates] = useState<HealthCheckDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<HealthCheckDate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 건강검진 날짜 파싱 (실제 API 응답에 맞게 수정 필요)
    const mockDates: HealthCheckDate[] = [
      {
        date: '2023.07.26',
        hospital: '이시네요',
        isSelected: false,
      },
      {
        date: '2022.05.15',
        hospital: '서울대학교병원',
        isSelected: false,
      },
      {
        date: '2021.03.10',
        hospital: '삼성서울병원',
        isSelected: false,
      },
    ];

    // 실제로는 healthData에서 파싱
    if (healthData && healthData.checkupHistory) {
      // API 응답 구조에 맞게 파싱
      const parsedDates = healthData.checkupHistory.map((item: any) => ({
        date: item.checkupDate,
        hospital: item.hospitalName,
        isSelected: false,
      }));
      setCheckDates(parsedDates);
    } else {
      // 테스트용 더미 데이터
      setCheckDates(mockDates);
    }
  }, [healthData]);

  const handleDateSelect = (index: number) => {
    const updatedDates = checkDates.map((date, i) => ({
      ...date,
      isSelected: i === index,
    }));
    setCheckDates(updatedDates);
    setSelectedDate(updatedDates[index]);
  };

  const handleNext = async () => {
    if (!selectedDate) {
      Alert.alert('알림', '건강검진 날짜를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 선택된 건강검진 날짜 저장
      await AsyncStorage.setItem('selectedCheckupDate', JSON.stringify(selectedDate));

      // 복약 정보 기반 AI 기저질환 분석 요청
      const medicationData = healthData?.medicationData || [];
      const diseaseAnalysis = await api.post('/integrated/analyze-diseases', medicationData);

      await AsyncStorage.setItem('diseaseAnalysis', JSON.stringify(diseaseAnalysis));

      // 기저질환 정보 화면으로 이동
      navigation.navigate('DiseaseInfo', {
        authData,
        userInfo,
        healthData,
        selectedCheckupDate: selectedDate,
        diseaseAnalysis,
      });

    } catch (error) {
      console.error('기저질환 분석 오류:', error);

      // 오류 시에도 다음 화면으로 이동 (기저질환 없음으로 표시)
      const emptyAnalysis = {
        status: 'NO_DATA',
        message: '분석할 수 있는 복약 정보가 없습니다.',
        predictedDiseases: [],
        riskLevel: 'LOW',
      };

      navigation.navigate('DiseaseInfo', {
        authData,
        userInfo,
        healthData,
        selectedCheckupDate: selectedDate,
        diseaseAnalysis: emptyAnalysis,
      });
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
            <Text style={styles.title}>최근 검강검진을 받으신 날이</Text>
            <View style={styles.dateHighlight}>
              <Text style={styles.highlightText}>
                {checkDates.length > 0 ? checkDates[0].date : '2023.07.26'}
              </Text>
            </View>
            <Text style={styles.title}>{checkDates.length > 0 ? checkDates[0].hospital : '이시네요'}</Text>
          </View>

          <View style={styles.dateList}>
            {checkDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateItem,
                  date.isSelected && styles.dateItemSelected,
                ]}
                onPress={() => handleDateSelect(index)}
              >
                <View style={styles.dateInfo}>
                  <Text style={[
                    styles.dateText,
                    date.isSelected && styles.dateTextSelected,
                  ]}>
                    {date.date}
                  </Text>
                  <Text style={[
                    styles.hospitalText,
                    date.isSelected && styles.hospitalTextSelected,
                  ]}>
                    {date.hospital}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  date.isSelected && styles.radioButtonSelected,
                ]}>
                  {date.isSelected && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading || !selectedDate}
          >
            <Text style={styles.buttonText}>
              {loading ? '분석중...' : '다음으로'}
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
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
    lineHeight: 28,
  },
  dateHighlight: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  highlightText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  dateList: {
    marginBottom: 40,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateItemSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  dateTextSelected: {
    color: '#667eea',
  },
  hospitalText: {
    fontSize: 14,
    color: '#666',
  },
  hospitalTextSelected: {
    color: '#667eea',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#667eea',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
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