package com.hackathon.config;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import javax.annotation.PostConstruct;

@Component
public class ClaudeConfigCheck {

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.url}")
    private String apiUrl;

    @Value("${claude.api.model}")
    private String model;

    @PostConstruct
    public void checkConfig() {
        System.out.println("=== Claude API 설정 확인 ===");
        System.out.println("API URL: " + apiUrl);
        System.out.println("Model: " + model);
        System.out.println("API Key 설정됨: " + (apiKey != null && !apiKey.isEmpty()));
        System.out.println("API Key 길이: " + (apiKey != null ? apiKey.length() : 0));
        System.out.println("========================");
    }
}