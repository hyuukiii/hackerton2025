package com.hackathon.enums;

public enum AuthMethod {
    KAKAO("kakao",      "0", "카카오"),
    PAYKO("payko",      "1", "페이코"),
    KUKMIN("kukmin",    "2", "국민은행"),
    SAMSUNG("samsung",  "3","삼성패스"),
    PASS("pass",        "4", "디지털원패스"),
    SHINHAN("shinhan",  "5", "신한"),
    NAVER("naver",      "6", "네이버");

    private final String method;
    private final String privateAuthType;
    private final String description;

    AuthMethod(String method, String privateAuthType, String description){
        this.method = method;
        this.privateAuthType = privateAuthType;
        this.description = description;
    }

    public String getMethod() {
        return method;
    }

    public String getPrivateAuthType() {
        return privateAuthType;
    }

    public String getDescription() {
        return description;
    }

    // 문자열로부터 Enum 찾기
    public static AuthMethod fromMethod(String method) {
        if (method == null) {
            return PASS; // 기본값
        }

        for (AuthMethod authMethod : values()) {
            if (authMethod.method.equalsIgnoreCase(method)) {
                return authMethod;
            }
        }

        // 알 수 없는 방법일 경우 예외 처리
        throw new IllegalArgumentException("지원하지 않는 인증 방법입니다: " + method);
    }

    // 안전한 변환 (예외 대신 기본값 반환)
    public static AuthMethod fromMethodSafe(String method) {
        try {
            return fromMethod(method);
        } catch (IllegalArgumentException e) {
            return PASS; // 기본값
        }

    }
}