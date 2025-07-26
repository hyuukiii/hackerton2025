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
  ActivityIndicator,
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
    const numbers = text.replace(/[^0-9]/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 6)}`;
    }
  };

  const formatPhoneNumber = (text: string) => {
    const numbers = text.replace(/[^0-9]/g, '');
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

    const birthNumbers = birthDate.replace(/[^0-9]/g, '');
    if (birthNumbers.length !== 6) {
      Alert.alert('알림', '생년월일을 올바르게 입력해주세요. (예: 00.01.01)');
      return;
    }

    const phoneNumbers = phoneNumber.replace(/[^0-9]/g, '');
    if (phoneNumbers.length !== 11) {
      Alert.alert('알림', '휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    setModalVisible(false);

    try {
      // 1. 백엔드 간편인증 요청 API 호출
      console.log('간편인증 요청 시작');
      const authResponse = await api.post('/auth/request', {
        userName,
        birthDate: birthNumbers,
        userCellphoneNumber: phoneNumbers,
      });

      console.log('간편인증 응답:', authResponse);

      // 2. 응답 확인 및 처리
      if (!authResponse) {
        throw new Error('간편인증 요청 실패');
      }

      console.log('간편인증 성공:', authResponse);

      // 3. 인증 정보 저장
      await AsyncStorage.setItem('authData', JSON.stringify(authResponse));
      await AsyncStorage.setItem('registerData', JSON.stringify({
        userId,
        password,
        authMethod,
        userName,
        birthDate: birthNumbers,
        phoneNumber: phoneNumbers,
      }));

      // 4. Tilko API는 바로 인증 완료 후 다음 단계로 진행
      console.log('간편인증 완료, 건강정보 조회 화면으로 이동');

      // 인증 완료 후 건강정보 조회를 위한 통합 API 호출
      navigation.navigate('SimpleAuthLoading', {
        authData: authResponse,
        userName,
        birthDate: birthNumbers,
        phoneNumber: phoneNumbers,
      });

    } catch (error: any) {
      console.error('간편인증 오류:', error);

      let errorMessage = '간편인증 요청 중 오류가 발생했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('인증 실패', errorMessage);
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
              disabled={loading}
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

        <Text style={styles.notice}>
          ※ 건강보험공단 간편인증을 통해 건강정보를 조회합니다
        </Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>간편인증 정보 입력</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {authMethod === 'kakao' && '카카오'}
              {authMethod === 'naver' && '네이버'}
              {authMethod === 'pass' && '디지털원패스'}
              {' '}인증을 위해 아래 정보를 입력해주세요
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="홍길동"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>생년월일 (6자리)</Text>
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={(text) => setBirthDate(formatBirthDate(text))}
                placeholder="00.01.01"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={8}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>휴대폰 번호</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                placeholder="010-1234-5678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSimpleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>인증하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 로딩 오버레이 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>간편인증 처리 중...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366F1',
    textAlign: 'center',
    marginBottom: 40,
  },
  plus: {
    color: '#9CA3AF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  authGrid: {
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  authIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  authText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notice: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1F2937',
    marginTop: 16,
  },
});

export default SimpleAuthScreen;