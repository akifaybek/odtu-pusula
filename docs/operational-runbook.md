# Operational Runbook

Bu doküman ODTÜ Pusula için incident yönetimi, rollback ve release süreçlerini standartlaştırır.

## 1. Amaç ve Kapsam

Kapsam:

- API, auth, DB, rate-limit, cron ve deploy akışları
- Canlı ortamda ilk müdahale ve servis geri dönüşü
- Kontrollü release ve rollback

İlgili dokümanlar:

- Observability: [`docs/observability-telemetry-runbook.md`](./observability-telemetry-runbook.md)
- Security hardening: [`docs/security-hardening-runbook.md`](./security-hardening-runbook.md)

## 2. On-call / Incident Triage

### Şiddet seviyeleri

- Sev-1: Servis tamamen down, login/review kritik akışları çalışmıyor
- Sev-2: Kısmi bozulma, hata oranı yüksek ama çekirdek akışların bir kısmı çalışıyor
- Sev-3: Düşük etkili hata, workaround mevcut

### İlk 5 dakika kontrol listesi

1. Scope belirle: Hangi endpoint/akış etkileniyor?
2. Request kimliği al: `x-request-id` / `x-correlation-id`
3. Structured log incele: `api.request.completed`, `middleware.rate_limited`
4. Telemetry snapshot al: `GET /api/admin/telemetry`
5. Etkiyi sınırla: feature flag, traffic azaltma, temporary disable

### Hızlı karar ağacı

- Hata sınıfı `db` ise:
  - DB bağlantı ve latency kontrolü
  - connection string / pooler / migration durumu
- Hata sınıfı `auth` ise:
  - NextAuth secret/url/cookie/redirect doğrula
- Hata sınıfı `rate-limit` ise:
  - politika ve eşiklerin yanlış sıkı olup olmadığını kontrol et
- Hata sınıfı `internal` ise:
  - son deploy farkları + log stack message incele

## 3. Standart Incident Prosedürü

### A) Tanı

- Zaman penceresi, etkilenen kullanıcı yüzdesi, etkilenen endpointler
- İlk root-cause hipotezi

### B) Müdahale

- Gerekirse write path’i geçici kapat
- Sorunlu config değişkenini geri al
- Hızlı patch gerekiyorsa küçük ve hedefli PR

### C) Doğrulama

- Error rate düşüşü
- p95 normalleşmesi
- Kritik akış smoke testleri

### D) Kapanış

- Incident notu: root cause, action items, owners
- En fazla 24 saat içinde postmortem taslağı

## 4. Rollback Runbook

### Ne zaman rollback?

- Sev-1 / Sev-2’de yeni deploy ile korelasyon güçlü ise
- Hotfix riskli veya belirsizse

### Rollback adımları

1. Son stabil deploy’u belirle.
2. Platformdan önceki release’e dön.
3. Ortam değişkenlerinde son değişiklikleri geri al.
4. Migration etkisi varsa:
   - veri kaybı riski analizi yap
   - gerekiyorsa read-only veya bakım modu planla
5. Smoke test:
   - login/register
   - course/professor list
   - review create/like
   - admin/telemetry
6. Incident kanalında “rollback completed” duyur.

## 5. Release Checklist

### Pre-release

- [ ] PR onayı + kritik dosyalarda ikinci göz
- [ ] `npm run lint -- --max-warnings=0`
- [ ] `npm test -- --runInBand`
- [ ] migration gereksinimi doğrulandı
- [ ] `.env.production` değişkenleri kontrol edildi

### Release

- [ ] deploy tetiklendi
- [ ] migration production’da güvenli şekilde uygulandı (`npm run db:migrate:prod`)
- [ ] cron endpoint kontrol edildi (`/api/cron/cleanup-tokens`)

### Post-release (10-15 dk)

- [ ] 5xx oranı normal
- [ ] p95 latency normal
- [ ] auth akışları sağlıklı
- [ ] admin/telemetry endpoint erişimi sağlıklı

## 6. Operasyonel Komut Referansı

```bash
npm run lint -- --max-warnings=0
npm test -- --runInBand
npm run build
npm run db:migrate:prod
npm run start
```

Script detayları: [`package.json`](../package.json)
