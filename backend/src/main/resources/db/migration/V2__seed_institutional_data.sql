-- ============================================================================
-- ATTENDX PRODUCTION SEED DATA (MILESTONE 5)
-- Flyway Migration: V2__seed_institutional_data.sql
-- Baseline institutional seed data matching Saveetha School of Engineering
-- ============================================================================

-- 1. INSTITUTION
INSERT INTO institutions (id, code, name, type, address, website, is_active)
VALUES (
    'inst-sse-001',
    'SSE-SIMATS',
    'Saveetha School of Engineering, SIMATS',
    'COLLEGE',
    'Saveetha Nagar, Thandalam, Chennai - 602105, Tamil Nadu',
    'https://vstudy.saveetha.com',
    TRUE
);

-- 2. INSTITUTION SETTINGS (Default 75.0% threshold)
INSERT INTO institution_settings (id, institution_id, setting_key, setting_value, description)
VALUES 
    ('set-001', 'inst-sse-001', 'attendance_threshold', '75.0', 'Mandatory minimum attendance percentage for examination eligibility and fee payment clearance'),
    ('set-002', 'inst-sse-001', 'debarred_threshold', '65.0', 'Critical attendance cutoff below which students face course debarment'),
    ('set-003', 'inst-sse-001', 'exam_fee_amount', '1500', 'Semester exam fee in INR');

-- 3. ACADEMIC YEARS
INSERT INTO academic_years (id, institution_id, code, name, start_date, end_date, is_current, status)
VALUES 
    ('ay-2025-26', 'inst-sse-001', '2025-2026', 'Academic Year 2025–2026 (Even Semester)', '2025-12-01', '2026-05-30', TRUE, 'ACTIVE'),
    ('ay-2024-25', 'inst-sse-001', '2024-2025', 'Academic Year 2024–2025 (Completed)', '2024-06-01', '2025-05-31', FALSE, 'ARCHIVED');

-- 4. CLASSES
INSERT INTO classes (id, institution_id, academic_year_id, code, name, department, year_of_study, semester)
VALUES 
    ('BE-CSE-3A', 'inst-sse-001', 'ay-2025-26', 'BE-CSE-3A', 'B.E. Computer Science & Engineering - III Year A', 'Computer Science & Engineering', 3, 6),
    ('BE-CSE-3B', 'inst-sse-001', 'ay-2025-26', 'BE-CSE-3B', 'B.E. Computer Science & Engineering - III Year B', 'Computer Science & Engineering', 3, 6),
    ('BE-ECE-2A', 'inst-sse-001', 'ay-2025-26', 'BE-ECE-2A', 'B.E. Electronics & Communication - II Year A', 'Electronics & Communication', 2, 4);

-- 5. SECTIONS
INSERT INTO sections (id, class_id, name, room_number, capacity)
VALUES 
    ('sec-3a-a', 'BE-CSE-3A', 'A', 'LH-301', 60),
    ('sec-3b-b', 'BE-CSE-3B', 'B', 'LH-302', 60),
    ('sec-2a-a', 'BE-ECE-2A', 'A', 'LH-204', 60);

-- 6. SUBJECTS (Curriculum Catalog)
INSERT INTO subjects (id, institution_id, code, name, department, credits, semester, syllabus_summary)
VALUES 
    ('sub-cs301', 'inst-sse-001', 'CS301', 'Design and Analysis of Algorithms', 'Computer Science & Engineering', 4, 6, 'Divide and conquer, dynamic programming, greedy algorithms, NP-completeness'),
    ('sub-cs302', 'inst-sse-001', 'CS302', 'Database Management Systems', 'Computer Science & Engineering', 4, 6, 'Relational calculus, SQL, indexing, transaction ACID properties, normalization'),
    ('sub-cs303', 'inst-sse-001', 'CS303', 'Operating Systems & Kernel Design', 'Computer Science & Engineering', 4, 6, 'Process scheduling, virtual memory paging, concurrency, file systems'),
    ('sub-cs304', 'inst-sse-001', 'CS304', 'Computer Networks & Protocols', 'Computer Science & Engineering', 3, 6, 'OSI model, TCP/IP stack, routing protocols, socket programming'),
    ('sub-cs305', 'inst-sse-001', 'CS305', 'Theory of Computation & Automata', 'Computer Science & Engineering', 3, 6, 'DFA, NFA, context-free grammars, Turing machines, decidability');

-- 7. USER PROFILES (Admin, Teacher, Student, Parent)
INSERT INTO user_profiles (id, supabase_user_id, institution_id, email, full_name, phone_number, role, status)
VALUES 
    ('usr-admin-001', 'sup-admin-001', 'inst-sse-001', 'admin@attendx.saveetha.com', 'Dr. C. Ramesh', '+91 94441 23456', 'ADMIN', 'ACTIVE'),
    ('usr-teach-001', 'sup-teach-001', 'inst-sse-001', 'senthil.k@saveetha.com', 'Dr. K. Senthil Kumar', '+91 98401 23456', 'TEACHER', 'ACTIVE'),
    ('usr-teach-002', 'sup-teach-002', 'inst-sse-001', 'meenakshi.s@saveetha.com', 'Dr. Meenakshi Sundaram', '+91 98402 34567', 'TEACHER', 'ACTIVE'),
    ('usr-stu-001', 'sup-stu-001', 'inst-sse-001', 'aarav.sharma@saveetha.com', 'Aarav Sharma', '+91 98765 43210', 'STUDENT', 'ACTIVE'),
    ('usr-stu-002', 'sup-stu-002', 'inst-sse-001', 'abhinav.patel@saveetha.com', 'Abhinav Patel', '+91 98765 43211', 'STUDENT', 'ACTIVE'),
    ('usr-parent-001', 'sup-parent-001', 'inst-sse-001', 'parent.aarav@gmail.com', 'Rajesh Sharma', '+91 98410 99887', 'PARENT', 'ACTIVE');

-- 8. TEACHERS
INSERT INTO teachers (id, institution_id, user_profile_id, employee_id, full_name, email, phone, department, designation, cabin_location, status)
VALUES 
    ('tch-001', 'inst-sse-001', 'usr-teach-001', 'FAC-CSE-001', 'Dr. K. Senthil Kumar', 'senthil.k@saveetha.com', '+91 98401 23456', 'Computer Science & Engineering', 'Professor & Head', 'Block A, Room 302', 'ACTIVE'),
    ('tch-002', 'inst-sse-001', 'usr-teach-002', 'FAC-CSE-002', 'Dr. Meenakshi Sundaram', 'meenakshi.s@saveetha.com', '+91 98402 34567', 'Computer Science & Engineering', 'Associate Professor', 'Block A, Room 305', 'ACTIVE');

-- 9. TEACHER ASSIGNMENTS
INSERT INTO teacher_assignments (id, institution_id, teacher_id, class_id, section, subject_id, academic_year_id, role)
VALUES 
    ('ta-001', 'inst-sse-001', 'tch-001', 'BE-CSE-3A', 'A', 'sub-cs301', 'ay-2025-26', 'PRIMARY_FACULTY'),
    ('ta-002', 'inst-sse-001', 'tch-001', 'BE-CSE-3B', 'B', 'sub-cs301', 'ay-2025-26', 'PRIMARY_FACULTY'),
    ('ta-003', 'inst-sse-001', 'tch-002', 'BE-CSE-3A', 'A', 'sub-cs302', 'ay-2025-26', 'PRIMARY_FACULTY');

-- 10. STUDENTS (Cohort 192211001 to 192211005)
INSERT INTO students (id, institution_id, user_profile_id, academic_year_id, class_id, section, registration_number, roll_number, first_name, last_name, full_name, email, phone, gender, dob, admission_date, status)
VALUES 
    ('stu-001', 'inst-sse-001', 'usr-stu-001', 'ay-2025-26', 'BE-CSE-3A', 'A', '192211001', 'CSE-3A-01', 'Aarav', 'Sharma', 'Aarav Sharma', 'aarav.sharma@saveetha.com', '+91 98765 43210', 'MALE', '2004-05-14', '2023-08-01', 'ACTIVE'),
    ('stu-002', 'inst-sse-001', 'usr-stu-002', 'ay-2025-26', 'BE-CSE-3A', 'A', '192211002', 'CSE-3A-02', 'Abhinav', 'Patel', 'Abhinav Patel', 'abhinav.patel@saveetha.com', '+91 98765 43211', 'MALE', '2004-03-22', '2023-08-01', 'ACTIVE'),
    ('stu-003', 'inst-sse-001', NULL, 'ay-2025-26', 'BE-CSE-3A', 'A', '192211003', 'CSE-3A-03', 'Aditi', 'Sundaram', 'Aditi Sundaram', 'aditi.s@saveetha.com', '+91 98765 43212', 'FEMALE', '2004-07-18', '2023-08-01', 'ACTIVE'),
    ('stu-004', 'inst-sse-001', NULL, 'ay-2025-26', 'BE-CSE-3A', 'A', '192211004', 'CSE-3A-04', 'Akash', 'Rajan', 'Akash Rajan', 'akash.rajan@saveetha.com', '+91 98765 43213', 'MALE', '2004-11-09', '2023-08-01', 'ACTIVE'),
    ('stu-005', 'inst-sse-001', NULL, 'ay-2025-26', 'BE-CSE-3A', 'A', '192211005', 'CSE-3A-05', 'Ananya', 'Deshmukh', 'Ananya Deshmukh', 'ananya.d@saveetha.com', '+91 98765 43214', 'FEMALE', '2004-01-30', '2023-08-01', 'ACTIVE');

-- 11. STUDENT GUARDIAN (Parent linking)
INSERT INTO student_guardians (id, student_id, user_profile_id, guardian_name, relationship, phone, email, occupation)
VALUES (
    'grd-001',
    'stu-001',
    'usr-parent-001',
    'Rajesh Sharma',
    'Father',
    '+91 98410 99887',
    'parent.aarav@gmail.com',
    'Senior IT Director'
);
