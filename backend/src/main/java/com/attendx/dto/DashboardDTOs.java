package com.attendx.dto;

import java.util.List;
import java.util.Map;

public class DashboardDTOs {

    public static class AdminDashboardDTO {
        private Map<String, Object> stats;
        private List<ClassComparisonDTO> classComparisons;
        private List<LowAttendanceSummaryDTO> lowAttendanceWatchlist;

        public Map<String, Object> getStats() { return stats; }
        public void setStats(Map<String, Object> stats) { this.stats = stats; }
        public List<ClassComparisonDTO> getClassComparisons() { return classComparisons; }
        public void setClassComparisons(List<ClassComparisonDTO> classComparisons) { this.classComparisons = classComparisons; }
        public List<LowAttendanceSummaryDTO> getLowAttendanceWatchlist() { return lowAttendanceWatchlist; }
        public void setLowAttendanceWatchlist(List<LowAttendanceSummaryDTO> lowAttendanceWatchlist) { this.lowAttendanceWatchlist = lowAttendanceWatchlist; }
    }

    public static class TeacherDashboardDTO {
        private Map<String, Object> stats;
        private List<ScheduleItemDTO> todaySchedule;

        public Map<String, Object> getStats() { return stats; }
        public void setStats(Map<String, Object> stats) { this.stats = stats; }
        public List<ScheduleItemDTO> getTodaySchedule() { return todaySchedule; }
        public void setTodaySchedule(List<ScheduleItemDTO> todaySchedule) { this.todaySchedule = todaySchedule; }
    }

    public static class StudentDashboardDTO {
        private Map<String, Object> stats;
        private List<ReportsDTOs.SubjectAttendanceDTO> subjects;

        public Map<String, Object> getStats() { return stats; }
        public void setStats(Map<String, Object> stats) { this.stats = stats; }
        public List<ReportsDTOs.SubjectAttendanceDTO> getSubjects() { return subjects; }
        public void setSubjects(List<ReportsDTOs.SubjectAttendanceDTO> subjects) { this.subjects = subjects; }
    }

    public static class ParentDashboardDTO {
        private Map<String, Object> stats;
        private List<ChildSummaryDTO> children;

        public Map<String, Object> getStats() { return stats; }
        public void setStats(Map<String, Object> stats) { this.stats = stats; }
        public List<ChildSummaryDTO> getChildren() { return children; }
        public void setChildren(List<ChildSummaryDTO> children) { this.children = children; }
    }

    public static class ClassComparisonDTO {
        private String name;
        private double pct;
        private boolean warning;

        public ClassComparisonDTO() {}
        public ClassComparisonDTO(String name, double pct, boolean warning) {
            this.name = name;
            this.pct = pct;
            this.warning = warning;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPct() { return pct; }
        public void setPct(double pct) { this.pct = pct; }
        public boolean isWarning() { return warning; }
        public void setWarning(boolean warning) { this.warning = warning; }
    }

    public static class LowAttendanceSummaryDTO {
        private String name;
        private String regNo;
        private String className;
        private double pct;
        private String status;

        public LowAttendanceSummaryDTO() {}
        public LowAttendanceSummaryDTO(String name, String regNo, String className, double pct, String status) {
            this.name = name;
            this.regNo = regNo;
            this.className = className;
            this.pct = pct;
            this.status = status;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRegNo() { return regNo; }
        public void setRegNo(String regNo) { this.regNo = regNo; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public double getPct() { return pct; }
        public void setPct(double pct) { this.pct = pct; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ScheduleItemDTO {
        private String period;
        private String subject;
        private String className;
        private String room;
        private String status;

        public ScheduleItemDTO() {}
        public ScheduleItemDTO(String period, String subject, String className, String room, String status) {
            this.period = period;
            this.subject = subject;
            this.className = className;
            this.room = room;
            this.status = status;
        }

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getRoom() { return room; }
        public void setRoom(String room) { this.room = room; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ChildSummaryDTO {
        private String studentId;
        private String registrationNumber;
        private String fullName;
        private String className;
        private String section;
        private double attendancePercentage;
        private boolean alert;

        public ChildSummaryDTO() {}
        public ChildSummaryDTO(String studentId, String registrationNumber, String fullName, String className, String section, double attendancePercentage, boolean alert) {
            this.studentId = studentId;
            this.registrationNumber = registrationNumber;
            this.fullName = fullName;
            this.className = className;
            this.section = section;
            this.attendancePercentage = attendancePercentage;
            this.alert = alert;
        }

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
        public boolean isAlert() { return alert; }
        public void setAlert(boolean alert) { this.alert = alert; }
    }
}

