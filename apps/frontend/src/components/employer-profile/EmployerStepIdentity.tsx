'use client';

import React from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import { getFullMediaUrl } from '@/lib/api';
import { COMPANY_SIZES, INDUSTRY_SECTORS } from './types';
import { Building2, Globe, Upload, Users } from 'lucide-react';

interface EmployerStepIdentityProps {
  logoUrl: string;
  uploadingLogo: boolean;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  brandName: string;
  setBrandName: (val: string) => void;
  industrySector: string;
  setIndustrySector: (val: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (val: string) => void;
  companySize: string;
  onCompanySizeChange: (val: string) => void;
  employeeCountPapua: number | '';
  setEmployeeCountPapua: (val: number | '') => void;
  employeeCountForeign: number | '';
  setEmployeeCountForeign: (val: number | '') => void;
  employeeCountNational: number | '';
  setEmployeeCountNational: (val: number | '') => void;
  totalEmployees: number;
  companyBio: string;
  setCompanyBio: (val: string) => void;
}

export function EmployerStepIdentity({
  logoUrl,
  uploadingLogo,
  onLogoUpload,
  companyName,
  setCompanyName,
  brandName,
  setBrandName,
  industrySector,
  setIndustrySector,
  websiteUrl,
  setWebsiteUrl,
  companySize,
  onCompanySizeChange,
  employeeCountPapua,
  setEmployeeCountPapua,
  employeeCountForeign,
  setEmployeeCountForeign,
  employeeCountNational,
  setEmployeeCountNational,
  totalEmployees,
  companyBio,
  setCompanyBio,
}: EmployerStepIdentityProps) {
  return (
    <div className="step-transition space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              02. Identitas Korporat &amp; Skala Ketenagakerjaan
            </h3>
            <p className="text-xs text-slate-500">
              Profil badan usaha, merek dagang, sektor industri, dan komposisi tenaga kerja.
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Profil Badan Usaha
        </ModernBadge>
      </div>

      {/* LOGO RESMI */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          {logoUrl ? (
            <img
              src={getFullMediaUrl(logoUrl)}
              alt="Logo Perusahaan"
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <Building2 className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 block">
              Logo Resmi Perusahaan
            </span>
            {logoUrl ? (
              <ModernBadge variant="success">Terpasang</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Belum Ada</ModernBadge>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Format PNG, JPG, atau WEBP (Maks. 2 MB). Logo ini akan tercantum pada setiap publikasi lowongan dan surat penawaran kerja (reverse recruitment) ke talenta.
          </p>
          <div className="pt-1">
            <label className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3 h-3" />
              <span>{uploadingLogo ? 'Mengunggah...' : logoUrl ? 'Ganti Logo' : 'Unggah Logo'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Resmi Perusahaan (Sesuai Akta / NIB) <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Contoh: PT Citra Geometrik Indonesia"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Merek Dagang / Nama Populer
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Contoh: Citra Geometrik (Kosongkan jika sama dengan PT)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Sektor Industri Utama <span className="text-rose-600">*</span>
          </label>
          <select
            value={industrySector}
            onChange={(e) => setIndustrySector(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          >
            <option value="">-- Pilih Sektor Industri --</option>
            {INDUSTRY_SECTORS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Website Resmi Perusahaan
          </label>
          <div className="relative">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://perusahaan.co.id"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-9 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
            />
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Skala Tenaga Kerja (Company Size)
          </label>
          <select
            value={companySize}
            onChange={(e) => onCompanySizeChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          >
            {COMPANY_SIZES.map((cs) => (
              <option key={cs.value} value={cs.value}>
                {cs.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Mempengaruhi agregasi serapan tenaga kerja di Command Center Disnakertrans Mimika.
          </p>
        </div>
      </div>

      {/* SEKSI KOMPOSISI KARYAWAN (WLTK & PERDA OTSUS) */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              <span>Komposisi Tenaga Kerja Perusahaan</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rincian data ketenagakerjaan daerah sesuai Wajib Lapor Ketenagakerjaan (WLTK) &amp; amanat Perda Otsus Papua.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Karyawan Aktif</span>
            <span className="text-sm font-mono font-bold text-slate-900">
              {totalEmployees.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Orang</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Karyawan Warga Papua */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 focus-within:border-slate-800 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Karyawan Papua
              </label>
              <ModernBadge variant="success">OAP</ModernBadge>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={employeeCountPapua}
                onChange={(e) => setEmployeeCountPapua(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-slate-200 p-2.5 pr-14 text-xs font-semibold focus:border-slate-800 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                Orang
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Jumlah karyawan Orang Asli Papua (OAP)
            </span>
          </div>

          {/* 2. Karyawan Asing */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 focus-within:border-slate-800 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Karyawan Asing
              </label>
              <ModernBadge variant="info">TKA</ModernBadge>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={employeeCountForeign}
                onChange={(e) => setEmployeeCountForeign(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-slate-200 p-2.5 pr-14 text-xs font-semibold focus:border-slate-800 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                Orang
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Tenaga Kerja Asing resmi dengan RPTKA
            </span>
          </div>

          {/* 3. Karyawan Lainnya (Nasional) */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 focus-within:border-slate-800 transition-colors shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Karyawan Nasional
              </label>
              <ModernBadge variant="neutral">WNI Non-OAP</ModernBadge>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={employeeCountNational}
                onChange={(e) => setEmployeeCountNational(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-slate-200 p-2.5 pr-14 text-xs font-semibold focus:border-slate-800 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                Orang
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Tenaga kerja WNI dari luar Papua
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Profil Singkat / Tentang Perusahaan
        </label>
        <textarea
          rows={3}
          value={companyBio}
          onChange={(e) => setCompanyBio(e.target.value)}
          placeholder="Jelaskan bidang usaha, fokus operasional, atau lingkup proyek perusahaan Anda di Kabupaten Mimika..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
