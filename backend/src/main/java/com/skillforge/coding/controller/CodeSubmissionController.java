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
    @GetMapping("/my")
    public ResponseEntity<List<Submission>> getMySubmissions(Principal principal) {
        // Principal holds the email/username extracted from the JWT token
        String email = principal.getName();

        List<Submission> history = submissionService.getSubmissionsForUser(email);

        return ResponseEntity.ok(history);
    }
}
