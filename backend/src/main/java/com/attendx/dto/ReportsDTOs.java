package com.attendx.dto;

import java.math.BigDecimal;
import java.util.List;

public class ReportsDTOs {

    public static class OverallAnalyticsDTO {
        private int totalStudents;
        private int totalSessions;
        private int presentRecords;
        private int absentRecords;
        private double overallPercentage;
        private double threshold;
        private int studentsBelowThresholdCount;
        private List<ClassSummaryDTO> classBreakdown;
        private List<DailyTrendDTO> dailyTrends;

        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }
        public int getPresentRecords() { return presentRecords; }
        public void setPresentRecords(int presentRecords) { this.presentRecords = presentRecords; }
        public int getAbsentRecords() { return absentRecords; }
        public void setAbsentRecords(int absentRecords) { this.absentRecords = absentRecords; }
        public double getOverallPercentage() { return overallPercentage; }
        public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }
        public double getThreshold() { return threshold; }
        public void setThreshold(double threshold) { this.threshold = threshold; }
        public int getStudentsBelowThresholdCount() { return studentsBelowThresholdCount; }
        public void setStudentsBelowThresholdCount(int studentsBelowThresholdCount) { this.studentsBelowThresholdCount = studentsBelowThresholdCount; }
        public List<ClassSummaryDTO> getClassBreakdown() { return classBreakdown; }
        public void setClassBreakdown(List<ClassSummaryDTO> classBreakdown) { this.classBreakdown = classBreakdown; }
        public List<DailyTrendDTO> getDailyTrends() { return dailyTrends; }
        public void setDailyTrends(List<DailyTrendDTO> dailyTrends) { this.dailyTrends = dailyTrends; }
    }

    public static class ClassSummaryDTO {
        private String classId;
        private String className;
        private String section;
        private int totalSessions;
        private int presentCount;
        private int absentCount;
        private double percentage;
        private boolean belowThreshold;

        public String getClassId() { return classId; }
        public void setClassId(String classId) { this.classId = classId; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }
        public int getPresentCount() { return presentCount; }
        public void setPresentCount(int presentCount) { this.presentCount = presentCount; }
        public int getAbsentCount() { return absentCount; }
        public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public boolean isBelowThreshold() { return belowThreshold; }
        public void setBelowThreshold(boolean belowThreshold) { this.belowThreshold = belowThreshold; }
    }

    public static class DailyTrendDTO {
        private String date;
        private double rate;
        private int present;
        private int absent;

        public DailyTrendDTO() {}
        public DailyTrendDTO(String date, double rate, int present, int absent) {
            this.date = date;
            this.rate = rate;
            this.present = present;
            this.absent = absent;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public double getRate() { return rate; }
        public void setRate(double rate) { this.rate = rate; }
        public int getPresent() { return present; }
        public void setPresent(int present) { this.present = present; }
        public int getAbsent() { return absent; }
        public void setAbsent(int absent) { this.absent = absent; }
    }

    public static class LowAttendanceStudentDTO {
        private String studentId;
        private String registrationNumber;
        private String fullName;
        private String className;
        private String section;
        private double attendancePercentage;
        private int presentClasses;
        private int absentClasses;
        private int totalClasses;
        private double shortfallMargin;
        private boolean isCritical; // < 65% debarred risk
        private String statusLabel;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }
        public int getAbsentClasses() { return absentClasses; }
        public void setAbsentClasses(int absentClasses) { this.absentClasses = absentClasses; }
        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }
        public double getShortfallMargin() { return shortfallMargin; }
        public void setShortfallMargin(double shortfallMargin) { this.shortfallMargin = shortfallMargin; }
        public boolean isCritical() { return isCritical; }
        public void setCritical(boolean critical) { isCritical = critical; }
        public String getStatusLabel() { return statusLabel; }
        public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }
    }

    public static class StudentReportDTO {
        private StudentDTO student;
        private int totalClasses;
        private int presentClasses;
        private int absentClasses;
        private double percentage;
        private double threshold;
        private boolean isShortfall;
        private List<SubjectAttendanceDTO> subjectBreakdown;
        private List<StudentDateLogDTO> dateLogs;

        public StudentDTO getStudent() { return student; }
        public void setStudent(StudentDTO student) { this.student = student; }
        public int getTotalClasses() { return totalClasses; }
        public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }
        public int getPresentClasses() { return presentClasses; }
        public void setPresentClasses(int presentClasses) { this.presentClasses = presentClasses; }
        public int getAbsentClasses() { return absentClasses; }
        public void setAbsentClasses(int absentClasses) { this.absentClasses = absentClasses; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public double getThreshold() { return threshold; }
        public void setThreshold(double threshold) { this.threshold = threshold; }
        public boolean isShortfall() { return isShortfall; }
        public void setShortfall(boolean shortfall) { isShortfall = shortfall; }
        public List<SubjectAttendanceDTO> getSubjectBreakdown() { return subjectBreakdown; }
        public void setSubjectBreakdown(List<SubjectAttendanceDTO> subjectBreakdown) { this.subjectBreakdown = subjectBreakdown; }
        public List<StudentDateLogDTO> getDateLogs() { return dateLogs; }
        public void setDateLogs(List<StudentDateLogDTO> dateLogs) { this.dateLogs = dateLogs; }
    }

    public static class SubjectAttendanceDTO {
        private String code;
        private String name;
        private String faculty;
        private int present;
        private int total;
        private double percentage;

        public SubjectAttendanceDTO() {}
        public SubjectAttendanceDTO(String code, String name, String faculty, int present, int total, double percentage) {
            this.code = code;
            this.name = name;
            this.faculty = faculty;
            this.present = present;
            this.total = total;
            this.percentage = percentage;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getFaculty() { return faculty; }
        public void setFaculty(String faculty) { this.faculty = faculty; }
        public int getPresent() { return present; }
        public void setPresent(int present) { this.present = present; }
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class StudentDateLogDTO {
        private String date;
        private String period;
        private String subjectCode;
        private String subjectName;
        private String faculty;
        private String status;
        private String remark;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public String getFaculty() { return faculty; }
        public void setFaculty(String faculty) { this.faculty = faculty; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemark() { return remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class ClassReportDTO {
        private String classId;
        private String section;
        private int totalEnrolled;
        private int totalSessions;
        private double avgPercentage;
        private int shortfallCount;
        private double threshold;
        private List<StudentDTO> studentRoster;

        public String getClassId() { return classId; }
        public void setClassId(String classId) { this.classId = classId; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public int getTotalEnrolled() { return totalEnrolled; }
        public void setTotalEnrolled(int totalEnrolled) { this.totalEnrolled = totalEnrolled; }
        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }
        public double getAvgPercentage() { return avgPercentage; }
        public void setAvgPercentage(double avgPercentage) { this.avgPercentage = avgPercentage; }
        public int getShortfallCount() { return shortfallCount; }
        public void setShortfallCount(int shortfallCount) { this.shortfallCount = shortfallCount; }
        public double getThreshold() { return threshold; }
        public void setThreshold(double threshold) { this.threshold = threshold; }
        public List<StudentDTO> getStudentRoster() { return studentRoster; }
        public void setStudentRoster(List<StudentDTO> studentRoster) { this.studentRoster = studentRoster; }
    }
}

