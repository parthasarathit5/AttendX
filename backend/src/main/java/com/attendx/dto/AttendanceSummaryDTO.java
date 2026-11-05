package com.attendx.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AttendanceSummaryDTO {

    @JsonProperty("total_sessions")
    private long totalSessions;

    @JsonProperty("present_sessions")
    private long presentSessions;

    @JsonProperty("absent_sessions")
    private long absentSessions;

    @JsonProperty("od_sessions")
    private long odSessions;

    @JsonProperty("attendance_percentage")
    private double attendancePercentage;

    @JsonProperty("is_eligible")
    private boolean isEligible;

    @JsonProperty("minimum_percentage")
    private double minimumPercentage = 75.0;

    @JsonProperty("exam_fee_amount")
    private Integer examFeeAmount = 1500;

    @JsonProperty("shortfall_sessions")
    private long shortfallSessions;

    public AttendanceSummaryDTO() {}

    public AttendanceSummaryDTO(long totalSessions, long presentSessions, long absentSessions, long odSessions, double attendancePercentage, boolean isEligible, double minimumPercentage, Integer examFeeAmount, long shortfallSessions) {
        this.totalSessions = totalSessions;
        this.presentSessions = presentSessions;
        this.absentSessions = absentSessions;
        this.odSessions = odSessions;
        this.attendancePercentage = attendancePercentage;
        this.isEligible = isEligible;
        this.minimumPercentage = minimumPercentage;
        this.examFeeAmount = examFeeAmount;
        this.shortfallSessions = shortfallSessions;
    }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public long getPresentSessions() { return presentSessions; }
    public void setPresentSessions(long presentSessions) { this.presentSessions = presentSessions; }

    public long getAbsentSessions() { return absentSessions; }
    public void setAbsentSessions(long absentSessions) { this.absentSessions = absentSessions; }

    public long getOdSessions() { return odSessions; }
    public void setOdSessions(long odSessions) { this.odSessions = odSessions; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public boolean isEligible() { return isEligible; }
    public void setEligible(boolean eligible) { isEligible = eligible; }

    public double getMinimumPercentage() { return minimumPercentage; }
    public void setMinimumPercentage(double minimumPercentage) { this.minimumPercentage = minimumPercentage; }

    public Integer getExamFeeAmount() { return examFeeAmount; }
    public void setExamFeeAmount(Integer examFeeAmount) { this.examFeeAmount = examFeeAmount; }

    public long getShortfallSessions() { return shortfallSessions; }
    public void setShortfallSessions(long shortfallSessions) { this.shortfallSessions = shortfallSessions; }
}
