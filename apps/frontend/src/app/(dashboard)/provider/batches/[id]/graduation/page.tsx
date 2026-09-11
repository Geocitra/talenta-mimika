'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Check,
  X,
  FileCheck,
  Sparkles,
  ShieldCheck,
  Search,
  RefreshCw
} from 'lucide-react';

interface ParticipantRow {
  enrollmentId: string;
  talentId: string;
  fullName: string;
  nik: string;
  phone?: string;
  email: string;
  isPassed: boolean;
  finalScore: number;
  certificateNumber?: string;
  bnspCertificateNumber?: string;
  selectionStatus: string;
}

export default function BatchGraduationPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const { alertProps, showAlert } = useAlertModal();

  const [batchData, setBatchData] = useState<any>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto numbering config
  const [autoNumbering, setAutoNumbering] = useState(true);
  const [certPrefix, setCertPrefix] = useState('CERT-BNSP-MIMIKA-2026');

  useEffect(() => {
    loadParticipants();
  }, [batchId]);

  const loadParticipants = async () => {
    setLoading(true);
    const res = await apiFetch(`/training-providers/batches/${batchId}/participants`);
    if (res.status !== 'success') {
      showAlert('error', 'Gagal Mengambil Data', res.message || 'Batch tidak ditemukan.');
      setLoading(false);
      return;
    }

    const d = res.data;
    setBatchData(d);

    const rows: ParticipantRow[] = (d.participants || []).map((p: any) => ({
      enrollmentId: p.enrollmentId,
      talentId: p.talentId,
      fullName: p.fullName,
      nik: p.nik,
      phone: p.phone,
      email: p.email,
      isPassed: p.selectionStatus === 'COMPLETED' ? true : true, // Default checklist lulus
      finalScore: p.finalScore || 85,
      certificateNumber: p.certificateNumber || '',
      bnspCertificateNumber: p.bnspCertificateNumber || '',
      selectionStatus: p.selectionStatus,
    }));

    setParticipants(rows);
    setLoading(false);
  };

  const handleTogglePassed = (index: number) => {
    const updated = [...participants];
    updated[index].isPassed = !updated[index].isPassed;
    setParticipants(updated);
  };

  const handleRowChange = (index: number, field: keyof ParticipantRow, val: any) => {
    const updated = [...participants];
    (updated[index] as any)[field] = val;
    setParticipants(updated);
  };

  const handleSelectAll = (passStatus: boolean) => {
    setParticipants(participants.map((p) => ({ ...p, isPassed: passStatus })));
  };

  const handleExecuteGraduation = async () => {
    if (participants.length === 0) {
      showAlert('warning', 'Tidak Ada Peserta', 'Batch ini belum memiliki peserta terdaftar.');
      return;
    }

    const passedTotal = participants.filter((p) => p.isPassed).length;
    const targetSkillNames = (batchData?.targetSkills || []).map((s: any) => typeof s === 'string' ? s : s.name).join(', ');

    setSubmitting(true);
    const payload = {
      autoNumbering,
      certificatePrefix: certPrefix.trim() || undefined,
      participants: participants.map((p) => ({
        talentId: p.talentId,
        isPassed: p.isPassed,
        finalScore: Number(p.finalScore) || 85,
        certificateNumber: p.certificateNumber?.trim() || undefined,
        bnspCertificateNumber: p.bnspCertificateNumber?.trim() || undefined,
      })),
    };

    const res = await apiFetch(`/training-providers/batches/${batchId}/graduate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.status === 'success') {
      showAlert(
        'success',
        'Kelulusan Massal Berhasil Disahkan!',
        `${res.data.passedCount} talenta resmi dinyatakan lulus. Seluruh keahlian (${targetSkillNames}) telah otomatis terinjeksi ke profil talenta dengan status terverifikasi resmi daerah!`,
        'Kembali ke Dasbor Balai →',
        () => {
          router.push('/provider');
        },
      );
    } else {
      showAlert('error', 'Eksekusi Gagal', res.message || 'Terjadi kesalahan sistem.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Memuat Peserta Batch...
          </div>
        </div>
      </div>
    );
  }

  const filteredParticipants = participants.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nik.includes(searchQuery),
  );

  const passedCount = participants.filter((p) => p.isPassed).length;

  return (
    <AppShell userRole="TRAINING_PROVIDER" userName="Meja Kelulusan Balai">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigasi Kembali */}
        <div className="flex items-center justify-between">
          <Link
            href="/provider"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor Balai</span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-200 text-neutral-700">
            BATCH ID: {batchId.substring(0, 8)}...
          </span>
        </div>

        {/* Header Batch & Ringkasan */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-neutral-900 text-white font-mono">
                MEJA KELULUSAN MASSAL
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300">
                THE CLOSED-LOOP SYNERGY
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-900">
              {batchData?.batchName}
            </h1>
            <p className="text-xs text-neutral-600 font-medium">
              Program: <strong>{batchData?.programTitle}</strong> (Kuota: {batchData?.quota} Kursi)
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500 font-semibold">Target Keahlian Auto-Injeksi:</span>
              {(batchData?.targetSkills || []).map((sk: any, idx: number) => {
                const sName = typeof sk === 'string' ? sk : sk.name;
                const sLevel = typeof sk === 'object' ? sk.level : 'EXPERT';
                return (
                  <span
                    key={idx}
                    className="text-[11px] font-bold px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-800"
                  >
                    {sName} ({sLevel})
                  </span>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 bg-neutral-50 border border-neutral-300 p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Peserta Ditandai Lulus
            </div>
            <div className="text-2xl font-bold text-neutral-900 font-mono">
              {passedCount} / {participants.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              Siap diinjeksi ke radar
            </div>
          </div>
        </div>

        {/* Panel Konfigurasi Auto-Numbering & Prefix */}
        <div className="bg-white border border-neutral-300 p-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2 flex items-center justify-between">
            <span>Konfigurasi Penomoran Sertifikat Digital & QR Hash</span>
            <FileCheck className="w-4 h-4 text-neutral-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                Prefix Nomor Sertifikat STTP / Balai
              </label>
              <input
                type="text"
                value={certPrefix}
                onChange={(e) => setCertPrefix(e.target.value)}
                placeholder="CERT-BNSP-MIMIKA-2026"
                className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center h-9">
              <label className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNumbering}
                  onChange={(e) => setAutoNumbering(e.target.checked)}
                />
                <span><strong>Auto-Numbering Berurut</strong> (misal: -001, -002, -003)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-3 py-2 border border-neutral-300 hover:border-neutral-900 text-[11px] font-bold uppercase tracking-wider text-neutral-800"
              >
                Tandai Semua Lulus
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-3 py-2 border border-neutral-300 hover:border-neutral-900 text-[11px] font-bold uppercase tracking-wider text-neutral-800"
              >
                Batal Semua
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Checklist Peserta Batch */}
        <div className="bg-white border border-neutral-300 space-y-4">
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama talenta atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="text-xs text-neutral-600 font-medium">
              Menampilkan {filteredParticipants.length} dari {participants.length} Peserta
            </div>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Tidak ada data peserta yang cocok dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase font-mono text-[10px]">
                    <th className="p-3.5 w-16 text-center">Status</th>
                    <th className="p-3.5">Nama Siswa & NIK</th>
                    <th className="p-3.5">Kontak WhatsApp</th>
                    <th className="p-3.5 w-24">Nilai Akhir</th>
                    <th className="p-3.5">No. Lisensi BNSP (Manual Opsional)</th>
                    <th className="p-3.5">No. Sertifikat STTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredParticipants.map((p, idx) => (
                    <tr
                      key={p.talentId}
                      className={`hover:bg-neutral-50 transition-colors ${
                        p.isPassed ? 'bg-white' : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {/* Kolom Checklist Status */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePassed(idx)}
                          className={`w-7 h-7 border flex items-center justify-center mx-auto transition-colors cursor-pointer ${
                            p.isPassed
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-300 border-neutral-300 hover:border-neutral-600'
                          }`}
                          title={p.isPassed ? 'Status: LULUS (Klik untuk gagalkan)' : 'Status: GAGAL (Klik untuk luluskan)'}
                        >
                          {p.isPassed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Kolom Identitas Talenta */}
                      <td className="p-3.5">
                        <div className="font-bold text-neutral-900 text-sm">
                          {p.fullName}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          NIK: {p.nik}
                        </div>
                      </td>

                      {/* Kolom Kontak */}
                      <td className="p-3.5">
                        <div className="text-neutral-700 font-medium">
                          {p.phone || '-'}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[160px]">
                          {p.email}
                        </div>
                      </td>

                      {/* Kolom Nilai Akhir */}
                      <td className="p-3.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={p.finalScore}
                          disabled={!p.isPassed}
                          onChange={(e) => handleRowChange(idx, 'finalScore', Number(e.target.value))}
                          className="w-20 border border-neutral-300 p-1.5 text-center font-mono text-xs focus:border-neutral-900 focus:outline-none disabled:bg-neutral-200"
                        />
                      </td>

                      {/* Kolom No. Sertifikat BNSP */}
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={p.bnspCertificateNumber || ''}
                          disabled={!p.isPassed}
                          onChange={(e) => handleRowChange(idx, 'bnspCertificateNumber', e.target.value)}
                          placeholder="Misal: BNSP-WELD-9921"
                          className="w-full border border-neutral-300 p-1.5 font-mono text-xs focus:border-neutral-900 focus:outline-none disabled:bg-neutral-200"
                        />
                      </td>

                      {/* Kolom No. Sertifikat STTP */}
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={p.certificateNumber || ''}
                          disabled={!p.isPassed || autoNumbering}
                          onChange={(e) => handleRowChange(idx, 'certificateNumber', e.target.value)}
                          placeholder={autoNumbering ? `Otomatis (${certPrefix}-00${idx + 1})` : 'Manual'}
                          className="w-full border border-neutral-300 p-1.5 font-mono text-xs focus:border-neutral-900 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tombol Eksekusi Kelulusan Massal */}
          <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-neutral-600">
              Menekan tombol eksekusi akan menjalankan <strong>Prisma Transaction Atomik</strong> yang otomatis memperbarui status siswa, menerbitkan nomor registrasi sertifikat, dan menginjeksi target skills ke profil talenta.
            </div>

            <button
              type="button"
              onClick={handleExecuteGraduation}
              disabled={submitting || participants.length === 0}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer disabled:bg-neutral-400"
            >
              <Award className="w-4 h-4" />
              <span>{submitting ? 'Mengeksekusi Kelulusan...' : `Sahkan Kelulusan (${passedCount} Lulus)`}</span>
            </button>
          </div>
        </div>

      </div>

      <AlertModal {...alertProps} />
    </AppShell>
  );
}
