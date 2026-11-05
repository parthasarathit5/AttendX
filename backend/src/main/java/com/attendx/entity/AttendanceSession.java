package com.attendx.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attendance_sessions", uniqueConstraints = {
    @UniqueConstraint(name = "uq_session_schedule", columnNames = {"class_id", "section", "subject_id", "session_date", "period"})
})
public class AttendanceSession {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @Column(name = "session_code", length = 100)
    private String sessionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private DegreeClass degreeClass;

    @Column(nullable = false, length = 10)
    private String section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false, length = 50)
    private String period;

    @Column(name = "topic_covered", length = 255)
    private String topicCovered;

    @Column(name = "total_enrolled", nullable = false)
    private int totalEnrolled = 0;

    @Column(name = "present_count", nullable = false)
    private int presentCount = 0;

    @Column(name = "absent_count", nullable = false)
    private int absentCount = 0;

    @Column(name = "attendance_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal attendancePercentage = BigDecimal.ZERO;

    @Column(name = "is_locked")
    private boolean locked = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "submission_status", nullable = false, length = 30)
    private SubmissionStatus submissionStatus = SubmissionStatus.DRAFT;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttendanceRecord> records = new ArrayList<>();

    public AttendanceSession() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public DegreeClass getDegreeClass() { return degreeClass; }
    public void setDegreeClass(DegreeClass degreeClass) { this.degreeClass = degreeClass; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getTopicCovered() { return topicCovered; }
    public void setTopicCovered(String topicCovered) { this.topicCovered = topicCovered; }

    public int getTotalEnrolled() { return totalEnrolled; }
    public void setTotalEnrolled(int totalEnrolled) { this.totalEnrolled = totalEnrolled; }

    public int getPresentCount() { return presentCount; }
    public void setPresentCount(int presentCount) { this.presentCount = presentCount; }

    public int getAbsentCount() { return absentCount; }
    public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }

    public BigDecimal getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(BigDecimal attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }

    public SubmissionStatus getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(SubmissionStatus submissionStatus) { this.submissionStatus = submissionStatus; }

    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<AttendanceRecord> getRecords() { return records; }
    public void setRecords(List<AttendanceRecord> records) { this.records = records; }

    public void addRecord(AttendanceRecord record) {
        records.add(record);
        record.setSession(this);
    }
}

