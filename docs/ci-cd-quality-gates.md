# CI/CD Kalite Kapıları

Bu doküman merge/deploy öncesi zorunlu kalite kapılarını, fail-fast yaklaşımını ve branch protection kurallarını tanımlar.

## 1) Workflow Dosyaları

- PR kalite kapısı: [`.github/workflows/pr-quality-gates.yml`](../.github/workflows/pr-quality-gates.yml)
- Main release kapısı: [`.github/workflows/main-release-gates.yml`](../.github/workflows/main-release-gates.yml)
- Eski pipeline (manuel): [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

## 2) PR Pipeline (Merge Gate)

`pull_request -> main` üzerinde tek bir fail-fast job çalışır:

1. Install (`npm ci`)
2. Typecheck (`npx tsc --noEmit`)
3. Lint (`npm run lint -- --max-warnings=0`)
4. Unit/Integration test (`npm run test -- --runInBand --coverage`)

Notlar:

- Integration testler için CI içinde ephemeral PostgreSQL service ayağa kaldırılır.
- Migration’lar test DB’ye `prisma migrate deploy` ile uygulanır.

## 3) Main Pipeline (Deploy Gate)

`push -> main` üzerinde release gate job’ı çalışır:

1. Install + Prisma generate
2. Migration safety check
   - `prisma validate`
   - `prisma migrate status`
   - `prisma migrate deploy`
3. Build (`npm run build`)
4. Smoke test
   - App ayağa kaldırılır (`npm run start`)
   - `GET /api/departments` endpoint’i ile sağlık kontrolü yapılır

## 4) Fail-Fast Stratejisi

- PR pipeline adımları tek job içinde sıralıdır; ilk hata anında pipeline durur.
- `concurrency.cancel-in-progress=true` ile aynı PR için eski koşular otomatik iptal edilir.
- Main pipeline’da da aynı branch için eski koşular iptal edilir.

## 5) Artifact Saklama

Başarılı/başarısız tüm koşularda artefact yüklenir (`if: always()`):

- PR: `typecheck.log`, `lint.log`, `test.log`, `coverage/**`
- Main: `migration-*.log`, `build.log`, `app.log`

Saklama süresi: 14 gün.

## 6) Branch Protection Kuralları (GitHub)

`main` branch için önerilen zorunlu kurallar:

1. **Require a pull request before merging**
2. **Require approvals** (en az 1)
3. **Require status checks to pass before merging**
   - `quality-gates` (PR Quality Gates)
4. **Require branches to be up to date before merging**
5. **Require conversation resolution before merging**
6. **Do not allow bypassing the above settings** (admin dahil)
7. (Opsiyonel) **Restrict who can push to matching branches**

Ek öneri:

- Deploy otomasyonu sadece `main` push sonrası ve release gate başarıyla tamamlanınca tetiklenmelidir.

## 7) Başarısızlıkta Aksiyon Rehberi

### Typecheck fail

- Tip kırılımlarını düzeltin.
- `npx tsc --noEmit` lokalde yeşil olmadan PR güncellemeyin.

### Lint fail

- `npm run lint -- --max-warnings=0` çıktısındaki dosyaları düzeltin.
- Otomatik düzeltme için uygun yerde `eslint --fix` kullanın.

### Test fail

- Önce localde birebir komutla tekrarlayın.
- DB bağlantı/migration kaynaklıysa `.env` ve migration durumunu doğrulayın.
- Regresyon ise test ekleyip fix ile birlikte gönderin.

### Migration safety fail (main)

- `prisma/schema.prisma` ile migration klasörü uyumunu kontrol edin.
- Eksik migration varsa üretip PR’a dahil edin.
- Riskli migration’da rollback planı ekleyin.

### Build fail

- `npm run build` lokalde tekrar edin.
- Env bağımlı kodlar ve server-only/client-only ayrımını kontrol edin.

### Smoke test fail

- `app.log` artefact’ını inceleyin.
- Ayağa kalkmayan servis, env eksikliği veya runtime hatasını düzeltin.

## 8) Operasyonel Bağlantılar

- Operational runbook: [`docs/operational-runbook.md`](./operational-runbook.md)
- Observability runbook: [`docs/observability-telemetry-runbook.md`](./observability-telemetry-runbook.md)
