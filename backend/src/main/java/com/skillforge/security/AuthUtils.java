package com.skillforge.security;

import org.springframework.security.core.Authentication;

public class AuthUtils {
    public static String getRole(Authentication auth) {
        if (auth == null) return null;
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .filter(x -> x.startsWith("ROLE_"))
                .map(x -> x.substring(5)) // remove ROLE_
                .findFirst().orElse(null);
    }
}
