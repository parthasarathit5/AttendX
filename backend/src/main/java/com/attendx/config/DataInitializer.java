package com.attendx.config;

import com.attendx.model.*;
import com.attendx.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseTopicRepository courseTopicRepository;
    private final CourseSessionRepository courseSessionRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final OdRequestRepository odRequestRepository;
    private final AttendxUserRepository userRepository;

    public static final String PRIMARY_OFFERING_ID = "2851d026-2f7b-46c4-92a5-053cf5e4f57d";

    public DataInitializer(CourseOfferingRepository courseOfferingRepository,
                           CourseTopicRepository courseTopicRepository,
                           CourseSessionRepository courseSessionRepository,
                           AttendanceLogRepository attendanceLogRepository,
                           OdRequestRepository odRequestRepository,
                           AttendxUserRepository userRepository) {
        this.courseOfferingRepository = courseOfferingRepository;
        this.courseTopicRepository = courseTopicRepository;
        this.courseSessionRepository = courseSessionRepository;
        this.attendanceLogRepository = attendanceLogRepository;
        this.odRequestRepository = odRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (courseOfferingRepository.existsById(PRIMARY_OFFERING_ID)) {
            return;
        }

        // 1. Users
        AttendxUser student = new AttendxUser("192111001", "Arun Kumar S", "arunkumar.sse@saveetha.com", "STUDENT", "Department of Computer Science and Engineering");
        AttendxUser faculty = new AttendxUser("FAC0482", "Dr. K. Ravichandran, M.E., Ph.D.", "ravichandran.cse@saveetha.com", "FACULTY", "Department of Computer Science and Engineering");
        userRepository.saveAll(List.of(student, faculty));

        // 2. Primary Course Offering matching the exact reference URL
        CourseOffering offering = new CourseOffering(
                PRIMARY_OFFERING_ID,
                "21CS301",
                "Distributed Cloud Computing & Attendance Telemetry",
                "Department of Computer Science and Engineering",
                "Semester VI",
                "2025-2026",
                4,
                "Dr. K. Ravichandran, M.E., Ph.D."
        );
        offering.setSyllabusSummary("Covers distributed system paradigms, real-time telemetry architectures, cloud microservices, dynamic geofenced attendance synchronization, consensus protocols, and offline-first edge validation.");
        offering.setLaunched(true);
        courseOfferingRepository.save(offering);

        // 3. Course Topics
        CourseTopic t1 = new CourseTopic(offering, 1, "Unit I: Distributed Computing Foundations", "Fallacies of Distributed Computing & RPC", "Understand network partitions, RPC models and idempotency.", 4, true);
        CourseTopic t2 = new CourseTopic(offering, 1, "Unit I: Distributed Computing Foundations", "Vector Clocks & Logical Time", "Analyze causality, Lamport timestamps, and synchronization.", 4, true);
        CourseTopic t3 = new CourseTopic(offering, 2, "Unit II: Telemetry & Sensing Protocols", "MQTT, CoAP & WebSockets for Real-time Feeds", "Build low-latency telemetry pipelines for campus sensors.", 5, true);
        CourseTopic t4 = new CourseTopic(offering, 2, "Unit II: Telemetry & Sensing Protocols", "Geofencing & BLE Beacon Attendance Models", "Implement BLE and QR-based verification algorithms.", 5, true);
        CourseTopic t5 = new CourseTopic(offering, 3, "Unit III: Cloud Native Architectures", "Spring Boot Microservices & Supabase Cloud", "Deploy containerized backend with PostgreSQL Supabase tier.", 6, false);
        CourseTopic t6 = new CourseTopic(offering, 4, "Unit IV: Consensus & Fault Tolerance", "Raft Consensus and State Machine Replication", "Evaluate distributed state machines and partition recovery.", 5, false);
        CourseTopic t7 = new CourseTopic(offering, 5, "Unit V: Edge Offline Sync & Mobile Telemetry", "React Native Offline-first Cache & Biometrics", "Deploy secure mobile client with local SQLite sync.", 5, false);
        courseTopicRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7));

        // 4. Course Sessions (Session Plan: Before, In, After class)
        LocalDate baseDate = LocalDate.now().minusDays(20);

        CourseSession s1 = new CourseSession(PRIMARY_OFFERING_ID, 1, baseDate, "Theory",
                "Introduction to Distributed Architectures & Course Overview",
                "Read Chapter 1 of Tanenbaum Distributed Systems",
                "Interactive lecture on distributed nodes and latency models",
                "Submit Unit 1 reflection questionnaire on LMS");
        CourseSession s2 = new CourseSession(PRIMARY_OFFERING_ID, 2, baseDate.plusDays(2), "Theory",
                "Network Telemetry, Clock Synchronization & Timestamps",
                "Review Christian's and NTP clock synchronization algorithms",
                "Simulating clock drift and Lamport logical clocks in lab",
                "Complete MCQ Quiz 1 on clock skew");
        CourseSession s3 = new CourseSession(PRIMARY_OFFERING_ID, 3, baseDate.plusDays(4), "Lab",
                "Hands-on Lab: WebSockets & Real-time Telemetry Pipeline",
                "Clone starter WebSocket repository and install dependencies",
                "Pair programming: build live streaming telemetry gateway",
                "Commit code to Git repository and attach commit hash");
        CourseSession s4 = new CourseSession(PRIMARY_OFFERING_ID, 4, baseDate.plusDays(6), "Theory",
                "Cryptographic QR Code Validation & Nonce Verification",
                "Read paper on time-based dynamic OTPs and token signing",
                "Deep dive into SHA-256 HMAC and QR token expiration logic",
                "Assignment: Implement replay attack prevention logic");
        CourseSession s5 = new CourseSession(PRIMARY_OFFERING_ID, 5, baseDate.plusDays(8), "Theory",
                "Supabase Cloud Persistence & Row-Level Security (RLS)",
                "Review PostgreSQL schema design and indexing fundamentals",
                "Live database modeling session: courses, sessions, attendance logs",
                "Submit DB schema script for mini-project");
        CourseSession s6 = new CourseSession(PRIMARY_OFFERING_ID, 6, baseDate.plusDays(10), "Lab",
                "React Native Mobile Telemetry & Camera Barcode Scanner",
                "Setup Android development environment and React Native CLI",
                "Live implementation: camera barcode scanning and GPS geofence",
                "Upload APK demo recording and submission");
        CourseSession s7 = new CourseSession(PRIMARY_OFFERING_ID, 7, baseDate.plusDays(12), "Theory",
                "Consensus Protocols: Paxos and Raft Demystified",
                "Watch Raft interactive visualization tutorial",
                "Leader election and log replication walkthrough with role play",
                "Group discussion on network split brain scenarios");
        CourseSession s8 = new CourseSession(PRIMARY_OFFERING_ID, 8, baseDate.plusDays(14), "Theory",
                "Fault Tolerance, Heartbeats & Edge Resiliency",
                "Review gossip protocols and failure detectors",
                "Case study: Netflix Chaos Engineering and campus uptime",
                "Solve Fault Tolerance worksheet #3");
        CourseSession s9 = new CourseSession(PRIMARY_OFFERING_ID, 9, baseDate.plusDays(16), "Lab",
                "End-to-End Attendance Telemetry Deployment & Testing",
                "Deploy Spring Boot backend and test REST endpoints",
                "Conduct live load test with 200 concurrent student check-ins",
                "Submit performance benchmark report");
        CourseSession s10 = new CourseSession(PRIMARY_OFFERING_ID, 10, baseDate.plusDays(18), "Theory",
                "Privacy, Biometrics & Academic Compliance in LMS",
                "Read university academic regulation regarding 75% threshold",
                "Debate on biometric data protection vs convenience",
                "Final course summary & examination hall ticket clearance review");

        s10.setIsActive(true);
        s10.setQrCodeToken("ATTENDX:" + PRIMARY_OFFERING_ID + ":10:LIVE_SESSION");

        courseSessionRepository.saveAll(List.of(s1, s2, s3, s4, s5, s6, s7, s8, s9, s10));

        // 5. Attendance Logs for Student Arun Kumar (192111001)
        AttendanceLog l1 = new AttendanceLog(PRIMARY_OFFERING_ID, s1.getId(), "192111001", "Arun Kumar S", 1, baseDate, AttendanceStatus.PRESENT, "PORTAL");
        AttendanceLog l2 = new AttendanceLog(PRIMARY_OFFERING_ID, s2.getId(), "192111001", "Arun Kumar S", 2, baseDate.plusDays(2), AttendanceStatus.PRESENT, "PORTAL");
        AttendanceLog l3 = new AttendanceLog(PRIMARY_OFFERING_ID, s3.getId(), "192111001", "Arun Kumar S", 3, baseDate.plusDays(4), AttendanceStatus.PRESENT, "QR_CODE");
        AttendanceLog l4 = new AttendanceLog(PRIMARY_OFFERING_ID, s4.getId(), "192111001", "Arun Kumar S", 4, baseDate.plusDays(6), AttendanceStatus.ABSENT, "PORTAL");
        l4.setFacultyRemarks("Absent without prior permission");
        AttendanceLog l5 = new AttendanceLog(PRIMARY_OFFERING_ID, s5.getId(), "192111001", "Arun Kumar S", 5, baseDate.plusDays(8), AttendanceStatus.ON_DUTY, "ON_DUTY_APPROVED");
        l5.setFacultyRemarks("Represented college in National Smart India Hackathon");
        AttendanceLog l6 = new AttendanceLog(PRIMARY_OFFERING_ID, s6.getId(), "192111001", "Arun Kumar S", 6, baseDate.plusDays(10), AttendanceStatus.PRESENT, "QR_CODE");
        AttendanceLog l7 = new AttendanceLog(PRIMARY_OFFERING_ID, s7.getId(), "192111001", "Arun Kumar S", 7, baseDate.plusDays(12), AttendanceStatus.PRESENT, "PORTAL");
        AttendanceLog l8 = new AttendanceLog(PRIMARY_OFFERING_ID, s8.getId(), "192111001", "Arun Kumar S", 8, baseDate.plusDays(14), AttendanceStatus.PRESENT, "QR_CODE");
        AttendanceLog l9 = new AttendanceLog(PRIMARY_OFFERING_ID, s9.getId(), "192111001", "Arun Kumar S", 9, baseDate.plusDays(16), AttendanceStatus.ABSENT, "PORTAL");
        AttendanceLog l10 = new AttendanceLog(PRIMARY_OFFERING_ID, s10.getId(), "192111001", "Arun Kumar S", 10, baseDate.plusDays(18), AttendanceStatus.PRESENT, "QR_CODE");

        attendanceLogRepository.saveAll(List.of(l1, l2, l3, l4, l5, l6, l7, l8, l9, l10));

        // 6. OD Request
        OdRequest od = new OdRequest();
        od.setRegisterNumber("192111001");
        od.setStudentName("Arun Kumar S");
        od.setCourseOfferingId(PRIMARY_OFFERING_ID);
        od.setSessionNumber(5);
        od.setDate(baseDate.plusDays(8));
        od.setReason("Participating in Grand Finale of Smart India Hackathon 2026");
        od.setCategory("Hackathon / Symposium");
        od.setStatus("APPROVED");
        od.setReviewedBy("Dr. K. Ravichandran");
        od.setReviewComments("Approved OD for SIH 2026 Participation certificate verified.");
        odRequestRepository.save(od);
    }
}
