package com.skillforge.runner;

import com.skillforge.runner.dto.RunRequest; // Ensure this import exists
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/run")
public class RunnerController {

    private final RunnerService runnerService;

    public RunnerController(RunnerService runnerService) {
        this.runnerService = runnerService;
    }

    @PostMapping("/java")
    public RunnerResult runJavaCode(@RequestBody RunRequest request) {
        // ✅ FIXED: Extract code and input from the JSON Request Object
        System.out.println("📥 Runner Received -> Code length: " + (request.getCode() != null ? request.getCode().length() : "null") + ", Input: [" + request.getInput() + "]");
        return runnerService.runJava(request.getCode(), request.getInput());
    }
}