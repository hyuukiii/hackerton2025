// src/screens/auth/LoginScreen.tsx
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 자동 로그인 확인
  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const savedAutoLogin = await AsyncStorage.getItem('autoLogin');
      const savedToken = await AsyncStorage.getItem('authToken');

      if (savedAutoLogin === 'true' && savedToken) {
        // 자동 로그인 처리
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Auto login check failed:', error);
    }
  };

  const handleLogin = async () => {
    if (!userId) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }

    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // 임시 처리 (백엔드 없이 테스트)
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 테스트용 계정
        if (userId === 'guest1234' && password === 'password') {
          // 자동 로그인 설정 저장
          if (autoLogin) {
            await AsyncStorage.setItem('autoLogin', 'true');
          } else {
            await AsyncStorage.removeItem('autoLogin');
          }

          await AsyncStorage.setItem('authToken', 'temp-token');
          await AsyncStorage.setItem('userData', JSON.stringify({
            userId,
            name: '김춘식' // 임시로 이름 설정
          }));

          // 로그인 성공 - 로딩 화면으로 이동
          navigation.replace('LoginSuccess');
          return;
        } else if (userId === 'guest12345') {
          setErrorMessage('존재하지 않는 아이디입니다.');
          return;
        } else if (userId === 'guest1234' && password !== 'password') {
          setErrorMessage('잘못된 비밀번호입니다.');
          return;
        } else {
          setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
          return;
        }
      }

      // 실제 API 호출 (백엔드 구현 후 사용)
      const response = await api.post('/auth/login', {
        userId,
        password,
      });

      if (autoLogin) {
        await AsyncStorage.setItem('autoLogin', 'true');
      }

      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

      navigation.replace('LoginSuccess');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErrorMessage('존재하지 않는 아이디입니다.');
      } else if (error.response?.status === 401) {
        setErrorMessage('잘못된 비밀번호입니다.');
      } else {
        setErrorMessage('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFindId = () => {
    // 아이디 찾기 화면으로 이동
    navigation.navigate('FindId');
  };

  const handleFindPassword = () => {
    // 비밀번호 찾기 화면으로 이동
    navigation.navigate('FindPassword');
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
            {/* 아이디 입력 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>아이디</Text>
              <TextInput
                style={styles.input}
                placeholder="guest1234"
                placeholderTextColor="#999"
                value={userId}
                onChangeText={(text) => {
                  setUserId(text);
                  setErrorMessage('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                secureTextEntry
              />
            </View>

            {/* 에러 메시지 */}
            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            {/* 자동 로그인 체크박스 */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAutoLogin(!autoLogin)}
            >
              <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
                {autoLogin && (
                  <MaterialIcons name="check" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>자동 로그인</Text>
            </TouchableOpacity>

            {/* 아이디 찾기 / 비밀번호 찾기 */}
            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={handleFindId}>
                <Text style={styles.linkText}>아이디 찾기</Text>
              </TouchableOpacity>
              <Text style={styles.divider}>|</Text>
              <TouchableOpacity onPress={handleFindPassword}>
                <Text style={styles.linkText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '로그인 중...' : '로그인'}
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
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  inputSection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -15,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 10,
  },
  divider: {
    fontSize: 14,
    color: '#ccc',
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
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
});

export default LoginScreen;