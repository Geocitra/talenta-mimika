'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';

export function LandingCompanies() {
  const companies = [
    { name: 'PT Freeport Indonesia', sector: 'Pertambangan & Pengolahan Konsentrator', zone: 'Tembagapura & Kuala Kencana' },
    { name: 'PT Petrosea Tbk', sector: 'Kontraktor Pertambangan Terbuka', zone: 'Mile 38 / Kuala Kencana' },
    { name: 'PT Redpath Indonesia', sector: 'Spesialis Underground Mining', zone: 'Area Tambang Bawah Tanah' },
    { name: 'PT Kuala Pelabuhan Indonesia', sector: 'Logistik & Terminal Pelabuhan', zone: 'Portsite Pomako' },
    { name: 'PT Chiyoda International', sector: 'Rekayasa & Konstruksi Smelter', zone: 'Kawasan Industri Pomako' },
    { name: 'Balai Latihan Kerja Mimika', sector: 'Pusat Vokasi & Sertifikasi BNSP', zone: 'Jl. Cenderawasih Timika' },
  ];

  return (
    <section className="py-24 sm:py-28 bg-slate-50/70 border-t border-slate-200/80" id="mitra-industri">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80 inline-block">
            Kemitraan Strategis Daerah
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dipercaya Industri Strategis &amp; Balai Vokasi Mimika
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
            Seluruh perusahaan telah terdaftar resmi dan memiliki Nomor Induk Berusaha (NIB OSS) yang diverifikasi oleh Dinas Tenaga Kerja Kabupaten Mimika.
          </p>
        </div>

        {/* Spacious 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                  {comp.name.slice(3, 5).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NIB Terverifikasi
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{comp.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{comp.sector}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{comp.zone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
