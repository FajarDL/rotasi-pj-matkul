# SI-ROTASI - Sistem Informasi Rotasi Penanggung Jawab Perkuliahan 🎓

[![CI](https://github.com/FajarDL/rotasi-pj-matkul/actions/workflows/ci.yml/badge.svg)](https://github.com/FajarDL/rotasi-pj-matkul/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

Aplikasi web manajemen perkuliahan profesional untuk mengelola, mengacak, dan menjadwalkan rotasi **Penanggung Jawab (PJ)** mata kuliah secara adil, transparan, dan terstruktur. Dirancang khusus untuk perguruan tinggi, ketua tingkat (komti), dosen pengampu, dan mahasiswa.

Siap dideploy langsung ke **Vercel** maupun **Netlify** dengan konfigurasi otomatis (*zero-config*).

---

## ✨ Fitur Unggulan

### 1. 🔒 Gerbang Kunci Akses Tunggal (*Passkey Gate*)
- **Akses Tertutup Total (*Zero Public Leak*)**: Pengunjung yang belum memasukkan kunci akses tidak dapat melihat dashboard, jadwal, maupun data mahasiswa kelas.
- **Kunci Akses Tersimpan di LocalStorage**: Pengguna menentukan satu kunci akses rahasia (PIN / Password bebas) yang disimpan di browser tanpa perlu registrasi multi-user yang rumit.
- **Ingat Perangkat & Kunci Cepat**: Fitur simpan sesi di perangkat pribadi dan tombol kunci instan di navbar.
- **Pemulihan & Reset Mudah**: Dilengkapi tombol reset darurat di layar gerbang dan parameter URL `?reset=true` untuk kemudahan pemulihan.

### 2. 📋 Smart SIAKAD Schedule Parser (Import Jadwal Otomatis)
- Mendukung salin-tempel langsung dari portal akademik / website kampus (SIAKAD).
- **Format Struktur yang Didukung**:
  ```text
  [No]	[KODE_MK]	[NAMA_MATA_KULIAH]	[KELAS]	- [HARI], [JAM_MULAI] s/d [JAM_SELESAI]
  - [KODE_RUANGAN]
  - [NAMA_DOSEN_PENGAMPU]
  ```
- **Contoh Format Pengisian**:
  ```text
  1	MK101	Contoh Mata Kuliah 1	A	- Senin, 08:00:00 s/d 10:00:00
  - Ruang Kuliah 01
  - Nama Dosen Pengampu, S.Kom., M.T.

  2	MK102	Contoh Mata Kuliah 2	A	- Selasa, 10:00:00 s/d 12:00:00
  - Lab Komputer 1
  - Nama Dosen Pengampu 2, M.Kom.
  ```
- Sistem otomatis mengekstrak:
  - Kode & Nama Mata Kuliah
  - Nama Dosen Pengampu & Gelar Akademik
  - Hari Kuliah, Jam Mulai & Selesai (format dinormalkan)
  - Ruangan Kuliah / Laboratorium
- **Pembuatan 16 Sesi Otomatis**: Pertemuan dihitung berdasarkan hari kuliah, lengkap dengan penamaan otomatis untuk **Pertemuan 8 (UTS)** dan **Pertemuan 16 (UAS)**.

### 3. 👥 Smart Student Importer & Deduplikasi Otomatis
- **Format Struktur yang Didukung**:
  ```text
  [NIM] | [NAMA_LENGKAP_MAHASISWA]
  ```
- **Contoh Format Pengisian**:
  ```text
  1234567890 | CONTOH MAHASISWA 1
  1234567891 | CONTOH MAHASISWA 2
  1234567892 | CONTOH MAHASISWA 3
  ```
- Mengabaikan baris header non-data secara otomatis.
- **Penyaringan Duplikasi NIM**: Mendeteksi dan membersihkan data ganda secara otomatis sehingga daftar rotasi tetap bersih dan adil.

### 4. 🎲 Smart Rotation Generator & Penugasan PJ
- **Fair Rotation Algorithm**: Memastikan setiap mahasiswa bertugas minimal 1x sebelum putaran giliran berikutnya dimulai.
- Pilihan format giliran: **1 PJ**, **2 PJ (Duet/Partner)**, atau **3 PJ per pertemuan**.
- Metode pembagian:
  - **Acak Adil (*Fair Random*)**
  - **Urut Berdasarkan NIM**
  - **Urut Berdasarkan Alfabetis Nama (A-Z)**
- **Fitur Tukar Giliran (*Swap PJ*)**: Memudahkan pertukaran jadwal antar mahasiswa jika ada yang berhalangan hadir atau sakit.

### 5. 🖨️ Ekspor Dokumen Resmi & Cadangan Data
- **Cetak Dokumen Akademik Resmi (PDF)**: Format dokumen standar perguruan tinggi lengkap dengan kolom tanda tangan legalitas Dosen Pengampu & Ketua Tingkat.
- **Template Broadcast WhatsApp 1-Klik**: Format pengingat jadwal perkuliahan rapi siap kirim ke grup kelas.
- **Ekspor Spreadsheet (CSV)** untuk rekapitulasi nilai dan kehadiran.
- **Backup & Restore JSON**: Cadangkan seluruh data atau pulihkan data antar perangkat tanpa internet.

---

## 🚀 Panduan Menjalankan di Lokal (Local Development)

Pastikan telah menginstal **Node.js** (versi 18 ke atas) dan **npm**.

1. **Clone repository**:
   ```bash
   git clone https://github.com/FajarDL/rotasi-pj-matkul.git
   cd rotasi-pj-matkul
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:5173`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## 🌐 Panduan Deploy ke Vercel & Netlify

Proyek ini telah dikonfigurasi untuk langsung dideploy tanpa konfigurasi tambahan (*zero-config*).

### Deploy ke Vercel (Rekomendasi)
1. Buka [Vercel](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** &rarr; **"Project"**.
3. Pilih repository **`rotasi-pj-matkul`**.
4. Pengaturan build otomatis terdeteksi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Opsional)* Tambahkan Environment Variable `VITE_MASTER_KEY` sebagai kunci darurat.
6. Klik **Deploy**!

### Deploy ke Netlify
1. Buka [Netlify](https://netlify.com) dan pilih **"Add new site"** &rarr; **"Import an existing project"**.
2. Pilih repository **`rotasi-pj-matkul`**.
3. Netlify akan membaca konfigurasi `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
4. Klik **Deploy Site**!

---

## 🔑 Panduan Inisialisasi & Reset Akun

### Setup Pertama Kali
Saat aplikasi pertama kali dibuka setelah deploy, sistem akan menampilkan form **Inisialisasi Pemilik Kelas**:
1. Masukkan **Nama Lengkap**, **Username**, dan **Kata Sandi** pilihan Anda.
2. Klik **Aktifkan Sistem Sebagai Pemilik**.
3. Anda akan langsung otomatis masuk sebagai **Pemilik Utama (Owner/Admin)**.

### Reset Akun / Pemulihan Akses
Jika Anda lupa kata sandi atau ingin mereset akun pengelola:
- **Tombol Reset di Form Login**: Klik tautan *"Reset Akun Pengelola & Setup Baru"* di bagian bawah form login.
- **Parameter URL**: Tambahkan `?reset=true` di akhir URL aplikasi Anda di browser untuk mereset data autentikasi dan memulai setup admin baru.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Bundler**: Vite 8
- **Storage**: LocalStorage & SessionStorage API dengan validasi skema
- **CI/CD**: GitHub Actions

---

## 📄 Lisensi

Proyek ini berlisensi [MIT](LICENSE). Dibuat untuk mendukung kelancaran perkuliahan mahasiswa dan ketua tingkat di perguruan tinggi.
