package com.hackathon.dto;

public class MedicationRequestDto {
    private String cxId;
    private String privateAuthType;
    private String reqTxId;
    private String token;
    private String txId;
    private String userName;
    private String birthDate;
    private String userCellphoneNumber;
    
    // 기본 생성자
    public MedicationRequestDto() {}
    
    // 전체 매개변수 생성자
    public MedicationRequestDto(String cxId, String privateAuthType, String reqTxId, String token, String txId, String userName, String birthDate, String userCellphoneNumber) {
        this.cxId = cxId;
        this.privateAuthType = privateAuthType;
        this.reqTxId = reqTxId;
        this.token = token;
        this.txId = txId;
        this.userName = userName;
        this.birthDate = birthDate;
        this.userCellphoneNumber = userCellphoneNumber;
    }
    
    // Getter, Setter
    public String getCxId() {
        return cxId;
    }
    
    public void setCxId(String cxId) {
        this.cxId = cxId;
    }
    
    public String getPrivateAuthType() {
        return privateAuthType;
    }
    
    public void setPrivateAuthType(String privateAuthType) {
        this.privateAuthType = privateAuthType;
    }
    
    public String getReqTxId() {
        return reqTxId;
    }
    
    public void setReqTxId(String reqTxId) {
        this.reqTxId = reqTxId;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getTxId() {
        return txId;
    }
    
    public void setTxId(String txId) {
        this.txId = txId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getBirthDate() {
        return birthDate;
    }
    
    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }
    
    public String getUserCellphoneNumber() {
        return userCellphoneNumber;
    }
    
    public void setUserCellphoneNumber(String userCellphoneNumber) {
        this.userCellphoneNumber = userCellphoneNumber;
    }
}
