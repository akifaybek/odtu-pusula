# Security Policy

Bu doküman ODTÜ Pusula projesi için güvenlik açıklarının sorumlu biçimde raporlanmasını ve müdahale yaklaşımını tanımlar.

## Supported Versions

Aktif olarak desteklenen sürüm: `main` branch üzerindeki güncel üretim sürümü.

## Güvenlik Açığı Bildirimi

Lütfen güvenlik açıklarını public issue açarak paylaşmayın.

Önerilen bildirim kanalı:

- Proje maintainers ile özel iletişim (e-posta/özel kanal)
- Konu başlığı: `SECURITY: <kısa özet>`

Bildirimde aşağıdakileri paylaşın:

1. Etkilenen bileşen / endpoint
2. Reprodüksiyon adımları
3. Etki seviyesi (Confidentiality/Integrity/Availability)
4. Varsa PoC (minimum riskli)
5. Önerilen düzeltme yaklaşımı

## SLA (Hedef)

- İlk yanıt: 24 saat
- Triyaj tamamlanması: 72 saat
- Kritik açık için geçici mitigation: 24-48 saat
- Kalıcı düzeltme: risk seviyesine göre planlanır

## Risk Seviyeleri

- **Critical**: auth bypass, yetkisiz veri erişimi, remote code execution
- **High**: privilege escalation, hassas veri sızıntısı
- **Medium**: kısmi yetki ihlali, sınırlı veri ifşası
- **Low**: düşük etkili güvenlik yanlış konfigürasyonları

## Güvenlik Pratikleri (Mevcut)

- NextAuth tabanlı kimlik doğrulama
- Hardened cookie/redirect kontrolleri
- Rate limiting (Upstash + fallback)
- API error standardizasyonu
- Observability: request/correlation id, structured logging, hata sınıfları
- CSP sertleştirme çalışmaları

Detaylar:

- [`docs/security-hardening-runbook.md`](./docs/security-hardening-runbook.md)
- [`docs/observability-telemetry-runbook.md`](./docs/observability-telemetry-runbook.md)

## Disclosure Politikası

- Düzeltme çıkmadan önce açık detayları public paylaşılmaz.
- Düzeltme yayınlandıktan sonra gerektiğinde güvenlik notu yayımlanır.

## Teşekkür

Sorumlu açıklama (responsible disclosure) yaklaşımıyla katkı veren araştırmacılara teşekkür ederiz.
