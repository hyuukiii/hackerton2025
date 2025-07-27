// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LoginSuccessScreen from '../screens/auth/LoginSuccessScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';

// 간편인증 관련 화면들
import SimpleAuthScreen from '../screens/auth/SimpleAuthScreen';
import SimpleAuthLoadingScreen from '../screens/auth/SimpleAuthLoadingScreen';
import SimpleAuthSuccessScreen from '../screens/auth/SimpleAuthSuccessScreen';
import UserInfoScreen from '../screens/auth/UserInfoScreen';
import HealthCheckDateScreen from '../screens/auth/HealthCheckDateScreen';
import DiseaseInfoScreen from '../screens/auth/DiseaseInfoScreen';

// 병력 관리 화면들
import MedicalHistoryScreen from '../screens/medicalHistory/MedicalHistoryScreen';
import AddMedicalHistoryScreen from '../screens/medicalHistory/AddMedicalHistoryScreen';

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

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  LoginSuccess: undefined;
  Register: undefined;
  FindId: undefined;
  FindPassword: undefined;
  Main: undefined;
  PrescriptionHistory: undefined;
  MedicalHistory: undefined;
  AddMedicalHistory: undefined;
  HealthCheckup: undefined;
  EditHealthInfo: undefined;

  // 간편인증 관련 화면들
  SimpleAuth: {
    userId: string;
    password: string;
    userName?: string;
    birthDate?: string;
    phoneNumber?: string;
    isFromRegister?: boolean;
  };
  SimpleAuthLoading: {
    authData: any;
  };
  SimpleAuthSuccess: {
    authData: any;
  };
  UserInfo: {
    authData: any;
  };
  HealthCheckDate: {
    authData: any;
    userInfo: any;
    healthData: any;
  };
  DiseaseInfo: {
    authData: any;
    userInfo: any;
    healthData: any;
    checkupInfo: any;
    diseaseAnalysis: any;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginSuccess"
        component={LoginSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FindId"
        component={FindIdScreen}
        options={{ title: '아이디 찾기' }}
      />
      <Stack.Screen
        name="FindPassword"
        component={FindPasswordScreen}
        options={{ title: '비밀번호 찾기' }}
      />
      <Stack.Screen
        name="Main"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrescriptionHistory"
        component={PrescriptionHistoryScreen}
        options={{ title: '약물 처방 내역' }}
      />
      <Stack.Screen
        name="MedicalHistory"
        component={MedicalHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMedicalHistory"
        component={AddMedicalHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthCheckup"
        component={HealthCheckupScreen}
        options={{ title: '건강검진 내역 조회' }}
      />
      <Stack.Screen
        name="EditHealthInfo"
        component={EditHealthInfoScreen}
        options={{ title: '건강정보 수정' }}
      />

      {/* 간편인증 관련 화면들 */}
      <Stack.Screen
        name="SimpleAuth"
        component={SimpleAuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SimpleAuthLoading"
        component={SimpleAuthLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SimpleAuthSuccess"
        component={SimpleAuthSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserInfo"
        component={UserInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthCheckDate"
        component={HealthCheckDateScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DiseaseInfo"
        component={DiseaseInfoScreen}
        options={{ headerShown: false }}
      />
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
    fontSize: 18,
    color: '#666',
  },
});

export default AppNavigator;