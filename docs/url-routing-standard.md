# Route/URL Standardı

## Karar

ODTÜ Pusula için **tek resmi URL dili İngilizce** olarak standardize edilmiştir.

- Canonical route alanı: `[/courses](/docs/url-routing-standard.md)` ve `[/professors](/docs/url-routing-standard.md)`
- Detay sayfaları:
  - `[/courses/:code](/docs/url-routing-standard.md)`
  - `[/professors/:id](/docs/url-routing-standard.md)`
- API alanı zaten İngilizce standardındadır (`/api/courses`, `/api/professors`) ve korunur.

## Neden bu standart?

- Kod tabanında frontend ve API katmanlarıyla daha yüksek tutarlılık
- Dış entegrasyonlar, paylaşılabilir linkler ve SEO için öngörülebilir URL yapısı
- İ18n’nin URL path yerine içerik/çeviri katmanında yönetilmesi

## i18n Kuralı

- Dil değişimi URL path segmenti ile yapılmaz.
- Kullanıcıya görünen metinler çeviri sistemiyle (UI labels/translations) yönetilir.
- Route path’leri çevrilmez, stabil kalır.

## Redirect Matrisi (Backward Compatibility)

| Legacy Path | Canonical Path | HTTP |
|---|---|---|
| `/dersler` | `/courses` | 308 (permanent) |
| `/dersler/:path*` | `/courses/:path*` | 308 (permanent) |
| `/hocalar` | `/professors` | 308 (permanent) |
| `/hocalar/:path*` | `/professors/:path*` | 308 (permanent) |

## Uygulama Notları

- Redirect kuralı [`next.config.ts`](../next.config.ts) içinde `redirects()` ile tanımlanmıştır.
- Middleware matcher canonical path’lerle birlikte legacy path’leri de kapsar, böylece geçiş döneminde erişim politikası tutarlı kalır.
- Yeni link/fetch geliştirmelerinde yalnızca canonical path kullanılmalıdır.

## Regresyon Testi

- Redirect matrisinin bozulmaması için test eklendi:
  - [`__tests__/routing/url-routing-standard.test.ts`](../__tests__/routing/url-routing-standard.test.ts)

Bu test, legacy Türkçe path’lerden canonical İngilizce path’lere permanent redirect kurallarının tanımlı olduğunu doğrular.
