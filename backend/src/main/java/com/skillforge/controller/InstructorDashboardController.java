package com.skillforge.controller;

import com.skillforge.dto.dashboard.InstructorDashboardDto;
import com.skillforge.service.InstructorDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructor")
public class InstructorDashboardController {

    private final InstructorDashboardService dashboardService;

    public InstructorDashboardController(InstructorDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).body("Unauthenticated");
        // principal is userId string
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        // ensure role is instructor or admin
        boolean allowed = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR") || a.getAuthority().equals("ROLE_ADMIN"));
        if (!allowed) return ResponseEntity.status(403).body("Only instructors/admins can access");

        InstructorDashboardDto dto = dashboardService.getDashboardForInstructor(userId);
        return ResponseEntity.ok(dto);
    }
}
