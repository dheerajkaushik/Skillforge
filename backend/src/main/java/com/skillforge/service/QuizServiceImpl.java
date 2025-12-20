package com.skillforge.service;

import com.skillforge.entity.Question;
import com.skillforge.entity.Quiz;
import com.skillforge.repository.QuestionRepository;
import com.skillforge.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuizServiceImpl implements QuizService {

    // ✅ Variable is named "quizRepository"
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public QuizServiceImpl(
            QuizRepository quizRepository,
            QuestionRepository questionRepository
    ) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public Quiz createQuiz(Long lessonId, String title, Long instructorId) {
        Quiz quiz = new Quiz();
        quiz.setLessonId(lessonId);
        quiz.setTitle(title);
        quiz.setCreatedBy(instructorId);
        quiz.setTotalMarks(0);
        return quizRepository.save(quiz);
    }

    @Override
    public Question addQuestion(
            Long quizId,
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            Integer marks
    ) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(questionText);
        question.setOptionA(optionA);
        question.setOptionB(optionB);
        question.setOptionC(optionC);
        question.setOptionD(optionD);
        question.setCorrectOption(correctOption);
        question.setMarks(marks);

        Question savedQuestion = questionRepository.save(question);

        quiz.setTotalMarks(quiz.getTotalMarks() + marks);
        quizRepository.save(quiz);

        return savedQuestion;
    }

    @Override
    public List<Quiz> getQuizzesByLesson(Long lessonId) {
        return quizRepository.findByLessonId(lessonId);
    }

    @Override
    public Optional<Quiz> getQuizById(Long id) {
        // ✅ FIXED: Changed "quizRepo" to "quizRepository"
        return quizRepository.findById(id);
    }
}