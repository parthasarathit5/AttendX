package com.attendx.service;

import com.attendx.model.AttendanceLog;
import com.attendx.model.AttendanceStatus;
import com.attendx.model.OdRequest;
import com.attendx.repository.AttendanceLogRepository;
import com.attendx.repository.OdRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OdRequestService {

    private final OdRequestRepository odRequestRepository;
    private final AttendanceLogRepository attendanceLogRepository;

    public OdRequestService(OdRequestRepository odRequestRepository, AttendanceLogRepository attendanceLogRepository) {
        this.odRequestRepository = odRequestRepository;
        this.attendanceLogRepository = attendanceLogRepository;
    }

    public List<OdRequest> getRequestsByStudent(String registerNumber) {
        return odRequestRepository.findByRegisterNumberOrderByCreatedAtDesc(registerNumber);
    }

    public List<OdRequest> getRequestsByOffering(String courseOfferingId) {
        return odRequestRepository.findByCourseOfferingIdOrderByCreatedAtDesc(courseOfferingId);
    }

    public OdRequest submitRequest(OdRequest req) {
        req.setStatus("PENDING");
        return odRequestRepository.save(req);
    }

    @Transactional
    public OdRequest updateStatus(UUID id, String status, String comments, String reviewer) {
        OdRequest req = odRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("OD Request not found"));
        req.setStatus(status.toUpperCase());
        req.setReviewComments(comments);
        req.setReviewedBy(reviewer);
        OdRequest saved = odRequestRepository.save(req);

        // If approved, update or create attendance log as ON_DUTY
        if ("APPROVED".equalsIgnoreCase(status)) {
            Optional<AttendanceLog> logOpt = attendanceLogRepository
                    .findByCourseOfferingIdAndRegisterNumberAndSessionNumber(
                            req.getCourseOfferingId(), req.getRegisterNumber(), req.getSessionNumber()
                    );
            AttendanceLog log = logOpt.orElseGet(() -> {
                AttendanceLog newLog = new AttendanceLog();
                newLog.setCourseOfferingId(req.getCourseOfferingId());
                newLog.setRegisterNumber(req.getRegisterNumber());
                newLog.setStudentName(req.getStudentName());
                newLog.setSessionNumber(req.getSessionNumber());
                newLog.setDate(req.getDate());
                newLog.setVerificationMethod("ON_DUTY_APPROVED");
                return newLog;
            });

            log.setStatus(AttendanceStatus.ON_DUTY);
            log.setFacultyRemarks("OD Approved: " + req.getReason());
            attendanceLogRepository.save(log);
        }

        return saved;
    }
}
