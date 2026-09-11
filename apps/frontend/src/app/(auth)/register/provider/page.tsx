'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import { 
  ArrowRight, 
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
  FileCheck
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
      const msg = 'Konfirmasi kata sandi tidak cocok dengan kata sandi yang Anda masukkan.';
      setError(msg);
      showAlert('warning', 'Kata Sandi Tidak Cocok', msg);
      return;
    }

    if (password.length < 8) {
      const msg = 'Kata sandi harus memiliki panjang minimal 8 karakter.';
      setError(msg);
      showAlert('warning', 'Kata Sandi Kurang Panjang', msg);
      return;
    }

    setLoading(true);

    const payload = {
      email,
      password,
      institutionName,
      institutionType,
      vinNumber: vinNumber.trim() || undefined,
      bnspLicenseNumber: bnspLicenseNumber.trim() || undefined,
      picName,
      picRole: picRole.trim() || undefined,
      picPhone,
      address: address.trim() || undefined,
    };

    const res = await apiFetch('/auth/register/provider', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.status === 'success') {
      setStep('OTP');
      setCooldown(res.data?.cooldownSeconds || 60);
      setSuccessMessage('Pendaftaran berhasil! Kode OTP verifikasi resmi telah dikirim ke email lembaga.');
      showAlert(
        'success',
        'Pendaftaran Lembaga Berhasil!',
        'Kode OTP verifikasi resmi telah dikirim ke email lembaga. Silakan masukkan kode untuk memvalidasi pendaftaran.',
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
      body: JSON.stringify({ email, otpCode }),
    });

    setLoading(false);
    if (res.status === 'success') {
      showAlert(
        'success',
        'Akun Lembaga Terverifikasi!',
        'Selamat! Akun lembaga pelatihan Anda telah aktif. Silakan lengkapi profil legalitas dan ajukan verifikasi Tier-1 ke Disnakertrans.',
        'Masuk ke Workspace Balai →',
        () => {
          router.push('/provider');
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
      setSuccessMessage('Kode OTP baru telah berhasil dikirim kembali ke email Anda.');
    } else {
      setError(res.message || 'Gagal mengirim ulang kode OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header Lembaga Vokasi */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            Portal Penyedia Pelatihan & Balai Vokasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 uppercase">
            {step === 'FORM' ? 'Pendaftaran Lembaga Pelatihan' : 'Verifikasi OTP Lembaga'}
          </h1>
          <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
            {step === 'FORM'
              ? 'Daftarkan LPK, BLK, atau LSP Anda untuk mempublikasikan program pelatihan resmi di Skillhub Kabupaten Mimika.'
              : `Masukkan 6 digit kode OTP yang dikirimkan ke email resmi lembaga: ${email}`}
          </p>
        </div>

        {/* Notifikasi Status */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-900 p-4 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && step === 'OTP' && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: FORMULIR ONBOARDING LEMBAGA */}
        {step === 'FORM' && (
          <form onSubmit={handleRegister} className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-5">
            
            {/* Bagian 1: Identitas Institusi */}
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">1. Identitas Lembaga / Balai</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Nama Resmi Lembaga Pelatihan <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: LPK Teknik Pengelasan Kuala Kencana"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Jenis Lembaga <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                  >
                    <option value="LPK_SWASTA">LPK Swasta</option>
                    <option value="BLK_PEMERINTAH">BLK / BPVP Pemerintah</option>
                    <option value="LSP_BNSP">Lembaga Sertifikasi Profesi (LSP)</option>
                    <option value="PUSAT_PELATIHAN_INDUSTRI">Pusat Pelatihan Industri / Korporasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Nomor VIN Kemnaker
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: VIN-9104-2026-001"
                    value={vinNumber}
                    onChange={(e) => setVinNumber(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 mt-0.5">Wajib untuk lembaga LPK swasta/pemerintah.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Nomor Lisensi BNSP (Opsional jika berlisensi LSP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BNSP-LSP-410-ID"
                  value={bnspLicenseNumber}
                  onChange={(e) => setBnspLicenseNumber(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Alamat Kantor & Workshop Pelatihan
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Cenderawasih No. 45, Kel. Kwamki, Distrik Mimika Baru, Kab. Mimika"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Bagian 2: Penanggung Jawab (PIC) */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-neutral-200 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">2. Penanggung Jawab (PIC Balai)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Nama Lengkap PIC <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Markus Maturbongs"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Jabatan PIC
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Direktur Balai / Kepala Pelatihan"
                    value={picRole}
                    onChange={(e) => setPicRole(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Nomor Telepon / WhatsApp Resmi <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={picPhone}
                  onChange={(e) => setPicPhone(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-0.5">Digunakan talenta untuk konfirmasi pendaftaran via WhatsApp Hand-off.</p>
              </div>
            </div>

            {/* Bagian 3: Akun & Keamanan */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-neutral-200 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">3. Kredensial Masuk Akun</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Email Resmi Lembaga <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@lpk-mimika.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Kata Sandi <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 pr-9 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Konfirmasi Kata Sandi <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 pr-9 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <span>Mendaftarkan Lembaga...</span>
                ) : (
                  <>
                    <span>Daftarkan Lembaga & Dapatkan OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFIKASI OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">
                Kode Verifikasi OTP (6 Digit)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full border border-neutral-300 p-3 text-center text-xl font-mono tracking-widest text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500 mt-2 text-center">
                Kode verifikasi dikirimkan ke <strong>{email}</strong>
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-neutral-600 hover:text-neutral-900 underline"
              >
                ← Ubah Data Pendaftaran
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-neutral-900 font-bold hover:underline disabled:text-neutral-400 disabled:no-underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{cooldown > 0 ? `Kirim Ulang (${cooldown}d)` : 'Kirim Ulang OTP'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:bg-neutral-400 cursor-pointer"
            >
              {loading ? <span>Memverifikasi...</span> : <span>Verifikasi & Aktifkan Akun</span>}
            </button>
          </form>
        )}

        {/* Footer Navigasi */}
        <div className="text-center">
          <p className="text-xs text-neutral-600">
            Sudah memiliki akun lembaga?{' '}
            <Link href="/login" className="text-neutral-900 font-bold underline hover:text-neutral-700">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>

      <AlertModal {...alertProps} />
    </div>
  );
}
