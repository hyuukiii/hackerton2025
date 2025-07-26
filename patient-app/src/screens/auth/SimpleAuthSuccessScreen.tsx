// src/screens/auth/SimpleAuthSuccessScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SimpleAuthSuccessScreenProps {
  navigation: any;
  route: {
    params: {
      healthData: any;
    };
  };
}

const SimpleAuthSuccessScreen: React.FC<SimpleAuthSuccessScreenProps> = ({
  navigation,
  route
}) => {
  const { healthData } = route.params || {};

  useEffect(() => {
    console.log('SimpleAuthSuccessScreen 마운트됨');
    console.log('건강데이터:', healthData);
  }, []);

  const handleContinue = async () => {
    try {
      // registerData에서 기본 정보 가져오기
      const registerDataStr = await AsyncStorage.getItem('registerData');
      const registerData = registerDataStr ? JSON.parse(registerDataStr) : {};

      // authData 가져오기
      const authDataStr = await AsyncStorage.getItem('authData');
      const authData = authDataStr ? JSON.parse(authDataStr) : {};

      console.log('UserInfoScreen으로 이동 - registerData:', registerData);
      console.log('UserInfoScreen으로 이동 - authData:', authData);

      // UserInfoScreen으로 이동
      navigation.navigate('UserInfo', {
        authData: authData,
        userName: registerData.userName || healthData.name,
        birthDate: registerData.birthDate, // 6자리 형식 (981014)
        phoneNumber: registerData.phoneNumber,
      });
    } catch (error) {
      console.error('다음 화면 이동 오류:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#6366F1" />
          </View>

          <Text style={styles.title}>
            건강정보를{'\n'}성공적으로 받아왔습니다!
          </Text>

          <Text style={styles.subtitle}>
            회원가입이 완료되었습니다
          </Text>

          {healthData && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>확인된 정보</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이름:</Text>
                <Text style={styles.infoValue}>{healthData.name || '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>생년월일:</Text>
                <Text style={styles.infoValue}>
                  {healthData.birthDate ?
                    `${healthData.birthDate.substring(0, 2)}.${healthData.birthDate.substring(2, 4)}.${healthData.birthDate.substring(4, 6)}`
                    : '-'}
                </Text>
              </View>

              {healthData.healthCheckup && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.infoSubtitle}>최근 건강검진</Text>
                  <Text style={styles.infoText}>
                    • 검진 데이터가 확인되었습니다
                  </Text>
                </>
              )}

              {healthData.medications && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.infoSubtitle}>복용 약물</Text>
                  <Text style={styles.infoText}>
                    • 투약 내역이 확인되었습니다
                  </Text>
                </>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>시작하기</Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SimpleAuthSuccessScreen;