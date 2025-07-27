// src/screens/onboarding/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const onboardingData = [
  {
    id: 1,
    iconName: 'user-md',
    iconType: 'fontawesome5',
    title: '의사에게\n내 병력을 전달하지\n않아도 됩니다.',
  },
  {
    id: 2,
    iconName: 'pills',
    iconType: 'fontawesome5',
    title: '신기능 기반\n맞춤형 처방 안전성을\n확인하세요.',
  },
  {
    id: 3,
    iconName: 'mobile-alt',
    iconType: 'fontawesome5',
    title: '간편하게\n처방전 정보를\n관리하세요.',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // 스크롤 이벤트 처리
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < onboardingData.length) {
      setCurrentIndex(index);
    }
  };

  // 화살표로 이동
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: prevIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(prevIndex);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Care Plus<Text style={styles.plus}>+</Text></Text>

        <View style={styles.slideWrapper}>
          {/* 좌측 화살표 */}
          <TouchableOpacity
            onPress={handlePrevious}
            style={[styles.arrow, styles.leftArrow, currentIndex === 0 && styles.arrowDisabled]}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={40}
              color={currentIndex === 0 ? '#ddd' : '#666'}
            />
          </TouchableOpacity>

          {/* 스와이프 가능한 카드 영역 */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false, listener: handleScroll }
            )}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            {onboardingData.map((item, index) => (
              <View key={item.id} style={styles.slideContainer}>
                <View style={styles.card}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name={item.iconName}
                      size={50}
                      color="#667eea"
                    />
                  </View>
                  <Text style={styles.cardText}>{item.title}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* 우측 화살표 */}
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.arrow, styles.rightArrow, currentIndex === onboardingData.length - 1 && styles.arrowDisabled]}
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
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  opacity: scrollX.interpolate({
                    inputRange: [
                      (index - 1) * SCREEN_WIDTH,
                      index * SCREEN_WIDTH,
                      (index + 1) * SCREEN_WIDTH,
                    ],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  }),
                  transform: [{
                    scaleX: scrollX.interpolate({
                      inputRange: [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                      ],
                      outputRange: [1, 3, 1],
                      extrapolate: 'clamp',
                    }),
                  }],
                },
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
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
  slideWrapper: {
    height: 380,
    position: 'relative',
  },
  scrollView: {
    width: SCREEN_WIDTH,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    padding: 10,
    zIndex: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  card: {
    backgroundColor: '#e8e8ff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.8,
    minHeight: 300,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginTop: 40,
    marginBottom: 50,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
    marginHorizontal: 8,
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