'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  Sparkles, 
  RotateCcw,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

export default function RegisterTalentPage() {
  const router = useRouter();
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [birthDate, setBirthDate] = useState('');
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

    const res = await apiFetch('/auth/register/talent', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, nik, birthDate }),
    });

    setLoading(false);
    if (res.status === 'success') {
      setStep('OTP');
      setCooldown(res.data?.cooldownSeconds || 60);
      setSuccessMessage('Pendaftaran berhasil! Silakan masukkan 6 digit kode OTP yang telah dikirim ke email Anda.');
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
      setSuccessMessage('Verifikasi akun berhasil! Mengalihkan ke halaman masuk untuk login...');
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
      setSuccessMessage('Kode OTP baru berhasil dikirim ke email Anda.');
    } else {
      setError(res.message || 'Gagal mengirim ulang kode OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-neutral-300 p-6 sm:p-8">
        
        {/* Header Identitas Jalur Talenta */}
        <div className="border-b border-neutral-200 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2 py-0.5">
              <UserCheck className="w-3.5 h-3.5 text-neutral-300" />
              Jalur Pencari Kerja (Talenta)
            </span>
            <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
              {step === 'FORM' ? 'Langkah 1 dari 2' : 'Langkah 2 dari 2: Verifikasi'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 uppercase">
            {step === 'FORM' ? 'Registrasi Talenta Daerah' : 'Verifikasi Kode OTP'}
          </h1>
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
            {step === 'FORM'
              ? 'Daftarkan portofolio Anda secara resmi untuk masuk ke radar rekrutmen industri dan akses pelatihan bersertifikat Disnakertrans Mimika.'
              : `Masukkan 6 digit kode rahasia yang telah kami kirimkan ke alamat email ${email}.`}
          </p>
        </div>

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
                Nama Lengkap (Sesuai KTP)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Yulius Pigome"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1 tracking-wider">
                  NIK (16 Digit)
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="910401..."
                  className="w-full border border-neutral-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <span className="text-[10px] text-neutral-600 mt-0.5 block">Format resmi Dukcapil</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1 tracking-wider">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <span className="text-[10px] text-neutral-600 mt-0.5 block">Sesuai tanggal lahir KTP</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1 tracking-wider">
                Alamat Email Aktif
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yulius.pigome@domain.com"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <span className="text-[10px] text-neutral-600 mt-0.5 block">Kode rahasia OTP verifikasi akan dikirim ke alamat ini</span>
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
                {/* Indikator Status Kecocokan */}
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

            {/* Kotak Info Keuntungan */}
            <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-1 text-[11px] text-neutral-600">
              <div className="flex items-center gap-1.5 font-bold text-neutral-800 uppercase text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                Keunggulan Akun Talenta Daerah:
              </div>
              <p className="leading-relaxed">
                Anda tidak perlu melamar ke ratusan lowongan. Cukup isi profil sekali, dan algoritma AI akan mempromosikan Anda langsung ke radar HRD perusahaan.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && !isPasswordMatch)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses Pendaftaran...</span>
              ) : (
                <>
                  <span>Lanjut ke Verifikasi OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* LANGKAH 2: FORM VERIFIKASI KODE OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-neutral-50 border border-neutral-300 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900 uppercase">Email Tujuan:</span>
                <span className="font-mono font-semibold text-neutral-700">{email}</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Silakan buka peramban atau aplikasi email Anda, lalu masukkan 6 digit kode angka ke dalam kotak di bawah ini.
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
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <span>Verifikasi & Masuk ke Halaman Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Aksi Kirim Ulang & Ubah Email */}
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

        {/* Gerbang Beralih ke Registrasi Perusahaan */}
        <div className="mt-6 pt-5 border-t border-neutral-200 text-center space-y-3">
          <div className="bg-neutral-50 border border-neutral-200 p-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
            <div>
              <span className="font-bold text-neutral-900 block text-[11px] uppercase tracking-wider">
                Mendaftar mewakili Perusahaan / Badan Usaha?
              </span>
              <span className="text-[10px] text-neutral-600">
                Gunakan gerbang registrasi mitra industri untuk verifikasi NIB OSS.
              </span>
            </div>
            <Link
              href="/register/employer"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-neutral-900 underline hover:text-neutral-700"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Portal Perusahaan &rarr;</span>
            </Link>
          </div>

          <p className="text-xs text-neutral-600">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-neutral-900 font-bold underline hover:text-neutral-700">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
