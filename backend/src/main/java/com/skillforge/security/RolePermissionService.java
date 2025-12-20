package com.skillforge.security;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RolePermissionService {

    private final Map<String, Set<Permission>> map = new HashMap<>();

    public RolePermissionService() {
        // STUDENT: minimal
        map.put("STUDENT", Set.of());
        // INSTRUCTOR:
        map.put("INSTRUCTOR", Set.of(
                Permission.CREATE_COURSE,
                Permission.CREATE_MODULE,
                Permission.CREATE_LESSON,
                Permission.GRADE_SUBMISSION,
                Permission.VIEW_DASHBOARD
        ));
        // ADMIN: all
        map.put("ADMIN", EnumSet.allOf(Permission.class));
    }

    public boolean hasPermission(String role, Permission p) {
        if (role == null) return false;
        Set<Permission> s = map.get(role);
        return s != null && s.contains(p);
    }
}
