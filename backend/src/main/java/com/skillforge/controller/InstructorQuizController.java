package com.skillforge.controller;

import com.skillforge.entity.Question;
import com.skillforge.entity.Quiz;
import com.skillforge.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/instructor/quizzes")
public class InstructorQuizController {

    private final QuizService quizService;

    public InstructorQuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // ✅ NEW METHOD: Allow Instructors to view quizzes via their own endpoint
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Quiz>> getQuizzesByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizService.getQuizzesByLesson(lessonId));
    }
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long quizId) {
        return quizService.getQuizById(quizId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @RequestParam Long lessonId,
            @RequestParam String title,
            @RequestParam Long instructorId
    ) {
        Quiz quiz = quizService.createQuiz(lessonId, title, instructorId);
        return ResponseEntity.ok(quiz);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Question> addQuestion(
            @PathVariable Long quizId,
            @RequestParam String questionText,
            @RequestParam String optionA,
            @RequestParam String optionB,
            @RequestParam String optionC,
            @RequestParam String optionD,
            @RequestParam String correctOption,
            @RequestParam Integer marks
    ) {
        Question question = quizService.addQuestion(
                quizId,
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                marks
        );

        return ResponseEntity.ok(question);
    }
}