# Notes App CI/CD Pipeline

Notes App sederhana berbasis NestJS + TypeScript, dilengkapi pipeline CI/CD dengan CI Actions yang mencakup unit test, SAST, SCA, secret scan, build & push Docker image, serta image scanning.

## 1. Setup Proyek NestJS

```bash
npm i -g @nestjs/cli
nest new notes-app
cd notes-app
nest g resource notes
```

Pilih package manager npm saat prompt muncul. Implementasikan CRUD sederhana pada module `notes` (create, findAll, findOne, update, remove), gunakan in-memory array atau SQLite via TypeORM agar mudah dites tanpa dependency eksternal tambahan.

## 2. Tambahkan Unit Test

Gunakan Jest yang sudah bawaan NestJS.

```bash
npm run test
```

Tulis test minimal untuk service dan controller notes di `notes.service.spec.ts` dan `notes.controller.spec.ts`. Pastikan semua test hijau sebelum lanjut ke tahap berikutnya.

## 3. Siapkan Dockerfile

Buat `Dockerfile` multi-stage di root project:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
```

Uji build image secara lokal dulu sebelum masuk ke workflow:

```bash
docker build -t notes-app:local .
docker run -p 3000:3000 notes-app:local
```

## 4. Buat Secrets di GitHub Repository

Masuk ke Settings > Secrets and variables > Actions, tambahkan:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` (buat dari Docker Hub > Account Settings > Security > New Access Token)

## 5. Susun Workflow per Job

Buat file `.github/workflows/ci.yml` dengan job terpisah berikut:

1. `unit_test` menjalankan `npm run test`
2. `sast` menjalankan static analysis, misal Semgrep atau ESLint plugin security terhadap kode TypeScript
3. `sca` menjalankan `npm audit` untuk memeriksa vulnerability pada dependency
4. `secret_scan` menjalankan Gitleaks untuk memeriksa kebocoran secret di kode
5. `build_and_push` yang hanya berjalan jika keempat job di atas lulus, build image dengan tag `latest` dan tag commit SHA, lalu push ke Docker Hub
6. `image_scan` menjalankan Trivy terhadap image yang baru dipush dari Docker Hub

Gunakan `needs: [unit_test, sast, sca, secret_scan]` pada job `build_and_push` agar job build hanya jalan setelah semua job security lulus. Gunakan `${{ github.sha }}` untuk tag commit SHA dan login ke Docker Hub dengan action `docker/login-action` memakai secrets yang sudah dibuat.

## 6. Perbaiki Dependency agar Audit Bersih

Jalankan audit secara lokal untuk melihat vulnerability yang ada:

```bash
npm audit
```

Update versi package di `package.json` yang bermasalah ke versi aman, lalu jalankan ulang `npm install` dan `npm audit` sampai hasilnya bersih tanpa perlu flag `--force` atau pengecualian apa pun. Jangan gunakan `|| true` atau flag ignore pada step audit di workflow, pipeline harus benar-benar hijau karena dependency sudah aman.

## 7. Jalankan dan Verifikasi Workflow

Push semua perubahan ke branch main, lalu cek tab Actions di GitHub untuk memastikan seluruh job berjalan dan lulus. Setelah sukses, buka Docker Hub repository untuk memastikan tag `latest` dan tag commit SHA sudah muncul.

## 8. Pastikan Repository Publik

Ubah visibility repository GitHub dan Docker Hub repository menjadi public agar bisa diverifikasi oleh reviewer, karena repo atau image yang private membuat tugas ditolak.

## 9. Susun Penjelasan Singkat

Setelah semua langkah selesai, tulis ringkasan singkat berisi:

- Insight atau pemahaman baru yang didapat selama mengerjakan pipeline ini
- Tantangan yang dihadapi saat menyusun workflow per job atau saat memperbaiki dependency
- Hal menarik atau penting yang ditemukan selama proses pengerjaan

## 10. Kumpulkan Hasil

Siapkan tiga hal berikut untuk dikumpulkan:

1. Link repository GitHub (public) yang berisi kode Notes App, file `.github/workflows/ci.yml`, dan minimal satu workflow run yang sukses di tab Actions
2. Link Docker Hub repository (public) yang menampilkan tag `latest` dan minimal satu tag commit SHA
3. Penjelasan singkat sesuai poin 9 di atas
