Bagian A — Workflow per Job (GitHub Actions)
Buat workflow .github/workflows/ci.yml sesuai contoh yang sudah ada, dengan minimal job berikut:
1. Lint (ESLint)
2. Unit Test (Jest)
3. SonarQube Scan (action bawaan di workflow)
4. k6 Smoke Test (opsional — boleh dijalankan di lokal atau di GitHub Actions)
Ketentuan:
 Semua job dibuat per job (bukan satu script panjang).
 Pastikan job lint tidak ada error (perbaiki semua issue ESLint).
 Pastikan job unit test lulus dengan coverage muncul.
 Pastikan job SonarQube Scan berhasil (gunakan SONAR_HOST_URL dan SONAR_TOKEN dari secrets).
 Untuk k6 boleh dijalankan di lokal atau di CI, asalkan ada screenshot hasilnya.
Bagian B — Perbaikan Dependency & Lint
 Rapikan ESLint hingga tidak ada error.
 Update dependency agar pipeline hijau (tidak ada vulnerability).
 Tidak boleh ada bypass step (|| true, --force, dll).
📝 Metode Pengumpulan
Kumpulkan hasil tugas dengan format berikut:
1. Link GitHub Repository (Public)
o Berisi Notes App + .github/workflows/ci.yml.
o Minimal ada 1 workflow run sukses di tab Actions.
2. Screenshot SonarQube
o Tampilan hasil scan project kalian.
3. Screenshot Output k6
o Bisa dari hasil run lokal (k6 run loadtest/script.js) atau dari GitHub Actions.
4. Penjelasan singkat (1–2 paragraf)
o Insight atau pemahaman baru.
o Tantangan saat membuat workflow & memperbaiki dependencies/lint.
o Hal menarik atau penting yang ditemukan.
📝 Tugas ditolak jika:
 Repository private / tidak ada workflow run sukses.
 Workflow tidak dibuat per job.
 Masih ada vulnerability atau error ESLint.
 Step security di-bypass.
 Tidak ada link valid atau screenshot SonarQube/k6.
 Tidak ada penjelasan singkat.