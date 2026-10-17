# ScopeLock 🛡️

> **"Kapsam Kaymasını (Scope Creep) Durdurun, Emeğinizi Koruyun."**  
> Ajanslar ve freelancerlar için tek tıkla şifresiz müşteri revizyon onay ve imza sistemi.

---

## ⚡ Teknik Altyapı (Tech Stack)

En az bakım gerektiren ve en hızlı geliştirilen modern araçlar:

- **Web Çatısı:** Next.js 15 (App Router & Server Actions)
- **Arayüz & Stil:** Tailwind CSS + Shadcn/ui
- **Veritabanı & Giriş (Auth):** Supabase (PostgreSQL + RLS + Storage)
- **İmza & Onay:** `react-signature-canvas` (Mobil dokunmatik imza veya tek tık onay mührü)
- **PDF Üretimi:** `@react-pdf/renderer` (Zaman damgalı, yasal görünümlü tek sayfalık onay belgesi)
- **E-posta & Bildirim:** Resend
- **Yayınlama:** Vercel

---

## 🏗️ 10-12 Günlük İnşaat Planı

- [x] **1. Aşama: Temel ve Veritabanı (1. - 2. Gün)**
  - Next.js ve Supabase bağlantısı
  - 3 ana tablo: `agencies`, `projects`, `signoffs`
  - Sıkı RLS (Row Level Security) kuralları ve şifresiz sihirli link token mekanizması
- [ ] **2. Aşama: Ajans Yönetim Paneli (3. - 5. Gün)**
  - Ajans giriş ve sade kontrol paneli
  - "Yeni Onay Talebi Oluştur" formu (Başlık, Kapsam, Ek Tutar, Dosya)
  - Müşteri için anında sihirli link üretimi (`/view/[token]`)
- [ ] **3. Aşama: Müşteri Onay Sayfası (6. - 8. Gün)**
  - Müşteri için sıfır kayıt / sıfır şifre kuralı
  - Mobil uyumlu onay ekranı
  - Yeşil Buton: "Kapsamı Onaylıyorum" (İmza / Mühür)
  - Kırmızı Buton: "Revizyon İste" (Not ekleme)
- [ ] **4. Aşama: Bildirim ve PDF Üretimi (9. - 10. Gün)**
  - Zaman damgası ve IP kaydı
  - Tek sayfalık kurumsal onay PDF belgesi
  - Resend ile ajansa ve müşteriye anında e-posta bildirimi
  - Ajans panelinin yeşile dönmesi: *"İşe başlayabilirsiniz!"*
- [ ] **5. Aşama: Canlıya Alma & İlk Deneme (11. - 12. Gün)**
  - Vercel dağıtımı
  - Pilot ajans ve freelancer testleri

---

## 🗄️ Veritabanı Mimarisi (3 Ana Tablo)

1. **`agencies`**
   - `id`, `user_id`, `name`, `email`, `created_at`, `updated_at`
2. **`projects`**
   - `id`, `agency_id`, `name`, `client_name`, `client_email`, `created_at`, `updated_at`
3. **`signoffs`**
   - `id`, `project_id`, `agency_id`, `title`, `description`, `additional_fee`, `file_url`, `status` (`'beklemede'` | `'onaylandi'` | `'revizyon_istendi'`), `token`, `signature_data`, `signed_at`, `signer_ip`, `revision_notes`, `pdf_url`, `created_at`, `updated_at`

---

## 🚀 Kurulum

1. Depoyu klonlayın veya çalışma dizinine geçin.
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. `.env.local` dosyasını yapılandırın (`.env.example` referansıyla):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   RESEND_API_KEY=re_your_api_key
   ```
4. Supabase SQL Editor'da `supabase/migrations/01_init.sql` dosyasını çalıştırın.
5. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

---

## 👥 Çekirdek Ekip

- **Armut**: Proje Lideri & Teknik Direktör
- **Vanlı**: Kıdemli Full-Stack Yazılımcı
- **Ali Oda**: Siber Güvenlik Uzmanı
- **Jony**: Test & Kalite Uzmanı
