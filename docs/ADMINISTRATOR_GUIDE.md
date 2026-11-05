# AttendX — College Administrator Operations & Handover Guide

This guide provides institutional administrators with step-by-step instructions for operating, configuring, and maintaining the **AttendX (MaccaAttendX)** platform.

---

## 1. Administrator Authentication & Access Control

- **Login URL**: `https://<your-college-attendx-domain>/` (or `http://localhost:8080/` in dev)
- **Role**: `ADMIN`
- **Initial Credentials**: Created during institutional provisioning in Supabase Auth and PostgreSQL `user_profiles` table.
- **Security Safeguards**:
  - Client-side role claims are completely untrusted. Spring Security inspects the server-side database record on every request.
  - Session tokens expire automatically after 24 hours.

---

## 2. Academic Hierarchy Configuration

Before attendance can be marked, the academic structure must be active:
1. **Academic Years**:
   - Navigate to **Academic Management** > **Academic Years**.
   - Create the active cycle (e.g. `2025-2026`, Even Semester). Mark `is_current = true`.
2. **Degree Programs & Classes**:
   - Define Degree Programs (e.g., `B.E. Computer Science and Engineering`).
   - Define Class codes (e.g. `BE-CSE-3A`, Year 3, Semester 6).
3. **Sections**:
   - Configure sections under each class (`Section A`, `Section B`) along with lecture hall allocations (`LH-301`, `LH-302`).
4. **Subjects Catalog**:
   - Register curriculum course codes (`CS301 Data Structures`, `CS302 Computer Networks`).
   - Assign credits (e.g., 4 credits) and semester mapping.

---

## 3. Student Enrollment & Registration Number Management

Official registration numbers must remain globally unique within the institution:
1. **Registering a Student**:
   - Navigate to **Student Directory** > **Add New Student**.
   - Enter Full Name, Registration Number (e.g., `192211025`), Roll Number, Class, Section, DOB, Blood Group, and Parent Contact.
   - Click **Save Student**. The backend validates unique registration number constraints in PostgreSQL; duplicate numbers immediately trigger a `409 Conflict`.
2. **Authorized Registration Number Changes**:
   - Modifying a student's official registration number is a restricted regulatory event.
   - An explicit **Authorized Reason** (minimum 5 characters) must be entered into the prompt.
   - The event is permanently logged with the admin's identity, timestamp, before/after values, and justification.
3. **Safe Account Deactivation**:
   - Students who graduate or transfer out must be deactivated via `DELETE /api/v1/students/{id}`.
   - Deactivation sets `status = INACTIVE`. All historical lecture logs, marks, and attendance percentages are preserved permanently for transcripts.

---

## 4. Faculty Management & Subject Allocations

1. Navigate to **Faculty Directory**.
2. Assign each teacher their department, employee ID (e.g., `FAC-CSE-001`), and designation.
3. Allocate subjects to faculty members:
   - Assign Teacher -> Class -> Section -> Subject.
   - **Enforcement**: Faculty cannot mark attendance for classes or subjects they are not officially assigned to.

---

## 5. Attendance Auditing & Official Corrections

1. **Viewing Attendance Sessions**:
   - Navigate to **Attendance Logs**.
   - Filter by date range, department, class, or faculty.
2. **Authorized Attendance Correction Workflow**:
   - If a student was marked absent due to an approved Medical Leave, On-Duty (OD), or biometric glitch:
   - Locate the student record in the finalized session.
   - Click **Correct Status** (Admin/HOD permission required).
   - Select new status (`PRESENT`, `OD`, `ABSENT`).
   - Enter the mandatory **Official Correction Reason** (e.g., `"Medical certificate verified by Dean of Academic Affairs"`).
   - Click **Submit Correction**.
   - The change updates the session percentage in PostgreSQL and records an entry into the immutable `attendance_correction_audit` table.

---

## 6. Regulatory Reports & POI Excel Export

1. **Institutional Overview**:
   - View real-time institutional KPIs, average daily attendance, and departmental breakdown.
2. **Low Attendance & Debarment Alert**:
   - Filter by statutory thresholds (default: 75.0% minimum, 65.0% debarment cutoff).
   - AttendX calculates the exact shortfall lecture hours needed for each student to regain examination clearance.
3. **Exporting Official `.xlsx` Workbooks**:
   - Click **Export Excel (XLSX)**.
   - The Spring Boot backend uses Apache POI to generate a binary `.xlsx` workbook featuring institutional letterheads, Saveetha styling, formula summaries, and timestamps.
