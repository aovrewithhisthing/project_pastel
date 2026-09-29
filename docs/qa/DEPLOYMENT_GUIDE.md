# Panduan Deployment & Kesiapan Produksi (Deployment Guide)

**Proyek:** Chronicle Seal (Digital Time Capsule)  
**Lingkungan Target:** Server Produksi (Docker / AWS / VPS)  
**QA & Full-Stack Ops Guide**  

---

## 1. Arsitektur Infrastruktur Produksi

```
[ Pengguna Browser ]
        │ HTTPS (Port 443)
        ▼
[ Cloudflare / Reverse Proxy NGINX ]
   ├──> /           -> [ Frontend Next.js Standalone Container ] (Port 3000)
   └──> /api        -> [ Backend Express API Container ] (Port 4000)
                              │
            ┌─────────────────┼──────────────────┐
            ▼                 ▼                  ▼
    [ PostgreSQL 16 ]    [ Redis 7 ]      [ AWS S3 Private Bucket ]
    (Database Utama)     (BullMQ Queue)   (Berkas Terenkripsi)
                              ▲
                              │
                    [ BullMQ Worker Container ]
                    (Email Notification Dispatcher)
```

---

## 2. Checklist Variabel Lingkungan Produksi (`.env.production`)

Sebelum proses deployment, pastikan seluruh variabel berikut telah diisi dengan nilai produksi yang aman:

| Variabel | Kebutuhan | Deskripsi Keamanan |
| :--- | :--- | :--- |
| `DATABASE_URL` | WAJIB | Connection string PostgreSQL dengan SSL enabled (`sslmode=require`). |
| `JWT_ACCESS_SECRET` | WAJIB | String acak minimal 64 karakter berkekuatan kriptografis tinggi. |
| `JWT_REFRESH_SECRET`| WAJIB | String acak terpisah dari access secret (rotasi 90 hari). |
| `FRONTEND_URL` | WAJIB | Domain frontend resmi (misal: `https://chronicle-seal.app`) untuk CORS ketat. |
| `AWS_REGION` | WAJIB | Wilayah AWS S3 bucket (misal: `ap-southeast-1`). |
| `S3_BUCKET` | WAJIB | Nama bucket S3 privat dengan fitur **Block All Public Access = ON**. |
| `REDIS_URL` | WAJIB | Connection URI Redis dengan proteksi password/TLS. |
| `SMTP_HOST` & Port | WAJIB | SMTP server untuk pengiriman email notifikasi otomatis saat kapsul terbuka. |

---

## 3. Konfigurasi Bucket AWS S3 Privat

Pastikan bucket S3 dikonfigurasi dengan aturan keamanan berikut:

1. **Block Public Access**: Centang semua (Block public ACLs, ignore public ACLs, block public bucket policies).
2. **CORS Configuration**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedOrigins": ["https://chronicle-seal.app"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
3. **IAM Policy Minimum Privilege**: Role hanya membutuhkan `s3:PutObject`, `s3:GetObject`, dan `s3:DeleteObject` pada prefix `capsules/*`.

---

## 4. Langkah-Langkah Deployment Produksi

### Langkah 1: Migrasi Database
Jalankan migrasi skema Prisma ke database target:
```bash
cd backend
npx prisma migrate deploy
```

### Langkah 2: Menjalankan Container Produksi
Gunakan `docker-compose.prod.yml`:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Langkah 3: Verifikasi Layanan (Smoke Testing)
1. **Health Check API**:
   ```bash
   curl -I https://api.chronicle-seal.app/api/health
   # Ekspektasi: HTTP 200 OK dengan JSON payload { success: true }
   ```
2. **Pengawasan Worker Antrean (BullMQ)**:
   ```bash
   docker logs -f chronicle-worker
   # Ekspektasi: Terhubung ke Redis dan siap memproses job notifikasi kapsul
   ```

---

## 5. Prosedur Rollback Cepat

Jika ditemukan kegagalan pasca-deployment:
1. Kembalikan container ke image tag sebelumnya:
   ```bash
   docker compose -f docker-compose.prod.yml roll-back
   ```
2. Migrasi mundur database (jika diperlukan):
   ```bash
   npx prisma migrate diff
   ```
