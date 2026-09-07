'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { 
  Building2, 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MapPin, 
  Users, 
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Vacancy Form State
  const [title, setTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [projectDuration, setProjectDuration] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [minEducation, setMinEducation] = useState('SMK');
  const [minExperienceYears, setMinExperienceYears] = useState(2);
  const [allowEquivalence, setAllowEquivalence] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await apiFetch('/employers/me');
    if (res.status === 'success') {
      setProfile(res.data);
      // Ambil lowongan jika perusahaan sudah approved
      if (res.data.verificationStatus === 'APPROVED') {
        const vacRes = await apiFetch('/vacancies/my');
        if (vacRes.status === 'success') setVacancies(vacRes.data || []);
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      title,
      taskDescription,
      projectDuration,
      requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      minEducation,
      minExperienceYears: Number(minExperienceYears),
      allowEquivalence,
    };

    const res = await apiFetch('/vacancies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.status === 'success') {
      setShowVacancyModal(false);
      setMessage('Lowongan pekerjaan baru berhasil diterbitkan!');
      setTitle('');
      setTaskDescription('');
      setProjectDuration('');
      setRequiredSkills('');
      loadData();
    } else {
      setError(res.message || 'Gagal menerbitkan lowongan.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">Memuat Data Perusahaan...</div>;
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Status Badan Usaha */}
        <div className="bg-white border border-neutral-300 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 ${
                isApproved ? 'bg-green-700 text-white' : 'bg-neutral-800 text-white'
              }`}>
                {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                STATUS: {profile?.verificationStatus}
              </span>
              <span className="text-xs text-neutral-600">NIB: {profile?.nib}</span>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
              {profile?.companyName}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-700" />
              {profile?.address || 'Alamat operasional Mimika belum diatur'}
            </p>
          </div>

          {isApproved ? (
            <button
              onClick={() => setShowVacancyModal(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan Lowongan</span>
            </button>
          ) : (
            <div className="border border-neutral-300 p-3 bg-neutral-50 text-[11px] text-neutral-600 max-w-xs">
              Menunggu verifikasi fisik oleh Disnakertrans Mimika sebelum diizinkan menerbitkan lowongan.
            </div>
          )}
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-300 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Modal Pembuatan Lowongan (Sharp, No Rounded) */}
        {showVacancyModal && (
          <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-300 w-full max-w-lg p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Terbitkan Kebutuhan Tenaga Kerja
                </h3>
                <button
                  onClick={() => setShowVacancyModal(false)}
                  className="p-1 hover:bg-neutral-100 text-neutral-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateVacancy} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-700 mb-1">
                    Judul Posisi / Pekerjaan
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Operator Alat Berat Excavator PC-200"
                    className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-700 mb-1">
                    Rincian Tugas Lapangan
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Rincian pekerjaan harian di site proyek..."
                    className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-700 mb-1">
                      Durasi Proyek
                    </label>
                    <input
                      type="text"
                      required
                      value={projectDuration}
                      onChange={(e) => setProjectDuration(e.target.value)}
                      placeholder="6 Bulan Proyek"
                      className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-700 mb-1">
                      Min. Pendidikan
                    </label>
                    <select
                      value={minEducation}
                      onChange={(e) => setMinEducation(e.target.value)}
                      className="w-full border border-neutral-300 px-2 py-2 text-xs focus:outline-none focus:border-neutral-900"
                    >
                      <option value="SMA">SMA</option>
                      <option value="SMK">SMK</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-700 mb-1">
                    Keahlian Wajib (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    required
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="Excavator, K3 Pertambangan, Perawatan Hidrolik"
                    className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="equivToggle"
                    checked={allowEquivalence}
                    onChange={(e) => setAllowEquivalence(e.target.checked)}
                    className="w-4 h-4 accent-neutral-900 border-neutral-300"
                  />
                  <label htmlFor="equivToggle" className="text-xs text-neutral-800">
                    Aktifkan Penyetaraan Pengalaman Fuzzy (Pendidikan lebih rendah dengan pengalaman tinggi tetap diloloskan AI)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setShowVacancyModal(false)}
                    className="border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase hover:bg-neutral-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Memproses...' : 'Terbitkan Sekarang'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Daftar Lowongan Aktif Tanpa Nested Box */}
        <div className="bg-white border border-neutral-300">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-neutral-700" />
              Daftar Kebutuhan Lowongan Aktif
            </h2>
            <span className="text-xs text-neutral-600 font-medium">Total: {vacancies.length} Lowongan</span>
          </div>

          {vacancies.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-600">
              Belum ada lowongan pekerjaan yang diterbitkan.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {vacancies.map((vac) => (
                <div key={vac.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-neutral-900">
                        {vac.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800 px-1.5 py-0.5 border border-neutral-300">
                        {vac.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Durasi: {vac.projectDuration} &bull; Min. Pendidikan: {vac.minEducation}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vac.requiredSkills?.map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="text-[10px] bg-neutral-50 border border-neutral-200 text-neutral-700 px-1.5 py-0.5">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <Link
                      href={`/employer/vacancies/${vac.id}/candidates`}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Temukan Kandidat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
