package com.attendx.dto;

import com.attendx.model.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class MarkAttendanceRequest {

    @NotBlank
    @JsonProperty("course_offering_id")
    private String courseOfferingId;

    @NotNull
    @JsonProperty("session_number")
    private Integer sessionNumber;

    @NotBlank
    @JsonProperty("register_number")
    private String registerNumber;

    @NotBlank
    @JsonProperty("student_name")
    private String studentName;

    @JsonProperty("date")
    private LocalDate date;

    @JsonProperty("status")
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @JsonProperty("verification_method")
    private String verificationMethod = "MANUAL"; // QR_CODE, MANUAL, BIOMETRIC, PORTAL

    @JsonProperty("qr_token")
    private String qrToken;

    @JsonProperty("faculty_remarks")
    private String facultyRemarks;

    public MarkAttendanceRequest() {}

    public String getCourseOfferingId() { return courseOfferingId; }
    public void setCourseOfferingId(String courseOfferingId) { this.courseOfferingId = courseOfferingId; }

    public Integer getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(Integer sessionNumber) { this.sessionNumber = sessionNumber; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getFacultyRemarks() { return facultyRemarks; }
    public void setFacultyRemarks(String facultyRemarks) { this.facultyRemarks = facultyRemarks; }
}
