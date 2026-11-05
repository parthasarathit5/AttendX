package com.attendx.repository;

import com.attendx.entity.UserProfile;
import com.attendx.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    Optional<UserProfile> findByEmail(String email);
    Optional<UserProfile> findBySupabaseUserId(String supabaseUserId);
    List<UserProfile> findByRole(UserRole role);
}

