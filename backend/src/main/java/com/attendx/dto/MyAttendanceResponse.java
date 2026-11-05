package com.attendx.dto;

import com.attendx.model.AttendanceLog;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MyAttendanceResponse {

    @JsonProperty("logs")
    private List<AttendanceLog> logs;

    @JsonProperty("summary")
    private AttendanceSummaryDTO summary;

    public MyAttendanceResponse() {}

    public MyAttendanceResponse(List<AttendanceLog> logs, AttendanceSummaryDTO summary) {
        this.logs = logs;
        this.summary = summary;
    }

    public List<AttendanceLog> getLogs() { return logs; }
    public void setLogs(List<AttendanceLog> logs) { this.logs = logs; }

    public AttendanceSummaryDTO getSummary() { return summary; }
    public void setSummary(AttendanceSummaryDTO summary) { this.summary = summary; }
}
