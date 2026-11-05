/**
 * MaccaAttendX - Centralized API Client & HTTP Interceptor
 * Strictly enforces Bearer token authentication, timeout control,
 * uniform error handling, and direct mapping to Spring Boot REST endpoints.
 */

const Api = {
  // Centralized API Base URL configuration (VITE_API_BASE_URL or auto-detected)
  getBaseUrl() {
    if (window.__ATTENDX_CONFIG__ && window.__ATTENDX_CONFIG__.API_BASE_URL) {
      return window.__ATTENDX_CONFIG__.API_BASE_URL;
    }
    // If running on backend origin (e.g. port 8080 or Render unified container)
    if (window.location.port === '8080' || window.location.pathname.startsWith('/api')) {
      return '/api/v1';
    }
    // Default development Spring Boot server
    return 'http://localhost:8080/api/v1';
  },

  async request(endpoint, options = {}) {
    const baseUrl = this.getBaseUrl();
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    // Attach Bearer token if available
    const token = window.Auth ? window.Auth.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Abort timeout (12s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 12000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Handle binary download responses (e.g. Excel)
      if (options.responseType === 'blob') {
        if (!response.ok) {
          throw new Error(`Download failed with status ${response.status}`);
        }
        return await response.blob();
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = (json && json.message) || (json && json.error) || `HTTP Error ${response.status}`;
        
        // Handle specific HTTP Status Codes
        if (response.status === 401) {
          console.warn('[Api] 401 Unauthorized encountered. Session may be expired.');
          if (window.Auth && typeof window.Auth.handleUnauthorized === 'function') {
            window.Auth.handleUnauthorized();
          }
        } else if (response.status === 403) {
          console.warn('[Api] 403 Forbidden: Access denied for current role.');
        } else if (response.status === 409) {
          console.warn('[Api] 409 Conflict: Duplicate schedule or record detected.');
        }

        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = json;
        throw err;
      }

      return json;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('API Request timed out after 12 seconds. Please check backend connectivity.');
      }
      throw error;
    }
  },

  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION & USER PROFILE
  // --------------------------------------------------------------------------
  auth: {
    async me() {
      const res = await Api.request('/auth/me');
      return res && res.data ? res.data : null;
    },
    async mockToken(role = 'ADMIN') {
      const res = await Api.request('/auth/mock-token', {
        method: 'POST',
        body: JSON.stringify({ role: role.toUpperCase() })
      });
      return res && res.data ? res.data : null;
    }
  },

  // --------------------------------------------------------------------------
  // 2. DASHBOARD DATA
  // --------------------------------------------------------------------------
  dashboard: {
    async get(role) {
      const res = await Api.request(`/dashboard/${role.toLowerCase()}`);
      return res && res.data ? res.data : null;
    }
  },

  // Legacy facade for backwards compatibility with Milestone 1 code
  async getDashboardData(role) {
    try {
      const data = await this.dashboard.get(role);
      if (data) return data;
    } catch (e) {
      console.warn('[Api.getDashboardData] Backend unreachable, using fallback UI structure:', e.message);
    }
    return MockData.getDashboard(role);
  },

  // --------------------------------------------------------------------------
  // 3. STUDENT MANAGEMENT
  // --------------------------------------------------------------------------
  students: {
    async list(params = {}) {
      const q = new URLSearchParams();
      if (params.page !== undefined) q.append('page', params.page);
      if (params.size !== undefined) q.append('size', params.size);
      if (params.query) q.append('query', params.query);
      if (params.classId && params.classId !== 'ALL') q.append('classId', params.classId);
      if (params.section && params.section !== 'ALL') q.append('section', params.section);
      if (params.gender && params.gender !== 'ALL') q.append('gender', params.gender);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);

      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await Api.request(`/students${qs}`);
      return res && res.data ? res.data : null;
    },

    async get(id) {
      const res = await Api.request(`/students/${id}`);
      return res && res.data ? res.data : null;
    },

    async create(studentData) {
      const res = await Api.request('/students', {
        method: 'POST',
        body: JSON.stringify(studentData)
      });
      return res && res.data ? res.data : null;
    },

    async update(id, studentData) {
      const res = await Api.request(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData)
      });
      return res && res.data ? res.data : null;
    },

    async delete(id) {
      const res = await Api.request(`/students/${id}`, {
        method: 'DELETE'
      });
      return res && res.data ? res.data : null;
    }
  },

  // --------------------------------------------------------------------------
  // 4. TEACHERS & FACULTY
  // --------------------------------------------------------------------------
  teachers: {
    async list() {
      const res = await Api.request('/teachers');
      return res && res.data ? res.data : [];
    },

    async get(id) {
      const res = await Api.request(`/teachers/${id}`);
      return res && res.data ? res.data : null;
    }
  },

  // --------------------------------------------------------------------------
  // 5. ACADEMIC HIERARCHY
  // --------------------------------------------------------------------------
  academics: {
    async years() {
      const res = await Api.request('/academics/years');
      return res && res.data ? res.data : [];
    },

    async classes() {
      const res = await Api.request('/academics/classes');
      return res && res.data ? res.data : [];
    },

    async subjects() {
      const res = await Api.request('/academics/subjects');
      return res && res.data ? res.data : [];
    }
  },

  // --------------------------------------------------------------------------
  // 6. ATTENDANCE MANAGEMENT
  // --------------------------------------------------------------------------
  attendance: {
    async getRoster(classId, section = 'A') {
      const res = await Api.request(`/attendance/roster?classId=${encodeURIComponent(classId)}&section=${encodeURIComponent(section)}`);
      return res && res.data ? res.data : [];
    },

    async submitSession(payload) {
      const res = await Api.request('/attendance/sessions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res && res.data ? res.data : null;
    },

    async getSession(id) {
      const res = await Api.request(`/attendance/sessions/${id}`);
      return res && res.data ? res.data : null;
    },

    async getHistory(filters = {}) {
      const q = new URLSearchParams();
      if (filters.classId && filters.classId !== 'ALL') q.append('classId', filters.classId);
      if (filters.section && filters.section !== 'ALL') q.append('section', filters.section);
      if (filters.subjectCode && filters.subjectCode !== 'ALL') q.append('subjectCode', filters.subjectCode);
      if (filters.startDate) q.append('startDate', filters.startDate);
      if (filters.endDate) q.append('endDate', filters.endDate);

      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await Api.request(`/attendance/history${qs}`);
      return res && res.data ? res.data : [];
    },

    async correctRecord(recordId, payload) {
      const res = await Api.request(`/attendance/records/${recordId}/correct`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res && res.data ? res.data : null;
    },

    async getCorrections(recordId) {
      const res = await Api.request(`/attendance/records/${recordId}/corrections`);
      return res && res.data ? res.data : [];
    },

    async getMyAttendance() {
      const res = await Api.request('/attendance/my-attendance');
      return res && res.data ? res.data : null;
    },

    async getParentChildrenAttendance() {
      const res = await Api.request('/attendance/parent/children');
      return res && res.data ? res.data : [];
    }
  },

  // --------------------------------------------------------------------------
  // 7. REPORTS & ANALYTICS
  // --------------------------------------------------------------------------
  reports: {
    async getOverall(filters = {}) {
      const q = new URLSearchParams();
      if (filters.classId && filters.classId !== 'ALL') q.append('classId', filters.classId);
      if (filters.section && filters.section !== 'ALL') q.append('section', filters.section);
      if (filters.subjectCode && filters.subjectCode !== 'ALL') q.append('subjectCode', filters.subjectCode);
      if (filters.startDate) q.append('startDate', filters.startDate);
      if (filters.endDate) q.append('endDate', filters.endDate);

      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await Api.request(`/reports/overall${qs}`);
      return res && res.data ? res.data : null;
    },

    async getLowAttendance(threshold = 75.0) {
      const res = await Api.request(`/reports/low-attendance?threshold=${threshold}`);
      return res && res.data ? res.data : [];
    },

    async getStudentReport(regNo) {
      const res = await Api.request(`/reports/student/${encodeURIComponent(regNo)}`);
      return res && res.data ? res.data : null;
    },

    getExcelExportUrl(reportType = 'low-attendance', threshold = 75.0) {
      const baseUrl = Api.getBaseUrl();
      const token = window.Auth ? window.Auth.getToken() : '';
      return `${baseUrl}/reports/export/excel?reportType=${encodeURIComponent(reportType)}&threshold=${threshold}&token=${encodeURIComponent(token)}`;
    },

    async downloadExcel(reportType = 'low-attendance', threshold = 75.0) {
      const blob = await Api.request(`/reports/export/excel?reportType=${encodeURIComponent(reportType)}&threshold=${threshold}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AttendX_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  },

  // --------------------------------------------------------------------------
  // 8. SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    async getThreshold() {
      const res = await Api.request('/settings/threshold');
      return res && res.data ? parseFloat(res.data) : 75.0;
    },

    async updateThreshold(threshold) {
      const res = await Api.request('/settings/threshold', {
        method: 'PUT',
        body: JSON.stringify({ threshold: parseFloat(threshold) })
      });
      return res && res.data ? parseFloat(res.data) : 75.0;
    }
  }
};

// Rich Academic Mock Data for V-Study LMS Experience Fallback
const MockData = {
  attendanceSummary: {
    total_sessions: 120,
    present_sessions: 104,
    absent_sessions: 8,
    late_sessions: 4,
    leave_sessions: 4,
    attendance_percentage: 86.67,
    is_eligible: true,
    minimum_percentage: 75.0,
    shortfall_sessions: 0
  },

  leaveRequests: [
    {
      id: "leave-01",
      studentName: "Arun Kumar S",
      rollNo: "192111001",
      leaveType: "Symposium / Hackathon (OD)",
      startDate: "2026-11-10",
      endDate: "2026-11-12",
      reason: "Representing Saveetha SSE in Grand Finale of Smart India Hackathon.",
      status: "APPROVED",
      reviewerRemarks: "Verified event registration letter. Approved OD."
    },
    {
      id: "leave-02",
      studentName: "Kavitha R",
      rollNo: "192111024",
      leaveType: "Medical",
      startDate: "2026-11-04",
      endDate: "2026-11-05",
      reason: "Viral fever - doctor prescription attached.",
      status: "PENDING",
      reviewerRemarks: null
    }
  ],

  getDashboard(role) {
    if (role === 'ADMIN') {
      return {
        stats: {
          totalStudents: 5,
          totalTeachers: 2,
          totalClasses: 3,
          totalSubjects: 5,
          todayPresent: 4,
          todayAbsent: 1,
          lateStudents: 0,
          attendancePct: 80.0
        },
        classComparisons: [
          { name: "B.E. Computer Science & Engineering - III Year A", pct: 80.0 },
          { name: "B.E. Computer Science & Engineering - III Year B", pct: 88.5 },
          { name: "B.E. Electronics & Communication - II Year A", pct: 88.5 }
        ],
        lowAttendanceWatchlist: [
          { name: "Abhinav Patel", regNo: "192211002", class: "BE-CSE-3A (A)", pct: 60.0, status: "Critical Shortfall" }
        ]
      };
    } else if (role === 'TEACHER') {
      return {
        stats: {
          myClasses: 2,
          mySubjects: 2,
          totalStudents: 5,
          todayClasses: 2,
          markedCount: 1,
          pendingCount: 1,
          avgAttendance: 88.4
        },
        todaySchedule: [
          { period: "Period 1 (08:30 - 09:20)", subject: "CS301 - Design and Analysis of Algorithms", class: "BE-CSE-3A (A)", room: "LH-301", status: "COMPLETED" },
          { period: "Period 2 (09:20 - 10:10)", subject: "CS302 - Database Management Systems", class: "BE-CSE-3A (A)", room: "LH-301", status: "PENDING" }
        ]
      };
    } else if (role === 'STUDENT') {
      return {
        stats: {
          overallPct: 80.0,
          presentPeriods: 4,
          absentPeriods: 1,
          latePeriods: 0,
          leavePeriods: 0,
          targetMargin: "+2 safe sessions"
        },
        subjects: [
          { code: "CS301", name: "Design and Analysis of Algorithms", faculty: "Dr. K. Senthil Kumar", present: 1, total: 1, percentage: 100.0 },
          { code: "CS302", name: "Database Management Systems", faculty: "Dr. Meenakshi Sundaram", present: 0, total: 1, percentage: 0.0 }
        ]
      };
    } else {
      return {
        stats: {
          linkedChildren: 1,
          todayAttendance: "All Present (1/1)",
          overallPct: "Aarav: 100.0%"
        },
        children: [
          { studentId: "stu-001", registrationNumber: "192211001", fullName: "Aarav Sharma", className: "BE-CSE-3A", section: "A", attendancePercentage: 100.0, alert: false }
        ]
      };
    }
  }
};

window.Api = Api;
window.MockData = MockData;
