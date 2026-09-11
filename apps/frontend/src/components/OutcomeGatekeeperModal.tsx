'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Users, 
  Clock, 
  ShieldCheck, 
  Building2,
  ExternalLink,
  Ban
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface OutcomeGatekeeperModalProps {
  vacancy: any;
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export default function OutcomeGatekeeperModal({
  vacancy,
  isOpen,
  onClose,
  onResolved,
}: OutcomeGatekeeperModalProps) {
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [outcomeAction, setOutcomeAction] = useState<'HIRED_CANDIDATE' | 'EXTERNAL_HIRED' | 'CANCELLED' | 'EXTEND_TTL'>('HIRED_CANDIDATE');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !vacancy) return null;

  const approachedTalents = (vacancy.approaches || [])
    .filter((a: any) => a.status === 'APPROACHED' || a.status === 'SELECTED' || a.status === 'CONTACT_ACCESSED')
    .map((a: any) => a.talent);

  const toggleTalent = (id: string) => {
    if (selectedTalents.includes(id)) {
      setSelectedTalents(selectedTalents.filter((tId) => tId !== id));
    } else {
      setSelectedTalents([...selectedTalents, id]);
    }
  };

  const handleResolve = async () => {
    setErrorMsg('');
    if (outcomeAction === 'HIRED_CANDIDATE' && selectedTalents.length === 0 && approachedTalents.length > 0) {
      setErrorMsg('Pilih setidaknya satu talenta yang berhasil direkrut.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(`/vacancies/${vacancy.id}/resolve-outcome`, {
        method: 'PATCH',
        body: JSON.stringify({
          outcome: outcomeAction,
          selectedTalentIds: outcomeAction === 'HIRED_CANDIDATE' ? selectedTalents : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.status === 'success') {
        onResolved();
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan hasil rekrutmen.');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan jaringan saat menyimpan resolusi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border-2 border-neutral-900 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Outcome Gatekeeper (Permenaker 18/2024)
              </span>
              <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                Konfirmasi Hasil Akhir Lowongan Kedaluwarsa
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Info Lowongan */}
          <div className="bg-neutral-50 border border-neutral-200 p-3.5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Posisi Proyek
            </div>
            <div className="text-sm font-bold text-neutral-900 uppercase">
              {vacancy.title}
            </div>
            <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-2 pt-1">
              <span>Kuota: <strong>{vacancy.quota} Orang</strong></span>
              <span>&bull;</span>
              <span>Masa Aktif: <strong>{vacancy.activeDaysDuration || 14} Hari</strong></span>
              <span>&bull;</span>
              <span className="text-amber-800 font-semibold">Telah Melewati Batas Tayang</span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Lowongan ini belum difinalisasi dan telah melewati batas masa tayang. Mohon laporkan tindak lanjut rekrutmen ini untuk menjamin akurasi data penyerapan angkatan kerja Kabupaten Mimika:
          </p>

          {/* Opsi Outcome */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
              Pilih Status Akhir Lowongan:
            </label>

            {/* Opsi 1: Rekrut Talenta Platform */}
            <div 
              onClick={() => setOutcomeAction('HIRED_CANDIDATE')}
              className={`p-3 border cursor-pointer transition-colors ${
                outcomeAction === 'HIRED_CANDIDATE'
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input 
                  type="radio" 
                  checked={outcomeAction === 'HIRED_CANDIDATE'} 
                  onChange={() => setOutcomeAction('HIRED_CANDIDATE')}
                  className="mt-0.5"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900 uppercase">
                    Terisi oleh Talenta Platform
                  </div>
                  <div className="text-neutral-500 text-[11px]">
                    Kandidat terpilih resmi direkrut dan kuota lowongan ditutup resmi.
                  </div>
                </div>
              </div>

              {/* Sub-list Checklist Talenta jika opsi 1 aktif */}
              {outcomeAction === 'HIRED_CANDIDATE' && (
                <div className="mt-3 pl-6 space-y-1.5 pt-2 border-t border-neutral-200">
                  <div className="text-[10px] font-bold uppercase text-neutral-700">
                    Pilih Talenta yang Berhasil Direkrut:
                  </div>
                  {approachedTalents.length === 0 ? (
                    <div className="text-xs text-neutral-500 italic py-1">
                      Belum ada talenta yang didekati (*Approached*) pada lowongan ini.
                    </div>
                  ) : (
                    approachedTalents.map((t: any) => (
                      <label 
                        key={t.id} 
                        className="flex items-center gap-2 p-1.5 bg-white border border-neutral-200 text-xs cursor-pointer hover:bg-neutral-50"
                      >
                        <input 
                          type="checkbox"
                          checked={selectedTalents.includes(t.id)}
                          onChange={() => toggleTalent(t.id)}
                        />
                        <span className="font-semibold text-neutral-900">{t.fullName}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Opsi 2: Terisi dari Luar Platform */}
            <div 
              onClick={() => setOutcomeAction('EXTERNAL_HIRED')}
              className={`p-3 border cursor-pointer transition-colors ${
                outcomeAction === 'EXTERNAL_HIRED'
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input 
                  type="radio" 
                  checked={outcomeAction === 'EXTERNAL_HIRED'} 
                  onChange={() => setOutcomeAction('EXTERNAL_HIRED')}
                  className="mt-0.5"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900 uppercase">
                    Terisi dari Jalur Luar Platform
                  </div>
                  <div className="text-neutral-500 text-[11px]">
                    Posisi telah terisi oleh pelamar dari kanal internal perusahaan atau mitra fisik lain.
                  </div>
                </div>
              </div>
            </div>

            {/* Opsi 3: Batal Rekrutmen */}
            <div 
              onClick={() => setOutcomeAction('CANCELLED')}
              className={`p-3 border cursor-pointer transition-colors ${
                outcomeAction === 'CANCELLED'
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input 
                  type="radio" 
                  checked={outcomeAction === 'CANCELLED'} 
                  onChange={() => setOutcomeAction('CANCELLED')}
                  className="mt-0.5"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900 uppercase">
                    Dibatalkan / Belum Menemukan Kandidat
                  </div>
                  <div className="text-neutral-500 text-[11px]">
                    Kebutuhan proyek ditangguhkan atau dibatalkan oleh manajemen.
                  </div>
                </div>
              </div>
            </div>

            {/* Opsi 4: Perpanjang Masa Tayang */}
            <div 
              onClick={() => setOutcomeAction('EXTEND_TTL')}
              className={`p-3 border cursor-pointer transition-colors ${
                outcomeAction === 'EXTEND_TTL'
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input 
                  type="radio" 
                  checked={outcomeAction === 'EXTEND_TTL'} 
                  onChange={() => setOutcomeAction('EXTEND_TTL')}
                  className="mt-0.5"
                />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900 uppercase">
                    Perpanjang Masa Tayang 14 Hari
                  </div>
                  <div className="text-neutral-500 text-[11px]">
                    Proses rekrutmen masih berjalan. Buka kembali lowongan ke status AKTIF.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase text-neutral-700">
              Catatan Tindak Lanjut (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth: Kandidat mulai bekerja per 1 Oktober 2026..."
              className="w-full border border-neutral-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Tombol Aksi */}
        <div className="bg-neutral-100 border-t border-neutral-200 p-3.5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase tracking-wider bg-white hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
          >
            Nanti Saja
          </button>

          <button
            type="button"
            onClick={handleResolve}
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            {submitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Laporan Hasil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
