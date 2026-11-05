# AttendX — Intelligent LMS Attendance Telemetry System

> **Primary Design Reference**: [Saveetha V-Study Course Window](https://vstudy.saveetha.com/dashboard/lms/my-learning/course-window?courseOfferingId=2851d026-2f7b-46c4-92a5-053cf5e4f57d)  
> **Course Offering Reference ID**: `2851d026-2f7b-46c4-92a5-053cf5e4f57d`  
> **Technology Stack**: Java + Spring Boot + Supabase (PostgreSQL) + HTML/CSS/JavaScript + React Native (Android APK)

---

## 🏛️ V-Study Course-Window Design System Alignment

AttendX faithfully reproduces the layout, navigation hierarchy, color system, and interaction flows inspected from the Saveetha V-Study course window:

1. **Top Application Header & Breadcrumbs**:
   - Breadcrumb navigation: `LMS / My Learning / Course Window`
   - Real-time global search bar
   - Role Switcher (`Student` ⇄ `Faculty` ⇄ `Coordinator`) for instant dual-perspective evaluation
   - User profile chip with registration number (`192111001 • CSE`) and hall ticket quick view

2. **Collapsible Left Sidebar**:
   - Navigation links: Dashboard, My Learning, Attendance Logs, QR Check-in, OD Requests, Timetable, Supabase Sync

3. **Course Offering Card Header**:
   - Course Code: `21CS301`
   - Course Name: `Distributed Cloud Computing & Attendance Telemetry`
   - Offering ID Badge: `2851d026-2f7b-46c4-92a5-053cf5e4f57d` (with click-to-copy)
   - Academic Details: `2025-2026 • Semester VI • 4 Credits • Dept. of CSE`
   - Quick Action Buttons:
     - **Timetable**: Weekly slot schedule modal (Hall 402, Cloud Lab 3, Smart Room 201)
     - **Hall Ticket**: Official semester examination clearance preview
     - **Pay Exam Fees**: Dynamically unlocked at ₹1,500 if attendance ≥ 75.0%; locked with red warning and shortfall calculation if < 75.0%

4. **Rounded Pill Navigation Bar**:
   - `[Overview]`: Course syllabus, outcomes, coordinator details, and 75% attendance rule
   - `[Topics]`: Unit-wise breakdowns (Units 1 to 5) with allocated lecture hours
   - `[Sessions]`: 3-stage session cards:
     - **Before class - prepare** (readings and slides)
     - **In class - activity** (labs, group discussions, coding)
     - **After class - quiz & task** (MCQ quizzes and assignments)
   - `[To Do]`: Continuous assessments, project deadlines, quiz statuses
   - `[Attendance]` (**The Core Anchor**):
     - **4-Card Metric Grid**:
       - `Total Sessions`: 10
       - `Present Sessions`: 7
       - `Absent Sessions`: 2
       - `Attendance %`: 80.00% (or live calculated)
     - **Attendance Gauge & Shortfall Alert**:
       - Green/Amber/Red progress gauge with target 75% indicator
     - **Session Attendance Log Table**:
       - Columns: `S.No`, `Date`, `Session #`, `Status`, `Verification`, `Faculty Remarks`
       - Status Badges:
         - `Present`: Soft Emerald (`#ecfdf5`, `#047857`, `#a7f3d0`)
         - `OD (On Duty)`: Soft Amber (`#fffbeb`, `#b45309`, `#fde68a`)
         - `Absent`: Soft Red (`#fef2f2`, `#b91c1c`, `#fecaca`)
   - `[Grading]`: Continuous Internal Evaluation (CIE), Attendance discipline score (5/5), CAT marks

---

## 📱 Mobile APK (React Native)

An installable Android APK has been compiled and is ready for sideloading or testing on Android devices and emulators:

- **APK File**: `AttendX-v1.0.0.apk` (at root directory `C:\Users\ADMIN\3D Objects\AttendX\AttendX-v1.0.0.apk`)
- **Package Name**: `com.attendx`
- **Features**:
  - Touch-optimized Saveetha V-Study Course Window mobile layout
  - Live attendance 4-stat metric dashboard
  - QR Code Scanner for instant session check-in
  - On-Duty (OD) Leave request submission
  - Real-time API synchronization with Spring Boot & Supabase
  - Offline-first cache when network is unavailable

### Installing the APK on an Android Device or Emulator:
```powershell
adb install -r "C:\Users\ADMIN\3D Objects\AttendX\AttendX-v1.0.0.apk"
```

---

## 🗄️ Supabase PostgreSQL Integration

1. Complete DDL schema and migrations are located in:
   `backend/src/main/resources/schema-supabase.sql`
2. Tables provided:
   - `attendx_users` (Students, Faculty, Coordinators)
   - `course_offerings` (Includes `2851d026-2f7b-46c4-92a5-053cf5e4f57d`)
   - `course_topics` (Unit 1 to 5 topics)
   - `course_sessions` (10 sessions with 3-stage before/in/after class tasks)
   - `attendance_logs` (Session logs with timestamps, verification methods, status)
   - `od_requests` (Student On-Duty applications with approval workflow)
3. To connect your cloud Supabase database:
   Set the following environment variables or edit `backend/src/main/resources/application.yml`:
   ```bash
   SUPABASE_DB_URL=jdbc:postgresql://db.<your-project>.supabase.co:5432/postgres?sslmode=require
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=<your-db-password>
   ```

---

## 🚀 Running the Web Application & Backend (Milestone 6 Connected)

The application is fully connected end-to-end: the Saveetha V-Study LMS frontend makes real authenticated REST requests to the Spring Boot 3.3.5 backend backed by Supabase PostgreSQL persistence.

### Starting the System:
```powershell
# 1. Package backend (if rebuilding)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
cd "backend"
..\tools\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests

# 2. Run backend daemon
& "C:\Program Files\Java\jdk-25\bin\java.exe" -jar target\attendx-backend-1.0.0.jar
```

### Accessing the Application:
- **LMS Web Application**: `http://localhost:8080/`
- **Health & Actuator Probe**: `http://localhost:8080/api/v1/health`
- **API Documentation**: See `backend/API_DOCUMENTATION.md` and `frontend/API_INTEGRATION.md`

### Running the Milestone 6 Integration Test Suite:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ADMIN\.gemini\antigravity\brain\fbc4989b-c773-4354-8406-00836daf9380\scratch\test_milestone6_integration.ps1"
```
*Current Suite Status: 38/38 tests passing (100%).*

---

## 🏛️ V-Study Course-Window Design System Alignment

The Spring Boot backend is already built and running locally at:
👉 **`http://localhost:8080/`**

To stop and start manually:
```powershell
# Run with bundled Java
$java = "C:\Program Files\Java\jdk-25\bin\java.exe"
& $java -jar "C:\Users\ADMIN\3D Objects\AttendX\backend\target\attendx-backend-1.0.0.jar"
```

### Key REST Endpoints (Matching V-Study Architecture):
- `GET /api/course-attendance/course-offerings/2851d026-2f7b-46c4-92a5-053cf5e4f57d/my-attendance`
  - Returns session logs & summary metrics
- `POST /api/course-attendance/mark`
  - Mark student session attendance
- `POST /api/course-attendance/qr-checkin`
  - Verify and record attendance via QR token
- `POST /api/course-attendance/course-offerings/{id}/sessions/{num}/generate-qr`
  - Generates live Base64 QR code image using ZXing
- `GET /api/od-requests`
  - List and review On-Duty leave requests

