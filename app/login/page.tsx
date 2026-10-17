'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Loader2, Lock, Mail, Building } from 'lucide-react';
import { loginAction, signupAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const action = isSignUp ? signupAction : loginAction;
    const res = await action(formData);

    if (res && res.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">ScopeLock</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">
          {isSignUp ? 'Yeni Ajans Hesabı Oluşturun' : 'Ajans Yönetim Paneline Giriş'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {isSignUp
            ? 'Müşterilerinizden saniyeler içinde yasal onay almaya başlayın.'
            : 'Onay taleplerinizi ve revizyon durumlarınızı takip edin.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium">
                {error}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ajans / Şirket Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    name="agency_name"
                    type="text"
                    required
                    placeholder="Örn: Studio Nova"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ajans@sirketiniz.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm disabled:opacity-50 transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? 'Ajans Hesabı Aç' : 'Giriş Yap'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold"
            >
              {isSignUp
                ? 'Zaten bir hesabınız var mı? Giriş Yapın'
                : 'Hesabınız yok mu? Yeni Ajans Hesabı Oluşturun'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-700 font-medium underline"
            >
              Doğrudan Demo Paneline Geç →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
