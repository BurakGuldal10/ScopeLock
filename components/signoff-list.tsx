'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  DollarSign, 
  User, 
  Calendar,
  Download 
} from 'lucide-react';
import { Signoff, Project } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SignoffListProps {
  signoffs: (Signoff & { project: Project })[];
}

export function SignoffList({ signoffs }: SignoffListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(token: string, id: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const magicUrl = `${origin}/view/${token}`;
    try {
      await navigator.clipboard.writeText(magicUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  }

  if (signoffs.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Henüz Onay Talebi Yok</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Müşterinizden revizyon veya kapsam onayı almak için yukarıdaki butondan ilk talebinizi oluşturun.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {signoffs.map((item) => {
        const isApproved = item.status === 'onaylandi';
        const isRevision = item.status === 'revizyon_istendi';
        const isPending = item.status === 'beklemede';

        return (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all ${
              isApproved
                ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                : isRevision
                ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {item.project?.name || 'Proje'}
                  </span>

                  {/* Status Badge */}
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Onaylandı (İşe Başlayabilirsiniz!)
                    </span>
                  )}
                  {isRevision && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Revizyon İstendi
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Müşteri Onayı Bekleniyor
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Revision Notes if any */}
                {isRevision && item.revision_notes && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-100/70 border border-rose-200 text-xs text-rose-900">
                    <span className="font-bold">Müşteri Notu: </span>
                    {item.revision_notes}
                  </div>
                )}

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {item.project?.client_name} ({item.project?.client_email})
                  </div>
                  {item.additional_fee > 0 && (
                    <div className="flex items-center gap-0.5 font-semibold text-emerald-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      Ek Ücret: {formatCurrency(item.additional_fee)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  onClick={() => copyLink(item.token, item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Sihirli Onay Linkini Kopyala"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Linki Kopyala
                    </>
                  )}
                </button>

                <Link
                  href={`/view/${item.token}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                  title="Müşteri Görünümünü Aç"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Müşteri Ekranı
                </Link>

                {isApproved && (
                  <a
                    href={`/api/pdf/${item.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                    title="Resmi Onay Belgesini (PDF) Aç"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF Belgesi
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
