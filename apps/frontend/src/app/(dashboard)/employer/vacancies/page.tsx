'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { 
  Briefcase, 
  Sparkles, 
  Users, 
  ArrowRight, 
  Clock, 
  MapPin, 
  AlertCircle,
  Plus,
  History,
  CheckCircle2,
  LayoutDashboard,
  Calendar,
  GraduationCap,
  BadgeCheck,
  Building2,
  RotateCcw,
  AlertTriangle,
  Hourglass
} from 'lucide-react';
import OutcomeGatekeeperModal from '@/components/OutcomeGatekeeperModal';

export default function EmployerVacanciesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'EXPIRED' | 'HISTORY' | 'ALL'>('ACTIVE');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [activeOutcomeVacancy, setActiveOutcomeVacancy] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const empRes = await apiFetch('/employers/me');
    if (empRes.status === 'success') {
      setProfile(empRes.data);
      const vacRes = await apiFetch('/vacancies/my');
      if (vacRes.status === 'success') {
        setVacancies(vacRes.data || []);
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  const openVacancies = vacancies.filter((v) => v.status === 'OPEN');
  const expiredVacancies = vacancies.filter((v) => v.status === 'EXPIRED');
  const closedVacancies = vacancies.filter((v) => v.status === 'CLOSED');

  const displayedVacancies = 
    activeTab === 'ACTIVE' 
      ? openVacancies 
      : activeTab === 'EXPIRED'
        ? expiredVacancies
        : activeTab === 'HISTORY' 
          ? closedVacancies 
          : vacancies;

  const totalHired = vacancies.reduce((sum, v) => sum + (v.approaches?.length || 0), 0);

  const formatCompensation = (vac: any) => {
    if (vac.opportunityType === 'INTERNSHIP') {
      if (vac.stipendAmount && Number(vac.stipendAmount) > 0) {
        return `Uang Saku: Rp ${Number(vac.stipendAmount).toLocaleString('id-ID')} / bulan`;
      }
      return 'Uang Saku: Sesuai Kebijakan Perusahaan';
    }

    if (vac.salaryMin && vac.salaryMax) {
      return `Rp ${Number(vac.salaryMin).toLocaleString('id-ID')} - Rp ${Number(vac.salaryMax).toLocaleString('id-ID')}`;
    }
    if (vac.salaryMin) {
      return `>= Rp ${Number(vac.salaryMin).toLocaleString('id-ID')}`;
    }
    return 'Kompetitif / Sesuai Pengalaman (Negosiasi)';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getRemainingDays = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return null;
    const now = new Date().getTime();
    const exp = new Date(expiresAtStr).getTime();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDuplicateVacancy = async (vacancyId: string) => {
    if (duplicatingId) return;
    setDuplicatingId(vacancyId);
    try {
      const res = await apiFetch(`/vacancies/${vacancyId}/duplicate`, {
        method: 'POST',
      });
      if (res.status === 'success') {
        await loadData();
        setActiveTab('ACTIVE');
        if (res.data?.newVacancyId) {
          router.push(`/employer/vacancies/${res.data.newVacancyId}/candidates`);
        }
      } else {
        alert(res.message || 'Gagal menduplikasi lowongan.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat membuka batch baru.');
    } finally {
      setDuplicatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        Memuat Daftar Lowongan...
      </div>
    );
  }

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* 1. Header Halaman & Tombol Aksi Utama */}
        <div className="bg-white border border-neutral-300 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2 py-0.5 mb-2">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              AI Sourcing Radar
            </span>
            <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
              Kelola Kebutuhan &amp; Radar Kandidat
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Pantau siklus hidup lowongan aktif, evaluasi kandidat AI, dan laporkan hasil penyerapan tenaga kerja.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/employer"
              className="border border-neutral-300 hover:bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/employer/vacancies/create"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors border border-neutral-900 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Pasang Lowongan Baru</span>
            </Link>
          </div>
        </div>

        {/* 2. Mini KPI Summary Bar (Swiss-Style Hairline Dividers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-neutral-300 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-emerald-300 bg-emerald-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Lowongan Aktif</div>
              <div className="text-lg font-bold text-neutral-900">{openVacancies.length} Posisi</div>
              <div className="text-[11px] text-emerald-700 font-medium">Sedang memindai talenta</div>
            </div>
          </div>

          <div className={`p-4 flex items-center gap-3.5 ${expiredVacancies.length > 0 ? 'bg-amber-50/60' : ''}`}>
            <div className={`w-10 h-10 border flex items-center justify-center shrink-0 ${
              expiredVacancies.length > 0 
                ? 'border-amber-300 bg-amber-100 text-amber-800' 
                : 'border-neutral-300 bg-neutral-100 text-neutral-700'
            }`}>
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Menunggu Laporan</div>
              <div className="text-lg font-bold text-neutral-900">{expiredVacancies.length} Posisi</div>
              <div className={`text-[11px] font-medium ${expiredVacancies.length > 0 ? 'text-amber-800' : 'text-neutral-500'}`}>
                {expiredVacancies.length > 0 ? 'Perlu evaluasi outcome' : 'Semua outcome beres'}
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-neutral-300 bg-neutral-100 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Historis / Selesai</div>
              <div className="text-lg font-bold text-neutral-900">{closedVacancies.length} Posisi</div>
              <div className="text-[11px] text-neutral-600">Kuota rekrutmen terpenuhi</div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-neutral-300 bg-neutral-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Talenta Terekrut</div>
              <div className="text-lg font-bold text-neutral-900">{totalHired} Orang</div>
              <div className="text-[11px] text-neutral-600">Total penyerapan tenaga kerja</div>
            </div>
          </div>
        </div>

        {/* Banner Peringatan Lowongan Kedaluwarsa jika ada */}
        {expiredVacancies.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Perhatian: {expiredVacancies.length} Lowongan Memerlukan Konfirmasi Hasil (Outcome)
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Masa tayang lowongan telah selesai. Sesuai standar WLKP Disnakertrans Mimika, silakan laporkan status penyerapan talenta atau perpanjang masa tayang.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveOutcomeVacancy(expiredVacancies[0])}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              Laporkan Hasil Sekarang
            </button>
          </div>
        )}

        {/* 3. Segmented Architectural Tabs */}
        <div className="bg-white border border-neutral-300">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap space-x-1">
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 inline-flex items-center gap-2 ${
                  activeTab === 'ACTIVE'
                    ? 'border-neutral-900 text-neutral-900 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
                }`}
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                <span>Lowongan Aktif ({openVacancies.length})</span>
              </button>

              {expiredVacancies.length > 0 && (
                <button
                  onClick={() => setActiveTab('EXPIRED')}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 inline-flex items-center gap-2 ${
                    activeTab === 'EXPIRED'
                      ? 'border-amber-600 text-amber-900 bg-white'
                      : 'border-transparent text-amber-700 hover:text-amber-900 hover:bg-amber-50/50'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kedaluwarsa / Laporan ({expiredVacancies.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 inline-flex items-center gap-2 ${
                  activeTab === 'HISTORY'
                    ? 'border-neutral-900 text-neutral-900 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
                }`}
              >
                <History className="w-3.5 h-3.5 text-neutral-600" />
                <span>Historis &amp; Arsip ({closedVacancies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 inline-flex items-center gap-2 ${
                  activeTab === 'ALL'
                    ? 'border-neutral-900 text-neutral-900 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
                }`}
              >
                <span>Semua ({vacancies.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-neutral-500 pb-2 hidden sm:inline-block">
              {activeTab === 'ACTIVE' 
                ? 'Klik "Temukan Kandidat" untuk mengevaluasi radar AI' 
                : activeTab === 'EXPIRED'
                  ? 'Konfirmasi hasil rekrutmen atau perpanjang masa aktif tayang'
                  : activeTab === 'HISTORY'
                    ? 'Rekam jejak lowongan yang telah menyelesaikan proses rekrutmen'
                    : 'Seluruh daftar lowongan pekerjaan perusahaan'}
            </span>
          </div>

          {/* List Lowongan */}
          {displayedVacancies.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-600 space-y-3">
              <Briefcase className="w-8 h-8 text-neutral-400 mx-auto" />
              {activeTab === 'ACTIVE' ? (
                <>
                  <p className="font-semibold text-neutral-900">Tidak ada lowongan aktif saat ini.</p>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    Seluruh kuota lowongan telah terpenuhi atau belum ada lowongan baru yang diterbitkan.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/employer/vacancies/create"
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pasang Lowongan Baru Sekarang</span>
                    </Link>
                  </div>
                </>
              ) : activeTab === 'EXPIRED' ? (
                <>
                  <p className="font-semibold text-neutral-900">Tidak ada lowongan kedaluwarsa.</p>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    Semua masa tayang lowongan terpelihara dan hasil rekrutmen telah dikonfirmasi.
                  </p>
                </>
              ) : activeTab === 'HISTORY' ? (
                <>
                  <p className="font-semibold text-neutral-900">Belum ada data historis lowongan.</p>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    Lowongan yang telah menyelesaikan seleksi akhir atau kuotanya terpenuhi akan secara otomatis diarsipkan di tab ini.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-neutral-900">Belum ada lowongan terdaftar.</p>
                  <div className="pt-2">
                    <Link
                      href="/employer/vacancies/create"
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Terbitkan Lowongan Pertama</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {displayedVacancies.map((vac) => {
                const isClosed = vac.status === 'CLOSED';
                const isExpired = vac.status === 'EXPIRED';
                const hiredList = vac.approaches || [];
                const remainingDays = getRemainingDays(vac.expiresAt);

                return (
                  <div 
                    key={vac.id} 
                    className={`p-5 transition-colors ${
                      isClosed 
                        ? 'bg-neutral-50/40 hover:bg-neutral-50' 
                        : isExpired
                          ? 'bg-amber-50/30 hover:bg-amber-50/60'
                          : 'hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2 max-w-2xl">
                        {/* Judul & Badge Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold uppercase text-neutral-900">
                            {vac.title}
                          </h2>
                          {isClosed ? (
                            <span className="text-[10px] font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 inline-flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-emerald-400" />
                              Selesai (Kuota Terpenuhi)
                            </span>
                          ) : isExpired ? (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 inline-flex items-center gap-1">
                              <Hourglass className="w-3 h-3 text-amber-700" />
                              Kedaluwarsa (Menunggu Outcome)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                              Aktif (Screening)
                            </span>
                          )}

                          <span className="text-[10px] font-semibold uppercase bg-neutral-100 border border-neutral-300 px-1.5 py-0.5 text-neutral-700">
                            {vac.opportunityType === 'INTERNSHIP' ? 'Magang Vokasi' : 'Pekerjaan Reguler'}
                          </span>

                          {vac.projectDuration?.includes('PKWTT') && (
                            <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-300 px-1.5 py-0.5">
                              Peluang Tetap (PKWTT)
                            </span>
                          )}

                          {/* TTL Countdown Chip untuk Lowongan Aktif */}
                          {!isClosed && !isExpired && remainingDays !== null && (
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border inline-flex items-center gap-1 ${
                              remainingDays <= 3 
                                ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' 
                                : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                            }`}>
                              <Clock className="w-3 h-3" />
                              Sisa {remainingDays > 0 ? `${remainingDays} Hari` : 'Hari Ini'}
                            </span>
                          )}
                        </div>

                        {/* Deskripsi */}
                        <p className="text-xs text-neutral-600 line-clamp-2">
                          {vac.taskDescription}
                        </p>

                        {/* Meta Chips */}
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-neutral-600 pt-0.5">
                          <span className="inline-flex items-center gap-1 font-medium text-neutral-800">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            {vac.projectDuration}
                          </span>
                          <span>&bull;</span>
                          <span>Min. {vac.minEducation}</span>
                          <span>&bull;</span>
                          <span>Pengalaman Min. {vac.minExperienceYears} Thn</span>
                          <span>&bull;</span>
                          <span className="font-medium text-neutral-900">
                            {formatCompensation(vac)}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-neutral-800">
                            Kuota: {vac.quota} Talenta
                          </span>
                          {vac.activeDaysDuration && (
                            <>
                              <span>&bull;</span>
                              <span className="text-neutral-500">
                                Masa Tayang: {vac.activeDaysDuration} Hari
                              </span>
                            </>
                          )}
                        </div>

                        {/* Box Khusus Data Historis: Daftar Talenta yang Telah Direkrut */}
                        {isClosed && hiredList.length > 0 && (
                          <div className="mt-2.5 p-2.5 bg-neutral-100/80 border border-neutral-200 text-xs">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Talenta Resmi Direkrut ({hiredList.length}/{vac.quota}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {hiredList.map((app: any, aIdx: number) => (
                                <span 
                                  key={aIdx} 
                                  className="inline-flex items-center gap-1 bg-white border border-neutral-300 px-2 py-0.5 text-[11px] font-medium text-neutral-800"
                                >
                                  {app.talent?.fullName || 'Kandidat'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tombol Aksi Kanan */}
                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch md:items-end gap-2 shrink-0 w-full md:w-auto">
                        {isExpired ? (
                          <button
                            type="button"
                            onClick={() => setActiveOutcomeVacancy(vac)}
                            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Hourglass className="w-3.5 h-3.5" />
                            <span>Laporkan Hasil</span>
                          </button>
                        ) : isClosed ? (
                          <>
                            <button
                              onClick={() => handleDuplicateVacancy(vac.id)}
                              disabled={duplicatingId === vac.id}
                              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                              title="Buka batch lowongan baru menggunakan spesifikasi kualifikasi yang sama"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${duplicatingId === vac.id ? 'animate-spin' : ''}`} />
                              <span>{duplicatingId === vac.id ? 'Memproses...' : 'Buka Batch Baru'}</span>
                            </button>

                            <Link
                              href={`/employer/vacancies/${vac.id}/candidates`}
                              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-white inline-flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span>Tinjau Arsip</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/employer/vacancies/${vac.id}/candidates`}
                            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-white inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Temukan Kandidat</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* OUTCOME GATEKEEPER MODAL */}
        {activeOutcomeVacancy && (
          <OutcomeGatekeeperModal
            isOpen={Boolean(activeOutcomeVacancy)}
            vacancy={activeOutcomeVacancy}
            onClose={() => setActiveOutcomeVacancy(null)}
            onResolved={async () => {
              setActiveOutcomeVacancy(null);
              await loadData();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

