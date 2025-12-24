package com.skillforge.coding.service.runner;

import com.skillforge.coding.entity.TestCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class RunnerClient {

    @Value("${runner.url}")
    private String runnerUrl;

    private final RestTemplate restTemplate;

    public RunnerClient() {
        this.restTemplate = new RestTemplate();
    }

    // Keep the old method if needed for single runs
    public RunnerResult runJavaCode(String sourceCode, TestCase testCase) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("code", sourceCode);
            payload.put("input", testCase.getInput() != null ? testCase.getInput() : "");

            return restTemplate.postForObject(runnerUrl + "/run/java", payload, RunnerResult.class);
        } catch (Exception e) {
            RunnerResult errorResult = new RunnerResult();
            errorResult.setOutput("Connection Failed");
            errorResult.setError(e.getMessage());
            return errorResult;
        }
    }

    // ✅ NEW BATCH METHOD
    public List<RunnerResult> runBatch(String sourceCode, List<String> inputs) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("code", sourceCode);
            payload.put("inputs", inputs); // Sending the LIST

            String fullUrl = runnerUrl + "/run/java/batch";
            System.out.println("🚀 Sending Batch to Runner: " + fullUrl);

            // We expect an Array of RunnerResults back
            RunnerResult[] response = restTemplate.postForObject(
                    fullUrl,
                    payload,
                    RunnerResult[].class
            );

            return response != null ? Arrays.asList(response) : new ArrayList<>();

        } catch (Exception e) {
            System.err.println("❌ Runner Batch Connection Failed: " + e.getMessage());
            return new ArrayList<>(); // Return empty list on failure
        }
    }
}