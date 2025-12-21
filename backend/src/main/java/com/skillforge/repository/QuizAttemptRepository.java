package com.skillforge.repository;

import com.skillforge.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Optional<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);
    boolean existsByStudentIdAndQuizId(Long studentId, Long quizId);
}
