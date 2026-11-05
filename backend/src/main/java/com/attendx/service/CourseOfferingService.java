package com.attendx.service;

import com.attendx.model.CourseOffering;
import com.attendx.model.CourseSession;
import com.attendx.model.CourseTopic;
import com.attendx.repository.CourseOfferingRepository;
import com.attendx.repository.CourseSessionRepository;
import com.attendx.repository.CourseTopicRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseTopicRepository courseTopicRepository;
    private final CourseSessionRepository courseSessionRepository;
    private final QrCodeService qrCodeService;

    public CourseOfferingService(CourseOfferingRepository courseOfferingRepository,
                                 CourseTopicRepository courseTopicRepository,
                                 CourseSessionRepository courseSessionRepository,
                                 QrCodeService qrCodeService) {
        this.courseOfferingRepository = courseOfferingRepository;
        this.courseTopicRepository = courseTopicRepository;
        this.courseSessionRepository = courseSessionRepository;
        this.qrCodeService = qrCodeService;
    }

    public List<CourseOffering> getAllOfferings() {
        return courseOfferingRepository.findAll();
    }

    public Optional<CourseOffering> getOfferingById(String courseOfferingId) {
        return courseOfferingRepository.findByCourseOfferingId(courseOfferingId);
    }

    public List<CourseTopic> getTopics(String courseOfferingId) {
        return courseTopicRepository.findByCourseOfferingCourseOfferingIdOrderByUnitNumberAsc(courseOfferingId);
    }

    public List<CourseSession> getSessions(String courseOfferingId) {
        return courseSessionRepository.findByCourseOfferingIdOrderBySessionNumberAsc(courseOfferingId);
    }

    public CourseSession activateSessionQr(String courseOfferingId, Integer sessionNumber) {
        CourseSession session = courseSessionRepository.findByCourseOfferingIdAndSessionNumber(courseOfferingId, sessionNumber)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        
        String token = qrCodeService.generateQrToken(courseOfferingId, sessionNumber);
        session.setQrCodeToken(token);
        session.setIsActive(true);
        return courseSessionRepository.save(session);
    }

    public CourseSession deactivateSessionQr(String courseOfferingId, Integer sessionNumber) {
        CourseSession session = courseSessionRepository.findByCourseOfferingIdAndSessionNumber(courseOfferingId, sessionNumber)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.setIsActive(false);
        return courseSessionRepository.save(session);
    }
}
