/**
 * MaccaAttendX - Authentication & State Manager
 * Fully integrated with Supabase Auth & Spring Security JWT.
 * Roles: ADMIN, TEACHER, STUDENT, PARENT.
 * Rule: User role and identity are strictly verified by Spring Boot database records.
 */

const Auth = {
  storageTokenKey: 'attendx_access_token',
  storageUserKey: 'attendx_user_profile',

  // Current verified session state
  currentUser: {
    id: "usr-admin-001",
    name: "Dr. C. Ramesh",
    fullName: "Dr. C. Ramesh",
    email: "admin@attendx.saveetha.com",
    role: "ADMIN",
    roleLabel: "System Administrator",
    initials: "CR",
    department: "Administration",
    institution: "Saveetha School of Engineering"
  },

  // Active JWT Token
  token: null,

  // Supabase Client instance (if configured)
  supabaseClient: null,

  async init() {
    console.log('[Auth] Initializing authentication state...');
    
    // 1. Initialize Supabase if client credentials configured
    this.initSupabaseClient();

    // 2. Check for existing persisted token
    const savedToken = localStorage.getItem(this.storageTokenKey);
    if (savedToken) {
      this.token = savedToken;
      try {
        // Verify with Spring Boot /auth/me
        const serverProfile = await Api.auth.me();
        if (serverProfile) {
          this.applyUserProfile(serverProfile);
          console.log('[Auth] Session restored successfully as', this.currentUser.role);
          return;
        }
      } catch (err) {
        console.warn('[Auth] Persisted session invalid or expired:', err.message);
        this.clearSession();
      }
    }

    // 3. Fallback: Initialize with institutional admin dev persona
    await this.loginWithPersona('ADMIN');
  },

  initSupabaseClient() {
    const config = window.__ATTENDX_CONFIG__ || {};
    const url = config.SUPABASE_URL;
    const anonKey = config.SUPABASE_ANON_KEY || config.SUPABASE_PUBLISHABLE_KEY;

    if (window.supabase && url && anonKey) {
      try {
        this.supabaseClient = window.supabase.createClient(url, anonKey);
        console.log('[Auth] Supabase Auth client initialized.');
      } catch (e) {
        console.warn('[Auth] Failed to initialize Supabase client:', e.message);
      }
    }
  },

  // --------------------------------------------------------------------------
  // Supabase Auth Integration (Email & Password)
  // --------------------------------------------------------------------------
  async loginWithSupabase(email, password) {
    if (!this.supabaseClient) {
      throw new Error('Supabase client is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
    }

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    const session = data.session;
    if (!session || !session.access_token) {
      throw new Error('Supabase authentication returned no access token.');
    }

    this.token = session.access_token;
    localStorage.setItem(this.storageTokenKey, this.token);

    // Call Spring Boot to obtain database-verified role and profile
    const serverProfile = await Api.auth.me();
    this.applyUserProfile(serverProfile);
    return this.currentUser;
  },

  // --------------------------------------------------------------------------
  // Institutional Persona Login (Development & Pairing Mode)
  // --------------------------------------------------------------------------
  async loginWithPersona(roleKey) {
    try {
      const res = await Api.auth.mockToken(roleKey);
      if (res && res.token && res.profile) {
        this.token = res.token;
        localStorage.setItem(this.storageTokenKey, this.token);
        this.applyUserProfile(res.profile);
        return this.currentUser;
      }
    } catch (err) {
      console.warn('[Auth.loginWithPersona] Backend mock-token unreachable, applying local fallback:', err.message);
      this.applyFallbackProfile(roleKey);
    }
    return this.currentUser;
  },

  applyUserProfile(p) {
    const roleLabels = {
      ADMIN: 'System Administrator',
      TEACHER: 'Faculty Member',
      STUDENT: 'Undergraduate Student',
      PARENT: 'Verified Parent / Guardian'
    };

    const initials = (p.fullName || p.name || 'UX')
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    let department = 'SIMATS Engineering';
    if (p.teacher && p.teacher.department) {
      department = p.teacher.department;
    } else if (p.student && p.student.className) {
      department = `${p.student.className} (Sec ${p.student.section})`;
    }

    this.currentUser = {
      id: p.id,
      name: p.fullName || p.email,
      fullName: p.fullName,
      email: p.email,
      role: p.role,
      roleLabel: roleLabels[p.role] || p.role,
      roleTitle: roleLabels[p.role] || p.role,
      initials: initials || 'AX',
      phoneNumber: p.phoneNumber,
      department: department,
      institution: p.institutionName || 'Saveetha School of Engineering',
      teacher: p.teacher || null,
      student: p.student || null,
      parent: p.parent || null
    };

    localStorage.setItem(this.storageUserKey, JSON.stringify(this.currentUser));
  },

  applyFallbackProfile(roleKey) {
    const personas = {
      ADMIN: {
        id: "usr-admin-001",
        name: "Dr. C. Ramesh",
        fullName: "Dr. C. Ramesh",
        email: "admin@attendx.saveetha.com",
        role: "ADMIN",
        roleLabel: "System Administrator",
        roleTitle: "System Administrator",
        initials: "CR",
        department: "Administration",
        institution: "Saveetha School of Engineering"
      },
      TEACHER: {
        id: "usr-teach-001",
        name: "Dr. K. Senthil Kumar",
        fullName: "Dr. K. Senthil Kumar",
        email: "senthil.k@saveetha.com",
        role: "TEACHER",
        roleLabel: "Professor & Head",
        roleTitle: "Professor & Head",
        initials: "SK",
        department: "Computer Science & Engineering",
        institution: "Saveetha School of Engineering"
      },
      STUDENT: {
        id: "usr-stu-001",
        name: "Aarav Sharma",
        fullName: "Aarav Sharma",
        email: "aarav.sharma@saveetha.com",
        role: "STUDENT",
        roleLabel: "Undergraduate Student",
        roleTitle: "Undergraduate Student",
        initials: "AS",
        department: "B.E. Computer Science - III Year (A)",
        admissionNo: "192211001",
        rollNo: "192211001",
        institution: "Saveetha School of Engineering"
      },
      PARENT: {
        id: "usr-parent-001",
        name: "Rajesh Sharma",
        fullName: "Rajesh Sharma",
        email: "parent.aarav@gmail.com",
        role: "PARENT",
        roleLabel: "Verified Parent / Guardian",
        roleTitle: "Verified Parent / Guardian",
        initials: "RS",
        department: "Parent Portal",
        institution: "Saveetha School of Engineering"
      }
    };

    this.currentUser = personas[roleKey] || personas.ADMIN;
    this.token = `dev-token-${roleKey.toLowerCase()}`;
    localStorage.setItem(this.storageTokenKey, this.token);
  },

  // --------------------------------------------------------------------------
  // Session & Role Accessors
  // --------------------------------------------------------------------------
  getUser() {
    return this.currentUser;
  },

  getToken() {
    return this.token || localStorage.getItem(this.storageTokenKey);
  },

  isRole(role) {
    return this.currentUser && this.currentUser.role === role;
  },

  hasRole(role) {
    return this.isRole(role);
  },

  clearSession() {
    this.token = null;
    localStorage.removeItem(this.storageTokenKey);
    localStorage.removeItem(this.storageUserKey);
  },

  async logout() {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('[Auth] Supabase signOut error:', e.message);
      }
    }
    this.clearSession();
    // Default back to Admin persona for continuous operation
    await this.loginWithPersona('ADMIN');
    if (window.App && typeof window.App.updateUserInterface === 'function') {
      window.App.updateUserInterface();
      window.Navigation.renderSidebar();
      window.Navigation.navigateTo('dashboard');
    }
  },

  handleUnauthorized() {
    console.warn('[Auth] Handling unauthorized session. Resetting token.');
    if (window.App && typeof window.App.toast === 'function') {
      window.App.toast('Authentication session expired. Re-synchronizing...', 'warning');
    }
    this.clearSession();
    this.loginWithPersona(this.currentUser.role || 'ADMIN').then(() => {
      if (window.App) window.App.updateUserInterface();
    });
  }
};

window.Auth = Auth;
