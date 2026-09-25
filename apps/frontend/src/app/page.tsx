'use client';

import React from 'react';
import {
  LandingNavbar,
  LandingHero,
  LandingCertifications,
  LandingSourcingWorkflow,
  LandingTwoSides,
  LandingCompanies,
  LandingCta,
  LandingFooter,
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Floating Capsule Navbar (Minimal, Clean, Zero Clutter) */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section: Dual-Portal (Untuk Talenta & Untuk Perusahaan) */}
        <LandingHero />

        {/* 3. Program Pelatihan Vokasi & Sertifikasi BNSP Resmi (Privasi Terjaga) */}
        <LandingCertifications />

        {/* 4. The 3-Step AI Reverse Recruitment Workflow */}
        <LandingSourcingWorkflow />

        {/* 5. 2-Sided Value: For Employers & For Talents */}
        <LandingTwoSides />

        {/* 6. Strategic Partners & Official Industry Employers */}
        <LandingCompanies />

        {/* 7. Spacious High-Conversion Invitation Billboard */}
        <LandingCta />
      </main>

      {/* 8. Official Disnaker Mimika Footer */}
      <LandingFooter />
    </div>
  );
}
