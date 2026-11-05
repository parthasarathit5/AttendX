package com.attendx.repository;

import com.attendx.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, String> {

    Optional<AttendanceSession> findByDegreeClassAndSectionAndSubjectAndSessionDateAndPeriod(
        DegreeClass degreeClass, String section, Subject subject, LocalDate sessionDate, String period
    );

    List<AttendanceSession> findByTeacher(Teacher teacher);

    List<AttendanceSession> findByDegreeClassAndSection(DegreeClass degreeClass, String section);

    List<AttendanceSession> findByLockedTrue();

    @Query("SELECT s FROM AttendanceSession s WHERE s.locked = true AND " +
           "(:classId IS NULL OR s.degreeClass.id = :classId) AND " +
           "(:section IS NULL OR s.section = :section) AND " +
           "(:subjectId IS NULL OR s.subject.id = :subjectId) AND " +
           "(:teacherId IS NULL OR s.teacher.id = :teacherId) AND " +
           "(:startDate IS NULL OR s.sessionDate >= :startDate) AND " +
           "(:endDate IS NULL OR s.sessionDate <= :endDate) " +
           "ORDER BY s.sessionDate DESC, s.period ASC")
    List<AttendanceSession> findFinalizedSessionsWithFilters(
        @Param("classId") String classId,
        @Param("section") String section,
        @Param("subjectId") String subjectId,
        @Param("teacherId") String teacherId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}

