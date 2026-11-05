/**
 * MaccaAttendX - Academic & Attendance Calendar Module
 * Interactive Month/Week Calendar with Day Detail Modals & Status Indicators
 * Follows the Saveetha V-Study LMS visual hierarchy.
 */

const CalendarModule = {
  currentDate: new Date(),
  viewMode: 'month', // 'month' or 'week'

  // Pre-populated mock calendar event & attendance dataset
  attendanceDays: {
    // Format YYYY-MM-DD
    '2026-11-02': { status: 'PRESENT', count: 6, total: 6, details: [{ period: 'Period 1', subject: 'CS301 DAA', status: 'PRESENT' }, { period: 'Period 2', subject: 'CS302 DBMS', status: 'PRESENT' }, { period: 'Period 3', subject: 'CS303 OS', status: 'PRESENT' }, { period: 'Period 4', subject: 'CS304 CN', status: 'PRESENT' }, { period: 'Period 5', subject: 'CS305 Lab', status: 'PRESENT' }, { period: 'Period 6', subject: 'CS305 Lab', status: 'PRESENT' }] },
    '2026-11-03': { status: 'PRESENT', count: 6, total: 6, details: [{ period: 'Period 1', subject: 'CS301 DAA', status: 'PRESENT' }, { period: 'Period 2', subject: 'CS302 DBMS', status: 'PRESENT' }, { period: 'Period 3', subject: 'CS303 OS', status: 'PRESENT' }, { period: 'Period 4', subject: 'CS304 CN', status: 'PRESENT' }, { period: 'Period 5', subject: 'CS307 Library', status: 'PRESENT' }, { period: 'Period 6', subject: 'CS308 Seminar', status: 'PRESENT' }] },
    '2026-11-04': { status: 'LATE', count: 5, total: 6, details: [{ period: 'Period 1', subject: 'CS301 DAA', status: 'LATE' }, { period: 'Period 2', subject: 'CS302 DBMS', status: 'PRESENT' }, { period: 'Period 3', subject: 'CS303 OS', status: 'PRESENT' }, { period: 'Period 4', subject: 'CS304 CN', status: 'PRESENT' }, { period: 'Period 5', subject: 'CS306 Mini-Project', status: 'PRESENT' }, { period: 'Period 6', subject: 'CS306 Mini-Project', status: 'PRESENT' }] },
    '2026-11-05': { status: 'PRESENT', count: 6, total: 6, details: [{ period: 'Period 1', subject: 'CS301 DAA', status: 'PRESENT' }, { period: 'Period 2', subject: 'CS302 DBMS', status: 'PRESENT' }, { period: 'Period 3', subject: 'CS303 OS', status: 'PRESENT' }, { period: 'Period 4', subject: 'CS304 CN', status: 'PRESENT' }] },
    '2026-10-12': { status: 'ABSENT', count: 0, total: 6, details: [{ period: 'All Periods', subject: 'All Classes', status: 'ABSENT', note: 'Medical Leave submitted' }] },
    '2026-10-15': { status: 'LEAVE', count: 6, total: 6, holiday: 'Dr. APJ Abdul Kalam Memorial / SIMATS Tech Fest', details: [{ period: 'All Day', subject: 'SIMATS Innovate 2026', status: 'LEAVE', note: 'Institutional Holiday' }] },
    '2026-10-24': { status: 'HOLIDAY', count: 0, total: 0, holiday: 'Deepavali Festival Holiday' }
  },

  render(container) {
    const year = this.currentDate.getFullYear();
    const monthName = this.currentDate.toLocaleString('default', { month: 'long' });

    container.innerHTML = `
      <!-- Calendar Header -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Academic &amp; Attendance Calendar</h1>
          <p class="banner-subtitle">
            ${monthName} ${year} &bull; Saveetha School of Engineering Official Timetable &amp; Leave Registry
          </p>
        </div>
        <div class="banner-actions">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="CalendarModule.prevMonth()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Prev
            </button>
            <button class="btn btn-secondary btn-sm" onclick="CalendarModule.resetToday()">Today</button>
            <button class="btn btn-secondary btn-sm" onclick="CalendarModule.nextMonth()">
              Next
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Legend & Month Stats -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--present-green);"></span>
            <span>Full Attendance</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--absent-red);"></span>
            <span>Absent</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--late-amber);"></span>
            <span>Late / Partial</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--leave-blue);"></span>
            <span>On-Duty / Holiday</span>
          </div>
        </div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--brand-navy);">
          Academic Working Days: 22 &bull; Total Conducted: 132 Periods
        </div>
      </div>

      <!-- Main Calendar Grid Card -->
      <div class="dashboard-card" style="padding: 1.25rem;">
        <div class="calendar-grid-header" style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 700; font-size: 0.8rem; color: var(--text-muted); padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); text-transform: uppercase;">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div class="calendar-grid-body" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 8px;">
          ${this.generateCalendarDays()}
        </div>
      </div>
    `;
  },

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    let html = '';

    // Leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      html += `
        <div class="calendar-day-cell inactive" style="opacity: 0.35; padding: 0.75rem; min-height: 85px; border-radius: 8px; background: var(--bg-soft); border: 1px solid var(--border-color);">
          <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-muted);">${d}</div>
        </div>
      `;
    }

    // Days in current month
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const record = this.attendanceDays[dateStr];

      let badgeHtml = '';
      let borderStyle = 'border: 1px solid var(--border-color);';

      if (record) {
        if (record.status === 'PRESENT') {
          badgeHtml = `<span class="calendar-tag tag-present">Present (${record.count}/${record.total})</span>`;
          borderStyle = 'border: 1px solid rgba(22, 163, 74, 0.4); background: #F0FDF4;';
        } else if (record.status === 'ABSENT') {
          badgeHtml = `<span class="calendar-tag tag-absent">Absent (0/${record.total})</span>`;
          borderStyle = 'border: 1px solid rgba(220, 38, 38, 0.4); background: #FEF2F2;';
        } else if (record.status === 'LATE') {
          badgeHtml = `<span class="calendar-tag tag-late">Late (${record.count}/${record.total})</span>`;
          borderStyle = 'border: 1px solid rgba(245, 158, 11, 0.4); background: #FFFBEB;';
        } else if (record.status === 'LEAVE' || record.status === 'HOLIDAY') {
          badgeHtml = `<span class="calendar-tag tag-leave">${record.holiday ? 'Holiday' : 'On-Duty'}</span>`;
          borderStyle = 'border: 1px solid rgba(59, 130, 246, 0.4); background: #EFF6FF;';
        }
      }

      html += `
        <div class="calendar-day-cell active-day" 
             style="padding: 0.75rem; min-height: 85px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; ${borderStyle} ${isToday ? 'outline: 2px solid var(--primary-blue);' : ''}"
             onclick="CalendarModule.openDayDetails('${dateStr}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span style="font-weight: 700; font-size: 0.85rem; color: ${isToday ? 'var(--primary-blue)' : 'var(--text-dark)'};">
              ${day} ${isToday ? '<span style="font-size: 0.65rem; background: var(--primary-blue); color: #fff; padding: 1px 4px; border-radius: 4px; margin-left: 2px;">TODAY</span>' : ''}
            </span>
          </div>
          <div style="font-size: 0.72rem;">
            ${badgeHtml}
          </div>
        </div>
      `;
    }

    return html;
  },

  openDayDetails(dateStr) {
    const record = this.attendanceDays[dateStr];
    let body = '';

    if (!record) {
      body = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <p style="color: var(--text-muted); font-size: 0.9rem;">No attendance logged for <strong>${dateStr}</strong>.</p>
          <button class="btn btn-primary btn-sm" onclick="App.closeModal(); Navigation.navigateTo('attendance')">Take Attendance For This Date</button>
        </div>
      `;
    } else {
      body = `
        <div style="font-size: 0.88rem; line-height: 1.5;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 1rem; color: var(--brand-navy);">${dateStr}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${record.holiday || 'Standard Academic Timetable'}</div>
            </div>
            <span class="status-pill status-${record.status.toLowerCase()}">${record.status}</span>
          </div>

          <table class="table-custom" style="width: 100%; font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Period</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(record.details || []).map(d => `
                <tr>
                  <td style="font-weight: 600;">${d.period}</td>
                  <td>${d.subject}</td>
                  <td><span class="status-pill status-${d.status.toLowerCase()}">${d.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    App.openModal(`Academic Date Breakdown: ${dateStr}`, body);
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  resetToday() {
    this.currentDate = new Date();
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  }
};

window.CalendarModule = CalendarModule;
