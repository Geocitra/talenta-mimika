'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Send,
  Check,
  X,
  Plus,
  Trash2,
  DollarSign,
  MapPin,
  Clock,
  Award,
  Coffee,
  Bus,
  Home,
  CalendarCheck,
  FileCheck,
  HeartHandshake,
  BookOpen,
  Wrench,
  ShieldCheck,
  Phone,
  MessageCircle,
  Eye,
  RotateCcw,
  Laptop,
  TrendingUp,
  Car,
  Plane
} from 'lucide-react';

// KATALOG BENEFIT KESEJAHTERAAN UMUM (EMPLOYEE WELFARE & BENEFITS)
const JOB_BENEFIT_OPTIONS = [
  { key: 'BPJS_LENGKAP', label: 'BPJS Naker & Kesehatan Penuh', icon: ShieldCheck },
  { key: 'TUNJANGAN_TRANSPORT', label: 'Tunjangan Transport / Bensin', icon: Car },
  { key: 'TUNJANGAN_MAKAN', label: 'Uang Makan / Konsumsi Kerja', icon: Coffee },
  { key: 'BONUS_INSENTIF', label: 'Bonus Kinerja, Insentif & Komisi', icon: TrendingUp },
  { key: 'TUNJANGAN_KOMUNIKASI', label: 'Tunjangan Pulsa / Komunikasi', icon: Phone },
  { key: 'ASURANSI_KESEHATAN', label: 'Asuransi Kesehatan Tambahan', icon: HeartHandshake },
  { key: 'CUTI_TAHUNAN', label: 'Cuti Tahunan & Libur Resmi', icon: CalendarCheck },
  { key: 'BUS_JEMPUTAN', label: 'Bus / Kendaraan Antar-Jemput', icon: Bus },
  { key: 'MESS_AKOMODASI', label: 'Mess / Tempat Tinggal Karyawan', icon: Home },
];

// KATALOG BENEFIT PEMAGANGAN VOKASI (INTERNSHIP - UMUM)
const INTERNSHIP_BENEFIT_OPTIONS = [
  { key: 'BPJS_MAGANG', label: 'Perlindungan Asuransi BPJS (JKK & JKM)', icon: ShieldCheck },
  { key: 'SERTIFIKAT_INDUSTRI', label: 'Sertifikat Resmi Pemagangan Industri', icon: FileCheck },
  { key: 'MENTOR_DEDIKASI', label: 'Bimbingan Mentor Profesional', icon: HeartHandshake },
  { key: 'MAKAN_SIANG', label: 'Uang Makan / Konsumsi Harian', icon: Coffee },
  { key: 'TUNJANGAN_TRANSPORT', label: 'Bantuan Transportasi / Uang Jalan', icon: Bus },
  { key: 'FAST_TRACK_HIRING', label: 'Prioritas Rekrutmen Karyawan Tetap', icon: Sparkles },
];

// HELPER: Format Angka ke Rupiah (cth: 8500000 -> 8.500.000)
function formatNumberWithDots(val: number | string): string {
  if (!val && val !== 0) return '';
  const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseDotsToNumber(str: string): number {
  const cleaned = str.replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function parseDotsToNumberOrUndefined(str?: string): number | undefined {
  if (!str) return undefined;
  const cleaned = str.replace(/\D/g, '');
  if (!cleaned) return undefined;
  const num = parseInt(cleaned, 10);
  return num > 0 ? num : undefined;
}

const LOCAL_STORAGE_DRAFT_KEY = 'mimika_talenta_vacancy_draft_v1';

export default function CreateVacancyStudioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const { alertProps, showAlert } = useAlertModal();

  // STATE FORM LOWONGAN
  const [opportunityType, setOpportunityType] = useState<'JOB' | 'INTERNSHIP'>('JOB');
  const [title, setTitle] = useState('');
  const [quota, setQuota] = useState(1);
  const [taskDescription, setTaskDescription] = useState('');
  const [projectDuration, setProjectDuration] = useState('PKWT - 12 Bulan');
  const [activeDaysDuration, setActiveDaysDuration] = useState<number>(14);
  const [minEducation, setMinEducation] = useState('SMK');
  const [minExperienceYears, setMinExperienceYears] = useState(1);
  const [allowEquivalence, setAllowEquivalence] = useState(true);

  // TWO-TIER SMART SELECTOR KONTRAK & DURASI (PP NO. 35 TAHUN 2021)
  const [contractType, setContractType] = useState<'PKWT' | 'PKWTT' | 'HARIAN_LEPAS'>('PKWT');
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [customDurationValue, setCustomDurationValue] = useState<string>('12');

  // FINANCIAL FORMATTING
  const [salaryMinDisplay, setSalaryMinDisplay] = useState('8.500.000');
  const [salaryMaxDisplay, setSalaryMaxDisplay] = useState('12.000.000');
  const [stipendAmountDisplay, setStipendAmountDisplay] = useState('3.500.000');

  // BENEFIT SELECTIONS (Default netral & fleksibel)
  const [selectedJobBenefits, setSelectedJobBenefits] = useState<string[]>([
    'BPJS_LENGKAP',
  ]);
  const [selectedInternBenefits, setSelectedInternBenefits] = useState<string[]>([
    'BPJS_MAGANG',
    'SERTIFIKAT_INDUSTRI',
  ]);

  // SARANA & INVENTARIS KERJA (WORK TOOLS)
  const [workToolsTags, setWorkToolsTags] = useState<string[]>([]);
  const [workToolsInputText, setWorkToolsInputText] = useState('');

  // SMART LOCATION
  const [isSameAsOfficeLocation, setIsSameAsOfficeLocation] = useState(true);
  const [workZone, setWorkZone] = useState('TIMIKA_KOTA');
  const [workSchedule, setWorkSchedule] = useState('NORMAL_DAY');

  // KEAHLIAN WAJIB (CHIPS)
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillInputText, setSkillInputText] = useState('');

  // KHUSUS MAGANG
  const [skillsGainedTags, setSkillsGainedTags] = useState<string[]>([]);
  const [skillsGainedInputText, setSkillsGainedInputText] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [mentorRole, setMentorRole] = useState('Lead Specialist Lapangan');
  const [hasAbsorptionOpportunity, setHasAbsorptionOpportunity] = useState(true);

  // AI CONTEXTUAL SUGGESTION STATE
  const [aiSuggestions, setAiSuggestions] = useState<{
    inferredCategory: string;
    categoryLabel: string;
    recommendedSkills: string[];
    recommendedTools: string[];
    suggestedEducation?: string;
  } | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isPolishingTasks, setIsPolishingTasks] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronisasi Reaktif Two-Tier Selector ke projectDuration
  useEffect(() => {
    if (opportunityType === 'INTERNSHIP') {
      const dur = isCustomDuration && customDurationValue ? customDurationValue : durationMonths;
      setProjectDuration(`Magang Vokasi - ${dur} Bulan`);
    } else if (contractType === 'PKWTT') {
      setProjectDuration('PKWTT (Karyawan Tetap)');
    } else if (contractType === 'HARIAN_LEPAS') {
      const dur = isCustomDuration && customDurationValue ? `${customDurationValue}` : `${durationMonths} Bulan Proyek`;
      setProjectDuration(`Harian Lepas - ${dur}`);
    } else {
      // PKWT
      const dur = isCustomDuration && customDurationValue ? `${customDurationValue} Bulan` : `${durationMonths} Bulan`;
      setProjectDuration(`PKWT - ${dur}`);
    }
  }, [opportunityType, contractType, durationMonths, isCustomDuration, customDurationValue]);

  useEffect(() => {
    loadProfile();
    restoreDraft();
  }, []);

  // Autosave Draft ke LocalStorage
  useEffect(() => {
    if (!loading && title) {
      saveDraft();
    }
  }, [
    opportunityType,
    title,
    quota,
    taskDescription,
    projectDuration,
    activeDaysDuration,
    contractType,
    durationMonths,
    isCustomDuration,
    customDurationValue,
    minEducation,
    minExperienceYears,
    allowEquivalence,
    salaryMinDisplay,
    salaryMaxDisplay,
    stipendAmountDisplay,
    selectedJobBenefits,
    selectedInternBenefits,
    workToolsTags,
    isSameAsOfficeLocation,
    workZone,
    workSchedule,
    skillTags,
    skillsGainedTags,
    mentorName,
    mentorRole,
    hasAbsorptionOpportunity,
  ]);

  // Debounced AI Suggestions on Title Change
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (!title.trim() || title.trim().length < 3) {
      setAiSuggestions(null);
      return;
    }

    suggestionTimeoutRef.current = setTimeout(() => {
      fetchAiSuggestions(title);
    }, 400);

    return () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, [title]);

  const loadProfile = async () => {
    const res = await apiFetch('/employers/me');
    if (res.status === 'success') {
      setProfile(res.data);
      if (res.data.verificationStatus !== 'APPROVED') {
        router.push('/employer');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  const fetchAiSuggestions = async (queryTitle: string) => {
    setIsFetchingSuggestions(true);
    try {
      const res = await apiFetch<any>(`/vacancies/suggestions?title=${encodeURIComponent(queryTitle)}`);
      if (res.status === 'success' && res.data) {
        setAiSuggestions(res.data);
      }
    } catch (err) {
      console.warn('AI suggestions error:', err);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handlePolishTasks = async () => {
    if (!taskDescription.trim()) return;
    setIsPolishingTasks(true);
    try {
      const res = await apiFetch<any>('/vacancies/ai-assist', {
        method: 'POST',
        body: JSON.stringify({
          action: 'POLISH_TASKS',
          title: title || 'Posisi Pekerjaan Operasional',
          rawTasks: taskDescription,
          opportunityType,
        }),
      });
      if (res.status === 'success' && res.data?.polishedTasks) {
        setTaskDescription(res.data.polishedTasks);
      }
    } catch (err) {
      console.warn('AI polish tasks error:', err);
    } finally {
      setIsPolishingTasks(false);
    }
  };

  // AUTOSAVE & RESTORE DRAFT
  const saveDraft = () => {
    const draft = {
      opportunityType,
      title,
      quota,
      taskDescription,
      projectDuration,
      activeDaysDuration,
      contractType,
      durationMonths,
      isCustomDuration,
      customDurationValue,
      minEducation,
      minExperienceYears,
      allowEquivalence,
      salaryMinDisplay,
      salaryMaxDisplay,
      stipendAmountDisplay,
      selectedJobBenefits,
      selectedInternBenefits,
      workToolsTags,
      isSameAsOfficeLocation,
      workZone,
      workSchedule,
      skillTags,
      skillsGainedTags,
      mentorName,
      mentorRole,
      hasAbsorptionOpportunity,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draft));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    } catch {
      // Abaikan jika localStorage dibatasi
    }
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title) setTitle(d.title);
      if (d.opportunityType) setOpportunityType(d.opportunityType);
      if (d.quota) setQuota(d.quota);
      if (d.taskDescription) setTaskDescription(d.taskDescription);
      if (d.projectDuration) setProjectDuration(d.projectDuration);
      if (d.activeDaysDuration) setActiveDaysDuration(d.activeDaysDuration);
      if (d.contractType) setContractType(d.contractType);
      if (d.durationMonths) setDurationMonths(d.durationMonths);
      if (d.isCustomDuration !== undefined) setIsCustomDuration(d.isCustomDuration);
      if (d.customDurationValue) setCustomDurationValue(d.customDurationValue);
      // Fallback parsing jika draf sebelumnya hanya punya string projectDuration
      if (!d.contractType && d.projectDuration) {
        if (d.projectDuration.includes('PKWTT')) {
          setContractType('PKWTT');
        } else if (d.projectDuration.includes('Harian')) {
          setContractType('HARIAN_LEPAS');
        } else {
          setContractType('PKWT');
        }
      }
      if (d.minEducation) setMinEducation(d.minEducation);
      if (d.minExperienceYears !== undefined) setMinExperienceYears(d.minExperienceYears);
      if (d.allowEquivalence !== undefined) setAllowEquivalence(d.allowEquivalence);
      if (d.salaryMinDisplay) setSalaryMinDisplay(d.salaryMinDisplay);
      if (d.salaryMaxDisplay) setSalaryMaxDisplay(d.salaryMaxDisplay);
      if (d.stipendAmountDisplay) setStipendAmountDisplay(d.stipendAmountDisplay);
      if (Array.isArray(d.selectedJobBenefits)) setSelectedJobBenefits(d.selectedJobBenefits);
      if (Array.isArray(d.selectedInternBenefits)) setSelectedInternBenefits(d.selectedInternBenefits);
      if (Array.isArray(d.workToolsTags)) setWorkToolsTags(d.workToolsTags);
      if (d.isSameAsOfficeLocation !== undefined) setIsSameAsOfficeLocation(d.isSameAsOfficeLocation);
      if (d.workZone) setWorkZone(d.workZone);
      if (d.workSchedule) setWorkSchedule(d.workSchedule);
      if (Array.isArray(d.skillTags)) setSkillTags(d.skillTags);
      if (Array.isArray(d.skillsGainedTags)) setSkillsGainedTags(d.skillsGainedTags);
      if (d.mentorName) setMentorName(d.mentorName);
      if (d.mentorRole) setMentorRole(d.mentorRole);
      if (d.hasAbsorptionOpportunity !== undefined) setHasAbsorptionOpportunity(d.hasAbsorptionOpportunity);
    } catch {
      // Abaikan kegagalan parse draft
    }
  };

  const clearDraft = () => {
    showAlert(
      'warning',
      'Reset Formulir Draf?',
      'Apakah Anda yakin ingin mengosongkan seluruh isian formulir kebutuhan ini? Tindakan ini tidak dapat dibatalkan.',
      'Ya, Kosongkan',
      () => {
        localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        setTitle('');
        setTaskDescription('');
        setContractType('PKWT');
        setDurationMonths(12);
        setIsCustomDuration(false);
        setCustomDurationValue('12');
        setSkillTags([]);
        setWorkToolsTags([]);
        setSkillsGainedTags([]);
        setAiSuggestions(null);
        setSelectedJobBenefits([]);
        setSelectedInternBenefits([]);
        setError('');
        setSuccessMessage('');
        setIsDraftSaved(false);
      },
    );
  };

  // TOGGLE BENEFIT
  const toggleBenefit = (key: string) => {
    if (opportunityType === 'JOB') {
      setSelectedJobBenefits(
        selectedJobBenefits.includes(key)
          ? selectedJobBenefits.filter((b) => b !== key)
          : [...selectedJobBenefits, key]
      );
    } else {
      setSelectedInternBenefits(
        selectedInternBenefits.includes(key)
          ? selectedInternBenefits.filter((b) => b !== key)
          : [...selectedInternBenefits, key]
      );
    }
  };

  // TAG HANDLERS: KEAHLIAN
  const addSkillTag = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!skillTags.includes(trimmed)) {
      setSkillTags([...skillTags, trimmed]);
    }
    setSkillInputText('');
  };

  const removeSkillTag = (skillToRemove: string) => {
    setSkillTags(skillTags.filter((s) => s !== skillToRemove));
  };

  // TAG HANDLERS: SARANA & INVENTARIS KERJA (WORK TOOLS)
  const addWorkToolTag = (toolName: string) => {
    const trimmed = toolName.trim();
    if (!trimmed) return;
    if (!workToolsTags.includes(trimmed)) {
      setWorkToolsTags([...workToolsTags, trimmed]);
    }
    setWorkToolsInputText('');
  };

  const removeWorkToolTag = (toolToRemove: string) => {
    setWorkToolsTags(workToolsTags.filter((t) => t !== toolToRemove));
  };

  // TAG HANDLERS: KETERAMPILAN MAGANG YANG DITRANSFER
  const addSkillGainedTag = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!skillsGainedTags.includes(trimmed)) {
      setSkillsGainedTags([...skillsGainedTags, trimmed]);
    }
    setSkillsGainedInputText('');
  };

  const removeSkillGainedTag = (skillToRemove: string) => {
    setSkillsGainedTags(skillsGainedTags.filter((s) => s !== skillToRemove));
  };

  // SUBMIT PUBLIKASI LOWONGAN
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (skillTags.length === 0) {
      setError('Mohon cantumkan minimal 1 keahlian yang dibutuhkan.');
      showAlert('warning', 'Keahlian Wajib Diisi', 'Mohon cantumkan minimal 1 keahlian yang dibutuhkan oleh lowongan ini.');
      setSubmitting(false);
      return;
    }

    if (opportunityType === 'INTERNSHIP' && skillsGainedTags.length === 0) {
      setError('Program magang wajib mencantumkan minimal 1 keterampilan yang akan ditransfer ke peserta.');
      showAlert('warning', 'Keterampilan Magang Diperlukan', 'Program magang wajib mencantumkan minimal 1 keterampilan yang akan ditransfer ke peserta.');
      setSubmitting(false);
      return;
    }

    const effectiveContractType = opportunityType === 'INTERNSHIP' ? 'PEMAGANGAN' : contractType;
    const effectiveDurationMonths =
      opportunityType === 'INTERNSHIP'
        ? (isCustomDuration && customDurationValue ? Number(customDurationValue) : durationMonths)
        : contractType === 'PKWTT'
          ? undefined
          : (isCustomDuration && customDurationValue ? Number(customDurationValue) : durationMonths);

    const payload = {
      title,
      opportunityType,
      contractType: effectiveContractType,
      contractDurationMonths: effectiveDurationMonths,
      quota: Number(quota) || 1,
      taskDescription,
      projectDuration,
      activeDaysDuration: Number(activeDaysDuration) || 14,
      requiredSkills: skillTags,
      minEducation,
      minExperienceYears: opportunityType === 'INTERNSHIP' ? 0 : Number(minExperienceYears),
      allowEquivalence,
      salaryMin: opportunityType === 'JOB' ? parseDotsToNumberOrUndefined(salaryMinDisplay) : undefined,
      salaryMax: opportunityType === 'JOB' ? parseDotsToNumberOrUndefined(salaryMaxDisplay) : undefined,
      stipendAmount: opportunityType === 'INTERNSHIP' ? parseDotsToNumberOrUndefined(stipendAmountDisplay) : undefined,
      benefits: opportunityType === 'JOB' ? selectedJobBenefits : selectedInternBenefits,
      workTools: workToolsTags,
      isSameAsOfficeLocation,
      workZone,
      workSchedule,
      skillsGained: opportunityType === 'INTERNSHIP' ? skillsGainedTags : undefined,
      mentorName: opportunityType === 'INTERNSHIP' ? mentorName : undefined,
      mentorRole: opportunityType === 'INTERNSHIP' ? mentorRole : undefined,
      hasAbsorptionOpportunity: opportunityType === 'INTERNSHIP' ? hasAbsorptionOpportunity : undefined,
    };

    const res = await apiFetch('/vacancies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.status === 'success') {
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      setSuccessMessage('Kebutuhan berhasil diterbitkan secara resmi! Membuka radar AI kandidat...');
      showAlert(
        'success',
        'Lowongan Berhasil Diterbitkan!',
        'Kebutuhan tenaga kerja Anda telah resmi diterbitkan ke sistem. Radar AI siap memindai dan menyajikan kecocokan kandidat daerah.',
        'Buka Radar AI Kandidat →',
        () => {
          router.push(`/employer/vacancies/${res.data.id}/candidates`);
        },
      );
    } else {
      const errMsg = res.message || 'Gagal menerbitkan kebutuhan lowongan.';
      setError(errMsg);
      showAlert('error', 'Gagal Menerbitkan Lowongan', errMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        Mempersiapkan Studio Perumusan Lowongan...
      </div>
    );
  }

  const activeBenefitList = opportunityType === 'JOB' ? JOB_BENEFIT_OPTIONS : INTERNSHIP_BENEFIT_OPTIONS;
  const activeSelectedBenefits = opportunityType === 'JOB' ? selectedJobBenefits : selectedInternBenefits;

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="w-full space-y-4">
        {/* TOP BAR / BREADCRUMB */}
        <div className="bg-white border border-neutral-300 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <Link
                href="/employer"
                className="text-neutral-500 hover:text-neutral-900 font-semibold uppercase flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard Perusahaan
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-900 font-bold uppercase">Form Kebutuhan</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-neutral-800" />
              Form Kebutuhan Tenaga Kerja & Pemagangan
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Laporkan kebutuhan tenaga kerja industri atau pemagangan vokasi untuk dipadankan ke talenta daerah oleh AI Radar.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isDraftSaved && (
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Draf Tersimpan
              </span>
            )}
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs text-neutral-600 hover:text-red-700 border border-neutral-300 px-3 py-2 uppercase font-semibold flex items-center gap-1 hover:bg-neutral-50 cursor-pointer"
              title="Kosongkan formulir draf"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Draf</span>
            </button>
            <Link
              href="/employer"
              className="text-xs text-neutral-700 border border-neutral-300 px-3 py-2 uppercase font-semibold hover:bg-neutral-100"
            >
              Batal
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORMULIR UTAMA */}
        <div className="bg-white border border-neutral-300 p-4 sm:p-5">
          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            {/* 1. ROW ATAS: TIPE PELUANG, POSISI, KUOTA & DURASI */}
            <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* TIPE PELUANG (md:col-span-4) */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-900">
                    1. Tipe Peluang Ketenagakerjaan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOpportunityType('JOB')}
                      className={`p-2.5 border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                        opportunityType === 'JOB'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block uppercase text-[11px] truncate">Pekerjaan (JOB)</span>
                        <span className="text-[10px] opacity-75 block truncate">Standar UMK PKWT</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpportunityType('INTERNSHIP');
                        setMinExperienceYears(0);
                      }}
                      className={`p-2.5 border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                        opportunityType === 'INTERNSHIP'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block uppercase text-[11px] truncate">Pemagangan</span>
                        <span className="text-[10px] opacity-75 block truncate">Vokasi Disnaker</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* NAMA POSISI (md:col-span-5) */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase text-neutral-800">
                    Nama Posisi / Jabatan Pekerjaan
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="cth: Operator Excavator, Barista..."
                    className="w-full border border-neutral-300 px-3 py-2 text-xs font-semibold bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {/* KUOTA (md:col-span-1) */}
                <div className="md:col-span-1 space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase text-neutral-800">
                    Kuota
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quota}
                    onChange={(e) => setQuota(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full border border-neutral-300 px-2 py-2 text-xs font-bold font-mono text-center bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {/* MASA TAYANG TTL (md:col-span-2) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase text-neutral-800">
                    Masa Tayang (TTL)
                  </label>
                  <select
                    value={activeDaysDuration}
                    onChange={(e) => setActiveDaysDuration(Number(e.target.value))}
                    className="w-full border border-neutral-300 px-2.5 py-2 text-xs font-medium bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
                    title="Batas waktu penayangan sebelum beralih ke status kedaluwarsa"
                  >
                    <option value={14}>14 Hari (Standar)</option>
                    <option value={30}>30 Hari (Panjang)</option>
                  </select>
                </div>
              </div>

              {/* TWO-TIER SMART SELECTOR: STATUS HUBUNGAN KERJA & DURASI KONTRAK */}
              <div className="p-4 bg-white border border-neutral-300 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Labor Law Governance (PP No. 35 Tahun 2021)
                    </span>
                    <h3 className="text-xs font-bold uppercase text-neutral-900 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-700" />
                      Status Hubungan Kerja &amp; Durasi Kontrak
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2.5 py-1 shrink-0 self-start sm:self-auto border border-neutral-800">
                    {projectDuration}
                  </span>
                </div>

                {/* TIER 1: PILIHAN STATUS HUBUNGAN KERJA */}
                {opportunityType === 'JOB' ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-700 tracking-wider mb-1.5">
                      1. Status Ikatan Hubungan Kerja:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setContractType('PKWT')}
                        className={`p-3 border text-left flex flex-col gap-0.5 transition-colors cursor-pointer ${
                          contractType === 'PKWT'
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${contractType === 'PKWT' ? 'bg-amber-400' : 'bg-neutral-400'}`} />
                          PKWT (Kontrak Proyek)
                        </span>
                        <span className={`text-[10px] ${contractType === 'PKWT' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Hubungan kerja berjangka waktu
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setContractType('PKWTT')}
                        className={`p-3 border text-left flex flex-col gap-0.5 transition-colors cursor-pointer ${
                          contractType === 'PKWTT'
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${contractType === 'PKWTT' ? 'bg-emerald-400' : 'bg-neutral-400'}`} />
                          PKWTT (Karyawan Tetap)
                        </span>
                        <span className={`text-[10px] ${contractType === 'PKWTT' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Permanen / Waktu tidak tertentu
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setContractType('HARIAN_LEPAS')}
                        className={`p-3 border text-left flex flex-col gap-0.5 transition-colors cursor-pointer ${
                          contractType === 'HARIAN_LEPAS'
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${contractType === 'HARIAN_LEPAS' ? 'bg-blue-400' : 'bg-neutral-400'}`} />
                          Pekerja Harian Lepas
                        </span>
                        <span className={`text-[10px] ${contractType === 'HARIAN_LEPAS' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Pekerjaan harian / insidental
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-50 border border-neutral-300 p-3 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-neutral-700 shrink-0" />
                    <div>
                      <strong className="text-xs font-bold uppercase text-neutral-900 block">
                        Perjanjian Pemagangan Vokasi (Permenaker No. 6 Tahun 2020)
                      </strong>
                      <span className="text-[11px] text-neutral-600">
                        Hubungan pembelajaran berbasis kerja industri antara penyelenggara pemagangan dengan peserta magang bersertifikat.
                      </span>
                    </div>
                  </div>
                )}

                {/* TIER 2: PILIHAN DURASI SESUAI STATUS IKATAN */}
                <div className="pt-2 border-t border-neutral-200">
                  {opportunityType === 'JOB' && contractType === 'PKWT' && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-neutral-700 tracking-wider">
                        2. Pilih Durasi Waktu Kontrak PKWT:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[3, 6, 12, 24].map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => {
                              setDurationMonths(m);
                              setIsCustomDuration(false);
                            }}
                            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                              !isCustomDuration && durationMonths === m
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                            }`}
                          >
                            {m === 12 ? '12 Bulan (1 Tahun)' : m === 24 ? '24 Bulan (2 Tahun)' : `${m} Bulan`}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsCustomDuration(true)}
                          className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                            isCustomDuration
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          Durasi Kustom
                        </button>

                        {isCustomDuration && (
                          <div className="inline-flex items-center gap-1.5 ml-1 bg-white border border-neutral-300 px-2.5 py-1">
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={customDurationValue}
                              onChange={(e) => setCustomDurationValue(e.target.value)}
                              className="w-16 text-xs font-bold font-mono text-center focus:outline-none"
                              placeholder="12"
                            />
                            <span className="text-[11px] font-semibold text-neutral-600">Bulan</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-relaxed pt-1">
                        ℹ️ <strong>Regulasi PP 35/2021:</strong> Perjanjian Kerja Waktu Tertentu (PKWT) dapat diadakan untuk jangka waktu paling lama 5 (lima) tahun termasuk masa perpanjangan.
                      </p>
                    </div>
                  )}

                  {opportunityType === 'JOB' && contractType === 'PKWTT' && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-300 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <strong className="text-emerald-950 font-bold uppercase block tracking-wide">
                          ✓ Status Hubungan Kerja Permanen (Waktu Tidak Tertentu)
                        </strong>
                        <p className="text-emerald-800 text-[11px] leading-relaxed">
                          Masa percobaan kerja (probation) maksimal 3 (tiga) bulan sesuai Pasal 60 UU Ketenagakerjaan. Posisi ini akan ditandai secara khusus dengan badge <strong>&quot;Peluang Tetap (PKWTT)&quot;</strong> di radar pencari kerja untuk menarik minat talenta terbaik Mimika yang mendambakan kepastian karier jangka panjang.
                        </p>
                      </div>
                    </div>
                  )}

                  {opportunityType === 'JOB' && contractType === 'HARIAN_LEPAS' && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-neutral-700 tracking-wider">
                        2. Estimasi Durasi Pekerjaan Harian:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
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
                            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                              !isCustomDuration && customDurationValue === item.display
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsCustomDuration(true)}
                          className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                            isCustomDuration
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          Durasi Kustom
                        </button>

                        {isCustomDuration && (
                          <div className="inline-flex items-center gap-1.5 ml-1 bg-white border border-neutral-300 px-2.5 py-1">
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
                      <p className="text-[10px] text-neutral-500 leading-relaxed pt-1">
                        ℹ️ <strong>Regulasi PP 35/2021:</strong> Perjanjian kerja harian lepas diperuntukkan bagi pekerjaan tertentu yang berubah-ubah dalam hal waktu dan volume pekerjaan dengan hari kerja kurang dari 21 hari dalam 1 bulan.
                      </p>
                    </div>
                  )}

                  {opportunityType === 'INTERNSHIP' && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-neutral-700 tracking-wider">
                        2. Durasi Masa Pemagangan Industri:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
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
                            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                              !isCustomDuration && durationMonths === item.m
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-relaxed pt-1">
                        ℹ️ <strong>Permenaker 6/2020:</strong> Jangka waktu pemagangan dalam negeri dilaksanakan paling lama 1 (satu) tahun dan bertujuan meningkatkan kompetensi vokasi praktis.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* URAIAN TUGAS OPERASIONAL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold uppercase text-neutral-800">
                    Uraian Tanggung Jawab & Tugas Pokok
                  </label>
                  <button
                    type="button"
                    onClick={handlePolishTasks}
                    disabled={isPolishingTasks || !taskDescription.trim()}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Gunakan AI Copilot untuk merapikan draf tugas menjadi uraian profesional standar industri"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>{isPolishingTasks ? 'Merapikan Deskripsi Tugas...' : '✨ Rapikan Deskripsi Tugas'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Uraikan ringkasan tanggung jawab dan target pekerjaan (Ketik draf kasar lalu klik ✨ Rapikan Deskripsi Tugas)..."
                  className="w-full border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-normal leading-relaxed"
                />
              </div>

              {/* STRIP BANTUAN CERDAS AI (CONTEXTUAL SUGGESTIONS) */}
              {isFetchingSuggestions && (
                <div className="p-3 bg-neutral-900 text-white flex items-center justify-between border border-neutral-800 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      AI sedang menganalisis keahlian & inventaris kerja untuk &quot;{title}&quot;...
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400">Model: GPT-4o-Mini Copilot</span>
                </div>
              )}
              {!isFetchingSuggestions && aiSuggestions && (
                <div className="p-3 bg-neutral-900 text-white space-y-2 border border-neutral-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                        Bantuan Cerdas AI Terdeteksi
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 text-neutral-200">
                      Kluster: {aiSuggestions.categoryLabel}
                    </span>
                  </div>

                  {aiSuggestions.recommendedSkills && aiSuggestions.recommendedSkills.length > 0 && (
                    <div>
                      <span className="text-[10px] text-neutral-300 uppercase block mb-1">
                        Saran Keahlian (Klik untuk Tambahkan):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {aiSuggestions.recommendedSkills.map((sk) => {
                          const isAdded = skillTags.includes(sk);
                          return (
                            <button
                              type="button"
                              key={sk}
                              onClick={() => addSkillTag(sk)}
                              disabled={isAdded}
                              className={`text-[10px] px-2 py-0.5 transition-colors cursor-pointer border ${
                                isAdded
                                  ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                                  : 'bg-white text-neutral-900 border-white hover:bg-yellow-300'
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
                      <span className="text-[10px] text-neutral-300 uppercase block mb-1">
                        Saran Inventaris Kerja (Klik untuk Tambahkan):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {aiSuggestions.recommendedTools.map((tl) => {
                          const isAdded = workToolsTags.includes(tl);
                          return (
                            <button
                              type="button"
                              key={tl}
                              onClick={() => addWorkToolTag(tl)}
                              disabled={isAdded}
                              className={`text-[10px] px-2 py-0.5 transition-colors cursor-pointer border ${
                                isAdded
                                  ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                                  : 'bg-neutral-100 text-neutral-900 border-neutral-200 hover:bg-neutral-200'
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

            {/* 2. DUA KOLOM BERDAMPINGAN: KIRI (KUALIFIKASI & LOKASI) vs KANAN (FINANSIAL, FASILITAS & ALAT) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* === KOLOM KIRI === */}
              <div className="space-y-4">
                {/* KEAHLIAN WAJIB */}
                <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase text-neutral-900 tracking-wider">
                      Keahlian Wajib ({skillTags.length} Terpilih)
                    </label>
                    <span className="text-[10px] text-neutral-500">Ketik & tekan Enter</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInputText}
                      onChange={(e) => setSkillInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillTag(skillInputText);
                        }
                      }}
                      placeholder="Ketik keahlian spesifik..."
                      className="flex-1 border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => addSkillTag(skillInputText)}
                      className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white border border-neutral-300">
                    {skillTags.length === 0 ? (
                      <span className="text-[11px] text-neutral-400 italic">Belum ada keahlian ditambahkan.</span>
                    ) : (
                      skillTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 text-white text-xs font-semibold"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeSkillTag(tag)}
                            className="text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* KUALIFIKASI PENDIDIKAN & AFIRMASI */}
                <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 block">
                    Kualifikasi Pendidikan & Afirmasi Pengalaman
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-700 mb-1">
                        Min. Pendidikan Formal
                      </label>
                      <select
                        value={minEducation}
                        onChange={(e) => setMinEducation(e.target.value)}
                        className="w-full border border-neutral-300 px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                      >
                        <option value="SMA">SMA Sederajat</option>
                        <option value="SMK">SMK Vokasi</option>
                        <option value="D3">Diploma (D3)</option>
                        <option value="S1">Sarjana (S1)</option>
                      </select>
                    </div>

                    {opportunityType === 'JOB' ? (
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-neutral-700 mb-1">
                          Min. Pengalaman (Tahun)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={minExperienceYears}
                          onChange={(e) => setMinExperienceYears(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-bold font-mono text-center"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-neutral-700 mb-1">
                          Peluang Rekrutmen Tetap
                        </label>
                        <button
                          type="button"
                          onClick={() => setHasAbsorptionOpportunity(!hasAbsorptionOpportunity)}
                          className={`w-full p-2 border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                            hasAbsorptionOpportunity
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${hasAbsorptionOpportunity ? 'border-white bg-white text-neutral-900' : 'border-neutral-400 bg-white'}`}>
                            {hasAbsorptionOpportunity && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-[10px]">Opsi Pengangkatan</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FUZZY AFIRMASI */}
                  <div className="flex items-start gap-2 pt-2 border-t border-neutral-200">
                    <input
                      type="checkbox"
                      id="studioEquivToggle"
                      checked={allowEquivalence}
                      onChange={(e) => setAllowEquivalence(e.target.checked)}
                      className="w-4 h-4 accent-neutral-900 mt-0.5 shrink-0"
                    />
                    <label htmlFor="studioEquivToggle" className="text-[11px] text-neutral-800 leading-snug cursor-pointer">
                      <strong className="text-neutral-900 block uppercase">
                        Aktifkan Penyetaraan Pengalaman Fuzzy (Afirmasi Lokal)
                      </strong>
                      Pengalaman lapangan warga lokal diakui setara kualifikasi formal oleh AI Radar.
                    </label>
                  </div>
                </div>

                {/* PENEMPATAN LOKASI & JADWAL */}
                <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                    Penempatan Lokasi & Pola Jadwal Kerja
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsSameAsOfficeLocation(!isSameAsOfficeLocation)}
                    className={`w-full p-2 border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      isSameAsOfficeLocation
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${isSameAsOfficeLocation ? 'border-white bg-white text-neutral-900' : 'border-neutral-400 bg-white'}`}>
                      {isSameAsOfficeLocation && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs truncate">
                      Sesuai Alamat Kantor ({profile?.address || 'Kantor Pusat Mimika'})
                    </span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-600 mb-1">
                        Zona Wilayah Kerja
                      </label>
                      <select
                        value={workZone}
                        onChange={(e) => setWorkZone(e.target.value)}
                        className="w-full border border-neutral-300 px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                      >
                        <option value="TIMIKA_KOTA">Timika Kota (Lowland)</option>
                        <option value="KUALA_KENCANA">Kuala Kencana (Pit/Office)</option>
                        <option value="PORTSITE_POMAKO">Portsite Pomako (Dermaga)</option>
                        <option value="HIGHLAND_TEMBAGAPURA">Highland Tembagapura (Site)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-600 mb-1">
                        Jadwal & Pola Shift
                      </label>
                      <select
                        value={workSchedule}
                        onChange={(e) => setWorkSchedule(e.target.value)}
                        className="w-full border border-neutral-300 px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                      >
                        <option value="NORMAL_DAY">Normal Day (Standar)</option>
                        <option value="SHIFT_24H">Shift Bergilir (24 Jam)</option>
                        <option value="ROSTER_FIELD">Roster Lapangan (6-2 / 4-2)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* === KOLOM KANAN === */}
              <div className="space-y-4">
                {/* KOMPENSASI & FASILITAS */}
                <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-neutral-700" />
                    Kompensasi & Fasilitas Kesejahteraan
                  </span>

                  {opportunityType === 'JOB' ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-semibold uppercase text-neutral-600">
                              Gaji Min. (Rp/Bln)
                            </label>
                            <span className="text-[9px] text-neutral-400 italic">Opsional</span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-neutral-400 font-mono text-xs">Rp</span>
                            <input
                              type="text"
                              value={salaryMinDisplay}
                              onChange={(e) => setSalaryMinDisplay(formatNumberWithDots(e.target.value))}
                              placeholder="Negosiasi / Rahasia"
                              className="w-full border border-neutral-300 pl-8 pr-2 py-1.5 text-xs font-mono font-bold bg-white focus:outline-none focus:border-neutral-900"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-semibold uppercase text-neutral-600">
                              Gaji Maks. (Rp/Bln)
                            </label>
                            <span className="text-[9px] text-neutral-400 italic">Opsional</span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-neutral-400 font-mono text-xs">Rp</span>
                            <input
                              type="text"
                              value={salaryMaxDisplay}
                              onChange={(e) => setSalaryMaxDisplay(formatNumberWithDots(e.target.value))}
                              placeholder="Negosiasi / Rahasia"
                              className="w-full border border-neutral-300 pl-8 pr-2 py-1.5 text-xs font-mono font-bold bg-white focus:outline-none focus:border-neutral-900"
                            />
                          </div>
                        </div>
                      </div>

                      {(!salaryMinDisplay || !salaryMaxDisplay) && (
                        <p className="text-[10px] text-neutral-500 bg-neutral-100/70 px-2 py-1 border border-neutral-200">
                          ℹ️ Label publik lowongan: <span className="font-semibold text-neutral-800">Kompetitif / Sesuai Pengalaman (Negosiasi)</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-600 mb-1">
                        Besaran Uang Saku Bulanan Magang (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-neutral-400 font-mono text-xs">Rp</span>
                        <input
                          type="text"
                          value={stipendAmountDisplay}
                          onChange={(e) => setStipendAmountDisplay(formatNumberWithDots(e.target.value))}
                          className="w-full border border-neutral-300 pl-8 pr-3 py-1.5 text-xs font-mono font-bold bg-white focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* CHECKLIST FASILITAS KESEJAHTERAAN */}
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold uppercase text-neutral-700 tracking-wider">
                        Fasilitas Kesejahteraan yang Dijamin:
                      </label>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {activeSelectedBenefits.length} dipilih
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {activeBenefitList.map((b) => {
                        const Icon = b.icon;
                        const isChecked = activeSelectedBenefits.includes(b.key);
                        return (
                          <button
                            type="button"
                            key={b.key}
                            onClick={() => toggleBenefit(b.key)}
                            className={`p-2 border text-[11px] flex items-center gap-2 cursor-pointer select-none transition-colors text-left ${
                              isChecked
                                ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${isChecked ? 'border-white bg-white text-neutral-900' : 'border-neutral-400 bg-white'}`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate text-[10px]">{b.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SARANA, ALAT KERJA & FASILITAS OPERASIONAL KHUSUS (WORK TOOLS) */}
                <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase text-neutral-900 tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-neutral-700" />
                      Sarana, Alat Kerja & Fasilitas Operasional Khusus
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {workToolsTags.length} item
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    Sediakan inventaris spesifik sesuai bidang pekerjaan (contoh: Laptop/Komputer kantor, Perlengkapan APD keselamatan lapangan, Smartphone & pulsa kerja, Kendaraan operasional, Toolkit teknis, atau Roster tiket PP).
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={workToolsInputText}
                      onChange={(e) => setWorkToolsInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addWorkToolTag(workToolsInputText);
                        }
                      }}
                      placeholder="cth: Laptop kantor, APD K3 proyek, Toolkit teknisi, Kendaraan..."
                      className="flex-1 border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() => addWorkToolTag(workToolsInputText)}
                      className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase hover:bg-neutral-800 cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* Pilihan Cepat Kebutuhan Spesifik per Bidang */}
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase mr-1">Pilihan Cepat:</span>
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
                          onClick={() => addWorkToolTag(preset)}
                          disabled={isAdded}
                          className={`px-2 py-0.5 border text-[10px] transition-colors ${
                            isAdded
                              ? 'bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100 cursor-pointer font-medium'
                          }`}
                        >
                          {isAdded ? '✓ ' : '+ '} {preset}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white border border-neutral-300">
                    {workToolsTags.length === 0 ? (
                      <span className="text-[11px] text-neutral-400 italic">Belum ada inventaris/sarana kerja ditambahkan.</span>
                    ) : (
                      workToolsTags.map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-medium"
                        >
                          <span>{tool}</span>
                          <button
                            type="button"
                            onClick={() => removeWorkToolTag(tool)}
                            className="text-neutral-500 hover:text-red-700 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* KHUSUS PEMAGANGAN VOKASI: KURIKULUM & MENTOR */}
                {opportunityType === 'INTERNSHIP' && (
                  <div className="p-4 bg-purple-50/80 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                        Kurikulum Kompetensi Ditransfer
                      </span>
                      <span className="text-[10px] font-mono text-purple-700">
                        {skillsGainedTags.length} target
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
                            addSkillGainedTag(skillsGainedInputText);
                          }
                        }}
                        placeholder="Ketik target keterampilan magang..."
                        className="flex-1 border border-purple-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-purple-900"
                      />
                      <button
                        type="button"
                        onClick={() => addSkillGainedTag(skillsGainedInputText)}
                        className="px-3.5 py-1.5 bg-purple-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-800 cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-white border border-purple-200">
                      {skillsGainedTags.length === 0 ? (
                        <span className="text-[11px] text-neutral-400 italic">Belum ada target keterampilan.</span>
                      ) : (
                        skillsGainedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-900 text-white text-xs font-semibold"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeSkillGainedTag(tag)}
                              className="text-purple-300 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-purple-900 mb-1">
                          Nama Mentor Pembimbing
                        </label>
                        <input
                          type="text"
                          value={mentorName}
                          onChange={(e) => setMentorName(e.target.value)}
                          placeholder="cth: Ir. Ahmad Subagyo"
                          className="w-full border border-purple-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-purple-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-purple-900 mb-1">
                          Jabatan Mentor
                        </label>
                        <input
                          type="text"
                          value={mentorRole}
                          onChange={(e) => setMentorRole(e.target.value)}
                          placeholder="cth: Lead Automation Engineer"
                          className="w-full border border-purple-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-purple-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. ROW BAWAH: TOMBOL AKSI UTAMA */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Link
                href="/employer"
                className="border border-neutral-300 px-5 py-2.5 text-xs font-semibold uppercase hover:bg-neutral-100"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-7 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Menerbitkan...' : 'Terbitkan & Buka Radar Kandidat AI'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <AlertModal {...alertProps} />
    </AppShell>
  );
}
