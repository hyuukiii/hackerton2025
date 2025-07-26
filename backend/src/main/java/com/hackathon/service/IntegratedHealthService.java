package com.hackerton.team2.service;

import com.hackerton.team2.dto.AuthResponseDto;
import com.hackerton.team2.dto.IntegratedHealthDataDto;
import com.hackerton.team2.dto.DiseaseAnalysisDto;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

@Service
public class IntegratedHealthService {
    
    private final String apiHost = "https://dev.tilko.net";
    private final String apiKey = "49a84c1bcba847f4922da4208540ee65";
    
    @Autowired
    private ChatGptAiService chatGptAiService;
    
    // AES 암호화 함수
    public String aesEncrypt(byte[] key, byte[] iv, String plainText) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException {
        if (plainText == null || plainText.isEmpty()) {
            return "";
        }
        
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        byte[] byteEncryptedData = cipher.doFinal(plainText.getBytes("UTF-8"));

        return Base64.getEncoder().encodeToString(byteEncryptedData);
    }

    // RSA 암호화 함수
    public String rsaEncrypt(String rsaPublicKey, byte[] aesKey) throws NoSuchAlgorithmException, UnsupportedEncodingException, InvalidKeySpecException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        byte[] keyBytes = Base64.getDecoder().decode(rsaPublicKey.getBytes("UTF-8"));
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        PublicKey fileGeneratedPublicKey = keyFactory.generatePublic(spec);
        RSAPublicKey key = (RSAPublicKey) fileGeneratedPublicKey;

        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] byteEncryptedData = cipher.doFinal(aesKey);

        return Base64.getEncoder().encodeToString(byteEncryptedData);
    }

    // RSA 공개키 조회
    public String getPublicKey() throws IOException, ParseException {
        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url(apiHost + "/api/Auth/GetPublicKey?APIkey=" + apiKey)
                .header("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.body() == null) {
                throw new IOException("Response body is null");
            }
            
            String responseStr = response.body().string();
            JSONParser jsonParser = new JSONParser();
            JSONObject jsonObject = (JSONObject) jsonParser.parse(responseStr);

            return (String) jsonObject.get("PublicKey");
        }
    }
    
    // 통합 건강 정보 조회 (건강검진 + 복용약물)
    public IntegratedHealthDataDto getIntegratedHealthData(AuthResponseDto authData) throws Exception {
        IntegratedHealthDataDto result = new IntegratedHealthDataDto();
        
        try {
            // 건강검진 정보 조회
            Object healthCheckupData = callHealthCheckupAPI(authData);
            result.setHealthCheckupData(healthCheckupData);
            
            // 복용약물 정보 조회
            Object medicationData = callMedicationAPI(authData);
            result.setMedicationData(medicationData);
            
            result.setStatus("SUCCESS");
            result.setMessage("통합 건강 정보 조회 완료");
            
        } catch (Exception e) {
            result.setStatus("ERROR");
            result.setMessage("통합 건강 정보 조회 실패: " + e.getMessage());
            throw e;
        }
        
        return result;
    }
    
    /**
     * ChatGPT AI를 활용한 기저질환 분석
     * @param medicationData 처방 데이터
     * @return 기저질환 분석 결과
     */
    public DiseaseAnalysisDto analyzeDiseases(Object medicationData) {
        try {
            System.out.println("=== ChatGPT AI 기저질환 분석 시작 ===");
            
            // ChatGPT AI 서비스를 통해 기저질환 분석
            DiseaseAnalysisDto analysisResult = chatGptAiService.analyzePrescriptionForDiseases(medicationData);
            
            System.out.println("ChatGPT AI 분석 완료: " + analysisResult.getStatus());
            
            return analysisResult;
            
        } catch (Exception e) {
            System.err.println("기저질환 분석 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 오류 발생 시 기본 응답 반환
            DiseaseAnalysisDto errorResponse = new DiseaseAnalysisDto();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("기저질환 분석 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.setPredictedDiseases(new java.util.ArrayList<>());
            errorResponse.setRiskLevel("UNKNOWN");
            
            return errorResponse;
        }
    }
    
    // 건강검진 API 호출 - 올바른 URL과 형식 사용
    private Object callHealthCheckupAPI(AuthResponseDto authData) throws Exception {
        System.out.println("=== 건강검진 API 호출 시작 (올바른 URL) ===");
        
        // RSA Public Key 조회
        String rsaPublicKey = getPublicKey();

        // AES Secret Key 및 IV 생성
        byte[] aesKey = new byte[16];
        new Random().nextBytes(aesKey);
        byte[] aesIv = new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

        // AES Key를 RSA Public Key로 암호화
        String aesCipherKey = rsaEncrypt(rsaPublicKey, aesKey);

        // 올바른 API URL - 건강검진
        String url = apiHost + "/api/v1.0/nhissimpleauth/ggpab003m0105";

        // ENC: 접두어 제거 후 실제 데이터만 추출
        String userName = authData.getUserName() != null ? authData.getUserName().replace("ENC:", "") : "";
        String birthDate = authData.getBirthDate() != null ? authData.getBirthDate().replace("ENC:", "") : "";
        String userCellphoneNumber = authData.getUserCellphoneNumber() != null ? authData.getUserCellphoneNumber().replace("ENC:", "") : "";

        // API 요청 파라미터 설정 (API 스펙에 맞게)
        JSONObject json = new JSONObject();
        
        // 암호화하지 않는 필드들
        json.put("CxId", authData.getCxId());
        json.put("PrivateAuthType", authData.getPrivateAuthType());
        json.put("ReqTxId", authData.getReqTxId());
        json.put("Token", authData.getToken());
        json.put("TxId", authData.getTxId());
        
        // AES로 암호화하는 필드들
        json.put("UserName", aesEncrypt(aesKey, aesIv, userName));
        json.put("BirthDate", aesEncrypt(aesKey, aesIv, birthDate));
        json.put("UserCellphoneNumber", aesEncrypt(aesKey, aesIv, userCellphoneNumber));

        System.out.println("건강검진 API URL: " + url);
        System.out.println("건강검진 전송 JSON: " + json.toJSONString());

        // API 호출
        Object result = callAPI(url, json.toJSONString(), aesCipherKey);
        System.out.println("건강검진 API 응답: " + result.toString());
        
        return result;
    }
    
    // 복용약물 API 호출 - 올바른 URL과 형식 사용
    private Object callMedicationAPI(AuthResponseDto authData) throws Exception {
        System.out.println("=== 복용약물 API 호출 시작 (올바른 URL) ===");
        
        // RSA Public Key 조회
        String rsaPublicKey = getPublicKey();

        // AES Secret Key 및 IV 생성
        byte[] aesKey = new byte[16];
        new Random().nextBytes(aesKey);
        byte[] aesIv = new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

        // AES Key를 RSA Public Key로 암호화
        String aesCipherKey = rsaEncrypt(rsaPublicKey, aesKey);

        // 올바른 API URL - 복용약물
        String url = apiHost + "/api/v1.0/nhissimpleauth/retrievetreatmentinjectioninformationperson";

        // ENC: 접두어 제거 후 실제 데이터만 추출
        String userName = authData.getUserName() != null ? authData.getUserName().replace("ENC:", "") : "";
        String birthDate = authData.getBirthDate() != null ? authData.getBirthDate().replace("ENC:", "") : "";
        String userCellphoneNumber = authData.getUserCellphoneNumber() != null ? authData.getUserCellphoneNumber().replace("ENC:", "") : "";

        // API 요청 파라미터 설정 (API 스펙에 맞게)
        JSONObject json = new JSONObject();
        
        // 암호화하지 않는 필드들
        json.put("CxId", authData.getCxId());
        json.put("PrivateAuthType", authData.getPrivateAuthType());
        json.put("ReqTxId", authData.getReqTxId());
        json.put("Token", authData.getToken());
        json.put("TxId", authData.getTxId());
        
        // AES로 암호화하는 필드들
        json.put("UserName", aesEncrypt(aesKey, aesIv, userName));
        json.put("BirthDate", aesEncrypt(aesKey, aesIv, birthDate));
        json.put("UserCellphoneNumber", aesEncrypt(aesKey, aesIv, userCellphoneNumber));

        System.out.println("복용약물 API URL: " + url);

        // API 호출
        Object rawResult = callAPI(url, json.toJSONString(), aesCipherKey);
        System.out.println("복용약물 API 원본 응답: " + rawResult.toString());
        
        // JinRyoHyungTae가 "처방조제"인 데이터만 필터링
        Object filteredResult = filterPrescriptionData(rawResult);
        System.out.println("복용약물 API 필터링 후: " + filteredResult.toString());
        
        return filteredResult;
    }
    
    // 공통 API 호출 메소드
    private Object callAPI(String url, String jsonBody, String encKey) throws Exception {
        System.out.println("=== API 호출 상세 로깅 ===");
        System.out.println("URL: " + url);
        System.out.println("API-KEY: " + apiKey);
        System.out.println("Request Body: " + jsonBody);
        
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();

        Request request = new Request.Builder()
                .url(url)
                .addHeader("API-KEY", apiKey)
                .addHeader("ENC-KEY", encKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(MediaType.get("application/json; charset=utf-8"), jsonBody))
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println("HTTP Status Code: " + response.code());
            
            if (response.body() == null) {
                throw new IOException("Response body is null");
            }
            
            String responseStr = response.body().string();
            System.out.println("Raw Response: " + responseStr);
            
            JSONParser parser = new JSONParser();
            Object parsedResponse = parser.parse(responseStr);
            
            return parsedResponse;
        }
    }
    
    // JinRyoHyungTae가 "처방조제"인 데이터만 필터링하고 필요한 필드만 추출
    private Object filterPrescriptionData(Object rawResult) {
        try {
            if (rawResult instanceof JSONObject) {
                JSONObject result = (JSONObject) rawResult;
                
                // API 스펙에 맞게 ResultList에서 데이터 추출
                Object resultList = result.get("ResultList");
                
                if (resultList instanceof org.json.simple.JSONArray) {
                    org.json.simple.JSONArray resultArray = (org.json.simple.JSONArray) resultList;
                    org.json.simple.JSONArray filteredArray = new org.json.simple.JSONArray();
                    
                    for (Object item : resultArray) {
                        if (item instanceof JSONObject) {
                            JSONObject resultItem = (JSONObject) item;
                            String jinRyoHyungTae = (String) resultItem.get("JinRyoHyungTae");
                            
                            // JinRyoHyungTae가 "처방조제"인 경우만 처리
                            if ("처방조제".equals(jinRyoHyungTae)) {
                                // 기저질환 분석에 필요한 데이터만 추출
                                JSONObject filteredItem = new JSONObject();
                                
                                // 진료 기본 정보
                                filteredItem.put("JinRyoGaesiIl", resultItem.get("JinRyoGaesiIl")); // 진료개시일
                                filteredItem.put("JinRyoHyungTae", resultItem.get("JinRyoHyungTae")); // 진료형태
                                filteredItem.put("TuYakYoYangHoiSoo", resultItem.get("TuYakYoYangHoiSoo")); // 투약요양회수
                                
                                // 상세 약물 정보 추출
                                Object detailList = resultItem.get("RetrieveTreatmentInjectionInformationPersonDetailList");
                                if (detailList instanceof org.json.simple.JSONArray) {
                                    org.json.simple.JSONArray detailArray = (org.json.simple.JSONArray) detailList;
                                    org.json.simple.JSONArray filteredDetailArray = new org.json.simple.JSONArray();
                                    
                                    for (Object detailItem : detailArray) {
                                        if (detailItem instanceof JSONObject) {
                                            JSONObject detail = (JSONObject) detailItem;
                                            JSONObject filteredDetail = new JSONObject();
                                            
                                            // 처방 기본 정보
                                            filteredDetail.put("ChoBangYakPumMyung", detail.get("ChoBangYakPumMyung")); // 처방약품명
                                            filteredDetail.put("ChoBangYakPumHyoneung", detail.get("ChoBangYakPumHyoneung")); // 처방약품효능
                                            filteredDetail.put("TuyakIlSoo", detail.get("TuyakIlSoo")); // 투약일수

                                            // 상세 약물 정보 추출
                                            Object mdsupInfo = detail.get("RetrieveMdsupDtlInfo");
                                            if (mdsupInfo instanceof JSONObject) {
                                                JSONObject mdsup = (JSONObject) mdsupInfo;
                                                JSONObject filteredMdsup = new JSONObject();
                                                
                                                // 기저질환 분석에 필요한 핵심 데이터
                                                filteredMdsup.put("CmpnInfo", mdsup.get("CmpnInfo")); // 성분정보
                                                filteredMdsup.put("FomlCdXplnCnte", mdsup.get("FomlCdXplnCnte")); // 제형
                                                filteredMdsup.put("MdctPathXplnCnte", mdsup.get("MdctPathXplnCnte")); // 투여경로
                                                filteredMdsup.put("AtcInfo", mdsup.get("AtcInfo")); // ATC정보
                                                filteredMdsup.put("KpicInfo", mdsup.get("KpicInfo")); // KPIC약물분류

                                                filteredDetail.put("DrugDetailInfo", filteredMdsup);
                                            }
                                            
                                            filteredDetailArray.add(filteredDetail);
                                        }
                                    }
                                    
                                    filteredItem.put("MedicationDetails", filteredDetailArray);
                                }
                                
                                filteredArray.add(filteredItem);
                            }
                        }
                    }
                    
                    // 최종 결과 생성
                    JSONObject finalResult = new JSONObject();
                    finalResult.put("PrescriptionData", filteredArray);
                    finalResult.put("FilterMessage", "처방조제 데이터만 필터링 완료. 총 " + filteredArray.size() + "건");
                    finalResult.put("DataPurpose", "기저질환 분석용 데이터");
                    finalResult.put("Status", result.get("Status") != null ? result.get("Status") : "OK");
                    finalResult.put("Message", result.get("Message") != null ? result.get("Message") : "성공");
                    
                    return finalResult;
                }
            }
            
            return rawResult;
            
        } catch (Exception e) {
            // 필터링 실패 시 원본 데이터 반환
            System.err.println("복용약물 데이터 필터링 실패: " + e.getMessage());
            return rawResult;
        }
    }
}
