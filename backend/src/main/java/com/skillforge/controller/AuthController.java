package com.skillforge.controller;

import com.skillforge.dto.AuthRequest;
import com.skillforge.dto.AuthResponse;
import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;
import com.skillforge.service.AuthService;
import java.util.Map;
import java.util.HashMap;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.authService=authService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }
    @PostMapping("/google")
    public Map<String, Object> googleLogin(@RequestBody Map<String, String> payload) throws Exception {
        String idToken = payload.get("idToken");

        // 1. Authenticate/Create User
        User user = authService.authenticateWithGoogle(idToken);

        // 2. ✅ FIX: Generate JWT Token using ID and ROLE (Not Email)
        // Match the format used in signup/login: "userId:ROLE"
        String token = jwtUtil.generateToken(user.getId() + ":" + user.getRole().name());

        // 3. Return both
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return response;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest req) {
        if (req.email == null || req.password == null || req.name == null)
            return ResponseEntity.badRequest().body("Missing fields");
        Optional<User> existing = userRepository.findByEmail(req.email);
        if (existing.isPresent()) return ResponseEntity.badRequest().body("Email exists");
        User u = new User();
        u.setEmail(req.email);
        u.setName(req.name);
        String hash = BCrypt.hashpw(req.password, BCrypt.gensalt());
        u.setPasswordHash(hash);
        u.setRole(User.Role.STUDENT);
        userRepository.save(u);
        String token = jwtUtil.generateToken(u.getId() + ":" + u.getRole().name());
        AuthResponse res = new AuthResponse();
        res.token = token;
        res.userId = u.getId();
        res.email = u.getEmail();
        res.name = u.getName();
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        if (req.email == null || req.password == null) return ResponseEntity.badRequest().body("Missing");
        Optional<User> uOpt = userRepository.findByEmail(req.email);
        if (uOpt.isEmpty()) return ResponseEntity.status(401).body("Invalid");
        User u = uOpt.get();
        if (!BCrypt.checkpw(req.password, u.getPasswordHash())) return ResponseEntity.status(401).body("Invalid");
        String token = jwtUtil.generateToken(u.getId() + ":" + u.getRole().name());
        AuthResponse res = new AuthResponse();
        res.token = token;
        res.userId = u.getId();
        res.email = u.getEmail();
        res.name = u.getName();
        return ResponseEntity.ok(res);
    }
}
