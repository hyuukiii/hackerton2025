// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LoginSuccessScreen from '../screens/auth/LoginSuccessScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';

// 임시 화면들
import { View, Text, StyleSheet } from 'react-native';

const FindIdScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>아이디 찾기 - 구현 예정</Text>
  </View>
);

const FindPasswordScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>비밀번호 찾기 - 구현 예정</Text>
  </View>
);

const PrescriptionHistoryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>약물 처방 내역 - 구현 예정</Text>
  </View>
);

const MedicalHistoryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>병력 관리 - 구현 예정</Text>
  </View>
);

const HealthCheckupScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>건강검진 내역 조회 - 구현 예정</Text>
  </View>
);

const EditHealthInfoScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>건강정보 수정 - 구현 예정</Text>
  </View>
);

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LoginSuccess" component={LoginSuccessScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="FindId" component={FindIdScreen} />
      <Stack.Screen name="FindPassword" component={FindPasswordScreen} />
      <Stack.Screen name="Main" component={HomeScreen} />
      <Stack.Screen name="PrescriptionHistory" component={PrescriptionHistoryScreen} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <Stack.Screen name="HealthCheckup" component={HealthCheckupScreen} />
      <Stack.Screen name="EditHealthInfo" component={EditHealthInfoScreen} />
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