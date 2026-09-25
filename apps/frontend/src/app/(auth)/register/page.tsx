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
  ArrowLeft,
  Compass,
} from 'lucide-react';

export function RegisterGatewayPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

      <div className="w-full max-w-6xl space-y-8 relative z-10">
        {/* Brand & Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-extrabold tracking-tight text-sm text-slate-900">
              MIMIKA TALENTA
            </span>
          </Link>
        </div>

        {/* Header Billboard */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center space-y-3 shadow-xs max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Portal Ketenagakerjaan Terpadu Kab. Mimika</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Pilih Gerbang Pendaftaran Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Pemerintah Kabupaten Mimika menyediakan 3 jalur pendaftaran resmi sesuai identitas Anda untuk menjamin legalitas, afirmasi tenaga kerja lokal, dan standardisasi sertifikasi BNSP.
          </p>
        </div>

        {/* 3 Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {/* GERBANG 1: TALENTA DAERAH */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  Pencari Kerja Lokal
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Talenta Daerah
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Khusus bagi masyarakat dan angkatan kerja lokal Kabupaten Mimika yang siap memasuki radar rekrutmen industri modern.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">One-Stop Profiling:</strong> Cukup isi portofolio sekali, biarkan industri menemukan Anda.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Beasiswa Vokasi:</strong> Akses pelatihan Las 6G, Alat Berat, dan K3 gratis APBD.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Afirmasi OAP:</strong> Perlindungan hak tenaga kerja lokal sesuai Perda Mimika.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                href="/register/talent"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Sebagai Talenta</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* GERBANG 2: MITRA INDUSTRI & PEMBERI KERJA */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-xl hover:border-slate-400 transition-all duration-300 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Perusahaan &amp; Kontraktor
                </span>
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                  Mitra Industri
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bagi kontraktor tambang, logistik, pengolahan, dan badan usaha legal berizin resmi di Kabupaten Mimika.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">AI Vacancy Studio:</strong> Rumuskan spesifikasi SKKNI dan syarat tugas dalam hitungan detik.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Lulusan Terverifikasi:</strong> Akses data talenta pemegang lisensi BNSP dan SIO Kemenaker.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Validasi NIB OSS:</strong> Terafiliasi langsung dalam ekosistem resmi ketenagakerjaan daerah.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                href="/register/employer"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Sebagai Perusahaan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* GERBANG 3: LEMBAGA PELATIHAN & BALAI VOKASI */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                  Lembaga Vokasi / LSP
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                  Penyedia Pelatihan
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bagi LPK Swasta, BLK Pemerintah, LSP Berlisensi BNSP, atau Balai Industri di wilayah Kabupaten Mimika.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Katalog Skillhub:</strong> Publikasikan kurikulum pelatihan dan buka batch cohort peserta.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Injeksi Sertifikasi:</strong> Kelulusan peserta langsung menginjeksi keahlian ke radar industri.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Validasi VIN Kemnaker:</strong> Kemitraan resmi akreditasi di bawah Disnakertrans.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                href="/register/provider"
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Sebagai Lembaga</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Masuk Akun */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun terdaftar?{' '}
            <Link href="/login" className="text-slate-900 font-bold underline hover:text-emerald-700 transition-colors">
              Masuk ke akun Anda di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterGatewayPage;
