-- 'mekanlar' tablosu oluşumu
-- Bu şema, veri tabanı yapısı için hazırlanmıştır.

CREATE TABLE mekanlar (
    id BIGINT PRIMARY KEY, -- JSON'dan gelen 'id' (örn: 39, 40) veya SERIAL kullanılabilir
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Konum Bilgileri
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    map_url TEXT,
    
    -- Medya
    -- Resimler JSON dizisi olarak saklanabilir (Postgres)
    images JSONB DEFAULT '[]'::jsonb, 
    
    -- Türkçe İçerik
    isim_tr TEXT,
    aciklama_tr TEXT,
    detay_tr TEXT,
    ses_tr TEXT,
    
    -- İngilizce İçerik
    isim_en TEXT,
    aciklama_en TEXT,
    detay_en TEXT,
    ses_en TEXT,
    
    -- Arapça İçerik
    isim_ar TEXT,
    aciklama_ar TEXT,
    detay_ar TEXT,
    ses_ar TEXT,
    
    -- Fransızca İçerik
    isim_fr TEXT,
    aciklama_fr TEXT,
    detay_fr TEXT,
    ses_fr TEXT,
    
    -- Rusça İçerik
    isim_ru TEXT,
    aciklama_ru TEXT,
    detay_ru TEXT,
    ses_ru TEXT,
    
    -- Osmanlıca İçerik
    isim_osm TEXT,
    aciklama_osm TEXT,
    detay_osm TEXT,
    ses_osm TEXT,

    -- Yardımcı indeks (Örn: idx alanı JSON'da var)
    idx INTEGER
);

-- Örnek Veri Ekleme Sorgusu (Hazırlanan JSON verisi için)
/*
INSERT INTO mekanlar (
    idx, id, created_at, lat, lng, map_url, images,
    isim_tr, aciklama_tr, detay_tr, ses_tr,
    isim_en, aciklama_en, detay_en, ses_en,
    isim_ar, aciklama_ar, detay_ar, ses_ar,
    isim_fr, aciklama_fr, detay_fr, ses_fr,
    isim_ru, aciklama_ru, detay_ru, ses_ru,
    isim_osm, aciklama_osm, detay_osm, ses_osm
) VALUES (
    0, 39, '2026-02-06 11:25:59.418821+00', 33.51, 36.6, 
    'https://maps.google.com/maps?q=33.51,36.60&hl=tr&z=17&output=embed',
    '["https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_0_3380.jpg", ...]',
    'Halep Kalesi', 'Halep Kalesi, Orta Doğu askeri mimarisinin...', '<p>Günümüzde Kale...</p>', '...ses_tr_7018.mp3',
    'The Citadel of Aleppo', 'The Citadel of Aleppo is one of...', '<p>Today, the Citadel...</p>', '...ses_en_4833.mp3',
    'قلعة حلب', 'تُعدّ قلعة حلب واحدة...', '<p>واليوم ترتفع...</p>', '...ses_ar_9035.mp3',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL
);
*/
