package com.skillforge.coding.service.runner;

import com.skillforge.coding.entity.TestCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity; // ✅ IMPORT THIS
import org.springframework.http.HttpHeaders; // ✅ IMPORT THIS
import org.springframework.http.MediaType;   // ✅ IMPORT THIS
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

    // Keep the old method if needed (updated with headers too, just in case)
    public RunnerResult runJavaCode(String sourceCode, TestCase testCase) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("code", sourceCode);
            payload.put("input", testCase.getInput() != null ? testCase.getInput() : "");

            // ✅ ADD HEADERS
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(payload, headers);

            return restTemplate.postForObject(runnerUrl + "/run/java", requestEntity, RunnerResult.class);
        } catch (Exception e) {
            RunnerResult errorResult = new RunnerResult();
            errorResult.setOutput("Connection Failed");
            errorResult.setError(e.getMessage());
            return errorResult;
        }
    }

    // ✅ BATCH METHOD (With Anti-Block Headers)
    public List<RunnerResult> runBatch(String sourceCode, List<String> inputs) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("code", sourceCode);
            payload.put("inputs", inputs);

            String fullUrl = runnerUrl + "/run/java/batch";
            System.out.println("🚀 Sending Batch to Runner: " + fullUrl);

            // ✅ 1. Create Headers to look like a Browser
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

            // ✅ 2. Wrap Payload + Headers
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            // ✅ 3. Send Request
            RunnerResult[] response = restTemplate.postForObject(
                    fullUrl,
                    requestEntity,
                    RunnerResult[].class
            );

            return response != null ? Arrays.asList(response) : new ArrayList<>();

        } catch (Exception e) {
            System.err.println("❌ Runner Batch Connection Failed: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}