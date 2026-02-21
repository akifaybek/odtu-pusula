# Release Stabilization Sprint Planı (1 Hafta)

Bu plan, release öncesi stabilizasyonu 5 iş gününde tamamlamak için hazırlanmıştır.

## Gün 1-2 — DB Drift + Kritik API Stabilizasyonu

### Yapılacak işler
- Prisma şema ve DB state karşılaştırması (drift analizi).
- Migration doğrulama (`prisma migrate status`, migration geçmişi tutarlılığı).
- Kritik endpoint smoke matrisi çıkarımı:
  - `POST /api/auth/register`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/send-verification`
  - `POST /api/courses/[code]/reviews`
  - `POST /api/professors/[id]/reviews`
  - `POST /api/reviews/[id]/like`
- DB bağımlı integration testlerin çevre bağımlılığı netleştirmesi (Supabase erişim/secret/network).
- Timeout/retry sınırlarının kritik akışlarda gözden geçirilmesi.

### Sorumlu rol
- **Backend Lead** (owner)
- **DBA/Platform Engineer** (co-owner)
- **QA Engineer** (doğrulama)

### Risk
- Supabase erişim problemi nedeniyle gerçek integration doğrulaması bloke olabilir.
- Drift düzeltmesi sırasında veri kaybı riski (özellikle destructive migration).

### Çıkış kriteri
- Drift analizi raporu yayınlanmış olmalı.
- Kritik endpoint smoke matrisi tamamlanmış olmalı.
- DB erişim engelleri ve aksiyon planı yazılı olmalı.

---

## Gün 3 — Lint Error Sıfırlama

### Yapılacak işler
- Tüm kod tabanında lint temizliği.
- Yeni eklenen rate-limit mimari dosyaları/testleri için lint doğrulaması.
- CI lint adımının release branch’te zorunlu kapı olarak teyidi.

### Sorumlu rol
- **Frontend Lead** + **Backend Lead** (shared)
- **Release Engineer** (CI gate)

### Risk
- Hızlı düzeltmelerde davranış değişikliği riski.

### Çıkış kriteri
- `npm run lint` exit code `0`.
- CI lint stage yeşil.

---

## Gün 4 — Test Kırıklarını Kapatma

### Yapılacak işler
- Kırık suite analizi (unit/integration ayrımı).
- DB erişimi kaynaklı fail’leri kod hatasından ayrıştırma.
- Deterministik olmayan testlerin stabilizasyonu.
- Kritik middleware/rate-limit test setinin release gating’e alınması.

### Sorumlu rol
- **QA Automation Engineer** (owner)
- **Backend Engineer** (fix support)

### Risk
- Çevresel bağımlılıklar (DB/network) yanlış pozitif/negatif üretebilir.

### Çıkış kriteri
- Code-related fail kalmamalı.
- Environment-related fail’ler açıkça etiketlenmeli ve runbook’a eklenmeli.

---

## Gün 5 — Güvenlik + Observability + Dokümantasyon Kapanış

### Yapılacak işler
- Rate-limit, auth ve review akışlarında güvenlik kontrollerinin checklist üzerinden kapanışı.
- Request/Correlation ID ve rate-limit olay loglarının doğrulanması.
- Operasyonel runbook güncellemesi (incident triage, fallback davranışı).
- Sprint kapanış KPI raporunun yayınlanması.

### Sorumlu rol
- **Security Engineer** (owner)
- **SRE/Platform Engineer** (observability)
- **Tech Lead** (final sign-off)

### Risk
- KPI’ların prod telemetry yerine test verisine dayanması karar kalitesini düşürebilir.

### Çıkış kriteri
- Güvenlik checklist tamam.
- Observability sinyalleri doğrulanmış.
- Dokümantasyon güncel ve erişilebilir.

---

## Sprint Sonu Ölçülebilir KPI Raporu

Ölçüm kaynakları:
- Lint: `npm run lint`
- Test: `npm test -- --runInBand --json --outputFile=.artifacts/jest-results.json`
- Hata analizi: `.artifacts/test.out` + jest JSON

### 1) Lint sonucu
- **Durum:** ✅ Başarılı
- **Metrik:** exit code `0`

### 2) Test pass oranı
- **Toplam test:** `99`
- **Geçen:** `93`
- **Kalan fail:** `6`
- **Pass oranı:** **`93.94%`**

### 3) Kritik endpoint hata oranı
Kritik endpointleri doğrulayan DB-bağımlı integration suite’ler:
- `__tests__/api/courses.integration.test.ts` → failed (`3/3`)
- `__tests__/api/reviews.integration.test.ts` → failed (`3/3`)

- **Kritik endpoint test hata oranı (integration):** `6 / 6 = 100%`
- **Kök neden:** Supabase DB erişim hatası (`db.xkbhxwxdngjpxlzfcqtr.supabase.co:5432` bağlantı kurulamıyor), kod regresyonu değil.

---

## Uygulama Notu (Bu sprintte gerçekleştirilenler)
- Rate-limit mimari birleştirme tamamlandı (tek kural tablosu, katman sahipliği, fallback, header standardı).
- Middleware ve route-level çakışan limit uygulamaları ayrıştırıldı.
- Mimari ve enforcement testleri eklendi ve geçti.
- Kapanış KPI ölçümü üretildi ve dokümante edildi.
