//package com.skillforge.controller;
//
//import com.skillforge.entity.Course;
//import com.skillforge.entity.Lesson;
//import com.skillforge.entity.Module;
//import com.skillforge.repository.CourseRepository;
//import com.skillforge.repository.LessonRepository;
//import com.skillforge.repository.ModuleRepository;
//import com.skillforge.repository.UserRepository;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import com.skillforge.security.RolePermissionService;
//import com.skillforge.security.Permission;
//import com.skillforge.security.AuthUtils;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api")
//public class ContentController {
//
//    private final CourseRepository courseRepo;
//    private final ModuleRepository moduleRepo;
//    private final LessonRepository lessonRepo;
//    private final UserRepository userRepo;
//    private final RolePermissionService rolePermissionService;
//
//    // Constructor Injection including RolePermissionService
//    public ContentController(CourseRepository courseRepo,
//                             ModuleRepository moduleRepo,
//                             LessonRepository lessonRepo,
//                             UserRepository userRepo,
//                             RolePermissionService rolePermissionService) {
//        this.courseRepo = courseRepo;
//        this.moduleRepo = moduleRepo;
//        this.lessonRepo = lessonRepo;
//        this.userRepo = userRepo;
//        this.rolePermissionService = rolePermissionService;
//    }
//
//    // Create module for a course
//    @PostMapping("/courses/{courseId}/modules")
//    public ResponseEntity<?> createModule(@PathVariable Long courseId,
//                                          @RequestBody Module module,
//                                          Authentication auth) {
//        // 1. Get Role
//        String role = AuthUtils.getRole(auth);
//
//        // 2. Check Permission
//        if (!rolePermissionService.hasPermission(role, Permission.CREATE_MODULE)) {
//            return ResponseEntity.status(403).body("You do not have permission to create modules");
//        }
//
//        // Fetch the course properly
//        Course course = courseRepo.findById(courseId)
//                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
//
//        // Fix: Use setCourse (Object) instead of setCourseId (Long)
//        module.setCourse(course);
//
//        Module saved = moduleRepo.save(module);
//        return ResponseEntity.ok(saved);
//    }
//
//    // List modules for a course
//    @GetMapping("/courses/{courseId}/modules")
//    public ResponseEntity<?> listModules(@PathVariable Long courseId) {
//        // Ensure your ModuleRepository has this method: findByCourseIdOrderByPositionAsc
//        List<Module> modules = moduleRepo.findByCourseIdOrderByPositionAsc(courseId);
//        return ResponseEntity.ok(modules);
//    }
//
//    // Create lesson under module
//    @PostMapping("/courses/{courseId}/modules/{moduleId}/lessons")
//    public ResponseEntity<?> createLesson(@PathVariable Long courseId,
//                                          @PathVariable Long moduleId,
//                                          @RequestBody Lesson lesson,
//                                          Authentication auth) {
//        // 1. Get Role
//        String role = AuthUtils.getRole(auth);
//
//        // 2. Check Permission (Make sure CREATE_LESSON exists in your Permission Enum)
//        if (!rolePermissionService.hasPermission(role, Permission.CREATE_LESSON)) {
//            return ResponseEntity.status(403).body("You do not have permission to create lessons");
//        }
//
//        // Verify module exists
//        Module module = moduleRepo.findById(moduleId)
//                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));
//
//        // Fix: Use getCourse().getId() because getCourseId() was removed
//        if (module.getCourse() == null || !module.getCourse().getId().equals(courseId)) {
//            return ResponseEntity.badRequest().body("Module does not belong to course");
//        }
//
//        // Fix: Use setModule (Object) instead of setModuleId (Long)
//        lesson.setModule(module);
//
//        Lesson saved = lessonRepo.save(lesson);
//
//        return ResponseEntity.ok(saved);
//    }
//
//    // List lessons under module
//    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons")
//    public ResponseEntity<?> listLessons(@PathVariable Long courseId,
//                                         @PathVariable Long moduleId) {
//        // Ensure your LessonRepository has findByModuleIdOrderByPositionAsc
//        List<Lesson> lessons = lessonRepo.findByModuleIdOrderByPositionAsc(moduleId);
//        return ResponseEntity.ok(lessons);
//    }
//
//    // Get single lesson (for viewing)
//    @GetMapping("/lessons/{lessonId}")
//    public ResponseEntity<?> getLesson(@PathVariable Long lessonId) {
//        return lessonRepo.findById(lessonId)
//                .<ResponseEntity<?>>map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//}

package com.skillforge.controller;

import com.skillforge.entity.Course;
import com.skillforge.entity.Lesson;
import com.skillforge.entity.Module;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.LessonRepository;
import com.skillforge.repository.ModuleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "http://localhost:3000") // ✅ Ensure React can reach this
public class ContentController {

    private final CourseRepository courseRepo;
    private final ModuleRepository moduleRepo;
    private final LessonRepository lessonRepo;

    public ContentController(CourseRepository courseRepo,
                             ModuleRepository moduleRepo,
                             LessonRepository lessonRepo) {
        this.courseRepo = courseRepo;
        this.moduleRepo = moduleRepo;
        this.lessonRepo = lessonRepo;
    }

    // --- HELPER: Check if user is Instructor/Admin ---
    private boolean isInstructor(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    // --- MODULES ---



    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<?> createModule(@PathVariable Long courseId,
                                          @RequestBody Module module,
                                          Authentication auth) {
        if (!isInstructor(auth)) return ResponseEntity.status(403).body("Access Denied");

        return courseRepo.findById(courseId).map(course -> {
            module.setCourse(course);
            return ResponseEntity.ok(moduleRepo.save(module));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<?> listModules(@PathVariable Long courseId) {
        // Fallback to simple find if OrderByPosition doesn't exist
        try {
            return ResponseEntity.ok(moduleRepo.findByCourseIdOrderByPositionAsc(courseId));
        } catch (Exception e) {
            return ResponseEntity.ok(moduleRepo.findByCourseId(courseId));
        }
    }

    // --- LESSONS ---

    @PostMapping("/courses/{courseId}/modules/{moduleId}/lessons")
    public ResponseEntity<?> createLesson(@PathVariable Long courseId,
                                          @PathVariable Long moduleId,
                                          @RequestBody Lesson lesson,
                                          Authentication auth) {
        if (!isInstructor(auth)) return ResponseEntity.status(403).body("Access Denied");

        return moduleRepo.findById(moduleId).map(module -> {
            // Safety: Ensure module belongs to course
            if (module.getCourse() == null || !module.getCourse().getId().equals(courseId)) {
                return ResponseEntity.badRequest().body("Module mismatch");
            }
            lesson.setModule(module);
            return ResponseEntity.ok(lessonRepo.save(lesson));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons")
    public ResponseEntity<?> listLessons(@PathVariable Long courseId, @PathVariable Long moduleId) {
        try {
            return ResponseEntity.ok(lessonRepo.findByModuleIdOrderByPositionAsc(moduleId));
        } catch (Exception e) {
            return ResponseEntity.ok(lessonRepo.findByModuleId(moduleId));
        }
    }

    // ✅ MOVED DELETE HERE (So remove it from CourseController)
    @DeleteMapping("/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long courseId,
                                          @PathVariable Long moduleId,
                                          @PathVariable Long lessonId,
                                          Authentication auth) {
        if (!isInstructor(auth)) return ResponseEntity.status(403).body("Access Denied");

        try {
            lessonRepo.deleteById(lessonId);
            return ResponseEntity.ok("Lesson deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting lesson");
        }
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<?> getLesson(@PathVariable Long lessonId) {
        return lessonRepo.findById(lessonId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}