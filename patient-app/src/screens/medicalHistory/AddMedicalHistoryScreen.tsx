// src/screens/medicalHistory/AddMedicalHistoryScreen.tsx
import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { formatDateKorean } from '../../utils/dateUtils';

// 질병 카테고리 데이터
const DISEASE_CATEGORIES = {
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

const AddMedicalHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 카테고리 선택
  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedDiseases([]);
      setIsExpanded(false);
    } else {
      setSelectedCategory(category);
      setSelectedDiseases([]);
      setIsExpanded(true);
    }
  };

  // 질병 선택/해제
  const toggleDiseaseSelection = (disease: string) => {
    if (selectedDiseases.includes(disease)) {
      setSelectedDiseases(selectedDiseases.filter(d => d !== disease));
    } else {
      setSelectedDiseases([...selectedDiseases, disease]);
    }
  };

  // 저장하기
  const handleSave = async () => {
    if (selectedDiseases.length === 0) {
      Alert.alert('알림', '추가할 병력을 선택해주세요.');
      return;
    }

    try {
      // 기존 사용자 병력 로드
      const existingHistory = await AsyncStorage.getItem('userMedicalHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // 새로운 병력 추가
      const newDiseases = selectedDiseases.map(disease => ({
        id: `user_${Date.now()}_${disease}`,
        category: selectedCategory,
        name: disease,
        isFromAI: false,
        addedDate: new Date().toISOString(),
      }));

      // 중복 체크
      const updatedHistory = [...history];
      newDiseases.forEach(newDisease => {
        const exists = updatedHistory.some(h => h.name === newDisease.name);
        if (!exists) {
          updatedHistory.push(newDisease);
        }
      });

      // 저장
      await AsyncStorage.setItem('userMedicalHistory', JSON.stringify(updatedHistory));

      Alert.alert('저장 완료', '병력이 추가되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', '병력 저장에 실패했습니다.');
    }
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
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>내 병력</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 병력 추가하기 섹션 */}
        <View style={styles.addSection}>
          <TouchableOpacity
            style={styles.expandHeader}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.expandHeaderText}>병력 추가하기</Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandContent}>
              <Text style={styles.instructionText}>
                대 분류를 선택해 주세요.
              </Text>

              {/* 대분류 카테고리 그리드 */}
              <View style={styles.categoryGrid}>
                {Object.keys(DISEASE_CATEGORIES).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton,
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category && styles.selectedCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 소분류 질병 목록 */}
              {selectedCategory && (
                <View style={styles.diseaseSection}>
                  <Text style={styles.subCategoryTitle}>
                    {selectedCategory} 관련 질환
                  </Text>
                  <View style={styles.diseaseGrid}>
                    {DISEASE_CATEGORIES[selectedCategory].map((disease) => (
                      <TouchableOpacity
                        key={disease}
                        style={[
                          styles.diseaseButton,
                          selectedDiseases.includes(disease) && styles.selectedDiseaseButton,
                        ]}
                        onPress={() => toggleDiseaseSelection(disease)}
                      >
                        <Text
                          style={[
                            styles.diseaseText,
                            selectedDiseases.includes(disease) && styles.selectedDiseaseText,
                          ]}
                        >
                          {disease}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      {selectedDiseases.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장하기</Text>
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
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  expandHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expandContent: {
    padding: 16,
    paddingTop: 0,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    width: '30%',
    margin: '1.66%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  diseaseSection: {
    marginTop: 24,
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  diseaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  diseaseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedDiseaseButton: {
    backgroundColor: '#e8eaf6',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  diseaseText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDiseaseText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMedicalHistoryScreen;