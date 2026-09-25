'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Building2, UserPlus, CheckCircle2 } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-10 sm:p-14 lg:p-16 text-center space-y-8 relative shadow-xl shadow-slate-900/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ekosistem Ketenagakerjaan Terpadu 2026</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Mulai Transformasi Perekrutan dan Karir Anda Hari Ini
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan puluhan kontraktor terkemuka dan ribuan tenaga kerja lokal bersertifikasi BNSP dalam ekosistem ketenagakerjaan resmi Kabupaten Mimika.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register/employer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>Untuk Perusahaan: Pasang Lowongan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register/talent"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Untuk Talenta: Daftar Siap Dijemput</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Bebas Calo &amp; Pungli
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Prioritas Afirmasi OAP (Perda Mimika)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Kepatuhan UU Ketenagakerjaan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
