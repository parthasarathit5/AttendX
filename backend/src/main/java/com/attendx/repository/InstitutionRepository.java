package com.attendx.repository;

import com.attendx.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, String> {
    Optional<Institution> findByCode(String code);
}

