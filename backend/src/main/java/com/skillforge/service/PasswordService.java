package com.skillforge.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCrypt;

@Service
public class PasswordService {
    public String hash(String raw) {
        return BCrypt.hashpw(raw, BCrypt.gensalt());
    }
    public boolean matches(String raw, String hash) {
        return BCrypt.checkpw(raw, hash);
    }
}
