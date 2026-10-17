import { notFound } from 'next/navigation';
import { 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  Calendar, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { getSignoffByToken } from '@/app/actions/client-signoff';
import { ClientViewAction } from '@/components/client-view-action';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ClientSignoffPage({ params }: PageProps) {
  const { token } = await params;
  const signoff = await getSignoffByToken(token);

  if (!signoff) {
    return notFound();
  }

  const hasFee = Number(signoff.additional_fee) > 0;

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">
                Kapsam & Revizyon Onay Belgesi
              </span>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {signoff.agency?.name || 'Ajans'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Tarih</span>
            <span className="text-xs font-semibold text-slate-200">
              {formatDate(signoff.created_at)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Project & Client Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Proje
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {signoff.project?.name}
              </h3>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sayın Yetkili
              </span>
              <span className="font-semibold text-sm text-slate-800">
                {signoff.project?.client_name}
              </span>
            </div>
          </div>

          {/* Request Title & Fee */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {signoff.title}
              </h1>

              {hasFee ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-sm whitespace-nowrap self-start">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  Ek Ücret: {formatCurrency(signoff.additional_fee)}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold self-start">
                  Ek Ücret Bulunmamaktadır
                </div>
              )}
            </div>

            {/* Scope / Details Box */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Yapılan İş ve Kapsam Detayları
              </span>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {signoff.description}
              </p>
            </div>
          </div>

          {/* Optional Attachment / Design Image */}
          {signoff.file_url && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                Ekli Tasarım / Önizleme Görseli
              </span>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group relative">
                <img
                  src={signoff.file_url}
                  alt="Kapsam Görseli"
                  className="w-full max-h-80 object-cover object-top hover:scale-[1.01] transition duration-200"
                />
                <a
                  href={signoff.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur text-xs font-semibold text-slate-800 shadow-md hover:bg-white transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Tam Boyut Aç
                </a>
              </div>
            </div>
          )}

          {/* Interactive Actions (Green "Kapsamı Onaylıyorum" & Red "Revizyon İste") */}
          <ClientViewAction signoff={signoff} />

          {/* Legal / Security Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-1">
            <p className="text-[11px] text-slate-400">
              🔒 Bu sayfa ScopeLock dijital mutabakat sistemi üzerinden zaman damgası ve IP kaydı ile yasal güvence altındadır. Müşteriden hesap veya şifre talep edilmez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
