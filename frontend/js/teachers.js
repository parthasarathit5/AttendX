/**
 * MaccaAttendX - Teacher Management Module (Milestone 2)
 * Complete Faculty Directory, Filter/Search/Sort/Pagination, CSV Export,
 * Add/Edit Teacher Modal (Admin Only), and 6-Tab Faculty Profile.
 */

const TeacherModule = {
  state: {
    searchQuery: '',
    departmentFilter: 'ALL',
    statusFilter: 'ALL',
    sortField: 'employeeId',
    sortAsc: true,
    page: 1,
    pageSize: 6,
    activeProfileId: null,
    profileTab: 'overview'
  },

  render(container) {
    if (this.state.activeProfileId) {
      this.renderProfile(container, this.state.activeProfileId);
    } else {
      this.renderDirectory(container);
    }
  },

  // ============================================================================
  // 1. TEACHER DIRECTORY TABLE
  // ============================================================================
  renderDirectory(container) {
    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';
    const teachers = AcademicDataService.getTeachers();
    const filtered = this.getFilteredTeachers(teachers);
    const paginated = this.getPaginatedTeachers(filtered);
    const totalPages = Math.ceil(filtered.length / this.state.pageSize) || 1;

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Faculty &amp; Teacher Management</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Faculty Registry, Workload &amp; Academic Responsibilities
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary btn-sm" onclick="TeacherModule.exportCSV()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="TeacherModule.openAddModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Add Faculty
            </button>
          ` : `
            <span class="status-pill status-leave" style="font-size: 0.72rem;">Faculty View (Directory)</span>
          `}
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; align-items: end;">
          <div class="form-group" style="margin-bottom: 0; grid-column: span 2;">
            <label class="form-label">Search Faculty</label>
            <div style="position: relative;">
              <input type="text" class="form-control" placeholder="Search by name, employee ID, or department..." value="${this.state.searchQuery}" oninput="TeacherModule.onSearchChange(event)" style="padding-left: 2rem;">
              <svg style="position: absolute; left: 0.75rem; top: 10px; color: var(--text-muted);" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Department</label>
            <select class="form-select" onchange="TeacherModule.onFilterChange('departmentFilter', this.value)">
              <option value="ALL" ${this.state.departmentFilter === 'ALL' ? 'selected' : ''}>All Departments</option>
              <option value="Computer Science & Engineering" ${this.state.departmentFilter === 'Computer Science & Engineering' ? 'selected' : ''}>CSE</option>
              <option value="Electronics & Communication" ${this.state.departmentFilter === 'Electronics & Communication' ? 'selected' : ''}>ECE</option>
              <option value="Artificial Intelligence & Data Science" ${this.state.departmentFilter === 'Artificial Intelligence & Data Science' ? 'selected' : ''}>AI &amp; DS</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Employment Status</label>
            <select class="form-select" onchange="TeacherModule.onFilterChange('statusFilter', this.value)">
              <option value="ALL" ${this.state.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
              <option value="Active" ${this.state.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
              <option value="On Leave" ${this.state.statusFilter === 'On Leave' ? 'selected' : ''}>On Leave</option>
              <option value="Resigned" ${this.state.statusFilter === 'Resigned' ? 'selected' : ''}>Resigned</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Directory Table Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
            Faculty Directory (${filtered.length} Records)
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
                <th class="th-sortable" onclick="TeacherModule.toggleSort('fullName')">
                  Teacher Name ${this.renderSortIcon('fullName')}
                </th>
                <th class="th-sortable" onclick="TeacherModule.toggleSort('employeeId')">
                  Employee ID ${this.renderSortIcon('employeeId')}
                </th>
                <th>Department</th>
                <th>Contact</th>
                <th>Assigned Classes</th>
                <th>Assigned Subjects</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center; width: 130px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.length > 0 ? paginated.map((t, idx) => this.renderTeacherRow(t, (this.state.page - 1) * this.state.pageSize + idx + 1, isAdmin)).join('') : `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div style="font-weight: 700; font-size: 1.05rem; color: var(--brand-navy); margin-bottom: 0.25rem;">No faculty members found</div>
                    <p style="font-size: 0.85rem; margin-bottom: 1rem;">Try adjusting your department or search query.</p>
                    <button class="btn btn-secondary btn-sm" onclick="TeacherModule.resetFilters()">Reset Filters</button>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <div class="table-pagination-bar">
          <div class="pagination-info">
            Showing ${filtered.length > 0 ? (this.state.page - 1) * this.state.pageSize + 1 : 0} to ${Math.min(this.state.page * this.state.pageSize, filtered.length)} of ${filtered.length} entries
          </div>
          <div class="pagination-btns">
            <button class="page-num-btn" onclick="TeacherModule.changePage(${this.state.page - 1})" ${this.state.page <= 1 ? 'disabled' : ''}>&lsaquo;</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <button class="page-num-btn ${p === this.state.page ? 'active' : ''}" onclick="TeacherModule.changePage(${p})">${p}</button>
            `).join('')}
            <button class="page-num-btn" onclick="TeacherModule.changePage(${this.state.page + 1})" ${this.state.page >= totalPages ? 'disabled' : ''}>&rsaquo;</button>
          </div>
        </div>
      </div>
    `;
  },

  renderTeacherRow(t, indexNum, isAdmin) {
    return `
      <tr>
        <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${indexNum}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${t.photo}" alt="${t.fullName}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-color);">
            <div>
              <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.88rem; cursor: pointer;" onclick="TeacherModule.viewProfile('${t.id}')">
                ${t.fullName}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${t.qualification}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-family: monospace; font-weight: 700; color: var(--primary-blue); font-size: 0.88rem;">${t.employeeId}</span>
        </td>
        <td>
          <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-dark);">${t.department}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; color: var(--text-dark);">${t.email}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${t.phone}</div>
        </td>
        <td>
          <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
            ${(t.assignedClasses || []).map(c => `<span class="status-pill status-leave" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">${c}</span>`).join('')}
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
            ${(t.assignedSubjects || []).map(s => `<span class="status-pill status-present" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">${s}</span>`).join('')}
          </div>
        </td>
        <td style="text-align: center;">
          <span class="status-pill ${t.status === 'Active' ? 'status-present' : 'status-late'}">
            ${t.status}
          </span>
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 0.35rem; justify-content: center;">
            <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="View Faculty Profile" onclick="TeacherModule.viewProfile('${t.id}')">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            ${isAdmin ? `
              <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="Edit Faculty Profile" onclick="TeacherModule.openEditModal('${t.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; color: var(--absent-red);" title="Deactivate Faculty" onclick="TeacherModule.confirmDelete('${t.id}')">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  },

  renderSortIcon(field) {
    if (this.state.sortField !== field) return '<span style="opacity: 0.3; font-size: 0.7rem;">↕</span>';
    return this.state.sortAsc ? '▲' : '▼';
  },

  getFilteredTeachers(teachers) {
    let list = [...teachers];

    if (this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase().trim();
      list = list.filter(t =>
        t.fullName.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
      );
    }

    if (this.state.departmentFilter !== 'ALL') {
      list = list.filter(t => t.department === this.state.departmentFilter);
    }

    if (this.state.statusFilter !== 'ALL') {
      list = list.filter(t => t.status === this.state.statusFilter);
    }

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

  getPaginatedTeachers(filtered) {
    const start = (this.state.page - 1) * this.state.pageSize;
    return filtered.slice(start, start + this.state.pageSize);
  },

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
    this.state.departmentFilter = 'ALL';
    this.state.statusFilter = 'ALL';
    this.state.page = 1;
    this.reRender();
  },

  reRender() {
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  // ============================================================================
  // 2. ADD & EDIT TEACHER MODAL (Admin Only)
  // ============================================================================
  openAddModal() {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can add faculty members.', 'error');
      return;
    }

    const modalHtml = this.generateTeacherFormHtml(null);
    App.openModal('Register Faculty Member (Admin Privilege)', modalHtml, () => {
      this.submitTeacherForm(null);
    });
  },

  openEditModal(teacherId) {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can modify faculty credentials.', 'error');
      return;
    }

    const teacher = AcademicDataService.getTeacherById(teacherId);
    if (!teacher) return;

    const modalHtml = this.generateTeacherFormHtml(teacher);
    App.openModal(`Edit Faculty: ${teacher.fullName}`, modalHtml, () => {
      this.submitTeacherForm(teacherId);
    });
  },

  generateTeacherFormHtml(teacher = null) {
    const t = teacher || {
      firstName: '',
      lastName: '',
      employeeId: '',
      email: '',
      phone: '',
      dob: '1985-05-15',
      gender: 'Male',
      qualification: 'Ph.D. in Computer Science',
      department: 'Computer Science & Engineering',
      joiningDate: new Date().toISOString().split('T')[0],
      address: '',
      assignedClasses: ['BE-CSE-3A'],
      assignedSubjects: ['CS301'],
      status: 'Active'
    };

    return `
      <form id="teacherModalForm" onsubmit="event.preventDefault();" style="font-size: 0.84rem;">
        <div id="teacherFormErrors" style="display: none;" class="validation-error-alert"></div>

        <div class="form-section-title">1. Faculty Identity &amp; Contact</div>
        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">First Name *</label>
            <input type="text" class="form-field-input" id="tchFirstName" value="${t.firstName}" placeholder="First Name" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Last Name *</label>
            <input type="text" class="form-field-input" id="tchLastName" value="${t.lastName}" placeholder="Last Name" required>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Employee ID (Unique) *</label>
            <input type="text" class="form-field-input" id="tchEmployeeId" value="${t.employeeId}" placeholder="e.g. EMP-9920" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Official Email *</label>
            <input type="email" class="form-field-input" id="tchEmail" value="${t.email}" placeholder="faculty@saveetha.ac.in" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Contact Phone *</label>
            <input type="tel" class="form-field-input" id="tchPhone" value="${t.phone}" placeholder="9840182736" required>
          </div>
        </div>

        <div class="form-section-title">2. Employment &amp; Department</div>
        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Department *</label>
            <select class="form-field-select" id="tchDepartment">
              <option value="Computer Science & Engineering" ${t.department === 'Computer Science & Engineering' ? 'selected' : ''}>CSE</option>
              <option value="Electronics & Communication" ${t.department === 'Electronics & Communication' ? 'selected' : ''}>ECE</option>
              <option value="Artificial Intelligence & Data Science" ${t.department === 'Artificial Intelligence & Data Science' ? 'selected' : ''}>AI &amp; DS</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Qualification</label>
            <input type="text" class="form-field-input" id="tchQualification" value="${t.qualification}" placeholder="Ph.D., M.E.">
          </div>
          <div class="form-field">
            <label class="form-field-label">Employment Status</label>
            <select class="form-field-select" id="tchStatus">
              <option value="Active" ${t.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="On Leave" ${t.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
              <option value="Resigned" ${t.status === 'Resigned' ? 'selected' : ''}>Resigned</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Date of Joining</label>
            <input type="date" class="form-field-input" id="tchJoiningDate" value="${t.joiningDate}">
          </div>
          <div class="form-field">
            <label class="form-field-label">Residential Address</label>
            <input type="text" class="form-field-input" id="tchAddress" value="${t.address || ''}" placeholder="Campus Staff Quarters or City Address">
          </div>
        </div>
      </form>
    `;
  },

  submitTeacherForm(existingId = null) {
    const firstName = document.getElementById('tchFirstName')?.value.trim();
    const lastName = document.getElementById('tchLastName')?.value.trim();
    const employeeId = document.getElementById('tchEmployeeId')?.value.trim();
    const email = document.getElementById('tchEmail')?.value.trim();
    const phone = document.getElementById('tchPhone')?.value.trim();
    const department = document.getElementById('tchDepartment')?.value;
    const qualification = document.getElementById('tchQualification')?.value.trim();
    const status = document.getElementById('tchStatus')?.value;
    const joiningDate = document.getElementById('tchJoiningDate')?.value;
    const address = document.getElementById('tchAddress')?.value.trim();

    const payload = {
      firstName,
      lastName,
      employeeId,
      email,
      phone,
      department,
      qualification,
      status,
      joiningDate,
      address
    };

    let result;
    if (existingId) {
      result = AcademicDataService.updateTeacher(existingId, payload);
    } else {
      result = AcademicDataService.addTeacher(payload);
    }

    if (!result.success) {
      const errBox = document.getElementById('teacherFormErrors');
      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerHTML = `<strong>Please correct the following:</strong><ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
      return;
    }

    App.closeModal();
    App.toast(existingId ? 'Faculty record updated successfully' : 'Faculty registered successfully', 'success');
    this.reRender();
  },

  confirmDelete(teacherId) {
    const teacher = AcademicDataService.getTeacherById(teacherId);
    if (!teacher) return;

    const confirmHtml = `
      <div style="font-size: 0.88rem; color: var(--text-dark); line-height: 1.5;">
        <p style="margin-bottom: 0.75rem;">Are you sure you want to deactivate faculty record for <strong>${teacher.fullName}</strong>?</p>
        <div style="background: var(--bg-soft); padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
          <div>Employee ID: <strong>${teacher.employeeId}</strong></div>
          <div>Department: <strong>${teacher.department}</strong></div>
        </div>
        <p style="color: var(--absent-red); font-size: 0.8rem; margin: 0;">
          Warning: Unassigned class attendance workflows may be impacted.
        </p>
      </div>
    `;

    App.openModal('Confirm Faculty Deactivation', confirmHtml, () => {
      const res = AcademicDataService.deleteTeacher(teacherId);
      if (res.success) {
        App.toast(`Faculty ${teacher.fullName} deactivated successfully`, 'info');
        this.reRender();
      } else {
        App.toast('Failed to delete faculty member', 'error');
      }
    });
  },

  exportCSV() {
    const teachers = this.getFilteredTeachers(AcademicDataService.getTeachers());
    let csv = '\uFEFF';
    csv += 'Employee ID,Full Name,Department,Qualification,Email,Phone,Status\r\n';

    teachers.forEach(t => {
      csv += `"${t.employeeId}","${t.fullName}","${t.department}","${t.qualification}","${t.email}","${t.phone}","${t.status}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Saveetha_Faculty_Directory_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.toast(`Exported ${teachers.length} faculty records to CSV`, 'success');
  },

  // ============================================================================
  // 3. SIX-TAB TEACHER PROFILE VIEW
  // ============================================================================
  viewProfile(teacherId) {
    this.state.activeProfileId = teacherId;
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

  renderProfile(container, teacherId) {
    const teacher = AcademicDataService.getTeacherById(teacherId);
    if (!teacher) {
      container.innerHTML = `<div class="dashboard-card" style="padding: 2rem;">Faculty not found. <button class="btn btn-secondary btn-sm" onclick="TeacherModule.closeProfile()">Back</button></div>`;
      return;
    }

    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';

    container.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-secondary btn-sm" onclick="TeacherModule.closeProfile()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to Faculty Directory
        </button>
        ${isAdmin ? `
          <button class="btn btn-primary btn-sm" onclick="TeacherModule.openEditModal('${teacher.id}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Faculty Credentials
          </button>
        ` : ''}
      </div>

      <div class="profile-hero-card">
        <div class="profile-hero-main">
          <img src="${teacher.photo}" alt="${teacher.fullName}" class="profile-hero-avatar">
          <div>
            <h1 class="profile-hero-name">${teacher.fullName}</h1>
            <div class="profile-hero-sub">
              <span>Employee ID: <strong style="color: var(--primary-blue); font-family: monospace;">${teacher.employeeId}</strong></span>
              <span>&bull;</span>
              <span>${teacher.qualification}</span>
              <span>&bull;</span>
              <span>${teacher.department}</span>
            </div>
            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
              <span class="status-pill ${teacher.status === 'Active' ? 'status-present' : 'status-late'}">${teacher.status} Faculty</span>
              <span class="status-pill status-leave">Saveetha School of Engineering</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <div class="profile-stat-box">
            <div class="profile-stat-label">Assigned Classes</div>
            <div class="profile-stat-num">${teacher.assignedClasses?.length || 2}</div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-label">Teaching Subjects</div>
            <div class="profile-stat-num">${teacher.assignedSubjects?.length || 2}</div>
          </div>
        </div>
      </div>

      <!-- 6 Profile Navigation Tabs -->
      <div class="profile-tab-bar">
        <button class="profile-tab-btn ${this.state.profileTab === 'overview' ? 'active' : ''}" onclick="TeacherModule.setProfileTab('overview')">1. Overview</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'personal' ? 'active' : ''}" onclick="TeacherModule.setProfileTab('personal')">2. Personal Information</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'employment' ? 'active' : ''}" onclick="TeacherModule.setProfileTab('employment')">3. Employment Information</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'classes' ? 'active' : ''}" onclick="TeacherModule.setProfileTab('classes')">4. Assigned Classes</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'subjects' ? 'active' : ''}" onclick="TeacherModule.setProfileTab('subjects')">5. Assigned Subjects</button>
        <button class="profile-tab-btn ${this.state.profileTab === 'timetable' ? 'active' : ''}" onclick="TeacherModule.setProfileTab('timetable')">6. Timetable</button>
      </div>

      <div class="dashboard-card" style="padding: 1.5rem;">
        ${this.renderTeacherProfileTabContent(teacher)}
      </div>
    `;
  },

  renderTeacherProfileTabContent(teacher) {
    const tab = this.state.profileTab;

    if (tab === 'overview') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Faculty Workload &amp; Academic Overview</div>
        <div class="stat-grid-3" style="margin-bottom: 1.5rem;">
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Weekly Teaching Hours</span>
            <div class="stat-card-value text-present">16 Hrs/Week</div>
          </div>
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Enrolled Students</span>
            <div class="stat-card-value">122 Students</div>
          </div>
          <div class="stat-card" style="padding: 1rem;">
            <span class="stat-card-title">Class Attendance Average</span>
            <div class="stat-card-value" style="color: var(--primary-blue);">88.4%</div>
          </div>
        </div>
      `;
    }

    if (tab === 'personal') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1.25rem;">Personal Record</div>
        <div class="info-grid-2">
          <div class="info-item"><span class="info-item-label">Full Name</span><span class="info-item-value">${teacher.fullName}</span></div>
          <div class="info-item"><span class="info-item-label">Gender</span><span class="info-item-value">${teacher.gender || 'Male'}</span></div>
          <div class="info-item"><span class="info-item-label">Date of Birth</span><span class="info-item-value">${teacher.dob || '1982-06-18'}</span></div>
          <div class="info-item"><span class="info-item-label">Contact Number</span><span class="info-item-value">${teacher.phone}</span></div>
          <div class="info-item"><span class="info-item-label">Institutional Email</span><span class="info-item-value">${teacher.email}</span></div>
          <div class="info-item"><span class="info-item-label">Address</span><span class="info-item-value">${teacher.address || 'Chennai, Tamil Nadu'}</span></div>
        </div>
      `;
    }

    if (tab === 'employment') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1.25rem;">Employment &amp; Designation</div>
        <div class="info-grid-2">
          <div class="info-item"><span class="info-item-label">Employee ID</span><span class="info-item-value" style="font-family: monospace; color: var(--primary-blue); font-weight: 800;">${teacher.employeeId}</span></div>
          <div class="info-item"><span class="info-item-label">Department</span><span class="info-item-value">${teacher.department}</span></div>
          <div class="info-item"><span class="info-item-label">Highest Qualification</span><span class="info-item-value">${teacher.qualification}</span></div>
          <div class="info-item"><span class="info-item-label">Joining Date</span><span class="info-item-value">${teacher.joiningDate}</span></div>
          <div class="info-item"><span class="info-item-label">Status</span><span class="info-item-value">${teacher.status}</span></div>
          <div class="info-item"><span class="info-item-label">Role in Portal</span><span class="info-item-value">TEACHER (Authorized Academic Admin)</span></div>
        </div>
      `;
    }

    if (tab === 'classes') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Assigned Classes &amp; Sections</div>
        <table class="table-custom">
          <thead><tr><th>Class Code</th><th>Class Name</th><th>Section</th><th>Total Students</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td style="font-family: monospace;">BE-CSE-3A</td><td>B.E. Computer Science &amp; Engineering</td><td>A</td><td>62</td><td><span class="status-pill status-present">Class Teacher</span></td></tr>
            <tr><td style="font-family: monospace;">BE-CSE-3B</td><td>B.E. Computer Science &amp; Engineering</td><td>B</td><td>60</td><td><span class="status-pill status-leave">Subject Faculty</span></td></tr>
          </tbody>
        </table>
      `;
    }

    if (tab === 'subjects') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Assigned Teaching Subjects</div>
        <table class="table-custom">
          <thead><tr><th>Subject Code</th><th>Subject Name</th><th>Type</th><th>Weekly Periods</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td style="font-family: monospace; font-weight: 700;">CS301</td><td>Design and Analysis of Algorithms</td><td>Theory</td><td>4 Periods</td><td><span class="status-pill status-present">Active</span></td></tr>
            <tr><td style="font-family: monospace; font-weight: 700;">CS305</td><td>Algorithms &amp; Data Structures Laboratory</td><td>Lab</td><td>3 Periods</td><td><span class="status-pill status-present">Active</span></td></tr>
          </tbody>
        </table>
      `;
    }

    if (tab === 'timetable') {
      return `
        <div style="font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; margin-bottom: 1rem;">Weekly Teaching Schedule</div>
        <table class="table-custom">
          <thead><tr><th>Day</th><th>08:30 - 09:20</th><th>09:20 - 10:10</th><th>10:30 - 11:20</th><th>11:20 - 12:10</th><th>01:00 - 02:30</th></tr></thead>
          <tbody>
            <tr><td style="font-weight: 700;">Mon</td><td>CS301 (CSE 3A)</td><td>Free</td><td>Free</td><td>CS301 (CSE 3B)</td><td>Algorithms Lab (Lab 2)</td></tr>
            <tr><td style="font-weight: 700;">Tue</td><td>Free</td><td>CS301 (CSE 3A)</td><td>Free</td><td>CS301 (CSE 3B)</td><td>Free</td></tr>
            <tr><td style="font-weight: 700;">Wed</td><td>Free</td><td>Free</td><td>CS301 (CSE 3A)</td><td>Department Meeting</td><td>Research / Mentoring</td></tr>
            <tr><td style="font-weight: 700;">Thu</td><td>CS301 (CSE 3A)</td><td>Free</td><td>Free</td><td>CS301 (CSE 3B)</td><td>Algorithms Lab (Lab 2)</td></tr>
            <tr><td style="font-weight: 700;">Fri</td><td>Free</td><td>Free</td><td>Free</td><td>CS301 (CSE 3A)</td><td>Office Hours</td></tr>
          </tbody>
        </table>
      `;
    }

    return `<div>Tab content</div>`;
  }
};

window.TeacherModule = TeacherModule;
