'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  KeyRound,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Compass,
  Lock,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [tab, setTab] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Deteksi jika pengguna baru saja menyelesaikan verifikasi OTP dari halaman registrasi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const verifiedParam = params.get('verified');
      if (emailParam) {
        setIdentifier(emailParam);
      }
      if (verifiedParam === 'true') {
        setSuccessMessage('Akun Anda telah berhasil diverifikasi! Silakan masuk menggunakan kata sandi Anda.');
      }
    }
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiFetch('/auth/login/password', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    setLoading(false);
    if (res.status === 'success') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        router.push(redirect);
        return;
      }

      if (res.data.role === 'TALENT') router.push('/talent');
      else if (res.data.role === 'EMPLOYER') router.push('/employer');
      else if (res.data.role === 'TRAINING_PROVIDER') router.push('/provider');
      else router.push('/admin');
    } else {
      const errMsg = res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
      setError(errMsg);
      showAlert('error', 'Login Gagal', errMsg);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiFetch('/auth/otp/send-login', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });

    setLoading(false);
    if (res.status === 'success') {
      setOtpSent(true);
      showAlert(
        'success',
        'Kode OTP Terkirim!',
        `Kode OTP login telah dikirimkan ke email ${identifier}. Silakan periksa kotak masuk email Anda.`,
      );
    } else {
      const errMsg = res.message || 'Gagal mengirim kode OTP.';
      setError(errMsg);
      showAlert('error', 'Gagal Mengirim OTP', errMsg);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiFetch('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({
        email: identifier,
        otpCode,
        purpose: 'LOGIN',
      }),
    });

    setLoading(false);
    if (res.status === 'success') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        router.push(redirect);
        return;
      }

      if (res.data.role === 'TALENT') router.push('/talent');
      else if (res.data.role === 'EMPLOYER') router.push('/employer');
      else if (res.data.role === 'TRAINING_PROVIDER') router.push('/provider');
      else router.push('/admin');
    } else {
      const errMsg = res.message || 'Verifikasi OTP gagal atau telah kedaluwarsa.';
      setError(errMsg);
      showAlert('error', 'Verifikasi Gagal', errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

      {/* Brand Identity Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-6 sm:mb-8 group relative z-10 cursor-pointer">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
          <Compass className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 block leading-tight">
            MIMIKA TALENTA
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Disnaker Kab. Mimika
          </span>
        </div>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 space-y-6 relative z-10">
        <div className="text-center space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Akses portal talenta, lowongan perusahaan, atau program pelatihan
          </p>
        </div>

        {/* Tab Switcher: Kata Sandi vs OTP */}
        <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('PASSWORD');
              setError('');
            }}
            className={`py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'PASSWORD'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Kata Sandi
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('OTP');
              setError('');
            }}
            className={`py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'OTP'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Login OTP
          </button>
        </div>

        {/* Notifikasi Berhasil Verifikasi */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Notifikasi Error */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
            {error.toLowerCase().includes('belum diverifikasi') && (
              <button
                type="button"
                onClick={() => {
                  setTab('OTP');
                  setError('');
                }}
                className="mt-1 font-bold text-red-800 hover:underline uppercase tracking-wider text-[11px] pl-6"
              >
                Verifikasi Akun Sekarang via OTP →
              </button>
            )}
          </div>
        )}

        {/* Form Jalur Kata Sandi */}
        {tab === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email atau NIK
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nama@email.com atau 16 digit NIK"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-11 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form Jalur Passwordless OTP */}
        {tab === 'OTP' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Kode 6 digit OTP akan dikirimkan langsung ke kotak masuk email Anda.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Masukkan 6 Digit Kode OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center tracking-[8px] font-bold text-lg text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>Dikirim ke {identifier}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Ubah Email
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Menuju Registrasi */}
        <div className="pt-5 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-600">
            Belum memiliki akun resmi?{' '}
            <Link
              href="/register"
              className="text-slate-900 font-bold underline hover:text-emerald-700 transition-colors"
            >
              Daftar akun di sini
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terintegrasi Resmi Disnakertrans Kab. Mimika</span>
          </div>
        </div>
      </div>

      <AlertModal {...alertProps} />
    </div>
  );
}
