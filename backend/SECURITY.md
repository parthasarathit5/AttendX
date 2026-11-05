# AttendX Backend Security Architecture & Hardening Guide
**Enterprise-Grade Institutional Attendance Protection • SIMATS Academic Compliance**

---

## 1. Authentication & JWT Verification

AttendX utilizes **Supabase Auth** as the trusted identity provider, with cryptographic verification enforced at the Spring Boot backend gateway.

```mermaid
sequenceDiagram
    autonumber
    Client as React Frontend
    Supabase as Supabase Auth (Identity Provider)
    SpringSec as Spring Security (AttendX Gateway)
    DB as PostgreSQL (user_profiles)

    Client->>Supabase: User Sign In (Email / Password / SSO)
    Supabase-->>Client: JWT Access Token (Signed with RS256 / HS256)
    Client->>SpringSec: API Request + Header (Authorization: Bearer <token>)
    SpringSec->>SpringSec: Validate Token Signature against Supabase JWKS
    SpringSec->>SpringSec: Validate Expiration (exp) and Issuer (iss)
    SpringSec->>DB: Query user_profiles by supabase_user_id
    DB-->>SpringSec: Retrieve Trusted System Role (ADMIN, TEACHER, STUDENT, PARENT)
    SpringSec->>SpringSec: Populate SecurityContext with GrantedAuthority (ROLE_*)
```

### Security Directives:
1. **Never Trust Client Claims**: The user's role is **never** extracted from the client request body or mutable JWT claims. The role is resolved directly from the trusted `user_profiles` database table on each request.
2. **Signature Verification**: In production, tokens are verified against Supabase's published JWKS URL (`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`).
3. **No Plaintext Passwords**: AttendX backend never stores or processes user passwords. All authentication credentials are encrypted and managed by Supabase Auth.
4. **Mock Token Control**: Development mock tokens (`dev-token-admin`, `dev-token-teacher-001`, etc.) are strictly controlled by `MOCK_TOKENS_ENABLED=false` in production.

---

## 2. Server-Side Role-Based Access Control (RBAC) Matrix

Every protected endpoint is guarded with method-level `@PreAuthorize`:

| Module / Operation | Required Role | Server-Side Validation Rules |
| :--- | :--- | :--- |
| **Create Student** | `ADMIN` | Enforces institutional registration number uniqueness constraint |
| **Update Registration No** | `ADMIN` | Requires explicit `authorizedRegNoChangeReason`; audited |
| **Deactivate Student** | `ADMIN` | Soft deactivation; preserves all historical attendance logs |
| **View Student Profile** | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | Students can **only** view their own profile; Parents can **only** view linked children |
| **Mark Attendance** | `ADMIN`, `TEACHER` | Teachers can **only** mark assigned classes & subjects; rejects unassigned sessions |
| **Submit Attendance** | `ADMIN`, `TEACHER` | Rejects duplicate sessions; rejects unmarked students; validates enrollment |
| **Correct Attendance** | `ADMIN`, `TEACHER` | Mandatory reason (min 5 chars); creates immutable record in `attendance_correction_audit` |
| **Institutional Reports**| `ADMIN`, `TEACHER` | Teachers scoped to assigned departments; Students/Parents restricted |
| **Excel (.xlsx) Export**| `ADMIN`, `TEACHER` | Generates authenticated binary OpenXML workbooks via Apache POI |
| **Update Threshold** | `ADMIN` | Configures institutional regulations (e.g. 75.0% exam fee lockout) |

---

## 3. IDOR (Insecure Direct Object Reference) Prevention

1. **Student Scoping**: When a user with `ROLE_STUDENT` accesses `/api/v1/students/{id}` or `/api/v1/reports/student/{regNo}`, the service layer validates that the student record's registered email strictly matches `SecurityUtils.getCurrentUserEmail()`. Any cross-student query is immediately rejected with `403 Forbidden`.
2. **Teacher Class Scoping**: When a teacher submits attendance or requests student rosters, the service verifies `TeacherAssignment` in the database. A teacher cannot mark attendance for classes or subjects allocated to other faculty members.
3. **Parent Scoping**: A parent can only view records for students explicitly linked via `student_guardians` table.

---

## 4. SQL Injection Protection & Database Least-Privilege

1. **Spring Data JPA Parameterization**: All database interactions use Hibernate / JPA parameterized queries (`@Param("classId") String classId`) or Spring Data derived query methods. Zero raw string concatenation is permitted in SQL statements.
2. **Dedicated Database Role**: In production deployment, the Spring Boot connection uses a restricted database user role with permissions limited to `SELECT`, `INSERT`, `UPDATE` on application tables. DDL schema modifications are strictly restricted to Flyway migration runners.
3. **Database Constraints as Defense-in-Depth**:
   - `UNIQUE (class_id, section, subject_id, session_date, period)` prevents duplicate sessions at the database storage engine level.
   - `UNIQUE (session_id, student_id)` prevents duplicate student attendance records.
   - `CHECK (status IN ('PRESENT', 'ABSENT', 'OD', 'LATE'))` prevents invalid status insertion.

---

## 5. Centralized Error Masking & Information Leakage Prevention

1. **`GlobalExceptionHandler`**: Intercepts all runtime exceptions and produces uniform `ApiResponse<T>` JSON payloads.
2. **No Stack Traces**: Internal Java stack traces, database schema structures, SQL queries, and hostnames are completely hidden from API responses.
3. **Credential Sanitization**: Database passwords and JWT secrets are injected via system environment variables and are excluded from logs.

