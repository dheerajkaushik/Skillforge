package com.skillforge.service;

import java.util.Map;

public interface QuizAttemptService {

    Integer submitQuiz(
            Long quizId,
            Long studentId,
            Map<Long, String> answers
    );
}
