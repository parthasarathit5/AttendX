package com.attendx.repository;

import com.attendx.model.CourseOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, String> {
    Optional<CourseOffering> findByCourseOfferingId(String courseOfferingId);
}
