// src/screens/auth/DiseaseInfoScreen.tsx
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
  const [diseases, setDiseases] = useState<Disease[]>([]);

  useEffect(() => {
    console.log('DiseaseInfoScreen - diseaseAnalysis:', diseaseAnalysis);
    parseDiseases();
  }, [diseaseAnalysis]);

  // 기저질환 파싱
  const parseDiseases = () => {
    if (!diseaseAnalysis || diseaseAnalysis.status === 'NO_DATA') {
      setDiseases([]);
      return;
    }

    // 실제 API 응답에 맞게 파싱
    if (diseaseAnalysis.predictedDiseases && diseaseAnalysis.predictedDiseases.length > 0) {
      const parsed = diseaseAnalysis.predictedDiseases.map((disease: any) => ({
        name: disease.name || disease.diseaseName,
        detail: disease.detail || disease.reason || '',
        severity: disease.riskLevel?.toLowerCase() || disease.severity || 'medium',
      }));
      setDiseases(parsed);
    } else if (diseaseAnalysis.diseases) {
      // 다른 응답 형식 처리
      const parsed = diseaseAnalysis.diseases.map((disease: any) => ({
        name: disease.name,
        detail: disease.description || '',
        severity: disease.riskLevel?.toLowerCase() || 'medium',
      }));
      setDiseases(parsed);
    } else {
      setDiseases([]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 저장된 데이터들 가져오기
      const [registerData, authData, userInfo, selectedCheckupDate] = await Promise.all([
        AsyncStorage.getItem('registerData'),
        AsyncStorage.getItem('authData'),
        AsyncStorage.getItem('userInfo'),
        AsyncStorage.getItem('selectedCheckupDate'),
      ]);

      const parsedRegisterData = registerData ? JSON.parse(registerData) : {};
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : {};

      const finalUserData = {
        ...parsedRegisterData,
        ...parsedUserInfo,
        diseases: diseases.map(d => ({
          name: d.name,
          detail: d.detail,
        })),
        checkupDate: selectedCheckupDate ? JSON.parse(selectedCheckupDate).date : '검진 기록 없음',
        authData: authData ? JSON.parse(authData) : null,
      };

      // 실제 회원가입 API 호출
      console.log('회원가입 완료 요청:', finalUserData);

      try {
        const response = await api.post('/auth/register/complete', finalUserData);

        // 성공 응답 처리
        if (response.data) {
          // 토큰 저장
          if (response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
          }

          // 사용자 정보 저장 (HomeScreen에서 사용)
          if (response.data.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
          } else {
            // 백엔드에서 user 정보가 없는 경우 프론트엔드 데이터로 저장
            const userData = {
              userId: finalUserData.userId,
              name: finalUserData.userName || finalUserData.name,
              phoneNumber: finalUserData.phoneNumber,
              birthDate: finalUserData.birthDate,
            };
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          }

          // 로그인 상태 저장
          await AsyncStorage.setItem('isLoggedIn', 'true');

          // 모든 임시 데이터 삭제
          await AsyncStorage.multiRemove([
            'registerData',
            'authData',
            'userInfo',
            'healthData',
            'selectedCheckupDate',
            'diseaseAnalysis',
            'latestCheckupInfo',
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
        }
      } catch (error: any) {
        console.error('회원가입 완료 오류:', error);

        // 임시 처리 - 백엔드 API가 아직 준비되지 않은 경우
        if (error.response?.status === 404 || error.message.includes('404')) {
          // 임시로 회원가입 완료 처리
          await AsyncStorage.setItem('authToken', 'temp-token');
          await AsyncStorage.setItem('isLoggedIn', 'true');

          // 사용자 정보도 저장 (HomeScreen에서 표시용)
          const userData = {
            userId: finalUserData.userId,
            name: finalUserData.userName || finalUserData.name,
            phoneNumber: finalUserData.phoneNumber,
            birthDate: finalUserData.birthDate,
          };
          await AsyncStorage.setItem('userData', JSON.stringify(userData));

          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          Alert.alert('오류', '회원가입 완료 중 문제가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('데이터 처리 오류:', error);
      Alert.alert('오류', '데이터 처리 중 문제가 발생했습니다.');
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
                  복용 약물을 기반으로{'\n'}
                  AI가 분석한 결과
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
                      <Text style={styles.diseaseDetail}>{disease.detail}</Text>
                    )}
                  </View>
                ))}
              </View>

              <Text style={styles.description}>
                위 기저질환이 의심됩니다.{'\n\n'}
                정확한 진단은 의사와 상담하시기 바랍니다.{'\n'}
                회원님의 건강 정보에 추가하겠습니다.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  복용 약물을 기반으로{'\n'}
                  AI가 분석한 결과
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
    marginTop: 20,
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  diseaseItem: {
    borderBottomWidth: 0,
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
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 40,
    textAlign: 'center',
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