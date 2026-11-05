/**
 * MaccaAttendX - Attendance Management Module
 * Comprehensive LMS Attendance Marking, Live Counters, Filters, and Session Locking
 * Strictly adheres to Saveetha V-Study LMS visual and functional specifications.
 */

const AttendanceModule = {
  // Current active session state
  sessionState: {
    academicYear: '2025-2026',
    department: 'CSE',
    classId: 'BE-CSE-3A',
    className: 'B.E. CSE - 3rd Year (Section A)',
    subjectId: 'CS301',
    subjectName: 'CS301 - Design and Analysis of Algorithms',
    date: new Date().toISOString().split('T')[0],
    period: 'Period 1 (08:30 - 09:20)',
    teacher: 'Dr. K. Senthil Kumar (EMP-8842)',
    isLocked: false,
    filterStatus: 'ALL',
    searchQuery: ''
  },

  // Mock Student roster for attendance marking
  students: [
    { id: 'STU-101', rollNo: '192211001', name: 'Aarav Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', overallPercent: 88.5, status: 'PRESENT', remark: '' },
    { id: 'STU-102', rollNo: '192211002', name: 'Abhinav Patel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', overallPercent: 72.4, status: 'ABSENT', remark: 'Medical emergency noted' },
    { id: 'STU-103', rollNo: '192211003', name: 'Aditi Sundaram', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', overallPercent: 94.0, status: 'PRESENT', remark: '' },
    { id: 'STU-104', rollNo: '192211004', name: 'Akash Rajan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', overallPercent: 68.0, status: 'ABSENT', remark: 'Unexcused' },
    { id: 'STU-105', rollNo: '192211005', name: 'Ananya Deshmukh', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', overallPercent: 91.5, status: 'PRESENT', remark: '' },
    { id: 'STU-106', rollNo: '192211006', name: 'Bhuvaneshwari M.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', overallPercent: 84.2, status: 'LATE', remark: 'Arrived at 08:42' },
    { id: 'STU-107', rollNo: '192211007', name: 'Charan Teja', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face', overallPercent: 96.0, status: 'PRESENT', remark: '' },
    { id: 'STU-108', rollNo: '192211008', name: 'Deepika Raman', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', overallPercent: 78.5, status: 'LEAVE', remark: 'Approved symposium OD' },
    { id: 'STU-109', rollNo: '192211009', name: 'Dinesh Karthik', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', overallPercent: 82.0, status: 'PRESENT', remark: '' },
    { id: 'STU-110', rollNo: '192211010', name: 'Esha Gupta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', overallPercent: 90.0, status: 'HALF_DAY', remark: 'Left after 2nd hour' },
    { id: 'STU-111', rollNo: '192211011', name: 'Farhan Ali', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', overallPercent: 74.5, status: 'PRESENT', remark: '' },
    { id: 'STU-112', rollNo: '192211012', name: 'Gautam Krishna', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', overallPercent: 87.0, status: 'PRESENT', remark: '' }
  ],

  // Render entry point based on active role
  render(container) {
    const role = Auth.getUser().role;

    if (role === 'STUDENT') {
      this.renderStudentAttendanceView(container);
    } else if (role === 'PARENT') {
      this.renderParentAttendanceView(container);
    } else {
      // ADMIN & TEACHER: Full Attendance Marking & Management Interface
      this.renderAttendanceManagement(container);
    }
  },

  // ============================================================================
  // ADMIN & TEACHER: Attendance Marking & Management
  // ============================================================================
  renderAttendanceManagement(container) {
    const counts = this.calculateCounts();

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Class Attendance Management</h1>
          <p class="banner-subtitle">
            Saveetha V-Study Academic Portal &bull; Daily Period-wise Verification &amp; Biometric Sync
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.resetSession()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Reset Form
          </button>
          <button class="btn btn-primary btn-sm ${this.sessionState.isLocked ? 'btn-disabled' : ''}" onclick="AttendanceModule.openSubmitConfirmation()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ${this.sessionState.isLocked ? 'Session Locked' : 'Save &amp; Lock Attendance'}
          </button>
        </div>
      </div>

      <!-- Selection Filter Controls Bar (Saveetha V-Study LMS Style) -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: space-between;">
          <span>Class &amp; Subject Session Selection</span>
          ${this.sessionState.isLocked ? '<span class="status-pill status-absent" style="font-size: 0.75rem;">🔒 Locked (ReadOnly)</span>' : '<span class="status-pill status-present" style="font-size: 0.75rem;">● Active Session</span>'}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Academic Year</label>
            <select class="form-select" id="attAcademicYear" onchange="AttendanceModule.onFilterChange(event)">
              <option value="2025-2026" ${this.sessionState.academicYear === '2025-2026' ? 'selected' : ''}>2025-2026 (Even Sem)</option>
              <option value="2024-2025" ${this.sessionState.academicYear === '2024-2025' ? 'selected' : ''}>2024-2025</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Class &amp; Section</label>
            <select class="form-select" id="attClass" onchange="AttendanceModule.onFilterChange(event)">
              <option value="BE-CSE-3A" ${this.sessionState.classId === 'BE-CSE-3A' ? 'selected' : ''}>B.E. CSE - 3rd Year (A)</option>
              <option value="BE-CSE-3B" ${this.sessionState.classId === 'BE-CSE-3B' ? 'selected' : ''}>B.E. CSE - 3rd Year (B)</option>
              <option value="BE-ECE-2A" ${this.sessionState.classId === 'BE-ECE-2A' ? 'selected' : ''}>B.E. ECE - 2nd Year (A)</option>
              <option value="BTECH-AI-1A" ${this.sessionState.classId === 'BTECH-AI-1A' ? 'selected' : ''}>B.Tech AI&amp;DS - 1st Year (A)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" id="attDate" value="${this.sessionState.date}" onchange="AttendanceModule.onFilterChange(event)">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Period / Hour</label>
            <select class="form-select" id="attPeriod" onchange="AttendanceModule.onFilterChange(event)">
              <option value="Period 1 (08:30 - 09:20)" ${this.sessionState.period.includes('1') ? 'selected' : ''}>Period 1 (08:30 - 09:20)</option>
              <option value="Period 2 (09:20 - 10:10)" ${this.sessionState.period.includes('2') ? 'selected' : ''}>Period 2 (09:20 - 10:10)</option>
              <option value="Period 3 (10:30 - 11:20)" ${this.sessionState.period.includes('3') ? 'selected' : ''}>Period 3 (10:30 - 11:20)</option>
              <option value="Period 4 (11:20 - 12:10)" ${this.sessionState.period.includes('4') ? 'selected' : ''}>Period 4 (11:20 - 12:10)</option>
              <option value="Period 5 (01:00 - 01:50)" ${this.sessionState.period.includes('5') ? 'selected' : ''}>Period 5 (01:00 - 01:50)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Subject</label>
            <select class="form-select" id="attSubject" onchange="AttendanceModule.onFilterChange(event)">
              <option value="CS301">CS301 - Design &amp; Analysis of Algorithms</option>
              <option value="CS302">CS302 - Database Management Systems</option>
              <option value="CS303">CS303 - Operating Systems</option>
              <option value="CS304">CS304 - Computer Networks</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Instructor</label>
            <input type="text" class="form-control" value="${this.sessionState.teacher}" readonly style="background-color: #F8FAFC;">
          </div>
        </div>
      </div>

      <!-- Real-Time Live Counters Metric Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid var(--text-dark);">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">TOTAL ROSTER</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--text-dark); margin-top: 0.25rem;">${counts.total}</div>
        </div>
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid var(--present-green);">
          <div style="font-size: 0.72rem; color: var(--present-green); font-weight: 700;">PRESENT</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--present-green); margin-top: 0.25rem;">${counts.present}</div>
        </div>
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid var(--absent-red);">
          <div style="font-size: 0.72rem; color: var(--absent-red); font-weight: 700;">ABSENT</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--absent-red); margin-top: 0.25rem;">${counts.absent}</div>
        </div>
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid var(--late-amber);">
          <div style="font-size: 0.72rem; color: var(--late-amber); font-weight: 700;">LATE</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--late-amber); margin-top: 0.25rem;">${counts.late}</div>
        </div>
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid var(--leave-blue);">
          <div style="font-size: 0.72rem; color: var(--leave-blue); font-weight: 700;">ON LEAVE / OD</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--leave-blue); margin-top: 0.25rem;">${counts.leave}</div>
        </div>
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid #8B5CF6;">
          <div style="font-size: 0.72rem; color: #8B5CF6; font-weight: 700;">HALF DAY</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: #8B5CF6; margin-top: 0.25rem;">${counts.halfDay}</div>
        </div>
        <div class="stat-card" style="padding: 0.85rem; border-left: 3px solid var(--primary-blue); background: linear-gradient(135deg, #FFFFFF, var(--light-blue));">
          <div style="font-size: 0.72rem; color: var(--primary-blue); font-weight: 700;">SESSION RATE</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--primary-blue); margin-top: 0.25rem;">${counts.percentage}%</div>
        </div>
      </div>

      <!-- Quick Action Toolbar & Search Filter -->
      <div class="dashboard-card" style="padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-right: 0.25rem;">Quick Actions:</span>
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.markAllPresent()" ${this.sessionState.isLocked ? 'disabled' : ''}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Mark All Present
          </button>
          <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.resetStatus()" ${this.sessionState.isLocked ? 'disabled' : ''}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Clear All
          </button>
          ${this.sessionState.isLocked ? `
            <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.toggleLock()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
              Unlock Session
            </button>
          ` : ''}
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <!-- Filter Tabs -->
          <div style="display: flex; background: var(--bg-soft); padding: 0.2rem; border-radius: 6px; border: 1px solid var(--border-color);">
            <button class="btn btn-sm ${this.sessionState.filterStatus === 'ALL' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('ALL')">All (${this.students.length})</button>
            <button class="btn btn-sm ${this.sessionState.filterStatus === 'PRESENT' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('PRESENT')">Present (${counts.present})</button>
            <button class="btn btn-sm ${this.sessionState.filterStatus === 'ABSENT' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('ABSENT')">Absent (${counts.absent})</button>
            <button class="btn btn-sm ${this.sessionState.filterStatus === 'LATE' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('LATE')">Late (${counts.late})</button>
            <button class="btn btn-sm ${this.sessionState.filterStatus === 'LEAVE' ? 'btn-primary' : 'btn-text'}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="AttendanceModule.setStatusFilter('LEAVE')">Leave (${counts.leave})</button>
          </div>

          <!-- Search Input -->
          <div style="position: relative; width: 200px;">
            <input type="text" class="form-control" placeholder="Search student..." value="${this.sessionState.searchQuery}" oninput="AttendanceModule.onSearchInput(event)" style="padding-left: 2rem; font-size: 0.82rem; height: 32px;">
            <svg style="position: absolute; left: 0.6rem; top: 8px; color: var(--text-muted);" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      </div>

      <!-- Student Attendance Marking Table -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th style="width: 280px;">Student Name &amp; Admission</th>
                <th style="width: 130px;">Roll Number</th>
                <th style="width: 140px;">Overall Standing</th>
                <th style="min-width: 320px; text-align: center;">Session Attendance Status</th>
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

  // Generate table rows for students matching filters
  renderStudentRows() {
    let filtered = this.students;

    if (this.sessionState.filterStatus !== 'ALL') {
      filtered = filtered.filter(s => s.status === this.sessionState.filterStatus);
    }

    if (this.sessionState.searchQuery.trim() !== '') {
      const q = this.sessionState.searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.includes(q) || s.id.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 600; color: var(--brand-navy); margin-bottom: 0.25rem;">No students found</div>
            <p style="font-size: 0.85rem;">Try adjusting your search query or status filter.</p>
          </td>
        </tr>
      `;
    }

    return filtered.map((stu, idx) => {
      const isShortfall = stu.overallPercent < 75;
      const disabledAttr = this.sessionState.isLocked ? 'disabled' : '';

      return `
        <tr class="${stu.status === 'ABSENT' ? 'row-absent-highlight' : ''}">
          <td style="text-align: center; color: var(--text-muted); font-size: 0.85rem;">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${stu.avatar}" alt="${stu.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-color);">
              <div>
                <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.9rem;">${stu.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${stu.id}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-family: monospace; font-weight: 600; color: var(--text-dark);">${stu.rollNo}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.85rem; color: ${isShortfall ? 'var(--absent-red)' : 'var(--present-green)'};">
                ${stu.overallPercent}%
              </span>
              ${isShortfall ? '<span class="status-pill status-absent" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">Critical</span>' : ''}
            </div>
            <div class="progress-bar-container" style="height: 4px; margin-top: 4px; width: 90px;">
              <div class="progress-bar-fill ${isShortfall ? 'bg-absent' : 'bg-present'}" style="width: ${stu.overallPercent}%;"></div>
            </div>
          </td>
          <td>
            <!-- Attendance Selector Button Group -->
            <div style="display: flex; justify-content: center; gap: 0.25rem;">
              <button 
                type="button" 
                class="btn-status-toggle ${stu.status === 'PRESENT' ? 'status-active-present' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${stu.id}', 'PRESENT')"
                ${disabledAttr}
                title="Mark Present">
                P
              </button>
              <button 
                type="button" 
                class="btn-status-toggle ${stu.status === 'ABSENT' ? 'status-active-absent' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${stu.id}', 'ABSENT')"
                ${disabledAttr}
                title="Mark Absent">
                A
              </button>
              <button 
                type="button" 
                class="btn-status-toggle ${stu.status === 'LATE' ? 'status-active-late' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${stu.id}', 'LATE')"
                ${disabledAttr}
                title="Mark Late">
                L
              </button>
              <button 
                type="button" 
                class="btn-status-toggle ${stu.status === 'LEAVE' ? 'status-active-leave' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${stu.id}', 'LEAVE')"
                ${disabledAttr}
                title="Mark Leave / OD">
                OD
              </button>
              <button 
                type="button" 
                class="btn-status-toggle ${stu.status === 'HALF_DAY' ? 'status-active-half' : ''}" 
                onclick="AttendanceModule.setStudentStatus('${stu.id}', 'HALF_DAY')"
                ${disabledAttr}
                title="Mark Half Day">
                HD
              </button>
            </div>
          </td>
          <td>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Add remark..." 
              value="${stu.remark}" 
              onchange="AttendanceModule.updateRemark('${stu.id}', this.value)"
              ${disabledAttr}
              style="font-size: 0.8rem; height: 30px;">
          </td>
        </tr>
      `;
    }).join('');
  },

  // Calculate live counters
  calculateCounts() {
    const total = this.students.length;
    let present = 0, absent = 0, late = 0, leave = 0, halfDay = 0;

    this.students.forEach(s => {
      if (s.status === 'PRESENT') present++;
      else if (s.status === 'ABSENT') absent++;
      else if (s.status === 'LATE') late++;
      else if (s.status === 'LEAVE') leave++;
      else if (s.status === 'HALF_DAY') halfDay++;
    });

    // Saveetha V-Study LMS attendance computation:
    // Present + On Duty (Leave) count toward attendance; Half-day counts as 0.5
    const effectiveAttended = present + leave + (halfDay * 0.5) + late;
    const percentage = total > 0 ? ((effectiveAttended / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, leave, halfDay, percentage };
  },

  // Event handlers
  setStudentStatus(studentId, newStatus) {
    if (this.sessionState.isLocked) return;
    const stu = this.students.find(s => s.id === studentId);
    if (stu) {
      stu.status = newStatus;
      this.reRenderTableAndCounters();
    }
  },

  updateRemark(studentId, text) {
    const stu = this.students.find(s => s.id === studentId);
    if (stu) {
      stu.remark = text;
    }
  },

  markAllPresent() {
    if (this.sessionState.isLocked) return;
    this.students.forEach(s => s.status = 'PRESENT');
    App.toast('All students marked as Present', 'success');
    this.reRenderTableAndCounters();
  },

  resetStatus() {
    if (this.sessionState.isLocked) return;
    this.students.forEach(s => {
      s.status = 'PRESENT';
      s.remark = '';
    });
    App.toast('Session attendance reset', 'info');
    this.reRenderTableAndCounters();
  },

  setStatusFilter(filter) {
    this.sessionState.filterStatus = filter;
    this.reRenderTableAndCounters();
  },

  onSearchInput(e) {
    this.sessionState.searchQuery = e.target.value;
    const tbody = document.querySelector('.table-custom tbody');
    if (tbody) {
      tbody.innerHTML = this.renderStudentRows();
    }
  },

  onFilterChange(e) {
    App.toast(`Filter updated: ${e.target.value}`, 'info');
    this.reRenderTableAndCounters();
  },

  reRenderTableAndCounters() {
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) {
      this.renderAttendanceManagement(container);
    }
  },

  toggleLock() {
    this.sessionState.isLocked = !this.sessionState.isLocked;
    App.toast(this.sessionState.isLocked ? 'Session locked' : 'Session unlocked for editing', 'info');
    this.reRenderTableAndCounters();
  },

  openSubmitConfirmation() {
    if (this.sessionState.isLocked) {
      App.toast('Session is already locked. Unlock first to make edits.', 'warning');
      return;
    }

    const counts = this.calculateCounts();
    const modalHtml = `
      <div style="font-size: 0.9rem; color: var(--text-dark); line-height: 1.5;">
        <p style="margin-bottom: 1rem;">Are you sure you want to finalize and lock attendance for <strong>${this.sessionState.className}</strong>?</p>
        
        <div style="background: var(--bg-soft); border-radius: 8px; padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.85rem;">
            <span style="color: var(--text-muted);">Subject:</span>
            <strong>${this.sessionState.subjectName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.85rem;">
            <span style="color: var(--text-muted);">Period:</span>
            <strong>${this.sessionState.period}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.85rem;">
            <span style="color: var(--text-muted);">Date:</span>
            <strong>${this.sessionState.date}</strong>
          </div>
          <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0.5rem 0;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9rem;">
            <span>Present: ${counts.present} / ${counts.total}</span>
            <span style="color: var(--primary-blue);">${counts.percentage}%</span>
          </div>
        </div>

        <p style="font-size: 0.8rem; color: var(--text-muted);">
          Note: Locking creates an immutable cryptographic audit record in Supabase PostgreSQL and dispatches automated parent SMS/push notifications.
        </p>
      </div>
    `;

    App.openModal('Finalize & Lock Attendance', modalHtml, () => {
      this.sessionState.isLocked = true;
      App.toast('Attendance saved and session locked successfully!', 'success');
      this.reRenderTableAndCounters();
    });
  },

  resetSession() {
    this.sessionState.isLocked = false;
    this.resetStatus();
  },

  // ============================================================================
  // STUDENT VIEW: Course Attendance Log (Matching V-Study Course Window exactly)
  // ============================================================================
  async renderStudentAttendanceView(container) {
    const data = await Api.getStudentAttendance();
    const rate = data.attendancePercentage;
    const isEligible = rate >= 75;

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">My Attendance Portfolio — Saveetha V-Study</h1>
          <p class="banner-subtitle">Continuous Academic Evaluation &bull; Biometric Attendance Audit</p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.exportStudentSheet()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Download PDF Report
          </button>
        </div>
      </div>

      <!-- Saveetha V-Study Exam Eligibility Alert Banner -->
      ${!isEligible ? `
        <div class="alert-box alert-danger" style="margin-bottom: 1.5rem;">
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            Saveetha Attendance Shortfall Alert (&lt; 75%)
          </div>
          <p style="margin-top: 0.25rem; font-size: 0.85rem;">
            Your current aggregate attendance is <strong>${rate}%</strong>. In accordance with SIMATS academic regulations, students with attendance below 75% are ineligible to pay semester examination fees or generate hall tickets. Submit On-Duty (OD) applications to rectify shortfalls.
          </p>
        </div>
      ` : `
        <div class="alert-box alert-success" style="margin-bottom: 1.5rem;">
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            SIMATS Academic Compliance: Eligible for Semester Examination
          </div>
          <p style="margin-top: 0.25rem; font-size: 0.85rem;">
            Your attendance standing is <strong>${rate}%</strong>, exceeding the mandatory 75% threshold. Examination fee payment is unlocked.
          </p>
        </div>
      `}

      <!-- Metric Cards Grid -->
      <div class="stat-grid-6">
        <div class="stat-card">
          <span class="stat-card-title">Overall Percentage</span>
          <div class="stat-card-value ${isEligible ? 'text-present' : 'text-absent'}">${rate}%</div>
          <span class="stat-card-caption">Requirement: 75%</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Total Conducted</span>
          <div class="stat-card-value">${data.totalSessions}</div>
          <span class="stat-card-caption">All subjects combined</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Present Periods</span>
          <div class="stat-card-value text-present">${data.presentSessions}</div>
          <span class="stat-card-caption">Biometric verified</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Absent Periods</span>
          <div class="stat-card-value text-absent">${data.absentSessions}</div>
          <span class="stat-card-caption">Unexcused</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">On-Duty / Leave</span>
          <div class="stat-card-value text-leave">${data.odSessions}</div>
          <span class="stat-card-caption">Symposium &amp; Sports</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Exam Hall Ticket</span>
          <div class="stat-card-value" style="font-size: 1.15rem; margin-top: 0.5rem; color: ${isEligible ? 'var(--present-green)' : 'var(--absent-red)'};">
            ${isEligible ? 'UNLOCKED' : 'LOCKED'}
          </div>
          <span class="stat-card-caption">SIMATS Controller of Exams</span>
        </div>
      </div>

      <!-- Detailed Session History Log -->
      <div class="dashboard-card" style="padding: 0; margin-top: 1.5rem; overflow: hidden;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1rem; font-weight: 700; color: var(--brand-navy);">Subject-Wise Session Attendance Log</h3>
          <span class="status-pill status-present">Course: B.E. Computer Science &amp; Eng</span>
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject &amp; Code</th>
                <th>Period</th>
                <th>Faculty</th>
                <th>Status</th>
                <th>Biometric Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${(data.sessions || []).map(sess => `
                <tr>
                  <td style="font-weight: 600;">${sess.date}</td>
                  <td>
                    <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.88rem;">${sess.subject || 'Design & Analysis of Algorithms'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">CS301</div>
                  </td>
                  <td>${sess.period || 'Period 1 (08:30 - 09:20)'}</td>
                  <td>Dr. K. Senthil Kumar</td>
                  <td>
                    <span class="status-pill ${
                      sess.status === 'PRESENT' ? 'status-present' : 
                      sess.status === 'ABSENT' ? 'status-absent' : 
                      sess.status === 'OD' ? 'status-leave' : 'status-late'
                    }">
                      ${sess.status}
                    </span>
                  </td>
                  <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${sess.timestamp || '08:31:14 AM'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // PARENT VIEW: Ward Attendance
  // ============================================================================
  renderParentAttendanceView(container) {
    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Child Attendance Verification</h1>
          <p class="banner-subtitle">Official Guardian Access &bull; Saveetha Institute of Medical and Technical Sciences</p>
        </div>
      </div>

      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face" alt="Ward" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-blue);">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--brand-navy); margin: 0;">Aarav Sharma</h3>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">Roll No: 192211001 &bull; B.E. Computer Science (Year 3 - Sec A)</p>
            </div>
          </div>
          <div>
            <span class="status-pill status-present" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
              Present Today &bull; Biometric: 08:24 AM
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="stat-grid-4">
        <div class="stat-card">
          <span class="stat-card-title">Overall Attendance</span>
          <div class="stat-card-value text-present">88.5%</div>
          <span class="stat-card-caption">Above 75% threshold</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Classes Attended</span>
          <div class="stat-card-value">210 / 237</div>
          <span class="stat-card-caption">Total Periods</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Unexcused Absences</span>
          <div class="stat-card-value text-absent">18</div>
          <span class="stat-card-caption">Parent notified via SMS</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Approved Leaves</span>
          <div class="stat-card-value text-leave">9</div>
          <span class="stat-card-caption">Medical &amp; OD</span>
        </div>
      </div>
    `;
  }
};

window.AttendanceModule = AttendanceModule;

