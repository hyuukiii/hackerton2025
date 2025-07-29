package com.hackathon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String cxId;
    private String privateAuthType;
    private String reqTxId;
    private String token;
    private String txId;
    private String userName;
    private String birthDate;
    private String userCellphoneNumber;
    private String authMethod; // 어떤 방법으로 사용자가 인증 했는지 ex: kakao, naver, onepass
}
