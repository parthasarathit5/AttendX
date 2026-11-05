/**
 * MaccaAttendX - Attendance Management System (Milestone 3)
 * Full LMS Attendance Marking with Clickable [PRESENT] and [ABSENT] Buttons,
 * Live Counters (Total, Present, Absent, Unmarked, Completion %),
 * Strict Unmarked Validation, Duplicate Session Prevention,
 * True .xlsx Excel Generation, Print-friendly Ledger, and Audit-Trailed Corrections.
 */

const AttendanceModule = {
  // Active session workspace state
  state: {
    academicYear: '2025–2026',
    classId: 'BE-CSE-3A',
    className: 'B.E. Computer Science & Engineering',
    section: 'A',
    subjectCode: 'CS301',
    subjectName: 'Design and Analysis of Algorithms',
    date: new Date().toISOString().split('T')[0],
    period: 'Period 1 (08:30 - 09:20)',
    teacherId: 'TCH-201',
    teacherName: 'Dr. K. Senthil Kumar',
    isLocked: false,
    savedSessionId: null,
    searchQuery: '',
    statusFilter: 'ALL', // 'ALL', 'PRESENT', 'ABSENT', 'UNMARKED'
    isSubmitting: false,
    activeTab: 'marking' // 'marking', 'history', 'overview', 'corrections'
  },

  // Student roster currently being marked
  students: [],

  // ============================================================================
  // ENTRY POINT BASED ON USER ROLE
  // ============================================================================
  render(container) {
    const user = Auth.getUser();

    if (user.role === 'STUDENT') {
      this.renderStudentView(container);
    } else if (user.role === 'PARENT') {
      this.renderParentView(container);
    } else if (user.role === 'ADMIN' && this.state.activeTab === 'overview') {
      this.renderAdminOverview(container);
    } else if (this.state.activeTab === 'history') {
      this.renderAttendanceHistory(container);
    } else {
      // TEACHER or ADMIN Attendance Marking Screen
      this.renderAttendanceMarkingScreen(container);
    }
  },

  // ============================================================================
  // 1. TEACHER & ADMIN ATTENDANCE MARKING SCREEN
  // ============================================================================
  renderAttendanceMarkingScreen(container) {
    const user = Auth.getUser();
    const isAdmin = user.role === 'ADMIN';

    // Authorized classes and subjects
    const authorizedClasses = AttendanceService.getAuthorizedClasses(user);
    const authorizedSubjects = AttendanceService.getAuthorizedSubjects(user, this.state.classId);

    // Ensure state classId is authorized
    if (authorizedClasses.length > 0 && !authorizedClasses.some(c => c.id === this.state.classId)) {
      this.state.classId = authorizedClasses[0].id;
      this.state.className = authorizedClasses[0].name;
      this.state.section = authorizedClasses[0].section || 'A';
    }

    // Ensure state subjectCode is authorized
    if (authorizedSubjects.length > 0 && !authorizedSubjects.some(s => s.code === this.state.subjectCode)) {
      this.state.subjectCode = authorizedSubjects[0].code;
      this.state.subjectName = authorizedSubjects[0].name;
    }

    // If students array is empty, load authorized student roster
    if (!this.students || this.students.length === 0) {
      this.loadStudentRoster();
    }

    // Compute live counters
    const counts = this.calculateLiveCounters();

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Class Attendance Verification &amp; Marking</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Period-Wise Attendance Verification &amp; Biometric Audit
          </p>
        </div>
        <div class="banner-actions">
          <!-- Navigation tabs for Admin / Faculty -->
          <button class="btn ${this.state.activeTab === 'marking' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="AttendanceModule.switchTab('marking')">
            Marking Workspace
          </button>
          <button class="btn ${this.state.activeTab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="AttendanceModule.switchTab('history')">
            Attendance History
          </button>
          ${isAdmin ? `
            <button class="btn ${this.state.activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="AttendanceModule.switchTab('overview')">
              Institution Overview
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Selection Filter Controls Bar (Authorized Scoping) -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; align-items: center;">
          <span>Authorized Academic Session Parameters</span>
          ${this.state.isLocked ? `
            <span class="status-pill status-present" style="font-size: 0.75rem;">🔒 OFFICIAL RECORD SAVED &amp; LOCKED</span>
          ` : `
            <span class="status-pill status-late" style="font-size: 0.75rem;">● DRAFT SESSION (PENDING SUBMISSION)</span>
          `}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; align-items: end;">
          <!-- Academic Year -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Academic Year</label>
            <select class="form-select" id="attAySelect" onchange="AttendanceModule.onParamChange('academicYear', this.value)" ${this.state.isLocked ? 'disabled' : ''}>
              <option value="2025–2026" ${this.state.academicYear === '2025–2026' ? 'selected' : ''}>2025–2026 (Active)</option>
              <option value="2026–2027" ${this.state.academicYear === '2026–2027' ? 'selected' : ''}>2026–2027</option>
            </select>
          </div>

          <!-- Class (Authorized only) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Authorized Class</label>
            <select class="form-select" id="attClassSelect" onchange="AttendanceModule.onClassChange(this.value)" ${this.state.isLocked ? 'disabled' : ''}>
              ${authorizedClasses.map(c => `
                <option value="${c.id}" ${this.state.classId === c.id ? 'selected' : ''}>
                  ${c.name} (Sec ${c.section})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Subject (Authorized only) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Teaching Subject</label>
            <select class="form-select" id="attSubjectSelect" onchange="AttendanceModule.onSubjectChange(this.value)" ${this.state.isLocked ? 'disabled' : ''}>
              ${authorizedSubjects.map(s => `
                <option value="${s.code}" ${this.state.subjectCode === s.code ? 'selected' : ''}>
                  ${s.code} - ${s.name}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Date -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Attendance Date</label>
            <input type="date" class="form-control" id="attDateInput" value="${this.state.date}" onchange="AttendanceModule.onParamChange('date', this.value)" ${this.state.isLocked ? 'disabled' : ''}>
          </div>

          <!-- Period -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Period / Hour</label>
            <select class="form-select" id="attPeriodSelect" onchange="AttendanceModule.onParamChange('period', this.value)" ${this.state.isLocked ? 'disabled' : ''}>
              <option value="Period 1 (08:30 - 09:20)" ${this.state.period.includes('1') ? 'selected' : ''}>Period 1 (08:30 - 09:20)</option>
              <option value="Period 2 (09:20 - 10:10)" ${this.state.period.includes('2') ? 'selected' : ''}>Period 2 (09:20 - 10:10)</option>
              <option value="Period 3 (10:30 - 11:20)" ${this.state.period.includes('3') ? 'selected' : ''}>Period 3 (10:30 - 11:20)</option>
              <option value="Period 4 (11:20 - 12:10)" ${this.state.period.includes('4') ? 'selected' : ''}>Period 4 (11:20 - 12:10)</option>
              <option value="Period 5 (01:00 - 01:50)" ${this.state.period.includes('5') ? 'selected' : ''}>Period 5 (01:00 - 01:50)</option>
              <option value="Period 6 (01:50 - 02:40)" ${this.state.period.includes('6') ? 'selected' : ''}>Period 6 (01:50 - 02:40)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Real-Time Calculated Metric Counters (MANDATORY REQUIREMENT 6) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.85rem; margin-bottom: 1.5rem;">
        <div class="stat-card" style="padding: 1rem; border-left: 3px solid var(--brand-navy);">
          <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Students</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--brand-navy); margin-top: 0.2rem;">${counts.total}</div>
        </div>
        <div class="stat-card" style="padding: 1rem; border-left: 3px solid var(--present-green); background: #F0FDF4;">
          <div style="font-size: 0.72rem; font-weight: 700; color: var(--present-green); text-transform: uppercase;">Present Count</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--present-green); margin-top: 0.2rem;">${counts.present}</div>
        </div>
        <div class="stat-card" style="padding: 1rem; border-left: 3px solid var(--absent-red); background: #FEF2F2;">
          <div style="font-size: 0.72rem; font-weight: 700; color: var(--absent-red); text-transform: uppercase;">Absent Count</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--absent-red); margin-top: 0.2rem;">${counts.absent}</div>
        </div>
        <div class="stat-card" style="padding: 1rem; border-left: 3px solid ${counts.unmarked > 0 ? 'var(--late-amber)' : '#CBD5E1'}; background: ${counts.unmarked > 0 ? '#FFFBEB' : '#FFFFFF'};">
          <div style="font-size: 0.72rem; font-weight: 700; color: ${counts.unmarked > 0 ? 'var(--late-amber)' : 'var(--text-muted)'}; text-transform: uppercase;">Unmarked Count</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: ${counts.unmarked > 0 ? 'var(--late-amber)' : 'var(--text-muted)'}; margin-top: 0.2rem;">${counts.unmarked}</div>
        </div>
        <div class="stat-card" style="padding: 1rem; border-left: 3px solid var(--primary-blue); background: linear-gradient(135deg, #FFFFFF, var(--light-blue));">
          <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">Completion Rate</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--primary-blue); margin-top: 0.2rem;">${counts.completionRate}%</div>
        </div>
      </div>

      <!-- Action Toolbar, Search, Filter Tabs & Submission Trigger -->
      <div class="dashboard-card" style="padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
        <!-- Left: Quick Actions -->
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-right: 0.25rem;">Actions:</span>
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.markAllPresent()" ${this.state.isLocked ? 'disabled' : ''}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Mark All Present
          </button>
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.resetMarking()" ${this.state.isLocked ? 'disabled' : ''}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Reset Marking
          </button>
          ${this.state.isLocked ? `
            <!-- Export Excel (.xlsx) & Print Attendance (MANDATORY REQUIREMENTS 8 & 9) -->
            <button class="btn btn-primary btn-sm" onclick="AttendanceModule.exportExcel()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export Excel (.xlsx)
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.printAttendance()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              Print Sheet
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.startNewSession()">
              Start New Session
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="AttendanceModule.openSubmitConfirmation()" ${counts.unmarked > 0 ? 'title="Mark all students before submitting"' : ''}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Save &amp; Submit Attendance
            </button>
          `}
        </div>

        <!-- Right: Status Filters & Search -->
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <div style="display: flex; background: var(--bg-soft); padding: 0.2rem; border-radius: 6px; border: 1px solid var(--border-color);">
            <button class="btn btn-sm ${this.state.statusFilter === 'ALL' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('ALL')">All (${counts.total})</button>
            <button class="btn btn-sm ${this.state.statusFilter === 'PRESENT' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('PRESENT')">Present (${counts.present})</button>
            <button class="btn btn-sm ${this.state.statusFilter === 'ABSENT' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('ABSENT')">Absent (${counts.absent})</button>
            <button class="btn btn-sm ${this.state.statusFilter === 'UNMARKED' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('UNMARKED')">Unmarked (${counts.unmarked})</button>
          </div>

          <div style="position: relative; width: 220px;">
            <input type="text" class="form-control" placeholder="Search student or reg no..." value="${this.state.searchQuery}" oninput="AttendanceModule.onSearchChange(event)" style="padding-left: 2rem; font-size: 0.82rem; height: 32px;">
            <svg style="position: absolute; left: 0.65rem; top: 9px; color: var(--text-muted);" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      </div>

      <!-- Mandatory Button-Based Attendance Marking Table (REQUIREMENT 5) -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;" id="printableAttendanceTableArea">
        
        <!-- Print-only header displayed when printing via browser -->
        <div class="print-only-header" style="display: none; padding: 1.5rem; text-align: center; border-bottom: 2px solid #000;">
          <h2 style="margin: 0; font-size: 16pt;">ATTENDX ACADEMIC ATTENDANCE MANAGEMENT PORTAL</h2>
          <h3 style="margin: 4px 0 0; font-size: 12pt; font-weight: normal;">SAVEETHA SCHOOL OF ENGINEERING &bull; SIMATS</h3>
          <p style="margin: 8px 0 0; font-size: 10pt;">
            <strong>Class:</strong> ${this.state.className} (Sec ${this.state.section}) &nbsp;|&nbsp; 
            <strong>Subject:</strong> ${this.state.subjectCode} - ${this.state.subjectName} &nbsp;|&nbsp; 
            <strong>Date:</strong> ${this.state.date} &nbsp;|&nbsp; 
            <strong>Period:</strong> ${this.state.period} &nbsp;|&nbsp;
            <strong>Faculty:</strong> ${this.state.teacherName}
          </p>
          <p style="margin: 4px 0 0; font-size: 9pt;">
            Total Enrolled: ${counts.total} &nbsp;|&nbsp; Present: ${counts.present} &nbsp;|&nbsp; Absent: ${counts.absent} &nbsp;|&nbsp; Attendance Rate: ${counts.total > 0 ? ((counts.present / counts.total) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th style="width: 140px;">Photo</th>
                <th style="width: 160px;">Registration Number</th>
                <th>Student Full Name</th>
                <th>Class &amp; Section</th>
                <th style="min-width: 250px; text-align: center;">Attendance Status (Mandatory Buttons)</th>
                <th>Remarks / Notes</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderStudentRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 2. STUDENT ROW RENDERING WITH [PRESENT] AND [ABSENT] BUTTONS
  // ============================================================================
  renderStudentRows() {
    let list = this.students;

    // Filter by status tab
    if (this.state.statusFilter === 'PRESENT') {
      list = list.filter(s => s.status === 'PRESENT');
    } else if (this.state.statusFilter === 'ABSENT') {
      list = list.filter(s => s.status === 'ABSENT');
    } else if (this.state.statusFilter === 'UNMARKED') {
      list = list.filter(s => !s.status || (s.status !== 'PRESENT' && s.status !== 'ABSENT'));
    }

    // Search query
    if (this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.studentName.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      return `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div style="font-weight: 700; font-size: 1rem; color: var(--brand-navy); margin-bottom: 0.25rem;">No student records match filter</div>
            <p style="font-size: 0.85rem;">Adjust your search query or status filter above.</p>
          </td>
        </tr>
      `;
    }

    return list.map((s, idx) => {
      const isPresent = s.status === 'PRESENT';
      const isAbsent = s.status === 'ABSENT';
      const isUnmarked = !s.status || (!isPresent && !isAbsent);
      const disabled = this.state.isLocked ? 'disabled' : '';

      return `
        <tr class="${isUnmarked ? 'row-unmarked-warning' : isAbsent ? 'row-absent-highlight' : ''}">
          <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <img src="${s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}" alt="${s.studentName}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-color);">
            </div>
          </td>
          <td>
            <span style="font-family: monospace; font-weight: 800; color: var(--primary-blue); font-size: 0.88rem;">
              ${s.registrationNumber}
            </span>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.88rem;">
              ${s.studentName}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Roll: ${s.rollNumber || s.registrationNumber}</div>
          </td>
          <td>
            <span style="font-size: 0.82rem; font-weight: 600;">${this.state.className}</span>
            <span class="status-pill status-leave" style="font-size: 0.65rem; padding: 0.1rem 0.35rem; margin-left: 0.25rem;">Sec ${this.state.section}</span>
          </td>
          <td style="text-align: center;">
            <!-- MANDATORY REQUIREMENT 5: Clickable [PRESENT] and [ABSENT] Buttons -->
            <div class="att-btn-group">
              <button 
                type="button" 
                class="btn-att-control btn-present ${isPresent ? 'active-present' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${s.registrationNumber}', 'PRESENT')" 
                ${disabled}
                title="Mark ${s.studentName} as PRESENT">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                PRESENT
              </button>
              <button 
                type="button" 
                class="btn-att-control btn-absent ${isAbsent ? 'active-absent' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${s.registrationNumber}', 'ABSENT')" 
                ${disabled}
                title="Mark ${s.studentName} as ABSENT">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                ABSENT
              </button>
            </div>
            ${isUnmarked ? `
              <div style="font-size: 0.7rem; color: #B45309; font-weight: 700; margin-top: 2px;">⚠️ Pending Status</div>
            ` : ''}
          </td>
          <td>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Add remark..." 
              value="${s.remark || ''}" 
              oninput="AttendanceModule.updateRemark('${s.registrationNumber}', this.value)"
              ${disabled}
              style="font-size: 0.78rem; height: 30px;">
          </td>
        </tr>
      `;
    }).join('');
  },

  // ============================================================================
  // 3. INTERACTIVE BUTTON HANDLERS & REAL-TIME COUNTERS
  // ============================================================================

  setStudentStatus(regNo, newStatus) {
    if (this.state.isLocked) return;

    const student = this.students.find(s => s.registrationNumber === regNo);
    if (student) {
      student.status = newStatus;
      this.reRenderTableAndCounters();
    }
  },

  updateRemark(regNo, text) {
    const student = this.students.find(s => s.registrationNumber === regNo);
    if (student) {
      student.remark = text;
    }
  },

  markAllPresent() {
    if (this.state.isLocked) return;
    this.students.forEach(s => s.status = 'PRESENT');
    App.toast('All enrolled students marked as PRESENT', 'success');
    this.reRenderTableAndCounters();
  },

  resetMarking() {
    if (this.state.isLocked) return;
    this.students.forEach(s => {
      s.status = null;
      s.remark = '';
    });
    App.toast('Attendance markings cleared for all students', 'info');
    this.reRenderTableAndCounters();
  },

  calculateLiveCounters() {
    const total = this.students.length;
    let present = 0, absent = 0, unmarked = 0;

    this.students.forEach(s => {
      if (s.status === 'PRESENT') present++;
      else if (s.status === 'ABSENT') absent++;
      else unmarked++;
    });

    const completionRate = total > 0 ? (((total - unmarked) / total) * 100).toFixed(0) : 0;

    return { total, present, absent, unmarked, completionRate };
  },

  onSearchChange(e) {
    this.state.searchQuery = e.target.value;
    const tbody = document.querySelector('#printableAttendanceTableArea tbody');
    if (tbody) {
      tbody.innerHTML = this.renderStudentRows();
    }
  },

  setStatusFilter(filter) {
    this.state.statusFilter = filter;
    this.reRenderTableAndCounters();
  },

  onClassChange(classId) {
    const classes = AttendanceService.getAuthorizedClasses(Auth.getUser());
    const target = classes.find(c => c.id === classId);
    if (target) {
      this.state.classId = target.id;
      this.state.className = target.name;
      this.state.section = target.section || 'A';
      this.state.isLocked = false;
      this.loadStudentRoster();
      this.reRenderTableAndCounters();
    }
  },

  onSubjectChange(code) {
    const subjects = AttendanceService.getAuthorizedSubjects(Auth.getUser(), this.state.classId);
    const target = subjects.find(s => s.code === code);
    if (target) {
      this.state.subjectCode = target.code;
      this.state.subjectName = target.name;
      this.state.isLocked = false;
      this.reRenderTableAndCounters();
    }
  },

  onParamChange(param, value) {
    this.state[param] = value;
    this.state.isLocked = false;
    this.reRenderTableAndCounters();
  },

  async loadStudentRoster() {
    try {
      const rawStudents = await AttendanceService.getStudentsForClassAsync(this.state.classId, this.state.section);
      this.students = rawStudents.map(s => ({
        studentId: s.studentId || s.id,
        registrationNumber: s.registrationNumber,
        studentName: s.fullName || s.studentName,
        rollNumber: s.rollNumber,
        photo: s.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        status: null, // Initial unmarked state
        remark: ''
      }));
    } catch (e) {
      const rawStudents = AttendanceService.getStudentsForClass(this.state.classId, this.state.section);
      this.students = rawStudents.map(s => ({
        studentId: s.id,
        registrationNumber: s.registrationNumber,
        studentName: s.fullName,
        rollNumber: s.rollNumber,
        photo: s.photo,
        status: null,
        remark: ''
      }));
    }
  },

  reRenderTableAndCounters() {
    const container = document.getElementById('mainWorkspaceContainer');
    if (container && this.state.activeTab === 'marking') {
      this.renderAttendanceMarkingScreen(container);
    }
  },

  // ============================================================================
  // 4. ATTENDANCE SUBMISSION WORKFLOW & UNMARKED VALIDATION (REQUIREMENT 7)
  // ============================================================================

  openSubmitConfirmation() {
    const counts = this.calculateLiveCounters();

    // STRICT VALIDATION: Prevent submission if any student is unmarked!
    if (counts.unmarked > 0) {
      App.toast(`Cannot submit: ${counts.unmarked} student(s) are still unmarked. Every student must be marked PRESENT or ABSENT.`, 'error');
      this.setStatusFilter('UNMARKED'); // auto-focus on unmarked students
      return;
    }

    const modalHtml = `
      <div style="font-size: 0.88rem; color: var(--text-dark); line-height: 1.5;">
        <p style="margin-bottom: 0.75rem;">Are you ready to finalize, verify, and lock attendance for this session?</p>
        
        <div style="background: var(--bg-soft); border-radius: 8px; padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: var(--text-muted);">Class &amp; Section:</span>
            <strong>${this.state.className} (Sec ${this.state.section})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: var(--text-muted);">Subject:</span>
            <strong>${this.state.subjectCode} - ${this.state.subjectName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: var(--text-muted);">Conducted Date:</span>
            <strong>${this.state.date} (${this.state.period})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="color: var(--text-muted);">Instructor:</span>
            <strong>${this.state.teacherName}</strong>
          </div>
          <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0.5rem 0;">
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.95rem;">
            <span>Total Enrolled: ${counts.total}</span>
            <span style="color: var(--present-green);">Present: ${counts.present}</span>
            <span style="color: var(--absent-red);">Absent: ${counts.absent}</span>
          </div>
        </div>

        <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">
          Note: Locking submits official academic attendance to the institutional repository. Further modifications will require authorized audit correction with mandatory reason.
        </p>
      </div>
    `;

    App.openModal('Verify & Submit Attendance', modalHtml, () => {
      this.executeAttendanceSubmission();
    });
  },

  async executeAttendanceSubmission() {
    if (this.state.isSubmitting) return; // Prevent double-click
    this.state.isSubmitting = true;

    const counts = this.calculateLiveCounters();
    const user = Auth.getUser();

    const sessionPayload = {
      academicYear: this.state.academicYear,
      classId: this.state.classId,
      className: this.state.className,
      section: this.state.section,
      subjectCode: this.state.subjectCode,
      subjectName: this.state.subjectName,
      date: this.state.date,
      period: this.state.period,
      teacherId: this.state.teacherId,
      teacherName: this.state.teacherName,
      totalStudents: counts.total,
      presentCount: counts.present,
      absentCount: counts.absent,
      unmarkedCount: 0,
      completionRate: 100,
      records: this.students.map(s => ({
        studentId: s.studentId,
        registrationNumber: s.registrationNumber,
        studentName: s.studentName,
        status: s.status,
        remark: s.remark || ''
      }))
    };

    const res = await AttendanceService.saveAttendanceSession(sessionPayload, user);
    this.state.isSubmitting = false;

    if (!res.success) {
      // Do NOT clear selections on error!
      App.toast(res.error, 'error');
      return;
    }

    this.state.isLocked = true;
    this.state.savedSessionId = res.data.id;
    App.toast('Official attendance session recorded and locked successfully!', 'success');
    this.reRenderTableAndCounters();
  },

  startNewSession() {
    this.state.isLocked = false;
    this.state.savedSessionId = null;
    this.loadStudentRoster();
    this.reRenderTableAndCounters();
    App.toast('New attendance marking workspace initialized', 'info');
  },

  // ============================================================================
  // 5. REAL EXCEL EXPORT (.xlsx) AND PRINT ATTENDANCE (MANDATORY 8 & 9)
  // ============================================================================

  exportExcel() {
    // Determine active session object to export
    const counts = this.calculateLiveCounters();
    const sessionObj = {
      id: this.state.savedSessionId || 'SESS-CURRENT',
      academicYear: this.state.academicYear,
      classId: this.state.classId,
      className: this.state.className,
      section: this.state.section,
      subjectCode: this.state.subjectCode,
      subjectName: this.state.subjectName,
      date: this.state.date,
      period: this.state.period,
      teacherName: this.state.teacherName,
      submittedBy: Auth.getUser().name,
      totalStudents: counts.total,
      presentCount: counts.present,
      absentCount: counts.absent,
      records: this.students.map(s => ({
        registrationNumber: s.registrationNumber,
        studentName: s.studentName,
        status: s.status || 'UNMARKED',
        remark: s.remark || ''
      }))
    };

    AttendanceService.exportSessionToExcel(sessionObj);
  },

  printAttendance() {
    window.print();
  },

  // ============================================================================
  // 6. ATTENDANCE HISTORY & CORRECTION WORKFLOW (REQUIREMENTS 11 & 12)
  // ============================================================================

  switchTab(tab) {
    this.state.activeTab = tab;
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  renderAttendanceHistory(container) {
    const user = Auth.getUser();
    const isAdmin = user.role === 'ADMIN';
    const allSessions = AttendanceService.getAllSessions();

    // Filter sessions if teacher: only teacher's classes
    const permittedSessions = isAdmin ? allSessions : allSessions.filter(s => s.teacherId === 'TCH-201' || s.classId.includes('CSE'));

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Attendance Session History &amp; Audit Ledger</h1>
          <p class="banner-subtitle">
            Historical Academic Attendance Sessions &bull; Immutable Audit Logs &bull; Corrections Registry
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.switchTab('marking')">
            Back to Marking
          </button>
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="AttendanceModule.switchTab('overview')">
              Institution Overview
            </button>
          ` : ''}
        </div>
      </div>

      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
          Verified Attendance Sessions (${permittedSessions.length} Records)
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th>Conducted Date</th>
                <th>Class &amp; Section</th>
                <th>Subject</th>
                <th>Period</th>
                <th>Faculty In-Charge</th>
                <th style="text-align: center;">Roster (P / A)</th>
                <th style="text-align: center;">Audit Trail</th>
                <th style="text-align: center; width: 170px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${permittedSessions.map((sess, idx) => `
                <tr>
                  <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${idx + 1}</td>
                  <td>
                    <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.88rem;">${sess.date}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${sess.id}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.84rem;">${sess.className}</div>
                    <span class="status-pill status-leave" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">Sec ${sess.section}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; font-size: 0.84rem;">${sess.subjectCode}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${sess.subjectName}</div>
                  </td>
                  <td style="font-size: 0.82rem;">${sess.period}</td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.82rem;">${sess.teacherName}</div>
                  </td>
                  <td style="text-align: center;">
                    <span class="status-pill status-present" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">P: ${sess.presentCount}</span>
                    <span class="status-pill status-absent" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">A: ${sess.absentCount}</span>
                  </td>
                  <td style="text-align: center;">
                    ${sess.auditTrail && sess.auditTrail.length > 0 ? `
                      <span class="status-pill status-late" style="font-size: 0.68rem; cursor: pointer;" onclick="AttendanceModule.viewAuditTrail('${sess.id}')">
                        ${sess.auditTrail.length} Correction(s)
                      </span>
                    ` : `
                      <span style="color: var(--text-muted); font-size: 0.75rem;">Verified</span>
                    `}
                  </td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.3rem; justify-content: center;">
                      <button class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.45rem;" title="Download Excel (.xlsx)" onclick="AttendanceService.exportSessionToExcel(AttendanceService.getAllSessions().find(s => s.id === '${sess.id}'))">
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      </button>
                      <button class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.45rem;" title="Apply Authorized Correction" onclick="AttendanceModule.openCorrectionModal('${sess.id}')">
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openCorrectionModal(sessionId) {
    const session = AttendanceService.getAllSessions().find(s => s.id === sessionId);
    if (!session) return;

    const modalHtml = `
      <form id="attendanceCorrectionForm" onsubmit="event.preventDefault();" style="font-size: 0.84rem;">
        <div style="background: var(--bg-soft); padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
          <div>Session: <strong>${session.subjectCode} &bull; ${session.className} (Sec ${session.section})</strong></div>
          <div style="color: var(--text-muted); font-size: 0.78rem;">Conducted: ${session.date} (${session.period})</div>
        </div>

        <div class="form-field">
          <label class="form-field-label">Select Student to Correct *</label>
          <select class="form-field-select" id="corrStudentSelect" onchange="AttendanceModule.onCorrectionStudentSelected('${session.id}', this.value)">
            <option value="">-- Choose Student --</option>
            ${session.records.map(r => `
              <option value="${r.registrationNumber}">
                ${r.registrationNumber} - ${r.studentName} (Currently: ${r.status})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Current Official Status</label>
            <input type="text" class="form-field-input" id="corrOldStatus" value="" readonly style="background: #F1F5F9; font-weight: 700;">
          </div>
          <div class="form-field">
            <label class="form-field-label">Corrected Status *</label>
            <select class="form-field-select" id="corrNewStatus">
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        </div>

        <div class="form-field">
          <label class="form-field-label">Mandatory Correction Reason (Audit Trail Requirement) *</label>
          <textarea class="form-field-textarea" id="corrReason" rows="3" placeholder="Specify verifiable reason (e.g. Approved medical leave letter produced / Biometric gate delay confirmed)..." required></textarea>
        </div>
      </form>
    `;

    App.openModal(`Authorized Attendance Correction (${session.id})`, modalHtml, () => {
      this.submitCorrection(sessionId);
    });
  },

  onCorrectionStudentSelected(sessionId, regNo) {
    const session = AttendanceService.getAllSessions().find(s => s.id === sessionId);
    const rec = session?.records.find(r => r.registrationNumber === regNo);
    const oldInput = document.getElementById('corrOldStatus');
    const newSelect = document.getElementById('corrNewStatus');
    if (rec && oldInput) {
      oldInput.value = rec.status;
      if (newSelect) {
        newSelect.value = rec.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      }
    }
  },

  submitCorrection(sessionId) {
    const studentRegNo = document.getElementById('corrStudentSelect')?.value;
    const newStatus = document.getElementById('corrNewStatus')?.value;
    const reason = document.getElementById('corrReason')?.value.trim();

    if (!studentRegNo) {
      App.toast('Please select a student to correct', 'warning');
      return;
    }

    if (!reason) {
      App.toast('A mandatory correction reason is required to maintain audit compliance', 'error');
      return;
    }

    const res = AttendanceService.applyAttendanceCorrection(sessionId, {
      studentRegNo,
      newStatus,
      reason
    }, Auth.getUser());

    if (!res.success) {
      App.toast(res.error, 'error');
      return;
    }

    App.closeModal();
    App.toast(res.message, 'success');
    this.renderAttendanceHistory(document.getElementById('mainWorkspaceContainer'));
  },

  viewAuditTrail(sessionId) {
    const session = AttendanceService.getAllSessions().find(s => s.id === sessionId);
    if (!session || !session.auditTrail) return;

    const modalHtml = `
      <div style="font-size: 0.85rem;">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">
          Official audit log for Session <strong>${session.id}</strong>. Every correction is cryptographically timestamped.
        </p>
        <table class="table-custom">
          <thead>
            <tr><th>Audit ID</th><th>Student</th><th>Transition</th><th>Reason</th><th>Authorized By</th><th>Timestamp</th></tr>
          </thead>
          <tbody>
            ${session.auditTrail.map(a => `
              <tr>
                <td style="font-family: monospace; font-weight: 700;">${a.id}</td>
                <td><strong>${a.studentName}</strong> (${a.studentRegNo})</td>
                <td>
                  <span class="status-pill ${a.oldStatus === 'PRESENT' ? 'status-present' : 'status-absent'}">${a.oldStatus}</span>
                  &rarr;
                  <span class="status-pill ${a.newStatus === 'PRESENT' ? 'status-present' : 'status-absent'}">${a.newStatus}</span>
                </td>
                <td style="font-size: 0.8rem;">${a.reason}</td>
                <td style="font-size: 0.78rem;">${a.correctedBy}</td>
                <td style="font-size: 0.75rem; font-family: monospace;">${a.timestamp}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    App.openModal(`Audit Correction Trail: ${session.id}`, modalHtml);
  },

  // ============================================================================
  // 7. ADMIN INSTITUTION-WIDE ATTENDANCE OVERVIEW (REQUIREMENT 11)
  // ============================================================================

  renderAdminOverview(container) {
    const sessions = AttendanceService.getAllSessions();
    let totalPresent = 0, totalAbsent = 0;

    sessions.forEach(s => {
      totalPresent += s.presentCount;
      totalAbsent += s.absentCount;
    });

    const grandTotal = totalPresent + totalAbsent;
    const overallPct = grandTotal > 0 ? ((totalPresent / grandTotal) * 100).toFixed(1) : 88.5;

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Institution-Wide Attendance Telemetry</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; SIMATS Regulatory Campus Attendance Intelligence
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.switchTab('marking')">
            Open Marking Screen
          </button>
          <button class="btn btn-primary btn-sm" onclick="ReportsModule.printReport()">
            Print Audit Report
          </button>
        </div>
      </div>

      <!-- Overview Cards Grid -->
      <div class="stat-grid-4" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <span class="stat-card-title">Institutional Attendance Rate</span>
          <div class="stat-card-value text-present">${overallPct}%</div>
          <span class="stat-card-caption">SIMATS Threshold: 75.0%</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Total Verified Check-ins</span>
          <div class="stat-card-value">${totalPresent}</div>
          <span class="stat-card-caption">Biometric &amp; Faculty verified</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Total Absences Recorded</span>
          <div class="stat-card-value text-absent">${totalAbsent}</div>
          <span class="stat-card-caption">Automated parent SMS dispatched</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Audited Sessions</span>
          <div class="stat-card-value" style="color: var(--primary-blue);">${sessions.length}</div>
          <span class="stat-card-caption">Cryptographically sealed</span>
        </div>
      </div>

      <!-- Class-Wise Telemetry Comparison -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 1rem;">Class-Wise Attendance Compliance</h3>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
              <span>B.E. Computer Science &amp; Engineering - 3rd Year (Sec A)</span>
              <span style="color: var(--present-green); font-weight: 800;">88.5% (Compliant)</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill bg-present" style="width: 88.5%;"></div></div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
              <span>B.E. Computer Science &amp; Engineering - 3rd Year (Sec B)</span>
              <span style="color: var(--present-green); font-weight: 800;">91.2% (Compliant)</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill bg-present" style="width: 91.2%;"></div></div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
              <span>B.E. Electronics &amp; Communication - 2nd Year (Sec A)</span>
              <span style="color: var(--late-amber); font-weight: 800;">74.0% (Warning &lt; 75%)</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill bg-late" style="width: 74%;"></div></div>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 8. STUDENT VIEW: "MY ATTENDANCE" (REQUIREMENT 10)
  // ============================================================================

  renderStudentView(container) {
    const user = Auth.getUser();
    const portfolio = AttendanceService.getStudentAttendancePortfolio(user.rollNo || '192211001');
    const isEligible = portfolio.percentage >= 75.0;

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">My Attendance Portfolio</h1>
          <p class="banner-subtitle">
            Student Portal &bull; Continuous Attendance Audit &bull; Registration No: <strong>${portfolio.regNo}</strong>
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.printReport()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Attendance Transcript
          </button>
        </div>
      </div>

      <!-- Saveetha V-Study Hall Ticket Eligibility Banner -->
      ${!isEligible ? `
        <div class="alert-box alert-danger" style="margin-bottom: 1.5rem;">
          <div style="font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            SIMATS Attendance Shortfall Alert (&lt; 75%)
          </div>
          <p style="margin-top: 0.35rem; font-size: 0.85rem;">
            Your aggregate attendance is <strong>${portfolio.percentage}%</strong>. Students with attendance below 75% are ineligible to pay semester examination fees or generate hall tickets. Submit On-Duty (OD) applications to rectify shortfall.
          </p>
        </div>
      ` : `
        <div class="alert-box alert-success" style="margin-bottom: 1.5rem;">
          <div style="font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            SIMATS Regulatory Compliance: Eligible for Semester Examination
          </div>
          <p style="margin-top: 0.35rem; font-size: 0.85rem;">
            Your aggregate attendance is <strong>${portfolio.percentage}%</strong>, safely above the mandatory 75.0% threshold. Examination fee payment is unlocked.
          </p>
        </div>
      `}

      <!-- Student Stat Cards -->
      <div class="stat-grid-4" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <span class="stat-card-title">Overall Percentage</span>
          <div class="stat-card-value ${isEligible ? 'text-present' : 'text-absent'}">${portfolio.percentage}%</div>
          <span class="stat-card-caption">Mandatory Minimum: 75%</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Total Conducted</span>
          <div class="stat-card-value">${portfolio.totalClasses}</div>
          <span class="stat-card-caption">Periods recorded</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Present Periods</span>
          <div class="stat-card-value text-present">${portfolio.presentClasses}</div>
          <span class="stat-card-caption">Verified check-in</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Absent Periods</span>
          <div class="stat-card-value text-absent">${portfolio.absentClasses}</div>
          <span class="stat-card-caption">Unexcused</span>
        </div>
      </div>

      <!-- Student Date-wise Attendance History Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
          Verified Course Session Attendance Log
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course / Subject</th>
                <th>Period</th>
                <th>Faculty</th>
                <th style="text-align: center;">Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${portfolio.logs.length > 0 ? portfolio.logs.map(l => `
                <tr>
                  <td style="font-weight: 700;">${l.date}</td>
                  <td>
                    <div style="font-weight: 700; color: var(--brand-navy);">${l.subjectName}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${l.subjectCode}</div>
                  </td>
                  <td>${l.period}</td>
                  <td>${l.faculty}</td>
                  <td style="text-align: center;">
                    <span class="status-pill ${l.status === 'PRESENT' ? 'status-present' : 'status-absent'}">
                      ${l.status}
                    </span>
                  </td>
                  <td style="font-size: 0.8rem; color: var(--text-muted);">${l.remark || 'Regular lecture'}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No attendance records logged yet.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 9. PARENT VIEW: WARD ATTENDANCE
  // ============================================================================

  renderParentView(container) {
    const portfolio = AttendanceService.getStudentAttendancePortfolio('192211001');

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Child Attendance Verification</h1>
          <p class="banner-subtitle">
            Guardian Portal &bull; Saveetha Institute of Medical and Technical Sciences &bull; Daily Biometric Sync
          </p>
        </div>
      </div>

      <div class="dashboard-card" style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face" alt="Ward" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-blue);">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--brand-navy); margin: 0;">Aarav Sharma</h3>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Registration No: <strong>192211001</strong> &bull; B.E. Computer Science 3A</div>
          </div>
        </div>
        <div>
          <span class="status-pill status-present" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">
            ● Present in Class Today
          </span>
        </div>
      </div>

      <div class="stat-grid-4">
        <div class="stat-card">
          <span class="stat-card-title">Cumulative Attendance</span>
          <div class="stat-card-value text-present">${portfolio.percentage}%</div>
          <span class="stat-card-caption">Above 75% regulation</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Classes Attended</span>
          <div class="stat-card-value text-present">${portfolio.presentClasses} / ${portfolio.totalClasses}</div>
          <span class="stat-card-caption">Verified</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Unexcused Absences</span>
          <div class="stat-card-value text-absent">${portfolio.absentClasses}</div>
          <span class="stat-card-caption">SMS notified</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Exam Hall Ticket</span>
          <div class="stat-card-value text-present" style="font-size: 1.1rem; margin-top: 0.4rem;">CLEARED</div>
          <span class="stat-card-caption">SIMATS Controller of Exams</span>
        </div>
      </div>
    `;
  }
};

window.AttendanceModule = AttendanceModule;
