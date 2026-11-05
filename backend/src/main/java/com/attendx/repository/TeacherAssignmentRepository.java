package com.attendx.repository;

import com.attendx.entity.DegreeClass;
import com.attendx.entity.Subject;
import com.attendx.entity.Teacher;
import com.attendx.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, String> {
    List<TeacherAssignment> findByTeacher(Teacher teacher);
    List<TeacherAssignment> findByDegreeClassAndSection(DegreeClass degreeClass, String section);
    Optional<TeacherAssignment> findByTeacherAndDegreeClassAndSectionAndSubject(
        Teacher teacher, DegreeClass degreeClass, String section, Subject subject
    );
}

