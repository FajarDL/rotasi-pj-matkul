# Rotasi PJ Matkul 🎓📅

Aplikasi web modern untuk mengelola, mengacak, dan menjadwalkan rotasi Penanggung Jawab (PJ) mata kuliah secara adil, mudah, dan otomatis. Dirancang khusus untuk mahasiswa, ketua tingkat (komti), atau koordinator kelas perkuliahan.

Aplikasi ini siap dideploy langsung ke **Vercel** maupun **Netlify** dengan zero configuration.

---

## ✨ Fitur Utama

- 🎯 **Dashboard & Notifikasi Terdekat**:
  - Menampilkan informasi mata kuliah aktif, jadwal kuliah, ruangan, dan dosen pengampu.
  - Kartu khusus **Pertemuan Terdekat** untuk melihat PJ yang bertugas minggu ini.
  - **Satu Klik Salin Pesan WhatsApp**: Format pesan pengingat siap broadcast ke grup kelas WhatsApp lengkap dengan emoji dan daftar tugas PJ.
  
- 🎲 **Smart Rotation Generator**:
  - Algoritma pembagian giliran adil (*Fair Rotation*): memastikan semua mahasiswa bertugas 1x sebelum ada yang mendapat giliran ke-2.
  - Pilihan jumlah PJ per pertemuan: 1 orang, 2 orang (pasangan/duo), atau 3 orang.
  - Metode pengacakan: **Acak Adil (Fair Random)**, **Urut Berdasarkan NIM**, atau **Urut Alfabetis (A-Z)**.
  - Efek confetti selebrasi saat rotasi berhasil dibuat.

- 🔄 **Fitur Tukar Giliran (Swap PJ)**:
  - Mahasiswa berhalangan sakit atau izin? Tukar jadwal dengan mahasiswa lain antar pertemuan dalam hitungan detik.

- 👥 **Manajemen Mahasiswa & Bulk Paste**:
  - Tambah mahasiswa satu per satu secara manual.
  - **Bulk Import / Paste**: Cukup salin & tempel daftar nama dari chat WhatsApp atau Excel, sistem akan otomatis mendeteksi NIM, Nama, dan No. HP/WA.
  - Indikator pemerataan tugas (*Fairness meter*) untuk melihat berapa kali tiap mahasiswa bertugas.

- 📚 **Multi Mata Kuliah**:
  - Kelola beberapa mata kuliah sekaligus dalam satu aplikasi.
  - Pengaturan fleksibel: hari, jam, ruang, dosen, dan jumlah pertemuan (1-30 pertemuan).

- 🖨️ **Ekspor & Berbagi**:
  - **Cetak Dokumen Resmi (PDF)**: Layout dokumen akademik resmi lengkap dengan lembar tanda tangan pengesahan Dosen & Komti.
  - **Export Spreadsheet (CSV/Excel)** untuk backup tabel jadwal.
  - **Backup & Restore JSON**: Simpan data atau pindahkan ke perangkat lain dengan mudah.

- ⚡ **Offline-First & Local Storage**:
  - Data tersimpan otomatis di browser tanpa perlu registrasi akun atau database server berbayar.

---

## 🚀 Cara Menjalankan di Lokal (Local Development)

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas).

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/FajarDL/rotasi-pj-matkul.git
   cd rotasi-pj-matkul
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan local development server**:
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

Repository ini sudah dilengkapi file konfigurasi `vercel.json` dan `netlify.toml` sehingga dapat dideploy dalam 1 klik!

### Opsi 1: Deploy ke Vercel
1. Masuk ke [vercel.com](https://vercel.com) dan hubungkan akun GitHub Anda.
2. Klik **"Add New..."** lalu pilih **"Project"**.
3. Import repository **`rotasi-pj-matkul`**.
4. Vercel akan mendeteksi framework **Vite** secara otomatis:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik tombol **Deploy**! Aplikasi Anda akan aktif dalam hitungan detik.

### Opsi 2: Deploy ke Netlify
1. Masuk ke [netlify.com](https://netlify.com) dan pilih **"Add new site"** > **"Import an existing project"**.
2. Hubungkan akun GitHub dan pilih repository **`rotasi-pj-matkul`**.
3. Netlify akan otomatis membaca konfigurasi `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Klik tombol **Deploy Site**!

---

## 🛠️ Teknologi yang Digunakan

- **React 19**
- **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Canvas-Confetti**

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik dan perkuliahan. Bebas digunakan dan dimodifikasi.
