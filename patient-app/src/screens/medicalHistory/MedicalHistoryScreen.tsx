// src/screens/medicalHistory/MedicalHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatDateKorean } from '../../utils/dateUtils';

// 질병 타입 정의
interface Disease {
  id: string;
  category: string;
  name: string;
  isFromAI?: boolean;
  addedDate: string;
}

const MedicalHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [myDiseases, setMyDiseases] = useState<Disease[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  // 화면이 포커스될 때마다 데이터 로드
  useFocusEffect(
    React.useCallback(() => {
      loadMedicalHistory();
    }, [])
  );

  // 저장된 병력 데이터 로드
  const loadMedicalHistory = async () => {
    try {
      // AI가 분석한 기저질환 로드
      const aiDiseases = await AsyncStorage.getItem('aiAnalyzedDiseases');
      // 사용자가 추가한 병력 로드
      const userDiseases = await AsyncStorage.getItem('userMedicalHistory');

      const diseases: Disease[] = [];

      // AI 분석 질환 추가
      if (aiDiseases) {
        const parsed = JSON.parse(aiDiseases);
        parsed.forEach((disease: string) => {
          diseases.push({
            id: `ai_${disease}`,
            category: getCategoryByDisease(disease),
            name: disease,
            isFromAI: true,
            addedDate: new Date().toISOString(),
          });
        });
      }

      // 사용자 추가 질환
      if (userDiseases) {
        const parsed = JSON.parse(userDiseases);
        diseases.push(...parsed);
      }

      setMyDiseases(diseases);
    } catch (error) {
      console.error('병력 데이터 로드 실패:', error);
    }
  };

  // 질병명으로 카테고리 찾기
  const getCategoryByDisease = (diseaseName: string): string => {
    const categories = {
      '신경계': ['뇌전증', '치매', '파킨슨병', '뇌졸중 후유증', '만성두통'],
      '심혈관계': ['심부전', '고혈압', '관상동맥질환', '심방세동', '고지혈증'],
      '호흡기계': ['COPD', '천식', '폐섬유화증', '수면무호흡증'],
      '혈액/종양계': ['빈혈', '혈우병', '항응고치료중', '고형암', '혈액암'],
      '내분비계': ['당뇨병', '갑상선기능이상', '골다공증', '부신기능장애'],
      '신장계': ['만성신부전', '투석환자', '신증후군'],
      '간담도계': ['간경변', 'B형간염', 'C형간염', '비알코올성지방간'],
      '위장관계': ['위염', '소화성궤양', '염증성장질환', '과민성장증후군'],
      '근골격계': ['류마티스관절염', '골관절염', '통풍', '전신홍반루푸스'],
      '면역계': ['자가면역질환', '장기이식 후 면역억제 치료 중'],
      '감염성 질환': ['HIV', '결핵', '만성바이러스간염'],
      '정신건강계': ['우울증', '조현병', '양극성장애', '불안장애'],
      '유전/희귀질환': ['PKU', '윌슨병', '헌팅턴병'],
    };

    for (const [category, diseases] of Object.entries(categories)) {
      if (diseases.includes(diseaseName)) {
        return category;
      }
    }
    return '기타';
  };

  // 질병 선택 토글
  const toggleDiseaseSelection = (diseaseId: string) => {
    setSelectedDisease(selectedDisease === diseaseId ? null : diseaseId);
  };

  // 질병 삭제
  const deleteDisease = async () => {
    if (!selectedDisease) return;

    Alert.alert(
      '병력 삭제',
      '선택한 병력을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDiseases = myDiseases.filter(d => d.id !== selectedDisease);

              // AI 분석 질환과 사용자 추가 질환 분리
              const aiDiseases = updatedDiseases
                .filter(d => d.isFromAI)
                .map(d => d.name);
              const userDiseases = updatedDiseases.filter(d => !d.isFromAI);

              // 저장
              await AsyncStorage.setItem('aiAnalyzedDiseases', JSON.stringify(aiDiseases));
              await AsyncStorage.setItem('userMedicalHistory', JSON.stringify(userDiseases));

              setMyDiseases(updatedDiseases);
              setSelectedDisease(null);
              Alert.alert('삭제 완료', '병력이 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '병력 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>병력 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 날짜 표시 */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>갱신일자</Text>
        <Text style={styles.dateValue}>
          {formatDateKorean(new Date())}
        </Text>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>내 병력</Text>
        </TouchableOpacity>
      </View>

      {/* 내 병력 목록 */}
      <ScrollView style={styles.content}>
        <View style={styles.diseaseList}>
          {myDiseases.length === 0 ? (
            <Text style={styles.emptyText}>등록된 병력이 없습니다.</Text>
          ) : (
            myDiseases.map((disease) => (
              <TouchableOpacity
                key={disease.id}
                style={[
                  styles.diseaseItem,
                  selectedDisease === disease.id && styles.selectedDiseaseItem,
                ]}
                onPress={() => toggleDiseaseSelection(disease.id)}
              >
                <View style={styles.diseaseInfo}>
                  <Text style={styles.diseaseCategory}>{disease.category}</Text>
                  <Text style={styles.diseaseName}>{disease.name}</Text>
                  {disease.isFromAI && (
                    <Text style={styles.aiLabel}>AI 분석</Text>
                  )}
                </View>
                {selectedDisease === disease.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 병력 추가하기 버튼 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMedicalHistory')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#667eea" />
          <Text style={styles.addButtonText}>병력 추가하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 삭제 버튼 */}
      {selectedDisease && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteDisease}>
            <Text style={styles.deleteButtonText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  diseaseList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    paddingVertical: 32,
  },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedDiseaseItem: {
    backgroundColor: '#e8eaf6',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  aiLabel: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MedicalHistoryScreen;