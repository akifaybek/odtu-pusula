# Contributing Guide

ODTÜ Pusula’ya katkı verdiğiniz için teşekkürler.

Bu rehber, geliştirme sürecini tutarlı ve güvenli yürütmek için minimum standartları tanımlar.

## 1) Geliştirme Ortamı Kurulumu

1. Repository’yi klonlayın.
2. Bağımlılıkları kurun:

```bash
npm install
```

3. Ortam değişkenlerini hazırlayın:

```bash
cp .env.example .env
```

4. Veritabanı hazırlığı:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Uygulamayı başlatın:

```bash
npm run dev
```

## 2) Branch Stratejisi

Önerilen branch isimleri:

- `feat/<kisa-aciklama>`
- `fix/<kisa-aciklama>`
- `docs/<kisa-aciklama>`
- `refactor/<kisa-aciklama>`

## 3) Kodlama ve Kalite Kuralları

- TypeScript tip güvenliğini koruyun.
- API route’larında standart hata formatını kullanın.
- Prisma sorgularında mümkünse `select` odaklı yaklaşım tercih edin.
- Yeni API değişikliklerinde observability zincirini (request/correlation id + structured log) bozmayın.

### Commit öncesi minimum kontrol

```bash
npm run lint -- --max-warnings=0
npm test -- --runInBand
```

## 4) Test Beklentisi

- Yeni özellikte en az birim test veya entegrasyon testi ekleyin.
- Hata düzeltmelerinde regresyon testi ekleyin.
- E2E kapsamı gerekiyorsa `npm run test:e2e` çalıştırın.

## 5) Pull Request Rehberi

PR açıklamasında şunlar bulunmalı:

- Amaç / kapsam
- Teknik yaklaşım
- Risk analizi
- Test çıktıları
- Gerekirse migration notu

Küçük ve odaklı PR’lar tercih edilir.

## 6) Dokümantasyon Politikası

Aşağıdaki değişikliklerde doküman güncellemesi zorunludur:

- Yeni env değişkeni
- Yeni API endpoint’i
- Güvenlik/operasyon akışı değişikliği

Güncellenmesi gereken başlıca dosyalar:

- [`README.md`](./README.md)
- [`docs/operational-runbook.md`](./docs/operational-runbook.md)
- [`docs/observability-telemetry-runbook.md`](./docs/observability-telemetry-runbook.md)
- [`SECURITY.md`](./SECURITY.md)

## 7) Davranış Kuralları

Topluluk davranışı için: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
