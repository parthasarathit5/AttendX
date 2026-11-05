# AttendX — Monitoring, Alerting & Operational Readiness Runbook

This runbook outlines system telemetry, health monitoring, error diagnostics, and incident escalation for the **AttendX** platform.

---

## 1. System Telemetry & Health Probes

### Endpoints:
- **Application Health Probe**: `GET /api/v1/health`
  - Publicly accessible by load balancers, Render uptime monitors, and Pingdom.
  - Returns `200 OK` with JSON `{ "status": "UP", "service": "AttendX Backend", "version": "1.0.0" }`.
- **Actuator Health**: `GET /actuator/health`
  - Validates database connectivity, disk space, and JVM status.
- **Actuator Metrics**: `GET /actuator/metrics`
  - Exposes JVM memory usage, active threads, HikariCP connection pool utilization, and HTTP request rates.

---

## 2. Zero-Token Log Scrubbing & Security

The Spring Boot backend and Logback logging system enforce strict data privacy:
- **No Token Printing**: `Authorization` headers, JWT signatures, and Bearer tokens are scrubbed from all standard logs.
- **No Password Exposure**: Database credentials, Supabase service-role keys, and user credentials are never emitted to stdout or log aggregators.
- **No Unhandled Stack Traces**: Exceptions intercepted by `GlobalExceptionHandler` emit standardized `ApiResponse.error()` envelopes without leaking internal class traces or SQL dialect structures to users.

---

## 3. Incident Response Playbook

| Scenario | Symptoms | Immediate Action | Escalation Contact |
| :--- | :--- | :--- | :--- |
| **Backend Unreachable** | `/api/v1/health` returns 502/503 | Inspect Render service logs; trigger automatic redeploy | Systems Administrator |
| **Database Pool Exhaustion** | Latency > 2000ms; Hikari timeouts | Increase `HIKARI_MAX_POOL_SIZE` in Render env vars; verify long-running queries | Lead DBA |
| **Elevated Duplicate Rejections** | Spike in 409 Conflict logs | Inspect network connectivity at campus terminal; confirm teachers aren't double-submitting | Academic Coordinator |
| **Authentication Failures** | Sudden spike in 401 Unauthorized | Check Supabase Auth service status at `status.supabase.com`; check JWT secret sync | Security Lead |

