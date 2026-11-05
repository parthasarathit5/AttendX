package com.attendx.security;

import com.attendx.entity.UserProfile;
import com.attendx.entity.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String fullName;
    private final UserRole role;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String email, String fullName, UserRole role) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    public static UserPrincipal fromUserProfile(UserProfile profile) {
        return new UserPrincipal(
                profile.getId(),
                profile.getEmail(),
                profile.getFullName(),
                profile.getRole()
        );
    }

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public UserRole getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return ""; } // OAuth2 / JWT authentication, no local password

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}

