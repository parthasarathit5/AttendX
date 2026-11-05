-- ============================================================================
-- ATTENDX PRODUCTION DATABASE SCHEMA (MILESTONE 5)
-- Flyway Migration: V1__create_normalized_schema.sql
-- Relational model supporting Multi-Institution, Academic Hierarchy,
-- Attendance Telemetry, and Immutable Audit Trails.
-- ============================================================================

-- 1. INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'COLLEGE',
    address TEXT,
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PROFILES TABLE (Supabase Auth mapping)
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    supabase_user_id VARCHAR(100) UNIQUE,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACADEMIC YEARS TABLE
CREATE TABLE IF NOT EXISTS academic_years (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_academic_year UNIQUE (institution_id, code)
);

-- 4. CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    academic_year_id VARCHAR(36) REFERENCES academic_years(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year_of_study INT NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_class_code UNIQUE (institution_id, code)
);

-- 5. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    room_number VARCHAR(50),
    capacity INT DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_section UNIQUE (class_id, name)
);

-- 6. SUBJECTS TABLE (Course Catalog)
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    credits INT DEFAULT 4,
    semester INT NOT NULL,
    syllabus_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_subject_code UNIQUE (institution_id, code)
);

-- 7. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    user_profile_id VARCHAR(36) REFERENCES user_profiles(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    specialization VARCHAR(150),
    cabin_location VARCHAR(100),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_employee_id UNIQUE (institution_id, employee_id)
);

-- 8. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    user_profile_id VARCHAR(36) REFERENCES user_profiles(id) ON DELETE SET NULL,
    academic_year_id VARCHAR(36) REFERENCES academic_years(id) ON DELETE RESTRICT,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE RESTRICT,
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    registration_number VARCHAR(50) NOT NULL,
    roll_number VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    dob DATE,
    blood_group VARCHAR(10),
    address TEXT,
    admission_date DATE,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DEBARRED')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_student_regno UNIQUE (institution_id, registration_number)
);

-- 9. TEACHER ASSIGNMENTS (Teacher -> Class + Section + Subject)
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    teacher_id VARCHAR(36) REFERENCES teachers(id) ON DELETE CASCADE,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE CASCADE,
    section VARCHAR(10) NOT NULL,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id VARCHAR(36) REFERENCES academic_years(id) ON DELETE RESTRICT,
    role VARCHAR(50) DEFAULT 'PRIMARY_FACULTY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_teacher_class_subject UNIQUE (teacher_id, class_id, section, subject_id, academic_year_id)
);

-- 10. STUDENT GUARDIANS (Parent Linking)
CREATE TABLE IF NOT EXISTS student_guardians (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    user_profile_id VARCHAR(36) REFERENCES user_profiles(id) ON DELETE SET NULL,
    guardian_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    occupation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INSTITUTION SETTINGS (Configurable Regulatory Thresholds)
CREATE TABLE IF NOT EXISTS institution_settings (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_setting_key UNIQUE (institution_id, setting_key)
);

-- 12. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) REFERENCES institutions(id) ON DELETE CASCADE,
    session_code VARCHAR(100),
    academic_year_id VARCHAR(36) REFERENCES academic_years(id) ON DELETE RESTRICT,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE RESTRICT,
    section VARCHAR(10) NOT NULL,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE RESTRICT,
    teacher_id VARCHAR(36) REFERENCES teachers(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    period VARCHAR(50) NOT NULL,
    topic_covered VARCHAR(255),
    total_enrolled INT NOT NULL DEFAULT 0,
    present_count INT NOT NULL DEFAULT 0,
    absent_count INT NOT NULL DEFAULT 0,
    attendance_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_locked BOOLEAN DEFAULT FALSE,
    submission_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (submission_status IN ('DRAFT', 'SUBMITTED', 'FINALIZED')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- CRITICAL INTEGRITY RULE: No duplicate lecture sessions for same class, section, subject, date and period
    CONSTRAINT uq_session_schedule UNIQUE (class_id, section, subject_id, session_date, period)
);

-- 13. ATTENDANCE RECORDS TABLE (Individual Student Attendance Status)
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'OD', 'LATE')),
    remark VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- CRITICAL INTEGRITY RULE: A student can have at most ONE record per attendance session
    CONSTRAINT uq_session_student_record UNIQUE (session_id, student_id)
);

-- 14. ATTENDANCE CORRECTION AUDIT TABLE (Immutable Audit History)
CREATE TABLE IF NOT EXISTS attendance_correction_audit (
    id VARCHAR(36) PRIMARY KEY,
    record_id VARCHAR(36) REFERENCES attendance_records(id) ON DELETE CASCADE,
    session_id VARCHAR(36) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    original_status VARCHAR(20) NOT NULL,
    corrected_status VARCHAR(20) NOT NULL,
    correction_reason TEXT NOT NULL,
    changed_by_user_id VARCHAR(36) NOT NULL,
    changed_by_name VARCHAR(150) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & INTEGRITY INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_class_sec ON students(class_id, section);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_class_sec ON attendance_sessions(class_id, section);
CREATE INDEX IF NOT EXISTS idx_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_record ON attendance_correction_audit(record_id);

-- ============================================================================
-- 15. LEGACY COURSE OFFERING & V-STUDY INTEGRATION TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendx_users (
    id UUID PRIMARY KEY,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100) NOT NULL DEFAULT 'Computer Science and Engineering',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_offerings (
    course_offering_id VARCHAR(100) PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    credits INT DEFAULT 4,
    faculty_name VARCHAR(150),
    launched BOOLEAN DEFAULT TRUE,
    syllabus_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_topics (
    id UUID PRIMARY KEY,
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id) ON DELETE CASCADE,
    unit_number INT NOT NULL,
    unit_title VARCHAR(200) NOT NULL,
    topic_name VARCHAR(250) NOT NULL,
    learning_outcomes TEXT,
    hours_allocated INT DEFAULT 4,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS course_sessions (
    id UUID PRIMARY KEY,
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(50) DEFAULT 'Theory',
    title VARCHAR(200) NOT NULL,
    before_class_content TEXT,
    in_class_activity TEXT,
    after_class_task TEXT,
    qr_code_token VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    attendance_id UUID PRIMARY KEY,
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id) ON DELETE CASCADE,
    session_id UUID REFERENCES course_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES attendx_users(id) ON DELETE CASCADE,
    register_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    session_number INT NOT NULL,
    date DATE NOT NULL,
    department_name VARCHAR(100) DEFAULT 'Computer Science and Engineering',
    status VARCHAR(30) NOT NULL,
    verification_method VARCHAR(50) DEFAULT 'PORTAL',
    faculty_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS od_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES attendx_users(id) ON DELETE CASCADE,
    register_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id),
    session_number INT NOT NULL,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Symposium',
    proof_document_url TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    reviewed_by VARCHAR(150),
    review_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
