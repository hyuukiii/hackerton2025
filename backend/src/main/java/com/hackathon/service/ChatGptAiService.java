package com.hackerton.team2.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackerton.team2.dto.ChatGptApiRequestDto;
import com.hackerton.team2.dto.ChatGptApiResponseDto;
import com.hackerton.team2.dto.DiseaseAnalysisDto;
import okhttp3.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ChatGptAiService {
    
    @Value("${chatgpt.api.url}")
    private String chatgptApiUrl;
    
    @Value("${chatgpt.api.key}")
    private String chatgptApiKey;
    
    @Value("${chatgpt.api.model}")
    private String chatgptModel;
    
    @Value("${chatgpt.api.max-tokens}")
    private int maxTokens;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 처방 데이터를 분석하여 기저질환을 예측하는 메소드
     * @param medicationData 처방 데이터
     * @return 기저질환 분석 결과
     */
    public DiseaseAnalysisDto analyzePrescriptionForDiseases(Object medicationData) {
        try {
            System.out.println("=== 입력 데이터 상세 로깅 ===");
            System.out.println("medicationData 타입: " + medicationData.getClass().getName());
            System.out.println("medicationData 내용: " + medicationData.toString());
            
            // 처방 데이터에서 약물 정보 추출
            List<String> actualMedicationNames = extractMedicationNames(medicationData);
            String medicationInfo = extractMedicationInfo(medicationData);
            
            System.out.println("추출된 약물명 목록: " + actualMedicationNames);
            System.out.println("추출된 약물 정보: " + medicationInfo);
            
            // ChatGPT API에 전송할 프롬프트 생성
            String prompt = createAnalysisPrompt(medicationInfo, actualMedicationNames);
            
            System.out.println("=== 생성된 프롬프트 ===");
            System.out.println(prompt);
            System.out.println("========================");
            
            // ChatGPT API 호출
            String chatgptResponse = callChatGptApi(prompt);
            
            // ChatGPT 응답을 파싱하여 결과 생성
            return parseChatGptResponse(chatgptResponse);
            
        } catch (Exception e) {
            System.err.println("기저질환 분석 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 오류 발생 시 기본 응답 반환
            DiseaseAnalysisDto errorResponse = new DiseaseAnalysisDto();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("기저질환 분석 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.setPredictedDiseases(new ArrayList<>());
            errorResponse.setRiskLevel("UNKNOWN");
            return errorResponse;
        }
    }
    
    /**
     * 처방 데이터에서 실제 약물명 목록을 추출하는 메소드
     */
    private List<String> extractMedicationNames(Object medicationData) {
        List<String> medicationNames = new ArrayList<>();
        
        try {
            if (medicationData instanceof JSONObject) {
                JSONObject data = (JSONObject) medicationData;
                Object prescriptionData = data.get("PrescriptionData");
                
                if (prescriptionData instanceof JSONArray) {
                    JSONArray prescriptions = (JSONArray) prescriptionData;
                    
                    for (Object prescriptionObj : prescriptions) {
                        if (prescriptionObj instanceof JSONObject) {
                            JSONObject prescription = (JSONObject) prescriptionObj;
                            
                            // 약물 상세 정보
                            Object medicationDetails = prescription.get("MedicationDetails");
                            if (medicationDetails instanceof JSONArray) {
                                JSONArray details = (JSONArray) medicationDetails;
                                
                                for (Object detailObj : details) {
                                    if (detailObj instanceof JSONObject) {
                                        JSONObject detail = (JSONObject) detailObj;
                                        String drugName = (String) detail.get("ChoBangYakPumMyung");
                                        if (drugName != null && !drugName.trim().isEmpty()) {
                                            medicationNames.add(drugName.trim());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("약물명 추출 중 오류: " + e.getMessage());
        }
        
        return medicationNames;
    }
    
    /**
     * 처방 데이터에서 약물 정보를 추출하는 메소드
     */
    private String extractMedicationInfo(Object medicationData) {
        StringBuilder medicationInfo = new StringBuilder();
        
        try {
            if (medicationData instanceof JSONObject) {
                JSONObject data = (JSONObject) medicationData;
                Object prescriptionData = data.get("PrescriptionData");
                
                if (prescriptionData instanceof JSONArray) {
                    JSONArray prescriptions = (JSONArray) prescriptionData;
                    
                    for (Object prescriptionObj : prescriptions) {
                        if (prescriptionObj instanceof JSONObject) {
                            JSONObject prescription = (JSONObject) prescriptionObj;
                            
                            // 진료일자
                            String treatmentDate = (String) prescription.get("JinRyoGaesiIl");
                            medicationInfo.append("진료일자: ").append(treatmentDate).append("\\n");
                            
                            // 약물 상세 정보
                            Object medicationDetails = prescription.get("MedicationDetails");
                            if (medicationDetails instanceof JSONArray) {
                                JSONArray details = (JSONArray) medicationDetails;
                                
                                for (Object detailObj : details) {
                                    if (detailObj instanceof JSONObject) {
                                        JSONObject detail = (JSONObject) detailObj;
                                        
                                        String drugName = (String) detail.get("ChoBangYakPumMyung");
                                        String drugEffect = (String) detail.get("ChoBangYakPumHyoneung");
                                        String dosageDays = (String) detail.get("TuyakIlSoo");
                                        
                                        Object drugDetailInfo = detail.get("DrugDetailInfo");
                                        if (drugDetailInfo instanceof JSONObject) {
                                            JSONObject drugDetail = (JSONObject) drugDetailInfo;
                                            String component = (String) drugDetail.get("CmpnInfo");
                                            String atcInfo = (String) drugDetail.get("AtcInfo");
                                            String kpicInfo = (String) drugDetail.get("KpicInfo");
                                            
                                            medicationInfo.append("- 약물명: ").append(drugName)
                                                          .append(", 효능: ").append(drugEffect)
                                                          .append(", 투약일수: ").append(dosageDays)
                                                          .append(", 성분: ").append(component)
                                                          .append(", ATC분류: ").append(atcInfo)
                                                          .append(", KPIC분류: ").append(kpicInfo)
                                                          .append("\\n");
                                        }
                                    }
                                }
                            }
                            medicationInfo.append("\\n");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("약물 정보 추출 중 오류: " + e.getMessage());
            return "약물 정보 추출에 실패했습니다.";
        }
        
        return medicationInfo.toString();
    }
    
    /**
     * ChatGPT API에 전송할 분석 프롬프트를 생성하는 메소드
     */
    private String createAnalysisPrompt(String medicationInfo, List<String> actualMedicationNames) {
        String medicationNamesList = String.join("\", \"", actualMedicationNames);
        
        return """
             다음은 한 환자의 복수 처방 이력이다. 아래 JSON 배열을 분석하여, 이 환자가 가지고 있을 가능성이 있는 **기저질환**을 최대 4개까지 추정하라.
                
             단, 다음 조건을 모두 만족해야만 기저질환으로 추정하라:
             - 동일 계열 또는 동일 효능의 약물이 **총 14일 이상** 또는 **반복적으로 처방**된 경우
             - 단기 처방(7일 이내)이면서 반복되지 않은 경우는 기저질환 판단에 **사용하지 마라**
             - 기저질환과 명확히 연관되지 않은 약물(예: 감기약, 소화제, 진통제 등)은 고려하지 마라
             - 판단이 모호한 경우는 절대로 추정하지 말고 제외하라

             다음 목록에 포함된 질환만 선택할 수 있으며, 목록에 없는 질환은 절대로 추정하지 마라. \s
             출력은 반드시 아래와 같은 **JSON 배열 형식**으로 하며, 기타 설명은 포함하지 마라. \s

             질환이 하나도 추정되지 않는 경우는 빈 배열 `[]`을 출력하라.

             가능한 질환: \s
             - 뇌전증, 치매, 파킨슨병, 뇌졸중 후유증, 만성두통 \s
             - 심부전, 고혈압, 관상동맥질환, 심방세동, 고지혈증 \s
             - COPD, 천식, 폐섬유화증, 수면무호흡증 \s
             - 빈혈, 혈우병, 항응고치료중, 고형암, 혈액암 \s
             - 당뇨병, 갑상선기능이상, 골다공증, 부신기능장애 \s
             - 만성신부전, 투석환자, 신증후군 \s
             - 간경변, B형간염, C형간염, 비알코올성지방간 \s
             - 위염, 소화성궤양, 염증성장질환, 과민성장증후군 \s
             - 류마티스관절염, 골관절염, 통풍, 전신홍반루푸스 \s
             - 자가면역질환, 장기이식 후 면역억제 치료 중 \s
             - HIV, 결핵, 만성바이러스간염 \s
             - 우울증, 조현병, 양극성장애, 불안장애 \s
             - PKU, 윌슨병, 헌팅턴병 등

             출력 형식:
             ```json
             [
               "질환명1",
               "질환명2",
               "질환명3",
               "질환명4"
             ]
                

        """.formatted(medicationInfo, String.join(", ", actualMedicationNames));
    }

    /**
     * ChatGPT API를 호출하는 메소드
     */
    private String callChatGptApi(String prompt) throws IOException {
        // API 키 유효성 검사
        if (chatgptApiKey == null || chatgptApiKey.trim().isEmpty() || chatgptApiKey.contains("여기에")) {
            throw new IOException("ChatGPT API 키가 설정되지 않았습니다. application.properties에서 chatgpt.api.key를 설정해주세요.");
        }
        
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();
        
        // 요청 DTO 생성
        ChatGptApiRequestDto requestDto = new ChatGptApiRequestDto();
        requestDto.setModel(chatgptModel);
        requestDto.setMaxTokens(maxTokens);
        requestDto.setTemperature(0.3); // 적절한 창의성을 위한 온도 설정
        
        ChatGptApiRequestDto.Message systemMessage = new ChatGptApiRequestDto.Message();
        systemMessage.setRole("system");
        systemMessage.setContent("당신은 의료 데이터 분석 전문가입니다. 처방 데이터를 분석하여 기저질환을 추정하되, 반드시 주어진 질환 목록에서만 선택하고 JSON 배열 형식으로만 응답해야 합니다. 다른 텍스트는 포함하지 마세요.");
        
        ChatGptApiRequestDto.Message userMessage = new ChatGptApiRequestDto.Message();
        userMessage.setRole("user");
        userMessage.setContent(prompt);
        
        requestDto.setMessages(Arrays.asList(systemMessage, userMessage));
        
        // JSON 변환
        String requestJson = objectMapper.writeValueAsString(requestDto);
        
        System.out.println("=== ChatGPT API 요청 ===");
        System.out.println("URL: " + chatgptApiUrl);
        System.out.println("Model: " + chatgptModel);
        
        // HTTP 요청 생성
        Request request = new Request.Builder()
                .url(chatgptApiUrl)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + chatgptApiKey)
                .post(RequestBody.create(MediaType.get("application/json; charset=utf-8"), requestJson))
                .build();
        
        // API 호출
        try (Response response = client.newCall(request).execute()) {
            System.out.println("ChatGPT API 응답 코드: " + response.code());
            
            if (response.body() == null) {
                throw new IOException("ChatGPT API 응답 본문이 비어있습니다.");
            }
            
            String responseBody = response.body().string();
            
            if (!response.isSuccessful()) {
                System.err.println("ChatGPT API 오류 응답: " + responseBody);
                
                if (response.code() == 401) {
                    throw new IOException("ChatGPT API 인증 실패: API 키를 확인해주세요.");
                } else if (response.code() == 429) {
                    throw new IOException("ChatGPT API 요청 한도 초과: 잠시 후 다시 시도해주세요.");
                } else if (response.code() == 400) {
                    throw new IOException("ChatGPT API 요청 오류: 요청 데이터를 확인해주세요.");
                } else {
                    throw new IOException("ChatGPT API 호출 실패: " + response.code() + " - " + responseBody);
                }
            }
            
            System.out.println("ChatGPT API 성공적 응답 수신");
            return responseBody;
        }
    }
    
    /**
     * ChatGPT API 응답을 파싱하여 DiseaseAnalysisDto로 변환하는 메소드
     */
    private DiseaseAnalysisDto parseChatGptResponse(String chatgptResponse) {
        try {
            // ChatGPT API 응답 파싱
            ChatGptApiResponseDto apiResponse = objectMapper.readValue(chatgptResponse, ChatGptApiResponseDto.class);
            
            if (apiResponse.getChoices() != null && !apiResponse.getChoices().isEmpty()) {
                String analysisText = apiResponse.getChoices().get(0).getMessage().getContent();
                
                // JSON 배열 부분만 추출
                String jsonArrayText = extractJsonArrayFromText(analysisText);
                
                // JSON 배열을 DiseaseAnalysisDto로 변환
                DiseaseAnalysisDto result = parseAnalysisJsonArray(jsonArrayText);
                result.setStatus("SUCCESS");
                result.setMessage("기저질환 분석이 완료되었습니다.");
                
                return result;
            } else {
                throw new RuntimeException("ChatGPT API 응답에 내용이 없습니다.");
            }
            
        } catch (Exception e) {
            System.err.println("ChatGPT 응답 파싱 오류: " + e.getMessage());
            
            // 파싱 실패 시 기본 응답
            DiseaseAnalysisDto result = new DiseaseAnalysisDto();
            result.setStatus("PARTIAL_SUCCESS");
            result.setMessage("분석은 완료되었으나 결과 파싱에 오류가 발생했습니다.");
            result.setPredictedDiseases(new ArrayList<>());
            result.setRiskLevel("UNKNOWN");
            
            return result;
        }
    }
    
    /**
     * 텍스트에서 JSON 배열 부분을 추출하는 메소드
     */
    private String extractJsonArrayFromText(String text) {
        try {
            System.out.println("=== 원본 ChatGPT 응답 ===");
            System.out.println(text);
            System.out.println("=========================");
            
            // ```json으로 시작하고 ```로 끝나는 부분을 찾기
            if (text.contains("```json")) {
                int startIndex = text.indexOf("```json") + 7;
                int endIndex = text.indexOf("```", startIndex);
                if (endIndex > startIndex) {
                    String extracted = text.substring(startIndex, endIndex).trim();
                    System.out.println("JSON 블록에서 추출: " + extracted);
                    return extracted;
                }
            }
            
            // JSON 배열 시작과 끝을 찾기 ([과 ]로 시작하는 부분)
            int startIndex = text.indexOf("[");
            int endIndex = text.lastIndexOf("]");
            if (startIndex >= 0 && endIndex > startIndex) {
                String extracted = text.substring(startIndex, endIndex + 1);
                System.out.println("배열 부분에서 추출: " + extracted);
                return extracted;
            }
            
            System.out.println("JSON 배열을 찾지 못함, 원본 반환");
            return text;
            
        } catch (Exception e) {
            System.err.println("JSON 배열 추출 오류: " + e.getMessage());
            return text;
        }
    }
    
    /**
     * JSON 배열 텍스트를 DiseaseAnalysisDto로 변환하는 메소드
     */
    private DiseaseAnalysisDto parseAnalysisJsonArray(String jsonArrayText) throws Exception {
        try {
            System.out.println("=== 파싱할 JSON 배열 ===");
            System.out.println(jsonArrayText);
            System.out.println("=========================");
            
            // ObjectMapper를 사용해 JSON 배열을 List로 파싱
            @SuppressWarnings("unchecked")
            List<String> diseaseNames = objectMapper.readValue(jsonArrayText, List.class);
            
            DiseaseAnalysisDto result = new DiseaseAnalysisDto();
            List<DiseaseAnalysisDto.PredictedDisease> diseases = new ArrayList<>();
            
            // 추출된 질환명들을 PredictedDisease 객체로 변환
            for (String diseaseName : diseaseNames) {
                if (diseaseName != null && !diseaseName.trim().isEmpty()) {
                    DiseaseAnalysisDto.PredictedDisease disease = new DiseaseAnalysisDto.PredictedDisease();
                    disease.setDiseaseName(diseaseName.trim());
                    disease.setProbability("추정"); // 기본값
                    disease.setReason("처방 패턴 분석 결과"); // 기본값
                    disease.setRelatedMedications(new ArrayList<>()); // 빈 목록으로 초기화
                    
                    diseases.add(disease);
                    System.out.println("추가된 질병: " + disease.getDiseaseName());
                }
            }
            
            result.setPredictedDiseases(diseases);
            result.setAnalysisReason("처방 데이터 패턴 분석을 통한 기저질환 추정");
            result.setRiskLevel(diseases.isEmpty() ? "LOW" : "MEDIUM");
            result.setRecommendations(Arrays.asList("의료진과 상담 권장", "정기적인 건강검진"));
            
            System.out.println("파싱 완료: " + result.getPredictedDiseases().size() + "개 질병 추출");
            
            return result;
            
        } catch (Exception e) {
            System.err.println("JSON 배열 파싱 오류: " + e.getMessage());
            e.printStackTrace();
            
            // 파싱 실패 시 기본 값 반환
            DiseaseAnalysisDto result = new DiseaseAnalysisDto();
            result.setPredictedDiseases(new ArrayList<>());
            result.setAnalysisReason("파싱 실패");
            result.setRiskLevel("UNKNOWN");
            result.setRecommendations(new ArrayList<>());
            
            throw e;
        }
    }
}