package com.hackerton.team2.controller;

import com.hackerton.team2.dto.AuthResponseDto;
import com.hackerton.team2.dto.IntegratedHealthDataDto;
import com.hackerton.team2.dto.DiseaseAnalysisDto;
import com.hackerton.team2.service.IntegratedHealthService;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/integrated")
public class IntegratedHealthController {
    
    @Autowired
    private IntegratedHealthService integratedHealthService;
    
    // 통합 건강 정보 조회 API (건강검진 + 복용약물)
    @PostMapping("/health-data")
    public IntegratedHealthDataDto getIntegratedHealthData(@RequestBody AuthResponseDto authData) throws Exception {
        try {
            return integratedHealthService.getIntegratedHealthData(authData);
        } catch (Exception e) {
            System.out.println("외부 API 실패 "+e.getMessage());
            return null;
        }
    }
    
    // ChatGPT AI 기저질환 분석 API
    @PostMapping("/analyze-diseases")
    public DiseaseAnalysisDto analyzeDiseases(@RequestBody Object medicationData) {
        try {
            System.out.println("=== 기저질환 분석 요청 받음 ===");
            System.out.println("입력 데이터: " + medicationData.toString());
            
            return integratedHealthService.analyzeDiseases(medicationData);
            
        } catch (Exception e) {
            System.err.println("기저질환 분석 API 오류: " + e.getMessage());
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

}
