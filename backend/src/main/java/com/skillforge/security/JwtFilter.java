package com.skillforge.security;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String subject = null;

        // 1. Extract Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                subject = jwtUtil.validateAndGetSubject(token);
            } catch (Exception e) {
                System.out.println("❌ Token Validation Failed: " + e.getMessage());
            }
        }

        // 2. Authenticate User
        if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                User user = null;

                // STRATEGY A: Try parsing as ID (e.g., "2:INSTRUCTOR")
                if (subject.length() > 0 && Character.isDigit(subject.charAt(0))) {
                    try {
                        String[] parts = subject.split(":");
                        Long userId = Long.parseLong(parts[0]);
                        user = userRepository.findById(userId).orElse(null);
                        if (user == null) System.out.println("❌ User ID " + userId + " not found in DB.");
                    } catch (NumberFormatException ignored) {
                        // Not an ID, fall through to Strategy B
                    }
                }

                // STRATEGY B: Try lookup by Email (Fallback)
                if (user == null) {
                    user = userRepository.findByEmail(subject).orElse(null);
                }

                // 3. Set Context if User Found
                if (user != null) {

                    // ✅ CRITICAL FIX: Pass user.getId() as the principal.
                    // This ensures "auth.getPrincipal().toString()" in your controllers returns the ID string, preventing crashes.
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user.getId(),
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("❌ User authentication failed. Subject '" + subject + "' not found in DB.");
                }

            } catch (Exception e) {
                System.out.println("❌ Auth Filter Error: " + e.getMessage());
                e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }
}