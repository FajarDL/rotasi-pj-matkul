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
  intervalDays: number; // usually 7 (weekly)
  excludeSessionNumbers?: number[]; // e.g. [8, 16] for UTS & UAS
}

export interface AppState {
  courses: Course[];
  students: Student[];
  sessions: SessionSchedule[];
  activeCourseId: string | null;
}
