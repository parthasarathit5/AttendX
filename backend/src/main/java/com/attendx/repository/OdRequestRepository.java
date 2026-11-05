package com.attendx.repository;

import com.attendx.model.OdRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OdRequestRepository extends JpaRepository<OdRequest, UUID> {
    List<OdRequest> findByRegisterNumberOrderByCreatedAtDesc(String registerNumber);
    List<OdRequest> findByCourseOfferingIdOrderByCreatedAtDesc(String courseOfferingId);
}
