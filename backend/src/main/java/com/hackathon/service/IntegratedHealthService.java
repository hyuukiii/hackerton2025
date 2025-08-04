package com.hackathon.service;

import com.hackathon.dto.AuthResponseDto;
import com.hackathon.dto.IntegratedHealthDataDto;
import com.hackathon.dto.DiseaseAnalysisDto;
import okhttp3.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class IntegratedHealthService {

    @Value("${tilko.api.host}")
    private String apiHost;

    @Value("${tilko.api.key}")
    private String apiKey;

    //@Autowired
    //private ChatGptAiService chatGptAiService;

    // ChatGptAiService 대신 ClaudeAiService 사용
    @Autowired
    private ClaudeAiService claudeAiService;


    // 통합 건강 정보 조회
    public IntegratedHealthDataDto getIntegratedHealthData(AuthResponseDto authData) throws Exception {
        System.out.println("=== 통합 건강 정보 조회 시작 ===");

        // 필수 파라미터 검증
        validateAuthData(authData);

        IntegratedHealthDataDto result = new IntegratedHealthDataDto();

        try {
            // 1. 건강검진 정보 조회
            Object healthCheckupData = callHealthCheckupAPI(authData);
            result.setHealthCheckupData(healthCheckupData);

            // 2. 복용약물 정보 조회
            Object medicationData = callMedicationAPI(authData);
            result.setMedicationData(medicationData);

            result.setStatus("SUCCESS");
            result.setMessage("건강 정보 조회가 완료되었습니다.");

        } catch (Exception e) {
            System.err.println("통합 건강 정보 조회 실패: " + e.getMessage());
            e.printStackTrace();

            result.setStatus("ERROR");
            result.setMessage("건강 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }

        return result;
    }

    // 건강검진 API 호출
    private Object callHealthCheckupAPI(AuthResponseDto authData) throws Exception {
        System.out.println("=== 건강검진 API 호출 시작 ===");

        // RSA Public Key 조회
        String rsaPublicKey = getPublicKey();

        // AES Secret Key 및 IV 생성
        byte[] aesKey = new byte[16];
        new Random().nextBytes(aesKey);
        byte[] aesIv = new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

        // AES Key를 RSA Public Key로 암호화
        String aesCipherKey = rsaEncrypt(rsaPublicKey, aesKey);

        // API URL - v1.0 사용
        String url = apiHost + "/api/v1.0/nhissimpleauth/ggpab003m0105";

        // ENC: 접두어 제거 (간편인증 응답에서 ENC: 붙어있을 경우)
        String userName = authData.getUserName() != null ?
                authData.getUserName().replace("ENC:", "") : "";
        String birthDate = authData.getBirthDate() != null ?
                authData.getBirthDate().replace("ENC:", "") : "";
        String userCellphoneNumber = authData.getUserCellphoneNumber() != null ?
                authData.getUserCellphoneNumber().replace("ENC:", "") : "";

        // API 요청 파라미터 설정
        JSONObject json = new JSONObject();

        // 암호화하지 않는 필드들 (간편인증 응답 그대로 사용)
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
        System.out.println("건강검진 요청 파라미터:");
        System.out.println("- CxId: " + authData.getCxId());
        System.out.println("- PrivateAuthType: " + authData.getPrivateAuthType());
        System.out.println("- ReqTxId: " + authData.getReqTxId());
        System.out.println("- Token: " + (authData.getToken() != null ? "있음" : "없음"));
        System.out.println("- TxId: " + authData.getTxId());

        // API 호출
        Object result = callAPI(url, json.toJSONString(), aesCipherKey);
        System.out.println("건강검진 API 응답 수신 완료");

        return result;
    }

    // 복용약물 API 호출
    private Object callMedicationAPI(AuthResponseDto authData) throws Exception {
        System.out.println("=== 복용약물 API 호출 시작 ===");

        // RSA Public Key 조회
        String rsaPublicKey = getPublicKey();

        // AES Secret Key 및 IV 생성
        byte[] aesKey = new byte[16];
        new Random().nextBytes(aesKey);
        byte[] aesIv = new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };

        // AES Key를 RSA Public Key로 암호화
        String aesCipherKey = rsaEncrypt(rsaPublicKey, aesKey);

        // API URL - v1.0 사용
        String url = apiHost + "/api/v1.0/nhissimpleauth/retrievetreatmentinjectioninformationperson";

        // ENC: 접두어 제거
        String userName = authData.getUserName() != null ?
                authData.getUserName().replace("ENC:", "") : "";
        String birthDate = authData.getBirthDate() != null ?
                authData.getBirthDate().replace("ENC:", "") : "";
        String userCellphoneNumber = authData.getUserCellphoneNumber() != null ?
                authData.getUserCellphoneNumber().replace("ENC:", "") : "";

        // API 요청 파라미터 설정
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
        System.out.println("복용약물 API 응답 수신 완료");

        // JinRyoHyungTae가 "처방조제"인 데이터만 필터링
        Object filteredResult = filterPrescriptionData(rawResult);

        return filteredResult;
    }

    // 공통 API 호출 메소드
    private Object callAPI(String url, String jsonBody, String encKey) throws Exception {
        System.out.println("=== API 호출 ===");
        System.out.println("URL: " + url);

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(120, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(120, TimeUnit.SECONDS)
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
                throw new RuntimeException("Response body is null");
            }

            String responseStr = response.body().string();

            System.out.println("Raw Response (처음 100자): " +
                    (responseStr.length() > 100 ? responseStr.substring(0, 100) + "..." : responseStr));
            // 100자 제한 없이 전체 출력
            //System.out.println("전체 응답: " + responseStr);
            // JSON 파싱
            JSONParser parser = new JSONParser();
            JSONObject jsonResponse = (JSONObject) parser.parse(responseStr);

            // 응답 상태 확인
            String status = (String) jsonResponse.get("Status");
            if (!"OK".equals(status)) {
                String errorMessage = (String) jsonResponse.get("Message");
                String errorLog = (String) jsonResponse.get("ErrorLog");
                throw new RuntimeException("API 오류 - Status: " + status +
                        ", Message: " + errorMessage +
                        ", ErrorLog: " + errorLog);
            }

            return jsonResponse;
        }
    }

    // 필수 파라미터 검증
    private void validateAuthData(AuthResponseDto authData) {
        System.out.println("=== AuthData 검증 시작 ===");

        if (authData == null) {
            throw new IllegalArgumentException("AuthData가 null입니다.");
        }

        System.out.println("CxId: " + authData.getCxId());
        System.out.println("PrivateAuthType: " + authData.getPrivateAuthType());
        System.out.println("ReqTxId: " + authData.getReqTxId());
        System.out.println("Token: " + (authData.getToken() != null ? "있음" : "없음"));
        System.out.println("TxId: " + authData.getTxId());

        // 필수 파라미터 확인
        if (authData.getReqTxId() == null || authData.getReqTxId().trim().isEmpty()) {
            throw new IllegalArgumentException("ReqTxId가 없습니다. 간편인증을 다시 시도해주세요.");
        }

        if (authData.getCxId() == null || authData.getCxId().trim().isEmpty()) {
            throw new IllegalArgumentException("CxId가 없습니다. 간편인증을 다시 시도해주세요.");
        }

        if (authData.getToken() == null || authData.getToken().trim().isEmpty()) {
            throw new IllegalArgumentException("Token이 없습니다. 간편인증을 다시 시도해주세요.");
        }

        if (authData.getTxId() == null || authData.getTxId().trim().isEmpty()) {
            throw new IllegalArgumentException("TxId가 없습니다. 간편인증을 다시 시도해주세요.");
        }

        System.out.println("AuthData 검증 완료 - 모든 필수 파라미터가 존재합니다.");
    }

    // Public Key 조회
    private String getPublicKey() throws Exception {
        String url = apiHost + "/api/Auth/GetPublicKey?APIkey=" + apiKey;

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.body() == null) {
                throw new RuntimeException("Response body is null");
            }

            String responseStr = response.body().string();
            JSONParser jsonParser = new JSONParser();
            JSONObject jsonObject = (JSONObject) jsonParser.parse(responseStr);

            String publicKey = (String) jsonObject.get("PublicKey");
            if (publicKey == null) {
                throw new RuntimeException("Public Key가 null입니다.");
            }

            return publicKey;
        }
    }

    // RSA 암호화
    private String rsaEncrypt(String publicKeyStr, byte[] data) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(publicKeyStr);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PublicKey publicKey = keyFactory.generatePublic(spec);

        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encrypted = cipher.doFinal(data);

        return Base64.getEncoder().encodeToString(encrypted);
    }

    // AES 암호화
    private String aesEncrypt(byte[] key, byte[] iv, String plainText) throws Exception {
        if (plainText == null || plainText.isEmpty()) {
            return "";
        }

        SecretKeySpec secretKey = new SecretKeySpec(key, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes("UTF-8"));

        return Base64.getEncoder().encodeToString(encrypted);
    }

    // 처방조제 데이터만 필터링
    private Object filterPrescriptionData(Object rawData) {
        try {
            JSONObject jsonData;
            if (rawData instanceof String) {
                JSONParser parser = new JSONParser();
                jsonData = (JSONObject) parser.parse((String) rawData);
            } else {
                jsonData = (JSONObject) rawData;
            }

            // ResultList에서 JinRyoHyungTae가 "처방조제"인 것만 필터링
            JSONArray resultList = (JSONArray) jsonData.get("ResultList");
            if (resultList != null) {
                JSONArray filteredList = new JSONArray();

                for (Object item : resultList) {
                    JSONObject record = (JSONObject) item;
                    String jinRyoHyungTae = (String) record.get("JinRyoHyungTae");

                    // 디버깅을 위해 모든 진료형태 출력
                    System.out.println("진료형태 발견: " + jinRyoHyungTae);

                    // 임시로 모든 데이터를 포함 (나중에 필요한 것만 필터링)
                    filteredList.add(record);

                    // 또는 여러 진료형태를 포함하도록 수정
                    // if ("처방조제".equals(jinRyoHyungTae) ||
                    //     "외래".equals(jinRyoHyungTae) ||
                    //     "입원".equals(jinRyoHyungTae)) {
                    //     filteredList.add(record);
                    // }
                }

                // 필터링된 결과로 교체
                jsonData.put("ResultList", filteredList);
                System.out.println("필터링 완료: " + filteredList.size() + "건 (원본: " + resultList.size() + "건)");
            }

            return jsonData;

        } catch (Exception e) {
            System.err.println("처방조제 데이터 필터링 실패: " + e.getMessage());
            return rawData;
        }
    }

    // 기저질환 분석 메소드 수정
    public DiseaseAnalysisDto analyzeDiseases(Object medicationData) {
        try {
            System.out.println("=== 기저질환 분석 시작 (Claude AI) ===");

            // Claude AI 서비스를 통해 기저질환 분석
            DiseaseAnalysisDto analysisResult = claudeAiService.analyzePrescriptionForDiseases(medicationData);

            System.out.println("Claude AI 분석 완료: " + analysisResult.getStatus());

            return analysisResult;

        } catch (Exception e) {
            System.err.println("기저질환 분석 중 오류 발생: " + e.getMessage());
            e.printStackTrace();

            DiseaseAnalysisDto errorResponse = new DiseaseAnalysisDto();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("기저질환 분석 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.setPredictedDiseases(new java.util.ArrayList<>());
            errorResponse.setRiskLevel("UNKNOWN");

            return errorResponse;
        }
    }
}

    /* 기저질환 분석 (ChatGPT AI 활용)
    public DiseaseAnalysisDto analyzeDiseases(Object medicationData) {
        try {
            System.out.println("=== 기저질환 분석 시작 (ChatGPT AI) ===");

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
    */