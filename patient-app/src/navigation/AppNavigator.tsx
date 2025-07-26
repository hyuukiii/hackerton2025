// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// 임시 화면들
import { View, Text, StyleSheet } from 'react-native';

const RegisterScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>회원가입 화면 - 구현 예정</Text>
  </View>
);

const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>홈 화면 - 구현 예정</Text>
  </View>
);

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"  // 온보딩을 첫 화면으로 설정
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={HomeScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AppNavigator;