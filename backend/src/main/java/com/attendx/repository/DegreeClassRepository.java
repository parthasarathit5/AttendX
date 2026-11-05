package com.attendx.repository;

import com.attendx.entity.DegreeClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DegreeClassRepository extends JpaRepository<DegreeClass, String> {
    Optional<DegreeClass> findByCode(String code);
    List<DegreeClass> findByDepartment(String department);
}

