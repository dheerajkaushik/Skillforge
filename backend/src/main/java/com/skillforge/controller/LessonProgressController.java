package com.skillforge.progress;

import com.skillforge.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class LessonProgressController {

    private final LessonProgressService service;
    private final JwtUtil jwtUtil;

    @PostMapping("/lesson/{lessonId}/complete")
    public String completeLesson(@PathVariable Long lessonId, @RequestHeader("Authorization") String auth) {

        Long userId = jwtUtil.extractUserId(auth.substring(7));

        service.markLessonCompleted(lessonId, userId);

        return "Lesson marked complete";
    }

    @GetMapping("/course/{courseId}")
    public int getCourseProgress(@PathVariable Long courseId, @RequestHeader("Authorization") String auth) {

        Long userId = jwtUtil.extractUserId(auth.substring(7));

        return service.getCourseProgress(courseId, userId);
    }
}
