# Rate Limit Mimari Standardı

Bu doküman, API endpoint’lerinde rate limit davranışının tek kaynaktan ve deterministik şekilde nasıl uygulandığını tanımlar.

## 1) Politika tablosu

| Policy | Limit | Pencere | Amaç |
|---|---:|---:|---|
| `auth` | 5 | 15 dk | Auth endpointleri için sıkı koruma |
| `email` | 3 | 1 saat | E-posta gönderim endpointleri (forgot/send-verification) |
| `review` | 10 | 1 saat | Değerlendirme oluşturma endpointleri |
| `like` | 100 | 1 saat | Beğeni toggle endpointi |
| `api` | 100 | 1 dk | Genel API fallback politikası |

## 2) Endpoint bazlı kural tablosu (single source of truth)

Kural çözümleme [`resolveRateLimitRule()`](../src/lib/rate-limit.ts:194) ile yapılır.

| Rule ID | Pattern | Policy | Enforced By | Identifier Hint |
|---|---|---|---|---|
| `auth.forgot-password` | `^/api/auth/forgot-password(?:/|$)` | `email` | `route` | `ip+email` |
| `auth.send-verification` | `^/api/auth/send-verification(?:/|$)` | `email` | `route` | `ip+email` |
| `auth.all` | `^/api/auth/(?:.*)$` | `auth` | `middleware` | `userOrIp` |
| `reviews.like` | `^/api/reviews/[^/]+/like(?:/|$)` | `like` | `middleware` | `userOrIp` |
| `reviews.create` | `^/api/(courses|professors)/[^/]+/reviews(?:/|$)` | `review` | `middleware` | `userOrIp` |
| `api.default` | `^/api/(?:.*)$` | `api` | `middleware` | `userOrIp` |

## 3) Katman sorumluluğu (çift limitin kaldırılması)

- Middleware yalnızca [`shouldEnforceRateLimitInMiddleware()`](../src/lib/rate-limit.ts:207) sonucu `true` olan endpointlerde limit uygular.
- `forgot-password` ve `send-verification` route-level korunur (IP+email anahtarı gereksinimi nedeniyle).
- `courses/[code]/reviews`, `professors/[id]/reviews`, `reviews/[id]/like`, `auth/register`, `auth/reset-password` için route-level limit kodu kaldırılmıştır; middleware tek yetkilidir.

## 4) Redis fallback davranışı

[`checkRateLimitByPolicy()`](../src/lib/rate-limit.ts:216) akışı:
1. Önce Redis/Upstash limiter denenir.
2. Redis erişim hatası olursa ve Redis konfigürasyonu mevcutsa, güvenli in-memory fallback limiter devreye alınır.
3. Redis hiç konfigüre değilse doğrudan in-memory limiter zaten aktif olur.

Bu sayede servis kesintilerinde fail-closed yerine kontrollü fallback ile hizmet sürekliliği korunur.

## 5) Header standardı

Tüm 429 yanıtlarında [`buildRateLimitHeaders()`](../src/lib/rate-limit.ts:245) kullanılmalıdır:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After`

Middleware ve route-level (email endpointleri) aynı header standardını kullanır.

## 6) Deterministiklik ilkesi

Aynı endpoint path’i her zaman:
1. Aynı rule’a,
2. Aynı policy’ye,
3. Aynı enforcement katmanına

çözülmelidir. Bu garanti testlerle korunur.
