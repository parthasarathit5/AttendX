package com.attendx.repository;

import com.attendx.model.CourseSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseSessionRepository extends JpaRepository<CourseSession, UUID> {
    List<CourseSession> findByCourseOfferingIdOrderBySessionNumberAsc(String courseOfferingId);
    Optional<CourseSession> findByCourseOfferingIdAndSessionNumber(String courseOfferingId, Integer sessionNumber);
    Optional<CourseSession> findByQrCodeToken(String qrCodeToken);
}
