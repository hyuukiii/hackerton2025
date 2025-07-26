package com.hackerton.team2.dto;

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
}
