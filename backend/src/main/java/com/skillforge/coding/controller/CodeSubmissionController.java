package com.skillforge.coding.controller;

import java.util.List;
import java.security.Principal;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.skillforge.coding.repository.CodeSubmissionRepository;

import com.skillforge.coding.entity.CodeSubmission;
import com.skillforge.coding.service.CodeSubmissionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coding/submissions")
public class CodeSubmissionController {

    private final CodeSubmissionService submissionService;
    private final CodeSubmissionRepository submissionRepository;

    public CodeSubmissionController(CodeSubmissionService submissionService,CodeSubmissionRepository submissionRepository) {
        this.submissionService = submissionService;
        this.submissionRepository = submissionRepository;
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
    public ResponseEntity<List<CodeSubmission>> getMySubmissions(Principal principal) {
        // Principal holds the email/username extracted from the JWT token
        String email = principal.getName();

        List<CodeSubmission> history = submissionService.getSubmissionsForUserEmail(email);

        return ResponseEntity.ok(history);
    }
    @GetMapping
    public ResponseEntity<List<CodeSubmission>> getAllSubmissions() {
        // Fetches all submissions, sorted by newest first
        List<CodeSubmission> allSubmissions = submissionRepository.findAll(
                Sort.by(Sort.Direction.DESC, "submittedAt")
        );
        return ResponseEntity.ok(allSubmissions);
    }

}
