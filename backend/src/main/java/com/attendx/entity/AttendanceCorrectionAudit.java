package com.attendx.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "attendance_correction_audit")
public class AttendanceCorrectionAudit {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private AttendanceRecord record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "original_status", nullable = false, length = 20)
    private String originalStatus;

    @Column(name = "corrected_status", nullable = false, length = 20)
    private String correctedStatus;

    @Column(name = "correction_reason", nullable = false, columnDefinition = "TEXT")
    private String correctionReason;

    @Column(name = "changed_by_user_id", nullable = false, length = 36)
    private String changedByUserId;

    @Column(name = "changed_by_name", nullable = false, length = 150)
    private String changedByName;

    @Column(name = "changed_at")
    private OffsetDateTime changedAt = OffsetDateTime.now();

    public AttendanceCorrectionAudit() {}

    public AttendanceCorrectionAudit(String id, AttendanceRecord record, AttendanceSession session, Student student,
                                     String originalStatus, String correctedStatus, String correctionReason,
                                     String changedByUserId, String changedByName) {
        this.id = id;
        this.record = record;
        this.session = session;
        this.student = student;
        this.originalStatus = originalStatus;
        this.correctedStatus = correctedStatus;
        this.correctionReason = correctionReason;
        this.changedByUserId = changedByUserId;
        this.changedByName = changedByName;
        this.changedAt = OffsetDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public AttendanceRecord getRecord() { return record; }
    public void setRecord(AttendanceRecord record) { this.record = record; }

    public AttendanceSession getSession() { return session; }
    public void setSession(AttendanceSession session) { this.session = session; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getOriginalStatus() { return originalStatus; }
    public void setOriginalStatus(String originalStatus) { this.originalStatus = originalStatus; }

    public String getCorrectedStatus() { return correctedStatus; }
    public void setCorrectedStatus(String correctedStatus) { this.correctedStatus = correctedStatus; }

    public String getCorrectionReason() { return correctionReason; }
    public void setCorrectionReason(String correctionReason) { this.correctionReason = correctionReason; }

    public String getChangedByUserId() { return changedByUserId; }
    public void setChangedByUserId(String changedByUserId) { this.changedByUserId = changedByUserId; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public OffsetDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(OffsetDateTime changedAt) { this.changedAt = changedAt; }
}

