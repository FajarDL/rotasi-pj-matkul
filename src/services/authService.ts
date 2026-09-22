import type { AuthSession, SecurityConfig, UserAccount, UserRole, UserStatus } from '../types';

const USERS_KEY = 'ROTASI_PJ_USERS_DATA_V2';
const SECURITY_KEY = 'ROTASI_PJ_SECURITY_CONFIG_V2';
const SESSION_KEY = 'ROTASI_PJ_AUTH_SESSION_V2';

export const authService = {
  // Check if system has been initialized by an active owner
  isInitialized(): boolean {
    const config = this.getSecurityConfig();
    const users = this.getUsers();
    const hasOwner = users.some((u) => u.role === 'owner' && u.status === 'active');
    return !!config?.isInitialized && hasOwner;
  },

  getSecurityConfig(): SecurityConfig | null {
    try {
      const data = localStorage.getItem(SECURITY_KEY);
      if (!data) return null;
      const parsed: SecurityConfig = JSON.parse(data);
      // Default allowPublicRegistration to true if not set
      if (parsed.allowPublicRegistration === undefined) {
        parsed.allowPublicRegistration = true;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  saveSecurityConfig(config: SecurityConfig): void {
    localStorage.setItem(SECURITY_KEY, JSON.stringify(config));
  },

  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) return [];
      const users: UserAccount[] = JSON.parse(data);
      // Ensure backward-compatibility: set status to 'active' if missing
      return users.map((u) => ({
        ...u,
        status: (u.status || 'active') as UserStatus,
      }));
    } catch {
      return [];
    }
  },

  saveUsers(users: UserAccount[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // First time setup by the class owner / komti
  setupOwner(data: {
    name: string;
    username: string;
    password: string;
  }): { success: boolean; message: string; session?: AuthSession } {
    if (!data.username.trim() || !data.password.trim() || !data.name.trim()) {
      return { success: false, message: 'Semua kolom wajib diisi.' };
    }

    const cleanUsername = data.username.trim().toLowerCase();
    const ownerUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      name: data.name.trim(),
      password: data.password.trim(),
      role: 'owner',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const config: SecurityConfig = {
      isInitialized: true,
      ownerUsername: ownerUser.username,
      allowPublicRegistration: true,
    };

    this.saveSecurityConfig(config);
    // Replace users list with the new owner as the primary user
    this.saveUsers([ownerUser]);

    const session: AuthSession = {
      isAuthenticated: true,
      userId: ownerUser.id,
      role: 'owner',
      username: ownerUser.username,
      name: ownerUser.name,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Akun Pemilik berhasil didaftarkan!', session };
  },

  // Self-register by a student / member (requires Owner Approval)
  registerUser(data: {
    name: string;
    username: string;
    password: string;
    role?: UserRole;
  }): { success: boolean; message: string; isPending?: boolean; session?: AuthSession } {
    const config = this.getSecurityConfig();
    const cleanUsername = data.username.trim().toLowerCase();
    const users = this.getUsers();
    const hasOwner = users.some((u) => u.role === 'owner' && u.status === 'active');
    const isFirstUser = users.length === 0 || !hasOwner;

    if (!isFirstUser && !config?.allowPublicRegistration) {
      return {
        success: false,
        message: 'Pendaftaran mandiri sedang dinonaktifkan oleh pemilik. Silakan hubungi admin kelas untuk mendapatkan akun.',
      };
    }

    if (users.some((u) => u.username === cleanUsername)) {
      return { success: false, message: 'Username atau NIM sudah terdaftar.' };
    }

    if (data.password.length < 4) {
      return { success: false, message: 'Kata sandi minimal 4 karakter.' };
    }

    // If no owner exists in the system, automatically assign this registration as active owner!
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      name: data.name.trim(),
      password: data.password.trim(),
      role: isFirstUser ? 'owner' : (data.role || 'student'),
      status: isFirstUser ? 'active' : 'pending',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    if (isFirstUser) {
      const newConfig: SecurityConfig = {
        isInitialized: true,
        ownerUsername: newUser.username,
        allowPublicRegistration: true,
      };
      this.saveSecurityConfig(newConfig);

      const session: AuthSession = {
        isAuthenticated: true,
        userId: newUser.id,
        role: 'owner',
        username: newUser.username,
        name: newUser.name,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return {
        success: true,
        isPending: false,
        message: 'Akun Pemilik Utama berhasil didaftarkan dan langsung aktif!',
        session,
      };
    }

    return {
      success: true,
      isPending: true,
      message: 'Permintaan pendaftaran terkirim! Akun Anda sedang menunggu persetujuan dari Pemilik / Pengelola sebelum dapat digunakan.',
    };
  },

  // Login with username & password
  login(
    username: string,
    password: string
  ): { success: boolean; message: string; session?: AuthSession } {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check against Master Key in environment variable if configured
    const envMasterKey = import.meta.env.VITE_MASTER_KEY;
    if (envMasterKey && (cleanPassword === envMasterKey || password === envMasterKey)) {
      const session: AuthSession = {
        isAuthenticated: true,
        role: 'owner',
        username: 'master-admin',
        name: 'Master Administrator (Env Key)',
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, message: 'Masuk melalui Master Key.', session };
    }

    const users = this.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      return { success: false, message: 'Username atau NIM tidak ditemukan.' };
    }

    if (user.password !== password && user.password.trim() !== cleanPassword) {
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
    }

    // Auto-heal: If no active owner exists in the system or this user is marked owner, ensure status is active!
    const hasOwner = users.some((u) => u.role === 'owner' && u.status === 'active');
    if (!hasOwner || user.role === 'owner') {
      user.role = 'owner';
      user.status = 'active';
      this.saveUsers(users);

      const config = this.getSecurityConfig() || {
        isInitialized: true,
        ownerUsername: user.username,
        allowPublicRegistration: true,
      };
      config.isInitialized = true;
      config.ownerUsername = user.username;
      this.saveSecurityConfig(config);
    }

    if (user.status === 'pending') {
      return {
        success: false,
        message: 'Akun Anda belum disetujui. Silakan hubungi Pemilik / Pengelola kelas untuk mengaktifkan akun Anda.',
      };
    }

    if (user.status === 'rejected') {
      return {
        success: false,
        message: 'Permintaan pendaftaran akun Anda ditolak oleh pengelola.',
      };
    }

    const session: AuthSession = {
      isAuthenticated: true,
      userId: user.id,
      role: user.role,
      username: user.username,
      name: user.name,
      studentNim: user.role === 'student' ? user.username : undefined,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Berhasil masuk!', session };
  },

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },

  getCurrentSession(): AuthSession {
    try {
      const data = sessionStorage.getItem(SESSION_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return {
      isAuthenticated: false,
      role: 'student',
      username: '',
      name: 'Tamu (Belum Masuk)',
    };
  },

  getSession(): AuthSession {
    return this.getCurrentSession();
  },

  // Reset all auth, security config, and user accounts
  resetAllAuthAndSecurity(): void {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SECURITY_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('ROTASI_PJ_USERS_DATA');
    localStorage.removeItem('ROTASI_PJ_SECURITY_CONFIG');
    localStorage.removeItem('ROTASI_PJ_AUTH_SESSION');
    localStorage.removeItem('ROTASI_PJ_USERS_DATA_V1');
    localStorage.removeItem('ROTASI_PJ_SECURITY_CONFIG_V1');
    localStorage.removeItem('ROTASI_PJ_AUTH_SESSION_V1');
  },

  // Approve a pending user
  approveUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    target.status = 'active';
    this.saveUsers(users);
    return { success: true, message: `Akun ${target.name} (${target.username}) berhasil disetujui & diaktifkan!` };
  },

  // Reject / delete a pending user
  rejectUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const updated = users.filter((u) => u.id !== userId);
    this.saveUsers(updated);
    return { success: true, message: 'Permintaan akun berhasil ditolak & dihapus.' };
  },

  // Admin directly creates an active user
  createUser(data: {
    name: string;
    username: string;
    password: string;
    role: UserRole;
  }): { success: boolean; message: string } {
    const cleanUsername = data.username.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((u) => u.username === cleanUsername)) {
      return { success: false, message: 'Username / NIM sudah ada.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      username: cleanUsername,
      name: data.name.trim(),
      password: data.password.trim(),
      role: data.role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: `Akun ${newUser.name} berhasil dibuat!` };
  },

  // Delete user
  deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };
    if (target.role === 'owner') return { success: false, message: 'Akun Pemilik Utama tidak dapat dihapus.' };

    const updated = users.filter((u) => u.id !== userId);
    this.saveUsers(updated);
    return { success: true, message: `Akun ${target.name} berhasil dihapus.` };
  },

  // Reset user password
  resetPassword(userId: string, newPass: string): { success: boolean; message: string } {
    if (newPass.trim().length < 4) {
      return { success: false, message: 'Kata sandi minimal 4 karakter.' };
    }
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    target.password = newPass.trim();
    this.saveUsers(users);
    return { success: true, message: `Kata sandi akun ${target.name} berhasil diperbarui.` };
  },

  // Toggle public self-registration
  setPublicRegistration(allowed: boolean): { success: boolean; message: string } {
    const config = this.getSecurityConfig();
    if (!config) return { success: false, message: 'Konfigurasi tidak ditemukan.' };

    config.allowPublicRegistration = allowed;
    this.saveSecurityConfig(config);
    return {
      success: true,
      message: allowed ? 'Pendaftaran mandiri diaktifkan.' : 'Pendaftaran mandiri dinonaktifkan.',
    };
  },

  // Batch generate accounts from student list (Username = NIM, Password = defaultPassword || NIM)
  batchGenerateStudentAccounts(
    students: { nim: string; name: string }[],
    defaultPassword?: string
  ): { createdCount: number; existingCount: number } {
    const users = this.getUsers();
    const existingUsernames = new Set(users.map((u) => u.username));
    let createdCount = 0;
    let existingCount = 0;

    students.forEach((s) => {
      const cleanNim = s.nim.trim().toLowerCase();
      if (!cleanNim) return;

      if (existingUsernames.has(cleanNim)) {
        existingCount++;
      } else {
        users.push({
          id: `usr-${Date.now()}-${cleanNim}`,
          username: cleanNim,
          name: s.name.trim(),
          password: defaultPassword ? defaultPassword.trim() : cleanNim,
          role: 'student',
          status: 'active',
          createdAt: new Date().toISOString(),
        });
        existingUsernames.add(cleanNim);
        createdCount++;
      }
    });

    this.saveUsers(users);
    return { createdCount, existingCount };
  },

  getRegisteredUsers(): Omit<UserAccount, 'password'>[] {
    return this.getUsers().map(({ password: _, ...rest }) => rest);
  },

  getPendingCount(): number {
    return this.getUsers().filter((u) => u.status === 'pending').length;
  },
};
