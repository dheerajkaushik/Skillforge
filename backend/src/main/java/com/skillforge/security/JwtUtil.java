package com.skillforge.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generateToken(String subject) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key)
                .compact();
    }

    public String validateAndGetSubject(String token) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return claims.getBody().getSubject();
        } catch (JwtException ex) {
            System.out.println("JWT Verification Failed: " + ex.getMessage());
            return null;
        }
    }
    public Long extractUserId(String token) {
        // Remove "Bearer " prefix if the controller passed the full header
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // validateAndGetSubject() returns "userId:ROLE" or just "userId"
        String subject = validateAndGetSubject(token);

        // If subject contains a role separator (:), split it to get just the ID
        if (subject.contains(":")) {
            return Long.parseLong(subject.split(":")[0]);
        }

        return Long.parseLong(subject);
    }
}
