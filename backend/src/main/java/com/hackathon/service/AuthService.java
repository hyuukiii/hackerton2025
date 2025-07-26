package com.hackerton.team2.service;

import com.hackerton.team2.dto.AuthRequestDto;
import com.hackerton.team2.dto.AuthResponseDto;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
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
public class AuthService {
    
    private final String apiHost = "https://dev.tilko.net";
    private final String apiKey = "49a84c1bcba847f4922da4208540ee65";
    
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

        // Base64로 인코딩
        return Base64.getEncoder().encodeToString(byteEncryptedData);
    }

    // RSA 암호화 함수
    public String rsaEncrypt(String rsaPublicKey, byte[] aesKey) throws NoSuchAlgorithmException, UnsupportedEncodingException, InvalidKeySpecException, NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        byte[] keyBytes = Base64.getDecoder().decode(rsaPublicKey.getBytes("UTF-8"));
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        PublicKey fileGeneratedPublicKey = keyFactory.generatePublic(spec);
        RSAPublicKey key = (RSAPublicKey) fileGeneratedPublicKey;

        // 만들어진 공개키객체를 기반으로 암호화모드로 설정하는 과정
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, key);

        // 평문을 암호화하는 과정
        byte[] byteEncryptedData = cipher.doFinal(aesKey);

        // Base64로 인코딩
        return Base64.getEncoder().encodeToString(byteEncryptedData);
    }

    // RSA 공개키(Public Key) 조회 함수
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
            // JSON 응답을 DTO로 변환
            return parseAuthResponse(responseStr);
        }
    }
    
    // 간편인증 요청 처리 - 원본 JSON 반환 (Raw)
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
    
    // JSON 응답을 AuthResponseDto로 변환 (API 스펙에 맞게 ENC: 접두어 추가)
    private AuthResponseDto parseAuthResponse(String jsonStr) throws ParseException {
        JSONParser parser = new JSONParser();
        JSONObject jsonObject = (JSONObject) parser.parse(jsonStr);
        
        AuthResponseDto responseDto = new AuthResponseDto();

        // ResultData에서 다음 API 호출에 필요한 데이터만 추출
        JSONObject resultDataJson = (JSONObject) jsonObject.get("ResultData");
        if (resultDataJson != null) {
            responseDto.setCxId((String) resultDataJson.get("CxId"));
            responseDto.setPrivateAuthType((String) resultDataJson.get("PrivateAuthType"));
            responseDto.setReqTxId((String) resultDataJson.get("ReqTxId"));
            responseDto.setToken((String) resultDataJson.get("Token"));
            responseDto.setTxId((String) resultDataJson.get("TxId"));
            
            // API 스펙에 맞게 ENC: 접두어 추가
            String userName = (String) resultDataJson.get("UserName");
            String birthDate = (String) resultDataJson.get("BirthDate");
            String userCellphoneNumber = (String) resultDataJson.get("UserCellphoneNumber");
            
            responseDto.setUserName(userName != null ? "ENC:" + userName : null);
            responseDto.setBirthDate(birthDate != null ? "ENC:" + birthDate : null);
            responseDto.setUserCellphoneNumber(userCellphoneNumber != null ? "ENC:" + userCellphoneNumber : null);
        }
        
        return responseDto;
    }
}
