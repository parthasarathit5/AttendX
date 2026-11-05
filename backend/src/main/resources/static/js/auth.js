/**
 * MaccaAttendX - Authentication & Role State Manager
 * Roles: ADMIN, TEACHER, STUDENT, PARENT
 */

const Auth = {
  // Current active session state
  currentUser: {
    id: "usr-admin-01",
    name: "Dr. K. Ravichandran",
    email: "admin@saveetha.edu",
    role: "ADMIN", // Default startup role
    avatar: "KR",
    department: "Computer Science & Engineering",
    institution: "Saveetha School of Engineering (SIMATS)"
  },

  // Role profiles for live demonstration and multi-role pairing
  roleProfiles: {
    ADMIN: {
      id: "usr-admin-01",
      name: "Dr. K. Ravichandran",
      email: "principal@saveetha.edu",
      role: "ADMIN",
      avatar: "KR",
      department: "Administration",
      roleLabel: "System Administrator"
    },
    TEACHER: {
      id: "usr-teacher-02",
      name: "Prof. Priya Swaminathan",
      email: "priya.cse@saveetha.edu",
      role: "TEACHER",
      avatar: "PS",
      department: "Department of CSE",
      roleLabel: "Senior Assistant Professor"
    },
    STUDENT: {
      id: "usr-student-03",
      name: "Arun Kumar S",
      email: "arunkumar.sse@saveetha.edu",
      role: "STUDENT",
      avatar: "AK",
      department: "B.Tech CSE - 3rd Year (Sec A)",
      admissionNo: "21CS048",
      rollNo: "192111001",
      roleLabel: "Undergraduate Student"
    },
    PARENT: {
      id: "usr-parent-04",
      name: "Mr. Sundaram K",
      email: "sundaram.k@gmail.com",
      role: "PARENT",
      avatar: "SK",
      department: "Parent Portal",
      linkedStudents: [
        { name: "Arun Kumar S", regNo: "192111001", class: "B.Tech CSE - 3rd Year (A)" },
        { name: "Diya Kumar S", regNo: "23EC089", class: "B.Tech ECE - 1st Year (B)" }
      ],
      roleLabel: "Verified Parent / Guardian"
    }
  },

  init() {
    const savedRole = localStorage.getItem("maccaattendx_role");
    if (savedRole && this.roleProfiles[savedRole]) {
      this.currentUser = this.roleProfiles[savedRole];
    }
  },

  setRole(roleKey) {
    if (this.roleProfiles[roleKey]) {
      this.currentUser = this.roleProfiles[roleKey];
      localStorage.setItem("maccaattendx_role", roleKey);
      return this.currentUser;
    }
    return null;
  },

  getUser() {
    return this.currentUser;
  },

  isRole(role) {
    return this.currentUser.role === role;
  }
};

window.Auth = Auth;
