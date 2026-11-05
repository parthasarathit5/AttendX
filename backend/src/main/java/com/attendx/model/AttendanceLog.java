package com.attendx.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_logs")
public class AttendanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "attendance_id")
    @JsonProperty("attendance_id")
    private UUID attendanceId;

    @Column(name = "course_offering_id", nullable = false)
    @JsonProperty("course_offering_id")
    private String courseOfferingId;

    @Column(name = "session_id")
    @JsonProperty("session_id")
    private UUID sessionId;

    @Column(name = "user_id")
    @JsonProperty("user_id")
    private UUID userId;

    @Column(name = "register_number", nullable = false)
    @JsonProperty("register_number")
    private String registerNumber;

    @Column(name = "student_name", nullable = false)
    @JsonProperty("student_name")
    private String studentName;

    @Column(name = "session_number", nullable = false)
    @JsonProperty("session_number")
    private Integer sessionNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "department_name")
    @JsonProperty("department_name")
    private String departmentName = "Department of Computer Science and Engineering";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "verification_method")
    @JsonProperty("verification_method")
    private String verificationMethod = "PORTAL";

    @Column(name = "faculty_remarks")
    @JsonProperty("faculty_remarks")
    private String facultyRemarks;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public AttendanceLog() {}

    public AttendanceLog(String courseOfferingId, UUID sessionId, String registerNumber, String studentName, Integer sessionNumber, LocalDate date, AttendanceStatus status, String verificationMethod) {
        this.courseOfferingId = courseOfferingId;
        this.sessionId = sessionId;
        this.registerNumber = registerNumber;
        this.studentName = studentName;
        this.sessionNumber = sessionNumber;
        this.date = date;
        this.status = status;
        this.verificationMethod = verificationMethod;
    }

    public UUID getAttendanceId() { return attendanceId; }
    public void setAttendanceId(UUID attendanceId) { this.attendanceId = attendanceId; }

    public String getCourseOfferingId() { return courseOfferingId; }
    public void setCourseOfferingId(String courseOfferingId) { this.courseOfferingId = courseOfferingId; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Integer getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(Integer sessionNumber) { this.sessionNumber = sessionNumber; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }

    public String getFacultyRemarks() { return facultyRemarks; }
    public void setFacultyRemarks(String facultyRemarks) { this.facultyRemarks = facultyRemarks; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
