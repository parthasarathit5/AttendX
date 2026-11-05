# AttendX — Student & Parent Attendance Telemetry Guide

This guide describes how students and parents access course attendance records, verify examination eligibility, and review attendance alerts.

---

## 1. Student Portal & Course Window

- **Design Reference**: Adheres faithfully to the **Saveetha V-Study LMS Course Window** (`https://vstudy.saveetha.com/dashboard/lms/my-learning/course-window?courseOfferingId=2851d026-2f7b-46c4-92a5-053cf5e4f57d`).
- **Access**: Securely authenticated via institutional email (e.g., `aarav.sharma@saveetha.com`).

### Core Features:
1. **Course Offering Header**:
   - Course Code & Name (e.g. `21CS301 - Distributed Cloud Computing & Attendance Telemetry`).
   - Official Offering ID badge (`2851d026-2f7b-46c4-92a5-053cf5e4f57d`).
   - Academic Year, Semester, Credits, and Faculty Coordinator info.
2. **Attendance 4-Card Metric Grid**:
   - **Total Sessions Conducted**: e.g., `10`
   - **Present Sessions**: e.g., `8`
   - **Absent Sessions**: e.g., `2`
   - **Overall Attendance Percentage**: e.g., `80.00%`
3. **Examination Clearance & Fee Unlock**:
   - **Eligible (≥ 75.0%)**: Green clearance badge. **Pay Exam Fees (₹1,500)** button is unlocked.
   - **Shortfall (< 75.0%)**: Amber/Red alert banner displaying the exact number of consecutive classes required to regain examination eligibility.
4. **Session Attendance Log Table**:
   - Lists every conducted lecture: Date, Session #, Status badge (`Present`, `Absent`, `OD`), Verification method, and Faculty remarks.

---

## 2. Parent Ward Portal

- **Login**: Authenticated using the registered parent/guardian email.
- **Privacy & Security (IDOR Defense)**:
  - Parents can ONLY view records of children officially linked to their account in the institutional `student_guardians` database table.
  - Access to any other student's attendance is strictly blocked by the Spring Security backend.
- **Features**:
  - Live attendance percentages for each enrolled child.
  - Immediate shortfall alerts if attendance drops below the 75% regulatory threshold.
  - Detailed daily lecture logs and approved On-Duty (OD) statuses.

