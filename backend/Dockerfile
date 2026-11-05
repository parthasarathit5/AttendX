# ==============================================================================
# AttendX Backend - Production Multi-Stage Dockerfile (Java 21)
# Designed for Render Web Services & Containerized Cloud Deployment
# ==============================================================================

# ----------------- STAGE 1: Build Artifact -----------------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy Maven wrapper & POM to leverage layer caching
COPY pom.xml .
COPY src ./src

# Install Maven if needed or build directly
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests && \
    rm -rf /var/lib/apt/lists/*

# ----------------- STAGE 2: Production Runtime -----------------
FROM eclipse-temurin:21-jre-jammy

LABEL maintainer="AttendX Institutional Engineering <engineering@saveetha.com>"
LABEL service="AttendX Spring Boot REST Backend"
LABEL version="1.0.0"

WORKDIR /app

# Create unprivileged system user for zero-trust container security
RUN groupadd -r attendx && useradd -r -g attendx -d /app -s /sbin/nologin attendx

# Copy packaged executable JAR from builder
COPY --from=builder /build/target/attendx-backend-1.0.0.jar /app/attendx-backend.jar

# Set ownership
RUN chown -R attendx:attendx /app

USER attendx

# Configurable environment defaults
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Production entrypoint
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/attendx-backend.jar --server.port=${PORT}"]

