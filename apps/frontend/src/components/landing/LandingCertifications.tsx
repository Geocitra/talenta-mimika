'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Award,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CERTIFICATION_PROGRAMS } from './types';

interface LandingCertificationsProps {
  searchFilter?: string;
}

export function LandingCertifications({ searchFilter }: LandingCertificationsProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredPrograms = CERTIFICATION_PROGRAMS.filter((prog) => {
    if (searchFilter && searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        prog.title.toLowerCase().includes(q) ||
        prog.description.toLowerCase().includes(q) ||
        prog.certType.toLowerCase().includes(q) ||
        prog.targetIndustry.toLowerCase().includes(q) ||
        prog.provider.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory === 'WELDING') return prog.category === 'PENGELASAN';
    if (selectedCategory === 'HEAVY') return prog.category === 'ALAT_BERAT';
    if (selectedCategory === 'HSE') return prog.category === 'KESELAMATAN';
    if (selectedCategory === 'MECHANIC_ELEC') return prog.category === 'MEKANIK' || prog.category === 'ELEKTRIKAL';
    if (selectedCategory === 'LOGISTICS') return prog.category === 'LOGISTIK';

    return true;
  });

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-slate-200/80" id="program-sertifikasi">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3.5">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80 inline-block">
            Standardisasi Vokasi Daerah
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Program Pelatihan Vokasi &amp; Sertifikasi BNSP Resmi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Dibiayai penuh oleh Pemerintah Kabupaten Mimika untuk mencetak tenaga kerja lokal berstandar industri. Industri dapat menyerap lulusan bersertifikat, dan talenta dapat mendaftar secara gratis.
          </p>
        </div>

        {/* Filter Categories (Clean, Wrapped Pills - No Edge Clipping) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
            }`}
          >
            Semua Program ({CERTIFICATION_PROGRAMS.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('WELDING')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'WELDING'
                ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
            }`}
          >
            Pengelasan 6G
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('HEAVY')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'HEAVY'
                ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
            }`}
          >
            Operator Alat Berat
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('HSE')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'HSE'
                ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
            }`}
          >
            Pengawas K3 (POP)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('MECHANIC_ELEC')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'MECHANIC_ELEC'
                ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
            }`}
          >
            Mekanik &amp; Listrik
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('LOGISTICS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'LOGISTICS'
                ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
            }`}
          >
            Logistik Pergudangan
          </button>
        </div>

        {/* =========================================================================
            PROGRAM CERTIFICATION CARDS (CLEAN, COMPACT, BALANCED)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between shadow-2xs group"
            >
              <div>
                {/* Flyer Cover Banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={prog.coverImage}
                    alt={prog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/95 text-slate-900 shadow-xs border border-white/60">
                    {prog.category.replace('_', ' ')}
                  </span>

                  {/* Certification Type Badge */}
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                    BNSP / SIO
                  </span>

                  {/* Quota Remaining Pill */}
                  <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white flex items-center gap-1.5 drop-shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sisa {prog.remainingQuota} dari {prog.quota} Kuota</span>
                  </div>
                </div>

                {/* Content Area - Clean & Non-Cluttered */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{prog.provider}</span>
                    </p>
                  </div>

                  {/* Concise Meta Specs */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prog.duration.split('•')[0].trim()}</span>
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      100% Gratis (APBD)
                    </span>
                  </div>
                </div>
              </div>

              {/* Single Clear Action: Lihat Detail */}
              <div className="p-5 sm:p-6 pt-0">
                <Link
                  href={`/trainings/${prog.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs group-hover:bg-emerald-700 cursor-pointer"
                  title={`Lihat Detail Lengkap ${prog.title}`}
                >
                  <span>Lihat Detail Pelatihan</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Industry Assistance Banner */}
        <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-8 sm:p-10 text-center space-y-4 max-w-4xl mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Perusahaan Anda Membutuhkan Kurikulum Pelatihan Khusus (*Tailored Batch*)?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Dinas Tenaga Kerja Kab. Mimika membuka kemitraan perumusan silabus vokasi bersama kontraktor pertambangan agar calon tenaga kerja dilatih langsung sesuai spesifikasi teknis proyek Anda.
          </p>
          <div className="pt-2">
            <Link
              href="/register/employer"
              className="inline-flex items-center gap-2 px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Ajukan Kemitraan Batch Pelatihan Industri</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
