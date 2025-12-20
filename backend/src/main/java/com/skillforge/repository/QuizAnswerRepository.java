package com.skillforge.repository;

import com.skillforge.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {

    List<QuizAnswer> findByAttemptId(Long attemptId);
}
