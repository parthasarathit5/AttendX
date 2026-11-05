-- AttendX Supabase PostgreSQL Schema & Migrations
-- Designed for AttendX LMS & Attendance Telemetry System
-- Primary Course Offering Reference: 2851d026-2f7b-46c4-92a5-053cf5e4f57d

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS attendx_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    register_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT', -- STUDENT, FACULTY, COORDINATOR, ADMIN
    department VARCHAR(100) NOT NULL DEFAULT 'Computer Science and Engineering',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Offerings Table
CREATE TABLE IF NOT EXISTS course_offerings (
    course_offering_id VARCHAR(100) PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    credits INT DEFAULT 4,
    faculty_id UUID REFERENCES attendx_users(id),
    faculty_name VARCHAR(150),
    launched BOOLEAN DEFAULT TRUE,
    syllabus_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Topics Table
CREATE TABLE IF NOT EXISTS course_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id) ON DELETE CASCADE,
    unit_number INT NOT NULL,
    unit_title VARCHAR(200) NOT NULL,
    topic_name VARCHAR(250) NOT NULL,
    learning_outcomes TEXT,
    hours_allocated INT DEFAULT 4,
    completed BOOLEAN DEFAULT FALSE
);

-- Course Sessions (Session Plan) Table
CREATE TABLE IF NOT EXISTS course_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(50) DEFAULT 'Theory', -- Theory, Practical, Clinical
    title VARCHAR(200) NOT NULL,
    before_class_content TEXT, -- Preparation material, readings
    in_class_activity TEXT,    -- Lecture, discussion, hands-on lab
    after_class_task TEXT,     -- Assignment, quiz, MCQ
    qr_code_token VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id) ON DELETE CASCADE,
    session_id UUID REFERENCES course_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES attendx_users(id) ON DELETE CASCADE,
    register_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    session_number INT NOT NULL,
    date DATE NOT NULL,
    department_name VARCHAR(100) DEFAULT 'Computer Science and Engineering',
    status VARCHAR(30) NOT NULL, -- present, absent, on_duty
    verification_method VARCHAR(50) DEFAULT 'PORTAL', -- QR_CODE, BIOMETRIC, MANUAL, PORTAL
    faculty_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_session UNIQUE (session_id, user_id)
);

-- On Duty (OD) & Leave Requests Table
CREATE TABLE IF NOT EXISTS od_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES attendx_users(id) ON DELETE CASCADE,
    register_number VARCHAR(50) NOT NULL,
    course_offering_id VARCHAR(100) REFERENCES course_offerings(course_offering_id),
    session_number INT NOT NULL,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Symposium', -- Symposium, Sports, Medical, Conference
    proof_document_url TEXT,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewed_by VARCHAR(150),
    review_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data: Primary Reference Course Offering
INSERT INTO course_offerings (
    course_offering_id,
    course_code,
    course_name,
    department,
    semester,
    academic_year,
    credits,
    faculty_name,
    launched,
    syllabus_summary
) VALUES (
    '2851d026-2f7b-46c4-92a5-053cf5e4f57d',
    '21CS301',
    'Distributed Cloud Computing & Attendance Telemetry',
    'Department of Computer Science and Engineering',
    'Semester VI',
    '2025-2026',
    4,
    'Dr. K. Ravichandran, M.E., Ph.D.',
    TRUE,
    'Comprehensive study of distributed consensus, cloud architectures, real-time microservice telemetry, automated geofenced attendance tracking, and edge computing synchronization.'
) ON CONFLICT (course_offering_id) DO NOTHING;
