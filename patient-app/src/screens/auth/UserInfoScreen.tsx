// src/screens/auth/UserInfoScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface UserInfoScreenProps {
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

const UserInfoScreen: React.FC<UserInfoScreenProps> = ({ navigation, route }) => {
  const { authData, userName, birthDate, phoneNumber } = route.params;

  // 자동 입력 필드
  const [name] = useState(userName);
  const formatDisplayBirthDate = () => {
    // YYMMDD -> YYYY.MM.DD
    const year = parseInt(birthDate.substring(0, 2));
    const displayYear = year > 50 ? 1900 + year : 2000 + year;
    return `${displayYear}.${birthDate.substring(2, 4)}.${birthDate.substring(4, 6)}`;
  };
  const [displayBirthDate] = useState(formatDisplayBirthDate());
  const formatDisplayPhone = () => {
    // 01012345678 -> 010-1234-5678
    return `${phoneNumber.substring(0, 3)}-${phoneNumber.substring(3, 7)}-${phoneNumber.substring(7)}`;
  };
  const [displayPhone] = useState(formatDisplayPhone());

  // 수동 입력 필드
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
  };

  const handleSubmit = async () => {
    if (!gender || !height || !weight) {
      Alert.alert('알림', '모든 정보를 입력해주세요.');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('알림', '신장을 올바르게 입력해주세요. (100~250cm)');
      return;
    }

    if (weightNum < 30 || weightNum > 200) {
      Alert.alert('알림', '체중을 올바르게 입력해주세요. (30~200kg)');
      return;
    }

    setLoading(true);

    try {
      // 사용자 정보 저장
      const userInfo = {
        name,
        birthDate,
        phoneNumber,
        gender,
        height: heightNum,
        weight: weightNum,
      };

      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

      // 건강검진 데이터 조회 API 호출
      const healthData = await api.post('/integrated/health-data', authData);

      await AsyncStorage.setItem('healthData', JSON.stringify(healthData));

      // 건강검진 날짜 선택 화면으로 이동
      navigation.navigate('HealthCheckDate', {
        authData,
        userInfo,
        healthData,
      });

    } catch (error) {
      console.error('사용자 정보 저장 오류:', error);
      Alert.alert('오류', '정보 저장 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>
              사용하실 정보를{'\n'}입력해주세요.
            </Text>

            {/* 자동 입력된 필드들 */}
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>이름</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{name}</Text>
                </View>
              </View>

              <View style={styles.genderContainer}>
                <Text style={styles.label}>성별</Text>
                <View style={styles.genderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === '남성' && styles.genderButtonActive,
                    ]}
                    onPress={() => handleGenderSelect('남성')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === '남성' && styles.genderButtonTextActive,
                      ]}
                    >
                      남성
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === '여성' && styles.genderButtonActive,
                    ]}
                    onPress={() => handleGenderSelect('여성')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === '여성' && styles.genderButtonTextActive,
                      ]}
                    >
                      여성
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 신장/체중 입력 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>신장 / 체중</Text>
              <View style={styles.measureContainer}>
                <View style={styles.measureInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="170.3"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={styles.unit}>cm</Text>
                </View>
                <Text style={styles.separator}>/</Text>
                <View style={styles.measureInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="79.0"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                  <Text style={styles.unit}>kg</Text>
                </View>
              </View>
            </View>

            {/* 자동 입력된 필드들 */}
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>생년월일</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{displayBirthDate}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>연락처</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{displayPhone}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.notice}>
              인증서로 회원님의 정보를{'\n'}불러 왔습니다.{'\n'}
              수정이 필요한 경우에는{'\n'}직접 수정해주세요.
            </Text>

            {/* 다음 버튼 */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading || !gender || !height || !weight}
            >
              <Text style={styles.buttonText}>
                {loading ? '처리중...' : '다음으로'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 40,
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#333',
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  genderButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#666',
  },
  genderButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  measureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  measureInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 18,
  },
  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  separator: {
    fontSize: 18,
    color: '#999',
  },
  notice: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 30,
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

export default UserInfoScreen;