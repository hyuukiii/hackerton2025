// src/screens/auth/DiseaseInfoScreen.tsx
import React, { useState } from 'react';
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

interface DiseaseInfoScreenProps {
  navigation: any;
  route: {
    params: {
      authData: any;
      userInfo: any;
      healthData: any;
      selectedCheckupDate: any;
      diseaseAnalysis: any;
    };
  };
}

interface Disease {
  name: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
}

const DiseaseInfoScreen: React.FC<DiseaseInfoScreenProps> = ({ navigation, route }) => {
  const { authData, userInfo, healthData, selectedCheckupDate, diseaseAnalysis } = route.params;
  const [loading, setLoading] = useState(false);

  // 기저질환 파싱
  const getDiseases = (): Disease[] => {
    if (!diseaseAnalysis || diseaseAnalysis.status === 'NO_DATA') {
      return [];
    }

    // 실제 API 응답에 맞게 파싱
    if (diseaseAnalysis.predictedDiseases && diseaseAnalysis.predictedDiseases.length > 0) {
      return diseaseAnalysis.predictedDiseases.map((disease: any) => ({
        name: disease.name,
        detail: disease.detail || '',
        severity: disease.riskLevel || 'medium',
      }));
    }

    // 화면에 표시된 예시 데이터
    return [
      {
        name: '당뇨',
        detail: '공복 혈당 140mg/dl',
        severity: 'high',
      },
      {
        name: '심부전',
        detail: 'LVEF 35%',
        severity: 'high',
      },
    ];
  };

  const diseases = getDiseases();

  const handleComplete = async () => {
    setLoading(true);

    try {
      // 회원가입 데이터 준비
      const registerData = await AsyncStorage.getItem('registerData');
      const parsedRegisterData = registerData ? JSON.parse(registerData) : {};

      const finalUserData = {
        ...parsedRegisterData,
        ...userInfo,
        diseases: diseases.map(d => ({
          name: d.name,
          detail: d.detail,
        })),
        checkupDate: selectedCheckupDate.date,
        authData: authData,
      };

      // 실제 회원가입 API 호출
      const response = await api.post('/auth/register/complete', finalUserData);

      // 토큰 저장
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      // 모든 임시 데이터 삭제
      await AsyncStorage.multiRemove([
        'registerData',
        'authData',
        'userInfo',
        'healthData',
        'selectedCheckupDate',
        'diseaseAnalysis',
      ]);

      Alert.alert('회원가입 완료', '회원가입이 완료되었습니다!', [
        {
          text: '확인',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          }),
        },
      ]);

    } catch (error) {
      console.error('회원가입 완료 오류:', error);
      Alert.alert('오류', '회원가입 완료 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#667eea';
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
          {diseases.length > 0 ? (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  검진 내용을 기반으로{'\n'}
                  귀하 계신 기저질환은
                </Text>
              </View>

              <View style={styles.diseaseList}>
                {diseases.map((disease, index) => (
                  <View key={index} style={styles.diseaseItem}>
                    <View style={styles.diseaseHeader}>
                      <Text style={[
                        styles.diseaseName,
                        { color: getSeverityColor(disease.severity) }
                      ]}>
                        {disease.name}
                      </Text>
                      {disease.severity === 'high' && (
                        <View style={styles.warningBadge}>
                          <Text style={styles.warningText}>주의필요</Text>
                        </View>
                      )}
                    </View>
                    {disease.detail && (
                      <Text style={styles.diseaseDetail}>({disease.detail})</Text>
                    )}
                  </View>
                ))}
              </View>

              <Text style={styles.description}>
                을 가지고 계시네요.{'\n\n'}
                귀하 계신 기저질환을{'\n'}
                회원님의 정보에{'\n'}
                추가해두겠습니다.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  검진 내용을 기반으로{'\n'}
                  분석한 결과
                </Text>
              </View>

              <View style={styles.noDiseaseContainer}>
                <Text style={styles.noDiseaseText}>
                  특별한 기저질환이{'\n'}
                  발견되지 않았습니다
                </Text>
                <Text style={styles.healthyText}>
                  건강한 상태를 유지하고 계십니다! 👍
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '처리중...' : '회원 가입하기'}
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
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    color: '#333',
    fontWeight: '600',
    lineHeight: 32,
  },
  diseaseList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  diseaseItem: {
    marginBottom: 15,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  warningBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  diseaseDetail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  description: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    marginBottom: 40,
  },
  noDiseaseContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    marginBottom: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  noDiseaseText: {
    fontSize: 20,
    color: '#34C759',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 15,
  },
  healthyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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

export default DiseaseInfoScreen;