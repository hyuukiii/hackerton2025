package com.hackathon.service;

import com.hackathon.dto.AuthRequestDto;
import com.hackathon.dto.AuthResponseDto;
import okhttp3.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class AuthService {

    @Value("${tilko.api.host}")
    private String apiHost;

    @Value("${tilko.api.key}")
    private String apiKey;

    // JSON 응답을 AuthResponseDto로 변환 (API 스펙에 맞게 ENC: 접두어 추가)
    private AuthResponseDto parseAuthResponse(String jsonStr) throws ParseException {
        System.out.println("=== 간편인증 응답 파싱 시작 ===");
        System.out.println("원본 응답: " + jsonStr);

        JSONParser parser = new JSONParser();
        JSONObject jsonObject = (JSONObject) parser.parse(jsonStr);

        AuthResponseDto responseDto = new AuthResponseDto();

        // Tilko API 응답 구조에 따라 필드 직접 추출
        // 간편인증 API는 ResultData 없이 최상위 레벨에 데이터 반환
        String cxId = (String) jsonObject.get("CxId");
        String privateAuthType = (String) jsonObject.get("PrivateAuthType");
        String reqTxId = (String) jsonObject.get("ReqTxId");
        String token = (String) jsonObject.get("Token");
        String txId = (String) jsonObject.get("TxId");
        String userName = (String) jsonObject.get("UserName");
        String birthDate = (String) jsonObject.get("BirthDate");
        String userCellphoneNumber = (String) jsonObject.get("UserCellphoneNumber");

        // Status 확인 (존재하는 경우)
        String status = (String) jsonObject.get("Status");
        String statusSeq = jsonObject.get("StatusSeq") != null ?
                jsonObject.get("StatusSeq").toString() : null;

        System.out.println("파싱된 값들:");
        System.out.println("- Status: " + status);
        System.out.println("- StatusSeq: " + statusSeq);
        System.out.println("- CxId: " + cxId);
        System.out.println("- PrivateAuthType: " + privateAuthType);
        System.out.println("- ReqTxId: " + reqTxId);
        System.out.println("- Token: " + (token != null ? "있음" : "없음"));
        System.out.println("- TxId: " + txId);
        System.out.println("- UserName: " + (userName != null ? "있음" : "없음"));
        System.out.println("- BirthDate: " + (birthDate != null ? "있음" : "없음"));
        System.out.println("- UserCellphoneNumber: " + (userCellphoneNumber != null ? "있음" : "없음"));

        // 에러 응답인 경우
        if ("Error".equals(status)) {
            String errorMessage = (String) jsonObject.get("Message");
            String errorCode = jsonObject.get("ErrorCode") != null ?
                    jsonObject.get("ErrorCode").toString() : "";
            throw new RuntimeException("간편인증 실패 - ErrorCode: " + errorCode +
                    ", Message: " + errorMessage);
        }

        // ResultData가 있는 경우 (일부 응답에서 사용)
        JSONObject resultData = (JSONObject) jsonObject.get("ResultData");
        if (resultData != null) {
            System.out.println("ResultData가 존재합니다. ResultData에서 값 추출");
            cxId = cxId != null ? cxId : (String) resultData.get("CxId");
            privateAuthType = privateAuthType != null ? privateAuthType : (String) resultData.get("PrivateAuthType");
            reqTxId = reqTxId != null ? reqTxId : (String) resultData.get("ReqTxId");
            token = token != null ? token : (String) resultData.get("Token");
            txId = txId != null ? txId : (String) resultData.get("TxId");
            userName = userName != null ? userName : (String) resultData.get("UserName");
            birthDate = birthDate != null ? birthDate : (String) resultData.get("BirthDate");
            userCellphoneNumber = userCellphoneNumber != null ? userCellphoneNumber : (String) resultData.get("UserCellphoneNumber");
        }

        // 필수 값 검증
        if (reqTxId == null || reqTxId.trim().isEmpty()) {
            System.err.println("ReqTxId가 없습니다. 전체 응답 확인:");
            System.err.println(jsonStr);
            throw new RuntimeException("간편인증 응답에 ReqTxId가 없습니다.");
        }

        if (cxId == null || cxId.trim().isEmpty()) {
            throw new RuntimeException("간편인증 응답에 CxId가 없습니다.");
        }

        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("간편인증 응답에 Token이 없습니다.");
        }

        responseDto.setCxId(cxId);
        responseDto.setPrivateAuthType(privateAuthType);
        responseDto.setReqTxId(reqTxId);
        responseDto.setToken(token);
        responseDto.setTxId(txId);

        // API 스펙에 맞게 ENC: 접두어 추가 (사용자 정보는 암호화되어 있음)
        responseDto.setUserName(userName != null ? "ENC:" + userName : null);
        responseDto.setBirthDate(birthDate != null ? "ENC:" + birthDate : null);
        responseDto.setUserCellphoneNumber(userCellphoneNumber != null ? "ENC:" + userCellphoneNumber : null);

        System.out.println("AuthResponseDto 생성 완료");
        System.out.println("- ReqTxId 최종값: " + responseDto.getReqTxId());

        return responseDto;
    }

    // 간편인증 요청 처리 - 필터링된 DTO 반환
    public AuthResponseDto requestSimpleAuth(AuthRequestDto authRequest) throws Exception {
        // RSA Public Key 조회
        String rsaPublicKey = getPublicKey();

        // AES Secret Key 및 IV 생성
        byte[] aesKey = new byte[16];
        new Random().nextBytes(aesKey);

        byte[] aesIv = new byte[]{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

        // AES Key를 RSA Public Key로 암호화
        String aesCipherKey = rsaEncrypt(rsaPublicKey, aesKey);

        // API URL 설정
        String url = apiHost + "/api/v1.0/nhissimpleauth/simpleauthrequest";

        // API 요청 파라미터 설정
        JSONObject json = new JSONObject();
        json.put("PrivateAuthType", "0");
        json.put("UserName", aesEncrypt(aesKey, aesIv, authRequest.getUserName()));
        json.put("BirthDate", aesEncrypt(aesKey, aesIv, authRequest.getBirthDate()));
        json.put("UserCellphoneNumber", aesEncrypt(aesKey, aesIv, authRequest.getUserCellphoneNumber()));

        System.out.println("간편인증 요청 URL: " + url);
        System.out.println("간편인증 요청 데이터: " + json.toJSONString());

        // API 호출
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();

        Request request = new Request.Builder()
                .url(url)
                .addHeader("API-KEY", apiKey)
                .addHeader("ENC-KEY", aesCipherKey)
                .post(RequestBody.create(MediaType.get("application/json; charset=utf-8"), json.toJSONString()))
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println("HTTP Status Code: " + response.code());

            if (response.body() == null) {
                throw new IOException("Response body is null");
            }

            String responseStr = response.body().string();
            System.out.println("간편인증 원본 응답:");
            System.out.println(responseStr);

            // JSON 응답을 DTO로 변환
            return parseAuthResponse(responseStr);
        }
    }

    // 간편인증 요청 처리 - 원본 JSON 반환 (Raw) - 이 메서드가 누락되어 있었습니다!
    public Object requestSimpleAuthRaw(AuthRequestDto authRequest) throws Exception {
        // RSA Public Key 조회
        String rsaPublicKey = getPublicKey();

        // AES Secret Key 및 IV 생성
        byte[] aesKey = new byte[16];
        new Random().nextBytes(aesKey);

        byte[] aesIv = new byte[]{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

        // AES Key를 RSA Public Key로 암호화
        String aesCipherKey = rsaEncrypt(rsaPublicKey, aesKey);

        // API URL 설정
        String url = apiHost + "/api/v1.0/nhissimpleauth/simpleauthrequest";

        // API 요청 파라미터 설정
        JSONObject json = new JSONObject();
        json.put("PrivateAuthType", "0");
        json.put("UserName", aesEncrypt(aesKey, aesIv, authRequest.getUserName()));
        json.put("BirthDate", aesEncrypt(aesKey, aesIv, authRequest.getBirthDate()));
        json.put("UserCellphoneNumber", aesEncrypt(aesKey, aesIv, authRequest.getUserCellphoneNumber()));

        // API 호출
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();

        Request request = new Request.Builder()
                .url(url)
                .addHeader("API-KEY", apiKey)
                .addHeader("ENC-KEY", aesCipherKey)
                .post(RequestBody.create(MediaType.get("application/json; charset=utf-8"), json.toJSONString()))
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.body() == null) {
                throw new IOException("Response body is null");
            }

            String responseStr = response.body().string();

            // JSON 파싱해서 원본 그대로 반환
            JSONParser parser = new JSONParser();
            return parser.parse(responseStr);
        }
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
                throw new IOException("Response body is null");
            }

            String responseStr = response.body().string();
            JSONParser jsonParser = new JSONParser();
            JSONObject jsonObject = (JSONObject) jsonParser.parse(responseStr);

            return (String) jsonObject.get("PublicKey");
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
}