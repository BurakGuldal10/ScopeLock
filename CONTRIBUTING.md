# ScopeLock'a Katkıda Bulunmak 🤝

Öncelikle vakit ayırıp bu projeye katkıda bulunmayı düşündüğünüz için teşekkür ederiz! 🎉

Aşağıdaki kurallar, katkı sürecini herkes için düzgün ve verimli tutmak için hazırlanmıştır.

---

## 📋 İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunabilirim?](#nasıl-katkıda-bulunabilirim)
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Commit Mesajı Kuralları](#commit-mesajı-kuralları)
- [Pull Request Süreci](#pull-request-süreci)
- [Kod Standartları](#kod-standartları)

---

## 🤝 Davranış Kuralları

Bu proje saygılı ve kapsayıcı bir ortam benimsemektedir. Tüm katılımcıların:

- Birbirlerine saygılı ve yapıcı bir dille iletişim kurmaları,
- Eleştirilerini kişilere değil, koda yöneltmeleri,
- Farklı bakış açılarını ve deneyimleri kabul etmeleri beklenmektedir.

---

## 🛠️ Nasıl Katkıda Bulunabilirim?

### 🐛 Hata Bildirimi

1. GitHub Issues sayfasında mevcut hataları kontrol edin.
2. Hata yoksa yeni bir Issue açın ve şunları ekleyin:
   - Hatanın net bir açıklaması
   - Hatayı yeniden oluşturma adımları
   - Beklenen ve gerçekleşen davranış
   - Kullandığınız Node.js/npm versiyonu

### 💡 Yeni Özellik Önerisi

1. Önce bir Issue açarak özelliği tartışmaya açın.
2. Onay aldıktan sonra geliştirmeye başlayın.
3. Küçük ve odaklı PR'lar oluşturun.

### 📝 Dokümantasyon İyileştirmesi

Yazım hataları, eksik açıklamalar veya daha iyi örnekler için doğrudan PR açabilirsiniz.

---

## ⚙️ Geliştirme Ortamı Kurulumu

```bash
# 1. Repoyu fork'layın ve klonlayın
git clone https://github.com/KULLANICI_ADINIZ/ScopeLock.git
cd ScopeLock

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini yapılandırın
cp .env.example .env.local
# .env.local dosyasını kendi Supabase & Resend değerlerinizle doldurun

# 4. Supabase veritabanını kurun
# supabase/migrations/01_init.sql dosyasını SQL Editor'da çalıştırın

# 5. Geliştirme sunucusunu başlatın
npm run dev
```

---

## 📝 Commit Mesajı Kuralları

Bu projede **Conventional Commits** standardı uygulanmaktadır:

```
<tip>(<kapsam>): <kısa açıklama>

[isteğe bağlı gövde]

[isteğe bağlı alt bilgi]
```

### Commit Tipleri

| Tip | Açıklama |
|---|---|
| `feat` | Yeni bir özellik eklendi |
| `fix` | Bir hata düzeltildi |
| `docs` | Sadece dokümantasyon değişikliği |
| `style` | Kod mantığını etkilemeyen biçimlendirme |
| `refactor` | Hata düzeltmesi veya özellik eklenmeden yapılan kod değişikliği |
| `test` | Test ekleme veya güncelleme |
| `chore` | Build süreci veya yardımcı araç değişikliği |
| `perf` | Performans iyileştirmesi |
| `security` | Güvenlik yaması veya iyileştirmesi |

### Örnekler

```bash
feat(dashboard): add signoff status filter

fix(pdf): handle missing signature data gracefully

docs(readme): add env variable descriptions

security(api): add rate limiting to health endpoint
```

---

## 🔄 Pull Request Süreci

1. **Fork** yapın ve `main`'den yeni bir branch açın:
   ```bash
   git checkout -b feat/ozellik-adiniz
   ```

2. Değişikliklerinizi yapın ve commit'leyin (Conventional Commits kurallarına uyun).

3. Göndermeden önce kontroller:
   ```bash
   npm run lint       # Lint hatası yok mu?
   npm run typecheck  # TypeScript hataları yok mu?
   npm run build      # Derleme başarılı mı?
   ```

4. PR açın ve şunları açıklayın:
   - Ne değişti ve neden?
   - Test ettiniz mi? Nasıl?
   - İlgili Issue varsa `Closes #123` ile referans verin.

5. En az **bir ekip üyesinin** incelemesi ve onayı beklenmektedir.

> ⚠️ **DİKKAT:** Güvenlik açığı bulduysanız lütfen doğrudan Issue açmayın. Proje ekibiyle özel olarak iletişime geçin.

---

## 📐 Kod Standartları

### TypeScript

- `any` tipinden kaçının; kesin tipler kullanın.
- Her fonksiyon ve bileşen için açıklayıcı isimler seçin.
- Server Actions'ı güvenli şekilde kullanın; hassas işlemleri istemci tarafında yapmayın.

### Next.js / React

- Bileşenleri küçük ve tek sorumlu tutun.
- Server Components'i mümkün olduğunca tercih edin.
- `use client` direktifini yalnızca gerçekten gerektiğinde kullanın.

### Güvenlik

- Kullanıcı girdilerini her zaman Zod ile doğrulayın.
- API route'larında kimlik doğrulaması kontrol edin.
- Hiçbir zaman gerçek API anahtarı veya şifre commit'lemeyin.
- `.env.local` dosyasının `.gitignore`'da olduğundan emin olun.

---

## 📄 Lisans

Bu projeye katkıda bulunarak, katkılarınızın [MIT Lisansı](LICENSE) kapsamında lisanslanacağını kabul etmiş olursunuz.

---

*Katkılarınız için şimdiden teşekkürler! 🍑 — Armut & ScopeLock Ekibi*
