'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  GraduationCap,
  Calendar,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Building2,
  BookOpen,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Check,
  Zap,
  ClipboardCheck,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'WELDING', label: 'Teknik Pengelasan & Fabrikasi (Welding)' },
  { value: 'ALAT_BERAT', label: 'Operasional & Mekanik Alat Berat' },
  { value: 'K3_PERTAMBANGAN', label: 'K3 & Keselamatan Kerja Tambang' },
  { value: 'MEKANIK', label: 'Permesinan Industri & Mekanikal' },
  { value: 'ELEKTRIKAL', label: 'Kelistrikan & Instrumentasi Industri' },
  { value: 'DIGITAL_IT', label: 'Teknologi Informasi & Digital' },
  { value: 'LOGISTIK', label: 'Supply Chain, Pergudangan & Logistik' },
  { value: 'KONSTRUKSI', label: 'Konstruksi & Sipil Lapangan' },
  { value: 'HOSPITALITY', label: 'Hospitality, Boga & Perhotelan' },
  { value: 'OTOMOTIF', label: 'Otomotif & Mesin Kendaraan' },
];

const WELFARE_OPTIONS = [
  { id: 'ASRAMA_MESS', label: 'Asrama / Mess Gratis' },
  { id: 'MAKAN_3X', label: 'Konsumsi Makan 3x Sehari' },
  { id: 'UANG_SAKU', label: 'Uang Saku Transport Harian' },
  { id: 'APD_LENGKAP', label: 'Perlengkapan APD & Safety Kit' },
  { id: 'BPJS_MAGANG', label: 'Perlindungan BPJS Ketenagakerjaan' },
  { id: 'MODUL_KIT', label: 'Modul Teori & Tool Kit Praktik' },
];

function CreateProgramOrBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedProgramId = searchParams.get('programId');

  const { alertProps, showAlert } = useAlertModal();
  const [activeMode, setActiveMode] = useState<'PROGRAM' | 'BATCH'>(
    preSelectedProgramId ? 'BATCH' : 'PROGRAM',
  );
  const [profile, setProfile] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Program State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WELDING');
  const [subCategory, setSubCategory] = useState('');
  const [certificateType, setCertificateType] = useState('KOMBINASI_LENGKAP');
  const [deliveryMode, setDeliveryMode] = useState('OFFLINE');
  const [description, setDescription] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [durationDays, setDurationDays] = useState(25);
  const [totalLessonHours, setTotalLessonHours] = useState(180);
  const [submitForApproval, setSubmitForApproval] = useState(true);
  const [targetSkills, setTargetSkills] = useState<{ name: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' }[]>([
    { name: '', level: 'EXPERT' },
  ]);
  const [coverImageUrl, setCoverImageUrl] = useState('/images/flyers/alat_berat_flyer.jpg');
  const [uploadingFlyer, setUploadingFlyer] = useState(false);

  // Form Batch State
  const [selectedProgramId, setSelectedProgramId] = useState(preSelectedProgramId || '');
  const [batchName, setBatchName] = useState('Batch 1 Tahun 2026');
  const [fundingType, setFundingType] = useState('GRATIS_APBD_MIMIKA');
  const [priceAmount, setPriceAmount] = useState(0);
  const [trainingMethod, setTrainingMethod] = useState('BOARDING');
  const [quota, setQuota] = useState(20);
  const [selectedWelfare, setSelectedWelfare] = useState<string[]>([
    'ASRAMA_MESS',
    'MAKAN_3X',
    'UANG_SAKU',
    'APD_LENGKAP',
  ]);
  const [registrationStart, setRegistrationStart] = useState('2026-10-01');
  const [registrationEnd, setRegistrationEnd] = useState('2026-10-15');
  const [trainingStart, setTrainingStart] = useState('2026-10-20');
  const [trainingEnd, setTrainingEnd] = useState('2026-11-20');
  const [venueAddress, setVenueAddress] = useState('');
  const [admissionPolicy, setAdmissionPolicy] = useState<'INSTANT_ADMISSION' | 'CURATED_SELECTION'>('CURATED_SELECTION');
  const [announcementDate, setAnnouncementDate] = useState('2026-10-18');
  const [bankName, setBankName] = useState('BANK PAPUA');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [profRes, progRes] = await Promise.all([
      apiFetch('/training-providers/me'),
      apiFetch('/training-providers/programs'),
    ]);

    if (profRes.status !== 'success') {
      router.push('/login');
      return;
    }

    setProfile(profRes.data);
    const progList = progRes.data || [];
    setPrograms(progList);
    if (!selectedProgramId && progList.length > 0) {
      setSelectedProgramId(progList[0].id);
    }
    setVenueAddress(profRes.data?.address || '');
    setLoading(false);
  };

  const handleAddSkill = () => {
    setTargetSkills([...targetSkills, { name: '', level: 'EXPERT' }]);
  };

  const handleRemoveSkill = (index: number) => {
    setTargetSkills(targetSkills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, field: 'name' | 'level', value: string) => {
    const updated = [...targetSkills];
    updated[index] = { ...updated[index], [field]: value };
    setTargetSkills(updated);
  };

  const toggleWelfare = (id: string) => {
    if (selectedWelfare.includes(id)) {
      setSelectedWelfare(selectedWelfare.filter((w) => w !== id));
    } else {
      setSelectedWelfare([...selectedWelfare, id]);
    }
  };

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingFlyer(true);
    try {
      const res = await apiFetch('/training-providers/upload-flyer', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 'success' && res.data?.flyerUrl) {
        setCoverImageUrl(res.data.flyerUrl);
        showAlert('success', 'Flyer Berhasil Diunggah', 'Poster brosur flyer program berhasil diunggah.');
      } else {
        showAlert('error', 'Gagal Mengunggah Flyer', res.message || 'Format gambar tidak didukung.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal', err.message);
    } finally {
      setUploadingFlyer(false);
    }
  };

  const handleSubmitProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSkills = targetSkills.filter((s) => s.name.trim().length > 0);
    if (validSkills.length === 0) {
      showAlert('warning', 'Target Keahlian Kosong', 'Minimal sertakan satu keahlian target yang akan diinjeksi ke profil siswa saat lulus.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      category,
      subCategory: subCategory.trim() || undefined,
      certificateType,
      deliveryMode,
      description,
      syllabus: syllabus.trim() || undefined,
      durationDays: Number(durationDays),
      totalLessonHours: Number(totalLessonHours),
      submitForApproval,
      targetSkills: validSkills,
      coverImageUrl: coverImageUrl.trim() || undefined,
    };

    const res = await apiFetch('/training-providers/programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.status === 'success') {
      showAlert(
        'success',
        'Program Resmi Terbit di Katalog Skillhub!',
        `Program "${title}" telah aktif dan tayang langsung di Katalog Publik Skillhub Mimika. Lembaga Anda kini dapat segera membuka gelombang batch pendaftaran peserta.`,
        'Buka Batch Pendaftaran Sekarang →',
        () => {
          setSelectedProgramId(res.data.id);
          setActiveMode('BATCH');
          loadData();
        },
      );
    } else {
      showAlert('error', 'Gagal Membuat Program', res.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) {
      showAlert('warning', 'Pilih Program', 'Pilih program pelatihan terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    const payload = {
      batchName,
      fundingType,
      priceAmount: fundingType === 'MANDIRI_BERBAYAR' ? Number(priceAmount) : 0,
      bankName: fundingType === 'MANDIRI_BERBAYAR' ? bankName.trim() : undefined,
      bankAccountNumber: fundingType === 'MANDIRI_BERBAYAR' ? bankAccountNumber.trim() : undefined,
      bankAccountHolder: fundingType === 'MANDIRI_BERBAYAR' ? bankAccountHolder.trim() : undefined,
      paymentInstructions: fundingType === 'MANDIRI_BERBAYAR' ? paymentInstructions.trim() : undefined,
      trainingMethod,
      quota: Number(quota),
      admissionPolicy,
      announcementDate: admissionPolicy === 'CURATED_SELECTION' && announcementDate ? announcementDate : undefined,
      welfareBenefits: selectedWelfare,
      registrationStart,
      registrationEnd,
      trainingStart,
      trainingEnd,
      venueAddress: venueAddress.trim() || undefined,
    };

    const res = await apiFetch(`/training-providers/programs/${selectedProgramId}/batches`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.status === 'success') {
      showAlert(
        'success',
        'Batch Cohort Resmi Dibuka!',
        `Gelombang "${batchName}" dengan kuota ${quota} kursi (${admissionPolicy === 'INSTANT_ADMISSION' ? 'Penerimaan Langsung' : 'Kurasi Berkas & Wawancara'}) berhasil dibuka dan siap menerima pendaftar talenta.`,
        'Kembali ke Dasbor Balai →',
        () => {
          router.push('/provider');
        },
      );
    } else {
      showAlert('error', 'Gagal Membuka Batch', res.message || 'Terjadi kesalahan sistem.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Memuat Studio Balai...
          </div>
        </div>
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';

  if (!isApproved) {
    return (
      <AppShell userRole="TRAINING_PROVIDER" userName={profile?.institutionName || 'Lembaga Pelatihan'}>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="bg-white border border-neutral-300 p-8 space-y-4">
            <ShieldCheck className="w-12 h-12 text-amber-600 mx-auto" />
            <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
              Akses Studio Belum Terbuka
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
              Lembaga pelatihan Anda berstatus <strong>{profile?.verificationStatus}</strong>. Hanya lembaga yang telah lolos verifikasi legalitas <strong>Tier-1 Disnakertrans Mimika</strong> yang diizinkan menerbitkan program kejuruan dan membuka batch cohort.
            </p>
            <div className="pt-2">
              <Link
                href="/provider/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider"
              >
                <span>Lengkapi Berkas Legalitas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userRole="TRAINING_PROVIDER" userName={profile?.institutionName || 'Lembaga Pelatihan'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Studio */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-neutral-800" />
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900">
                Studio Pelatihan & Batch Cohort
              </h1>
            </div>
            <p className="text-xs text-neutral-600">
              Rancang kurikulum kejuruan bersertifikat resmi atau buka gelombang pendaftaran baru bagi pencari kerja Mimika.
            </p>
          </div>

          <div className="flex items-center gap-1 border border-neutral-300 p-1 bg-neutral-100">
            <button
              type="button"
              onClick={() => setActiveMode('PROGRAM')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeMode === 'PROGRAM'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              1. Buat Program
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('BATCH')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeMode === 'BATCH'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              2. Buka Batch
            </button>
          </div>
        </div>

        {/* MODE 1: FORMULIR PEMBUATAN PROGRAM */}
        {activeMode === 'PROGRAM' && (
          <form onSubmit={handleSubmitProgram} className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
            <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                Rancangan Kurikulum Program Pelatihan
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5">
                Kode Otomatis: #MT-[KEJUR-[HEX]]
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                Judul Program Pelatihan / Sertifikasi <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sertifikasi Teknik Pengelasan Pipa 6G Standar ASME"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Kategori Kejuruan <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Sub-Kejuruan / Spesialisasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pengelasan Bejana Bertekanan Tinggi"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Tipe Sertifikat Diterbitkan <span className="text-red-600">*</span>
                </label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                >
                  <option value="KOMBINASI_LENGKAP">Kombinasi Lengkap (STTP Pelatihan + BNSP)</option>
                  <option value="KOMPETENSI_BNSP">Sertifikat Kompetensi Kerja BNSP (Garuda Emas)</option>
                  <option value="PELATIHAN_STTP">Surat Tanda Tamat Pelatihan (STTP)</option>
                  <option value="LISENSI_K3_KEMNAKER">Lisensi K3 / SIO Kemnaker RI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Metode Pelaksanaan <span className="text-red-600">*</span>
                </label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                >
                  <option value="OFFLINE">Tatap Muka Langsung (Offline Workshop)</option>
                  <option value="HYBRID">Hybrid (Teori Online + Praktik Lapangan)</option>
                  <option value="ONLINE">Full Daring (Online Webinar)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Durasi Pelaksanaan (Hari)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Total Jam Pelajaran (JP)
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalLessonHours}
                  onChange={(e) => setTotalLessonHours(Number(e.target.value))}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                Deskripsi Singkat & Sasaran Program <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan tujuan kompetensi, instruktur, dan relevansi kurikulum dengan kebutuhan industri di Mimika..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                Rangkuman Silabus & Modul Praktik
              </label>
              <textarea
                rows={4}
                placeholder="Modul 1: K3 Pengelasan, Modul 2: Setting Arus & Gas GTAW, Modul 3: Posisi 1G-6G..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none font-mono"
              />
            </div>

            {/* Target Keahlian Dinamis (Auto-Skill Injection) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-900 block">
                    Target Keahlian Lulusan (Atomic Auto-Skill)
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Keahlian ini otomatis terinjeksi ke profil siswa saat mereka dinyatakan lulus.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Skill</span>
                </button>
              </div>

              <div className="space-y-2">
                {targetSkills.map((sk, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nama keahlian (misal: Welding 6G GTAW/SMAW)"
                      value={sk.name}
                      onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                      className="flex-1 border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <select
                      value={sk.level}
                      onChange={(e) => handleSkillChange(idx, 'level', e.target.value as any)}
                      className="w-36 border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                    >
                      <option value="BEGINNER">BEGINNER</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                    {targetSkills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="p-2 text-neutral-400 hover:text-red-700 border border-neutral-200 hover:border-red-300"
                        title="Hapus baris skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION UPLOAD FLYER BANNER PROMOSI (GAYA SHOPEE) */}
            <div className="border border-neutral-300 p-5 bg-neutral-50 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Poster Flyer / Brosur Promosi Program (Gaya Shopee)
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Brosur visual akan ditampilkan sebagai banner raksasa di katalog & halaman detail program.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-900 text-white">
                  Rasio 16:9 Landscape
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 block mb-1">
                      Unggah Berkas Flyer Kustom (Maks. 10 MB):
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFlyerUpload}
                      disabled={uploadingFlyer}
                      className="text-xs text-neutral-700 file:mr-3 file:py-1.5 file:px-3 file:border file:border-neutral-300 file:text-xs file:font-bold file:uppercase file:bg-white file:text-neutral-800 hover:file:bg-neutral-100 cursor-pointer"
                    />
                    {uploadingFlyer && (
                      <span className="text-[10px] font-mono text-amber-600 block mt-1 animate-pulse">
                        Mengunggah flyer ke server...
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 block">
                      Atau Pilih Template Poster Standar:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('/images/flyers/alat_berat_flyer.jpg')}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                          coverImageUrl === '/images/flyers/alat_berat_flyer.jpg'
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        🚜 Alat Berat & Tambang
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('/images/flyers/welding_flyer.jpg')}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                          coverImageUrl === '/images/flyers/welding_flyer.jpg'
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        ⚡ Juru Las 6G Pipa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pratinjau Flyer */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 block">
                    Pratinjau Brosur Terpilih:
                  </span>
                  <div className="relative h-36 w-full border border-neutral-400 overflow-hidden bg-neutral-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImageUrl}
                      alt="Pratinjau Flyer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kedaulatan Lembaga Terverifikasi (Trusted Provider Direct Publish) */}
            <div className="pt-2 border-t border-neutral-200">
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <div className="font-bold uppercase tracking-wide text-emerald-900 font-mono">
                    Lembaga Terverifikasi Disnakertrans Mimika (Katalog Instan)
                  </div>
                  <p className="text-emerald-800">
                    Sebagai lembaga pelatihan terakreditasi resmi, setiap kurikulum atau sertifikasi yang Anda terbitkan akan <strong>langsung aktif tayang di Katalog Publik Skillhub Mimika</strong> tanpa perlu antrean kurasi berulang.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{submitting ? 'Menerbitkan Program...' : 'Terbitkan Program ke Katalog Skillhub'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: FORMULIR PEMBUKAAN BATCH COHORT */}
        {activeMode === 'BATCH' && (
          <form onSubmit={handleSubmitBatch} className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
            <div className="border-b border-neutral-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                Pembukaan Batch Gelombang Cohort
              </span>
            </div>

            {programs.length === 0 ? (
              <div className="p-6 text-center border border-amber-300 bg-amber-50 text-xs text-amber-900 space-y-2">
                <p>Anda belum memiliki program pelatihan terdaftar. Buat program terlebih dahulu pada tab "1. Buat Program".</p>
                <button
                  type="button"
                  onClick={() => setActiveMode('PROGRAM')}
                  className="font-bold underline"
                >
                  Beralih ke Pembuatan Program
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Pilih Program Pelatihan <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white font-medium"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.programCode}) - {p.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Nama Batch / Gelombang <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Batch 1 Tahun 2026 (Khusus Pemuda Mimika)"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Alokasi Kuota Kursi <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={quota}
                      onChange={(e) => setQuota(Number(e.target.value))}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Skema Pembiayaan <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={fundingType}
                      onChange={(e) => setFundingType(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                    >
                      <option value="GRATIS_APBD_MIMIKA">Gratis Dibiayai APBD Mimika (Pemda)</option>
                      <option value="BEASISWA_CSR">Beasiswa Penuh Kemitraan CSR Industri</option>
                      <option value="MANDIRI_BERBAYAR">Mandiri / Berbayar Siswa Sendiri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Metode Akomodasi <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={trainingMethod}
                      onChange={(e) => setTrainingMethod(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                    >
                      <option value="BOARDING">Asrama / Mess Penuh (Boarding)</option>
                      <option value="NON_BOARDING">Pulang Pergi (Non-Boarding)</option>
                      <option value="MTU">Mobile Training Unit (MTU Masuk Kampung)</option>
                    </select>
                  </div>
                </div>

                {fundingType === 'MANDIRI_BERBAYAR' && (
                  <div className="border border-neutral-300 bg-neutral-50 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-neutral-800" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        Rekening Bank & Pembayaran Lembaga (Mandiri)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                          Biaya Pelatihan / Siswa (Rp) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={priceAmount}
                          onChange={(e) => setPriceAmount(Number(e.target.value))}
                          className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                          Nama Bank Penampung <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: BANK PAPUA / BANK MANDIRI"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                          Nomor Rekening Balai / LPK <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 100-234-56789-0"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                          Atas Nama Pemilik Rekening <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: LPK VOKASI TEKNIK MIMIKA"
                          value={bankAccountHolder}
                          onChange={(e) => setBankAccountHolder(e.target.value)}
                          className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Instruksi Transfer & Format Berita
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Sertakan berita transfer: NIK-NAMA_LENGKAP. Slip pembayaran diunggah di web atau diserahkan ke kasir balai."
                        value={paymentInstructions}
                        onChange={(e) => setPaymentInstructions(e.target.value)}
                        className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Kebijakan Seleksi & Penerimaan Siswa */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Alur Penerimaan Peserta & Perlindungan Kuota Workshop
                    </label>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Standar vokasi industri: Kuota fisik hanya terkunci setelah berkas atau pembayaran divalidasi oleh Balai di Meja Seleksi.
                    </p>
                  </div>

                  <div className="border border-neutral-300 bg-neutral-50 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-neutral-900" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        {fundingType === 'MANDIRI_BERBAYAR'
                          ? 'Skema Berbayar: Verifikasi Pembayaran & Pelunasan Balai'
                          : 'Skema APBD / Beasiswa: Seleksi KTP Mimika & Tes Wawancara Balai'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {fundingType === 'MANDIRI_BERBAYAR' ? (
                        <>
                          Pendaftar masuk ke status <strong>Menunggu Pembayaran (PENDING_PAYMENT)</strong>. Talenta dapat transfer ke rekening lembaga dan mengunggah slip bukti bayar. Pengelola Balai mengonfirmasi keabsahan pembayaran pada <strong>Meja Seleksi</strong> untuk mengubah status menjadi <strong>ADMITTED (Resmi Diterima)</strong> dan mengunci kuota kursi.
                        </>
                      ) : (
                        <>
                          Pendaftar masuk ke status <strong>Terdaftar (REGISTERED)</strong>. Talenta diarahkan menghubungi narahubung Balai via WhatsApp untuk penjadwalan verifikasi fisik KTP Mimika dan wawancara minat. Pengelola Balai meloloskan siswa melalui <strong>Meja Seleksi</strong> untuk mengubah status menjadi <strong>ADMITTED (Resmi Diterima)</strong> dan mengunci kuota kursi.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-200 p-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Estimasi Tanggal Pengumuman Hasil Seleksi / Batas Verifikasi (Opsional)
                    </label>
                    <p className="text-[11px] text-neutral-500 mb-2">
                      Tanggal ini akan ditampilkan di kartu talenta agar pendaftar mengetahui batas waktu verifikasi berkas atau pelunasan.
                    </p>
                    <input
                      type="date"
                      value={announcementDate}
                      onChange={(e) => setAnnouncementDate(e.target.value)}
                      className="w-full sm:w-64 border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Fasilitas Kesejahteraan (Pills) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Fasilitas Kesejahteraan Siswa (Pills Transparan)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {WELFARE_OPTIONS.map((w) => {
                      const isSelected = selectedWelfare.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => toggleWelfare(w.id)}
                          className={`p-2.5 text-xs font-medium border text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                          }`}
                        >
                          <span>{w.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Jadwal Pelaksanaan */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-neutral-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                      Jadwal Pendaftaran & Periode Pelatihan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Mulai Pendaftaran
                      </label>
                      <input
                        type="date"
                        required
                        value={registrationStart}
                        onChange={(e) => setRegistrationStart(e.target.value)}
                        className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Selesai Pendaftaran
                      </label>
                      <input
                        type="date"
                        required
                        value={registrationEnd}
                        onChange={(e) => setRegistrationEnd(e.target.value)}
                        className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Mulai Pelatihan
                      </label>
                      <input
                        type="date"
                        required
                        value={trainingStart}
                        onChange={(e) => setTrainingStart(e.target.value)}
                        className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Selesai Pelatihan
                      </label>
                      <input
                        type="date"
                        required
                        value={trainingEnd}
                        onChange={(e) => setTrainingEnd(e.target.value)}
                        className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Alamat Fisik / Lokasi Pelaksanaan
                  </label>
                  <textarea
                    rows={2}
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="Kosongkan jika sama dengan alamat kantor balai..."
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{submitting ? 'Membuka Batch...' : 'Buka Gelombang Batch Resmi'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </form>
        )}

      </div>

      <AlertModal {...alertProps} />
    </AppShell>
  );
}

export default function CreateProgramOrBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
          <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full font-mono text-xs text-neutral-600">
            Memuat Studio Program & Gelombang Batch...
          </div>
        </div>
      }
    >
      <CreateProgramOrBatchContent />
    </Suspense>
  );
}
