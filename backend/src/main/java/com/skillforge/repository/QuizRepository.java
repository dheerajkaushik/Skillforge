package com.skillforge.repository;

import com.skillforge.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByLessonId(Long lessonId);

    List<Quiz> findByCreatedBy(Long instructorId);
}
