'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { 
  Sparkles, 
  ArrowLeft, 
  UserCheck, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ShieldAlert,
  User,
  FileText,
  ExternalLink
} from 'lucide-react';

export default function CandidateDiscoveryPage() {
  const params = useParams();
  const router = useRouter();
  const vacancyId = params?.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [vacancyTitle, setVacancyTitle] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approachingId, setApproachingId] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    if (vacancyId) {
      loadCandidates();
    }
  }, [vacancyId]);

  const loadCandidates = async () => {
    setLoading(true);
    setError('');

    // 1. Ambil Profil Perusahaan
    const empRes = await apiFetch('/employers/me');
    if (empRes.status !== 'success') {
      router.push('/login');
      return;
    }
    setProfile(empRes.data);

    // 2. Panggil AI Matching Engine
    const res = await apiFetch(`/vacancies/${vacancyId}/candidates`);
    if (res.status === 'success') {
      setVacancyTitle(res.vacancyTitle || res.data?.vacancyTitle || '');
      setCandidates(res.candidates || res.data?.candidates || []);
    } else {
      setError(res.message || 'Gagal memuat kandidat.');
    }
    setLoading(false);
  };

  // Handle Tombol Approach / Hubungi (Panggilan API Sungguhan)
  const handleApproach = async (talentId: string, candidateName: string) => {
    setApproachingId(talentId);
    setNotificationMessage('');

    const res = await apiFetch(`/vacancies/${vacancyId}/approach/${talentId}`, {
      method: 'POST',
    });

    setApproachingId(null);
    if (res.status === 'success') {
      const contact = res.data?.talentContact;
      setNotificationMessage(
        `Notifikasi resmi terkirim ke ${candidateName}! Kontak pelamar: ${contact?.phone || '-'} (${contact?.email}). Anda kini dapat menindaklanjuti secara langsung di luar aplikasi.`
      );
      // Perbarui status lokal di layar
      setCandidates(
        candidates.map((c) =>
          c.talentId === talentId
            ? { ...c, isApproached: true, phone: contact?.phone || c.phone }
            : c
        )
      );
    } else {
      setError(res.message || 'Gagal menghubungi kandidat.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        AI Matching Engine Sedang Menganalisis Seluruh Talenta Mimika...
      </div>
    );
  }

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Rekomendasi */}
        <div className="bg-white border border-neutral-300 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
            <div>
              <Link
                href="/employer/vacancies"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 mb-2 uppercase tracking-wider font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Daftar Lowongan
              </Link>
              <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" />
                Rekomendasi AI: {vacancyTitle}
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Daftar di bawah diurutkan berdasarkan skor kecocokan multi-faktor (Keahlian, Pengalaman Fuzzy, Social DNA, dan Jarak).
              </p>
            </div>

            <div className="text-right w-full sm:w-auto bg-neutral-50 sm:bg-transparent p-3 sm:p-0 border sm:border-0 border-neutral-200">
              <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                Total Kandidat Teranalisis
              </div>
              <div className="text-2xl font-bold text-neutral-900">{candidates.length} Talenta</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-600 mt-3">
            <span className="font-semibold text-neutral-900">Paradigma Reverse Recruitment:</span>
            Pelamar tidak perlu melamar. Klik tombol &quot;Approach / Hubungi&quot; untuk membuka kontak langsung.
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notificationMessage && (
          <div className="p-4 bg-green-50 border border-green-300 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notificationMessage}</span>
          </div>
        )}

        {/* List Kandidat Tanpa Nested Box */}
        <div className="bg-white border border-neutral-300">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Peringkat Kandidat Terpilih
            </span>
            <span className="text-[11px] text-neutral-600">
              Diperbarui secara real-time
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-600">
              Tidak ada kandidat yang memenuhi kriteria pencarian untuk lowongan ini.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {candidates.map((cand, idx) => (
                <div key={cand.talentId} className="p-6 space-y-4 hover:bg-neutral-50/50 transition-colors">
                  {/* Baris Utama: Nama, Skor, & Tombol Approach */}
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
                              Fuzzy Equivalence
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Pendidikan: <span className="font-semibold text-neutral-800">{cand.lastEducationDegree}</span> &bull; 
                          Pengalaman: <span className="font-semibold text-neutral-800">{(cand.totalExperienceMonths / 12).toFixed(1)} Tahun ({cand.totalExperienceMonths} Bulan)</span>
                        </p>
                      </div>
                    </div>

                    {/* Skor Match & Tombol Action */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-100 pt-3 sm:pt-0">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                          Kecocokan AI
                        </div>
                        <div className={`text-2xl font-bold font-mono ${
                          cand.overallScore >= 75 ? 'text-green-700' : 'text-neutral-900'
                        }`}>
                          {cand.overallScore}%
                        </div>
                      </div>

                      <button
                        onClick={() => handleApproach(cand.talentId, cand.fullName)}
                        disabled={cand.isApproached || approachingId === cand.talentId}
                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                          cand.isApproached
                            ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                        }`}
                      >
                        {cand.isApproached ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                            <span>Telah Dihubungi</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{approachingId === cand.talentId ? 'Memproses...' : 'Approach / Hubungi'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Explainable AI Reasoning Box (Flat, Sharp) */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
                    <span className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider block mb-1">
                      Analisis Kecerdasan Buatan:
                    </span>
                    {cand.aiReasoning}
                  </div>

                  {/* Rincian 4 Vektor Penilaian (Skills, Exp, Social DNA, Jarak) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="border border-neutral-200 p-2.5">
                      <span className="text-[10px] text-neutral-600 uppercase block">Keahlian (40%)</span>
                      <span className="font-bold text-sm text-neutral-900 font-mono">
                        {cand.breakdown?.skillMatchScore}%
                      </span>
                    </div>
                    <div className="border border-neutral-200 p-2.5">
                      <span className="text-[10px] text-neutral-600 uppercase block">Pengalaman (30%)</span>
                      <span className="font-bold text-sm text-neutral-900 font-mono">
                        {cand.breakdown?.experienceMatchScore}%
                      </span>
                    </div>
                    <div className="border border-neutral-200 p-2.5">
                      <span className="text-[10px] text-neutral-600 uppercase block">Social DNA (20%)</span>
                      <span className="font-bold text-sm text-neutral-900 font-mono">
                        {cand.breakdown?.socialDnaMatchScore}%
                      </span>
                    </div>
                    <div className="border border-neutral-200 p-2.5">
                      <span className="text-[10px] text-neutral-600 uppercase block">Jarak GIS (10%)</span>
                      <span className="font-bold text-sm text-neutral-900 font-mono">
                        {cand.breakdown?.distanceMatchScore}% {cand.breakdown?.distanceKm !== undefined ? `(${cand.breakdown.distanceKm} Km)` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Keahlian yang Dimiliki */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-600 uppercase mr-1">
                      Keahlian:
                    </span>
                    {cand.topSkills && cand.topSkills.length > 0 ? (
                      cand.topSkills.map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="text-[10px] bg-white border border-neutral-300 text-neutral-800 px-2 py-0.5">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-neutral-600 italic">Tidak ada keahlian terdaftar</span>
                    )}
                  </div>

                  {/* Sertifikat Terverifikasi PDF */}
                  {Array.isArray(cand.certifications) && cand.certifications.some((c: any) => c.fileUrl) && (
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-neutral-500">Berkas PDF:</span>
                      {cand.certifications.filter((c: any) => c.fileUrl).map((c: any, cIdx: number) => (
                        <a
                          key={cIdx}
                          href={`/viewer?url=${encodeURIComponent(getFullMediaUrl(c.fileUrl) || '')}&name=${encodeURIComponent(c.name || 'Sertifikat')}&issuer=${encodeURIComponent(c.issuer || '')}&talent=${encodeURIComponent(cand.fullName || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[10px] font-mono font-medium transition-colors"
                        >
                          <FileText className="w-3 h-3 text-neutral-600" />
                          <span>{c.name || 'Sertifikat'}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                        </a>
                      ))}
                    </div>
                  )}

                  {cand.phone && cand.isApproached && (
                      <span className="ml-auto text-xs font-mono font-bold text-neutral-900 bg-neutral-100 border border-neutral-300 px-2 py-0.5">
                        Kontak: {cand.phone}
                      </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
