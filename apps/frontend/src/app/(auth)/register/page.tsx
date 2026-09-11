'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  ChevronRight
} from 'lucide-react';

export default function RegisterGatewayPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Header Resmi Gerbang Registrasi */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2.5 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
            Portal Resmi Ketenagakerjaan Daerah
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase">
            Pilih Gerbang Registrasi Akun
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Pemerintah Kabupaten Mimika menyediakan 3 portal pendaftaran resmi untuk menjamin akurasi data warga, integritas legalitas industri, dan mutu sertifikasi balai vokasi daerah.
          </p>
        </div>

        {/* TIGA KARTU EKSKLUSIF (TALENTA VS PERUSAHAAN VS LEMBAGA PELATIHAN) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* GERBANG 1: TALENTA DAERAH */}
          <div className="bg-white border border-neutral-300 p-6 flex flex-col justify-between hover:border-neutral-900 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5">
                  Warga Pencari Kerja
                </span>
                <UserCheck className="w-5 h-5 text-neutral-700" />
              </div>

              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                  Talenta Daerah
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Khusus bagi masyarakat dan angkatan kerja lokal Kabupaten Mimika yang siap memasuki dunia kerja industri modern.
                </p>
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <Sparkles className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>One-Stop Profiling:</strong> Cukup isi portofolio sekali, biarkan industri menemukan Anda.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <GraduationCap className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Skillhub Mimika:</strong> Akses pelatihan vokasi & sertifikasi BNSP dengan beasiswa APBD.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Validasi NIK Dukcapil:</strong> Keabsahan identitas terjamin secara hukum.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-neutral-200">
              <Link
                href="/register/talent"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <span>Daftar Sebagai Talenta</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* GERBANG 2: MITRA INDUSTRI & PEMBERI KERJA */}
          <div className="bg-white border border-neutral-300 p-6 flex flex-col justify-between hover:border-neutral-900 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5">
                  Pemberi Kerja & Perusahaan
                </span>
                <Building2 className="w-5 h-5 text-neutral-700" />
              </div>

              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                  Mitra Industri
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Bagi kontraktor, perusahaan tambang, logistik, dan badan usaha legal berizin resmi di wilayah Kabupaten Mimika.
                </p>
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <Briefcase className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Radar AI Candidate Discovery:</strong> Rekrutmen cerdas 4-vektor (Keahlian, Pengalaman, Social DNA, GIS).</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <Award className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Talenta Terverifikasi:</strong> Profil transparan dengan riwayat sertifikasi resmi daerah.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Kepatuhan NIB OSS:</strong> Terafiliasi langsung dalam ekosistem ketenagakerjaan daerah.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-neutral-200">
              <Link
                href="/register/employer"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <span>Daftar Sebagai Mitra Industri</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* GERBANG 3: LEMBAGA PELATIHAN & BALAI VOKASI */}
          <div className="bg-white border border-neutral-300 p-6 flex flex-col justify-between hover:border-neutral-900 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5">
                  Lembaga Vokasi & Sertifikasi
                </span>
                <GraduationCap className="w-5 h-5 text-neutral-700" />
              </div>

              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                  Penyedia Pelatihan
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Bagi LPK Swasta, BLK Pemerintah, LSP Berlisensi BNSP, atau Balai Industri di wilayah Kabupaten Mimika.
                </p>
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <Sparkles className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Etalase Resmi Skillhub:</strong> Publikasikan program pelatihan & buka batch cohort langsung ke talenta.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <Award className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Atomic Auto-Skill:</strong> Kelulusan massal langsung menginjeksi keahlian ke radar industri.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-neutral-900 mt-0.5" />
                  <span><strong>Validasi VIN Kemnaker & BNSP:</strong> Kemitraan terakreditasi di bawah Disnakertrans.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-neutral-200">
              <Link
                href="/register/provider"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <span>Daftar Sebagai Lembaga</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Masuk Akun */}
        <div className="text-center pt-2">
          <p className="text-xs text-neutral-600">
            Sudah memiliki akun terdaftar?{' '}
            <Link href="/login" className="text-neutral-900 font-bold underline hover:text-neutral-700">
              Masuk ke akun Anda di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
