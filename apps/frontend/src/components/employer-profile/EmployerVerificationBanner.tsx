'use client';

import React from 'react';
import { ModernCard, ModernBadge } from '@/components/ui/ModernPrimitives';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface EmployerVerificationBannerProps {
  status?: string;
  verificationNotes?: string;
  verifiedAt?: string | null;
  hasNibDoc: boolean;
  hasLogo: boolean;
  hasGps: boolean;
  hasPic: boolean;
}

export function EmployerVerificationBanner({
  status,
  verificationNotes,
  verifiedAt,
  hasNibDoc,
  hasLogo,
  hasGps,
  hasPic,
}: EmployerVerificationBannerProps) {
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isPending = !isApproved && !isRejected;

  if (isPending) {
    return (
      <ModernCard className="bg-amber-50/70 border-amber-200/80 p-5 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950">
              Status Akun: Menunggu Audit &amp; Verifikasi Dokumen Disnakertrans Mimika
            </h2>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Untuk menerbitkan lowongan pekerjaan atau magang, lengkapi berkas legalitas NIB OSS, logo resmi, titik koordinat kantor, dan kontak PIC HRD di bawah ini. Tim Disnakertrans akan memverifikasi keabsahan izin operasional perusahaan Anda.
            </p>
          </div>
        </div>

        {/* Checklist Kelengkapan Ringkas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-amber-200/70 text-xs">
          <div className="flex items-center gap-2 bg-white/70 rounded-xl p-2.5 border border-amber-200/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-700 text-[11px] font-medium">Akun &amp; Email Terdaftar</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 rounded-xl p-2.5 border border-amber-200/60">
            {hasNibDoc ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className={`text-[11px] ${hasNibDoc ? 'text-slate-700 font-medium' : 'text-amber-900 font-bold'}`}>
              NIB PDF {hasNibDoc ? '(Lengkap)' : '(Wajib)'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 rounded-xl p-2.5 border border-amber-200/60">
            {hasLogo && hasGps ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className={`text-[11px] ${hasLogo && hasGps ? 'text-slate-700 font-medium' : 'text-amber-900 font-bold'}`}>
              Logo &amp; GPS {hasLogo && hasGps ? '(Lengkap)' : '(Wajib)'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 rounded-xl p-2.5 border border-amber-200/60">
            {hasPic ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className={`text-[11px] ${hasPic ? 'text-slate-700 font-medium' : 'text-amber-900 font-bold'}`}>
              PIC HRD {hasPic ? '(Lengkap)' : '(Wajib)'}
            </span>
          </div>
        </div>
      </ModernCard>
    );
  }

  if (isRejected) {
    return (
      <ModernCard className="bg-rose-50/70 border-rose-200/80 p-5 space-y-2">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-800 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950">
              Verifikasi Berkas Ditolak oleh Disnakertrans Mimika
            </h2>
            <p className="text-xs text-rose-800">
              Catatan Auditor Disnaker:{' '}
              <span className="font-semibold text-rose-950">{verificationNotes || 'Dokumen belum memenuhi syarat.'}</span>
            </p>
            <p className="text-xs text-rose-700/90 pt-1">
              Silakan perbarui berkas dokumen izin usaha NIB OSS atau data kontak yang valid, kemudian klik Simpan untuk pengajuan ulang.
            </p>
          </div>
        </div>
      </ModernCard>
    );
  }

  if (isApproved) {
    return (
      <ModernCard className="bg-emerald-50/70 border-emerald-200/80 p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              Perusahaan Sah &amp; Terverifikasi Disnakertrans Mimika
            </span>
            <span className="text-xs text-emerald-800">
              Akun Anda aktif dan berwenang menerbitkan lowongan pekerjaan serta melakukan pendekatan langsung ke talenta Mimika.
            </span>
          </div>
        </div>
        {verifiedAt && (
          <ModernBadge variant="success" className="font-mono text-[11px] px-3 py-1">
            Disahkan: {new Date(verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </ModernBadge>
        )}
      </ModernCard>
    );
  }

  return null;
}
