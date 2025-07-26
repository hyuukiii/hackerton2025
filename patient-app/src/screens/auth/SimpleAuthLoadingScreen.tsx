// src/screens/auth/SimpleAuthLoadingScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface SimpleAuthLoadingScreenProps {
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

const SimpleAuthLoadingScreen: React.FC<SimpleAuthLoadingScreenProps> = ({ navigation, route }) => {
  const { authData, userName, birthDate, phoneNumber } = route.params;

  useEffect(() => {
    // 3초 후 성공 화면으로 이동 (실제로는 인증 상태 확인 필요)
    const timer = setTimeout(() => {
      navigation.replace('SimpleAuthSuccess', {
        authData,
        userName,
        birthDate,
        phoneNumber,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, authData, userName, birthDate, phoneNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>
            Care Plus<Text style={styles.plus}>+</Text>
          </Text>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>
              사용자님의 건강 정보를{'\n'}받아오고 있습니다...
            </Text>

            <ActivityIndicator
              size="large"
              color="white"
              style={styles.indicator}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                안전하게 암호화된 통신으로{'\n'}
                건강보험공단에서 정보를 가져옵니다
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 60,
  },
  plus: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  indicator: {
    transform: [{ scale: 1.5 }],
    marginBottom: 40,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SimpleAuthLoadingScreen;