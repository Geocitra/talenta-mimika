'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Award,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getFullMediaUrl } from '@/lib/api';

interface CampaignSlide {
  id: string;
  badge: string;
  headline: string;
  subheadline: string;
  provider: string;
  image: string;
  fundingBadge: string;
  certBadge: string;
  benefits: string[];
  linkHref: string;
}

export default function ShopeeCampaignBillboard({ programs }: { programs: any[] }) {
  // Ambil program nyata jika tersedia, fallback ke preset kampanye
  const slides: CampaignSlide[] = [
    {
      id: 'heavy-equipment',
      badge: 'PROGRAM VOKASI PRIORITAS DAERAH 2026',
      headline: 'OPERATOR ALAT BERAT & MEKANIK PERTAMBANGAN',
      subheadline:
        'Kuasai Excavator, Haul Truck & Loader untuk Memasuki Industri Pertambangan Mimika & Papua Tengah.',
      provider: 'Disnakertrans Kab. Mimika & Balai Vokasi Mitra',
      image: '/images/flyers/alat_berat_flyer.jpg',
      fundingBadge: 'DIBIAYAI PENUH APBD KAB. MIMIKA - GRATIS',
      certBadge: 'SERTIFIKAT KOMPETENSI BNSP',
      benefits: ['Mess & Asrama Gratis', 'Makan 3x Sehari', 'Uang Saku Transport', 'APD Safety Lengkap'],
      linkHref: programs?.[0] ? `/talent/trainings/${programs[0].id}` : '/talent/trainings',
    },
    {
      id: 'welding-6g',
      badge: 'STANDARISASI SKKNI KEMNAKER RI',
      headline: 'PELATIHAN JURU LAS 6G PIPA BERTEKANAN',
      subheadline:
        'Kualifikasi SMAW & GTAW (TIG/Stick) Bertekanan Tinggi untuk Proyek Fabrikasi & Pabrik Industri.',
      provider: 'Pusat Vokasi Pengelasan Timika',
      image: '/images/flyers/welding_flyer.jpg',
      fundingBadge: 'BEASISWA PENUH APBD & CSR MITRA',
      certBadge: 'SERTIFIKAT GARUDA EMAS BNSP',
      benefits: ['Tool Kit Mesin Las', 'Uji Kompetensi Gratis', 'Langsung Injeksi ke Radar AI'],
      linkHref: programs?.[1] ? `/talent/trainings/${programs[1].id}` : '/talent/trainings',
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);

  const cur = slides[currentIdx];

  return (
    <div
      className="relative w-full overflow-hidden border-2 border-neutral-900 bg-neutral-950 shadow-md group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image Container with Overlay */}
      <div className="relative h-[320px] sm:h-[360px] md:h-[390px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFullMediaUrl(cur.image)}
          alt={cur.headline}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 brightness-75 scale-100 group-hover:scale-102"
        />

        {/* Dynamic Dark Gradient Overlay ala Shopee Mall Billboard */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/40" />

        {/* Content Box */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center space-y-4">
          {/* Baris Badge Atas */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 bg-amber-400 text-neutral-950 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
              <span>{cur.badge}</span>
            </span>

            <span className="text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 bg-emerald-500 text-white font-mono shadow-xs">
              {cur.fundingBadge}
            </span>

            <span className="text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 bg-neutral-900/90 text-neutral-200 border border-neutral-700 hidden sm:inline-flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>{cur.certBadge}</span>
            </span>
          </div>

          {/* Headline & Subheadline */}
          <div className="max-w-2xl space-y-2">
            <div className="text-xs text-neutral-300 font-mono flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{cur.provider}</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase text-white tracking-tight leading-tight drop-shadow-md">
              {cur.headline}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed max-w-xl">
              {cur.subheadline}
            </p>
          </div>

          {/* Fasilitas Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {cur.benefits.map((b, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-[11px] font-semibold bg-white/10 backdrop-blur-xs border border-white/20 text-white px-2.5 py-1 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{b}</span>
              </span>
            ))}
          </div>

          {/* Call to Action Button */}
          <div className="pt-2 flex items-center gap-3">
            <Link
              href={cur.linkHref}
              className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 text-xs sm:text-sm font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer font-mono"
            >
              <span>Lihat Gelombang & Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </Link>

            <span className="text-[11px] font-mono text-neutral-400 hidden md:inline">
              Gratis • Kuota Terbatas • Resmi Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (Shopee Style) */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-white text-white hover:text-neutral-950 border border-neutral-700 flex items-center justify-center transition-all opacity-75 group-hover:opacity-100 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-white text-white hover:text-neutral-950 border border-neutral-700 flex items-center justify-center transition-all opacity-75 group-hover:opacity-100 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Dots Indicator */}
      <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5 bg-neutral-900/70 backdrop-blur-xs px-2.5 py-1 border border-neutral-800">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={`h-1.5 transition-all cursor-pointer ${
              idx === currentIdx ? 'w-6 bg-amber-400' : 'w-2 bg-neutral-600 hover:bg-neutral-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
        <span className="text-[10px] font-mono text-neutral-300 ml-1">
          {currentIdx + 1}/{slides.length}
        </span>
      </div>
    </div>
  );
}
