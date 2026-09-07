'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  Award, 
  HelpCircle, 
  AlertCircle, 
  Send, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Check
} from 'lucide-react';

export default function TrainingLearnPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [currentSessionOrder, setCurrentSessionOrder] = useState<number>(1);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State Pengerjaan Kuis
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  // State Ujian Akhir
  const [showFinalExam, setShowFinalExam] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [programId]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');

    // 1. Ambil Profil Talenta
    const profileRes = await apiFetch('/talents/me');
    if (profileRes.status !== 'success') {
      router.push('/login');
      return;
    }
    setProfile(profileRes.data);

    // 2. Ambil data enrollment talenta untuk program ini
    const enrollRes = await apiFetch('/trainings/my/enrollments');
    if (enrollRes.status === 'success') {
      const current = (enrollRes.data || []).find((e: any) => e.programId === programId);
      if (!current) {
        setError('Anda belum terdaftar pada program pelatihan ini.');
        setLoading(false);
        return;
      }
      setEnrollment(current);
      setProgram(current.program);

      // Buka sesi tertinggi yang sudah terbuka (atau sesi 1)
      const orderToLoad = current.status === 'COMPLETED' ? 1 : current.currentSessionUnlocked;
      setCurrentSessionOrder(orderToLoad);
      await loadSession(orderToLoad);
    }

    setLoading(false);
  };

  const loadSession = async (order: number) => {
    setMessage('');
    setError('');
    setQuizResult(null);
    setSelectedAnswers({});
    setShowFinalExam(false);

    const res = await apiFetch(`/trainings/${programId}/sessions/${order}`);
    if (res.status === 'success') {
      setSessionData(res.data);
      setCurrentSessionOrder(order);
    } else {
      setError(res.message || 'Gagal memuat materi sesi.');
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData) return;
    setCompleting(true);
    setMessage('');
    setError('');

    const res = await apiFetch(`/trainings/sessions/${sessionData.id}/complete`, {
      method: 'POST',
    });

    setCompleting(false);
    if (res.status === 'success') {
      setMessage(`Sesi ${sessionData.sessionOrder} berhasil diselesaikan!`);
      // Muat ulang data enrollment
      const enrollRes = await apiFetch('/trainings/my/enrollments');
      if (enrollRes.status === 'success') {
        const updated = (enrollRes.data || []).find((e: any) => e.programId === programId);
        setEnrollment(updated);

        // Jika sesi tidak punya kuis, otomatis buka sesi berikutnya jika ada
        const totalSessions = program?.sessions?.length || program?.totalSessions || 1;
        if (!sessionData.hasCheckpointQuiz && sessionData.sessionOrder < totalSessions) {
          loadSession(sessionData.sessionOrder + 1);
        }
      }
    } else {
      setError(res.message || 'Gagal menyelesaikan sesi.');
    }
  };

  const handleSubmitQuiz = async (quizId: string) => {
    if (!quizId) return;
    setSubmittingQuiz(true);
    setQuizResult(null);

    const res = await apiFetch(`/trainings/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: selectedAnswers }),
    });

    setSubmittingQuiz(false);
    setQuizResult(res);

    if (res.status === 'success' && res.isPassed) {
      // Muat ulang data enrollment
      const enrollRes = await apiFetch('/trainings/my/enrollments');
      if (enrollRes.status === 'success') {
        const updated = (enrollRes.data || []).find((e: any) => e.programId === programId);
        setEnrollment(updated);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        Mempersiapkan Ruang Kelas LMS...
      </div>
    );
  }

  const isCompleted = enrollment?.status === 'COMPLETED';
  const totalSessions = program?.sessions?.length || program?.totalSessions || 1;
  const maxUnlocked = isCompleted ? totalSessions + 1 : (enrollment?.currentSessionUnlocked || 1);

  // Final Exam Data dari program relation
  const finalExam = program?.quizzes?.find((q: any) => q.quizType === 'FINAL_EXAM') || program?.quizzes?.[0];

  return (
    <AppShell userRole="TALENT" userName={profile?.fullName || 'Kandidat'}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & Header */}
        <div className="bg-white border border-neutral-300 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href="/talent/trainings"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 mb-2 uppercase tracking-wider font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Daftar Pelatihan
            </Link>
            <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-neutral-700" />
              {program?.title}
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Mode: <span className="font-semibold text-neutral-900">{program?.deliveryMode}</span> &bull; 
              Penyelenggara: <span className="font-semibold text-neutral-900">{program?.providerName}</span>
            </p>
          </div>

          {isCompleted && (
            <div className="bg-green-50 border border-green-300 px-4 py-2 text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-900 block">
                Status Kelulusan
              </span>
              <span className="text-xs font-bold text-green-900 font-mono">
                {enrollment?.certificateNumber}
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

        {message && (
          <div className="p-4 bg-green-50 border border-green-300 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Layout Grid: Sidebar Navigasi Sesi (Kiri) & Konten Materi / Ujian (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* SIDEBAR DAFTAR SESI (PROGRESSIVE LOCK NAVIGATION) */}
          <div className="lg:col-span-1 bg-white border border-neutral-300 divide-y divide-neutral-200">
            <div className="p-4 bg-neutral-50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Kurikulum Materi
              </span>
              <span className="text-[10px] text-neutral-600 font-mono font-bold">
                {totalSessions} Sesi
              </span>
            </div>

            <div className="divide-y divide-neutral-100">
              {Array.from({ length: totalSessions }, (_, i) => i + 1).map((order) => {
                const isUnlocked = order <= maxUnlocked;
                const isCurrent = currentSessionOrder === order && !showFinalExam;
                const isPassed = order < maxUnlocked || isCompleted;

                return (
                  <button
                    key={order}
                    disabled={!isUnlocked}
                    onClick={() => loadSession(order)}
                    className={`w-full p-3.5 text-left flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-neutral-900 text-white font-bold'
                        : isUnlocked
                        ? 'hover:bg-neutral-100 text-neutral-800'
                        : 'bg-neutral-50 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isPassed ? (
                        <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-green-400' : 'text-green-700'}`} />
                      ) : isUnlocked ? (
                        <PlayCircle className="w-4 h-4 text-neutral-800" />
                      ) : (
                        <Lock className="w-4 h-4 text-neutral-400" />
                      )}
                      <span className="text-xs">Sesi {order}</span>
                    </div>

                    {!isUnlocked && (
                      <span className="text-[10px] uppercase font-mono text-neutral-400">Terkunci</span>
                    )}
                  </button>
                );
              })}

              {/* Tombol Ujian Akhir di Paling Bawah */}
              <button
                disabled={maxUnlocked <= totalSessions && !isCompleted}
                onClick={() => {
                  setShowFinalExam(true);
                  setMessage('');
                  setError('');
                  setSelectedAnswers({});
                  setQuizResult(null);
                }}
                className={`w-full p-4 text-left flex items-center justify-between border-t-2 border-neutral-300 transition-colors ${
                  showFinalExam
                    ? 'bg-neutral-900 text-white font-bold'
                    : (maxUnlocked > totalSessions || isCompleted)
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold'
                    : 'bg-neutral-50 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="text-xs uppercase tracking-wider">Ujian Akhir (Final Exam)</span>
                </div>
                {!(maxUnlocked > totalSessions || isCompleted) && (
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </button>
            </div>
          </div>

          {/* AREA KONTEN UTAMA (MATERI / KUIS ANTARA / UJIAN AKHIR) */}
          <div className="lg:col-span-3 space-y-6">
            {!showFinalExam && sessionData ? (
              <div className="bg-white border border-neutral-300 divide-y divide-neutral-200">
                {/* Header Sesi */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 text-neutral-800 px-2 py-0.5">
                      Sesi {sessionData.sessionOrder}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-neutral-100 border border-neutral-300 text-neutral-800 px-2 py-0.5">
                      {sessionData.contentType}
                    </span>
                    {sessionData.hasCheckpointQuiz && (
                      <span className="text-[10px] font-bold uppercase bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5">
                        Memiliki Kuis Antara
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900">
                    {sessionData.title}
                  </h2>
                </div>

                {/* Body Materi (Video / Teks Artikel) */}
                <div className="p-6">
                  {sessionData.contentType === 'VIDEO' ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
                        <PlayCircle className="w-12 h-12 text-neutral-400 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Pemutar Video Modular</span>
                        <span className="text-[11px] text-neutral-400 mt-1 font-mono">{sessionData.contentBody}</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Tonton video materi di atas sampai tuntas sebelum melanjutkan ke sesi berikutnya.
                      </p>
                    </div>
                  ) : (
                    <div className="prose max-w-none text-xs leading-relaxed text-neutral-800 whitespace-pre-line">
                      {sessionData.contentBody}
                    </div>
                  )}
                </div>

                {/* MODUL KUIS ANTARA (CHECKPOINT QUIZ) JIKA ADA */}
                {sessionData.hasCheckpointQuiz && sessionData.checkpointQuiz && (
                  <div className="p-6 bg-amber-50/50 space-y-4 border-t border-amber-200">
                    <div className="flex justify-between items-center border-b border-amber-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider block">
                          Evaluasi Pemahaman Materi
                        </span>
                        <h3 className="text-sm font-bold uppercase text-neutral-900">
                          {sessionData.checkpointQuiz.title}
                        </h3>
                      </div>
                      <span className="text-xs text-neutral-700 font-semibold">
                        Standar Lulus: {sessionData.checkpointQuiz.passingScore}%
                      </span>
                    </div>

                    {quizResult && (
                      <div className={`p-4 border text-xs flex items-center gap-2 ${
                        quizResult.isPassed
                          ? 'bg-green-50 border-green-300 text-green-900'
                          : 'bg-red-50 border-red-300 text-red-900'
                      }`}>
                        {quizResult.isPassed ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{quizResult.message}</span>
                      </div>
                    )}

                    {/* Butir-Butir Soal Kuis Pilihan Ganda */}
                    <div className="space-y-4 pt-2">
                      {sessionData.checkpointQuiz.questions?.map((q: any, qIdx: number) => (
                        <div key={q.id} className="p-4 bg-white border border-neutral-300 space-y-2.5">
                          <p className="text-xs font-bold text-neutral-900">
                            {qIdx + 1}. {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => {
                              const letter = String.fromCharCode(65 + optIdx); // A, B, C...
                              const isSelected = selectedAnswers[q.id] === letter;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: letter })}
                                  className={`p-2.5 text-left text-xs border transition-colors flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                      : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleSubmitQuiz(sessionData.checkpointQuiz.id)}
                        disabled={submittingQuiz || Object.keys(selectedAnswers).length < (sessionData.checkpointQuiz.questions?.length || 1)}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingQuiz ? 'Mengoreksi Jawaban...' : 'Kirim Jawaban Kuis Antara'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Navigasi Sesi */}
                <div className="p-6 bg-neutral-50 flex justify-between items-center">
                  <span className="text-[11px] text-neutral-600">
                    {sessionData.hasCheckpointQuiz 
                      ? 'Lulus kuis antara untuk membuka sesi berikutnya.' 
                      : 'Tekan tombol untuk menandai materi telah selesai dipelajari.'}
                  </span>

                  {!sessionData.hasCheckpointQuiz && (
                    <button
                      type="button"
                      onClick={handleCompleteSession}
                      disabled={completing}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{completing ? 'Memproses...' : 'Tandai Selesai & Lanjut'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : showFinalExam ? (
              /* PANEL UJIAN AKHIR (FINAL EXAM & AUTO-SKILL INJECTION) */
              <div className="bg-white border border-neutral-300 divide-y divide-neutral-200">
                <div className="p-6 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase bg-amber-900 text-white px-2 py-0.5">
                      Tahap Evaluasi Penentu
                    </span>
                    <span className="text-xs text-neutral-600 font-semibold">
                      Ambang Kelulusan: {program?.passingGrade}%
                    </span>
                  </div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900">
                    {finalExam?.title || 'Ujian Akhir Standar Sertifikasi Daerah'}
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Kerjakan seluruh soal ujian akhir dengan teliti. Nilai kelulusan akan langsung memicu penerbitan nomor sertifikat resmi dan menyuntikkan keahlian baru ke profil Anda.
                  </p>
                </div>

                {quizResult && (
                  <div className={`p-6 border-b text-xs ${
                    quizResult.isPassed
                      ? 'bg-green-50 border-green-300 text-green-950'
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {quizResult.isPassed ? <Award className="w-5 h-5 text-green-700" /> : <AlertCircle className="w-5 h-5 text-red-700" />}
                      <span>{quizResult.message}</span>
                    </div>
                    {quizResult.certificateNumber && (
                      <div className="mt-3 p-3 bg-white border border-green-300 font-mono text-xs">
                        Nomor Registrasi Sertifikat: <strong>{quizResult.certificateNumber}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Soal Ujian Akhir */}
                <div className="p-6 space-y-6">
                  {finalExam?.questions && finalExam.questions.length > 0 ? (
                    finalExam.questions.map((q: any, qIdx: number) => (
                      <div key={q.id} className="p-4 bg-white border border-neutral-300 space-y-2.5">
                        <p className="text-xs font-bold text-neutral-900">
                          {qIdx + 1}. {q.questionText}
                        </p>
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSelected = selectedAnswers[q.id] === letter;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: letter })}
                                className={`p-2.5 text-left text-xs border transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                    : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback jika pertanyaan statis */
                    <div className="p-4 bg-white border border-neutral-300 space-y-2.5">
                      <p className="text-xs font-bold text-neutral-900">
                        1. Apa fungsi utama gas pelindung dalam proses pengelasan dan keselamatan kerja tambang?
                      </p>
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {[
                          { key: 'A', text: 'Mencegah oksidasi atmosfer pada kawah las' },
                          { key: 'B', text: 'Mempercepat pendinginan logam dasar' },
                          { key: 'C', text: 'Sebagai bahan pewarna lapisan sambungan' },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, 'final-q1': opt.key })}
                            className={`p-2.5 text-left text-xs border transition-colors flex items-center justify-between ${
                              selectedAnswers['final-q1'] === opt.key
                                ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800'
                            }`}
                          >
                            <span>{opt.key}. {opt.text}</span>
                            {selectedAnswers['final-q1'] === opt.key && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (finalExam?.id) {
                        handleSubmitQuiz(finalExam.id);
                      }
                    }}
                    disabled={submittingQuiz || isCompleted}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Award className="w-4 h-4" />
                    <span>{isCompleted ? 'Ujian Telah Lulus' : submittingQuiz ? 'Mengoreksi Lembar Jawaban...' : 'Kumpulkan & Selesaikan Ujian Akhir'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
