'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Users, 
  RotateCcw,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

export default function RegisterEmployerPage() {
  const router = useRouter();
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [nib, setNib] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Timer cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Validasi Kecocokan Kata Sandi Real-time
  const isPasswordMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi yang Anda masukkan.');
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi harus memiliki panjang minimal 8 karakter.');
      return;
    }

    setLoading(true);

    const res = await apiFetch('/auth/register/employer', {
      method: 'POST',
      body: JSON.stringify({ email, password, companyName, nib }),
    });

    setLoading(false);
    if (res.status === 'success') {
      setStep('OTP');
      setCooldown(res.data?.cooldownSeconds || 60);
      setSuccessMessage('Pendaftaran perusahaan berhasil! Silakan periksa kotak masuk email resmi Anda untuk verifikasi OTP.');
    } else {
      setError(res.message || 'Pendaftaran gagal.');
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
      setSuccessMessage('Verifikasi email resmi berhasil! Mengalihkan ke halaman masuk...');
      // Bersihkan sesi cookie agar pengguna login ulang secara formal dengan email dan kata sandi
      await apiFetch('/auth/logout', { method: 'POST' });
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
      }, 1200);
    } else {
      setError(res.message || 'Kode OTP tidak valid atau telah kedaluwarsa.');
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
      setSuccessMessage('Kode OTP verifikasi baru telah dikirim ke email resmi perusahaan.');
    } else {
      setError(res.message || 'Gagal mengirim ulang kode OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-neutral-300 p-6 sm:p-8">
        
        {/* Header Identitas Jalur Perusahaan */}
        <div className="border-b border-neutral-200 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2 py-0.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-300" />
              Jalur Kemitraan Industri & Badan Usaha
            </span>
            <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
              {step === 'FORM' ? 'Langkah 1 dari 2' : 'Langkah 2 dari 2: Verifikasi'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 uppercase">
            {step === 'FORM' ? 'Registrasi Mitra Industri' : 'Verifikasi Email Perusahaan'}
          </h1>
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
            {step === 'FORM'
              ? 'Akses eksklusif talent search engine berbasis AI untuk menjangkau tenaga kerja lokal Mimika yang terverifikasi dan tersertifikasi resmi.'
              : `Masukkan 6 digit kode rahasia yang telah kami kirimkan ke email resmi ${email}.`}
          </p>
        </div>

        {/* Pemberitahuan Kepatuhan Hukum (Compliance Notice - Hanya di Step 1) */}
        {step === 'FORM' && (
          <div className="mb-5 p-3.5 bg-neutral-50 border border-neutral-300 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 uppercase text-[10px] tracking-wider">
              <ShieldCheck className="w-4 h-4 text-neutral-800" />
              <span>Pemeriksaan Legalitas & Kepatuhan:</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Sesuai regulasi ketenagakerjaan daerah, akun perusahaan wajib mencantumkan NIB resmi. Setelah verifikasi email OTP, akun akan ditinjau oleh Disnakertrans Mimika sebelum dapat menerbitkan lowongan pekerjaan.
            </p>
          </div>
        )}

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Notifikasi Berhasil */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* LANGKAH 1: FORM PENDAFTARAN */}
        {step === 'FORM' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1 tracking-wider">
                Nama Resmi Perusahaan (Sesuai Akta / NIB)
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: PT Freeport Contractor Equipment"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1 tracking-wider">
                Nomor Induk Berusaha (NIB OSS)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                placeholder="Contoh: 9104000123456"
                className="w-full border border-neutral-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <span className="text-[10px] text-neutral-600 mt-0.5 block">13 digit nomor izin resmi Kementerian Investasi / BKPM</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1 tracking-wider">
                Alamat Email Resmi Perusahaan / HRD
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruitment@nama-perusahaan.co.id"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <span className="text-[10px] text-neutral-600 mt-0.5 block">Disarankan menggunakan domain email resmi perusahaan</span>
            </div>

            {/* FIELD 1: KATA SANDI DENGAN TOGGLE LIHAT */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase text-neutral-700 tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-neutral-600">Minimal 8 karakter</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi aman"
                  className="w-full border border-neutral-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-900"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* FIELD 2: KONFIRMASI KATA SANDI DENGAN TOGGLE LIHAT & INDIKATOR KECOCOKAN */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase text-neutral-700 tracking-wider">
                  Ulangi Kata Sandi
                </label>
                {isPasswordMatch && (
                  <span className="text-green-700 text-[10px] font-bold inline-flex items-center gap-1 uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Kata Sandi Cocok
                  </span>
                )}
                {isPasswordMismatch && (
                  <span className="text-red-700 text-[10px] font-bold inline-flex items-center gap-1 uppercase">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    Belum Cocok
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi di atas"
                  className={`w-full border px-3 py-2 pr-10 text-sm focus:outline-none transition-colors ${
                    isPasswordMismatch 
                      ? 'border-red-400 focus:border-red-600 bg-red-50/20' 
                      : isPasswordMatch 
                      ? 'border-green-500 focus:border-green-600' 
                      : 'border-neutral-300 focus:border-neutral-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-900"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-neutral-600 mt-0.5 block">
                {isPasswordMatch 
                  ? 'Kombinasi kata sandi telah terverifikasi identik.' 
                  : 'Pastikan kata sandi kedua sama persis dengan yang pertama.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && !isPasswordMatch)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses Registrasi...</span>
              ) : (
                <>
                  <span>Lanjut ke Verifikasi Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* LANGKAH 2: FORM VERIFIKASI KODE OTP PERUSAHAAN */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-neutral-50 border border-neutral-300 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900 uppercase">Email Resmi Perusahaan:</span>
                <span className="font-mono font-semibold text-neutral-700">{email}</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Silakan periksa kotak masuk email resmi HRD Anda, lalu masukkan 6 digit kode verifikasi untuk mengesahkan kepemilikan email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-2 tracking-wider text-center">
                Masukkan 6 Digit Kode OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="······"
                className="w-full border-2 border-neutral-900 px-4 py-3 text-center text-3xl font-mono font-bold tracking-[10px] focus:outline-none focus:bg-neutral-50 transition-colors"
              />
              <span className="text-[11px] text-neutral-600 mt-1 block text-center">
                Kode berlaku selama 5 menit
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi Akun Perusahaan...</span>
              ) : (
                <>
                  <span>Verifikasi & Masuk ke Halaman Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Aksi Kirim Ulang & Ubah Data */}
            <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-neutral-800 hover:text-neutral-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : 'Kirim Ulang Kode OTP'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setStep('FORM'); setError(''); setSuccessMessage(''); }}
                className="text-neutral-600 hover:text-neutral-900 underline text-[11px]"
              >
                Ubah data pendaftaran
              </button>
            </div>
          </form>
        )}

        {/* Gerbang Beralih ke Registrasi Talenta */}
        <div className="mt-6 pt-5 border-t border-neutral-200 text-center space-y-3">
          <div className="bg-neutral-50 border border-neutral-200 p-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
            <div>
              <span className="font-bold text-neutral-900 block text-[11px] uppercase tracking-wider">
                Mendaftar sebagai Pencari Kerja Perorangan?
              </span>
              <span className="text-[10px] text-neutral-600">
                Gunakan gerbang registrasi talenta dengan NIK KTP Anda.
              </span>
            </div>
            <Link
              href="/register/talent"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-neutral-900 underline hover:text-neutral-700"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Portal Talenta &rarr;</span>
            </Link>
          </div>

          <p className="text-xs text-neutral-600">
            Sudah memiliki akun perusahaan?{' '}
            <Link href="/login" className="text-neutral-900 font-bold underline hover:text-neutral-700">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
