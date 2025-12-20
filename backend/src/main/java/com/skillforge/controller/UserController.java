package com.skillforge.controller;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

//    @GetMapping("/me")
//    public ResponseEntity<?> me(Authentication auth) {
//        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).body("Unauthenticated");
//        Long userId = Long.parseLong(auth.getPrincipal().toString());
//        Optional<User> uOpt = userRepo.findById(userId);
//        if (uOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");
//        User u = uOpt.get();
//        // Simple DTO map
//        var map = new java.util.HashMap<String, Object>();
//        map.put("id", u.getId());
//        map.put("name", u.getName());
//        map.put("email", u.getEmail());
//        map.put("role", u.getRole().name());
//        return ResponseEntity.ok(map);
//    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        // 1. Basic Check
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }

        // 2. Extract User ID directly
        // Because we updated JwtFilter, the principal is now a Long (the user ID)
        Object principal = auth.getPrincipal();
        Long userId;

        try {
            userId = Long.parseLong(principal.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(403).body("Invalid User ID in token");
        }

        // 3. Find User by ID (Not Email)
        User u = userRepository.findById(userId).orElse(null);

        if (u == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // 4. Return Data (keeping your HashMap structure)
        var map = new java.util.HashMap<String, Object>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        // Use toString() to safely handle the Enum
        map.put("role", u.getRole() != null ? u.getRole().toString() : "STUDENT");

        return ResponseEntity.ok(map);
    }
}
