'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, UserCheck, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export function LandingTwoSides() {
  return (
    <section className="py-24 sm:py-32 bg-white border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80 inline-block">
            Ekosistem Simetris
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Memberikan Kepastian bagi Industri dan Martabat bagi Talenta
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Dirancang secara khusus untuk menyelesaikan persoalan ketenagakerjaan di Kabupaten Mimika dengan solusi teknologi yang adil dan transparan.
          </p>
        </div>

        {/* 2-Column Spacious Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {/* Sisi 1: Untuk Perusahaan */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/60 p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-2xs">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Untuk Perusahaan &amp; Kontraktor
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Penuhi kebutuhan tenaga kerja proyek lebih cepat dan patuh regulasi daerah.
                </p>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 pt-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>AI Vacancy Studio:</strong> Buat deskripsi tugas dan spesifikasi posisi standar SKKNI dalam hitungan detik.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Penyaringan Geospasial Instan:</strong> Temukan kandidat bersertifikat di Kuala Kencana, Tembagapura, Timika, atau Portsite.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kepatuhan Otomatis Perda OAP:</strong> Laporan proporsi tenaga kerja Orang Asli Papua transparan dan terukur resmi.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bebas Verifikasi Rumit:</strong> Berkas KTP, sertifikat BNSP, dan lisensi SIO telah tervalidasi sebelum Anda dekati.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Link
                href="/register/employer"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Sebagai Perusahaan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sisi 2: Untuk Talenta */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/60 p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-2xs">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <UserCheck className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Untuk Talenta &amp; Pencari Kerja
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Mendapatkan pekerjaan dengan cara bermartabat tanpa pungli atau calo.
                </p>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 pt-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cukup Bikin Profil 1 Kali:</strong> Upload KTP Mimika dan portofolio keahlian langsung dari smartphone Anda.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Perusahaan yang Menjemput:</strong> Duduk tenang dan biarkan AI menempatkanmu di radar prioritas puluhan HRD kontraktor.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Akses Beasiswa Vokasi BLK:</strong> Belum punya sertifikat? Ikuti pelatihan gratis didanai APBD lengkap dengan uang saku.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Perlindungan Resmi Upah:</strong> Jaminan kontrak kerja PKWT/PKWTT sah yang diawasi oleh Dinas Tenaga Kerja.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Link
                href="/register/talent"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Sebagai Talenta (Gratis)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
