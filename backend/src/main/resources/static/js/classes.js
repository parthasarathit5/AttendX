/**
 * MaccaAttendX - Class & Section Management Module (Milestone 2)
 * Manages Classes, Sections, Assigned Class Teachers, Enrolled Student Roster,
 * and enforces duplicate class-section constraints within the same academic year.
 */

const ClassModule = {
  state: {
    searchQuery: '',
    yearFilter: 'ALL',
    gradeFilter: 'ALL'
  },

  render(container) {
    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';
    const classes = AcademicDataService.getClasses();
    const filtered = this.getFilteredClasses(classes);

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Class &amp; Section Management</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Section Allocation, Faculty In-Charges &amp; Batch Capacities
          </p>
        </div>
        <div class="banner-actions">
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="ClassModule.openAddModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Create Class &amp; Section
            </button>
          ` : `
            <span class="status-pill status-leave" style="font-size: 0.72rem;">Academic Roster View</span>
          `}
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="dashboard-card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: end;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Search Classes</label>
            <input type="text" class="form-control" placeholder="Search class name or faculty..." value="${this.state.searchQuery}" oninput="ClassModule.onSearchChange(event)">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Academic Year</label>
            <select class="form-select" onchange="ClassModule.onFilterChange('yearFilter', this.value)">
              <option value="ALL">All Academic Years</option>
              <option value="2025–2026">2025–2026 (Active)</option>
              <option value="2024–2025">2024–2025</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Year / Grade</label>
            <select class="form-select" onchange="ClassModule.onFilterChange('gradeFilter', this.value)">
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Classes Directory Table Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
          Academic Classes &amp; Sections Ledger (${filtered.length} Classes)
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th>Class / Degree Name</th>
                <th>Year</th>
                <th style="text-align: center;">Section</th>
                <th>Class Teacher (In-Charge)</th>
                <th style="text-align: center;">Student Strength</th>
                <th>Academic Year</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center; width: 140px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map((c, idx) => `
                <tr>
                  <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${idx + 1}</td>
                  <td>
                    <div style="font-weight: 700; color: var(--brand-navy); font-size: 0.9rem;">${c.name}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">${c.id}</div>
                  </td>
                  <td>${c.grade}</td>
                  <td style="text-align: center;">
                    <span class="status-pill status-present" style="font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem;">
                      Section ${c.section}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.84rem;">${c.classTeacherName || 'Unassigned'}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${c.classTeacherId || ''}</div>
                  </td>
                  <td style="text-align: center;">
                    <span style="font-weight: 700; font-size: 0.92rem; color: var(--text-dark);">${c.studentCount} Students</span>
                  </td>
                  <td>${c.academicYear}</td>
                  <td style="text-align: center;">
                    <span class="status-pill status-present">${c.status}</span>
                  </td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.35rem; justify-content: center;">
                      <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="View Enrolled Students" onclick="ClassModule.viewEnrolledStudents('${c.id}', '${c.name}', '${c.section}')">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                      </button>
                      ${isAdmin ? `
                        <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="Edit Class" onclick="ClassModule.openEditModal('${c.id}')">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; color: var(--absent-red);" title="Delete Class" onclick="ClassModule.confirmDelete('${c.id}')">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No classes match filter criteria.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  getFilteredClasses(classes) {
    let list = [...classes];
    if (this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.classTeacherName && c.classTeacherName.toLowerCase().includes(q)) || c.id.toLowerCase().includes(q));
    }
    if (this.state.yearFilter !== 'ALL') {
      list = list.filter(c => c.academicYear === this.state.yearFilter);
    }
    if (this.state.gradeFilter !== 'ALL') {
      list = list.filter(c => c.grade === this.state.gradeFilter);
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
  // 2. ENROLLED STUDENTS ROSTER MODAL
  // ============================================================================
  viewEnrolledStudents(classId, className, section) {
    const allStudents = AcademicDataService.getStudents();
    const enrolled = allStudents.filter(s => s.classId === classId || (s.className.includes('3rd Year') && s.section === section));

    const modalHtml = `
      <div style="font-size: 0.85rem;">
        <div style="margin-bottom: 1rem; color: var(--text-muted);">
          Official class strength for <strong>${className} (Section ${section})</strong>: <strong>${enrolled.length} enrolled students</strong>.
        </div>
        <div style="max-height: 380px; overflow-y: auto;">
          <table class="table-custom">
            <thead>
              <tr><th>#</th><th>Student Name</th><th>Registration No</th><th>Roll No</th><th>Attendance %</th></tr>
            </thead>
            <tbody>
              ${enrolled.length > 0 ? enrolled.map((s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${s.fullName}</strong></td>
                  <td style="font-family: monospace; color: var(--primary-blue); font-weight: 700;">${s.registrationNumber}</td>
                  <td style="font-family: monospace;">${s.rollNumber}</td>
                  <td><span class="status-pill ${s.attendancePercentage >= 75 ? 'status-present' : 'status-absent'}">${s.attendancePercentage}%</span></td>
                </tr>
              `).join('') : `
                <tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No enrolled students registered in this section yet.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    App.openModal(`Class Enrolled Roster: ${className} (Sec ${section})`, modalHtml);
  },

  // ============================================================================
  // 3. CREATE & EDIT CLASS MODAL (Duplicate Prevention Check)
  // ============================================================================
  openAddModal() {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can create classes.', 'error');
      return;
    }

    const modalHtml = this.generateClassFormHtml(null);
    App.openModal('Create New Class & Section', modalHtml, () => {
      this.submitClassForm(null);
    });
  },

  openEditModal(classId) {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can modify class records.', 'error');
      return;
    }

    const cls = AcademicDataService.getClasses().find(c => c.id === classId);
    if (!cls) return;

    const modalHtml = this.generateClassFormHtml(cls);
    App.openModal(`Edit Class: ${cls.name} (${cls.section})`, modalHtml, () => {
      this.submitClassForm(classId);
    });
  },

  generateClassFormHtml(cls = null) {
    const c = cls || {
      name: 'B.E. Computer Science & Engineering',
      grade: '3rd Year',
      section: 'A',
      academicYear: '2025–2026',
      classTeacherId: 'TCH-201',
      studentCount: 60,
      status: 'Active'
    };

    const teachers = AcademicDataService.getTeachers();

    return `
      <form id="classModalForm" onsubmit="event.preventDefault();" style="font-size: 0.84rem;">
        <div id="classFormErrors" style="display: none;" class="validation-error-alert"></div>

        <div class="form-field">
          <label class="form-field-label">Class / Degree Name *</label>
          <input type="text" class="form-field-input" id="clsName" value="${c.name}" placeholder="e.g. B.E. Computer Science & Engineering" required>
        </div>

        <div class="form-grid-3">
          <div class="form-field">
            <label class="form-field-label">Year / Grade *</label>
            <select class="form-field-select" id="clsGrade">
              <option value="1st Year" ${c.grade === '1st Year' ? 'selected' : ''}>1st Year</option>
              <option value="2nd Year" ${c.grade === '2nd Year' ? 'selected' : ''}>2nd Year</option>
              <option value="3rd Year" ${c.grade === '3rd Year' ? 'selected' : ''}>3rd Year</option>
              <option value="4th Year" ${c.grade === '4th Year' ? 'selected' : ''}>4th Year</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Section (Letter) *</label>
            <input type="text" class="form-field-input" id="clsSection" value="${c.section}" placeholder="e.g. A, B, C" maxlength="2" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Academic Year *</label>
            <select class="form-field-select" id="clsAcademicYear">
              <option value="2025–2026" ${c.academicYear === '2025–2026' ? 'selected' : ''}>2025–2026</option>
              <option value="2026–2027" ${c.academicYear === '2026–2027' ? 'selected' : ''}>2026–2027</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Assign Class Teacher In-Charge</label>
            <select class="form-field-select" id="clsTeacher">
              ${teachers.map(t => `
                <option value="${t.id}" ${c.classTeacherId === t.id ? 'selected' : ''}>
                  ${t.fullName} (${t.department})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-field-label">Batch Student Capacity</label>
            <input type="number" class="form-field-input" id="clsCount" value="${c.studentCount || 60}" min="1" max="100">
          </div>
        </div>
      </form>
    `;
  },

  submitClassForm(existingId = null) {
    const name = document.getElementById('clsName')?.value.trim();
    const grade = document.getElementById('clsGrade')?.value;
    const section = document.getElementById('clsSection')?.value.trim().toUpperCase();
    const academicYear = document.getElementById('clsAcademicYear')?.value;
    const classTeacherId = document.getElementById('clsTeacher')?.value;
    const studentCount = parseInt(document.getElementById('clsCount')?.value, 10) || 60;

    const teacher = AcademicDataService.getTeacherById(classTeacherId);
    const classTeacherName = teacher ? teacher.fullName : 'Unassigned';

    const payload = {
      name,
      grade,
      section,
      academicYear,
      classTeacherId,
      classTeacherName,
      studentCount,
      status: 'Active'
    };

    let result;
    if (existingId) {
      result = AcademicDataService.updateClass(existingId, payload);
    } else {
      result = AcademicDataService.addClass(payload);
    }

    if (!result.success) {
      const errBox = document.getElementById('classFormErrors');
      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerHTML = `<strong>Validation Error:</strong><ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
      return;
    }

    App.closeModal();
    App.toast(existingId ? 'Class updated successfully' : 'New class created successfully', 'success');
    this.reRender();
  },

  confirmDelete(classId) {
    const cls = AcademicDataService.getClasses().find(c => c.id === classId);
    if (!cls) return;

    App.openModal('Delete Class & Section', `
      <div style="font-size: 0.88rem;">
        Are you sure you want to remove <strong>${cls.name} (Section ${cls.section})</strong>?
        <div style="color: var(--absent-red); font-size: 0.8rem; margin-top: 0.5rem;">
          Warning: Enrolled students and timetables associated with this section will be unassigned.
        </div>
      </div>
    `, () => {
      AcademicDataService.deleteClass(classId);
      App.toast('Class removed successfully', 'info');
      this.reRender();
    });
  }
};

window.ClassModule = ClassModule;

