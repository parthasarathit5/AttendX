package com.attendx.repository;

import com.attendx.model.AttendxUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendxUserRepository extends JpaRepository<AttendxUser, UUID> {
    Optional<AttendxUser> findByRegisterNumber(String registerNumber);
    Optional<AttendxUser> findByEmail(String email);
}
