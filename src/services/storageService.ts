import type { AppState, Course, Student, SessionSchedule } from '../types';

const STORAGE_KEY = 'ROTASI_PJ_MATKUL_DATA_V1';

export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', nim: '220101001', name: 'Ahmad Fauzi', phone: '081234567801', isActive: true },
  { id: 'std-2', nim: '220101002', name: 'Anisa Rahmawati', phone: '081234567802', isActive: true },
  { id: 'std-3', nim: '220101003', name: 'Bagus Pratama', phone: '081234567803', isActive: true },
  { id: 'std-4', nim: '220101004', name: 'Cantika Dewi', phone: '081234567804', isActive: true },
  { id: 'std-5', nim: '220101005', name: 'Dimas Setiawan', phone: '081234567805', isActive: true },
  { id: 'std-6', nim: '220101006', name: 'Dinda Lestari', phone: '081234567806', isActive: true },
  { id: 'std-7', nim: '220101007', name: 'Fajar Nugraha', phone: '081234567807', isActive: true },
  { id: 'std-8', nim: '220101008', name: 'Gita Maharani', phone: '081234567808', isActive: true },
  { id: 'std-9', nim: '220101009', name: 'Hafiz Al-Fatih', phone: '081234567809', isActive: true },
  { id: 'std-10', nim: '220101010', name: 'Indah Permata', phone: '081234567810', isActive: true },
  { id: 'std-11', nim: '220101011', name: 'Kevin Saputra', phone: '081234567811', isActive: true },
  { id: 'std-12', nim: '220101012', name: 'Larasati Putri', phone: '081234567812', isActive: true },
  { id: 'std-13', nim: '220101013', name: 'Muhammad Rizky', phone: '081234567813', isActive: true },
  { id: 'std-14', nim: '220101014', name: 'Nabila Azzahra', phone: '081234567814', isActive: true },
  { id: 'std-15', nim: '220101015', name: 'Pandu Wicaksono', phone: '081234567815', isActive: true },
  { id: 'std-16', nim: '220101016', name: 'Rani Safitri', phone: '081234567816', isActive: true },
  { id: 'std-17', nim: '220101017', name: 'Rian Hidayat', phone: '081234567817', isActive: true },
  { id: 'std-18', nim: '220101018', name: 'Salsabila Putri', phone: '081234567818', isActive: true },
  { id: 'std-19', nim: '220101019', name: 'Taufik Ismail', phone: '081234567819', isActive: true },
  { id: 'std-20', nim: '220101020', name: 'Vina Anggraeni', phone: '081234567820', isActive: true },
  { id: 'std-21', nim: '220101021', name: 'Wahyu Ramadhan', phone: '081234567821', isActive: true },
  { id: 'std-22', nim: '220101022', name: 'Yulia Safitri', phone: '081234567822', isActive: true },
  { id: 'std-23', nim: '220101023', name: 'Zack Lee', phone: '081234567823', isActive: true },
  { id: 'std-24', nim: '220101024', name: 'Zulfa Khoirunnisa', phone: '081234567824', isActive: true },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'IF302',
    name: 'Pemrograman Web Lanjut',
    lecturer: 'Dr. Ir. Hendra Wijaya, M.Kom.',
    day: 'Selasa',
    startTime: '08:00',
    endTime: '10:30',
    room: 'Lab Komputer 3 (Gedung D Lantai 2)',
    totalSessions: 16,
    color: 'indigo',
  },
  {
    id: 'course-2',
    code: 'IF305',
    name: 'Basis Data Terdistribusi',
    lecturer: 'Siti Nurhaliza, M.Cs.',
    day: 'Kamis',
    startTime: '13:00',
    endTime: '15:30',
    room: 'Ruang Teori R.304',
    totalSessions: 16,
    color: 'emerald',
  },
];

// Helper to get formatted upcoming dates (YYYY-MM-DD) starting from next Tuesday
function generateInitialDates(count: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  
  // Find next Tuesday (day 2 in getDay: Sun=0, Mon=1, Tue=2)
  const currentDay = now.getDay();
  const daysUntilTuesday = (2 - currentDay + 7) % 7 || 7;
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntilTuesday);

  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i * 7);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const sampleDates = generateInitialDates(16);

export const INITIAL_SESSIONS: SessionSchedule[] = [
  {
    id: 'sess-1',
    courseId: 'course-1',
    sessionNumber: 1,
    date: sampleDates[0],
    topic: 'Kontrak Kuliah & Pengenalan Ekosistem Web Modern',
    assignedPjIds: ['std-1', 'std-2'],
    notes: 'Hubungi dosen H-1 dan pastikan proyektor lab berfungsi',
    status: 'completed',
  },
  {
    id: 'sess-2',
    courseId: 'course-1',
    sessionNumber: 2,
    date: sampleDates[1],
    topic: 'Modern TypeScript & Frontend Architecture',
    assignedPjIds: ['std-3', 'std-4'],
    notes: 'Presensi mahasiswa & rekap presensi kelas',
    status: 'ongoing',
  },
  {
    id: 'sess-3',
    courseId: 'course-1',
    sessionNumber: 3,
    date: sampleDates[2],
    topic: 'State Management & Custom Hooks di React',
    assignedPjIds: ['std-5', 'std-6'],
    notes: 'Bagikan materi slide presentasi ke grup WA',
    status: 'upcoming',
  },
  {
    id: 'sess-4',
    courseId: 'course-1',
    sessionNumber: 4,
    date: sampleDates[3],
    topic: 'Tailwind CSS & Design System Implementation',
    assignedPjIds: ['std-7', 'std-8'],
    notes: 'Siapkan laptop demo di meja dosen',
    status: 'upcoming',
  },
  {
    id: 'sess-5',
    courseId: 'course-1',
    sessionNumber: 5,
    date: sampleDates[4],
    topic: 'Server-Side Rendering & Next.js Basics',
    assignedPjIds: ['std-9', 'std-10'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-6',
    courseId: 'course-1',
    sessionNumber: 6,
    date: sampleDates[5],
    topic: 'REST API & GraphQL Data Fetching',
    assignedPjIds: ['std-11', 'std-12'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-7',
    courseId: 'course-1',
    sessionNumber: 7,
    date: sampleDates[6],
    topic: 'Review Materi Tengah Semester & Diskusi Tugas Besar',
    assignedPjIds: ['std-13', 'std-14'],
    notes: 'Kumpulkan rekap judul proyek tugas besar kelompok',
    status: 'upcoming',
  },
  {
    id: 'sess-8',
    courseId: 'course-1',
    sessionNumber: 8,
    date: sampleDates[7],
    topic: 'UJIAN TENGAH SEMESTER (UTS)',
    assignedPjIds: ['std-15', 'std-16'],
    notes: 'Bantu pengawas ujian & absensi ujian',
    status: 'upcoming',
  },
  {
    id: 'sess-9',
    courseId: 'course-1',
    sessionNumber: 9,
    date: sampleDates[8],
    topic: 'Autentikasi & Otorisasi (JWT & OAuth2)',
    assignedPjIds: ['std-17', 'std-18'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-10',
    courseId: 'course-1',
    sessionNumber: 10,
    date: sampleDates[9],
    topic: 'Database Integration (Prisma ORM & PostgreSQL)',
    assignedPjIds: ['std-19', 'std-20'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-11',
    courseId: 'course-1',
    sessionNumber: 11,
    date: sampleDates[10],
    topic: 'Real-time WebSockets & Server Sent Events',
    assignedPjIds: ['std-21', 'std-22'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-12',
    courseId: 'course-1',
    sessionNumber: 12,
    date: sampleDates[11],
    topic: 'Testing & Quality Assurance (Vitest & Playwright)',
    assignedPjIds: ['std-23', 'std-24'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-13',
    courseId: 'course-1',
    sessionNumber: 13,
    date: sampleDates[12],
    topic: 'Deployment & CI/CD Pipeline (Vercel, Docker, GitHub Actions)',
    assignedPjIds: ['std-1', 'std-3'],
    notes: 'Rotasi putaran kedua dimulai',
    status: 'upcoming',
  },
  {
    id: 'sess-14',
    courseId: 'course-1',
    sessionNumber: 14,
    date: sampleDates[13],
    topic: 'Web Performance Optimization & Security Best Practices',
    assignedPjIds: ['std-2', 'std-4'],
    notes: '',
    status: 'upcoming',
  },
  {
    id: 'sess-15',
    courseId: 'course-1',
    sessionNumber: 15,
    date: sampleDates[14],
    topic: 'Presentasi Proyek Akhir Kelompok (Final Showcase)',
    assignedPjIds: ['std-5', 'std-7'],
    notes: 'Moderasi waktu presentasi masing-masing kelompok',
    status: 'upcoming',
  },
  {
    id: 'sess-16',
    courseId: 'course-1',
    sessionNumber: 16,
    date: sampleDates[15],
    topic: 'UJIAN AKHIR SEMESTER (UAS)',
    assignedPjIds: ['std-6', 'std-8'],
    notes: 'Rekap kehadiran akhir dan pengumpulan laporan final',
    status: 'upcoming',
  },
];

export const storageService = {
  loadData(): AppState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return this.getDefaultData();
      }
      const parsed = JSON.parse(serialized);
      if (!parsed.courses || !parsed.students || !parsed.sessions) {
        return this.getDefaultData();
      }
      return parsed;
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return this.getDefaultData();
    }
  },

  saveData(data: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  },

  getDefaultData(): AppState {
    return {
      courses: INITIAL_COURSES,
      students: INITIAL_STUDENTS,
      sessions: INITIAL_SESSIONS,
      activeCourseId: 'course-1',
    };
  },

  exportBackup(data: AppState): void {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('download', `backup-rotasi-pj-matkul-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importBackup(file: File): Promise<AppState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.courses) && Array.isArray(parsed.students)) {
            resolve(parsed as AppState);
          } else {
            reject(new Error('Format file backup tidak valid.'));
          }
        } catch (err) {
          reject(new Error('Gagal membaca file JSON: ' + (err as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsText(file);
    });
  },
};
