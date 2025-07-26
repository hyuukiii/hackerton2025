package com.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseAnalysisDto {
    private String status;
    private String message;
    private List<PredictedDisease> predictedDiseases;
    private String analysisReason;
    private List<String> recommendations;
    private String riskLevel; // LOW, MEDIUM, HIGH
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictedDisease {
        private String diseaseName;
        private String probability; // 예: "높음", "중간", "낮음"
        private String reason;
        private List<String> relatedMedications;
    }
}
