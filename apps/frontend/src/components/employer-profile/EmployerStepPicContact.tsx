'use client';

import React from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import { Mail, Phone, Sparkles, User } from 'lucide-react';

interface EmployerStepPicContactProps {
  picName: string;
  setPicName: (val: string) => void;
  picRole: string;
  setPicRole: (val: string) => void;
  picPhone: string;
  setPicPhone: (val: string) => void;
  picEmail: string;
  setPicEmail: (val: string) => void;
  hasNibDoc: boolean;
  hasLogo: boolean;
  hasGps: boolean;
  hasPic: boolean;
}

export function EmployerStepPicContact({
  picName,
  setPicName,
  picRole,
  setPicRole,
  picPhone,
  setPicPhone,
  picEmail,
  setPicEmail,
  hasNibDoc,
  hasLogo,
  hasGps,
  hasPic,
}: EmployerStepPicContactProps) {
  return (
    <div className="step-transition space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              04. Person in Charge (PIC) HRD &amp; Rekrutmen Resmi
            </h3>
            <p className="text-xs text-slate-500">
              Penanggung jawab resmi untuk jalur komunikasi dan surat penawaran kerja (reverse recruitment).
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Kontak Sah Komunikasi
        </ModernBadge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Lengkap Pejabat PIC HRD <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={picName}
            onChange={(e) => setPicName(e.target.value)}
            placeholder="Contoh: Robertus Wamang, S.T."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Jabatan / Posisi PIC di Perusahaan
          </label>
          <input
            type="text"
            value={picRole}
            onChange={(e) => setPicRole(e.target.value)}
            placeholder="Contoh: HR & Recruitment Manager"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Handphone / WhatsApp PIC Resmi <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={picPhone}
              onChange={(e) => setPicPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-9 text-xs font-mono text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Nomor ini akan digunakan sebagai jalur kontak resmi pada surat penawaran kerja (WhatsApp Hand-off) ke talenta.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Khusus Rekrutmen Perusahaan
          </label>
          <div className="relative">
            <input
              type="email"
              value={picEmail}
              onChange={(e) => setPicEmail(e.target.value)}
              placeholder="Contoh: recruitment@perusahaan.co.id"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-9 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Email dinas untuk korespondensi resmi dengan pelamar dan Disnakertrans Mimika.
          </p>
        </div>
      </div>

      {/* RINGKASAN KELENGKAPAN SEBELUM SIMPAN */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Ringkasan Kesiapan Verifikasi Perusahaan
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-600 font-medium">1. Berkas NIB OSS</span>
            {hasNibDoc ? (
              <ModernBadge variant="success">Sudah Ada</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Belum Ada</ModernBadge>
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-600 font-medium">2. Logo Resmi</span>
            {hasLogo ? (
              <ModernBadge variant="success">Terpasang</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Belum Ada</ModernBadge>
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-600 font-medium">3. Koordinat GPS Mimika</span>
            {hasGps ? (
              <ModernBadge variant="success">Terkunci</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Belum Lengkap</ModernBadge>
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-600 font-medium">4. PIC &amp; WhatsApp HRD</span>
            {hasPic ? (
              <ModernBadge variant="success">Lengkap</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Belum Lengkap</ModernBadge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
