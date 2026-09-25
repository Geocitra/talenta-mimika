'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import FlyerLightboxModal from '@/components/FlyerLightboxModal';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
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
  ShieldAlert,
  ShieldCheck,
  X,
  FileText,
  BadgeCheck,
  ClipboardCheck,
  Compass,
  AlertTriangle,
  HelpCircle,
  Maximize2,
  Download,
  ZoomIn,
  Eye,
} from 'lucide-react';

// =========================================================================
// 1. DATA MASTER 10 RUMPUN KEJURUAN RESMI (KEMNAKER RI)
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
    icon: FlameIcon,
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

function FlameIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
    </svg>
  );
}

const WELFARE_LABELS: Record<string, string> = {
  ASRAMA_MESS: 'Asrama / Mess Balai',
  MAKAN_3X: 'Makan 3x Sehari',
  UANG_SAKU: 'Bantuan Uang Saku / Transport',
  APD_LENGKAP: 'APD & Safety Tool Kit Lengkap',
  BPJS_MAGANG: 'Perlindungan BPJS Ketenagakerjaan (JKK & JKM)',
  MODUL_KIT: 'Buku Modul & Bahan Praktik',
};

const CERT_TYPE_LABELS: Record<string, string> = {
  KOMPETENSI_BNSP: 'Sertifikat Kompetensi BNSP (Garuda Emas)',
  PELATIHAN_STTP: 'STTP Pelatihan Balai Vokasi Kemnaker',
  LISENSI_K3_KEMNAKER: 'Lisensi K3 / SIO Kemnaker RI',
  KOMBINASI_LENGKAP: 'Kombinasi STTP + BNSP + K3',
};

export default function TalentTrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const programId = params?.id as string;

  // Core State
  const [profile, setProfile] = useState<any>(null);
  const [program, setProgram] = useState<any | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In-Page Tabs (Kemnaker Skillhub Standard)
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'BENEFITS' | 'REQUIREMENTS' | 'SYLLABUS' | 'PROVIDER' | 'BATCHES'
  >('OVERVIEW');

  const isClickScrolling = useRef(false);

  const scrollToSection = (targetId: string, tabId: any) => {
    isClickScrolling.current = true;
    setActiveTab(tabId);

    const navOffset = 130;
    let targetY = 0;

    if (tabId === 'BATCHES' && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      // Pada desktop, sidebar batch bersifat sticky di samping konten utama.
      // Gulir ke awal wadah utama agar kartu batch terlihat jelas di posisi atas.
      const container = document.getElementById('main-content-layout');
      if (container) {
        targetY = container.getBoundingClientRect().top + window.pageYOffset - navOffset;
      }
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        targetY = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
      }
    }

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });

    // Jika tab Batch diklik, berikan efek sorotan ring sesaat pada kartu pendaftaran
    if (tabId === 'BATCHES') {
      const batchEl = document.getElementById('section-batches');
      if (batchEl) {
        batchEl.classList.add('ring-4', 'ring-neutral-900', 'transition-all');
        setTimeout(() => {
          batchEl.classList.remove('ring-4', 'ring-neutral-900');
        }, 1800);
      }
    }

    // Buka kunci scroll listener setelah animasi scroll selesai
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const isMobile = window.innerWidth < 1024;
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;

      if (isAtBottom) {
        setActiveTab(isMobile ? 'BATCHES' : 'PROVIDER');
        return;
      }

      // Daftar seksi vertikal utama yang dipantau saat digulir
      const sections: { id: any; targetId: string }[] = [
        { id: 'OVERVIEW', targetId: 'section-overview' },
        { id: 'BENEFITS', targetId: 'section-benefits' },
        { id: 'REQUIREMENTS', targetId: 'section-requirements' },
        { id: 'SYLLABUS', targetId: 'section-syllabus' },
        { id: 'PROVIDER', targetId: 'section-provider' },
      ];

      // Pada tampilan mobile, batch ada di bagian paling bawah
      if (isMobile) {
        sections.push({ id: 'BATCHES', targetId: 'section-batches' });
      }

      const threshold = 200;
      let matchedTab: any = null;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            matchedTab = sections[i].id;
            break;
          }
        }
      }

      if (matchedTab) {
        setActiveTab(matchedTab);
      } else {
        // Jika kursor berada di atas seksi 1 (misalnya di area flyer atau hero header)
        setActiveTab('OVERVIEW');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Inisialisasi posisi awal saat halaman pertama kali dimuat
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modal State: Konfirmasi Pendaftaran Batch
  const [enrollModalBatch, setEnrollModalBatch] = useState<any | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Modal State: WhatsApp Hand-Off Berhasil
  const [whatsAppOutreachModal, setWhatsAppOutreachModal] = useState<any | null>(null);

  // Modal State: Lightbox Flyer Penuh (Shopee Style)
  const [showFlyerLightbox, setShowFlyerLightbox] = useState(false);

  useEffect(() => {
    if (programId) {
      loadData();
    }
  }, [programId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Validasi Autentikasi Talenta
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

      // 2. Fetch Program Detail & Status Pendaftaran Saya
      const [programRes, enrollRes] = await Promise.all([
        apiFetch(`/trainings/${programId}`),
        apiFetch('/trainings/my/enrollments'),
      ]);

      if (programRes.status === 'success') {
        setProgram(programRes.data);
      } else {
        setError(programRes.message || 'Program pelatihan tidak ditemukan.');
      }

      if (enrollRes.status === 'success') {
        setMyEnrollments(enrollRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data program pelatihan.');
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah talent sudah terdaftar pada salah satu batch program ini
  const existingEnrollment = useMemo(() => {
    if (!myEnrollments || !programId) return null;
    return myEnrollments.find(
      (enr) => enr.programId === programId || enr.batch?.programId === programId
    );
  }, [myEnrollments, programId]);

  // Eksekusi Pendaftaran Batch & WhatsApp Hand-Off
  const handleConfirmBatchEnrollment = async () => {
    if (!enrollModalBatch || !program) return;

    setEnrolling(true);
    try {
      const res = await apiFetch(
        `/trainings/${program.id}/batches/${enrollModalBatch.id}/enroll`,
        {
          method: 'POST',
        }
      );

      if (res.status === 'success') {
        const outreachData = res.data?.whatsAppOutreach || {
          picName: program.provider?.picName || 'Admin Pendaftaran',
          picPhone: program.provider?.picPhone || '',
          draftMessage: `Halo ${program.provider?.picName || 'Bapak/Ibu'}, saya ${profile?.fullName} (NIK: ${profile?.nik}) telah mendaftar di program ${program.title} (${enrollModalBatch.batchName}) melalui platform Mimika Talenta. Mohon arahan untuk verifikasi berkas dan seleksi wawancara selanjutnya. Terima kasih.`,
          whatsAppDirectUrl: program.provider?.picPhone
            ? `https://wa.me/${program.provider.picPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Halo ${program.provider?.picName || 'Bapak/Ibu'}, saya ${profile?.fullName} (NIK: ${profile?.nik}) telah mendaftar di program ${program.title} (${enrollModalBatch.batchName}) melalui platform Mimika Talenta. Mohon arahan untuk verifikasi berkas dan seleksi wawancara selanjutnya. Terima kasih.`
              )}`
            : '#',
        };

        setEnrollModalBatch(null);

        setWhatsAppOutreachModal({
          programTitle: program.title,
          batchName: enrollModalBatch.batchName,
          institutionName:
            program.provider?.institutionName || program.providerName || 'Balai Pelatihan Terdaftar',
          admissionPolicy: enrollModalBatch.admissionPolicy || 'CURATED_SELECTION',
          enrollmentStatus: res.data?.status || (enrollModalBatch.admissionPolicy === 'INSTANT_ADMISSION' ? 'ADMITTED' : 'REGISTERED'),
          outreach: outreachData,
        });

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

  const categoryMeta = useMemo(() => {
    if (!program) return null;
    return (
      KEJURUAN_CATEGORIES.find((c) => c.id === program.category) || {
        id: program.category,
        name: program.category || 'Vokasi Terapan',
        description: 'Standardisasi Kejuruan Tenaga Kerja',
        icon: GraduationCap,
      }
    );
  }, [program]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full shadow-sm">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600 font-mono">
            Memuat Standar Pelatihan Skillhub...
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <AppShell userRole="TALENT" userName={profile?.fullName || 'Kandidat'}>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold uppercase text-neutral-900 font-mono">
            Program Pelatihan Tidak Ditemukan
          </h2>
          <p className="text-xs text-neutral-600 max-w-md mx-auto">
            {error || 'Program ini mungkin telah ditarik oleh balai penyelenggara atau tautan sudah tidak berlaku.'}
          </p>
          <Link
            href="/talent/trainings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Pelatihan</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const CategoryIcon = categoryMeta?.icon || GraduationCap;
  const batches = program.batches || [];
  const openBatches = batches.filter((b: any) => b.isOpen);
  const hasFreeBatch = openBatches.some(
    (b: any) => b.fundingType === 'GRATIS_APBD_MIMIKA' || b.fundingType === 'BEASISWA_CSR'
  );

  return (
    <AppShell userRole="TALENT" userName={profile?.fullName || 'Kandidat'}>
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS & TOMBOL KEMBALI                                           */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <nav className="flex items-center gap-2 text-xs font-mono text-neutral-500 overflow-x-auto py-1">
            <Link
              href="/talent/trainings"
              className="hover:text-neutral-900 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Katalog Pelatihan</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-neutral-700 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {categoryMeta?.name}
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-neutral-900 font-bold truncate max-w-[200px] sm:max-w-md">
              {program.title}
            </span>
          </nav>

          <Link
            href="/talent/trainings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-neutral-900 hover:border-neutral-900 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* BANNER FLYER RESMI PELATIHAN (SHOPEE BILLBOARD - FULL ASPECT RATIO)       */}
        {/* ========================================================================= */}
        <section className="bg-neutral-950 border border-neutral-300 overflow-hidden shadow-xs relative">
          {/* Subtle Ambient Blurred Backdrop untuk estetika & kontinuitas visual */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-105 pointer-events-none"
            style={{
              backgroundImage: `url(${getFullMediaUrl(program.coverImageUrl || '/images/flyers/alat_berat_flyer.jpg')})`,
            }}
          />

          <div
            onClick={() => setShowFlyerLightbox(true)}
            title="Klik untuk memperbesar flyer poster"
            className="relative z-10 w-full aspect-[16/9] max-h-[720px] overflow-hidden select-none flex items-center justify-center cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFullMediaUrl(program.coverImageUrl || '/images/flyers/alat_berat_flyer.jpg')}
              alt={program.title}
              className="w-full h-full object-contain object-center group-hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. HERO HEADER (KEMNAKER SKILLHUB OFFICIAL BANNER)                        */}
        {/* ========================================================================= */}
        <header className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Baris Badge Kemnaker */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-neutral-900 text-white uppercase tracking-wider">
              {program.programCode || 'SKILLHUB-PROG'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
              <CategoryIcon className="w-3.5 h-3.5 text-neutral-700" />
              <span>{categoryMeta?.name}</span>
            </div>
            <span className="text-[11px] font-bold uppercase px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-300">
              Moda: {program.deliveryMode}
            </span>
            {hasFreeBatch ? (
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300">
                Didanai Penuh APBD Kab. Mimika
              </span>
            ) : (
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300">
                Mandiri / Subsidi Mitra
              </span>
            )}
            <span className="text-[11px] font-mono text-neutral-500 border border-neutral-200 px-2 py-1">
              Standar SKKNI Kemnaker RI
            </span>
          </div>

          {/* Judul & Penyelenggara */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900 leading-tight">
              {program.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-neutral-500" />
                <span className="font-bold text-neutral-900">
                  {program.provider?.institutionName || program.providerName || 'Balai Vokasi Mimika'}
                </span>
              </div>

              {program.provider?.vinNumber && (
                <div className="flex items-center gap-1 font-mono text-[11px] bg-neutral-50 border border-neutral-200 px-2 py-0.5 text-neutral-700">
                  <span>VIN:</span>
                  <strong>{program.provider.vinNumber}</strong>
                </div>
              )}

              {program.provider?.accreditation && (
                <div className="flex items-center gap-1 font-mono text-[11px] bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-emerald-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Akreditasi: {program.provider.accreditation.replace(/_/g, ' ')}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{program.provider?.address || 'Kabupaten Mimika, Papua Tengah'}</span>
              </div>
            </div>
          </div>

          {/* Baris Metrik Kunci Standar Kemnaker (4 Kotak) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-neutral-200">
            <div className="p-3 bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                Durasi Pelatihan
              </span>
              <div className="text-sm font-bold text-neutral-900 font-mono mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span>{program.durationDays || 30} Hari ({program.totalLessonHours || 120} JP)</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                Sertifikasi Akhir
              </span>
              <div className="text-sm font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5 truncate">
                <Award className="w-4 h-4 text-neutral-600 shrink-0" />
                <span className="truncate">
                  {CERT_TYPE_LABELS[program.certificateType] || 'BNSP / STTP'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                Ketersediaan Batch
              </span>
              <div className="text-sm font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neutral-600" />
                <span>
                  {openBatches.length > 0
                    ? `${openBatches.length} Gelombang Aktif`
                    : 'Segera Dibuka'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                Status Talenta Anda
              </span>
              <div className="text-sm font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                {existingEnrollment ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terdaftar ({existingEnrollment.batch?.batchName || 'Aktif'})</span>
                  </span>
                ) : (
                  <span className="text-neutral-700">Belum Mendaftar</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. IN-PAGE TABS NAVIGATION (SKILLHUB STYLE)                                */}
        {/* ========================================================================= */}
        <div className="sticky top-16 z-40 bg-white border border-neutral-300 shadow-xs flex overflow-x-auto text-xs font-mono font-bold uppercase">
          {[
            { id: 'OVERVIEW', targetId: 'section-overview', label: '1. Tentang Pelatihan', icon: BookOpen },
            { id: 'BENEFITS', targetId: 'section-benefits', label: '2. Manfaat & Fasilitas', icon: Award },
            { id: 'REQUIREMENTS', targetId: 'section-requirements', label: '3. Persyaratan & Alur Seleksi', icon: Users },
            { id: 'SYLLABUS', targetId: 'section-syllabus', label: '4. Kurikulum & Unit SKKNI', icon: Layers },
            { id: 'PROVIDER', targetId: 'section-provider', label: '5. Penyelenggara & Lokasi', icon: Building2 },
            { id: 'BATCHES', targetId: 'section-batches', label: `6. Gelombang Batch (${batches.length})`, icon: Calendar },
          ].map((t) => {
            const TabIcon = t.icon;
            const isCurrent = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollToSection(t.targetId, t.id)}
                className={`py-3.5 px-4 text-center border-r border-neutral-200 last:border-r-0 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 4. MAIN LAYOUT: KOLOM KIRI (DETAIL) + KOLOM KANAN (STICKY SIDEBAR BATCH)  */}
        {/* ========================================================================= */}
        <div id="main-content-layout" className="flex flex-col lg:flex-row items-start gap-8">
          {/* ======================================================================= */}
          {/* KOLOM KIRI: KONTEN LENGKAP STANDAR KEMNAKER SKILLHUB                    */}
          {/* ======================================================================= */}
          <main className="w-full lg:flex-1 space-y-8">
            {/* SEKSI 1: TENTANG & GAMBARAN PELATIHAN */}
            <section id="section-overview" className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neutral-900" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Gambaran & Deskripsi Pelatihan
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Kurikulum Vokasi
                </span>
              </div>

              <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {program.description ||
                  'Program pelatihan vokasi kejuruan terapan ini diselenggarakan untuk meningkatkan daya saing, profesionalisme, dan kesiapan tenaga kerja lokal Kabupaten Mimika agar memenuhi standar kualifikasi industri pertambangan, logistik, dan infrastruktur strategis.'}
              </div>

              {/* Box Tujuan Pelatihan */}
              <div className="p-5 bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="text-xs font-bold uppercase text-neutral-900 font-mono flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-neutral-800" />
                  <span>Tujuan & Sasaran Pelatihan:</span>
                </div>
                <ul className="space-y-2 text-xs text-neutral-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Menguasai prosedur operasional standar (SOP) dan aspek K3 keselamatan kerja sesuai regulasi ESDM / Kemnaker.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Mampu mempraktikkan keterampilan teknis terukur dengan peralatan standar industri berat di bengkel kerja.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Mempersiapkan peserta untuk lulus uji kompetensi skema BNSP dengan predikat Kompeten (K).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Memfasilitasi penyerapan kerja langsung pada perusahaan kontraktor & mitra Disnakertrans Mimika.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SEKSI 2: MANFAAT & FASILITAS YANG DITERIMA */}
            <section id="section-benefits" className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-neutral-900" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Manfaat & Fasilitas yang Diterima Peserta
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase font-bold">
                  Paket Lengkap Kemnaker
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Uang Saku & Bantuan Transport',
                    desc: 'Dukungan bantuan transport harian selama masa pelatihan berlangsung untuk meringankan mobilitas peserta.',
                  },
                  {
                    title: 'Makan Siang & Konsumsi',
                    desc: 'Disediakan makan siang harian dan coffee break selama sesi teori maupun praktik bengkel kerja di balai.',
                  },
                  {
                    title: 'Perlindungan BPJS Ketenagakerjaan',
                    desc: 'Dilindungi jaminan kecelakaan kerja (JKK) dan jaminan kematian (JKM) kategori Bukan Penerima Upah / Magang.',
                  },
                  {
                    title: 'Seragam & Alat Pelindung Diri (APD)',
                    desc: 'Setiap siswa mendapatkan baju seragam workshop, safety helmet, kacamata pelindung, dan sarung tangan kerja.',
                  },
                  {
                    title: 'Sertifikat Kompetensi BNSP Garuda Emas',
                    desc: 'Sertifikat nasional berlogo Garuda Emas yang diakui oleh seluruh industri tambang, migas, dan manufaktur RI.',
                  },
                  {
                    title: 'Fasilitas OJT & Radar Rekrutmen AI',
                    desc: 'Penyaluran on-the-job training serta profil talenta otomatis terhubung ke radar pencarian HRD perusahaan.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-50 border border-neutral-200 space-y-2 hover:border-neutral-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-wider">
                        FASILITAS {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-neutral-600 uppercase bg-white border border-neutral-200 px-1.5 py-0.5">
                        TERSEDIA
                      </span>
                    </div>
                    <div className="font-bold uppercase text-neutral-900 text-xs">{item.title}</div>
                    <p className="text-neutral-600 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SEKSI 3: PERSYARATAN & ALUR SELEKSI */}
            <section id="section-requirements" className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-900" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Persyaratan & Alur Seleksi
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Kriteria & Prosedur
                </span>
              </div>

              {/* ALUR 6 TAHAP PENDAFTARAN & SELEKSI STANDAR KEMNAKER RI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-neutral-900" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                      Alur Resmi Pendaftaran & Seleksi (Standar SIAPkerja)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    6 Tahapan Seleksi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    {
                      step: '01',
                      title: 'Lengkapi Profil Talenta',
                      desc: 'Pastikan data KTP/NIK Mimika, riwayat pendidikan, dan nomor WhatsApp telah lengkap & valid di akun Anda.',
                    },
                    {
                      step: '02',
                      title: 'Pilih Gelombang Batch',
                      desc: 'Pilih jadwal pelaksanaan pelatihan yang sesuai pada panel sisi kanan dan ajukan pendaftaran resmi.',
                    },
                    {
                      step: '03',
                      title: 'Verifikasi Administrasi',
                      desc: 'Tim kurator Balai & Disnakertrans melakukan verifikasi keaslian dokumen dan kriteria prioritas tenaga kerja lokal.',
                    },
                    {
                      step: '04',
                      title: 'Seleksi Wawancara',
                      desc: 'Peserta terpilih akan diundang wawancara langsung/online di balai untuk penentuan kuota akhir kelas.',
                    },
                    {
                      step: '05',
                      title: 'Pelatihan Teori & Praktik',
                      desc: 'Mengikuti jam pelajaran intensif di workshop dengan peralatan industri dan bimbingan instruktur berlisensi.',
                    },
                    {
                      step: '06',
                      title: 'Uji BNSP & Saluran Karir',
                      desc: 'Uji kompetensi resmi Badan Nasional Sertifikasi Profesi (BNSP) dan integrasi langsung ke radar AI rekruter.',
                    },
                  ].map((st) => (
                    <div key={st.step} className="p-3.5 bg-neutral-50 border border-neutral-200 space-y-1">
                      <div className="font-mono text-xs font-bold text-neutral-400">
                        LANGKAH {st.step}
                      </div>
                      <div className="font-bold text-neutral-900 uppercase">{st.title}</div>
                      <p className="text-neutral-600 text-[11px] leading-relaxed">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syarat & Dokumen */}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <div className="text-xs font-bold uppercase text-neutral-900 font-mono">
                  Syarat Kualifikasi & Dokumen Pendaftaran:
                </div>

                {program.requirements ? (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line font-sans">
                    {program.requirements}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="font-bold uppercase text-neutral-900 font-mono">Persyaratan Umum:</div>
                      <ul className="space-y-1.5 text-neutral-600">
                        <li>• Talent berdomisili di Kabupaten Mimika (WNI).</li>
                        <li>• Usia minimal 18 tahun saat pendaftaran dibuka.</li>
                        <li>• Pendidikan minimal SMA/SMK/D3/S1 sederajat.</li>
                        <li>• Tidak sedang terikat hubungan kerja formal atau kuliah reguler aktif.</li>
                        <li>• Sehat jasmani dan rohani, tidak buta warna (untuk kejuruan teknis).</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="font-bold uppercase text-neutral-900 font-mono">Kelengkapan Dokumen Fisik:</div>
                      <ul className="space-y-1.5 text-neutral-600">
                        <li>• Fotokopi KTP / Surat Domisili Kabupaten Mimika.</li>
                        <li>• Fotokopi Ijazah terakhir & Transkrip Nilai.</li>
                        <li>• Pas foto ukuran 3x4 latar belakang merah (2 lembar).</li>
                        <li>• Surat Pernyataan bersedia mengikuti pelatihan sampai tuntas (disediakan balai).</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SEKSI 4: KURIKULUM, SILABUS & UNIT KOMPETENSI SKKNI */}
            <section id="section-syllabus" className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-900" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Kurikulum & Unit Kompetensi SKKNI
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Standar Kompetensi Kerja
                </span>
              </div>

              {/* Target Keahlian Pills */}
              {Array.isArray(program.targetSkills) && program.targetSkills.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase text-neutral-800 font-mono">
                    Unit Keahlian SKKNI yang Dikuasai:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {program.targetSkills.map((sk: any, idx: number) => {
                      const skillName = typeof sk === 'string' ? sk : sk?.name || 'Kompetensi Vokasi';
                      const skillLevel = typeof sk === 'object' && sk?.level ? sk.level : 'Standar Industri';
                      return (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold flex items-center gap-2"
                        >
                          <Award className="w-3.5 h-3.5 text-neutral-600" />
                          <span>{skillName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-neutral-200 text-neutral-500">
                            {skillLevel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Silabus Teks Pokok Bahasan */}
              {program.syllabus && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase text-neutral-800 font-mono">
                    Pokok Bahasan & Silabus Kurikulum:
                  </div>
                  <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed whitespace-pre-line font-mono">
                    {program.syllabus}
                  </div>
                </div>
              )}

              {/* Daftar Sesi Modul (Jika Ada) */}
              {Array.isArray(program.sessions) && program.sessions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase text-neutral-800 font-mono flex items-center justify-between">
                    <span>Modul Pembelajaran ({program.sessions.length} Sesi Terstruktur):</span>
                    <span className="text-[11px] text-neutral-500 font-normal">
                      Tersedia di Ruang Belajar Online Balai
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-200 border border-neutral-200">
                    {program.sessions.map((sess: any) => (
                      <div key={sess.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-neutral-400 font-bold w-6">
                            #{sess.sessionOrder}
                          </span>
                          <span className="font-semibold text-neutral-900">{sess.title}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                          <span>{sess.contentType}</span>
                          {sess.hasCheckpointQuiz && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                              Kuis Sesi
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* SEKSI 5: PROFIL LEMBAGA PENYELENGGARA & KONTAK */}
            <section id="section-provider" className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-900" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                    Lembaga Pelatihan Penyelenggara
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Tervalidasi Kemnaker
                </span>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-900 text-white uppercase">
                      {program.provider?.institutionType?.replace(/_/g, ' ') || 'LEMBAGA VOKASI TERDAFTAR'}
                    </span>
                    <h3 className="text-lg font-bold uppercase text-neutral-900 mt-1.5">
                      {program.provider?.institutionName || program.providerName || 'Balai Latihan Kerja Mimika'}
                    </h3>
                  </div>

                  {program.provider?.accreditation && (
                    <span className="text-xs font-bold uppercase px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto font-mono">
                      Akreditasi: {program.provider.accreditation.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-700 font-mono text-xs border-y border-neutral-200 py-3">
                  <div>
                    <span className="text-neutral-500">Nomor Izin VIN Kemnaker: </span>
                    <strong className="text-neutral-900">
                      {program.provider?.vinNumber || 'Tervalidasi Disnaker Mimika'}
                    </strong>
                  </div>
                  {program.provider?.bnspLicenseNumber && (
                    <div>
                      <span className="text-neutral-500">Lisensi BNSP: </span>
                      <strong className="text-neutral-900">
                        {program.provider.bnspLicenseNumber}
                      </strong>
                    </div>
                  )}
                </div>

                <p className="text-neutral-600 text-xs leading-relaxed">
                  {program.provider?.institutionBio ||
                    'Lembaga pelatihan kerja mitra resmi Disnakertrans Kabupaten Mimika dengan fasilitas bengkel kerja terakreditasi untuk mencetak tenaga kerja lokal berdaya saing tinggi di sektor industri pertambangan dan jasa.'}
                </p>

                {/* Lokasi & Narahubung */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="space-y-1.5 border border-neutral-200 bg-white p-3.5">
                    <div className="font-bold text-neutral-900 uppercase font-mono flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Alamat Workshop / Balai:</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      {program.provider?.address || 'Jl. Cenderawasih, Timika, Kabupaten Mimika, Papua Tengah'}
                    </p>
                  </div>

                  <div className="space-y-1.5 border border-neutral-200 bg-white p-3.5">
                    <div className="font-bold text-neutral-900 uppercase font-mono flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Narahubung Resmi PIC:</span>
                    </div>
                    <div className="text-neutral-800 font-semibold">
                      {program.provider?.picName || 'Koordinator Pelatihan'}
                      {program.provider?.picRole ? ` (${program.provider.picRole})` : ''}
                    </div>
                    {program.provider?.picPhone && (
                      <div className="pt-1">
                        <a
                          href={`https://wa.me/${program.provider.picPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Halo ${program.provider?.picName || 'Admin Balai'}, saya ingin menanyakan informasi pendaftaran pelatihan ${program.title}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat WhatsApp PIC ({program.provider.picPhone})</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* ======================================================================= */}
          {/* KOLOM KANAN: STICKY SIDEBAR BATCH & PENDAFTARAN RESMI                   */}
          {/* ======================================================================= */}
          <aside id="section-batches" className="w-full lg:w-96 shrink-0 space-y-6 lg:sticky lg:top-32">
            {/* CARD 1: PANEL GELOMBANG BATCH & PENDAFTARAN */}
            <div className="bg-white border-2 border-neutral-900 p-6 space-y-5 shadow-sm">
              <div className="space-y-1 border-b border-neutral-200 pb-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  Pendaftaran Gelombang Pelatihan
                </div>
                <div className="text-lg font-extrabold uppercase text-neutral-900 font-mono flex items-center justify-between">
                  <span>Jadwal & Kuota</span>
                  {hasFreeBatch ? (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                      GRATIS (APBD)
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300">
                      Mandiri
                    </span>
                  )}
                </div>
              </div>

              {batches.length === 0 ? (
                <div className="p-6 text-center bg-neutral-50 border border-neutral-200 space-y-2">
                  <Clock className="w-6 h-6 text-neutral-400 mx-auto" />
                  <div className="text-xs font-bold uppercase text-neutral-800">
                    Belum Ada Batch Terbuka
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Lembaga penyelenggara belum menjadwalkan gelombang baru untuk program ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch: any) => {
                    const isFree =
                      batch.fundingType === 'GRATIS_APBD_MIMIKA' ||
                      batch.fundingType === 'BEASISWA_CSR';
                    const enrollmentsCount = batch._count?.enrollments || 0;
                    const seatsLeft = Math.max(0, batch.quota - enrollmentsCount);
                    const isMyBatch =
                      existingEnrollment &&
                      (existingEnrollment.batchId === batch.id ||
                        existingEnrollment.batch?.id === batch.id);

                    return (
                      <div
                        key={batch.id}
                        className={`p-4 border transition-all space-y-3 ${
                          isMyBatch
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : batch.isOpen
                            ? 'border-neutral-300 hover:border-neutral-900 bg-white'
                            : 'border-neutral-200 bg-neutral-50 opacity-60'
                        }`}
                      >
                        {/* Header Batch */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold uppercase text-neutral-900 text-xs flex items-center gap-1.5">
                              <span>{batch.batchName}</span>
                              {isMyBatch && (
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-emerald-700 text-white font-mono">
                                  Terdaftar
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                              Metode: <strong>{batch.trainingMethod}</strong>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                              isFree
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-neutral-100 text-neutral-800 border-neutral-300 font-mono'
                            }`}
                          >
                            {isFree
                              ? 'Gratis APBD'
                              : `Rp ${(Number(batch.priceAmount) || 0).toLocaleString('id-ID')}`}
                          </span>
                        </div>

                        {/* Kebijakan Penerimaan & Seleksi */}
                        <div className="pt-2 border-t border-neutral-100 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {batch.admissionPolicy === 'INSTANT_ADMISSION' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 font-mono">
                                <Zap className="w-3 h-3 text-amber-600" />
                                <span>Penerimaan Langsung (Instant)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-sky-50 text-sky-900 border border-sky-300 font-mono">
                                <ClipboardCheck className="w-3 h-3 text-sky-600" />
                                <span>Kurasi Berkas & Wawancara</span>
                              </span>
                            )}
                          </div>
                          {batch.admissionPolicy === 'CURATED_SELECTION' && batch.announcementDate && (
                            <div className="text-[10px] text-neutral-600 font-mono flex items-center gap-1">
                              <span className="text-neutral-400">Hasil Pengumuman:</span>
                              <strong>
                                {new Date(batch.announcementDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Jadwal Pelaksanaan */}
                        <div className="text-[11px] text-neutral-600 font-mono space-y-1 border-t border-neutral-100 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>
                              {new Date(batch.startDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              s/d{' '}
                              {new Date(batch.endDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Sisa Kuota:</span>
                            <span className="font-bold text-neutral-900">
                              {seatsLeft} dari {batch.quota} kursi
                            </span>
                          </div>

                          {/* Progress Bar Kuota */}
                          <div className="w-full bg-neutral-200 h-1.5 rounded-none overflow-hidden">
                            <div
                              className={`h-full ${
                                seatsLeft <= 3 ? 'bg-rose-500' : 'bg-neutral-900'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(((batch.quota - seatsLeft) / (batch.quota || 1)) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Fasilitas Spesifik Batch */}
                        {Array.isArray(batch.welfareBenefits) && batch.welfareBenefits.length > 0 && (
                          <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1">
                            {batch.welfareBenefits.map((wId: string) => (
                              <span
                                key={wId}
                                className="text-[9px] px-1 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200"
                              >
                                ✓ {WELFARE_LABELS[wId] || wId}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Tombol Aksi Pendaftaran */}
                        <div className="pt-2">
                          {isMyBatch ? (
                            <div className="space-y-2">
                              <div className="w-full py-2 bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 font-mono">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Pendaftaran Anda Aktif</span>
                              </div>
                              {program.sessions && program.sessions.length > 0 && (
                                <Link
                                  href={`/talent/trainings/${program.id}/learn`}
                                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <span>Buka Ruang Belajar (LMS)</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          ) : batch.isOpen && seatsLeft > 0 ? (
                            <button
                              type="button"
                              onClick={() => setEnrollModalBatch(batch)}
                              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <span>Daftar Gelombang Ini</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-full py-2 bg-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider text-center font-mono">
                              {seatsLeft <= 0 ? 'Kuota Penuh' : 'Pendaftaran Tutup'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CARD 2: THE CLOSED-LOOP SYNERGY (RADAR AI KEMNAKER & DISNAKER) */}
            <div className="bg-neutral-900 text-white p-6 space-y-4 border border-neutral-800 shadow-sm">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase font-mono text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>The Closed-Loop Synergy</span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white leading-snug">
                Dampak Kelulusan Pelatihan ke Radar Pencarian Kerja HRD
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed">
                Kelulusan dari program ini diinjeksi secara resmi oleh Disnakertrans ke sistem algoritma talent matching:
              </p>

              <div className="space-y-2.5 pt-2 border-t border-neutral-800 text-xs">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-200">
                    <strong>Skor Radar AI +35%:</strong> Vektor keahlian Anda langsung naik drastis pada lowongan industri tambang.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-200">
                    <strong>Verifikasi Garuda Emas:</strong> Sertifikat BNSP divalidasi langsung tanpa risiko berkas diragukan.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-200">
                    <strong>Akses Komunikasi Langsung:</strong> Profil Anda diprioritaskan saat perusahaan melakukan panggilan wawancara.
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: BANTUAN & FAQ PENDAFTARAN */}
            <div className="bg-white border border-neutral-300 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold uppercase text-neutral-900 font-mono">
                <HelpCircle className="w-4 h-4 text-neutral-700" />
                <span>Butuh Bantuan Pendaftaran?</span>
              </div>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                Jika mengalami kendala teknis atau pertanyaan syarat fisik, kunjungi kantor Disnakertrans Kabupaten Mimika atau hubungi narahubung balai pelatihan kerja.
              </p>
              <div className="pt-1 text-[11px] font-mono text-neutral-500">
                Jam Layanan: Senin - Jumat (08:00 - 15:30 WIT)
              </div>
            </div>
          </aside>
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: KONFIRMASI PENDAFTARAN BATCH RESMI                               */}
        {/* ========================================================================= */}
        {enrollModalBatch && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-400 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-900 font-mono flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-neutral-900" />
                  <span>Konfirmasi Pendaftaran Pelatihan</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEnrollModalBatch(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-700">
                <div className="bg-neutral-50 p-3.5 border border-neutral-200 space-y-1.5">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">
                    Program & Gelombang yang Dipilih:
                  </div>
                  <div className="font-bold text-neutral-900 text-sm uppercase">{program.title}</div>
                  <div className="text-[11px] text-neutral-600 font-mono">
                    Gelombang: <strong>{enrollModalBatch.batchName}</strong> ({enrollModalBatch.trainingMethod})
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold font-mono">
                    Skema:{' '}
                    {enrollModalBatch.fundingType === 'GRATIS_APBD_MIMIKA' ||
                    enrollModalBatch.fundingType === 'BEASISWA_CSR'
                      ? 'Gratis (Didanai APBD Pemkab Mimika / CSR)'
                      : `Rp ${(Number(enrollModalBatch.priceAmount) || 0).toLocaleString('id-ID')}`}
                  </div>
                  <div className="text-[11px] font-mono pt-0.5">
                    Kebijakan Penerimaan:{' '}
                    {enrollModalBatch.admissionPolicy === 'INSTANT_ADMISSION' ? (
                      <span className="text-amber-800 font-bold">⚡ Penerimaan Langsung (First-Come, First-Served)</span>
                    ) : (
                      <span className="text-sky-800 font-bold">📋 Melalui Seleksi Berkas & Wawancara</span>
                    )}
                  </div>
                </div>

                <div className="border border-neutral-200 p-3.5 space-y-1.5 font-mono text-[11px]">
                  <div className="font-bold text-neutral-900 uppercase">
                    Identitas Pendaftar (Sesuai Akun Talenta):
                  </div>
                  <div>Nama Lengkap: <strong>{profile?.fullName}</strong></div>
                  <div>NIK: <strong>{profile?.nik}</strong></div>
                  <div>No. WhatsApp: <strong>{profile?.phoneNumber || '-'}</strong></div>
                  <div>Email: <strong>{profile?.user?.email || '-'}</strong></div>
                </div>

                <div className={`p-3 border text-[11px] leading-relaxed ${
                  enrollModalBatch.fundingType === 'MANDIRI_BERBAYAR'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-sky-50 border-sky-200 text-sky-950'
                }`}>
                  <strong>Alur Pendaftaran:</strong>{' '}
                  {enrollModalBatch.fundingType === 'MANDIRI_BERBAYAR'
                    ? 'Program ini merupakan Jalur Mandiri Berbayar. Setelah mengirim formulir, Anda diarahkan melakukan transfer ke rekening resmi balai dan mengunggah slip pembayaran. Kursi fisik workshop akan dikunci setelah balai memvalidasi pelunasan.'
                    : 'Program ini merupakan Jalur Beasiswa / APBD Mimika. Data pendaftaran Anda akan diverifikasi oleh Balai (KTP Kabupaten Mimika & tes fisik/wawancara). Kursi fisik workshop akan dikunci setelah Anda dinyatakan lolos oleh Balai di Meja Seleksi.'}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={() => setEnrollModalBatch(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={handleConfirmBatchEnrollment}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <span>{enrolling ? 'Mendaftarkan...' : 'Kirim Pendaftaran Resmi'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: WHATSAPP HAND-OFF LANGSUNG KE PIC BALAI                          */}
        {/* ========================================================================= */}
        {whatsAppOutreachModal && (
          <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-400 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="text-center space-y-2">
                <div className={`w-12 h-12 border flex items-center justify-center mx-auto ${
                  whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT'
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-blue-100 border-blue-300 text-blue-800'
                }`}>
                  {whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT' ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 font-mono">
                  {whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT'
                    ? 'Pendaftaran Berhasil: Menunggu Pembayaran'
                    : 'Pendaftaran Berhasil: Menunggu Seleksi Balai'}
                </h3>
                <p className="text-xs text-neutral-600">
                  Data Anda resmi terdaftar pada gelombang <strong>{whatsAppOutreachModal.batchName}</strong> ({whatsAppOutreachModal.programTitle}).
                </p>
              </div>

              <div className={`p-4 space-y-3 text-xs border ${
                whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : 'bg-blue-50 border-blue-300 text-blue-950'
              }`}>
                <div className="flex items-center gap-2 font-bold uppercase font-mono">
                  <MessageCircle className={`w-4 h-4 ${
                    whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT' ? 'text-amber-700' : 'text-blue-700'
                  }`} />
                  <span>
                    {whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT'
                      ? 'Tahap Selanjutnya: Transfer & Konfirmasi PIC'
                      : 'Tahap Selanjutnya: Hubungi Narahubung Lembaga'}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {whatsAppOutreachModal.enrollmentStatus === 'PENDING_PAYMENT'
                    ? `Silakan lakukan pembayaran sesuai petunjuk dan hubungi PIC ${whatsAppOutreachModal.institutionName} via WhatsApp untuk validasi slip transfer:`
                    : `Silakan hubungi PIC ${whatsAppOutreachModal.institutionName} via WhatsApp untuk koordinasi jadwal verifikasi fisik KTP Mimika & wawancara:`}
                </p>

                <div className="p-3 bg-white border border-neutral-200 font-mono text-[11px] text-neutral-700 whitespace-pre-line">
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
                    <span>Buka WhatsApp Narahubung Sekarang</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppOutreachModal(null);
                    router.push('/talent/trainings?tab=MY_ENROLLMENTS');
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Lihat Status di Dasbor Pelatihan Saya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertModal {...alertProps} />

      {/* Shopee-Style Fullscreen Lightbox Modal */}
      <FlyerLightboxModal
        isOpen={showFlyerLightbox}
        onClose={() => setShowFlyerLightbox(false)}
        imageUrl={getFullMediaUrl(program.coverImageUrl || '/images/flyers/alat_berat_flyer.jpg')}
        title={program.title}
        providerName={program.provider?.institutionName || program.providerName}
      />
    </AppShell>
  );
}
