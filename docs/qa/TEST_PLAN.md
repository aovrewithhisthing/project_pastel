# Master Test Plan & QA Strategy: Chronicle Seal (Digital Time Capsule)

**Proyek:** Chronicle Seal - Digital Time Capsule  
**Peran:** QA Engineer & Full-Stack Support  
**Versi Dokumen:** 1.0.0  
**Tanggal:** 29 September 2026  
**Status:** Approved for QA Execution  

---

## 1. Ringkasan Eksekutif & Tujuan

Tujuan dari dokumen Test Plan ini adalah mendefinisikan strategi pengujian kualitas, keamanan, keandalan sistem, dan integrasi menyeluruh untuk aplikasi **Chronicle Seal** (Digital Time Capsule). Aplikasi ini memiliki karakteristik unik: **Time-Lock Enforced Data Access** di mana kerahasiaan pesan dan berkas multimedia dijamin tidak dapat diakses oleh siapapun—termasuk pemilik kapsul—sebelum waktu `openAt` (Waktu Indonesia Barat / UTC) tercapai.

Pengujian difokuskan pada 5 pilar utama:
1. **Fungsionalitas Inti & Siklus Hidup Kapsul**: Alur autentikasi, pembuatan kapsul, enkapsulasi data, pembukaan bertahap, dan penambahan refleksi.
2. **Keamanan Time-Lock & Access Control**: Verifikasi bahwa manipulasi jam klien tidak mempengaruhi pembukaan kapsul, proteksi IDOR horizontal privilege escalation, sanitasi XSS pada teks kenangan, dan proteksi CSRF/CORS.
3. **Integrasi Frontend-Backend**: Validasi kontrak data antara Next.js App Router dan Express API, normalisasi status kapsul (`LOCKED`, `READY`, `OPENED`).
4. **Performa & Media Upload**: Validasi ukuran media (<25MB), validasi format MIME, presigned URL S3 direct upload, dan kestabilan animasi UI (60 FPS wax melt animation).
5. **User Acceptance Testing (UAT) & Kesiapan Rilis**: Skenario persona pengguna nyata dan prosedur deployment produksi.

---

## 2. Cakupan Pengujian (Scope of Testing)

### 2.1 In-Scope
- **Modul Autentikasi**: Registrasi akun, Login, JWT access token (15 menit), refresh token httpOnly, hashing argon2id, proteksi rate-limit (auth & api).
- **Modul Kapsul & Time-Lock**:
  - Validasi waktu buka `openAt > now` di sisi server.
  - Isolasi amplop terkunci (`LockedCapsuleResponse` hanya mengekspos metadata: judul, openAt, locked: true).
  - Isolasi berkas S3: URL presigned GET tidak pernah digenerate selama status kapsul masih terkunci.
  - Transisi status otomatis ke `UNLOCKED` saat request valid dilakukan tepat pada atau setelah waktu `openAt`.
- **Modul Media Attachment (AWS S3)**:
  - Validasi whitelist MIME type (`image/*`, `video/*`, `audio/*`, `application/pdf`).
  - Pembatasan ukuran berkas (maksimal 25 MB).
  - Presigned PUT URL dengan TTL pendek (15 menit).
  - Presigned GET URL dengan TTL pendek (30 menit).
- **Modul Antrean Notifikasi (BullMQ + Redis)**:
  - Penjadwalan job email tertunda (`delay = openAt - now`).
  - Ketahanan sistem: kegagalan Redis tidak boleh menyebabkan kegagalan pembuatan kapsul (graceful degradation).
- **Responsivitas & UI/UX**:
  - Breakpoints: Mobile (375px - 414px), Tablet (768px), Desktop (1024px - 1440px+).
  - Aksesibilitas: WAI-ARIA, keyboard navigation, focus-visible rings.
  - Performa animasi: transisi leleh segel lilin (*wax seal melting animation*) tanpa frame drop.

### 2.2 Out-of-Scope
- Pengujian penetrasi infrastruktur cloud fisik AWS data center.
- Pengujian beban ekstrim (>100.000 concurrent websocket connections).

---

## 3. Matriks Skenario Pengujian (Test Scenarios Matrix)

| ID Skenario | Kategori | Deskripsi Uji | Ekspektasi Hasil | Tingkat Keparahan |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-TL-01** | Security / Time-Lock | Klien memajukan jam lokal OS 2 tahun ke depan dan meminta detail kapsul terkunci. | Backend tetap memvalidasi `new Date() < capsule.openAt` menggunakan server clock. `contentText` dan `attachments` TIDAK dikirimkan. | **CRITICAL** |
| **SEC-TL-02** | Security / Time-Lock | Request API `POST /api/capsules` dengan `openAt` waktu lampau atau sama dengan sekarang. | Backend menolak dengan status HTTP 422 Unprocessable Entity (`openAt must be a future date`). | **HIGH** |
| **SEC-TL-03** | Security / Time-Lock | User meminta kapsul setelah `openAt` server terlampaui. | Backend mengupdate status menjadi `UNLOCKED`, mengembalikan `contentText`, dan membuat presigned GET URL berdurasi singkat. | **HIGH** |
| **SEC-IDOR-01** | Security / IDOR | User B mencoba mengakses `GET /api/capsules/:id` milik User A menggunakan token valid miliknya. | Backend merespon HTTP 404 Not Found (mencegah kebocoran eksistensi data ID milik orang lain). | **CRITICAL** |
| **SEC-IDOR-02** | Security / IDOR | User B mencoba menghapus `DELETE /api/capsules/:id` milik User A. | Backend merespon HTTP 404 Not Found, row kapsul User A tetap utuh di database. | **CRITICAL** |
| **SEC-IDOR-03** | Security / IDOR | User B mencoba meminta upload URL `POST /api/capsules/:id/attachments/upload-url` pada kapsul User A. | Backend merespon HTTP 404 Not Found, upload URL tidak dibuat. | **CRITICAL** |
| **SEC-XSS-01** | Security / XSS | Input kapsul disisipi payload `<script>alert('xss')</script>` atau `<img src=x onerror=alert(1)>`. | Payload disanitasi / dieksekusi secara aman tanpa mengeksekusi script pada browser klien. | **HIGH** |
| **SEC-XSS-02** | Security / XSS | Penamaan berkas upload disisipi karakter berbahaya atau path traversal (misal: `../../evil.sh`). | `buildFileKey()` mensterilkan nama berkas hanya menjadi karakter alfanumerik `[a-zA-Z0-9._-]` dan diawali UUID acak. | **HIGH** |
| **SEC-AUTH-01** | Security / Auth | Akses endpoint privat tanpa header `Authorization: Bearer <token>`. | Backend merespon HTTP 401 Unauthorized. | **HIGH** |
| **SEC-AUTH-02** | Security / Auth | Request brute-force login >5 kali dalam rentang waktu singkat. | Rate-limiter aktif dan merespon HTTP 429 Too Many Requests. | **MEDIUM** |
| **INT-STAT-01** | Integration | Respon kapsul dengan `locked: true` diterima oleh frontend. | Frontend merender countdown timer, icon gembok, dan menyembunyikan kontainer pesan rahasia. | **HIGH** |
| **INT-STAT-02** | Integration | Respon kapsul dengan `locked: false` (baru saja terbuka). | Frontend memicu animasi pembuka segel (*melting phase*) lalu menampilkan isi teks dan media. | **HIGH** |
| **INT-STAT-03** | Integration | Koneksi API backend gagal / offline. | Frontend fallback ke mode offline / notifikasi kegagalan koneksi secara bersahabat (*graceful error boundary*). | **MEDIUM** |
| **PERF-MED-01** | Performa / Upload | Upload berkas valid berukuran 10MB (foto resolusi tinggi). | Presigned PUT URL dihasilkan <100ms, upload langsung ke S3 tanpa membebani memori Express backend. | **HIGH** |
| **PERF-MED-02** | Performa / Upload | Klien mencoba upload berkas melebihi batas 25MB (misal 50MB). | Ditolak sebelum presigned URL dibuat dengan error HTTP 422 `fileSize must be 1..26214400 bytes`. | **HIGH** |
| **PERF-MED-03** | Performa / Upload | Klien mencoba mengunggah ekstensi berbahaya `.exe` atau MIME `application/x-msdownload`. | Ditolak dengan error HTTP 422 `Unsupported fileType`. | **HIGH** |
| **UI-RESP-01** | UI / Responsif | Pengujian tampilan form pembuatan kapsul di layar mobile 375px (iPhone SE). | Tidak ada elemen meluap (*horizontal scrollbar*), input mudah disentuh, padding konsisten. | **MEDIUM** |
| **UI-A11Y-01** | UI / Aksesibilitas | Navigasi seluruh halaman menggunakan tombol `Tab` dan pembaca layar. | Focus ring terlihat jelas (`focus-visible:ring-2`), tombol memiliki `aria-label` yang representatif. | **MEDIUM** |

---

## 4. Konfigurasi Lingkungan Pengujian (Test Environments)

| Parameter | Lingkungan QA / Local Automated | Lingkungan Produksi |
| :--- | :--- | :--- |
| **OS** | Windows 11 / Linux CI | Ubuntu 24.04 LTS Container |
| **Runtime** | Node.js v24.x + tsx / npm | Node.js v20+ LTS |
| **Database** | PostgreSQL 16 (Local/Docker) | Supabase / AWS RDS PostgreSQL |
| **Storage** | MinIO / AWS S3 Mock / AWS Dev Bucket | AWS S3 Private Bucket (All Public Access Blocked) |
| **Queue** | Redis 7 (Local/In-Memory Mock) | Upstash Redis / AWS ElastiCache |
| **Frontend URL** | `http://localhost:3000` | `https://chronicle-seal.app` |
| **Backend URL** | `http://localhost:4000` | `https://api.chronicle-seal.app` |

---

## 5. Kriteria Penerimaan Kualitas (Quality Acceptance Criteria)

1. **Keamanan Time-Lock 100% Lolos**: Tidak ada celah yang memungkinkan konten kapsul terkunci dibaca sebelum `openAt`.
2. **Nol Celah IDOR**: Semua query database kapsul terikat pada kepemilikan token `userId`.
3. **Validasi Media Ketat**: Seluruh upload divalidasi MIME prefix dan ukuran berkas maksimum 25MB.
4. **Respon Cepat**: Response time endpoint API p95 < 200ms pada beban normal.
5. **Animasi Halus**: Animasi pembukaan segel berjalan stabil pada minimal 50-60 FPS tanpa jank pada perangkat mobile.
