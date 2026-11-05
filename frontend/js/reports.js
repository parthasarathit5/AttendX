/**
 * MaccaAttendX - Attendance Reports & Analytics Module (Milestone 4)
 * Comprehensive institutional analytics, multi-category reporting,
 * interactive HTML5 canvas charts, configurable regulatory threshold monitoring (<75%),
 * role-scoped reporting (Admin, Teacher, Student, Parent), and native SheetJS (.xlsx) export.
 *
 * Aligned with Saveetha V-Study LMS & SIMATS Academic Regulations.
 */

const ReportsModule = {
  state: {
    activeCategory: 'overall', // 'overall', 'low-attendance', 'student', 'class', 'section', 'subject', 'teacher', 'trends'
    filter: {
      academicYear: '2025-2026',
      classId: 'ALL',
      section: 'ALL',
      subjectCode: 'ALL',
      teacherId: 'ALL',
      startDate: '',
      endDate: '',
      searchQuery: '',
      threshold: 75.0,
      selectedStudentRegNo: '192211001'
    }
  },

  // Initialize threshold from ReportsService
  initThreshold() {
    if (window.ReportsService) {
      this.state.filter.threshold = ReportsService.getThreshold();
    }
  },

  // Role verification helper
  getUserRole() {
    return window.Auth ? Auth.getUser().role : 'ADMIN';
  },

  getCurrentUser() {
    return window.Auth ? Auth.getUser() : { role: 'ADMIN', name: 'Dr. C. Ramesh', id: 'FAC-CSE-001' };
  },

  // Main Entry Point
  render(container) {
    if (!container) {
      container = document.getElementById('mainWorkspaceContainer');
    }
    if (!container) return;

    this.initThreshold();

    // Adjust active tab for student / parent roles
    const role = this.getUserRole();
    if ((role === 'STUDENT' || role === 'PARENT') && this.state.activeCategory === 'overall') {
      this.state.activeCategory = 'student';
    }

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Reports &amp; Academic Analytics</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; SIMATS Regulatory Shortfall Audit &amp; Hall Ticket Eligibility
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.printReport()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print / PDF
          </button>
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.exportCSV()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="ReportsModule.exportExcel()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      <!-- Report Category Navigation Tabs -->
      <div class="nav-tabs" style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.75rem; margin-bottom: 1.25rem; border-bottom: 2px solid var(--border-light);">
        ${this.renderCategoryTabs()}
      </div>

      <!-- Filter Controls Toolbar -->
      ${this.renderFilterToolbar()}

      <!-- Active Report Body -->
      <div id="reportBodyContainer">
        ${this.renderActiveCategoryContent()}
      </div>
    `;

    // Render Canvas Charts after DOM insertion
    this.renderActiveCharts();
  },

  // Category Tabs Builder
  renderCategoryTabs() {
    const role = this.getUserRole();
    const tabs = [];

    if (role === 'ADMIN' || role === 'TEACHER') {
      tabs.push({ id: 'overall', label: 'Overall Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' });
      tabs.push({ id: 'low-attendance', label: 'Low-Attendance (< 75%)', badge: 'Alert', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' });
    }

    tabs.push({ id: 'student', label: 'Student Report', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' });

    if (role === 'ADMIN' || role === 'TEACHER') {
      tabs.push({ id: 'class', label: 'Class-wise Report', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' });
      tabs.push({ id: 'section', label: 'Section-wise Report', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' });
      tabs.push({ id: 'subject', label: 'Subject-wise Report', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' });
    }

    if (role === 'ADMIN') {
      tabs.push({ id: 'teacher', label: 'Teacher-wise Report', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' });
    }

    if (role === 'ADMIN' || role === 'TEACHER') {
      tabs.push({ id: 'trends', label: 'Daily & Monthly Trends', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' });
    }

    return tabs.map(tab => {
      const isActive = this.state.activeCategory === tab.id;
      return `
        <button class="nav-tab ${isActive ? 'active' : ''}" 
                onclick="ReportsModule.switchCategory('${tab.id}')"
                style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.6rem 1rem; font-size: 0.82rem; font-weight: 600; border-radius: var(--radius-sm); border: none; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; ${isActive ? 'background: var(--primary-blue); color: #fff;' : 'background: #fff; color: var(--text-muted); border: 1px solid var(--border-light);'}">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${tab.icon}"/></svg>
          ${tab.label}
          ${tab.badge ? `<span style="background: #EF4444; color: #fff; font-size: 0.68rem; padding: 0.1rem 0.4rem; border-radius: 9999px; margin-left: 0.25rem;">${tab.badge}</span>` : ''}
        </button>
      `;
    }).join('');
  },

  // Filter Toolbar Component
  renderFilterToolbar() {
    const role = this.getUserRole();
    const currentUser = this.getCurrentUser();

    // Data lists for select options
    const classes = window.AcademicDataService ? AcademicDataService.getClasses() : [];
    const subjects = window.AcademicDataService ? AcademicDataService.getSubjects() : [];
    const teachers = window.AcademicDataService ? AcademicDataService.getTeachers() : [];

    // Filter classes and subjects if Teacher role
    const teacherClasses = role === 'TEACHER'
      ? classes.filter(c => (currentUser.assignedClasses || ['BE-CSE-3A', 'BE-CSE-3B']).includes(c.id))
      : classes;

    const teacherSubjects = role === 'TEACHER'
      ? subjects.filter(s => (currentUser.assignedSubjects || ['CS301', 'CS305']).includes(s.code))
      : subjects;

    return `
      <div class="dashboard-card" style="margin-bottom: 1.5rem; background: #FFFFFF; border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--brand-navy); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            Audit Filter Parameters
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">Regulatory Threshold:</label>
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <input type="number" id="repThresholdInput" value="${this.state.filter.threshold}" min="1" max="100" step="0.5" 
                     style="width: 70px; padding: 0.3rem 0.5rem; font-size: 0.8rem; font-weight: 700; border: 1.5px solid var(--primary-blue); border-radius: 4px; text-align: center; color: var(--brand-navy);" />
              <span style="font-weight: 700; font-size: 0.82rem; color: var(--brand-navy);">%</span>
              <button class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="ReportsModule.updateThreshold()">Update</button>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.85rem; align-items: flex-end;">
          <!-- Academic Year -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.74rem;">Academic Year</label>
            <select class="form-select" id="repAcademicYear" style="padding: 0.45rem; font-size: 0.8rem;">
              <option value="2025-2026" ${this.state.filter.academicYear === '2025-2026' ? 'selected' : ''}>2025–2026 (Even Sem)</option>
              <option value="2024-2025" ${this.state.filter.academicYear === '2024-2025' ? 'selected' : ''}>2024–2025</option>
              <option value="ALL" ${this.state.filter.academicYear === 'ALL' ? 'selected' : ''}>All Academic Years</option>
            </select>
          </div>

          <!-- Class -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.74rem;">Class</label>
            <select class="form-select" id="repClass" style="padding: 0.45rem; font-size: 0.8rem;">
              <option value="ALL" ${this.state.filter.classId === 'ALL' ? 'selected' : ''}>All Classes</option>
              ${teacherClasses.map(c => `<option value="${c.id}" ${this.state.filter.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

          <!-- Section -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.74rem;">Section</label>
            <select class="form-select" id="repSection" style="padding: 0.45rem; font-size: 0.8rem;">
              <option value="ALL" ${this.state.filter.section === 'ALL' ? 'selected' : ''}>All Sections</option>
              <option value="A" ${this.state.filter.section === 'A' ? 'selected' : ''}>Section A</option>
              <option value="B" ${this.state.filter.section === 'B' ? 'selected' : ''}>Section B</option>
            </select>
          </div>

          <!-- Subject -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.74rem;">Subject</label>
            <select class="form-select" id="repSubject" style="padding: 0.45rem; font-size: 0.8rem;">
              <option value="ALL" ${this.state.filter.subjectCode === 'ALL' ? 'selected' : ''}>All Subjects</option>
              ${teacherSubjects.map(s => `<option value="${s.code}" ${this.state.filter.subjectCode === s.code ? 'selected' : ''}>${s.code} - ${s.name}</option>`).join('')}
            </select>
          </div>

          <!-- Teacher (Admin Only) -->
          ${role === 'ADMIN' ? `
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 0.74rem;">Teacher In-Charge</label>
              <select class="form-select" id="repTeacher" style="padding: 0.45rem; font-size: 0.8rem;">
                <option value="ALL" ${this.state.filter.teacherId === 'ALL' ? 'selected' : ''}>All Faculty</option>
                ${teachers.map(t => `<option value="${t.id}" ${this.state.filter.teacherId === t.id ? 'selected' : ''}>${t.fullName} (${t.employeeId})</option>`).join('')}
              </select>
            </div>
          ` : ''}

          <!-- Date Range (Start Date) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.74rem;">From Date</label>
            <input type="date" class="form-input" id="repStartDate" value="${this.state.filter.startDate}" style="padding: 0.4rem; font-size: 0.8rem;" />
          </div>

          <!-- Date Range (End Date) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.74rem;">To Date</label>
            <input type="date" class="form-input" id="repEndDate" value="${this.state.filter.endDate}" style="padding: 0.4rem; font-size: 0.8rem;" />
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm" style="flex: 1; padding: 0.48rem 0.75rem;" onclick="ReportsModule.applyFilters()">
              Apply Filters
            </button>
            <button class="btn btn-secondary btn-sm" style="padding: 0.48rem 0.65rem;" onclick="ReportsModule.resetFilters()">
              Reset
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Category Switcher
  switchCategory(categoryId) {
    this.state.activeCategory = categoryId;
    this.render();
  },

  // Update Threshold
  updateThreshold() {
    const input = document.getElementById('repThresholdInput');
    if (!input) return;
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 1 || val > 100) {
      if (window.App) App.toast('Please enter a valid percentage between 1 and 100', 'warning');
      return;
    }

    if (window.ReportsService) {
      ReportsService.setThreshold(val);
    }
    this.state.filter.threshold = val;
    if (window.App) App.toast(`Institutional Attendance Threshold set to ${val}%`, 'success');
    this.render();
  },

  // Apply Filters
  applyFilters() {
    this.state.filter.academicYear = document.getElementById('repAcademicYear')?.value || '2025-2026';
    this.state.filter.classId = document.getElementById('repClass')?.value || 'ALL';
    this.state.filter.section = document.getElementById('repSection')?.value || 'ALL';
    this.state.filter.subjectCode = document.getElementById('repSubject')?.value || 'ALL';
    if (document.getElementById('repTeacher')) {
      this.state.filter.teacherId = document.getElementById('repTeacher').value;
    }
    this.state.filter.startDate = document.getElementById('repStartDate')?.value || '';
    this.state.filter.endDate = document.getElementById('repEndDate')?.value || '';

    if (window.App) App.toast('Audit filters applied successfully', 'success');
    this.render();
  },

  // Reset Filters
  resetFilters() {
    this.state.filter = {
      academicYear: '2025-2026',
      classId: 'ALL',
      section: 'ALL',
      subjectCode: 'ALL',
      teacherId: 'ALL',
      startDate: '',
      endDate: '',
      searchQuery: '',
      threshold: 75.0,
      selectedStudentRegNo: '192211001'
    };
    if (window.ReportsService) {
      ReportsService.setThreshold(75.0);
    }
    if (window.App) App.toast('Audit filters reset to system defaults', 'info');
    this.render();
  },

  // Dispatch Content Rendering
  renderActiveCategoryContent() {
    switch (this.state.activeCategory) {
      case 'overall':
        return this.renderOverallCategory();
      case 'low-attendance':
        return this.renderLowAttendanceCategory();
      case 'student':
        return this.renderStudentCategory();
      case 'class':
        return this.renderClassCategory();
      case 'section':
        return this.renderSectionCategory();
      case 'subject':
        return this.renderSubjectCategory();
      case 'teacher':
        return this.renderTeacherCategory();
      case 'trends':
        return this.renderTrendsCategory();
      default:
        return this.renderOverallCategory();
    }
  },

  // ============================================================================
  // 1. OVERALL ANALYTICS DASHBOARD
  // ============================================================================
  renderOverallCategory() {
    const data = window.ReportsService
      ? ReportsService.getOverallAnalytics(this.state.filter)
      : {
          totalStudents: 120,
          totalSessions: 18,
          presentRecords: 1320,
          absentRecords: 180,
          overallPercentage: 88.0,
          threshold: 75.0,
          studentsBelowThresholdCount: 5,
          lowAttendanceList: [],
          classBreakdown: []
        };

    const threshold = this.state.filter.threshold || 75.0;
    const debarredCount = (data.lowAttendanceList || []).filter(s => s.isCritical).length;

    return `
      <!-- 5-Card KPI Grid -->
      <div class="stat-grid-4" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Overall Attendance</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: ${data.overallPercentage >= threshold ? 'var(--color-present)' : 'var(--color-absent)'};">
            ${data.overallPercentage}%
          </div>
          <div class="stat-card-footer">
            <span class="trend-badge trend-up">Target: ${threshold}%</span>
            <span>Institution-wide Rate</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Conducted Sessions</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${data.totalSessions}</div>
          <div class="stat-card-footer">
            <span>Locked &amp; Audit-Verified</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Present vs. Absent Logs</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="font-size: 1.4rem;">
            <span style="color: var(--color-present);">${data.presentRecords} P</span> / <span style="color: var(--color-absent);">${data.absentRecords} A</span>
          </div>
          <div class="stat-card-footer">
            <span>${data.presentRecords + data.absentRecords} Total Headcounts</span>
          </div>
        </div>

        <div class="stat-card" style="border-left: 4px solid #EF4444;">
          <div class="stat-card-top">
            <span class="stat-card-title">Below Threshold (&lt; ${threshold}%)</span>
            <div class="stat-icon-bubble" style="background: #FEE2E2; color: #DC2626;">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: #DC2626;">${data.studentsBelowThresholdCount}</div>
          <div class="stat-card-footer">
            <span style="color: #B91C1C; font-weight: 700;">Exam Fee Lockout Risk</span>
          </div>
        </div>

        <div class="stat-card" style="border-left: 4px solid #7F1D1D;">
          <div class="stat-card-top">
            <span class="stat-card-title">Debarred Risk (&lt; 65%)</span>
            <div class="stat-icon-bubble" style="background: #FEF2F2; color: #991B1B;">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: #991B1B;">${debarredCount}</div>
          <div class="stat-card-footer">
            <span style="color: #991B1B; font-weight: 700;">Immediate Remediation</span>
          </div>
        </div>
      </div>

      <!-- Charts Row 1: Daily Trends Spline & Present/Absent Donut -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Daily Attendance Progression Trend</h3>
              <p class="card-subtitle">Aggregated attendance percentages across recorded lecture dates</p>
            </div>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="chartDailyTrend"></canvas>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Present vs. Absent Ratio</h3>
              <p class="card-subtitle">Institution aggregate proportion</p>
            </div>
          </div>
          <div style="height: 260px; position: relative; display: flex; align-items: center; justify-content: center;">
            <canvas id="chartPresentAbsentDonut"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2: Class-wise Comparison & Subject-wise Distribution -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Class-wise Attendance Comparison</h3>
              <p class="card-subtitle">Performance across departments with 75% benchmark indicator</p>
            </div>
          </div>
          <div style="height: 240px; position: relative;">
            <canvas id="chartClassComparison"></canvas>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Subject-wise Attendance Distribution</h3>
              <p class="card-subtitle">Average student turnout across major engineering courses</p>
            </div>
          </div>
          <div style="height: 240px; position: relative;">
            <canvas id="chartSubjectDistribution"></canvas>
          </div>
        </div>
      </div>

      <!-- Class Performance Breakdown Table -->
      <div class="dashboard-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Academic Class Attendance Breakdown</h3>
            <p class="card-subtitle">Summary metrics computed from finalized lecture sessions</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.exportExcel('class-breakdown')">
            Export Class Sheet (.xlsx)
          </button>
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Section</th>
                <th>Conducted Sessions</th>
                <th>Present Records</th>
                <th>Absent Records</th>
                <th>Attendance %</th>
                <th>Regulatory Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${(data.classBreakdown || []).map(c => `
                <tr>
                  <td style="font-weight: 700; color: var(--brand-navy);">${c.className}</td>
                  <td><span class="status-pill info">Section ${c.section}</span></td>
                  <td>${c.totalSessions}</td>
                  <td style="color: var(--color-present); font-weight: 600;">${c.presentCount}</td>
                  <td style="color: var(--color-absent); font-weight: 600;">${c.absentCount}</td>
                  <td>
                    <span style="font-weight: 700; color: ${c.percentage >= threshold ? 'var(--color-present)' : 'var(--color-absent)'};">
                      ${c.percentage}%
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${c.percentage >= threshold ? 'present' : 'absent'}">
                      ${c.percentage >= threshold ? 'COMPLIANT' : 'SHORTFALL'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-text" style="font-size: 0.76rem;" onclick="ReportsModule.viewClassReport('${c.classId}', '${c.section}')">
                      View Roster →
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 2. LOW-ATTENDANCE MONITORING (< 75%)
  // ============================================================================
  renderLowAttendanceCategory() {
    const threshold = this.state.filter.threshold || 75.0;
    const students = window.ReportsService
      ? ReportsService.getLowAttendanceStudents(threshold, this.state.filter)
      : [];

    const criticalCount = students.filter(s => s.isCritical).length;

    return `
      <!-- Regulatory Directive Banner -->
      <div style="background: linear-gradient(135deg, #FEF2F2, #FEE2E2); border: 1.5px solid #F87171; border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #991B1B; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            SIMATS REGULATORY COMPLIANCE DIRECTIVE: &lt; ${threshold}% SHORTFALL
          </div>
          <p style="font-size: 0.82rem; color: #7F1D1D; margin: 0; line-height: 1.45;">
            In accordance with university statutory guidelines, students with attendance below <strong>${threshold}%</strong> are subject to <strong>Exam Fee Payment Lockout</strong> and cannot be issued Semester Examination Hall Tickets. Students below <strong>65.0%</strong> face statutory <strong>Debarment</strong> and must re-register for the course cycle.
          </p>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 1.8rem; font-weight: 800; color: #991B1B; line-height: 1;">${students.length}</div>
          <div style="font-size: 0.74rem; font-weight: 700; color: #B91C1C; text-transform: uppercase;">Students in Shortfall</div>
        </div>
      </div>

      <!-- Low-Attendance Table Card -->
      <div class="dashboard-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Regulatory Shortfall Audit Register</h3>
            <p class="card-subtitle">Active student records with attendance percentage below configured threshold (${threshold}%)</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="ReportsModule.exportCSV()">Export CSV</button>
            <button class="btn btn-primary btn-sm" onclick="ReportsModule.exportExcel('low-attendance')">
              Export Low-Attendance (.xlsx)
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-custom" id="lowAttendanceTable">
            <thead>
              <tr>
                <th>SL No</th>
                <th>Student</th>
                <th>Registration No</th>
                <th>Class &amp; Section</th>
                <th>Total Classes</th>
                <th>Attended</th>
                <th>Absent</th>
                <th>Attendance %</th>
                <th>Shortfall Margin</th>
                <th>Regulatory Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${students.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--color-present); font-weight: 700;">
                    ✓ Exemplary Compliance: No students currently below ${threshold}% attendance threshold.
                  </td>
                </tr>
              ` : students.map((s, idx) => `
                <tr style="${s.isCritical ? 'background-color: #FEF2F2;' : ''}">
                  <td>${idx + 1}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <div class="avatar-cell" style="width: 32px; height: 32px; font-size: 0.75rem; background: var(--light-blue); color: var(--primary-blue); font-weight: 700;">
                        ${s.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div style="font-weight: 700; font-size: 0.84rem; color: var(--brand-navy);">${s.fullName}</div>
                    </div>
                  </td>
                  <td><span style="font-family: monospace; font-size: 0.82rem; font-weight: 600;">${s.registrationNumber}</span></td>
                  <td>${s.className} (Sec ${s.section})</td>
                  <td>${s.totalClasses}</td>
                  <td style="color: var(--color-present); font-weight: 600;">${s.presentClasses}</td>
                  <td style="color: var(--color-absent); font-weight: 600;">${s.absentClasses}</td>
                  <td>
                    <span style="font-weight: 800; font-size: 0.9rem; color: ${s.isCritical ? '#991B1B' : '#DC2626'};">
                      ${s.attendancePercentage}%
                    </span>
                  </td>
                  <td>
                    <span style="font-weight: 700; color: #DC2626; font-size: 0.82rem;">
                      -${s.shortfallMargin}%
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${s.isCritical ? 'absent' : 'late'}" style="font-size: 0.7rem; font-weight: 700;">
                      ${s.statusLabel}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-text" style="font-size: 0.75rem;" onclick="ReportsModule.viewStudentReport('${s.registrationNumber}')">
                      View Profile →
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 3. STUDENT ATTENDANCE REPORT
  // ============================================================================
  renderStudentCategory() {
    const role = this.getUserRole();
    const students = window.AcademicDataService ? AcademicDataService.getStudents() : [];
    
    // Choose selected reg no
    let regNo = this.state.filter.selectedStudentRegNo || '192211001';
    if (role === 'STUDENT' || role === 'PARENT') {
      regNo = '192211001'; // Default linked ward/student in demo mode
    }

    const report = window.ReportsService ? ReportsService.getStudentReport(regNo, this.state.filter) : null;
    if (!report) {
      return `<div class="dashboard-card"><p>No student record located for Registration No: ${regNo}</p></div>`;
    }

    const s = report.student;
    const threshold = this.state.filter.threshold || 75.0;

    return `
      <!-- Student Selector (Admin / Teacher Only) -->
      ${role === 'ADMIN' || role === 'TEACHER' ? `
        <div class="dashboard-card" style="margin-bottom: 1.25rem; padding: 1rem 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <label class="form-label" style="margin: 0; font-size: 0.82rem; font-weight: 700;">Select Student:</label>
              <select class="form-select" style="min-width: 280px; padding: 0.4rem 0.6rem; font-size: 0.82rem;" onchange="ReportsModule.viewStudentReport(this.value)">
                ${students.map(st => `<option value="${st.registrationNumber}" ${st.registrationNumber === regNo ? 'selected' : ''}>${st.registrationNumber} - ${st.fullName} (${st.className})</option>`).join('')}
              </select>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              Active Academic Ledger: <strong>${s.academicYear}</strong>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Student Profile Header Card -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; background: #FFFFFF; border-left: 5px solid ${report.percentage >= threshold ? 'var(--primary-blue)' : '#DC2626'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.25rem;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div class="avatar-cell" style="width: 58px; height: 58px; font-size: 1.2rem; background: var(--primary-blue); color: #fff; font-weight: 700; border-radius: 50%;">
              ${s.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--brand-navy); margin: 0 0 0.25rem 0;">${s.fullName}</h2>
              <div style="display: flex; gap: 0.75rem; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                <span>Reg No: <strong style="font-family: monospace; color: var(--brand-navy);">${s.registrationNumber}</strong></span>
                <span>&bull;</span>
                <span>Class: <strong>${s.className} (Sec ${s.section})</strong></span>
                <span>&bull;</span>
                <span>Degree: <strong>B.E. Computer Science &amp; Engg</strong></span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 1.5rem; align-items: center;">
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Overall Attendance</div>
              <div style="font-size: 1.85rem; font-weight: 800; color: ${report.percentage >= threshold ? 'var(--color-present)' : 'var(--color-absent)'};">
                ${report.percentage}%
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${report.presentClasses} of ${report.totalClasses} Conducted Sessions</div>
            </div>
            <div style="border-left: 1px solid var(--border-light); padding-left: 1.25rem;">
              <span class="status-pill ${report.percentage >= threshold ? 'present' : 'absent'}" style="font-size: 0.82rem; padding: 0.35rem 0.85rem;">
                ${report.percentage >= threshold ? 'EXAM ELIGIBLE' : 'HALL TICKET ON HOLD'}
              </span>
            </div>
          </div>
        </div>

        ${report.isShortfall ? `
          <div style="margin-top: 1.25rem; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
            <svg width="22" height="22" fill="none" stroke="#E11D48" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div style="font-size: 0.82rem; color: #9F1239; line-height: 1.4;">
              <strong>ATTENDANCE SHORTFALL WARNING (&lt; ${threshold}%):</strong> Attendance is currently <strong>${report.percentage}%</strong>. Under SIMATS regulations, attendance must reach at least ${threshold}% prior to the examination deadline to enable online examination fee payment and hall ticket issuance.
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Subject-wise Breakdown Table -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Subject-wise Attendance Clearance</h3>
            <p class="card-subtitle">Course-level delivery metrics and individual paper eligibility</p>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Faculty In-Charge</th>
                <th>Delivered</th>
                <th>Attended</th>
                <th>Shortfall</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(report.subjectBreakdown || []).map(sub => `
                <tr>
                  <td><span class="status-pill info">${sub.code}</span></td>
                  <td style="font-weight: 700; color: var(--brand-navy);">${sub.name}</td>
                  <td>${sub.faculty || 'Faculty In-Charge'}</td>
                  <td>${sub.total}</td>
                  <td style="color: var(--color-present); font-weight: 600;">${sub.present}</td>
                  <td style="color: var(--color-absent); font-weight: 600;">${sub.total - sub.present}</td>
                  <td>
                    <span style="font-weight: 700; color: ${sub.percentage >= threshold ? 'var(--color-present)' : 'var(--color-absent)'};">
                      ${sub.percentage}%
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${sub.percentage >= threshold ? 'present' : 'absent'}">
                      ${sub.percentage >= threshold ? 'CLEARED' : 'SHORTFALL'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Date-wise Session Log Table -->
      <div class="dashboard-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Date-wise Lecture Attendance Ledger</h3>
            <p class="card-subtitle">Verified attendance records logged by faculty for this student</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.printReport()">Print Ledger</button>
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Period / Slot</th>
                <th>Subject</th>
                <th>Faculty In-Charge</th>
                <th>Status</th>
                <th>Audit Remark</th>
              </tr>
            </thead>
            <tbody>
              ${report.dateLogs.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No verified individual sessions logged for this student in the selected period.
                  </td>
                </tr>
              ` : report.dateLogs.map(log => `
                <tr>
                  <td style="font-weight: 600;">${log.date}</td>
                  <td><span class="status-pill default">${log.period}</span></td>
                  <td style="font-weight: 600; color: var(--brand-navy);">${log.subjectCode} - ${log.subjectName}</td>
                  <td>${log.faculty}</td>
                  <td>
                    <span class="status-pill ${log.status === 'PRESENT' ? 'present' : 'absent'}">
                      ${log.status}
                    </span>
                  </td>
                  <td style="font-size: 0.78rem; color: var(--text-muted);">${log.remark || 'Regular lecture'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  viewStudentReport(regNo) {
    this.state.filter.selectedStudentRegNo = regNo;
    this.state.activeCategory = 'student';
    this.render();
  },

  // ============================================================================
  // 4. CLASS-WISE REPORT
  // ============================================================================
  renderClassCategory() {
    const classId = this.state.filter.classId !== 'ALL' ? this.state.filter.classId : 'BE-CSE-3A';
    const section = this.state.filter.section !== 'ALL' ? this.state.filter.section : 'A';
    const report = window.ReportsService ? ReportsService.getClassSectionReport(classId, section, this.state.filter) : null;
    const threshold = this.state.filter.threshold || 75.0;

    if (!report) {
      return `<div class="dashboard-card"><p>No data found for class: ${classId}</p></div>`;
    }

    return `
      <!-- Class Overview Card -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Class Roster &amp; Regulatory Audit: ${report.classId} (Sec ${report.section})</h3>
            <p class="card-subtitle">Official enrolled cohort attendance records and shortfall evaluation</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ReportsModule.exportExcel('class-report')">
            Export Class Ledger (.xlsx)
          </button>
        </div>

        <div class="stat-grid-4" style="margin-bottom: 1.25rem;">
          <div class="stat-card">
            <span class="stat-card-title">Enrolled Students</span>
            <div class="stat-card-value">${report.totalEnrolled}</div>
            <div class="stat-card-footer"><span>Active Roster</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Conducted Lectures</span>
            <div class="stat-card-value">${report.totalSessions}</div>
            <div class="stat-card-footer"><span>Logged in System</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Class Average Attendance</span>
            <div class="stat-card-value" style="color: ${report.avgPercentage >= threshold ? 'var(--color-present)' : 'var(--color-absent)'};">
              ${report.avgPercentage}%
            </div>
            <div class="stat-card-footer"><span>Target: ${threshold}%</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Shortfall Students (&lt; ${threshold}%)</span>
            <div class="stat-card-value" style="color: #DC2626;">${report.shortfallCount}</div>
            <div class="stat-card-footer"><span style="color: #DC2626;">Locked Examination</span></div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>SL No</th>
                <th>Student</th>
                <th>Registration No</th>
                <th>Total Eligible</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance %</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${(report.studentRoster || []).map((s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td style="font-weight: 700; color: var(--brand-navy);">${s.fullName}</td>
                  <td><span style="font-family: monospace; font-size: 0.82rem;">${s.registrationNumber}</span></td>
                  <td>${s.totalEligible}</td>
                  <td style="color: var(--color-present); font-weight: 600;">${s.presentCount}</td>
                  <td style="color: var(--color-absent); font-weight: 600;">${s.absentCount}</td>
                  <td>
                    <span style="font-weight: 700; color: ${s.attendancePercentage >= threshold ? 'var(--color-present)' : 'var(--color-absent)'};">
                      ${s.attendancePercentage}%
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${s.isShortfall ? 'absent' : 'present'}">
                      ${s.isShortfall ? 'SHORTFALL (<75%)' : 'ELIGIBLE'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-text" style="font-size: 0.75rem;" onclick="ReportsModule.viewStudentReport('${s.registrationNumber}')">
                      Report →
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  viewClassReport(classId, section) {
    this.state.filter.classId = classId;
    this.state.filter.section = section;
    this.state.activeCategory = 'class';
    this.render();
  },

  // ============================================================================
  // 5. SECTION-WISE REPORT
  // ============================================================================
  renderSectionCategory() {
    const classId = this.state.filter.classId !== 'ALL' ? this.state.filter.classId : 'BE-CSE-3A';
    const repA = window.ReportsService ? ReportsService.getClassSectionReport(classId, 'A', this.state.filter) : null;
    const repB = window.ReportsService ? ReportsService.getClassSectionReport(classId, 'B', this.state.filter) : null;

    return `
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Comparative Section Attendance Analysis: ${classId}</h3>
            <p class="card-subtitle">Side-by-side performance audit between Section A and Section B</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <!-- Section A -->
          <div style="border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem; background: #F8FAFC;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="margin: 0; font-size: 1.05rem; color: var(--brand-navy); font-weight: 800;">Section A Cohort</h4>
              <span class="status-pill info">Section A</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Average Attendance</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-present);">${repA?.avgPercentage || 88.5}%</div>
              </div>
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Enrolled Strength</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--brand-navy);">${repA?.totalEnrolled || 20}</div>
              </div>
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Conducted Lectures</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--brand-navy);">${repA?.totalSessions || 12}</div>
              </div>
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Shortfall Students</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #DC2626;">${repA?.shortfallCount || 2}</div>
              </div>
            </div>
          </div>

          <!-- Section B -->
          <div style="border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem; background: #F8FAFC;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="margin: 0; font-size: 1.05rem; color: var(--brand-navy); font-weight: 800;">Section B Cohort</h4>
              <span class="status-pill info">Section B</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Average Attendance</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-present);">${repB?.avgPercentage || 86.2}%</div>
              </div>
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Enrolled Strength</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--brand-navy);">${repB?.totalEnrolled || 20}</div>
              </div>
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Conducted Lectures</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--brand-navy);">${repB?.totalSessions || 8}</div>
              </div>
              <div style="background: #fff; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-muted);">Shortfall Students</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #DC2626;">${repB?.shortfallCount || 3}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 6. SUBJECT-WISE REPORT
  // ============================================================================
  renderSubjectCategory() {
    const subjectCode = this.state.filter.subjectCode !== 'ALL' ? this.state.filter.subjectCode : 'CS301';
    const report = window.ReportsService ? ReportsService.getSubjectReport(subjectCode, this.state.filter) : null;
    const sub = report?.subject || { code: subjectCode, name: 'Algorithm Design', department: 'CSE' };

    return `
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Subject Attendance Audit: ${sub.code} - ${sub.name}</h3>
            <p class="card-subtitle">Course turnout metrics and session delivery log</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ReportsModule.exportExcel('subject-report')">Export Sheet (.xlsx)</button>
        </div>

        <div class="stat-grid-4" style="margin-bottom: 1.25rem;">
          <div class="stat-card">
            <span class="stat-card-title">Course Code</span>
            <div class="stat-card-value" style="font-size: 1.3rem; color: var(--primary-blue);">${sub.code}</div>
            <div class="stat-card-footer"><span>${sub.department} Department</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Sessions Conducted</span>
            <div class="stat-card-value">${report?.totalSessions || 14}</div>
            <div class="stat-card-footer"><span>Lecture Deliveries</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Average Attendance</span>
            <div class="stat-card-value" style="color: var(--color-present);">${report?.avgPercentage || 87.5}%</div>
            <div class="stat-card-footer"><span>Overall Turnout Rate</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Total Present Logs</span>
            <div class="stat-card-value" style="color: var(--color-present);">${report?.totalPresent || 312}</div>
            <div class="stat-card-footer"><span>Student Attendances</span></div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Period</th>
                <th>Class &amp; Section</th>
                <th>Faculty In-Charge</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Turnout Rate</th>
              </tr>
            </thead>
            <tbody>
              ${(report?.sessions || []).length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No sessions logged yet for this subject under the applied filter.
                  </td>
                </tr>
              ` : (report?.sessions || []).map(sess => `
                <tr>
                  <td style="font-weight: 600;">${sess.date}</td>
                  <td><span class="status-pill default">${sess.period}</span></td>
                  <td style="font-weight: 700; color: var(--brand-navy);">${sess.classId} (Sec ${sess.section})</td>
                  <td>${sess.teacherName}</td>
                  <td style="color: var(--color-present); font-weight: 600;">${sess.presentCount}</td>
                  <td style="color: var(--color-absent); font-weight: 600;">${sess.absentCount}</td>
                  <td>
                    <span style="font-weight: 700; color: var(--color-present);">
                      ${ReportsService.calculatePercentage(sess.presentCount, sess.presentCount + sess.absentCount)}%
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 7. TEACHER-WISE REPORT (ADMIN ONLY)
  // ============================================================================
  renderTeacherCategory() {
    const teacherId = this.state.filter.teacherId !== 'ALL' ? this.state.filter.teacherId : 'FAC-CSE-001';
    const report = window.ReportsService ? ReportsService.getTeacherReport(teacherId, this.state.filter) : null;
    const t = report?.teacher;

    return `
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Faculty Teaching &amp; Attendance Audit: ${t?.fullName}</h3>
            <p class="card-subtitle">Lecture execution logs, assigned sections and average class attendance</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="ReportsModule.exportExcel('teacher-report')">Export Sheet (.xlsx)</button>
        </div>

        <div class="stat-grid-4" style="margin-bottom: 1.25rem;">
          <div class="stat-card">
            <span class="stat-card-title">Employee ID</span>
            <div class="stat-card-value" style="font-size: 1.3rem;">${t?.employeeId || teacherId}</div>
            <div class="stat-card-footer"><span>${t?.department || 'CSE'} Faculty</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Sessions Conducted</span>
            <div class="stat-card-value">${report?.sessionsConducted || 18}</div>
            <div class="stat-card-footer"><span>Finalized Attendance Entries</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Total Headcounts Handled</span>
            <div class="stat-card-value">${report?.totalStudentsRecorded || 144}</div>
            <div class="stat-card-footer"><span>Present: ${report?.presentTotal || 128}</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-card-title">Assigned Course Allocations</span>
            <div class="stat-card-value" style="font-size: 1.2rem; color: var(--primary-blue);">${(report?.assignedSubjects || []).join(', ')}</div>
            <div class="stat-card-footer"><span>Classes: ${(report?.assignedClasses || []).join(', ')}</span></div>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 8. DAILY & MONTHLY ATTENDANCE TRENDS
  // ============================================================================
  renderTrendsCategory() {
    const data = window.ReportsService ? ReportsService.getOverallAnalytics(this.state.filter) : null;

    return `
      <!-- Daily Trend Spline Chart -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Daily Attendance Spline Trend</h3>
            <p class="card-subtitle">Day-by-day attendance telemetry across university lecture dates</p>
          </div>
        </div>
        <div style="height: 280px; position: relative;">
          <canvas id="chartDailyTrendSpline"></canvas>
        </div>
      </div>

      <!-- Monthly Progression Chart -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Semester Monthly Attendance Progression</h3>
            <p class="card-subtitle">Month-on-month rate compared to statutory 75% baseline</p>
          </div>
        </div>
        <div style="height: 260px; position: relative;">
          <canvas id="chartMonthlyProgression"></canvas>
        </div>
      </div>

      <!-- Historical Date-wise Log Table -->
      <div class="dashboard-card">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Chronological Daily Attendance Ledger</h3>
            <p class="card-subtitle">Aggregated metrics per instructional calendar date</p>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Present Records</th>
                <th>Absent Records</th>
                <th>Total Attendance Logged</th>
                <th>Daily Rate</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              ${(data?.dailyTrends || []).map(dt => `
                <tr>
                  <td style="font-weight: 700; color: var(--brand-navy);">${dt.date}</td>
                  <td style="color: var(--color-present); font-weight: 600;">${dt.present}</td>
                  <td style="color: var(--color-absent); font-weight: 600;">${dt.absent}</td>
                  <td>${dt.present + dt.absent}</td>
                  <td>
                    <span style="font-weight: 800; color: ${dt.rate >= 75 ? 'var(--color-present)' : 'var(--color-absent)'};">
                      ${dt.rate}%
                    </span>
                  </td>
                  <td>
                    <span class="status-pill ${dt.rate >= 75 ? 'present' : 'absent'}">
                      ${dt.rate >= 75 ? 'SATISFACTORY' : 'BELOW 75%'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // CANVAS CHART RENDERING ENGINE (RETINA-SCALED HTML5 2D CONTEXT)
  // ============================================================================
  renderActiveCharts() {
    setTimeout(() => {
      if (this.state.activeCategory === 'overall') {
        const data = window.ReportsService ? ReportsService.getOverallAnalytics(this.state.filter) : null;
        if (data) {
          this.drawTrendLineChart('chartDailyTrend', data.dailyTrends);
          this.drawDonutChart('chartPresentAbsentDonut', data.presentRecords, data.absentRecords);
          this.drawBarChart('chartClassComparison', (data.classBreakdown || []).map(c => c.className), (data.classBreakdown || []).map(c => c.percentage), data.threshold);
          this.drawBarChart('chartSubjectDistribution', (data.subjectBreakdown || []).map(s => s.code), (data.subjectBreakdown || []).map(s => s.percentage), data.threshold);
        }
      } else if (this.state.activeCategory === 'trends') {
        const data = window.ReportsService ? ReportsService.getOverallAnalytics(this.state.filter) : null;
        if (data) {
          this.drawTrendLineChart('chartDailyTrendSpline', data.dailyTrends);
          this.drawBarChart('chartMonthlyProgression', (data.monthlyTrends || []).map(m => m.month), (data.monthlyTrends || []).map(m => m.rate), 75.0);
        }
      }
    }, 50);
  },

  setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.parentElement) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();

    const w = rect.width || 400;
    const h = rect.height || 240;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(dpr, dpr);
    return { ctx, width: w, height: h };
  },

  // 1. Spline Trend Line Chart
  drawTrendLineChart(canvasId, trends = []) {
    const setup = this.setupCanvas(canvasId);
    if (!setup) return;
    const { ctx, width, height } = setup;

    if (!trends || trends.length === 0) return;

    const padLeft = 45;
    const padRight = 25;
    const padTop = 25;
    const padBottom = 35;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    ctx.clearRect(0, 0, width, height);

    // Baseline grid lines (60%, 70%, 80%, 90%, 100%)
    const ticks = [60, 70, 75, 80, 90, 100];
    ticks.forEach(val => {
      const y = padTop + plotH - ((val - 60) / 40) * plotH;
      ctx.beginPath();
      ctx.strokeStyle = val === 75 ? '#F87171' : '#E2E8F0';
      ctx.lineWidth = val === 75 ? 1.5 : 1;
      if (val === 75) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = val === 75 ? '#DC2626' : '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}%`, padLeft - 6, y + 3);
    });

    // Plot Points
    const points = trends.map((item, idx) => {
      const x = padLeft + (idx / Math.max(1, trends.length - 1)) * plotW;
      const y = padTop + plotH - ((Math.max(60, Math.min(100, item.rate)) - 60) / 40) * plotH;
      return { x, y, rate: item.rate, label: item.date.slice(5) };
    });

    // Draw Smooth Line
    ctx.beginPath();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Fill Gradient Area
    ctx.lineTo(points[points.length - 1].x, padTop + plotH);
    ctx.lineTo(points[0].x, padTop + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.28)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Point Markers & Labels
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top rate label
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pt.rate}%`, pt.x, pt.y - 8);

      // Bottom date label
      ctx.fillStyle = '#64748B';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(pt.label, pt.x, height - 12);
    });
  },

  // 2. Present vs Absent Donut Chart
  drawDonutChart(canvasId, present = 1320, absent = 180) {
    const setup = this.setupCanvas(canvasId);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const total = present + absent;
    if (total === 0) return;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2 - 12;
    const radius = Math.min(cx, cy) - 20;
    const innerRadius = radius * 0.62;

    const presentAngle = (present / total) * Math.PI * 2;
    const startAngle = -Math.PI / 2;

    // Draw Present Segment (Green)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + presentAngle);
    ctx.arc(cx, cy, innerRadius, startAngle + presentAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#16A34A';
    ctx.fill();

    // Draw Absent Segment (Red)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle + presentAngle, startAngle + Math.PI * 2);
    ctx.arc(cx, cy, innerRadius, startAngle + Math.PI * 2, startAngle + presentAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#DC2626';
    ctx.fill();

    // Center Percentage
    const pct = ((present / total) * 100).toFixed(1);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${pct}%`, cx, cy - 2);

    ctx.fillStyle = '#64748B';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('PRESENT', cx, cy + 16);

    // Legend
    const legendY = height - 12;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Present legend
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(cx - 95, legendY - 5, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Present (${present})`, cx - 80, legendY);

    // Absent legend
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(cx + 20, legendY - 5, 10, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText(`Absent (${absent})`, cx + 35, legendY);
  },

  // 3. Bar Chart (Class / Subject / Monthly)
  drawBarChart(canvasId, labels = [], values = [], threshold = 75.0) {
    const setup = this.setupCanvas(canvasId);
    if (!setup) return;
    const { ctx, width, height } = setup;

    if (!labels || labels.length === 0) return;

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    ctx.clearRect(0, 0, width, height);

    // Baseline grid ticks
    [0, 25, 50, 75, 100].forEach(val => {
      const y = padTop + plotH - (val / 100) * plotH;
      ctx.beginPath();
      ctx.strokeStyle = val === threshold ? '#F87171' : '#E2E8F0';
      ctx.lineWidth = val === threshold ? 1.5 : 1;
      if (val === threshold) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = val === threshold ? '#DC2626' : '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}%`, padLeft - 6, y + 3);
    });

    const barWidth = Math.min(36, (plotW / labels.length) * 0.6);
    const step = plotW / labels.length;

    labels.forEach((lbl, idx) => {
      const val = values[idx] || 0;
      const x = padLeft + idx * step + (step - barWidth) / 2;
      const barH = (val / 100) * plotH;
      const y = padTop + plotH - barH;

      // Draw Bar
      ctx.beginPath();
      ctx.fillStyle = val >= threshold ? '#2563EB' : '#EF4444';
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
      ctx.fill();

      // Top value text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}%`, x + barWidth / 2, y - 6);

      // Bottom label
      ctx.fillStyle = '#64748B';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(lbl, x + barWidth / 2, height - 12);
    });
  },

  // ============================================================================
  // EXPORT & PRINT HANDLERS
  // ============================================================================
  async exportExcel(customType) {
    const reportType = customType || this.state.activeCategory;
    try {
      if (window.Api && window.Api.reports && typeof window.Api.reports.downloadExcel === 'function') {
        if (window.App) App.toast('Generating binary Excel (.xlsx) via Spring Boot Apache POI...', 'info');
        await Api.reports.downloadExcel(reportType, this.state.filter.threshold || 75.0);
        if (window.App) App.toast('Official Excel (.xlsx) workbook downloaded successfully!', 'success');
        return;
      }
    } catch (err) {
      console.warn('[ReportsModule] Server Excel download failed, using client SheetJS fallback:', err.message);
      if (window.App) App.toast('Server export timed out, generating local SheetJS workbook...', 'warning');
    }

    let data;
    if (reportType === 'low-attendance') {
      const threshold = this.state.filter.threshold || 75.0;
      const lowAttendanceList = window.ReportsService ? ReportsService.getLowAttendanceStudents(threshold, this.state.filter) : [];
      data = { lowAttendanceList, threshold };
    } else if (reportType === 'class-report') {
      const classId = this.state.filter.classId !== 'ALL' ? this.state.filter.classId : 'BE-CSE-3A';
      const section = this.state.filter.section !== 'ALL' ? this.state.filter.section : 'A';
      data = window.ReportsService ? ReportsService.getClassSectionReport(classId, section, this.state.filter) : {};
    } else {
      data = window.ReportsService ? ReportsService.getOverallAnalytics(this.state.filter) : {};
    }

    if (window.ReportsService) {
      ReportsService.exportReportToExcel(reportType, data, this.state.filter);
    }
  },

  // CSV Fallback Export
  exportCSV() {
    let rows = [];
    const category = this.state.activeCategory;

    if (category === 'low-attendance') {
      const threshold = this.state.filter.threshold || 75.0;
      const list = window.ReportsService ? ReportsService.getLowAttendanceStudents(threshold, this.state.filter) : [];
      rows.push(['SL NO', 'REGISTRATION NO', 'NAME', 'CLASS', 'SECTION', 'ATTENDANCE %', 'PRESENT', 'ABSENT', 'SHORTFALL MARGIN', 'STATUS']);
      list.forEach((s, idx) => {
        rows.push([idx + 1, s.registrationNumber, `"${s.fullName}"`, s.className, s.section, `${s.attendancePercentage}%`, s.presentClasses, s.absentClasses, `-${s.shortfallMargin}%`, s.statusLabel]);
      });
    } else {
      const data = window.ReportsService ? ReportsService.getOverallAnalytics(this.state.filter) : {};
      rows.push(['CLASS NAME', 'SECTION', 'SESSIONS', 'PRESENT', 'ABSENT', 'RATE']);
      (data.classBreakdown || []).forEach(c => {
        rows.push([c.className, c.section, c.totalSessions, c.presentCount, c.absentCount, `${c.percentage}%`]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AttendX_${category}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.App) App.toast('CSV report generated and downloaded', 'success');
  },

  // Legacy facade compatibility
  exportReport(type = 'excel') {
    if (type === 'excel' || type === 'xlsx') {
      this.exportExcel();
    } else {
      this.exportCSV();
    }
  },

  setThresholdFilter(val) {
    if (val === 'BELOW_75') this.state.filter.threshold = 75.0;
    else if (val === 'BELOW_65') this.state.filter.threshold = 65.0;
    else if (val === 'ALL') this.state.filter.threshold = 75.0;
    this.render();
  },

  printReport() {
    window.print();
  }
};

window.ReportsModule = ReportsModule;
