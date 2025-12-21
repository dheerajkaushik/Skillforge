package com.skillforge.controller;

import com.skillforge.entity.Quiz;
import com.skillforge.repository.QuizAttemptRepository; // ✅ Added Repository
import com.skillforge.service.QuizAttemptService;
import com.skillforge.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // ✅ Added Auth
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentQuizController {

    private final QuizService quizService;
    private final QuizAttemptService quizAttemptService;
    private final QuizAttemptRepository quizAttemptRepo; // ✅ Inject Repository

    public StudentQuizController(
            QuizService quizService,
            QuizAttemptService quizAttemptService,
            QuizAttemptRepository quizAttemptRepo
    ) {
        this.quizService = quizService;
        this.quizAttemptService = quizAttemptService;
        this.quizAttemptRepo = quizAttemptRepo;
    }

    // 1. Get List of Quizzes for a Lesson (With "Attempted" Status)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<List<Map<String, Object>>> getQuizzesByLesson(
            @PathVariable Long lessonId,
            Authentication auth // ✅ Get User from Token
    ) {
        if (auth == null) return ResponseEntity.status(401).build();
        Long userId = Long.parseLong(auth.getPrincipal().toString());

        // Fetch raw quizzes
        List<Quiz> quizzes = quizService.getQuizzesByLesson(lessonId);

        // Prepare response with "attempted" flag
        List<Map<String, Object>> response = new ArrayList<>();

        for (Quiz quiz : quizzes) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", quiz.getId());
            map.put("title", quiz.getTitle());
            map.put("questionsCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);

            // ✅ CRITICAL: Check if this user already submitted this quiz
            boolean hasAttempted = quizAttemptRepo.existsByStudentIdAndQuizId(userId, quiz.getId());
            map.put("attempted", hasAttempted);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    // 2. Get Single Quiz by ID
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long quizId) {
        return quizService.getQuizById(quizId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Submit Quiz (Now safer!)
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<Long, String> answers,
            Authentication auth
    ) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());

        // ✅ SAFETY: Block duplicate submissions at API level
        if (quizAttemptRepo.existsByStudentIdAndQuizId(userId, quizId)) {
            return ResponseEntity.status(409).body("You have already submitted this quiz!");
        }

        // Proceed with submission
        Integer score = quizAttemptService.submitQuiz(
                quizId,
                userId,
                answers
        );

        return ResponseEntity.ok(score);
    }
}