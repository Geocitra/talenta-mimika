'use client';

import React from 'react';
import { Cpu, Search, UserCheck, ShieldCheck } from 'lucide-react';

export function LandingSourcingWorkflow() {
  const steps = [
    {
      number: '01',
      title: 'Perusahaan Merumuskan Kebutuhan dengan AI',
      desc: 'HRD menginput kebutuhan posisi proyek di Vacancy Studio. AI Copilot otomatis menyusun butir tugas terstandarisasi, keahlian SKKNI, dan acuan upah resmi.',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      tag: 'AI Vacancy Studio',
    },
    {
      number: '02',
      title: 'AI Radar Memindai Database Talenta Mimika',
      desc: 'Algoritma matching multi-faktor memindai ribuan profil lokal. Menyaring kecocokan sertifikat BNSP, lisensi SIO, serta kepatuhan afirmasi Orang Asli Papua.',
      icon: <Search className="w-5 h-5 text-emerald-600" />,
      tag: 'Cognitive Matching',
    },
    {
      number: '03',
      title: 'Perusahaan Menjemput & Mengundang Kandidat',
      desc: 'HRD langsung mengirimkan undangan wawancara resmi kepada talenta terpilih. Talenta menerima tawaran kerja tanpa perlu sebar berkas lamaran fisik.',
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      tag: 'Reverse Recruitment',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-slate-50/70 border-t border-slate-200/80" id="cara-kerja">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80 inline-block">
            Mekanisme Reverse Recruitment
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bagaimana Sistem AI Menghubungkan Industri dengan Talenta?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Efisiensi menyeluruh bagi industri dan penghormatan bagi pencari kerja lokal melalui proses digital yang transparan dan akuntabel.
          </p>
        </div>

        {/* 3 Step Flow with Generous Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 space-y-5 hover:border-slate-300 hover:shadow-md transition-all shadow-2xs relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center font-black text-base shadow-2xs">
                    {st.number}
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {st.tag}
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi Disnaker Kab. Mimika</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
