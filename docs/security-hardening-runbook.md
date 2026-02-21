# Güvenlik Sertleştirme Runbook (CSP/Auth/Rate Limit)

## Kapsam

Bu runbook, [`next.config.ts`](../next.config.ts), [`src/lib/auth.ts`](../src/lib/auth.ts), [`src/lib/rate-limit.ts`](../src/lib/rate-limit.ts) ve [`src/middleware.ts`](../src/middleware.ts) üzerinden yapılan sertleştirmeyi ve operasyonel kullanımını tanımlar.

---

## 1) Risk Dereceli Bulgular

### High

1. **CSP içinde geniş script izni (`unsafe-eval`, `unsafe-inline`)**
   - XSS etkisini büyütebilir.
   - Durum: `production` için `unsafe-eval` kaldırıldı, `report-only` ile daha sıkı profile geçiş takibi eklendi.

2. **Middleware ve API katmanında parçalı rate-limit stratejisi**
   - Farklı kural setleri bypass ve bakım riski üretir.
   - Durum: middleware, merkezi policy seçimi ile [`getRateLimitPolicy()`](../src/lib/rate-limit.ts) ve [`rateLimiters`](../src/lib/rate-limit.ts) kullanacak şekilde birleştirildi.

### Medium

1. **Auth redirect yüzeyinde açık yönlendirme riski**
   - Yanlış callback URL akışı phishing vektörü oluşturabilir.
   - Durum: yalnızca internal/same-origin redirect’e izin veren kontrol eklendi.

2. **Session/cookie güvenlik bayraklarının ortam bazlı sıkılığı**
   - Prod’da host-only ve secure cookie zorunluluğu kritik.
   - Durum: prod session cookie adı `__Host-` prefix ile sıkılaştırıldı.

### Low

1. **Abuse senaryoları için merkezi operasyon dokümanı eksikliği**
   - Olay anında müdahaleyi yavaşlatır.
   - Durum: bu runbook ve kontrol listesi eklendi.

### Critical

- Bu turda doğrudan **Critical** seviye, anında exploit kanıtlı bulgu tespit edilmedi.

---

## 2) Hızlı Kazanımlar (Quick Wins)

1. `production` CSP’den `unsafe-eval` kaldır.
2. `Content-Security-Policy-Report-Only` başlığıyla sıkı policy ihlallerini topla.
3. Auth callback redirect’i same-origin ile sınırla.
4. Middleware’de tek rate-limit karar noktasına geç.
5. Rate limit anahtarlarını endpoint türüne göre normalize et (`auth`, `email`, `review`, `like`, `api`).

---

## 3) Uzun Vadeli Plan

1. **CSP nonce/hash mimarisi**
   - `unsafe-inline` kaldırma için style/script nonce veya hash yaklaşımına geç.
2. **Raporlama hattı**
   - CSP report endpoint + SIEM/alerting.
3. **Auth güçlendirme**
   - Şüpheli girişlerde step-up doğrulama (opsiyonel MFA / device risk scoring).
4. **Adaptive rate-limit**
   - IP reputation + user davranışı + endpoint ağırlıklı dinamik limit.
5. **Abuse telemetry**
   - flood/spam/brute-force için dashboard ve otomatik aksiyonlar.

---

## 4) Abuse Kontrol Listesi

### Brute-force (login/register/reset)
- [ ] Auth endpointlerinde düşük eşik (ör. 5/15m) aktif.
- [ ] Başarısız auth denemeleri loglanıyor.
- [ ] Aynı IP / aynı hesap için artan risk skoru üretiliyor.
- [ ] Hesap kilidi veya cooldown stratejisi tanımlı.

### Spam review
- [ ] Review create endpointlerinde kullanıcı bazlı limit aktif.
- [ ] Aynı kaynak için duplicate kontrolü aktif.
- [ ] İçerik kalitesi/moderasyon eşiği (uzunluk, tekrar, link spam) tanımlı.

### Endpoint flood
- [ ] Tüm `/api/*` için genel limit aktif.
- [ ] 429 yanıtları standart formatta dönüyor.
- [ ] `X-RateLimit-*` başlıkları gözlemlenebilir.
- [ ] Redis kesintisinde fail-open/fail-closed kararı dokümante.

---

## 5) Operasyonel Müdahale Akışı

1. **Tespit**
   - 429 oranı, auth hata oranı, review gönderim paternleri takip edilir.
2. **Sınıflandırma**
   - Brute-force / spam / flood olarak etiketle.
3. **Anlık aksiyon**
   - İlgili policy eşiğini geçici düşür (özellikle `auth`/`review`).
4. **Doğrulama**
   - 5-15 dk pencerede anomali düşüşünü gözlemle.
5. **Kalıcı iyileştirme**
   - Kuralı kalıcılaştır, postmortem notunu güncelle.

---

## 6) CSP Uyum Test Rehberi

1. Prod benzeri ortamda response header’ları doğrula:
   - `Content-Security-Policy`
   - `Content-Security-Policy-Report-Only`
2. Tarayıcı console’da CSP ihlallerini topla.
3. İhlal tiplerini sınıfla:
   - inline script
   - inline style
   - third-party script
4. Uyumlu bileşenleri nonce/hash modeline taşı.
5. İhlal sayısı kabul seviyesine indiğinde `report-only` politikayı zorunlu profile taşı.
