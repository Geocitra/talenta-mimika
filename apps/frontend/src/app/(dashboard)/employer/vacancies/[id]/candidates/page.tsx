'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import { 
  ArrowLeft, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Lock, 
  Unlock, 
  Undo2, 
  Award,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  CheckSquare,
  Square,
  ExternalLink,
  Globe,
  FileText,
  Download,
  Eye
} from 'lucide-react';

function formatWhatsAppLink(phone: string | null | undefined, text: string) {
  if (!phone) return '#';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

function generateOutreachDraft(
  talentName: string,
  vacancyTitle: string,
  companyName: string,
  picName?: string,
) {
  const picLine = picName ? `${picName} dari Tim Rekrutmen` : 'Tim Rekrutmen';
  return `Halo Sdr/i ${talentName},

Perkenalkan, saya ${picLine} ${companyName}.
Melalui portal resmi penempatan kerja MIMIKA TALENTA (Disnaker Kab. Mimika), profil dan kualifikasi keahlian Anda terpilih sebagai kandidat rekomendasi untuk posisi "${vacancyTitle}".

Kami bermaksud mengundang Anda untuk sesi komunikasi dan wawancara pendahuluan secara langsung. Apakah Anda bersedia dan memiliki waktu luang untuk berdiskusi lebih lanjut terkait kesempatan kerja ini?

Terima kasih atas perhatian dan kerja sama Anda.

Salam hormat,
${companyName}`;
}

export default function CandidateDiscoveryPage() {
  const params = useParams();
  const router = useRouter();
  const vacancyId = params?.id as string;
  const { alertProps, showAlert } = useAlertModal();

  const [profile, setProfile] = useState<any>(null);
  const [vacancy, setVacancy] = useState<any>(null);
  const [vacancyTitle, setVacancyTitle] = useState('');
  const [quota, setQuota] = useState<number>(1);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  // Lists: Selected Candidates (Staged/Hired), Available Recommendations, & Skipped (Rejected)
  const [selectedCandidates, setSelectedCandidates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [rejectedCandidates, setRejectedCandidates] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // States: Modal Verifikasi Sadar Rekrutmen & Accordion Dilewati
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [integrityAgreed, setIntegrityAgreed] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  // States: Modal Konfirmasi & Penyesuaian Batch Baru
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateForm, setDuplicateForm] = useState({
    title: '',
    quota: 1,
    salaryMin: '' as string | number,
    salaryMax: '' as string | number,
    stipendAmount: '' as string | number,
    projectDuration: '',
  });

  // States: Modal Informasi Kontak & Draf Komunikasi
  const [contactCandidate, setContactCandidate] = useState<any | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPortfolio, setCopiedPortfolio] = useState(false);

  const handleCopy = async (text: string, type: 'draft' | 'phone' | 'email' | 'portfolio') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    if (type === 'draft') {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    } else if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'portfolio') {
      setCopiedPortfolio(true);
      setTimeout(() => setCopiedPortfolio(false), 2000);
    }
  };

  useEffect(() => {
    if (vacancyId) {
      loadInitialData();
    }
  }, [vacancyId]);

  // Load awal (satu kali saja saat membuka halaman)
  const loadInitialData = async () => {
    setLoading(true);
    setError('');

    // 1. Ambil Profil Perusahaan
    const empRes = await apiFetch('/employers/me');
    if (empRes.status !== 'success') {
      router.push('/login');
      return;
    }
    setProfile(empRes.data);

    // 2. Panggil Data Kandidat & Sesi Pilihan yang Tersimpan
    const res = await apiFetch(`/vacancies/${vacancyId}/candidates`);
    if (res.status === 'success') {
      setVacancy(res.vacancy || res.data?.vacancy || null);
      setVacancyTitle(res.vacancy?.title || res.vacancyTitle || res.data?.vacancyTitle || '');
      setQuota(res.vacancy?.quota || res.quota || 1);
      setIsFinalized(res.vacancy?.status === 'CLOSED' || res.isFinalized || false);
      setSelectedCandidates(res.selectedCandidates || res.data?.selectedCandidates || []);
      setCandidates(res.candidates || res.data?.candidates || []);
      setRejectedCandidates(res.rejectedCandidates || res.data?.rejectedCandidates || []);
    } else {
      setError(res.message || 'Gagal memuat kandidat.');
    }
    setLoading(false);
  };

  // =========================================================================
  // AKSI 1: PILIH TALENTA (OPTIMISTIC UI - LANGSUNG PINDAH TANPA LOADING LAMA)
  // =========================================================================
  const handleSelectCandidate = async (candidate: any) => {
    if (isFinalized) {
      showAlert(
        'warning',
        'Lowongan Telah Ditutup',
        'Lowongan pekerjaan ini telah resmi diselesaikan dan berstatus ditutup. Anda tidak dapat menambahkan kandidat lagi. Silakan gunakan tombol "Buka Batch Baru (Duplikasi)" di atas jika ingin merekrut tenaga kerja tambahan.',
      );
      return;
    }

    if (selectedCandidates.length >= quota) {
      showAlert(
        'warning',
        'Kuota Lowongan Penuh',
        `Kuota untuk lowongan ini adalah ${quota} orang dan seluruh slot telah terisi (${selectedCandidates.length}/${quota}). Silakan batalkan pilihan salah satu talenta di atas jika Anda ingin mengganti dengan kandidat ini.`,
      );
      return;
    }

    // 1. Optimistic Update: Langsung pindahkan kandidat di layar
    setCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
    setSelectedCandidates((prev) => [
      ...prev,
      { ...candidate, isSelected: true, approachStatus: 'SELECTED' },
    ]);

    // 2. Simpan sesi ke database di latar belakang
    const res = await apiFetch(`/vacancies/${vacancyId}/select/${candidate.talentId}`, {
      method: 'POST',
    });

    if (res.status !== 'success') {
      // Revert jika gagal di backend
      setCandidates((prev) => [candidate, ...prev]);
      setSelectedCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
      showAlert('error', 'Gagal Memilih Talenta', res.message || 'Terjadi kendala saat menyimpan pilihan.');
    }
  };

  // =========================================================================
  // AKSI 2: BATAL PILIH TALENTA (OPTIMISTIC UI - KEMBALIKAN KE REKOMENDASI)
  // =========================================================================
  const handleUnselectCandidate = async (candidate: any) => {
    if (isFinalized) {
      showAlert(
        'warning',
        'Lowongan Telah Ditutup',
        'Lowongan pekerjaan ini telah resmi diselesaikan dan berstatus ditutup. Pilihan kandidat tidak dapat diubah.',
      );
      return;
    }

    // 1. Optimistic Update: Kembalikan ke daftar rekomendasi
    setSelectedCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
    setCandidates((prev) => [{ ...candidate, isSelected: false, isHired: false }, ...prev]);

    // 2. Simpan perubahan ke backend di latar belakang
    const res = await apiFetch(`/vacancies/${vacancyId}/unselect/${candidate.talentId}`, {
      method: 'POST',
    });

    if (res.status !== 'success') {
      // Revert jika gagal
      setSelectedCandidates((prev) => [...prev, candidate]);
      setCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
      showAlert('error', 'Gagal Membatalkan Pilihan', res.message || 'Terjadi kendala.');
    }
  };

  // =========================================================================
  // AKSI 3: TANDAI TIDAK COCOK (OPTIMISTIC UI - LEWATI KANDIDAT SECARA SENYAP)
  // =========================================================================
  const handleRejectCandidate = async (candidate: any) => {
    if (isFinalized) {
      showAlert(
        'warning',
        'Lowongan Telah Ditutup',
        'Lowongan pekerjaan ini telah resmi diselesaikan dan berstatus ditutup. Status kandidat tidak dapat diubah.',
      );
      return;
    }

    // 1. Optimistic Update: Pindahkan dari rekomendasi ke daftar dilewati
    setCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
    setRejectedCandidates((prev) => [
      { ...candidate, isRejected: true, approachStatus: 'REJECTED' },
      ...prev,
    ]);

    // 2. Kirim update ke backend di latar belakang (Silent Pass)
    const res = await apiFetch(`/vacancies/${vacancyId}/reject/${candidate.talentId}`, {
      method: 'POST',
    });

    if (res.status !== 'success') {
      setRejectedCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
      setCandidates((prev) => [candidate, ...prev]);
      showAlert('error', 'Gagal Memperbarui Status', res.message || 'Terjadi kendala.');
    }
  };

  // =========================================================================
  // AKSI 3B: KEMBALIKAN KANDIDAT YANG DILEWATI (RESTORE TO RECOMMENDATIONS)
  // =========================================================================
  const handleRestoreRejectedCandidate = async (candidate: any) => {
    if (isFinalized) {
      showAlert(
        'warning',
        'Lowongan Telah Ditutup',
        'Lowongan pekerjaan ini telah resmi diselesaikan dan berstatus ditutup. Status kandidat tidak dapat diubah.',
      );
      return;
    }

    // 1. Optimistic Update: Kembalikan dari dilewati ke rekomendasi
    setRejectedCandidates((prev) => prev.filter((c) => c.talentId !== candidate.talentId));
    setCandidates((prev) => [
      { ...candidate, isRejected: false, approachStatus: undefined },
      ...prev,
    ]);

    // 2. Kirim update ke backend
    const res = await apiFetch(`/vacancies/${vacancyId}/restore-rejected/${candidate.talentId}`, {
      method: 'POST',
    });

    if (res.status !== 'success') {
      setCandidates((prev) => [candidate, ...prev]);
      setRejectedCandidates((prev) => [candidate, ...prev]);
      showAlert('error', 'Gagal Mengembalikan Kandidat', res.message || 'Terjadi kendala.');
    }
  };

  // =========================================================================
  // AKSI 4: BUKA MODAL SELESAIKAN REKRUTMEN (DOUBLE-LOCK SAFETY VERIFICATION)
  // =========================================================================
  const handleOpenFinalizeModal = () => {
    if (selectedCandidates.length === 0) {
      showAlert(
        'warning',
        'Belum Ada Talenta Dipilih',
        `Anda belum memilih talenta untuk lowongan ini. Silakan pilih minimal 1 talenta dari daftar rekomendasi di bawah.`,
      );
      return;
    }
    setIntegrityAgreed(false);
    setShowFinalizeModal(true);
  };

  // Eksekusi Finalisasi Resmi
  const executeFinalizeRecruitment = async () => {
    setFinalizing(true);
    const res = await apiFetch(`/vacancies/${vacancyId}/finalize-recruitment`, {
      method: 'POST',
    });
    setFinalizing(false);
    setShowFinalizeModal(false);

    if (res.status === 'success') {
      setIsFinalized(true);
      setSelectedCandidates((prev) => prev.map((c) => ({ ...c, isHired: true, approachStatus: 'HIRED' })));
      setVacancy((prev: any) => (prev ? { ...prev, status: 'CLOSED' } : prev));
      showAlert(
        'success',
        'Rekrutmen Berhasil Diselesaikan!',
        res.message || 'Seluruh talenta terpilih telah resmi direkrut dan kuota lowongan telah terpenuhi.',
      );
    } else {
      showAlert('error', 'Gagal Menyelesaikan Rekrutmen', res.message || 'Terjadi kesalahan sistem.');
    }
  };

  // =========================================================================
  // AKSI 5: BUKA MODAL PENYESUAIAN & TERBITKAN BATCH BARU (CLEAN SLATE)
  // =========================================================================
  const handleOpenDuplicateModal = () => {
    const base = vacancy?.title ? vacancy.title.replace(/\s*-\s*Batch\s*\d+$/i, '').trim() : vacancyTitle;
    const nextTitle = vacancy?.nextBatchTitle || `${base} - Batch ${(vacancy?.nextBatchNum || 2)}`;

    setDuplicateForm({
      title: nextTitle,
      quota: vacancy?.quota || 1,
      salaryMin: vacancy?.salaryMin !== undefined ? vacancy.salaryMin : '',
      salaryMax: vacancy?.salaryMax !== undefined ? vacancy.salaryMax : '',
      stipendAmount: vacancy?.stipendAmount !== undefined ? vacancy.stipendAmount : '',
      projectDuration: vacancy?.projectDuration || '1 Tahun (Kontrak PKWT Proyek)',
    });
    setShowDuplicateModal(true);
  };

  const executeDuplicateVacancy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!duplicateForm.title.trim()) {
      showAlert('warning', 'Judul Wajib Diisi', 'Silakan tentukan judul lowongan untuk batch baru ini.');
      return;
    }

    if (!duplicateForm.quota || Number(duplicateForm.quota) < 1) {
      showAlert('warning', 'Kuota Tidak Valid', 'Alokasi kuota kebutuhan tenaga kerja minimal 1 orang.');
      return;
    }

    setDuplicating(true);
    const res = await apiFetch(`/vacancies/${vacancyId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({
        title: duplicateForm.title.trim(),
        quota: Number(duplicateForm.quota),
        salaryMin: duplicateForm.salaryMin !== '' ? Number(duplicateForm.salaryMin) : undefined,
        salaryMax: duplicateForm.salaryMax !== '' ? Number(duplicateForm.salaryMax) : undefined,
        stipendAmount: duplicateForm.stipendAmount !== '' ? Number(duplicateForm.stipendAmount) : undefined,
        projectDuration: duplicateForm.projectDuration,
      }),
    });
    setDuplicating(false);
    setShowDuplicateModal(false);

    if (res.status === 'success' && res.data?.id) {
      showAlert(
        'success',
        'Batch Baru Berhasil Diterbitkan!',
        `Lowongan "${res.data.title}" dengan kuota ${res.data.quota} orang berhasil diterbitkan. Anda akan langsung dialihkan ke ruang screening batch baru tersebut.`,
        'Buka Batch Baru Sekarang',
        () => {
          router.push(`/employer/vacancies/${res.data.id}/candidates`);
        }
      );
    } else {
      showAlert('error', 'Gagal Menduplikasi Lowongan', res.message || 'Terjadi kesalahan sistem.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider text-neutral-700">
        <div className="w-7 h-7 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
        <span>Memuat Data Rekrutmen...</span>
      </div>
    );
  }

  const selectedCount = selectedCandidates.length;
  const remainingQuota = Math.max(0, quota - selectedCount);
  const isQuotaFull = selectedCount >= quota;

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Rekomendasi & Kontrol Sesi */}
        <div className="bg-white border border-neutral-300 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
            <div>
              <Link
                href="/employer/vacancies"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 mb-2 uppercase tracking-wider font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Daftar Lowongan
              </Link>
              
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                  vacancy?.opportunityType === 'INTERNSHIP'
                    ? 'bg-purple-50 text-purple-900 border-purple-300'
                    : 'bg-blue-50 text-blue-900 border-blue-300'
                }`}>
                  {vacancy?.opportunityType === 'INTERNSHIP' ? 'Pemagangan Vokasi' : 'Pekerjaan Reguler'}
                </span>
                
                {/* Badge Status Rekrutmen */}
                {isFinalized ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Status: Rekrutmen Selesai (Ditutup)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Status: Tahap Screening & Pemilihan
                  </span>
                )}

                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300 font-mono">
                  Kuota: {selectedCount} / {quota} Terpilih
                </span>
              </div>

              <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-neutral-800 shrink-0" />
                {isFinalized ? `Arsip Keputusan Rekrutmen: ${vacancyTitle}` : `Screening & Rekrutmen: ${vacancyTitle}`}
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                {isFinalized
                  ? `Lowongan kerja ini telah resmi diselesaikan dan ditutup. Seluruh kuota (${selectedCount}/${quota} orang) telah terpenuhi oleh talenta resmi di bawah ini.`
                  : `Pilih talenta yang sesuai untuk mengisi kuota lowongan (${quota} orang). Anda dapat langsung mengontak kandidat untuk wawancara, lalu tekan tombol "Selesaikan Rekrutmen" saat sudah sepakat.`
                }
              </p>
            </div>

            {/* Tombol Aksi Utama: Selesaikan Rekrutmen / Buka Kembali */}
            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0 bg-neutral-50 sm:bg-transparent p-3 sm:p-0 border sm:border-0 border-neutral-200">
              <div className="text-right">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                  Keterisian Kuota
                </span>
                <span className="text-2xl font-bold font-mono text-neutral-900">
                  {selectedCount} / {quota} <span className="text-xs text-neutral-500 font-sans font-normal">Orang</span>
                </span>
              </div>

              {isFinalized ? (
                <button
                  onClick={handleOpenDuplicateModal}
                  disabled={duplicating}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="Buat lowongan baru dengan penyesuaian kuota dan spesifikasi (Batch Baru)"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Buka Batch Baru (Duplikasi)</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenFinalizeModal}
                  disabled={selectedCount === 0 || finalizing}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all ${
                    selectedCount > 0
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                  title={selectedCount === 0 ? 'Pilih minimal 1 talenta terlebih dahulu' : 'Selesaikan rekrutmen kuota lowongan ini'}
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{finalizing ? 'Menyelesaikan...' : `Selesaikan Rekrutmen (${selectedCount}/${quota})`}</span>
                </button>
              )}
            </div>
          </div>

          {/* Rincian Parameter Kebutuhan Lowongan */}
          {vacancy && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50 border border-neutral-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  {vacancy.opportunityType === 'INTERNSHIP' ? 'Uang Saku Pemagangan' : 'Estimasi Kompensasi'}
                </span>
                <span className="font-bold text-neutral-900 font-mono">
                  {vacancy.opportunityType === 'INTERNSHIP'
                    ? (vacancy.stipendAmount ? `Rp ${Number(vacancy.stipendAmount).toLocaleString('id-ID')} / bulan` : 'Uang Saku Standar')
                    : (vacancy.salaryMin && vacancy.salaryMax
                        ? `Rp ${Number(vacancy.salaryMin).toLocaleString('id-ID')} - Rp ${Number(vacancy.salaryMax).toLocaleString('id-ID')}`
                        : 'Kompetitif / Sesuai Pengalaman (Negosiasi)')}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Penempatan & Zona Kerja
                </span>
                <span className="font-semibold text-neutral-800">
                  {vacancy.workZone ? vacancy.workZone.replace(/_/g, ' ') : 'TIMIKA KOTA'} &bull; {vacancy.workSchedule ? vacancy.workSchedule.replace(/_/g, ' ') : 'NORMAL DAY'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  {vacancy.opportunityType === 'INTERNSHIP' ? 'Mentor / Pembimbing' : 'Fasilitas Kerja'}
                </span>
                <span className="font-semibold text-neutral-800">
                  {vacancy.opportunityType === 'INTERNSHIP'
                    ? `${vacancy.mentorName || 'Tim Mentor'} (${vacancy.mentorRole || 'Pembimbing Teknis'})`
                    : (Array.isArray(vacancy.benefits) && vacancy.benefits.length > 0
                        ? vacancy.benefits.slice(0, 3).join(', ') + (vacancy.benefits.length > 3 ? ` +${vacancy.benefits.length - 3}` : '')
                        : 'Standar UU Ketenagakerjaan')}
                </span>
              </div>
            </div>
          )}

          {!isFinalized && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-600 bg-neutral-50 p-2.5 border border-neutral-200">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Alur Screening Terpadu:</strong> Setiap kandidat dilengkapi tombol <strong>Hubungi Kandidat</strong> untuk meninjau kontak lengkap &amp; draf pesan, tombol <strong>Pilih Talenta</strong> untuk memasukkan ke daftar terpilih, dan tombol <strong>Tidak Cocok</strong>. Pilihan Anda otomatis tersimpan sehingga tidak akan hilang saat berpindah halaman.
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKSI 1: DAFTAR TALENTA TERPILIH ({selectedCount} / {quota} ORANG)         */}
        {/* ========================================================================= */}
        {selectedCount > 0 && (
          <div className="bg-white border-2 border-emerald-600 shadow-sm">
            <div className="p-4 bg-emerald-700 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    {isFinalized ? 'Talenta Resmi Direkrut' : 'Daftar Talenta Terpilih (Kandidat yang Akan Direkrut)'}
                  </span>
                </div>
                <h2 className="text-base font-bold uppercase tracking-tight text-white mt-0.5">
                  Talenta Terpilih untuk Mengisi Kuota ({selectedCount} / {quota} Orang)
                </h2>
                <p className="text-[11px] text-emerald-100">
                  {isFinalized
                    ? 'Proses rekrutmen telah diselesaikan. Talenta di bawah ini telah berhasil direkrut untuk mengisi kuota lowongan ini.'
                    : 'Talenta di bawah ini telah Anda masukkan ke daftar terpilih. Tinjau kembali atau klik "Selesaikan Rekrutmen" di kanan untuk meresmikan rekrutmen.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isFinalized && (
                  <button
                    onClick={handleOpenFinalizeModal}
                    disabled={finalizing}
                    className="px-4 py-2 bg-white hover:bg-neutral-100 text-emerald-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Selesaikan Rekrutmen</span>
                  </button>
                )}
                <span className="px-2.5 py-1 bg-white/20 border border-white/30 text-white text-xs font-mono font-bold">
                  {selectedCount} / {quota} Terpilih
                </span>
              </div>
            </div>

            <div className="divide-y divide-emerald-100">
              {selectedCandidates.map((cand, idx) => (
                <div key={cand.talentId} className="p-6 space-y-4 bg-emerald-50/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-emerald-700 font-mono pt-0.5">
                        #{idx + 1}
                      </span>
                      <div className="w-12 h-12 bg-white border border-emerald-300 shrink-0 overflow-hidden flex items-center justify-center">
                        {cand.avatarUrl ? (
                          <img
                            src={getFullMediaUrl(cand.avatarUrl) || ''}
                            alt={cand.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <User className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold uppercase text-neutral-900">
                            {cand.fullName}
                          </h3>
                          {isFinalized ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Resmi Direkrut
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Kandidat Terpilih
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Pendidikan: <span className="font-semibold text-neutral-800">{cand.lastEducationDegree}</span> &bull; 
                          Pengalaman: <span className="font-semibold text-neutral-800">{(cand.totalExperienceMonths / 12).toFixed(1)} Tahun ({cand.totalExperienceMonths} Bulan)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-200 pt-3 sm:pt-0">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                          Kesesuaian
                        </div>
                        <div className="text-2xl font-bold font-mono text-emerald-700">
                          {cand.overallScore}%
                        </div>
                      </div>

                      {/* Tombol Batal Pilih (Hanya jika belum difinalisasi) */}
                      {!isFinalized && (
                        <button
                          onClick={() => handleUnselectCandidate(cand)}
                          className="px-3 py-2 text-xs font-semibold uppercase text-neutral-600 hover:text-red-700 hover:bg-red-50 border border-neutral-300 hover:border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Batal memilih talenta ini dan kembalikan ke daftar rekomendasi"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Batal Pilih</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Kontak Terbuka Talenta Terpilih + Tombol Hubungi Kandidat */}
                  <div className="p-3.5 bg-white border border-emerald-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                        Akses Komunikasi Langsung:
                      </span>
                      <div className="flex items-center gap-3 text-neutral-800 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <strong className="font-mono">{cand.phone || 'Nomor Belum Terdaftar'}</strong>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-700" />
                          <strong className="font-mono">{cand.email || '-'}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setContactCandidate(cand);
                        setCopiedDraft(false);
                        setCopiedPhone(false);
                        setCopiedEmail(false);
                        setCopiedPortfolio(false);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Hubungi Kandidat</span>
                    </button>
                  </div>

                  {/* Ulasan Kualifikasi AI */}
                  {cand.aiReasoning && (
                    <div className="p-3 bg-white border border-neutral-200 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
                        Ulasan Kualifikasi Kandidat:
                      </span>
                      <p className="text-neutral-700 leading-relaxed">{cand.aiReasoning}</p>
                    </div>
                  )}

                  {/* Sertifikasi & Lisensi Resmi Terverifikasi */}
                  {Array.isArray(cand.certifications) && cand.certifications.length > 0 && (
                    <div className="p-3.5 bg-white border border-emerald-300 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          Dokumen Sertifikasi &amp; Lisensi Resmi ({cand.certifications.length}):
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Terverifikasi Sistem
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cand.certifications.map((cert: any, cIdx: number) => {
                          const hasPdf = Boolean(cert.fileUrl || cert.fileName);
                          return (
                            <div
                              key={cIdx}
                              className="p-2.5 bg-emerald-50/40 border border-emerald-200 flex flex-col justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-neutral-900 text-xs leading-snug">
                                    {cert.name}
                                  </h4>
                                  {hasPdf && (
                                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold shrink-0 border border-emerald-300">
                                      PDF TERSEDIA
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-600 mt-0.5">
                                  {cert.issuer || 'Lembaga Penerbit'} {cert.issueYear ? `• Tahun ${cert.issueYear}` : ''}
                                </p>
                                {cert.credentialId && (
                                  <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                                    No. Reg: {cert.credentialId}
                                  </p>
                                )}
                              </div>

                              {hasPdf ? (
                                <div className="pt-1 border-t border-emerald-200">
                                  <a
                                    href={`/viewer?url=${encodeURIComponent(getFullMediaUrl(cert.fileUrl) || '')}&name=${encodeURIComponent(cert.name || 'Sertifikat')}&issuer=${encodeURIComponent(cert.issuer || '')}&talent=${encodeURIComponent(cand.fullName || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                                    title="Buka Dokumen PDF di Halaman Penampil Resmi"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Buka Dokumen PDF</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                                  </a>
                                </div>
                              ) : (
                                <div className="text-[10px] text-neutral-400 italic pt-1 border-t border-neutral-200">
                                  Sertifikat tercatat tanpa lampiran berkas PDF
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banner Kuota Lengkap Terpilih */}
        {isQuotaFull && !isFinalized && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide text-amber-900">
                  Kuota Terpilih Lengkap: {selectedCount} dari {quota} Talenta Telah Dipilih!
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Seluruh slot kuota lowongan telah terisi di daftar talenta terpilih. Silakan gunakan tombol <strong>&quot;Hubungi Kandidat&quot;</strong> untuk komunikasi dan konfirmasi akhir, lalu tekan tombol <strong>&quot;Selesaikan Rekrutmen&quot;</strong> untuk meresmikan pemenuhan kuota.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenFinalizeModal}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Selesaikan Rekrutmen</span>
            </button>
          </div>
        )}

        {/* Banner Mode Arsip Lowongan Ditutup */}
        {isFinalized && (
          <div className="p-6 bg-neutral-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 border-neutral-800 shadow-md">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500 text-neutral-950 font-bold text-[10px] uppercase tracking-wider">
                    Rekrutmen Tuntas &amp; Ditutup
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Kuota {selectedCount} / {quota} Terisi
                  </span>
                </div>
                <h3 className="text-base font-bold uppercase tracking-wide text-white mt-1.5">
                  Arsip Keputusan Rekrutmen: {vacancyTitle}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Proses rekrutmen untuk posisi ini telah resmi selesai. Kuota lowongan telah terpenuhi oleh talenta terpilih di atas. Sesuai prinsip kedaulatan talenta daerah, profil kandidat tetap dapat berpartisipasi dalam peluang karier lainnya. Untuk merekrut talenta tambahan, silakan buka batch baru.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenDuplicateModal}
              disabled={duplicating}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-md shrink-0"
            >
              <RotateCcw className="w-4 h-4 text-emerald-100" />
              <span>+ Buka Batch Baru (Duplikasi)</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKSI 2: DAFTAR KANDIDAT REKOMENDASI (HANYA TAMPIL SAAT LOWONGAN MASIH OPEN) */}
        {/* ========================================================================= */}
        {!isFinalized && (
          <div className="bg-white border border-neutral-300">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                {isFinalized ? 'Arsip Radar Kandidat Pelengkap' : 'Kandidat Rekomendasi Sesuai Kuota'}
              </span>
              <span className="text-[11px] text-neutral-600">
                {isFinalized
                  ? 'Rekrutmen lowongan ini telah resmi ditutup. Daftar kandidat di bawah ini diarsipkan sebagai referensi historis.'
                  : isQuotaFull
                  ? `Kuota utama telah lengkap dipilih (${selectedCount}/${quota}). Kandidat di bawah ini adalah cadangan.`
                  : `Sisa Kuota yang Masih Dibutuhkan: ${remainingQuota} Orang lagi`}
              </span>
            </div>
            <span className="text-[11px] text-neutral-600 font-medium">
              Passing Grade: &ge; 50%
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-600 space-y-1">
              <p className="font-bold text-neutral-800 text-sm">
                {selectedCount > 0 
                  ? 'Seluruh Kandidat Unggulan Telah Masuk ke Daftar Terpilih'
                  : 'Belum Ada Kandidat yang Memenuhi Kualifikasi'}
              </p>
              <p>
                {selectedCount > 0
                  ? `Anda telah memilih ${selectedCount} orang talenta pada bagian atas.`
                  : 'Belum ditemukan talenta dengan keahlian yang sesuai untuk posisi ini di database Mimika Talenta.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {candidates.map((cand, idx) => (
                <div key={cand.talentId} className="p-6 space-y-4 hover:bg-neutral-50/50 transition-colors">
                  {/* Baris Utama: Profil, Skor, & Tombol Aksi Langsung (3 Pilihan) */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-neutral-400 font-mono pt-0.5">
                        #{idx + 1}
                      </span>
                      {/* Avatar Pas Foto Kandidat */}
                      <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 shrink-0 overflow-hidden flex items-center justify-center">
                        {cand.avatarUrl ? (
                          <img
                            src={getFullMediaUrl(cand.avatarUrl) || ''}
                            alt={cand.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <User className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold uppercase text-neutral-900">
                            {cand.fullName}
                          </h2>
                          {cand.breakdown?.isFuzzyEquivalenceApplied && (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5">
                              Penyetaraan Vokasi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Pendidikan: <span className="font-semibold text-neutral-800">{cand.lastEducationDegree}</span> &bull; 
                          Pengalaman: <span className="font-semibold text-neutral-800">{(cand.totalExperienceMonths / 12).toFixed(1)} Tahun ({cand.totalExperienceMonths} Bulan)</span>
                        </p>
                      </div>
                    </div>

                    {/* Skor Kesesuaian & 3 Tombol Aksi Langsung */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-100 pt-3 sm:pt-0">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                          Kesesuaian
                        </div>
                        <div className={`text-2xl font-bold font-mono ${
                          cand.overallScore >= 75 ? 'text-green-700' : 'text-neutral-900'
                        }`}>
                          {cand.overallScore}%
                        </div>
                      </div>

                      {/* 3 Tombol Aksi Langsung Tanpa Perlu Buka Draft Dulu */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {/* Tombol 1: Pilih Talenta */}
                        {isFinalized ? (
                          <span
                            className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-200 text-neutral-500 flex items-center gap-1 cursor-not-allowed select-none border border-neutral-300"
                            title="Lowongan ini telah resmi ditutup. Untuk merekrut kembali, silakan buka Batch Baru."
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Rekrutmen Ditutup</span>
                          </span>
                        ) : isQuotaFull ? (
                          <button
                            disabled
                            className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-200 text-neutral-500 cursor-not-allowed flex items-center gap-1"
                            title="Kuota lowongan sudah penuh. Batalkan salah satu talenta di atas jika ingin memilih kandidat ini."
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Kuota Penuh</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectCandidate(cand)}
                            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                            title="Pilih talenta ini untuk dimasukkan ke daftar yang akan direkrut"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Pilih Talenta</span>
                          </button>
                        )}

                        {/* Tombol 2: Tidak Cocok (Hanya jika belum finalized) */}
                        {!isFinalized && (
                          <button
                            onClick={() => handleRejectCandidate(cand)}
                            className="px-2.5 py-2 text-xs font-medium uppercase text-neutral-600 hover:text-red-700 hover:bg-neutral-100 border border-neutral-300 cursor-pointer transition-colors"
                            title="Lewati atau tandai tidak cocok"
                          >
                            <span>Tidak Cocok</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kontak Langsung Terbuka + Tombol Hubungi Kandidat */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block">
                        Akses Komunikasi Langsung:
                      </span>
                      <div className="flex items-center gap-3 text-neutral-800 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-neutral-600" />
                          <strong className="font-mono">{cand.phone || 'Nomor Belum Terdaftar'}</strong>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-neutral-600" />
                          <strong className="font-mono">{cand.email || '-'}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setContactCandidate(cand);
                        setCopiedDraft(false);
                        setCopiedPhone(false);
                        setCopiedEmail(false);
                        setCopiedPortfolio(false);
                      }}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hubungi Kandidat</span>
                    </button>
                  </div>

                  {/* Ringkasan Analisis Kualifikasi (Narasi Eksekutif) */}
                  {cand.aiReasoning && (
                    <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Ulasan Kualifikasi Kandidat:
                        </span>
                        <p className="text-neutral-800 leading-relaxed">
                          {cand.aiReasoning}
                        </p>
                      </div>

                      {/* Keunggulan Teknis yang Dideteksi */}
                      {Array.isArray(cand.aiStrengths) && cand.aiStrengths.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                            Keunggulan Kompetensi Teridentifikasi:
                          </span>
                          <div className="space-y-1">
                            {cand.aiStrengths.map((str: string, sIdx: number) => (
                              <div key={sIdx} className="flex items-center gap-2 text-neutral-800 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{str}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Catatan Afirmasi Lapangan (Jika ada) */}
                      {cand.affirmationNote && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-950 text-[11px] flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold uppercase tracking-wider text-[9px] block text-amber-900">
                              Catatan Afirmasi Lapangan:
                            </span>
                            <span>{cand.affirmationNote}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rincian Sub-Skor Multi-Faktor 4-Pilar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-[11px]">
                    <div className="p-2 bg-neutral-50 border border-neutral-200">
                      <span className="text-neutral-500 block uppercase text-[9px] font-bold">Keahlian (35%)</span>
                      <span className="font-bold font-mono text-neutral-900">
                        {Math.round(cand.breakdown?.skillMatchScore || 0)}%
                      </span>
                    </div>

                    <div className="p-2 bg-neutral-50 border border-neutral-200">
                      <span className="text-neutral-500 block uppercase text-[9px] font-bold">Pengalaman (30%)</span>
                      <span className="font-bold font-mono text-neutral-900">
                        {Math.round(cand.breakdown?.experienceMatchScore || 0)}%
                      </span>
                    </div>

                    <div className="p-2 bg-neutral-50 border border-neutral-200">
                      <span className="text-neutral-500 block uppercase text-[9px] font-bold">Pendidikan (20%)</span>
                      <span className="font-bold font-mono text-neutral-900">
                        {Math.round(cand.breakdown?.educationMatchScore ?? 100)}%
                      </span>
                    </div>

                    <div className="p-2 bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 block uppercase text-[9px] font-bold">Social DNA (15%)</span>
                        {cand.breakdown?.distanceKm !== undefined && (
                          <span className="text-[9px] text-neutral-400 font-mono">
                            {cand.breakdown.distanceKm} km
                          </span>
                        )}
                      </div>
                      <span className="font-bold font-mono text-neutral-900">
                        {Math.round(cand.breakdown?.socialDnaMatchScore || 0)}%
                      </span>
                    </div>
                  </div>

                  {/* Tags Keahlian Terverifikasi LMS & Pengalaman */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.isArray(cand.skills) && cand.skills.length > 0 ? (
                      cand.skills.map((sk: any, sIdx: number) => {
                        const isVerified = typeof sk === 'object' && sk?.isLmsVerified;
                        const skillName = typeof sk === 'string' ? sk : sk?.name;
                        return (
                          <span
                            key={sIdx}
                            className={`text-[10px] inline-flex items-center gap-1 px-2 py-0.5 border ${
                              isVerified
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                : 'bg-white border-neutral-300 text-neutral-800'
                            }`}
                          >
                            {isVerified && <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
                            <span>{skillName}</span>
                            {isVerified && (
                              <span className="text-[8px] bg-emerald-700 text-white px-1 py-0.2 uppercase font-mono">
                                Verified BNSP
                              </span>
                            )}
                          </span>
                        );
                      })
                    ) : cand.topSkills && cand.topSkills.length > 0 ? (
                      cand.topSkills.map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="text-[10px] bg-white border border-neutral-300 text-neutral-800 px-2 py-0.5">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-neutral-600 italic">Tidak ada keahlian terdaftar</span>
                    )}
                  </div>

                  {/* Sertifikasi & Lisensi Resmi Terverifikasi */}
                  {Array.isArray(cand.certifications) && cand.certifications.length > 0 && (
                    <div className="p-3.5 bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          Dokumen Sertifikasi &amp; Lisensi Resmi ({cand.certifications.length}):
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Terverifikasi Berkas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cand.certifications.map((cert: any, cIdx: number) => {
                          const hasPdf = Boolean(cert.fileUrl || cert.fileName);
                          return (
                            <div
                              key={cIdx}
                              className="p-2.5 bg-white border border-neutral-200 flex flex-col justify-between gap-2 shadow-2xs"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-neutral-900 text-xs leading-snug">
                                    {cert.name}
                                  </h4>
                                  {hasPdf && (
                                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold shrink-0 border border-emerald-300">
                                      PDF
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                  {cert.issuer || 'Lembaga Penerbit'} {cert.issueYear ? `• Tahun ${cert.issueYear}` : ''}
                                </p>
                                {cert.credentialId && (
                                  <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                                    No. Reg: {cert.credentialId}
                                  </p>
                                )}
                              </div>

                              {hasPdf ? (
                                <div className="pt-1 border-t border-neutral-100">
                                  <a
                                    href={`/viewer?url=${encodeURIComponent(getFullMediaUrl(cert.fileUrl) || '')}&name=${encodeURIComponent(cert.name || 'Sertifikat')}&issuer=${encodeURIComponent(cert.issuer || '')}&talent=${encodeURIComponent(cand.fullName || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                                    title="Buka Dokumen PDF di Halaman Penampil Resmi"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Buka Dokumen PDF</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                                  </a>
                                </div>
                              ) : (
                                <div className="text-[10px] text-neutral-400 italic pt-1 border-t border-neutral-100">
                                  Sertifikat tercatat tanpa berkas digital
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* ========================================================================= */}
        {/* SEKSI 3: ACCORDION KANDIDAT YANG DILEWATI (SAFETY NET / BISA DI-RESTORE)   */}
        {/* ========================================================================= */}
        {rejectedCandidates.length > 0 && (
          <div className="bg-white border border-neutral-300 overflow-hidden">
            <button
              onClick={() => setShowSkipped(!showSkipped)}
              className="w-full p-4 bg-neutral-100 hover:bg-neutral-200/70 border-b border-neutral-200 flex justify-between items-center text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Kandidat yang Dilewati / Tidak Cocok ({rejectedCandidates.length} Orang)
                </span>
                <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-0.5 font-mono">
                  Safety Net
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-600">
                <span className="text-[11px] font-medium">
                  {showSkipped ? 'Sembunyikan' : 'Tampilkan Kandidat'}
                </span>
                {showSkipped ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showSkipped && (
              <div className="divide-y divide-neutral-200 bg-neutral-50/50">
                {rejectedCandidates.map((cand, idx) => (
                  <div key={cand.talentId} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-neutral-400 font-mono pt-1">
                        #{idx + 1}
                      </span>
                      <div className="w-10 h-10 bg-neutral-200 border border-neutral-300 shrink-0 overflow-hidden flex items-center justify-center">
                        {cand.avatarUrl ? (
                          <img
                            src={getFullMediaUrl(cand.avatarUrl) || ''}
                            alt={cand.fullName}
                            className="w-full h-full object-cover grayscale opacity-75"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <User className="w-5 h-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold uppercase text-neutral-700">
                            {cand.fullName}
                          </h4>
                          <span className="text-[9px] font-bold uppercase bg-neutral-200 text-neutral-600 px-1.5 py-0.5 border border-neutral-300">
                            Dilewati
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Pendidikan: {cand.lastEducationDegree} &bull; Pengalaman: {(cand.totalExperienceMonths / 12).toFixed(1)} Thn &bull; Kesesuaian: <strong className="font-mono">{cand.overallScore}%</strong>
                        </p>
                      </div>
                    </div>

                    {!isFinalized ? (
                      <button
                        onClick={() => handleRestoreRejectedCandidate(cand)}
                        className="px-3 py-1.5 bg-white border border-neutral-300 hover:border-emerald-600 text-neutral-700 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
                        title="Kembalikan kandidat ini ke daftar rekomendasi"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kembalikan ke Rekomendasi</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase text-neutral-400 border border-neutral-200 px-2 py-1 bg-white">
                        Arsip Selesai
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL VERIFIKASI SADAR: SELESAIKAN REKRUTMEN (DOUBLE-LOCK SAFETY GUARD)  */}
      {/* ========================================================================= */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-300 max-w-xl w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="border-b border-neutral-200 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-800 text-white px-2 py-0.5">
                  Verifikasi Keputusan Rekrutmen
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 mt-1.5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700" />
                  Selesaikan Rekrutmen &amp; Penuhi Kuota
                </h3>
              </div>
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Posisi & Kuota */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-600">Posisi Lowongan:</span>
                  <strong className="text-neutral-900 uppercase">{vacancyTitle}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-600">Alokasi Kuota Terpilih:</span>
                  <strong className="font-mono text-neutral-900">{selectedCount} dari {quota} Orang</strong>
                </div>
              </div>

              {/* Warning Under-Quota jika ada sisa slot yang tidak terisi */}
              {selectedCount < quota && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Penyelesaian di Bawah Kuota (Under-Quota Hiring)</strong>
                    <span>
                      Anda memilih {selectedCount} orang dari kuota {quota} orang. Sisa {quota - selectedCount} kuota yang tidak terisi akan resmi ditutup. Pastikan Anda memang tidak ingin menambah kandidat lain.
                    </span>
                  </div>
                </div>
              )}

              {/* Daftar Nama Kandidat Terpilih */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                  Kandidat Terpilih yang Berhasil Direkrut:
                </span>
                <div className="divide-y divide-neutral-200 border border-neutral-200 max-h-40 overflow-y-auto">
                  {selectedCandidates.map((c, i) => (
                    <div key={c.talentId} className="p-2.5 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-400 text-[11px]">#{i + 1}</span>
                        <div>
                          <strong className="text-neutral-900 uppercase block">{c.fullName}</strong>
                          <span className="text-[10px] text-neutral-500">
                            {c.lastEducationDegree} &bull; {(c.totalExperienceMonths / 12).toFixed(1)} Thn Pengalaman
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {c.overallScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox Pakta Integritas Wawancara (Anti Blind Hiring) */}
              <div
                onClick={() => setIntegrityAgreed(!integrityAgreed)}
                className={`p-3.5 border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  integrityAgreed
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {integrityAgreed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <label className="text-[11px] leading-relaxed cursor-pointer font-medium">
                  <strong>Pakta Integritas Wawancara &amp; Kesepakatan Kerja:</strong><br />
                  Saya menyatakan bahwa pihak perusahaan telah melakukan komunikasi/wawancara langsung dengan kandidat di atas dan telah menyepakati kualifikasi, kompensasi, serta kesediaan mulai bekerja.
                </label>
              </div>

              <div className="text-[10px] text-neutral-500 leading-relaxed bg-neutral-50 p-2.5 border border-neutral-200">
                <strong>Catatan Operasional:</strong> Tindakan ini menandai bahwa kuota lowongan telah terpenuhi dan lowongan resmi berstatus <strong>CLOSED</strong>. Sesuai prinsip kedaulatan mobilitas kerja daerah Mimika, profil talenta tetap dapat ditemukan oleh peluang karier lainnya. Jika perusahaan membutuhkan tenaga kerja tambahan di masa depan, Anda dapat menduplikasi lowongan ini sebagai <strong>Batch Baru</strong>.
              </div>
            </div>

            {/* Tombol Aksi Konfirmasi */}
            <div className="flex justify-end items-center gap-3 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                disabled={finalizing}
                className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeFinalizeRecruitment}
                disabled={!integrityAgreed || finalizing}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all ${
                  integrityAgreed && !finalizing
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>{finalizing ? 'Menyelesaikan...' : 'Ya, Selesaikan Rekrutmen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL INFORMASI KONTAK, DATA DIRI & DRAF KOMUNIKASI KANDIDAT               */}
      {/* ========================================================================= */}
      {contactCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-300 max-w-2xl w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="border-b border-neutral-200 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-amber-400 px-2 py-0.5">
                  Informasi Kontak &amp; Draf Komunikasi
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 mt-1.5 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-700" />
                  Hubungi Kandidat: {contactCandidate.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactCandidate(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profil Singkat & Identitas Kandidat */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 flex items-start gap-3.5">
              <div className="w-12 h-12 bg-neutral-200 border border-neutral-300 shrink-0 overflow-hidden flex items-center justify-center text-neutral-700 font-bold text-sm">
                {contactCandidate.avatarUrl ? (
                  <img
                    src={getFullMediaUrl(contactCandidate.avatarUrl) || ''}
                    alt={contactCandidate.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{contactCandidate.fullName ? contactCandidate.fullName.charAt(0).toUpperCase() : 'T'}</span>
                )}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-bold text-sm uppercase text-neutral-900 truncate">
                    {contactCandidate.fullName}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5">
                    Match Score: {contactCandidate.overallScore}%
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {contactCandidate.lastEducationDegree || 'Pendidikan Terdaftar'} &bull; {(contactCandidate.totalExperienceMonths / 12).toFixed(1)} Thn Pengalaman Kerja
                </p>
                {contactCandidate.bio && (
                  <p className="text-[11px] text-neutral-500 italic line-clamp-2 border-l-2 border-neutral-300 pl-2 mt-1">
                    &ldquo;{contactCandidate.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Saluran Kontak Utama: Telepon/WA & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kartu Telepon / WhatsApp */}
              <div className="p-3 bg-white border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    Nomor WhatsApp / HP
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-neutral-900 select-all">
                  {contactCandidate.phone || 'Nomor Belum Terdaftar'}
                </div>
                {contactCandidate.phone && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(contactCandidate.phone, 'phone')}
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border transition-colors flex items-center gap-1 cursor-pointer ${
                        copiedPhone
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3 h-3 text-neutral-500" />}
                      <span>{copiedPhone ? 'Tersalin' : 'Salin Nomor'}</span>
                    </button>
                    <a
                      href={formatWhatsAppLink(
                        contactCandidate.phone,
                        generateOutreachDraft(
                          contactCandidate.fullName,
                          vacancyTitle,
                          profile?.companyName || 'Perusahaan',
                          profile?.picName,
                        ),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-2xs"
                      title="Buka percakapan langsung di aplikasi WhatsApp"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka WA</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Kartu Email Resmi */}
              <div className="p-3 bg-white border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-700" />
                    Alamat Email
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-neutral-900 select-all truncate">
                  {contactCandidate.email || 'Email Belum Terdaftar'}
                </div>
                {contactCandidate.email && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(contactCandidate.email, 'email')}
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border transition-colors flex items-center gap-1 cursor-pointer ${
                        copiedEmail
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3 h-3 text-neutral-500" />}
                      <span>{copiedEmail ? 'Tersalin' : 'Salin Email'}</span>
                    </button>
                    <a
                      href={`mailto:${contactCandidate.email}?subject=${encodeURIComponent(
                        `Undangan Komunikasi Seleksi Posisi ${vacancyTitle} - ${profile?.companyName || 'Perusahaan'}`,
                      )}&body=${encodeURIComponent(
                        generateOutreachDraft(
                          contactCandidate.fullName,
                          vacancyTitle,
                          profile?.companyName || 'Perusahaan',
                          profile?.picName,
                        ),
                      )}`}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-2xs"
                      title="Kirim email melalui email client Anda"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Kirim Email</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Media Sosial, Portofolio & Social DNA */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block">
                Portofolio &amp; Jejak Publik Kandidat:
              </span>

              {contactCandidate.socialDna?.portfolioUrl ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white border border-neutral-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="font-mono text-neutral-800 text-[11px] truncate">
                      {contactCandidate.socialDna.portfolioUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(contactCandidate.socialDna.portfolioUrl, 'portfolio')}
                      className="px-2 py-1 text-[10px] font-semibold uppercase border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
                    >
                      {copiedPortfolio ? 'Tersalin' : 'Salin'}
                    </button>
                    <a
                      href={contactCandidate.socialDna.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Tautan</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-500 italic bg-white p-2 border border-neutral-200">
                  Kandidat belum mencantumkan tautan profil sosial / portofolio publik eksternal.
                </div>
              )}

              {/* Preferensi & Keterlibatan Organisasi */}
              <div className="flex flex-wrap gap-2 pt-1">
                {contactCandidate.socialDna?.organizations && (
                  <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 text-[10px] font-medium border border-neutral-300">
                    Organisasi: {contactCandidate.socialDna.organizations}
                  </span>
                )}
                {Array.isArray(contactCandidate.socialDna?.workPreferences) &&
                  contactCandidate.socialDna.workPreferences.map((pref: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200"
                    >
                      {pref}
                    </span>
                  ))}
              </div>
            </div>

            {/* Dokumen Sertifikasi & Lisensi Resmi (PDF) */}
            {Array.isArray(contactCandidate.certifications) && contactCandidate.certifications.length > 0 && (
              <div className="p-3.5 bg-white border border-neutral-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-700" />
                    Dokumen Sertifikasi &amp; Lisensi Resmi ({contactCandidate.certifications.length}):
                  </span>
                  <span className="text-[10px] text-neutral-400">Berkas Dokumen Otentik</span>
                </div>

                <div className="space-y-2">
                  {contactCandidate.certifications.map((cert: any, cIdx: number) => {
                    const hasPdf = Boolean(cert.fileUrl || cert.fileName);
                    return (
                      <div
                        key={cIdx}
                        className="p-3 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-xs truncate">
                              {cert.name}
                            </span>
                            {hasPdf && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold border border-emerald-300">
                                PDF TERSEDIA
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-600 mt-0.5">
                            Penerbit: <strong className="text-neutral-800">{cert.issuer || '-'}</strong> {cert.issueYear ? `(${cert.issueYear})` : ''}
                            {cert.credentialId ? ` • No. Kredensial: ${cert.credentialId}` : ''}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {hasPdf ? (
                            <a
                              href={`/viewer?url=${encodeURIComponent(getFullMediaUrl(cert.fileUrl) || '')}&name=${encodeURIComponent(cert.name || 'Sertifikat')}&issuer=${encodeURIComponent(cert.issuer || '')}&talent=${encodeURIComponent(contactCandidate.fullName || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                              title="Buka Dokumen PDF di Halaman Penampil Resmi"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Buka Dokumen PDF</span>
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-neutral-400 italic">Tanpa berkas digital</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Draf Pesan Pembuka (Siap Disalin untuk Chat / Email di Luar Aplikasi) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-600" />
                  Draf Pesan Pengantar Resmi (Siap Disalin)
                </span>
                <span className="text-[10px] text-neutral-500">
                  Untuk dikirim via WA / Email di luar sistem
                </span>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={7}
                  value={generateOutreachDraft(
                    contactCandidate.fullName,
                    vacancyTitle,
                    profile?.companyName || 'Perusahaan',
                    profile?.picName,
                  )}
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 text-xs font-mono text-neutral-800 leading-relaxed focus:outline-none select-all"
                />
              </div>

              {/* Tombol Aksi Salin Draf Pesan */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      generateOutreachDraft(
                        contactCandidate.fullName,
                        vacancyTitle,
                        profile?.companyName || 'Perusahaan',
                        profile?.picName,
                      ),
                      'draft',
                    )
                  }
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all ${
                    copiedDraft
                      ? 'bg-emerald-700 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {copiedDraft ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>✓ Berhasil Disalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Salin Draf Pesan</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-neutral-500 text-center sm:text-right">
                  Klik salin lalu paste ke WhatsApp Desktop, Email, atau aplikasi chat Anda.
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="text-[10px] text-neutral-500">
                Data kontak ini disediakan khusus untuk keperluan proses seleksi lowongan kerja resmi.
              </span>
              <button
                type="button"
                onClick={() => setContactCandidate(null)}
                className="px-4 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PENYESUAIAN & KONFIRMASI PEMBUKAAN BATCH BARU                        */}
      {/* ========================================================================= */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-300 max-w-xl w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="border-b border-neutral-200 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-800 text-white px-2 py-0.5">
                  Rekrutmen Lanjutan (Batch Baru)
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 mt-1.5 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-emerald-700" />
                  Konfirmasi &amp; Penyesuaian Batch Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keterangan Sistem */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs space-y-1 text-neutral-600">
              <p className="font-semibold text-neutral-900">
                Duplikasi Spesifikasi ke Lembaran Bersih (Clean Slate)
              </p>
              <p className="text-[11px] leading-relaxed">
                Kualifikasi keahlian, jenjang pendidikan, zona penempatan, dan fasilitas kerja otomatis disalin dari lowongan sebelumnya. Anda dapat menyesuaikan judul batch, alokasi kuota, dan anggaran kompensasi sebelum diterbitkan.
              </p>
            </div>

            <form onSubmit={executeDuplicateVacancy} className="space-y-4 text-xs">
              {/* Field 1: Judul Batch Baru */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Judul Lowongan / Batch Baru:
                </label>
                <input
                  type="text"
                  required
                  value={duplicateForm.title}
                  onChange={(e) => setDuplicateForm({ ...duplicateForm, title: e.target.value })}
                  placeholder="Contoh: Mine Surveyor & Operator Drone - Batch 3"
                  className="w-full border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Nomor batch otomatis diurutkan agar tidak bertabrakan dengan batch yang telah ada.
                </span>
              </div>

              {/* Field 2: Kuota Kebutuhan Tenaga Kerja */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Alokasi Kuota Kebutuhan (Orang):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={duplicateForm.quota}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, quota: parseInt(e.target.value, 10) || 1 })}
                    className="w-32 border border-neutral-300 px-3 py-2 text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white"
                  />
                  <span className="text-neutral-600 text-xs">
                    Orang talenta yang ingin direkrut pada batch ini
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Ubah jika kebutuhan jumlah tenaga kerja di batch ini berbeda dari batch sebelumnya (misal dari 2 menjadi 1).
                </span>
              </div>

              {/* Field 3: Gaji / Uang Saku */}
              {vacancy?.opportunityType === 'INTERNSHIP' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                    Uang Saku Bulanan Pemagangan (Rp):
                  </label>
                  <input
                    type="number"
                    value={duplicateForm.stipendAmount}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, stipendAmount: e.target.value })}
                    placeholder="Contoh: 2500000"
                    className="w-full border border-neutral-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-neutral-900 bg-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                      Gaji Minimum (Rp):
                    </label>
                    <input
                      type="number"
                      value={duplicateForm.salaryMin}
                      onChange={(e) => setDuplicateForm({ ...duplicateForm, salaryMin: e.target.value })}
                      placeholder="Contoh: 8000000"
                      className="w-full border border-neutral-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-neutral-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                      Gaji Maksimum (Rp):
                    </label>
                    <input
                      type="number"
                      value={duplicateForm.salaryMax}
                      onChange={(e) => setDuplicateForm({ ...duplicateForm, salaryMax: e.target.value })}
                      placeholder="Contoh: 12000000"
                      className="w-full border border-neutral-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-neutral-900 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Field 4: Durasi Proyek / Kontrak */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Durasi Kontrak / Proyek:
                </label>
                <input
                  type="text"
                  value={duplicateForm.projectDuration}
                  onChange={(e) => setDuplicateForm({ ...duplicateForm, projectDuration: e.target.value })}
                  placeholder="Contoh: 1 Tahun (Kontrak PKWT Proyek)"
                  className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 bg-white"
                />
              </div>

              {/* Footer Modal */}
              <div className="pt-3 border-t border-neutral-200 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  disabled={duplicating}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={duplicating}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>{duplicating ? 'Menerbitkan Batch...' : 'Terbitkan Batch Baru & Mulai Screening'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal {...alertProps} />
    </AppShell>
  );
}
