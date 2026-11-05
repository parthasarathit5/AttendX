package com.attendx.repository;

import com.attendx.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, String> {
    Optional<AcademicYear> findByCode(String code);
    Optional<AcademicYear> findByCurrentTrue();
}

