package com.attendx.controller;

import com.attendx.dto.*;
import com.attendx.dto.AttendanceCorrectionRequest.AttendanceCorrectionAuditDTO;
import com.attendx.dto.AttendanceSessionDTO.AttendanceRecordDTO;
import com.attendx.service.AttendanceAuditService;
import com.attendx.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceAuditService auditService;

    public AttendanceController(AttendanceService attendanceService, AttendanceAuditService auditService) {
        this.attendanceService = attendanceService;
        this.auditService = auditService;
    }

    @GetMapping("/roster")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getRosterForMarking(
            @RequestParam String classId,
            @RequestParam(defaultValue = "A") String section) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getRosterForMarking(classId, section)));
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AttendanceSessionDTO>> submitAttendance(
            @Valid @RequestBody SubmitAttendanceRequest req) {
        AttendanceSessionDTO session = attendanceService.submitAttendanceSession(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance session finalized and locked into database", session));
    }

    @GetMapping("/sessions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AttendanceSessionDTO>> getSessionById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getSessionById(id)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    public ResponseEntity<ApiResponse<List<AttendanceSessionDTO>>> getHistory(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceSessionDTO> history = attendanceService.getAttendanceHistory(classId, section, subjectCode, teacherId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/records/{id}/correct")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AttendanceRecordDTO>> correctAttendance(
            @PathVariable String id,
            @Valid @RequestBody AttendanceCorrectionRequest req) {
        AttendanceRecordDTO updated = auditService.correctAttendanceRecord(id, req);
        return ResponseEntity.ok(ApiResponse.success("Attendance record corrected and immutably audit-logged", updated));
    }

    @GetMapping("/records/{id}/corrections")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceCorrectionAuditDTO>>> getAuditTrail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAuditTrailForRecord(id)));
    }
}

