# SI-ROTASI - Sistem Informasi Rotasi Penanggung Jawab Perkuliahan 🎓

Aplikasi web manajemen perkuliahan profesional untuk mengelola, mengacak, dan menjadwalkan rotasi Penanggung Jawab (PJ) mata kuliah secara adil, akurat, dan terstruktur. Dirancang khusus untuk kebutuhan akademik mahasiswa, ketua tingkat (komti), dosen pengampu, dan koordinator perkuliahan perguruan tinggi.

Aplikasi ini siap dideploy langsung ke **Vercel** maupun **Netlify** dengan konfigurasi otomatis (*zero configuration*).

---

## ✨ Fitur Utama

- 🔐 **Autentikasi & Kontrol Akses Berbasis Peran (RBAC)**:
  - **Administrator / Komti**: Terproteksi PIN/Kata Sandi (PIN bawaan: `123456`, dapat diubah sendiri). Memiliki hak akses penuh untuk mengacak jadwal, menambah mata kuliah, menukar mahasiswa (swap), dan mengedit data.
  - **Mahasiswa (View-Only)**: Mahasiswa dapat melihat jadwal kelas, mencari giliran tugas pribadi, mengunduh format broadcast WhatsApp, dan mencetak dokumen tanpa risiko merusak data jadwal.

- 🪄 **Autofill Otomatis Dosen, Mata Kuliah & 16 Silabus**:
  - Menyediakan template kurikulum siap pakai (misal: *Pemrograman Web Lanjut*, *Basis Data Terdistribusi*, *Kecerdasan Buatan*, *Jaringan Komputer*, *Rekayasa Perangkat Lunak*).
  - Ketika template dipilih, sistem **mengisi otomatis seketika**:
    - Kode MK & Nama Mata Kuliah
    - Dosen Pengampu & Gelar Akademik
    - Hari, Jam Kuliah, dan Ruangan Lab
    - **16 Pertemuan materi / pokok bahasan lengkap** (termasuk jadwal UTS di minggu ke-8 dan UAS di minggu ke-16).
  - Dilengkapi fitur Master Dosen & Preset Ruangan untuk pengisian cepat satu-klik.

- 🔍 **Cek Jadwal Tugas Saya (Personal Schedule Lookup)**:
  - Mahasiswa dapat memilih nama atau memasukkan NIM untuk langsung memfilter daftar sesi dan tanggal giliran tugas masing-masing.

- 🎲 **Smart Rotation Generator**:
  - Algoritma pembagian giliran adil (*Fair Rotation Algorithm*): Memastikan setiap mahasiswa bertugas 1x sebelum putaran giliran ke-2 dimulai.
  - Pilihan jumlah PJ per pertemuan: 1 orang, 2 orang (pasangan/duo), atau 3 orang.
  - Metode penugasan: **Acak Adil (Fair Random)**, **Urut Berdasarkan NIM**, atau **Urut Berdasarkan Alfabetis Nama (A-Z)**.

- 🔄 **Fitur Tukar Giliran Penugasan (Swap PJ)**:
  - Jika ada mahasiswa yang berhalangan sakit atau izin pada jadwal tertentu, jadwal dapat ditukar dengan mahasiswa lain antar pertemuan dalam hitungan detik.

- 👥 **Manajemen Mahasiswa & Bulk Paste**:
  - **Bulk Import / Paste Pintar**: Salin dan tempel daftar nama langsung dari chat WhatsApp atau Excel. Parser otomatis mendeteksi NIM, Nama, dan No. HP/WhatsApp.
  - Statistik pemerataan tugas (*Fairness meter*) untuk memantau beban penugasan seluruh anggota kelas.

- 🖨️ **Ekspor Dokumen & Cadangan Data**:
  - **Cetak Dokumen Resmi (PDF)**: Layout dokumen akademik standar perguruan tinggi lengkap dengan lembar tanda tangan pengesahan Dosen Pengampu & Ketua Tingkat.
  - **Export Spreadsheet (CSV)** untuk rekapitulasi data.
  - **Salin Pesan WhatsApp 1-Klik**: Template pengingat kuliah dengan format rapi dan poin tugas PJ siap kirim ke grup kelas.
  - **Backup & Restore JSON**: Simpan data atau pindahkan ke perangkat lain secara mandiri.

---

## 🚀 Cara Menjalankan di Lokal (Local Development)

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas).

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
   Buka browser pada alamat yang ditampilkan (biasanya `http://localhost:5173`).

4. **Build untuk production**:
   ```bash
   npm run build
   ```

---

## 🌐 Cara Deploy ke Vercel & Netlify

Repository ini sudah dilengkapi file konfigurasi `vercel.json` dan `netlify.toml`.

### Opsi 1: Deploy ke Vercel (Disarankan)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** lalu pilih **"Project"**.
3. Import repository **`rotasi-pj-matkul`**.
4. Vercel akan mendeteksi framework **Vite** secara otomatis:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**!

### Opsi 2: Deploy ke Netlify
1. Buka [netlify.com](https://netlify.com) dan pilih **"Add new site"** > **"Import an existing project"**.
2. Pilih repository **`rotasi-pj-matkul`**.
3. Netlify akan otomatis membaca konfigurasi `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Klik **Deploy Site**!

---

## 📄 Kredensial Pengujian Bawaan

- **Peran Mahasiswa**: Bebas akses (View-Only).
- **Peran Pengelola (Komti / Admin)**: Kata Sandi / PIN bawaan: `123456` (dapat diubah di menu ikon Kunci / Pengaturan Keamanan).
