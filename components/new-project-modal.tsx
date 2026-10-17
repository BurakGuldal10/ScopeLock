'use client';

import { useState } from 'react';
import { Plus, FolderPlus, X, Loader2 } from 'lucide-react';
import { createProject } from '@/app/actions/signoffs';

interface NewProjectModalProps {
  onProjectCreated?: () => void;
}

export function NewProjectModal({ onProjectCreated }: NewProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);

    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Proje oluşturulamadı.');
    } else {
      setIsOpen(false);
      if (onProjectCreated) onProjectCreated();
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
      >
        <FolderPlus className="w-3.5 h-3.5" />
        Yeni Proje Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Yeni Proje Oluştur</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proje Adı *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Örn: E-Ticaret Yenileme"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Müşteri Adı / Yetkili *
                </label>
                <input
                  name="client_name"
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Müşteri E-postası *
                </label>
                <input
                  name="client_email"
                  type="email"
                  required
                  placeholder="Örn: ahmet@sirket.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Proje Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
