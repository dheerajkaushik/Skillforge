package com.skillforge.coding.controller;

import com.skillforge.coding.entity.CodeSubmission;
import com.skillforge.coding.service.CodeSubmissionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coding/submissions")
public class CodeSubmissionController {

    private final CodeSubmissionService submissionService;

    public CodeSubmissionController(CodeSubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public CodeSubmission submitCode(
            @RequestParam Long problemId,
            @RequestParam Long studentId,
            @RequestBody String sourceCode
    ) {
        return submissionService.submitCode(problemId, studentId, sourceCode);
    }
}
