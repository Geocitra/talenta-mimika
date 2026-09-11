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
  ShieldCheck,
  GraduationCap,
  BarChart3,
  Database,
  Users,
  Wrench,
  Inbox,
  User,
  Bell,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface AppShellProps {
  children: React.ReactNode;
  userRole: 'TALENT' | 'EMPLOYER' | 'DISNAKER_ADMIN' | 'EXECUTIVE' | 'SUPERADMIN' | 'TRAINING_PROVIDER';
  userName: string;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  curationBadge?: number;
  pendingEmployersBadge?: number;
}

export default function AppShell({
  children,
  userRole,
  userName,
  activeTab,
  onTabChange,
  curationBadge,
  pendingEmployersBadge,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Navigasi Terstruktur Berdasarkan Peran Pengguna
  const navItems = [
    ...(userRole === 'TALENT'
      ? [
          { name: 'Profil Talenta Saya', href: '/talent', icon: UserCheck },
          { name: 'Katalog Pelatihan & Sertifikasi', href: '/talent/trainings', icon: GraduationCap },
        ]
      : []),
    ...(userRole === 'EMPLOYER'
      ? [
          { name: 'Dasbor Ringkasan', href: '/employer', icon: BarChart3, exact: true },
          { name: 'Profil & Dokumen NIB', href: '/employer/profile', icon: Building2 },
          { name: 'Kelola Lowongan & Radar AI', href: '/employer/vacancies', icon: Briefcase },
        ]
      : []),
    ...(userRole === 'TRAINING_PROVIDER'
      ? [
          { name: 'Dasbor Balai', href: '/provider', icon: BarChart3, exact: true },
          { name: 'Profil & Legalitas', href: '/provider/profile', icon: Building2 },
          { name: 'Studio Program & Batch', href: '/provider/programs/create', icon: GraduationCap },
        ]
      : []),
    ...(userRole === 'SUPERADMIN'
      ? [
          { name: 'Dasbor Master Data', href: '/admin?tab=OVERVIEW', icon: Database, tab: 'OVERVIEW' },
          { name: 'Verifikasi Perusahaan', href: '/admin?tab=EMPLOYERS', icon: ShieldCheck, tab: 'EMPLOYERS', badge: pendingEmployersBadge },
          { name: 'Pelatihan Daerah', href: '/admin?tab=TRAININGS', icon: GraduationCap, tab: 'TRAININGS' },
          { name: 'Manajemen Akun', href: '/admin?tab=USERS', icon: Users, tab: 'USERS' },
          { name: 'Master Keahlian', href: '/admin?tab=SKILLS', icon: Wrench, tab: 'SKILLS' },
          { name: 'Kurasi Jurusan', href: '/admin?tab=CURATION', icon: Inbox, tab: 'CURATION', badge: curationBadge },
          { name: 'Kampus & Sekolah', href: '/admin?tab=INSTITUTIONS', icon: Building2, tab: 'INSTITUTIONS' },
        ]
      : []),
    ...(userRole === 'DISNAKER_ADMIN'
      ? [
          { name: 'Command Center', href: '/admin?tab=OVERVIEW', icon: BarChart3, tab: 'OVERVIEW' },
          { name: 'Verifikasi Perusahaan', href: '/admin?tab=EMPLOYERS', icon: ShieldCheck, tab: 'EMPLOYERS', badge: pendingEmployersBadge },
          { name: 'Katalog Pelatihan Daerah', href: '/admin?tab=TRAININGS', icon: GraduationCap, tab: 'TRAININGS' },
        ]
      : []),
    ...(userRole === 'EXECUTIVE'
      ? [
          { name: 'Pusat Intelijen Pimpinan', href: '/admin?tab=OVERVIEW', icon: BarChart3, tab: 'OVERVIEW' },
          { name: 'Verifikasi Perusahaan', href: '/admin?tab=EMPLOYERS', icon: ShieldCheck, tab: 'EMPLOYERS', badge: pendingEmployersBadge },
          { name: 'Katalog Pelatihan Daerah', href: '/admin?tab=TRAININGS', icon: GraduationCap, tab: 'TRAININGS' },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (STICKY ATAS GAYA GLINTS / KEMNAKER)                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-300 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* SISI KIRI: BRANDING & LOGO */}
            <div className="flex items-center gap-8">
              <Link href={userRole === 'TALENT' ? '/talent' : userRole === 'EMPLOYER' ? '/employer' : userRole === 'TRAINING_PROVIDER' ? '/provider' : '/admin'} className="flex items-center gap-3">
                <div className="bg-neutral-900 text-white font-bold text-xs tracking-wider px-2.5 py-1.5 uppercase font-mono">
                  MT
                </div>
                <div>
                  <span className="font-bold tracking-tight text-sm uppercase text-neutral-900 block leading-none">
                    MIMIKA TALENTA
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium block mt-0.5">
                    Disnakertrans Kab. Mimika
                  </span>
                </div>
              </Link>

              {/* NAVIGASI HORIZONTAL DESKTOP (TENGAH / KIRI) */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navItems.map((item: any) => {
                  const Icon = item.icon;
                  const isActive = item.tab && activeTab
                    ? item.tab === activeTab
                    : item.exact
                    ? pathname === item.href
                    : pathname === item.href || (item.href !== '/employer' && pathname.startsWith(item.href));

                  if (item.tab && onTabChange) {
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => onTabChange(item.tab)}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                          isActive
                            ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                            : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`} />
                        <span>{item.name}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        isActive
                          ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                          : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`} />
                      <span>{item.name}</span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* SISI KANAN: IDENTITAS PENGGUNA & KELUAR */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right border-l border-neutral-200 pl-4">
                <div className="text-xs font-bold text-neutral-900 truncate max-w-[180px]">
                  {userName}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 inline-block"></span>
                  <span className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold">
                    {userRole}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-300 transition-colors cursor-pointer"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* TOMBOL HAMBURGER MOBILE */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-700 hover:text-neutral-900 border border-neutral-300 bg-white"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MENU LIPAT RESPONSIVE UNTUK PONSEL / TABLET KECIL */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="p-3 bg-neutral-50 border border-neutral-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">{userName}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{userRole}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-700 font-bold uppercase flex items-center gap-1 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item: any) => {
                const Icon = item.icon;
                const isActive = item.tab && activeTab
                  ? item.tab === activeTab
                  : item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== '/employer' && pathname.startsWith(item.href));

                if (item.tab && onTabChange) {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onTabChange(item.tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left flex items-center justify-between p-2.5 text-xs font-semibold uppercase tracking-wider ${
                        isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-2.5 text-xs font-semibold uppercase tracking-wider ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. KONTEN UTAMA LEGA (FULL-WIDTH HORIZONTAL VIEWPORT)                      */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER RESMI (FLAT SWISS STYLE)                                        */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-neutral-300 py-6 text-[11px] text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 uppercase tracking-wider">
              MIMIKA TALENTA
            </span>
            <span>&bull;</span>
            <span>Platform Ketenagakerjaan Daerah Kabupaten Mimika</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span>Dinas Tenaga Kerja &amp; Transmigrasi Kab. Mimika</span>
            <span>&bull;</span>
            <span>Permenaker 18/2024 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
