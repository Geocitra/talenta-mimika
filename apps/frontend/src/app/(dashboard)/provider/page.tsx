'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Users,
  Award,
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  ExternalLink,
  MapPin,
  FileText,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [profile, setProfile] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const profileRes = await apiFetch('/training-providers/me');
    if (profileRes.status !== 'success') {
      const userRes = await apiFetch('/auth/me');
      if (userRes.status === 'success') {
        const r = userRes.data?.role;
        if (r === 'TALENT') router.push('/talent');
        else if (r === 'EMPLOYER') router.push('/employer');
        else if (r === 'DISNAKER_ADMIN' || r === 'SUPERADMIN') router.push('/admin');
        return;
      }
      router.push('/login');
      return;
    }

    setProfile(profileRes.data);

    // Ambil Program & Batches jika profil ada
    const [progRes, batchRes] = await Promise.all([
      apiFetch('/training-providers/programs'),
      apiFetch('/training-providers/batches'),
    ]);

    if (progRes.status === 'success') setPrograms(progRes.data || []);
    if (batchRes.status === 'success') setBatches(batchRes.data || []);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Memuat Dasbor Balai Pelatihan...
          </div>
        </div>
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';
  const publishedProgramsCount = programs.filter((p) => p.status === 'PUBLISHED').length;
  const openBatchesCount = batches.filter((b) => b.isOpen).length;
  const totalEnrollmentsCount = batches.reduce((acc, b) => acc + (b._count?.enrollments || 0), 0);

  return (
    <AppShell
      userRole="TRAINING_PROVIDER"
      userName={profile?.institutionName || 'Lembaga Pelatihan'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Identitas & Status Verifikasi Tier-1 */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-neutral-900 text-white font-mono">
                {profile?.institutionType?.replace(/_/g, ' ')}
              </span>

              {isApproved ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Tier-1 Disnaker: Terakreditasi Resmi (APPROVED)
                </span>
              ) : profile?.verificationStatus === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-red-50 text-red-900 border border-red-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                  Tier-1 Disnaker: Ditolak (REJECTED)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Tier-1 Disnaker: Menunggu Audit (PENDING)
                </span>
              )}

              {profile?.vinNumber && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-700">
                  VIN: {profile.vinNumber}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-900">
                {profile?.institutionName}
              </h1>
              <p className="text-xs text-neutral-600 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{profile?.address || 'Alamat operasional belum diatur'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Link
              href="/provider/profile"
              className="w-full sm:w-auto px-4 py-2.5 border border-neutral-300 hover:border-neutral-900 text-xs font-bold uppercase tracking-wider text-neutral-800 transition-colors text-center"
            >
              Kelola Legalitas
            </Link>

            {isApproved ? (
              <Link
                href="/provider/programs/create"
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Buka Program / Batch</span>
              </Link>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-300 text-neutral-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                title="Lembaga harus berstatus APPROVED untuk membuka program"
              >
                Menunggu Approval Tier-1
              </button>
            )}
          </div>
        </div>

        {/* Peringatan jika status masih PENDING */}
        {!isApproved && (
          <div className="bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Lembaga Anda Belum Di-Approved:</strong> Anda belum dapat mempublikasikan program pelatihan atau membuka batch pendaftaran. Pastikan Anda telah mengunggah berkas izin operasional (PDF) dan mengisi kontak PIC di halaman Profil agar tim Disnakertrans dapat mengesahkan legalitas lembaga Anda.
            </div>
          </div>
        )}

        {/* 4 Pilar Metrik Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-neutral-300 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
          <div className="p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-emerald-300 bg-emerald-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Program Terbit</div>
              <div className="text-xl font-bold text-neutral-900">{publishedProgramsCount} Program</div>
              <div className="text-[11px] text-emerald-700 font-medium">Tayang di Skillhub</div>
            </div>
          </div>

          <div className="p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-neutral-300 bg-neutral-100 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Batch Aktif</div>
              <div className="text-xl font-bold text-neutral-900">{openBatchesCount} Gelombang</div>
              <div className="text-[11px] text-neutral-600">Pendaftaran terbuka</div>
            </div>
          </div>

          <div className="p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-neutral-300 bg-neutral-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Pendaftar</div>
              <div className="text-xl font-bold text-neutral-900">{totalEnrollmentsCount} Talenta</div>
              <div className="text-[11px] text-neutral-600">Peserta cohort terdata</div>
            </div>
          </div>

          <div className="p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 border border-emerald-300 bg-emerald-50 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Standar Mutu</div>
              <div className="text-xl font-bold text-neutral-900">{profile?.accreditation || 'Terdaftar'}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Akreditasi Lembaga</div>
            </div>
          </div>
        </div>

        {/* DAFTAR BATCH COHORT AKTIF & MEJA KELULUSAN MASSAL */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900">
                Batch Cohort Pelatihan
              </h2>
              <p className="text-xs text-neutral-500">
                Pantau daftar peserta gelombang berjalan dan eksekusi kelulusan massal dengan auto-skill injection.
              </p>
            </div>
          </div>

          {batches.length === 0 ? (
            <div className="bg-white border border-neutral-300 p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-xs font-bold text-neutral-700 uppercase">Belum Ada Batch Pelatihan</div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Buka batch gelombang pertama melalui Studio Program Pelatihan.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-300 divide-y divide-neutral-200">
              {batches.map((batch) => (
                <div key={batch.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-300">
                        Batch #{batch.batchNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {batch.fundingType?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-50 text-neutral-600 border border-neutral-200">
                        Metode: {batch.trainingMethod}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">
                      {batch.batchName}
                    </h3>
                    <div className="text-xs text-neutral-600 font-medium">
                      Program: {batch.program?.title} ({batch.program?.programCode})
                    </div>

                    <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-4 pt-1">
                      <span>Kuota: <strong>{batch._count?.enrollments || 0} / {batch.quota} Kursi</strong></span>
                      <span>Pelaksanaan: <strong>{new Date(batch.trainingStart).toLocaleDateString('id-ID')} - {new Date(batch.trainingEnd).toLocaleDateString('id-ID')}</strong></span>
                      <span>Status: <strong className={batch.isOpen ? 'text-emerald-700' : 'text-neutral-500'}>{batch.isOpen ? 'Pendaftaran Buka' : 'Pendaftaran Tutup'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/provider/batches/${batch.id}/graduation`}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Meja Kelulusan & Peserta</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DAFTAR PROGRAM PELATIHAN SAYA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900">
                Katalog Program Lembaga
              </h2>
              <p className="text-xs text-neutral-500">
                Daftar kurikulum kejuruan yang telah Anda daftarkan ke Meja Kurasi Tier-2 Disnakertrans Mimika.
              </p>
            </div>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white border border-neutral-300 p-8 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-xs font-bold text-neutral-700 uppercase">Belum Ada Program Pelatihan</div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Mulai susun kurikulum pelatihan dan daftarkan ke kurasi Disnaker melalui Studio Program.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map((prog) => (
                <div key={prog.id} className="bg-white border border-neutral-300 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 border border-neutral-200">
                        {prog.programCode}
                      </span>
                      {prog.approvalStatus === 'APPROVED' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300">
                          APPROVED TIER-2
                        </span>
                      ) : prog.approvalStatus === 'REJECTED' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-50 text-red-900 border border-red-300">
                          REJECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300">
                          PENDING KURASI
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {prog.description}
                    </p>

                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 font-mono">
                      <span>Kejuruan: <strong>{prog.category}</strong></span>
                      <span>Sertifikat: <strong>{prog.certificateType?.replace(/_/g, ' ')}</strong></span>
                      <span>Durasi: <strong>{prog.durationDays} Hari ({prog.totalLessonHours} JP)</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">
                      {prog.batches?.length || 0} Batch Terbuka
                    </span>
                    <Link
                      href={`/provider/programs/create?programId=${prog.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:underline flex items-center gap-1"
                    >
                      <span>Buka Batch Baru</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <AlertModal {...alertProps} />
    </AppShell>
  );
}
