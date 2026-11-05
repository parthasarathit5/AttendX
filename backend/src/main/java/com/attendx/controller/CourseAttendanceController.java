package com.attendx.controller;

import com.attendx.dto.MarkAttendanceRequest;
import com.attendx.dto.MyAttendanceResponse;
import com.attendx.model.AttendanceLog;
import com.attendx.model.CourseSession;
import com.attendx.service.AttendanceService;
import com.attendx.service.CourseOfferingService;
import com.attendx.service.QrCodeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/course-attendance")
@CrossOrigin(origins = "*")
public class CourseAttendanceController {

    private final AttendanceService attendanceService;
    private final CourseOfferingService courseOfferingService;
    private final QrCodeService qrCodeService;

    public CourseAttendanceController(AttendanceService attendanceService,
                                      CourseOfferingService courseOfferingService,
                                      QrCodeService qrCodeService) {
        this.attendanceService = attendanceService;
        this.courseOfferingService = courseOfferingService;
        this.qrCodeService = qrCodeService;
    }

    /**
     * Exact V-Study API endpoint for fetching attendance logs & summary
     */
    @GetMapping("/course-offerings/{courseOfferingId}/my-attendance")
    public ResponseEntity<MyAttendanceResponse> getMyAttendance(
            @PathVariable String courseOfferingId,
            @RequestParam(defaultValue = "192111001") String registerNumber) {
        MyAttendanceResponse resp = attendanceService.getStudentAttendance(courseOfferingId, registerNumber);
        return ResponseEntity.ok(resp);
    }

    /**
     * Mark single attendance (Faculty or Student self-checkin)
     */
    @PostMapping("/mark")
    public ResponseEntity<AttendanceLog> markAttendance(@Valid @RequestBody MarkAttendanceRequest req) {
        AttendanceLog saved = attendanceService.markAttendance(req);
        return ResponseEntity.ok(saved);
    }

    /**
     * Generate session QR Code token & PNG image
     */
    @PostMapping("/course-offerings/{courseOfferingId}/sessions/{sessionNumber}/generate-qr")
    public ResponseEntity<Map<String, Object>> generateSessionQr(
            @PathVariable String courseOfferingId,
            @PathVariable Integer sessionNumber) {
        CourseSession session = courseOfferingService.activateSessionQr(courseOfferingId, sessionNumber);
        String base64Image = qrCodeService.generateQrBase64Image(session.getQrCodeToken(), 300, 300);

        Map<String, Object> resp = new HashMap<>();
        resp.put("session_number", sessionNumber);
        resp.put("course_offering_id", courseOfferingId);
        resp.put("qr_token", session.getQrCodeToken());
        resp.put("qr_image", base64Image);
        resp.put("expires_in_seconds", 300);
        return ResponseEntity.ok(resp);
    }

    /**
     * Check-in via QR token (used by mobile app and web camera scanner)
     */
    @PostMapping("/qr-checkin")
    public ResponseEntity<Map<String, Object>> qrCheckIn(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String regNo = payload.getOrDefault("register_number", "192111001");
        String studentName = payload.getOrDefault("student_name", "Arun Kumar S");

        if (token == null || !token.startsWith("ATTENDX:")) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid AttendX QR code format.");
            return ResponseEntity.badRequest().body(err);
        }

        String[] parts = token.split(":");
        if (parts.length < 3) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Corrupt QR code data.");
            return ResponseEntity.badRequest().body(err);
        }

        String courseOfferingId = parts[1];
        int sessionNumber = Integer.parseInt(parts[2]);

        MarkAttendanceRequest req = new MarkAttendanceRequest();
        req.setCourseOfferingId(courseOfferingId);
        req.setSessionNumber(sessionNumber);
        req.setRegisterNumber(regNo);
        req.setStudentName(studentName);
        req.setVerificationMethod("QR_CODE");
        req.setQrToken(token);

        try {
            AttendanceLog log = attendanceService.markAttendance(req);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Attendance successfully verified and marked for Session #" + sessionNumber);
            resp.put("log", log);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
