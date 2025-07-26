package com.hackerton.team2.controller;

import com.hackerton.team2.dto.AuthRequestDto;
import com.hackerton.team2.dto.AuthResponseDto;
import com.hackerton.team2.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
