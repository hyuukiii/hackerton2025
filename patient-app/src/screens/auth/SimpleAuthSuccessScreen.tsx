// src/screens/auth/SimpleAuthSuccessScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SimpleAuthSuccessScreenProps {
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

const SimpleAuthSuccessScreen: React.FC<SimpleAuthSuccessScreenProps> = ({ navigation, route }) => {
  const { authData, userName, birthDate, phoneNumber } = route.params;

  useEffect(() => {
    // 2초 후 사용자 정보 입력 화면으로 이동
    const timer = setTimeout(() => {
      navigation.replace('UserInfo', {
        authData,
        userName,
        birthDate,
        phoneNumber,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, authData, userName, birthDate, phoneNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          Care Plus<Text style={styles.plus}>+</Text>
        </Text>

        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#667eea" />
          </View>

          <Text style={styles.successTitle}>
            사용자님의 건강 정보를{'\n'}성공적으로 받아왔습니다!
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              잠시 후 추가 정보 입력 화면으로 이동합니다
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#667eea',
    marginBottom: 60,
  },
  plus: {
    color: '#999',
  },
  successContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SimpleAuthSuccessScreen;