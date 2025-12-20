package com.skillforge.runner.dto;

public class RunRequest {
    // ✅ FIXED: Field names match the backend JSON keys
    private String language;
    private String code;     // Changed from 'source' to 'code'
    private String input;    // Changed from 'stdin' to 'input'

    // Getters and Setters
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
}