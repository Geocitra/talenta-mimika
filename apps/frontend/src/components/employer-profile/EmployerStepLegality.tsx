'use client';

import React from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import { getFullMediaUrl } from '@/lib/api';
import { ExternalLink, FileCheck, FileText, Upload } from 'lucide-react';

interface EmployerStepLegalityProps {
  nib: string;
  npwpNumber: string;
  setNpwpNumber: (val: string) => void;
  nibDocUrl: string;
  uploadingPdf: boolean;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmployerStepLegality({
  nib,
  npwpNumber,
  setNpwpNumber,
  nibDocUrl,
  uploadingPdf,
  onPdfUpload,
}: EmployerStepLegalityProps) {
  return (
    <div className="step-transition space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              01. Legalitas &amp; Perizinan Berusaha (OSS)
            </h3>
            <p className="text-xs text-slate-500">
              Verifikasi kepatuhan hukum dan izin berusaha resmi BKPM/Kementerian Investasi.
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Invarian Audit Hukum
        </ModernBadge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Induk Berusaha (NIB OSS 13-Digit)
          </label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={nib}
              className="w-full rounded-xl border border-slate-200 bg-slate-100/70 p-3 pr-20 text-xs font-mono text-slate-700 cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
              Terkunci
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Nomor NIB didaftarkan saat registrasi awal dan diaudit langsung oleh Disnakertrans.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Pokok Wajib Pajak (NPWP Badan Usaha)
          </label>
          <input
            type="text"
            value={npwpNumber}
            onChange={(e) => setNpwpNumber(e.target.value)}
            placeholder="Contoh: 01.234.567.8-901.000"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Opsional, melengkapi kepatuhan perpajakan badan usaha di Kabupaten Mimika.
          </p>
        </div>
      </div>

      {/* UPLOAD BERKAS PDF NIB OSS */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800">
            Berkas Fisik Dokumen Izin Usaha / NIB OSS (Format PDF Resmi, Maks. 5 MB) <span className="text-rose-600">*</span>
          </label>
          {nibDocUrl && (
            <ModernBadge variant="success">Sudah Diunggah</ModernBadge>
          )}
        </div>

        {nibDocUrl ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                PDF
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Dokumen NIB OSS Terverifikasi Terunggah
                </span>
                <span className="text-[11px] text-emerald-800 font-mono mt-0.5 block">
                  {nibDocUrl.split('/').pop()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={getFullMediaUrl(nibDocUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Buka PDF</span>
              </a>
              <label className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPdf ? 'Mengunggah...' : 'Ganti Dokumen'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={onPdfUpload}
                  disabled={uploadingPdf}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 p-8 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-xs text-slate-500">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block text-xs">
                Belum ada berkas PDF NIB OSS yang diunggah
              </span>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Unggah dokumen izin resmi hasil unduhan dari portal OSS BKPM / Kementerian Investasi (Maks. 5 MB)
              </p>
            </div>
            <div>
              <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase cursor-pointer shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPdf ? 'Mengunggah PDF...' : 'Pilih Berkas PDF NIB'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={onPdfUpload}
                  disabled={uploadingPdf}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
