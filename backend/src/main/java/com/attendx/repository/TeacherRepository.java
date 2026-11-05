package com.attendx.repository;

import com.attendx.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    Optional<Teacher> findByEmployeeId(String employeeId);
    Optional<Teacher> findByEmail(String email);
    List<Teacher> findByDepartment(String department);
    List<Teacher> findByStatus(String status);
}

