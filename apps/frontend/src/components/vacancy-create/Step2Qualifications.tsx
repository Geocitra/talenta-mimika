'use client';

import React from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import { Award, Check, Users, X } from 'lucide-react';

interface Step2QualificationsProps {
  opportunityType: 'JOB' | 'INTERNSHIP';
  skillTags: string[];
  skillInputText: string;
  setSkillInputText: (val: string) => void;
  onAddSkillTag: (tag: string) => void;
  onRemoveSkillTag: (tag: string) => void;
  minEducation: string;
  setMinEducation: (val: string) => void;
  minExperienceYears: number;
  setMinExperienceYears: (val: number) => void;
  hasAbsorptionOpportunity: boolean;
  setHasAbsorptionOpportunity: (val: boolean) => void;
  allowEquivalence: boolean;
  setAllowEquivalence: (val: boolean) => void;
  targetWorkforce: 'ALL' | 'LOCAL_ONLY' | 'NON_LOCAL';
  setTargetWorkforce: (val: 'ALL' | 'LOCAL_ONLY' | 'NON_LOCAL') => void;
}

export function Step2Qualifications({
  opportunityType,
  skillTags,
  skillInputText,
  setSkillInputText,
  onAddSkillTag,
  onRemoveSkillTag,
  minEducation,
  setMinEducation,
  minExperienceYears,
  setMinExperienceYears,
  hasAbsorptionOpportunity,
  setHasAbsorptionOpportunity,
  allowEquivalence,
  setAllowEquivalence,
  targetWorkforce,
  setTargetWorkforce,
}: Step2QualificationsProps) {
  return (
    <div className="step-transition space-y-6">
      {/* Header Tahap */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              02. Kualifikasi, Keahlian &amp; Afirmasi Tenaga Kerja
            </h3>
            <p className="text-xs text-slate-500">
              Tetapkan kriteria keahlian teknis, syarat pendidikan, afirmasi pengalaman lapangan, dan kebijakan afirmasi OAP.
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Standar Kompetensi &amp; Perda Otsus
        </ModernBadge>
      </div>

      {/* KEAHLIAN WAJIB */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
            Keahlian Wajib ({skillTags.length} Terpilih) <span className="text-rose-600">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Ketik lalu tekan Enter atau klik tombol + Tambah</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={skillInputText}
            onChange={(e) => setSkillInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddSkillTag(skillInputText);
              }
            }}
            placeholder="Ketik keahlian spesifik (cth: Pengelasan SMAW, Rigging, Analisis Finansial)..."
            className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
          />
          <button
            type="button"
            onClick={() => onAddSkillTag(skillInputText)}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-xs"
          >
            + Tambah
          </button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-white rounded-xl border border-slate-200">
          {skillTags.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Belum ada keahlian ditambahkan.</span>
          ) : (
            skillTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSkillTag(tag)}
                  className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* PENDIDIKAN & PENGALAMAN */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
          Kualifikasi Pendidikan &amp; Pengalaman Kerja
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Minimal Pendidikan Formal
            </label>
            <select
              value={minEducation}
              onChange={(e) => setMinEducation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
            >
              <option value="SD">SD / Sederajat</option>
              <option value="SMP">SMP / Sederajat</option>
              <option value="SMA">SMA Sederajat</option>
              <option value="SMK">SMK Vokasi</option>
              <option value="D1">Diploma (D1)</option>
              <option value="D2">Diploma (D2)</option>
              <option value="D3">Diploma (D3)</option>
              <option value="S1">Sarjana (S1 / D4)</option>
              <option value="S2">Magister (S2)</option>
            </select>
          </div>

          {opportunityType === 'JOB' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Minimal Pengalaman Kerja (Tahun)
              </label>
              <input
                type="number"
                min="0"
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold font-mono text-center text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Peluang Rekrutmen Tetap Pasca-Magang
              </label>
              <button
                type="button"
                onClick={() => setHasAbsorptionOpportunity(!hasAbsorptionOpportunity)}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  hasAbsorptionOpportunity
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${hasAbsorptionOpportunity ? 'border-white bg-white text-slate-900' : 'border-slate-400 bg-white'}`}>
                  {hasAbsorptionOpportunity && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs">Opsi Pengangkatan Menjadi Karyawan</span>
              </button>
            </div>
          )}
        </div>

        {/* FUZZY AFIRMASI */}
        <div className="flex items-start gap-3 pt-3 border-t border-slate-200/70">
          <input
            type="checkbox"
            id="studioEquivToggle"
            checked={allowEquivalence}
            onChange={(e) => setAllowEquivalence(e.target.checked)}
            className="w-4 h-4 accent-slate-900 mt-0.5 shrink-0 rounded"
          />
          <label htmlFor="studioEquivToggle" className="text-xs text-slate-800 leading-snug cursor-pointer">
            <strong className="text-slate-900 block font-bold">
              Aktifkan Penyetaraan Pengalaman Fuzzy (Afirmasi Kemampuan Lapangan)
            </strong>
            Pengalaman kerja riil dan portofolio kandidat daerah diakui setara kualifikasi formal oleh AI Radar Matching Engine.
          </label>
        </div>
      </div>

      {/* SASARAN PENGKHUSUSAN TENAGA KERJA (AFIRMASI DAERAH) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Sasaran Tenaga Kerja &amp; Kebijakan Afirmasi
            </span>
          </div>
          <ModernBadge variant="neutral">Perda Afirmasi Daerah</ModernBadge>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Tentukan sasaran pelamar untuk posisi ini sesuai kebutuhan operasional korporat dan amanat pemberdayaan tenaga kerja lokal:
        </p>

        <div className="space-y-2.5">
          {/* Pilihan 1: ALL */}
          <button
            type="button"
            onClick={() => setTargetWorkforce('ALL')}
            className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              targetWorkforce === 'ALL'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                targetWorkforce === 'ALL' ? 'border-amber-400 bg-amber-400' : 'border-slate-400 bg-white'
              }`}
            >
              {targetWorkforce === 'ALL' && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs uppercase font-bold">Terbuka untuk Umum</strong>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    targetWorkforce === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Lokal &amp; Non-Lokal
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${targetWorkforce === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
                Semua talenta (warga lokal maupun non-lokal) dapat dipertimbangkan setara berbasis keahlian teknis.
              </p>
            </div>
          </button>

          {/* Pilihan 2: LOCAL_ONLY */}
          <button
            type="button"
            onClick={() => setTargetWorkforce('LOCAL_ONLY')}
            className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              targetWorkforce === 'LOCAL_ONLY'
                ? 'border-emerald-600 bg-emerald-800 text-white shadow-xs'
                : 'border-emerald-200 bg-emerald-50/40 text-slate-800 hover:bg-emerald-50'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                targetWorkforce === 'LOCAL_ONLY' ? 'border-emerald-300 bg-emerald-300' : 'border-emerald-500 bg-white'
              }`}
            >
              {targetWorkforce === 'LOCAL_ONLY' && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-900" />
              )}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <strong
                  className={`text-xs uppercase font-bold ${
                    targetWorkforce === 'LOCAL_ONLY' ? 'text-emerald-100' : 'text-emerald-950'
                  }`}
                >
                  Khusus Tenaga Kerja Lokal
                </strong>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    targetWorkforce === 'LOCAL_ONLY'
                      ? 'bg-emerald-700 text-emerald-100'
                      : 'bg-emerald-100 text-emerald-900 font-semibold'
                  }`}
                >
                  Afirmasi OAP Mimika
                </span>
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  targetWorkforce === 'LOCAL_ONLY' ? 'text-emerald-100' : 'text-emerald-800'
                }`}
              >
                Dikhususkan mutlak untuk talenta warga lokal (OAP). AI memprioritaskan talenta lokal di urutan teratas.
              </p>
            </div>
          </button>

          {/* Pilihan 3: NON_LOCAL */}
          <button
            type="button"
            onClick={() => setTargetWorkforce('NON_LOCAL')}
            className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              targetWorkforce === 'NON_LOCAL'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                targetWorkforce === 'NON_LOCAL' ? 'border-sky-400 bg-sky-400' : 'border-slate-400 bg-white'
              }`}
            >
              {targetWorkforce === 'NON_LOCAL' && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs uppercase font-bold">Tenaga Kerja Non-Lokal / Nasional</strong>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    targetWorkforce === 'NON_LOCAL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Keahlian Nasional
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${targetWorkforce === 'NON_LOCAL' ? 'text-slate-300' : 'text-slate-500'}`}>
                Untuk spesialisasi teknis atau keahlian khusus tertentu yang didatangkan dari luar daerah Mimika.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
