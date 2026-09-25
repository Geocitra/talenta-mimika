'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import { ModernCard, ModernBadge } from '@/components/ui/ModernPrimitives';
import {
  StepItem,
  COMPANY_SIZES,
  EmployerVerificationBanner,
  EmployerProfileStepper,
  EmployerStepLegality,
  EmployerStepIdentity,
  EmployerStepGeospatial,
  EmployerStepPicContact,
  EmployerProfileNavFooter,
} from '@/components/employer-profile';
import {
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function EmployerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stepper Wizard Navigation State
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);

  // Sweetalert Modal Hook
  const { alertProps, showAlert } = useAlertModal();

  // FORM STATES
  // Pilar 1: Legalitas & OSS
  const [nib, setNib] = useState('');
  const [npwpNumber, setNpwpNumber] = useState('');
  const [nibDocUrl, setNibDocUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Pilar 2: Identitas & Skala Usaha
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [companySize, setCompanySize] = useState('SCALE_1_10');
  const [employeeCountPapua, setEmployeeCountPapua] = useState<number | ''>(0);
  const [employeeCountForeign, setEmployeeCountForeign] = useState<number | ''>(0);
  const [employeeCountNational, setEmployeeCountNational] = useState<number | ''>(10);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyBio, setCompanyBio] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Pilar 3: Geospasial Mimika
  const [address, setAddress] = useState('');
  const [locationLat, setLocationLat] = useState<number | ''>('');
  const [locationLng, setLocationLng] = useState<number | ''>('');

  // Pilar 4: PIC HRD & Rekrutmen
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
      setEmployeeCountPapua(d.employeeCountPapua ?? 0);
      setEmployeeCountForeign(d.employeeCountForeign ?? 0);
      setEmployeeCountNational(d.employeeCountNational ?? (d.employeeCount ?? 10));
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

  // Total Karyawan Terkalkulasi
  const totalEmployees =
    (employeeCountPapua === '' ? 0 : Number(employeeCountPapua)) +
    (employeeCountForeign === '' ? 0 : Number(employeeCountForeign)) +
    (employeeCountNational === '' ? 0 : Number(employeeCountNational));

  // Handle Skala Change -> Auto-fill median jika komposisi masih awal
  const handleCompanySizeChange = (val: string) => {
    setCompanySize(val);
    const found = COMPANY_SIZES.find((s) => s.value === val);
    if (found) {
      if (!employeeCountPapua && !employeeCountForeign && (!employeeCountNational || employeeCountNational === 10)) {
        setEmployeeCountNational(found.median);
      }
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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      companyName,
      brandName: brandName || undefined,
      industrySector: industrySector || undefined,
      companySize,
      employeeCount: totalEmployees,
      employeeCountPapua: employeeCountPapua === '' ? 0 : Number(employeeCountPapua),
      employeeCountForeign: employeeCountForeign === '' ? 0 : Number(employeeCountForeign),
      employeeCountNational: employeeCountNational === '' ? 0 : Number(employeeCountNational),
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

  // Step Definitions
  const STEPS: StepItem[] = [
    {
      id: 1,
      title: 'Tahap 1: Legalitas & Perizinan Berusaha (OSS)',
      shortTitle: '1. Legalitas OSS',
      caption: 'NIB, NPWP & Dokumen PDF',
      description: 'Pastikan NIB OSS terdaftar resmi, lengkapi NPWP badan usaha, dan lampirkan berkas fisik izin usaha untuk verifikasi Disnakertrans.',
      isComplete: () => Boolean(nibDocUrl),
    },
    {
      id: 2,
      title: 'Tahap 2: Identitas Korporat & Skala Usaha',
      shortTitle: '2. Identitas & Naker',
      caption: 'Logo, Profil & Komposisi OAP',
      description: 'Unggah logo resmi, kelola identitas badan usaha, sektor industri, serta data komposisi tenaga kerja (OAP, TKA, Nasional) sesuai amanat Perda Otsus.',
      isComplete: () => Boolean(companyName && industrySector && logoUrl),
    },
    {
      id: 3,
      title: 'Tahap 3: Lokasi Operasional & Titik Geospasial',
      shortTitle: '3. Lokasi & GPS',
      caption: 'Alamat Site & Koordinat GIS',
      description: 'Tentukan alamat kantor operasional di Kabupaten Mimika dan sinkronkan koordinat GPS sebagai basis perhitungan jarak talenta terdekat.',
      isComplete: () => Boolean(address && locationLat !== '' && locationLng !== ''),
    },
    {
      id: 4,
      title: 'Tahap 4: Pejabat PIC HRD & Jalur Komunikasi',
      shortTitle: '4. PIC & Rekrutmen',
      caption: 'Nama PIC, No. WA & Email',
      description: 'Daftarkan pejabat penanggung jawab HRD serta nomor WhatsApp dinas untuk komunikasi pelamar dan surat penawaran kerja langsung.',
      isComplete: () => Boolean(picName && picPhone),
    },
  ];

  const completedStepsCount = STEPS.filter((s) => s.isComplete()).length;
  const progressPercentage = Math.round((completedStepsCount / STEPS.length) * 100);

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Memuat Profil Perusahaan...
          </span>
        </div>
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';
  const isRejected = profile?.verificationStatus === 'REJECTED';

  const hasNibDoc = Boolean(nibDocUrl);
  const hasLogo = Boolean(logoUrl);
  const hasGps = locationLat !== '' && locationLng !== '';
  const hasPic = Boolean(picName && picPhone);

  return (
    <AppShell userRole="EMPLOYER" userName={companyName || 'Perusahaan'}>
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* HEADER JUDUL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pusat Tata Kelola &amp; Kepatuhan Korporat
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-600 font-medium">Kabupaten Mimika</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-slate-800" />
              <span>Profil &amp; Legalitas Perusahaan</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ModernBadge
              variant={isApproved ? 'success' : isRejected ? 'warning' : 'info'}
              className="px-3 py-1 text-xs"
            >
              {isApproved ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : isRejected ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>STATUS: {profile?.verificationStatus || 'PENDING'}</span>
            </ModernBadge>
          </div>
        </div>

        {/* BANNER STATUS KEPATUHAN & AUDIT DISNAKER */}
        <EmployerVerificationBanner
          status={profile?.verificationStatus}
          verificationNotes={profile?.verificationNotes}
          verifiedAt={profile?.verifiedAt}
          hasNibDoc={hasNibDoc}
          hasLogo={hasLogo}
          hasGps={hasGps}
          hasPic={hasPic}
        />

        {/* NOTIFIKASI FEEDBACK */}
        {message && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* FORMULIR UTAMA MULTI-STEP WIZARD */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* STEPPER HEADER STATUS BAR & INTERACTIVE TABS */}
          <EmployerProfileStepper
            steps={STEPS}
            currentStep={currentStep}
            completedCount={completedStepsCount}
            progressPercentage={progressPercentage}
            onStepClick={goToStep}
            onQuickSave={() => handleSubmit()}
            saving={saving}
          />

          {/* STEP CONTENT CONTAINER */}
          <ModernCard className="p-6 sm:p-8 space-y-6">
            {currentStep === 1 && (
              <EmployerStepLegality
                nib={nib}
                npwpNumber={npwpNumber}
                setNpwpNumber={setNpwpNumber}
                nibDocUrl={nibDocUrl}
                uploadingPdf={uploadingPdf}
                onPdfUpload={handlePdfUpload}
              />
            )}

            {currentStep === 2 && (
              <EmployerStepIdentity
                logoUrl={logoUrl}
                uploadingLogo={uploadingLogo}
                onLogoUpload={handleLogoUpload}
                companyName={companyName}
                setCompanyName={setCompanyName}
                brandName={brandName}
                setBrandName={setBrandName}
                industrySector={industrySector}
                setIndustrySector={setIndustrySector}
                websiteUrl={websiteUrl}
                setWebsiteUrl={setWebsiteUrl}
                companySize={companySize}
                onCompanySizeChange={handleCompanySizeChange}
                employeeCountPapua={employeeCountPapua}
                setEmployeeCountPapua={setEmployeeCountPapua}
                employeeCountForeign={employeeCountForeign}
                setEmployeeCountForeign={setEmployeeCountForeign}
                employeeCountNational={employeeCountNational}
                setEmployeeCountNational={setEmployeeCountNational}
                totalEmployees={totalEmployees}
                companyBio={companyBio}
                setCompanyBio={setCompanyBio}
              />
            )}

            {currentStep === 3 && (
              <EmployerStepGeospatial
                address={address}
                setAddress={setAddress}
                locationLat={locationLat}
                setLocationLat={setLocationLat}
                locationLng={locationLng}
                setLocationLng={setLocationLng}
                hasGps={hasGps}
                onApplyPreset={applyPreset}
                onGetLiveLocation={handleGetLiveLocation}
              />
            )}

            {currentStep === 4 && (
              <EmployerStepPicContact
                picName={picName}
                setPicName={setPicName}
                picRole={picRole}
                setPicRole={setPicRole}
                picPhone={picPhone}
                setPicPhone={setPicPhone}
                picEmail={picEmail}
                setPicEmail={setPicEmail}
                hasNibDoc={hasNibDoc}
                hasLogo={hasLogo}
                hasGps={hasGps}
                hasPic={hasPic}
              />
            )}
          </ModernCard>

          {/* ACTION BAR NAVIGASI TAHAPAN (STICKY DI BAWAH) */}
          <EmployerProfileNavFooter
            currentStep={currentStep}
            totalSteps={STEPS.length}
            prevStepTitle={currentStep > 1 ? STEPS[currentStep - 2].shortTitle : ''}
            nextStepTitle={currentStep < STEPS.length ? STEPS[currentStep].shortTitle : ''}
            onPrev={() => goToStep(currentStep - 1)}
            onNext={() => goToStep(currentStep + 1)}
            onSaveDraft={() => handleSubmit()}
            saving={saving}
          />
        </form>
      </div>

      {/* SWEETALERT FEEDBACK MODAL */}
      <AlertModal {...alertProps} />
    </AppShell>
  );
}
