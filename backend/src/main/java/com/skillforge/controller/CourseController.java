package com.skillforge.controller;

import java.util.Map;
import java.util.HashMap;

import com.skillforge.entity.Course;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.CodingSubmission;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.CodingSubmissionRepository;
import com.skillforge.repository.LessonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CodingSubmissionRepository codingRepo;

    private final LessonRepository lessonRepository;

    public CourseController(CourseRepository courseRepo,
                            EnrollmentRepository enrollmentRepo,
                            CodingSubmissionRepository codingRepo,
                            LessonRepository lessonRepository) {
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.codingRepo = codingRepo;
        this.lessonRepository=lessonRepository;
    }

    @GetMapping("/courses")
    public List<Course> listCourses() {
        return courseRepo.findAll();
    }

    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@RequestBody Course course, Authentication auth) {
        // Verify auth principal and role
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }

        String principal = auth.getPrincipal().toString();
        Long userId = Long.parseLong(principal);

        boolean isInstructor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isInstructor) {
            return ResponseEntity.status(403).body("Only instructors can create courses");
        }

        course.setInstructorId(userId);
        courseRepo.save(course);
        return ResponseEntity.ok(course);
    }


    @GetMapping("/courses/{id}")
    public ResponseEntity<?> getCourse(@PathVariable("id") Long id) {
        Optional<Course> c = courseRepo.findById(id);
        return c.<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/courses/{id}/enroll")
    public ResponseEntity<?> enroll(@PathVariable("id") Long id, Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        Optional<Enrollment> existing = enrollmentRepo.findByUserIdAndCourseId(userId, id);
        if (existing.isPresent()) return ResponseEntity.badRequest().body("Already enrolled");
        Enrollment e = new Enrollment();
        e.setUserId(userId);
        e.setCourseId(id);
        enrollmentRepo.save(e);
        return ResponseEntity.ok(e);
    }

    @GetMapping("/me/enrollments")
    public List<Enrollment> myEnrollments(Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        return enrollmentRepo.findByUserId(userId);
    }

//    @PostMapping("/courses/{id}/submit")
//    public ResponseEntity<?> submitCode(@PathVariable("id") Long id, @RequestBody CodingSubmission payload, Authentication auth) {
//        Long userId = Long.parseLong(auth.getPrincipal().toString());
//        payload.setCourseId(id);
//        payload.setUserId(userId);
//        // Simple stubbed runner: return a fake "output" until you implement sandbox
//        String fakeResult = "Output: OK (stubbed runner). Lines: " + (payload.getSourceCode() == null ? 0 : payload.getSourceCode().split("\\n").length);
//        payload.setResult(fakeResult);
//        codingRepo.save(payload);
//        return ResponseEntity.ok(payload);
//    }

    @PostMapping("/courses/{id}/submit")
    public ResponseEntity<?> submitCode(@PathVariable Long id, @RequestBody CodingSubmission payload, Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        payload.setCourseId(id);
        payload.setUserId(userId);

        // call runner worker
        try {
            // build request DTO
            Map<String, Object> req = new HashMap<>();
            req.put("language", payload.getLanguage() == null ? "java" : payload.getLanguage());
            req.put("source", payload.getSourceCode() == null ? "" : payload.getSourceCode());
            req.put("filename", "Main.java");
            req.put("timeoutSeconds", 5);

            String runnerUrl = System.getenv().getOrDefault("RUNNER_URL", "http://localhost:9000/api/run");
            // use RestTemplate
            org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
            org.springframework.http.ResponseEntity<com.fasterxml.jackson.databind.JsonNode> runnerRes =
                    rt.postForEntity(runnerUrl, req, com.fasterxml.jackson.databind.JsonNode.class);

            // store result
            String combined = runnerRes.getBody() != null ? runnerRes.getBody().toString() : "No result";
            payload.setResult(combined);
        } catch (Exception ex) {
            payload.setResult("Runner error: " + ex.getMessage());
        }

        codingRepo.save(payload);
        return ResponseEntity.ok(payload);
    }


    @GetMapping("/me/submissions")
    public List<CodingSubmission> mySubmissions(Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        return codingRepo.findByUserId(userId);
    }

    // Add this method inside your CourseController class

//    @DeleteMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}")
//    public ResponseEntity<?> deleteLesson(
//            @PathVariable Long courseId,
//            @PathVariable Long moduleId,
//            @PathVariable Long lessonId,
//            Authentication auth // To check if user is instructor
//    ) {
//        // 1. Security Check (Optional but recommended)
//        // if (!isInstructor(auth)) return ResponseEntity.status(403).build();
//
//        try {
//            lessonRepository.deleteById(lessonId);
//            return ResponseEntity.ok("Lesson deleted successfully");
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error deleting lesson: " + e.getMessage());
//        }
//    }
}
