package com.attendx;

import com.attendx.dto.*;
import com.attendx.entity.*;
import com.attendx.exception.DuplicateResourceException;
import com.attendx.exception.ValidationException;
import com.attendx.repository.*;
import com.attendx.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AttendXApplicationTests {

    @Autowired
    private StudentService studentService;

    @Autowired
    private AcademicService academicService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceAuditService auditService;

    @Autowired
    private ReportsService reportsService;

    @Autowired
    private ExcelExportService excelExportService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private AttendanceCorrectionAuditRepository auditRepository;

    @Test
    @DisplayName("1. Spring Boot application context loads and Flyway migrations execute")
    void contextLoads() {
        assertNotNull(studentService);
        assertNotNull(academicService);
        assertNotNull(attendanceService);
        assertNotNull(reportsService);
    }

    @Test
    @DisplayName("2. Database seeded baseline institutions, academic years, classes, and subjects exist")
    void testBaselineAcademicData() {
        List<AcademicDTOs.AcademicYearDTO> years = academicService.getAcademicYears();
        assertFalse(years.isEmpty(), "Academic years should be seeded");

        List<AcademicDTOs.DegreeClassDTO> classes = academicService.getClasses();
        assertFalse(classes.isEmpty(), "Degree classes should be seeded");
        assertTrue(classes.stream().anyMatch(c -> "BE-CSE-3A".equals(c.getCode())));

        List<AcademicDTOs.SubjectDTO> subjects = academicService.getSubjects();
        assertFalse(subjects.isEmpty(), "Subjects should be seeded");
        assertTrue(subjects.stream().anyMatch(s -> "CS301".equals(s.getCode())));
    }

    @Test
    @DisplayName("3. Student registration and unique registration number enforcement")
    @Transactional
    void testStudentCreationAndUniqueness() {
        CreateStudentRequest req = new CreateStudentRequest();
        req.setRegistrationNumber("192211099");
        req.setFirstName("Vikas");
        req.setLastName("Menon");
        req.setEmail("vikas.m@saveetha.com");
        req.setClassId("BE-CSE-3A");
        req.setSection("A");

        StudentDTO created = studentService.createStudent(req);
        assertNotNull(created.getId());
        assertEquals("192211099", created.getRegistrationNumber());

        // Duplicate registration number check
        CreateStudentRequest dup = new CreateStudentRequest();
        dup.setRegistrationNumber("192211099");
        dup.setFirstName("Vikas Duplicate");
        dup.setLastName("Menon");
        dup.setEmail("vikas.dup@saveetha.com");
        dup.setClassId("BE-CSE-3A");
        dup.setSection("A");

        assertThrows(DuplicateResourceException.class, () -> studentService.createStudent(dup));
    }

    @Test
    @DisplayName("4. Attendance session creation, duplicate prevention, and record persistence")
    @Transactional
    void testAttendanceSessionLifecycle() {
        // Fetch roster
        List<StudentDTO> roster = attendanceService.getRosterForMarking("BE-CSE-3A", "A");
        assertFalse(roster.isEmpty(), "Roster should not be empty for class BE-CSE-3A (Sec A)");

        // Prepare submission
        SubmitAttendanceRequest req = new SubmitAttendanceRequest();
        req.setClassId("BE-CSE-3A");
        req.setSection("A");
        req.setSubjectId("CS301");
        req.setSessionDate(LocalDate.of(2026, 11, 10));
        req.setPeriod("Period-1");
        req.setTopicCovered("Asymptotic Analysis and Big-O");

        List<SubmitAttendanceRequest.StudentStatusEntry> entries = roster.stream().map(s -> {
            SubmitAttendanceRequest.StudentStatusEntry e = new SubmitAttendanceRequest.StudentStatusEntry();
            e.setStudentId(s.getId());
            e.setRegistrationNumber(s.getRegistrationNumber());
            e.setStatus(s.getRegistrationNumber().endsWith("1") ? "ABSENT" : "PRESENT");
            return e;
        }).toList();
        req.setRecords(entries);

        // Submit session
        AttendanceSessionDTO session = attendanceService.submitAttendanceSession(req);
        assertNotNull(session.getId());
        assertTrue(session.isLocked(), "Session must be locked upon finalization");
        assertEquals("FINALIZED", session.getSubmissionStatus());
        assertEquals(entries.size(), session.getTotalEnrolled());

        // Verify duplicate session submission is prevented!
        assertThrows(DuplicateResourceException.class, () -> attendanceService.submitAttendanceSession(req));
    }

    @Test
    @DisplayName("5. Attendance correction audit logging creates immutable history record")
    @Transactional
    void testAttendanceCorrectionAudit() {
        // Create session first
        List<StudentDTO> roster = attendanceService.getRosterForMarking("BE-CSE-3A", "A");
        SubmitAttendanceRequest req = new SubmitAttendanceRequest();
        req.setClassId("BE-CSE-3A");
        req.setSection("A");
        req.setSubjectId("CS302");
        req.setSessionDate(LocalDate.of(2026, 11, 11));
        req.setPeriod("Period-2");
        req.setRecords(roster.stream().map(s -> {
            SubmitAttendanceRequest.StudentStatusEntry e = new SubmitAttendanceRequest.StudentStatusEntry();
            e.setStudentId(s.getId());
            e.setRegistrationNumber(s.getRegistrationNumber());
            e.setStatus("ABSENT");
            return e;
        }).toList());

        AttendanceSessionDTO session = attendanceService.submitAttendanceSession(req);
        AttendanceSessionDTO.AttendanceRecordDTO firstRecord = session.getRecords().get(0);

        // Apply correction with valid reason
        AttendanceCorrectionRequest corr = new AttendanceCorrectionRequest();
        corr.setNewStatus("PRESENT");
        corr.setReason("Biometric hardware terminal desync corrected upon HOD review");

        AttendanceSessionDTO.AttendanceRecordDTO updated = auditService.correctAttendanceRecord(firstRecord.getId(), corr);
        assertEquals("PRESENT", updated.getStatus());

        // Verify immutable audit log
        List<AttendanceCorrectionRequest.AttendanceCorrectionAuditDTO> auditTrail = auditService.getAuditTrailForRecord(firstRecord.getId());
        assertFalse(auditTrail.isEmpty(), "Audit log must contain entry");
        assertEquals("ABSENT", auditTrail.get(0).getOriginalStatus());
        assertEquals("PRESENT", auditTrail.get(0).getCorrectedStatus());
        assertTrue(auditTrail.get(0).getCorrectionReason().contains("Biometric hardware terminal"));
    }

    @Test
    @DisplayName("6. Mathematical calculation accuracy and zero session handling")
    void testPercentageCalculations() {
        assertEquals(0.0, ReportsService.calculatePercentage(0, 0), "0 sessions must return 0.0%");
        assertEquals(100.0, ReportsService.calculatePercentage(10, 10));
        assertEquals(80.0, ReportsService.calculatePercentage(8, 10));
        assertEquals(74.5, ReportsService.calculatePercentage(745, 1000));
    }

    @Test
    @DisplayName("7. Low attendance regulatory shortfall detection (< 75% and < 65% debarred)")
    void testLowAttendanceDetection() {
        List<ReportsDTOs.LowAttendanceStudentDTO> lowList = reportsService.getLowAttendanceStudents(75.0);
        assertNotNull(lowList);
        for (ReportsDTOs.LowAttendanceStudentDTO s : lowList) {
            assertTrue(s.getAttendancePercentage() < 75.0, "All items in low list must be < 75%");
            if (s.getAttendancePercentage() < 65.0) {
                assertTrue(s.isCritical(), "Percentage < 65 must be flagged critical debarred");
            }
        }
    }

    @Test
    @DisplayName("8. Genuine Excel (.xlsx) OpenXML workbook generation with Apache POI")
    void testExcelExportGeneration() throws IOException {
        byte[] excelBytes = excelExportService.generateLowAttendanceExcel(75.0);
        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 500, "Excel binary workbook should have substantial content");

        // Verify PK ZIP header signature for genuine OpenXML .xlsx (0x50, 0x4B, 0x03, 0x04)
        assertEquals(0x50, excelBytes[0], "Byte 0 should be 'P'");
        assertEquals(0x4B, excelBytes[1], "Byte 1 should be 'K'");
        assertEquals(0x03, excelBytes[2], "Byte 2 should be 0x03");
        assertEquals(0x04, excelBytes[3], "Byte 3 should be 0x04");
    }
}

