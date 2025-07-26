// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

interface LoginScreenProps {
  navigation: any; // 타입은 나중에 정확히 정의
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('오류', '올바른 전화번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 임시 처리 (백엔드 없이 테스트)
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        await AsyncStorage.setItem('authToken', 'temp-token');
        await AsyncStorage.setItem('userData', JSON.stringify({ phoneNumber }));
        navigation.replace('Main');
        return;
      }

      // 실제 API 호출 (백엔드 구현 후 사용)
      const response = await api.post('/auth/login', {
        phoneNumber: phoneNumber.replace(/-/g, ''),
      });

      // 토큰 저장
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

      // 홈 화면으로 이동
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('로그인 실패', '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Care Plus+</Text>
          <Text style={styles.subtitle}>환자용 앱</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="전화번호 입력 (- 없이)"
              placeholderTextColor="#rgba(255,255,255,0.7)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              처음이신가요? 회원가입
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginBottom: 50,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 10,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;