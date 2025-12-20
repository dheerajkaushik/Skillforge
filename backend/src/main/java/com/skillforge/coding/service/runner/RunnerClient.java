package com.skillforge.coding.service.runner;

import com.skillforge.coding.entity.TestCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service; // Changed from @Component to @Service (better semantic)
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class RunnerClient {

    // ✅ FIX 1: Injection must happen at Class Level
    @Value("${runner.url}")
    private String runnerUrl;

    private final RestTemplate restTemplate;

    public RunnerClient() {
        this.restTemplate = new RestTemplate();
    }

    public RunnerResult runJavaCode(String sourceCode, TestCase testCase) {
        try {
            // ✅ FIX 2: Create a JSON Payload (Map) instead of sending raw string
            // The Runner expects: { "code": "...", "input": "..." }
            Map<String, String> payload = new HashMap<>();
            payload.put("code", sourceCode);
            payload.put("input", testCase.getInput() != null ? testCase.getInput() : "");
            payload.put("language", "java");

            System.out.println("🚀 Sending to Runner: " + runnerUrl);

            // ✅ FIX 3: Use the injected URL variable
            return restTemplate.postForObject(
                    runnerUrl,
                    payload,
                    RunnerResult.class
            );

        } catch (Exception e) {
            System.err.println("❌ Runner Connection Failed: " + e.getMessage());
            RunnerResult fallback = new RunnerResult();
            fallback.setError("Connection failed: " + e.getMessage());
            return fallback;
        }
    }
}