'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';

export function LandingNavbar() {
  return (
    <div className="sticky top-4 z-50 px-4 sm:px-6">
      <header className="max-w-4xl mx-auto h-14 px-5 sm:px-7 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/25 flex items-center justify-between transition-all">
        {/* Clean Logo & Identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-500/30 transition-colors">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-sm text-white">
              MIMIKA TALENTA
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium border-l border-slate-700 pl-2">
              Disnaker Kab. Mimika
            </span>
          </div>
        </Link>

        {/* Minimal Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-extrabold"
          >
            <span>Daftar</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </Link>
        </div>
      </header>
    </div>
  );
}
