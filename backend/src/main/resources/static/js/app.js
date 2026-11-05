/**
 * MaccaAttendX - Master Application Controller
 * Orchestrates Authentication, Multi-Role Switcher, Notifications, Modals & Toast Framework
 * Strictly designed to match Saveetha V-Study LMS visual & functional flow.
 */

const App = {
  notifications: [
    { id: 1, title: 'Exam Hall Ticket Lockout Warning', desc: '14 students in B.E. CSE 3A are below the 75% SIMATS threshold.', time: '10m ago', unread: true, type: 'danger' },
    { id: 2, title: 'Pending On-Duty (OD) Requests', desc: 'Charan Teja & 2 others submitted symposium attendance proof.', time: '1h ago', unread: true, type: 'warning' },
    { id: 3, title: 'Biometric System Synchronized', desc: 'Morning biometric logs for CSE Block A verified successfully.', time: '2h ago', unread: false, type: 'info' }
  ],

  modalConfirmCallback: null,

  init() {
    console.log('[MaccaAttendX] Initializing LMS Portal...');

    // 1. Initialize Auth
    Auth.init();

    // 2. Initialize Navigation & Sidebar
    Navigation.init();

    // 3. Setup Topbar & Global Listeners
    this.setupRoleSwitcher();
    this.setupProfileDropdown();
    this.setupNotificationCenter();
    this.setupGlobalSearch();
    this.setupModalListeners();
    this.updateUserInterface();

    // 4. Render initial view
    Navigation.navigateTo('dashboard');
    console.log('[MaccaAttendX] Initialized successfully as ' + Auth.getUser().role);
  },

  // ----------------------------------------------------------------------------
  // Role Switcher Management
  // ----------------------------------------------------------------------------
  setupRoleSwitcher() {
    const roleBtns = document.querySelectorAll('.role-switcher-pill .role-btn');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = e.currentTarget.getAttribute('data-role');
        this.switchRole(role);
      });
    });
  },

  switchRole(role) {
    Auth.setRole(role);
    this.updateUserInterface();
    Navigation.renderSidebar();
    Navigation.navigateTo('dashboard');
    this.toast(`Switched perspective to ${role} Portal`, 'info');
  },

  updateUserInterface() {
    const user = Auth.getUser();

    // 1. Update role pills
    document.querySelectorAll('.role-switcher-pill .role-btn').forEach(btn => {
      if (btn.getAttribute('data-role') === user.role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Update user profile display in topbar
    const nameEl = document.getElementById('topbarUserName');
    const roleEl = document.getElementById('topbarUserRole');
    const avatarEl = document.getElementById('topbarUserAvatar');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.roleTitle;
    if (avatarEl) avatarEl.textContent = user.initials;

    // 3. Update dropdown user info
    const dropNameEl = document.getElementById('dropUserName');
    const dropEmailEl = document.getElementById('dropUserEmail');
    if (dropNameEl) dropNameEl.textContent = user.name;
    if (dropEmailEl) dropEmailEl.textContent = user.email;
  },

  // ----------------------------------------------------------------------------
  // Profile & Notification Dropdown Menus
  // ----------------------------------------------------------------------------
  setupProfileDropdown() {
    const trigger = document.getElementById('userProfileTrigger');
    const menu = document.getElementById('userProfileDropdown');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllDropdowns(menu);
        menu.classList.toggle('active');
      });
    }
  },

  setupNotificationCenter() {
    const trigger = document.getElementById('notificationTrigger');
    const panel = document.getElementById('notificationPanel');

    if (trigger && panel) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllDropdowns(panel);
        panel.classList.toggle('active');
        this.renderNotifications();
      });
    }

    // Dismiss dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.closeAllDropdowns();
    });
  },

  closeAllDropdowns(exceptElement = null) {
    const dropdowns = document.querySelectorAll('.dropdown-panel');
    dropdowns.forEach(drop => {
      if (drop !== exceptElement) {
        drop.classList.remove('active');
      }
    });
  },

  renderNotifications() {
    const listEl = document.getElementById('notificationList');
    if (!listEl) return;

    if (this.notifications.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No notifications at this time
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.notifications.map(n => `
      <div class="dropdown-item ${n.unread ? 'unread-item' : ''}" onclick="App.handleNotificationClick(${n.id})" style="border-left: 3px solid ${n.type === 'danger' ? 'var(--absent-red)' : n.type === 'warning' ? 'var(--late-amber)' : 'var(--primary-blue)'};">
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 0.82rem; color: var(--brand-navy);">${n.title}</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">${n.time}</span>
          </div>
          <p style="font-size: 0.77rem; color: var(--text-muted); margin: 0.2rem 0 0;">${n.desc}</p>
        </div>
      </div>
    `).join('');
  },

  handleNotificationClick(id) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.unread = false;
      this.closeAllDropdowns();
      if (n.title.includes('Hall Ticket') || n.title.includes('threshold')) {
        Navigation.navigateTo('reports');
      } else if (n.title.includes('OD') || n.title.includes('Requests')) {
        Navigation.navigateTo('leave');
      } else {
        Navigation.navigateTo('attendance');
      }
    }
  },

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.unread = false);
    const badge = document.getElementById('notificationPing');
    if (badge) badge.style.display = 'none';
    this.renderNotifications();
    this.toast('All notifications marked as read', 'info');
  },

  // ----------------------------------------------------------------------------
  // Global Search
  // ----------------------------------------------------------------------------
  setupGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim().toLowerCase();
        if (!query) return;

        if (query.includes('attend') || query.includes('mark')) {
          Navigation.navigateTo('attendance');
        } else if (query.includes('report') || query.includes('shortfall') || query.includes('75')) {
          Navigation.navigateTo('reports');
        } else if (query.includes('calendar') || query.includes('holiday')) {
          Navigation.navigateTo('calendar');
        } else {
          // Open search modal with results
          this.openModal('Global Directory Search', `
            <div style="font-size: 0.88rem;">
              <p style="margin-bottom: 0.75rem;">Search results matching "<strong>${query}</strong>":</p>
              <div style="background: var(--bg-soft); border-radius: 8px; padding: 0.75rem; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0;">
                  <span><strong>CS301</strong> Design &amp; Analysis of Algorithms</span>
                  <button class="btn btn-secondary btn-sm" onclick="App.closeModal(); Navigation.navigateTo('attendance');">Open</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-top: 1px solid var(--border-color);">
                  <span><strong>192211001</strong> Aarav Sharma (B.E. CSE 3A)</span>
                  <button class="btn btn-secondary btn-sm" onclick="App.closeModal(); Navigation.navigateTo('students');">Profile</button>
                </div>
              </div>
            </div>
          `);
        }
        input.value = '';
      }
    });
  },

  // ----------------------------------------------------------------------------
  // Modal Framework
  // ----------------------------------------------------------------------------
  setupModalListeners() {
    const scrim = document.getElementById('globalModalScrim');
    const closeBtn = document.getElementById('globalModalClose');
    const cancelBtn = document.getElementById('globalModalCancel');
    const confirmBtn = document.getElementById('globalModalConfirm');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());

    if (scrim) {
      scrim.addEventListener('click', (e) => {
        if (e.target === scrim) this.closeModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (typeof this.modalConfirmCallback === 'function') {
          this.modalConfirmCallback();
        }
        this.closeModal();
      });
    }

    // Keyboard ESC listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeAllDropdowns();
      }
    });
  },

  openModal(title, contentHtml, onConfirm = null) {
    const scrim = document.getElementById('globalModalScrim');
    const titleEl = document.getElementById('globalModalTitle');
    const bodyEl = document.getElementById('globalModalContent');
    const confirmBtn = document.getElementById('globalModalConfirm');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = contentHtml;

    this.modalConfirmCallback = onConfirm;
    if (confirmBtn) {
      confirmBtn.style.display = onConfirm ? 'inline-flex' : 'none';
    }

    if (scrim) scrim.classList.add('active');
  },

  closeModal() {
    const scrim = document.getElementById('globalModalScrim');
    if (scrim) scrim.classList.remove('active');
    this.modalConfirmCallback = null;
  },

  // ----------------------------------------------------------------------------
  // Toast Notifications Framework
  // ----------------------------------------------------------------------------
  toast(message, type = 'info', duration = 3200) {
    let shelf = document.getElementById('toastShelf');
    if (!shelf) {
      shelf = document.createElement('div');
      shelf.id = 'toastShelf';
      shelf.className = 'toast-shelf';
      document.body.appendChild(shelf);
    }

    const bubble = document.createElement('div');
    bubble.className = `toast-bubble ${type}`;
    
    // Choose icon
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
    } else if (type === 'error' || type === 'danger') {
      iconSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }

    bubble.innerHTML = `
      <span style="display: flex; align-items: center;">${iconSvg}</span>
      <span style="font-weight: 500;">${message}</span>
    `;

    shelf.appendChild(bubble);

    setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(10px)';
      bubble.style.transition = 'all 0.25s ease';
      setTimeout(() => bubble.remove(), 250);
    }, duration);
  }
};

window.App = App;

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
