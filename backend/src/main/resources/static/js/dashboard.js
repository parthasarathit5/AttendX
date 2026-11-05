/**
 * MaccaAttendX - Role-based Dashboard & View Renderer
 * Renders Admin, Teacher, Student, and Parent LMS Dashboards
 */

const Dashboard = {
  async renderView(viewId) {
    const container = document.getElementById('mainWorkspaceContainer');
    if (!container) return;

    const user = Auth.getUser();

    // If navigating to main dashboard for current role
    if (viewId === 'dashboard') {
      if (user.role === 'ADMIN') {
        this.renderAdminDashboard(container);
      } else if (user.role === 'TEACHER') {
        this.renderTeacherDashboard(container);
      } else if (user.role === 'STUDENT') {
        this.renderStudentDashboard(container);
      } else if (user.role === 'PARENT') {
        this.renderParentDashboard(container);
      }
      return;
    }

    // Secondary screen handlers
    if (viewId === 'attendance' || viewId === 'my-attendance') {
      window.AttendanceModule?.render(container);
    } else if (viewId === 'calendar' || viewId === 'attendance-calendar') {
      window.CalendarModule?.render(container);
    } else if (viewId === 'reports') {
      window.ReportsModule?.render(container);
    } else {
      this.renderGenericModuleView(container, viewId);
    }
  },

  // ============================================================================
  // 1. ADMIN DASHBOARD
  // ============================================================================
  async renderAdminDashboard(container) {
    const data = await Api.getDashboardData('ADMIN');
    const s = data.stats;

    container.innerHTML = `
      <!-- Greeting Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Administrator Portal — Saveetha School of Engineering</h1>
          <p class="banner-subtitle">Real-time attendance telemetry, institutional statistics &amp; academic compliance</p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.ReportsModule?.exportReport('excel')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export Sheet
          </button>
          <button class="btn btn-primary btn-sm" onclick="Navigation.navigateTo('attendance')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Take Attendance
          </button>
        </div>
      </div>

      <!-- 8-Card Stat Grid (Direct Admin Specification) -->
      <div class="stat-grid-8">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Total Students</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.totalStudents.toLocaleString()}</div>
          <div class="stat-card-footer">
            <span class="trend-badge trend-up">↑ 120 new</span>
            <span>Enrolled in 2025-26</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Total Teachers</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.totalTeachers}</div>
          <div class="stat-card-footer">
            <span>Faculty across 8 Departments</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Total Classes</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.totalClasses}</div>
          <div class="stat-card-footer">
            <span>Sections A, B &amp; C</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Total Subjects</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.totalSubjects}</div>
          <div class="stat-card-footer">
            <span>Theory &amp; Lab Practicums</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Today's Present</span>
            <div class="stat-icon-bubble bubble-green">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-present);">${s.todayPresent.toLocaleString()}</div>
          <div class="stat-card-footer">
            <span>Physical &amp; QR verified</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Today's Absent</span>
            <div class="stat-icon-bubble bubble-red">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-absent);">${s.todayAbsent}</div>
          <div class="stat-card-footer">
            <span>Automated parent SMS dispatched</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Late Students</span>
            <div class="stat-icon-bubble bubble-amber">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-late);">${s.lateStudents}</div>
          <div class="stat-card-footer">
            <span>Entry after 08:35 AM</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Attendance Rate</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--primary-blue);">${s.attendancePct}%</div>
          <div class="stat-card-footer">
            <span class="trend-badge trend-up">Above 75% target</span>
          </div>
        </div>
      </div>

      <!-- 2-Column: Attendance Trends & Class-wise Comparison -->
      <div class="dashboard-grid-2-1">
        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Weekly Attendance Telemetry</h3>
              <p class="card-subtitle">Monday to Friday attendance pattern</p>
            </div>
            <span class="status-pill present">Live Telemetry</span>
          </div>
          <div class="chart-container">
            <canvas id="weeklyAttendanceChart"></canvas>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Class Attendance Benchmark</h3>
              <p class="card-subtitle">Comparison against 75% threshold</p>
            </div>
          </div>
          <div class="comparison-list">
            ${data.classComparisons.map(c => `
              <div class="comparison-item">
                <div class="comparison-label-row">
                  <span>${c.name}</span>
                  <span style="color: ${c.pct < 75 ? 'var(--color-absent)' : 'var(--text-dark)'};">${c.pct}%</span>
                </div>
                <div class="comparison-bar-track">
                  <div class="comparison-bar-fill" style="width: ${c.pct}%; background: ${c.pct < 75 ? 'var(--color-absent)' : 'linear-gradient(90deg, #1E40AF, #2563EB)'};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 2-Column: Low Attendance Watchlist & Pending Leave Approvals -->
      <div class="dashboard-grid-1-1">
        <div class="table-card">
          <div class="table-header-toolbar">
            <div>
              <h3 class="table-heading">Low Attendance Watchlist (&lt; 75%)</h3>
              <p style="font-size: 0.72rem; color: var(--color-absent); font-weight: 600;">Immediate student alert required for semester exam hall ticket clearance</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.showToast('Dispatched automated warning SMS to parents', 'warning')">Alert All</button>
          </div>
          <div class="table-responsive">
            <table class="lms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Attendance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${data.lowAttendanceWatchlist.map(s => `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--text-dark);">${s.name}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${s.regNo}</div>
                    </td>
                    <td>${s.class}</td>
                    <td><span class="status-pill absent">${s.pct}%</span></td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="App.showToast('Counseling notification sent to ${s.name}', 'info')">Contact</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Pending Leave &amp; OD Requests</h3>
              <p class="card-subtitle">On-Duty symposium, medical &amp; sports applications</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="Navigation.navigateTo('leave')">View All</button>
          </div>
          <div class="activity-list">
            ${MockData.leaveRequests.map(l => `
              <div class="activity-item">
                <div class="activity-icon bubble-amber">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div style="flex: 1;">
                  <div class="activity-title">${l.studentName} (${l.rollNo})</div>
                  <div class="activity-meta">${l.leaveType} • ${l.startDate} to ${l.endDate}</div>
                  <div style="font-size: 0.75rem; color: var(--text-dark); margin-top: 0.25rem;">${l.reason}</div>
                </div>
                <div>
                  <span class="status-pill ${l.status === 'APPROVED' ? 'present' : 'late'}">${l.status}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.drawWeeklyChart('weeklyAttendanceChart');
  },

  // ============================================================================
  // 2. TEACHER DASHBOARD
  // ============================================================================
  async renderTeacherDashboard(container) {
    const data = await Api.getDashboardData('TEACHER');
    const s = data.stats;

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Faculty Portal — Prof. Priya Swaminathan</h1>
          <p class="banner-subtitle">Department of Computer Science &amp; Engineering • Cabin A-304</p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-primary btn-sm" onclick="Navigation.navigateTo('attendance')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Mark Session Attendance
          </button>
        </div>
      </div>

      <!-- 7 Teacher Stat Cards -->
      <div class="stat-grid-7">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">My Classes</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.myClasses}</div>
          <div class="stat-card-footer"><span>Assigned Sections</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">My Subjects</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.mySubjects}</div>
          <div class="stat-card-footer"><span>Theory &amp; Telemetry Lab</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Total Students</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.totalStudents}</div>
          <div class="stat-card-footer"><span>Under Supervision</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Today's Classes</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.todayClasses}</div>
          <div class="stat-card-footer"><span>Scheduled lectures</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Marked Sessions</span>
            <div class="stat-icon-bubble bubble-green">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-present);">${s.markedCount}</div>
          <div class="stat-card-footer"><span>Locked &amp; synced</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Pending Sessions</span>
            <div class="stat-icon-bubble bubble-amber">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-late);">${s.pendingCount}</div>
          <div class="stat-card-footer"><span>Period 4 Practicum</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Average Attendance</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--primary-blue);">${s.avgAttendance}%</div>
          <div class="stat-card-footer"><span class="trend-badge trend-up">High compliance</span></div>
        </div>
      </div>

      <!-- Teacher's Today's Timetable with Quick Actions -->
      <div class="dashboard-grid-2-1">
        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Today's Academic Schedule</h3>
              <p class="card-subtitle">Class lecture slots &amp; attendance status</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="Navigation.navigateTo('timetable')">Full Schedule</button>
          </div>
          <div>
            ${data.todaySchedule.map(slot => `
              <div class="timetable-mini-slot">
                <div>
                  <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.88rem;">${slot.subject}</div>
                  <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">${slot.class} • Venue: <strong>${slot.room}</strong></div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <span class="slot-time-badge">${slot.period}</span>
                  ${slot.status === 'COMPLETED' 
                    ? `<span class="status-pill present">Marked</span>`
                    : `<button class="btn btn-primary btn-sm" onclick="Navigation.navigateTo('attendance')">Mark Now</button>`}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Live QR Code Session</h3>
              <p class="card-subtitle">Generate rotating token for classroom</p>
            </div>
          </div>
          <div style="text-align: center; padding: 1rem 0;">
            <div style="width: 140px; height: 140px; margin: 0 auto 1rem; border: 2px dashed #93C5FD; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #EFF6FF;">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.showToast('Generated QR code for Period 4 Practicum (Valid for 5 mins)', 'success')">
              Activate Live QR Code
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 3. STUDENT DASHBOARD
  // ============================================================================
  async renderStudentDashboard(container) {
    const data = await Api.getDashboardData('STUDENT');
    const s = data.stats;

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">My Learning Portal — Arun Kumar S</h1>
          <p class="banner-subtitle">B.Tech CSE - 3rd Year (Section A) • Register No: 192111001</p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="App.openModal('hallTicketModal')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Hall Ticket
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.openModal('qrScannerModal')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            Scan Class QR
          </button>
        </div>
      </div>

      <!-- 6 Student Stat Cards -->
      <div class="stat-grid-8" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Overall Attendance</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--primary-blue);">${s.overallPct}%</div>
          <div class="stat-card-footer"><span class="trend-badge trend-up">Eligible (&gt;75%)</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Present Periods</span>
            <div class="stat-icon-bubble bubble-green">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-present);">${s.presentPeriods}</div>
          <div class="stat-card-footer"><span>Regular lectures</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Absent Periods</span>
            <div class="stat-icon-bubble bubble-red">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-absent);">${s.absentPeriods}</div>
          <div class="stat-card-footer"><span>Unexcused</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Late Periods</span>
            <div class="stat-icon-bubble bubble-amber">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-late);">${s.latePeriods}</div>
          <div class="stat-card-footer"><span>Recorded entry</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Approved OD</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--primary-blue);">${s.leavePeriods}</div>
          <div class="stat-card-footer"><span>SIH 2026 Participation</span></div>
        </div>
      </div>

      <!-- Subject-wise Attendance Breakdown -->
      <div class="dashboard-grid-2-1">
        <div class="dashboard-card">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Subject-wise Attendance Status</h3>
              <p class="card-subtitle">Keep each subject above the 75% examination threshold</p>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${data.subjects.map(sub => `
              <div style="border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 1rem; background: ${sub.warning ? '#FFFBEB' : '#FFFFFF'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div>
                    <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary-blue); background: var(--light-blue); padding: 0.15rem 0.45rem; border-radius: 4px;">${sub.code}</span>
                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--brand-navy); margin-top: 0.25rem;">${sub.name}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">${sub.present} Attended / ${sub.total} Delivered</div>
                  </div>
                  <span class="status-pill ${sub.pct >= 75 ? 'present' : 'absent'}">${sub.pct}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill ${sub.pct >= 75 ? 'green' : 'red'}" style="width: ${sub.pct}%;"></div>
                </div>
                ${sub.warning ? `<div style="font-size: 0.72rem; color: var(--color-absent); font-weight: 700; margin-top: 0.4rem;">⚠️ Warning: Attend 3 more consecutive sessions to reach 75%</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-row">
            <h3 class="card-title">Attendance Calendar</h3>
          </div>
          <div id="studentMiniCalendarContainer">
            <!-- Rendered by Calendar Module -->
          </div>
        </div>
      </div>
    `;

    window.CalendarModule?.renderMini('studentMiniCalendarContainer');
  },

  // ============================================================================
  // 4. PARENT DASHBOARD
  // ============================================================================
  async renderParentDashboard(container) {
    const data = await Api.getDashboardData('PARENT');
    const s = data.stats;

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Parent Guardian Portal — Mr. Sundaram K</h1>
          <p class="banner-subtitle">Official Attendance Monitoring &amp; Biometric Telemetry for Linked Students</p>
        </div>
      </div>

      <!-- 4 Parent Stat Cards -->
      <div class="stat-grid-4">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Linked Children</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <div class="stat-card-value">${s.linkedChildren}</div>
          <div class="stat-card-footer"><span>Aarav (CSE) &amp; Diya (ECE)</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Today's Status</span>
            <div class="stat-icon-bubble bubble-green">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="font-size: 1.25rem; color: var(--color-present);">${s.todayAttendance}</div>
          <div class="stat-card-footer"><span>Verified on-campus</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Cumulative Attendance</span>
            <div class="stat-icon-bubble bubble-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="font-size: 1.15rem; color: var(--brand-navy);">${s.overallPct}</div>
          <div class="stat-card-footer"><span class="trend-badge trend-up">Both above 75% target</span></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-card-title">Unexcused Absences</span>
            <div class="stat-icon-bubble bubble-green">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
          </div>
          <div class="stat-card-value" style="color: var(--color-present);">${s.absentNotifications}</div>
          <div class="stat-card-footer"><span>Zero alerts this week</span></div>
        </div>
      </div>

      <!-- Child Breakdown Cards -->
      <div class="dashboard-grid-1-1">
        ${data.children.map(child => `
          <div class="dashboard-card">
            <div class="card-header-row">
              <div>
                <h3 class="card-title">${child.name}</h3>
                <p class="card-subtitle">${child.grade} • Reg: ${child.regNo}</p>
              </div>
              <span class="status-pill present">Present Today</span>
            </div>
            <div style="background: var(--bg-main); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-dark);">Overall Attendance</span>
                <span style="font-weight: 800; color: var(--primary-blue); font-size: 1.1rem;">${child.overallPct}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill green" style="width: ${child.overallPct}%;"></div>
              </div>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Biometric check-in: ${child.recentDate}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Generic Module Placeholder View
  renderGenericModuleView(container, viewId) {
    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">${viewId.toUpperCase().replace('-', ' ')}</h1>
          <p class="banner-subtitle">MaccaAttendX LMS Academic Management Module</p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="Navigation.navigateTo('dashboard')">Back to Dashboard</button>
        </div>
      </div>
      <div class="dashboard-card" style="padding: 2.5rem; text-align: center;">
        <div style="width: 56px; height: 56px; margin: 0 auto 1rem; border-radius: 50%; background: var(--light-blue); color: var(--primary-blue); display: flex; align-items: center; justify-content: center;">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        </div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 0.5rem;">${viewId.replace('-', ' ').toUpperCase()} Service Active</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 500px; margin: 0 auto 1.5rem;">
          This module is integrated with MaccaAttendX database schemas and Spring Boot REST APIs.
        </p>
        <button class="btn btn-primary btn-sm" onclick="Navigation.navigateTo('attendance')">Open Attendance Management</button>
      </div>
    `;
  },

  drawWeeklyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const rates = [88.5, 91.2, 87.4, 85.9, 89.0];

    const padding = 35;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw baseline grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    [70, 80, 90, 100].forEach(val => {
      const y = padding + h - ((val - 60) / 40) * h;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${val}%`, 8, y + 3);
    });

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 3;

    const points = days.map((day, idx) => {
      const x = padding + (idx / (days.length - 1)) * w;
      const y = padding + h - ((rates[idx] - 60) / 40) * h;
      return { x, y, rate: rates[idx], day };
    });

    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(points[points.length - 1].x, padding + h);
    ctx.lineTo(points[0].x, padding + h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padding, 0, padding + h);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw point dots
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt.day, pt.x, canvas.height - 12);
      ctx.fillText(`${pt.rate}%`, pt.x, pt.y - 10);
    });
  }
};

window.Dashboard = Dashboard;
