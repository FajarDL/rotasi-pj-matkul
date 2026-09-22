export type UserRole = 'owner' | 'admin' | 'student';

export interface UserAccount {
  id: string;
  username: string; // NIM or custom username
  name: string;
  password: string; // password
  role: UserRole;
  createdAt: string;
}

export interface SecurityConfig {
  isInitialized: boolean;
  classAccessCode: string; // Secret code set by owner for new members
  ownerUsername: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  userId?: string;
  role: UserRole;
  username: string;
  name: string;
  userName?: string;
  studentNim?: string;
}

export interface Student {
  id: string;
  nim: string;
  name: string;
  phone?: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  totalSessions: number;
  color: string;
}

export type SessionStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface SessionSchedule {
  id: string;
  courseId: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  topic: string;
  assignedPjIds: string[]; // List of Student IDs
  notes?: string;
  status: SessionStatus;
}

export type RotationMode = 'fair_random' | 'sequential_nim' | 'alphabetical';

export interface RotationConfig {
  pjCountPerSession: number;
  mode: RotationMode;
  startDate: string;
  intervalDays: number;
  excludeSessionNumbers?: number[];
}

export interface CoursePreset {
  code: string;
  name: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  totalSessions: number;
  topics: string[];
}

export interface AppState {
  courses: Course[];
  students: Student[];
  sessions: SessionSchedule[];
  activeCourseId: string | null;
}
