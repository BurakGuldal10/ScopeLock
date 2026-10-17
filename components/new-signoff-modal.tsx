'use client';

import { useState } from 'react';
import { Plus, X, Link as LinkIcon, Check, Copy, ExternalLink, Loader2, MessageSquareShare } from 'lucide-react';
import { createSignoff } from '@/app/actions/signoffs';
import { Project } from '@/lib/types';

interface NewSignoffModalProps {
  projects: Project[];
  onCreated?: () => void;
}

export function NewSignoffModal({ projects, onCreated }: NewSignoffModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    setGeneratedLink(null);
    setError(null);
    setCopied(false);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    if (generatedLink && onCreated) {
      onCreated();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createSignoff(formData);

    setLoading(false);
    if (!result.success || !result.token) {
      setError(result.error || 'Onay talebi oluşturulamadı.');
    } else {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const magicUrl = `${origin}/view/${result.token}`;
      setGeneratedLink(magicUrl);
      if (onCreated) onCreated();
    }
  }

  async function copyToClipboard() {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all"
      >
        <Plus className="w-4 h-4" />
        Yeni Onay Talebi Oluştur
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Yeni Onay Talebi Oluştur</h3>
                  <p className="text-xs text-slate-500">Müşteriye tek tıkla imzalatacağınız sihirli link üretin.</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Link Generated Successfully */}
            {generatedLink ? (
              <div className="p-6 text-center space-y-5">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900">Sihirli Onay Linki Hazır!</h4>
                  <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                    Bu linki müşterinize gönderin. Müşteri şifre açmadan mobilden veya tarayıcıdan anında onaylayıp imzalayabilir.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-700 outline-none select-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Kopyalandı!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Kopyala
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Merhaba, revizyon ve kapsam onay talebimizi şu link üzerinden tek tıkla inceleyip onaylayabilirsiniz: ${generatedLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                  >
                    <MessageSquareShare className="w-4 h-4" />
                    WhatsApp ile Gönder
                  </a>
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Önizle
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Tamam, Panele Dön
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 text-xs rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium">
                    {error}
                  </div>
                )}

                {/* Project Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    İlgili Proje *
                  </label>
                  {projects.length > 0 ? (
                    <select
                      name="project_id"
                      required
                      defaultValue={projects[0]?.id}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.client_name})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 text-xs rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      Önce en az bir proje oluşturmalısınız.
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Talep Başlığı *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="Örn: Ana Sayfa Revizyonu v2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Scope / Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapsam ve Detaylar * (Neler yapıldı, neleri kapsıyor?)
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Örn: Müşterinin talebi üzerine ana sayfa banner alanı yenilendi, mobil menü butonları büyütüldü ve sepet ikonuna animasyon eklendi..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Additional Fee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Varsa Ek Tutar ($ USD)
                  </label>
                  <input
                    name="additional_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    placeholder="Örn: 200"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ek ücret yoksa 0 bırakabilirsiniz.
                  </p>
                </div>

                {/* File / Image Upload URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dosya / Tasarım Görsel Linki (Opsiyonel)
                  </label>
                  <input
                    name="file_url"
                    type="url"
                    placeholder="https://... (Figma, Supabase Storage veya görsel linki)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={loading || projects.length === 0}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm disabled:opacity-50 transition"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Kaydet ve Sihirli Link Üret
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
