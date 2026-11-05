package com.attendx.dto;

import com.attendx.entity.AttendanceCorrectionAudit;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

public class AttendanceCorrectionRequest {

    @NotBlank(message = "New attendance status is required (PRESENT, ABSENT, OD, LATE)")
    private String newStatus;

    @NotBlank(message = "Official correction reason is mandatory for regulatory compliance")
    private String reason;

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public static class AttendanceCorrectionAuditDTO {
        private String id;
        private String recordId;
        private String sessionId;
        private String studentId;
        private String originalStatus;
        private String correctedStatus;
        private String correctionReason;
        private String changedByName;
        private OffsetDateTime changedAt;

        public static AttendanceCorrectionAuditDTO fromEntity(AttendanceCorrectionAudit a) {
            AttendanceCorrectionAuditDTO dto = new AttendanceCorrectionAuditDTO();
            dto.setId(a.getId());
            dto.setRecordId(a.getRecord().getId());
            dto.setSessionId(a.getSession().getId());
            dto.setStudentId(a.getStudent().getId());
            dto.setOriginalStatus(a.getOriginalStatus());
            dto.setCorrectedStatus(a.getCorrectedStatus());
            dto.setCorrectionReason(a.getCorrectionReason());
            dto.setChangedByName(a.getChangedByName());
            dto.setChangedAt(a.getChangedAt());
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getRecordId() { return recordId; }
        public void setRecordId(String recordId) { this.recordId = recordId; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getOriginalStatus() { return originalStatus; }
        public void setOriginalStatus(String originalStatus) { this.originalStatus = originalStatus; }
        public String getCorrectedStatus() { return correctedStatus; }
        public void setCorrectedStatus(String correctedStatus) { this.correctedStatus = correctedStatus; }
        public String getCorrectionReason() { return correctionReason; }
        public void setCorrectionReason(String correctionReason) { this.correctionReason = correctionReason; }
        public String getChangedByName() { return changedByName; }
        public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
        public OffsetDateTime getChangedAt() { return changedAt; }
        public void setChangedAt(OffsetDateTime changedAt) { this.changedAt = changedAt; }
    }
}

