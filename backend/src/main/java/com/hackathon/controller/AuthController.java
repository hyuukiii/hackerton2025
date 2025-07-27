package com.hackathon.controller;

import com.hackathon.dto.AuthRequestDto;
import com.hackathon.dto.AuthResponseDto;
import com.hackathon.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // 간편인증 요청 API - 필터링된 DTO 반환 (통합 API 호출용)
    @PostMapping("/request")
    public AuthResponseDto requestAuth(@RequestBody AuthRequestDto authRequest) throws Exception {
        return authService.requestSimpleAuth(authRequest);
    }

    // 간편인증 요청 API - 원본 JSON 반환 (디버깅용)
    @PostMapping("/request-raw")
    public Object requestAuthRaw(@RequestBody AuthRequestDto authRequest) throws Exception {
        return authService.requestSimpleAuthRaw(authRequest);
    }

    // 회원가입 완료 API (해커톤용 임시 구현)
    @PostMapping("/register/complete")
    public ResponseEntity<Map<String, Object>> completeRegistration(@RequestBody Map<String, Object> registrationData) {
        try {
            System.out.println("=== 회원가입 완료 요청 받음 ===");
            System.out.println("받은 데이터: " + registrationData);

            // 해커톤용 간단한 처리
            // 실제로는 여기서 데이터베이스에 사용자 정보를 저장해야 함

            String userId = (String) registrationData.get("userId");
            String userName = (String) registrationData.get("userName");
            String phoneNumber = (String) registrationData.get("phoneNumber");

            // 임시 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다.");
            response.put("token", "temp-jwt-token-" + System.currentTimeMillis());

            Map<String, Object> user = new HashMap<>();
            user.put("userId", userId);
            user.put("name", userName);
            user.put("phoneNumber", phoneNumber);
            response.put("user", user);

            System.out.println("회원가입 완료 - userId: " + userId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("회원가입 완료 처리 중 오류: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "회원가입 처리 중 오류가 발생했습니다.");

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // 테스트용 GET 메소드
    @GetMapping("/test")
    public String test() {
        return "Auth API is working!";
    }

    // 헬스체크용
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
