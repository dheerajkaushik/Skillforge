package com.skillforge.runner.dto;

import java.util.List;

public class BatchRunRequest {
    private String code;
    private List<String> inputs; // List of all test case inputs

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public List<String> getInputs() { return inputs; }
    public void setInputs(List<String> inputs) { this.inputs = inputs; }
}