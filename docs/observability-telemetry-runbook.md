# Observability & Telemetry Runbook

Bu doküman, API gözlemlenebilirlik standardını ve 5 dakika içinde kök neden analizi (RCA) akışını tanımlar.

## 1) Standartlar

- Her API isteği için `x-request-id` ve `x-correlation-id` üretilir/taşınır.
- API cevaplarında:
  - `x-request-id`
  - `x-correlation-id`
  - `x-response-time-ms`
  - (hata durumunda) `x-error-class`
- Structured log event formatı: JSON satırı (`api.request.completed`, `middleware.rate_limited`, `middleware.rate_limit_error`).
- Hata sınıfları:
  - `validation`
  - `auth`
  - `rate-limit`
  - `db`
  - `internal`

## 2) Kritik endpointler

Aşağıdaki endpointler telemetry kapsamına alındı:

- `GET /api/courses`
- `GET /api/professors`
- `POST /api/reviews/[id]/like`
- `PUT /api/reviews/[id]`
- `DELETE /api/reviews/[id]`
- `GET /api/user/reviews`
- `GET /api/admin/stats`
- `GET /api/admin/telemetry` (metrics snapshot)

## 3) Metrikler

In-memory metrikler endpoint+method bazında tutulur:

- toplam istek sayısı
- hata sayısı
- hata oranı
- p95 gecikme (`p95LatencyMs`)
- son örnek sayısı (`recentCount`)
- son güncelleme zamanı (`lastUpdatedAt`)

Canlı snapshot:

- `GET /api/admin/telemetry`

## 4) Dashboard önerisi

Panel-1: **API Health (5m rolling)**
- request rate (RPS)
- error rate (%), threshold: `%5`
- p95 latency, threshold: `> 1200ms`

Panel-2: **Top Failing Endpoints**
- endpoint bazında 4xx/5xx dağılımı
- `x-error-class` kırılımı

Panel-3: **Rate-limit Monitor**
- `middleware.rate_limited` event sayısı
- policy bazlı dağılım

Panel-4: **Auth & Access Failures**
- `auth` error-class trendi
- 401/403 endpoint dağılımı

## 5) Alert önerisi

- **High Error Rate**: 5 dakika ortalaması `%5` üstü (critical)
- **High Latency P95**: 5 dakika p95 `>1200ms` (warning), `>2000ms` (critical)
- **5xx Burst**: 1 dakika içinde aynı endpointte 20+ adet 5xx (critical)
- **Rate-limit Spike**: 5 dakika içinde normal baseline’ın 3x üstü (warning)

## 6) 5 dakikalık RCA akışı

### Dakika 0-1: Kimlik
1. İstemci veya logdan `x-request-id` ya da `x-correlation-id` alın.
2. İlgili zaman penceresindeki `api.request.completed` loglarını filtreleyin.

### Dakika 1-2: Sınıf tespiti
1. `x-error-class` değerini kontrol edin (`validation/auth/rate-limit/db/internal`).
2. Endpoint, status ve duration alanlarını doğrulayın.

### Dakika 2-3: Etki analizi
1. `GET /api/admin/telemetry` ile endpoint için errorRate + p95 değerini inceleyin.
2. Aynı endpointte artış trendi var mı kontrol edin.

### Dakika 3-4: Kök neden hipotezi
- `db`: DB bağlantısı, sorgu süresi, lock veya timeout kontrolü.
- `auth`: token/session doğrulama ve redirect/cookie akışı kontrolü.
- `rate-limit`: policy seçimi ve burst paterni kontrolü.
- `validation`: istemci payload ve schema uyumluluğu kontrolü.
- `internal`: stack trace + son deploy farkı kontrolü.

### Dakika 4-5: Aksiyon
1. Geçici mitigation (rate düşürme, fallback, feature-flag).
2. Kalıcı düzeltme için incident ticket açma.
3. Postmortem notuna request/correlation id ekleme.

## 7) Operasyon notları

- `x-request-id` ve `x-correlation-id` incident raporlarında zorunlu alan olmalıdır.
- Prod’da loglar merkezi bir sisteme (ELK, Datadog, Loki vb.) forward edilmelidir.
- In-memory metrics süreç yeniden başlatıldığında sıfırlanır; kalıcı TSDB entegrasyonu (Prometheus/OpenTelemetry) uzun vadeli adımdır.
