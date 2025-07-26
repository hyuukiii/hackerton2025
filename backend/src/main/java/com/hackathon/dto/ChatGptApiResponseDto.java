package com.hackerton.team2.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatGptApiResponseDto {
    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;
    
    // 새로운 필드들
    @JsonProperty("service_tier")
    private String serviceTier;
    
    @JsonProperty("system_fingerprint")
    private String systemFingerprint;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Choice {
        private int index;
        private Message message;
        
        @JsonProperty("finish_reason")
        private String finishReason;
        
        private Object logprobs; // 로그 확률 정보 (보통 null)
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
        private String refusal; // ChatGPT API의 새로운 필드
        private Object annotations; // 주석 정보 (보통 빈 배열)
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Usage {
        @JsonProperty("prompt_tokens")
        private int promptTokens;
        
        @JsonProperty("completion_tokens")
        private int completionTokens;
        
        @JsonProperty("total_tokens")
        private int totalTokens;
        
        // 새로운 필드들
        @JsonProperty("prompt_tokens_details")
        private Object promptTokensDetails;
        
        @JsonProperty("completion_tokens_details")
        private Object completionTokensDetails;
    }
}
