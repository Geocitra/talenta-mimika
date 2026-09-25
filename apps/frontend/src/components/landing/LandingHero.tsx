'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserCheck,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative -mt-20 pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-slate-950 text-white">
      {/* =========================================================================
          PANORAMIC BACKGROUND BANNER (MIMIKA HIGHLANDS & INDUSTRIAL AI NETWORK)
      ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/mimika_hero_banner.jpg"
          alt="Lanskap Industri &amp; Jaringan Talenta Mimika"
          fill
          priority
          className="object-cover object-center opacity-40 scale-105"
        />
        {/* Multilayered Atmospheric Gradients for Depth & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(16,185,129,0.15),transparent_70%)]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-12 relative z-10">
        {/* Main Title & Authority Statement with Generous Breathing Room */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          {/* Government Authority Badge with Radar Beacon */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>Platform Ketenagakerjaan &amp; Vokasi Resmi Kab. Mimika</span>
          </div>

          {/* Epic Main Headline with Vibrant Emerald Gradient */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Menghubungkan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              Industri Strategis
            </span>{' '}
            dengan Talenta Terbaik Mimika
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Bukan jamannya talenta membuang waktu melamar tanpa kepastian. Perusahaan merumuskan kebutuhan kerja dengan bantuan AI Copilot — sistem kognitif kami otomatis memindai dan merekomendasikan talenta lokal bersertifikasi BNSP yang siap dijemput kerja.
          </p>

          {/* Quick Pillars Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-[11px] text-slate-300">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>AI Reverse Recruitment</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Sertifikasi Resmi BNSP &amp; SIO</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Prioritas Afirmasi OAP (Perda Mimika)</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>100% Gratis Dibiayai APBD</span>
            </span>
          </div>
        </div>

        {/* =========================================================================
            MODEL DUAL-PORTAL (DUA PINTU UTAMA BERGAYA GLASSMORPHISM ELEGAN)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8 pt-2">
          {/* PINTU 1: UNTUK TALENTA / PENCARI KERJA */}
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/85 backdrop-blur-xl p-8 sm:p-9 space-y-6 flex flex-col justify-between shadow-2xl hover:border-emerald-400/70 hover:shadow-emerald-500/10 transition-all duration-300 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  100% Gratis APBD
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  Saya Talenta / Pencari Kerja
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  Lengkapi profil kompetensimu sekali saja. Biarkan puluhan HRD perusahaan kontraktor dan industri tambang yang menjemputmu.
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Reverse Recruitment:</strong> Tanpa fotokopi berkas atau antre di pos gerbang tambang.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Beasiswa Pelatihan Vokasi:</strong> Ikuti sertifikasi BNSP resmi (Las 6G, Alat Berat, K3) gratis.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Prioritas Afirmasi OAP:</strong> Perlindungan hak tenaga kerja lokal sesuai Perda Mimika.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/register/talent"
                className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftarkan Profil Saya (Siap Dijemput)</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>

          {/* PINTU 2: UNTUK PERUSAHAAN / INDUSTRI */}
          <div className="rounded-3xl border border-white/15 bg-slate-900/85 backdrop-blur-xl p-8 sm:p-9 space-y-6 flex flex-col justify-between shadow-2xl hover:border-cyan-400/60 hover:shadow-cyan-500/10 transition-all duration-300 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15">
                  Untuk Perusahaan
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  Saya Perusahaan / Pemberi Kerja
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  Susun kebutuhan pekerjaan proyek dengan AI Vacancy Studio. Pindai dan temukan talenta bersertifikat resmi secara presisi.
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">AI Vacancy Studio:</strong> Rumuskan uraian tugas dan syarat kompetensi SKKNI dalam hitungan detik.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Penyaringan Geospasial:</strong> Pindai kandidat berdomisili Kuala Kencana, Tembagapura, Timika, &amp; Pomako.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Sertifikasi Terverifikasi:</strong> Akses data lulusan BNSP dan SIO Kemenaker yang sah anti-pemalsuan.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/register/employer"
                className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-slate-900" />
                <span>Pasang Lowongan &amp; Cari Talenta</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Clean Trust Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Kepatuhan Afirmasi OAP (Perda Mimika)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sertifikasi Terstandarisasi BNSP RI</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Bebas Calo &amp; Pungli (Resmi Disnaker)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
