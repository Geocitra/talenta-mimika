'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, Phone, Mail } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/90 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-20 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-xs">
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">MIMIKA TALENTA</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Platform resmi Dinas Tenaga Kerja &amp; Transmigrasi Kabupaten Mimika untuk integrasi Reverse Recruitment dan afirmasi tenaga kerja lokal.
            </p>
          </div>

          {/* Kantor Layanan */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Kantor Layanan</h4>
            <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Jl. Cenderawasih KM. 3.5, Timika, Papua Tengah 99910</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>(0901) 321-456 • Disnaker Mimika</span>
              </div>
            </div>
          </div>

          {/* Navigasi Portal */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Akses Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <Link href="/register/employer" className="hover:text-slate-900 transition-colors">
                  Registrasi Perusahaan (Pasang Lowongan)
                </Link>
              </li>
              <li>
                <Link href="/register/talent" className="hover:text-slate-900 transition-colors">
                  Registrasi Talenta (Siap Dijemput)
                </Link>
              </li>
              <li>
                <Link href="/register/provider" className="hover:text-slate-900 transition-colors">
                  Registrasi Balai Latihan Kerja (LPK/BLK)
                </Link>
              </li>
            </ul>
          </div>

          {/* Dasar Regulasi */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Landasan Hukum</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• UU No. 13 Tahun 2003 tentang Ketenagakerjaan</li>
              <li>• Permenaker No. 18 Tahun 2024</li>
              <li>• Perda Perlindungan Tenaga Kerja Lokal Kab. Mimika</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; 2026 Pemerintah Kabupaten Mimika. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-6">
            <span>Privasi &amp; Keamanan</span>
            <span>Standar Data Ketenagakerjaan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
