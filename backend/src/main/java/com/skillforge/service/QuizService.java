package com.skillforge.service;

import com.skillforge.entity.Question;
import com.skillforge.entity.Quiz;
import com.skillforge.repository.QuestionRepository;

import java.util.List;
import java.util.Optional;

public interface QuizService {

    Quiz createQuiz(Long lessonId, String title, Long instructorId);

    Optional<Quiz> getQuizById(Long id);

    Question addQuestion(
            Long quizId,
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            Integer marks
    );

    List<Quiz> getQuizzesByLesson(Long lessonId);
}
