# AttendX Backend REST API Documentation
**Base URL**: `/api/v1`  
**Standard Response Format**: `ApiResponse<T>` with `{ "success": boolean, "message": string, "data": T, "timestamp": string }`

---

## 1. Authentication & Profiles (`/api/v1/auth`)
All endpoints under `/api/v1/**` (except `/api/v1/health` and `/api/v1/auth/mock-token`) require an HTTP `Authorization` header:
```http
Authorization: Bearer <Supabase_JWT_Token_or_Mock_Token>
```

#### `GET /api/v1/auth/me`
- **Role**: All authenticated callers
- **Purpose**: Returns the caller's server-resolved profile, trusted institutional role (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`), institution name, and role-specific metadata (Teacher employee ID & assigned subjects; Student registration number & class; Parent linked wards).
- **Response**: `200 OK` with `UserProfileResponse`.

#### `POST /api/v1/auth/mock-token`
- **Role**: Public (Dev Mode)
- **Request Body**: `{ "role": "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" }`
- **Response**: `200 OK` with `{ "token": "dev-token-...", "role": "...", "expiresIn": 86400 }`.

Supported Development Mock Tokens:
- `Bearer dev-token-admin` (Dr. C. Ramesh, Administrator)
- `Bearer dev-token-teacher-001` (Dr. K. Senthil Kumar, Faculty)
- `Bearer dev-token-teacher-002` (Dr. Meenakshi Sundaram, Faculty)
- `Bearer dev-token-student-192211001` (Aarav Sharma, Student)
- `Bearer dev-token-parent-001` (Rajesh Sharma, Parent)

---

## 2. Role Dashboards (`/api/v1/dashboard`)

#### `GET /api/v1/dashboard/admin`
- **Role**: `ADMIN`
- **Response**: Live stats (`totalStudents`, `activeFaculty`, `todaySessions`, `todayPresentRate`, `debarredRiskCount`), quick actions, and recent activity.

#### `GET /api/v1/dashboard/teacher`
- **Role**: `TEACHER`
- **Response**: Live stats (`myClasses`, `todayLectures`, `avgAttendance`, `pendingSubmissions`), assigned subjects, and schedule.

#### `GET /api/v1/dashboard/student`
- **Role**: `STUDENT`
- **Response**: Live stats (`overallPct`, `classesAttended`, `totalConducted`, `shortfallMargin`), course-wise percentage breakdown.

#### `GET /api/v1/dashboard/parent`
- **Role**: `PARENT`
- **Response**: Live stats (`linkedChildren`, `alertsCount`), linked children cards, attendance warnings.

---

## 3. Endpoints Catalog

### 2.1 System & Health Probes
#### `GET /api/v1/health`
- **Role**: Public (No auth required)
- **Response**: `200 OK`
```json
{
  "status": "UP",
  "service": "AttendX Backend",
  "version": "1.0.0",
  "milestone": "Milestone 5"
}
```

---

### 2.2 Student Management (`/api/v1/students`)

#### `GET /api/v1/students`
- **Role**: `ADMIN`, `TEACHER`
- **Query Params**:
  - `classId` (optional, e.g. `BE-CSE-3A`)
  - `section` (optional, e.g. `A`)
  - `query` (optional, searches name or registration number)
  - `page` (default `0`), `size` (default `20`), `sortBy` (default `registrationNumber`), `sortDir` (default `ASC`)
- **Response**: `200 OK` with paginated array of `StudentDTO`

#### `GET /api/v1/students/{id}`
- **Role**: `ADMIN`, `TEACHER`, `STUDENT` (Self only), `PARENT` (Linked child only)
- **Response**: `200 OK` with `StudentDTO`
- **Errors**: `403 Forbidden` if student attempts to view another student's record; `404 Not Found` if identifier does not exist.

#### `POST /api/v1/students`
- **Role**: `ADMIN` only
- **Request Body**:
```json
{
  "registrationNumber": "192211025",
  "rollNumber": "CSE-3A-25",
  "firstName": "Priya",
  "lastName": "Dharshini",
  "email": "priya.d@saveetha.com",
  "phone": "+91 98403 12345",
  "gender": "FEMALE",
  "dob": "2004-09-12",
  "bloodGroup": "O+",
  "address": "Chennai, Tamil Nadu",
  "classId": "BE-CSE-3A",
  "section": "A"
}
```
- **Response**: `201 Created` with created `StudentDTO`
- **Errors**: `409 Conflict` if registration number or email already exists.

#### `PUT /api/v1/students/{id}`
- **Role**: `ADMIN` only
- **Note**: If `registrationNumber` is modified, `authorizedRegNoChangeReason` is strictly mandatory.
- **Response**: `200 OK` with updated `StudentDTO`

#### `PATCH /api/v1/students/{id}/deactivate`
- **Role**: `ADMIN` only
- **Response**: `200 OK` (Soft deactivates student, preserving historical attendance records)

---

### 2.3 Academic Hierarchy (`/api/v1/academics`)

#### `GET /api/v1/academics/years`
- **Role**: All authenticated roles
- **Response**: List of academic cycles (`AcademicYearDTO`)

#### `GET /api/v1/academics/classes`
- **Role**: All authenticated roles
- **Response**: List of degree classes with sections (`DegreeClassDTO`)

#### `GET /api/v1/academics/subjects`
- **Role**: All authenticated roles
- **Response**: List of curriculum course subjects (`SubjectDTO`)

---

### 2.4 Attendance Telemetry (`/api/v1/attendance`)

#### `GET /api/v1/attendance/roster`
- **Role**: `ADMIN`, `TEACHER`
- **Query Params**: `classId` (required), `section` (default `A`)
- **Response**: List of active enrolled students for marking

#### `POST /api/v1/attendance/sessions`
- **Role**: `ADMIN`, `TEACHER` (Scoped to assigned classes and subjects)
- **Request Body**:
```json
{
  "classId": "BE-CSE-3A",
  "section": "A",
  "subjectId": "CS301",
  "sessionDate": "2026-11-10",
  "period": "Period-1",
  "topicCovered": "Divide and Conquer: Master Theorem",
  "records": [
    { "studentId": "stu-001", "registrationNumber": "192211001", "status": "PRESENT" },
    { "studentId": "stu-002", "registrationNumber": "192211002", "status": "ABSENT", "remark": "Sick leave" }
  ]
}
```
- **Integrity Rules**:
  - Rejects unassigned teachers.
  - Rejects unmarked students.
  - Rejects duplicate sessions for the same class, section, subject, date, and period (`409 Conflict`).
- **Response**: `201 Created` with finalized `AttendanceSessionDTO`

#### `GET /api/v1/attendance/sessions/{id}`
- **Role**: `ADMIN`, `TEACHER`
- **Response**: `200 OK` with session details and student status records

#### `GET /api/v1/attendance/history`
- **Role**: All authenticated roles
- **Query Params**: `classId`, `section`, `subjectCode`, `teacherId`, `startDate`, `endDate`
- **Response**: List of finalized lecture sessions matching filters

#### `POST /api/v1/attendance/records/{id}/correct`
- **Role**: `ADMIN`, `TEACHER`
- **Request Body**:
```json
{
  "newStatus": "PRESENT",
  "reason": "Biometric terminal desynchronization verified by Faculty in-charge"
}
```
- **Response**: `200 OK` with updated record and an immutable entry logged to `attendance_correction_audit` table.

#### `GET /api/v1/attendance/records/{id}/corrections`
- **Role**: `ADMIN`, `TEACHER`
- **Response**: Audit trail history for the given record

#### `GET /api/v1/attendance/my-attendance`
- **Role**: `STUDENT`
- **Security / IDOR Safe**: Automatically resolves the authenticated student's own record from JWT caller claims. No ID can be manipulated in the request.
- **Response**: `200 OK` with overall percentage, attended vs conducted, course-by-course status, and recent lecture log.

#### `GET /api/v1/attendance/parent/children`
- **Role**: `PARENT`
- **Security / IDOR Safe**: Automatically queries linked wards for the caller's verified email from the `guardians` database table.
- **Response**: `200 OK` with list of children, attendance metrics, and alerts.

---

### 2.5 Reports & Analytics (`/api/v1/reports`)

#### `GET /api/v1/reports/overall`
- **Role**: `ADMIN`, `TEACHER`
- **Response**: Overall attendance KPIs, class breakdowns, daily trends

#### `GET /api/v1/reports/low-attendance`
- **Role**: `ADMIN`, `TEACHER`
- **Query Params**: `threshold` (default `75.0`)
- **Response**: List of students below threshold, shortfall margins, and debarred risk flags (<65%)

#### `GET /api/v1/reports/student/{regNo}`
- **Role**: `ADMIN`, `TEACHER`, `STUDENT` (Self), `PARENT` (Linked child)
- **Response**: Course-by-course attendance scorecard, shortfall indicators, date logs

#### `GET /api/v1/reports/export/excel`
- **Role**: `ADMIN`, `TEACHER`
- **Query Params**: `reportType` (e.g. `low-attendance`), `threshold` (default `75.0`)
- **Response**: Binary `.xlsx` workbook stream (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

### 2.6 Institutional Settings (`/api/v1/settings`)

#### `GET /api/v1/settings`
- **Role**: All authenticated roles
- **Response**: Key-value pairs of institutional settings (`attendance_threshold`, `debarred_threshold`, etc.)

#### `PUT /api/v1/settings/threshold`
- **Role**: `ADMIN` only
- **Request Body**: `{ "threshold": 75.0 }`
- **Response**: `200 OK`

