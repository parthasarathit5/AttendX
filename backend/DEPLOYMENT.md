# AttendX Backend Deployment Guide
**Render Cloud Hosting • Supabase Managed PostgreSQL • Production Readiness**

---

## 1. Architecture & Network Topology

```mermaid
flowchart LR
    Browser["React Frontend (HTTPS)"]
    Render["Render Web Service (Spring Boot 3.3.5 / Java 21)"]
    SupabaseAuth["Supabase Auth (Cloud JWKS)"]
    SupabaseDB["Supabase Managed PostgreSQL 15+"]

    Browser -->|API Calls (Bearer JWT)| Render
    Render -->|JWKS Key Verification| SupabaseAuth
    Render -->|JDBC Connection Pool (SSL Required)| SupabaseDB
```

---

## 2. Render Web Service Deployment Configuration

### 2.1 Service Specifications
- **Service Type**: Web Service (Docker or Native Java)
- **Environment**: Java 21 LTS
- **Region**: Oregon (US-West) or Singapore / Frankfurt (Select the region nearest to your Supabase project region for minimal latency)
- **Branch**: `master` or `main`
- **Root Directory**: `backend`
- **Build Command**:
  ```bash
  mvn clean package -DskipTests
  ```
- **Start Command**:
  ```bash
  java -jar target/attendx-backend-1.0.0.jar
  ```
- **Health Check Path**: `/api/v1/health` (HTTP 200)

### 2.2 Production Environment Variables in Render Dashboard

| Variable Key | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Auto-configured by Render | `8080` (or leave default `$PORT`) |
| `SUPABASE_DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require` |
| `SUPABASE_DB_USERNAME` | Database username | `postgres.<project-ref>` |
| `SUPABASE_DB_PASSWORD` | Secure database user password | *[Configured via Render Secret]* |
| `SPRING_DATASOURCE_DRIVER` | PostgreSQL driver class | `org.postgresql.Driver` |
| `HIBERNATE_DDL_AUTO` | Hibernate validation mode | `validate` (Strictly do not use `update` in production!) |
| `SUPABASE_JWT_ISSUER` | Supabase Auth issuer URL | `https://<project-ref>.supabase.co/auth/v1` |
| `SUPABASE_JWKS_URL` | Public JWKS endpoint | `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` |
| `APP_ALLOWED_ORIGINS` | Allowed CORS origins | `https://attendx.onrender.com,https://vstudy.saveetha.com` |
| `MOCK_TOKENS_ENABLED` | Disable development mock tokens | `false` |
| `SHOW_SQL` | Hide SQL logs in production | `false` |

---

## 3. Database Connection Pooling: Direct vs. Session Pooler

- **Direct Connection (`db.<project-ref>.supabase.co:5432`)**: Use when connecting from networks with full IPv6 support and lower concurrency.
- **Session Pooler (`aws-0-<region>.pooler.supabase.com:6543`)**: **Recommended for Render Web Services**, which run primarily on IPv4 infrastructure. Ensure `sslmode=require` is appended to the JDBC connection string.

---

## 4. Flyway Migrations in Production

AttendX automates zero-downtime database versioning via Flyway:
- Migrations are stored in `src/main/resources/db/migration/`.
- During application startup, Flyway inspects the `flyway_schema_history` table in Supabase.
- If unapplied migrations exist, Flyway applies them in transactional sequence before starting the web server.
- `spring.flyway.validate-on-migrate: true` ensures existing migrations are never tampered with or modified after deployment.

---

## 5. Database Backup & Disaster Recovery Strategy

AttendX handles critical institutional attendance and student records. The following disaster recovery protocols must be maintained:

### 5.1 Automated Supabase Backups
- Supabase provides automated daily write-ahead log (WAL) backups and Point-In-Time Recovery (PITR) up to 7–30 days depending on the tier.
- Ensure PITR is enabled in Supabase Dashboard -> Project Settings -> Database -> Backups.

### 5.2 Manual Pre-Migration Snapshot (Cold Backup)
Before applying new migration versions or large cohort imports, run an offline logical snapshot:
```bash
pg_dump -h aws-0-<region>.pooler.supabase.com -p 6543 -U postgres.<project-ref> -d postgres -F c -b -v -f attendx_backup_$(date +%Y%m%d_%H%M%S).dump
```

### 5.3 Restore & Verification Testing Procedure
1. Create a dedicated staging test database: `attendx_staging`.
2. Restore the dump file:
   ```bash
   pg_restore -h aws-0-<region>.pooler.supabase.com -p 6543 -U postgres.<project-ref> -d attendx_staging -v attendx_backup_<timestamp>.dump
   ```
3. Run the verification query to confirm record counts match production:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM students) AS total_students,
     (SELECT COUNT(*) FROM attendance_sessions) AS total_sessions,
     (SELECT COUNT(*) FROM attendance_records) AS total_records,
     (SELECT COUNT(*) FROM attendance_correction_audit) AS total_audits;
   ```
4. Never assume backups are operational until a test restore has been executed and verified in staging.

