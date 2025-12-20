package com.skillforge.runner;



public class RunnerResult {

    private boolean success;


    private String output;


    private String error;


    private long executionTime;

    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }

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
}
