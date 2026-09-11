'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  MapPin,
  User,
  Globe,
  Briefcase,
  Phone,
  Mail,
  FileCheck,
  ExternalLink,
  Save,
  Navigation,
  Info,
  XCircle,
} from 'lucide-react';

const INDUSTRY_SECTORS = [
  'Pertambangan & Pengolahan Energi',
  'Jasa Konstruksi, Alat Berat & Sipil',
  'Transportasi, Logistik & Pergudangan',
  'Perdagangan Besar, Eceran & Ritel',
  'Jasa Keuangan, Asuransi & Perbankan',
  'Perhotelan, Restoran & Pariwisata',
  'Kesehatan, Farmasi & Laboratorium',
  'Agribisnis, Perkebunan & Perikanan',
  'Pendidikan, Pelatihan & Riset',
  'Teknologi Informasi & Komunikasi',
  'Jasa Keamanan & Pengamanan',
  'Manufaktur & Fabrikasi',
  'Lainnya',
];

const COMPANY_SIZES = [
  { value: 'SCALE_1_10', label: '1 - 10 Karyawan (Usaha Mikro)', median: 5 },
  { value: 'SCALE_11_50', label: '11 - 50 Karyawan (Usaha Kecil)', median: 30 },
  { value: 'SCALE_51_200', label: '51 - 200 Karyawan (Usaha Menengah)', median: 125 },
  { value: 'SCALE_201_500', label: '201 - 500 Karyawan (Usaha Menengah-Besar)', median: 350 },
  { value: 'SCALE_501_1000', label: '501 - 1.000 Karyawan (Usaha Skala Besar)', median: 750 },
  { value: 'SCALE_OVER_1000', label: '> 1.000 Karyawan (Korporasi)', median: 2500 },
];

const MIMIKA_PRESETS = [
  { label: 'Timika Kota', lat: -4.5445, lng: 136.8872 },
  { label: 'Kuala Kencana', lat: -4.4312, lng: 136.8835 },
  { label: 'Portsite Pomako', lat: -4.7921, lng: 136.9015 },
  { label: 'Highland Tembagapura', lat: -4.1374, lng: 137.1128 },
];

export default function EmployerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SWEETALERT MODAL HOOK
  const { alertProps, showAlert } = useAlertModal();

  // FORM STATES
  // Pilar 1: Legalitas
  const [nib, setNib] = useState('');
  const [npwpNumber, setNpwpNumber] = useState('');
  const [nibDocUrl, setNibDocUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Pilar 2: Identitas & Skala
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [companySize, setCompanySize] = useState('SCALE_1_10');
  const [employeeCount, setEmployeeCount] = useState<number | ''>(10);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyBio, setCompanyBio] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Pilar 3: Geospasial
  const [address, setAddress] = useState('');
  const [locationLat, setLocationLat] = useState<number | ''>('');
  const [locationLng, setLocationLng] = useState<number | ''>('');

  // Pilar 4: PIC HRD
  const [picName, setPicName] = useState('');
  const [picRole, setPicRole] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await apiFetch('/employers/me');
    if (res.status === 'success') {
      const d = res.data;
      setProfile(d);
      setNib(d.nib || '');
      setNpwpNumber(d.npwpNumber || '');
      setNibDocUrl(d.nibDocUrl || '');
      setCompanyName(d.companyName || '');
      setBrandName(d.brandName || '');
      setLogoUrl(d.logoUrl || '');
      setIndustrySector(d.industrySector || '');
      setCompanySize(d.companySize || 'SCALE_1_10');
      setEmployeeCount(d.employeeCount ?? 10);
      setWebsiteUrl(d.websiteUrl || '');
      setCompanyBio(d.companyBio || '');
      setAddress(d.address || '');
      setLocationLat(d.locationLat ?? '');
      setLocationLng(d.locationLng ?? '');
      setPicName(d.picName || '');
      setPicRole(d.picRole || '');
      setPicPhone(d.picPhone || '');
      setPicEmail(d.picEmail || '');
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  // Upload Logo Handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAlert('warning', 'Ukuran Berkas Terlalu Besar', 'Ukuran berkas logo maksimal adalah 2 MB.');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/employers/upload-logo', {
      method: 'POST',
      body: formData,
    });

    setUploadingLogo(false);
    if (res.status === 'success' && res.data) {
      setLogoUrl(res.data.logoUrl);
      setMessage({ type: 'success', text: 'Logo resmi perusahaan berhasil diunggah.' });
      showAlert(
        'success',
        'Logo Berhasil Diunggah',
        'Logo resmi perusahaan telah berhasil diperbarui dan akan tampil pada seluruh lowongan dan profil resmi Anda.',
        'Selesai',
      );
    } else {
      const errMsg = res.message || 'Gagal mengunggah logo. Pastikan format file berupa gambar (JPG, PNG, WEBP).';
      setMessage({ type: 'error', text: errMsg });
      showAlert('error', 'Gagal Mengunggah Logo', errMsg);
    }
  };

  // Upload NIB PDF Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showAlert('warning', 'Format Berkas Tidak Sesuai', 'Format berkas dokumen NIB wajib berupa PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('warning', 'Ukuran Berkas Terlalu Besar', 'Ukuran berkas PDF NIB maksimal adalah 5 MB.');
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/employers/upload-nib-doc', {
      method: 'POST',
      body: formData,
    });

    setUploadingPdf(false);
    if (res.status === 'success' && res.data) {
      setNibDocUrl(res.data.nibDocUrl);
      setMessage({ type: 'success', text: 'Berkas PDF NIB OSS resmi berhasil diunggah.' });
      showAlert(
        'success',
        'Dokumen NIB Berhasil Diunggah',
        'Berkas PDF NIB OSS resmi telah tersimpan. Dokumen ini dapat langsung diaudit oleh verifikator Disnakertrans Mimika.',
        'Selesai',
      );
    } else {
      const errMsg = res.message || 'Gagal mengunggah berkas PDF NIB. Pastikan file PDF valid.';
      setMessage({ type: 'error', text: errMsg });
      showAlert('error', 'Gagal Mengunggah Dokumen', errMsg);
    }
  };

  // Handle Skala Change -> Auto-fill median
  const handleCompanySizeChange = (val: string) => {
    setCompanySize(val);
    const found = COMPANY_SIZES.find((s) => s.value === val);
    if (found) {
      setEmployeeCount(found.median);
    }
  };

  // Preset Coordinator Setter
  const applyPreset = (preset: { lat: number; lng: number; label: string }) => {
    setLocationLat(preset.lat);
    setLocationLng(preset.lng);
  };

  // Get Browser Geolocation
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      showAlert('warning', 'Perangkat Tidak Mendukung', 'Geolocation tidak didukung oleh browser Anda.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setLocationLat(lat);
        setLocationLng(lng);
        setMessage({ type: 'success', text: 'Koordinat GPS berhasil dideteksi dari perangkat Anda.' });
        showAlert(
          'info',
          'Titik GPS Ditemukan',
          `Koordinat lokasi kantor Anda berhasil diselaraskan ke Latitude ${lat}, Longitude ${lng}.`,
        );
      },
      (err) => {
        showAlert('warning', 'Akses Lokasi Gagal', 'Gagal mendeteksi lokasi perangkat: ' + err.message);
      },
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      companyName,
      brandName: brandName || undefined,
      industrySector: industrySector || undefined,
      companySize,
      employeeCount: employeeCount === '' ? undefined : Number(employeeCount),
      address: address || undefined,
      locationLat: locationLat === '' ? undefined : Number(locationLat),
      locationLng: locationLng === '' ? undefined : Number(locationLng),
      companyBio: companyBio || undefined,
      websiteUrl: websiteUrl || undefined,
      npwpNumber: npwpNumber || undefined,
      logoUrl: logoUrl || undefined,
      nibDocUrl: nibDocUrl || undefined,
      picName: picName || undefined,
      picRole: picRole || undefined,
      picPhone: picPhone || undefined,
      picEmail: picEmail || undefined,
    };

    const res = await apiFetch('/employers/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.status === 'success') {
      setProfile(res.data);
      setMessage({ type: 'success', text: 'Profil dan berkas legalitas perusahaan berhasil disimpan.' });
      showAlert(
        'success',
        'Profil Berhasil Disimpan',
        'Seluruh pembaruan data legalitas, identitas korporat, alamat kantor Mimika, dan kontak PIC HRD berhasil disimpan ke sistem.',
        'Oke, Lanjutkan',
      );
    } else {
      const errMsg = res.message || 'Gagal menyimpan profil perusahaan. Silakan periksa kembali kelengkapan formulir Anda.';
      setMessage({ type: 'error', text: errMsg });
      showAlert('error', 'Gagal Menyimpan Profil', errMsg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-neutral-600">
        Memuat Profil Perusahaan...
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';
  const isRejected = profile?.verificationStatus === 'REJECTED';
  const isPending = profile?.verificationStatus === 'PENDING';

  const hasNibDoc = Boolean(nibDocUrl);
  const hasLogo = Boolean(logoUrl);
  const hasGps = locationLat !== '' && locationLng !== '';
  const hasPic = Boolean(picName && picPhone);

  return (
    <AppShell userRole="EMPLOYER" userName={companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* HEADER JUDUL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              Pusat Kepatuhan & Tata Kelola Korporat
            </span>
            <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-neutral-800" />
              Profil & Legalitas Perusahaan
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-3 py-1.5 ${
                isApproved
                  ? 'bg-emerald-700 text-white'
                  : isRejected
                  ? 'bg-rose-700 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isApproved ? (
                <ShieldCheck className="w-4 h-4" />
              ) : isRejected ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              STATUS: {profile?.verificationStatus}
            </span>
          </div>
        </div>

        {/* BANNER STATUS KEPATUHAN & AUDIT DISNAKER */}
        {isPending && (
          <div className="bg-amber-50 border-2 border-amber-300 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Status Akun: Menunggu Audit & Verifikasi Dokumen Disnakertrans Mimika
                </h2>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Untuk menerbitkan lowongan pekerjaan atau magang, lengkapi berkas legalitas NIB OSS, logo resmi, titik koordinat kantor, dan kontak PIC HRD di bawah ini. Tim Disnakertrans akan memverifikasi keabsahan izin operasional perusahaan Anda.
                </p>
              </div>
            </div>

            {/* Checklist Kelengkapan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-neutral-700">Registrasi Akun & Email Resmi (Selesai)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasNibDoc ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
                <span className={hasNibDoc ? 'text-neutral-700 font-medium' : 'text-amber-900 font-bold'}>
                  Berkas PDF NIB OSS {hasNibDoc ? '(Sudah Diunggah)' : '(Wajib Diunggah)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasLogo && hasGps ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
                <span className={hasLogo && hasGps ? 'text-neutral-700 font-medium' : 'text-amber-900 font-bold'}>
                  Logo & Koordinat GPS Kantor {hasLogo && hasGps ? '(Lengkap)' : '(Wajib Dilengkapi)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasPic ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
                <span className={hasPic ? 'text-neutral-700 font-medium' : 'text-amber-900 font-bold'}>
                  PIC HRD & No. WhatsApp {hasPic ? '(Lengkap)' : '(Wajib Dilengkapi)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="bg-rose-50 border-2 border-rose-300 p-5 space-y-2">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Verifikasi Berkas Ditolak oleh Disnakertrans Mimika
                </h2>
                <p className="text-xs text-rose-800 mt-1">
                  Catatan Auditor Disnaker:{' '}
                  <span className="font-semibold">{profile?.verificationNotes || 'Dokumen belum memenuhi syarat.'}</span>
                </p>
                <p className="text-xs text-rose-700 mt-1">
                  Silakan perbarui berkas dokumen izin usaha NIB OSS atau data kontak yang valid, kemudian klik Simpan untuk pengajuan ulang.
                </p>
              </div>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="bg-emerald-50 border border-emerald-300 p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  Perusahaan Sah & Terverifikasi Disnakertrans Mimika
                </span>
                <span className="text-[11px] text-emerald-800">
                  Akun Anda aktif dan berwenang menerbitkan lowongan pekerjaan serta melakukan pendekatan langsung ke talenta Mimika.
                </span>
              </div>
            </div>
            {profile?.verifiedAt && (
              <span className="text-[11px] font-mono text-emerald-800 bg-white px-2.5 py-1 border border-emerald-200">
                Disahkan: {new Date(profile.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        )}

        {/* NOTIFIKASI SUKSES / ERROR */}
        {message && (
          <div
            className={`p-4 border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* FORMULIR UTAMA 4 PILAR */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* ============================================================ */}
          {/* PILAR 1: LEGALITAS & DOKUMEN OSS */}
          {/* ============================================================ */}
          <div className="bg-white border border-neutral-300 p-6 space-y-4 shadow-xs">
            <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-neutral-800" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                  01. Legalitas & Perizinan Berusaha (OSS)
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 border border-neutral-200 font-semibold">
                Invarian Audit Hukum
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nomor Induk Berusaha (NIB OSS 13-Digit)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={nib}
                    className="w-full border border-neutral-300 bg-neutral-50 p-2.5 text-xs font-mono text-neutral-800 cursor-not-allowed"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[10px] font-bold uppercase bg-neutral-200 text-neutral-700 px-1.5 py-0.5">
                    Terkunci
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Nomor NIB didaftarkan saat registrasi awal dan diverifikasi Disnakertrans.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nomor Pokok Wajib Pajak (NPWP Badan Usaha)
                </label>
                <input
                  type="text"
                  value={npwpNumber}
                  onChange={(e) => setNpwpNumber(e.target.value)}
                  placeholder="Contoh: 01.234.567.8-901.000"
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Opsional, melengkapi kepatuhan perpajakan badan usaha.
                </p>
              </div>
            </div>

            {/* UPLOAD BERKAS PDF NIB OSS */}
            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                Berkas Fisik Dokumen Izin Usaha / NIB OSS (Format PDF Resmi, Maks. 5 MB) <span className="text-red-600">*</span>
              </label>

              {nibDocUrl ? (
                <div className="border border-emerald-300 bg-emerald-50/60 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 block text-xs">
                        Dokumen NIB OSS Terunggah
                      </span>
                      <span className="text-[10px] text-emerald-800 font-mono">
                        {nibDocUrl.split('/').pop()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={getFullMediaUrl(nibDocUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka PDF</span>
                    </a>
                    <label className="bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingPdf ? 'Mengunggah...' : 'Ganti Dokumen'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-neutral-50 p-6 text-center space-y-2 transition-colors">
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
                  <div>
                    <span className="font-bold text-neutral-700 block text-xs">
                      Belum ada berkas PDF NIB OSS yang diunggah
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Unggah dokumen resmi dari BKPM/Kementerian Investasi (Maks. 5 MB)
                    </span>
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingPdf ? 'Mengunggah PDF...' : 'Pilih Berkas PDF NIB'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* PILAR 2: IDENTITAS KORPORAT & SKALA USAHA */}
          {/* ============================================================ */}
          <div className="bg-white border border-neutral-300 p-6 space-y-4 shadow-xs">
            <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-neutral-800" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                  02. Identitas Korporat & Skala Usaha
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 border border-neutral-200 font-semibold">
                Profil Badan Usaha
              </span>
            </div>

            {/* LOGO RESMI */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-neutral-50 border border-neutral-200">
              <div className="w-20 h-20 bg-white border border-neutral-300 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img
                    src={getFullMediaUrl(logoUrl)}
                    alt="Logo Perusahaan"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-neutral-400" />
                )}
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 block">
                  Logo Resmi Perusahaan (PNG / JPG / WEBP, Maks. 2 MB)
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  Logo ini akan tercantum pada setiap lowongan pekerjaan dan surat penawaran resmi (reverse recruitment) ke talenta.
                </span>
                <div>
                  <label className="inline-flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingLogo ? 'Mengunggah...' : logoUrl ? 'Ganti Logo' : 'Unggah Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nama Resmi Perusahaan (Sesuai Akta / NIB) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Contoh: PT Citra Geometrik Indonesia"
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nama Merek Dagang / Nama Populer
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Citra Geometrik (Kosongkan jika sama dengan PT)"
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Sektor Industri Utama
                </label>
                <select
                  value={industrySector}
                  onChange={(e) => setIndustrySector(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs bg-white focus:border-neutral-900 focus:outline-none"
                >
                  <option value="">-- Pilih Sektor Industri --</option>
                  {INDUSTRY_SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Website Resmi Perusahaan
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://perusahaan.co.id"
                    className="w-full border border-neutral-300 p-2.5 pl-8 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                  <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Skala Tenaga Kerja (Company Size)
                </label>
                <select
                  value={companySize}
                  onChange={(e) => handleCompanySizeChange(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 text-xs bg-white focus:border-neutral-900 focus:outline-none"
                >
                  {COMPANY_SIZES.map((cs) => (
                    <option key={cs.value} value={cs.value}>
                      {cs.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Mempengaruhi formula agregasi serapan tenaga kerja di Command Center Disnaker.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Estimasi Jumlah Karyawan Aktif (Orang)
                </label>
                <input
                  type="number"
                  min="0"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 10"
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Terisi otomatis berdasarkan median skala, dapat disesuaikan manual.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Profil Singkat / Tentang Perusahaan
              </label>
              <textarea
                rows={3}
                value={companyBio}
                onChange={(e) => setCompanyBio(e.target.value)}
                placeholder="Jelaskan bidang usaha, fokus operasional, atau lingkup proyek perusahaan Anda di Kabupaten Mimika..."
                className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* PILAR 3: JANGKAR GEOSPASIAL KANTOR OPERASIONAL MIMIKA */}
          {/* ============================================================ */}
          <div className="bg-white border border-neutral-300 p-6 space-y-4 shadow-xs">
            <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-800" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                  03. Jangkar Geospasial Kantor Operasional Mimika
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 border border-neutral-200 font-semibold">
                Basis Jarak GIS Talenta
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Alamat Lengkap Kantor Operasional / Site di Mimika <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Cenderawasih No. 88, Kuala Kencana, Mimika, Papua Tengah"
                className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none leading-relaxed"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Alamat ini akan otomatis digunakan sebagai lokasi bawaan saat menerbitkan lowongan pekerjaan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Titik Garis Lintang (Latitude) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={locationLat}
                  onChange={(e) => setLocationLat(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: -4.5445"
                  className="w-full border border-neutral-300 p-2.5 text-xs font-mono focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Titik Garis Bujur (Longitude) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={locationLng}
                  onChange={(e) => setLocationLng(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 136.8872"
                  className="w-full border border-neutral-300 p-2.5 text-xs font-mono focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* QUICK PRESET BUTTONS */}
            <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Pilih Cepat Koordinat Wilayah Mimika:
              </span>
              <div className="flex flex-wrap gap-2">
                {MIMIKA_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>{p.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  className="border border-neutral-900 bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Deteksi GPS Perangkat</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PILAR 4: PERSON IN CHARGE (PIC) HRD & REKRUTMEN */}
          {/* ============================================================ */}
          <div className="bg-white border border-neutral-300 p-6 space-y-4 shadow-xs">
            <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-800" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                  04. Person in Charge (PIC) HRD & Rekrutmen Resmi
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 border border-neutral-200 font-semibold">
                Kontak Sah Komunikasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nama Lengkap Pejabat PIC HRD <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  placeholder="Contoh: Robertus Wamang, S.T."
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Jabatan / Posisi PIC di Perusahaan
                </label>
                <input
                  type="text"
                  value={picRole}
                  onChange={(e) => setPicRole(e.target.value)}
                  placeholder="Contoh: HR & Recruitment Manager"
                  className="w-full border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nomor Handphone / WhatsApp PIC Resmi <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={picPhone}
                    onChange={(e) => setPicPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full border border-neutral-300 p-2.5 pl-8 text-xs font-mono focus:border-neutral-900 focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Nomor ini akan digunakan sebagai jalur kontak resmi pada surat penawaran kerja (WhatsApp Hand-off).
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Email Khusus Rekrutmen Perusahaan
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={picEmail}
                    onChange={(e) => setPicEmail(e.target.value)}
                    placeholder="Contoh: recruitment@perusahaan.co.id"
                    className="w-full border border-neutral-300 p-2.5 pl-8 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Email dinas untuk korespondensi resmi dengan pelamar dan Disnakertrans.
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON BAR */}
          <div className="sticky bottom-4 z-20 bg-white border-2 border-neutral-900 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-neutral-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>
                Pastikan data yang diinput akurat sesuai izin berusaha OSS untuk kelancaran verifikasi oleh Disnakertrans.
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan Profil...' : 'Simpan Profil & Perbarui Dokumen Legalitas'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SWEETALERT STYLE FEEDBACK MODAL */}
      <AlertModal {...alertProps} />
    </AppShell>
  );
}
