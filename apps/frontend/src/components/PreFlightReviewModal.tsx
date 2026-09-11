'use client';

import React, { useState } from 'react';
import { getFullMediaUrl } from '@/lib/api';
import { 
  ShieldCheck, 
  User, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

interface PreFlightReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
  data: {
    fullName: string;
    nik: string;
    phone: string;
    bio: string;
    education: any[];
    workExperience: any[];
    skills: any[];
    certifications?: any[];
    avatarUrl?: string;
    organizations?: string;
    portfolioUrl?: string;
    workPreferences: string;
    preferredLocation?: string;
  };
}

export function PreFlightReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
  data,
}: PreFlightReviewModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border-2 border-neutral-900 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between border-b border-neutral-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Pre-Flight Profile Review & Pakta Integritas
              </h2>
              <p className="text-[11px] text-neutral-400">
                Pemeriksaan data akhir sebelum profil dikunci ke Mimika Talent Pool
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-800 text-xs">
          {/* Banner Validasi Otomatis AI */}
          <div className="p-3 bg-neutral-100 border border-neutral-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-700 leading-relaxed">
              Sistem telah melakukan kurasi taksonomi master dan memeriksa berkas sertifikasi Anda agar profil tampil profesional di hadapan HRD industri pertambangan.
            </p>
          </div>

          {/* 1. Ringkasan Identitas */}
          <div className="space-y-2 border-b border-neutral-200 pb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Data Diri & Pas Foto
            </div>
            <div className="flex items-start gap-3">
              {data.avatarUrl ? (
                <img
                  src={getFullMediaUrl(data.avatarUrl) || ''}
                  alt={data.fullName}
                  className="w-14 h-14 object-cover border border-neutral-900 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 bg-neutral-200 border border-neutral-300 flex flex-col items-center justify-center shrink-0 text-neutral-600 font-bold text-xs">
                  <User className="w-5 h-5 text-neutral-400 mb-0.5" />
                  <span className="text-[8px] uppercase">Tanpa Foto</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs flex-1">
                <div>
                  <span className="text-neutral-500 text-[10px] block">Nama Lengkap:</span>
                  <p className="font-bold text-neutral-900">{data.fullName}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Nomor NIK:</span>
                  <p className="font-bold text-neutral-900 font-mono">{data.nik || '-'}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Nomor WhatsApp:</span>
                  <p className="font-bold text-neutral-900">{data.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Status Pas Foto:</span>
                  <p className={`font-bold text-[11px] ${data.avatarUrl ? 'text-emerald-700' : 'text-neutral-400 italic'}`}>
                    {data.avatarUrl ? '✓ Foto Terpasang' : 'Belum Ada Foto'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 text-[10px] block">Ringkasan Bio:</span>
                  <p className="text-neutral-700 italic">{data.bio || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ringkasan Pendidikan */}
          <div className="space-y-1.5 border-b border-neutral-200 pb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> 2. Riwayat Pendidikan Resmi
            </div>
            {data.education && data.education.length > 0 ? (
              <div className="space-y-1.5">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="p-2 border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900">{edu.institution}</span>
                      <span className="text-neutral-500 text-[11px] block">
                        {edu.degree} - {edu.major} (Lulus {edu.graduationYear})
                      </span>
                    </div>

                    {edu.isAiNormalized && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-neutral-900 text-white flex-shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> AI Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic text-[11px]">Belum ada data pendidikan.</p>
            )}
          </div>

          {/* 3. Pengalaman Kerja & Keahlian */}
          <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 pb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5" /> 3. Pengalaman Kerja
              </div>
              {data.workExperience && data.workExperience.length > 0 ? (
                <ul className="space-y-1 text-[11px]">
                  {data.workExperience.map((w, idx) => (
                    <li key={idx} className="font-medium text-neutral-800">
                      &bull; {w.position} di <span className="font-bold">{w.companyName}</span> ({w.durationMonths} bln)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-500 italic text-[11px]">Belum ada data kerja.</p>
              )}
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 mb-1.5">
                <Wrench className="w-3.5 h-3.5" /> 4. Keahlian Teknis
              </div>
              {data.skills && data.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium border ${
                        s.isLmsVerified
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {s.isLmsVerified && <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
                      <span>{s.name} ({s.level})</span>
                      {s.isLmsVerified && (
                        <span className="text-[8px] bg-emerald-700 text-white px-1 py-0.2 uppercase font-mono tracking-wider">
                          LMS
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 italic text-[11px]">Belum ada keahlian diinput.</p>
              )}
            </div>
          </div>

          {/* 4. Sertifikasi & Dokumen PDF */}
          <div className="space-y-1.5 border-b border-neutral-200 pb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 5. Dokumen Sertifikasi & Lisensi Resmi (PDF)
            </div>
            {data.certifications && data.certifications.length > 0 ? (
              <div className="space-y-1.5">
                {data.certifications.map((c, idx) => (
                  <div key={idx} className="p-2 border border-neutral-200 bg-neutral-50 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-neutral-900">{c.name}</span>
                      <span className="text-neutral-500 block">Penerbit: {c.issuer || '-'} ({c.issueYear || '-'})</span>
                    </div>
                    {c.fileUrl ? (
                      <a
                        href={`/viewer?url=${encodeURIComponent(getFullMediaUrl(c.fileUrl) || '')}&name=${encodeURIComponent(c.name || 'Sertifikat')}&issuer=${encodeURIComponent(c.issuer || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <span>Lihat PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : c.fileName ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                        PDF Terunggah
                      </span>
                    ) : (
                      <span className="text-neutral-400 italic text-[10px]">Tanpa lampiran file</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic text-[11px]">Belum ada sertifikasi dilampirkan.</p>
            )}
          </div>

          {/* 5. Rekam Jejak Organisasi & Preferensi Lapangan */}
          <div className="space-y-2 border-b border-neutral-200 pb-3 text-[11px]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" /> 6. Riwayat Organisasi, Portofolio & Kesiapan Kerja
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Organisasi & Komunitas:</span>
                <p className="text-neutral-800 font-medium">{data.organizations || '-'}</p>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Tautan Portofolio:</span>
                <p className="text-neutral-800 font-mono text-[10px] truncate">{data.portfolioUrl || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Preferensi Pola Kerja:</span>
                <p className="text-neutral-800 font-medium">{data.workPreferences || '-'}</p>
              </div>
            </div>
          </div>

          {/* Pakta Integritas Checkbox */}
          <div className="p-3 bg-neutral-50 border-2 border-neutral-900 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="integrity-pact"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded-none accent-neutral-900 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="integrity-pact" className="text-[11px] text-neutral-800 leading-snug cursor-pointer select-none">
              <strong className="text-neutral-900 uppercase tracking-wider block mb-0.5">
                Pakta Integritas Profil Tenaga Kerja Mimika
              </strong>
              Saya menyatakan dengan sadar dan jujur bahwa seluruh data riwayat pendidikan, sertifikasi, dan pengalaman kerja yang tercantum adalah benar, sah sesuai ijazah/dokumen resmi, serta siap diverifikasi oleh Disnakertrans dan pihak perusahaan pemberi kerja.
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex justify-end items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-700 text-xs font-semibold uppercase hover:bg-neutral-50"
          >
            Periksa Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!agreed || isSaving}
            className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {isSaving ? 'Menyimpan...' : 'Konfirmasi & Aktifkan Profil'}
          </button>
        </div>
      </div>
    </div>
  );
}
