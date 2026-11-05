/**
 * MaccaAttendX - Academic & User Data Service Layer (Milestone 2)
 * Decoupled data repository providing CRUD operations, validation rules,
 * duplicate detection, and development mock storage for:
 * - Students
 * - Teachers
 * - Classes & Sections
 * - Subjects
 * - Academic Years
 *
 * NOTE: All records are clearly tagged as development demo records (isDemo: true).
 * Ready to cleanly bind to Spring Boot REST APIs in Milestone 5.
 */

const AcademicDataService = {
  storageKeyPrefix: 'maccaattendx_m2_',

  // ============================================================================
  // Initial Academic Datasets (Saveetha V-Study aligned)
  // ============================================================================
  initialData: {
    academicYears: [
      {
        id: 'AY-2025-26',
        name: '2025–2026',
        startDate: '2025-06-16',
        endDate: '2026-05-15',
        description: 'Odd & Even Semesters — Saveetha School of Engineering',
        status: 'ACTIVE',
        isDemo: true
      },
      {
        id: 'AY-2024-25',
        name: '2024–2025',
        startDate: '2024-06-17',
        endDate: '2025-05-16',
        description: 'Previous Academic Cycle — Archived',
        status: 'COMPLETED',
        isDemo: true
      },
      {
        id: 'AY-2026-27',
        name: '2026–2027',
        startDate: '2026-06-15',
        endDate: '2027-05-14',
        description: 'Upcoming Academic Cycle — Curriculum Revision',
        status: 'UPCOMING',
        isDemo: true
      }
    ],

    classes: [
      {
        id: 'BE-CSE-3A',
        name: 'B.E. Computer Science & Engineering',
        grade: '3rd Year',
        section: 'A',
        classTeacherId: 'TCH-201',
        classTeacherName: 'Dr. K. Senthil Kumar',
        academicYear: '2025–2026',
        studentCount: 62,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'BE-CSE-3B',
        name: 'B.E. Computer Science & Engineering',
        grade: '3rd Year',
        section: 'B',
        classTeacherId: 'TCH-202',
        classTeacherName: 'Dr. Meenakshi Sundaram',
        academicYear: '2025–2026',
        studentCount: 60,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'BE-ECE-2A',
        name: 'B.E. Electronics & Communication',
        grade: '2nd Year',
        section: 'A',
        classTeacherId: 'TCH-203',
        classTeacherName: 'Prof. Anitha Venkatesh',
        academicYear: '2025–2026',
        studentCount: 58,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'BTECH-AI-1A',
        name: 'B.Tech Artificial Intelligence & Data Science',
        grade: '1st Year',
        section: 'A',
        classTeacherId: 'TCH-204',
        classTeacherName: 'Dr. G. Balaji',
        academicYear: '2025–2026',
        studentCount: 64,
        status: 'Active',
        isDemo: true
      }
    ],

    teachers: [
      {
        id: 'TCH-201',
        firstName: 'Senthil',
        lastName: 'Kumar K.',
        fullName: 'Dr. K. Senthil Kumar',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
        employeeId: 'EMP-8842',
        email: 'senthil.kumar@saveetha.ac.in',
        phone: '9840182736',
        dob: '1982-06-18',
        gender: 'Male',
        department: 'Computer Science & Engineering',
        qualification: 'Ph.D. in Computer Science (IIT Madras), M.E.',
        joiningDate: '2018-06-01',
        address: 'Staff Quarters Flat 4B, SIMATS Campus, Thandalam, Chennai',
        assignedClasses: ['BE-CSE-3A', 'BE-CSE-3B'],
        assignedSubjects: ['CS301', 'CS305'],
        status: 'Active',
        isDemo: true
      },
      {
        id: 'TCH-202',
        firstName: 'Meenakshi',
        lastName: 'Sundaram P.',
        fullName: 'Dr. Meenakshi Sundaram',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
        employeeId: 'EMP-8843',
        email: 'meenakshi.s@saveetha.ac.in',
        phone: '9840293847',
        dob: '1985-09-24',
        gender: 'Female',
        department: 'Computer Science & Engineering',
        qualification: 'Ph.D. in Database Systems (Anna University)',
        joiningDate: '2019-07-15',
        address: 'No. 18, Gandhi Nagar 2nd Main Road, Porur, Chennai',
        assignedClasses: ['BE-CSE-3A', 'BE-CSE-3B'],
        assignedSubjects: ['CS302'],
        status: 'Active',
        isDemo: true
      },
      {
        id: 'TCH-203',
        firstName: 'Anitha',
        lastName: 'Venkatesh R.',
        fullName: 'Prof. Anitha Venkatesh',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
        employeeId: 'EMP-7612',
        email: 'anitha.v@saveetha.ac.in',
        phone: '9790182736',
        dob: '1988-11-12',
        gender: 'Female',
        department: 'Electronics & Communication',
        qualification: 'M.Tech VLSI & Embedded Systems',
        joiningDate: '2020-01-10',
        address: 'Plot 5, Royal Enclave, Poonamallee, Chennai',
        assignedClasses: ['BE-ECE-2A'],
        assignedSubjects: ['EC201'],
        status: 'Active',
        isDemo: true
      },
      {
        id: 'TCH-204',
        firstName: 'Balaji',
        lastName: 'Gopalan',
        fullName: 'Dr. G. Balaji',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
        employeeId: 'EMP-9021',
        email: 'balaji.g@saveetha.ac.in',
        phone: '9884019283',
        dob: '1980-03-30',
        gender: 'Male',
        department: 'Artificial Intelligence & Data Science',
        qualification: 'Ph.D. in Deep Learning (NIT Trichy)',
        joiningDate: '2021-08-01',
        address: 'No. 77, GST Road, Tambaram, Chennai',
        assignedClasses: ['BTECH-AI-1A'],
        assignedSubjects: ['AI101', 'CS303'],
        status: 'Active',
        isDemo: true
      }
    ],

    subjects: [
      {
        id: 'SUB-301',
        code: 'CS301',
        name: 'Design and Analysis of Algorithms',
        type: 'Theory',
        department: 'Computer Science & Engineering',
        classId: 'BE-CSE-3A',
        teacherId: 'TCH-201',
        teacherName: 'Dr. K. Senthil Kumar',
        weeklyPeriods: 4,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'SUB-302',
        code: 'CS302',
        name: 'Database Management Systems',
        type: 'Theory',
        department: 'Computer Science & Engineering',
        classId: 'BE-CSE-3A',
        teacherId: 'TCH-202',
        teacherName: 'Dr. Meenakshi Sundaram',
        weeklyPeriods: 4,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'SUB-303',
        code: 'CS303',
        name: 'Operating Systems & System Kernel',
        type: 'Theory',
        department: 'Computer Science & Engineering',
        classId: 'BE-CSE-3A',
        teacherId: 'TCH-204',
        teacherName: 'Dr. G. Balaji',
        weeklyPeriods: 3,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'SUB-304',
        code: 'CS304',
        name: 'Computer Networks & Distributed Systems',
        type: 'Integrated',
        department: 'Computer Science & Engineering',
        classId: 'BE-CSE-3A',
        teacherId: 'TCH-201',
        teacherName: 'Dr. K. Senthil Kumar',
        weeklyPeriods: 4,
        status: 'Active',
        isDemo: true
      },
      {
        id: 'SUB-305',
        code: 'CS305',
        name: 'Algorithms & Data Structures Laboratory',
        type: 'Practical / Lab',
        department: 'Computer Science & Engineering',
        classId: 'BE-CSE-3A',
        teacherId: 'TCH-201',
        teacherName: 'Dr. K. Senthil Kumar',
        weeklyPeriods: 3,
        status: 'Active',
        isDemo: true
      }
    ],

    students: [
      {
        id: 'STU-101',
        firstName: 'Aarav',
        lastName: 'Sharma',
        fullName: 'Aarav Sharma',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211001',
        admissionNumber: 'ADM-2023-0101',
        rollNumber: '192211001',
        email: 'aarav.sharma@saveetha.ac.in',
        phone: '9876543210',
        dob: '2004-05-14',
        gender: 'Male',
        address: 'No. 42, Anna Nagar West, Chennai, Tamil Nadu 600040',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 88.5,
        guardian: {
          name: 'Suresh Sharma',
          relationship: 'Father',
          phone: '9841029384',
          email: 'suresh.sharma@example.com',
          address: 'No. 42, Anna Nagar West, Chennai, Tamil Nadu 600040'
        },
        isDemo: true
      },
      {
        id: 'STU-102',
        firstName: 'Abhinav',
        lastName: 'Patel',
        fullName: 'Abhinav Patel',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211002',
        admissionNumber: 'ADM-2023-0102',
        rollNumber: '192211002',
        email: 'abhinav.patel@saveetha.ac.in',
        phone: '9876543211',
        dob: '2004-08-22',
        gender: 'Male',
        address: 'Plot 12, T. Nagar, Chennai, Tamil Nadu 600017',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 72.4, // Under 75% shortfall
        guardian: {
          name: 'Mukesh Patel',
          relationship: 'Father',
          phone: '9841029385',
          email: 'mukesh.patel@example.com',
          address: 'Plot 12, T. Nagar, Chennai, Tamil Nadu 600017'
        },
        isDemo: true
      },
      {
        id: 'STU-103',
        firstName: 'Aditi',
        lastName: 'Sundaram',
        fullName: 'Aditi Sundaram',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211003',
        admissionNumber: 'ADM-2023-0103',
        rollNumber: '192211003',
        email: 'aditi.s@saveetha.ac.in',
        phone: '9876543212',
        dob: '2004-03-10',
        gender: 'Female',
        address: 'No. 8, Besant Nagar Beach Road, Chennai, Tamil Nadu 600090',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 94.0,
        guardian: {
          name: 'Sundaram V.',
          relationship: 'Father',
          phone: '9841029386',
          email: 'sundaram.v@example.com',
          address: 'No. 8, Besant Nagar Beach Road, Chennai, Tamil Nadu 600090'
        },
        isDemo: true
      },
      {
        id: 'STU-104',
        firstName: 'Akash',
        lastName: 'Rajan',
        fullName: 'Akash Rajan',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211004',
        admissionNumber: 'ADM-2023-0104',
        rollNumber: '192211004',
        email: 'akash.rajan@saveetha.ac.in',
        phone: '9876543213',
        dob: '2004-11-05',
        gender: 'Male',
        address: 'No. 15, Velachery Main Road, Chennai, Tamil Nadu 600042',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 68.0, // Critical under 75%
        guardian: {
          name: 'Rajan K.',
          relationship: 'Father',
          phone: '9841029387',
          email: 'rajan.k@example.com',
          address: 'No. 15, Velachery Main Road, Chennai, Tamil Nadu 600042'
        },
        isDemo: true
      },
      {
        id: 'STU-105',
        firstName: 'Ananya',
        lastName: 'Deshmukh',
        fullName: 'Ananya Deshmukh',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211005',
        admissionNumber: 'ADM-2023-0105',
        rollNumber: '192211005',
        email: 'ananya.d@saveetha.ac.in',
        phone: '9876543214',
        dob: '2004-01-19',
        gender: 'Female',
        address: 'No. 29, Adyar 1st Avenue, Chennai, Tamil Nadu 600020',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 91.5,
        guardian: {
          name: 'Pramod Deshmukh',
          relationship: 'Father',
          phone: '9841029388',
          email: 'pramod.d@example.com',
          address: 'No. 29, Adyar 1st Avenue, Chennai, Tamil Nadu 600020'
        },
        isDemo: true
      },
      {
        id: 'STU-106',
        firstName: 'Bhuvaneshwari',
        lastName: 'M.',
        fullName: 'Bhuvaneshwari M.',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211006',
        admissionNumber: 'ADM-2023-0106',
        rollNumber: '192211006',
        email: 'bhuvaneshwari.m@saveetha.ac.in',
        phone: '9876543215',
        dob: '2004-09-30',
        gender: 'Female',
        address: 'Flat 3C, Sholinganallur OMR, Chennai, Tamil Nadu 600119',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 84.2,
        guardian: {
          name: 'Murugan R.',
          relationship: 'Father',
          phone: '9841029389',
          email: 'murugan.r@example.com',
          address: 'Flat 3C, Sholinganallur OMR, Chennai, Tamil Nadu 600119'
        },
        isDemo: true
      },
      {
        id: 'STU-107',
        firstName: 'Charan',
        lastName: 'Teja',
        fullName: 'Charan Teja',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211007',
        admissionNumber: 'ADM-2023-0107',
        rollNumber: '192211007',
        email: 'charan.teja@saveetha.ac.in',
        phone: '9876543216',
        dob: '2004-07-12',
        gender: 'Male',
        address: 'No. 54, Nungambakkam High Road, Chennai, Tamil Nadu 600034',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 96.0,
        guardian: {
          name: 'Venkat Teja',
          relationship: 'Father',
          phone: '9841029390',
          email: 'venkat.teja@example.com',
          address: 'No. 54, Nungambakkam High Road, Chennai, Tamil Nadu 600034'
        },
        isDemo: true
      },
      {
        id: 'STU-108',
        firstName: 'Deepika',
        lastName: 'Raman',
        fullName: 'Deepika Raman',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
        registrationNumber: '192211008',
        admissionNumber: 'ADM-2023-0108',
        rollNumber: '192211008',
        email: 'deepika.raman@saveetha.ac.in',
        phone: '9876543217',
        dob: '2004-12-04',
        gender: 'Female',
        address: 'No. 88, Kilpauk Garden Colony, Chennai, Tamil Nadu 600010',
        classId: 'BE-CSE-3A',
        className: 'B.E. CSE - 3rd Year',
        section: 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 78.5,
        guardian: {
          name: 'Raman S.',
          relationship: 'Father',
          phone: '9841029391',
          email: 'raman.s@example.com',
          address: 'No. 88, Kilpauk Garden Colony, Chennai, Tamil Nadu 600010'
        },
        isDemo: true
      }
    ]
  },

  // ============================================================================
  // In-Memory / Local Storage Initialization
  // ============================================================================
  init() {
    ['students', 'teachers', 'classes', 'subjects', 'academicYears'].forEach(key => {
      const stored = localStorage.getItem(this.storageKeyPrefix + key);
      if (!stored) {
        localStorage.setItem(this.storageKeyPrefix + key, JSON.stringify(this.initialData[key]));
      }
    });
  },

  getData(entityKey) {
    const raw = localStorage.getItem(this.storageKeyPrefix + entityKey);
    if (!raw) return this.initialData[entityKey] || [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return this.initialData[entityKey] || [];
    }
  },

  setData(entityKey, data) {
    localStorage.setItem(this.storageKeyPrefix + entityKey, JSON.stringify(data));
  },

  // ============================================================================
  // 1. STUDENT REPOSITORY OPERATIONS
  // ============================================================================
  getStudents() {
    return this.getData('students');
  },

  getStudentById(id) {
    return this.getStudents().find(s => s.id === id || s.registrationNumber === id);
  },

  validateStudent(data, existingId = null) {
    const errors = [];
    const students = this.getStudents();

    if (!data.firstName || !data.firstName.trim()) errors.push('First name is required');
    if (!data.lastName || !data.lastName.trim()) errors.push('Last name is required');
    if (!data.registrationNumber || !data.registrationNumber.trim()) {
      errors.push('Registration number is mandatory');
    } else {
      // Unique Registration Number constraint
      const dupReg = students.find(s => s.registrationNumber.trim().toUpperCase() === data.registrationNumber.trim().toUpperCase() && s.id !== existingId);
      if (dupReg) errors.push(`Registration number "${data.registrationNumber}" is already assigned to ${dupReg.fullName}`);
    }

    if (data.rollNumber && data.rollNumber.trim()) {
      const dupRoll = students.find(s => s.rollNumber.trim().toUpperCase() === data.rollNumber.trim().toUpperCase() && s.id !== existingId);
      if (dupRoll) errors.push(`Roll number "${data.rollNumber}" is already in use by ${dupRoll.fullName}`);
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Enter a valid institutional email address');
    }

    if (data.phone && !/^\d{10,}$/.test(data.phone.replace(/[^0-9]/g, ''))) {
      errors.push('Phone number must have at least 10 digits');
    }

    return { isValid: errors.length === 0, errors };
  },

  addStudent(studentData) {
    const validation = this.validateStudent(studentData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const students = this.getStudents();
    const newId = `STU-${Date.now().toString().slice(-4)}`;
    const student = {
      ...studentData,
      id: newId,
      fullName: `${studentData.firstName.trim()} ${studentData.lastName.trim()}`,
      photo: studentData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      attendancePercentage: studentData.attendancePercentage || 85.0,
      isDemo: true
    };

    students.unshift(student);
    this.setData('students', students);
    return { success: true, data: student };
  },

  updateStudent(id, studentData) {
    const validation = this.validateStudent(studentData, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return { success: false, errors: ['Student record not found'] };

    students[index] = {
      ...students[index],
      ...studentData,
      fullName: `${studentData.firstName.trim()} ${studentData.lastName.trim()}`,
      isDemo: true
    };

    this.setData('students', students);
    return { success: true, data: students[index] };
  },

  deleteStudent(id) {
    const students = this.getStudents();
    const filtered = students.filter(s => s.id !== id);
    if (filtered.length === students.length) return { success: false, errors: ['Student not found'] };
    this.setData('students', filtered);
    return { success: true };
  },

  importStudents(csvRows) {
    let successCount = 0;
    const errors = [];
    const students = this.getStudents();

    csvRows.forEach((row, idx) => {
      const lineNum = idx + 2; // account for header
      if (!row.firstName || !row.registrationNumber) {
        errors.push(`Row ${lineNum}: Missing first name or registration number`);
        return;
      }

      // Check duplicates
      const exists = students.some(s => s.registrationNumber.toUpperCase() === row.registrationNumber.toUpperCase());
      if (exists) {
        errors.push(`Row ${lineNum}: Duplicate registration number "${row.registrationNumber}"`);
        return;
      }

      const newStudent = {
        id: `STU-${Date.now().toString().slice(-4)}${idx}`,
        firstName: row.firstName.trim(),
        lastName: (row.lastName || '').trim(),
        fullName: `${row.firstName.trim()} ${(row.lastName || '').trim()}`.trim(),
        registrationNumber: row.registrationNumber.trim(),
        admissionNumber: row.admissionNumber || `ADM-${row.registrationNumber}`,
        rollNumber: row.rollNumber || row.registrationNumber,
        email: row.email || `${row.registrationNumber.toLowerCase()}@saveetha.ac.in`,
        phone: row.phone || '9876543210',
        dob: row.dob || '2004-01-01',
        gender: row.gender || 'Male',
        address: row.address || 'Chennai, Tamil Nadu',
        classId: row.classId || 'BE-CSE-3A',
        className: row.className || 'B.E. CSE - 3rd Year',
        section: row.section || 'A',
        academicYear: '2025–2026',
        admissionDate: '2023-08-10',
        status: 'Active',
        attendancePercentage: 85.0,
        guardian: {
          name: row.guardianName || 'Guardian',
          relationship: row.relationship || 'Parent',
          phone: row.guardianPhone || '9841029384',
          email: row.guardianEmail || 'parent@example.com',
          address: row.address || 'Chennai, Tamil Nadu'
        },
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        isDemo: true
      };

      students.push(newStudent);
      successCount++;
    });

    if (successCount > 0) {
      this.setData('students', students);
    }

    return { successCount, errors };
  },

  // ============================================================================
  // 2. TEACHER REPOSITORY OPERATIONS
  // ============================================================================
  getTeachers() {
    return this.getData('teachers');
  },

  getTeacherById(id) {
    return this.getTeachers().find(t => t.id === id || t.employeeId === id);
  },

  validateTeacher(data, existingId = null) {
    const errors = [];
    const teachers = this.getTeachers();

    if (!data.firstName || !data.firstName.trim()) errors.push('First name is required');
    if (!data.employeeId || !data.employeeId.trim()) {
      errors.push('Employee ID is required');
    } else {
      const dupEmp = teachers.find(t => t.employeeId.trim().toUpperCase() === data.employeeId.trim().toUpperCase() && t.id !== existingId);
      if (dupEmp) errors.push(`Employee ID "${data.employeeId}" is already assigned to ${dupEmp.fullName}`);
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Enter a valid faculty email address');
    }

    return { isValid: errors.length === 0, errors };
  },

  addTeacher(teacherData) {
    const validation = this.validateTeacher(teacherData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const teachers = this.getTeachers();
    const newId = `TCH-${Date.now().toString().slice(-4)}`;
    const teacher = {
      ...teacherData,
      id: newId,
      fullName: `Prof. ${teacherData.firstName.trim()} ${teacherData.lastName.trim()}`,
      photo: teacherData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
      assignedClasses: teacherData.assignedClasses || [],
      assignedSubjects: teacherData.assignedSubjects || [],
      isDemo: true
    };

    teachers.unshift(teacher);
    this.setData('teachers', teachers);
    return { success: true, data: teacher };
  },

  updateTeacher(id, teacherData) {
    const validation = this.validateTeacher(teacherData, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === id);
    if (index === -1) return { success: false, errors: ['Faculty record not found'] };

    teachers[index] = {
      ...teachers[index],
      ...teacherData,
      fullName: `Prof. ${teacherData.firstName.trim()} ${teacherData.lastName.trim()}`,
      isDemo: true
    };

    this.setData('teachers', teachers);
    return { success: true, data: teachers[index] };
  },

  deleteTeacher(id) {
    const teachers = this.getTeachers();
    const filtered = teachers.filter(t => t.id !== id);
    if (filtered.length === teachers.length) return { success: false, errors: ['Teacher not found'] };
    this.setData('teachers', filtered);
    return { success: true };
  },

  // ============================================================================
  // 3. CLASS & SECTION REPOSITORY OPERATIONS
  // ============================================================================
  getClasses() {
    return this.getData('classes');
  },

  validateClass(data, existingId = null) {
    const errors = [];
    const classes = this.getClasses();

    if (!data.name || !data.name.trim()) errors.push('Class name is required');
    if (!data.section || !data.section.trim()) errors.push('Section is required');
    if (!data.academicYear || !data.academicYear.trim()) errors.push('Academic year is required');

    // Prevent duplicate class-section combination within the same academic year
    const dup = classes.find(c =>
      c.name.trim().toUpperCase() === data.name.trim().toUpperCase() &&
      c.section.trim().toUpperCase() === data.section.trim().toUpperCase() &&
      c.academicYear.trim() === data.academicYear.trim() &&
      c.id !== existingId
    );

    if (dup) {
      errors.push(`Class "${data.name}" Section "${data.section}" already exists in Academic Year ${data.academicYear}`);
    }

    return { isValid: errors.length === 0, errors };
  },

  addClass(classData) {
    const validation = this.validateClass(classData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const classes = this.getClasses();
    const newId = `CLS-${Date.now().toString().slice(-4)}`;
    const newClass = {
      ...classData,
      id: newId,
      studentCount: classData.studentCount || 0,
      isDemo: true
    };

    classes.unshift(newClass);
    this.setData('classes', classes);
    return { success: true, data: newClass };
  },

  updateClass(id, classData) {
    const validation = this.validateClass(classData, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === id);
    if (index === -1) return { success: false, errors: ['Class not found'] };

    classes[index] = {
      ...classes[index],
      ...classData,
      isDemo: true
    };

    this.setData('classes', classes);
    return { success: true, data: classes[index] };
  },

  deleteClass(id) {
    const classes = this.getClasses();
    const filtered = classes.filter(c => c.id !== id);
    if (filtered.length === classes.length) return { success: false, errors: ['Class not found'] };
    this.setData('classes', filtered);
    return { success: true };
  },

  // ============================================================================
  // 4. SUBJECT REPOSITORY OPERATIONS
  // ============================================================================
  getSubjects() {
    return this.getData('subjects');
  },

  validateSubject(data, existingId = null) {
    const errors = [];
    const subjects = this.getSubjects();

    if (!data.name || !data.name.trim()) errors.push('Subject name is required');
    if (!data.code || !data.code.trim()) {
      errors.push('Subject code is mandatory');
    } else {
      const dup = subjects.find(s => s.code.trim().toUpperCase() === data.code.trim().toUpperCase() && s.id !== existingId);
      if (dup) errors.push(`Subject code "${data.code}" already exists for "${dup.name}"`);
    }

    return { isValid: errors.length === 0, errors };
  },

  addSubject(subjectData) {
    const validation = this.validateSubject(subjectData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const subjects = this.getSubjects();
    const newId = `SUB-${Date.now().toString().slice(-4)}`;
    const newSub = {
      ...subjectData,
      id: newId,
      code: subjectData.code.trim().toUpperCase(),
      weeklyPeriods: parseInt(subjectData.weeklyPeriods, 10) || 4,
      isDemo: true
    };

    subjects.unshift(newSub);
    this.setData('subjects', subjects);
    return { success: true, data: newSub };
  },

  updateSubject(id, subjectData) {
    const validation = this.validateSubject(subjectData, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) return { success: false, errors: ['Subject not found'] };

    subjects[index] = {
      ...subjects[index],
      ...subjectData,
      code: subjectData.code.trim().toUpperCase(),
      weeklyPeriods: parseInt(subjectData.weeklyPeriods, 10) || 4,
      isDemo: true
    };

    this.setData('subjects', subjects);
    return { success: true, data: subjects[index] };
  },

  deleteSubject(id) {
    const subjects = this.getSubjects();
    const filtered = subjects.filter(s => s.id !== id);
    if (filtered.length === subjects.length) return { success: false, errors: ['Subject not found'] };
    this.setData('subjects', filtered);
    return { success: true };
  },

  // ============================================================================
  // 5. ACADEMIC YEAR REPOSITORY OPERATIONS
  // ============================================================================
  getAcademicYears() {
    return this.getData('academicYears');
  },

  validateAcademicYear(data, existingId = null) {
    const errors = [];
    const years = this.getAcademicYears();

    if (!data.name || !data.name.trim()) errors.push('Academic year name is required');
    if (!data.startDate) errors.push('Start date is required');
    if (!data.endDate) errors.push('End date is required');

    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      errors.push('Academic year End Date must be later than Start Date');
    }

    // Check duplicate name
    const dup = years.find(y => y.name.trim() === data.name.trim() && y.id !== existingId);
    if (dup) errors.push(`Academic Year "${data.name}" already exists`);

    return { isValid: errors.length === 0, errors };
  },

  addAcademicYear(ayData) {
    const validation = this.validateAcademicYear(ayData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const years = this.getAcademicYears();
    const newId = `AY-${Date.now().toString().slice(-4)}`;
    
    // If set to ACTIVE, set all others to non-active
    if (ayData.status === 'ACTIVE') {
      years.forEach(y => {
        if (y.status === 'ACTIVE') y.status = 'COMPLETED';
      });
    }

    const newYear = {
      ...ayData,
      id: newId,
      isDemo: true
    };

    years.unshift(newYear);
    this.setData('academicYears', years);
    return { success: true, data: newYear };
  },

  updateAcademicYear(id, ayData) {
    const validation = this.validateAcademicYear(ayData, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const years = this.getAcademicYears();
    const index = years.findIndex(y => y.id === id);
    if (index === -1) return { success: false, errors: ['Academic Year not found'] };

    if (ayData.status === 'ACTIVE') {
      years.forEach(y => {
        if (y.id !== id && y.status === 'ACTIVE') y.status = 'COMPLETED';
      });
    }

    years[index] = {
      ...years[index],
      ...ayData,
      isDemo: true
    };

    this.setData('academicYears', years);
    return { success: true, data: years[index] };
  },

  setActiveAcademicYear(id) {
    const years = this.getAcademicYears();
    const target = years.find(y => y.id === id);
    if (!target) return { success: false, errors: ['Academic Year not found'] };

    years.forEach(y => {
      if (y.id === id) {
        y.status = 'ACTIVE';
      } else if (y.status === 'ACTIVE') {
        y.status = 'COMPLETED';
      }
    });

    this.setData('academicYears', years);
    return { success: true, data: target };
  }
};

// Initialize persistent development storage
AcademicDataService.init();
window.AcademicDataService = AcademicDataService;
