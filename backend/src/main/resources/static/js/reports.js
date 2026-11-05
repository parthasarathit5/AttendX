/**
 * MaccaAttendX - Attendance Reports Module
 * Academic Analytics, Shortfall Threshold Calculation (<75%), CSV/Excel Export & Print
 * Aligned with SIMATS & Saveetha V-Study LMS requirements.
 */

const ReportsModule = {
  currentFilter: {
    academicYear: '2025-2026',
    classId: 'BE-CSE-3A',
    subjectId: 'ALL',
    threshold: 'ALL', // 'ALL', 'BELOW_75', 'BELOW_65', 'ABOVE_90'
    dateRange: 'semester'
  },

  reportData: [
    { rollNo: '192211001', name: 'Aarav Sharma', department: 'CSE', total: 180, attended: 159, absent: 15, od: 6, percentage: 88.3, status: 'ELIGIBLE' },
    { rollNo: '192211002', name: 'Abhinav Patel', department: 'CSE', total: 180, attended: 130, absent: 46, od: 4, percentage: 72.2, status: 'SHORTFALL' },
    { rollNo: '192211003', name: 'Aditi Sundaram', department: 'CSE', total: 180, attended: 172, absent: 6, od: 2, percentage: 95.5, status: 'ELIGIBLE' },
    { rollNo: '192211004', name: 'Akash Rajan', department: 'CSE', total: 180, attended: 114, absent: 60, od: 6, percentage: 63.3, status: 'DEBARRED' },
    { rollNo: '192211005', name: 'Ananya Deshmukh', department: 'CSE', total: 180, attended: 165, absent: 10, od: 5, percentage: 91.6, status: 'ELIGIBLE' },
    { rollNo: '192211006', name: 'Bhuvaneshwari M.', department: 'CSE', total: 180, attended: 152, absent: 22, od: 6, percentage: 84.4, status: 'ELIGIBLE' },
    { rollNo: '192211007', name: 'Charan Teja', department: 'CSE', total: 180, attended: 176, absent: 2, od: 2, percentage: 97.7, status: 'ELIGIBLE' },
    { rollNo: '192211008', name: 'Deepika Raman', department: 'CSE', total: 180, attended: 142, absent: 28, od: 10, percentage: 78.8, status: 'ELIGIBLE' },
    { rollNo: '192211009', name: 'Dinesh Karthik', department: 'CSE', total: 180, attended: 148, absent: 28, od: 4, percentage: 82.2, status: 'ELIGIBLE' },
    { rollNo: '192211010', name: 'Esha Gupta', department: 'CSE', total: 180, attended: 162, absent: 14, od: 4, percentage: 90.0, status: 'ELIGIBLE' },
    { rollNo: '192211011', name: 'Farhan Ali', department: 'CSE', total: 180, attended: 134, absent: 42, od: 4, percentage: 74.4, status: 'SHORTFALL' },
    { rollNo: '192211012', name: 'Gautam Krishna', department: 'CSE', total: 180, attended: 157, absent: 18, od: 5, percentage: 87.2, status: 'ELIGIBLE' }
  ],

  render(container) {
    const summary = this.computeSummary();

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Institutional Attendance Reports &amp; Analytics</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Official Semester Regulatory Compliance &amp; Hall Ticket Clearance
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.printReport()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print / PDF
          </button>
          <button class="btn btn-primary btn-sm" onclick="ReportsModule.exportCSV()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export to CSV
          </button>
        </div>
      </div>

      <!-- Filters & Threshold Selection -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem;">
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 0.75rem; text-transform: uppercase;">
          Report Filter Parameters
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Academic Year</label>
            <select class="form-select" id="repAcademicYear">
              <option value="2025-2026">2025-2026 (Even Sem)</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Department &amp; Class</label>
            <select class="form-select" id="repClass">
              <option value="BE-CSE-3A">B.E. CSE - 3rd Year (Sec A)</option>
              <option value="BE-CSE-3B">B.E. CSE - 3rd Year (Sec B)</option>
              <option value="BE-ECE-2A">B.E. ECE - 2nd Year (Sec A)</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Subject</label>
            <select class="form-select" id="repSubject">
              <option value="ALL">All Enrolled Subjects</option>
              <option value="CS301">CS301 - Design &amp; Analysis of Algorithms</option>
              <option value="CS302">CS302 - Database Management Systems</option>
              <option value="CS303">CS303 - Operating Systems</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Regulatory Threshold Filter</label>
            <select class="form-select" id="repThreshold" onchange="ReportsModule.setThresholdFilter(this.value)">
              <option value="ALL" ${this.currentFilter.threshold === 'ALL' ? 'selected' : ''}>All Students (Roster)</option>
              <option value="BELOW_75" ${this.currentFilter.threshold === 'BELOW_75' ? 'selected' : ''}>Critical Shortfall (&lt; 75%)</option>
              <option value="BELOW_65" ${this.currentFilter.threshold === 'BELOW_65' ? 'selected' : ''}>Debarred Risk (&lt; 65%)</option>
              <option value="ABOVE_90" ${this.currentFilter.threshold === 'ABOVE_90' ? 'selected' : ''}>Exemplary Attendance (&ge; 90%)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Stat KPIs -->
      <div class="stat-grid-4" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <span class="stat-card-title">Class Average Attendance</span>
          <div class="stat-card-value text-present">${summary.avg}%</div>
          <span class="stat-card-caption">SIMATS Benchmark: 75%</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Total Registered Students</span>
          <div class="stat-card-value">${summary.total}</div>
          <span class="stat-card-caption">B.E. CSE - 3A</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Shortfall &lt; 75% (No Exam Fee)</span>
          <div class="stat-card-value text-absent">${summary.shortfallCount}</div>
          <span class="stat-card-caption">Debarred Candidates: ${summary.debarredCount}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card-title">Exemplary Standing (&ge; 90%)</span>
          <div class="stat-card-value" style="color: var(--primary-blue);">${summary.exemplaryCount}</div>
          <span class="stat-card-caption">Dean's Honour Roll</span>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--brand-navy); margin: 0;">Comprehensive Attendance Ledger</h3>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Showing ${this.getFilteredData().length} of ${this.reportData.length} Students
          </div>
        </div>
        <div class="table-responsive">
          <table class="table-custom" id="reportTable">
            <thead>
              <tr>
                <th style="width: 130px;">Roll Number</th>
                <th>Student Name</th>
                <th style="text-align: center;">Total Periods</th>
                <th style="text-align: center;">Attended</th>
                <th style="text-align: center;">Absent</th>
                <th style="text-align: center;">On-Duty</th>
                <th style="text-align: center;">Attendance %</th>
                <th style="text-align: center;">Exam Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  getFilteredData() {
    let list = this.reportData;
    if (this.currentFilter.threshold === 'BELOW_75') {
      list = list.filter(s => s.percentage < 75);
    } else if (this.currentFilter.threshold === 'BELOW_65') {
      list = list.filter(s => s.percentage < 65);
    } else if (this.currentFilter.threshold === 'ABOVE_90') {
      list = list.filter(s => s.percentage >= 90);
    }
    return list;
  },

  renderTableRows() {
    const list = this.getFilteredData();

    if (list.length === 0) {
      return `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No student records match the selected threshold criteria.
          </td>
        </tr>
      `;
    }

    return list.map(s => {
      const isShortfall = s.percentage < 75;
      const isDebarred = s.percentage < 65;

      return `
        <tr class="${isDebarred ? 'row-absent-highlight' : ''}">
          <td style="font-family: monospace; font-weight: 700; color: var(--text-dark);">${s.rollNo}</td>
          <td>
            <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.9rem;">${s.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${s.department} Department</div>
          </td>
          <td style="text-align: center; font-weight: 600;">${s.total}</td>
          <td style="text-align: center; color: var(--present-green); font-weight: 700;">${s.attended}</td>
          <td style="text-align: center; color: var(--absent-red); font-weight: 700;">${s.absent}</td>
          <td style="text-align: center; color: var(--leave-blue); font-weight: 700;">${s.od}</td>
          <td style="text-align: center;">
            <div style="font-weight: 800; font-size: 0.95rem; color: ${isShortfall ? 'var(--absent-red)' : 'var(--present-green)'};">
              ${s.percentage}%
            </div>
            <div class="progress-bar-container" style="height: 4px; width: 75px; margin: 4px auto 0;">
              <div class="progress-bar-fill ${isShortfall ? 'bg-absent' : 'bg-present'}" style="width: ${s.percentage}%;"></div>
            </div>
          </td>
          <td style="text-align: center;">
            ${isDebarred ? `
              <span class="status-pill status-absent">DEBARRED (&lt;65%)</span>
            ` : isShortfall ? `
              <span class="status-pill status-late">SHORTFALL (NO EXAM)</span>
            ` : `
              <span class="status-pill status-present">ELIGIBLE (FEES OPEN)</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  computeSummary() {
    const total = this.reportData.length;
    let sum = 0;
    let shortfallCount = 0;
    let debarredCount = 0;
    let exemplaryCount = 0;

    this.reportData.forEach(s => {
      sum += s.percentage;
      if (s.percentage < 65) debarredCount++;
      if (s.percentage < 75) shortfallCount++;
      if (s.percentage >= 90) exemplaryCount++;
    });

    const avg = (sum / total).toFixed(1);
    return { total, avg, shortfallCount, debarredCount, exemplaryCount };
  },

  setThresholdFilter(val) {
    this.currentFilter.threshold = val;
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  exportCSV() {
    const list = this.getFilteredData();
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Roll Number,Student Name,Department,Total Periods,Attended,Absent,On-Duty,Percentage,Exam Status\r\n';

    list.forEach(row => {
      csvContent += `"${row.rollNo}","${row.name}","${row.department}",${row.total},${row.attended},${row.absent},${row.od},${row.percentage}%,"${row.status}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MaccaAttendX_Attendance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.toast('CSV Report downloaded successfully', 'success');
  },

  exportStudentSheet() {
    this.exportCSV();
  },

  exportReport(type) {
    if (type === 'excel') {
      this.exportCSV();
    } else {
      this.printReport();
    }
  },

  printReport() {
    window.print();
  }
};

window.ReportsModule = ReportsModule;

