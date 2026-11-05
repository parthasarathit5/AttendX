/**
 * AttendX - LMS Course Window Frontend Application
 * Primary Reference: Saveetha V-Study Course Window
 * Course Offering ID: 2851d026-2f7b-46c4-92a5-053cf5e4f57d
 */

const API_BASE = window.location.origin;
const DEFAULT_COURSE_ID = "2851d026-2f7b-46c4-92a5-053cf5e4f57d";

// Global App State
const state = {
  currentRole: 'student', // 'student' or 'faculty'
  currentTab: 'attendance',
  courseOfferingId: DEFAULT_COURSE_ID,
  registerNumber: '192111001',
  studentName: 'Arun Kumar S',
  courseData: null,
  topics: [],
  sessions: [],
  attendanceData: {
    logs: [],
    summary: {
      total_sessions: 0,
      present_sessions: 0,
      absent_sessions: 0,
      od_sessions: 0,
      attendance_percentage: 0,
      is_eligible: false,
      minimum_percentage: 75.0,
      shortfall_sessions: 0,
      exam_fee_amount: 1500
    }
  },
  odRequests: [],
  statusFilter: 'all'
};

// DOM Initializer
document.addEventListener('DOMContentLoaded', () => {
  initUrlParams();
  setupEventListeners();
  loadAllData();
});

// Read offering ID from URL query if passed (e.g. ?courseOfferingId=...)
function initUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const qId = params.get('courseOfferingId');
  if (qId) {
    state.courseOfferingId = qId;
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Sidebar Toggle
  const toggleBtn = document.getElementById('toggleSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Role Switcher (Student / Faculty)
  const roleStudentBtn = document.getElementById('roleStudentBtn');
  const roleFacultyBtn = document.getElementById('roleFacultyBtn');

  if (roleStudentBtn && roleFacultyBtn) {
    roleStudentBtn.addEventListener('click', () => switchRole('student'));
    roleFacultyBtn.addEventListener('click', () => switchRole('faculty'));
  }

  // Tab Pills
  const tabButtons = document.querySelectorAll('.pill-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Table Filter
  const filterSelect = document.getElementById('attendanceFilterSelect');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      renderAttendanceTable();
    });
  }

  // Global Search
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      filterSessionsAndLogs(query);
    });
  }
}

function switchRole(role) {
  state.currentRole = role;
  document.getElementById('roleStudentBtn').classList.toggle('active', role === 'student');
  document.getElementById('roleFacultyBtn').classList.toggle('active', role === 'faculty');
  
  const facultyActionBtns = document.querySelectorAll('.faculty-only');
  const studentActionBtns = document.querySelectorAll('.student-only');
  
  facultyActionBtns.forEach(el => el.style.display = role === 'faculty' ? 'inline-flex' : 'none');
  studentActionBtns.forEach(el => el.style.display = role === 'student' ? 'inline-flex' : 'none');

  const profileName = document.getElementById('profileName');
  const profileReg = document.getElementById('profileReg');
  if (role === 'student') {
    profileName.textContent = 'Arun Kumar S';
    profileReg.textContent = '192111001 • CSE';
  } else {
    profileName.textContent = 'Dr. K. Ravichandran';
    profileReg.textContent = 'FAC0482 • Faculty In-Charge';
  }

  showToast(`Switched view to ${role.toUpperCase()} role`, 'info');
  renderCurrentTab();
}

function switchTab(tabName) {
  state.currentTab = tabName;
  document.querySelectorAll('.pill-tab').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
  });

  document.querySelectorAll('.tab-pane').forEach(p => {
    p.style.display = p.id === `tab-${tabName}` ? 'block' : 'none';
  });

  renderCurrentTab();
}

// Fetch all initial data
async function loadAllData() {
  try {
    await Promise.all([
      fetchCourseOffering(),
      fetchAttendanceData(),
      fetchTopics(),
      fetchSessions(),
      fetchOdRequests()
    ]);
  } catch (err) {
    console.error("Failed to load initial data:", err);
  }
}

// API Calls
async function fetchCourseOffering() {
  try {
    const res = await fetch(`${API_BASE}/api/course-offerings/${state.courseOfferingId}`);
    if (res.ok) {
      state.courseData = await res.json();
      renderCourseHeader();
    }
  } catch (e) {
    console.warn("Using offline fallback course metadata", e);
    state.courseData = {
      course_offering_id: state.courseOfferingId,
      course_code: "21CS301",
      course_name: "Distributed Cloud Computing & Attendance Telemetry",
      department: "Department of Computer Science and Engineering",
      semester: "Semester VI",
      academic_year: "2025-2026",
      credits: 4,
      faculty_name: "Dr. K. Ravichandran, M.E., Ph.D.",
      launched: true,
      syllabus_summary: "Comprehensive study of distributed systems, telemetry pipelines, consensus algorithms, and Supabase cloud persistence."
    };
    renderCourseHeader();
  }
}

async function fetchAttendanceData() {
  try {
    const res = await fetch(`${API_BASE}/api/course-attendance/course-offerings/${state.courseOfferingId}/my-attendance?registerNumber=${state.registerNumber}`);
    if (res.ok) {
      state.attendanceData = await res.json();
      renderAttendanceMetrics();
      renderAttendanceTable();
      renderEligibilityBanner();
    }
  } catch (e) {
    console.error("Attendance fetch error", e);
  }
}

async function fetchTopics() {
  try {
    const res = await fetch(`${API_BASE}/api/course-offerings/${state.courseOfferingId}/topics`);
    if (res.ok) {
      state.topics = await res.json();
      renderTopics();
    }
  } catch (e) {
    console.error("Topics fetch error", e);
  }
}

async function fetchSessions() {
  try {
    const res = await fetch(`${API_BASE}/api/course-offerings/${state.courseOfferingId}/sessions`);
    if (res.ok) {
      state.sessions = await res.json();
      renderSessions();
    }
  } catch (e) {
    console.error("Sessions fetch error", e);
  }
}

async function fetchOdRequests() {
  try {
    const res = await fetch(`${API_BASE}/api/od-requests?courseOfferingId=${state.courseOfferingId}`);
    if (res.ok) {
      state.odRequests = await res.json();
      renderOdSection();
    }
  } catch (e) {
    console.error("OD requests fetch error", e);
  }
}

// Render Functions
function renderCourseHeader() {
  if (!state.courseData) return;
  const c = state.courseData;
  document.getElementById('courseCodeBadge').textContent = c.course_code || '21CS301';
  document.getElementById('creditsBadge').textContent = `${c.credits || 4} Credits`;
  document.getElementById('offeringIdText').textContent = c.course_offering_id || DEFAULT_COURSE_ID;
  document.getElementById('courseTitle').textContent = c.course_name || 'Course Window';
  document.getElementById('facultyNameText').textContent = c.faculty_name || 'Faculty In-Charge';
  document.getElementById('academicYearText').textContent = `${c.academic_year || '2025-2026'} • ${c.semester || 'Semester VI'}`;
  document.getElementById('departmentText').textContent = c.department || 'Department of Computer Science and Engineering';

  // Overview tab metadata
  document.getElementById('overviewCourseDesc').textContent = c.syllabus_summary || 'Course details loading...';
  document.getElementById('overviewCoordinator').textContent = c.faculty_name || 'Dr. K. Ravichandran';
}

function renderAttendanceMetrics() {
  const sum = state.attendanceData.summary;
  document.getElementById('metricTotalSessions').textContent = sum.total_sessions || 0;
  document.getElementById('metricPresentSessions').textContent = sum.present_sessions || 0;
  document.getElementById('metricAbsentSessions').textContent = sum.absent_sessions || 0;
  document.getElementById('metricAttendancePct').textContent = `${Number(sum.attendance_percentage || 0).toFixed(2)}%`;

  // Update Exam Fees button behavior matching V-Study inspected logic
  const payExamBtn = document.getElementById('payExamFeesBtn');
  const feeWarning = document.getElementById('examFeeWarning');
  
  if (sum.is_eligible) {
    payExamBtn.disabled = false;
    payExamBtn.title = "Proceed to pay semester examination fees";
    payExamBtn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      Pay Exam Fees (₹${sum.exam_fee_amount || 1500})
    `;
    feeWarning.style.display = 'none';
  } else {
    payExamBtn.disabled = true;
    payExamBtn.title = `Attendance is below required ${sum.minimum_percentage}%`;
    payExamBtn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 10-8 0 4 4 0 008 0zM5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      Pay Exam Fees (Locked)
    `;
    feeWarning.style.display = 'flex';
    document.getElementById('shortfallWarningText').textContent = 
      `Attendance ${sum.attendance_percentage}% is below required ${sum.minimum_percentage}%. Attend ${sum.shortfall_sessions} more sessions to unlock.`;
  }
}

function renderEligibilityBanner() {
  const sum = state.attendanceData.summary;
  const dot = document.getElementById('statusIndicatorDot');
  const title = document.getElementById('eligibilityTitle');
  const desc = document.getElementById('eligibilityDesc');
  const fill = document.getElementById('eligibilityProgressFill');

  fill.style.width = `${Math.min(100, Math.max(0, sum.attendance_percentage))}%`;

  if (sum.attendance_percentage >= sum.minimum_percentage) {
    dot.className = 'alert-indicator-dot eligible';
    title.textContent = 'Eligible for Semester Examination & Hall Ticket';
    desc.textContent = `Current attendance ${sum.attendance_percentage}% satisfies the mandatory ${sum.minimum_percentage}% academic policy requirement.`;
    fill.className = 'progress-fill green';
  } else if (sum.attendance_percentage >= 65) {
    dot.className = 'alert-indicator-dot warning';
    title.textContent = 'Warning: Attendance Below Safe Threshold';
    desc.textContent = `Attendance is at ${sum.attendance_percentage}%. You need ${sum.shortfall_sessions} additional attended sessions to achieve 75%.`;
    fill.className = 'progress-fill amber';
  } else {
    dot.className = 'alert-indicator-dot critical';
    title.textContent = 'Critical Shortfall: Exam Hall Ticket Locked';
    desc.textContent = `Attendance ${sum.attendance_percentage}% is in the critical red zone. Submit approved OD or contact the Course Coordinator immediately.`;
    fill.className = 'progress-fill red';
  }
}

function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let logs = state.attendanceData.logs || [];
  if (state.statusFilter !== 'all') {
    logs = logs.filter(l => (l.status || '').toLowerCase() === state.statusFilter.toLowerCase());
  }

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: #94a3b8;">
          No attendance records found matching the selected filter.
        </td>
      </tr>
    `;
    return;
  }

  logs.forEach((log, index) => {
    const tr = document.createElement('tr');
    
    // Status Badge
    let statusClass = 'present';
    let statusLabel = 'Present';
    const st = (log.status || '').toLowerCase();
    
    if (st === 'on_duty' || st === 'od') {
      statusClass = 'on_duty';
      statusLabel = 'OD (On Duty)';
    } else if (st === 'absent') {
      statusClass = 'absent';
      statusLabel = 'Absent';
    }

    // Faculty quick toggle cell in faculty mode
    const actionCell = state.currentRole === 'faculty' ? `
      <button class="btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.72rem;" onclick="openEditAttendanceModal('${log.session_number}', '${log.status}')">
        Edit
      </button>
    ` : (log.verification_method || 'PORTAL');

    tr.innerHTML = `
      <td style="font-weight: 600; color: #64748b;">${index + 1}</td>
      <td style="font-weight: 500;">${formatDate(log.date)}</td>
      <td>
        <span style="font-weight: 600; color: #1e40af;">Session #${log.session_number}</span>
      </td>
      <td>
        <span class="status-pill ${statusClass}">
          ${statusLabel}
        </span>
      </td>
      <td style="font-size: 0.75rem; color: #64748b;">${actionCell}</td>
      <td style="font-size: 0.75rem; color: #64748b;">${log.faculty_remarks || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTopics() {
  const container = document.getElementById('topicsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (state.topics.length === 0) {
    container.innerHTML = `<p style="padding: 1rem; color: #94a3b8;">No topics published yet.</p>`;
    return;
  }

  // Group by unit
  const units = {};
  state.topics.forEach(t => {
    if (!units[t.unit_number]) units[t.unit_number] = [];
    units[t.unit_number].push(t);
  });

  Object.keys(units).forEach(unitNum => {
    const list = units[unitNum];
    const unitBox = document.createElement('div');
    unitBox.className = 'session-card';
    
    const unitTitle = list[0].unit_title || `Unit ${unitNum}`;
    
    let topicsHtml = list.map(item => `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;">
        <div>
          <div style="font-size: 0.85rem; font-weight: 600; color: #1e293b;">${item.topic_name}</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.2rem;">${item.learning_outcomes || 'Core unit syllabus outcome'}</div>
        </div>
        <span style="font-size: 0.72rem; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 0.2rem 0.5rem; border-radius: 4px;">
          ${item.hours_allocated || 4} hrs
        </span>
      </div>
    `).join('');

    unitBox.innerHTML = `
      <div class="session-header-row">
        <div class="session-title-group">
          <span class="session-number-badge">Unit 0${unitNum}</span>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a;">${unitTitle}</h4>
        </div>
        <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Active Unit</span>
      </div>
      <div style="margin-top: 0.75rem;">
        ${topicsHtml}
      </div>
    `;
    container.appendChild(unitBox);
  });
}

function renderSessions() {
  const container = document.getElementById('sessionsContainer');
  if (!container) return;
  container.innerHTML = '';

  state.sessions.forEach(sess => {
    const card = document.createElement('div');
    card.className = 'session-card';

    // Find if student was present in this session
    const log = (state.attendanceData.logs || []).find(l => l.session_number === sess.session_number);
    let statusBadge = `<span class="status-pill" style="background:#f1f5f9; color:#64748b;">Not Marked</span>`;
    if (log) {
      const st = (log.status || '').toLowerCase();
      if (st === 'present') statusBadge = `<span class="status-pill present">Present</span>`;
      else if (st === 'on_duty') statusBadge = `<span class="status-pill on_duty">On Duty</span>`;
      else if (st === 'absent') statusBadge = `<span class="status-pill absent">Absent</span>`;
    }

    const facultyQrBtn = state.currentRole === 'faculty' ? `
      <button class="btn-primary" style="padding: 0.3rem 0.75rem; font-size: 0.75rem;" onclick="generateSessionQr(${sess.session_number})">
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
        Generate Live QR
      </button>
    ` : '';

    card.innerHTML = `
      <div class="session-header-row">
        <div class="session-title-group">
          <span class="session-number-badge">Session #${sess.session_number}</span>
          <span style="font-size: 0.85rem; font-weight: 700; color: #0f172a;">${sess.title}</span>
          <span style="font-size: 0.72rem; color: #64748b;">(${formatDate(sess.session_date)})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          ${statusBadge}
          ${facultyQrBtn}
        </div>
      </div>
      <div class="session-subgrid">
        <div class="session-stage-box">
          <div class="session-stage-title">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            Before Class - Prepare
          </div>
          <div class="session-stage-desc">${sess.before_class_content || 'Preparation readings & slides'}</div>
        </div>
        <div class="session-stage-box">
          <div class="session-stage-title">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            In Class - Activity
          </div>
          <div class="session-stage-desc">${sess.in_class_activity || 'Interactive problem-solving & discussion'}</div>
        </div>
        <div class="session-stage-box">
          <div class="session-stage-title">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            After Class - Quiz & Task
          </div>
          <div class="session-stage-desc">${sess.after_class_task || 'MCQ Quiz & reflections'}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderOdSection() {
  const container = document.getElementById('odListContainer');
  if (!container) return;
  container.innerHTML = '';

  if (state.odRequests.length === 0) {
    container.innerHTML = `<p style="padding: 1rem; color: #94a3b8; font-size: 0.8rem;">No pending or previous OD applications.</p>`;
    return;
  }

  state.odRequests.forEach(od => {
    const item = document.createElement('div');
    item.style = "padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.65rem; background: #ffffff;";
    
    let badgeClass = od.status === 'APPROVED' ? 'present' : od.status === 'REJECTED' ? 'absent' : 'on_duty';

    const facultyActions = state.currentRole === 'faculty' && od.status === 'PENDING' ? `
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn-primary" style="padding: 0.2rem 0.65rem; font-size: 0.72rem; background: #059669;" onclick="reviewOd('${od.id}', 'APPROVED')">Approve OD</button>
        <button class="btn-secondary" style="padding: 0.2rem 0.65rem; font-size: 0.72rem; color: #dc2626;" onclick="reviewOd('${od.id}', 'REJECTED')">Reject</button>
      </div>
    ` : '';

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-weight: 700; font-size: 0.825rem; color: #0f172a;">${od.student_name} (${od.register_number})</span>
          <div style="font-size: 0.75rem; color: #64748b;">Session #${od.session_number} • ${formatDate(od.date)} • Category: ${od.category || 'Symposium'}</div>
          <div style="font-size: 0.78rem; color: #334155; margin-top: 0.25rem;"><strong>Reason:</strong> ${od.reason}</div>
          ${od.review_comments ? `<div style="font-size: 0.72rem; color: #2563eb; margin-top: 0.25rem;">Remarks: ${od.review_comments}</div>` : ''}
        </div>
        <span class="status-pill ${badgeClass}">${od.status}</span>
      </div>
      ${facultyActions}
    `;
    container.appendChild(item);
  });
}

function renderCurrentTab() {
  if (state.currentTab === 'attendance') {
    renderAttendanceTable();
  } else if (state.currentTab === 'sessions') {
    renderSessions();
  } else if (state.currentTab === 'topics') {
    renderTopics();
  }
}

// Modal Handlers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

// QR Code Operations
async function generateSessionQr(sessionNumber) {
  try {
    const res = await fetch(`${API_BASE}/api/course-attendance/course-offerings/${state.courseOfferingId}/sessions/${sessionNumber}/generate-qr`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('qrModalSessionNumber').textContent = sessionNumber;
      document.getElementById('qrModalImage').src = data.qr_image;
      document.getElementById('qrModalTokenText').textContent = data.qr_token;
      openModal('qrDisplayModal');
    }
  } catch (e) {
    showToast("Failed to generate QR code", "error");
  }
}

// Student QR Code Scanner Check-in
async function submitQrCheckIn() {
  const token = document.getElementById('qrTokenInput').value.trim();
  if (!token) {
    showToast("Please enter or scan a valid QR token", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/course-attendance/qr-checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        register_number: state.registerNumber,
        student_name: state.studentName
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || "Attendance marked successfully!", "success");
      closeModal('qrScannerModal');
      document.getElementById('qrTokenInput').value = '';
      await fetchAttendanceData();
    } else {
      showToast(data.message || "Verification failed", "error");
    }
  } catch (e) {
    showToast("Check-in request error", "error");
  }
}

// Faculty Mark / Update Attendance
function openEditAttendanceModal(sessionNumber, currentStatus) {
  document.getElementById('editSessionNumberInput').value = sessionNumber;
  document.getElementById('editSessionStatusSelect').value = (currentStatus || 'present').toLowerCase();
  openModal('editAttendanceModal');
}

async function submitEditAttendance() {
  const sessionNumber = parseInt(document.getElementById('editSessionNumberInput').value);
  const status = document.getElementById('editSessionStatusSelect').value.toUpperCase();
  const remarks = document.getElementById('editSessionRemarksInput').value;

  try {
    const res = await fetch(`${API_BASE}/api/course-attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_offering_id: state.courseOfferingId,
        session_number: sessionNumber,
        register_number: state.registerNumber,
        student_name: state.studentName,
        status: status,
        verification_method: "MANUAL_FACULTY",
        faculty_remarks: remarks || "Updated by faculty coordinator"
      })
    });

    if (res.ok) {
      showToast(`Session #${sessionNumber} attendance updated to ${status}`, "success");
      closeModal('editAttendanceModal');
      await fetchAttendanceData();
    } else {
      showToast("Failed to update attendance", "error");
    }
  } catch (e) {
    showToast("Update error", "error");
  }
}

// Submit OD Request
async function submitOdRequest() {
  const sessionNumber = parseInt(document.getElementById('odSessionSelect').value);
  const category = document.getElementById('odCategorySelect').value;
  const reason = document.getElementById('odReasonInput').value.trim();

  if (!reason) {
    showToast("Please provide a valid justification for OD", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/od-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        register_number: state.registerNumber,
        student_name: state.studentName,
        course_offering_id: state.courseOfferingId,
        session_number: sessionNumber,
        date: new Date().toISOString().split('T')[0],
        category: category,
        reason: reason
      })
    });

    if (res.ok) {
      showToast("OD application submitted for faculty review!", "success");
      closeModal('odApplicationModal');
      document.getElementById('odReasonInput').value = '';
      await fetchOdRequests();
    } else {
      showToast("Submission failed", "error");
    }
  } catch (e) {
    showToast("OD request error", "error");
  }
}

// Review OD (Faculty)
async function reviewOd(id, status) {
  try {
    const res = await fetch(`${API_BASE}/api/od-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: status,
        comments: `Reviewed by course coordinator: ${status}`,
        reviewer: "Dr. K. Ravichandran"
      })
    });

    if (res.ok) {
      showToast(`OD Request ${status}`, "success");
      await fetchOdRequests();
      await fetchAttendanceData();
    }
  } catch (e) {
    showToast("Failed to review OD", "error");
  }
}

// Utility: Hall Ticket Preview
function openHallTicketModal() {
  const sum = state.attendanceData.summary;
  document.getElementById('hallTicketStudentName').textContent = state.studentName;
  document.getElementById('hallTicketRegNo').textContent = state.registerNumber;
  document.getElementById('hallTicketCourseCode').textContent = state.courseData ? state.courseData.course_code : '21CS301';
  document.getElementById('hallTicketCourseName').textContent = state.courseData ? state.courseData.course_name : 'Course';
  document.getElementById('hallTicketAttendancePct').textContent = `${sum.attendance_percentage}%`;
  
  const statusEl = document.getElementById('hallTicketEligibilityStatus');
  if (sum.is_eligible) {
    statusEl.innerHTML = `<span style="color: #059669; font-weight: 700;">APPROVED &amp; ELIGIBLE</span>`;
    document.getElementById('hallTicketPrintBtn').disabled = false;
  } else {
    statusEl.innerHTML = `<span style="color: #dc2626; font-weight: 700;">DISQUALIFIED (BELOW 75%)</span>`;
    document.getElementById('hallTicketPrintBtn').disabled = true;
  }

  openModal('hallTicketModal');
}

// Utility: Export Attendance Sheet
function exportAttendanceSheet() {
  const logs = state.attendanceData.logs || [];
  let csv = "S.No,Date,Session Number,Status,Verification,Remarks\n";
  logs.forEach((l, idx) => {
    csv += `${idx + 1},${l.date},Session ${l.session_number},${l.status},${l.verification_method || 'PORTAL'},"${l.faculty_remarks || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AttendX_${state.courseOfferingId}_Attendance.csv`;
  a.click();
  showToast("Attendance CSV downloaded", "success");
}

// Copy Offering ID
function copyOfferingId() {
  navigator.clipboard.writeText(state.courseOfferingId);
  showToast("Course Offering ID copied to clipboard!", "info");
}

// Toast helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function formatDate(dStr) {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dStr;
  }
}
