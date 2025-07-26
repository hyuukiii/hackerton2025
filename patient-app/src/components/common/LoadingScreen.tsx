import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>Care Plus+</Text>
        <Text style={styles.slogan}>데이터로 병원과 나를 잇다 - 정확한 진료의 시작</Text>
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.loader}
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  slogan: {
    fontSize: 18,
    color: 'white',
    marginBottom: 40,
    opacity: 0.9,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;