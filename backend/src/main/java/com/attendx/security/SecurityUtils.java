package com.attendx.security;

import com.attendx.entity.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static String getCurrentUserId() {
        return getCurrentUser().map(UserPrincipal::getId).orElse("anonymous");
    }

    public static String getCurrentUserEmail() {
        return getCurrentUser().map(UserPrincipal::getUsername).orElse("anonymous@attendx.com");
    }

    public static UserRole getCurrentUserRole() {
        return getCurrentUser().map(UserPrincipal::getRole).orElse(UserRole.STUDENT);
    }

    public static boolean hasRole(UserRole role) {
        return getCurrentUserRole() == role;
    }
}

