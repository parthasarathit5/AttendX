package com.attendx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class SubmitAttendanceRequest {

    @NotBlank(message = "Class ID is required")
    private String classId;

    @NotBlank(message = "Section is required")
    private String section;

    @NotBlank(message = "Subject ID is required")
    private String subjectId;

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @NotBlank(message = "Period is required")
    private String period;

    private String topicCovered;

    @NotEmpty(message = "Student attendance entries cannot be empty")
    private List<StudentStatusEntry> records;

    public static class StudentStatusEntry {
        @NotBlank(message = "Student ID is required")
        private String studentId;

        @NotBlank(message = "Registration number is required")
        private String registrationNumber;

        @NotBlank(message = "Attendance status is required (PRESENT, ABSENT, OD, LATE)")
        private String status;

        private String remark;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemark() { return remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public String getTopicCovered() { return topicCovered; }
    public void setTopicCovered(String topicCovered) { this.topicCovered = topicCovered; }
    public List<StudentStatusEntry> getRecords() { return records; }
    public void setRecords(List<StudentStatusEntry> records) { this.records = records; }
}

