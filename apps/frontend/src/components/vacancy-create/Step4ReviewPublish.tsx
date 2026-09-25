'use client';

import React from 'react';
import { ModernBadge, ModernButton } from '@/components/ui/ModernPrimitives';
import {
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';

interface Step4ReviewPublishProps {
  opportunityType: 'JOB' | 'INTERNSHIP';
  title: string;
  quota: number;
  activeDaysDuration: number;
  projectDuration: string;
  taskDescription: string;
  minEducation: string;
  minExperienceYears: number;
  allowEquivalence: boolean;
  targetWorkforce: 'ALL' | 'LOCAL_ONLY' | 'NON_LOCAL';
  workSchedule: string;
  officeAddress?: string;
  salaryMinDisplay: string;
  salaryMaxDisplay: string;
  stipendAmountDisplay: string;
  skillTags: string[];
  selectedBenefitsCount: number;
  workToolsTags: string[];
  skillsGainedTags: string[];
  mentorName: string;
  submitting: boolean;
}

export function Step4ReviewPublish({
  opportunityType,
  title,
  quota,
  activeDaysDuration,
  projectDuration,
  taskDescription,
  minEducation,
  minExperienceYears,
  allowEquivalence,
  targetWorkforce,
  workSchedule,
  officeAddress,
  salaryMinDisplay,
  salaryMaxDisplay,
  stipendAmountDisplay,
  skillTags,
  selectedBenefitsCount,
  workToolsTags,
  skillsGainedTags,
  mentorName,
  submitting,
}: Step4ReviewPublishProps) {
  const isTitleReady = Boolean(title.trim());
  const isTasksReady = Boolean(taskDescription.trim());
  const isSkillsReady = skillTags.length > 0;
  const isInternReady = opportunityType === 'JOB' || skillsGainedTags.length > 0;

  const isAllReady = isTitleReady && isTasksReady && isSkillsReady && isInternReady;

  return (
    <div className="step-transition space-y-6">
      {/* Header Tahap */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              04. Tinjauan Akhir &amp; Publikasi Lowongan
            </h3>
            <p className="text-xs text-slate-500">
              Periksa ringkasan pratinjau sebelum diterbitkan ke sistem AI Radar Pencari Kerja.
            </p>
          </div>
        </div>
        <ModernBadge variant={isAllReady ? 'success' : 'warning'} className="self-start sm:self-auto">
          {isAllReady ? 'Siap Diterbitkan' : 'Periksa Kelengkapan'}
        </ModernBadge>
      </div>

      {/* KARTU PRATINJAU IKLAN LOWONGAN */}
      <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ModernBadge variant="neutral" className="bg-slate-900 text-white font-mono text-[10px]">
                {opportunityType === 'JOB' ? 'PEKERJAAN (JOB)' : 'PEMAGANGAN VOKASI'}
              </ModernBadge>
              <ModernBadge
                variant={
                  targetWorkforce === 'LOCAL_ONLY'
                    ? 'success'
                    : targetWorkforce === 'NON_LOCAL'
                    ? 'info'
                    : 'neutral'
                }
              >
                {targetWorkforce === 'LOCAL_ONLY'
                  ? 'Khusus OAP Mimika'
                  : targetWorkforce === 'NON_LOCAL'
                  ? 'Keahlian Nasional'
                  : 'Terbuka Umum'}
              </ModernBadge>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Masa Tayang: {activeDaysDuration} Hari
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title || '(Belum Ada Judul Posisi)'}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                Kuota: <span className="font-mono">{quota} Orang</span>
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">{projectDuration}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {officeAddress ? `${officeAddress}` : 'Kabupaten Mimika'}
              </span>
            </div>
          </div>

          {/* Badge Kompensasi */}
          <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              {opportunityType === 'JOB' ? 'Ekspektasi Kompensasi' : 'Uang Saku Pemagangan'}
            </span>
            <span className="text-base font-mono font-bold text-slate-900 mt-0.5 block">
              {opportunityType === 'JOB'
                ? salaryMinDisplay && salaryMaxDisplay
                  ? `Rp ${salaryMinDisplay} - ${salaryMaxDisplay}`
                  : 'Kompetitif (Negosiasi)'
                : stipendAmountDisplay
                ? `Rp ${stipendAmountDisplay} / Bln`
                : 'Sesuai Ketentuan'}
            </span>
          </div>
        </div>

        {/* Uraian Tugas */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
            Deskripsi Tanggung Jawab &amp; Target Pekerjaan
          </span>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            {taskDescription || '(Belum ada uraian tugas)'}
          </p>
        </div>

        {/* Keahlian & Kualifikasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-700" />
              <span>Keahlian Teknis Wajib ({skillTags.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skillTags.length === 0 ? (
                <span className="text-xs text-rose-600 font-semibold italic">
                  Belum ada keahlian yang ditentukan (Wajib minimal 1)
                </span>
              ) : (
                skillTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
              <span>Syarat Pendidikan &amp; Pengalaman</span>
            </span>
            <div className="text-xs text-slate-700 space-y-1 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
              <div>
                Pendidikan Minimal: <strong>{minEducation}</strong>
              </div>
              <div>
                Pengalaman Kerja:{' '}
                <strong>
                  {opportunityType === 'JOB'
                    ? `${minExperienceYears} Tahun`
                    : 'Terbuka Lulusan Baru (Fresh)'}
                </strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Penyetaraan Fuzzy: {allowEquivalence ? 'Aktif (Afirmasi Lapangan)' : 'Nonaktif'}
              </div>
            </div>
          </div>
        </div>

        {/* Sarana & Fasilitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>Fasilitas Kesejahteraan: {selectedBenefitsCount} Fasilitas</span>
            </span>
            <span className="text-xs text-slate-600">
              Termasuk asuransi, perlindungan kesehatan, serta tunjangan yang dijamin korporat.
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-700" />
              <span>Sarana Kerja Disiapkan: {workToolsTags.length} Item</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {workToolsTags.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Standar perlengkapan kantor.</span>
              ) : (
                workToolsTags.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-md border border-slate-200"
                  >
                    {tool}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Khusus Magang */}
        {opportunityType === 'INTERNSHIP' && (
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5 text-xs text-purple-900">
            <span className="font-bold uppercase block text-purple-950">
              Kurikulum Vokasi &amp; Mentor:
            </span>
            <div>
              Target Kompetensi: <strong>{skillsGainedTags.join(', ') || 'Belum ada'}</strong>
            </div>
            {mentorName && (
              <div>
                Mentor Pembimbing: <strong>{mentorName}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CHECKLIST KESIAPAN SEBELUM TERBIT */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Checklist Kesiapan Penerbitan Lowongan
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-700 font-medium">1. Judul &amp; Kuota</span>
            {isTitleReady ? (
              <ModernBadge variant="success">Lengkap</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Wajib</ModernBadge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-700 font-medium">2. Deskripsi Tugas</span>
            {isTasksReady ? (
              <ModernBadge variant="success">Lengkap</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Wajib</ModernBadge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-700 font-medium">3. Keahlian Wajib</span>
            {isSkillsReady ? (
              <ModernBadge variant="success">Lengkap</ModernBadge>
            ) : (
              <ModernBadge variant="warning">Min. 1</ModernBadge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-700 font-medium">4. Afirmasi Tenaga Kerja</span>
            <ModernBadge variant="success">Terpasang</ModernBadge>
          </div>
        </div>
      </div>

      {/* TOMBOL AKSI TERBITKAN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Siap Menerbitkan Lowongan ke Radar AI?
          </h4>
          <p className="text-xs text-slate-300">
            Kebutuhan lowongan ini akan langsung disiarkan ke pelamar dan dinilai kesesuaiannya oleh AI Matching Engine.
          </p>
        </div>

        <ModernButton
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3 text-xs"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Menerbitkan...' : 'Terbitkan & Buka Radar Kandidat AI'}</span>
        </ModernButton>
      </div>
    </div>
  );
}
