'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  Search,
  Filter,
  X,
  Flame,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Users,
  Phone,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Wrench,
  Truck,
  HardHat,
  Cpu,
  Zap,
  Laptop,
  Package,
  Hammer,
  Utensils,
  Car,
  ChevronRight,
  RotateCcw,
  Info,
  ShieldAlert,
} from 'lucide-react';

// =========================================================================
// 1. DATA MASTER 10 RUMPUN KEJURUAN RESMI (GAYA SKILLHUB KEMNAKER RI)
// =========================================================================
interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KEJURUAN_CATEGORIES: CategoryItem[] = [
  {
    id: 'WELDING',
    name: 'Teknik Pengelasan & Fabrikasi',
    description: 'SMAW, GTAW, GMAW & Fabrikasi Baja Berat',
    icon: Flame,
  },
  {
    id: 'ALAT_BERAT',
    name: 'Operasional & Mekanik Alat Berat',
    description: 'Excavator, Haul Truck, Dozer & Loader Pertambangan',
    icon: Truck,
  },
  {
    id: 'K3_PERTAMBANGAN',
    name: 'K3 & Keselamatan Tambang',
    description: 'Pengawas Operasional Pertama (POP), Ahli K3 Umum & SIO',
    icon: ShieldAlert,
  },
  {
    id: 'MEKANIK',
    name: 'Permesinan Industri & Mekanikal',
    description: 'Bubut, Frais, Pompa, Kompresor & Hidrolik Industri',
    icon: Wrench,
  },
  {
    id: 'ELEKTRIKAL',
    name: 'Kelistrikan & Instrumentasi Industri',
    description: 'Instalasi Daya Tinggi, PLC, SCADA & Otomasi',
    icon: Zap,
  },
  {
    id: 'DIGITAL_IT',
    name: 'Teknologi Informasi & Digital',
    description: 'Software Engineering, Jaringan Komputer, Desain & Data',
    icon: Laptop,
  },
  {
    id: 'LOGISTIK',
    name: 'Supply Chain & Pergudangan',
    description: 'Manajemen Gudang, Forklift Operator & Inventory Control',
    icon: Package,
  },
  {
    id: 'KONSTRUKSI',
    name: 'Konstruksi & Sipil Lapangan',
    description: 'Surveyor Pemetaan, Struktur Beton & Perancah (Scaffolding)',
    icon: Hammer,
  },
  {
    id: 'HOSPITALITY',
    name: 'Hospitality, Boga & Perhotelan',
    description: 'Catering Industri Tambang, Barista & Perhotelan',
    icon: Utensils,
  },
  {
    id: 'OTOMOTIF',
    name: 'Otomotif & Mesin Kendaraan',
    description: 'Pemeliharaan Kendaraan Ringan (LV) Tambang & Diesel',
    icon: Car,
  },
];

const WELFARE_LABELS: Record<string, string> = {
  ASRAMA_MESS: 'Asrama / Mess',
  MAKAN_3X: 'Makan 3x Sehari',
  UANG_SAKU: 'Uang Saku Transport',
  APD_LENGKAP: 'APD & Safety Kit',
  BPJS_MAGANG: 'BPJS Ketenagakerjaan',
  MODUL_KIT: 'Modul & Tool Kit',
};

const CERT_TYPE_LABELS: Record<string, string> = {
  KOMPETENSI_BNSP: 'Sertifikat Kompetensi BNSP (Garuda Emas)',
  PELATIHAN_STTP: 'STTP Pelatihan Balai Vokasi',
  LISENSI_K3_KEMNAKER: 'Lisensi K3 / SIO Kemnaker RI',
  KOMBINASI_LENGKAP: 'Kombinasi STTP + BNSP + K3',
};

export default function TalentTrainingsPage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();

  // Core State
  const [profile, setProfile] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_ENROLLMENTS'>('MARKETPLACE');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  const [filterPaidOnly, setFilterPaidOnly] = useState(false);
  const [selectedCertTypes, setSelectedCertTypes] = useState<string[]>([]);

  // Modal State: Detail Program (4 Tab)
  const [detailProgram, setDetailProgram] = useState<any | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'ABOUT' | 'PROVIDER' | 'BATCHES' | 'CAREER'>('ABOUT');

  // Modal State: Konfirmasi Pendaftaran Batch
  const [enrollModalBatch, setEnrollModalBatch] = useState<any | null>(null);
  const [enrollModalProgram, setEnrollModalProgram] = useState<any | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Modal State: WhatsApp Hand-Off Berhasil
  const [whatsAppOutreachModal, setWhatsAppOutreachModal] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const profileRes = await apiFetch('/talents/me');
    if (profileRes.status !== 'success') {
      const userRes = await apiFetch('/auth/me');
      if (userRes.status === 'success') {
        const r = userRes.data?.role;
        if (r === 'DISNAKER_ADMIN' || r === 'SUPERADMIN' || r === 'EXECUTIVE') {
          router.push('/admin?tab=TRAININGS');
          return;
        } else if (r === 'EMPLOYER') {
          router.push('/employer');
          return;
        } else if (r === 'TRAINING_PROVIDER') {
          router.push('/provider');
          return;
        }
      }
      router.push('/login');
      return;
    }
    setProfile(profileRes.data);

    // Ambil Katalog Skillhub & Pendaftaran Saya
    const [catalogRes, enrollRes] = await Promise.all([
      apiFetch('/trainings/catalog'),
      apiFetch('/trainings/my/enrollments'),
    ]);

    if (catalogRes.status === 'success') {
      setCatalog(catalogRes.data || []);
    }
    if (enrollRes.status === 'success') {
      setMyEnrollments(enrollRes.data || []);
    }

    setLoading(false);
  };

  // -------------------------------------------------------------
  // FILTER LOGIC
  // -------------------------------------------------------------
  const filteredCatalog = useMemo(() => {
    return catalog.filter((prog) => {
      // 1. Kategori Rumpun
      if (selectedCategory !== 'ALL' && prog.category !== selectedCategory) {
        return false;
      }

      // 2. Keyword Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prog.title?.toLowerCase().includes(q);
        const matchDesc = prog.description?.toLowerCase().includes(q);
        const matchProvider = (prog.provider?.institutionName || prog.providerName || '')
          .toLowerCase()
          .includes(q);
        const matchCode = prog.programCode?.toLowerCase().includes(q);
        const matchSkills = Array.isArray(prog.targetSkills)
          ? prog.targetSkills.some((s: any) =>
              (typeof s === 'string' ? s : s?.name || '').toLowerCase().includes(q)
            )
          : false;

        if (!matchTitle && !matchDesc && !matchProvider && !matchCode && !matchSkills) {
          return false;
        }
      }

      // 3. Delivery Mode
      if (selectedDelivery.length > 0 && !selectedDelivery.includes(prog.deliveryMode)) {
        return false;
      }

      // 4. Sertifikat
      if (selectedCertTypes.length > 0 && !selectedCertTypes.includes(prog.certificateType)) {
        return false;
      }

      // 5. Metode Pelatihan & Skema Biaya (berdasarkan batches)
      const batches = prog.batches || [];
      if (selectedMethods.length > 0) {
        const hasMatchingMethod = batches.some((b: any) => selectedMethods.includes(b.trainingMethod));
        if (!hasMatchingMethod && batches.length > 0) return false;
      }

      if (filterFreeOnly) {
        const hasFreeBatch = batches.some(
          (b: any) => b.fundingType === 'GRATIS_APBD_MIMIKA' || b.fundingType === 'BEASISWA_CSR'
        );
        if (!hasFreeBatch && batches.length > 0) return false;
      }

      if (filterPaidOnly) {
        const hasPaidBatch = batches.some((b: any) => b.fundingType === 'MANDIRI_BERBAYAR');
        if (!hasPaidBatch && batches.length > 0) return false;
      }

      return true;
    });
  }, [
    catalog,
    selectedCategory,
    searchQuery,
    selectedDelivery,
    selectedCertTypes,
    selectedMethods,
    filterFreeOnly,
    filterPaidOnly,
  ]);

  const toggleDelivery = (val: string) => {
    setSelectedDelivery((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const toggleMethod = (val: string) => {
    setSelectedMethods((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const toggleCertType = (val: string) => {
    setSelectedCertTypes((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedDelivery([]);
    setSelectedMethods([]);
    setFilterFreeOnly(false);
    setFilterPaidOnly(false);
    setSelectedCertTypes([]);
  };

  // Hitung jumlah program per kategori
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    catalog.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [catalog]);

  // -------------------------------------------------------------
  // ACTION: EKSEKUSI PENDAFTARAN BATCH & HAND-OFF WHATSAPP
  // -------------------------------------------------------------
  const handleConfirmBatchEnrollment = async () => {
    if (!enrollModalBatch || !enrollModalProgram) return;

    setEnrolling(true);
    try {
      const res = await apiFetch(
        `/trainings/${enrollModalProgram.id}/batches/${enrollModalBatch.id}/enroll`,
        {
          method: 'POST',
        }
      );

      if (res.status === 'success') {
        const outreachData = res.data?.whatsAppOutreach || {
          picName: enrollModalProgram.provider?.picName || 'Admin Pendaftaran',
          picPhone: enrollModalProgram.provider?.picPhone || '',
          draftMessage: `Halo, saya ${profile?.fullName} (NIK: ${profile?.nik}) telah mendaftar di ${enrollModalProgram.title} (${enrollModalBatch.batchName}).`,
          whatsAppDirectUrl: enrollModalProgram.provider?.picPhone
            ? `https://wa.me/${enrollModalProgram.provider.picPhone.replace(/\D/g, '')}`
            : '#',
        };

        // Tutup modal pendaftaran dan buka modal WhatsApp Hand-Off
        setEnrollModalBatch(null);
        setEnrollModalProgram(null);
        setDetailProgram(null);

        setWhatsAppOutreachModal({
          programTitle: enrollModalProgram.title,
          batchName: enrollModalBatch.batchName,
          institutionName:
            enrollModalProgram.provider?.institutionName || 'Balai Pelatihan Terdaftar',
          outreach: outreachData,
        });

        // Muat ulang pendaftaran saya
        await loadData();
      } else {
        showAlert('error', 'Pendaftaran Gagal', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Pendaftaran Gagal', err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full shadow-sm">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600 font-mono">
            Memuat Skillhub Mimika...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell userRole="TALENT" userName={profile?.fullName || 'Kandidat'}>
      <div className="max-w-7xl mx-auto space-y-8 py-2">
        {/* ========================================================================= */}
        {/* 1. HEADER UTAMA ETALASE SKILLHUB                                          */}
        {/* ========================================================================= */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-neutral-200 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2.5 py-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Skillhub Ketenagakerjaan Daerah
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5">
                  Disnakertrans Kab. Mimika
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-900">
                Pusat Pelatihan Vokasi & Sertifikasi BNSP
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
                Etalase program pelatihan bersertifikasi resmi untuk talenta daerah Mimika. Setiap kelulusan
                program langsung menginjeksi keahlian terverifikasi ke profil Anda dan memicu radar rekrutmen mitra industri.
              </p>
            </div>

            {/* TAB SELECTOR: KATALOG VS KELAS SAYA */}
            <div className="flex border border-neutral-900 w-full lg:w-auto shrink-0 font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('MARKETPLACE')}
                className={`flex-1 lg:flex-none px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'MARKETPLACE'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Katalog Skillhub ({catalog.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MY_ENROLLMENTS')}
                className={`flex-1 lg:flex-none px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'MY_ENROLLMENTS'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Pelatihan & Batch Saya ({myEnrollments.length})
              </button>
            </div>
          </div>

          {/* Banner The Closed-Loop Synergy */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 flex items-center gap-3 text-xs text-neutral-700">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>The Closed-Loop Synergy:</strong> Begitu Anda lulus dari program pelatihan terakreditasi,
              seluruh unit kompetensi SKKNI akan otomatis tersemat secara permanen di profil Anda tanpa proses klaim manual.
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAMPILAN KATALOG SKILLHUB MARKETPLACE                                   */}
        {/* ========================================================================= */}
        {activeTab === 'MARKETPLACE' && (
          <div className="space-y-8">
            {/* ------------------------------------------------------------- */}
            {/* CAROUSEL / GRID 10 RUMPUN KEJURUAN RESMI                      */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-900" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Jelajahi Berdasarkan Rumpun Kejuruan (10 Kluster Utama)
                  </h2>
                </div>
                {selectedCategory !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className="text-xs font-bold text-neutral-900 underline hover:text-neutral-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Lihat Semua Kejuruan</span>
                  </button>
                )}
              </div>

              {/* Grid 10 Kluster */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {KEJURUAN_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(isSelected ? 'ALL' : cat.id)
                      }
                      className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                        isSelected
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                          : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-7 h-7 flex items-center justify-center border ${
                            isSelected
                              ? 'border-neutral-700 bg-neutral-800 text-white'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                            isSelected
                              ? 'bg-neutral-800 text-emerald-400 border-neutral-700'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {count}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold uppercase leading-tight line-clamp-2">
                          {cat.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* AREA UTAMA: SIDEBAR FILTER + CARD GRID PROGRAM                */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* SIDEBAR FILTER MULTI-KRITERIA (GAYA SWISS ARCHITECTURAL) */}
              <aside className="w-full lg:w-72 shrink-0 space-y-6">
                <div className="bg-white border border-neutral-300 p-5 space-y-6">
                  {/* Header Filter */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-neutral-900" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                        Filter Program
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-wider cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* 1. Filter Pencarian Keyword */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono block">
                      Kata Kunci
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Judul, skill, lembaga..."
                        className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 2. Filter Moda Pelaksanaan (Delivery) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono block">
                      Tipe Pelatihan
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'OFFLINE', label: 'Tatap Muka (Offline Workshop)' },
                        { id: 'ONLINE', label: 'Daring Penuh (Online LMS)' },
                        { id: 'BLENDED', label: 'Hybrid (Daring & Praktik)' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDelivery.includes(item.id)}
                            onChange={() => toggleDelivery(item.id)}
                            className="rounded-none border-neutral-400 text-neutral-900 focus:ring-0 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3. Filter Metode & Akomodasi */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono block">
                      Metode & Akomodasi
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'BOARDING', label: 'Asrama / Mess (Boarding)' },
                        { id: 'NON_BOARDING', label: 'Pulang Pergi (Non-Boarding)' },
                        { id: 'MTU', label: 'Mobile Training Unit (MTU Masuk Kampung)' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMethods.includes(item.id)}
                            onChange={() => toggleMethod(item.id)}
                            className="rounded-none border-neutral-400 text-neutral-900 focus:ring-0 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 4. Filter Skema Biaya */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono block">
                      Skema Biaya Pelatihan
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={filterFreeOnly}
                          onChange={(e) => {
                            setFilterFreeOnly(e.target.checked);
                            if (e.target.checked) setFilterPaidOnly(false);
                          }}
                          className="rounded-none border-neutral-400 text-neutral-900 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold text-emerald-800">
                          Gratis (APBD Pemkab Mimika / CSR)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={filterPaidOnly}
                          onChange={(e) => {
                            setFilterPaidOnly(e.target.checked);
                            if (e.target.checked) setFilterFreeOnly(false);
                          }}
                          className="rounded-none border-neutral-400 text-neutral-900 focus:ring-0 cursor-pointer"
                        />
                        <span>Mandiri Berbayar</span>
                      </label>
                    </div>
                  </div>

                  {/* 5. Filter Sertifikasi Diterbitkan */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 font-mono block">
                      Sertifikasi yang Diterbitkan
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'KOMPETENSI_BNSP', label: 'Sertifikat BNSP (Garuda Emas)' },
                        { id: 'PELATIHAN_STTP', label: 'STTP Pelatihan Balai Vokasi' },
                        { id: 'LISENSI_K3_KEMNAKER', label: 'Lisensi K3 / SIO Kemnaker' },
                        { id: 'KOMBINASI_LENGKAP', label: 'Kombinasi STTP + BNSP' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCertTypes.includes(item.id)}
                            onChange={() => toggleCertType(item.id)}
                            className="rounded-none border-neutral-400 text-neutral-900 focus:ring-0 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* CARD GRID PROGRAM TRANS-PAPUA (SWISS ARCHITECTURAL UI) */}
              <main className="flex-1 space-y-4">
                {/* Status Bar Hasil Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-300 px-4 py-3 text-xs">
                  <div className="text-neutral-600">
                    Menampilkan <strong>{filteredCatalog.length}</strong> program pelatihan terkurasi
                    {selectedCategory !== 'ALL' && (
                      <span>
                        {' '}
                        dalam kejuruan{' '}
                        <strong>
                          {KEJURUAN_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                        </strong>
                      </span>
                    )}
                  </div>
                  {filteredCatalog.length > 0 && (
                    <div className="text-[11px] font-mono text-neutral-500">
                      Standardisasi SKKNI & Kurasi Disnakertrans
                    </div>
                  )}
                </div>

                {filteredCatalog.length === 0 ? (
                  <div className="bg-white border border-neutral-300 p-12 text-center space-y-3">
                    <BookOpen className="w-8 h-8 text-neutral-400 mx-auto" />
                    <div className="text-sm font-bold uppercase text-neutral-900">
                      Tidak Ada Program yang Cocok
                    </div>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Coba sesuaikan kata kunci pencarian Anda atau reset kriteria filter untuk melihat seluruh katalog pelatihan.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                    >
                      Reset Semua Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCatalog.map((prog) => {
                      const openBatches = (prog.batches || []).filter((b: any) => b.isOpen);
                      const hasFree = openBatches.some(
                        (b: any) =>
                          b.fundingType === 'GRATIS_APBD_MIMIKA' || b.fundingType === 'BEASISWA_CSR'
                      );
                      const minPrice = openBatches
                        .filter((b: any) => b.fundingType === 'MANDIRI_BERBAYAR')
                        .reduce(
                          (min: number, b: any) => Math.min(min, Number(b.priceAmount) || 0),
                          Infinity
                        );

                      return (
                        <div
                          key={prog.id}
                          className="bg-white border border-neutral-300 hover:border-neutral-900 p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xs group"
                        >
                          {/* Sisi Atas: Identitas Lembaga & Status */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-200">
                                  {prog.programCode || 'PROG-SKILLHUB'}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-900 text-white">
                                  {prog.deliveryMode}
                                </span>
                              </div>

                              {/* Badge Skema Biaya Tercepat */}
                              {hasFree ? (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300">
                                  Gratis APBD
                                </span>
                              ) : minPrice !== Infinity ? (
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300">
                                  Rp {minPrice.toLocaleString('id-ID')}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600">
                                  Lihat Gelombang
                                </span>
                              )}
                            </div>

                            {/* Lembaga Penyelenggara */}
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="font-semibold text-neutral-800 truncate">
                                {prog.provider?.institutionName || prog.providerName || 'Balai Vokasi Mimika'}
                              </span>
                              {prog.provider?.vinNumber && (
                                <span className="text-[10px] font-mono text-neutral-500 border border-neutral-200 px-1">
                                  VIN
                                </span>
                              )}
                            </div>

                            {/* Judul Program */}
                            <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors leading-snug">
                              {prog.title}
                            </h3>

                            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                              {prog.description}
                            </p>

                            {/* Bar Metrik Kunci: Durasi & JP */}
                            <div className="pt-2 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 font-mono">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{prog.durationDays || 30} Hari ({prog.totalLessonHours || 120} JP)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                <span>
                                  {openBatches.length > 0
                                    ? `${openBatches.length} Batch Buka`
                                    : 'Segera Dibuka'}
                                </span>
                              </div>
                            </div>

                            {/* Target Keahlian Pills */}
                            {Array.isArray(prog.targetSkills) && prog.targetSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {prog.targetSkills.slice(0, 3).map((sk: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] bg-neutral-50 border border-neutral-200 text-neutral-700 px-1.5 py-0.5 flex items-center gap-1"
                                  >
                                    <Award className="w-2.5 h-2.5 text-neutral-500" />
                                    <span>{typeof sk === 'string' ? sk : sk?.name}</span>
                                  </span>
                                ))}
                                {prog.targetSkills.length > 3 && (
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    +{prog.targetSkills.length - 3} lagi
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Sisi Bawah: Tombol Aksi */}
                          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                              {CERT_TYPE_LABELS[prog.certificateType] || 'Sertifikat Resmi'}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setDetailProgram(prog);
                                setDetailModalTab('ABOUT');
                              }}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                            >
                              <span>Detail & Batch</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TAMPILAN PELATIHAN & BATCH SAYA                                        */}
        {/* ========================================================================= */}
        {activeTab === 'MY_ENROLLMENTS' && (
          <div className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-tight text-neutral-900 font-mono">
                  Riwayat Pendaftaran & Kelulusan Pelatihan
                </h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Pantau status verifikasi administrasi fisik oleh balai, jadwal kelas, dan sertifikat resmi kelulusan Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('MARKETPLACE')}
                className="px-4 py-2 border border-neutral-900 text-neutral-900 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                + Jelajahi Katalog Baru
              </button>
            </div>

            {myEnrollments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-neutral-400 mx-auto" />
                <div className="text-sm font-bold uppercase text-neutral-900">
                  Belum Ada Program yang Diikuti
                </div>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                  Anda belum terdaftar pada gelombang pelatihan apa pun. Daftarkan diri Anda pada program vokasi untuk meningkatkan kompetensi dan radar AI.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('MARKETPLACE')}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Buka Katalog Skillhub Sekarang
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {myEnrollments.map((enr) => {
                  const isGraduated =
                    enr.selectionStatus === 'GRADUATED' || enr.status === 'COMPLETED';
                  const picPhone =
                    enr.program?.provider?.picPhone || enr.batch?.provider?.picPhone;
                  const picName =
                    enr.program?.provider?.picName || 'Admin Balai';

                  return (
                    <div key={enr.id} className="py-6 space-y-4 hover:bg-neutral-50/50 transition-colors">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono ${
                                isGraduated
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : enr.selectionStatus === 'ACCEPTED'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : enr.selectionStatus === 'REJECTED'
                                  ? 'bg-red-50 text-red-900 border-red-300'
                                  : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                              }`}
                            >
                              STATUS: {enr.selectionStatus || enr.status}
                            </span>
                            {enr.batch?.batchName && (
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {enr.batch.batchName}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900">
                            {enr.program?.title}
                          </h3>

                          <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-3">
                            <span>
                              Penyelenggara:{' '}
                              <strong>
                                {enr.program?.provider?.institutionName ||
                                  enr.program?.providerName ||
                                  'Balai Vokasi'}
                              </strong>
                            </span>
                            <span>&bull;</span>
                            <span>Moda: <strong>{enr.program?.deliveryMode}</strong></span>
                            {enr.batch?.trainingMethod && (
                              <>
                                <span>&bull;</span>
                                <span>Metode: <strong>{enr.batch.trainingMethod}</strong></span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Aksi Sisi Kanan */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {picPhone && (
                            <a
                              href={`https://wa.me/${picPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Halo ${picName}, saya ${profile?.fullName} ingin menanyakan status pendaftaran program ${enr.program?.title}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Hubungi PIC Balai</span>
                            </a>
                          )}

                          {enr.program?.sessions && enr.program.sessions.length > 0 && (
                            <Link
                              href={`/talent/trainings/${enr.programId}/learn`}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                            >
                              <span>{isGraduated ? 'Tinjau Materi' : 'Ruang Belajar'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Banner Sertifikat Emas Jika Lulus */}
                      {isGraduated && (
                        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-emerald-700 shrink-0" />
                              <div>
                                <div className="text-xs font-bold uppercase">
                                  Selamat! Anda Resmi Dinyatakan Lulus
                                </div>
                                <div className="text-[11px] font-mono">
                                  No. Sertifikat STTP:{' '}
                                  <strong>{enr.certificateNumber || 'STTP-TERBIT'}</strong>
                                  {enr.bnspCertificateNumber && (
                                    <span>
                                      {' '}&bull; No. BNSP: <strong>{enr.bnspCertificateNumber}</strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-emerald-800 text-white self-start sm:self-auto font-mono">
                              Keahlian Terinjeksi ke Radar
                            </span>
                          </div>

                          {enr.finalScore && (
                            <div className="text-[11px] text-emerald-800 border-t border-emerald-200 pt-2 font-mono">
                              Nilai Kelulusan Akhir: <strong>{enr.finalScore} / 100</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: DETAIL PROGRAM KOMPREHENSIF (4 TAB)                              */}
        {/* ========================================================================= */}
        {detailProgram && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-400 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Header Modal */}
              <div className="p-5 border-b border-neutral-300 flex items-start justify-between gap-4 bg-neutral-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-900 text-white">
                      {detailProgram.programCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-200 text-neutral-800">
                      {detailProgram.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-200 text-neutral-800">
                      {detailProgram.deliveryMode}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold uppercase text-neutral-900 tracking-tight leading-snug">
                    {detailProgram.title}
                  </h3>
                  <div className="text-xs text-neutral-600 font-semibold">
                    {detailProgram.provider?.institutionName || detailProgram.providerName}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailProgram(null)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Tabs Selector */}
              <div className="flex border-b border-neutral-300 bg-white font-mono text-xs font-bold uppercase">
                {[
                  { id: 'ABOUT', label: '1. Tentang & Silabus' },
                  { id: 'PROVIDER', label: '2. Penyelenggara' },
                  { id: 'BATCHES', label: `3. Gelombang Batch (${detailProgram.batches?.length || 0})` },
                  { id: 'CAREER', label: '4. Dampak Karir & AI' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailModalTab(t.id as any)}
                    className={`flex-1 py-3 px-3 text-center border-r border-neutral-200 last:border-r-0 cursor-pointer transition-colors ${
                      detailModalTab === t.id
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Body Modal (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-neutral-700">
                {/* TAB 1: TENTANG & SILABUS */}
                {detailModalTab === 'ABOUT' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase text-neutral-900 text-xs font-mono">
                        Deskripsi Kurikulum
                      </h4>
                      <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                        {detailProgram.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 border border-neutral-200">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 block uppercase">
                          Durasi Pelatihan
                        </span>
                        <div className="font-bold text-neutral-900 text-sm">
                          {detailProgram.durationDays} Hari Kalender ({detailProgram.totalLessonHours} JP)
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 block uppercase">
                          Sertifikasi yang Diterbitkan
                        </span>
                        <div className="font-bold text-neutral-900 text-sm">
                          {CERT_TYPE_LABELS[detailProgram.certificateType] || detailProgram.certificateType}
                        </div>
                      </div>
                    </div>

                    {detailProgram.syllabus && (
                      <div className="space-y-2">
                        <h4 className="font-bold uppercase text-neutral-900 text-xs font-mono">
                          Silabus & Pokok Bahasan
                        </h4>
                        <div className="p-3 bg-neutral-50 border border-neutral-200 font-mono text-neutral-700 leading-relaxed whitespace-pre-line">
                          {detailProgram.syllabus}
                        </div>
                      </div>
                    )}

                    {detailProgram.requirements && (
                      <div className="space-y-2">
                        <h4 className="font-bold uppercase text-neutral-900 text-xs font-mono">
                          Persyaratan Peserta
                        </h4>
                        <div className="p-3 bg-neutral-50 border border-neutral-200 leading-relaxed whitespace-pre-line">
                          {detailProgram.requirements}
                        </div>
                      </div>
                    )}

                    {Array.isArray(detailProgram.targetSkills) && detailProgram.targetSkills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold uppercase text-neutral-900 text-xs font-mono">
                          Keahlian SKKNI yang Dihadiahkan (Terinjeksi Otomatis)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {detailProgram.targetSkills.map((sk: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white border border-neutral-300 font-semibold text-neutral-800 flex items-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5 text-neutral-700" />
                              <span>{typeof sk === 'string' ? sk : `${sk?.name} (${sk?.level || 'Menengah'})`}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: PENYELENGGARA */}
                {detailModalTab === 'PROVIDER' && (
                  <div className="space-y-5">
                    <div className="border border-neutral-200 p-4 space-y-3 bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-900 text-white">
                          {detailProgram.provider?.institutionType?.replace(/_/g, ' ') || 'LEMBAGA VOKASI'}
                        </span>
                        {detailProgram.provider?.accreditation && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {detailProgram.provider.accreditation.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold uppercase text-neutral-900">
                        {detailProgram.provider?.institutionName || detailProgram.providerName}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-neutral-600 font-mono text-[11px]">
                        <div>
                          <span>Nomor Izin VIN Kemnaker: </span>
                          <strong className="text-neutral-900">
                            {detailProgram.provider?.vinNumber || 'Tervalidasi Disnaker'}
                          </strong>
                        </div>
                        {detailProgram.provider?.bnspLicenseNumber && (
                          <div>
                            <span>Lisensi BNSP: </span>
                            <strong className="text-neutral-900">
                              {detailProgram.provider.bnspLicenseNumber}
                            </strong>
                          </div>
                        )}
                      </div>

                      <p className="text-neutral-600 leading-relaxed pt-1">
                        {detailProgram.provider?.institutionBio ||
                          'Lembaga Pelatihan Kerja terdaftar dan diawasi secara resmi oleh Disnakertrans Kabupaten Mimika untuk penyelenggaraan vokasi tenaga kerja lokal.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold uppercase text-neutral-900 text-xs font-mono">
                        Lokasi Workshop & Kontak PIC
                      </h4>
                      <div className="space-y-2 border border-neutral-200 p-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                          <span>{detailProgram.provider?.address || 'Kabupaten Mimika, Papua Tengah'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                          <span>
                            Narahubung PIC:{' '}
                            <strong>
                              {detailProgram.provider?.picName || 'Koordinator Pelatihan'} (
                              {detailProgram.provider?.picRole || 'Admin'})
                            </strong>
                          </span>
                        </div>
                        {detailProgram.provider?.picPhone && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                            <span className="font-mono">{detailProgram.provider.picPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: DAFTAR BATCH COHORT */}
                {detailModalTab === 'BATCHES' && (
                  <div className="space-y-4">
                    <div className="text-xs text-neutral-600">
                      Pilih salah satu gelombang cohort di bawah ini untuk mendaftar secara resmi melalui platform:
                    </div>

                    {(!detailProgram.batches || detailProgram.batches.length === 0) ? (
                      <div className="p-8 text-center border border-neutral-200 bg-neutral-50 space-y-2">
                        <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
                        <div className="font-bold uppercase text-neutral-900">
                          Belum Ada Gelombang Terbuka
                        </div>
                        <p className="text-neutral-500">
                          Lembaga belum menjadwalkan batch cohort baru untuk program ini. Silakan pantau secara berkala.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {detailProgram.batches.map((batch: any) => {
                          const isFree =
                            batch.fundingType === 'GRATIS_APBD_MIMIKA' ||
                            batch.fundingType === 'BEASISWA_CSR';
                          const enrollmentsCount = batch._count?.enrollments || 0;
                          const seatsLeft = Math.max(0, batch.quota - enrollmentsCount);

                          return (
                            <div
                              key={batch.id}
                              className={`p-4 border transition-all ${
                                batch.isOpen
                                  ? 'border-neutral-300 bg-white hover:border-neutral-900'
                                  : 'border-neutral-200 bg-neutral-50 opacity-60'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold uppercase text-neutral-900 text-sm">
                                      {batch.batchName}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                                        isFree
                                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                          : 'bg-neutral-100 text-neutral-800 border-neutral-300 font-mono'
                                      }`}
                                    >
                                      {isFree
                                        ? 'Gratis APBD / CSR'
                                        : `Rp ${(Number(batch.priceAmount) || 0).toLocaleString('id-ID')}`}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                                      {batch.trainingMethod}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-neutral-600 mt-1 font-mono">
                                    Sisa Kuota: <strong>{seatsLeft} dari {batch.quota} kursi</strong> &bull;
                                    Jadwal: {new Date(batch.startDate).toLocaleDateString('id-ID')} s/d{' '}
                                    {new Date(batch.endDate).toLocaleDateString('id-ID')}
                                  </div>
                                </div>

                                {batch.isOpen && seatsLeft > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEnrollModalProgram(detailProgram);
                                      setEnrollModalBatch(batch);
                                    }}
                                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                                  >
                                    <span>Pilih Gelombang Ini</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="px-3 py-1.5 bg-neutral-200 text-neutral-600 text-xs font-bold uppercase tracking-wider shrink-0">
                                    {seatsLeft <= 0 ? 'Kuota Penuh' : 'Pendaftaran Tutup'}
                                  </span>
                                )}
                              </div>

                              {/* Fasilitas Kesejahteraan */}
                              {Array.isArray(batch.welfareBenefits) && batch.welfareBenefits.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase text-neutral-500 font-mono">
                                    Fasilitas:
                                  </span>
                                  {batch.welfareBenefits.map((wId: string) => (
                                    <span
                                      key={wId}
                                      className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-200"
                                    >
                                      ✓ {WELFARE_LABELS[wId] || wId}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: DAMPAK KARIR & AI */}
                {detailModalTab === 'CAREER' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-3">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold uppercase font-mono text-xs">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>The Closed-Loop Synergy: Dampak ke Radar Rekrutmen AI</span>
                      </div>
                      <p className="text-neutral-600 leading-relaxed">
                        Platform <strong>MIMIKA TALENTA</strong> menghubungkan meja kelulusan vokasi daerah langsung ke algoritma pencarian kandidat perusahaan tambang & kontraktor (PT Freeport Indonesia, dsb).
                      </p>
                      <div className="space-y-2 pt-2 border-t border-neutral-200 text-[11px]">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span><strong>Verifikasi Otomatis:</strong> Tidak ada risiko sertifikat palsu karena diinjeksi langsung oleh balai terakreditasi.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span><strong>Peningkatan Skor Radar 35%:</strong> Vektor keahlian Anda langsung naik drastis sesuai dengan kompetensi SKKNI yang dikuasai.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span><strong>Prioritas Panggilan Kerja:</strong> Perusahaan memprioritaskan talenta bersertifikat BNSP dengan riwayat kehadiran penuh.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-neutral-300 flex items-center justify-between bg-neutral-50">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Skillhub Mimika &bull; Terintegrasi Disnakertrans
                </span>
                <button
                  type="button"
                  onClick={() => setDetailProgram(null)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: KONFIRMASI PENDAFTARAN BATCH                                     */}
        {/* ========================================================================= */}
        {enrollModalBatch && enrollModalProgram && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-400 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900 font-mono">
                  Konfirmasi Pendaftaran Pelatihan
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEnrollModalBatch(null);
                    setEnrollModalProgram(null);
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-700">
                <div className="bg-neutral-50 p-3 border border-neutral-200 space-y-1">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Program:</div>
                  <div className="font-bold text-neutral-900">{enrollModalProgram.title}</div>
                  <div className="text-[11px] text-neutral-600 font-mono">
                    Gelombang: <strong>{enrollModalBatch.batchName}</strong> ({enrollModalBatch.trainingMethod})
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold font-mono">
                    Skema:{' '}
                    {enrollModalBatch.fundingType === 'GRATIS_APBD_MIMIKA' ||
                    enrollModalBatch.fundingType === 'BEASISWA_CSR'
                      ? 'Gratis (APBD Pemkab Mimika / CSR)'
                      : `Rp ${(Number(enrollModalBatch.priceAmount) || 0).toLocaleString('id-ID')}`}
                  </div>
                </div>

                <div className="border border-neutral-200 p-3 space-y-1.5 font-mono text-[11px]">
                  <div className="font-bold text-neutral-900 uppercase">Data Pendaftar (Sesuai Profil):</div>
                  <div>Nama Lengkap: <strong>{profile?.fullName}</strong></div>
                  <div>NIK: <strong>{profile?.nik}</strong></div>
                  <div>No. HP / WhatsApp: <strong>{profile?.phoneNumber || '-'}</strong></div>
                  <div>Email: <strong>{profile?.user?.email || '-'}</strong></div>
                </div>

                <p className="text-neutral-500 leading-relaxed text-[11px]">
                  Dengan menekan tombol di bawah, Anda menyatakan bersedia mengikuti seleksi berkas fisik/administrasi
                  oleh pihak balai dan mematuhi jadwal pelatihan secara disiplin.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={() => {
                    setEnrollModalBatch(null);
                    setEnrollModalProgram(null);
                  }}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={handleConfirmBatchEnrollment}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{enrolling ? 'Mendaftarkan...' : 'Kirim Pendaftaran Resmi'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: DIRECT WHATSAPP HAND-OFF SUCCESS                                 */}
        {/* ========================================================================= */}
        {whatsAppOutreachModal && (
          <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-400 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900">
                  Pendaftaran Berhasil Dikirim!
                </h3>
                <p className="text-xs text-neutral-600">
                  Data Anda resmi terdaftar di <strong>{whatsAppOutreachModal.batchName}</strong> (
                  {whatsAppOutreachModal.programTitle}).
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-4 space-y-3 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold uppercase font-mono">
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Tahap Selanjutnya: Hubungi Narahubung Lembaga</span>
                </div>
                <p className="leading-relaxed">
                  Untuk konfirmasi berkas verifikasi fisik atau jadwal seleksi wawancara langsung, silakan hubungi PIC{' '}
                  <strong>{whatsAppOutreachModal.institutionName}</strong> via WhatsApp resmi:
                </p>

                <div className="p-3 bg-white border border-emerald-200 font-mono text-[11px] text-neutral-700 whitespace-pre-line">
                  {whatsAppOutreachModal.outreach?.draftMessage}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {whatsAppOutreachModal.outreach?.whatsAppDirectUrl && (
                  <a
                    href={whatsAppOutreachModal.outreach.whatsAppDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Buka WhatsApp Sekarang</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppOutreachModal(null);
                    setActiveTab('MY_ENROLLMENTS');
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Lihat Status di Pelatihan Saya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertModal {...alertProps} />
    </AppShell>
  );
}
