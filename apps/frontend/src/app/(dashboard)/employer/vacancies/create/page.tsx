'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import { ModernCard } from '@/components/ui/ModernPrimitives';
import {
  formatNumberWithDots,
  parseDotsToNumberOrUndefined,
  LOCAL_STORAGE_DRAFT_KEY,
  VacancyStepItem,
  VacancyHeader,
  VacancyStepper,
  Step1PositionDetails,
  Step2Qualifications,
  Step3CompensationWorkplace,
  Step4ReviewPublish,
  VacancyNavFooter,
} from '@/components/vacancy-create';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CreateVacancyStudioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const { alertProps, showAlert } = useAlertModal();

  // Wizard Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Two-Tier Contract Selector
  const [contractType, setContractType] = useState<'PKWT' | 'PKWTT' | 'HARIAN_LEPAS'>('PKWT');
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [customDurationValue, setCustomDurationValue] = useState<string>('12');

  // Financial Formatting
  const [salaryMinDisplay, setSalaryMinDisplay] = useState('8.500.000');
  const [salaryMaxDisplay, setSalaryMaxDisplay] = useState('12.000.000');
  const [stipendAmountDisplay, setStipendAmountDisplay] = useState('3.500.000');

  // Benefits
  const [selectedJobBenefits, setSelectedJobBenefits] = useState<string[]>([
    'BPJS_LENGKAP',
  ]);
  const [selectedInternBenefits, setSelectedInternBenefits] = useState<string[]>([
    'BPJS_MAGANG',
    'SERTIFIKAT_INDUSTRI',
  ]);

  // Sarana & Inventaris Kerja (Work Tools)
  const [workToolsTags, setWorkToolsTags] = useState<string[]>([]);
  const [workToolsInputText, setWorkToolsInputText] = useState('');

  // Smart Location
  const [isSameAsOfficeLocation, setIsSameAsOfficeLocation] = useState(true);
  const [workZone, setWorkZone] = useState('TIMIKA_KOTA');
  const [workSchedule, setWorkSchedule] = useState('NORMAL_DAY');
  const [targetWorkforce, setTargetWorkforce] = useState<'ALL' | 'LOCAL_ONLY' | 'NON_LOCAL'>('ALL');

  // Keahlian Wajib
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillInputText, setSkillInputText] = useState('');

  // Khusus Magang
  const [skillsGainedTags, setSkillsGainedTags] = useState<string[]>([]);
  const [skillsGainedInputText, setSkillsGainedInputText] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [mentorRole, setMentorRole] = useState('Lead Specialist Lapangan');
  const [hasAbsorptionOpportunity, setHasAbsorptionOpportunity] = useState(true);

  // AI Suggestions
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
    targetWorkforce,
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

  // Draft Management
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
      targetWorkforce,
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
      // Ignore storage error
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
      if (d.targetWorkforce) setTargetWorkforce(d.targetWorkforce);
      if (Array.isArray(d.skillTags)) setSkillTags(d.skillTags);
      if (Array.isArray(d.skillsGainedTags)) setSkillsGainedTags(d.skillsGainedTags);
      if (d.mentorName) setMentorName(d.mentorName);
      if (d.mentorRole) setMentorRole(d.mentorRole);
      if (d.hasAbsorptionOpportunity !== undefined) setHasAbsorptionOpportunity(d.hasAbsorptionOpportunity);
    } catch {
      // Ignore draft restore errors
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

  // Toggle Benefits
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

  // Tag Handlers
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

  // Wizard Steps Configuration
  const STEPS: VacancyStepItem[] = [
    {
      id: 1,
      title: 'Tahap 1: Detail Posisi & Hubungan Kerja',
      shortTitle: '1. Detail Posisi',
      caption: 'Tipe, Kuota & Ikatan Kontrak',
      description: 'Tentukan jenis kesempatan (Pekerjaan / Pemagangan), nama posisi, masa tayang, dan uraian tugas pokok.',
      isComplete: () => Boolean(title.trim() && taskDescription.trim()),
    },
    {
      id: 2,
      title: 'Tahap 2: Kualifikasi, Keahlian & Afirmasi',
      shortTitle: '2. Kualifikasi',
      caption: 'Keahlian & Afirmasi OAP',
      description: 'Cantumkan keahlian wajib, kualifikasi pendidikan, afirmasi pengalaman lapangan, dan kebijakan sasaran tenaga kerja.',
      isComplete: () => skillTags.length > 0,
    },
    {
      id: 3,
      title: 'Tahap 3: Lokasi, Kompensasi & Fasilitas',
      shortTitle: '3. Kompensasi',
      caption: 'Gaji, Fasilitas BPJS & Sarana',
      description: 'Atur lokasi penempatan kerja, jadwal shift, rentang gaji/uang saku, fasilitas kesejahteraan, dan inventaris alat kerja.',
      isComplete: () => (opportunityType === 'JOB' ? true : skillsGainedTags.length > 0),
    },
    {
      id: 4,
      title: 'Tahap 4: Tinjauan Akhir & Publikasi',
      shortTitle: '4. Publikasi',
      caption: 'Pratinjau & Buka Radar AI',
      description: 'Periksa ringkasan pratinjau lowongan dan terbitkan secara resmi untuk memindai kandidat daerah dengan AI Radar.',
      isComplete: () => Boolean(title.trim() && taskDescription.trim() && skillTags.length > 0),
    },
  ];

  const completedStepsCount = STEPS.filter((s) => s.isComplete()).length;
  const progressPercentage = Math.round((completedStepsCount / STEPS.length) * 100);

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Publish Handler
  const handlePublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');

    if (skillTags.length === 0) {
      setError('Mohon cantumkan minimal 1 keahlian yang dibutuhkan.');
      showAlert('warning', 'Keahlian Wajib Diisi', 'Mohon cantumkan minimal 1 keahlian yang dibutuhkan oleh lowongan ini.');
      setSubmitting(false);
      goToStep(2);
      return;
    }

    if (opportunityType === 'INTERNSHIP' && skillsGainedTags.length === 0) {
      setError('Program magang wajib mencantumkan minimal 1 keterampilan yang akan ditransfer ke peserta.');
      showAlert('warning', 'Keterampilan Magang Diperlukan', 'Program magang wajib mencantumkan minimal 1 keterampilan yang akan ditransfer ke peserta.');
      setSubmitting(false);
      goToStep(3);
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
      targetWorkforce,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mempersiapkan Studio Perumusan Lowongan...
          </span>
        </div>
      </div>
    );
  }

  const activeSelectedBenefits =
    opportunityType === 'JOB' ? selectedJobBenefits : selectedInternBenefits;

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* HEADER / BREADCRUMB */}
        <VacancyHeader
          isDraftSaved={isDraftSaved}
          onClearDraft={clearDraft}
        />

        {/* NOTIFIKASI ERROR / SUKSES */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-700" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* FORMULIR UTAMA MULTI-STEP WIZARD */}
        <form ref={formRef} onSubmit={handlePublish} className="space-y-6">
          {/* STEPPER HEADER STATUS BAR & INTERACTIVE TABS */}
          <VacancyStepper
            steps={STEPS}
            currentStep={currentStep}
            completedCount={completedStepsCount}
            progressPercentage={progressPercentage}
            onStepClick={goToStep}
            onQuickSave={saveDraft}
            saving={false}
          />

          {/* STEP CONTENT CONTAINER */}
          <ModernCard className="p-6 sm:p-8 space-y-6">
            {/* TAHAP 1 */}
            {currentStep === 1 && (
              <Step1PositionDetails
                opportunityType={opportunityType}
                setOpportunityType={setOpportunityType}
                title={title}
                setTitle={setTitle}
                quota={quota}
                setQuota={setQuota}
                activeDaysDuration={activeDaysDuration}
                setActiveDaysDuration={setActiveDaysDuration}
                contractType={contractType}
                setContractType={setContractType}
                durationMonths={durationMonths}
                setDurationMonths={setDurationMonths}
                isCustomDuration={isCustomDuration}
                setIsCustomDuration={setIsCustomDuration}
                customDurationValue={customDurationValue}
                setCustomDurationValue={setCustomDurationValue}
                projectDuration={projectDuration}
                taskDescription={taskDescription}
                setTaskDescription={setTaskDescription}
                isPolishingTasks={isPolishingTasks}
                onPolishTasks={handlePolishTasks}
                isFetchingSuggestions={isFetchingSuggestions}
                aiSuggestions={aiSuggestions}
                onAddSkillTag={addSkillTag}
                onAddWorkToolTag={addWorkToolTag}
                skillTags={skillTags}
                workToolsTags={workToolsTags}
                setMinExperienceYears={setMinExperienceYears}
              />
            )}

            {/* TAHAP 2 */}
            {currentStep === 2 && (
              <Step2Qualifications
                opportunityType={opportunityType}
                skillTags={skillTags}
                skillInputText={skillInputText}
                setSkillInputText={setSkillInputText}
                onAddSkillTag={addSkillTag}
                onRemoveSkillTag={removeSkillTag}
                minEducation={minEducation}
                setMinEducation={setMinEducation}
                minExperienceYears={minExperienceYears}
                setMinExperienceYears={setMinExperienceYears}
                hasAbsorptionOpportunity={hasAbsorptionOpportunity}
                setHasAbsorptionOpportunity={setHasAbsorptionOpportunity}
                allowEquivalence={allowEquivalence}
                setAllowEquivalence={setAllowEquivalence}
                targetWorkforce={targetWorkforce}
                setTargetWorkforce={setTargetWorkforce}
              />
            )}

            {/* TAHAP 3 */}
            {currentStep === 3 && (
              <Step3CompensationWorkplace
                opportunityType={opportunityType}
                officeAddress={profile?.address}
                isSameAsOfficeLocation={isSameAsOfficeLocation}
                setIsSameAsOfficeLocation={setIsSameAsOfficeLocation}
                workSchedule={workSchedule}
                setWorkSchedule={setWorkSchedule}
                salaryMinDisplay={salaryMinDisplay}
                setSalaryMinDisplay={setSalaryMinDisplay}
                salaryMaxDisplay={salaryMaxDisplay}
                setSalaryMaxDisplay={setSalaryMaxDisplay}
                stipendAmountDisplay={stipendAmountDisplay}
                setStipendAmountDisplay={setStipendAmountDisplay}
                onFormatDots={formatNumberWithDots}
                selectedJobBenefits={selectedJobBenefits}
                selectedInternBenefits={selectedInternBenefits}
                onToggleBenefit={toggleBenefit}
                workToolsTags={workToolsTags}
                workToolsInputText={workToolsInputText}
                setWorkToolsInputText={setWorkToolsInputText}
                onAddWorkToolTag={addWorkToolTag}
                onRemoveWorkToolTag={removeWorkToolTag}
                skillsGainedTags={skillsGainedTags}
                skillsGainedInputText={skillsGainedInputText}
                setSkillsGainedInputText={setSkillsGainedInputText}
                onAddSkillGainedTag={addSkillGainedTag}
                onRemoveSkillGainedTag={removeSkillGainedTag}
                mentorName={mentorName}
                setMentorName={setMentorName}
                mentorRole={mentorRole}
                setMentorRole={setMentorRole}
              />
            )}

            {/* TAHAP 4 */}
            {currentStep === 4 && (
              <Step4ReviewPublish
                opportunityType={opportunityType}
                title={title}
                quota={quota}
                activeDaysDuration={activeDaysDuration}
                projectDuration={projectDuration}
                taskDescription={taskDescription}
                minEducation={minEducation}
                minExperienceYears={minExperienceYears}
                allowEquivalence={allowEquivalence}
                targetWorkforce={targetWorkforce}
                workSchedule={workSchedule}
                officeAddress={profile?.address}
                salaryMinDisplay={salaryMinDisplay}
                salaryMaxDisplay={salaryMaxDisplay}
                stipendAmountDisplay={stipendAmountDisplay}
                skillTags={skillTags}
                selectedBenefitsCount={activeSelectedBenefits.length}
                workToolsTags={workToolsTags}
                skillsGainedTags={skillsGainedTags}
                mentorName={mentorName}
                submitting={submitting}
              />
            )}
          </ModernCard>

          {/* ACTION BAR NAVIGASI TAHAPAN (STICKY DI BAWAH) */}
          <VacancyNavFooter
            currentStep={currentStep}
            totalSteps={STEPS.length}
            prevStepTitle={currentStep > 1 ? STEPS[currentStep - 2].shortTitle : ''}
            nextStepTitle={currentStep < STEPS.length ? STEPS[currentStep].shortTitle : ''}
            onPrev={() => goToStep(currentStep - 1)}
            onNext={() => goToStep(currentStep + 1)}
            onSaveDraft={saveDraft}
            submitting={submitting}
          />
        </form>
      </div>

      {/* SWEETALERT FEEDBACK MODAL */}
      <AlertModal {...alertProps} />
    </AppShell>
  );
}
