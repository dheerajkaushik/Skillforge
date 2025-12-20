package com.skillforge.controller;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.skillforge.service.ActivityLogService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepo;
    private final ActivityLogService activityLogService;

    public AdminUserController(UserRepository userRepo, ActivityLogService activityLogService) {
        this.userRepo = userRepo;
        this.activityLogService= activityLogService;
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Only admins allowed");
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @RequestParam String role,
            Authentication auth
    ) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Only admins allowed");

        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        // Validate the role string matches expected values
        if (!role.equals("STUDENT") && !role.equals("INSTRUCTOR") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        // FIX: Convert the String 'role' to the Enum 'User.Role'
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role format");
        }

        userRepo.save(user);
        Long adminId = Long.parseLong(auth.getPrincipal().toString());
        activityLogService.log(adminId, "USER_ROLE_UPDATED", "updatedUserId=" + id + " newRole=" + role);

        return ResponseEntity.ok("Role updated to " + role);
    }

    // inside AdminUserController class (add method)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Only admins allowed");
        var uOpt = userRepo.findById(id);
        if (uOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");
        userRepo.deleteById(id);
        Long adminId = Long.parseLong(auth.getPrincipal().toString());
        activityLogService.log(adminId, "USER_DELETED", "deletedUserId=" + id);
        return ResponseEntity.ok("User deleted");
    }

}