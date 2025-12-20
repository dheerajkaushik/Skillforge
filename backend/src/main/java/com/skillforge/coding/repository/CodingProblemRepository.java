package com.skillforge.coding.repository;

import com.skillforge.coding.entity.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {

    List<CodingProblem> findByCreatedBy(Long instructorId);
    Optional<CodingProblem> findByLessonId(Long lessonId);
}
