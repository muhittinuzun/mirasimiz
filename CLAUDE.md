# Suriye Mirası — Dijital Rehber

Suriye'nin tarihi ve kültürel mekânlarını çok dilli olarak tanıtan statik web sitesi. GitHub Pages üzerinde `suriyemirasi.com` alan adıyla yayınlanır. Veriler Supabase'ten çekilir, harita Leaflet ile çizilir.

## Mimari Özet

- **Frontend:** Tek sayfalı (SPA benzeri) statik site. Build adımı yoktur — `index.html` doğrudan tarayıcıda çalışır.
- **Backend:** Supabase (PostgreSQL). Sadece okuma yapılır, anon key kullanılır.
- **QR/Kısa Link Akışı:** `/k/<slug>` URL'leri n8n webhook'una yönlendirilir (alt kısımda detay).
- **Yayın:** GitHub Pages. `CNAME` dosyası özel domain'i (`suriyemirasi.com`) belirler.

## Dosya Yapısı

```
.
├── index.html                  # Ana uygulama (HTML + Tailwind CDN + tüm JS gömülü)
├── 404.html                    # GitHub Pages 404 sayfası — /k/<slug> yakalama yapar
├── k/
│   └── index.html              # /k/<slug> rotası için ek yedek redirect sayfası
├── database_schema.sql         # Supabase 'mekanlar' tablosu şeması (referans)
├── temp.js                     # index.html'in script bölümünün eski/yedek kopyası
├── Emblem_of_Syria_(2025–present).svg  # Logo (SVG)
├── halep_kalesi_tr.mp3         # Örnek/yedek ses dosyası
├── CNAME                       # GitHub Pages domain ayarı
└── .gitattributes
```

> **Not:** `temp.js`, `index.html` içindeki gömülü script'in eski bir kopyasıdır. Aktif kod `index.html` içindedir; değişiklikler oraya yapılmalıdır.

## index.html — Mantık Akışı

Tüm uygulama mantığı `index.html` dosyasının `<script>` bloğunda yer alır (~870 satır). Üç ana view ve birkaç yardımcı fonksiyon vardır.

### Önemli Global Değişkenler
- `window.currentLang` — aktif dil (`tr` | `en` | `ar`). Tarayıcı diline göre otomatik seçilir.
- `window.currentView` — `home` | `detail` | `map`
- `window.db` — Supabase'ten çekilip normalize edilmiş mekân listesi
- `window.map` — Leaflet harita instance'ı

### Supabase
- `SUPABASE_URL` ve `SUPABASE_ANON_KEY` `index.html` içinde hard-coded'dır (satır ~323).
- Tablo: `mekanlar` (bkz. `database_schema.sql`).
- Veri yoksa `fallbackDB` (boş dizi) kullanılır.

### Render / Routing
- `router(view, id?)` — view değiştirir, `pushState` ile URL'yi günceller.
- `renderHome()` — kart grid'i. Arama kutusu `filterPlaces()` ile içerik filtreler.
- `renderDetail(id)` — galeri, sesli rehber (`<audio>`), HTML detay metni, gömülü Google Maps iframe.
- `renderMap()` — Leaflet haritası, marker'lar, marker tıklayınca detay'a gider. `filterMapMarkers()` arama desteği sağlar.

### Çoklu Dil
- UI metinleri `uiText` objesi içinde (`tr`, `en`, `ar`).
- İçerik metinleri Supabase'te `*_tr`, `*_en`, `*_ar` sütunlarında.
- `setLanguage(lang)` — `<html dir>` ve `lang` attribute'unu, bayrağı, UI metinlerini, font ailesini günceller. Arapça için RTL ve `Noto Naskh Arabic` fontu otomatik devreye girer.
- Şema FR/RU/OSM sütunları da içeriyor; UI'da henüz kullanılmıyor.

### URL'den İçerik Yükleme
- `?id=<id>` → detay sayfası
- `?view=map` → harita
- diğer → ana sayfa
- `popstate` ile geri/ileri tuşu desteklenir.

### Görsel Galerisi (Lightbox)
- `openLightbox`, `closeLightbox`, `nextImage`, `prevImage` ve klavye (Esc/Ok tuşları) desteği.
- Supabase'ten gelen `images` alanı string, JSON-string veya array olabilir; `cleanUrl()` ve normalize bloğu (satır ~411) bunu tek tipe indirger.

### Lokal/CDN Bağımlılıkları (CDN üzerinden, build yok)
- Tailwind CSS (cdn.tailwindcss.com)
- Leaflet 1.9.4
- Supabase JS v2
- Google Fonts (Noto Sans / Serif / Naskh Arabic)
- FontAwesome 6
- Bayraklar: `flagcdn.com`

## /k/<slug> QR Akışı

QR kodları `suriyemirasi.com/k/<slug>` formatındadır. İki yerde redirect mantığı vardır:

- **`404.html`:** GitHub Pages'in path'i bulamaması durumunda devreye girer. Slug'ı parse eder ve `https://n8n.ittyazilim.com/webhook/3308d458-.../k/<slug>` adresine `window.location.replace` yapar.
- **`k/index.html`:** Aynı mantığın yedek kopyası (`/k/` path'i doğrudan istendiğinde devreye girer).

Slug yoksa kullanıcı 2sn sonra ana sayfaya yönlendirilir.

## Veritabanı Şeması (özet)

`mekanlar` tablosu (PostgreSQL/Supabase):
- `id`, `created_at`, `idx`
- Konum: `lat`, `lng`, `map_url`
- Medya: `images` (JSONB)
- Her dil için 4 sütun: `isim_*`, `aciklama_*`, `detay_*`, `ses_*`
  - Diller: `tr`, `en`, `ar`, `fr`, `ru`, `osm` (Osmanlıca)

Tam şema için: `database_schema.sql`.

## Geliştirme Notları

- Build/test pipeline yoktur. Değişiklikleri görmek için `index.html`'i tarayıcıda açmak yeterlidir (ama Supabase fetch'i için bir HTTP server kullanmak iyi olur, ör. `python3 -m http.server`).
- Supabase anon key public'tir (RLS ile korunmalıdır — yalnızca okuma açık olmalı).
- Yeni dil eklemek için: (1) `uiText` objesine yeni dil bloğu, (2) Supabase'e ilgili sütunlar (zaten varsa kullan), (3) `initApp` içindeki `content` mapping'ine yeni dili ekle, (4) navbar/mobil menüye dil butonu ekle.
- CSS özel renkler `tailwind.config` içinde tanımlı: `primary` (#b45309 — Suriye amber), `secondary`, `light`, `offwhite`.

## Bilinen Tuhaflıklar

- `temp.js` aktif değil ama silinmedi — `index.html`'in eski bir snapshot'ı. Düzenleme yaparken yanlışlıkla buraya bakmamak gerek.
- Logo dosya adında özel karakterler var: `Emblem_of_Syria_(2025–present).svg` (URL-encoded olarak `Emblem_of_Syria_%282025%E2%80%93present%29.svg` şeklinde referanslanır).
- 404 redirect URL'i hard-coded n8n webhook UUID içerir; webhook değişirse `404.html` ve `k/index.html` ikisi birden güncellenmeli.
