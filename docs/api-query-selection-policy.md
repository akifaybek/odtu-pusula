# API Query Selection Policy (`select` vs `include`)

Bu doküman, API katmanında Prisma sorgularının şema değişimlerine karşı daha dayanıklı olması için standartları tanımlar.

## Temel Prensip

- **Varsayılan tercih:** `select`
- **`include` kullanımı:** yalnızca gerçekten tüm relation objesi gerekli ve dönen alanlar bilinçli olarak geniş tutulacaksa.

## Neden `select`?

- Dönen alanları açıkça sınırlar.
- Şemaya yeni alan eklendiğinde istemeden response’a sızmayı engeller.
- API sözleşmesini (contract) stabil tutar.
- PII/sensitive alan sızıntısı riskini azaltır.

## Ne zaman `include`?

Aşağıdaki şartların **tamamı** sağlanıyorsa:

1. Relation’ın tüm alanları API yanıtı için gerçekten gerekli.
2. Payload büyümesi performans açısından kabul edilebilir.
3. Endpoint sözleşmesi bilinçli olarak “geniş response” tasarlanmış.

Bu şartlar yoksa relation için de `select` kullanılmalıdır.

## Güvenli Alan Seçimi Kuralları

- Model sorgularında üst düzeyde `select` kullan.
- Relation’larda nested `select` kullan.
- `_count` gerekiyorsa yalnızca gerekli relation’ı seç.
- Kullanıcı objesinde minimum alanlar: `id`, `name` (gerekirse).
- Her endpoint sadece istemciye döneceği alanları çekmeli.

## Hata Dönüş Standardı

Tüm API hataları şu yapıda dönmelidir:

```json
{
  "error": "Kullanıcı dostu mesaj",
  "errorCode": "VALIDATION_ERROR",
  "message": "Kullanıcı dostu mesaj",
  "context": {
    "endpoint": "/api/...",
    "resourceId": "..."
  }
}
```

## 500 Azaltma Stratejisi

- Parametre guard’ları: `id`, `code`, `page`, `limit`, `sortBy` doğrulaması.
- JSON body parse guard (`request.json()` hatası için 400 dönüş).
- Güvenli fallback: bilinmeyen `sortBy` için default sıralama.
- Null relation guard: opsiyonel relation kullanımında null-safe erişim.
- N+1 sorguyu azalt: mümkünse toplu sorgu/groupBy.
