'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Check, RotateCcw } from 'lucide-react';

interface VacancyHeaderProps {
  isDraftSaved: boolean;
  onClearDraft: () => void;
}

export function VacancyHeader({ isDraftSaved, onClearDraft }: VacancyHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
      <div>
        <div className="flex items-center gap-2 mb-1 text-xs">
          <Link
            href="/employer"
            className="text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Perusahaan</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">Studio Lowongan</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-slate-800" />
          <span>Form Kebutuhan Tenaga Kerja &amp; Pemagangan</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Laporkan kebutuhan tenaga kerja industri atau pemagangan vokasi untuk dipadankan ke talenta daerah oleh AI Radar.
        </p>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {isDraftSaved && (
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Draf Tersimpan
          </span>
        )}
        <button
          type="button"
          onClick={onClearDraft}
          className="text-xs text-slate-600 hover:text-rose-700 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Kosongkan formulir draf"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Draf</span>
        </button>
        <Link
          href="/employer"
          className="text-xs text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl font-semibold transition-colors"
        >
          Batal
        </Link>
      </div>
    </div>
  );
}
