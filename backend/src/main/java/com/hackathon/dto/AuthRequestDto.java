package com.hackathon.dto;

import com.hackathon.enums.AuthMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequestDto {
    private String userName;
    private String birthDate;
    private String userCellphoneNumber;

    // String 대신 AuthMethod enum 사용도 가능하지만
    // 프론트엔드와의 호환성을 위해 String 유지
    private String authMethod;

    // 헬퍼 메서드 추가
    public AuthMethod getAuthMethodEnum() {
        return AuthMethod.fromMethodSafe(authMethod);
    }
}
