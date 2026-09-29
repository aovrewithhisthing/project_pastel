# Dokumen User Acceptance Testing (UAT) & Bug Tracking Log

**Proyek:** Chronicle Seal (Digital Time Capsule)  
**Peran:** QA Engineer & Full-Stack Support  
**Versi:** 1.0.0  
**Tanggal Eksekusi:** 29 September 2026  
**Status UAT:** PASSED & READY FOR PRODUCTION  

---

## 1. Panduan & Skenario UAT Bersama Tim

Pengujian penerimaan pengguna (UAT) dirancang untuk memverifikasi fungsionalitas aplikasi dari sudut pandang pengguna akhir (End-User Personas). Setiap skenario dijalankan secara berurutan dengan kriteria kelulusan yang ketat.

### Persona 1: Siswa SMA / Mahasiswa Tingkat Akhir (Refleksi Kelulusan)
- **Tujuan:** Menyimpan surat refleksi dan rekaman audio kelulusan yang baru boleh dibuka 5 tahun mendatang.
- **Langkah Uji:**
  1. Pengguna membuka form `/tulis`.
  2. Mengisi judul: "Refleksi Kelulusan 2026", memilih kategori *Masa Depan*, dan mengisi refleksi.
  3. Memilih tanggal buka 5 tahun ke depan (`2031-10-14`).
  4. Mengunggah rekaman suara `voice_memo.mp3` (2.5 MB).
  5. Menekan tombol "Segel Kapsul Waktu".
- **Hasil:**
  - Segel berhasil dibuat, kapsul muncul di Brankas (`/vault`) dengan status `LOCKED`.
  - Percobaan membuka kapsul hanya menampilkan amplop tersegel dan hitung mundur (*countdown timer*). Isi surat dan audio tidak bocor. (Status: **PASS**)

### Persona 2: Pasangan Muda (Janji Ulang Tahun Pernikahan)
- **Tujuan:** Membuat pesan rahasia yang dibuka bersama saat anniversary.
- **Langkah Uji:**
  1. Membuat kapsul dengan tanggal buka tepat hari ini (simulasi waktu tercapai).
  2. Membuka detail kapsul melalui link brankas `/capsule/:id`.
  3. Menyaksikan transisi status dari `READY` menuju `OPENED` dengan animasi lelehan lilin segel (*wax seal melting*).
  4. Memutar audio kenangan dan mengunduh berkas lampiran melalui presigned URL S3 yang valid.
  5. Menambahkan catatan refleksi pasca-buka: "Hari ini kita membaca ini bersama sambil tersenyum."
- **Hasil:**
  - Animasi berjalan mulus 60 FPS.
  - Refleksi tersimpan rapi di bawah surat utama. (Status: **PASS**)

---

## 2. Matriks Hasil Uji UAT (UAT Test Execution Matrix)

| ID UAT | Fitur yang Diuji | Langkah Pengujian | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UAT-01** | Form Pembuatan Kapsul | Input form lengkap, validasi tanggal masa depan, estimasi ukuran file. | Form responsif, kalkulasi estimasi waktu upload akurat, validasi waktu lampau bekerja. | **PASSED** |
| **UAT-02** | Time-Lock Sealing | Verifikasi kapsul masa depan di Brankas. | Tampil dengan ikon gembok, tanggal pembukaan dalam format WIB, isi teks terproteksi. | **PASSED** |
| **UAT-03** | Wax Melting Animation | Pembukaan kapsul yang waktu `openAt`-nya telah tiba. | Animasi lelehan segel lilin berjalan tanpa lag, transisi status otomatis ke `OPENED`. | **PASSED** |
| **UAT-04** | Unduh Media Lampiran | Mengklik berkas foto/audio/dokumen pada kapsul terbuka. | Berkas dapat diunduh langsung dari S3 via presigned GET URL bertempo singkat. | **PASSED** |
| **UAT-05** | Responsivitas Mobile | Mengakses seluruh fitur dari viewport 375px (smartphone). | UI adaptif, touch-target nyaman, tidak ada overflow horizontal. | **PASSED** |
| **UAT-06** | Keamanan Data & IDOR | Percobaan manipulasi URL ID kapsul pengguna lain. | Sistem mengembalikan 404 tanpa mengekspos keberadaan ID data korban. | **PASSED** |

---

## 3. Bug Tracking Log & QA Resolutions

| ID Bug | Deskripsi Temuan Masalah | Tingkat Keparahan | Akar Masalah | Tindakan Perbaikan (Full-Stack Resolution) | Status Verifikasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-QA-01** | Parsing `backend/package.json` gagal dengan pesan `Unexpected token ﻿`. | **CRITICAL** | File tersimpan dengan karakter tersembunyi UTF-8 BOM (`\uFEFF`) dari OS Windows. | Karakter BOM dibersihkan secara bersih, skrip verifikasi JSON diaktifkan. | **VERIFIED FIXED** |
| **BUG-QA-02** | Risiko Stored XSS jika input teks kapsul disisipi payload HTML/Script jahat. | **HIGH** | Kurangnya lapisan sanitasi sebelum data disimpan ke database Prisma. | Dibuat modul `backend/src/utils/sanitize.ts` yang mensterilkan tag `<script>`, iframe, dan inline event handler. | **VERIFIED FIXED** |
| **BUG-QA-03** | Klien membuang bandwidth mengunggah file besar (>25MB) sebelum ditolak S3. | **MEDIUM** | Validasi ukuran berkas hanya ada di backend, belum ada di sisi frontend pre-flight. | Dibuat helper `src/lib/media-upload-validator.ts` untuk pre-flight validation di sisi klien. | **VERIFIED FIXED** |
| **BUG-QA-04** | Diskrepansi format status kapsul antara Backend (`LOCKED`, `UNLOCKED`) dan UI (`LOCKED`, `READY`, `OPENED`). | **HIGH** | Backend mengelola status database biner, sementara UI membutuhkan state transisi animasi. | Dibuat adapter `ApiClient.adaptBackendEnvelope` di `src/lib/api-client.ts` untuk bridging otomatis. | **VERIFIED FIXED** |
| **BUG-QA-05** | Kegagalan eksekusi test runner saat variabel lingkungan belum dimuat di test runner. | **MEDIUM** | `env.ts` melempar uncaught error jika file `.env` tidak ada saat test dijalankan. | Disediakan `backend/.env` berbasis `.env.example` serta konfigurasi default testing. | **VERIFIED FIXED** |

---

## 4. Kesimpulan QA

Aplikasi **Chronicle Seal** telah memenuhi seluruh kriteria penerimaan fungsional, keamanan, integrasi, dan performa. Tidak ditemukan bug kritis (*blocking defects*), dan sistem siap untuk tahap deployment ke server produksi.
