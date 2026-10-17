# ScopeLock 🔒

> **"Kapsam Kaymasını (Scope Creep) Durdurun, Emeğinizi Koruyun."**
> Ajanslar ve freelancerlar için tek tıkla şifresiz müşteri revizyon onay ve imza sistemi.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000)](https://vercel.com/)

---

## 🌐 Canlı Demo

> **[https://scopelock-demo.vercel.app](https://scopelock-demo.vercel.app)** *(Demo linki yakında aktif)*

---

## ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 🏢 **Ajans Paneli** | Şifre korumalı giriş, proje ve onay talebi yönetimi |
| ✍️ **Dijital İmza** | Müşteri imzası veya tek tıklık onay mühürü (mobil uyumlu) |
| 🔗 **Şifresiz Müşteri Portalı** | Kayıt veya şifre gerektirmeyen sihirli link sistemi |
| 📄 **PDF Sözleşme** | Zaman damgalı, kurumsal görünümlü onay belgesi üretimi |
| 📧 **E-posta Bildirimleri** | Resend ile ajansa ve müşteriye anlık e-posta |
| 🛡️ **RLS Güvenliği** | Supabase Row Level Security ile veri izolasyonu |
| 🔄 **Revizyon Akışı** | Müşteri not ekleyerek revizyon talep edebilir |
| ❤️ **Health Check** | `/api/health` endpoint'i ile uptime izleme |

---

## 🏗️ Teknik Altyapı (Tech Stack)

- **Web Çatısı:** Next.js 15 (App Router & Server Actions)
- **Arayüz & Stil:** Tailwind CSS + Shadcn/ui
- **Veritabanı & Giriş (Auth):** Supabase (PostgreSQL + RLS + Storage)
- **İmza & Onay:** `react-signature-canvas` (Mobil dokunmatik imza veya tek tık onay mühürü)
- **PDF Üretimi:** `@react-pdf/renderer` (Zaman damgalı, yasal görünümlü onay belgesi)
- **E-posta & Bildirim:** Resend
- **Yayınlama:** Vercel

---

## 🗄️ Veritabanı Mimarisi (3 Ana Tablo)

```
agencies
  └── id, user_id, name, email, created_at, updated_at

projects
  └── id, agency_id, name, client_name, client_email, created_at, updated_at

signoffs
  └── id, project_id, agency_id, title, description, additional_fee,
      file_url, status (beklemede | onaylandi | revizyon_istendi),
      token, signature_data, signed_at, signer_ip,
      revision_notes, pdf_url, created_at, updated_at
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı
- Resend hesabı (e-posta bildirimleri için)

### Adımlar

1. **Repoyu klonlayın:**
   ```bash
   git clone https://github.com/BurakGuldal10/ScopeLock.git
   cd ScopeLock
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini yapılandırın:**
   ```bash
   cp .env.example .env.local
   ```
   Ardından `.env.local` dosyasını kendi değerlerinizle doldurun (bkz. [Ortam Değişkenleri](#-ortam-değişkenleri)).

4. **Supabase veritabanını kurun:**
   Supabase SQL Editor'da şu dosyayı çalıştırın:
   ```
   supabase/migrations/01_init.sql
   ```

5. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

---

## 🔑 Ortam Değişkenleri

`.env.example` dosyasındaki değişkenlerin açıklaması:

| Değişken | Açıklama | Örnek |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonim (public) anahtar | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase servis rol anahtarı (sunucu tarafı) | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_URL` | Uygulamanızın genel URL'si | `https://scopelock-demo.vercel.app` |
| `RESEND_API_KEY` | Resend e-posta API anahtarı | `re_abc123...` |

> ⚠️ **UYARI:** `SUPABASE_SERVICE_ROLE_KEY` ve `RESEND_API_KEY` değerlerini asla public repoya ya da client-side koda dahil etmeyin!

---

## 📜 Kullanılabilir Scriptler

```bash
npm run dev        # Geliştirme sunucusunu başlatır (hot reload)
npm run build      # Prodüksiyona hazır derleme yapar
npm run start      # Prodüksiyon sunucusunu başlatır
npm run lint       # ESLint ile kod kalitesi kontrolü
npm run typecheck  # TypeScript tip kontrolü (tsc --noEmit)
```

---

## 🛣️ Geliştirme Yol Haritası

- [x] **1. Aşama:** Temel mimari — Next.js 15, Supabase şeması, RLS politikaları
- [x] **2. Aşama:** Ajans yönetim paneli — Dashboard, onay talebi oluşturma, Server Actions
- [x] **3. Aşama:** Müşteri onay portalı — Şifresiz magic link, dijital imza, revizyon akışı
- [x] **4. Aşama:** PDF üretimi + Resend e-posta bildirimleri
- [x] **5. Aşama:** Canlıya alma, README finalizasyonu & GitHub vitrin

---

## 🤝 Katkıda Bulunmak

Projeye katkıda bulunmak ister misiniz? Harika! Lütfen [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

---

## 👥 Çekirdek Ekip

| İsim | Rol |
|---|---|
| 🍑 **Armut** | Proje Lideri & Teknik Direktör |
| 🧑‍💻 **Vanlı** | Kıdemli Full-Stack Yazılımcı |
| 🛡️ **Ali Oda** | Siber Güvenlik Uzmanı |
| 🧪 **Jony** | Test & Kalite Uzmanı |

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır.
