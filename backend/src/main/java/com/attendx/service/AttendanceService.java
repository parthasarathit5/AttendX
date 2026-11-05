package com.attendx.service;

import com.attendx.dto.AttendanceSummaryDTO;
import com.attendx.dto.MarkAttendanceRequest;
import com.attendx.dto.MyAttendanceResponse;
import com.attendx.model.AttendanceLog;
import com.attendx.model.AttendanceStatus;
import com.attendx.model.CourseSession;
import com.attendx.repository.AttendanceLogRepository;
import com.attendx.repository.CourseSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final CourseSessionRepository courseSessionRepository;

    @Value("${attendx.attendance.minimum-percentage:75.0}")
    private double minimumPercentage;

    @Value("${attendx.attendance.exam-fee-amount:1500}")
    private int examFeeAmount;

    public AttendanceService(AttendanceLogRepository attendanceLogRepository, CourseSessionRepository courseSessionRepository) {
        this.attendanceLogRepository = attendanceLogRepository;
        this.courseSessionRepository = courseSessionRepository;
    }

    public MyAttendanceResponse getStudentAttendance(String courseOfferingId, String registerNumber) {
        List<AttendanceLog> logs = attendanceLogRepository.findByCourseOfferingIdAndRegisterNumberOrderBySessionNumberAsc(
                courseOfferingId, registerNumber
        );

        long total = logs.size();
        long present = logs.stream().filter(l -> l.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = logs.stream().filter(l -> l.getStatus() == AttendanceStatus.ABSENT).count();
        long od = logs.stream().filter(l -> l.getStatus() == AttendanceStatus.ON_DUTY).count();

        // Effective attended includes Present + On Duty
        long effectiveAttended = present + od;
        double percentage = total > 0 ? ((double) effectiveAttended / total) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        boolean isEligible = percentage >= minimumPercentage;

        // Calculate how many more classes needed to reach threshold if below
        long shortfall = 0;
        if (!isEligible && total > 0) {
            // (effectiveAttended + x) / (total + x) >= minPct/100
            // x * (1 - minPct/100) >= (minPct/100 * total) - effectiveAttended
            double required = Math.ceil((minimumPercentage / 100.0 * total - effectiveAttended) / (1.0 - minimumPercentage / 100.0));
            shortfall = Math.max(0, (long) required);
        }

        AttendanceSummaryDTO summary = new AttendanceSummaryDTO(
                total, present, absent, od, percentage, isEligible, minimumPercentage, examFeeAmount, shortfall
        );

        return new MyAttendanceResponse(logs, summary);
    }

    @Transactional
    public AttendanceLog markAttendance(MarkAttendanceRequest req) {
        // If QR token is supplied, validate it
        if ("QR_CODE".equalsIgnoreCase(req.getVerificationMethod()) && req.getQrToken() != null) {
            Optional<CourseSession> sessionOpt = courseSessionRepository.findByQrCodeToken(req.getQrToken());
            if (sessionOpt.isEmpty() || !sessionOpt.get().getIsActive()) {
                throw new IllegalArgumentException("Invalid or expired QR token for attendance check-in");
            }
        }

        Optional<AttendanceLog> existing = attendanceLogRepository
                .findByCourseOfferingIdAndRegisterNumberAndSessionNumber(
                        req.getCourseOfferingId(), req.getRegisterNumber(), req.getSessionNumber()
                );

        AttendanceLog log;
        if (existing.isPresent()) {
            log = existing.get();
            log.setStatus(req.getStatus());
            log.setVerificationMethod(req.getVerificationMethod() != null ? req.getVerificationMethod() : log.getVerificationMethod());
            if (req.getFacultyRemarks() != null) {
                log.setFacultyRemarks(req.getFacultyRemarks());
            }
        } else {
            log = new AttendanceLog();
            log.setCourseOfferingId(req.getCourseOfferingId());
            log.setRegisterNumber(req.getRegisterNumber());
            log.setStudentName(req.getStudentName());
            log.setSessionNumber(req.getSessionNumber());
            log.setDate(req.getDate() != null ? req.getDate() : LocalDate.now());
            log.setStatus(req.getStatus() != null ? req.getStatus() : AttendanceStatus.PRESENT);
            log.setVerificationMethod(req.getVerificationMethod() != null ? req.getVerificationMethod() : "MANUAL");
            log.setFacultyRemarks(req.getFacultyRemarks());
        }

        return attendanceLogRepository.save(log);
    }

    public List<AttendanceLog> getAllLogsForOffering(String courseOfferingId, String registerNumber) {
        return attendanceLogRepository.findByCourseOfferingIdAndRegisterNumberOrderBySessionNumberAsc(
                courseOfferingId, registerNumber
        );
    }
}
