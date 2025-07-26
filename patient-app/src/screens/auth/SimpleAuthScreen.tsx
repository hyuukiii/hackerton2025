// src/screens/auth/SimpleAuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface SimpleAuthScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
      password: string;
    };
  };
}

const SimpleAuthScreen: React.FC<SimpleAuthScreenProps> = ({ navigation, route }) => {
  const { userId, password } = route.params;
  const [authMethod, setAuthMethod] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const authMethods = [
    { id: 'kakao', name: '카카오인증', icon: 'K', color: '#FEE500', textColor: '#000' },
    { id: 'naver', name: '네이버인증', icon: 'N', color: '#03C75A', textColor: '#FFF' },
    { id: 'pass', name: '디지털원패스', icon: '🏛️', color: '#1E3A8A', textColor: '#FFF' },
  ];

  const handleAuthSelect = (method: string) => {
    setAuthMethod(method);
    setModalVisible(true);
  };

  const formatBirthDate = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');

    // YYMMDD 형식으로 포맷팅
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 6)}`;
    }
  };

  const formatPhoneNumber = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');

    // 010-XXXX-XXXX 형식으로 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleSimpleAuth = async () => {
    if (!userName || !birthDate || !phoneNumber) {
      Alert.alert('알림', '모든 정보를 입력해주세요.');
      return;
    }

    // 생년월일 검증 (6자리)
    const birthNumbers = birthDate.replace(/[^0-9]/g, '');
    if (birthNumbers.length !== 6) {
      Alert.alert('알림', '생년월일을 올바르게 입력해주세요. (예: 00.01.01)');
      return;
    }

    // 전화번호 검증 (11자리)
    const phoneNumbers = phoneNumber.replace(/[^0-9]/g, '');
    if (phoneNumbers.length !== 11) {
      Alert.alert('알림', '휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    setModalVisible(false);

    try {
      // 1. 회원가입 처리
      await AsyncStorage.setItem('registerData', JSON.stringify({
        userId,
        password,
        authMethod,
      }));

      // 2. 간편인증 API 호출
      const authResponse = await api.post('/auth/request', {
        userName,
        birthDate: birthNumbers, // YYMMDD 형식
        userCellphoneNumber: phoneNumbers, // 01012345678 형식
      });

      // 3. 인증 데이터 저장
      await AsyncStorage.setItem('authData', JSON.stringify(authResponse));

      // 4. 간편인증 로딩 화면으로 이동
      navigation.navigate('SimpleAuthLoading', {
        authData: authResponse,
        userName,
        birthDate: birthNumbers,
        phoneNumber: phoneNumbers,
      });

    } catch (error: any) {
      console.error('간편인증 오류:', error);
      Alert.alert('인증 실패', '간편인증 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.logo}>
          Care Plus<Text style={styles.plus}>+</Text>
        </Text>

        <Text style={styles.title}>
          사용자의 건강정보를{'\n'}받아올게요!
        </Text>

        <Text style={styles.subtitle}>간편인증하기</Text>

        <View style={styles.authGrid}>
          {authMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.authButton, { backgroundColor: method.color }]}
              onPress={() => handleAuthSelect(method.id)}
            >
              <Text style={[styles.authIcon, { color: method.textColor }]}>
                {method.icon}
              </Text>
              <Text style={[styles.authText, { color: method.textColor }]}>
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 간편인증 정보 입력 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>간편인증 정보 입력</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="홍길동"
                value={userName}
                onChangeText={setUserName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>생년월일 (6자리)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="00.01.01"
                value={birthDate}
                onChangeText={(text) => setBirthDate(formatBirthDate(text))}
                keyboardType="numeric"
                maxLength={8} // 00.00.00
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>휴대폰 번호</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                keyboardType="numeric"
                maxLength={13} // 010-0000-0000
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSimpleAuth}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? '처리중...' : '인증하기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 40,
  },
  plus: {
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  authGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  authButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authIcon: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#667eea',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimpleAuthScreen;