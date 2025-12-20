package com.skillforge.controller;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Promote user to instructor (admin only)
    @PostMapping("/promote/{userId}/to-instructor")
    public ResponseEntity<?> promoteToInstructor(@PathVariable Long userId, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body("Unauthenticated");

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) return ResponseEntity.status(403).body("Only admin can promote users");

        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isEmpty()) return ResponseEntity.notFound().build();

        User u = uOpt.get();
        u.setRole(User.Role.INSTRUCTOR);
        userRepository.save(u);
        return ResponseEntity.ok("User promoted to INSTRUCTOR");
    }
}
