# ODTÜ Pusula

ODTÜ öğrencileri için ders ve hoca değerlendirme platformu. Kullanıcılar ders/hoca yorumları paylaşabilir, beğeni ve raporlama akışlarını kullanabilir, yönetim tarafı moderasyon ve istatistik panelleriyle sistemi yönetebilir.

## İçindekiler

- [Teknoloji Yığını](#teknoloji-yığını)
- [Mimari Genel Bakış](#mimari-genel-bakış)
- [Hızlı Başlangıç (30 dk)](#hızlı-başlangıç-30-dk)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Veritabanı: Migrate / Seed](#veritabanı-migrate--seed)
- [Test ve Kod Kalitesi](#test-ve-kod-kalitesi)
- [Çalıştırma Komutları](#çalıştırma-komutları)
- [Deploy Notları](#deploy-notları)
- [Operasyon ve Güvenlik Dokümanları](#operasyon-ve-güvenlik-dokümanları)

## Teknoloji Yığını

- Framework: Next.js (App Router)
- Dil: TypeScript
- Veritabanı: PostgreSQL (Prisma ORM)
- Kimlik doğrulama: NextAuth
- Rate limiting: Upstash Redis (geliştirmede in-memory fallback)
- Test: Jest + Playwright
- Lint: ESLint

Script referansı: [`package.json`](./package.json)

## Mimari Genel Bakış

### Uygulama Katmanları

- UI ve sayfalar: [`src/app`](./src/app)
- API route’ları: [`src/app/api`](./src/app/api)
- Çekirdek yardımcılar (auth, rate limit, observability): [`src/lib`](./src/lib)
- Middleware ve request policy: [`src/middleware.ts`](./src/middleware.ts)
- Şema ve migration yönetimi: [`prisma/schema.prisma`](./prisma/schema.prisma)
- Seed verisi: [`prisma/seed.ts`](./prisma/seed.ts)

### Veri Modeli (özet)

Başlıca varlıklar:

- User, Department
- Course, Professor, CourseProfessor
- CourseReview, ProfessorReview
- ReviewLike, Report, Suggestion
- Auth token modelleri (Session, Account, VerificationToken vb.)

Detay: [`prisma/schema.prisma`](./prisma/schema.prisma)

### Operasyonel Standartlar

- API hata formatı: `errorCode`, `message`, `context`
- Güvenlik sertleştirme: CSP, auth cookie/redirect, merkezi rate-limit policy
- Gözlemlenebilirlik: request/correlation id, structured log, hata sınıfları, telemetry snapshot

## Hızlı Başlangıç (30 dk)

### 1) Önkoşullar

- Node.js 20+
- npm 10+
- PostgreSQL erişimi (ör. Supabase)

### 2) Kurulum

```bash
npm install
```

### 3) Ortam dosyasını oluştur

```bash
cp .env.example .env
```

Sonra `.env` içindeki kritik alanları doldurun:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Referans: [`.env.example`](./.env.example)

### 4) Prisma client + migration + seed

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed sonunda varsayılan kullanıcılar:

- `admin@metu.edu.tr` / `Admin123!`
- `test@metu.edu.tr` / `Test1234!`

(Kimlik bilgilerini geliştirme dışında kullanmayın.)

### 5) Uygulamayı başlat

```bash
npm run dev
```

Tarayıcı: `http://localhost:3000`

## Ortam Değişkenleri

Tüm değişkenler için örnek dosyalar:

- Geliştirme: [`.env.example`](./.env.example)
- Production: [`.env.production.example`](./.env.production.example)

### Minimum local set

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET`

### Opsiyonel ama önerilen

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

## Veritabanı: Migrate / Seed

Kullanılan komutlar:

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:migrate:prod
npm run db:reset
npm run db:seed
npm run db:studio
```

Notlar:

- Local geliştirmede `db:migrate` tercih edilir.
- Production’da yalnızca `db:migrate:prod` kullanın.
- `db:reset` tüm veriyi sıfırlar (yalnızca local/dev).

## Test ve Kod Kalitesi

```bash
npm run lint -- --max-warnings=0
npm test -- --runInBand
npm run test:coverage
npm run test:e2e
```

Testler dış DB erişimi gerektirir; bağlantı problemi yaşanırsa integration testleri başarısız olabilir.

## Çalıştırma Komutları

Temel komutlar:

```bash
npm run dev
npm run build
npm run start
```

Tüm scriptler: [`package.json`](./package.json)

## Deploy Notları

### Vercel

Bu proje Vercel cron konfigürasyonu içerir:

- [`vercel.json`](./vercel.json) içinde `/api/cron/cleanup-tokens` günlük çalışır.

### Production checklist (özet)

1. Vercel Environment Variables tanımla.
2. `DATABASE_URL` ve `DIRECT_URL` doğrula.
3. `NEXTAUTH_URL` ve `NEXTAUTH_SECRET` doğrula.
4. Gerekli ise SMTP/Upstash değerlerini gir.
5. Deploy sonrası migration uygula (`npm run db:migrate:prod`).
6. Smoke test: auth, review create, admin ekranları, telemetry endpoint.

Detaylı operasyon akışları: [`docs/operational-runbook.md`](./docs/operational-runbook.md)

## Operasyon ve Güvenlik Dokümanları

- Operasyon runbook: [`docs/operational-runbook.md`](./docs/operational-runbook.md)
- Observability runbook: [`docs/observability-telemetry-runbook.md`](./docs/observability-telemetry-runbook.md)
- Security hardening: [`docs/security-hardening-runbook.md`](./docs/security-hardening-runbook.md)
- Katkı rehberi: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Güvenlik politikası: [`SECURITY.md`](./SECURITY.md)
