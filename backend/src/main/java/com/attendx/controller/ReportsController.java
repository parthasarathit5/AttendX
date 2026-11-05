package com.attendx.controller;

import com.attendx.dto.ApiResponse;
import com.attendx.dto.ReportsDTOs.LowAttendanceStudentDTO;
import com.attendx.dto.ReportsDTOs.OverallAnalyticsDTO;
import com.attendx.dto.ReportsDTOs.StudentReportDTO;
import com.attendx.entity.UserRole;
import com.attendx.exception.UnauthorizedException;
import com.attendx.security.SecurityUtils;
import com.attendx.service.ExcelExportService;
import com.attendx.service.ReportsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportsController {

    private final ReportsService reportsService;
    private final ExcelExportService excelExportService;

    public ReportsController(ReportsService reportsService, ExcelExportService excelExportService) {
        this.reportsService = reportsService;
        this.excelExportService = excelExportService;
    }

    @GetMapping("/overall")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<OverallAnalyticsDTO>> getOverallAnalytics(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                reportsService.getOverallAnalytics(classId, section, subjectCode, teacherId, startDate, endDate)
        ));
    }

    @GetMapping("/low-attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<LowAttendanceStudentDTO>>> getLowAttendance(
            @RequestParam(required = false) Double threshold) {
        double cutOff = (threshold != null && threshold > 0) ? threshold : reportsService.getRegulatoryThreshold();
        return ResponseEntity.ok(ApiResponse.success(reportsService.getLowAttendanceStudents(cutOff)));
    }

    @GetMapping("/student/{regNo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    public ResponseEntity<ApiResponse<StudentReportDTO>> getStudentReport(@PathVariable String regNo) {
        if (SecurityUtils.hasRole(UserRole.STUDENT)) {
            StudentReportDTO report = reportsService.getStudentReport(regNo);
            if (!report.getStudent().getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())) {
                throw new UnauthorizedException("Access denied: You may only view your own attendance report.");
            }
            return ResponseEntity.ok(ApiResponse.success(report));
        }

        return ResponseEntity.ok(ApiResponse.success(reportsService.getStudentReport(regNo)));
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(defaultValue = "low-attendance") String reportType,
            @RequestParam(required = false) Double threshold) throws IOException {

        double cutOff = (threshold != null && threshold > 0) ? threshold : reportsService.getRegulatoryThreshold();
        byte[] bytes = excelExportService.generateLowAttendanceExcel(cutOff);

        String filename = "AttendX_" + reportType.replace("-", "_") + "_" + System.currentTimeMillis() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}

