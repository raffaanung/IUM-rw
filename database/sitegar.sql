-- ==========================================================
-- SITEGAR - Sistem Informasi Demografis & Keuangan RW
-- Database Schema for MySQL / phpMyAdmin
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Tabel Users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL UNIQUE,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('rw','rt','warga','super-admin','admin-rt') NOT NULL DEFAULT 'warga',
  `rt` varchar(3) DEFAULT NULL,
  `rw` varchar(3) DEFAULT '8',
  `nik` varchar(16) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Tabel Warga
-- --------------------------------------------------------
CREATE TABLE `warga` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nik` varchar(16) NOT NULL UNIQUE,
  `nama` varchar(255) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `tempat_lahir` varchar(255) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `alamat` text NOT NULL,
  `rt` varchar(3) NOT NULL,
  `rw` varchar(3) NOT NULL DEFAULT '8',
  `status_warga` enum('tetap','kontrak','pendatang') NOT NULL,
  `status_pernikahan` enum('belum_menikah','menikah','cerai') NOT NULL,
  `pekerjaan` varchar(255) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Tabel Kartu Keluarga
-- --------------------------------------------------------
CREATE TABLE `kartu_keluarga` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `no_kk` varchar(16) NOT NULL UNIQUE,
  `kepala_keluarga` bigint(20) UNSIGNED NOT NULL,
  `alamat` text NOT NULL,
  `rt` varchar(3) NOT NULL,
  `rw` varchar(3) NOT NULL DEFAULT '8',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`kepala_keluarga`) REFERENCES `warga` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Tabel Anggota KK
-- --------------------------------------------------------
CREATE TABLE `anggota_kk` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `kartu_keluarga_id` bigint(20) UNSIGNED NOT NULL,
  `warga_id` bigint(20) UNSIGNED NOT NULL,
  `hubungan_keluarga` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`kartu_keluarga_id`) REFERENCES `kartu_keluarga` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Tabel Transaksi (Keuangan)
-- --------------------------------------------------------
CREATE TABLE `transaksi` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tanggal` date NOT NULL,
  `judul` varchar(255) NOT NULL,
  `kategori` varchar(255) NOT NULL,
  `jenis` enum('pemasukan','pengeluaran') NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `rt` varchar(3) DEFAULT NULL,
  `pencatat` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Tabel Token (Sanctum)
-- --------------------------------------------------------
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL UNIQUE,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 7. Data Akun Default
-- --------------------------------------------------------
-- Password default adalah 'password'
INSERT INTO `users` (`name`, `username`, `password`, `role`, `rt`, `rw`, `created_at`, `updated_at`) VALUES
('Ketua RW 8', 'superadmin', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rw', NULL, '8', NOW(), NOW()),
('Ketua RT 01', 'admin01', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '01', '8', NOW(), NOW()),
('Ketua RT 02', 'admin02', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '02', '8', NOW(), NOW()),
('Ketua RT 03', 'admin03', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '03', '8', NOW(), NOW()),
('Ketua RT 04', 'admin04', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '04', '8', NOW(), NOW()),
('Ketua RT 05', 'admin05', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '05', '8', NOW(), NOW()),
('Ketua RT 06', 'admin06', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '06', '8', NOW(), NOW()),
('Ketua RT 07', 'admin07', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '07', '8', NOW(), NOW()),
('Ketua RT 08', 'admin08', '$2y$10$3PLXOnbx0dMVxOc4hpl0nOdOZbz4fC2n6cR1U2RJRAGuGGdf07DJK', 'rt', '08', '8', NOW(), NOW());

COMMIT;
