package com.skillforge.controller;

import com.skillforge.entity.CodingSubmission;
import com.skillforge.repository.CodingSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminSubmissionsController {

    private final CodingSubmissionRepository codingRepo;

    public AdminSubmissionsController(CodingSubmissionRepository codingRepo) {
        this.codingRepo = codingRepo;
    }

    private boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> allSubmissions(@RequestParam(required = false) Long courseId,
                                            @RequestParam(required = false) Long userId,
                                            Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Only admins allowed");
        List<CodingSubmission> list;
        if (courseId != null) list = codingRepo.findByCourseId(courseId);
        else if (userId != null) list = codingRepo.findByUserId(userId);
        else list = codingRepo.findAll();
        return ResponseEntity.ok(list);
    }
}
