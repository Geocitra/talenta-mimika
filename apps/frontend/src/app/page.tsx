import Link from 'next/link';
import { ArrowRight, UserCheck, Building2, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between font-sans text-neutral-900">
      {/* Top Bar Minimalis */}
      <header className="h-16 bg-white border-b border-neutral-300 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-sm">MIMIKA TALENTA</span>
          <span className="text-[11px] uppercase tracking-widest text-neutral-600 border-l border-neutral-300 pl-3">
            Pemerintah Kabupaten Mimika
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="border border-neutral-300 hover:bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Masuk Akun
          </Link>
          <Link
            href="/register"
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Daftar Sekarang
          </Link>
        </div>
      </header>

      {/* Hero Section Bersih Tanpa Nested Box */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 py-16">
        <div className="border-b border-neutral-300 pb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-3 block">
            Integrated Workforce & AI Talent Sourcing
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight uppercase leading-tight text-neutral-900 max-w-3xl">
            Menghubungkan Talenta Lokal, Industri, & Masa Depan Mimika
          </h1>
          <p className="text-sm text-neutral-700 mt-4 max-w-2xl leading-relaxed">
            Platform manajemen ketenagakerjaan daerah dengan paradigma <strong>Reverse Recruitment</strong>. 
            Masyarakat pencari kerja cukup mendaftar profil kompetensi satu kali, dan biarkan industri berbasis tambang dan logistik yang aktif menjemput bola.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/register"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <span>Daftar Sebagai Talenta</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="border border-neutral-400 bg-white hover:bg-neutral-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <span>Portal Perusahaan</span>
            </Link>
          </div>
        </div>

        {/* 3 Pilar Sektor Kunci */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-300 pt-8">
          <div className="py-4 md:py-0 md:px-6 first:pl-0">
            <UserCheck className="w-5 h-5 text-neutral-800 mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Pencari Kerja Pasif</h3>
            <p className="text-xs text-neutral-600 leading-normal">
              Cukup upload CV, riwayat keahlian, dan Social DNA. Sistem langsung memetakan Anda ke radar pencarian perusahaan.
            </p>
          </div>

          <div className="py-4 md:py-0 md:px-6">
            <Building2 className="w-5 h-5 text-neutral-800 mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Industri Aktif Berburu</h3>
            <p className="text-xs text-neutral-600 leading-normal">
              Perusahaan terverifikasi NIB OSS merumuskan spesifikasi proyek untuk didekatkan langsung dengan talenta terbaik.
            </p>
          </div>

          <div className="py-4 md:py-0 md:px-6">
            <Cpu className="w-5 h-5 text-neutral-800 mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1">AI Matchmaking</h3>
            <p className="text-xs text-neutral-600 leading-normal">
              Analisis multi-faktor berbasis keahlian teknis, rekam jejak kerja, dan logika fuzzy penyetaraan pengalaman.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="h-12 bg-white border-t border-neutral-300 flex items-center justify-between px-6 lg:px-12 text-[11px] text-neutral-600">
        <div>&copy; 2026 Dinas Tenaga Kerja dan Transmigrasi Kabupaten Mimika</div>
        <div>Standar Regulasi Permenaker 18/2024</div>
      </footer>
    </div>
  );
}
