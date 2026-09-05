Catatan pengerjaan tugas Notes App + CI/CD. File ini cuma buat referensi pribadi, nggak ikut ke-push ke repo public (lihat `.gitignore`).

## Todo

- [x] Notes app NestJS + TypeScript, Node 24, CRUD in-memory dengan validasi input
- [x] Unit test (vitest) untuk service dan controller
- [x] Lint (oxlint) dengan rule no-console, no-undef, no-unused-vars sebagai warning
- [x] Dockerfile multi-stage, image bersih dari vulnerability HIGH/CRITICAL (Trivy)
- [x] Workflow per job: unit_test, sast, sca, secret_scan, build_and_push, image_scan
- [x] build_and_push pakai `needs: [...]` supaya cuma jalan kalau semua job security lulus
- [x] Tag image `latest` dan `<commit-sha>`
- [x] npm audit bersih tanpa flag ignore
- [ ] Tambah secrets `DOCKERHUB_USERNAME` dan `DOCKERHUB_TOKEN` di GitHub repo
- [ ] Pastikan repo GitHub dan Docker Hub public
- [ ] Push dan cek minimal satu workflow run sukses di tab Actions
- [ ] Submit link repo, link Docker Hub, dan penjelasan singkat (isi README.md di root)

## Command yang sering dipakai

Development:

```bash
npm run start:dev     # jalanin app mode watch
npm run build         # compile ke dist/
npm run start:prod    # jalanin hasil build
```

Test dan lint:

```bash
npm run test          # unit test (vitest)
npm run test:cov      # unit test + coverage
npm run test:e2e      # e2e test
npm run lint          # oxlint pakai config oxlint.json
npm run format        # rapikan format pakai prettier
```

Docker:

```bash
docker build -t notes-app:local .
docker run -p 3000:3000 notes-app:local
```

Kalau docker daemon belum jalan (pakai colima):

```bash
colima start
colima stop
```

Security scan lokal (opsional, buat cek sebelum push):

```bash
npm audit
docker run --rm -v "$(pwd):/repo" zricethezav/gitleaks:latest detect --source=/repo --no-git -v
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity CRITICAL,HIGH notes-app:local
```
