import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  FolderKanban, 
  DollarSign, 
  ArrowLeft 
} from 'lucide-react';
import { getProjects, getSignoffs, getCurrentAgency } from '@/app/actions/signoffs';
import { NewSignoffModal } from '@/components/new-signoff-modal';
import { NewProjectModal } from '@/components/new-project-modal';
import { SignoffList } from '@/components/signoff-list';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [agency, projects, signoffs] = await Promise.all([
    getCurrentAgency(),
    getProjects(),
    getSignoffs(),
  ]);

  // Calculations
  const pendingCount = signoffs.filter(s => s.status === 'beklemede').length;
  const approvedCount = signoffs.filter(s => s.status === 'onaylandi').length;
  const revisionCount = signoffs.filter(s => s.status === 'revizyon_istendi').length;
  const totalApprovedFees = signoffs
    .filter(s => s.status === 'onaylandi')
    .reduce((sum, s) => sum + (Number(s.additional_fee) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg"
              title="Ana Sayfaya Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 block leading-tight">ScopeLock</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {agency?.name || 'Ajans Kontrol Paneli'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NewProjectModal />
            <NewSignoffModal projects={projects} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Banner if any approved signoff */}
        {approvedCount > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Müşteri Onayladı, İşe Başlayabilirsiniz!</h4>
                <p className="text-xs text-emerald-100">
                  {approvedCount} adet talep yasal olarak imzalandı ve onay belgesi üretildi.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/20 self-start sm:self-center">
              Onaylanan Ek Gelir: {formatCurrency(totalApprovedFees)}
            </div>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Aktif Projeler</span>
              <FolderKanban className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">{projects.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Yönetilen müşteri projesi</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-semibold">Bekleyen Onaylar</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Müşteri cevabı bekleniyor</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-semibold">Onaylanan Talepler</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">İmzalanmış resmi kapsamlar</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-xs font-semibold">Onaylanan Ek Gelir</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-indigo-600">
              {formatCurrency(totalApprovedFees)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Kapsam aşımı ek kazanç</span>
          </div>
        </div>

        {/* Signoffs Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Onay Talepleri (Signoffs)</h2>
              <p className="text-xs text-slate-500">
                Müşterilerinize ilettiğiniz kapsam, revizyon ve ek ücret talepleri.
              </p>
            </div>
            <NewSignoffModal projects={projects} />
          </div>

          <SignoffList signoffs={signoffs} />
        </section>
      </main>
    </div>
  );
}
