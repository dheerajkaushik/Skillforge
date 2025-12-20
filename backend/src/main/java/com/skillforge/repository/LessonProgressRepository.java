package com.skillforge.progress;

import com.skillforge.entity.Lesson;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByUserAndLesson(User user, Lesson lesson);

    List<LessonProgress> findByUserId(Long userId);

    long countByUserIdAndLesson_Module_Course_IdAndCompletedTrue(Long userId, Long courseId);

    long countByLesson_Module_Course_Id(Long courseId);
}
