package com.hackerton.team2.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatGptApiRequestDto {
    private String model;
    
    @JsonProperty("max_tokens")
    private int maxTokens;
    
    private double temperature = 0.7;
    
    private List<Message> messages;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}
