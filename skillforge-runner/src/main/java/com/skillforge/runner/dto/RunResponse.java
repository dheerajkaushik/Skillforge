package com.skillforge.runner.dto;

public class RunResponse {
    public String stdout;
    public String stderr;
    public int exitCode;
    public boolean timedOut;
    public long runtimeMs;
}
