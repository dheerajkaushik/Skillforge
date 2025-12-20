package com.skillforge.progress;
import com.skillforge.entity.Lesson;
import com.skillforge.entity.User;


import com.skillforge.repository.UserRepository;

import com.skillforge.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final LessonProgressRepository repo;
    private final LessonRepository lessonRepo;
    private final UserRepository userRepo;

    public void markLessonCompleted(Long lessonId, Long userId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Lesson lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        repo.findByUserAndLesson(user, lesson).ifPresent(progress -> {
            progress.setCompleted(true);
            progress.setCompletedAt(System.currentTimeMillis());
            repo.save(progress);
            return;
        });

        repo.save(
                LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .completed(true)
                        .completedAt(System.currentTimeMillis())
                        .build()
        );
    }

    public int getCourseProgress(Long courseId, Long userId) {

        long totalLessons = repo.countByLesson_Module_Course_Id(courseId);
        if (totalLessons == 0) return 0;

        long completed = repo.countByUserIdAndLesson_Module_Course_IdAndCompletedTrue(userId, courseId);

        return (int) ((completed * 100.0) / totalLessons);
    }
}
