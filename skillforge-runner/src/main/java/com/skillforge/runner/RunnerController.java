//package com.skillforge.runner;
//
//import com.skillforge.runner.dto.RunRequest; // Ensure this import exists
//import org.springframework.web.bind.annotation.*;
//import com.skillforge.runner.RunnerResult;
//
//@RestController
//@RequestMapping("/run")
//public class RunnerController {
//
//    private final RunnerService runnerService;
//
//    public RunnerController(RunnerService runnerService) {
//        this.runnerService = runnerService;
//    }
//
//    @PostMapping("/java")
//    public RunnerResult runJavaCode(@RequestBody RunRequest request) {
//        // ✅ FIXED: Extract code and input from the JSON Request Object
//        System.out.println("📥 Runner Received -> Code length: " + (request.getCode() != null ? request.getCode().length() : "null") + ", Input: [" + request.getInput() + "]");
//        return runnerService.runJava(request.getCode(), request.getInput());
//    }
//}

package com.skillforge.runner;

import com.skillforge.runner.dto.RunRequest;
import com.skillforge.runner.RunnerResult; // Matches your package for RunnerResult
import com.skillforge.runner.RunnerService;
import org.springframework.web.bind.annotation.*;

@RestController
public class RunnerController {

    private final RunnerService runnerService;

    public RunnerController(RunnerService runnerService) {
        this.runnerService = runnerService;
    }

    // ✅ Health Check
    @GetMapping("/")
    public String healthCheck() {
        return "SkillForge Runner is Active & Ready! 🚀";
    }

    @PostMapping("/run/java")
    public RunnerResult runJavaCode(@RequestBody RunRequest request) {
        // ✅ FIX: Use .getCode() and .getInput() to match your DTO
        String codePreview = (request.getCode() != null)
                ? request.getCode().substring(0, Math.min(20, request.getCode().length())) + "..."
                : "null";

        System.out.println("📥 Runner Received -> Code: [" + codePreview + "], Input: [" + request.getInput() + "]");

        return runnerService.runJava(request.getCode(), request.getInput());
    }
}