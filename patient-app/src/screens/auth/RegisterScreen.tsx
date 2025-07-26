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
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userIdMessage, setUserIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUserIdValid, setIsUserIdValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // 아이디 중복 검사
  const checkUserId = async () => {
    if (!userId || userId.length < 4) {
      setUserIdMessage('아이디는 4자 이상이어야 합니다.');
      setIsUserIdValid(false);
      return;
    }

    try {
      // 백엔드 API 호출 (임시 처리)
      // const response = await api.post('/auth/check-id', { userId });

      // 임시로 'test'가 이미 존재하는 아이디라고 가정
      if (userId.toLowerCase() === 'test') {
        setUserIdMessage('다른 회원이 사용하고 있는 아이디입니다.');
        setIsUserIdValid(false);
      } else {
        setUserIdMessage('사용하실 수 있는 아이디입니다.');
        setIsUserIdValid(true);
      }
    } catch (error) {
      setUserIdMessage('아이디 확인 중 오류가 발생했습니다.');
      setIsUserIdValid(false);
    }
  };

  // 비밀번호 일치 확인
  useEffect(() => {
    if (password && confirmPassword) {
      if (password === confirmPassword) {
        setPasswordMessage('사용하실 수 있는 비밀번호입니다.');
        setIsPasswordValid(true);
      } else {
        setPasswordMessage('비밀번호가 동일하지 않습니다.');
        setIsPasswordValid(false);
      }
    } else {
      setPasswordMessage('');
      setIsPasswordValid(false);
    }
  }, [password, confirmPassword]);

  // 아이디 입력 시 실시간 검사
  useEffect(() => {
    if (userId) {
      const timer = setTimeout(() => {
        checkUserId();
      }, 500); // 0.5초 디바운싱
      return () => clearTimeout(timer);
    } else {
      setUserIdMessage('');
      setIsUserIdValid(false);
    }
  }, [userId]);

  const handleRegister = async () => {
    if (!isUserIdValid) {
      Alert.alert('오류', '사용 가능한 아이디를 입력해주세요.');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('오류', '비밀번호를 확인해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 백엔드 API 호출
      // const response = await api.post('/auth/register', {
      //   userId,
      //   password,
      // });

      // 임시 처리
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('회원가입 완료', '로그인 화면으로 이동합니다.', [
        { text: '확인', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
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
            <Text style={styles.title}>사용하실 정보를{'\n'}입력해주세요.</Text>

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

            {/* 확인 버튼 */}
            <TouchableOpacity
              style={[
                styles.button,
                (!isUserIdValid || !isPasswordValid || loading) && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={!isUserIdValid || !isPasswordValid || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '처리 중...' : '확인'}
              </Text>
            </TouchableOpacity>

            {/* 이미 계정이 있는 경우 */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>이전으로</Text>
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
    paddingTop: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 40,
    marginBottom: 50,
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
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
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