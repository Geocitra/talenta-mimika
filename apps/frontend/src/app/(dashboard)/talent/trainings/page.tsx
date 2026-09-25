'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import ShopeeCampaignBillboard from '@/components/ShopeeCampaignBillboard';
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
  ChevronLeft,
  RotateCcw,
  Info,
  ShieldAlert,
  Upload,
  CreditCard,
  FileText,
  Eye,
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

function TalentTrainingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { alertProps, showAlert } = useAlertModal();

  // Core State
  const [profile, setProfile] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_ENROLLMENTS'>(() => {
    return searchParams.get('tab') === 'MY_ENROLLMENTS' ? 'MY_ENROLLMENTS' : 'MARKETPLACE';
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'MY_ENROLLMENTS') {
      setActiveTab('MY_ENROLLMENTS');
    }
  }, [searchParams]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  const [filterPaidOnly, setFilterPaidOnly] = useState(false);
  const [selectedCertTypes, setSelectedCertTypes] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Reset ke halaman 1 jika kriteria filter atau ukuran per halaman berganti
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    searchQuery,
    selectedDelivery,
    selectedMethods,
    filterFreeOnly,
    filterPaidOnly,
    selectedCertTypes,
    itemsPerPage,
  ]);

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

  const [uploadingSlipEnrollmentId, setUploadingSlipEnrollmentId] = useState<string | null>(null);

  const handleUploadPaymentProof = async (enrollmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingSlipEnrollmentId(enrollmentId);
    try {
      const res = await apiFetch(`/trainings/enrollments/${enrollmentId}/payment-proof`, {
        method: 'POST',
        body: formData,
      });
      if (res.status === 'success') {
        showAlert('success', 'Bukti Bayar Berhasil Diunggah', 'Bukti transfer Anda telah terkirim. Pengelola balai akan memverifikasi dan memperbarui status pendaftaran Anda.');
        await loadData();
      } else {
        showAlert('error', 'Gagal Mengunggah', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Mengunggah', err.message);
    } finally {
      setUploadingSlipEnrollmentId(null);
    }
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

  // Kalkulasi Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;

  const paginatedCatalog = useMemo(() => {
    return filteredCatalog.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCatalog, startIdx, itemsPerPage]);

  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const target = document.getElementById('catalog-results-top');
    if (target) {
      const yOffset = -90;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
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
            {/* SHOPEE-STYLE GIANT CAMPAIGN BILLBOARD CAROUSEL                */}
            {/* ------------------------------------------------------------- */}
            <ShopeeCampaignBillboard programs={catalog} />

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
              <main id="catalog-results-top" className="flex-1 space-y-4">
                {/* Status Bar Hasil Filter & Indikator Halaman */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-300 px-4 py-3 text-xs">
                  <div className="text-neutral-600">
                    {filteredCatalog.length === 0 ? (
                      <span>Menampilkan <strong>0</strong> program pelatihan terkurasi</span>
                    ) : (
                      <span>
                        Menampilkan program ke-<strong>{startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredCatalog.length)}</strong> dari total <strong>{filteredCatalog.length}</strong> program
                      </span>
                    )}
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
                  <div className="flex items-center gap-3">
                    {totalPages > 1 && (
                      <span className="text-[11px] font-mono font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 border border-neutral-300">
                        Hal {currentPage} / {totalPages}
                      </span>
                    )}
                    <div className="text-[11px] font-mono text-neutral-500 hidden sm:block">
                      Standardisasi SKKNI & Kurasi Disnakertrans
                    </div>
                  </div>
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
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {paginatedCatalog.map((prog) => {
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
                          className="bg-white border border-neutral-300 hover:border-neutral-900 flex flex-col justify-between transition-all hover:shadow-md group overflow-hidden"
                        >
                          {/* Top Cover Flyer Banner (Shopee Style) */}
                          <Link
                            href={`/talent/trainings/${prog.id}`}
                            className="block relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900 cursor-pointer"
                          >
                            {prog.coverImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getFullMediaUrl(prog.coverImageUrl)}
                                alt={prog.title}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 p-5 flex flex-col justify-between">
                                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                                  STANDAR DISNAKERTRANS MIMIKA
                                </span>
                                <h4 className="text-sm font-bold text-white uppercase line-clamp-2">
                                  {prog.title}
                                </h4>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {prog.provider?.institutionName || 'Balai Vokasi Mimika'}
                                </span>
                              </div>
                            )}

                            {/* Overlay Badges on Flyer */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-900/90 text-white border border-neutral-700 backdrop-blur-xs">
                                {prog.programCode || 'PROG-SKILLHUB'}
                              </span>
                              {openBatches.some((b: any) => b.admissionPolicy === 'INSTANT_ADMISSION') && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-400 text-neutral-950 font-mono shadow-xs">
                                  ⚡ Penerimaan Langsung
                                </span>
                              )}
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-900/90 text-neutral-200 border border-neutral-700 backdrop-blur-xs">
                                {prog.deliveryMode}
                              </span>
                            </div>

                            <div className="absolute bottom-2.5 right-2.5">
                              {hasFree ? (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-600 text-white shadow-md font-mono">
                                  Gratis APBD
                                </span>
                              ) : minPrice !== Infinity ? (
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-white text-neutral-900 shadow-md">
                                  Rp {minPrice.toLocaleString('id-ID')}
                                </span>
                              ) : null}
                            </div>
                          </Link>

                          {/* Sisi Bawah: Konten Card & Lembaga */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
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
                            <Link href={`/talent/trainings/${prog.id}`}>
                              <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors leading-snug cursor-pointer">
                                {prog.title}
                              </h3>
                            </Link>

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

                            <Link
                              href={`/talent/trainings/${prog.id}`}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                            >
                              <span>Detail & Batch</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>

                  {/* KONTROL PAGINATION RESMI (SWISS ARCHITECTURAL STYLE) */}
                  <div className="bg-white border border-neutral-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    {/* Pemilih Jumlah Per Halaman & Info Ringkas */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono uppercase text-[11px] text-neutral-500 font-bold">Tampilkan:</span>
                        <div className="inline-flex border border-neutral-300">
                          {[6, 12, 24].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setItemsPerPage(size)}
                              className={`px-3 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                                itemsPerPage === size
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
                              } ${size !== 6 ? 'border-l border-neutral-300' : ''}`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <span className="text-neutral-400 hidden sm:inline">|</span>

                      <span className="text-[11px] font-mono text-neutral-500">
                        {startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredCatalog.length)} dari {filteredCatalog.length}
                      </span>
                    </div>

                    {/* Tombol Navigasi Halaman */}
                    {totalPages > 1 && (
                      <nav aria-label="Navigasi Halaman Katalog" className="flex items-center gap-1.5">
                        {/* Tombol Sebelumnya */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 border border-neutral-300 bg-white text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 hover:border-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Sebelumnya</span>
                        </button>

                        {/* Deretan Nomor Halaman */}
                        <div className="flex items-center gap-1">
                          {paginationPages.map((page, idx) => {
                            if (page === '...') {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="w-8 h-8 flex items-center justify-center text-xs text-neutral-400 font-mono select-none"
                                >
                                  ...
                                </span>
                              );
                            }
                            const isCurrent = page === currentPage;
                            return (
                              <button
                                key={page}
                                type="button"
                                onClick={() => handlePageChange(Number(page))}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold border transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        {/* Tombol Berikutnya */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 border border-neutral-300 bg-white text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 hover:border-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="hidden md:inline">Berikutnya</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </nav>
                    )}
                  </div>
                </>
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

                  const isAdmitted = enr.selectionStatus === 'ADMITTED';
                  const isPendingPayment = enr.selectionStatus === 'PENDING_PAYMENT';
                  const isRegistered = enr.selectionStatus === 'REGISTERED';
                  const isRejected = enr.selectionStatus === 'REJECTED_SELECTION' || enr.selectionStatus === 'REJECTED';

                  return (
                    <div key={enr.id} className="py-6 space-y-4 hover:bg-neutral-50/50 transition-colors">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {isGraduated ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono bg-emerald-50 text-emerald-900 border-emerald-300">
                                <Award className="w-3 h-3 text-emerald-700" />
                                LULUS PELATIHAN (BNSP/STTP)
                              </span>
                            ) : isAdmitted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono bg-emerald-50 text-emerald-900 border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                RESMI DITERIMA (KURSI TERKUNCI)
                              </span>
                            ) : isPendingPayment ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono bg-amber-50 text-amber-900 border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" />
                                MENUNGGU PEMBAYARAN
                              </span>
                            ) : isRegistered ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono bg-blue-50 text-blue-900 border-blue-300">
                                <Users className="w-3 h-3 text-blue-700" />
                                MENUNGGU SELEKSI KTP & WAWANCARA
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono bg-red-50 text-red-900 border-red-300">
                                <AlertCircle className="w-3 h-3 text-red-700" />
                                TIDAK LOLOS SELEKSI
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 border font-mono bg-neutral-100 text-neutral-800 border-neutral-300">
                                STATUS: {enr.selectionStatus || enr.status}
                              </span>
                            )}

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
                                `Halo ${picName}, saya ${profile?.fullName} ingin mengonfirmasi pendaftaran saya pada program ${enr.program?.title} (${enr.batch?.batchName || ''}).`
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

                      {/* Banner Pembayaran Mandiri */}
                      {isPendingPayment && (
                        <div className="p-4 bg-amber-50 border border-amber-300 text-neutral-900 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                            <CreditCard className="w-4 h-4 text-amber-700" />
                            <span>Instruksi Transfer & Konfirmasi Pembayaran</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white border border-amber-200 p-3">
                            <div>
                              <div className="text-[10px] text-neutral-500 uppercase">Rekening Tujuan</div>
                              <div className="font-bold text-neutral-900">{enr.batch?.bankName || 'BANK PAPUA'}</div>
                              <div className="font-mono text-neutral-800">{enr.batch?.bankAccountNumber || '-'}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-neutral-500 uppercase">Atas Nama</div>
                              <div className="font-bold text-neutral-900">{enr.batch?.bankAccountHolder || enr.program?.provider?.institutionName || 'Lembaga Pelatihan'}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-neutral-500 uppercase">Biaya Pendaftaran</div>
                              <div className="font-bold text-neutral-900 font-mono">
                                Rp {Number(enr.batch?.priceAmount || 0).toLocaleString('id-ID')}
                              </div>
                            </div>
                          </div>

                          {enr.batch?.paymentInstructions && (
                            <p className="text-xs text-neutral-600 bg-amber-100/60 p-2 border border-amber-200">
                              <strong>Catatan:</strong> {enr.batch.paymentInstructions}
                            </p>
                          )}

                          {/* Slip Upload / Preview Box */}
                          <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs">
                              {enr.paymentProofUrl ? (
                                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Slip transfer terunggah. Menunggu verifikasi kasir balai di Meja Seleksi.</span>
                                </div>
                              ) : (
                                <span className="text-amber-900 font-medium">
                                  Silakan unggah foto/tangkapan layar slip bukti transfer untuk mengunci kursi.
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {enr.paymentProofUrl && (
                                <a
                                  href={enr.paymentProofUrl.startsWith('http') ? enr.paymentProofUrl : `http://localhost:3000${enr.paymentProofUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 border border-neutral-300 bg-white text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat Slip</span>
                                </a>
                              )}

                              <label className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingSlipEnrollmentId === enr.id ? 'Mengunggah...' : enr.paymentProofUrl ? 'Ganti Slip' : 'Unggah Slip Bayar'}</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  disabled={uploadingSlipEnrollmentId === enr.id}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadPaymentProof(enr.id, file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Banner Jalur Gratis: Menunggu Verifikasi KTP */}
                      {isRegistered && (
                        <div className="p-3.5 bg-blue-50 border border-blue-300 text-blue-950 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 font-bold uppercase font-mono text-blue-900">
                            <Users className="w-4 h-4 text-blue-700" />
                            <span>Tahap Verifikasi Berkas KTP Mimika & Seleksi Fisik</span>
                          </div>
                          <p className="leading-relaxed">
                            Pendaftaran Anda telah tercatat pada sistem Balai. Silakan hubungi narahubung PIC Balai via WhatsApp atau datang langsung ke sekretariat balai untuk verifikasi fisik KTP Mimika dan jadwal seleksi wawancara sebelum kuota terpenuhi.
                          </p>
                        </div>
                      )}

                      {/* Banner Lolos Seleksi: Kursi Terkunci */}
                      {isAdmitted && (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 font-bold uppercase font-mono text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Selamat! Anda Resmi Diterima (ADMITTED)</span>
                          </div>
                          <p className="leading-relaxed">
                            Pendaftaran Anda telah divalidasi oleh Balai di Meja Seleksi. Kursi fisik workshop pelatihan Anda telah dikunci. Silakan ikuti petunjuk PIC Balai dan siapkan diri mengikuti jadwal pelatihan.
                          </p>
                        </div>
                      )}

                      {/* Banner Ditolak Seleksi */}
                      {isRejected && (
                        <div className="p-3.5 bg-neutral-100 border border-neutral-300 text-neutral-800 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 font-bold uppercase font-mono text-neutral-900">
                            <AlertCircle className="w-4 h-4 text-neutral-700" />
                            <span>Pendaftaran Tidak Lolos Seleksi</span>
                          </div>
                          <p className="leading-relaxed">
                            {enr.selectionNotes || 'Mohon maaf, kuota kursi telah terpenuhi atau persyaratan administratif belum sesuai. Anda dapat mendaftar pada batch kejuruan lainnya.'}
                          </p>
                        </div>
                      )}

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

      </div>

      <AlertModal {...alertProps} />
    </AppShell>
  );
}

export default function TalentTrainingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
          <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full shadow-sm">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
            <div className="text-xs font-bold uppercase tracking-widest text-neutral-600 font-mono">
              Memuat Katalog Pelatihan...
            </div>
          </div>
        </div>
      }
    >
      <TalentTrainingsContent />
    </Suspense>
  );
}
