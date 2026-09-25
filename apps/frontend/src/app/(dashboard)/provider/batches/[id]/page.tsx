'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Search,
  RefreshCw,
  Award,
  CreditCard,
  Building2,
  FileText,
  Eye,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface Candidate {
  enrollmentId: string;
  talentId: string;
  fullName: string;
  nik: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  domicile: string;
  selectionStatus: 'REGISTERED' | 'PENDING_PAYMENT' | 'ADMITTED' | 'REJECTED_SELECTION' | 'COMPLETED' | 'DROPPED_OUT';
  paymentProofUrl?: string;
  paymentConfirmedAt?: string;
  selectionNotes?: string;
  enrolledAt: string;
}

interface BatchSummary {
  quota: number;
  admittedCount: number;
  seatsLeft: number;
  registeredCount: number;
  pendingPaymentCount: number;
  rejectedCount: number;
  totalApplicants: number;
}

interface BatchDetail {
  id: string;
  batchName: string;
  batchNumber: number;
  fundingType: 'GRATIS_APBD_MIMIKA' | 'BEASISWA_CSR' | 'MANDIRI_BERBAYAR';
  priceAmount?: number;
  trainingMethod: string;
  quota: number;
  isOpen: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  paymentInstructions?: string;
  registrationStart: string;
  registrationEnd: string;
  trainingStart: string;
  trainingEnd: string;
  program: {
    id: string;
    title: string;
    programCode: string;
  };
}

export default function BatchAdmissionDeskPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const { alertProps, showAlert } = useAlertModal();

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTION_REQUIRED' | 'ADMITTED' | 'REJECTED'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal notes / slip viewer
  const [activeSlipUrl, setActiveSlipUrl] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'ADMIT' | 'REJECT';
    candidate: Candidate | null;
    notes: string;
  }>({
    isOpen: false,
    type: 'ADMIT',
    candidate: null,
    notes: '',
  });

  useEffect(() => {
    loadCandidates();
  }, [batchId]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/training-providers/batches/${batchId}/candidates`);
      if (res.status === 'success' && res.data) {
        setBatch(res.data.batch);
        setSummary(res.data.summary);
        setCandidates(res.data.candidates || []);
      } else {
        showAlert('error', 'Gagal Memuat Data', res.message || 'Batch tidak ditemukan.');
      }
    } catch (err: any) {
      showAlert('error', 'Kesalahan Jaringan', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (candidate: Candidate, type: 'ADMIT' | 'REJECT') => {
    const defaultNote =
      type === 'ADMIT'
        ? batch?.fundingType === 'MANDIRI_BERBAYAR'
          ? 'Bukti transfer valid & pelunasan biaya telah dikonfirmasi oleh balai.'
          : 'Lolos verifikasi KTP Kabupaten Mimika dan wawancara fisik.'
        : 'Belum memenuhi persyaratan administratif atau kuota seleksi.';

    setActionModal({
      isOpen: true,
      type,
      candidate,
      notes: defaultNote,
    });
  };

  const handleExecuteAction = async () => {
    if (!actionModal.candidate) return;
    const candidate = actionModal.candidate;
    const isAdmit = actionModal.type === 'ADMIT';
    const endpoint = isAdmit
      ? `/training-providers/batches/${batchId}/enrollments/${candidate.enrollmentId}/admit`
      : `/training-providers/batches/${batchId}/enrollments/${candidate.enrollmentId}/reject`;

    setProcessingId(candidate.enrollmentId);
    try {
      const res = await apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ notes: actionModal.notes }),
      });

      if (res.status === 'success') {
        showAlert(
          'success',
          isAdmit ? 'Siswa Berhasil Diterima' : 'Pendaftaran Ditolak',
          isAdmit
            ? `${candidate.fullName} resmi terdaftar (ADMITTED) dan kuota kursi fisik workshop telah dikunci.`
            : `Status pendaftaran ${candidate.fullName} telah diperbarui menjadi DITOLAK SELEKSI.`,
        );
        setActionModal({ isOpen: false, type: 'ADMIT', candidate: null, notes: '' });
        await loadCandidates();
      } else {
        showAlert('error', 'Gagal Memproses Tindakan', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal', err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchQuery =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    if (!matchQuery) return false;

    if (filterTab === 'ACTION_REQUIRED') {
      return c.selectionStatus === 'REGISTERED' || c.selectionStatus === 'PENDING_PAYMENT';
    }
    if (filterTab === 'ADMITTED') {
      return c.selectionStatus === 'ADMITTED' || c.selectionStatus === 'COMPLETED';
    }
    if (filterTab === 'REJECTED') {
      return c.selectionStatus === 'REJECTED_SELECTION';
    }
    return true;
  });

  const getFundingBadge = (type?: string) => {
    if (type === 'GRATIS_APBD_MIMIKA') {
      return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">APBD Mimika (Gratis)</span>;
    }
    if (type === 'BEASISWA_CSR') {
      return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">Beasiswa CSR</span>;
    }
    return <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">Mandiri Berbayar</span>;
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Lolos Seleksi (Kursi Terkunci)
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Menunggu Pembayaran
          </span>
        );
      case 'REGISTERED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            Menunggu Seleksi KTP & Tes
          </span>
        );
      case 'REJECTED_SELECTION':
        return (
          <span className="inline-flex items-center gap-1.5 bg-neutral-200 text-neutral-800 border border-neutral-300 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5 text-neutral-600" />
            Tidak Lolos Seleksi
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-indigo-700" />
            Lulus Pelatihan
          </span>
        );
      default:
        return (
          <span className="bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Membuka Meja Seleksi Balai...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell userRole="TRAINING_PROVIDER" userName="Lembaga Pelatihan">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/provider"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor Balai</span>
          </Link>

          <Link
            href={`/provider/batches/${batchId}/graduation`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Meja Kelulusan & BNSP</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Batch Header */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 border border-neutral-300">
                  {batch?.program.programCode}
                </span>
                {getFundingBadge(batch?.fundingType)}
                <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border ${
                  batch?.isOpen ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-neutral-200 text-neutral-700 border-neutral-400'
                }`}>
                  {batch?.isOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900">
                Meja Seleksi: {batch?.batchName}
              </h1>
              <p className="text-xs text-neutral-600">
                Program: <span className="font-bold text-neutral-900">{batch?.program.title}</span> • Metode: <span className="font-bold">{batch?.trainingMethod}</span>
              </p>
            </div>

            {batch?.fundingType === 'MANDIRI_BERBAYAR' && (
              <div className="border border-neutral-300 bg-neutral-50 p-3 sm:max-w-xs w-full text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-900 font-bold uppercase tracking-wider text-[11px]">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Rekening Lembaga</span>
                </div>
                <div className="font-mono text-neutral-800">
                  {batch.bankName}: <span className="font-bold">{batch.bankAccountNumber}</span>
                </div>
                <div className="text-[11px] text-neutral-600">
                  a.n. {batch.bankAccountHolder}
                </div>
                <div className="text-[11px] font-bold text-neutral-900 pt-1">
                  Biaya: Rp {Number(batch.priceAmount || 0).toLocaleString('id-ID')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-neutral-300 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Kuota Workshop</div>
            <div className="text-2xl font-mono font-bold text-neutral-900 mt-1">{summary?.quota || 0}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Kapasitas Maksimal</div>
          </div>

          <div className="bg-white border border-emerald-300 p-4 bg-emerald-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Resmi Diterima</div>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">{summary?.admittedCount || 0}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Kursi Terkunci</div>
          </div>

          <div className="bg-white border border-neutral-300 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Sisa Kuota</div>
            <div className="text-2xl font-mono font-bold text-neutral-900 mt-1">{summary?.seatsLeft || 0}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Kursi Tersedia</div>
          </div>

          <div className="bg-white border border-blue-300 p-4 bg-blue-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Perlu Seleksi KTP</div>
            <div className="text-2xl font-mono font-bold text-blue-700 mt-1">{summary?.registeredCount || 0}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Menunggu Tes Fisik</div>
          </div>

          <div className="bg-white border border-amber-300 p-4 bg-amber-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Menunggu Bayar</div>
            <div className="text-2xl font-mono font-bold text-amber-700 mt-1">{summary?.pendingPaymentCount || 0}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Periksa Slip Bayar</div>
          </div>

          <div className="bg-white border border-neutral-300 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Ditolak Seleksi</div>
            <div className="text-2xl font-mono font-bold text-neutral-600 mt-1">{summary?.rejectedCount || 0}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Tidak Lolos Verifikasi</div>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="bg-white border border-neutral-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 border border-neutral-300 p-1 bg-neutral-100 overflow-x-auto">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                filterTab === 'ALL' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semua Pendaftar ({candidates.length})
            </button>
            <button
              onClick={() => setFilterTab('ACTION_REQUIRED')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                filterTab === 'ACTION_REQUIRED' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Perlu Tindakan ({(summary?.registeredCount || 0) + (summary?.pendingPaymentCount || 0)})
            </button>
            <button
              onClick={() => setFilterTab('ADMITTED')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                filterTab === 'ADMITTED' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Diterima ({summary?.admittedCount || 0})
            </button>
            <button
              onClick={() => setFilterTab('REJECTED')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                filterTab === 'REJECTED' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Ditolak ({summary?.rejectedCount || 0})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, atau no telp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Candidate Queue List */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white border border-neutral-300 p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-neutral-400 mx-auto" />
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Tidak Ada Pendaftar Dalam Kategori Ini
            </div>
            <p className="text-xs text-neutral-500">
              Gunakan tab filter lain atau bagikan tautan program ke pencari kerja Mimika.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCandidates.map((c) => {
              const isActionable = c.selectionStatus === 'REGISTERED' || c.selectionStatus === 'PENDING_PAYMENT';
              const isAdmitted = c.selectionStatus === 'ADMITTED' || c.selectionStatus === 'COMPLETED';

              return (
                <div
                  key={c.enrollmentId}
                  className={`bg-white border p-5 transition-all ${
                    isAdmitted
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isActionable
                      ? 'border-neutral-400 shadow-sm'
                      : 'border-neutral-200 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Identity & Domicile */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {c.fullName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-neutral-900">{c.fullName}</span>
                          {getStatusPill(c.selectionStatus)}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-600 flex-wrap">
                          <span>NIK: <strong className="font-mono">{c.nik}</strong></span>
                          <span>•</span>
                          <span>Domisili: <strong>{c.domicile}</strong></span>
                          <span>•</span>
                          <span>Daftar: {new Date(c.enrolledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {c.selectionNotes && (
                          <div className="text-[11px] text-neutral-600 bg-neutral-100 p-1.5 border border-neutral-200 mt-1">
                            <strong>Catatan Balai:</strong> {c.selectionNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Payment Proof (If Paid Batch) */}
                    <div className="flex items-center gap-3">
                      {c.paymentProofUrl ? (
                        <button
                          type="button"
                          onClick={() => setActiveSlipUrl(c.paymentProofUrl!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-neutral-700" />
                          <span>Lihat Bukti Bayar</span>
                        </button>
                      ) : batch?.fundingType === 'MANDIRI_BERBAYAR' ? (
                        <div className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-1 border border-amber-200">
                          Belum unggah slip transfer
                        </div>
                      ) : null}

                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(c.fullName)},%20kami%20dari%20${encodeURIComponent(batch?.program.title || 'Balai Pelatihan')}%20ingin%20mengonfirmasi%20pendaftaran%20batch%20Anda.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-400 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Hubungi WA</span>
                        </a>
                      )}
                    </div>

                    {/* Right: Operational Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isActionable ? (
                        <>
                          <button
                            type="button"
                            disabled={processingId === c.enrollmentId}
                            onClick={() => handleOpenActionModal(c, 'ADMIT')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>
                              {batch?.fundingType === 'MANDIRI_BERBAYAR'
                                ? 'Konfirmasi Lunas & Terima'
                                : 'Terima Siswa (Lolos)'}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={processingId === c.enrollmentId}
                            onClick={() => handleOpenActionModal(c, 'REJECT')}
                            className="inline-flex items-center gap-1 px-3 py-2 border border-neutral-300 hover:border-red-500 hover:text-red-700 text-neutral-600 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : isAdmitted ? (
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Kursi Workshop Diamankan
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            Siap mengikuti sesi pelatihan
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(c, 'ADMIT')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Tinjau Ulang</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Action Modal (Admit / Reject) */}
      {actionModal.isOpen && actionModal.candidate && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-400 max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                {actionModal.type === 'ADMIT' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  {actionModal.type === 'ADMIT'
                    ? batch?.fundingType === 'MANDIRI_BERBAYAR'
                      ? 'Konfirmasi Pelunasan & Terima Siswa'
                      : 'Terima Siswa (Lolos Seleksi Vokasi)'
                    : 'Tolak Pendaftaran Seleksi'}
                </h3>
              </div>
              <button
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-1">
                <div>Nama Kandidat: <strong className="text-neutral-900">{actionModal.candidate.fullName}</strong></div>
                <div>NIK: <strong className="font-mono">{actionModal.candidate.nik}</strong></div>
                <div>Batch: <strong>{batch?.batchName}</strong></div>
              </div>

              {actionModal.type === 'ADMIT' ? (
                <p className="text-neutral-600 leading-relaxed">
                  Tindakan ini akan mengubah status kandidat menjadi <strong>ADMITTED (Resmi Diterima)</strong> dan secara permanen <strong>mengunci 1 kursi kuota fisik workshop</strong>.
                </p>
              ) : (
                <p className="text-neutral-600 leading-relaxed">
                  Kandidat akan ditolak dari gelombang ini dan kuota kursi tetap terbuka untuk pendaftar lain.
                </p>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Catatan Verifikasi / Alasan
                </label>
                <textarea
                  rows={3}
                  value={actionModal.notes}
                  onChange={(e) => setActionModal({ ...actionModal, notes: e.target.value })}
                  className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white ${
                  actionModal.type === 'ADMIT'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionModal.type === 'ADMIT' ? 'Konfirmasi Terima' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {activeSlipUrl && (
        <div className="fixed inset-0 bg-neutral-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-400 max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Bukti Transfer / Slip Pembayaran
                </h3>
              </div>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto border border-neutral-300 bg-neutral-100 flex items-center justify-center p-2">
              <img
                src={activeSlipUrl.startsWith('http') ? activeSlipUrl : `http://localhost:3000${activeSlipUrl}`}
                alt="Bukti Transfer"
                className="max-h-[55vh] object-contain mx-auto"
                onError={(e) => {
                  // fallback preview if local mock image
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/1e293b/ffffff?text=Bukti+Transfer+Terverifikasi';
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <a
                href={activeSlipUrl.startsWith('http') ? activeSlipUrl : `http://localhost:3000${activeSlipUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-neutral-900 inline-flex items-center gap-1 hover:underline"
              >
                <span>Buka Gambar Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => setActiveSlipUrl(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal {...alertProps} />
    </AppShell>
  );
}
