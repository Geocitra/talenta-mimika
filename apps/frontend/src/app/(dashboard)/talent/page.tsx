'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { 
  User, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Save, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Share2,
  AlertCircle,
  Award,
  FileText,
  Upload,
  ExternalLink,
  Eye,
  Compass,
  Link2,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  Camera,
  ShieldCheck,
  Lock,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Coins,
  Clock,
  Users
} from 'lucide-react';
import { InstitutionAutocomplete } from '@/components/InstitutionAutocomplete';
import { MajorCombobox } from '@/components/MajorCombobox';
import { SkillCombobox } from '@/components/SkillCombobox';
import { PreFlightReviewModal } from '@/components/PreFlightReviewModal';
import { AlertModal, useAlertModal } from '@/components/AlertModal';

function formatWhatsAppLink(phone: string | null | undefined, picName: string | null | undefined, vacancyTitle: string, talentName: string) {
  if (!phone) return '#';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  const text = `Halo Bapak/Ibu ${picName || 'HRD'}, saya ${talentName} telah menerima Surat Penawaran Kerja Resmi di MIMIKA TALENTA untuk posisi "${vacancyTitle}". Saya bermaksud menindaklanjuti proses ini. Terima kasih.`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export default function TalentProfilePage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editable States
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<{ 
    name: string; 
    level: string;
    isLmsVerified?: boolean;
    certificateNumber?: string;
    verifiedAt?: string;
  }[]>([]);
  const [workExperience, setWorkExperience] = useState<{
    companyName: string;
    position: string;
    employmentType?: 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'PART_TIME' | 'FREELANCE';
    durationValue?: number;
    durationUnit?: 'BULAN' | 'TAHUN';
    durationMonths: number;
    description: string;
  }[]>([]);
  const [education, setEducation] = useState<{ institution: string; degree: string; major: string; rawMajorInput?: string; isAiNormalized?: boolean; aiConfidence?: number; graduationYear: number }[]>([]);
  
  // Certifications (PDF Upload)
  const [certifications, setCertifications] = useState<{
    name: string;
    issuer: string;
    issueYear: number;
    expiryYear?: number;
    credentialId?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }[]>([]);
  const [uploadingCertIndex, setUploadingCertIndex] = useState<number | null>(null);

  // Profile Picture (Avatar)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Social DNA Factual Feeds & Field Preferences
  const [organizations, setOrganizations] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [customPrefInput, setCustomPrefInput] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('TIMIKA');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const PRESET_WORK_PREFERENCES = [
    'Siap Shift Malam (24 Jam)',
    'Siap Remote Area / Pit Tambang',
    'Siap Roster Kerja (6-2 / 4-2)',
    'Siap Lembur Operasional & On-Call',
    'Siap Kerja Lapangan / Luar Ruangan',
    'Siap Kontrak Proyek (PKWT)',
    'Khusus Jam Kerja Normal (Day Shift)',
    'Siap Bekerja di Dataran Tinggi (Highland)',
  ];

  const getPreviewUrl = (fileUrl?: string) => getFullMediaUrl(fileUrl) || '#';
  const getAvatarDisplayUrl = (url?: string | null) => getFullMediaUrl(url);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await apiFetch('/talents/me');
    if (res.status === 'success') {
      const data = res.data;
      setProfile(data);
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatarUrl || null);
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setWorkExperience(Array.isArray(data.workExperience) ? data.workExperience : []);
      setEducation(Array.isArray(data.education) ? data.education : []);
      setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
      
      // Parse workPreferences (array or string)
      const prefs = Array.isArray(data.socialDna?.workPreferences)
        ? data.socialDna.workPreferences
        : (typeof data.socialDna?.workPreferences === 'string' && data.socialDna.workPreferences)
          ? data.socialDna.workPreferences.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];
      setSelectedPreferences(prefs);

      setOrganizations(data.socialDna?.organizations || data.socialDna?.communityActivities || '');
      setPortfolioUrl(data.socialDna?.portfolioUrl || '');
      setPreferredLocation(data.socialDna?.preferredLocation || 'TIMIKA');
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  const handleOpenReviewModal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReviewModal(true);
  };

  const executeSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    const payload = {
      phone,
      bio,
      avatarUrl,
      skills,
      workExperience,
      education,
      certifications,
      lastUpdatedAt: profile?.updatedAt,
      socialDna: {
        workPreferences: selectedPreferences,
        organizations,
        communityActivities: organizations,
        portfolioUrl,
        preferredLocation,
      },
    };

    const res = await apiFetch('/talents/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    setSaving(false);
    setShowReviewModal(false);
    if (res.status === 'success') {
      setProfile(res.data);
      setMessage('Profil berhasil dimutakhirkan dan disinkronkan ke radar industri Mimika!');
      setErrorMessage('');
      showAlert(
        'success',
        'Profil Berhasil Disimpan!',
        'Data profil Anda telah berhasil dimutakhirkan dan disinkronkan ke radar industri ketenagakerjaan daerah Mimika.',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (res.statusCode === 409 || (res.message && res.message.includes('diperbarui'))) {
      const warnMsg = 'Data profil Anda telah diperbarui oleh kegiatan lain (misal: kelulusan pelatihan LMS). Halaman telah disegarkan dengan data terbaru.';
      setErrorMessage(`Sinkronisasi Terdeteksi: ${warnMsg}`);
      setMessage('');
      showAlert('warning', 'Sinkronisasi Terdeteksi', warnMsg);
      await loadProfile();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const errMsg = res.message || 'Gagal menyimpan profil.';
      setErrorMessage(errMsg);
      showAlert('error', 'Gagal Menyimpan Profil', errMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  const addCustomPreference = () => {
    const trimmed = customPrefInput.trim();
    if (!trimmed) return;
    if (!selectedPreferences.includes(trimmed)) {
      setSelectedPreferences([...selectedPreferences, trimmed]);
    }
    setCustomPrefInput('');
  };

  const removePreference = (pref: string) => {
    setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
  };

  // Helper Array Modifiers
  const addSkill = () => setSkills([...skills, { name: '', level: 'INTERMEDIATE' }]);
  const removeSkill = (index: number) => {
    const target = skills[index];
    if (target?.isLmsVerified) {
      showAlert(
        'warning',
        'Keahlian Terverifikasi LMS',
        'Keahlian resmi yang terverifikasi melalui kelulusan pelatihan LMS Disnakertrans tidak dapat dihapus secara manual.',
      );
      return;
    }
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addWork = () => setWorkExperience([
    ...workExperience,
    {
      companyName: '',
      position: '',
      employmentType: 'FULL_TIME',
      durationValue: 1,
      durationUnit: 'TAHUN',
      durationMonths: 12,
      description: '',
    },
  ]);
  const removeWork = (index: number) => setWorkExperience(workExperience.filter((_, i) => i !== index));

  const addEdu = () => setEducation([...education, { institution: '', degree: 'SMK', major: '', graduationYear: 2020 }]);
  const removeEdu = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: '',
        issuer: '',
        issueYear: new Date().getFullYear(),
        expiryYear: undefined,
        credentialId: '',
        fileUrl: '',
        fileName: '',
        fileSize: 0,
      },
    ]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleCertificateUpload = async (index: number, file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showAlert('warning', 'Format Berkas Tidak Sesuai', 'Hanya format dokumen PDF (.pdf) yang diperbolehkan untuk sertifikat & lisensi.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('warning', 'Ukuran Berkas Terlalu Besar', 'Ukuran berkas PDF melebihi batas maksimal 5 MB.');
      return;
    }

    setUploadingCertIndex(index);

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/talents/upload-certificate', {
      method: 'POST',
      body: formData,
    });

    setUploadingCertIndex(null);

    if (res.status === 'success' && res.data) {
      const next = [...certifications];
      next[index].fileUrl = res.data.fileUrl;
      next[index].fileName = res.data.fileName;
      next[index].fileSize = res.data.fileSize;
      setCertifications(next);
      showAlert(
        'success',
        'Sertifikat Berhasil Diunggah!',
        `Berkas ${res.data.fileName || 'dokumen sertifikat'} berhasil diunggah dan disimpan ke profil Anda.`,
      );
    } else {
      showAlert('error', 'Gagal Mengunggah Berkas', res.message || 'Gagal mengunggah file sertifikat. Pastikan file PDF valid.');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('warning', 'Format Berkas Tidak Sesuai', 'Berkas harus berupa foto / gambar (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showAlert('warning', 'Ukuran Foto Terlalu Besar', 'Ukuran foto maksimal adalah 2 Megabytes (MB).');
      return;
    }

    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/talents/upload-avatar', {
      method: 'POST',
      body: formData,
    });

    setUploadingAvatar(false);

    if (res.status === 'success' && res.data) {
      setAvatarUrl(res.data.avatarUrl);
      setProfile((prev: any) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      showAlert('success', 'Foto Profil Berhasil Diperbarui!', 'Foto profil terbaru Anda telah berhasil disimpan dan ditampilkan.');
    } else {
      showAlert('error', 'Gagal Mengunggah Foto', res.message || 'Gagal mengunggah foto profil.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">Memuat Data Profil...</div>;
  }

  const completeness = profile?.profileCompletenessScore || 20;

  return (
    <AppShell userRole="TALENT" userName={profile?.fullName || 'Kandidat'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner Status & Skor Kelengkapan */}
        <div className="bg-white border border-neutral-300 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-200 pb-5">
            <div className="flex items-center gap-4">
              {/* Foto Profil / Pas Foto Avatar */}
              <div className="relative group w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 border-2 border-neutral-900 shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={getAvatarDisplayUrl(avatarUrl) || ''}
                    alt={profile?.fullName || 'Pas Foto Profil'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-100">
                    <User className="w-8 h-8 text-neutral-400 mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                      Foto Profil
                    </span>
                  </div>
                )}

                {/* Hover Overlay Button */}
                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1">
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase leading-tight">
                    {uploadingAvatar ? 'Mengunggah...' : avatarUrl ? 'Ganti Foto' : 'Unggah Foto'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingAvatar}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-neutral-900 text-white px-2 py-0.5 mb-1.5">
                  Talenta Aktif
                </span>
                <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                  {profile?.fullName}
                </h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                  NIK: {profile?.nik} &bull; Terdaftar di Kabupaten Mimika
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <label className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-neutral-900 hover:text-neutral-600 underline cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{uploadingAvatar ? 'Mengunggah Foto...' : avatarUrl ? 'Ganti Pas Foto' : '+ Unggah Pas Foto'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingAvatar}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl(null);
                        setProfile((prev: any) => ({ ...prev, avatarUrl: null }));
                      }}
                      className="text-[10px] text-neutral-400 hover:text-red-700 uppercase font-semibold cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right w-full sm:w-auto shrink-0">
              <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                Kelengkapan Profil
              </div>
              <div className="text-2xl font-bold text-neutral-900">{completeness}%</div>
            </div>
          </div>

          {/* Progress Bar Zero Rounded */}
          <div className="w-full bg-neutral-200 h-2 mt-4">
            <div 
              className="bg-neutral-900 h-2 transition-all duration-500" 
              style={{ width: `${completeness}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-600 mt-2">
            <span>Profil aktif di radar penempatan industri Disnakertrans</span>
            <span className="font-semibold text-neutral-900">
              {completeness === 100 ? 'Profil Lengkap' : 'Lengkapi data untuk memaksimalkan rekomendasi'}
            </span>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-300 text-green-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-amber-50 border border-amber-400 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* KARTU TAWARAN KERJA RESMI (MIMIKA TALENTA) - REVERSE RECRUITMENT */}
        {/* ============================================================ */}
        {Array.isArray(profile?.approaches) && profile.approaches.length > 0 && (
          <div className="space-y-4">
            <div className="bg-neutral-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Penawaran Kerja & Penjajakan Masuk
                  </span>
                </div>
                <h2 className="text-base font-bold uppercase tracking-tight text-white mt-0.5">
                  Tawaran Langsung dari Industri Terverifikasi
                </h2>
                <p className="text-[11px] text-neutral-300">
                  Perusahaan telah meninjau kompetensi Anda dan mengajukan penawaran langsung secara proaktif.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-white text-xs font-mono font-bold">
                  {profile.approaches.length} Penawaran
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {profile.approaches.map((app: any) => {
                const vac = app.vacancy;
                const emp = vac?.employer;
                const isInternship = vac?.opportunityType === 'INTERNSHIP';
                const waLink = formatWhatsAppLink(emp?.picPhone, emp?.picName, vac?.title || 'Posisi', profile?.fullName || 'Talenta');
                const status = app.status || 'APPROACHED';

                return (
                  <div key={app.id} className="bg-white border-2 border-neutral-900 divide-y divide-neutral-200">
                    {/* Header Perusahaan: Logo, Nama, NIB, Badge Verifikasi */}
                    <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-50/70">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 bg-white border border-neutral-300 shrink-0 overflow-hidden flex items-center justify-center">
                          {emp?.logoUrl ? (
                            <img
                              src={getFullMediaUrl(emp.logoUrl) || ''}
                              alt={emp.companyName || 'Perusahaan'}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold uppercase text-neutral-900">
                              {emp?.companyName || 'Perusahaan Terverifikasi'}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              Terverifikasi Disnakertrans
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-0.5">
                            NIB: <span className="font-mono font-semibold text-neutral-900">{emp?.nib || '-'}</span> &bull; Bidang: <span className="font-semibold text-neutral-800">{emp?.industrySector || 'Industri Terbuka'}</span>
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            {emp?.address || 'Kabupaten Mimika, Papua Tengah'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-end border-t sm:border-t-0 border-neutral-200 pt-2 sm:pt-0">
                        <div className="mb-1">
                          {status === 'HIRED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Resmi Diterima Bekerja
                            </span>
                          ) : status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-500 text-white text-[10px] font-bold uppercase tracking-wider">
                              <X className="w-3.5 h-3.5" />
                              Penjajakan Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5" />
                              Tahap Penjajakan / Wawancara
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                          Kesesuaian Kualifikasi
                        </div>
                        <div className="text-2xl font-bold font-mono text-emerald-700">
                          {Math.round(Number(app.aiMatchScore || 90))}%
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Banner Status Penjajakan */}
                    <div className="px-5 py-3 border-b border-neutral-200">
                      {status === 'HIRED' ? (
                        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950 text-xs">
                          <div className="font-bold uppercase tracking-wider text-emerald-900 mb-0.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            Status: Resmi Diterima & Terikat Kontrak Aktif
                          </div>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            Selamat! Perusahaan telah resmi merekrut Anda untuk posisi ini. Status profil Anda kini terikat kontrak kerja aktif dan diproteksi di pangkalan data ketenagakerjaan daerah Mimika.
                          </p>
                        </div>
                      ) : status === 'REJECTED' ? (
                        <div className="p-3 bg-neutral-100 border-l-4 border-neutral-400 text-neutral-800 text-xs">
                          <div className="font-bold uppercase tracking-wider text-neutral-700 mb-0.5 flex items-center gap-1.5">
                            <X className="w-4 h-4 text-neutral-500" />
                            Status: Penjajakan Selesai
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-relaxed">
                            Proses penjajakan untuk posisi ini telah selesai. Profil Anda tetap aktif di bursa talenta daerah Mimika dan siap menerima tawaran dari industri lainnya.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-xs">
                          <div className="font-bold uppercase tracking-wider text-amber-900 mb-0.5 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-700" />
                            Status: Dalam Tahap Penjajakan & Wawancara
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Perusahaan telah membuka kontak Anda dan sedang/akan menghubungi Anda via WhatsApp atau Telepon untuk tahapan wawancara. Anda juga dapat berinisiatif menghubungi PIC HRD di bawah ini.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rincian Posisi & Kompensasi */}
                    <div className="p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              isInternship
                                ? 'bg-purple-50 text-purple-900 border-purple-300'
                                : 'bg-blue-50 text-blue-900 border-blue-300'
                            }`}>
                              {isInternship ? 'Pemagangan Vokasi' : 'Pekerjaan Reguler'}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300">
                              Kebutuhan: {vac?.quota || 1} Orang
                            </span>
                          </div>
                          <h4 className="text-lg font-bold uppercase text-neutral-900">
                            Posisi Ditawarkan: {vac?.title}
                          </h4>
                        </div>

                        {/* Kompensasi Box */}
                        <div className="p-3 bg-neutral-100 border border-neutral-300 text-right sm:min-w-[240px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block">
                            {isInternship ? 'Uang Saku Pemagangan' : 'Estimasi Kompensasi Bulanan'}
                          </span>
                          <span className="text-base font-bold font-mono text-neutral-900 block">
                            {isInternship
                              ? (vac?.stipendAmount ? `Rp ${Number(vac.stipendAmount).toLocaleString('id-ID')} / bulan` : 'Uang Saku Standar Disnakertrans')
                              : (vac?.salaryMin && vac?.salaryMax
                                  ? `Rp ${Number(vac.salaryMin).toLocaleString('id-ID')} - Rp ${Number(vac.salaryMax).toLocaleString('id-ID')}`
                                  : 'Kompetitif / Sesuai Pengalaman (Negosiasi)')}
                          </span>
                        </div>
                      </div>

                      {/* Info Penempatan & Jadwal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 bg-neutral-50 border border-neutral-200">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-neutral-500 block">
                            Penempatan & Zona Operasional:
                          </span>
                          <span className="font-semibold text-neutral-800">
                            {vac?.workZone ? vac.workZone.replace(/_/g, ' ') : 'TIMIKA KOTA'}, Kab. Mimika
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-neutral-500 block">
                            Pola & Jadwal Kerja:
                          </span>
                          <span className="font-semibold text-neutral-800">
                            {vac?.workSchedule ? vac.workSchedule.replace(/_/g, ' ') : 'NORMAL DAY'}
                          </span>
                        </div>
                      </div>

                      {/* Fasilitas & Kesejahteraan Checklist */}
                      {Array.isArray(vac?.benefits) && vac.benefits.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                            Fasilitas & Kesejahteraan yang Dijamin:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            {vac.benefits.map((ben: string, bIdx: number) => (
                              <div key={bIdx} className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-neutral-800 font-medium">{ben}</span>
                              </div>
                            ))}
                            {vac?.hasAbsorptionOpportunity && (
                              <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-300 text-emerald-900">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span className="font-bold text-xs">Peluang Rekrutmen Tetap</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sarana & Inventaris Kerja Disediakan Perusahaan */}
                      {Array.isArray(vac?.workTools) && vac.workTools.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-amber-700" />
                            Sarana, Alat & Inventaris Kerja Disediakan Perusahaan:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            {vac.workTools.map((tool: string, tIdx: number) => (
                              <div key={tIdx} className="flex items-center gap-2 p-2 bg-amber-50/70 border border-amber-300 text-amber-950 font-medium">
                                <Wrench className="w-3 h-3 text-amber-700 shrink-0" />
                                <span>{tool}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mentor jika Pemagangan */}
                      {isInternship && vac?.mentorName && (
                        <div className="p-2.5 bg-purple-50 border border-purple-200 text-xs text-purple-900">
                          <span className="font-bold uppercase text-[10px] tracking-wider block">Pembimbing Teknis Lapangan:</span>
                          <span>{vac.mentorName} ({vac.mentorRole || 'Mentor Senior Operasional'})</span>
                        </div>
                      )}

                      {/* Kontak Resmi HRD & CTA Action */}
                      <div className="p-4 bg-neutral-50 border border-neutral-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                            Kontak Resmi Person in Charge (PIC) HRD:
                          </span>
                          <div className="text-sm font-bold text-neutral-900 mt-0.5">
                            {emp?.picName || 'Tim Rekrutmen Perusahaan'}
                          </div>
                          <div className="text-xs text-neutral-600">
                            Dept. Human Capital &bull; Telp/WA: <span className="font-mono font-semibold text-neutral-900">{emp?.picPhone || '-'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {emp?.picPhone && status !== 'REJECTED' && (
                            <>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex-1 sm:flex-none text-center"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>{status === 'HIRED' ? 'Hubungi HRD Perusahaan' : 'Konfirmasi via WhatsApp'}</span>
                              </a>
                              <a
                                href={`tel:${emp.picPhone}`}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors"
                                title="Telepon Langsung"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          {status === 'REJECTED' && (
                            <span className="text-xs text-neutral-500 italic px-3 py-2 bg-neutral-100 border border-neutral-200">
                              Penjajakan telah ditutup
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Catatan Disnakertrans Mimika */}
                      <div className="p-3 bg-amber-50/70 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 text-amber-900">
                            Jaminan Pengawasan Disnakertrans Kabupaten Mimika:
                          </span>
                          <p className="text-[11px] leading-relaxed text-amber-900">
                            Tawaran ini resmi dan diawasi langsung oleh Dinas Tenaga Kerja Kabupaten Mimika sesuai <strong>Perda No. 7 Tahun 2024</strong> tentang Perlindungan dan Penempatan Tenaga Kerja Lokal. Seluruh proses penempatan dan seleksi <strong>TIDAK DIPUNGUT BIAYA APAPUN (GRATIS)</strong>. Laporkan jika ada pihak yang meminta imbalan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Profil Tunggal Tanpa Nested Box */}
        <form onSubmit={handleOpenReviewModal} className="bg-white border border-neutral-300 divide-y divide-neutral-200">
          {/* Bagian 1: Biodata & Kontak */}
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-700" />
              1. Kontak & Ringkasan Diri
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Ringkasan Pengalaman (Bio)
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contoh: Operator excavator bersertifikasi dengan pengalaman proyek tambang."
                  className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Riwayat Pendidikan */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-neutral-700" />
                2. Riwayat Pendidikan Formal
              </h2>
              <button
                type="button"
                onClick={addEdu}
                className="inline-flex items-center gap-1 border border-neutral-300 px-2 py-1 text-[11px] font-semibold uppercase hover:bg-neutral-100"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">Belum ada data pendidikan.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <InstitutionAutocomplete
                      value={edu.institution}
                      onChange={(val, item) => {
                        const next = [...education];
                        next[idx].institution = val;
                        if (item) {
                          if (item.category === 'SMA') next[idx].degree = 'SMA';
                          else if (item.category === 'SMK') next[idx].degree = 'SMK';
                          else if (item.category === 'KAMPUS' && (next[idx].degree === 'SMA' || next[idx].degree === 'SMK')) {
                            next[idx].degree = 'S1';
                          }
                        }
                        setEducation(next);
                      }}
                      placeholder="Ketik nama kampus / sekolah (cth: Uncen, ITB, SMKN 1 Mimika)..."
                    />
                    <select
                      value={edu.degree}
                      onChange={(e) => {
                        const next = [...education];
                        next[idx].degree = e.target.value;
                        setEducation(next);
                      }}
                      className="w-24 border border-neutral-300 px-2 py-2 text-xs focus:outline-none focus:border-neutral-900"
                    >
                      <option value="SMA">SMA</option>
                      <option value="SMK">SMK</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                    </select>
                    <MajorCombobox
                      value={edu.major}
                      rawInput={edu.rawMajorInput}
                      onChange={(val) => {
                        const next = [...education];
                        next[idx].major = val.major;
                        next[idx].rawMajorInput = val.rawMajorInput;
                        next[idx].isAiNormalized = val.isAiNormalized;
                        next[idx].aiConfidence = val.aiConfidence;
                        setEducation(next);
                      }}
                      placeholder="Pilih atau ketik jurusan..."
                    />
                    <button
                      type="button"
                      onClick={() => removeEdu(idx)}
                      className="p-2 border border-neutral-300 text-neutral-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bagian 3: Pengalaman Kerja Lapangan */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-neutral-700" />
                  3. Rekam Jejak Pengalaman Kerja
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Mencakup magang industri, kontrak proyek, freelance, maupun pekerjaan tetap.
                </p>
              </div>
              <button
                type="button"
                onClick={addWork}
                className="inline-flex items-center gap-1 border border-neutral-300 px-2.5 py-1 text-[11px] font-semibold uppercase hover:bg-neutral-100"
              >
                <Plus className="w-3 h-3" /> Tambah Pengalaman
              </button>
            </div>

            {workExperience.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">Belum ada riwayat kerja atau magang.</p>
            ) : (
              <div className="space-y-4">
                {workExperience.map((work, idx) => {
                  const currentUnit = work.durationUnit || (work.durationMonths >= 12 && work.durationMonths % 12 === 0 ? 'TAHUN' : 'BULAN');
                  const currentVal = work.durationValue ?? (currentUnit === 'TAHUN' ? Math.max(1, Math.round(work.durationMonths / 12)) : work.durationMonths || 1);

                  return (
                    <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Jenis Pengalaman */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Status / Jenis Pekerjaan
                          </label>
                          <select
                            value={work.employmentType || 'FULL_TIME'}
                            onChange={(e) => {
                              const next = [...workExperience];
                              next[idx].employmentType = e.target.value as any;
                              setWorkExperience(next);
                            }}
                            className="w-full border border-neutral-300 px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                          >
                            <option value="FULL_TIME">Penuh Waktu (Full-Time)</option>
                            <option value="INTERNSHIP">Magang / Praktik Kerja (Internship)</option>
                            <option value="CONTRACT">Kontrak Proyek (Contract)</option>
                            <option value="PART_TIME">Paruh Waktu (Part-Time)</option>
                            <option value="FREELANCE">Lepas / Mandiri (Freelance)</option>
                          </select>
                        </div>

                        {/* Nama Perusahaan */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Instansi / Perusahaan / Proyek
                          </label>
                          <input
                            type="text"
                            placeholder="cth: PT Freeport Indonesia, CV Papua Mandiri"
                            value={work.companyName}
                            onChange={(e) => {
                              const next = [...workExperience];
                              next[idx].companyName = e.target.value;
                              setWorkExperience(next);
                            }}
                            className="w-full border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                          />
                        </div>

                        {/* Jabatan */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Jabatan / Posisi
                          </label>
                          <input
                            type="text"
                            placeholder="cth: Operator Magang, Junior Welder"
                            value={work.position}
                            onChange={(e) => {
                              const next = [...workExperience];
                              next[idx].position = e.target.value;
                              setWorkExperience(next);
                            }}
                            className="w-full border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* Durasi Kerja Terstruktur */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Lama Waktu Pengalaman
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={currentVal}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value) || 1);
                                const next = [...workExperience];
                                next[idx].durationValue = val;
                                next[idx].durationUnit = currentUnit;
                                next[idx].durationMonths = currentUnit === 'TAHUN' ? val * 12 : val;
                                setWorkExperience(next);
                              }}
                              className="w-20 border border-neutral-300 px-2 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 text-center font-bold"
                            />
                            <select
                              value={currentUnit}
                              onChange={(e) => {
                                const unit = e.target.value as 'BULAN' | 'TAHUN';
                                const next = [...workExperience];
                                next[idx].durationUnit = unit;
                                next[idx].durationValue = currentVal;
                                next[idx].durationMonths = unit === 'TAHUN' ? currentVal * 12 : currentVal;
                                setWorkExperience(next);
                              }}
                              className="flex-1 border border-neutral-300 px-2 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                            >
                              <option value="BULAN">Bulan</option>
                              <option value="TAHUN">Tahun</option>
                            </select>
                          </div>
                        </div>

                        {/* Rincian Tugas */}
                        <div className="sm:col-span-7">
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Rincian Singkat Tugas / Capaian Kerja
                          </label>
                          <input
                            type="text"
                            placeholder="cth: Mengoperasikan unit excavator PC200 pada overburden mining pit..."
                            value={work.description}
                            onChange={(e) => {
                              const next = [...workExperience];
                              next[idx].description = e.target.value;
                              setWorkExperience(next);
                            }}
                            className="w-full border border-neutral-300 px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                          />
                        </div>

                        {/* Hapus */}
                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeWork(idx)}
                            className="p-2 border border-neutral-300 text-neutral-600 hover:text-red-700 hover:border-red-300 bg-white"
                            title="Hapus baris pengalaman ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bagian 4: Keahlian Teknis & Master Data */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-neutral-700" />
                  4. Keahlian & Keterampilan Teknis
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Pilih dari Katalog Master Keahlian Daerah Mimika atau ketik keahlian khusus Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center gap-1 border border-neutral-300 px-2.5 py-1 text-[11px] font-semibold uppercase hover:bg-neutral-100"
              >
                <Plus className="w-3 h-3" /> Tambah Keahlian
              </button>
            </div>

            {skills.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">Belum ada keahlian ditambahkan.</p>
            ) : (
              <div className="space-y-3">
                {skills.map((skill, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 border transition-colors ${
                      skill.isLmsVerified 
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs' 
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    {skill.isLmsVerified && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Terverifikasi Pelatihan Disnakertrans Mimika (BNSP)
                        </span>
                        {skill.certificateNumber && (
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5">
                            Sertifikat: {skill.certificateNumber}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        {skill.isLmsVerified ? (
                          <div className="w-full border border-emerald-300 bg-emerald-100/50 px-3 py-2 text-xs font-bold text-neutral-900 flex items-center justify-between">
                            <span>{skill.name}</span>
                            <span className="text-[10px] font-mono text-emerald-800 uppercase">Terkunci Resmi</span>
                          </div>
                        ) : (
                          <SkillCombobox
                            value={skill.name}
                            onChange={(name) => {
                              const next = [...skills];
                              next[idx].name = name;
                              setSkills(next);
                            }}
                            placeholder="Ketik keahlian (cth: Fullstack, Las 3G, Operator Excavator, AK3U)..."
                          />
                        )}
                      </div>
                      <select
                        value={skill.level}
                        disabled={skill.isLmsVerified}
                        onChange={(e) => {
                          const next = [...skills];
                          next[idx].level = e.target.value;
                          setSkills(next);
                        }}
                        className={`border px-3 py-2 text-xs focus:outline-none shrink-0 font-medium ${
                          skill.isLmsVerified 
                            ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 cursor-not-allowed' 
                            : 'border-neutral-300 focus:border-neutral-900 bg-white'
                        }`}
                      >
                        <option value="BEGINNER">Pemula (Dasar)</option>
                        <option value="INTERMEDIATE">Menengah (Standar)</option>
                        <option value="EXPERT">Mahir (Advanced)</option>
                      </select>
                      {skill.isLmsVerified ? (
                        <div 
                          className="p-2 border border-emerald-300 text-emerald-700 bg-emerald-100 shrink-0 flex items-center justify-center cursor-not-allowed"
                          title="Keahlian ini terverifikasi resmi oleh pelatihan LMS Disnakertrans dan terkunci permanen."
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="p-2 border border-neutral-300 text-neutral-600 hover:text-red-700 hover:border-red-300 bg-white shrink-0 cursor-pointer"
                          title="Hapus keahlian ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bagian 5: Dokumen Sertifikasi & Lisensi Keahlian (Unggah PDF) */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-neutral-700" />
                  5. Dokumen Sertifikasi & Lisensi Keahlian (PDF Maks 5 MB)
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Lampirkan bukti sertifikasi resmi (K3 Umum/Migas, BNSP, SIO Alat Berat, Sertifikat Kompetensi) untuk meningkatkan validitas profil Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={addCertification}
                className="inline-flex items-center gap-1 border border-neutral-300 px-2.5 py-1 text-[11px] font-semibold uppercase hover:bg-neutral-100"
              >
                <Plus className="w-3 h-3" /> Tambah Sertifikat
              </button>
            </div>

            {certifications.length === 0 ? (
              <div className="p-4 border border-dashed border-neutral-300 bg-neutral-50 text-center">
                <p className="text-xs text-neutral-500 italic">Belum ada dokumen sertifikat atau lisensi yang dilampirkan.</p>
                <button
                  type="button"
                  onClick={addCertification}
                  className="mt-2 text-xs font-bold uppercase text-neutral-900 underline hover:text-neutral-700"
                >
                  + Tambah Sertifikat Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 bg-white border border-neutral-300 relative space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-neutral-600" />
                        Sertifikasi #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        className="p-1 text-neutral-400 hover:text-red-700 transition-colors"
                        title="Hapus sertifikat ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                          Nama Sertifikat / Lisensi
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const next = [...certifications];
                            next[idx].name = e.target.value;
                            setCertifications(next);
                          }}
                          placeholder="cth: Operator Excavator Kelas II / Ahli K3 Umum"
                          className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                          Lembaga Penerbit / Regulator
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const next = [...certifications];
                            next[idx].issuer = e.target.value;
                            setCertifications(next);
                          }}
                          placeholder="cth: BNSP RI / Kemenaker RI / PPSDM Migas"
                          className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                          Nomor Registrasi / Lisensi / Sertifikat
                        </label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => {
                            const next = [...certifications];
                            next[idx].credentialId = e.target.value;
                            setCertifications(next);
                          }}
                          placeholder="cth: REG-2023-XX-0912 / K3U-8823"
                          className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Tahun Terbit
                          </label>
                          <input
                            type="number"
                            value={cert.issueYear}
                            onChange={(e) => {
                              const next = [...certifications];
                              next[idx].issueYear = Number(e.target.value) || 2020;
                              setCertifications(next);
                            }}
                            className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Berlaku Hingga
                          </label>
                          <input
                            type="number"
                            placeholder="Seumur hidup"
                            value={cert.expiryYear || ''}
                            onChange={(e) => {
                              const next = [...certifications];
                              next[idx].expiryYear = e.target.value ? Number(e.target.value) : undefined;
                              setCertifications(next);
                            }}
                            className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 text-center font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload File PDF Box */}
                    <div className="pt-2 border-t border-neutral-100">
                      <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1.5 flex items-center justify-between">
                        <span>Lampiran Berkas PDF Resmi (Maks 5 MB)</span>
                        <span className="text-[10px] font-mono text-neutral-400">Format: .PDF</span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-neutral-50 border border-neutral-200">
                        {cert.fileName ? (
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-emerald-800" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5">
                                  PDF Terunggah
                                </span>
                                <span className="text-xs font-semibold text-neutral-900 truncate">
                                  {cert.fileName}
                                </span>
                              </div>
                              {cert.fileSize && (
                                <span className="text-[10px] font-mono text-neutral-500">
                                  {(cert.fileSize / 1024).toFixed(0)} KB
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-neutral-500 italic">
                            <FileText className="w-4 h-4 text-neutral-400" />
                            <span>Belum ada file PDF yang diunggah</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                          {cert.fileUrl && (
                            <a
                              href={`/viewer?url=${encodeURIComponent(getPreviewUrl(cert.fileUrl))}&name=${encodeURIComponent(cert.name || 'Sertifikat')}&issuer=${encodeURIComponent(cert.issuer || '')}&talent=${encodeURIComponent(profile?.fullName || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-300 text-neutral-800 text-[11px] font-bold uppercase hover:bg-neutral-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Pratinjau PDF
                            </a>
                          )}

                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-[11px] font-bold uppercase cursor-pointer hover:bg-neutral-800 transition-colors disabled:opacity-50">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingCertIndex === idx ? 'Mengunggah...' : cert.fileName ? 'Ganti PDF' : 'Unggah PDF'}</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              disabled={uploadingCertIndex === idx}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCertificateUpload(idx, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bagian 6: Riwayat Organisasi & Portofolio Karya */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-neutral-700" />
                6. Riwayat Organisasi & Portofolio Karya (Opsional)
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Bantu perusahaan mengenal keaktifan sosial, kerja sama tim, dan karya nyata yang pernah Anda buat.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Organisasi Kemasyarakatan, Kepemudaan, atau Komunitas yang Pernah Diikuti
                </label>
                <input
                  type="text"
                  value={organizations}
                  onChange={(e) => setOrganizations(e.target.value)}
                  placeholder="cth: Karang Taruna Distrik Mimika Baru, Ikatan Pemuda Amungme & Kamoro, Organisasi Mahasiswa, Remaja Masjid/Gereja"
                  className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-medium"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Kosongkan jika belum ada. Tuliskan nama paguyuban warga, organisasi pemuda, atau komunitas tempat Anda aktif berkegiatan.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                  Tautan Profil Profesional / Portofolio Digital
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="cth: https://linkedin.com/in/namaanda atau link Google Drive dokumen sertifikat/karya"
                  className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Opsional. Masukkan link LinkedIn, akun karya (GitHub/Behance), atau tautan folder Google Drive portofolio Anda.
                </span>
              </div>
            </div>
          </div>

          {/* Bagian 7: Kesiapan Pola Kerja & Wilayah Tugas */}
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-neutral-700" />
                7. Kesiapan Pola Kerja & Wilayah Tugas
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Tentukan kondisi kerja dan area di Mimika yang siap Anda jalani agar tawaran lowongan yang masuk sesuai kemampuan fisik dan waktu Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom 1 & 2: Pilihan Kesiapan Pola Kerja & Shift */}
              <div className="lg:col-span-2 space-y-4">
                {/* 1. Status Terpilih (Active Chips Summary) */}
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />
                      Kondisi Kerja yang Siap Anda Jalani ({selectedPreferences.length})
                    </span>
                    {selectedPreferences.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedPreferences([])}
                        className="text-[10px] text-neutral-400 hover:text-red-700 uppercase font-semibold transition-colors cursor-pointer"
                      >
                        Reset Pilihan
                      </button>
                    )}
                  </div>

                  {selectedPreferences.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic py-1">
                      Belum ada opsi yang dipilih. Silakan klik tombol opsi di bawah sesuai kesiapan Anda.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedPreferences.map((pref) => (
                        <span
                          key={pref}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold border border-neutral-900 shadow-2xs"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{pref}</span>
                          <button
                            type="button"
                            onClick={() => removePreference(pref)}
                            className="text-neutral-400 hover:text-white ml-0.5 p-0.5 cursor-pointer"
                            title="Hapus opsi ini"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Opsi Cepat Siap Pakai (Preset Interactive Buttons) */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-neutral-600 tracking-wider">
                    Pilih Kondisi Kerja yang Sanggup Anda Jalani (Bisa Pilih Lebih dari Satu):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_WORK_PREFERENCES.map((pref) => {
                      const isSelected = selectedPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference(pref)}
                          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs ring-1 ring-neutral-900'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>{pref}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Input Mandiri / Custom Preference */}
                <div className="pt-2 border-t border-neutral-200">
                  <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1.5 tracking-wider">
                    Punya Catatan Kesiapan Kerja Lainnya? Ketik di Sini:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrefInput}
                      onChange={(e) => setCustomPrefInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomPreference();
                        }
                      }}
                      placeholder="cth: Siap Roster 4-2, Hanya Bisa Shift Pagi, Siap Standby Pomako, Butuh Mess Karyawan"
                      className="flex-1 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={addCustomPreference}
                      disabled={!customPrefInput.trim()}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Tekan Enter atau klik "+ Tambah" untuk memasukkan kondisi kerja khusus Anda ke daftar terpilih.
                  </span>
                </div>
              </div>

              {/* Kolom 3: Wilayah Penempatan Prioritas di Mimika */}
              <div className="space-y-3 bg-neutral-50 p-4 border border-neutral-200 h-fit">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-700 mb-1 tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-neutral-700" />
                    Wilayah Kerja yang Paling Anda Minati
                  </label>
                  <p className="text-[10px] text-neutral-500 mb-2 leading-relaxed">
                    Pilih lokasi tugas utama di Kabupaten Mimika yang paling sesuai dengan tempat tinggal atau kesiapan mobilitas Anda.
                  </p>
                  <select
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 font-medium bg-white"
                  >
                    <option value="TIMIKA">Timika Kota (Kecamatan Mimika Baru & Sekitarnya)</option>
                    <option value="KUALA_KENCANA">Kuala Kencana & Dataran Rendah</option>
                    <option value="PORTSITE_POMAKO">Portsite / Pomako (Kawasan Pelabuhan & Pesisir)</option>
                    <option value="HIGHLAND_TEMBAGAPURA">Highland / Tembagapura (Area Pertambangan)</option>
                    <option value="SELURUH_MIMIKA">Siap di Seluruh Wilayah Kabupaten Mimika</option>
                  </select>
                </div>

                <div className="p-3 bg-white border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                  <span className="font-bold text-[10px] uppercase text-neutral-800 block">Petunjuk Singkat:</span>
                  <p className="leading-relaxed">
                    Perusahaan yang membuka lowongan di area pilihan Anda akan melihat profil Anda terlebih dahulu. Pastikan lokasi yang dipilih benar-benar siap Anda jangkau.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Simpan Terpadu */}
          <div className="p-6 bg-neutral-50 flex items-center justify-between">
            <span className="text-xs text-neutral-600">
              Proses selesai setelah Anda menekan tombol simpan dan mengonfirmasi pakta integritas.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan & Tinjau Profil'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Pre-Flight Review Modal */}
      <PreFlightReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={executeSaveProfile}
        isSaving={saving}
        data={{
          fullName: profile?.fullName || '',
          nik: profile?.nik || '',
          phone,
          bio,
          avatarUrl: avatarUrl || undefined,
          education,
          workExperience,
          skills,
          certifications,
          organizations,
          portfolioUrl,
          workPreferences: selectedPreferences.join(', '),
          preferredLocation,
        }}
      />
      <AlertModal {...alertProps} />
    </AppShell>
  );
}
