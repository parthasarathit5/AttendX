# AttendX — Faculty & Teacher User Guide

Welcome to **AttendX**. This guide instructs teaching faculty on how to record lectures, mark student attendance, prevent duplicate submissions, and export course reports.

---

## 1. Teacher Dashboard & Schedule

1. Log in with your institutional email (e.g. `senthil.k@saveetha.com`).
2. The Teacher Dashboard presents:
   - Your allocated degree classes and sections (e.g., `BE-CSE-3A`, `BE-CSE-3B`).
   - Assigned subjects for the current semester (e.g., `CS301 - Design and Analysis of Algorithms`).
   - Summary of today's scheduled lectures and pending attendance submissions.

---

## 2. Marking Lecture Attendance

1. Click **Mark Attendance** in the top navigation or sidebar.
2. Select:
   - **Class**: e.g., `BE-CSE-3A`
   - **Section**: e.g., `A`
   - **Subject**: e.g., `CS301`
   - **Session Date**: Default is today's date.
   - **Period**: Period 1, 2, 3, etc.
   - **Topic Covered**: Enter the lecture topic (e.g., `"Asymptotic Notation & Recurrence Relations"`).
3. Click **Load Student Roster**.
   - AttendX queries PostgreSQL and loads active enrolled students sorted by official registration number.
4. Marking Controls:
   - **Mark All Present**: Quick-toggle button to mark all students present.
   - **Individual Status**: Toggle individual badges between `Present`, `Absent`, `OD (On Duty)`, or `Late`.
   - **Faculty Remarks**: Add notes where necessary (e.g., `"Arrived 20 mins late with bus pass delay"`).
5. Click **Submit & Lock Attendance**:
   - The backend validates your faculty assignment, ensures every student has a status, calculates the overall session percentage, and locks the session.
   - **Double-Click & Duplicate Protection**: The database enforces unique session constraints (`uq_session_schedule`). Submitting a duplicate lecture for the same class, date, and period is automatically blocked with an alert.

---

## 3. Attendance History & Course Analytics

1. Navigate to **Attendance History**.
2. Filter lectures by date, class, or subject.
3. Review locked session records and attendance percentages.
4. Export options:
   - **Export to Excel**: Downloads a native `.xlsx` workbook generated server-side by Apache POI with all student roll numbers, attendance statuses, and percentage calculations.
   - **Print Attendance Sheet**: Triggers print-optimized A4 layout formatted for physical filing and departmental sign-off.

