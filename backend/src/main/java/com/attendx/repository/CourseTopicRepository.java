package com.attendx.repository;

import com.attendx.model.CourseTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseTopicRepository extends JpaRepository<CourseTopic, UUID> {
    List<CourseTopic> findByCourseOfferingCourseOfferingIdOrderByUnitNumberAsc(String courseOfferingId);
}
