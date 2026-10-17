'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Loader2, 
  ShieldCheck, 
  Calendar, 
  FileCheck2, 
  AlertCircle,
  FileSignature
} from 'lucide-react';
import { approveSignoffAction, requestRevisionAction, SignoffDetails } from '@/app/actions/client-signoff';
import { SignaturePad } from '@/components/signature-pad';
import { formatDate } from '@/lib/utils';

interface ClientViewActionProps {
  signoff: SignoffDetails;
}

export function ClientViewAction({ signoff }: ClientViewActionProps) {
  const [modalType, setModalType] = useState<'approve' | 'revision' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(signoff.status);
  const [currentNotes, setCurrentNotes] = useState(signoff.revision_notes);
  const [currentSignature, setCurrentSignature] = useState(signoff.signature_data);
  const [signedAt, setSignedAt] = useState(signoff.signed_at);
  const [signerIp, setSignerIp] = useState(signoff.signer_ip);

  // If already approved
  if (currentStatus === 'onaylandi') {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <FileCheck2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div>
          <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-emerald-600 text-white shadow-xs mb-2">
            Resmi Onay Belgesi
          </span>
          <h3 className="text-xl font-black text-emerald-950">
            Bu Kapsam ve Revizyon Başarıyla Onaylanmıştır
          </h3>
          <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
            Sayın {signoff.project.client_name}, onayınız ajansınıza iletilmiştir. Çalışmalar bu kapsam doğrultusunda başlatılmıştır.
          </p>
        </div>

        {/* Signature & Audit Stamp */}
        <div className="max-w-md mx-auto p-4 rounded-xl bg-white border border-emerald-200 text-left space-y-3 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Dijital İmza & Onay Kaydı
          </div>

          {currentSignature && (
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <img
                src={currentSignature}
                alt="Müşteri İmzası"
                className="max-h-24 max-w-full object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400">Onaylayan:</span>
              <span className="font-semibold text-slate-800">{signoff.project.client_name}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Zaman Damgası:</span>
              <span className="font-semibold text-slate-800">
                {signedAt ? formatDate(signedAt) : 'Kayıtlı'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If revision requested
  if (currentStatus === 'revizyon_istendi') {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 animate-in fade-in">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3 className="text-lg font-bold text-rose-950">
          Revizyon Talebiniz Ajansa İletildi
        </h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          Geri bildiriminiz başarıyla kaydedildi. Ajansınız gerekli düzeltmeleri yapıp yeni kapsamı size iletecektir.
        </p>
        {currentNotes && (
          <div className="max-w-md mx-auto p-3 bg-white rounded-xl border border-rose-200 text-left text-xs text-slate-700">
            <span className="font-bold text-rose-900 block mb-1">İlettiğiniz Not:</span>
            {currentNotes}
          </div>
        )}
      </div>
    );
  }

  // Handle Approve Action
  async function handleApprove(signatureData: string) {
    setLoading(true);
    setError(null);

    const res = await approveSignoffAction(
      signoff.token,
      signatureData,
      signoff.project.client_name
    );

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Onay işlemi tamamlanamadı.');
    } else {
      setCurrentSignature(signatureData);
      setCurrentStatus('onaylandi');
      setSignedAt(new Date().toISOString());
      setModalType(null);
    }
  }

  // Handle Revision Submit
  async function handleRevisionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const notes = formData.get('notes') as string;

    const res = await requestRevisionAction(signoff.token, notes);

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Revizyon iletilemedi.');
    } else {
      setCurrentNotes(notes);
      setCurrentStatus('revizyon_istendi');
      setModalType(null);
    }
  }

  return (
    <>
      {/* 2 Big Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setModalType('approve');
          }}
          className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
        >
          <FileSignature className="w-5 h-5 stroke-[2.5]" />
          Kapsamı Onaylıyorum
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setModalType('revision');
          }}
          className="sm:w-44 py-4 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          Revizyon İste
        </button>
      </div>

      {/* Approve Modal */}
      {modalType === 'approve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Kapsam Onayı ve İmza</h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <div className="text-xs text-slate-600">
                Sayın <span className="font-bold text-slate-900">{signoff.project.client_name}</span>, aşağıdaki imza kutusunu kullanarak veya tek tıkla resmi mühür basarak bu revizyon kapsamını yasal olarak onaylayabilirsiniz.
              </div>

              <SignaturePad
                signerName={signoff.project.client_name}
                onConfirm={handleApprove}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {modalType === 'revision' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-800">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base">Revizyon Talebi Gönder</h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRevisionSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Revizyon Açıklamanız *
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  required
                  placeholder="Lütfen yapılmasını istediğiniz düzeltmeleri veya itiraz ettiğiniz maddeleri buraya yazınız..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm disabled:opacity-50 transition"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ajansa İlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
