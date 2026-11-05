/**
 * MaccaAttendX - Subject Management Module (Milestone 2)
 * Manages Curriculum Subjects, Course Codes, Faculty Allocations,
 * Weekly Period Loads, and enforces unique Subject Code constraints.
 */

const SubjectModule = {
  state: {
    searchQuery: '',
    typeFilter: 'ALL',
    deptFilter: 'ALL'
  },

  render(container) {
    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';
    const subjects = AcademicDataService.getSubjects();
    const filtered = this.getFilteredSubjects(subjects);

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Subject &amp; Course Management</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Curriculum Registry, Credit Allocations &amp; Course Leaders
          </p>
        </div>
        <div class="banner-actions">
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="SubjectModule.openAddModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Add Course Subject
            </button>
          ` : `
            <span class="status-pill status-leave" style="font-size: 0.72rem;">Curriculum Ledger View</span>
          `}
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Search Subjects</label>
            <input type="text" class="form-control" placeholder="Search by course code or subject title..." value="${this.state.searchQuery}" oninput="SubjectModule.onSearchChange(event)">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Course Type</label>
            <select class="form-select" onchange="SubjectModule.onFilterChange('typeFilter', this.value)">
              <option value="ALL">All Types</option>
              <option value="Theory">Theory</option>
              <option value="Practical / Lab">Practical / Lab</option>
              <option value="Integrated">Integrated</option>
              <option value="Project">Project</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Department</label>
            <select class="form-select" onchange="SubjectModule.onFilterChange('deptFilter', this.value)">
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Electronics & Communication">ECE</option>
              <option value="Artificial Intelligence & Data Science">AI &amp; DS</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Subjects Table Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
          Academic Course Directory (${filtered.length} Subjects)
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th style="width: 130px;">Course Code</th>
                <th>Subject Name</th>
                <th>Course Type</th>
                <th>Department</th>
                <th>Assigned Faculty</th>
                <th style="text-align: center;">Weekly Periods</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center; width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map((s, idx) => `
                <tr>
                  <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${idx + 1}</td>
                  <td>
                    <span style="font-family: monospace; font-weight: 800; color: var(--primary-blue); font-size: 0.9rem;">
                      ${s.code}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.9rem;">${s.name}</div>
                  </td>
                  <td>
                    <span class="status-pill ${s.type.includes('Lab') ? 'status-leave' : 'status-present'}" style="font-size: 0.72rem;">
                      ${s.type}
                    </span>
                  </td>
                  <td style="font-size: 0.82rem;">${s.department}</td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.84rem;">${s.teacherName || 'Unassigned'}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${s.teacherId || ''}</div>
                  </td>
                  <td style="text-align: center; font-weight: 700;">
                    ${s.weeklyPeriods} Periods/Wk
                  </td>
                  <td style="text-align: center;">
                    <span class="status-pill status-present">${s.status}</span>
                  </td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.35rem; justify-content: center;">
                      ${isAdmin ? `
                        <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="Edit Subject" onclick="SubjectModule.openEditModal('${s.id}')">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; color: var(--absent-red);" title="Delete Subject" onclick="SubjectModule.confirmDelete('${s.id}')">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      ` : `
                        <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" onclick="Navigation.navigateTo('attendance')">Sessions</button>
                      `}
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No subjects match filter criteria.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  getFilteredSubjects(subjects) {
    let list = [...subjects];
    if (this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.teacherName && s.teacherName.toLowerCase().includes(q)));
    }
    if (this.state.typeFilter !== 'ALL') {
      list = list.filter(s => s.type === this.state.typeFilter);
    }
    if (this.state.deptFilter !== 'ALL') {
      list = list.filter(s => s.department === this.state.deptFilter);
    }
    return list;
  },

  onSearchChange(e) {
    this.state.searchQuery = e.target.value;
    this.reRender();
  },

  onFilterChange(key, val) {
    this.state[key] = val;
    this.reRender();
  },

  reRender() {
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  },

  // ============================================================================
  // ADD & EDIT SUBJECT MODAL (Unique Code Constraint)
  // ============================================================================
  openAddModal() {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can add curriculum subjects.', 'error');
      return;
    }

    const modalHtml = this.generateSubjectFormHtml(null);
    App.openModal('Add Course Subject', modalHtml, () => {
      this.submitSubjectForm(null);
    });
  },

  openEditModal(subjectId) {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can modify subjects.', 'error');
      return;
    }

    const sub = AcademicDataService.getSubjects().find(s => s.id === subjectId);
    if (!sub) return;

    const modalHtml = this.generateSubjectFormHtml(sub);
    App.openModal(`Edit Subject: ${sub.code} - ${sub.name}`, modalHtml, () => {
      this.submitSubjectForm(subjectId);
    });
  },

  generateSubjectFormHtml(sub = null) {
    const s = sub || {
      code: '',
      name: '',
      type: 'Theory',
      department: 'Computer Science & Engineering',
      classId: 'BE-CSE-3A',
      teacherId: 'TCH-201',
      weeklyPeriods: 4,
      status: 'Active'
    };

    const teachers = AcademicDataService.getTeachers();

    return `
      <form id="subjectModalForm" onsubmit="event.preventDefault();" style="font-size: 0.84rem;">
        <div id="subjectFormErrors" style="display: none;" class="validation-error-alert"></div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Subject Code (Unique) *</label>
            <input type="text" class="form-field-input" id="subCode" value="${s.code}" placeholder="e.g. CS306" style="text-transform: uppercase; font-family: monospace; font-weight: 700;" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Subject Title *</label>
            <input type="text" class="form-field-input" id="subName" value="${s.name}" placeholder="e.g. Cloud Computing & Microservices" required>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Course Type</label>
            <select class="form-field-select" id="subType">
              <option value="Theory" ${s.type === 'Theory' ? 'selected' : ''}>Theory</option>
              <option value="Practical / Lab" ${s.type === 'Practical / Lab' ? 'selected' : ''}>Practical / Lab</option>
              <option value="Integrated" ${s.type === 'Integrated' ? 'selected' : ''}>Integrated</option>
              <option value="Project" ${s.type === 'Project' ? 'selected' : ''}>Project</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Department</label>
            <select class="form-field-select" id="subDept">
              <option value="Computer Science & Engineering" ${s.department === 'Computer Science & Engineering' ? 'selected' : ''}>CSE</option>
              <option value="Electronics & Communication" ${s.department === 'Electronics & Communication' ? 'selected' : ''}>ECE</option>
              <option value="Artificial Intelligence & Data Science" ${s.department === 'Artificial Intelligence & Data Science' ? 'selected' : ''}>AI &amp; DS</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Weekly Periods</label>
            <input type="number" class="form-field-input" id="subPeriods" value="${s.weeklyPeriods || 4}" min="1" max="10">
          </div>
        </div>

        <div class="form-field">
          <label class="form-field-label">Assigned Course Leader (Faculty)</label>
          <select class="form-field-select" id="subTeacher">
            ${teachers.map(t => `
              <option value="${t.id}" ${s.teacherId === t.id ? 'selected' : ''}>
                ${t.fullName} (${t.department})
              </option>
            `).join('')}
          </select>
        </div>
      </form>
    `;
  },

  submitSubjectForm(existingId = null) {
    const code = document.getElementById('subCode')?.value.trim().toUpperCase();
    const name = document.getElementById('subName')?.value.trim();
    const type = document.getElementById('subType')?.value;
    const department = document.getElementById('subDept')?.value;
    const weeklyPeriods = parseInt(document.getElementById('subPeriods')?.value, 10) || 4;
    const teacherId = document.getElementById('subTeacher')?.value;

    const teacher = AcademicDataService.getTeacherById(teacherId);
    const teacherName = teacher ? teacher.fullName : 'Unassigned';

    const payload = {
      code,
      name,
      type,
      department,
      weeklyPeriods,
      teacherId,
      teacherName,
      status: 'Active'
    };

    let result;
    if (existingId) {
      result = AcademicDataService.updateSubject(existingId, payload);
    } else {
      result = AcademicDataService.addSubject(payload);
    }

    if (!result.success) {
      const errBox = document.getElementById('subjectFormErrors');
      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerHTML = `<strong>Validation Error:</strong><ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
      return;
    }

    App.closeModal();
    App.toast(existingId ? 'Subject updated successfully' : 'New subject registered successfully', 'success');
    this.reRender();
  },

  confirmDelete(subjectId) {
    const sub = AcademicDataService.getSubjects().find(s => s.id === subjectId);
    if (!sub) return;

    App.openModal('Delete Subject', `
      <div style="font-size: 0.88rem;">
        Are you sure you want to remove <strong>${sub.code} - ${sub.name}</strong>?
        <div style="color: var(--absent-red); font-size: 0.8rem; margin-top: 0.5rem;">
          Warning: Existing session attendance and timetable links will be detached.
        </div>
      </div>
    `, () => {
      AcademicDataService.deleteSubject(subjectId);
      App.toast('Subject removed successfully', 'info');
      this.reRender();
    });
  }
};

window.SubjectModule = SubjectModule;
