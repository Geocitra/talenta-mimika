'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
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
  Search,
  ShieldCheck,
  Wrench,
  Database,
  ArrowRight
} from 'lucide-react';

type TabType = 'OVERVIEW' | 'USERS' | 'SKILLS' | 'CURATION' | 'INSTITUTIONS';

export default function ExecutiveCommandCenterPage() {
  const router = useRouter();
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && ['OVERVIEW', 'USERS', 'SKILLS', 'CURATION', 'INSTITUTIONS'].includes(tabParam)) {
        setActiveTab(tabParam);
        if (tabParam === 'USERS') loadUsersData(1);
        if (tabParam === 'SKILLS') loadSkillsData(1);
        if (tabParam === 'CURATION') loadCurationData();
        if (tabParam === 'INSTITUTIONS') loadInstitutionsData(1);
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

    // 2. Ambil Data Real-Time Command Center
    const analyticsRes = await apiFetch('/analytics/command-center');
    if (analyticsRes.status === 'success') {
      setAnalyticsData(analyticsRes.data);
    } else {
      setError(analyticsRes.message || 'Gagal memuat data analitik daerah.');
    }

    // 3. Ambil Data Awal Kurasi & Master Data
    await Promise.all([
      loadCurationData(),
      loadSkillsData(1),
      loadUsersData(1),
      loadInstitutionsData(1)
    ]);

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
        setCurationActionMsg(res.message || 'Jurusan berhasil disetujui ke Master!');
        await loadCurationData();
      }
    } catch (err: any) {
      setCurationActionMsg(`Error: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    setCurationActionMsg('');
    try {
      const res = await apiFetch(`/majors/curation/${id}/reject`, {
        method: 'POST',
      });
      if (res.status === 'success') {
        setCurationActionMsg(res.message || 'Usulan jurusan ditolak.');
        await loadCurationData();
      }
    } catch (err: any) {
      setCurationActionMsg(`Error: ${err.message}`);
    }
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
        setUserActionMsg(`Role berhasil diubah menjadi ${newRole}`);
        await loadUsersData(userPage);
      }
    } catch (err: any) {
      setUserActionMsg(`Error: ${err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    setUserActionMsg('');
    try {
      const res = await apiFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
      });
      if (res.status === 'success') {
        setUserActionMsg(`Status akun berhasil diperbarui.`);
        await loadUsersData(userPage);
      }
    } catch (err: any) {
      setUserActionMsg(`Error: ${err.message}`);
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
        setSkillActionMsg(`Keahlian "${newSkillName}" berhasil ditambahkan ke Master!`);
        setNewSkillName('');
        setNewSkillDesc('');
        setShowAddSkillModal(false);
        await loadSkillsData(1);
      }
    } catch (err: any) {
      setSkillActionMsg(`Error: ${err.message}`);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!confirm(`Hapus keahlian "${name}" dari master katalog?`)) return;
    setSkillActionMsg('');
    try {
      const res = await apiFetch(`/skills/${id}`, { method: 'DELETE' });
      if (res.status === 'success') {
        setSkillActionMsg(`Keahlian "${name}" berhasil dihapus.`);
        await loadSkillsData(skillPage);
      }
    } catch (err: any) {
      setSkillActionMsg(`Error: ${err.message}`);
    }
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
        setInstActionMsg(res.message || `Sinkronisasi ${type} selesai.`);
        await loadInstitutionsData(1);
      }
    } catch (err: any) {
      setInstActionMsg(`Gagal sinkronisasi: ${err.message}`);
    }
  };

  // Switch Tab Helper
  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/admin?tab=${tab}`);
    }
    if (tab === 'USERS') loadUsersData(1);
    if (tab === 'SKILLS') loadSkillsData(1);
    if (tab === 'CURATION') loadCurationData();
    if (tab === 'INSTITUTIONS') loadInstitutionsData(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const analyticsRes = await apiFetch('/analytics/command-center');
    if (analyticsRes.status === 'success') {
      setAnalyticsData(analyticsRes.data);
    }
    await Promise.all([
      loadCurationData(),
      loadUsersData(userPage),
      loadSkillsData(skillPage),
      loadInstitutionsData(instPage)
    ]);
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
                                <span className={`text-xs uppercase tracking-wider ${
                                  u.role === 'SUPERADMIN'
                                    ? 'font-bold text-neutral-900'
                                    : u.role === 'DISNAKER_ADMIN'
                                    ? 'font-medium text-blue-700'
                                    : u.role === 'EXECUTIVE'
                                    ? 'font-medium text-purple-700'
                                    : u.role === 'EMPLOYER'
                                    ? 'font-medium text-amber-700'
                                    : 'font-medium text-neutral-500'
                                }`}>
                                  {u.role}
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
                              <td className="p-3 text-xs font-medium text-neutral-600">
                                {item.category}
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
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
                  Meja Kurasi AI & Karantina Taksonomi Jurusan
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tinjau usulan jurusan baru dari warga yang telah dinormalisasi oleh AI sebelum dimasukkan ke database master.
                </p>
              </div>
              <button
                type="button"
                onClick={loadCurationData}
                disabled={curationLoading}
                className="px-3.5 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${curationLoading ? 'animate-spin' : ''}`} />
                <span>Muat Ulang</span>
              </button>
            </div>

            {curationActionMsg && (
              <div className="p-3 bg-neutral-900 text-white text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{curationActionMsg}</span>
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
                <div className="text-3xl font-bold font-mono text-neutral-900">{curationData?.totalMaster || 35}</div>
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
                          <span>Kategori: <strong className="text-neutral-800">{item.inferredCategory || 'UMUM'}</strong></span>
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
                              <td className="p-3 text-xs font-medium uppercase text-neutral-600">
                                {inst.category}
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
                              <span className="text-neutral-600">{m.inferredCategory || 'UMUM'}</span>
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
    </AppShell>
  );
}
