'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import {
  Building2,
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wrench,
  XCircle,
  FileText,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import OutcomeGatekeeperModal from '@/components/OutcomeGatekeeperModal';

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOutcomes, setPendingOutcomes] = useState<any[]>([]);
  const [activeOutcomeVacancy, setActiveOutcomeVacancy] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await apiFetch('/employers/me');
    if (res.status === 'success') {
      const p = res.data;
      setProfile(p);

      if (p.verificationStatus === 'APPROVED') {
        const vacRes = await apiFetch('/vacancies/my');
        if (vacRes.status === 'success') setVacancies(vacRes.data || []);

        const pendingRes = await apiFetch('/vacancies/pending-outcomes');
        if (pendingRes.status === 'success' && pendingRes.data?.length > 0) {
          setPendingOutcomes(pendingRes.data);
          setActiveOutcomeVacancy(pendingRes.data[0]);
        } else {
          setPendingOutcomes([]);
        }
      }
    } else {
      const userRes = await apiFetch('/auth/me');
      if (userRes.status === 'success') {
        const r = userRes.data?.role;
        if (r === 'DISNAKER_ADMIN' || r === 'SUPERADMIN' || r === 'EXECUTIVE') {
          router.push('/admin?tab=EMPLOYERS');
          return;
        } else if (r === 'TALENT') {
          router.push('/talent');
          return;
        }
      }
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-neutral-600">
        Memuat Data Perusahaan...
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';
  const isRejected = profile?.verificationStatus === 'REJECTED';
  const isPending = profile?.verificationStatus === 'PENDING';

  const hasNibDoc = Boolean(profile?.nibDocUrl);
  const hasLogo = Boolean(profile?.logoUrl);
  const hasGps = profile?.locationLat !== null && profile?.locationLat !== undefined && profile?.locationLng !== null && profile?.locationLng !== undefined;
  const hasPic = Boolean(profile?.picName && profile?.picPhone);

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* HEADER PROFIL PERUSAHAAN (MODERN CORPORATE DASHBOARD) */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-xs space-y-5">
          {/* BARIS UTAMA: IDENTITAS KORPORAT & TOMBOL AKSI */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-5">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {/* LOGO PERUSAHAAN */}
              <div className="w-16 h-16 rounded-xl border border-neutral-200 bg-white p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                {profile?.logoUrl ? (
                  <img
                    src={getFullMediaUrl(profile.logoUrl)}
                    alt={profile.companyName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-7 h-7 text-neutral-400" />
                )}
              </div>

              {/* IDENTITAS: BADGES & NAMA PERUSAHAAN */}
              <div className="space-y-1.5 min-w-0 flex-1">
                {/* BADGES: STATUS, NIB, MEREK */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isApproved ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    ) : isRejected ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                    )}
                    {isApproved ? 'Terverifikasi Disnaker' : isRejected ? 'Verifikasi Ditolak' : 'Menunggu Verifikasi'}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                    NIB: {profile?.nib}
                  </span>

                  {profile?.brandName && profile?.brandName !== profile?.companyName && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                      Merek: {profile.brandName}
                    </span>
                  )}
                </div>

                {/* NAMA PERUSAHAAN */}
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 leading-tight">
                  {profile?.companyName}
                </h1>

                {/* LOKASI & SEKTOR PERUSAHAAN */}
                <div className="flex items-center gap-y-1 gap-x-4 flex-wrap text-xs text-neutral-600 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-700">{profile?.address || 'Alamat operasional Mimika belum diatur'}</span>
                  </div>

                  {profile?.industrySector && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-neutral-500">Sektor:</span>
                      <span className="font-semibold text-neutral-800">{profile.industrySector}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 pt-1 lg:pt-0">
              <Link
                href="/employer/profile"
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-neutral-500" />
                <span>Profiling Perusahaan</span>
              </Link>

              {isApproved && (
                <Link
                  href="/employer/vacancies/create"
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Terbitkan Kebutuhan</span>
                </Link>
              )}
            </div>
          </div>

          {/* SEKSI PROFIL SINGKAT */}
          {profile?.companyBio ? (
            <div className="pt-3 border-t border-neutral-100">
              <div className="rounded-lg bg-neutral-50/90 border border-neutral-200/70 p-3.5 flex items-start gap-3">
                <FileText className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Profil Singkat Perusahaan
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                    {profile.companyBio}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="italic">Profil singkat perusahaan belum diatur.</span>
              <Link href="/employer/profile" className="text-neutral-900 font-semibold hover:underline">
                Lengkapi di Profiling &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* ACTIONABLE ONBOARDING CARD (BEBAS JALAN BUNTU PENDING) */}
        {/* ============================================================ */}
        {!isApproved && (
          <div
            className={`border-2 p-6 space-y-4 shadow-xs ${
              isRejected ? 'bg-rose-50 border-rose-300' : 'bg-amber-50 border-amber-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                {isRejected ? (
                  <XCircle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <h2
                    className={`text-sm font-bold uppercase tracking-wider ${
                      isRejected ? 'text-rose-900' : 'text-amber-900'
                    }`}
                  >
                    {isRejected
                      ? 'Status Akun: Verifikasi Fisik Ditolak oleh Disnakertrans Mimika'
                      : 'Status Akun: Menunggu Verifikasi Dokumen Legalitas Disnakertrans'}
                  </h2>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isRejected ? 'text-rose-800' : 'text-amber-800'
                    }`}
                  >
                    {isRejected
                      ? `Catatan Verifikator Disnaker: "${profile?.verificationNotes || 'Dokumen belum lengkap/valid.'}". Silakan perbaiki profil & unggah ulang berkas PDF NIB OSS.`
                      : 'Lengkapi 4 berkas profil korporat & legalitas berikut agar akun disahkan oleh auditor Disnakertrans Mimika untuk menerbitkan lowongan:'}
                  </p>
                </div>
              </div>

              <Link
                href="/employer/profile"
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <span>Lengkapi Profil & Legalitas Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Checklist Aksi Real-time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-amber-200/80">
              {/* Syarat 1: Akun & Email */}
              <div className="bg-white/80 border border-neutral-200 p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong className="block text-neutral-900">1. Registrasi Akun</strong>
                  <span className="text-emerald-700 font-semibold">Selesai Terverifikasi</span>
                </div>
              </div>

              {/* Syarat 2: PDF NIB */}
              <div className="bg-white/80 border border-neutral-200 p-3 flex items-start gap-2.5">
                {hasNibDoc ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px]">
                  <strong className="block text-neutral-900">2. Berkas PDF NIB OSS</strong>
                  {hasNibDoc ? (
                    <span className="text-emerald-700 font-semibold">Dokumen Terunggah</span>
                  ) : (
                    <span className="text-rose-700 font-bold">Wajib Diunggah</span>
                  )}
                </div>
              </div>

              {/* Syarat 3: Logo & GPS */}
              <div className="bg-white/80 border border-neutral-200 p-3 flex items-start gap-2.5">
                {hasLogo && hasGps ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px]">
                  <strong className="block text-neutral-900">3. Logo & Titik GPS</strong>
                  {hasLogo && hasGps ? (
                    <span className="text-emerald-700 font-semibold">Tersimpan Lengkap</span>
                  ) : (
                    <span className="text-rose-700 font-bold">Wajib Dilengkapi</span>
                  )}
                </div>
              </div>

              {/* Syarat 4: PIC HRD */}
              <div className="bg-white/80 border border-neutral-200 p-3 flex items-start gap-2.5">
                {hasPic ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px]">
                  <strong className="block text-neutral-900">4. PIC HRD & WhatsApp</strong>
                  {hasPic ? (
                    <span className="text-emerald-700 font-semibold">Tersimpan Lengkap</span>
                  ) : (
                    <span className="text-rose-700 font-bold">Wajib Dilengkapi</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR LOWONGAN AKTIF */}
        <div className="bg-white border border-neutral-200/90 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-neutral-700" />
              Daftar Kebutuhan Lowongan & Pemagangan Aktif
            </h2>
            <span className="text-xs text-neutral-600 font-medium">Total: {vacancies.length} Kebutuhan</span>
          </div>

          {vacancies.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-600">
                Belum ada lowongan pekerjaan atau pemagangan yang diterbitkan.
              </p>
              {isApproved && (
                <Link
                  href="/employer/vacancies/create"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase text-neutral-900 border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Buka Studio Pembuatan Lowongan
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {vacancies.map((vac) => {
                const isJob = vac.opportunityType === 'JOB';
                const approachCount = vac._count?.approaches || 0;
                return (
                  <div key={vac.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold uppercase text-neutral-900">
                          {vac.title}
                        </span>
                        {vac.status === 'CLOSED' ? (
                          <span className="text-[10px] font-bold uppercase bg-neutral-900 text-white px-2 py-0.5">
                            Selesai (Ditutup)
                          </span>
                        ) : vac.status === 'EXPIRED' ? (
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5">
                            Kedaluwarsa (TTL)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5">
                            Aktif (Screening)
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                            isJob
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isJob ? 'PEKERJAAN' : 'MAGANG VOKASI'}
                        </span>
                        {vac.projectDuration?.includes('PKWTT') && (
                          <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.5">
                            Peluang Tetap (PKWTT)
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800 px-1.5 py-0.5 border border-neutral-300">
                          Kuota: {vac.quota || 1} Orang
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 flex items-center gap-3 flex-wrap">
                        <span>
                          Pola Kerja: <strong className="text-neutral-800">{vac.workSchedule ? vac.workSchedule.replace(/_/g, ' ') : 'NORMAL DAY'}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          {isJob && vac.salaryMin && vac.salaryMax ? (
                            <span className="text-emerald-800 font-semibold font-mono">
                              Rp {Number(vac.salaryMin).toLocaleString('id-ID')} - Rp {Number(vac.salaryMax).toLocaleString('id-ID')}
                            </span>
                          ) : !isJob && vac.stipendAmount ? (
                            <span className="text-emerald-800 font-semibold font-mono">
                              Uang Saku: Rp {Number(vac.stipendAmount).toLocaleString('id-ID')} / bln
                            </span>
                          ) : (
                            'Kompetitif / Sesuai Pengalaman (Negosiasi)'
                          )}
                        </span>
                        {vac.projectDuration && (
                          <>
                            <span>&bull;</span>
                            <span>Durasi: {vac.projectDuration}</span>
                          </>
                        )}
                      </div>

                      {/* FASILITAS / BENEFIT */}
                      {Array.isArray(vac.benefits) && vac.benefits.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] font-bold uppercase text-neutral-500 mr-1">Fasilitas:</span>
                          {vac.benefits.map((b: string) => (
                            <span
                              key={b}
                              className="text-[9px] bg-neutral-100 text-neutral-700 border border-neutral-200 px-1.5 py-0.5"
                            >
                              {b.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* INVENTARIS / WORK TOOLS */}
                      {Array.isArray(vac.workTools) && vac.workTools.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] font-bold uppercase text-amber-700 mr-1 flex items-center gap-1">
                            <Wrench className="w-2.5 h-2.5" />
                            Alat Kerja:
                          </span>
                          {vac.workTools.map((t: string) => (
                            <span
                              key={t}
                              className="text-[9px] bg-amber-50 text-amber-900 border border-amber-300 font-medium px-1.5 py-0.5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                      {approachCount > 0 && (
                        <span className="text-[11px] font-bold text-neutral-700 bg-neutral-100 border border-neutral-300 px-2 py-1">
                          {approachCount} Didekati
                        </span>
                      )}
                      {vac.status === 'EXPIRED' ? (
                        <button
                          type="button"
                          onClick={() => setActiveOutcomeVacancy(vac)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Laporkan Hasil</span>
                        </button>
                      ) : (
                        <Link
                          href={`/employer/vacancies/${vac.id}/candidates`}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Radar Kandidat AI</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
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
