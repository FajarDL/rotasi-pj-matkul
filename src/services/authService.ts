import type { AuthSession } from '../types';

const AUTH_KEY = 'ROTASI_PJ_AUTH_SESSION_V1';
const PIN_KEY = 'ROTASI_PJ_ADMIN_PIN_V1';
const DEFAULT_PIN = '123456';

export const authService = {
  getAdminPin(): string {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  },

  setAdminPin(newPin: string): void {
    localStorage.setItem(PIN_KEY, newPin);
  },

  changeAdminPin(oldPin: string, newPin: string): { success: boolean; message: string } {
    const currentPin = this.getAdminPin();
    if (oldPin !== currentPin) {
      return { success: false, message: 'Kata sandi / PIN lama salah.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'PIN baru minimal 4 karakter.' };
    }
    this.setAdminPin(newPin);
    return { success: true, message: 'PIN Pengelola berhasil diperbarui!' };
  },

  getSession(): AuthSession {
    try {
      const serialized = sessionStorage.getItem(AUTH_KEY);
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch {
      // fallback
    }
    return {
      isAuthenticated: false,
      role: 'student',
      userName: 'Tamu / Mahasiswa',
    };
  },

  loginAsAdmin(pin: string): { success: boolean; message?: string } {
    const correctPin = this.getAdminPin();
    if (pin.trim() === correctPin) {
      const session: AuthSession = {
        isAuthenticated: true,
        role: 'admin',
        userName: 'Koordinator / Komti',
      };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return { success: true };
    }
    return { success: false, message: 'PIN / Kata sandi salah. (PIN bawaan: 123456)' };
  },

  loginAsStudent(nim?: string, name?: string): AuthSession {
    const session: AuthSession = {
      isAuthenticated: true,
      role: 'student',
      userName: name || (nim ? `Mahasiswa (${nim})` : 'Mahasiswa'),
      studentNim: nim,
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  },

  logout(): void {
    sessionStorage.removeItem(AUTH_KEY);
  },
};
