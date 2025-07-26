// src/screens/onboarding/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

interface SlideData {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    title: '전문 의료진과 연결',
    description: '병원의 전문 의료진과 안전하게 소통하세요',
    icon: 'user-md', // 의사 아이콘
    iconColor: '#667eea',
  },
  {
    id: '2',
    title: '처방 정보 관리',
    description: '개인 처방 정보와 건강 데이터를 한 곳에서',
    icon: 'prescription-bottle-alt',
    iconColor: '#764ba2',
  },
  {
    id: '3',
    title: '신기능 기반 평가',
    description: 'AI 기반 CDSS로 정확한 용량 평가 제공',
    icon: 'heartbeat',
    iconColor: '#f093fb',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const currentItem = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>최초 접속 화면</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.logo}>Care Plus<Text style={styles.plus}>+</Text></Text>

        <View style={styles.slideContainer}>
          {/* 좌측 화살표 */}
          <TouchableOpacity
            onPress={handlePrevious}
            style={[styles.arrow, currentIndex === 0 && styles.arrowDisabled]}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={40}
              color={currentIndex === 0 ? '#ddd' : '#666'}
            />
          </TouchableOpacity>

          {/* 중앙 카드 */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{currentItem.icon}</Text>
            </View>
            <Text style={styles.cardText}>{currentItem.title}</Text>
          </View>

          {/* 우측 화살표 */}
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.arrow, currentIndex === onboardingData.length - 1 && styles.arrowDisabled]}
            disabled={currentIndex === onboardingData.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={40}
              color={currentIndex === onboardingData.length - 1 ? '#ddd' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* 페이지 인디케이터 */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* 로그인 버튼 */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        {/* 회원가입 링크 */}
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerText}>처음이신가요?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 50,
  },
  plus: {
    color: '#999',
  },
  slideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    paddingHorizontal: 20,
  },
  arrow: {
    padding: 10,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  card: {
    backgroundColor: '#e8e8ff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 20,
    width: width * 0.6,
    minHeight: 300,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 32,
    color: '#333',
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#667eea',
    width: 24,
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#667eea',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;