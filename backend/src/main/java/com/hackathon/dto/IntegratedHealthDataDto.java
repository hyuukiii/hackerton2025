package com.hackerton.team2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegratedHealthDataDto {
    private Object healthCheckupData;
    private Object medicationData;
    private String status;
    private String message;
}
