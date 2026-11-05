package com.attendx.repository;

import com.attendx.model.AttendanceLog;
import com.attendx.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, UUID> {
    List<AttendanceLog> findByCourseOfferingIdAndRegisterNumberOrderBySessionNumberAsc(String courseOfferingId, String registerNumber);
    
    Optional<AttendanceLog> findByCourseOfferingIdAndRegisterNumberAndSessionNumber(String courseOfferingId, String registerNumber, Integer sessionNumber);

    long countByCourseOfferingIdAndRegisterNumber(String courseOfferingId, String registerNumber);

    long countByCourseOfferingIdAndRegisterNumberAndStatus(String courseOfferingId, String registerNumber, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.courseOfferingId = :courseOfferingId AND a.registerNumber = :registerNumber AND (a.status = 'PRESENT' OR a.status = 'ON_DUTY')")
    long countAttendedOrOd(@Param("courseOfferingId") String courseOfferingId, @Param("registerNumber") String registerNumber);
}
