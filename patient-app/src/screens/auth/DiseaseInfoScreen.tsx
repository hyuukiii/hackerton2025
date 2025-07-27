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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DiseaseInfoScreenProps {
  navigation: any;
  route: {
    params: {
      authData: any;
      userInfo: any;
      healthData: any;
      checkupInfo: any;
      diseaseAnalysis: any;
    };
  };
}

const DiseaseInfoScreen: React.FC<DiseaseInfoScreenProps> = ({ navigation, route }) => {
  const { authData, userInfo, healthData, checkupInfo, diseaseAnalysis } = route.params;
  const [diseases, setDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('DiseaseInfoScreen - diseaseAnalysis:', diseaseAnalysis);
    parseDiseases();
  }, [diseaseAnalysis]);

  const parseDiseases = () => {
    if (diseaseAnalysis?.diseases && Array.isArray(diseaseAnalysis.diseases)) {
      setDiseases(diseaseAnalysis.diseases);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      // 사용자 정보 저장
      const userData = {
        ...userInfo,
        diseases: diseases,
        lastCheckupDate: checkupInfo?.date,
        lastCheckupHospital: checkupInfo?.hospital,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // AI 분석 질환을 별도로 저장 (병력 관리에서 사용)
      if (diseases.length > 0) {
        await AsyncStorage.setItem('aiAnalyzedDiseases', JSON.stringify(diseases));
      }

      // 회원가입 또는 로그인 완료 처리
      if (authData.isFromRegister) {
        // 회원가입 완료
        Alert.alert(
          '회원가입 완료',
          '회원가입이 성공적으로 완료되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'LoginSuccess' }],
                });
              },
            },
          ],
        );
      } else {
        // 로그인 완료
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginSuccess' }],
        });
      }
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      Alert.alert('오류', '정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseIcon = (disease: string) => {
    const iconMap: { [key: string]: string } = {
      '고혈압': 'heart-pulse',
      '당뇨병': 'water',
      '고지혈증': 'water-outline',
      '신부전': 'kidney',
      '간질환': 'stomach',
      '심장질환': 'heart',
      '폐질환': 'lungs',
      '뇌혈관질환': 'brain',
      '암': 'ribbon',
      '갑상선질환': 'neck-tie',
    };

    // 질병명에 포함된 키워드로 아이콘 찾기
    for (const [key, icon] of Object.entries(iconMap)) {
      if (disease.includes(key)) {
        return icon;
      }
    }
    return 'medical-bag'; // 기본 아이콘
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>건강 정보 분석 결과</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="shield-check" size={60} color="#4CAF50" />
          <Text style={styles.infoTitle}>AI 기반 건강 분석 완료</Text>
          <Text style={styles.infoDescription}>
            {userInfo.name}님의 복약 정보를 분석한 결과입니다.
          </Text>
        </View>

        {diseases.length > 0 ? (
          <View style={styles.diseaseSection}>
            <Text style={styles.sectionTitle}>추정 기저질환</Text>
            {diseases.map((disease, index) => (
              <View key={index} style={styles.diseaseItem}>
                <MaterialCommunityIcons
                  name={getDiseaseIcon(disease)}
                  size={24}
                  color="#667eea"
                />
                <Text style={styles.diseaseName}>{disease}</Text>
              </View>
            ))}
            <Text style={styles.disclaimer}>
              * 이 정보는 AI 분석 결과이며, 정확한 진단은 의료진과 상담하세요.
            </Text>
          </View>
        ) : (
          <View style={styles.noDiseaseSection}>
            <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.noDiseaseText}>
              현재 복약 정보에서 특별한 기저질환이 발견되지 않았습니다.
            </Text>
          </View>
        )}

        <View style={styles.checkupInfo}>
          <Text style={styles.checkupTitle}>최근 건강검진 정보</Text>
          <Text style={styles.checkupDate}>
            {checkupInfo?.date || '정보 없음'}
          </Text>
          {checkupInfo?.hospital && (
            <Text style={styles.checkupHospital}>{checkupInfo.hospital}</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? '처리 중...' : '확인'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  diseaseSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
  noDiseaseSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  noDiseaseText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  checkupInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkupTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  checkupDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checkupHospital: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DiseaseInfoScreen;