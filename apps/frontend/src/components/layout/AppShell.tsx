'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  UserCheck, 
  Building2, 
  Briefcase, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  BarChart3,
  Database,
  Users,
  Wrench,
  Inbox
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface AppShellProps {
  children: React.ReactNode;
  userRole: 'TALENT' | 'EMPLOYER' | 'DISNAKER_ADMIN' | 'EXECUTIVE' | 'SUPERADMIN';
  userName: string;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  curationBadge?: number;
}

export default function AppShell({ children, userRole, userName, activeTab, onTabChange, curationBadge }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    ...(userRole === 'TALENT' ? [
      { name: 'Profil Talenta Saya', href: '/talent', icon: UserCheck },
      { name: 'Katalog Pelatihan', href: '/talent/trainings', icon: GraduationCap },
    ] : []),
    ...(userRole === 'EMPLOYER' ? [
      { name: 'Profil Perusahaan', href: '/employer', icon: Building2 },
      { name: 'Kelola Lowongan', href: '/employer/vacancies', icon: Briefcase },
    ] : []),
    ...(userRole === 'SUPERADMIN' ? [
      { name: 'Ikhtisar Master Data', href: '/admin?tab=OVERVIEW', icon: Database, tab: 'OVERVIEW' },
      { name: 'Manajemen Pengguna', href: '/admin?tab=USERS', icon: Users, tab: 'USERS' },
      { name: 'Master Keahlian (Skills)', href: '/admin?tab=SKILLS', icon: Wrench, tab: 'SKILLS' },
      { name: 'Master Jurusan & Kurasi', href: '/admin?tab=CURATION', icon: Inbox, tab: 'CURATION', badge: curationBadge },
      { name: 'Master Kampus & Sekolah', href: '/admin?tab=INSTITUTIONS', icon: Building2, tab: 'INSTITUTIONS' },
    ] : []),
    ...(userRole === 'DISNAKER_ADMIN' || userRole === 'EXECUTIVE' ? [
      { name: 'Command Center', href: '/admin', icon: BarChart3 },
      { name: 'Verifikasi Perusahaan', href: '/employer', icon: ShieldCheck },
      { name: 'Katalog Pelatihan', href: '/talent/trainings', icon: GraduationCap },
    ] : []),
  ];

  return (
    <div className="h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 shrink-0 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wider text-sm lg:text-base border-r border-neutral-200 pr-3 text-neutral-900">
              MIMIKA TALENTA
            </span>
            <span className="text-xs uppercase tracking-widest text-neutral-500 hidden sm:inline font-medium">
              Workforce Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-neutral-900">{userName}</div>
            <div className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold">{userRole}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Backdrop untuk Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-neutral-900/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigasi Full Edge-to-Edge */}
        <aside className={`
          fixed lg:static top-16 bottom-0 left-0 z-20 w-64 bg-white border-r border-neutral-200 shrink-0
          transform transition-transform duration-200 ease-in-out flex flex-col justify-between overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'}
        `}>
          <div className="py-4 space-y-1">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-5 py-2">
              Menu Navigasi
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = item.tab && activeTab 
                  ? item.tab === activeTab 
                  : pathname === item.href;

                if (item.tab && onTabChange) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onTabChange(item.tab);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left flex items-center justify-between px-5 py-3 text-xs font-medium transition-colors cursor-pointer border-l-4 ${
                        isActive 
                          ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' 
                          : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                        <span>{item.name}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className={`text-[11px] font-mono font-medium ${
                            isActive ? 'text-neutral-300' : 'text-neutral-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-80 text-white' : 'opacity-30'}`} />
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-xs font-medium transition-colors border-l-4 ${
                      isActive 
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' 
                        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      <span>{item.name}</span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className={`text-[11px] font-mono font-medium ${
                          isActive ? 'text-neutral-300' : 'text-neutral-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-80 text-white' : 'opacity-30'}`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 text-[11px] text-neutral-500">
            <div className="flex items-center gap-2 font-semibold text-neutral-800 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>{userRole === 'SUPERADMIN' ? 'Otoritas Superadmin' : 'Sistem Aktif'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              {userRole === 'SUPERADMIN' 
                ? 'Tata Kelola Master Data & Standarisasi Ekosistem' 
                : 'Dinas Tenaga Kerja & Transmigrasi Kab. Mimika'}
            </p>
          </div>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
