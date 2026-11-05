package com.attendx.controller;

import com.attendx.dto.ApiResponse;
import com.attendx.dto.DashboardDTOs.*;
import com.attendx.dto.ReportsDTOs.LowAttendanceStudentDTO;
import com.attendx.dto.ReportsDTOs.OverallAnalyticsDTO;
import com.attendx.dto.ReportsDTOs.StudentReportDTO;
import com.attendx.entity.*;
import com.attendx.repository.*;
import com.attendx.security.SecurityUtils;
import com.attendx.service.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@Transactional(readOnly = true)
public class DashboardController {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final DegreeClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentGuardianRepository studentGuardianRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final ReportsService reportsService;

    public DashboardController(StudentRepository studentRepository,
                               TeacherRepository teacherRepository,
                               DegreeClassRepository classRepository,
                               SubjectRepository subjectRepository,
                               TeacherAssignmentRepository teacherAssignmentRepository,
                               StudentGuardianRepository studentGuardianRepository,
                               AttendanceSessionRepository sessionRepository,
                               ReportsService reportsService) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentGuardianRepository = studentGuardianRepository;
        this.sessionRepository = sessionRepository;
        this.reportsService = reportsService;
    }

    @GetMapping("/{role}")
    public ResponseEntity<ApiResponse<?>> getDashboardByRole(@PathVariable String role) {
        String r = role.toUpperCase();
        switch (r) {
            case "ADMIN":
                return ResponseEntity.ok(ApiResponse.success(getAdminDashboard()));
            case "TEACHER":
                return ResponseEntity.ok(ApiResponse.success(getTeacherDashboard()));
            case "STUDENT":
                return ResponseEntity.ok(ApiResponse.success(getStudentDashboard()));
            case "PARENT":
                return ResponseEntity.ok(ApiResponse.success(getParentDashboard()));
            default:
                return ResponseEntity.ok(ApiResponse.success(getAdminDashboard()));
        }
    }

    private AdminDashboardDTO getAdminDashboard() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        long students = studentRepository.count();
        long teachers = teacherRepository.count();
        long classes = classRepository.count();
        long subjects = subjectRepository.count();

        OverallAnalyticsDTO analytics = reportsService.getOverallAnalytics(null, null, null, null, null, null);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", students);
        stats.put("totalTeachers", teachers);
        stats.put("totalClasses", classes);
        stats.put("totalSubjects", subjects);
        stats.put("todayPresent", analytics.getPresentRecords());
        stats.put("todayAbsent", analytics.getAbsentRecords());
        stats.put("lateStudents", 0);
        stats.put("attendancePct", analytics.getOverallPercentage());
        stats.put("lowAttendanceCount", analytics.getStudentsBelowThresholdCount());
        dto.setStats(stats);

        List<ClassComparisonDTO> comparisons = analytics.getClassBreakdown().stream()
                .map(c -> new ClassComparisonDTO(c.getClassName(), c.getPercentage(), c.isBelowThreshold()))
                .collect(Collectors.toList());
        dto.setClassComparisons(comparisons);

        List<LowAttendanceStudentDTO> lowList = reportsService.getLowAttendanceStudents(75.0);
        List<LowAttendanceSummaryDTO> watchlist = lowList.stream()
                .map(l -> new LowAttendanceSummaryDTO(l.getFullName(), l.getRegistrationNumber(), l.getClassName() + " (" + l.getSection() + ")", l.getAttendancePercentage(), l.getStatusLabel()))
                .collect(Collectors.toList());
        dto.setLowAttendanceWatchlist(watchlist);

        return dto;
    }

    private TeacherDashboardDTO getTeacherDashboard() {
        TeacherDashboardDTO dto = new TeacherDashboardDTO();
        String email = SecurityUtils.getCurrentUserEmail();
        Teacher teacher = teacherRepository.findByEmail(email).orElse(null);

        Map<String, Object> stats = new HashMap<>();
        List<ScheduleItemDTO> schedule = new ArrayList<>();

        if (teacher != null) {
            List<TeacherAssignment> assignments = teacherAssignmentRepository.findByTeacher(teacher);
            long myClassesCount = assignments.stream().map(a -> a.getDegreeClass().getId()).distinct().count();
            long mySubjectsCount = assignments.stream().map(a -> a.getSubject().getCode()).distinct().count();

            // Total students in teacher's assigned classes
            Set<DegreeClass> classes = assignments.stream().map(TeacherAssignment::getDegreeClass).collect(Collectors.toSet());
            long totalStudents = classes.stream()
                    .mapToLong(c -> studentRepository.findByDegreeClass(c).size())
                    .sum();

            // Today's sessions
            List<AttendanceSession> sessionsToday = sessionRepository.findAll().stream()
                    .filter(s -> s.getTeacher() != null && s.getTeacher().getId().equals(teacher.getId()))
                    .filter(s -> s.getSessionDate().isEqual(LocalDate.now()))
                    .collect(Collectors.toList());

            stats.put("myClasses", myClassesCount);
            stats.put("mySubjects", mySubjectsCount);
            stats.put("totalStudents", totalStudents);
            stats.put("todayClasses", assignments.size());
            stats.put("markedCount", sessionsToday.size());
            stats.put("pendingCount", Math.max(0, assignments.size() - sessionsToday.size()));

            double avgRate = sessionsToday.isEmpty() ? 88.4 : sessionsToday.stream()
                    .mapToDouble(s -> s.getAttendancePercentage().doubleValue())
                    .average().orElse(88.4);
            stats.put("avgAttendance", Math.round(avgRate * 10.0) / 10.0);

            for (TeacherAssignment ta : assignments) {
                schedule.add(new ScheduleItemDTO(
                        "Period 1 (08:30 - 09:20)",
                        ta.getSubject().getCode() + " - " + ta.getSubject().getName(),
                        ta.getDegreeClass().getId() + " - " + ta.getSection(),
                        "LH-301",
                        sessionsToday.stream().anyMatch(st -> st.getSubject().getId().equals(ta.getSubject().getId())) ? "COMPLETED" : "PENDING"
                ));
            }
        } else {
            stats.put("myClasses", 2);
            stats.put("mySubjects", 2);
            stats.put("totalStudents", 10);
            stats.put("todayClasses", 2);
            stats.put("markedCount", 1);
            stats.put("pendingCount", 1);
            stats.put("avgAttendance", 85.0);
        }

        dto.setStats(stats);
        dto.setTodaySchedule(schedule);
        return dto;
    }

    private StudentDashboardDTO getStudentDashboard() {
        StudentDashboardDTO dto = new StudentDashboardDTO();
        String email = SecurityUtils.getCurrentUserEmail();
        Student student = studentRepository.findByEmail(email)
                .orElseGet(() -> studentRepository.findAll().stream().findFirst().orElse(null));

        Map<String, Object> stats = new HashMap<>();
        if (student != null) {
            StudentReportDTO report = reportsService.getStudentReport(student.getRegistrationNumber());
            stats.put("overallPct", report.getPercentage());
            stats.put("presentPeriods", report.getPresentClasses());
            stats.put("absentPeriods", report.getAbsentClasses());
            stats.put("latePeriods", 0);
            stats.put("leavePeriods", 0);
            stats.put("targetMargin", report.isShortfall() ? "Debarred warning" : "+4 safe sessions");
            dto.setSubjects(report.getSubjectBreakdown());
        } else {
            stats.put("overallPct", 85.0);
            stats.put("presentPeriods", 10);
            stats.put("absentPeriods", 2);
            stats.put("latePeriods", 0);
            stats.put("leavePeriods", 0);
            stats.put("targetMargin", "+3 safe sessions");
            dto.setSubjects(new ArrayList<>());
        }
        dto.setStats(stats);
        return dto;
    }

    private ParentDashboardDTO getParentDashboard() {
        ParentDashboardDTO dto = new ParentDashboardDTO();
        String email = SecurityUtils.getCurrentUserEmail();
        List<StudentGuardian> guardians = studentGuardianRepository.findAll().stream()
                .filter(g -> (g.getEmail() != null && g.getEmail().equalsIgnoreCase(email)) ||
                             (g.getUserProfile() != null && g.getUserProfile().getEmail().equalsIgnoreCase(email)))
                .collect(Collectors.toList());

        List<ChildSummaryDTO> children = new ArrayList<>();
        for (StudentGuardian g : guardians) {
            Student s = g.getStudent();
            if (s != null) {
                StudentReportDTO report = reportsService.getStudentReport(s.getRegistrationNumber());
                children.add(new ChildSummaryDTO(
                        s.getId(),
                        s.getRegistrationNumber(),
                        s.getFullName(),
                        s.getDegreeClass() != null ? s.getDegreeClass().getId() : "N/A",
                        s.getSection(),
                        report.getPercentage(),
                        report.isShortfall()
                ));
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("linkedChildren", children.size());
        stats.put("todayAttendance", children.isEmpty() ? "N/A" : "All Marked");
        stats.put("overallPct", children.isEmpty() ? "100%" : children.get(0).getFullName() + ": " + children.get(0).getAttendancePercentage() + "%");
        dto.setStats(stats);
        dto.setChildren(children);
        return dto;
    }
}

