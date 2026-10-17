import Link from 'next/link';
import { ShieldCheck, FileSignature, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">ScopeLock</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Ajans Girişi
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
            <Zap className="w-3.5 h-3.5" />
            Kapsam Kaymasını (Scope Creep) Durdurun
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Müşterilerinizden revizyon onayını <br className="hidden sm:inline" />
            <span className="text-indigo-600">tek tıkla ve yasal güçte</span> alın.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            WhatsApp ve e-posta karmaşasına son. Şifresiz sihirli linkle müşteriniz mobilde tek tıkla onaylasın veya imzasını atsın, zaman damgalı resmi PDF anında üretilsin.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
            >
              Ajans Paneline Git
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>

        {/* 3 Steps / Highlights */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <FileSignature className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">1. Onay Talebi Oluştur</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Yapılan işi, kapsamı ve varsa ek ücreti girin. Anında benzersiz sihirli link üretilsin.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">2. Şifresiz Müşteri Onayı</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Müşteri şifre açmaz. Linke tıklar, mobilde parmağıyla imzalar veya tek tıkla onaylar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">3. Zaman Damgalı PDF</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                IP adresi ve zaman damgasıyla yasal görünümlü tek sayfalık PDF üretilir ve taraflara iletilir.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 border-t bg-white">
        © {new Date().getFullYear()} ScopeLock. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
