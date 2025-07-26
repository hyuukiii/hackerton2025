// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import LoadingScreen from './src/components/common/LoadingScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';

// 스플래시 스크린 유지
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showLoading, setShowLoading] = useState(true); // 로딩 화면 표시 상태 추가

  useEffect(() => {
    async function prepare() {
      try {
        // 초기화 작업
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 스플래시 스크린 숨기기
        await SplashScreen.hideAsync();

        // 로딩 화면을 3초간 표시
        setTimeout(() => {
          setShowLoading(false);
        }, 3000);

      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady || showLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
