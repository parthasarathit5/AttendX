package com.attendx.service;

import com.attendx.dto.AttendanceSessionDTO;
import com.attendx.dto.AttendanceSummaryDTO;
import com.attendx.dto.MarkAttendanceRequest;
import com.attendx.dto.MyAttendanceResponse;
import com.attendx.dto.StudentDTO;
import com.attendx.dto.SubmitAttendanceRequest;
import com.attendx.entity.*;
import com.attendx.exception.DuplicateResourceException;
import com.attendx.exception.ResourceNotFoundException;
import com.attendx.exception.UnauthorizedException;
import com.attendx.exception.ValidationException;
import com.attendx.model.AttendanceLog;
import com.attendx.model.CourseSession;
import com.attendx.repository.*;
import com.attendx.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final DegreeClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired(required = false)
    private AttendanceLogRepository attendanceLogRepository;

    @Autowired(required = false)
    private CourseSessionRepository courseSessionRepository;

    public AttendanceService(AttendanceSessionRepository sessionRepository,
                             AttendanceRecordRepository recordRepository,
                             DegreeClassRepository classRepository,
                             SubjectRepository subjectRepository,
                             TeacherRepository teacherRepository,
                             StudentRepository studentRepository,
                             AcademicYearRepository academicYearRepository,
                             TeacherAssignmentRepository teacherAssignmentRepository) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getRosterForMarking(String classId, String section) {
        DegreeClass degreeClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        return studentRepository.findByDegreeClassAndSection(degreeClass, section).stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .sorted(Comparator.comparing(Student::getRegistrationNumber))
                .map(StudentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceSessionDTO submitAttendanceSession(SubmitAttendanceRequest req) {
        DegreeClass degreeClass = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + req.getClassId()));

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .or(() -> subjectRepository.findByCode(req.getSubjectId()))
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.getSubjectId()));

        // Resolve teacher based on authenticated user or admin override
        Teacher teacher = null;
        if (SecurityUtils.hasRole(UserRole.TEACHER)) {
            String userEmail = SecurityUtils.getCurrentUserEmail();
            teacher = teacherRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UnauthorizedException("Faculty profile not associated with authenticated user: " + userEmail));

            // Validate teacher assignment
            boolean assigned = teacherAssignmentRepository
                    .findByTeacherAndDegreeClassAndSectionAndSubject(teacher, degreeClass, req.getSection(), subject)
                    .isPresent();

            if (!assigned) {
                throw new UnauthorizedException("You are not authorized to mark attendance for " + degreeClass.getId() + " - " + subject.getCode() + ". Assignment not found.");
            }
        } else {
            // Admin default teacher in-charge
            teacher = teacherRepository.findAll().stream().findFirst().orElse(null);
        }

        // 1. Check duplicate session constraint
        Optional<AttendanceSession> existing = sessionRepository
                .findByDegreeClassAndSectionAndSubjectAndSessionDateAndPeriod(
                        degreeClass, req.getSection(), subject, req.getSessionDate(), req.getPeriod()
                );

        if (existing.isPresent()) {
            throw new DuplicateResourceException("An attendance session has already been logged and submitted for " +
                    degreeClass.getId() + " (" + req.getSection() + ") for Subject " + subject.getCode() +
                    " on " + req.getSessionDate() + " [Period " + req.getPeriod() + "]. Duplicate submissions are prevented.");
        }

        // 2. Validate all student entries (reject unmarked, verify enrollment)
        List<Student> enrolledStudents = studentRepository.findByDegreeClassAndSection(degreeClass, req.getSection());
        Set<String> enrolledStudentIds = enrolledStudents.stream().map(Student::getId).collect(Collectors.toSet());

        if (req.getRecords() == null || req.getRecords().isEmpty()) {
            throw new ValidationException("Cannot submit attendance session with empty student roster.");
        }

        int presentCount = 0;
        int absentCount = 0;
        Set<String> processedStudents = new HashSet<>();

        for (SubmitAttendanceRequest.StudentStatusEntry entry : req.getRecords()) {
            String studentRef = entry.getRegistrationNumber() != null ? entry.getRegistrationNumber() : entry.getStudentId();
            // Check student enrollment
            if (!enrolledStudentIds.contains(entry.getStudentId())) {
                throw new ValidationException("Student " + studentRef + " is not enrolled in class " + degreeClass.getId() + " (Sec " + req.getSection() + ")");
            }

            // Check duplicate student in same submission
            if (!processedStudents.add(entry.getStudentId())) {
                throw new ValidationException("Duplicate attendance record detected for student: " + studentRef);
            }

            // Verify status is valid
            try {
                AttendanceStatus status = AttendanceStatus.valueOf(entry.getStatus().toUpperCase());
                if (status == AttendanceStatus.PRESENT || status == AttendanceStatus.OD) {
                    presentCount++;
                } else {
                    absentCount++;
                }
            } catch (IllegalArgumentException ex) {
                throw new ValidationException("Invalid attendance status '" + entry.getStatus() + "' for student " + studentRef + ". Must be PRESENT, ABSENT, OD, or LATE.");
            }
        }

        // Calculate rate
        int totalEnrolled = req.getRecords().size();
        BigDecimal percentage = BigDecimal.ZERO;
        if (totalEnrolled > 0) {
            percentage = BigDecimal.valueOf((double) presentCount / totalEnrolled * 100)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        AcademicYear academicYear = academicYearRepository.findByCurrentTrue().orElse(null);

        // 3. Create Session Entity
        AttendanceSession session = new AttendanceSession();
        session.setId("sess-" + UUID.randomUUID().toString().substring(0, 8));
        session.setInstitution(degreeClass.getInstitution());
        session.setSessionCode("SESS-" + req.getSessionDate().toString().replace("-", "") + "-" + req.getPeriod());
        session.setAcademicYear(academicYear);
        session.setDegreeClass(degreeClass);
        session.setSection(req.getSection());
        session.setSubject(subject);
        session.setTeacher(teacher);
        session.setSessionDate(req.getSessionDate());
        session.setPeriod(req.getPeriod());
        session.setTopicCovered(req.getTopicCovered());
        session.setTotalEnrolled(totalEnrolled);
        session.setPresentCount(presentCount);
        session.setAbsentCount(absentCount);
        session.setAttendancePercentage(percentage);
        session.setLocked(true);
        session.setSubmissionStatus(SubmissionStatus.FINALIZED);
        session.setSubmittedAt(OffsetDateTime.now());

        // 4. Create Records
        Map<String, Student> studentMap = enrolledStudents.stream().collect(Collectors.toMap(Student::getId, s -> s));

        for (SubmitAttendanceRequest.StudentStatusEntry entry : req.getRecords()) {
            Student s = studentMap.get(entry.getStudentId());
            AttendanceRecord record = new AttendanceRecord();
            record.setId("rec-" + UUID.randomUUID().toString().substring(0, 8));
            record.setSession(session);
            record.setStudent(s);
            record.setRegistrationNumber(s != null ? s.getRegistrationNumber() : entry.getRegistrationNumber());
            record.setStatus(AttendanceStatus.valueOf(entry.getStatus().toUpperCase()));
            record.setRemark(entry.getRemark());
            session.addRecord(record);
        }

        AttendanceSession saved = sessionRepository.save(session);
        log.info("Attendance session submitted & locked: ID={}, Class={} ({}), Subject={}, Date={}, Period={}, Present={}/{}",
                saved.getId(), degreeClass.getId(), req.getSection(), subject.getCode(), req.getSessionDate(), req.getPeriod(), presentCount, totalEnrolled);

        return AttendanceSessionDTO.fromEntity(saved, true);
    }

    @Transactional(readOnly = true)
    public AttendanceSessionDTO getSessionById(String id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found: " + id));
        return AttendanceSessionDTO.fromEntity(session, true);
    }

    @Transactional(readOnly = true)
    public List<AttendanceSessionDTO> getAttendanceHistory(String classId, String section, String subjectCode, String teacherId, LocalDate startDate, LocalDate endDate) {
        List<AttendanceSession> sessions;

        if (SecurityUtils.hasRole(UserRole.TEACHER)) {
            Teacher teacher = teacherRepository.findByEmail(SecurityUtils.getCurrentUserEmail()).orElse(null);
            if (teacher != null) {
                teacherId = teacher.getId();
            }
        }

        sessions = sessionRepository.findFinalizedSessionsWithFilters(classId, section, subjectCode, teacherId, startDate, endDate);

        return sessions.stream()
                .map(s -> AttendanceSessionDTO.fromEntity(s, false))
                .collect(Collectors.toList());
    }

    // ========================================================================
    // LEGACY COURSE-OFFERING & V-STUDY INTEGRATION FACADE METHODS
    // ========================================================================
    public MyAttendanceResponse getStudentAttendance(String courseOfferingId, String registerNumber) {
        if (attendanceLogRepository == null) {
            return new MyAttendanceResponse(Collections.emptyList(), new AttendanceSummaryDTO(0, 0, 0, 0, 0.0, true, 75.0, 1500, 0));
        }

        List<AttendanceLog> logs = attendanceLogRepository.findByCourseOfferingIdAndRegisterNumberOrderBySessionNumberAsc(
                courseOfferingId, registerNumber
        );

        long total = logs.size();
        long present = logs.stream().filter(l -> l.getStatus() == com.attendx.model.AttendanceStatus.PRESENT).count();
        long absent = logs.stream().filter(l -> l.getStatus() == com.attendx.model.AttendanceStatus.ABSENT).count();
        long od = logs.stream().filter(l -> l.getStatus() == com.attendx.model.AttendanceStatus.ON_DUTY).count();

        long effectiveAttended = present + od;
        double percentage = total > 0 ? ((double) effectiveAttended / total) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        boolean isEligible = percentage >= 75.0;
        long shortfall = 0;
        if (!isEligible && total > 0) {
            double required = Math.ceil((75.0 / 100.0 * total - effectiveAttended) / (1.0 - 75.0 / 100.0));
            shortfall = Math.max(0, (long) required);
        }

        AttendanceSummaryDTO summary = new AttendanceSummaryDTO(
                total, present, absent, od, percentage, isEligible, 75.0, 1500, shortfall
        );

        return new MyAttendanceResponse(logs, summary);
    }

    @Transactional
    public AttendanceLog markAttendance(MarkAttendanceRequest req) {
        if (attendanceLogRepository == null) return null;

        if ("QR_CODE".equalsIgnoreCase(req.getVerificationMethod()) && req.getQrToken() != null && courseSessionRepository != null) {
            Optional<CourseSession> sessionOpt = courseSessionRepository.findByQrCodeToken(req.getQrToken());
            if (sessionOpt.isEmpty() || !sessionOpt.get().getIsActive()) {
                throw new IllegalArgumentException("Invalid or expired QR token for attendance check-in");
            }
        }

        Optional<AttendanceLog> existing = attendanceLogRepository
                .findByCourseOfferingIdAndRegisterNumberAndSessionNumber(
                        req.getCourseOfferingId(), req.getRegisterNumber(), req.getSessionNumber()
                );

        AttendanceLog logEntity;
        if (existing.isPresent()) {
            logEntity = existing.get();
            logEntity.setStatus(req.getStatus());
            logEntity.setVerificationMethod(req.getVerificationMethod() != null ? req.getVerificationMethod() : logEntity.getVerificationMethod());
            if (req.getFacultyRemarks() != null) {
                logEntity.setFacultyRemarks(req.getFacultyRemarks());
            }
        } else {
            logEntity = new AttendanceLog();
            logEntity.setCourseOfferingId(req.getCourseOfferingId());
            logEntity.setRegisterNumber(req.getRegisterNumber());
            logEntity.setStudentName(req.getStudentName());
            logEntity.setSessionNumber(req.getSessionNumber());
            logEntity.setDate(req.getDate() != null ? req.getDate() : LocalDate.now());
            logEntity.setStatus(req.getStatus() != null ? req.getStatus() : com.attendx.model.AttendanceStatus.PRESENT);
            logEntity.setVerificationMethod(req.getVerificationMethod() != null ? req.getVerificationMethod() : "MANUAL");
            logEntity.setFacultyRemarks(req.getFacultyRemarks());
        }

        return attendanceLogRepository.save(logEntity);
    }
}
