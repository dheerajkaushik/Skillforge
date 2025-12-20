package com.skillforge.repository;

import com.skillforge.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleIdOrderByPositionAsc(Long moduleId);
    List<Lesson> findByModuleId(Long moduleId);
}
