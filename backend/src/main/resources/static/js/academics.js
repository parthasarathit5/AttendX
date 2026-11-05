/**
 * MaccaAttendX - Academic Year Management Module (Milestone 2)
 * Manages Institutional Academic Cycles, Date Ranges, and guarantees
 * that strictly ONE academic year remains ACTIVE at any given time.
 */

const AcademicYearModule = {
  render(container) {
    const role = Auth.getUser().role;
    const isAdmin = role === 'ADMIN';
    const years = AcademicDataService.getAcademicYears();
    const activeYear = years.find(y => y.status === 'ACTIVE');

    container.innerHTML = `
      <div class="dashboard-banner">
        <div class="banner-left">
          <h1 class="banner-title">Academic Year &amp; Cycle Management</h1>
          <p class="banner-subtitle">
            Saveetha School of Engineering &bull; Institutional Calendar Configurations &amp; Academic Terms
          </p>
        </div>
        <div class="banner-actions">
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="AcademicYearModule.openAddModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Add Academic Year
            </button>
          ` : `
            <span class="status-pill status-leave" style="font-size: 0.72rem;">Academic Cycle View</span>
          `}
        </div>
      </div>

      <!-- Active Academic Year Hero Highlight -->
      ${activeYear ? `
        <div class="dashboard-card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary-blue); background: linear-gradient(135deg, #FFFFFF, var(--light-blue));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.05em;">Current Institutional Cycle</div>
              <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--brand-navy); margin: 0.25rem 0;">Academic Year ${activeYear.name}</h2>
              <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <span>📅 <strong>Start:</strong> ${activeYear.startDate}</span>
                <span>🏁 <strong>End:</strong> ${activeYear.endDate}</span>
                <span>&bull;</span>
                <span>${activeYear.description}</span>
              </div>
            </div>
            <div>
              <span class="status-pill status-present" style="font-size: 0.82rem; padding: 0.35rem 0.85rem;">
                ● Currently Active Term
              </span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Academic Years Ledger Card -->
      <div class="dashboard-card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); font-weight: 700; color: var(--brand-navy); font-size: 0.95rem;">
          Historical &amp; Planned Academic Cycles (${years.length} Cycles)
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Description</th>
                <th style="text-align: center;">Cycle Status</th>
                <th style="text-align: center; width: 170px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${years.map((y, idx) => {
                const isActive = y.status === 'ACTIVE';
                return `
                  <tr style="${isActive ? 'background-color: #F8FAFC;' : ''}">
                    <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${idx + 1}</td>
                    <td>
                      <div style="font-weight: 800; font-size: 0.95rem; color: ${isActive ? 'var(--primary-blue)' : 'var(--brand-navy)'};">
                        ${y.name}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${y.id}</div>
                    </td>
                    <td style="font-weight: 600;">${y.startDate}</td>
                    <td style="font-weight: 600;">${y.endDate}</td>
                    <td style="font-size: 0.82rem; color: var(--text-muted); max-width: 280px;">${y.description}</td>
                    <td style="text-align: center;">
                      <span class="status-pill ${
                        isActive ? 'status-present' : 
                        y.status === 'UPCOMING' ? 'status-leave' : 'status-absent'
                      }">
                        ${y.status}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <div style="display: flex; gap: 0.35rem; justify-content: center;">
                        ${isAdmin && !isActive ? `
                          <button class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="AcademicYearModule.confirmSetActive('${y.id}', '${y.name}')">
                            Set Active
                          </button>
                        ` : ''}
                        ${isAdmin ? `
                          <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;" title="Edit Cycle" onclick="AcademicYearModule.openEditModal('${y.id}')">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openAddModal() {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can define academic cycles.', 'error');
      return;
    }

    const modalHtml = this.generateFormHtml(null);
    App.openModal('Add Academic Year Cycle', modalHtml, () => {
      this.submitForm(null);
    });
  },

  openEditModal(yearId) {
    const role = Auth.getUser().role;
    if (role !== 'ADMIN') {
      App.toast('Access Denied: Only Administrator can modify academic cycles.', 'error');
      return;
    }

    const y = AcademicDataService.getAcademicYears().find(item => item.id === yearId);
    if (!y) return;

    const modalHtml = this.generateFormHtml(y);
    App.openModal(`Edit Academic Year: ${y.name}`, modalHtml, () => {
      this.submitForm(yearId);
    });
  },

  generateFormHtml(ay = null) {
    const y = ay || {
      name: '2027–2028',
      startDate: '2027-06-15',
      endDate: '2028-05-15',
      description: 'Odd & Even Semesters',
      status: 'UPCOMING'
    };

    return `
      <form id="academicYearModalForm" onsubmit="event.preventDefault();" style="font-size: 0.84rem;">
        <div id="ayFormErrors" style="display: none;" class="validation-error-alert"></div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Academic Year Name (e.g. 2026–2027) *</label>
            <input type="text" class="form-field-input" id="ayName" value="${y.name}" placeholder="2026–2027" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Cycle Status</label>
            <select class="form-field-select" id="ayStatus">
              <option value="ACTIVE" ${y.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE (Sets as Current Cycle)</option>
              <option value="UPCOMING" ${y.status === 'UPCOMING' ? 'selected' : ''}>UPCOMING</option>
              <option value="COMPLETED" ${y.status === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-field">
            <label class="form-field-label">Term Start Date *</label>
            <input type="date" class="form-field-input" id="ayStart" value="${y.startDate}" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Term End Date *</label>
            <input type="date" class="form-field-input" id="ayEnd" value="${y.endDate}" required>
          </div>
        </div>

        <div class="form-field">
          <label class="form-field-label">Description / Academic Notes</label>
          <input type="text" class="form-field-input" id="ayDesc" value="${y.description || ''}" placeholder="e.g. Saveetha School of Engineering Regular Curriculum">
        </div>
      </form>
    `;
  },

  submitForm(existingId = null) {
    const name = document.getElementById('ayName')?.value.trim();
    const status = document.getElementById('ayStatus')?.value;
    const startDate = document.getElementById('ayStart')?.value;
    const endDate = document.getElementById('ayEnd')?.value;
    const description = document.getElementById('ayDesc')?.value.trim();

    const payload = {
      name,
      status,
      startDate,
      endDate,
      description
    };

    let result;
    if (existingId) {
      result = AcademicDataService.updateAcademicYear(existingId, payload);
    } else {
      result = AcademicDataService.addAcademicYear(payload);
    }

    if (!result.success) {
      const errBox = document.getElementById('ayFormErrors');
      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerHTML = `<strong>Validation Error:</strong><ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
      return;
    }

    App.closeModal();
    App.toast(existingId ? 'Academic year updated' : 'Academic year registered successfully', 'success');
    this.reRender();
  },

  confirmSetActive(yearId, yearName) {
    const confirmHtml = `
      <div style="font-size: 0.88rem; line-height: 1.5;">
        <p>Are you sure you want to set <strong>${yearName}</strong> as the active institutional academic year?</p>
        <div style="background: var(--bg-soft); padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
          <p style="margin: 0; color: var(--text-dark);">
            Note: In accordance with SIMATS institutional policy, exactly one academic cycle can be active at any time. The previously active term will automatically be marked as <strong>COMPLETED</strong>.
          </p>
        </div>
      </div>
    `;

    App.openModal(`Switch Active Academic Cycle to ${yearName}`, confirmHtml, () => {
      AcademicDataService.setActiveAcademicYear(yearId);
      App.toast(`Academic Year ${yearName} is now ACTIVE!`, 'success');
      this.reRender();
    });
  },

  reRender() {
    const container = document.getElementById('mainWorkspaceContainer');
    if (container) this.render(container);
  }
};

window.AcademicYearModule = AcademicYearModule;

