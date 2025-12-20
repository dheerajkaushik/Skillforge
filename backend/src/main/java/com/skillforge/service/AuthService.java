package com.skillforge.service;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final GoogleTokenVerifierService verifier;

    public AuthService(UserRepository userRepository,
                       GoogleTokenVerifierService verifier) {
        this.userRepository = userRepository;
        this.verifier = verifier;
    }

    public User authenticateWithGoogle(String idToken) throws Exception {

        var payload = verifier.verify(idToken);

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail(email);
                    user.setName(name);
                    // FIX: Use Enum, not String
                    user.setRole(User.Role.STUDENT);


                    user.setPasswordHash("GOOGLE_AUTH_PLACEHOLDER");

                    // FIX: Use Instant for compatibility
                    user.setCreatedAt(Instant.now());

                    return userRepository.save(user);
                });
    }
}