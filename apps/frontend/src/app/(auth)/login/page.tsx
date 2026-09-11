'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import { KeyRound, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
        setSuccessMessage('Akun Anda telah berhasil diverifikasi! Silakan masuk menggunakan kata sandi yang telah Anda daftarkan.');
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
      if (res.data.role === 'TALENT') router.push('/talent');
      else if (res.data.role === 'EMPLOYER') router.push('/employer');
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
      if (res.data.role === 'TALENT') router.push('/talent');
      else if (res.data.role === 'EMPLOYER') router.push('/employer');
      else router.push('/admin');
    } else {
      const errMsg = res.message || 'Verifikasi OTP gagal atau telah kedaluwarsa.';
      setError(errMsg);
      showAlert('error', 'Verifikasi Gagal', errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-300 p-8">
        {/* Header Identitas */}
        <div className="border-b border-neutral-200 pb-6 mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
            MIMIKA TALENTA
          </h1>
          <p className="text-xs text-neutral-600 mt-1 uppercase tracking-wider">
            Masuk ke Ekosistem Ketenagakerjaan
          </p>
        </div>

        {/* Tab Pilihan Metode Login */}
        <div className="grid grid-cols-2 border border-neutral-300 mb-6">
          <button
            type="button"
            onClick={() => { setTab('PASSWORD'); setError(''); }}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'PASSWORD' 
                ? 'bg-neutral-900 text-white' 
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Kata Sandi
          </button>
          <button
            type="button"
            onClick={() => { setTab('OTP'); setError(''); }}
            className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'OTP' 
                ? 'bg-neutral-900 text-white' 
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Login OTP
          </button>
        </div>

        {/* Notifikasi Berhasil Verifikasi */}
        {successMessage && (
          <div className="mb-6 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Notifikasi Error & Recovery */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
            {error.toLowerCase().includes('belum diverifikasi') && (
              <button
                type="button"
                onClick={() => {
                  setTab('OTP');
                  setError('');
                }}
                className="mt-1 font-bold underline text-red-900 hover:text-red-700 uppercase tracking-wider text-[11px]"
              >
                Verifikasi Akun Sekarang via OTP &rarr;
              </button>
            )}
          </div>
        )}

        {/* Form Jalur Kata Sandi */}
        {tab === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                Email atau NIK
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan email terdaftar atau 16 digit NIK"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  className="w-full border border-neutral-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-neutral-900"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
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
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
                  />
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Kode 6 digit akan dikirimkan langsung ke kotak masuk email Anda.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Masukkan 6 Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full border border-neutral-300 px-3 py-2 text-center tracking-[8px] font-bold text-lg focus:outline-none focus:border-neutral-900"
                  />
                  <div className="flex justify-between items-center text-[11px] text-neutral-600 mt-1">
                    <span>Dikirim ke {identifier}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-neutral-900 underline"
                    >
                      Ubah Email
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <span>{loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Menuju Registrasi */}
        <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
          <p className="text-xs text-neutral-600">
            Belum terdaftar di ekosistem?{' '}
            <Link href="/register" className="text-neutral-900 font-bold underline hover:text-neutral-700">
              Daftar akun di sini
            </Link>
          </p>
        </div>
      </div>
      <AlertModal {...alertProps} />
    </div>
  );
}
