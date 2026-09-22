import type { AuthSession, SecurityConfig, UserAccount, UserRole } from '../types';

const USERS_KEY = 'ROTASI_PJ_USERS_DATA_V2';
const SECURITY_KEY = 'ROTASI_PJ_SECURITY_CONFIG_V2';
const SESSION_KEY = 'ROTASI_PJ_AUTH_SESSION_V2';

export const authService = {
  // Check if system has been initialized by an owner
  isInitialized(): boolean {
    const config = this.getSecurityConfig();
    return !!config?.isInitialized;
  },

  getSecurityConfig(): SecurityConfig | null {
    try {
      const data = localStorage.getItem(SECURITY_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
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
    classAccessCode: string;
  }): { success: boolean; message: string; session?: AuthSession } {
    if (!data.username.trim() || !data.password.trim() || !data.classAccessCode.trim()) {
      return { success: false, message: 'Semua kolom wajib diisi.' };
    }

    const ownerUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: data.username.trim().toLowerCase(),
      name: data.name.trim(),
      password: data.password.trim(),
      role: 'owner',
      createdAt: new Date().toISOString(),
    };

    const config: SecurityConfig = {
      isInitialized: true,
      classAccessCode: data.classAccessCode.trim(),
      ownerUsername: ownerUser.username,
    };

    localStorage.setItem(SECURITY_KEY, JSON.stringify(config));
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

  // Register new member/student or co-admin using the Owner's Invitation/Access Code
  registerUser(data: {
    name: string;
    username: string;
    password: string;
    classAccessCode: string;
    role?: UserRole;
  }): { success: boolean; message: string; session?: AuthSession } {
    const config = this.getSecurityConfig();
    const envMasterKey = import.meta.env.VITE_MASTER_KEY;

    if (!config?.isInitialized) {
      return { success: false, message: 'Sistem belum diinisialisasi oleh pemilik kelas.' };
    }

    // Verify Access Code
    const inputCode = data.classAccessCode.trim();
    const isValidCode =
      inputCode === config.classAccessCode ||
      (envMasterKey && inputCode === envMasterKey);

    if (!isValidCode) {
      return {
        success: false,
        message: 'Kode Izin / Akses Kelas salah. Minta Kode Izin Akses kepada Pemilik / Komti kelas.',
      };
    }

    const cleanUsername = data.username.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((u) => u.username === cleanUsername)) {
      return { success: false, message: 'Username / NIM sudah terdaftar. Silakan masuk (Login).' };
    }

    if (data.password.length < 4) {
      return { success: false, message: 'Kata sandi minimal 4 karakter.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      name: data.name.trim(),
      password: data.password.trim(),
      role: data.role || 'student',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    const session: AuthSession = {
      isAuthenticated: true,
      userId: newUser.id,
      role: newUser.role,
      username: newUser.username,
      name: newUser.name,
      studentNim: newUser.username,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Pendaftaran akun berhasil!', session };
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
    if (envMasterKey && cleanPassword === envMasterKey) {
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
    const user = users.find((u) => u.username === cleanUsername);

    if (!user) {
      return { success: false, message: 'Username atau NIM tidak ditemukan.' };
    }

    if (user.password !== cleanPassword) {
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
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

  updateClassAccessCode(newCode: string): { success: boolean; message: string } {
    const config = this.getSecurityConfig();
    if (!config) {
      return { success: false, message: 'Konfigurasi tidak ditemukan.' };
    }

    if (!newCode.trim() || newCode.trim().length < 3) {
      return { success: false, message: 'Kode Akses minimal 3 karakter.' };
    }

    config.classAccessCode = newCode.trim();
    localStorage.setItem(SECURITY_KEY, JSON.stringify(config));
    return { success: true, message: 'Kode Izin Kelas berhasil diperbarui!' };
  },

  getRegisteredUsers(): Omit<UserAccount, 'password'>[] {
    return this.getUsers().map(({ password: _, ...rest }) => rest);
  },
};
