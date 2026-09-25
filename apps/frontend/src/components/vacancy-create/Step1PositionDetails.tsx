'use client';

import React, { useRef } from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import {
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  List,
  ListPlus,
  Sparkles,
} from 'lucide-react';

interface Step1PositionDetailsProps {
  opportunityType: 'JOB' | 'INTERNSHIP';
  setOpportunityType: (val: 'JOB' | 'INTERNSHIP') => void;
  title: string;
  setTitle: (val: string) => void;
  quota: number;
  setQuota: (val: number) => void;
  activeDaysDuration: number;
  setActiveDaysDuration: (val: number) => void;
  contractType: 'PKWT' | 'PKWTT' | 'HARIAN_LEPAS';
  setContractType: (val: 'PKWT' | 'PKWTT' | 'HARIAN_LEPAS') => void;
  durationMonths: number;
  setDurationMonths: (val: number) => void;
  isCustomDuration: boolean;
  setIsCustomDuration: (val: boolean) => void;
  customDurationValue: string;
  setCustomDurationValue: (val: string) => void;
  projectDuration: string;
  taskDescription: string;
  setTaskDescription: (val: string) => void;
  isPolishingTasks: boolean;
  onPolishTasks: () => void;
  isFetchingSuggestions: boolean;
  aiSuggestions: {
    inferredCategory: string;
    categoryLabel: string;
    recommendedSkills: string[];
    recommendedTools: string[];
    suggestedEducation?: string;
  } | null;
  onAddSkillTag: (tag: string) => void;
  onAddWorkToolTag: (tag: string) => void;
  skillTags: string[];
  workToolsTags: string[];
  setMinExperienceYears: (val: number) => void;
}

export function Step1PositionDetails({
  opportunityType,
  setOpportunityType,
  title,
  setTitle,
  quota,
  setQuota,
  activeDaysDuration,
  setActiveDaysDuration,
  contractType,
  setContractType,
  durationMonths,
  setDurationMonths,
  isCustomDuration,
  setIsCustomDuration,
  customDurationValue,
  setCustomDurationValue,
  projectDuration,
  taskDescription,
  setTaskDescription,
  isPolishingTasks,
  onPolishTasks,
  isFetchingSuggestions,
  aiSuggestions,
  onAddSkillTag,
  onAddWorkToolTag,
  skillTags,
  workToolsTags,
  setMinExperienceYears,
}: Step1PositionDetailsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Otomatisasi 1: Format teks menjadi butir poin rapi dengan sekali klik
  const handleAutoBullet = () => {
    if (!taskDescription.trim()) return;
    const lines = taskDescription
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const formatted = lines
      .map((line) => {
        const cleaned = line.replace(/^(\d+[\.\)]\s*|[-•*]\s*)/, '').trim();
        return `- ${cleaned}`;
      })
      .join('\n');

    setTaskDescription(formatted);
  };

  // Otomatisasi 2: Tambah baris butir poin baru secara instan
  const handleAddBulletPoint = () => {
    const trimmed = taskDescription.trim();
    let nextText = '';
    if (!trimmed) {
      nextText = '- ';
    } else {
      nextText = `${trimmed}\n- `;
    }
    setTaskDescription(nextText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = nextText.length;
        textareaRef.current.selectionEnd = nextText.length;
      }
    }, 10);
  };

  // Otomatisasi 3: Smart Enter (Lanjut bullet otomatis & exit saat bullet kosong)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Enter') {
      const { selectionStart, selectionEnd, value } = textarea;
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = beforeCursor.substring(currentLineStart);

      const isBulletLine = /^(\s*[-•*]\s*)/.test(currentLine);

      if (isBulletLine) {
        e.preventDefault();
        const trimmedLine = currentLine.trim();
        if (trimmedLine === '-' || trimmedLine === '•' || trimmedLine === '*') {
          const newValue = value.substring(0, currentLineStart) + afterCursor;
          setTaskDescription(newValue);
          setTimeout(() => {
            textarea.selectionStart = currentLineStart;
            textarea.selectionEnd = currentLineStart;
          }, 0);
          return;
        }

        const insertText = '\n- ';
        const newValue = beforeCursor + insertText + afterCursor;
        setTaskDescription(newValue);
        const newPos = selectionStart + insertText.length;
        setTimeout(() => {
          textarea.selectionStart = newPos;
          textarea.selectionEnd = newPos;
        }, 0);
        return;
      } else {
        if (beforeCursor.trim().length > 0) {
          e.preventDefault();
          const insertText = '\n- ';
          const newValue = beforeCursor + insertText + afterCursor;
          setTaskDescription(newValue);
          const newPos = selectionStart + insertText.length;
          setTimeout(() => {
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos;
          }, 0);
          return;
        }
      }
    }
  };

  // Otomatisasi 4: Ketikan pertama pada textarea kosong otomatis diberi bullet "- "
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (val.length === 1 && val !== '-' && val !== '•' && val !== '*') {
      val = `- ${val}`;
    }
    setTaskDescription(val);
  };

  // Otomatisasi 5: Smart Paste (Otomatis format baris-baris teks tempel menjadi butir poin)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasteText = e.clipboardData.getData('text');
    if (!pasteText) return;

    const lines = pasteText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const formattedPaste = lines
        .map((l) => {
          const cleaned = l.replace(/^(\d+[\.\)]\s*|[-•*]\s*)/, '').trim();
          return `- ${cleaned}`;
        })
        .join('\n');

      const { selectionStart, selectionEnd, value } = textarea;
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);

      const prefix = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
      const insert = `${prefix}${formattedPaste}`;
      const newValue = before + insert + after;
      setTaskDescription(newValue);

      setTimeout(() => {
        textarea.selectionStart = selectionStart + insert.length;
        textarea.selectionEnd = selectionStart + insert.length;
      }, 0);
    }
  };

  const bulletCount = taskDescription.trim()
    ? taskDescription.trim().split('\n').filter((l) => l.trim().length > 0).length
    : 0;

  return (
    <div className="step-transition space-y-6">
      {/* Header Tahap */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              01. Detail Posisi &amp; Hubungan Kerja
            </h3>
            <p className="text-xs text-slate-500">
              Tentukan jenis kesempatan, nama jabatan, kuota, ikatan hukum kontrak, dan uraian tugas.
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Klasifikasi Kerja Dasar
        </ModernBadge>
      </div>

      {/* Grid: Tipe Peluang, Nama Posisi, Kuota, Masa Tayang */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* TIPE PELUANG (md:col-span-4) */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            1. Tipe Peluang Ketenagakerjaan <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOpportunityType('JOB')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                opportunityType === 'JOB'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block uppercase text-[11px] truncate">Pekerjaan</span>
                <span className={`text-[10px] block truncate ${opportunityType === 'JOB' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Standar UMK PKWT
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpportunityType('INTERNSHIP');
                setMinExperienceYears(0);
              }}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                opportunityType === 'INTERNSHIP'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block uppercase text-[11px] truncate">Pemagangan</span>
                <span className={`text-[10px] block truncate ${opportunityType === 'INTERNSHIP' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Vokasi Disnaker
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* NAMA POSISI (md:col-span-5) */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Nama Posisi / Jabatan Pekerjaan <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Operator Excavator, Pengawas K3, Barista..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        {/* KUOTA (md:col-span-1) */}
        <div className="md:col-span-1 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 text-center">
            Kuota <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            min="1"
            required
            value={quota}
            onChange={(e) => setQuota(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold font-mono text-center text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        {/* MASA TAYANG TTL (md:col-span-2) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Masa Tayang (TTL)
          </label>
          <select
            value={activeDaysDuration}
            onChange={(e) => setActiveDaysDuration(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none cursor-pointer"
            title="Batas waktu penayangan sebelum beralih ke status kedaluwarsa"
          >
            <option value={14}>14 Hari (Standar)</option>
            <option value={30}>30 Hari (Panjang)</option>
          </select>
        </div>
      </div>

      {/* TWO-TIER SMART SELECTOR: STATUS HUBUNGAN KERJA & DURASI KONTRAK */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Labor Law Governance (PP No. 35 Tahun 2021)
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-700" />
              <span>Status Hubungan Kerja &amp; Durasi Kontrak</span>
            </h4>
          </div>
          <ModernBadge variant="neutral" className="font-mono text-xs px-3 py-1 font-bold">
            {projectDuration}
          </ModernBadge>
        </div>

        {/* TIER 1: PILIHAN STATUS HUBUNGAN KERJA */}
        {opportunityType === 'JOB' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pilih Status Hubungan Kerja:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setContractType('PKWT')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  contractType === 'PKWT'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${contractType === 'PKWT' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  PKWT (Kontrak Proyek)
                </span>
                <span className={`text-[10px] ${contractType === 'PKWT' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Hubungan kerja berjangka waktu tertentu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setContractType('PKWTT')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  contractType === 'PKWTT'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${contractType === 'PKWTT' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  PKWTT (Karyawan Tetap)
                </span>
                <span className={`text-[10px] ${contractType === 'PKWTT' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Permanen / Waktu tidak tertentu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setContractType('HARIAN_LEPAS')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  contractType === 'HARIAN_LEPAS'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${contractType === 'HARIAN_LEPAS' ? 'bg-sky-400' : 'bg-slate-400'}`} />
                  Pekerja Harian Lepas
                </span>
                <span className={`text-[10px] ${contractType === 'HARIAN_LEPAS' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Pekerjaan harian / insidental
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <strong className="text-xs font-bold uppercase text-purple-950 block">
                Perjanjian Pemagangan Vokasi (Permenaker No. 6 Tahun 2020)
              </strong>
              <span className="text-[11px] text-purple-800">
                Hubungan pembelajaran berbasis kerja industri antara penyelenggara pemagangan dengan peserta magang bersertifikat.
              </span>
            </div>
          </div>
        )}

        {/* TIER 2: PILIHAN DURASI SESUAI STATUS IKATAN */}
        <div className="pt-2 border-t border-slate-200/70">
          {opportunityType === 'JOB' && contractType === 'PKWT' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Durasi Waktu Kontrak PKWT:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[3, 6, 12, 24].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => {
                      setDurationMonths(m);
                      setIsCustomDuration(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                      !isCustomDuration && durationMonths === m
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m === 12 ? '12 Bulan (1 Tahun)' : m === 24 ? '24 Bulan (2 Tahun)' : `${m} Bulan`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    isCustomDuration
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Durasi Kustom
                </button>

                {isCustomDuration && (
                  <div className="inline-flex items-center gap-1.5 ml-1 bg-white border border-slate-200 rounded-xl px-3 py-1">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customDurationValue}
                      onChange={(e) => setCustomDurationValue(e.target.value)}
                      className="w-16 text-xs font-bold font-mono text-center focus:outline-none"
                      placeholder="12"
                    />
                    <span className="text-[11px] font-semibold text-slate-600">Bulan</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ℹ️ <strong>Regulasi PP 35/2021:</strong> Perjanjian Kerja Waktu Tertentu (PKWT) dapat diadakan untuk jangka waktu paling lama 5 (lima) tahun termasuk masa perpanjangan.
              </p>
            </div>
          )}

          {opportunityType === 'JOB' && contractType === 'PKWTT' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-emerald-950 font-bold uppercase block tracking-wide">
                  ✓ Status Hubungan Kerja Permanen (Waktu Tidak Tertentu)
                </strong>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Masa percobaan kerja (probation) maksimal 3 (tiga) bulan sesuai Pasal 60 UU Ketenagakerjaan. Posisi ini akan ditandai dengan badge <strong>&quot;Peluang Tetap (PKWTT)&quot;</strong> di radar pencari kerja.
                </p>
              </div>
            </div>
          )}

          {opportunityType === 'JOB' && contractType === 'HARIAN_LEPAS' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Estimasi Durasi Pekerjaan Harian:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { val: 1, label: '14 Hari Kerja', display: '14 Hari Kerja' },
                  { val: 1, label: '1 Bulan Proyek', display: '1 Bulan Proyek' },
                  { val: 3, label: '3 Bulan Proyek', display: '3 Bulan Proyek' },
                  { val: 6, label: '6 Bulan Proyek', display: '6 Bulan Proyek' },
                ].map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setDurationMonths(item.val);
                      setIsCustomDuration(false);
                      setCustomDurationValue(item.display);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                      !isCustomDuration && customDurationValue === item.display
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    isCustomDuration
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Durasi Kustom
                </button>

                {isCustomDuration && (
                  <div className="inline-flex items-center gap-1.5 ml-1 bg-white border border-slate-200 rounded-xl px-3 py-1">
                    <input
                      type="text"
                      value={customDurationValue}
                      onChange={(e) => setCustomDurationValue(e.target.value)}
                      className="w-36 text-xs font-medium focus:outline-none"
                      placeholder="cth: 21 Hari Kerja"
                    />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ℹ️ <strong>Regulasi PP 35/2021:</strong> Perjanjian kerja harian lepas diperuntukkan bagi pekerjaan dengan hari kerja kurang dari 21 hari dalam 1 bulan.
              </p>
            </div>
          )}

          {opportunityType === 'INTERNSHIP' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Durasi Masa Pemagangan Industri:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { m: 3, label: '3 Bulan' },
                  { m: 6, label: '6 Bulan (Standar Vokasi Disnaker)' },
                  { m: 12, label: '12 Bulan (Maksimal Permenaker)' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.m}
                    onClick={() => {
                      setDurationMonths(item.m);
                      setIsCustomDuration(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                      !isCustomDuration && durationMonths === item.m
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ℹ️ <strong>Permenaker 6/2020:</strong> Jangka waktu pemagangan dalam negeri dilaksanakan paling lama 1 (satu) tahun.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* URAIAN TUGAS OPERASIONAL */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5 sm:p-6 space-y-4">
        {/* Header Bersih & Rapi Tanpa Tombol Berjejal */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                Uraian Tanggung Jawab &amp; Tugas Pokok <span className="text-rose-600">*</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 pl-8">
              Jelaskan tanggung jawab harian atau target operasional posisi ini.
            </p>
          </div>
        </div>

        {/* Integrated Rich Textarea Container with Attached Top Toolbar */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-800/10 transition-all">
          {/* Unified Editor Toolbar */}
          <div className="bg-slate-50/90 border-b border-slate-200 px-3.5 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoBullet}
                disabled={!taskDescription.trim()}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-40"
                title="Format semua baris menjadi butir poin rapi"
              >
                <List className="w-3.5 h-3.5 text-slate-600" />
                <span>Format Butir</span>
              </button>

              <button
                type="button"
                onClick={handleAddBulletPoint}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Tambah baris butir baru di bawah"
              >
                <ListPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>+ Tambah Poin</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-medium text-[11px] pl-2 border-l border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Auto-Bullet Aktif</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onPolishTasks}
              disabled={isPolishingTasks || !taskDescription.trim()}
              className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-sm shrink-0"
              title="Gunakan AI Copilot untuk merapikan draf tugas menjadi uraian profesional standar industri"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isPolishingTasks ? 'Merapikan...' : '✨ Rapikan dengan AI'}</span>
            </button>
          </div>

          {/* Area Textarea */}
          <textarea
            ref={textareaRef}
            required
            rows={7}
            value={taskDescription}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ketik uraian tanggung jawab di sini... (Sistem otomatis memformat butir poin pada setiap baris)"
            className="w-full min-h-[180px] sm:min-h-[220px] p-4 sm:p-5 text-sm text-slate-900 placeholder:text-slate-400 border-none outline-none leading-relaxed font-normal resize-y bg-transparent"
          />
        </div>

        {/* Footer info: tips & realtime counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500 pt-0.5">
          <span>💡 Tekan Enter dua kali saat di baris kosong untuk keluar dari daftar butir.</span>
          <span className="font-mono text-slate-500 font-medium shrink-0">
            {bulletCount} Butir Poin • {taskDescription.length} Karakter
          </span>
        </div>
      </div>

      {/* STRIP BANTUAN CERDAS AI (CONTEXTUAL SUGGESTIONS) */}
      {isFetchingSuggestions && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              AI sedang menganalisis keahlian &amp; inventaris kerja untuk &quot;{title}&quot;...
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">GPT-4o Copilot</span>
        </div>
      )}

      {!isFetchingSuggestions && aiSuggestions && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Saran AI Relevan Terdeteksi
              </span>
            </div>
            <ModernBadge variant="neutral" className="bg-white/10 text-slate-200 border-white/20">
              Kluster: {aiSuggestions.categoryLabel}
            </ModernBadge>
          </div>

          {aiSuggestions.recommendedSkills && aiSuggestions.recommendedSkills.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-300 uppercase block mb-1.5 font-medium">
                Saran Keahlian (Klik untuk Tambahkan Langsung):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestions.recommendedSkills.map((sk) => {
                  const isAdded = skillTags.includes(sk);
                  return (
                    <button
                      type="button"
                      key={sk}
                      onClick={() => onAddSkillTag(sk)}
                      disabled={isAdded}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        isAdded
                          ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-white text-slate-900 border-white hover:bg-amber-300 font-medium'
                      }`}
                    >
                      {isAdded ? '✓ ' : '+ '} {sk}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {aiSuggestions.recommendedTools && aiSuggestions.recommendedTools.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-300 uppercase block mb-1.5 font-medium">
                Saran Sarana Kerja (Klik untuk Tambahkan Langsung):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestions.recommendedTools.map((tl) => {
                  const isAdded = workToolsTags.includes(tl);
                  return (
                    <button
                      type="button"
                      key={tl}
                      onClick={() => onAddWorkToolTag(tl)}
                      disabled={isAdded}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        isAdded
                          ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200 font-medium'
                      }`}
                    >
                      {isAdded ? '✓ ' : '+ '} {tl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
