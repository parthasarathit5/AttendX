package com.attendx.dto;

import com.attendx.entity.AttendanceSession;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class AttendanceSessionDTO {
    private String id;
    private String sessionCode;
    private String classId;
    private String className;
    private String section;
    private String subjectId;
    private String subjectCode;
    private String subjectName;
    private String teacherId;
    private String teacherName;
    private LocalDate sessionDate;
    private String period;
    private String topicCovered;
    private int totalEnrolled;
    private int presentCount;
    private int absentCount;
    private BigDecimal attendancePercentage;
    private boolean isLocked;
    private String submissionStatus;
    private OffsetDateTime submittedAt;
    private List<AttendanceRecordDTO> records;

    public AttendanceSessionDTO() {}

    public static AttendanceSessionDTO fromEntity(AttendanceSession s, boolean includeRecords) {
        AttendanceSessionDTO dto = new AttendanceSessionDTO();
        dto.setId(s.getId());
        dto.setSessionCode(s.getSessionCode());
        if (s.getDegreeClass() != null) {
            dto.setClassId(s.getDegreeClass().getId());
            dto.setClassName(s.getDegreeClass().getName());
        }
        dto.setSection(s.getSection());
        if (s.getSubject() != null) {
            dto.setSubjectId(s.getSubject().getId());
            dto.setSubjectCode(s.getSubject().getCode());
            dto.setSubjectName(s.getSubject().getName());
        }
        if (s.getTeacher() != null) {
            dto.setTeacherId(s.getTeacher().getId());
            dto.setTeacherName(s.getTeacher().getFullName());
        }
        dto.setSessionDate(s.getSessionDate());
        dto.setPeriod(s.getPeriod());
        dto.setTopicCovered(s.getTopicCovered());
        dto.setTotalEnrolled(s.getTotalEnrolled());
        dto.setPresentCount(s.getPresentCount());
        dto.setAbsentCount(s.getAbsentCount());
        dto.setAttendancePercentage(s.getAttendancePercentage());
        dto.setLocked(s.isLocked());
        dto.setSubmissionStatus(s.getSubmissionStatus().name());
        dto.setSubmittedAt(s.getSubmittedAt());

        if (includeRecords && s.getRecords() != null) {
            dto.setRecords(s.getRecords().stream()
                .map(r -> new AttendanceRecordDTO(
                    r.getId(),
                    r.getStudent().getId(),
                    r.getStudent().getFullName(),
                    r.getRegistrationNumber(),
                    r.getStatus().name(),
                    r.getRemark()
                ))
                .collect(Collectors.toList()));
        }

        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }
    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
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
    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }
    public String getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(String submissionStatus) { this.submissionStatus = submissionStatus; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }
    public List<AttendanceRecordDTO> getRecords() { return records; }
    public void setRecords(List<AttendanceRecordDTO> records) { this.records = records; }

    public static class AttendanceRecordDTO {
        private String id;
        private String studentId;
        private String studentName;
        private String registrationNumber;
        private String status;
        private String remark;

        public AttendanceRecordDTO() {}

        public AttendanceRecordDTO(String id, String studentId, String studentName, String registrationNumber, String status, String remark) {
            this.id = id;
            this.studentId = studentId;
            this.studentName = studentName;
            this.registrationNumber = registrationNumber;
            this.status = status;
            this.remark = remark;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemark() { return remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }
}

