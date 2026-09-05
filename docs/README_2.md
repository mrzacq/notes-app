Lanjutan dari tugas pertama (lihat [README.md](./README.md)), tugas ini fokus nambahin quality gate ke pipeline CI yang sudah ada: lint, unit test dengan coverage, SonarQube Scan, dan k6 smoke test. Semua job ditambahkan ke workflow `.github/workflows/ci.yml` yang sama, jadi satu pipeline CI ini sekarang mencakup dua tugas sekaligus.

Karena soal aslinya nyebut ESLint dan Jest, tapi project Notes App ini dari awal sudah pakai **oxlint** dan **vitest** (bukan ESLint/Jest), aku sesuaikan job-nya pakai tooling yang memang sudah dipakai di project, bukan nambah tooling baru cuma buat ngikutin nama di soal. Prinsipnya tetap sama: job lint terpisah yang harus bersih tanpa error, dan job unit test yang menghasilkan laporan coverage.

## Job yang ditambahkan

- **lint** — jalanin `npm run lint` (oxlint dengan config di `oxlint.json`). Semua rule di project ini levelnya warning, jadi job hijau selama tidak ada error.
- **unit_test** — sekarang jalanin `npm run test:cov` (vitest + `@vitest/coverage-v8`) supaya laporan coverage ikut muncul di log, dan diupload sebagai artifact `coverage/` (termasuk `lcov.info`) buat dipakai job SonarQube.
- **sonarqube_scan** — jalan setelah `unit_test`, download artifact coverage, lalu scan pakai `sonarsource/sonarqube-scan-action` dengan `SONAR_TOKEN` dan `SONAR_HOST_URL` dari secrets. Konfigurasi project ada di [sonar-project.properties](../sonar-project.properties), termasuk path ke `coverage/lcov.info` biar Sonar baca coverage-nya juga.
- **k6_smoke_test** — build project, jalanin hasil build (`node dist/main.js`) di background, tunggu sampai endpoint `/notes` merespons pakai retry loop `curl`, baru jalanin `loadtest/script.js`. Script-nya smoke test simpel: `GET /notes` dan `POST /notes`, dengan threshold `http_req_failed < 1%` dan `p(95) < 300ms`. k6-nya di-install lewat `grafana/setup-k6-action` (bukan `grafana/k6-action`) — lihat catatan di bagian tantangan.

Job `build_and_push` juga aku update `needs`-nya supaya ikut nunggu job `lint` lulus, biar image cuma dibangun kalau kode sudah lolos lint juga (selain unit test, SAST, SCA, dan secret scan seperti sebelumnya).

## Command yang sering dipakai

Lint dan test dengan coverage (sama seperti yang jalan di job `lint` dan `unit_test`):

```bash
npm run lint          # oxlint, harus bersih dari error
npm run test:cov      # vitest + coverage, hasilin coverage/lcov.info
```

SonarQube Scan lokal (opsional, buat cek sebelum push). Karena repo ini public, CI scan-nya diarahkan ke **SonarCloud** (`sonar.host.url` default-nya memang `https://sonarcloud.io`, gratis buat repo public) dengan `sonar.organization=mrzacq` di [sonar-project.properties](../sonar-project.properties) — jadi nggak perlu hosting SonarQube sendiri. Buat scan dari lokal ke project SonarCloud yang sama:

1. Generate token di SonarCloud: **My Account → Security → Generate Token**.
2. Generate coverage dan jalanin scanner:

```bash
npm run test:cov      # hasilin coverage/lcov.info, dibaca lewat sonar-project.properties

# pakai sonar-scanner yang ter-install lokal (brew install sonar-scanner)
sonar-scanner \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=<TOKEN_DARI_SONARCLOUD>

# atau tanpa install, pakai image Docker resmi
docker run --rm -v "$(pwd):/usr/src" \
  -e SONAR_HOST_URL=https://sonarcloud.io \
  -e SONAR_TOKEN=<TOKEN_DARI_SONARCLOUD> \
  sonarsource/sonar-scanner-cli
```

Hasil scan bisa dilihat di `https://sonarcloud.io/project/overview?id=notes-app&organization=mrzacq`.

Kalau mau coba tanpa nyentuh project SonarCloud yang asli (misal buat eksperimen konfigurasi), masih bisa jalanin SonarQube Community Edition sendiri lewat Docker (`docker run -d --name sonarqube -p 9000:9000 sonarqube:community`, generate token dari `http://localhost:9000`), tapi itu butuh `sonar.host.url=http://localhost:9000` dan **hapus** `sonar.organization` dari argumen scan (properti itu cuma dikenal SonarCloud, bukan SonarQube self-hosted).

k6 smoke test lokal (perlu k6 ter-install, misal `brew install k6`, dan app-nya sudah jalan di `localhost:3000`):

```bash
npm run build
node dist/main.js &          # jalanin app di background
k6 run loadtest/script.js    # BASE_URL default http://localhost:3000

# kalau app-nya jalan di host/port lain:
BASE_URL=http://localhost:4000 k6 run loadtest/script.js
```

## Insight & tantangan

Insight yang paling kerasa: soal template kayak gini biasanya ditulis generik (ESLint, Jest) padahal stack tiap project bisa beda. Yang penting bukan nama tool-nya persis sama, tapi tujuannya tercapai — ada gate lint yang bersih dan ada laporan coverage dari unit test yang jalan di CI.

Tantangannya ada di dua bagian. Pertama, SonarQube butuh laporan coverage dalam format lcov, sedangkan default vitest cuma nampilin coverage di terminal (reporter `text`). Solusinya nambahin reporter `lcov` di `vitest.config.ts` biar file `coverage/lcov.info` ikut ke-generate, terus dioper ke job Sonar lewat `actions/upload-artifact` dan `actions/download-artifact` biar nggak perlu run test dua kali.

Kedua, buat k6 smoke test di CI, app-nya harus jalan dulu sebelum k6 bisa nembak endpoint-nya. Karena start app itu proses async (butuh waktu boot NestJS), aku pakai retry loop `curl` sederhana daripada nambah dependency baru (misalnya `wait-on`) cuma buat nunggu port siap — biar nggak nambah beban dependency yang harus diaudit juga.

Hal yang paling nggak kesangka: awalnya aku pakai action `grafana/k6-action` buat jalanin k6 di job `k6_smoke_test`, hasilnya semua request `connection refused` walau di lokal script yang sama jalan mulus. Ternyata `grafana/k6-action` itu **Docker container action** — k6-nya jalan di container terisolasi sendiri, jadi `localhost:3000` di dalam container itu bukan network yang sama dengan runner tempat `node dist/main.js` jalan. Fix-nya ganti ke `grafana/setup-k6-action`, yang cuma install binary k6 langsung di runner, terus `k6 run` dijalanin sebagai step biasa (bukan container action) — jadi k6 dan app-nya share network yang sama persis kayak pas ditest manual di lokal.

Ketiga, pas pertama kali coba scan ke SonarCloud, dapat error `You must define the following mandatory properties for 'notes-app': sonar.organization`. Ternyata SonarCloud (beda dengan SonarQube self-hosted) mewajibkan properti `sonar.organization` buat tahu project itu di bawah organisasi/akun mana — SonarQube server sendiri nggak punya konsep ini. Solusinya tinggal tambah `sonar.organization=mrzacq` di `sonar-project.properties`, diambil dari org key yang ditampilkan di dashboard SonarCloud.
