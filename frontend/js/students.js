/**
 * MaccaAttendX - Student Management Module (Milestone 2)
 * Complete Student Directory, Filter/Search/Sort/Pagination, CSV Import/Export,
 * Add/Edit Modal with Admin Permission Enforcement, and 8-Tab Student Profile.
 * Strictly aligned with Saveetha V-Study visual hierarchy.
 */

const StudentModule = {
  // Directory State
  state: {
    searchQuery: '',
    classFilter: 'ALL',
    sectionFilter: 'ALL',
    genderFilter: 'ALL',
    statusFilter: 'ALL',
    sortField: 'registrationNumber',
    sortAsc: true,
    page: 1,
    pageSize: 6,
    activeProfileId: null,
    profileTab: 'overview'
  },

  // Main Entry Point
  render(container) {
    if (this.state.activeProfileId) {
      this.renderProfile(container, this.state.activeProfileId);
    } else {
      this.renderDirectory(container);
    }
  },

  // ============================================================================
  // 1. STUDENT DIRECTORY TABLE VIEW
  // ============================================================================
  renderDirectory(container) {
    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';
    const students = AcademicDataService.getStudents();
    const filtered = this.getFilteredStudents(students);
    const paginated = this.getPaginatedStudents(filtered);
    const totalPages = Math.ceil(filtered.length / this.state.pageSize) || 1;

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Student Management Portal</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Official Student Registry &amp; Identity Roster
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="StudentModule.exportCSV()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
          ${isAdmin ? `
            <button class="btn btn-secondary btn-sm" onclick="StudentModule.openImportModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"/></svg>
              Import CSV
            </button>
            <button class="btn btn-primary btn-sm" onclick="StudentModule.openAddModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Add Student
            </button>
          ` : `
            <span class="status-pill status-leave" style="font-size: 0.72rem;">Teacher View (Read-Only Directory)</span>
          `}
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.85rem; align-items: end;">
          <!-- Search -->
          <div class="form-group" style="margin-bottom: 0; grid-column: span 2;">
            <label class="form-label">Search Directory</label>
            <div style="position: relative;">
              <input type="text" class="form-control" placeholder="Search by name, reg no, or admission no..." value="${this.state.searchQuery}" oninput="StudentModule.onSearchChange(event)" style="padding-left: 2rem;">
              <svg style="position: absolute; left: 0.75rem; top: 10px; color: var(--text-muted);" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          <!-- Class Filter -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Class</label>
            <select class="form-select" onchange="StudentModule.onFilterChange('classFilter', this.value)">
              <option value="ALL" ${this.state.classFilter === 'ALL' ? 'selected' : ''}>All Classes</option>
              <option value="BE-CSE-3A" ${this.state.classFilter === 'BE-CSE-3A' ? 'selected' : ''}>B.E. CSE - 3A</option>
              <option value="BE-CSE-3B" ${this.state.classFilter === 'BE-CSE-3B' ? 'selected' : ''}>B.E. CSE - 3B</option>
              <option value="BE-ECE-2A" ${this.state.classFilter === 'BE-ECE-2A' ? 'selected' : ''}>B.E. ECE - 2A</option>
              <option value="BTECH-AI-1A" ${this.state.classFilter === 'BTECH-AI-1A' ? 'selected' : ''}>B.Tech AI - 1A</option>
            </select>
          </div>

          <!-- Section Filter -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Section</label>
            <select class="form-select" onchange="StudentModule.onFilterChange('sectionFilter', this.value)">
              <option value="ALL" ${this.state.sectionFilter === 'ALL' ? 'selected' : ''}>All Sections</option>
              <option value="A" ${this.state.sectionFilter === 'A' ? 'selected' : ''}>Section A</option>
              <option value="B" ${this.state.sectionFilter === 'B' ? 'selected' : ''}>Section B</option>
            </select>
          </div>

          <!-- Gender Filter -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Gender</label>
            <select class="form-select" onchange="StudentModule.onFilterChange('genderFilter', this.value)">
              <option value="ALL" ${this.state.genderFilter === 'ALL' ? 'selected' : ''}>All Genders</option>
              <option value="Male" ${this.state.genderFilter === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${this.state.genderFilter === 'Female' ? 'selected' : ''}>Female</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Status</label>
            <select class="form-select" onchange="StudentModule.onFilterChange('statusFilter', this.value)">
              <option value="ALL" ${this.state.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
              <option value="Active" ${this.state.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${this.state.statusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Student Directory Table Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
            Enrolled Students Ledger (${filtered.length} Records)
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">
            Page ${this.state.page} of ${totalPages}
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th class="th-sortable" onclick="StudentModule.toggleSort('fullName')">
                  Student Name ${this.renderSortIcon('fullName')}
                </th>
                <th class="th-sortable" onclick="StudentModule.toggleSort('registrationNumber')">
                  Reg. Number ${this.renderSortIcon('registrationNumber')}
                </th>
                <th>Admission / Roll</th>
                <th>Class &amp; Section</th>
                <th>Contact</th>
                <th class="th-sortable" onclick="StudentModule.toggleSort('attendancePercentage')" style="text-align: center;">
                  Attendance ${this.renderSortIcon('attendancePercentage')}
                </th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center; width: 140px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.length > 0 ? paginated.map((s, idx) => this.renderStudentRow(s, (this.state.page - 1) * this.state.pageSize + idx + 1, isAdmin)).join('') : `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div style="font-weight: 700; font-size: 1.05rem; color: var(--brand-navy); margin-bottom: 0.25rem;">No students found</div>
                    <p style="font-size: 0.85rem; margin-bottom: 1rem;">No student records match the selected filter criteria.</p>
                    <button class="btn btn-secondary btn-sm" onclick="StudentModule.resetFilters()">Reset Filters</button>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="table-pagination-bar">
          <div class="pagination-info">
            Showing ${filtered.length > 0 ? (this.state.page - 1) * this.state.pageSize + 1 : 0} to ${Math.min(this.state.page * this.state.pageSize, filtered.length)} of ${filtered.length} entries
          </div>
          <div class="pagination-btns">
            <button class="page-num-btn" onclick="StudentModule.changePage(${this.state.page - 1})" ${this.state.page <= 1 ? 'disabled' : ''}>
              &lsaquo;
            </button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <button class="page-num-btn ${p === this.state.page ? 'active' : ''}" onclick="StudentModule.changePage(${p})">
                ${p}
              </button>
            `).join('')}
            <button class="page-num-btn" onclick="StudentModule.changePage(${this.state.page + 1})" ${this.state.page >= totalPages ? 'disabled' : ''}>
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderStudentRow(s, indexNum, isAdmin) {
    const isShortfall = s.attendancePercentage < 75;

    return `
      <tr>
        <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${indexNum}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${s.photo}" alt="${s.fullName}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-color);">
            <div>
              <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.88rem; cursor: pointer;" onclick="StudentModule.viewProfile('${s.id}')">
                ${s.fullName}
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">${s.gender} &bull; DOB: ${s.dob}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-family: monospace; font-weight: 700; color: var(--primary-blue); font-size: 0.88rem;">
            ${s.registrationNumber}
          </span>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-dark);">${s.admissionNumber}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">Roll: ${s.rollNumber}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 0.82rem;">${s.className}</div>
          <span class="status-pill status-leave" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">Sec ${s.section}</span>
        </td>
        <td>
          <div style="font-size: 0.8rem; color: var(--text-dark);">${s.email}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${s.phone}</div>
        </td>
        <td style="text-align: center;">
          <div style="font-weight: 800; font-size: 0.88rem; color: ${isShortfall ? 'var(--absent-red)' : 'var(--present-green)'};">
            ${s.attendancePercentage}%
          </div>
          <div class="progress-bar-container" style="height: 4px; width: 70px; margin: 3px auto 0;">
            <div class="progress-bar-fill ${isShortfall ? 'bg-absent' : 'bg-present'}" style="width: ${s.attendancePercentage}%;"></div>
          </div>
          ${isShortfall ? '<span class="status-pill status-absent" style="font-size: 0.62rem; margin-top: 3px; padding: 0.05rem 0.3rem;">Shortfall</span>' : ''}
        </td>
        <td style="text-align: center;">
          <span class="status-pill ${s.status === 'Active' ? 'status-present' : 'status-absent'}">
            ${s.status}
          </span>
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 0.35rem; justify-content: center;">
            <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="View Student Profile" onclick="StudentModule.viewProfile('${s.id}')">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            ${isAdmin ? `
              <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="Edit Student Record" onclick="StudentModule.openEditModal('${s.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; color: var(--absent-red);" title="Delete Student" onclick="StudentModule.confirmDelete('${s.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  },

  renderSortIcon(field) {
    if (this.state.sortField !== field) {
      return '<span style="opacity: 0.3; font-size: 0.7rem;">↕</span>';
    }
    return this.state.sortAsc ? '▲' : '▼';
  },

  // Filter & Sort Logic
  getFilteredStudents(students) {
    let list = [...students];

    // Search query
    if (this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q)
      );
    }

    // Class
    if (this.state.classFilter !== 'ALL') {
      list = list.filter(s => s.classId === this.state.classFilter);
    }

    // Section
    if (this.state.sectionFilter !== 'ALL') {
      list = list.filter(s => s.section === this.state.sectionFilter);
    }

    // Gender
    if (this.state.genderFilter !== 'ALL') {
      list = list.filter(s => s.gender === this.state.genderFilter);
    }

    // Status
    if (this.state.statusFilter !== 'ALL') {
      list = list.filter(s => s.status === this.state.statusFilter);
    }

    // Sort
    const field = this.state.sortField;
    const asc = this.state.sortAsc;
    list.sort((a, b) => {
      let va = a[field] ?? '';
      let vb = b[field] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });

    return list;
  },

  getPaginatedStudents(filtered) {
    const start = (this.state.page - 1) * this.state.pageSize;
    return filtered.slice(start, start + this.state.pageSize);
  },

  // Handlers
  onSearchChange(e) {
    this.state.searchQuery = e.target.value;
    this.state.page = 1;
    this.reRender();
  },

  onFilterChange(key, value) {
    this.state[key] = value;
    this.state.page = 1;
    this.reRender();
  },

  toggleSort(field) {
    if (this.state.sortField === field) {
      this.state.sortAsc = !this.state.sortAsc;
    } else {
      this.state.sortField = field;
      this.state.sortAsc = true;
    }
    this.reRender();
  },

  changePage(p) {
    this.state.page = p;
    this.reRender();
  },

  resetFilters() {
    this.state.searchQuery = '';
    this.state.classFilter = 'ALL';
    this.state.sectionFilter = 'ALL';
    this.state.genderFilter = 'ALL';
    this.state.statusFilter = 'ALL';
    this.state.page = 1;
    this.reRender();
  },

  reRender() {
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  // ============================================================================
  // 2. ADD & EDIT STUDENT MODAL FORMS (Admin Permission Enforced)
  // ============================================================================
  openAddModal() {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can register new students.', 'error');
      return;
    }

    const modalHtml = this.generateStudentFormHtml(null);
    App.openModal('Register New Student (Admin Authority)', modalHtml, () => {
      this.submitStudentForm(null);
    });
  },

  openEditModal(studentId) {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can modify student credentials.', 'error');
      return;
    }

    const student = AcademicDataService.getStudentById(studentId);
    if (!student) {
      App.toast('Student not found', 'error');
      return;
    }

    const modalHtml = this.generateStudentFormHtml(student);
    App.openModal(`Edit Student: ${student.fullName}`, modalHtml, () => {
      this.submitStudentForm(studentId);
    });
  },

  generateStudentFormHtml(student = null) {
    const s = student || {
      firstName: '',
      lastName: '',
      dob: '2004-06-15',
      gender: 'Male',
      photo: '',
      email: '',
      phone: '',
      address: '',
      registrationNumber: '',
      admissionNumber: '',
      rollNumber: '',
      admissionDate: new Date().toISOString().split('T')[0],
      academicYear: '2025–2026',
      classId: 'BE-CSE-3A',
      section: 'A',
      status: 'Active',
      guardian: { name: '', relationship: 'Father', phone: '', email: '', address: '' }
    };

    return `
      <form id="studentModalForm" onsubmit="event.preventDefault();" style="font-size: 0.84rem;">
        <div id="studentFormErrors" style="display: none;" class="validation-error-alert"></div>

        <!-- 1. Personal Information -->
        <div class="form-section-title">1. Personal Information</div>
        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">First Name *</label>
            <input type="text" class="form-field-input" id="stuFirstName" value="${s.firstName}" placeholder="e.g. Aarav" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Last Name *</label>
            <input type="text" class="form-field-input" id="stuLastName" value="${s.lastName}" placeholder="e.g. Sharma" required>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Date of Birth *</label>
            <input type="date" class="form-field-input" id="stuDob" value="${s.dob}" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Gender</label>
            <select class="form-field-select" id="stuGender">
              <option value="Male" ${s.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${s.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${s.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Account Status</label>
            <select class="form-field-select" id="stuStatus">
              <option value="Active" ${s.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${s.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              <option value="Suspended" ${s.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Institutional Email *</label>
            <input type="email" class="form-field-input" id="stuEmail" value="${s.email}" placeholder="student@saveetha.ac.in" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Phone Number (10 digits) *</label>
            <input type="tel" class="form-field-input" id="stuPhone" value="${s.phone}" placeholder="9876543210" required>
          </div>
        </div>

        <div class="form-field">
          <label class="form-field-label">Residential Address</label>
          <input type="text" class="form-field-input" id="stuAddress" value="${s.address || ''}" placeholder="Street, Area, City, Pin Code">
        </div>

        <!-- 2. Academic Information -->
        <div class="form-section-title">2. Academic Information (Official SIMATS Records)</div>
        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Registration Number (Unique) *</label>
            <input type="text" class="form-field-input" id="stuRegNo" value="${s.registrationNumber}" placeholder="e.g. 192211099" ${student ? 'title="Official Reg No (Admin Authorized)"' : ''} required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Admission Number</label>
            <input type="text" class="form-field-input" id="stuAdmNo" value="${s.admissionNumber}" placeholder="ADM-2023-0199">
          </div>
          <div class="form-field">
            <label class="form-field-label">Class Roll Number</label>
            <input type="text" class="form-field-input" id="stuRollNo" value="${s.rollNumber}" placeholder="192211099">
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Academic Year</label>
            <select class="form-field-select" id="stuAcademicYear">
              <option value="2025–2026" ${s.academicYear === '2025–2026' ? 'selected' : ''}>2025–2026</option>
              <option value="2024–2025" ${s.academicYear === '2024–2025' ? 'selected' : ''}>2024–2025</option>
              <option value="2026–2027" ${s.academicYear === '2026–2027' ? 'selected' : ''}>2026–2027</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Assigned Class</label>
            <select class="form-field-select" id="stuClassId">
              <option value="BE-CSE-3A" ${s.classId === 'BE-CSE-3A' ? 'selected' : ''}>B.E. CSE - 3rd Year</option>
              <option value="BE-CSE-3B" ${s.classId === 'BE-CSE-3B' ? 'selected' : ''}>B.E. CSE - 3rd Year (B)</option>
              <option value="BE-ECE-2A" ${s.classId === 'BE-ECE-2A' ? 'selected' : ''}>B.E. ECE - 2nd Year</option>
              <option value="BTECH-AI-1A" ${s.classId === 'BTECH-AI-1A' ? 'selected' : ''}>B.Tech AI - 1st Year</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Section</label>
            <select class="form-field-select" id="stuSection">
              <option value="A" ${s.section === 'A' ? 'selected' : ''}>Section A</option>
              <option value="B" ${s.section === 'B' ? 'selected' : ''}>Section B</option>
            </select>
          </div>
        </div>

        <!-- 3. Guardian Information -->
        <div class="form-section-title">3. Parent / Guardian Information</div>
        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Guardian Full Name</label>
            <input type="text" class="form-field-input" id="stuGuardName" value="${s.guardian?.name || ''}" placeholder="Parent/Guardian Name">
          </div>
          <div class="form-field">
            <label class="form-field-label">Relationship</label>
            <input type="text" class="form-field-input" id="stuGuardRel" value="${s.guardian?.relationship || 'Father'}" placeholder="Father/Mother/Guardian">
          </div>
          <div class="form-field">
            <label class="form-field-label">Guardian Phone</label>
            <input type="tel" class="form-field-input" id="stuGuardPhone" value="${s.guardian?.phone || ''}" placeholder="9841029384">
          </div>
        </div>
      </form>
    `;
  },

  submitStudentForm(existingId = null) {
    const firstName = document.getElementById('stuFirstName')?.value.trim();
    const lastName = document.getElementById('stuLastName')?.value.trim();
    const dob = document.getElementById('stuDob')?.value;
    const gender = document.getElementById('stuGender')?.value;
    const status = document.getElementById('stuStatus')?.value;
    const email = document.getElementById('stuEmail')?.value.trim();
    const phone = document.getElementById('stuPhone')?.value.trim();
    const address = document.getElementById('stuAddress')?.value.trim();
    const registrationNumber = document.getElementById('stuRegNo')?.value.trim();
    const admissionNumber = document.getElementById('stuAdmNo')?.value.trim() || `ADM-${registrationNumber}`;
    const rollNumber = document.getElementById('stuRollNo')?.value.trim() || registrationNumber;
    const academicYear = document.getElementById('stuAcademicYear')?.value;
    const classId = document.getElementById('stuClassId')?.value;
    const section = document.getElementById('stuSection')?.value;

    const guardian = {
      name: document.getElementById('stuGuardName')?.value.trim() || 'Parent/Guardian',
      relationship: document.getElementById('stuGuardRel')?.value.trim() || 'Father',
      phone: document.getElementById('stuGuardPhone')?.value.trim() || phone,
      email: email,
      address: address
    };

    const payload = {
      firstName,
      lastName,
      dob,
      gender,
      status,
      email,
      phone,
      address,
      registrationNumber,
      admissionNumber,
      rollNumber,
      academicYear,
      classId,
      className: classId === 'BE-CSE-3A' ? 'B.E. CSE - 3rd Year' : 'B.E. Engineering',
      section,
      guardian
    };

    let result;
    if (existingId) {
      result = AcademicDataService.updateStudent(existingId, payload);
    } else {
      result = AcademicDataService.addStudent(payload);
    }

    if (!result.success) {
      const errBox = document.getElementById('studentFormErrors');
      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerHTML = `<strong>Please correct the following:</strong><ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
      return;
    }

    App.closeModal();
    App.toast(existingId ? 'Student record updated successfully' : 'New student registered successfully', 'success');
    this.reRender();
  },

  confirmDelete(studentId) {
    const student = AcademicDataService.getStudentById(studentId);
    if (!student) return;

    const confirmHtml = `
      <div style="font-size: 0.88rem; color: var(--text-dark); line-height: 1.5;">
        <p style="margin-bottom: 0.75rem;">Are you sure you want to deactivate and remove student <strong>${student.fullName}</strong>?</p>
        <div style="background: var(--bg-soft); padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
          <div>Registration No: <strong>${student.registrationNumber}</strong></div>
          <div>Class: <strong>${student.className} (Sec ${student.section})</strong></div>
        </div>
        <p style="color: var(--absent-red); font-size: 0.8rem; margin: 0;">
          Warning: This action archives student credentials and revokes student/parent portal access.
        </p>
      </div>
    `;

    App.openModal('Confirm Student Removal', confirmHtml, () => {
      const res = AcademicDataService.deleteStudent(studentId);
      if (res.success) {
        App.toast(`Student ${student.fullName} archived successfully`, 'info');
        this.reRender();
      } else {
        App.toast('Failed to delete student', 'error');
      }
    });
  },

  // ============================================================================
  // 3. CSV IMPORT & EXPORT WORKFLOWS
  // ============================================================================
  exportCSV() {
    const students = this.getFilteredStudents(AcademicDataService.getStudents());
    let csv = '\uFEFF'; // BOM
    csv += 'Registration Number,Admission Number,Roll Number,First Name,Last Name,Gender,Email,Phone,Class,Section,Attendance %,Status\r\n';

    students.forEach(s => {
      csv += `"${s.registrationNumber}","${s.admissionNumber}","${s.rollNumber}","${s.firstName}","${s.lastName}","${s.gender}","${s.email}","${s.phone}","${s.className}","${s.section}","${s.attendancePercentage}%","${s.status}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Saveetha_Students_Roster_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.toast(`Exported ${students.length} student records to CSV`, 'success');
  },

  openImportModal() {
    const modalHtml = `
      <div style="font-size: 0.85rem;">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">
          Upload or paste a CSV file containing student rosters. Mandatory columns: <code>registrationNumber, firstName, lastName, email, phone</code>.
        </p>

        <div class="csv-dropzone" onclick="document.getElementById('csvFileInput').click()">
          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--primary-blue); margin-bottom: 0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          <div style="font-weight: 700; color: var(--brand-navy);">Click to select CSV File</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Accepts .csv format</div>
          <input type="file" id="csvFileInput" accept=".csv" style="display: none;" onchange="StudentModule.handleCsvFileSelect(event)">
        </div>

        <div style="margin-top: 1rem;">
          <label class="form-label">Or Paste CSV Raw Content:</label>
          <textarea class="form-control" id="csvRawText" rows="4" style="font-family: monospace; font-size: 0.78rem;" placeholder="registrationNumber,firstName,lastName,email,phone&#10;192211091,Varun,Prasad,varun.p@saveetha.ac.in,9840192837&#10;192211092,Kavya,Natarajan,kavya.n@saveetha.ac.in,9840293847"></textarea>
        </div>

        <div id="csvParseResult" style="margin-top: 0.75rem; display: none;"></div>
      </div>
    `;

    App.openModal('Import Students via CSV', modalHtml, () => {
      this.executeCsvImport();
    });
  },

  handleCsvFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const txt = event.target.result;
      const area = document.getElementById('csvRawText');
      if (area) area.value = txt;
      App.toast(`Loaded file: ${file.name}`, 'info');
    };
    reader.readAsText(file);
  },

  executeCsvImport() {
    const raw = document.getElementById('csvRawText')?.value.trim();
    if (!raw) {
      App.toast('Please provide CSV data to import', 'warning');
      return;
    }

    const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) {
      App.toast('CSV must contain a header and at least one student row', 'warning');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] || '';
      });
      rows.push(obj);
    }

    const res = AcademicDataService.importStudents(rows);
    if (res.successCount > 0) {
      App.toast(`Successfully imported ${res.successCount} new students!`, 'success');
      this.reRender();
    } else {
      App.toast(`Import failed: ${res.errors.join('; ')}`, 'error');
    }
  },

  // ============================================================================
  // 4. EIGHT-TAB STUDENT PROFILE VIEW (V-Study Architecture)
  // ============================================================================
  viewProfile(studentId) {
    this.state.activeProfileId = studentId;
    this.state.profileTab = 'overview';
    this.reRender();
  },

  closeProfile() {
    this.state.activeProfileId = null;
    this.reRender();
  },

  setProfileTab(tabName) {
    this.state.profileTab = tabName;
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.renderProfile(container, this.state.activeProfileId);
  },

  renderProfile(container, studentId) {
    const student = AcademicDataService.getStudentById(studentId);
    if (!student) {
      container.innerHTML = `<div class="dashboard-card" style="padding: 2rem;">Student not found. <button class="btn btn-secondary btn-sm" onclick="StudentModule.closeProfile()">Back</button></div>`;
      return;
    }

    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';
    const isShortfall = student.attendancePercentage < 75;

    container.innerHTML = `
      <!-- Breadcrumb & Back Action -->
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-secondary btn-sm" onclick="StudentModule.closeProfile()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to Student Directory
        </button>
        ${isAdmin ? `
          <button class="btn btn-primary btn-sm" onclick="StudentModule.openEditModal('${student.id}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Student Details
          </button>
        ` : ''}
      </div>

      <!-- Profile Hero Banner Card -->
      <div class="profile-hero-card">
        <div class="profile-hero-main">
          <img src="${student.photo}" alt="${student.fullName}" class="profile-hero-avatar">
          <div>
            <h1 class="profile-hero-name">${student.fullName}</h1>
            <div class="profile-hero-sub">
              <span>Reg: <strong style="color: var(--primary-blue); font-family: monospace;">${student.registrationNumber}</strong></span>
              <span>&bull;</span>
              <span>Admission: ${student.admissionNumber}</span>
              <span>&bull;</span>
              <span>${student.className} (Section ${student.section})</span>
            </div>
            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; align-items: center;">
              <span class="status-pill ${student.status === 'Active' ? 'status-present' : 'status-absent'}">${student.status} Account</span>
              <span class="status-pill status-leave">AY ${student.academicYear}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <div class="profile-stat-box">
            <div class="profile-stat-label">Attendance Rate</div>
            <div class="profile-stat-num" style="color: ${isShortfall ? 'var(--absent-red)' : 'var(--present-green)'};">
              ${student.attendancePercentage}%
            </div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-label">Exam Fee Status</div>
            <div class="profile-stat-num" style="font-size: 1.05rem; margin-top: 0.4rem; color: ${isShortfall ? 'var(--absent-red)' : 'var(--present-green)'};">
              ${isShortfall ? 'LOCKED (&lt;75%)' : 'CLEARED'}
            </div>
          </div>
        </div>
      </div>

      <!-- 8 Profile Navigation Tabs -->
      <div class="profile-tab-bar">
        <button class="profile-tab-btn ${this.state.profileTab === 'overview' ? 'active' : ''}" onclick="StudentModule.setProfileTab('overview')">1. Overview</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'personal' ? 'active' : ''}" onclick="StudentModule.setProfileTab('personal')">2. Personal Information</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'academic' ? 'active' : ''}" onclick="StudentModule.setProfileTab('academic')">3. Academic Information</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'guardian' ? 'active' : ''}" onclick="StudentModule.setProfileTab('guardian')">4. Guardian Information</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'attendance' ? 'active' : ''}" onclick="StudentModule.setProfileTab('attendance')">5. Attendance</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'timetable' ? 'active' : ''}" onclick="StudentModule.setProfileTab('timetable')">6. Timetable</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'leave' ? 'active' : ''}" onclick="StudentModule.setProfileTab('leave')">7. Leave Applications</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'reports' ? 'active' : ''}" onclick="StudentModule.setProfileTab('reports')">8. Reports</button>
      </div>

      <!-- Tab Content Area -->
      <div class="dashboard-card" style="padding: 1.5rem;">
        ${this.renderProfileTabContent(student)}
      </div>
    `;
  },

  renderProfileTabContent(student) {
    const tab = this.state.profileTab;
    const isShortfall = student.attendancePercentage < 75;

    if (tab === 'overview') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Academic Overview &amp; Enrolled Courses</div>
        <div class="stat-grid-4" style="margin-bottom: 1.5rem;">
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Enrolled Subjects</span>
            <div class="stat-card-value">6 Subjects</div>
          </div>
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Conducted Periods</span>
            <div class="stat-card-value">180 Periods</div>
          </div>
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Attendance Standing</span>
            <div class="stat-card-value ${isShortfall ? 'text-absent' : 'text-present'}">${student.attendancePercentage}%</div>
          </div>
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Mentor Faculty</span>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--brand-navy); margin-top: 0.5rem;">Dr. K. Senthil Kumar</div>
          </div>
        </div>

        <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--brand-navy); margin-bottom: 0.75rem;">Registered Subjects (Semester 5)</h4>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Faculty</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: monospace; font-weight: 700;">CS301</td>
                <td>Design and Analysis of Algorithms</td>
                <td>4</td>
                <td>Dr. K. Senthil Kumar</td>
                <td><span class="status-pill status-present">88.5%</span></td>
              </tr>
              <tr>
                <td style="font-family: monospace; font-weight: 700;">CS302</td>
                <td>Database Management Systems</td>
                <td>4</td>
                <td>Dr. Meenakshi Sundaram</td>
                <td><span class="status-pill status-present">91.0%</span></td>
              </tr>
              <tr>
                <td style="font-family: monospace; font-weight: 700;">CS303</td>
                <td>Operating Systems &amp; Kernel Architecture</td>
                <td>3</td>
                <td>Dr. G. Balaji</td>
                <td><span class="status-pill status-late">74.2%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    if (tab === 'personal') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1.25rem;">Demographic &amp; Personal Record</div>
        <div class="info-grid-2">
          <div class="info-item">
            <span class="info-item-label">First Name</span>
            <span class="info-item-value">${student.firstName}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Last Name</span>
            <span class="info-item-value">${student.lastName}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Date of Birth</span>
            <span class="info-item-value">${student.dob}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Gender</span>
            <span class="info-item-value">${student.gender}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Institutional Email</span>
            <span class="info-item-value">${student.email}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Mobile Phone</span>
            <span class="info-item-value">${student.phone}</span>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-item-label">Permanent Residential Address</span>
            <span class="info-item-value">${student.address || 'Chennai, Tamil Nadu'}</span>
          </div>
        </div>
      `;
    }

    if (tab === 'academic') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1.25rem;">Institutional Academic Record</div>
        <div class="info-grid-2">
          <div class="info-item">
            <span class="info-item-label">Official Registration Number</span>
            <span class="info-item-value" style="font-family: monospace; color: var(--primary-blue); font-weight: 800;">${student.registrationNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Admission Number</span>
            <span class="info-item-value">${student.admissionNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Class Roll Number</span>
            <span class="info-item-value">${student.rollNumber}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Admission Date</span>
            <span class="info-item-value">${student.admissionDate}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Department</span>
            <span class="info-item-value">Department of Computer Science &amp; Engineering</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Class &amp; Section</span>
            <span class="info-item-value">${student.className} &bull; Section ${student.section}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Academic Year</span>
            <span class="info-item-value">${student.academicYear}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Account Privilege</span>
            <span class="info-item-value">STUDENT &bull; Biometric Enabled</span>
          </div>
        </div>
      `;
    }

    if (tab === 'guardian') {
      const g = student.guardian || {};
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1.25rem;">Parent &amp; Guardian Information</div>
        <div class="info-grid-2">
          <div class="info-item">
            <span class="info-item-label">Guardian Full Name</span>
            <span class="info-item-value">${g.name || 'Not Provided'}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Relationship</span>
            <span class="info-item-value">${g.relationship || 'Father'}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Contact Number</span>
            <span class="info-item-value">${g.phone || student.phone}</span>
          </div>
          <div class="info-item">
            <span class="info-item-label">Email Address</span>
            <span class="info-item-value">${g.email || 'guardian@example.com'}</span>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-item-label">Guardian Address</span>
            <span class="info-item-value">${g.address || student.address}</span>
          </div>
        </div>
      `;
    }

    if (tab === 'attendance') {
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem;">Semester Attendance Portfolio</div>
          <span class="status-pill ${isShortfall ? 'status-absent' : 'status-present'}">
            Cumulative: ${student.attendancePercentage}%
          </span>
        </div>
        ${isShortfall ? `
          <div class="alert-box alert-danger" style="margin-bottom: 1rem;">
            <strong>SIMATS Shortfall Alert:</strong> Attendance is below 75%. Examination fee payment and hall ticket printing are currently locked.
          </div>
        ` : ''}
        <table class="table-custom">
          <thead>
            <tr><th>Date</th><th>Period</th><th>Course</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>2026-11-05</td><td>Period 1</td><td>CS301 Design and Analysis of Algorithms</td><td><span class="status-pill status-present">PRESENT</span></td></tr>
            <tr><td>2026-11-04</td><td>Period 2</td><td>CS302 Database Management Systems</td><td><span class="status-pill status-present">PRESENT</span></td></tr>
            <tr><td>2026-11-03</td><td>Period 1</td><td>CS301 Design and Analysis of Algorithms</td><td><span class="status-pill status-late">LATE</span></td></tr>
            <tr><td>2026-10-31</td><td>Period 3</td><td>CS303 Operating Systems</td><td><span class="status-pill status-absent">ABSENT</span></td></tr>
          </tbody>
        </table>
      `;
    }

    if (tab === 'timetable') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Weekly Class Timetable (Sec ${student.section})</div>
        <table class="table-custom">
          <thead>
            <tr><th>Day</th><th>08:30 - 09:20</th><th>09:20 - 10:10</th><th>10:30 - 11:20</th><th>11:20 - 12:10</th><th>01:00 - 02:30</th></tr>
          </thead>
          <tbody>
            <tr><td style="font-weight: 700;">Mon</td><td>CS301 (Hall 401)</td><td>CS302</td><td>CS303</td><td>CS304</td><td>Algorithms Lab</td></tr>
            <tr><td style="font-weight: 700;">Tue</td><td>CS302</td><td>CS301</td><td>CS304</td><td>CS303</td><td>DBMS Lab</td></tr>
            <tr><td style="font-weight: 700;">Wed</td><td>CS303</td><td>CS304</td><td>CS301</td><td>Library</td><td>Mini Project</td></tr>
            <tr><td style="font-weight: 700;">Thu</td><td>CS301</td><td>CS302</td><td>CS303</td><td>CS304</td><td>Placement Prep</td></tr>
            <tr><td style="font-weight: 700;">Fri</td><td>CS304</td><td>CS303</td><td>CS302</td><td>CS301</td><td>Sports / Mentoring</td></tr>
          </tbody>
        </table>
      `;
    }

    if (tab === 'leave') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Leave &amp; On-Duty (OD) Records</div>
        <table class="table-custom">
          <thead>
            <tr><th>Application ID</th><th>Type</th><th>Duration</th><th>Reason</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-family: monospace;">OD-2026-081</td>
              <td>Symposium / Hackathon</td>
              <td>2026-11-10 to 2026-11-12</td>
              <td>Smart India Hackathon Grand Finale participation</td>
              <td><span class="status-pill status-present">APPROVED (OD)</span></td>
            </tr>
            <tr>
              <td style="font-family: monospace;">ML-2026-042</td>
              <td>Medical Leave</td>
              <td>2026-10-12</td>
              <td>Fever &amp; medical consultation</td>
              <td><span class="status-pill status-present">VERIFIED</span></td>
            </tr>
          </tbody>
        </table>
      `;
    }

    if (tab === 'reports') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Official Academic &amp; Attendance Reports</div>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">
          Official transcripts generated for SIMATS Controller of Examinations.
        </p>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-secondary btn-sm" onclick="ReportsModule.printReport()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Attendance Sheet
          </button>
          <button class="btn btn-primary btn-sm" onclick="StudentModule.exportCSV()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download CSV Transcript
          </button>
        </div>
      `;
    }

    return `<div>Tab content</div>`;
  }
};

window.StudentModule = StudentModule;
