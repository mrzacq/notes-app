Buatkan Notes app simpel menggunakan nestjs typscript

Bagian A — Workflow per Job (GitHub Actions)
Buat workflow per job dengan minimal job berikut:
1. Unit Test (pytest)
2. SAST (Bandit)
3. SCA (pip-audit)
4. Secret Scan (Gitleaks)
5. Build & Push Docker Image → Docker Hub
6. Image Scan (Trivy) dari Docker Hub
Ketentuan:
 Job build_and_push hanya berjalan jika semua job security (test, SAST, SCA, secret scan) lulus
(needs: [...]).
 Gunakan secrets DOCKERHUB_USERNAME dan DOCKERHUB_TOKEN.
 Tag image minimal: :latest dan :<commit-sha>.
Bagian B — Perbaikan Dependency
 Update requirements.txt dan dev-requirements.txt agar pip-audit tidak menemukan
vulnerability (pipeline harus hijau tanpa || true atau --ignore-vuln).
📝 Metode Pengumpulan
Kumpulkan hasil tugas dengan format berikut:
1. Link GitHub Repository (Public)
o Repo berisi kode Notes App + folder .github/workflows/ci.yml.
o Minimal satu workflow run sukses yang dapat diverifikasi pada tab Actions.
2. Link Docker Hub Repository (Public)
o Berisi image yang dipush dari workflow di atas.
o Harus terlihat tag latest dan minimal satu tag commit SHA.
3. Penjelasan singkat
o Insight atau pemahaman baru yang diperoleh.
o Tantangan yang dihadapi saat membuat workflow & memperbaiki dependencies.
o Hal menarik atau penting yang ditemukan selama mengerjakan tugas ini.
🎯 Tugas ditolak jika:
 Repository private / tidak ada workflow run sukses.
 Docker Hub private atau kosong.
 Workflow tidak per job.
 Masih ada vulnerability di audit atau security step di-bypass.
 Tidak ada link valid atau penjelasan singkat.