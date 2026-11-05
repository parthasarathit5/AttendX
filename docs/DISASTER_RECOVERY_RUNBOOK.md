# AttendX — Disaster Recovery & Database Backup Runbook

**Target Database**: Supabase Managed PostgreSQL  
**Responsible Administrator**: Lead Institutional Systems Administrator  
**Recovery Time Objective (RTO)**: < 30 Minutes  
**Recovery Point Objective (RPO)**: < 1 Hour (Continuous Write-Ahead Logs)

---

## 1. Backup Strategy & Retention Policy

| Backup Type | Frequency | Retention Window | Storage Location |
| :--- | :--- | :--- | :--- |
| **Automated Point-in-Time (PITR)** | Continuous WAL stream | 7 to 30 Days (Plan-dependent) | Supabase Encrypted Cloud Storage |
| **Daily Full Database Dump** | Daily at 02:00 IST | 30 Days | Encrypted Off-site Object Storage (S3 / GCP) |
| **Weekly Cold Archive** | Every Sunday | 1 Year | Cold Archive for Statutory Compliance |

---

## 2. Automated Backup Execution

### Executing pg_dump via PowerShell Script:
```powershell
$env:SUPABASE_DB_HOST = "db.<your-project-ref>.supabase.co"
$env:SUPABASE_DB_USERNAME = "postgres"
$env:SUPABASE_DB_PASSWORD = "<your-db-password>"

.\scripts\backup_supabase.ps1
```
Output: Timestamped compressed custom archive `backups/attendx_backup_YYYYMMDD_HHMMSS.sql.dump`.

---

## 3. Database Restoration Procedure (Staging & Production)

> [!CAUTION]
> Never restore a backup directly over the production database without first verifying the archive in an isolated staging database.

### Step 1: Restore Archive into Staging Database
```powershell
$env:STAGING_DB_HOST = "db.<staging-ref>.supabase.co"
$env:STAGING_DB_PASSWORD = "<staging-db-password>"

.\scripts\restore_supabase.ps1 -BackupFile "backups/attendx_backup_20261105_200416.dump"
```

### Step 2: Post-Restoration Data Integrity Verification
The automated restoration script verifies the presence and integrity of all 10 core relational tables:
1. `institutions` (Master records & active status)
2. `user_profiles` (Supabase Auth UID linkages)
3. `academic_years` (Active and archived cycles)
4. `classes` & `sections` (Curriculum hierarchy)
5. `subjects` (Course catalog)
6. `teachers` & `teacher_assignments` (Faculty workload allocations)
7. `students` & `student_guardians` (Official registration numbers & parent links)
8. `attendance_sessions` (Locked sessions, percentages, constraints)
9. `attendance_records` (Individual student statuses)
10. `attendance_correction_audit` (Immutable audit trails)

### Step 3: Production Failover
1. Once staging validation achieves 10/10 PASS, repoint Render backend connection string:
   `SUPABASE_DB_URL=jdbc:postgresql://db.<restored-ref>.supabase.co:5432/postgres?sslmode=require`
2. Restart the Render Web Service.
3. Call `GET /api/v1/health` and verify HTTP 200 `UP`.

