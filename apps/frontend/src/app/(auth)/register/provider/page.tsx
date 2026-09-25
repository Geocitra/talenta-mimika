'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Building,
  User,
  Phone,
  MapPin,
  FileCheck,
  Compass,
} from 'lucide-react';

export default function RegisterProviderPage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('LPK_SWASTA');
  const [vinNumber, setVinNumber] = useState('');
  const [bnspLicenseNumber, setBnspLicenseNumber] = useState('');
  const [picName, setPicName] = useState('');
  const [picRole, setPicRole] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const msg = 'Konfirmasi kata sandi tidak cocok.';
      setError(msg);
      showAlert('warning', 'Kata Sandi Tidak Cocok', msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Kata sandi minimal 6 karakter.';
      setError(msg);
      showAlert('warning', 'Kata Sandi Kurang Panjang', msg);
      return;
    }

    setLoading(true);

    const res = await apiFetch('/auth/register/training-provider', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        institutionName,
        institutionType,
        vinNumber: vinNumber || undefined,
        bnspLicenseNumber: bnspLicenseNumber || undefined,
        picName,
        picRole,
        picPhone,
        address,
      }),
    });

    setLoading(false);
    if (res.status === 'success') {
      setStep('OTP');
      setCooldown(res.data?.cooldownSeconds || 60);
      setSuccessMessage('Pendaftaran lembaga berhasil diajukan! Periksa email resmi untuk kode OTP.');
      showAlert(
        'success',
        'Pendaftaran Terkirim!',
        'Kode OTP verifikasi telah dikirimkan ke email lembaga. Silakan masukkan kode untuk memverifikasi akun.',
        'Lanjut ke Verifikasi OTP →',
      );
    } else {
      const errMsg = res.message || 'Pendaftaran lembaga gagal.';
      setError(errMsg);
      showAlert('error', 'Pendaftaran Gagal', errMsg);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiFetch('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otpCode,
        purpose: 'REGISTRATION',
      }),
    });

    setLoading(false);
    if (res.status === 'success') {
      setSuccessMessage('Verifikasi berhasil! Akun lembaga Anda telah aktif.');
      await apiFetch('/auth/logout', { method: 'POST' });
      showAlert(
        'success',
        'Verifikasi Sukses!',
        'Akun lembaga pelatihan berhasil diverifikasi. Silakan masuk untuk mulai mengelola program pelatihan.',
        'Masuk Sekarang →',
        () => {
          router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
        },
      );
    } else {
      const errMsg = res.message || 'Kode OTP tidak valid atau kedaluwarsa.';
      setError(errMsg);
      showAlert('error', 'Verifikasi Gagal', errMsg);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');

    const res = await apiFetch('/auth/otp/resend-registration', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setResending(false);
    if (res.status === 'success') {
      setCooldown(res.data?.cooldownSeconds || 60);
      const succMsg = 'Kode OTP baru telah dikirim ke email lembaga.';
      setSuccessMessage(succMsg);
      showAlert('success', 'Kode OTP Terkirim!', succMsg);
    } else {
      const errMsg = res.message || 'Gagal mengirim ulang OTP.';
      setError(errMsg);
      showAlert('error', 'Gagal Kirim Ulang OTP', errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

      {/* Brand Identity & Back Link */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 relative z-10">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pilihan Gerbang</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-extrabold tracking-tight text-sm text-slate-900">
            MIMIKA TALENTA
          </span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 space-y-6 relative z-10">
        {/* Header Identitas */}
        <div className="border-b border-slate-100 pb-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              Jalur Lembaga Pelatihan &amp; LSP
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {step === 'FORM' ? 'Langkah 1 dari 2' : 'Langkah 2: Verifikasi OTP'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {step === 'FORM' ? 'Registrasi Balai Vokasi / LSP' : 'Verifikasi Email Lembaga'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {step === 'FORM'
              ? 'Daftarkan LPK Swasta, BLK Pemerintah, atau LSP berlisensi BNSP Anda untuk mempublikasikan kurikulum pelatihan di Skillhub Mimika.'
              : `Masukkan 6 digit kode OTP yang telah dikirimkan ke email resmi ${email}.`}
          </p>
        </div>

        {/* Notifikasi Status */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: FORMULIR ONBOARDING LEMBAGA */}
        {step === 'FORM' && (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Bagian 1: Identitas Institusi */}
            <div className="space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                1. Identitas Lembaga / Balai Vokasi
              </span>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nama Resmi Lembaga Pelatihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: LPK Teknik Pengelasan Kuala Kencana"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Jenis Lembaga <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white transition-all"
                  >
                    <option value="LPK_SWASTA">LPK Swasta</option>
                    <option value="BLK_PEMERINTAH">BLK / BPVP Pemerintah</option>
                    <option value="LSP_BNSP">Lembaga Sertifikasi Profesi (LSP)</option>
                    <option value="PUSAT_PELATIHAN_INDUSTRI">Pusat Pelatihan Industri / Korporasi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nomor VIN Kemnaker
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: VIN-9104-2026-001"
                    value={vinNumber}
                    onChange={(e) => setVinNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nomor Lisensi BNSP (Opsional LSP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BNSP-LSP-1234-ID"
                  value={bnspLicenseNumber}
                  onChange={(e) => setBnspLicenseNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Alamat Lengkap Workshop / Kantor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jl. Cenderawasih KM 3.5, Mimika Baru"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            {/* Bagian 2: Penanggung Jawab (PIC) */}
            <div className="space-y-3.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                2. Penanggung Jawab Lembaga (PIC)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nama Lengkap PIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama penanggung jawab"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Jabatan PIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Direktur / Kepala Balai"
                    value={picRole}
                    onChange={(e) => setPicRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nomor HP / WhatsApp PIC <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={picPhone}
                  onChange={(e) => setPicPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            {/* Bagian 3: Akun Login */}
            <div className="space-y-3.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1">
                3. Akun Akses Portal Lembaga
              </span>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Resmi Lembaga <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="info@lpk-mimika.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Konfirmasi Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>Memproses Pendaftaran...</span>
              ) : (
                <>
                  <span>Daftarkan Lembaga &amp; Verifikasi OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFIKASI OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase">Email Lembaga:</span>
                <span className="font-mono font-semibold text-slate-700">{email}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Silakan periksa kotak masuk email resmi lembaga Anda, lalu masukkan 6 digit kode angka ke dalam kotak di bawah ini.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 text-center">
                Kode Verifikasi OTP (6 Digit)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-2xl border-2 border-slate-900 px-4 py-3 text-center text-3xl font-mono font-black tracking-[10px] text-slate-900 focus:outline-hidden focus:bg-slate-50 transition-colors"
              />
              <span className="text-[11px] text-slate-400 block text-center">
                Kode berlaku selama 5 menit
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <span>Verifikasi &amp; Lanjut ke Halaman Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : 'Kirim Ulang Kode OTP'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-slate-500 hover:text-slate-900 underline text-[11px] cursor-pointer"
              >
                Ubah data pendaftaran
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigasi */}
        <div className="pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun lembaga terdaftar?{' '}
            <Link href="/login" className="text-slate-900 font-bold underline hover:text-emerald-700 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      <AlertModal {...alertProps} />
    </div>
  );
}
