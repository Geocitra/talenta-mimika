'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
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
  AlertCircle
} from 'lucide-react';

export default function TalentTrainingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'MY_TRAININGS' | 'CATALOG'>('MY_TRAININGS');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const profileRes = await apiFetch('/talents/me');
    if (profileRes.status !== 'success') {
      router.push('/login');
      return;
    }
    setProfile(profileRes.data);

    // Ambil Katalog Pelatihan Daerah
    const catalogRes = await apiFetch('/trainings/catalog');
    if (catalogRes.status === 'success') {
      setCatalog(catalogRes.data || []);
    }

    // Ambil Kelas yang Diikuti Saya
    const enrollRes = await apiFetch('/trainings/my/enrollments');
    if (enrollRes.status === 'success') {
      setMyEnrollments(enrollRes.data || []);
      // Jika belum punya kelas yang diikuti, buka katalog secara default
      if ((enrollRes.data || []).length === 0) {
        setActiveTab('CATALOG');
      }
    }

    setLoading(false);
  };

  const handleEnroll = async (programId: string, programTitle: string) => {
    setEnrollingId(programId);
    setMessage('');
    setError('');

    const res = await apiFetch(`/trainings/${programId}/enroll`, {
      method: 'POST',
    });

    setEnrollingId(null);
    if (res.status === 'success') {
      setMessage(`Pendaftaran berhasil! Anda kini terdaftar di kelas "${programTitle}".`);
      loadData();
      setActiveTab('MY_TRAININGS');
    } else {
      setError(res.message || 'Gagal mendaftar pelatihan.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        Memuat Program Pelatihan Daerah...
      </div>
    );
  }

  return (
    <AppShell userRole="TALENT" userName={profile?.fullName || 'Kandidat'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Modul Pelatihan */}
        <div className="bg-white border border-neutral-300 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2 py-0.5 mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Upskilling & Sertifikasi Daerah
              </span>
              <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                Pusat Pengembangan Kompetensi
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Ikuti pelatihan resmi Disnakertrans Mimika untuk meningkatkan kompetensi dan mendongkrak skor AI di radar pencarian perusahaan.
              </p>
            </div>

            <div className="flex border border-neutral-300 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('MY_TRAININGS')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'MY_TRAININGS'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Pelatihan Saya ({myEnrollments.length})
              </button>
              <button
                onClick={() => setActiveTab('CATALOG')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'CATALOG'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Katalog Program ({catalog.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-600 mt-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            <span>
              <strong>The Closed-Loop Synergy:</strong> Setiap program yang Anda selesaikan akan otomatis menginjeksi keahlian baru ke profil Anda tanpa perlu input manual.
            </span>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-green-50 border border-green-300 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: PELATIHAN SAYA */}
        {activeTab === 'MY_TRAININGS' && (
          <div className="bg-white border border-neutral-300">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Program yang Sedang Anda Ikuti
              </span>
              <span className="text-[11px] text-neutral-600 font-medium">
                Pilih kelas untuk melanjutkan pembelajaran
              </span>
            </div>

            {myEnrollments.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-600 space-y-3">
                <BookOpen className="w-8 h-8 text-neutral-400 mx-auto" />
                <p>Anda belum terdaftar dalam program pelatihan apa pun.</p>
                <button
                  onClick={() => setActiveTab('CATALOG')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
                >
                  Jelajahi Katalog Pelatihan
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {myEnrollments.map((enr) => {
                  const isCompleted = enr.status === 'COMPLETED';
                  const totalSessions = enr.program?.sessions?.length || enr.program?.totalSessions || 1;
                  const progressPct = isCompleted 
                    ? 100 
                    : Math.min(100, Math.round(((enr.currentSessionUnlocked - 1) / totalSessions) * 100));

                  return (
                    <div key={enr.id} className="p-6 space-y-4 hover:bg-neutral-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold uppercase text-neutral-900">
                              {enr.program?.title}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                              isCompleted 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                            }`}>
                              {enr.status}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            Penyelenggara: <span className="font-semibold text-neutral-800">{enr.program?.providerName}</span> &bull; 
                            Mode: <span className="font-semibold text-neutral-800">{enr.program?.deliveryMode}</span>
                          </p>
                        </div>

                        <Link
                          href={`/talent/trainings/${enr.programId}/learn`}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors shrink-0"
                        >
                          <span>{isCompleted ? 'Tinjau Materi' : 'Masuk Ruang Kelas'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Progress Belajar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] text-neutral-600">
                          <span>Progress Pembelajaran: Sesi {isCompleted ? totalSessions : enr.currentSessionUnlocked} dari {totalSessions}</span>
                          <span className="font-bold text-neutral-900">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2">
                          <div
                            className={`h-2 transition-all duration-500 ${isCompleted ? 'bg-green-700' : 'bg-neutral-900'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Sertifikat Banner Jika Lulus */}
                      {isCompleted && (
                        <div className="p-3.5 bg-green-50 border border-green-200 text-xs text-green-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-700 shrink-0" />
                            <span>
                              <strong>Selamat! Anda Lulus Resmi:</strong> Sertifikat No. <span className="font-mono font-bold">{enr.certificateNumber}</span>
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-bold bg-green-200 text-green-900 px-2 py-0.5">
                            Keahlian Terinjeksi ke Profil
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KATALOG PELATIHAN DAERAH */}
        {activeTab === 'CATALOG' && (
          <div className="bg-white border border-neutral-300">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Daftar Program Terbuka untuk Pendaftaran
              </span>
              <span className="text-[11px] text-neutral-600">
                Pilih program untuk meningkatkan radar kecocokan Anda
              </span>
            </div>

            {catalog.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-600">
                Belum ada program pelatihan yang dibuka saat ini.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {catalog.map((prog) => {
                  const isAlreadyEnrolled = myEnrollments.some((e) => e.programId === prog.id);

                  return (
                    <div key={prog.id} className="p-6 space-y-3 hover:bg-neutral-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold uppercase text-neutral-900">
                              {prog.title}
                            </h2>
                            <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 text-neutral-800 px-1.5 py-0.5">
                              {prog.deliveryMode}
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 text-neutral-800 px-1.5 py-0.5">
                              {prog.category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 max-w-2xl">
                            {prog.description}
                          </p>
                          <div className="text-[11px] text-neutral-600 flex items-center gap-3 pt-1">
                            <span>Penyelenggara: <strong>{prog.providerName}</strong></span>
                            <span>&bull;</span>
                            <span>Total: <strong>{prog.sessions?.length || prog.totalSessions} Sesi Materi</strong></span>
                            <span>&bull;</span>
                            <span>Standar Ujian: <strong>Passing Grade {prog.passingGrade}%</strong></span>
                          </div>
                        </div>

                        {isAlreadyEnrolled ? (
                          <Link
                            href={`/talent/trainings/${prog.id}/learn`}
                            className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
                          >
                            <Check className="w-3.5 h-3.5 text-green-700" />
                            <span>Sudah Terdaftar</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleEnroll(prog.id, prog.title)}
                            disabled={enrollingId === prog.id}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                          >
                            <span>{enrollingId === prog.id ? 'Memproses...' : 'Daftar Kelas'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Target Keahlian yang Didapatkan */}
                      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-neutral-600 tracking-wider">
                          Keahlian yang Dihadiahkan:
                        </span>
                        {Array.isArray(prog.targetSkills) && prog.targetSkills.map((sk: any, skIdx: number) => (
                          <span 
                            key={skIdx} 
                            className="text-[10px] bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold px-2 py-0.5 flex items-center gap-1"
                          >
                            <Award className="w-3 h-3 text-neutral-700" />
                            {sk.name} ({sk.level})
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
