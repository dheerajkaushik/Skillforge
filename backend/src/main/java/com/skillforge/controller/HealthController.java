package com.skillforge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class HealthController {

    // You can hardcode this, or use @Value("${RUNNER_URL}") to read from env vars
    private final String runnerUrl = "https://skillforge-runner.onrender.com";

    @GetMapping("/api/wake-up")
    public ResponseEntity<String> wakeUp() {
        // 1. Backend is now awake (because this code is running)

        // 2. Configure a short timeout (e.g., 2 seconds)
        // We don't want the user to wait for the Runner to actually boot;
        // we just want to send the network packet to trigger Render.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000); // 2 seconds
        factory.setReadTimeout(2000);

        RestTemplate restTemplate = new RestTemplate(factory);

        try {
            // This will likely fail with a timeout if the runner is sleeping,
            // but the request hits Render, so it starts waking up!
            restTemplate.getForObject(runnerUrl + "/health", String.class);
        } catch (Exception e) {
            // Totally fine to ignore errors here.
            System.out.println("Triggered runner wake-up. Result: " + e.getMessage());
        }

        return ResponseEntity.ok("Services Waking Up...");
    }
}