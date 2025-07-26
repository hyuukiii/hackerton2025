// src/screens/auth/RegisterScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  // 계정 정보
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 개인 정보 (실제 정보)
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 유효성 검사 상태
  const [isUserIdValid, setIsUserIdValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [userIdMessage, setUserIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const [loading, setLoading] = useState(false);

  // 아이디 중복 확인
  useEffect(() => {
    if (userId.length < 4) {
      setUserIdMessage('아이디는 4자 이상이어야 합니다.');
      setIsUserIdValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(userId)) {
      setUserIdMessage('아이디는 영문자와 숫자만 사용할 수 있습니다.');
      setIsUserIdValid(false);
      return;
    }

    // 실제로는 서버에 중복 확인 요청
    const checkDuplicate = async () => {
      // 임시로 성공 처리
      setUserIdMessage('사용 가능한 아이디입니다.');
      setIsUserIdValid(true);
    };

    const timer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordMessage('비밀번호가 일치하지 않습니다.');
        setIsPasswordValid(false);
      } else if (password.length < 6) {
        setPasswordMessage('비밀번호는 6자 이상이어야 합니다.');
        setIsPasswordValid(false);
      } else {
        setPasswordMessage('비밀번호가 일치합니다.');
        setIsPasswordValid(true);
      }
    } else {
      setPasswordMessage('');
      setIsPasswordValid(false);
    }
  }, [password, confirmPassword]);

  // 생년월일 포맷팅 (YY.MM.DD)
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

  // 전화번호 포맷팅
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

  const handleRegister = async () => {
    // 모든 필드 검증
    if (!userId || !password || !confirmPassword || !userName || !birthDate || !phoneNumber) {
      Alert.alert('오류', '모든 정보를 입력해주세요.');
      return;
    }

    if (!isUserIdValid) {
      Alert.alert('오류', '아이디를 확인해주세요.');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('오류', '비밀번호를 확인해주세요.');
      return;
    }

    const birthNumbers = birthDate.replace(/[^0-9]/g, '');
    if (birthNumbers.length !== 6) {
      Alert.alert('오류', '생년월일을 올바르게 입력해주세요. (예: 98.10.14)');
      return;
    }

    const phoneNumbers = phoneNumber.replace(/[^0-9]/g, '');
    if (phoneNumbers.length !== 11) {
      Alert.alert('오류', '휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 사용자 정보 저장
      const userInfo = {
        userId,
        password,
        userName,
        birthDate: birthNumbers,
        phoneNumber: phoneNumbers,
      };

      await AsyncStorage.setItem('tempUserInfo', JSON.stringify(userInfo));

      // 간편인증 화면으로 이동 (자동으로 정보 전달)
      navigation.navigate('SimpleAuth', {
        userId,
        password,
        userName,
        birthDate: birthNumbers,
        phoneNumber: phoneNumbers,
        isFromRegister: true, // 회원가입에서 왔음을 표시
      });
    } catch (error) {
      Alert.alert('오류', '다시 시도해주세요.');
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
          {/* 헤더 */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>
              간편인증을 위해 실제 정보를 입력해주세요
            </Text>

            {/* 계정 정보 섹션 */}
            <Text style={styles.sectionTitle}>계정 정보</Text>

            {/* 아이디 입력 */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="아이디"
                placeholderTextColor="#999"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
              />
              {userIdMessage ? (
                <Text style={[
                  styles.message,
                  isUserIdValid ? styles.validMessage : styles.errorMessage
                ]}>
                  {userIdMessage}
                </Text>
              ) : null}
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {passwordMessage ? (
                <Text style={[
                  styles.message,
                  isPasswordValid ? styles.validMessage : styles.errorMessage
                ]}>
                  {passwordMessage}
                </Text>
              ) : null}
            </View>

            {/* 개인 정보 섹션 */}
            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
              개인 정보 (간편인증용)
            </Text>

            {/* 이름 입력 */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="이름 (실명)"
                placeholderTextColor="#999"
                value={userName}
                onChangeText={setUserName}
              />
            </View>

            {/* 생년월일 입력 */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="생년월일 (예: 98.10.14)"
                placeholderTextColor="#999"
                value={birthDate}
                onChangeText={(text) => setBirthDate(formatBirthDate(text))}
                keyboardType="numeric"
                maxLength={8}
              />
            </View>

            {/* 전화번호 입력 */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="휴대폰 번호"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>

            {/* 안내 메시지 */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#667eea" />
              <Text style={styles.infoText}>
                간편인증을 위해 실제 정보가 필요합니다.{'\n'}
                입력하신 정보는 안전하게 보호됩니다.
              </Text>
            </View>

            {/* 확인 버튼 */}
            <TouchableOpacity
              style={[
                styles.button,
                (!isUserIdValid || !isPasswordValid || !userName || !birthDate || !phoneNumber || loading) && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={!isUserIdValid || !isPasswordValid || !userName || !birthDate || !phoneNumber || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '처리 중...' : '다음'}
              </Text>
            </TouchableOpacity>

            {/* 이미 계정이 있는 경우 */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>이미 계정이 있으신가요?</Text>
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
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  message: {
    marginTop: 8,
    marginLeft: 5,
    fontSize: 14,
  },
  errorMessage: {
    color: '#FF3B30',
  },
  validMessage: {
    color: '#007AFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#667eea',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#667eea',
    fontSize: 16,
  },
});

export default RegisterScreen;