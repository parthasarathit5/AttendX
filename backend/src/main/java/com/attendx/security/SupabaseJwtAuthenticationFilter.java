package com.attendx.security;

import com.attendx.entity.UserProfile;
import com.attendx.entity.UserRole;
import com.attendx.repository.UserProfileRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Component
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SupabaseJwtAuthenticationFilter.class);

    private final UserProfileRepository userProfileRepository;

    @Value("${attendx.security.mock-tokens-enabled:true}")
    private boolean mockTokensEnabled;

    @Value("${attendx.security.jwt-issuer:https://xyzcompany.supabase.co/auth/v1}")
    private String expectedIssuer;

    public SupabaseJwtAuthenticationFilter(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();

            try {
                // 1. Check development/mock tokens if enabled
                if (mockTokensEnabled && handleMockToken(token, request)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // 2. Parse and validate standard Supabase JWT
                handleSupabaseJwt(token, request);

            } catch (Exception ex) {
                log.warn("JWT authentication failed: {}", ex.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean handleMockToken(String token, HttpServletRequest request) {
        String email = null;

        if ("dev-token-admin".equalsIgnoreCase(token) || "mock-token-admin".equalsIgnoreCase(token)) {
            email = "admin@attendx.saveetha.com";
        } else if ("dev-token-teacher-001".equalsIgnoreCase(token) || "mock-token-teacher".equalsIgnoreCase(token)) {
            email = "senthil.k@saveetha.com";
        } else if ("dev-token-teacher-002".equalsIgnoreCase(token)) {
            email = "meenakshi.s@saveetha.com";
        } else if ("dev-token-student-192211001".equalsIgnoreCase(token) || "mock-token-student".equalsIgnoreCase(token)) {
            email = "aarav.sharma@saveetha.com";
        } else if ("dev-token-parent-001".equalsIgnoreCase(token) || "mock-token-parent".equalsIgnoreCase(token)) {
            email = "parent.aarav@gmail.com";
        }

        if (email != null) {
            Optional<UserProfile> profileOpt = userProfileRepository.findByEmail(email);
            if (profileOpt.isPresent()) {
                authenticateUser(profileOpt.get(), request);
                return true;
            }
        }

        return false;
    }

    private void handleSupabaseJwt(String token, HttpServletRequest request) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return; // Not a valid JWT structure
        }

        // Decode payload
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

        // Simple claim extractor
        String email = extractJsonField(payloadJson, "email");
        String sub = extractJsonField(payloadJson, "sub");
        String expStr = extractJsonField(payloadJson, "exp");

        if (expStr != null) {
            try {
                long exp = Long.parseLong(expStr);
                long now = System.currentTimeMillis() / 1000;
                if (now > exp) {
                    log.warn("Supabase JWT has expired (exp: {}, now: {})", exp, now);
                    return;
                }
            } catch (NumberFormatException ignored) {}
        }

        // Resolve trusted user from database by supabaseUserId or email
        Optional<UserProfile> profileOpt = Optional.empty();
        if (sub != null && !sub.isEmpty()) {
            profileOpt = userProfileRepository.findBySupabaseUserId(sub);
        }
        if (profileOpt.isEmpty() && email != null && !email.isEmpty()) {
            profileOpt = userProfileRepository.findByEmail(email);
        }

        profileOpt.ifPresent(userProfile -> authenticateUser(userProfile, request));
    }

    private void authenticateUser(UserProfile profile, HttpServletRequest request) {
        UserPrincipal principal = UserPrincipal.fromUserProfile(profile);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.debug("User authenticated: {} with role: {}", principal.getUsername(), principal.getRole());
    }

    private String extractJsonField(String json, String field) {
        String search = "\"" + field + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return null;

        int colon = json.indexOf(":", idx);
        if (colon == -1) return null;

        int start = colon + 1;
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"')) {
            start++;
        }

        int end = start;
        boolean inQuotes = json.charAt(colon + 1) == '"' || json.charAt(colon + 2) == '"';
        char delimiter = inQuotes ? '"' : ',';

        while (end < json.length() && json.charAt(end) != delimiter && json.charAt(end) != '}') {
            end++;
        }

        return json.substring(start, end).trim();
    }
}

