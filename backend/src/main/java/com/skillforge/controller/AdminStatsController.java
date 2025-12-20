package com.skillforge.controller;

import com.skillforge.entity.Course;
import com.skillforge.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminStatsController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;

    public AdminStatsController(CourseRepository courseRepo, EnrollmentRepository enrollmentRepo) {
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    private boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping("/stats/enrollments")
    public ResponseEntity<?> enrollmentStats(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Only admins allowed");

        List<Course> courses = courseRepo.findAll();
        List<Map<String, Object>> perCourse = courses.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            long count = enrollmentRepo.countByCourseId(c.getId());
            m.put("courseId", c.getId());
            m.put("title", c.getTitle());
            m.put("enrollments", count);
            return m;
        }).collect(Collectors.toList());

        long totalEnrollments = perCourse.stream().mapToLong(m -> ((Number)m.get("enrollments")).longValue()).sum();
        Map<String,Object> resp = new HashMap<>();
        resp.put("totalCourses", courses.size());
        resp.put("totalEnrollments", totalEnrollments);
        resp.put("perCourse", perCourse);
        return ResponseEntity.ok(resp);
    }
    @GetMapping("/logs")
    public ResponseEntity<?> recentLogs(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Only admins allowed");
        return ResponseEntity.ok(activityLogRepository.findTop100ByOrderByCreatedAtDesc());
    }
}
