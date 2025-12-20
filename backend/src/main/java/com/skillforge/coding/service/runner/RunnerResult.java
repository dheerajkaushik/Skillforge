package com.skillforge.coding.service.runner;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RunnerResult {

    // ✅ FIX: Match the JSON key "output" sent by the Runner
    @JsonProperty("output")
    private String output;

    // ✅ FIX: Match the JSON key "error" sent by the Runner
    @JsonProperty("error")
    private String error;

    // ✅ FIX: Match the JSON key "executionTime" sent by the Runner
    @JsonProperty("executionTime")
    private long executionTime;

    private boolean success;

    // --- Getters and Setters ---

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public long getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(long executionTime) {
        this.executionTime = executionTime;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}