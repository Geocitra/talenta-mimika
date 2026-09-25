'use client';

import React from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import {
  JOB_BENEFIT_OPTIONS,
  INTERNSHIP_BENEFIT_OPTIONS,
  BenefitOption,
} from './types';
import {
  BookOpen,
  Check,
  DollarSign,
  MapPin,
  Wrench,
  X,
} from 'lucide-react';

interface Step3CompensationWorkplaceProps {
  opportunityType: 'JOB' | 'INTERNSHIP';
  officeAddress?: string;
  isSameAsOfficeLocation: boolean;
  setIsSameAsOfficeLocation: (val: boolean) => void;
  workSchedule: string;
  setWorkSchedule: (val: string) => void;
  salaryMinDisplay: string;
  setSalaryMinDisplay: (val: string) => void;
  salaryMaxDisplay: string;
  setSalaryMaxDisplay: (val: string) => void;
  stipendAmountDisplay: string;
  setStipendAmountDisplay: (val: string) => void;
  onFormatDots: (val: string) => string;
  selectedJobBenefits: string[];
  selectedInternBenefits: string[];
  onToggleBenefit: (key: string) => void;
  workToolsTags: string[];
  workToolsInputText: string;
  setWorkToolsInputText: (val: string) => void;
  onAddWorkToolTag: (tag: string) => void;
  onRemoveWorkToolTag: (tag: string) => void;
  skillsGainedTags: string[];
  skillsGainedInputText: string;
  setSkillsGainedInputText: (val: string) => void;
  onAddSkillGainedTag: (tag: string) => void;
  onRemoveSkillGainedTag: (tag: string) => void;
  mentorName: string;
  setMentorName: (val: string) => void;
  mentorRole: string;
  setMentorRole: (val: string) => void;
}

export function Step3CompensationWorkplace({
  opportunityType,
  officeAddress,
  isSameAsOfficeLocation,
  setIsSameAsOfficeLocation,
  workSchedule,
  setWorkSchedule,
  salaryMinDisplay,
  setSalaryMinDisplay,
  salaryMaxDisplay,
  setSalaryMaxDisplay,
  stipendAmountDisplay,
  setStipendAmountDisplay,
  onFormatDots,
  selectedJobBenefits,
  selectedInternBenefits,
  onToggleBenefit,
  workToolsTags,
  workToolsInputText,
  setWorkToolsInputText,
  onAddWorkToolTag,
  onRemoveWorkToolTag,
  skillsGainedTags,
  skillsGainedInputText,
  setSkillsGainedInputText,
  onAddSkillGainedTag,
  onRemoveSkillGainedTag,
  mentorName,
  setMentorName,
  mentorRole,
  setMentorRole,
}: Step3CompensationWorkplaceProps) {
  const activeBenefitList: BenefitOption[] =
    opportunityType === 'JOB' ? JOB_BENEFIT_OPTIONS : INTERNSHIP_BENEFIT_OPTIONS;
  const activeSelectedBenefits =
    opportunityType === 'JOB' ? selectedJobBenefits : selectedInternBenefits;

  return (
    <div className="step-transition space-y-6">
      {/* Header Tahap */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              03. Lokasi, Kompensasi &amp; Fasilitas Kerja
            </h3>
            <p className="text-xs text-slate-500">
              Atur lokasi penempatan, jadwal kerja, rentang gaji/uang saku, fasilitas BPJS, dan sarana kerja.
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Fasilitas &amp; Kesejahteraan
        </ModernBadge>
      </div>

      {/* PENEMPATAN LOKASI & POLA JADWAL */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-700" />
          <span>Penempatan Lokasi &amp; Pola Jadwal Kerja</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lokasi Penempatan Tugas
            </label>
            <button
              type="button"
              onClick={() => setIsSameAsOfficeLocation(!isSameAsOfficeLocation)}
              className={`w-full p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                isSameAsOfficeLocation
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                  isSameAsOfficeLocation ? 'border-white bg-white text-slate-900' : 'border-slate-400 bg-white'
                }`}
              >
                {isSameAsOfficeLocation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs truncate">
                Sesuai Alamat Kantor ({officeAddress || 'Kantor Pusat Mimika'})
              </span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pola Jadwal &amp; Shift Kerja
            </label>
            <select
              value={workSchedule}
              onChange={(e) => setWorkSchedule(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
            >
              <option value="NORMAL_DAY">Normal Day (Standar Jam Kantor)</option>
              <option value="SHIFT_24H">Shift Bergilir (24 Jam Operasional)</option>
              <option value="ROSTER_FIELD">Roster Lapangan (6-2 / 4-2 On-Off)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KOMPENSASI & FASILITAS KESEJAHTERAAN */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-700" />
          <span>Kompensasi Finansial &amp; Fasilitas</span>
        </span>

        {opportunityType === 'JOB' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Gaji Minimum (Rp/Bulan)
                  </label>
                  <span className="text-[10px] text-slate-400 italic">Opsional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">Rp</span>
                  <input
                    type="text"
                    value={salaryMinDisplay}
                    onChange={(e) => setSalaryMinDisplay(onFormatDots(e.target.value))}
                    placeholder="Negosiasi / Rahasia"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Gaji Maksimum (Rp/Bulan)
                  </label>
                  <span className="text-[10px] text-slate-400 italic">Opsional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">Rp</span>
                  <input
                    type="text"
                    value={salaryMaxDisplay}
                    onChange={(e) => setSalaryMaxDisplay(onFormatDots(e.target.value))}
                    placeholder="Negosiasi / Rahasia"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {(!salaryMinDisplay || !salaryMaxDisplay) && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                ℹ️ Label publik lowongan: <span className="font-semibold text-slate-800">Kompetitif / Sesuai Pengalaman (Negosiasi)</span>
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Besaran Uang Saku Bulanan Magang (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">Rp</span>
              <input
                type="text"
                value={stipendAmountDisplay}
                onChange={(e) => setStipendAmountDisplay(onFormatDots(e.target.value))}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
              />
            </div>
          </div>
        )}

        {/* CHECKLIST FASILITAS KESEJAHTERAAN */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-800">
              Fasilitas Kesejahteraan yang Dijamin:
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {activeSelectedBenefits.length} dipilih
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activeBenefitList.map((b) => {
              const Icon = b.icon;
              const isChecked = activeSelectedBenefits.includes(b.key);
              return (
                <button
                  type="button"
                  key={b.key}
                  onClick={() => onToggleBenefit(b.key)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer select-none transition-all text-left ${
                    isChecked
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${
                      isChecked ? 'border-white bg-white text-slate-900' : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-[11px]">{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SARANA & INVENTARIS KERJA (WORK TOOLS) */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-slate-700" />
            <span>Sarana, Alat Kerja &amp; Inventaris Khusus</span>
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            {workToolsTags.length} item
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Inventaris spesifik yang disiapkan perusahaan (cth: Laptop kantor, APD K3 proyek, Toolkit teknisi, Kendaraan operasional, atau Roster tiket PP).
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={workToolsInputText}
            onChange={(e) => setWorkToolsInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddWorkToolTag(workToolsInputText);
              }
            }}
            placeholder="Ketik alat/sarana kerja..."
            className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
          />
          <button
            type="button"
            onClick={() => onAddWorkToolTag(workToolsInputText)}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors shadow-xs"
          >
            + Tambah
          </button>
        </div>

        {/* Pilihan Cepat Kebutuhan Spesifik */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Pilihan Cepat:</span>
          {[
            'Laptop / Komputer Kantor',
            'Perlengkapan APD Proyek',
            'Smartphone & Pulsa Kerja',
            'Kendaraan Operasional',
            'Toolkit & Peralatan Teknis',
            'Roster Lapangan & Tiket PP',
          ].map((preset) => {
            const isAdded = workToolsTags.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onAddWorkToolTag(preset)}
                disabled={isAdded}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  isAdded
                    ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer font-medium'
                }`}
              >
                {isAdded ? '✓ ' : '+ '} {preset}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white rounded-xl border border-slate-200">
          {workToolsTags.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Belum ada inventaris/sarana kerja ditambahkan.</span>
          ) : (
            workToolsTags.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <span>{tool}</span>
                <button
                  type="button"
                  onClick={() => onRemoveWorkToolTag(tool)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* KHUSUS PEMAGANGAN VOKASI: KURIKULUM & MENTOR */}
      {opportunityType === 'INTERNSHIP' && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <span>Kurikulum Kompetensi Magang &amp; Mentor Pembimbing</span>
            </span>
            <span className="text-xs font-mono text-purple-700">
              {skillsGainedTags.length} target kompetensi
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillsGainedInputText}
              onChange={(e) => setSkillsGainedInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddSkillGainedTag(skillsGainedInputText);
                }
              }}
              placeholder="Ketik target keterampilan magang yang akan diajarkan..."
              className="flex-1 rounded-xl border border-purple-200 bg-white p-3 text-xs text-slate-900 focus:border-purple-800 outline-none"
            />
            <button
              type="button"
              onClick={() => onAddSkillGainedTag(skillsGainedInputText)}
              className="px-4 py-3 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              + Tambah
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[36px] p-3 bg-white rounded-xl border border-purple-200">
            {skillsGainedTags.length === 0 ? (
              <span className="text-xs text-slate-400 italic">Belum ada target keterampilan magang.</span>
            ) : (
              skillsGainedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900 text-white text-xs font-semibold rounded-lg"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSkillGainedTag(tag)}
                    className="text-purple-300 hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-200/80">
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1.5">
                Nama Pejabat / Mentor Pembimbing
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="cth: Ir. Ahmad Subagyo"
                className="w-full rounded-xl border border-purple-200 bg-white p-3 text-xs text-slate-900 focus:border-purple-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-950 mb-1.5">
                Jabatan / Posisi Mentor
              </label>
              <input
                type="text"
                value={mentorRole}
                onChange={(e) => setMentorRole(e.target.value)}
                placeholder="cth: Lead Automation Engineer"
                className="w-full rounded-xl border border-purple-200 bg-white p-3 text-xs text-slate-900 focus:border-purple-800 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
