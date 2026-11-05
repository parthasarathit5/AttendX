package com.attendx.repository;

import com.attendx.entity.Student;
import com.attendx.entity.StudentGuardian;
import com.attendx.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentGuardianRepository extends JpaRepository<StudentGuardian, String> {
    List<StudentGuardian> findByStudent(Student student);
    List<StudentGuardian> findByUserProfile(UserProfile userProfile);
}

