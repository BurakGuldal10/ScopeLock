'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Eraser, Check, ShieldCheck, PenTool, Stamp } from 'lucide-react';

// Dynamic import with ssr: false to prevent SSR hydration errors on canvas
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
  ssr: false,
  loading: () => (
    <div className="h-44 w-full bg-slate-50 flex items-center justify-center text-xs text-slate-400">
      İmza alanı yükleniyor...
    </div>
  ),
});

interface SignaturePadProps {
  signerName: string;
  onConfirm: (signatureData: string) => void;
  loading: boolean;
}

export function SignaturePad({ signerName, onConfirm, loading }: SignaturePadProps) {
  const [mode, setMode] = useState<'draw' | 'stamp'>('draw');
  const [isEmpty, setIsEmpty] = useState(true);
  const sigPadRef = useRef<any>(null);

  function handleClear() {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setIsEmpty(true);
    }
  }

  function handleConfirmDraw() {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      onConfirm(dataUrl);
    }
  }

  function handleConfirmStamp() {
    // Generate high quality SVG stamp data
    const stampSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="150" viewBox="0 0 400 150">
        <rect x="5" y="5" width="390" height="140" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="3" stroke-dasharray="6,4"/>
        <text x="200" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="#166534" text-anchor="middle">SCOPELOCK DİJİTAL ONAY MÜHRÜ</text>
        <text x="200" y="80" font-family="sans-serif" font-size="20" font-weight="900" fill="#15803d" text-anchor="middle">RESMEN ONAYLANDI</text>
        <text x="200" y="110" font-family="sans-serif" font-size="12" fill="#166534" text-anchor="middle">Onaylayan: ${signerName}</text>
        <text x="200" y="130" font-family="sans-serif" font-size="10" fill="#4ade80" text-anchor="middle">${new Date().toUTCString()}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(stampSvg)}`;
    onConfirm(dataUrl);
  }

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
            mode === 'draw'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Ekranda İmzala (Parmak / Fare)
        </button>
        <button
          type="button"
          onClick={() => setMode('stamp')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
            mode === 'stamp'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
          Tek Tıkla Mühürle Onayla
        </button>
      </div>

      {mode === 'draw' ? (
        <div className="space-y-2">
          <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden touch-none">
            <SignatureCanvas
              ref={sigPadRef}
              penColor="#0f172a"
              canvasProps={{
                className: 'w-full h-44 cursor-crosshair',
              }}
              onBegin={() => setIsEmpty(false)}
            />
            <div className="absolute bottom-2 left-3 pointer-events-none text-[11px] text-slate-400">
              Mobil cihazda parmağınızla, bilgisayarda farenizle imzalayın
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 shadow-xs"
              title="Temizle"
            >
              <Eraser className="w-3.5 h-3.5" />
              Temizle
            </button>
          </div>

          <button
            type="button"
            disabled={isEmpty || loading}
            onClick={handleConfirmDraw}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            İmzamı ve Kapsamı Onaylıyorum
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 border-dashed text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-emerald-900">ScopeLock Resmi Onay Mührü</h5>
              <p className="text-xs text-emerald-700 mt-1 max-w-xs mx-auto">
                Adınız ({signerName}), mevcut IP adresiniz ve zaman damgasıyla kriptografik onay kaydı oluşturulacaktır.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmStamp}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Tek Tıkla Resmi Mühür Bas ve Onayla
          </button>
        </div>
      )}
    </div>
  );
}
