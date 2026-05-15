# SITEGAR — Sistem Informasi Demografis & Keuangan RW

Proyek ini adalah sistem manajemen data warga dan keuangan tingkat Rukun Tetangga (RT) dan Rukun Warga (RW) yang terintegrasi.

## 🚀 Perjalanan Pengembangan (Log)

Berikut adalah ringkasan apa yang telah dikerjakan dari awal hingga saat ini:

### 1. Inisialisasi & Setup Lingkungan
- **Clone Repository**: Menggabungkan Backend (Laravel 12) dan Frontend (Next.js).
- **Struktur Proyek**: Memisahkan kode menjadi dua folder utama: `/backend` dan `/frontend` untuk kemudahan manajemen.
- **Database**: Menggunakan SQLite untuk database lokal yang ringan dan cepat.
- **Dependency**: Instalasi `composer` (PHP) dan `npm` (Node.js) untuk kedua sisi aplikasi.

### 2. Backend (API Laravel)
- **Migrasi Database**: Membuat tabel `users`, `warga`, `kartu_keluarga`, dan `transaksi`.
- **Seeding Data**: Mengisi data awal untuk testing, termasuk akun **Super Admin (RW)** dan **Admin (RT)**.
- **API Endpoints**: 
  - Auth: Login (Sanctum), Me.
  - RT: Kelola Warga, Kartu Keluarga, dan Keuangan per RT.
  - RW: Dashboard ringkasan seluruh wilayah.
- **Fix PSR-4**: Memperbaiki penamaan folder controller agar sesuai standar autoloading PHP.

### 3. Frontend (Next.js UI)
- **Integrasi API**: Mengganti data simulasi (*mock data*) dengan data asli dari Backend menggunakan `fetchWithAuth`.
- **Dashboard Dinamis**: 
  - Dashboard RW sekarang menampilkan total warga, KK, dan saldo kas gabungan seluruh RT secara real-time.
  - Dashboard RT menampilkan statistik spesifik wilayah masing-masing.
- **Popup & Form**:
  - Implementasi popup modern untuk **Tambah Warga**, **Tambah KK**, dan **Tambah Laporan Keuangan**.
  - Layout form diperbaiki menjadi vertikal agar lebih rapi dan tidak terpotong.
- **Fitur Ekspor**: Menambahkan fitur download data warga ke format `.csv`.

### 4. Keamanan & Validasi
- **Route Guard**: Implementasi proteksi halaman berdasarkan role (RW tidak bisa akses menu warga biasa, RT hanya bisa akses wilayahnya sendiri).
- **Validasi Form**: Menambahkan validasi NIK (16 digit) dan jenis data lainnya baik di sisi Frontend maupun Backend.
- **Auth State**: Penggunaan React Context (`AuthProvider`) untuk menjaga status login di seluruh aplikasi.

### 5. Media & Penyimpanan
- **Upload Foto**: Menambahkan fitur unggah foto warga yang tersimpan di server backend.
- **Laravel Storage**: Mengonfigurasi symbolic link agar foto warga bisa diakses secara publik.

---

## 🛠 Cara Menjalankan

### Backend (Laravel)
1. Masuk ke folder `backend`.
2. Pastikan file `.env` sudah ada (jika belum, `cp .env.example .env`).
3. Jalankan `php artisan migrate --seed` (hanya sekali).
4. Jalankan `php artisan serve`.

### Frontend (Next.js)
1. Masuk ke folder `frontend`.
2. Jalankan `npm install`.
3. Jalankan `npm run dev`.
4. Buka `http://localhost:3000` di browser.

## 🔐 Akun Default
- **Super Admin (RW)**: `superadmin` / `password123`
- **Admin RT 01**: `admin01` / `password123`
- **Warga**: `warga@sitegar.com` / `password123`

---
*Dikembangkan dengan ❤️ untuk kemudahan pengelolaan warga.*
