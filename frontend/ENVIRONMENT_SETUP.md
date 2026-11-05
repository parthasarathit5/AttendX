# AttendX — Environment Setup & Execution Guide

This guide explains how to configure, launch, and test the full AttendX system (Frontend + Spring Boot Backend + Supabase PostgreSQL).

---

## 1. Prerequisites

- **Java Development Kit**: JDK 21 or higher (`C:\Program Files\Java\jdk-25`)
- **Apache Maven**: 3.9+ (`tools/apache-maven-3.9.6`)
- **Web Browser**: Chrome, Edge, or Firefox
- **Optional**: Node.js 18+ (if serving frontend via Vite, though Spring Boot embeds and serves it directly)

---

## 2. Configuration Settings

### Backend Configuration (`backend/src/main/resources/application.properties`)

```properties
# Server
server.port=8080

# Supabase Auth Configuration
supabase.jwt.secret=${SUPABASE_JWT_SECRET:attendx-local-dev-jwt-secret-key-must-be-at-least-256-bits-long!}
supabase.url=${SUPABASE_URL:https://xyzcompany.supabase.co}
supabase.anon-key=${SUPABASE_ANON_KEY:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...}

# Database (Production Supabase PostgreSQL)
# spring.datasource.url=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
# spring.datasource.username=postgres
# spring.datasource.password=${SUPABASE_DB_PASSWORD}

# Database (Offline Development H2 with PostgreSQL syntax)
spring.datasource.url=jdbc:h2:mem:attendx;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```

### Frontend Configuration (`frontend/js/api.js` & `frontend/js/auth.js`)

Environment values can be set via window globals in `frontend/index.html` or `.env`:
```html
<script>
  window.VITE_SUPABASE_URL = "https://your-supabase-project.supabase.co";
  window.VITE_SUPABASE_ANON_KEY = "your-supabase-anon-key";
  window.VITE_API_BASE_URL = "http://localhost:8080/api/v1";
</script>
```

---

## 3. How to Run

### Option A: Unified Full-Stack Run (Recommended)
Spring Boot is pre-configured to serve the frontend as static resources from `http://localhost:8080/`.

1. **Build the Backend**:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
   cd "backend"
   ..\tools\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
   ```
2. **Run the Application**:
   ```powershell
   & "C:\Program Files\Java\jdk-25\bin\java.exe" -jar target\attendx-backend-1.0.0.jar
   ```
3. **Open the Application**:
   Navigate to:
   - **Frontend LMS Application**: `http://localhost:8080/`
   - **Health Probe**: `http://localhost:8080/api/v1/health`
   - **Swagger/OpenAPI (if active)**: `http://localhost:8080/swagger-ui/index.html`

### Option B: Standalone Frontend Dev Server
If modifying frontend HTML/CSS/JS dynamically with live reload:
1. Start the Spring Boot backend as described in Option A.
2. In a separate terminal:
   ```powershell
   cd frontend
   npx serve . -p 3000
   ```
3. Open `http://localhost:3000/`. The centralized `api.js` will automatically route all `/api/v1` REST calls to `http://localhost:8080/api/v1`.

---

## 4. Running the Integration Test Suite

To verify that all 38 test assertions pass across auth, dashboards, students, academics, attendance, locking, correction audit, IDOR prevention, and Excel export:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ADMIN\.gemini\antigravity\brain\fbc4989b-c773-4354-8406-00836daf9380\scratch\test_milestone6_integration.ps1"
```

Expected output:
```
==================================================================
  TEST RESULTS: 38 PASSED, 0 FAILED
==================================================================
```
