        // --- GLOBAL DEĞİŞKENLER ---
        window.currentLang = 'tr';
        window.currentView = 'home';
        window.currentPlaceId = null;
        window.db = [];
        window.currentGalleryImages = [];
        window.currentImageIndex = 0;
        window.map = null;

        // --- SUPABASE KONFİGÜRASYONU ---
        const SUPABASE_URL = "https://kmgbjztsouolzarimebc.supabase.co";
        const SUPABASE_ANON_KEY = "sb_publishable_jZQ1O8C1UglGdrL-28Axfg_erTIuO-L";

        let supabaseClient = null;
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        // --- URL TEMİZLEME VE DÜZELTME ---
        function cleanUrl(url) {
            if (!url) return null;
            let str = String(url).trim();

            // 1. Zaten temiz bir link mi?
            if (str.startsWith('http') && !str.includes('[')) return str;

            // 2. Markdown formatı: [link](base_url)suffix -> base_url + suffix
            const markdownMatch = str.match(/^\[.*?\]\((https?:\/\/[^\)]+)\)(.*)$/);
            if (markdownMatch) {
                return markdownMatch[1] + (markdownMatch[2] || '');
            }

            // 3. Basit parantez içi: (url)
            const parenMatch = str.match(/^\((https?:\/\/[^\)]+)\)$/);
            if (parenMatch) return parenMatch[1];

            // 4. Köşeli parantez/tırnak temizliği
            str = str.replace(/^['"\[]+|['"\]]+$/g, '');
            if (str.startsWith('http')) return str;

            return null;
        }

        function formatMapUrl(rawUrl) {
            if (!rawUrl) return "";
            if (rawUrl.includes("output=embed")) return rawUrl;

            const coordsMatch = rawUrl.match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
            if (coordsMatch) {
                const lat = coordsMatch[1];
                const lng = coordsMatch[3];
                return `https://maps.google.com/maps?q=${lat},${lng}&hl=tr&z=17&output=embed`;
            }
            return rawUrl;
        }

        // --- UI TEXT ---
        const uiText = {
            tr: {
                siteName: "SURİYE MİRASI", siteSubtitle: "DİJİTAL REHBER", searchPlaceholder: "Mekan, şehir veya eser arayın...", homeTitle: "Suriye'nin Kültürel Mirası", homeSubtitle: "Geçmişin izlerini, tarihi yapıları ve kültürel zenginlikleri dijital arşivimizde keşfedin.", readMore: "Detaylı İncele", back: "Geri Dön", gallery: "Galeri", location: "Konum", playAudio: "Sesli Anlatım", menuHome: "Anasayfa", menuMap: "Harita", menuAbout: "Hakkımızda", menuContact: "İletişim", aboutTitle: "Hakkımızda", aboutBody: "Suriye Mirası Projesi, bölgenin zengin tarihsel ve kültürel dokusunu dijital ortama taşıyarak gelecek nesillere aktarmayı hedefleyen bir girişimdir.", contactTitle: "İletişim", contactBody: "Görüş, öneri ve katkılarınız için bize ulaşabilirsiniz:<br><br><strong>E-posta:</strong> info@suriyemirasi.org"
            },
            en: {
                siteName: "SYRIAN HERITAGE", siteSubtitle: "DIGITAL GUIDE", searchPlaceholder: "Search for places...", homeTitle: "Cultural Heritage of Syria", homeSubtitle: "Discover the traces of the past in our digital archive.", readMore: "Explore Detail", back: "Go Back", gallery: "Gallery", location: "Location", playAudio: "Audio Guide", menuHome: "Home", menuMap: "Map", menuAbout: "About Us", menuContact: "Contact", aboutTitle: "About Us", aboutBody: "The Syrian Heritage Project is an initiative aiming to transfer the region's rich historical and cultural texture to the digital environment.", contactTitle: "Contact", contactBody: "Contact us at: info@suriyemirasi.org"
            },
            ar: {
                siteName: "التراث السوري", siteSubtitle: "الدليل الرقمي", searchPlaceholder: "ابحث عن الأماكن...", homeTitle: "التراث الثقافي السوري", homeSubtitle: "اكتشف آثار الماضي في أرشيفنا الرقمي.", readMore: "اكتشف التفاصيل", back: "رجوع", gallery: "معرض الصور", location: "الموقع", playAudio: "الدليل الصوتي", menuHome: "الرئيسية", menuMap: "خريطة", menuAbout: "من نحن", menuContact: "اتصل بنا", aboutTitle: "من نحن", aboutBody: "مشروع التراث السوري هو مبادرة تهدف إلى نقل النسيج التاريخي والثقافي الغني للمنطقة إلى البيئة الرقمية.", contactTitle: "اتصل بنا", contactBody: "اتصل بنا: info@suriyemirasi.org"
            },
            fr: { siteName: "PATRIMOINE SYRIEN", siteSubtitle: "GUIDE NUMÉRIQUE", searchPlaceholder: "Rechercher...", homeTitle: "Patrimoine Culturel", homeSubtitle: "Découvrez les traces du passé.", readMore: "Explorer", back: "Retour", gallery: "Galerie", location: "Lieu", playAudio: "Guide Audio", menuHome: "Accueil", menuMap: "Carte", menuAbout: "À Propos", menuContact: "Contact", aboutTitle: "À Propos", aboutBody: "Projet du patrimoine syrien.", contactTitle: "Contact", contactBody: "Email: info@suriyemirasi.org" },
            ru: { siteName: "СИРИЙСКОЕ НАСЛЕДИЕ", siteSubtitle: "ЦИФРОВОЙ ГИД", searchPlaceholder: "Поиск...", homeTitle: "Культурное наследие", homeSubtitle: "Откройте для себя следы прошлого.", readMore: "Подробнее", back: "Назад", gallery: "Галерея", location: "Местоположение", playAudio: "Аудиогид", menuHome: "Главная", menuMap: "Карта", menuAbout: "О нас", menuContact: "Контакты", aboutTitle: "О нас", aboutBody: "Проект Сирийское наследие.", contactTitle: "Контакты", contactBody: "Email: info@suriyemirasi.org" },
            osm: { siteName: "سوريه ميراثي", siteSubtitle: "ديجيتال رهبر", searchPlaceholder: "آرامق...", homeTitle: "سوريه‌نك ثقافت ميراثي", homeSubtitle: "ماضينك ايزلريني كشف ايدك.", readMore: "تفصيلاتلي تدقيق", back: "كرو دون", gallery: "رسملر", location: "موقع", playAudio: "صوتي شرح", menuHome: "آنا صفحه", menuMap: "خريطه", menuAbout: "حقيمزده", menuContact: "مخابره", aboutTitle: "حقيمزده", aboutBody: "سوريه ميراثي پروژه‌سي.", contactTitle: "مخابره", contactBody: "ا-پوسته: info@suriyemirasi.org" }
        };

        const flags = {
            tr: "https://flagcdn.com/w40/tr.png",
            en: "https://flagcdn.com/w40/gb.png",
            ar: "https://flagcdn.com/w40/sy.png",
            fr: "https://flagcdn.com/w40/fr.png",
            ru: "https://flagcdn.com/w40/ru.png",
            osm: "https://www.tabloshop.com/image/cache/webp/data/urun/osmanli-oryantal-tablolar/OS-47__model_3-1000x1000.webp"
        };

        // --- INIT ---
        window.onload = async function () { await initApp(); };

        async function initApp() {
            if (supabaseClient) {
                try {
                    const { data, error } = await supabaseClient
                        .from('mekanlar')
                        .select('*')
                        .order('id', { ascending: true });

                    if (!error && data && data.length > 0) {
                        window.db = data.map(item => {
                            let rawImages = item.images;
                            let processedImages = [];
                            if (Array.isArray(rawImages)) { processedImages = rawImages; }
                            else if (typeof rawImages === 'string') {
                                rawImages = rawImages.trim();
                                if (rawImages.startsWith('[') && rawImages.endsWith(']')) {
                                    try { processedImages = JSON.parse(rawImages); }
                                    catch (e) { processedImages = rawImages.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')); }
                                } else { processedImages = [rawImages]; }
                            }
                            processedImages = processedImages.map(img => cleanUrl(img)).filter(img => img !== null);
                            if (processedImages.length === 0) processedImages.push("https://via.placeholder.com/800x600?text=Gorsel+Yok");

                            return {
                                id: item.id,
                                coords: [item.lat, item.lng],
                                mapUrl: formatMapUrl(item.map_url),
                                images: processedImages,
                                content: {
                                    tr: { name: item.isim_tr, location: "Suriye", desc: item.aciklama_tr, detailDesc: item.detay_tr, audioTitle: "Sesli Rehber", audioUrl: cleanUrl(item.ses_tr) },
                                    en: { name: item.isim_en, location: "Syria", desc: item.aciklama_en, detailDesc: item.detay_en, audioTitle: "Audio Guide", audioUrl: cleanUrl(item.ses_en) },
                                    ar: { name: item.isim_ar, location: "سوريا", desc: item.aciklama_ar, detailDesc: item.detay_ar, audioTitle: "الدليل الصوتي", audioUrl: cleanUrl(item.ses_ar) },
                                    fr: { name: item.isim_fr || item.isim_en, location: "Syrie", desc: item.aciklama_fr || item.aciklama_en, detailDesc: item.detay_fr, audioTitle: "Guide Audio", audioUrl: cleanUrl(item.ses_fr) },
                                    ru: { name: item.isim_ru || item.isim_en, location: "Сирия", desc: item.aciklama_ru || item.aciklama_en, detailDesc: item.detay_ru, audioTitle: "Аудиогид", audioUrl: cleanUrl(item.ses_ru) },
                                    osm: { name: item.isim_osm || item.isim_tr, location: "سوريه", desc: item.aciklama_osm || item.aciklama_tr, detailDesc: item.detay_osm, audioTitle: "صوتي رهبر", audioUrl: cleanUrl(item.ses_osm) }
                                }
                            };
                        });
                    }
                } catch (err) { console.error("Hata:", err); }
            }
            if (window.db.length === 0) {
                console.log("Supabase'den veri çekilemedi, yedek veri kullanılıyor.");
                const rawFallbackData = [{ "idx": 0, "id": 39, "created_at": "2026-02-06 11:25:59.418821+00", "lat": 33.51, "lng": 36.6, "map_url": "https://maps.google.com/maps?q=33.51,36.60&hl=tr&z=17&output=embed", "images": ["https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_0_3380.jpg", "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_1_7031.jpg", "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_2_3177.jpg"], "isim_tr": "Halep Kalesi", "aciklama_tr": "Halep Kalesi, Orta Doğu askeri mimarisinin en dikkat çekici ve en eski örneklerinden biridir. Yeni keşfedilen Fırtına Tanrısı Tapınağı, doğal tepenin insan tarafından kullanımının MÖ 3. binyılın başlarına kadar uzandığını göstermektedir.", "detay_tr": "<p>Günümüzde Kale, Eski Şehir’in merkezinden heybetli bir şekilde yükselmektedir. Bugün görülebilen yapıların birçoğu Eyyubi dönemine (MS 12–13. yüzyıl) ait olmakla birlikte, Kale; Yunanlar, Romalılar, Bizanslılar, Zengiler, Eyyubiler, Memlükler ve Osmanlılar dâhil olmak üzere birçok tarihî döneme ait izler taşımaktadır.</p>", "ses_tr": "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/ses_tr_7018.mp3", "isim_en": "The Citadel of Aleppo", "aciklama_en": "The Citadel of Aleppo is one of the most remarkable and ancient examples of military architecture in the Middle East. The newly-discovered Temple of the Storm God dates human use of the natural hill from the early 3rd Millennium BC.", "detay_en": "<p>Today, the Citadel rises majestically from the centre of the Old City, and while many of the currently visible structures originate from the Ayyubid period (12–13th Century AD), the Citadel bears evidence of the multiple historical eras including those of the Greeks, Romans, Byzantines, Zangids, Ayyubids, Mamluks and Ottomans.</p>", "ses_en": "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/ses_en_4833.mp3", "isim_ar": "قلعة حلب", "aciklama_ar": "تُعدّ قلعة حلب واحدة من أبرز وأقدم نماذج العمارة العسكرية في الشرق الأوسط. ويعود الاكتشاف الحديث لمعبد إله العاصفة إلى تأريخ استخدام التل الطبيعي من قبل الإنسان إلى بدايات الألف الثالث قبل الميلاد.", "detay_ar": "<p>واليوم ترتفع القلعة شامخةً في قلب المدينة القديمة، وعلى الرغم من أن العديد من المنشآت الظاهرة حالياً تعود إلى العصر الأيوبي (القرنان الثاني عشر والثالث عشر الميلاديان)، فإن القلعة تحمل شواهد متعددة على الحقب التاريخية المختلفة، بما في ذلك العصور اليونانية والرومانية والبيزنطية والزنكية والأيوبية والمملوكية والعثمانية.</p>", "ses_ar": "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/ses_ar_9035.mp3", "isim_fr": null, "aciklama_fr": null, "detay_fr": null, "ses_fr": null, "isim_ru": null, "aciklama_ru": null, "detay_ru": null, "ses_ru": null, "isim_osm": null, "aciklama_osm": null, "detay_osm": null, "ses_osm": null }, { "idx": 1, "id": 40, "created_at": "2026-02-06 18:42:18.397384+00", "lat": 33, "lng": 35, "map_url": "https://maps.google.com/maps?q=33,35&hl=tr&z=17&output=embed", "images": ["https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_0_3380.jpg", "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_1_7031.jpg", "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/gorsel_2_3177.jpg"], "isim_tr": "Halep Kalesi: Orta Doğu'nun En Eski Askerî Mimari Örneklerinden Biri", "aciklama_tr": "Halep Kalesi, Orta Doğu'nun en dikkat çekici ve en eski askerî mimari yapılarından biridir. Yeni keşfedilen Fırtına Tanrısı Tapınağı, bu doğal tepenin insan tarafından kullanımının MÖ 3. binyılın başlarına kadar uzandığını göstermektedir.", "detay_tr": "<p>Halep Kalesi, Orta Doğu’daki askerî mimarinin en dikkat çekici örneklerinden biridir ve kuşkusuz en eski yapılardan biri olarak kabul edilmektedir. Yeni keşfedilen Fırtına Tanrısı Tapınağı, doğal tepenin insan tarafından kullanımını MÖ 3. binyılın erken dönemlerine kadar götürmektedir.</p>", "ses_tr": "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/ses_tr_7018.mp3", "isim_en": "The Citadel of Aleppo: An Ancient Masterpiece of Middle Eastern Military Architecture", "aciklama_en": "The Citadel of Aleppo is a remarkable and ancient example of military architecture in the Middle East. The recently discovered Temple of the Storm God indicates human use of this natural hill dates back to the early 3rd Millennium BC.", "detay_en": "<p>The Citadel of Aleppo is one of the most remarkable examples of military architecture in the Middle East, and certainly one of the most ancient. The newly-discovered Temple of the Storm God dates human use of the natural hill from the early beginning of the 3rd Millennium BC.</p>", "ses_en": "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/ses_en_4833.mp3", "isim_ar": "قلعة حلب: من أقدم وأبرز نماذج العمارة العسكرية في الشرق الأوسط", "aciklama_ar": "تُعدّ قلعة حلب من أبرز نماذج العمارة العسكرية القديمة في الشرق الأوسط. وقد كشف الاكتشاف الأخير لمعبد إله العاصفة أن استخدام الإنسان لهذا التل الطبيعي يعود إلى بدايات الألف الثالث قبل الميلاد.", "detay_ar": "<p>تُعدّ قلعة حلب واحدة من أبرز نماذج العمارة العسكرية في الشرق الأوسط، وبالتأكيد من أقدمها. ويعود الاكتشاف الحديث لمعبد إله العاصفة إلى تأريخ استخدام التل الطبيعي من قبل الإنسان إلى بدايات الألف الثالث قبل الميلاد.</p>", "ses_ar": "https://kmgbjztsouolzarimebc.supabase.co/storage/v1/object/public/medya_depo/ses_ar_9035.mp3", "isim_fr": null, "aciklama_fr": null, "detay_fr": null, "ses_fr": null, "isim_ru": null, "aciklama_ru": null, "detay_ru": null, "ses_ru": null, "isim_osm": null, "aciklama_osm": null, "detay_osm": null, "ses_osm": null }];

                window.db = rawFallbackData.map(item => {
                    let rawImages = item.images;
                    let processedImages = [];
                    if (Array.isArray(rawImages)) { processedImages = rawImages; }
                    else if (typeof rawImages === 'string') {
                        rawImages = rawImages.trim();
                        if (rawImages.startsWith('[') && rawImages.endsWith(']')) {
                            try { processedImages = JSON.parse(rawImages); }
                            catch (e) { processedImages = rawImages.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')); }
                        } else { processedImages = [rawImages]; }
                    }
                    processedImages = processedImages.map(img => cleanUrl(img)).filter(img => img !== null);
                    if (processedImages.length === 0) processedImages.push("https://via.placeholder.com/800x600?text=Gorsel+Yok");

                    return {
                        id: item.id,
                        coords: [item.lat, item.lng],
                        mapUrl: formatMapUrl(item.map_url),
                        images: processedImages,
                        content: {
                            tr: { name: item.isim_tr, location: "Suriye", desc: item.aciklama_tr, detailDesc: item.detay_tr, audioTitle: "Sesli Rehber", audioUrl: cleanUrl(item.ses_tr) },
                            en: { name: item.isim_en, location: "Syria", desc: item.aciklama_en, detailDesc: item.detay_en, audioTitle: "Audio Guide", audioUrl: cleanUrl(item.ses_en) },
                            ar: { name: item.isim_ar, location: "سوريا", desc: item.aciklama_ar, detailDesc: item.detay_ar, audioTitle: "الدليل الصوتي", audioUrl: cleanUrl(item.ses_ar) },
                            fr: { name: item.isim_fr || item.isim_en, location: "Syrie", desc: item.aciklama_fr || item.aciklama_en, detailDesc: item.detay_fr, audioTitle: "Guide Audio", audioUrl: cleanUrl(item.ses_fr) },
                            ru: { name: item.isim_ru || item.isim_en, location: "Сирия", desc: item.aciklama_ru || item.aciklama_en, detailDesc: item.detay_ru, audioTitle: "Аудиогид", audioUrl: cleanUrl(item.ses_ru) },
                            osm: { name: item.isim_osm || item.isim_tr, location: "سوريه", desc: item.aciklama_osm || item.aciklama_tr, detailDesc: item.detay_osm, audioTitle: "صوتي رهبر", audioUrl: cleanUrl(item.ses_osm) }
                        }
                    };
                });
            }

            const urlParams = new URLSearchParams(window.location.search);
            const idParam = urlParams.get('id');
            const viewParam = urlParams.get('view');
            if (idParam) renderDetail(parseInt(idParam));
            else if (viewParam === 'map') renderMap();
            else renderHome();
            updateUIText();
        }

        function router(view, id = null) {
            window.currentView = view;
            window.currentPlaceId = id;
            window.scrollTo(0, 0);
            try {
                const url = new URL(window.location);
                if (view === 'home') url.search = '';
                else if (view === 'detail' && id) url.searchParams.set('id', id);
                else if (view === 'map') { url.searchParams.set('view', 'map'); url.searchParams.delete('id'); }
                window.history.pushState({}, '', url);
            } catch (e) { }
            if (view === 'home') renderHome();
            else if (view === 'detail' && id) renderDetail(id);
            else if (view === 'map') renderMap();
        }

        window.onpopstate = function (event) {
            const urlParams = new URLSearchParams(window.location.search);
            const idParam = urlParams.get('id');
            const viewParam = urlParams.get('view');
            if (idParam) renderDetail(parseInt(idParam));
            else if (viewParam === 'map') renderMap();
            else renderHome();
        };

        // --- RENDER FUNCTIONS ---
        function renderHome() {
            if (window.map && window.map.remove) { window.map.remove(); window.map = null; }
            const app = document.getElementById('app');
            const texts = uiText[window.currentLang];
            const isRTL = (window.currentLang === 'ar' || window.currentLang === 'osm');
            let html = `
                <div class="relative pattern-bg rounded-3xl mb-12 shadow-xl overflow-hidden fade-in mx-2 lg:mx-0">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="relative z-10 px-6 py-16 md:py-24 text-center">
                        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight drop-shadow-sm leading-tight">${texts.homeTitle}</h2>
                        <p class="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">${texts.homeSubtitle}</p>
                        <div class="max-w-2xl mx-auto relative group">
                            <div class="absolute inset-0 bg-white/20 blur-xl rounded-full transform group-hover:bg-white/30 transition duration-500"></div>
                            <div class="relative">
                                <input type="text" id="searchInput" onkeyup="filterPlaces()" placeholder="${texts.searchPlaceholder}" class="w-full py-5 px-8 rounded-full shadow-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-white/30 border-0 outline-none pl-14 rtl:pl-8 rtl:pr-14 transition-all duration-300 text-lg font-medium"><i class="fa-solid fa-magnifying-glass absolute top-1/2 transform -translate-y-1/2 text-gray-400 left-6 rtl:left-auto rtl:right-6 text-xl group-hover:text-primary transition-colors"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 lg:px-0" id="placesGrid">
            `;
            window.db.forEach(place => {
                const content = place.content[window.currentLang] || place.content['tr'];
                html += `
                    <div class="bg-white rounded-2xl shadow-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group flex flex-col h-full overflow-hidden border border-gray-100/50 card-item" onclick="router('detail', ${place.id})">
                        <div class="h-60 overflow-hidden relative">
                            <img src="${place.images[0]}" onerror="this.src='https://via.placeholder.com/800x600?text=Gorsel+Yok'" referrerpolicy="no-referrer" alt="${content.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm"><span class="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1"><i class="fa-solid fa-location-dot"></i> ${content.location}</span></div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow relative">
                            <h3 class="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors leading-snug">${content.name}</h3>
                            <p class="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">${content.desc}</p>
                            <div class="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                                <span class="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition">#${place.id.toString().padStart(4, '0')}</span>
                                <span class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors"><i class="fa-solid ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'} text-sm"></i></span>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
            app.innerHTML = html;
        }

        function renderDetail(id) {
            if (window.map && window.map.remove) { window.map.remove(); window.map = null; }
            const place = window.db.find(p => p.id === id);
            if (!place) return renderHome();
            window.currentGalleryImages = place.images;
            const app = document.getElementById('app');
            const texts = uiText[window.currentLang];
            const content = place.content[window.currentLang] || place.content['tr'];
            const isRTL = (window.currentLang === 'ar' || window.currentLang === 'osm');
            const descriptionHtml = content.detailDesc || `<p>${content.desc}</p>`;
            app.innerHTML = `
                <div class="fade-in max-w-6xl mx-auto px-2 lg:px-0">
                    <div class="mb-6 flex items-center justify-between"><button onclick="router('home')" class="flex items-center text-gray-500 hover:text-primary transition font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md"><i class="fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} mr-2 rtl:mr-0 rtl:ml-2"></i> ${texts.back}</button><div class="hidden md:block text-sm text-gray-400 font-mono">ID: #${place.id.toString().padStart(4, '0')}</div></div>
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div class="lg:col-span-8 space-y-8">
                            <div class="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg group">
                                <img src="${place.images[0]}" onerror="this.src='https://via.placeholder.com/800x600?text=Gorsel+Yok'" referrerpolicy="no-referrer" class="w-full h-full object-cover cursor-pointer" onclick="openLightbox(0)">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8 pointer-events-none">
                                    <div class="w-full"><div class="flex items-center text-orange-200 text-sm font-bold uppercase tracking-wider mb-2"><i class="fa-solid fa-location-dot mr-2"></i> ${content.location}</div><h1 class="text-3xl md:text-5xl font-bold text-white mb-2 shadow-sm leading-tight">${content.name}</h1></div>
                                </div>
                            </div>
                            <!-- Audio Player with External Link Fallback -->
                            ${content.audioUrl ? `
                            <div class="bg-white p-5 rounded-xl shadow-card border border-gray-100 flex flex-col md:flex-row items-center gap-4">
                                <div class="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-primary"><i class="fa-solid fa-headphones text-xl"></i></div>
                                <div class="flex-grow w-full md:w-auto text-center md:text-left rtl:md:text-right">
                                    <p class="text-xs text-primary font-bold uppercase tracking-wider mb-0.5 opacity-80">${texts.playAudio}</p>
                                    <h4 class="text-sm font-bold text-gray-800">${content.audioTitle}</h4>
                                </div>
                                <div class="w-full md:w-64 flex flex-col gap-1">
                                    <audio controls preload="none" class="w-full h-10 rounded-lg bg-gray-50 shadow-inner" id="audio-player-${place.id}">
                                        <source src="${content.audioUrl}" type="audio/mpeg">
                                        Tarayıcınız ses elementini desteklemiyor.
                                    </audio>
                                    <div id="audio-error-${place.id}" class="hidden text-[10px] text-red-500 text-center font-medium bg-red-50 p-1 rounded">Ses dosyası yüklenemedi (Bağlantı hatası)</div>
                                </div>
                                <a href="${content.audioUrl}" target="_blank" class="text-gray-400 hover:text-primary p-2 transition-colors duration-200" title="Dosyayı Yeni Sekmede Aç" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-external-link-alt"></i>
                                </a>
                            </div>
` : ''}

    <div class="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
        <h3 class="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Hakkında</h3>
        <div class="leading-relaxed text-lg text-gray-600 text-justify detail-content font-light">${descriptionHtml}
        </div>
    </div>
    </div>
    <div class="lg:col-span-4 space-y-6">
        <div class="bg-white p-1 rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 class="font-bold text-gray-800">${texts.location}</h3><i class="fa-solid fa-map text-gray-400"></i>
            </div><iframe src="${place.mapUrl}" width="100%" height="300" style="border:0;" allowfullscreen=""
                loading="lazy"></iframe><a href="${place.mapUrl.replace('embed', 'search')}" target="_blank"
                class="block text-center py-3 text-sm text-primary font-semibold hover:bg-gray-50 transition">Haritada
                Aç <i class="fa-solid fa-external-link-alt ml-1 text-xs"></i></a>
        </div>
        <div class="bg-white p-5 rounded-2xl shadow-card border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center"><i
                    class="fa-regular fa-images mr-2 text-primary"></i> ${texts.gallery}</h3>
            <div class="grid grid-cols-2 gap-3">${place.images.map((img, idx) => `<img src="${img}"
                    onerror="this.src='https://via.placeholder.com/300?text=Gorsel+Yok'" referrerpolicy="no-referrer"
                    class="rounded-lg h-24 w-full object-cover cursor-pointer hover:opacity-80 transition ring-2 ring-transparent hover:ring-primary/20"
                    onclick="openLightbox(${idx})">`).join('')}</div>
        </div>
    </div>
    </div>
    </div>
    `;

            // Audio error handling
            if (content.audioUrl) {
                setTimeout(() => {
                    const audio = document.getElementById(`audio-player-${place.id}`);
                    const errorMsg = document.getElementById(`audio-error-${place.id}`);
                    if (audio) {
                        audio.addEventListener('error', function (e) {
                            console.error('Audio Error:', e);
                            if (errorMsg) errorMsg.classList.remove('hidden');
                        });
                    }
                }, 0);
            }

            const audioEl = document.querySelector('audio');
            if (audioEl) { audioEl.load(); }
        }

        function renderMap() {
            const container = document.getElementById('map-container');
            if (container) { container.innerHTML = ""; container._leaflet_id = null; }
            if (window.map) { window.map.remove(); window.map = null; }
            const app = document.getElementById('app');
            const texts = uiText[window.currentLang];
            const isRTL = (window.currentLang === 'ar' || window.currentLang === 'osm');
            app.innerHTML = `
                < div class="fade-in h-full relative" >
        <div class="flex justify-between items-center mb-4 px-2">
            <h2 class="text-2xl font-bold text-gray-800">${texts.menuMap}</h2><button onclick="router('home')"
                class="text-sm font-semibold text-primary hover:underline flex items-center"><i
                    class="fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} mr-1 rtl:mr-0 rtl:ml-1"></i>
                ${texts.back}</button>
        </div>
        <div class="absolute top-16 left-4 z-[100] w-64 md:w-80 shadow-lg">
            <div class="relative"><input type="text" id="mapSearchInput" placeholder="${texts.searchPlaceholder}"
                    class="w-full py-3 px-4 rounded-lg shadow-md border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-sm"
                    onkeyup="filterMapMarkers()"><i
                    class="fa-solid fa-magnifying-glass absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-400"></i>
            </div>
            <div id="mapSearchResults"
                class="bg-white mt-1 rounded-lg shadow-lg overflow-hidden hidden max-h-60 overflow-y-auto"></div>
        </div>
        <div id="map-container" class="rounded-2xl shadow-xl overflow-hidden border border-gray-200 z-0"></div>
    </div >
                `;
            setTimeout(() => {
                window.map = L.map('map-container').setView([35.0, 38.0], 7);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap'
                }).addTo(window.map);
                window.mapMarkers = [];
                window.db.forEach(place => {
                    if (place.coords) {
                        const content = place.content[window.currentLang] || place.content['tr'];
                        const marker = L.marker(place.coords).addTo(window.map);
                        const popupContent = `< div class="text-center p-2" >
        <h3 class="font-bold text-sm mb-2">${content.name}</h3><img src="${place.images[0]}"
            class="w-full h-24 object-cover rounded-md mb-2" onerror="this.src='https://via.placeholder.com/150'"
            referrerpolicy="no-referrer"><button onclick="router('detail', ${place.id})"
            class="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-orange-700 transition w-full">${texts.readMore}</button>
    </div>`;
                        marker.bindPopup(popupContent);
                        marker.placeData = { id: place.id, name: content.name.toLowerCase() };
                        window.mapMarkers.push(marker);
                    }
                });
                if (window.mapMarkers.length > 0) window.map.fitBounds(new L.featureGroup(window.mapMarkers).getBounds().pad(0.1));
                window.map.invalidateSize();
            }, 300);
        }

        // ... (Diğer fonksiyonlar: filterMapMarkers, setLanguage, updateUIText, filterPlaces, toggleMobileMenu, openModal,
        closeModal, openLightbox, updateLightboxImage, closeLightbox, forceCloseLightbox, nextImage, prevImage)
        function filterMapMarkers() {
            const input = document.getElementById('mapSearchInput');
            const filter = input.value.toLowerCase();
            const resultsContainer = document.getElementById('mapSearchResults');
            resultsContainer.innerHTML = '';
            if (filter.length < 1) { resultsContainer.classList.add('hidden'); return; } let hasResults = false;
            window.mapMarkers.forEach(marker => {
                if (marker.placeData.name.includes(filter)) {
                    hasResults = true;
                    const div = document.createElement('div');
                    div.className = 'p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm
                    font - medium';
                    const place = window.db.find(p => p.id === marker.placeData.id);
                    const originalName = (place.content[window.currentLang] || place.content['tr']).name;
                    div.innerHTML = `< i class="fa-solid fa-location-dot text-primary mr-2" ></i > ${originalName} `;
                    div.onclick = function () {
                        window.map.flyTo(marker.getLatLng(), 16); marker.openPopup();
                        resultsContainer.classList.add('hidden'); input.value = originalName;
                    };
                    resultsContainer.appendChild(div);
                }
            });
            resultsContainer.classList.toggle('hidden', !hasResults);
            if (!hasResults) {
                resultsContainer.innerHTML = `< div class="p-3 text-gray-500 text-sm" > Sonuç bulunamadı</div >`;
                resultsContainer.classList.remove('hidden');
            }
        }

        function setLanguage(lang) {
            window.currentLang = lang;
            const isRTL = (lang === 'ar' || lang === 'osm');
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
            if (isRTL) { document.body.classList.add('font-arabic'); document.body.classList.remove('font-sans'); }
            else { document.body.classList.add('font-sans'); document.body.classList.remove('font-arabic'); }
            const flagImg = document.getElementById('current-lang-flag');
            if (flagImg && flags[lang]) { flagImg.src = flags[lang]; flagImg.alt = lang.toUpperCase(); }
            updateUIText();
            if (window.currentView === 'home') renderHome(); else if (window.currentView === 'map') renderMap(); else
                renderDetail(window.currentPlaceId);
        }

        function updateUIText() {
            const texts = uiText[window.currentLang];
            document.getElementById('nav-title').innerText = texts.siteName;
            document.getElementById('nav-subtitle').innerText = texts.siteSubtitle;
            document.getElementById('current-lang-label').innerText = window.currentLang.toUpperCase();
            document.getElementById('menu-home').innerText = texts.menuHome;
            document.getElementById('menu-map').innerText = texts.menuMap;
            document.getElementById('menu-about').innerText = texts.menuAbout;
            document.getElementById('menu-contact').innerText = texts.menuContact;
            document.getElementById('mobile-menu-home').innerText = texts.menuHome;
            document.getElementById('mobile-menu-map').innerText = texts.menuMap;
            document.getElementById('mobile-menu-about').innerText = texts.menuAbout;
            document.getElementById('mobile-menu-contact').innerText = texts.menuContact;
            if (window.currentLang === 'ar' || window.currentLang === 'osm')
                document.getElementById('footer-text').innerText = "© 2025 مشروع التراث السوري. جميع الحقوق محفوظة.";
            else document.getElementById('footer-text').innerText = "© 2025 Syrian Heritage Project. All rights reserved.";
        }

        function filterPlaces() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const cards = document.querySelectorAll('.card-item');
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                if (text.includes(query)) card.style.display = 'flex'; else card.style.display = 'none';
            });
        }
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu'); if
                (menu.classList.contains('open')) menu.classList.remove('open'); else menu.classList.add('open');
        }
        function openModal(type) {
            const modal = document.getElementById('infoModal'); const title =
                document.getElementById('modalTitle'); const body = document.getElementById('modalBody'); const texts =
                    uiText[window.currentLang]; if (type === 'about') {
                        title.innerText = texts.aboutTitle; body.innerHTML =
                            texts.aboutBody;
                    } else if (type === 'contact') {
                        title.innerText = texts.contactTitle; body.innerHTML =
                            texts.contactBody;
                    } modal.classList.remove('hidden'); setTimeout(() => {
                        modal.classList.remove('opacity-0');
                        document.getElementById('modalContent').classList.remove('scale-95');
                        document.getElementById('modalContent').classList.add('scale-100');
                    }, 10);
        }
        function closeModal() {
            const modal = document.getElementById('infoModal'); modal.classList.add('opacity-0');
            document.getElementById('modalContent').classList.remove('scale-100');
            document.getElementById('modalContent').classList.add('scale-95'); setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
        function openLightbox(index, images) {
            if (images) { window.currentGalleryImages = images; } else {
                if
                    (window.currentGalleryImages.length === 0) return;
            } window.currentImageIndex = index; updateLightboxImage();
            const lightbox = document.getElementById('lightbox'); lightbox.classList.remove('hidden'); setTimeout(() => {
                lightbox.classList.remove('opacity-0');
            }, 10);
        }
        function updateLightboxImage() {
            const img = document.getElementById('lightbox-img'); img.src =
                window.currentGalleryImages[window.currentImageIndex];
        }
        function closeLightbox(e) {
            if (e && e.target.id !== 'lightbox' && !e.target.closest('button')) return; const
                lightbox = document.getElementById('lightbox'); lightbox.classList.add('opacity-0'); setTimeout(() => {
                    lightbox.classList.add('hidden'); document.getElementById('lightbox-img').src = "";
                }, 300);
        }
        function forceCloseLightbox() {
            const lightbox = document.getElementById('lightbox');
            lightbox.classList.add('opacity-0'); setTimeout(() => { lightbox.classList.add('hidden'); }, 300);
        }
        function nextImage(e) {
            if (e) e.stopPropagation(); window.currentImageIndex = (window.currentImageIndex + 1) %
                window.currentGalleryImages.length; updateLightboxImage();
        }
        function prevImage(e) {
            if (e) e.stopPropagation(); window.currentImageIndex = (window.currentImageIndex - 1 +
                window.currentGalleryImages.length) % window.currentGalleryImages.length; updateLightboxImage();
        }
        document.addEventListener('keydown', function (e) {
            const lightbox = document.getElementById('lightbox'); if
                (lightbox.classList.contains('hidden')) return; if (e.key === 'Escape') forceCloseLightbox(); if (e.key ===
                    'ArrowRight') nextImage(); if (e.key === 'ArrowLeft') prevImage();
        });
        window.onclick = function (event) { if (event.target == document.getElementById('infoModal')) closeModal(); }
