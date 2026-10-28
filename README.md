# Koztech Music

Tamamen özelleştirilebilir bir müzik dinleme sayfası. Müzikler [Internet Archive](https://archive.org) üzerinden çekilir; kullanıcı sayfasını araçlar (widget), arka planlar ve animasyonlarla dilediği gibi tasarlar.

Internet Archive ses dosyalarını CORS izniyle sunduğu için ses Web Audio API'den geçer: ekolayzer ve görselleştiriciler gerçek ses verisiyle çalışır.

## Kullanım

- **Düzenle**: Araçları sürükle, kenarlarından boyutlandır, çoğalt veya kaldır. Bir araca tıklayınca ayarları açılır.
- **Özelleştir**: Araç ekle, tema, arka plan, animasyonlar ve hazır stiller.
- **Geri al / İleri al**: Araç çubuğundaki oklar veya Ctrl+Z / Ctrl+Y.
- **Sayfa**: Sayfa ekran boyuna göre ölçeklenir; yeni araçlar boş alana yerleşir. Tema sekmesinden sayfa yüksekliği (1–4 ekran) artırılabilir veya araçlar tek ekrana sığdırılabilir.
- **Dil**: English (varsayılan), Türkçe, Español, Deutsch, Français.
- Tasarım tarayıcıda otomatik kaydedilir; JSON olarak dışa/içe aktarılabilir.

## Araçlar (15)

| Araç | Açıklama |
|---|---|
| Oynatıcı | Oynat/duraklat, önceki/sonraki, karıştır, tekrar, ilerleme, ses |
| Şimdi Çalan | Kapak, şarkı, sanatçı, albüm |
| Kütüphane | Internet Archive araması, tür etiketleri, albümler; kendi MP3 dosyalarını ekleme |
| Çalma Sırası | Sıradaki parçalar |
| Ekolayzer | 10 bant, hazır ayarlar (Bass Boost, Vokal, Rock, Lo-fi…) |
| Müzik Dairesi | Kapağın etrafında dönen ritim halkası (çubuk / dalga) |
| Spektrum | Frekans çubukları, ayna, renk geçişi, tepe çizgileri |
| Dalga Formu | Osiloskop |
| Plak | Dönen plak, iğne kolu, basa tepki |
| VU Metre | Ses seviyesi göstergesi |
| Saat, Metin, Görsel, Notlar | Sayfayı kişiselleştirmek için |

Her aracın ortak ayarları: panel arka planı, iç boşluk, animasyon (süzülme, ritimle büyüme, ritimle parlama, sallanma).

## Animasyon katmanları (10)

Yıldızlar, parçacıklar, kar, yağmur, baloncuklar, ateş böcekleri, kayan yıldızlar, ritim halkaları, aurora, alt spektrum. Her biri renk, yoğunluk, hız, görünürlük ve müziğe tepki ayarına sahiptir; üst üste eklenebilir.

## Tema ve arka plan

- Vurgu ve yazı rengi, 12 yazı tipi, panel rengi/saydamlığı, cam bulanıklığı, köşe yuvarlaklığı, aralık, kenarlık, gölge
- Arka plan: düz renk, (hareketli) renk geçişi, görsel/GIF veya video bağlantısı, dosya yükleme; karartma, bulanıklık, ritimle yakınlaşma
- 8 hazır stil: Gece Moru, Neon Şehir, Lo-fi Oda, Kâğıt, Okyanus, Kar Gecesi, Retro Arcade, Minimal Siyah

## Çalıştırma

```bash
npm install
npm run dev
```

## Teknolojiler

React, TypeScript, Vite, Zustand, react-grid-layout, Web Audio API, Internet Archive API
