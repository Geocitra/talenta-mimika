'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getFullMediaUrl } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import { AlertModal, useAlertModal } from '@/components/AlertModal';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Building2, 
  Briefcase, 
  Activity, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles,
  RefreshCw,
  Inbox,
  BookOpen,
  Check,
  X,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Search,
  ShieldCheck,
  Wrench,
  Database,
  ArrowRight,
  FileText,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldAlert
} from 'lucide-react';

type TabType = 'OVERVIEW' | 'USERS' | 'SKILLS' | 'CURATION' | 'INSTITUTIONS' | 'EMPLOYERS' | 'TRAININGS';

const SKILL_CATEGORY_LABELS: Record<string, string> = {
  DIGITAL_IT: 'IT & Software',
  TAMBANG_ALAT_BERAT: 'Tambang & Alat Berat',
  WELDING_FABRIKASI: 'Pengelasan & Fabrikasi',
  ELEKTRIKAL: 'Kelistrikan Industri',
  K3_SAFETY: 'K3 & Keselamatan',
  LOGISTIK_ADMIN: 'Logistik & Bisnis',
  KONSTRUKSI_SIPIL: 'Konstruksi & Sipil',
  KESEHATAN_MEDIS: 'Kesehatan & Medis',
  OTOMOTIF_MESIN: 'Otomotif & Permesinan',
  AGRO_MARITIM: 'Agrikultur & Kemaritiman',
  PARIWISATA_HOSPITALITY: 'Pariwisata & Perhotelan',
};

function formatSkillCategory(cat: string): string {
  if (!cat) return '-';
  if (SKILL_CATEGORY_LABELS[cat]) return SKILL_CATEGORY_LABELS[cat];
  return cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

const INSTITUTION_CATEGORY_LABELS: Record<string, string> = {
  KAMPUS: 'Perguruan Tinggi (Kampus)',
  SMA: 'Sekolah Menengah Atas (SMA)',
  SMK: 'Sekolah Menengah Kejuruan (SMK)',
  BLK: 'Balai Latihan Kerja (BLK)',
};

function formatInstitutionCategory(cat: string): string {
  if (!cat) return '-';
  if (INSTITUTION_CATEGORY_LABELS[cat]) return INSTITUTION_CATEGORY_LABELS[cat];
  return cat;
}

const ROLE_LABELS: Record<string, string> = {
  TALENT: 'Talenta / Pencaker',
  EMPLOYER: 'Perusahaan (Mitra Industri)',
  DISNAKER_ADMIN: 'Administrator Disnaker',
  EXECUTIVE: 'Pimpinan Eksekutif',
  SUPERADMIN: 'Superadmin Master Data',
};

function formatRole(role: string): string {
  if (!role) return '-';
  return ROLE_LABELS[role] || role;
}

const MAJOR_CATEGORY_LABELS: Record<string, string> = {
  TEKNIK_ALAT_BERAT: 'Teknik Alat Berat',
  TEKNIK_MANUFAKTUR: 'Teknik Manufaktur & Fabrikasi',
  TEKNIK_OTOMOTIF: 'Teknik Otomotif',
  TEKNIK_TAMBANG: 'Teknik Pertambangan',
  TEKNIK_GEOLOGI: 'Teknik Geologi & Eksplorasi',
  TEKNIK_ELEKTRO: 'Teknik Kelistrikan Industri',
  TEKNIK_SIPIL: 'Teknik Sipil & Bangunan',
  K3_PERTAMBANGAN: 'K3 & Keselamatan Tambang',
  TEKNIK_MESIN: 'Teknik Mesin & Pendingin',
  TEKNOLOGI_INFORMASI: 'Teknologi Informasi & Komputer',
  KREATIF_DIGITAL: 'Kreatif Digital & DKV',
  AKUNTANSI_BISNIS: 'Akuntansi & Keuangan',
  LOGISTIK_SUPPLY_CHAIN: 'Logistik & Rantai Pasok',
  MANAJEMEN: 'Manajemen Bisnis',
  ADMINISTRASI: 'Administrasi Perkantoran',
  BISNIS_PEMASARAN: 'Pemasaran & Bisnis Digital',
  KESEHATAN: 'Kesehatan & Farmasi',
  KESEHATAN_K3: 'Kesehatan Kerja & Lingkungan',
  HOSPITALITY: 'Pariwisata & Perhotelan',
  PENDIDIKAN_MENENGAH: 'Pendidikan Menengah (SMA/MA)',
  TEKNIK_ENERGI: 'Teknik Energi & Nuklir',
  TEKNIK_MARITIM: 'Teknik Kelautan & Perkapalan',
  HUKUM: 'Ilmu Hukum',
  TEKNIK_LAINNYA: 'Teknik & Rumpun Terapan Lainnya',
  USULAN_WARGA: 'Usulan Warga',
};

function formatMajorCategory(cat: string): string {
  if (!cat) return 'Umum';
  if (MAJOR_CATEGORY_LABELS[cat]) return MAJOR_CATEGORY_LABELS[cat];
  return cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  SCALE_1_10: '1-10 Karyawan (Mikro)',
  SCALE_11_50: '11-50 Karyawan (Kecil)',
  SCALE_51_200: '51-200 Karyawan (Menengah)',
  SCALE_201_500: '201-500 Karyawan (Menengah-Besar)',
  SCALE_501_1000: '501-1.000 Karyawan (Besar)',
  SCALE_OVER_1000: '> 1.000 Karyawan (Korporasi)',
};

function formatCompanySize(size: string): string {
  if (!size) return '-';
  return COMPANY_SIZE_LABELS[size] || size;
}

export default function ExecutiveCommandCenterPage() {
  const router = useRouter();
  const { alertProps, showAlert } = useAlertModal();
  const [profile, setProfile] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  // Meja Kurasi State
  const [curationData, setCurationData] = useState<any>(null);
  const [curationLoading, setCurationLoading] = useState(false);
  const [curationActionMsg, setCurationActionMsg] = useState('');

  // Master Jurusan & Prodi State
  const [majorSubTab, setMajorSubTab] = useState<'MASTER' | 'CURATION'>('MASTER');
  const [majorsList, setMajorsList] = useState<any[]>([]);
  const [majorSearch, setMajorSearch] = useState('');
  const [majorCategoryFilter, setMajorCategoryFilter] = useState('ALL');
  const [majorPage, setMajorPage] = useState(1);
  const [majorTotalPages, setMajorTotalPages] = useState(1);
  const [majorTotal, setMajorTotal] = useState(0);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const [majorActionMsg, setMajorActionMsg] = useState('');
  const [showAddMajorModal, setShowAddMajorModal] = useState(false);
  const [newMajorName, setNewMajorName] = useState('');
  const [newMajorCategory, setNewMajorCategory] = useState('TEKNIK_ALAT_BERAT');
  const [editingMajor, setEditingMajor] = useState<any | null>(null);
  const [editMajorName, setEditMajorName] = useState('');
  const [editMajorCategory, setEditMajorCategory] = useState('');

  // Manajemen User State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState('');

  // Master Keahlian State
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('ALL');
  const [skillPage, setSkillPage] = useState(1);
  const [skillTotalPages, setSkillTotalPages] = useState(1);
  const [skillTotal, setSkillTotal] = useState(0);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillActionMsg, setSkillActionMsg] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('DIGITAL_IT');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  // Master Institusi State
  const [instList, setInstList] = useState<any[]>([]);
  const [instSearch, setInstSearch] = useState('');
  const [instCategoryFilter, setInstCategoryFilter] = useState('ALL');
  const [instPage, setInstPage] = useState(1);
  const [instTotalPages, setInstTotalPages] = useState(1);
  const [instTotal, setInstTotal] = useState(0);
  const [instLoading, setInstLoading] = useState(false);
  const [instActionMsg, setInstActionMsg] = useState('');

  // Verifikasi Perusahaan State
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [pendingEmployersLoading, setPendingEmployersLoading] = useState(false);
  const [rejectionModalEmployer, setRejectionModalEmployer] = useState<any | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Pelatihan Daerah (LMS) State
  const [trainingsList, setTrainingsList] = useState<any[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [newTrainingTitle, setNewTrainingTitle] = useState('');
  const [newTrainingCategory, setNewTrainingCategory] = useState('WELDING_FABRIKASI');
  const [newTrainingDelivery, setNewTrainingDelivery] = useState('OFFLINE_SITE');
  const [newTrainingDesc, setNewTrainingDesc] = useState('');
  const [newTrainingQuota, setNewTrainingQuota] = useState(30);
  const [newTrainingPassingGrade, setNewTrainingPassingGrade] = useState(80);

  // Skillhub & Kurasi Disnaker State
  const [trainingSubTab, setTrainingSubTab] = useState<'CATALOG' | 'PROVIDERS' | 'PROGRAM_CURATION'>('CATALOG');
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [pendingProvidersLoading, setPendingProvidersLoading] = useState(false);
  const [providerRejectModal, setProviderRejectModal] = useState<any | null>(null);
  const [providerAuditNotes, setProviderAuditNotes] = useState('');

  const [pendingProgramCurations, setPendingProgramCurations] = useState<any[]>([]);
  const [pendingCurationsLoading, setPendingCurationsLoading] = useState(false);
  const [programCurateModal, setProgramCurateModal] = useState<any | null>(null);
  const [programCurateNotes, setProgramCurateNotes] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && ['OVERVIEW', 'USERS', 'SKILLS', 'CURATION', 'INSTITUTIONS', 'EMPLOYERS', 'TRAININGS'].includes(tabParam)) {
        setActiveTab(tabParam);
        if (tabParam === 'USERS') loadUsersData(1);
        if (tabParam === 'SKILLS') loadSkillsData(1);
        if (tabParam === 'CURATION') {
          loadCurationData();
          loadMasterMajorsData(1);
        }
        if (tabParam === 'INSTITUTIONS') loadInstitutionsData(1);
        if (tabParam === 'EMPLOYERS') loadPendingEmployers();
        if (tabParam === 'TRAININGS') {
          loadTrainingsData();
          loadPendingProviders();
          loadPendingCurations();
        }
      }
    }
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');

    // 1. Ambil Data Sesi Pengguna
    const userRes = await apiFetch('/auth/me');
    if (userRes.status !== 'success') {
      router.push('/login');
      return;
    }

    const role = userRes.data?.role;
    if (role !== 'DISNAKER_ADMIN' && role !== 'EXECUTIVE' && role !== 'SUPERADMIN') {
      setError('Akses Ditolak: Halaman ini hanya dapat diakses oleh Administrator dan Pimpinan Daerah.');
      setLoading(false);
      return;
    }
    setProfile(userRes.data);

    // Jika bukan SUPERADMIN, proteksi tab agar tidak membuka tab master data
    if (role !== 'SUPERADMIN') {
      setActiveTab((prev) => {
        if (['USERS', 'SKILLS', 'CURATION', 'INSTITUTIONS'].includes(prev)) {
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/admin?tab=OVERVIEW');
          }
          return 'OVERVIEW';
        }
        return prev;
      });
    }

    // 2. Ambil Data Real-Time Command Center
    const analyticsRes = await apiFetch('/analytics/command-center');
    if (analyticsRes.status === 'success') {
      setAnalyticsData(analyticsRes.data);
    } else {
      setError(analyticsRes.message || 'Gagal memuat data analitik daerah.');
    }

    // 3. Ambil Data Sesuai Peran:
    // Master data teknis (Kurasi, Jurusan, Skills, Users, Institusi) HANYA untuk SUPERADMIN
    if (role === 'SUPERADMIN') {
      await Promise.all([
        loadCurationData(),
        loadMasterMajorsData(1),
        loadSkillsData(1),
        loadUsersData(1),
        loadInstitutionsData(1),
        loadPendingEmployers(),
        loadTrainingsData()
      ]);
    } else {
      // Disnaker Admin & Executive: Hanya perlu antrean verifikasi perusahaan & pelatihan daerah
      await Promise.all([
        loadPendingEmployers(),
        loadTrainingsData()
      ]);
    }

    setLoading(false);
  };

  // -------------------------------------------------------------
  // HANDLERS: KURASI JURUSAN
  // -------------------------------------------------------------
  const loadCurationData = async () => {
    setCurationLoading(true);
    try {
      const res = await apiFetch('/majors/curation');
      if (res.status === 'success') {
        setCurationData(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data kurasi:', err);
    } finally {
      setCurationLoading(false);
    }
  };

  const handleApprove = async (id: string, name?: string, category?: string) => {
    setCurationActionMsg('');
    try {
      const res = await apiFetch(`/majors/curation/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approvedName: name, category }),
      });
      if (res.status === 'success') {
        const succ = res.message || 'Jurusan berhasil disetujui ke Master!';
        setCurationActionMsg(succ);
        showAlert('success', 'Jurusan Disetujui!', succ);
        await Promise.all([loadCurationData(), loadMasterMajorsData(1)]);
      } else {
        showAlert('error', 'Gagal Menyetujui', res.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setCurationActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Menyetujui', err.message);
    }
  };

  const handleReject = async (id: string) => {
    setCurationActionMsg('');
    try {
      const res = await apiFetch(`/majors/curation/${id}/reject`, {
        method: 'POST',
      });
      if (res.status === 'success') {
        const succ = res.message || 'Usulan jurusan ditolak.';
        setCurationActionMsg(succ);
        showAlert('info', 'Usulan Ditolak', succ);
        await loadCurationData();
      } else {
        showAlert('error', 'Gagal Menolak', res.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setCurationActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Menolak', err.message);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: MASTER JURUSAN & PROGRAM STUDI (CRUD)
  // -------------------------------------------------------------
  const loadMasterMajorsData = async (targetPage = 1) => {
    setMajorsLoading(true);
    setMajorActionMsg('');
    try {
      const qParam = majorSearch.trim() ? `&q=${encodeURIComponent(majorSearch.trim())}` : '';
      const cParam = majorCategoryFilter !== 'ALL' ? `&category=${majorCategoryFilter}` : '';
      const res = await apiFetch<any[]>(`/majors/master?page=${targetPage}&limit=15${qParam}${cParam}`);
      if (res.status === 'success') {
        const raw: any = res;
        setMajorsList(raw.data || []);
        setMajorPage(raw.meta?.page || 1);
        setMajorTotalPages(raw.meta?.totalPages || 1);
        setMajorTotal(raw.meta?.total || 0);
      }
    } catch (err: any) {
      setMajorActionMsg(`Gagal memuat master jurusan: ${err.message}`);
    } finally {
      setMajorsLoading(false);
    }
  };

  const handleCreateMasterMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMajorName.trim()) return;
    setMajorActionMsg('');
    try {
      const res = await apiFetch('/majors/master', {
        method: 'POST',
        body: JSON.stringify({
          name: newMajorName.trim(),
          category: newMajorCategory,
        }),
      });
      if (res.status === 'success') {
        const succ = res.message || `Jurusan "${newMajorName}" berhasil ditambahkan ke Master!`;
        setMajorActionMsg(succ);
        showAlert('success', 'Jurusan Ditambahkan!', succ);
        setNewMajorName('');
        setShowAddMajorModal(false);
        await Promise.all([loadMasterMajorsData(1), loadCurationData()]);
      } else {
        const errMsg = res.message || 'Gagal menambahkan jurusan.';
        setMajorActionMsg(`Gagal: ${errMsg}`);
        showAlert('error', 'Gagal Menambahkan Jurusan', errMsg);
      }
    } catch (err: any) {
      setMajorActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Menambahkan Jurusan', err.message);
    }
  };

  const handleUpdateMasterMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMajor || !editMajorName.trim()) return;
    setMajorActionMsg('');
    try {
      const res = await apiFetch(`/majors/master/${editingMajor.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editMajorName.trim(),
          category: editMajorCategory,
        }),
      });
      if (res.status === 'success') {
        const succ = res.message || `Jurusan "${editMajorName}" berhasil diperbarui!`;
        setMajorActionMsg(succ);
        showAlert('success', 'Jurusan Diperbarui!', succ);
        setEditingMajor(null);
        await Promise.all([loadMasterMajorsData(majorPage), loadCurationData()]);
      } else {
        const errMsg = res.message || 'Gagal memperbarui jurusan.';
        setMajorActionMsg(`Gagal: ${errMsg}`);
        showAlert('error', 'Gagal Memperbarui Jurusan', errMsg);
      }
    } catch (err: any) {
      setMajorActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Memperbarui Jurusan', err.message);
    }
  };

  const handleDeleteMasterMajor = async (id: string, name: string) => {
    showAlert(
      'warning',
      'Hapus Jurusan dari Master?',
      `Apakah Anda yakin ingin menghapus jurusan "${name}" dari master direktori? Tindakan ini permanen.`,
      'Ya, Hapus Jurusan',
      async () => {
        setMajorActionMsg('');
        try {
          const res = await apiFetch(`/majors/master/${id}`, { method: 'DELETE' });
          if (res.status === 'success') {
            const succ = res.message || `Jurusan "${name}" berhasil dihapus.`;
            setMajorActionMsg(succ);
            showAlert('success', 'Jurusan Berhasil Dihapus', succ);
            await Promise.all([loadMasterMajorsData(majorPage), loadCurationData()]);
          } else {
            const errMsg = res.message || 'Gagal menghapus jurusan.';
            setMajorActionMsg(`Gagal: ${errMsg}`);
            showAlert('error', 'Gagal Menghapus', errMsg);
          }
        } catch (err: any) {
          setMajorActionMsg(`Error: ${err.message}`);
          showAlert('error', 'Gagal Menghapus', err.message);
        }
      },
    );
  };

  // -------------------------------------------------------------
  // HANDLERS: MANAJEMEN USER
  // -------------------------------------------------------------
  const loadUsersData = async (targetPage = 1) => {
    setUsersLoading(true);
    setUserActionMsg('');
    try {
      const qParam = userSearch.trim() ? `&q=${encodeURIComponent(userSearch.trim())}` : '';
      const rParam = userRoleFilter !== 'ALL' ? `&role=${userRoleFilter}` : '';
      const res = await apiFetch<any[]>(`/admin/users?page=${targetPage}&limit=10${qParam}${rParam}`);
      if (res.status === 'success') {
        const raw: any = res;
        setUsersList(raw.data || []);
        setUserPage(raw.meta?.page || 1);
        setUserTotalPages(raw.meta?.totalPages || 1);
        setUserTotal(raw.meta?.total || 0);
      }
    } catch (err: any) {
      setUserActionMsg(`Gagal memuat pengguna: ${err.message}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    setUserActionMsg('');
    try {
      const res = await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.status === 'success') {
        const succ = `Role berhasil diubah menjadi ${newRole}`;
        setUserActionMsg(succ);
        showAlert('success', 'Peran Akun Diperbarui!', succ);
        await loadUsersData(userPage);
      } else {
        showAlert('error', 'Gagal Mengubah Peran', res.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setUserActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Mengubah Peran', err.message);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    setUserActionMsg('');
    try {
      const res = await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
      });
      if (res.status === 'success') {
        const succ = `Status akun berhasil diperbarui.`;
        setUserActionMsg(succ);
        showAlert('success', 'Status Akun Diperbarui!', succ);
        await loadUsersData(userPage);
      } else {
        showAlert('error', 'Gagal Memperbarui Status', res.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setUserActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Memperbarui Status', err.message);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: MASTER KEAHLIAN
  // -------------------------------------------------------------
  const loadSkillsData = async (targetPage = 1) => {
    setSkillsLoading(true);
    setSkillActionMsg('');
    try {
      const qParam = skillSearch.trim() ? `&q=${encodeURIComponent(skillSearch.trim())}` : '';
      const cParam = skillCategoryFilter !== 'ALL' ? `&category=${skillCategoryFilter}` : '';
      const res = await apiFetch<any[]>(`/skills?page=${targetPage}&limit=15${qParam}${cParam}`);
      if (res.status === 'success') {
        const raw: any = res;
        setSkillsList(raw.data || []);
        setSkillPage(raw.meta?.page || 1);
        setSkillTotalPages(raw.meta?.totalPages || 1);
        setSkillTotal(raw.meta?.total || 0);
      }
    } catch (err: any) {
      setSkillActionMsg(`Gagal memuat master keahlian: ${err.message}`);
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkillActionMsg('');
    try {
      const res = await apiFetch('/skills', {
        method: 'POST',
        body: JSON.stringify({
          name: newSkillName.trim(),
          category: newSkillCategory,
          description: newSkillDesc.trim() || undefined,
        }),
      });
      if (res.status === 'success') {
        const succ = `Keahlian "${newSkillName}" berhasil ditambahkan ke Master!`;
        setSkillActionMsg(succ);
        showAlert('success', 'Keahlian Berhasil Ditambahkan!', succ);
        setNewSkillName('');
        setNewSkillDesc('');
        setShowAddSkillModal(false);
        await loadSkillsData(1);
      } else {
        showAlert('error', 'Gagal Menambahkan Keahlian', res.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setSkillActionMsg(`Error: ${err.message}`);
      showAlert('error', 'Gagal Menambahkan Keahlian', err.message);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    showAlert(
      'warning',
      'Hapus Keahlian dari Katalog?',
      `Apakah Anda yakin ingin menghapus keahlian "${name}" dari master katalog?`,
      'Ya, Hapus Keahlian',
      async () => {
        setSkillActionMsg('');
        try {
          const res = await apiFetch(`/skills/${id}`, { method: 'DELETE' });
          if (res.status === 'success') {
            const succ = `Keahlian "${name}" berhasil dihapus.`;
            setSkillActionMsg(succ);
            showAlert('success', 'Keahlian Berhasil Dihapus', succ);
            await loadSkillsData(skillPage);
          } else {
            showAlert('error', 'Gagal Menghapus Keahlian', res.message || 'Terjadi kesalahan.');
          }
        } catch (err: any) {
          setSkillActionMsg(`Error: ${err.message}`);
          showAlert('error', 'Gagal Menghapus Keahlian', err.message);
        }
      },
    );
  };

  // -------------------------------------------------------------
  // HANDLERS: MASTER INSTITUSI
  // -------------------------------------------------------------
  const loadInstitutionsData = async (targetPage = 1) => {
    setInstLoading(true);
    setInstActionMsg('');
    try {
      const qParam = instSearch.trim() ? `&q=${encodeURIComponent(instSearch.trim())}` : '';
      const cParam = instCategoryFilter !== 'ALL' ? `&category=${instCategoryFilter}` : '';
      const res = await apiFetch<any[]>(`/institutions?page=${targetPage}&limit=15${qParam}${cParam}`);
      if (res.status === 'success') {
        const raw: any = res;
        setInstList(raw.data || []);
        setInstPage(raw.meta?.page || 1);
        setInstTotalPages(raw.meta?.totalPages || 1);
        setInstTotal(raw.meta?.total || 0);
      }
    } catch (err: any) {
      setInstActionMsg(`Gagal memuat institusi: ${err.message}`);
    } finally {
      setInstLoading(false);
    }
  };

  const handleSyncInstitutions = async (type: 'kampus' | 'sekolah') => {
    setInstActionMsg(`Menyinkronkan data ${type} dari basis data nasional...`);
    try {
      const res = await apiFetch(`/institutions/sync/${type}`, { method: 'POST' });
      if (res.status === 'success') {
        const succ = res.message || `Sinkronisasi ${type} selesai.`;
        setInstActionMsg(succ);
        showAlert('success', 'Sinkronisasi Berhasil!', succ);
        await loadInstitutionsData(1);
      } else {
        showAlert('error', 'Sinkronisasi Gagal', res.message || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      setInstActionMsg(`Gagal sinkronisasi: ${err.message}`);
      showAlert('error', 'Sinkronisasi Gagal', err.message);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: VERIFIKASI PERUSAHAAN (EMPLOYERS)
  // -------------------------------------------------------------
  const loadPendingEmployers = async () => {
    setPendingEmployersLoading(true);
    try {
      const res = await apiFetch<any[]>('/employers/pending');
      if (res.status === 'success') {
        setPendingEmployers(res.data || []);
      }
    } catch (err: any) {
      console.error('Gagal memuat antrean verifikasi perusahaan:', err);
    } finally {
      setPendingEmployersLoading(false);
    }
  };

  const handleApproveEmployer = async (employer: any) => {
    try {
      const res = await apiFetch(`/employers/${employer.id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (res.status === 'success') {
        showAlert(
          'success',
          'Perusahaan Terverifikasi!',
          `Akun ${employer.companyName} telah diverifikasi resmi oleh Disnaker. Perusahaan kini dapat menerbitkan lowongan pekerjaan dan mengakses radar talenta.`
        );
        await loadPendingEmployers();
      } else {
        showAlert('error', 'Gagal Memverifikasi', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Memverifikasi', err.message);
    }
  };

  const handleConfirmRejectEmployer = async () => {
    if (!rejectionModalEmployer) return;
    try {
      const res = await apiFetch(`/employers/${rejectionModalEmployer.id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'REJECTED',
          notes: rejectionNotes.trim() || 'Dokumen legalitas tidak memenuhi kriteria verifikasi.',
        }),
      });
      if (res.status === 'success') {
        showAlert(
          'info',
          'Pendaftaran Ditolak',
          `Pendaftaran ${rejectionModalEmployer.companyName} telah ditolak dengan catatan resmi.`
        );
        setRejectionModalEmployer(null);
        setRejectionNotes('');
        await loadPendingEmployers();
      } else {
        showAlert('error', 'Gagal Menolak', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Menolak', err.message);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: PELATIHAN DAERAH (TRAININGS LMS)
  // -------------------------------------------------------------
  const loadTrainingsData = async () => {
    setTrainingsLoading(true);
    try {
      const res = await apiFetch<any[]>('/trainings/admin/all');
      if (res.status === 'success') {
        setTrainingsList(res.data || []);
      } else {
        const catRes = await apiFetch<any[]>('/trainings/catalog');
        if (catRes.status === 'success') {
          setTrainingsList(catRes.data || []);
        }
      }
    } catch (err) {
      console.error('Gagal memuat katalog pelatihan:', err);
    } finally {
      setTrainingsLoading(false);
    }
  };

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainingTitle.trim()) {
      showAlert('warning', 'Judul Wajib Diisi', 'Silakan masukkan nama program pelatihan.');
      return;
    }
    try {
      const res = await apiFetch('/trainings', {
        method: 'POST',
        body: JSON.stringify({
          title: newTrainingTitle.trim(),
          category: newTrainingCategory,
          deliveryMode: newTrainingDelivery,
          description: newTrainingDesc.trim() || 'Program pelatihan vokasi daerah Kabupaten Mimika.',
          quota: Number(newTrainingQuota) || 30,
          passingGrade: Number(newTrainingPassingGrade) || 80,
        }),
      });
      if (res.status === 'success') {
        showAlert(
          'success',
          'Program Pelatihan Dibuat!',
          `Program "${newTrainingTitle}" berhasil ditambahkan sebagai Draft. Anda dapat mempublikasikannya ke katalog daerah.`
        );
        setShowAddTrainingModal(false);
        setNewTrainingTitle('');
        setNewTrainingDesc('');
        await loadTrainingsData();
      } else {
        showAlert('error', 'Gagal Membuat Program', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Membuat Program', err.message);
    }
  };

  const handlePublishTraining = async (id: string, title: string) => {
    try {
      const res = await apiFetch(`/trainings/${id}/publish`, {
        method: 'PATCH',
      });
      if (res.status === 'success') {
        showAlert(
          'success',
          'Program Dipublikasikan!',
          `Program "${title}" kini aktif dan dapat didaftar oleh talenta pencari kerja di katalog daerah.`
        );
        await loadTrainingsData();
      } else {
        showAlert('error', 'Gagal Mempublikasikan', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Mempublikasikan', err.message);
    }
  };

  const loadPendingProviders = async () => {
    setPendingProvidersLoading(true);
    try {
      const res = await apiFetch<any[]>('/training-providers/pending');
      if (res.status === 'success') {
        setPendingProviders(res.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat pending providers:', err);
    } finally {
      setPendingProvidersLoading(false);
    }
  };

  const loadPendingCurations = async () => {
    setPendingCurationsLoading(true);
    try {
      const res = await apiFetch<any[]>('/training-admin/programs/pending');
      if (res.status === 'success') {
        setPendingProgramCurations(res.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat pending curations:', err);
    } finally {
      setPendingCurationsLoading(false);
    }
  };

  const handleVerifyProvider = async (providerId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      const res = await apiFetch(`/training-providers/${providerId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      if (res.status === 'success') {
        showAlert(
          'success',
          status === 'APPROVED' ? 'Lembaga Pelatihan Disahkan!' : 'Lembaga Pelatihan Ditolak',
          res.message || `Lembaga pelatihan berhasil di-${status.toLowerCase()}.`
        );
        setProviderRejectModal(null);
        setProviderAuditNotes('');
        await loadPendingProviders();
      } else {
        showAlert('error', 'Gagal Memproses', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Memproses', err.message);
    }
  };

  const handleCurateProgram = async (programId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      const res = await apiFetch(`/training-admin/programs/${programId}/curate`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      if (res.status === 'success') {
        showAlert(
          'success',
          status === 'APPROVED' ? 'Program Disahkan & Resmi PUBLISHED!' : 'Program Ditolak',
          res.message || `Keputusan kurasi program berhasil disimpan.`
        );
        setProgramCurateModal(null);
        setProgramCurateNotes('');
        await loadPendingCurations();
        await loadTrainingsData();
      } else {
        showAlert('error', 'Gagal Memproses', res.message || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showAlert('error', 'Gagal Memproses', err.message);
    }
  };

  // Switch Tab Helper
  const handleTabSwitch = (targetTab: TabType) => {
    let tab = targetTab;
    // Jika bukan SUPERADMIN, cegah akses ke tab master data
    if (profile?.role !== 'SUPERADMIN' && ['USERS', 'SKILLS', 'CURATION', 'INSTITUTIONS'].includes(tab)) {
      tab = 'OVERVIEW';
    }
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/admin?tab=${tab}`);
    }
    if (profile?.role === 'SUPERADMIN') {
      if (tab === 'USERS') loadUsersData(1);
      if (tab === 'SKILLS') loadSkillsData(1);
      if (tab === 'CURATION') {
        loadCurationData();
        loadMasterMajorsData(1);
      }
      if (tab === 'INSTITUTIONS') loadInstitutionsData(1);
    }
    if (tab === 'EMPLOYERS') loadPendingEmployers();
    if (tab === 'TRAININGS') loadTrainingsData();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const analyticsRes = await apiFetch('/analytics/command-center');
    if (analyticsRes.status === 'success') {
      setAnalyticsData(analyticsRes.data);
    }
    if (profile?.role === 'SUPERADMIN') {
      await Promise.all([
        loadCurationData(),
        loadMasterMajorsData(1),
        loadUsersData(userPage),
        loadSkillsData(skillPage),
        loadInstitutionsData(instPage),
        loadPendingEmployers(),
        loadTrainingsData()
      ]);
    } else {
      await Promise.all([
        loadPendingEmployers(),
        loadTrainingsData()
      ]);
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
        Mengagregasi Data Tata Kelola Ketenagakerjaan Daerah...
      </div>
    );
  }

  const kpis = analyticsData?.kpis || {};
  const funnel = analyticsData?.funnel || [];
  const skillGaps = analyticsData?.skillGaps || [];
  const industryDist = analyticsData?.industryDistribution || [];
  const recentActivities = analyticsData?.recentActivities || [];

  return (
    <AppShell 
      userRole={profile?.role || 'SUPERADMIN'} 
      userName={
        profile?.role === 'SUPERADMIN' 
          ? 'Superadmin Mimika' 
          : profile?.role === 'EXECUTIVE' 
            ? 'Bupati Mimika' 
            : 'Kadisnakertrans Mimika'
      }
      activeTab={activeTab}
      onTabChange={handleTabSwitch}
      curationBadge={curationData?.totalPending}
      pendingEmployersBadge={pendingEmployers.length}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bersih & Elegan (Tanpa Nested Box) */}
        <div className="bg-white border-b border-neutral-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-6 py-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-neutral-900 text-white px-2 py-0.5 rounded">
                <Database className="w-3 h-3 text-neutral-300" />
                {profile?.role === 'SUPERADMIN' ? 'Konsol Superadmin' : 'Pusat Komando Daerah'}
              </span>
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Pemerintah Kabupaten Mimika
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {profile?.role === 'SUPERADMIN' ? 'Tata Kelola Master Data & Sistem' : 'Dasbor Intelijen Angkatan Kerja'}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              {profile?.role === 'SUPERADMIN' 
                ? 'Standardisasi taksonomi keahlian, kurasi usulan jurusan baru, referensi institusi, dan tata kelola akun pengguna.'
                : 'Indikator ketenagakerjaan daerah, analisis kesenjangan keahlian, dan pemadanan industri.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: MANAJEMEN PENGGUNA (USERS) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'USERS' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-neutral-100">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-600" />
                    Manajemen Akun & Hak Akses Pengguna
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Kelola otoritas peran akun: Talenta, Perusahaan, Disnaker Admin, Eksekutif, hingga Superadmin.
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Cari email atau nama..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadUsersData(1)}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900 pr-8"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5" />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setTimeout(() => loadUsersData(1), 50);
                    }}
                    className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                  >
                    <option value="ALL">Semua Peran</option>
                    <option value="TALENT">TALENT</option>
                    <option value="EMPLOYER">EMPLOYER</option>
                    <option value="DISNAKER_ADMIN">DISNAKER_ADMIN</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => loadUsersData(1)}
                    className="px-3.5 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors shadow-sm"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {userActionMsg && (
                <div className="mt-4 p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{userActionMsg}</span>
                </div>
              )}

              {usersLoading ? (
                <div className="p-8 text-center text-xs text-neutral-500 font-semibold">
                  Memuat Daftar Pengguna Sistem...
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/70 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="p-3">Identitas Pengguna</th>
                          <th className="p-3">Tipe / Detail</th>
                          <th className="p-3">Status Verifikasi</th>
                          <th className="p-3">Peran Saat Ini</th>
                          <th className="p-3 text-right">Ubah Hak Akses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {usersList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-neutral-400">
                              Tidak ada pengguna yang cocok dengan kriteria pencarian.
                            </td>
                          </tr>
                        ) : (
                          usersList.map((u) => (
                            <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="p-3 font-medium">
                                <div className="font-semibold text-neutral-900">{u.displayName}</div>
                                <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                              </td>
                              <td className="p-3 text-neutral-600">{u.detail}</td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                                  title="Klik untuk mengubah status verifikasi"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  <span className={u.isVerified ? 'text-emerald-700' : 'text-amber-700'}>
                                    {u.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                                  </span>
                                </button>
                              </td>
                              <td className="p-3">
                                <span className={`text-xs ${
                                  u.role === 'SUPERADMIN'
                                    ? 'font-bold text-neutral-900'
                                    : u.role === 'DISNAKER_ADMIN'
                                    ? 'font-semibold text-blue-700'
                                    : u.role === 'EXECUTIVE'
                                    ? 'font-semibold text-purple-700'
                                    : u.role === 'EMPLOYER'
                                    ? 'font-semibold text-amber-700'
                                    : 'font-normal text-neutral-600'
                                }`}>
                                  {formatRole(u.role)}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                                  className="border border-neutral-200 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                                >
                                  <option value="TALENT">Set ke TALENT</option>
                                  <option value="EMPLOYER">Set ke EMPLOYER</option>
                                  <option value="DISNAKER_ADMIN">Set ke DISNAKER_ADMIN</option>
                                  <option value="EXECUTIVE">Set ke EXECUTIVE</option>
                                  <option value="SUPERADMIN">Set ke SUPERADMIN</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Kontrol Paginasi Pengguna */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 mt-4">
                    <div className="text-xs text-neutral-500 font-mono">
                      Halaman <strong className="text-neutral-900">{userPage}</strong> dari <strong className="text-neutral-900">{userTotalPages}</strong> ({userTotal} total akun)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={userPage <= 1 || usersLoading}
                        onClick={() => loadUsersData(userPage - 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        &larr; Sebelumnya
                      </button>
                      <div className="px-2 py-1.5 text-xs font-mono font-bold text-neutral-700">
                        {userPage} / {userTotalPages}
                      </div>
                      <button
                        type="button"
                        disabled={userPage >= userTotalPages || usersLoading}
                        onClick={() => loadUsersData(userPage + 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Selanjutnya &rarr;
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: MASTER KEAHLIAN (SKILLS TAXONOMY) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'SKILLS' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-neutral-100">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-neutral-600" />
                    Katalog Master Data Keahlian Industri (Skills Taxonomy)
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Standarisasi keterampilan teknis untuk pemadanan AI Sourcing (IT, Pertambangan, Alat Berat, Fabrikasi, K3).
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <input
                      type="text"
                      placeholder="Cari keahlian..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadSkillsData(1)}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900 pr-8"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5" />
                  </div>

                  <select
                    value={skillCategoryFilter}
                    onChange={(e) => {
                      setSkillCategoryFilter(e.target.value);
                      setTimeout(() => loadSkillsData(1), 50);
                    }}
                    className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                  >
                    <option value="ALL">Semua Rumpun</option>
                    <option value="DIGITAL_IT">IT & Software</option>
                    <option value="TAMBANG_ALAT_BERAT">Tambang & Alat Berat</option>
                    <option value="WELDING_FABRIKASI">Pengelasan & Fabrikasi</option>
                    <option value="ELEKTRIKAL">Kelistrikan Industri</option>
                    <option value="K3_SAFETY">K3 & Keselamatan</option>
                    <option value="LOGISTIK_ADMIN">Logistik & Bisnis</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowAddSkillModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>
              </div>

              {skillActionMsg && (
                <div className="mt-4 p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{skillActionMsg}</span>
                </div>
              )}

              {/* Modal Tambah Keahlian */}
              {showAddSkillModal && (
                <form onSubmit={handleCreateSkill} className="mt-4 p-5 bg-neutral-50/80 border border-neutral-200 rounded-xl space-y-4">
                  <div className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex justify-between items-center">
                    <span>+ Tambah Master Keahlian Baru</span>
                    <button type="button" onClick={() => setShowAddSkillModal(false)} className="text-neutral-400 hover:text-neutral-900 p-1 rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Nama Keahlian</label>
                      <input
                        type="text"
                        placeholder="cth: Mobile App Developer (Flutter)"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        required
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Rumpun Industri</label>
                      <select
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                      >
                        <option value="DIGITAL_IT">IT & Software</option>
                        <option value="TAMBANG_ALAT_BERAT">Tambang & Alat Berat</option>
                        <option value="WELDING_FABRIKASI">Pengelasan & Fabrikasi</option>
                        <option value="ELEKTRIKAL">Kelistrikan Industri</option>
                        <option value="K3_SAFETY">K3 & Keselamatan</option>
                        <option value="LOGISTIK_ADMIN">Logistik & Bisnis</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Deskripsi Singkat</label>
                      <input
                        type="text"
                        placeholder="Deskripsi kompetensi standar..."
                        value={newSkillDesc}
                        onChange={(e) => setNewSkillDesc(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSkillModal(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-200/60 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
                    >
                      Simpan ke Master
                    </button>
                  </div>
                </form>
              )}

              {skillsLoading ? (
                <div className="p-8 text-center text-xs text-neutral-500 font-semibold">
                  Memuat Taksonomi Keahlian...
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/70 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="p-3">Nama Keahlian</th>
                          <th className="p-3">Rumpun Industri</th>
                          <th className="p-3">Deskripsi Kompetensi</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {skillsList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-neutral-400">
                              Belum ada master keahlian yang cocok.
                            </td>
                          </tr>
                        ) : (
                          skillsList.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="p-3 font-semibold text-neutral-900">{item.name}</td>
                              <td className="p-3 text-xs font-medium text-neutral-700">
                                {formatSkillCategory(item.category)}
                              </td>
                              <td className="p-3 text-neutral-600">{item.description || '-'}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSkill(item.id, item.name)}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus keahlian dari master"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Kontrol Paginasi Keahlian */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 mt-4">
                    <div className="text-xs text-neutral-500 font-mono">
                      Halaman <strong className="text-neutral-900">{skillPage}</strong> dari <strong className="text-neutral-900">{skillTotalPages}</strong> ({skillTotal} total keahlian)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={skillPage <= 1 || skillsLoading}
                        onClick={() => loadSkillsData(skillPage - 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        &larr; Sebelumnya
                      </button>
                      <div className="px-2 py-1.5 text-xs font-mono font-bold text-neutral-700">
                        {skillPage} / {skillTotalPages}
                      </div>
                      <button
                        type="button"
                        disabled={skillPage >= skillTotalPages || skillsLoading}
                        onClick={() => loadSkillsData(skillPage + 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Selanjutnya &rarr;
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: MASTER JURUSAN & MEJA KURASI */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'CURATION' && (
          <div className="space-y-6">
            {/* Header dengan Navigasi Sub-Tab */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-neutral-600" />
                  Master Data Jurusan & Taksonomi Program Studi
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Kelola direktori resmi jurusan dan prodi pendidikan, serta tinjau usulan baru dari angkatan kerja via isolasi karantina AI.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200 flex-1 md:flex-initial">
                  <button
                    type="button"
                    onClick={() => {
                      setMajorSubTab('MASTER');
                      loadMasterMajorsData(1);
                    }}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      majorSubTab === 'MASTER'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Katalog Master</span>
                    <span className="px-1.5 py-0.2 bg-neutral-200 text-neutral-700 font-mono text-[10px] rounded font-bold">
                      {majorTotal || 36}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMajorSubTab('CURATION');
                      loadCurationData();
                    }}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      majorSubTab === 'CURATION'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Meja Kurasi AI</span>
                    {(curationData?.totalPending || 0) > 0 ? (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] rounded font-bold animate-pulse">
                        {curationData.totalPending}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-neutral-200 text-neutral-600 font-mono text-[10px] rounded font-bold">
                        0
                      </span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    loadMasterMajorsData(majorPage);
                    loadCurationData();
                  }}
                  disabled={majorsLoading || curationLoading}
                  className="px-3 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
                  title="Segarkan data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${majorsLoading || curationLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SUB-TAB 1: KATALOG MASTER DATA JURUSAN & PRODI (CRUD) */}
            {/* ========================================================= */}
            {majorSubTab === 'MASTER' && (
              <div className="space-y-6">
                {majorActionMsg && (
                  <div className="p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{majorActionMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMajorActionMsg('')}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Metrik Master Jurusan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Jurusan & Prodi</div>
                    <div className="text-3xl font-bold font-mono text-neutral-900">{majorTotal || 0}</div>
                    <div className="text-xs text-neutral-500">Baku dalam taksonomi resmi Mimika</div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Rumpun Keilmuan</div>
                    <div className="text-3xl font-bold font-mono text-emerald-600">
                      {Object.keys(MAJOR_CATEGORY_LABELS).filter(k => k !== 'USULAN_WARGA').length}
                    </div>
                    <div className="text-xs text-neutral-500">Klaster industri & vokasi aktif</div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Antrean Karantina AI</div>
                    <div className="text-3xl font-bold font-mono text-amber-600">{curationData?.totalPending || 0}</div>
                    <div className="text-xs text-neutral-500">Menunggu persetujuan di meja kurasi</div>
                  </div>
                </div>

                {/* Filter & Bar Pencarian */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
                      <div className="relative flex-1 sm:w-72">
                        <input
                          type="text"
                          placeholder="Cari jurusan atau program studi..."
                          value={majorSearch}
                          onChange={(e) => setMajorSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && loadMasterMajorsData(1)}
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 pr-8"
                        />
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5" />
                      </div>

                      <select
                        value={majorCategoryFilter}
                        onChange={(e) => {
                          setMajorCategoryFilter(e.target.value);
                          setTimeout(() => loadMasterMajorsData(1), 50);
                        }}
                        className="border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                      >
                        <option value="ALL">Semua Rumpun Keilmuan</option>
                        {Object.entries(MAJOR_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                          <option key={catKey} value={catKey}>
                            {catLabel}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => loadMasterMajorsData(1)}
                        className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
                      >
                        Cari
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddMajorModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm w-full sm:w-auto justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Jurusan / Prodi</span>
                    </button>
                  </div>

                  {/* Modal Tambah Jurusan Baru */}
                  {showAddMajorModal && (
                    <form onSubmit={handleCreateMasterMajor} className="mt-5 p-5 bg-neutral-50/80 border border-neutral-200 rounded-xl space-y-4">
                      <div className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex justify-between items-center pb-2 border-b border-neutral-200">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-emerald-600" />
                          Tambah Master Jurusan & Program Studi Baru
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddMajorModal(false)}
                          className="text-neutral-400 hover:text-neutral-900 p-1 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Nama Jurusan / Program Studi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="cth: Teknik Robotika & Otomasi Pabrik"
                            value={newMajorName}
                            onChange={(e) => setNewMajorName(e.target.value)}
                            required
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Rumpun Keilmuan / Kategori <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newMajorCategory}
                            onChange={(e) => setNewMajorCategory(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                          >
                            {Object.entries(MAJOR_CATEGORY_LABELS)
                              .filter(([k]) => k !== 'USULAN_WARGA')
                              .map(([catKey, catLabel]) => (
                                <option key={catKey} value={catKey}>
                                  {catLabel}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMajorModal(false)}
                          className="px-3.5 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simpan ke Master</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Modal Edit Jurusan */}
                  {editingMajor && (
                    <form onSubmit={handleUpdateMasterMajor} className="mt-5 p-5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-4">
                      <div className="font-bold text-xs uppercase tracking-wider text-amber-900 flex justify-between items-center pb-2 border-b border-amber-200">
                        <span className="flex items-center gap-1.5">
                          <Edit2 className="w-4 h-4 text-amber-600" />
                          Edit Master Jurusan: &ldquo;{editingMajor.name}&rdquo;
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingMajor(null)}
                          className="text-neutral-400 hover:text-neutral-900 p-1 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Nama Jurusan / Program Studi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editMajorName}
                            onChange={(e) => setEditMajorName(e.target.value)}
                            required
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                            Rumpun Keilmuan / Kategori <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editMajorCategory}
                            onChange={(e) => setEditMajorCategory(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                          >
                            {Object.entries(MAJOR_CATEGORY_LABELS)
                              .filter(([k]) => k !== 'USULAN_WARGA')
                              .map(([catKey, catLabel]) => (
                                <option key={catKey} value={catKey}>
                                  {catLabel}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingMajor(null)}
                          className="px-3.5 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simpan Perubahan</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Tabel Master Jurusan */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-neutral-600" />
                      Daftar Master Taksonomi Jurusan ({majorTotal})
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 font-medium">
                      Halaman {majorPage} dari {majorTotalPages}
                    </span>
                  </div>

                  {majorsLoading ? (
                    <div className="p-12 text-center text-xs text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
                      Memuat direktori master jurusan...
                    </div>
                  ) : majorsList.length === 0 ? (
                    <div className="p-12 text-center text-xs text-neutral-400">
                      Tidak ada data master jurusan yang sesuai dengan kriteria pencarian.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-100 bg-neutral-50/70 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            <th className="p-3.5 pl-5">Nama Jurusan / Program Studi</th>
                            <th className="p-3.5">Rumpun Keilmuan</th>
                            <th className="p-3.5">ID Sistem</th>
                            <th className="p-3.5">Terdaftar Sejak</th>
                            <th className="p-3.5 pr-5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs">
                          {majorsList.map((major) => (
                            <tr key={major.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="p-3.5 pl-5 font-semibold text-neutral-900">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-neutral-400 shrink-0" />
                                  <span>{major.name}</span>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                  {formatMajorCategory(major.category)}
                                </span>
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                                {major.id.slice(0, 8)}...
                              </td>
                              <td className="p-3.5 text-[11px] text-neutral-500">
                                {major.createdAt ? new Date(major.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                }) : '-'}
                              </td>
                              <td className="p-3.5 pr-5 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMajor(major);
                                      setEditMajorName(major.name);
                                      setEditMajorCategory(major.category);
                                    }}
                                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Jurusan"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMasterMajor(major.id, major.name)}
                                    className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Jurusan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Paginasi Master Jurusan */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-neutral-100">
                    <div className="text-xs text-neutral-500 font-mono">
                      Halaman <strong className="text-neutral-900">{majorPage}</strong> dari <strong className="text-neutral-900">{majorTotalPages}</strong> ({majorTotal} total jurusan)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={majorPage <= 1 || majorsLoading}
                        onClick={() => loadMasterMajorsData(majorPage - 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        &larr; Sebelumnya
                      </button>
                      <div className="px-2 py-1.5 text-xs font-mono font-bold text-neutral-700">
                        {majorPage} / {majorTotalPages}
                      </div>
                      <button
                        type="button"
                        disabled={majorPage >= majorTotalPages || majorsLoading}
                        onClick={() => loadMasterMajorsData(majorPage + 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Selanjutnya &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SUB-TAB 2: MEJA KURASI AI & KARANTINA USULAN WARGA */}
            {/* ========================================================= */}
            {majorSubTab === 'CURATION' && (
              <div className="space-y-6">
                {curationActionMsg && (
                  <div className="p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{curationActionMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurationActionMsg('')}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Metrik Kurasi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Menunggu Kurasi</div>
                    <div className="text-3xl font-bold font-mono text-amber-600">{curationData?.totalPending || 0}</div>
                    <div className="text-xs text-neutral-500">Usulan tertahan di karantina</div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Telah Disetujui</div>
                    <div className="text-3xl font-bold font-mono text-emerald-600">{curationData?.totalApproved || 0}</div>
                    <div className="text-xs text-neutral-500">Dipromosikan ke taksonomi master</div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Master Rumpun</div>
                    <div className="text-3xl font-bold font-mono text-neutral-900">{majorTotal || curationData?.totalMaster || 36}</div>
                    <div className="text-xs text-neutral-500">Kamus baku taksonomi resmi</div>
                  </div>
                </div>

                {/* Tabel Usulan Karantina */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-neutral-600" />
                      Antrean Usulan Jurusan Warga (Quarantine Isolation)
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 font-medium">
                      {curationData?.pendingSuggestions?.length || 0} Antrean
                    </span>
                  </div>

                  {!curationData?.pendingSuggestions || curationData.pendingSuggestions.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-neutral-800 uppercase">Semua Usulan Sudah Bersih & Terkurasi</p>
                      <p className="text-xs text-neutral-500">Tidak ada usulan jurusan yang tertahan di karantina saat ini.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {curationData.pendingSuggestions.map((item: any) => (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-neutral-50/60 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-neutral-900">{item.suggestedName}</span>
                              <span className="text-xs font-mono text-neutral-400 font-normal">
                                ({item.inputCount}x diajukan)
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                              <span>Rekomendasi AI: <strong className="text-neutral-800">{item.aiNormalizedName || item.suggestedName}</strong></span>
                              <span>&bull;</span>
                              <span>Kategori: <strong className="text-neutral-800">{formatMajorCategory(item.inferredCategory)}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id, item.aiNormalizedName || item.suggestedName, item.inferredCategory || 'UMUM')}
                              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Setujui ke Master</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(item.id)}
                              className="p-2 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Tolak Usulan"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: MASTER KAMPUS & SEKOLAH */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'INSTITUTIONS' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-neutral-100">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neutral-600" />
                    Direktori Master Institusi Pendidikan (Kampus & Sekolah)
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Data referensi NPSN sekolah dan perguruan tinggi nasional serta institusi lokal Papua & Mimika.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Cari nama, NPSN, wilayah..."
                      value={instSearch}
                      onChange={(e) => setInstSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadInstitutionsData(1)}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900 pr-8"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5" />
                  </div>

                  <select
                    value={instCategoryFilter}
                    onChange={(e) => {
                      setInstCategoryFilter(e.target.value);
                      setTimeout(() => loadInstitutionsData(1), 50);
                    }}
                    className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-neutral-900 font-medium"
                  >
                    <option value="ALL">Semua Kategori (Kampus & Sekolah)</option>
                    <option value="KAMPUS">KAMPUS (Perguruan Tinggi)</option>
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                    <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => loadInstitutionsData(1)}
                    className="px-3.5 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors shadow-sm"
                  >
                    Cari
                  </button>
                </div>
              </div>

              {instActionMsg && (
                <div className="mt-4 p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{instActionMsg}</span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSyncInstitutions('sekolah')}
                  className="px-3.5 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" /> 
                  <span>Sinkronisasi Sekolah Mimika (NPSN Kemendikbud)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSyncInstitutions('kampus')}
                  className="px-3.5 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" /> 
                  <span>Sinkronisasi Kampus Papua & Nasional (Dikti)</span>
                </button>
              </div>

              {instLoading ? (
                <div className="p-8 text-center text-xs text-neutral-500 font-semibold">
                  Memuat Direktori Institusi...
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/70 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <th className="p-3">Nama Institusi</th>
                          <th className="p-3">Jenjang / Tipe</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Wilayah</th>
                          <th className="p-3">NPSN / External ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {instList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-neutral-400">
                              Tidak ditemukan data institusi. Silakan klik tombol Sinkronisasi atau ubah filter pencarian.
                            </td>
                          </tr>
                        ) : (
                          instList.map((inst) => (
                            <tr key={inst.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="p-3 font-semibold text-neutral-900">{inst.name}</td>
                              <td className="p-3 text-xs font-medium text-neutral-700">
                                {formatInstitutionCategory(inst.category)}
                              </td>
                              <td className="p-3 text-neutral-600">{inst.status || 'Aktif'}</td>
                              <td className="p-3 text-neutral-600">{inst.regencyName || inst.provinceName || 'Mimika, Papua Tengah'}</td>
                              <td className="p-3 font-mono text-neutral-500">{inst.externalId}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Kontrol Paginasi Institusi */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 mt-4">
                    <div className="text-xs text-neutral-500 font-mono">
                      Halaman <strong className="text-neutral-900">{instPage}</strong> dari <strong className="text-neutral-900">{instTotalPages}</strong> ({instTotal} total institusi)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={instPage <= 1 || instLoading}
                        onClick={() => loadInstitutionsData(instPage - 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        &larr; Sebelumnya
                      </button>
                      <div className="px-2 py-1.5 text-xs font-mono font-bold text-neutral-700">
                        {instPage} / {instTotalPages}
                      </div>
                      <button
                        type="button"
                        disabled={instPage >= instTotalPages || instLoading}
                        onClick={() => loadInstitutionsData(instPage + 1)}
                        className="px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Selanjutnya &rarr;
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: VERIFIKASI PERUSAHAAN (EMPLOYERS)                      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'EMPLOYERS' && (
          <div className="space-y-6">
            {/* Header Tab */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-neutral-800" />
                  <h2 className="text-base font-bold text-neutral-900">
                    Antrean Verifikasi Legalitas & Dokumen Perusahaan
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-white">
                    {pendingEmployers.length} Menunggu
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Verifikasi izin usaha resmi (NIB OSS), NPWP badan, profil PIC penanggung jawab, dan titik lokasi perusahaan sebelum diizinkan menerbitkan lowongan pekerjaan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPendingEmployers}
                  disabled={pendingEmployersLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${pendingEmployersLoading ? 'animate-spin' : ''}`} />
                  <span>Segarkan Antrean</span>
                </button>
              </div>
            </div>

            {/* Konten Antrean Verifikasi */}
            {pendingEmployersLoading ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider shadow-sm">
                Memeriksa Dokumen & Berkas Legalitas Perusahaan...
              </div>
            ) : pendingEmployers.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Semua Berkas Telah Terverifikasi</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Tidak ada antrean pendaftaran perusahaan yang menunggu keputusan Disnaker saat ini. Pendaftaran perusahaan baru akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEmployers.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-5"
                  >
                    {/* Baris Atas: Identitas Perusahaan & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 shrink-0 font-bold text-sm">
                          {emp.companyName ? emp.companyName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-neutral-900">{emp.companyName}</h3>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu Verifikasi Disnaker
                            </span>
                            {emp.sector && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                                {emp.sector}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-3">
                            <span>Akun Terdaftar: {emp.user?.email || '-'}</span>
                            <span>&bull;</span>
                            <span>Diajukan: {new Date(emp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ukuran Perusahaan */}
                      <div className="text-right sm:self-center">
                        <span className="text-xs font-semibold text-neutral-700 bg-neutral-50 px-2.5 py-1 rounded border border-neutral-200 block sm:inline-block">
                          {formatCompanySize(emp.companySize)}
                        </span>
                      </div>
                    </div>

                    {/* Baris Detail: Legalitas, Kontak, dan Lokasi */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Kolom 1: Legalitas Usaha */}
                      <div className="p-3.5 bg-neutral-50/70 rounded-lg space-y-2 border border-neutral-100">
                        <div className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                          Data Legalitas & Perpajakan
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Nomor NIB OSS:</span>
                            <span className="font-mono font-bold text-neutral-900">{emp.nib || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Nomor NPWP:</span>
                            <span className="font-mono font-semibold text-neutral-800">{emp.npwp || '-'}</span>
                          </div>
                          {emp.website && (
                            <div className="flex justify-between items-center pt-1 border-t border-neutral-200/60">
                              <span className="text-neutral-500">Website:</span>
                              <a
                                href={emp.website.startsWith('http') ? emp.website : `https://${emp.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                              >
                                {emp.website.replace(/^https?:\/\//, '')}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Kolom 2: Kontak Penanggung Jawab (PIC) */}
                      <div className="p-3.5 bg-neutral-50/70 rounded-lg space-y-2 border border-neutral-100">
                        <div className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                          Penanggung Jawab (PIC)
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-neutral-900">
                            {emp.picName || 'Belum diisi'} {emp.picPosition ? `(${emp.picPosition})` : ''}
                          </div>
                          <div className="text-neutral-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{emp.picPhone || '-'}</span>
                          </div>
                          <div className="text-neutral-600 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{emp.user?.email || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Kolom 3: Lokasi Fisik & GPS */}
                      <div className="p-3.5 bg-neutral-50/70 rounded-lg space-y-2 border border-neutral-100">
                        <div className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                          Alamat Kantor / Operasional
                        </div>
                        <div className="space-y-1">
                          <div className="text-neutral-800 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span>{emp.address || 'Alamat belum dilengkapi'}, Distrik {emp.district || 'Mimika'}</span>
                          </div>
                          {emp.latitude && emp.longitude && (
                            <div className="text-[11px] text-neutral-500 font-mono">
                              GPS: {emp.latitude}, {emp.longitude}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dokumen NIB Preview & Aksi Keputusan */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-100">
                      <div>
                        {emp.nibDocUrl ? (
                          <a
                            href={getFullMediaUrl(emp.nibDocUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Buka / Pratinjau Dokumen NIB OSS (PDF)</span>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                          </a>
                        ) : (
                          <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Dokumen NIB belum diunggah oleh perusahaan
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectionModalEmployer(emp);
                            setRejectionNotes('');
                          }}
                          className="px-4 py-2 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Tolak Pendaftaran
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveEmployer(emp)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Setujui & Verifikasi Resmi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Catatan Penolakan Perusahaan */}
            {rejectionModalEmployer && (
              <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        <X className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">Tolak Verifikasi Perusahaan</h3>
                        <p className="text-xs text-neutral-500">{rejectionModalEmployer.companyName}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRejectionModalEmployer(null)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 block">
                      Alasan / Catatan Resmi Penolakan (Disampaikan ke Perusahaan):
                    </label>
                    <textarea
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="Contoh: Dokumen NIB yang diunggah buram atau tidak sesuai dengan nama badan usaha yang didaftarkan. Mohon unggah kembali dokumen NIB asli."
                      rows={4}
                      className="w-full text-xs p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 resize-none font-sans"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Perusahaan dapat melihat catatan ini di dasbor profil untuk memperbaiki data mereka.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setRejectionModalEmployer(null)}
                      className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRejectEmployer}
                      className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: KATALOG & MANAJEMEN PELATIHAN DAERAH (TRAININGS LMS)   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'TRAININGS' && (
          <div className="space-y-6">
            {/* Header Tab */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-neutral-800" />
                  <h2 className="text-base font-bold text-neutral-900">
                    Katalog & Manajemen Pelatihan Daerah (LMS Disnaker)
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-white">
                    {trainingsList.length} Program
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Kelola program vokasi, silabus bertingkat, standar kelulusan, dan status publikasi pelatihan untuk pencari kerja Kabupaten Mimika.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadTrainingsData}
                  disabled={trainingsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${trainingsLoading ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTrainingModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Program Baru</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab Bar: Katalog vs Audit Tier-1 vs Kurasi Tier-2 */}
            <div className="flex border-b border-neutral-300 bg-white">
              <button
                type="button"
                onClick={() => setTrainingSubTab('CATALOG')}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  trainingSubTab === 'CATALOG'
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Katalog Pelatihan Daerah ({trainingsList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrainingSubTab('PROVIDERS');
                  loadPendingProviders();
                }}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  trainingSubTab === 'PROVIDERS'
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>Audit Lembaga Vokasi (Tier-1)</span>
                {pendingProviders.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold">
                    {pendingProviders.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrainingSubTab('PROGRAM_CURATION');
                  loadPendingCurations();
                }}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  trainingSubTab === 'PROGRAM_CURATION'
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>Meja Kurasi Program (Tier-2)</span>
                {pendingProgramCurations.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold">
                    {pendingProgramCurations.length}
                  </span>
                )}
              </button>
            </div>

            {/* SUB-TAB 1: KATALOG PELATIHAN DAERAH */}
            {trainingSubTab === 'CATALOG' && (
              <>
                {trainingsLoading ? (
                  <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider shadow-sm">
                    Mengambil Data Katalog & Pelatihan Daerah...
                  </div>
                ) : trainingsList.length === 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm space-y-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Belum Ada Program Pelatihan</h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
                      Klik tombol "Buat Program Baru" di atas untuk menambahkan program sertifikasi dan pelatihan vokasi daerah.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainingsList.map((t) => {
                      const isPublished = t.status === 'PUBLISHED';
                      return (
                        <div
                          key={t.id}
                          className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                                {formatSkillCategory(t.category)}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isPublished
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{t.title}</h3>
                              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{t.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600">
                              <div>
                                <span className="text-neutral-400 block text-[10px]">Penyelenggara:</span>
                                <span className="font-semibold">{t.provider?.institutionName || t.providerName || 'Disnakertrans Mimika'}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block text-[10px]">Alokasi Kuota:</span>
                                <span className="font-semibold">{t.quota || 30} Peserta</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-4">
                            <span className="text-[11px] font-mono text-neutral-400">
                              Sesi: {t.sessions?.length || t.totalSessions || 0}
                            </span>

                            {!isPublished ? (
                              <button
                                type="button"
                                onClick={() => handlePublishTraining(t.id, t.title)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Publikasikan</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Aktif di Katalog Warga
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* SUB-TAB 2: AUDIT LEMBAGA VOKASI (TIER-1) */}
            {trainingSubTab === 'PROVIDERS' && (
              <div className="space-y-4">
                <div className="bg-white border border-neutral-200 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Antrean Verifikasi Lembaga Pelatihan (Tier-1)
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Periksa kelengkapan izin operasional LPK/BLK/LSP sebelum memberikan izin pembuatan program.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadPendingProviders}
                    disabled={pendingProvidersLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pendingProvidersLoading ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {pendingProvidersLoading ? (
                  <div className="bg-white border border-neutral-200 p-12 text-center text-xs font-bold text-neutral-500 uppercase">
                    Memeriksa antrean audit lembaga...
                  </div>
                ) : pendingProviders.length === 0 ? (
                  <div className="bg-white border border-neutral-200 p-12 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-neutral-900 uppercase">Semua Lembaga Terverifikasi</div>
                    <p className="text-xs text-neutral-500">Tidak ada pengajuan lembaga baru yang menunggu audit Tier-1.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200 divide-y divide-neutral-200">
                    {pendingProviders.map((prov) => (
                      <div key={prov.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-900 text-white font-mono">
                              {prov.institutionType?.replace(/_/g, ' ')}
                            </span>
                            {prov.vinNumber && (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                                VIN: {prov.vinNumber}
                              </span>
                            )}
                            {prov.bnspLicenseNumber && (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                                BNSP: {prov.bnspLicenseNumber}
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-neutral-900">{prov.institutionName}</h4>
                          <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{prov.address || 'Alamat belum diatur'}</span>
                          </p>

                          <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-3 pt-1">
                            <span>PIC: <strong>{prov.picName || '-'} ({prov.picPhone || '-'})</strong></span>
                            <span>Email Akun: <strong>{prov.user?.email}</strong></span>
                            {prov.legalDocUrl && (
                              <a
                                href={getFullMediaUrl(prov.legalDocUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-neutral-900 underline inline-flex items-center gap-1"
                              >
                                <span>Periksa Berkas PDF Legalitas</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleVerifyProvider(prov.id, 'APPROVED')}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sahkan (APPROVED)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProviderRejectModal(prov)}
                            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: MEJA KURASI PROGRAM SKILLHUB (TIER-2) */}
            {trainingSubTab === 'PROGRAM_CURATION' && (
              <div className="space-y-4">
                <div className="bg-white border border-neutral-200 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Meja Kurasi Kurikulum & Silabus Program (Tier-2)
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Audit silabus, sertifikasi yang diterbitkan, dan target keahlian sebelum diterbitkan ke katalog publik.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadPendingCurations}
                    disabled={pendingCurationsLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pendingCurationsLoading ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {pendingCurationsLoading ? (
                  <div className="bg-white border border-neutral-200 p-12 text-center text-xs font-bold text-neutral-500 uppercase">
                    Memeriksa antrean kurasi program...
                  </div>
                ) : pendingProgramCurations.length === 0 ? (
                  <div className="bg-white border border-neutral-200 p-12 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-neutral-900 uppercase">Antrean Kurasi Bersih</div>
                    <p className="text-xs text-neutral-500">Seluruh program pelatihan yang diajukan telah selesai dikurasi.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingProgramCurations.map((prog) => (
                      <div key={prog.id} className="bg-white border border-neutral-300 p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {prog.programCode}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300">
                              MENUNGGU KURASI TIER-2
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-neutral-900">{prog.title}</h4>
                          <div className="text-xs text-neutral-600 font-medium">
                            Lembaga: <strong>{prog.provider?.institutionName || 'Balai Terdaftar'}</strong>
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2">{prog.description}</p>

                          <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                            <span>Kejuruan: <strong>{prog.category}</strong></span>
                            <span>Sertifikat: <strong>{prog.certificateType?.replace(/_/g, ' ')}</strong></span>
                            <span>Durasi: <strong>{prog.durationDays} Hari ({prog.totalLessonHours} JP)</strong></span>
                          </div>

                          {prog.syllabus && (
                            <div className="p-2.5 bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-700">
                              <strong>Silabus:</strong> {prog.syllabus}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCurateProgram(prog.id, 'APPROVED')}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui & Publikasikan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProgramCurateModal(prog)}
                            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Tolak Provider */}
            {providerRejectModal && (
              <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-neutral-300 max-w-md w-full p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold uppercase text-neutral-900">
                    Tolak Verifikasi Lembaga
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Berikan catatan resmi alasan penolakan bagi lembaga <strong>{providerRejectModal.institutionName}</strong>:
                  </p>
                  <textarea
                    rows={3}
                    required
                    value={providerAuditNotes}
                    onChange={(e) => setProviderAuditNotes(e.target.value)}
                    placeholder="Contoh: Berkas izin operasional VIN tidak terbaca / masa berlaku habis..."
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setProviderRejectModal(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyProvider(providerRejectModal.id, 'REJECTED', providerAuditNotes)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase"
                    >
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Tolak Program */}
            {programCurateModal && (
              <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-neutral-300 max-w-md w-full p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold uppercase text-neutral-900">
                    Tolak Kurasi Program Pelatihan
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Berikan catatan resmi revisi kurikulum untuk <strong>{programCurateModal.title}</strong>:
                  </p>
                  <textarea
                    rows={3}
                    required
                    value={programCurateNotes}
                    onChange={(e) => setProgramCurateNotes(e.target.value)}
                    placeholder="Contoh: Silabus modul las 6G belum mencakup uji NDT dan keselamatan radiografi..."
                    className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setProgramCurateModal(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurateProgram(programCurateModal.id, 'REJECTED', programCurateNotes)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase"
                    >
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Buat Program Pelatihan */}
            {showAddTrainingModal && (
              <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Buat Program Pelatihan Baru</h3>
                      <p className="text-xs text-neutral-500">Tambahkan kurikulum dan standar kelulusan pelatihan daerah.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddTrainingModal(false)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTraining} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 block">Nama Program Pelatihan:</label>
                      <input
                        type="text"
                        required
                        value={newTrainingTitle}
                        onChange={(e) => setNewTrainingTitle(e.target.value)}
                        placeholder="Contoh: Sertifikasi Pengelasan SMAW 3G Plat Industri"
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 block">Rumpun Kejuruan:</label>
                        <select
                          value={newTrainingCategory}
                          onChange={(e) => setNewTrainingCategory(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                        >
                          {Object.entries(SKILL_CATEGORY_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 block">Moda Pelaksanaan:</label>
                        <select
                          value={newTrainingDelivery}
                          onChange={(e) => setNewTrainingDelivery(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                        >
                          <option value="OFFLINE_SITE">Tatap Muka (Site / Workshop)</option>
                          <option value="ONLINE_HYBRID">Hybrid (Daring & Praktik)</option>
                          <option value="VIRTUAL_SELF_PACED">Mandiri / Self-Paced LMS</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 block">Kuota Peserta (Orang):</label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={newTrainingQuota}
                          onChange={(e) => setNewTrainingQuota(Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700 block">Passing Grade Ujian (%):</label>
                        <input
                          type="number"
                          min={50}
                          max={100}
                          value={newTrainingPassingGrade}
                          onChange={(e) => setNewTrainingPassingGrade(Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700 block">Deskripsi & Kompetensi Target:</label>
                      <textarea
                        rows={3}
                        value={newTrainingDesc}
                        onChange={(e) => setNewTrainingDesc(e.target.value)}
                        placeholder="Uraikan materi pokok dan sertifikasi yang akan didapatkan peserta..."
                        className="w-full text-xs p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setShowAddTrainingModal(false)}
                        className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Simpan Draft Program
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: OVERVIEW (PUSAT KOMANDO EKSEKUTIF) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'OVERVIEW' && (
          profile?.role === 'SUPERADMIN' ? (
            /* ========================================================= */
            /* TAMPILAN SUPERADMIN: MASTER DATA GOVERNANCE & INTEGRITY   */
            /* ========================================================= */
            <div className="space-y-6">
              {/* 4 Kartu Metrik Kesehatan Master Data (Single Layer, Tanpa Box Bertumpuk) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Master Keahlian */}
                <div 
                  onClick={() => handleTabSwitch('SKILLS')}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-sm group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Standar Keahlian
                    </span>
                    <Wrench className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-neutral-900">{skillTotal || 24}</div>
                    <span className="text-xs text-neutral-500 block mt-0.5">Standar Taksonomi SKKNI</span>
                  </div>
                </div>

                <div 
                  onClick={() => handleTabSwitch('CURATION')}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-sm group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Kurasi Jurusan
                    </span>
                    <Inbox className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-neutral-900">
                      {curationData?.totalPending || 0}
                      <span className="text-xs font-normal text-neutral-500 ml-1.5 font-sans">menunggu</span>
                    </div>
                    <span className="text-xs text-neutral-500 block mt-0.5">Kurasi Otomatis AI</span>
                  </div>
                </div>

                <div 
                  onClick={() => handleTabSwitch('INSTITUTIONS')}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-sm group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Kampus & Sekolah
                    </span>
                    <Building2 className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-neutral-900">{instTotal || 38}</div>
                    <span className="text-xs text-neutral-500 block mt-0.5">SMK, Kampus, BLK Terdata</span>
                  </div>
                </div>

                <div 
                  onClick={() => handleTabSwitch('USERS')}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-sm group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Pengguna & Otoritas
                    </span>
                    <Users className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-neutral-900">{userTotal || 0}</div>
                    <span className="text-xs text-neutral-500 block mt-0.5">Akun Terdaftar Platform</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-medium">
                    <span>Atur Hak Akses Akun</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Pintasan Aksi Cepat Tata Kelola */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                  <span>Aksi Cepat Manajemen Master Data</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddSkillModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Tambah Keahlian</span>
                  </button>
                  <button
                    onClick={() => handleTabSwitch('CURATION')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Meja Kurasi Jurusan</span>
                  </button>
                  <button
                    onClick={() => handleTabSwitch('INSTITUTIONS')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Kelola Institusi</span>
                  </button>
                  <button
                    onClick={() => handleTabSwitch('USERS')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Kelola Hak Akses</span>
                  </button>
                </div>
              </div>

              {curationActionMsg && (
                <div className="p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{curationActionMsg}</span>
                  </div>
                  <button type="button" onClick={() => setCurationActionMsg('')} className="text-neutral-400 hover:text-white p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Dua Kolom Operasional Master (Bersih, Garis Horizontal Tipis, Bebas Nested Boxes) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kolom 1: Antrean Usulan Kurasi Jurusan */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-neutral-600" />
                        Antrean Usulan Kurasi Jurusan
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Jurusan baru usulan pencaker yang siap distandarisasi
                      </p>
                    </div>
                    <button
                      onClick={() => handleTabSwitch('CURATION')}
                      className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer"
                    >
                      Buka Meja &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {!curationData?.pendingSuggestions || curationData.pendingSuggestions.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <div className="text-xs font-semibold text-neutral-800">Semua Jurusan Terstandarisasi</div>
                        <p className="text-xs text-neutral-500 mt-0.5">Tidak ada antrean kurasi baru yang memerlukan tindakan.</p>
                      </div>
                    ) : (
                      curationData.pendingSuggestions.slice(0, 5).map((m: any) => (
                        <div key={m.id} className="p-4 hover:bg-neutral-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-neutral-900 truncate">{m.suggestedName}</span>
                              <span className="text-xs font-mono text-neutral-400 font-normal">
                                ({m.inputCount}x diajukan)
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                              <span>Saran Baku AI: <strong className="text-neutral-800">{m.aiNormalizedName || m.suggestedName}</strong></span>
                              <span>&bull;</span>
                              <span className="text-neutral-600">{formatMajorCategory(m.inferredCategory)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleApprove(m.id, m.aiNormalizedName || m.suggestedName, m.inferredCategory || 'UMUM')}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Setujui</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(m.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Tolak Usulan"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kolom 2: Detak Sistem & Jejak Aktivitas */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-600" />
                        Detak Sistem & Jejak Aktivitas
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Log interaksi dan perubahan data platform secara real-time
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Audit Log</span>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {recentActivities.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-500">Belum ada aktivitas terekam.</div>
                    ) : (
                      recentActivities.slice(0, 5).map((act: any) => (
                        <div key={act.id} className="p-4 hover:bg-neutral-50/60 transition-colors space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                act.type === 'APPROACH' ? 'bg-purple-500' :
                                act.type === 'GRADUATION' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`} />
                              <span className="font-semibold text-neutral-800 text-xs">{act.title}</span>
                            </div>
                            <span className="text-neutral-400 font-mono text-[11px]">
                              {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 pl-4">{act.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* TAMPILAN EKSEKUTIF / DISNAKER: ANALITIK DAERAH (REFACTORED)*/
            /* ========================================================= */
            <div className="space-y-6">
              {/* 8 Kartu KPI Eksekutif (Clean Modern, Border 1px Halus) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Angkatan Kerja Terdata</span>
                    <Users className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.totalTalents || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Warga terverifikasi NIK Dukcapil</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pencari Kerja Aktif</span>
                    <UserCheck className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.activeSeekingTalents || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Status siap dipekerjakan industri</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Industri Terakreditasi</span>
                    <Building2 className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.totalEmployers || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Perusahaan sah berizin NIB OSS</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Lowongan Proyek Terbuka</span>
                    <Briefcase className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.openVacancies || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Posisi aktif dalam radar AI Sourcing</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Approach Berhasil</span>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.successfulApproaches || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Kandidat dipinang oleh industri</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Partisipan Pelatihan</span>
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.totalEnrollments || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Warga terdaftar di LMS Disnaker</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Kelulusan & Sertifikasi</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.graduatedCount || 0}</div>
                  <span className="text-[11px] text-neutral-500 block">Lulusan terinjeksi skill bersertifikat</span>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Rasio Penyerapan Kerja</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-neutral-900">{kpis.absorptionRate || '0%'}</div>
                  <span className="text-[11px] text-neutral-500 block">Efektivitas matching angkatan kerja</span>
                </div>
              </div>

              {/* Baris Dua: Corong Matching & Radar Kesenjangan (Tanpa Nested Box!) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-neutral-600" />
                      Corong Konversi Sourcing & Penempatan
                    </h2>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Tahapan Alur</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {funnel.map((step: any, idx: number) => {
                      const percentage = kpis.totalTalents > 0 
                        ? Math.min(100, Math.round((step.count / kpis.totalTalents) * 100)) 
                        : 0;

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-neutral-800">{step.step}</span>
                            <span className="font-mono font-bold text-neutral-900">{step.count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-neutral-900 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(percentage, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Radar Kesenjangan Keahlian (Bebas Kardus dalam Kardus!) */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Kesenjangan Keterampilan Industri vs Suplai
                    </h2>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Kebutuhan vs Ketersediaan</span>
                  </div>

                  <div className="divide-y divide-neutral-100 pt-1">
                    {skillGaps.map((item: any, idx: number) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-neutral-900">{item.skill}</div>
                          <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                            <span>Permintaan: <strong className="text-neutral-800 font-mono">{item.demand}</strong></span>
                            <span>&bull;</span>
                            <span>Suplai: <strong className="text-neutral-800 font-mono">{item.supply}</strong></span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md shrink-0">
                          Defisit: {item.gap} Orang
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Baris Tiga: Distribusi Sektor & Audit Trail */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribusi Kebutuhan Sektor Industri */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-neutral-600" />
                      Distribusi Kebutuhan Tenaga Kerja per Sektor
                    </h2>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Pangsa Sektor</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {industryDist.map((ind: any, idx: number) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-800">{ind.sector}</span>
                          <span className="font-mono font-bold text-neutral-900">{ind.percentage}% ({ind.count} lowongan)</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-neutral-900 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${ind.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feed Aktivitas Real-Time Sistem (Clean Dividers, No Outlined Badges) */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-600" />
                      Detak Sistem: Aktivitas Terkini Platform
                    </h2>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Jejak Audit</span>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {recentActivities.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-500">Belum ada aktivitas terekam.</div>
                    ) : (
                      recentActivities.map((act: any) => (
                        <div key={act.id} className="p-4 space-y-1 hover:bg-neutral-50/60 transition-colors">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                act.type === 'APPROACH' ? 'bg-purple-500' :
                                act.type === 'GRADUATION' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`} />
                              <span className="font-semibold text-neutral-800 text-xs">{act.title}</span>
                            </div>
                            <span className="text-neutral-400 font-mono text-[11px]">
                              {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 pl-4">{act.description}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3.5 bg-neutral-50/50 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
                    <span>Seluruh interaksi tercatat secara kriptografis di PostgreSQL.</span>
                    <span className="font-semibold text-neutral-700">Audit Terbuka</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      <AlertModal {...alertProps} />
    </AppShell>
  );
}
