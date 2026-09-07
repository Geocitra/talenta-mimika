'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { 
  Briefcase, 
  Sparkles, 
  Users, 
  ArrowRight, 
  Clock, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';

export default function EmployerVacanciesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const empRes = await apiFetch('/employers/me');
    if (empRes.status === 'success') {
      setProfile(empRes.data);
      const vacRes = await apiFetch('/vacancies/my');
      if (vacRes.status === 'success') {
        setVacancies(vacRes.data || []);
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        Memuat Daftar Lowongan...
      </div>
    );
  }

  return (
    <AppShell userRole="EMPLOYER" userName={profile?.companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Halaman */}
        <div className="bg-white border border-neutral-300 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2 py-0.5 mb-2">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              AI Sourcing Radar
            </span>
            <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
              Kelola Kebutuhan &amp; Radar Kandidat
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Pilih lowongan untuk meninjau daftar talenta Mimika yang telah dipadankan oleh AI Matching Engine.
            </p>
          </div>

          <Link
            href="/employer"
            className="border border-neutral-300 hover:bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {/* List Lowongan Tanpa Nested Box */}
        <div className="bg-white border border-neutral-300">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Lowongan Pekerjaan Aktif ({vacancies.length})
            </span>
            <span className="text-[11px] text-neutral-600">
              Klik tombol &quot;Temukan Kandidat&quot; untuk melihat skor AI
            </span>
          </div>

          {vacancies.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-600 space-y-2">
              <Briefcase className="w-8 h-8 text-neutral-400 mx-auto" />
              <p>Belum ada lowongan yang diterbitkan.</p>
              <Link href="/employer" className="text-neutral-900 font-bold underline">
                Terbitkan lowongan baru di dashboard perusahaan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {vacancies.map((vac) => (
                <div 
                  key={vac.id} 
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold uppercase text-neutral-900">
                        {vac.title}
                      </h2>
                      <span className="text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800 px-1.5 py-0.5 border border-neutral-300">
                        {vac.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {vac.taskDescription}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-600 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-700" />
                        {vac.projectDuration}
                      </span>
                      <span>&bull;</span>
                      <span>Min. {vac.minEducation}</span>
                      <span>&bull;</span>
                      <span>Pengalaman Min. {vac.minExperienceYears} Tahun</span>
                      {vac.allowEquivalence && (
                        <>
                          <span>&bull;</span>
                          <span className="text-neutral-900 font-semibold">
                            Fuzzy Equivalence Aktif
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/employer/vacancies/${vac.id}/candidates`}
                    className="w-full md:w-auto shrink-0 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Temukan Kandidat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
