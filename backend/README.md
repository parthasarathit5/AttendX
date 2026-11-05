# AttendX Backend (Milestone 5)
**Production-Ready Modular Monolithic Attendance Telemetry & Academic Management Backend**

---

## 1. Technology Architecture
- **Language**: Java 21 (JDK 25 LTS runtime)
- **Framework**: Spring Boot 3.3.5
- **Modules**: Spring Web, Spring Security, Spring Data JPA, Hibernate, Bean Validation, Actuator
- **Database**: Supabase PostgreSQL 15+ (Production) / Embedded H2 (Local & Staging Tests)
- **Database Versioning**: Flyway Migrations (`V1__create_normalized_schema.sql`, `V2__seed_institutional_data.sql`)
- **Authentication**: Supabase Auth with trusted RS256 JWKS & HS256 JWT claim verification
- **Role-Based Access Control (RBAC)**: Server-side `@PreAuthorize` authorization with four official roles: `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`
- **Reporting & Export**: Apache POI 5.2.5 generating true OpenXML `.xlsx` binary workbooks

---

## 2. Directory Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/attendx/
│   │   │   ├── AttendXApplication.java
│   │   │   ├── config/              # CorsConfig, DataInitializer
│   │   │   ├── controller/          # Student, Academic, Attendance, Reports, Settings, Health
│   │   │   ├── dto/                 # ApiResponse<T>, StudentDTO, AttendanceSessionDTO, etc.
│   │   │   ├── entity/              # 14 JPA Entities (Institution, Student, Session, etc.)
│   │   │   ├── exception/           # GlobalExceptionHandler & custom exceptions
│   │   │   ├── repository/          # Spring Data JPA interfaces
│   │   │   ├── security/            # SecurityConfig, SupabaseJwtFilter, UserPrincipal
│   │   │   └── service/             # Student, Attendance, Audit, Reports, ExcelExport
│   │   └── resources/
│   │       ├── application.yml      # Multi-environment configuration
│   │       └── db/migration/        # Flyway versioned migrations (V1, V2)
│   └── test/                        # Integration and unit test suite
├── pom.xml
├── .env.example
├── README.md
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── SECURITY.md
└── DEPLOYMENT.md
```

---

## 3. Quick Start Locally

### Prerequisites
- Java 21+ (`java -version`)
- Apache Maven 3.9+ (`mvn -version`)

### Run Development Backend
```bash
# 1. Navigate to backend directory
cd backend

# 2. Build and run tests
mvn clean test

# 3. Start Spring Boot server
mvn spring-boot:run
```
The server will start on port `8080` with embedded database and Flyway migrations applied automatically.
Health endpoint: `http://localhost:8080/api/v1/health`
Actuator health: `http://localhost:8080/actuator/health`

