package com.attendx.repository;

import com.attendx.entity.DegreeClass;
import com.attendx.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    Optional<Student> findByRegistrationNumber(String registrationNumber);

    Optional<Student> findByEmail(String email);

    List<Student> findByDegreeClassAndSection(DegreeClass degreeClass, String section);

    List<Student> findByDegreeClass(DegreeClass degreeClass);

    @Query("SELECT s FROM Student s WHERE " +
           "(:classId IS NULL OR s.degreeClass.id = :classId) AND " +
           "(:section IS NULL OR s.section = :section) AND " +
           "(:query IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.registrationNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Student> searchStudents(@Param("classId") String classId,
                                 @Param("section") String section,
                                 @Param("query") String query,
                                 Pageable pageable);
}

