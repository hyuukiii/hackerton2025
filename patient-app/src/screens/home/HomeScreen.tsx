// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  iconFamily: 'fontawesome5' | 'ionicons' | 'material-community';
  route: string;
  gradient: string[];
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    title: '약물 처방 내역',
    icon: 'pills',
    iconFamily: 'fontawesome5',
    route: 'PrescriptionHistory',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    title: '병력 관리',
    icon: 'virus',
    iconFamily: 'material-community',
    route: 'MedicalHistory',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    title: '건강검진 내역 조회',
    icon: 'clipboard-list',
    iconFamily: 'fontawesome5',
    route: 'HealthCheckup',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    title: '건강정보 수정',
    icon: 'pencil',
    iconFamily: 'ionicons',
    route: 'EditHealthInfo',
    gradient: ['#fa709a', '#fee140'],
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [userName, setUserName] = useState('김춘식');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || '김춘식');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleMenuPress = (route: string) => {
    // 각 메뉴 화면으로 네비게이션
    navigation.navigate(route);
  };

  const handleMenuOpen = () => {
    // 사이드 메뉴 열기 (나중에 구현)
    // navigation.openDrawer?.();
  };

  const renderIcon = (item: MenuItem) => {
    const iconProps = {
      name: item.icon,
      size: 40,
      color: 'white',
    };

    switch (item.iconFamily) {
      case 'fontawesome5':
        return <FontAwesome5 {...iconProps} />;
      case 'ionicons':
        return <Ionicons {...iconProps} />;
      case 'material-community':
        return <MaterialCommunityIcons {...iconProps} />;
      default:
        return <FontAwesome5 {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 헤더 */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleMenuOpen} style={styles.menuButton}>
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{userName} 님</Text>
            <View style={styles.menuButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            Care Plus<Text style={styles.logoPlus}>+</Text>
          </Text>
          <Text style={styles.tagline}>스마트한 건강관리의 시작</Text>
        </View>

        {/* 메뉴 그리드 */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.menuGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>
                  {renderIcon(item)}
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* 빠른 액세스 섹션 */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>오늘의 건강 정보</Text>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['#667eea20', '#764ba220']}
              style={styles.infoCardGradient}
            >
              <View style={styles.infoRow}>
                <FontAwesome5 name="heartbeat" size={20} color="#667eea" />
                <Text style={styles.infoText}>다음 복약 시간: 오후 2:00</Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome5 name="calendar-check" size={20} color="#667eea" />
                <Text style={styles.infoText}>예정된 검진: 3월 15일</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#667eea',
  },
  logoPlus: {
    color: '#999',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 50) / 2,
    height: (width - 50) / 2,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  menuGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  quickAccessSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoCardGradient: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default HomeScreen;