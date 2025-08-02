package com.hackathon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaudeApiRequestDto {
    private String model;

    @JsonProperty("max_tokens")
    private int maxTokens;

    private double temperature = 0.3;

    private List<Message> messages;

    @JsonProperty("anthropic_version")
    private String anthropicVersion = "2023-06-01";

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}