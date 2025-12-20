package com.skillforge.controller;

import com.skillforge.entity.Quiz;
import com.skillforge.service.QuizAttemptService;
import com.skillforge.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentQuizController {

    private final QuizService quizService;
    private final QuizAttemptService quizAttemptService;

    public StudentQuizController(
            QuizService quizService,
            QuizAttemptService quizAttemptService
    ) {
        this.quizService = quizService;
        this.quizAttemptService = quizAttemptService;
    }

    // 1. Get List of Quizzes for a Lesson
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzesByLesson(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(
                quizService.getQuizzesByLesson(lessonId)
        );
    }

    // ✅ 2. NEW METHOD: Get Single Quiz by ID (Fixes the 404 Error)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long quizId) {
        return quizService.getQuizById(quizId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Submit Quiz
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<Integer> submitQuiz(
            @PathVariable Long quizId,
            @RequestParam Long studentId,
            @RequestBody Map<Long, String> answers
    ) {
        Integer score = quizAttemptService.submitQuiz(
                quizId,
                studentId,
                answers
        );

        return ResponseEntity.ok(score);
    }
}