'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import {
  Building2,
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  MapPin,
  Save,
  Phone,
  Mail,
  User,
  Globe,
  Camera
} from 'lucide-react';

export default function ProviderProfilePage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Form Fields
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('LPK_SWASTA');
  const [vinNumber, setVinNumber] = useState('');
  const [bnspLicenseNumber, setBnspLicenseNumber] = useState('');
  const [accreditation, setAccreditation] = useState('TERAKREDITASI_B');
  const [picName, setPicName] = useState('');
  const [picRole, setPicRole] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');
  const [address, setAddress] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
  const [institutionBio, setInstitutionBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const res = await apiFetch('/training-providers/me');
    if (res.status !== 'success') {
      router.push('/login');
      return;
    }

    const d = res.data;
    setProfile(d);
    setInstitutionName(d.institutionName || '');
    setInstitutionType(d.institutionType || 'LPK_SWASTA');
    setVinNumber(d.vinNumber || '');
    setBnspLicenseNumber(d.bnspLicenseNumber || '');
    setAccreditation(d.accreditation || 'TERAKREDITASI_B');
    setPicName(d.picName || '');
    setPicRole(d.picRole || '');
    setPicPhone(d.picPhone || '');
    setPicEmail(d.picEmail || '');
    setAddress(d.address || '');
    setLocationLat(d.locationLat !== null && d.locationLat !== undefined ? String(d.locationLat) : '-4.5468');
    setLocationLng(d.locationLng !== null && d.locationLng !== undefined ? String(d.locationLng) : '136.8837');
    setInstitutionBio(d.institutionBio || '');
    setWebsiteUrl(d.websiteUrl || '');
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      institutionName,
      institutionType,
      vinNumber: vinNumber.trim() || undefined,
      bnspLicenseNumber: bnspLicenseNumber.trim() || undefined,
      accreditation,
      picName,
      picRole: picRole.trim() || undefined,
      picPhone,
      picEmail: picEmail.trim() || undefined,
      address,
      locationLat: locationLat ? parseFloat(locationLat) : undefined,
      locationLng: locationLng ? parseFloat(locationLng) : undefined,
      institutionBio: institutionBio.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
    };

    const res = await apiFetch('/training-providers/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.status === 'success') {
      setProfile(res.data);
      showAlert('success', 'Profil Disimpan', 'Data legalitas dan operasional lembaga berhasil diperbarui.');
    } else {
      showAlert('error', 'Gagal Menyimpan', res.message || 'Terjadi kesalahan saat menyimpan profil.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/training-providers/upload-logo', {
      method: 'POST',
      body: formData,
    });

    setUploadingLogo(false);
    if (res.status === 'success') {
      showAlert('success', 'Logo Diperbarui', 'Logo lembaga pelatihan berhasil diunggah.');
      loadProfile();
    } else {
      showAlert('error', 'Upload Gagal', res.message || 'Gagal mengunggah logo.');
    }
  };

  const handleLegalDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/training-providers/upload-legal-doc', {
      method: 'POST',
      body: formData,
    });

    setUploadingDoc(false);
    if (res.status === 'success') {
      showAlert('success', 'Dokumen Legalitas Diunggah', 'Berkas PDF legalitas berhasil diunggah dan siap diverifikasi oleh Disnaker.');
      loadProfile();
    } else {
      showAlert('error', 'Upload Gagal', res.message || 'Gagal mengunggah berkas PDF.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
        <div className="bg-white border border-neutral-300 p-8 text-center space-y-3 max-w-sm w-full">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Memuat Profil Lembaga...
          </div>
        </div>
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';

  return (
    <AppShell
      userRole="TRAINING_PROVIDER"
      userName={profile?.institutionName || 'Lembaga Pelatihan'}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Profil */}
        <div className="bg-white border border-neutral-300 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-neutral-800" />
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900">
                Profil & Dokumen Legalitas Balai
              </h1>
            </div>
            <p className="text-xs text-neutral-600">
              Kelola legalitas VIN Kemnaker, akreditasi LSP/BNSP, alamat workshop pelatihan, dan kontak PIC resmi.
            </p>
          </div>

          <div className="shrink-0">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Status: APPROVED (Tier-1 Lolos)
              </span>
            ) : profile?.verificationStatus === 'REJECTED' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-red-50 text-red-900 border border-red-300">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                Status: REJECTED (Perbaiki Berkas)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300">
                <Clock className="w-4 h-4 text-amber-700" />
                Status: PENDING (Antrean Audit)
              </span>
            )}
          </div>
        </div>

        {/* Audit Notes jika ada catatan dari Disnaker */}
        {profile?.verificationNotes && (
          <div className="bg-neutral-50 border border-neutral-300 p-4 text-xs space-y-1">
            <span className="font-bold uppercase tracking-wider text-neutral-700">Catatan Auditor Disnakertrans Mimika:</span>
            <p className="text-neutral-800 italic">"{profile.verificationNotes}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SISI KIRI: UPLOAD LOGO & DOKUMEN LEGALITAS PDF */}
          <div className="space-y-6">
            
            {/* Kartu Logo Lembaga */}
            <div className="bg-white border border-neutral-300 p-5 text-center space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 text-left border-b border-neutral-200 pb-2">
                Logo Lembaga
              </div>

              <div className="w-28 h-28 mx-auto border border-neutral-300 bg-neutral-50 flex items-center justify-center relative overflow-hidden">
                {profile?.logoUrl ? (
                  <img
                    src={getFullMediaUrl(profile.logoUrl)}
                    alt="Logo Balai"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-neutral-400" />
                )}
              </div>

              <div>
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Mengunggah...' : 'Unggah Logo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
                <p className="text-[10px] text-neutral-500 mt-1.5">Format JPG/PNG/WEBP (Maks 2 MB)</p>
              </div>
            </div>

            {/* Kartu Berkas Izin Operasional PDF */}
            <div className="bg-white border border-neutral-300 p-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2 flex items-center justify-between">
                <span>Berkas Legalitas (PDF)</span>
                <FileText className="w-4 h-4 text-neutral-500" />
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                Unggah SK Izin Operasional LPK / Sertifikat Akreditasi VIN Kemnaker / Lisensi LSP BNSP dalam format PDF resmi.
              </p>

              {profile?.legalDocUrl ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Dokumen Legalitas Tersedia</span>
                  </div>
                  <a
                    href={getFullMediaUrl(profile.legalDocUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 underline hover:text-neutral-700"
                  >
                    <span>Buka / Periksa Dokumen PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Belum ada dokumen izin yang diunggah.
                </div>
              )}

              <div>
                <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral-300 hover:border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDoc ? 'Mengunggah Dokumen...' : 'Pilih Berkas PDF Baru'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleLegalDocUpload}
                    disabled={uploadingDoc}
                  />
                </label>
                <p className="text-[10px] text-neutral-500 mt-1 text-center">Format PDF (Maks 5 MB)</p>
              </div>
            </div>

          </div>

          {/* SISI KANAN: FORMULIR RINCIAN PROFIL */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-white border border-neutral-300 p-6 sm:p-8 space-y-6">
              
              {/* Bagian 1: Data Lembaga */}
              <div className="space-y-4">
                <div className="border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                    1. Identitas & Izin Lembaga
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Nama Resmi Lembaga Pelatihan
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Tipe Lembaga
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
                      Status Akreditasi
                    </label>
                    <select
                      value={accreditation}
                      onChange={(e) => setAccreditation(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
                    >
                      <option value="TERAKREDITASI_A">Terakreditasi A (Unggul)</option>
                      <option value="TERAKREDITASI_B">Terakreditasi B (Baik Sekali)</option>
                      <option value="TERAKREDITASI_C">Terakreditasi C (Baik)</option>
                      <option value="BELUM_TERAKREDITASI">Belum Terakreditasi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Nomor VIN Kemnaker
                    </label>
                    <input
                      type="text"
                      placeholder="VIN-9104-XXXX"
                      value={vinNumber}
                      onChange={(e) => setVinNumber(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Nomor Lisensi LSP BNSP
                    </label>
                    <input
                      type="text"
                      placeholder="BNSP-LSP-XXX"
                      value={bnspLicenseNumber}
                      onChange={(e) => setBnspLicenseNumber(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Profil Singkat / Bio Lembaga
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan fasilitas workshop, instruktur bersertifikat, dan kejuruan unggulan lembaga Anda..."
                    value={institutionBio}
                    onChange={(e) => setInstitutionBio(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bagian 2: PIC Lembaga */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                    2. Penanggung Jawab Resmi (PIC)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Nama Lengkap PIC
                    </label>
                    <input
                      type="text"
                      required
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={picRole}
                      onChange={(e) => setPicRole(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Nomor WhatsApp PIC (Hand-Off Talenta)
                    </label>
                    <input
                      type="tel"
                      required
                      value={picPhone}
                      onChange={(e) => setPicPhone(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Email PIC / Surel Resmi
                    </label>
                    <input
                      type="email"
                      value={picEmail}
                      onChange={(e) => setPicEmail(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Lokasi & GIS Venue */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-neutral-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                    3. Lokasi Workshop & Koordinat GIS
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Alamat Lengkap Workshop / Balai
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Latitude GIS
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="-4.5468"
                      value={locationLat}
                      onChange={(e) => setLocationLat(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                      Longitude GIS
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="136.8837"
                      value={locationLng}
                      onChange={(e) => setLocationLng(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                    Situs Web Resmi (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://lpk-mimika.sch.id"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Profil Lembaga'}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

      <AlertModal {...alertProps} />
    </AppShell>
  );
}
