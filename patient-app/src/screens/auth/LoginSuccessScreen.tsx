// src/screens/auth/LoginSuccessScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginSuccessScreenProps {
  navigation: any;
}

const LoginSuccessScreen: React.FC<LoginSuccessScreenProps> = ({ navigation }) => {
  useEffect(() => {
    // 2초 후 메인 화면으로 이동
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <Text style={styles.logo}>
          Care Plus<Text style={styles.plus}>+</Text>
        </Text>

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로그인 중...</Text>
          <ActivityIndicator
            size="large"
            color="white"
            style={styles.indicator}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  plus: {
    color: '#999',
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  indicator: {
    transform: [{ scale: 1.2 }],
  },
});

export default LoginSuccessScreen;