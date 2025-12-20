package com.skillforge.service;

import com.skillforge.entity.Question;
import com.skillforge.entity.Quiz;
import com.skillforge.entity.QuizAnswer;
import com.skillforge.entity.QuizAttempt;
import com.skillforge.repository.QuestionRepository;
import com.skillforge.repository.QuizAnswerRepository;
import com.skillforge.repository.QuizAttemptRepository;
import com.skillforge.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;

    public QuizAttemptServiceImpl(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            QuizAttemptRepository quizAttemptRepository,
            QuizAnswerRepository quizAnswerRepository
    ) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizAnswerRepository = quizAnswerRepository;
    }

    @Override
    public Integer submitQuiz(
            Long quizId,
            Long studentId,
            Map<Long, String> answers
    ) {

        quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId)
                .ifPresent(a -> {
                    throw new RuntimeException("Quiz already attempted");
                });

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<Question> questions = questionRepository.findByQuizId(quizId);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setStudentId(studentId);
        attempt.setScore(0);

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        int score = 0;

        for (Question q : questions) {
            String selected = answers.get(q.getId());

            boolean isCorrect = q.getCorrectOption().equalsIgnoreCase(selected);

            if (isCorrect) {
                score += q.getMarks();
            }

            QuizAnswer answer = new QuizAnswer();
            answer.setAttempt(savedAttempt);
            answer.setQuestionId(q.getId());
            answer.setSelectedOption(selected);
            answer.setIsCorrect(isCorrect);

            quizAnswerRepository.save(answer);
        }

        savedAttempt.setScore(score);
        quizAttemptRepository.save(savedAttempt);

        return score;
    }
}
