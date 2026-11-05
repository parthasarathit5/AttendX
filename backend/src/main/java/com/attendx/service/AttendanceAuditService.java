package com.attendx.service;

import com.attendx.dto.AttendanceCorrectionRequest;
import com.attendx.dto.AttendanceCorrectionRequest.AttendanceCorrectionAuditDTO;
import com.attendx.dto.AttendanceSessionDTO.AttendanceRecordDTO;
import com.attendx.entity.*;
import com.attendx.exception.ResourceNotFoundException;
import com.attendx.exception.ValidationException;
import com.attendx.repository.AttendanceCorrectionAuditRepository;
import com.attendx.repository.AttendanceRecordRepository;
import com.attendx.repository.AttendanceSessionRepository;
import com.attendx.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttendanceAuditService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceAuditService.class);

    private final AttendanceRecordRepository recordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceCorrectionAuditRepository auditRepository;

    public AttendanceAuditService(AttendanceRecordRepository recordRepository,
                                  AttendanceSessionRepository sessionRepository,
                                  AttendanceCorrectionAuditRepository auditRepository) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
        this.auditRepository = auditRepository;
    }

    @Transactional
    public AttendanceRecordDTO correctAttendanceRecord(String recordId, AttendanceCorrectionRequest req) {
        if (req.getReason() == null || req.getReason().trim().length() < 5) {
            throw new ValidationException("A detailed, official correction reason (min 5 characters) is mandatory.");
        }

        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + recordId));

        AttendanceStatus newStatus;
        try {
            newStatus = AttendanceStatus.valueOf(req.getNewStatus().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ValidationException("Invalid status: " + req.getNewStatus() + ". Allowed: PRESENT, ABSENT, OD, LATE");
        }

        String originalStatus = record.getStatus().name();
        if (originalStatus.equalsIgnoreCase(newStatus.name())) {
            throw new ValidationException("New status is identical to existing status (" + originalStatus + ")");
        }

        // 1. Create Immutable Audit Log Entry
        String currentUserId = SecurityUtils.getCurrentUserId();
        String currentUserName = SecurityUtils.getCurrentUser().map(u -> u.getFullName()).orElse("Official Administrator");

        AttendanceCorrectionAudit audit = new AttendanceCorrectionAudit(
                "aud-" + UUID.randomUUID().toString().substring(0, 8),
                record,
                record.getSession(),
                record.getStudent(),
                originalStatus,
                newStatus.name(),
                req.getReason().trim(),
                currentUserId,
                currentUserName
        );
        auditRepository.save(audit);

        // 2. Update Record Status
        record.setStatus(newStatus);
        record.setUpdatedAt(OffsetDateTime.now());
        recordRepository.save(record);

        // 3. Recalculate Session Present / Absent Totals
        AttendanceSession session = record.getSession();
        List<AttendanceRecord> records = recordRepository.findBySession(session);
        int presentCount = 0;
        int absentCount = 0;
        for (AttendanceRecord r : records) {
            if (r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.OD) {
                presentCount++;
            } else {
                absentCount++;
            }
        }
        session.setPresentCount(presentCount);
        session.setAbsentCount(absentCount);
        if (records.size() > 0) {
            session.setAttendancePercentage(BigDecimal.valueOf((double) presentCount / records.size() * 100).setScale(2, RoundingMode.HALF_UP));
        }
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        log.info("ATTENDANCE AUDIT LOGGED: Record {} for Student {} changed from {} to {} by {} [Reason: {}]",
                record.getId(), record.getRegistrationNumber(), originalStatus, newStatus.name(), currentUserName, req.getReason());

        return new AttendanceRecordDTO(
                record.getId(),
                record.getStudent().getId(),
                record.getStudent().getFullName(),
                record.getRegistrationNumber(),
                record.getStatus().name(),
                record.getRemark()
        );
    }

    @Transactional(readOnly = true)
    public List<AttendanceCorrectionAuditDTO> getAuditTrailForRecord(String recordId) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + recordId));

        return auditRepository.findByRecordOrderByChangedAtDesc(record).stream()
                .map(AttendanceCorrectionAuditDTO::fromEntity)
                .collect(Collectors.toList());
    }
}

