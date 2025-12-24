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

import com.skillforge.runner.dto.BatchRunRequest;
import com.skillforge.runner.dto.RunRequest;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class RunnerController {

    private final RunnerService runnerService;

    public RunnerController(RunnerService runnerService) {
        this.runnerService = runnerService;
    }

    @GetMapping("/")
    public String healthCheck() {
        return "SkillForge Runner is Active & Ready! 🚀";
    }

    // Single Execution (Old method, keeping it just in case)
    @PostMapping("/run/java")
    public RunnerResult runJavaCode(@RequestBody RunRequest request) {
        return runnerService.runJava(request.getCode(), request.getInput());
    }

    // ✅ NEW BATCH ENDPOINT (Fixes 429 Error)
    @PostMapping("/run/java/batch")
    public List<RunnerResult> runJavaBatch(@RequestBody BatchRunRequest request) {
        List<RunnerResult> results = new ArrayList<>();

        System.out.println("📥 Batch Received -> Inputs count: " + request.getInputs().size());

        // We loop locally inside the server (Fast & No Network Overhead)
        for (String input : request.getInputs()) {
            results.add(runnerService.runJava(request.getCode(), input));
        }

        return results;
    }
}