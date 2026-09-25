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
  Check,
  UserCheck,
  Building2,
  Sparkles,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Compass,
} from 'lucide-react';

export default function RegisterTalentPage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [domicile, setDomicile] = useState('');
  const [isLocal, setIsLocal] = useState<boolean>(true);
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
      const msg = 'Konfirmasi kata sandi tidak cocok dengan kata sandi yang Anda masukkan.';
      setError(msg);
      showAlert('warning', 'Kata Sandi Tidak Cocok', msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Kata sandi harus memiliki panjang minimal 6 karakter.';
      setError(msg);
      showAlert('warning', 'Kata Sandi Kurang Panjang', msg);
      return;
    }

    setLoading(true);

    const res = await apiFetch('/auth/register/talent', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, nik, birthDate, birthPlace, phone, domicile: domicile || undefined, isLocal }),
    });

    setLoading(false);
    if (res.status === 'success') {
      setStep('OTP');
      setCooldown(res.data?.cooldownSeconds || 60);
      setSuccessMessage('Pendaftaran berhasil! Silakan masukkan 6 digit kode OTP yang telah dikirim ke email Anda.');
      showAlert(
        'success',
        'Pendaftaran Berhasil!',
        'Kode OTP 6-digit verifikasi telah dikirim ke email Anda. Silakan masukkan kode untuk memverifikasi akun.',
        'Lanjut ke Verifikasi OTP →',
      );
    } else {
      const errMsg = res.message || 'Pendaftaran gagal.';
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
      setSuccessMessage('Verifikasi akun berhasil! Mengalihkan ke halaman masuk untuk login...');
      // Bersihkan sesi cookie agar pengguna login ulang secara formal dengan email dan kata sandi
      await apiFetch('/auth/logout', { method: 'POST' });
      showAlert(
        'success',
        'Verifikasi Akun Berhasil!',
        'Akun talenta Anda kini telah aktif dan terverifikasi secara resmi. Silakan masuk menggunakan email dan kata sandi Anda.',
        'Masuk Sekarang →',
        () => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          const redirectQuery = redirect ? `&redirect=${encodeURIComponent(redirect)}` : '';
          router.push(`/login?email=${encodeURIComponent(email)}&verified=true${redirectQuery}`);
        },
      );
    } else {
      const errMsg = res.message || 'Kode OTP tidak valid atau telah kedaluwarsa.';
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
      const succMsg = 'Kode OTP baru berhasil dikirim ke email Anda.';
      setSuccessMessage(succMsg);
      showAlert('success', 'Kode OTP Baru Terkirim!', succMsg);
    } else {
      const errMsg = res.message || 'Gagal mengirim ulang kode OTP.';
      setError(errMsg);
      showAlert('error', 'Gagal Kirim Ulang OTP', errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

      {/* Brand Identity & Back Link */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6 relative z-10">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pilihan Gerbang</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-extrabold tracking-tight text-sm text-slate-900">
            MIMIKA TALENTA
          </span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 space-y-6 relative z-10">
        {/* Header Identitas Jalur Talenta */}
        <div className="border-b border-slate-100 pb-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Jalur Pencari Kerja (Talenta)
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {step === 'FORM' ? 'Langkah 1 dari 2' : 'Langkah 2: Verifikasi OTP'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {step === 'FORM' ? 'Registrasi Talenta Daerah' : 'Verifikasi Kode OTP'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {step === 'FORM'
              ? 'Daftarkan profil Anda sekali saja untuk masuk ke radar rekrutmen industri dan akses pelatihan bersertifikasi BNSP resmi.'
              : `Masukkan 6 digit kode rahasia yang telah dikirimkan ke alamat email ${email}.`}
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Notifikasi Berhasil */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* LANGKAH 1: FORM PENDAFTARAN */}
        {step === 'FORM' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Nama Lengkap (Sesuai KTP)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Yulius Pigome"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                NIK (16 Digit)
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="910401..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
              <span className="text-[10px] text-slate-400 block">Format resmi Dukcapil Kabupaten Mimika</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Timika"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Alamat Email Aktif
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Domisili / Distrik Tempat Tinggal (Mimika)
              </label>
              <input
                type="text"
                list="register-mimika-districts"
                value={domicile}
                onChange={(e) => setDomicile(e.target.value)}
                placeholder="Pilih atau ketik distrik (contoh: Mimika Baru, Kuala Kencana, Wania, dll.)"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
              <datalist id="register-mimika-districts">
                <option value="Mimika Baru" />
                <option value="Kuala Kencana" />
                <option value="Wania" />
                <option value="Tembagapura" />
                <option value="Kwamki Narama" />
                <option value="Iwaka" />
                <option value="Mimika Timur" />
                <option value="Mimika Timur Jauh" />
                <option value="Mimika Barat" />
                <option value="Mimika Barat Jauh" />
                <option value="Mimika Barat Tengah" />
                <option value="Mimika Tengah" />
                <option value="Agimuga" />
                <option value="Jila" />
                <option value="Jita" />
                <option value="Alama" />
                <option value="Hoya" />
                <option value="Amar" />
              </datalist>
            </div>

            {/* PILIHAN KATEGORI TENAGA KERJA: LOKAL ATAU NON-LOKAL */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status Asal Tenaga Kerja
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Perda No. 7/2024
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsi 1: Talenta Lokal */}
                <button
                  type="button"
                  onClick={() => setIsLocal(true)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isLocal
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isLocal
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isLocal && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Tenaga Kerja Lokal
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Afirmasi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Masyarakat asli / warga KTP Mimika &amp; Papua.
                    </p>
                  </div>
                </button>

                {/* Opsi 2: Talenta Non-Lokal */}
                <button
                  type="button"
                  onClick={() => setIsLocal(false)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    !isLocal
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      !isLocal
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {!isLocal && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Tenaga Non-Lokal
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        Umum
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Tenaga kerja luar wilayah Kabupaten Mimika.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* FIELD 1: BUAT KATA SANDI */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Buat Kata Sandi
                </label>
                <span className="text-[10px] text-slate-400">Minimal 6 karakter</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat kata sandi minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
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

            {/* FIELD 2: KONFIRMASI KATA SANDI */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ulangi Kata Sandi
                </label>
                {isPasswordMatch && (
                  <span className="text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Cocok
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
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi yang telah dibuat"
                  className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                    isPasswordMismatch
                      ? 'border-red-400 focus:border-red-600 bg-red-50/20'
                      : isPasswordMatch
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Kotak Info Keuntungan */}
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 space-y-1 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Keunggulan Model Reverse Recruitment:
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Anda tidak perlu melamar ke pos gerbang proyek. Cukup isi profil sekali, dan algoritma AI akan merekomendasikan Anda langsung saat HRD perusahaan membuka rekrutmen.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && !isPasswordMatch)}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase">Email Tujuan:</span>
                <span className="font-mono font-semibold text-slate-700">{email}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Silakan periksa kotak masuk atau folder spam email Anda, lalu masukkan 6 digit kode angka ke dalam kotak di bawah ini.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 text-center">
                Masukkan 6 Digit Kode OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-2xl border-2 border-slate-900 px-4 py-3 text-center text-3xl font-mono font-black tracking-[10px] text-slate-900 focus:outline-hidden focus:bg-slate-50 transition-colors"
              />
              <span className="text-[11px] text-slate-400 block text-center">
                Kode berlaku selama 5 menit
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
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

            {/* Aksi Kirim Ulang & Ubah Email */}
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
                onClick={() => {
                  setStep('FORM');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-slate-500 hover:text-slate-900 underline text-[11px] cursor-pointer"
              >
                Ubah data pendaftaran
              </button>
            </div>
          </form>
        )}

        {/* Gerbang Beralih ke Registrasi Perusahaan */}
        <div className="pt-5 border-t border-slate-100 text-center space-y-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
            <div>
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                Mewakili Perusahaan / Kontraktor?
              </span>
              <span className="text-[10px] text-slate-500">
                Gunakan gerbang registrasi mitra industri untuk verifikasi NIB OSS.
              </span>
            </div>
            <Link
              href="/register/employer"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-slate-900 underline hover:text-emerald-700 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Portal Perusahaan →</span>
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Sudah memiliki akun terdaftar?{' '}
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
