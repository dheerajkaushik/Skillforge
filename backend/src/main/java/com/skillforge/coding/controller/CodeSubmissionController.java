package com.skillforge.coding.controller;

import java.util.List;
import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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
