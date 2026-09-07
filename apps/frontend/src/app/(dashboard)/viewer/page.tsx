'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  FileText,
  ExternalLink,
  Maximize2,
  Minimize2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

function PDFViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pdfUrl = searchParams.get('url') || '';
  const docName = searchParams.get('name') || 'Dokumen PDF';
  const issuer = searchParams.get('issuer') || '';
  const talentName = searchParams.get('talent') || '';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Keyboard shortcut: Escape to exit fullscreen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
        <div className="bg-white border-2 border-neutral-900 p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto" />
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Tidak Ada Dokumen
          </h1>
          <p className="text-xs text-neutral-600">
            URL dokumen PDF tidak ditemukan. Silakan kembali ke halaman sebelumnya.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl, { credentials: 'include' });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${docName.replace(/[^a-zA-Z0-9_\- ]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className={`flex flex-col bg-neutral-100 ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Back + Doc Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-neutral-800 transition-colors shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <h1 className="text-xs font-bold uppercase tracking-wider truncate">
                  {docName}
                </h1>
              </div>
              {(issuer || talentName) && (
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {issuer && <span>Penerbit: {issuer}</span>}
                  {issuer && talentName && <span> &bull; </span>}
                  {talentName && <span>Milik: {talentName}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}
              </span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase transition-colors"
              title="Buka di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tab Baru</span>
            </a>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-900 text-[10px] font-bold uppercase transition-colors"
              title="Unduh File PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Badge Bar */}
      <div className="bg-white border-b border-neutral-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-neutral-700">
            Dokumen resmi yang diunggah langsung oleh pemilik profil ke sistem <strong>Mimika Talenta</strong>.
            Keaslian file belum diverifikasi secara independen.
          </span>
        </div>
      </div>

      {/* PDF Embed Area */}
      <div className="flex-1 relative">
        {loadError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 p-6">
            <div className="bg-white border-2 border-neutral-900 p-8 max-w-md w-full text-center space-y-4">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Gagal Memuat Dokumen
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Browser tidak dapat menampilkan PDF di dalam halaman.
                Gunakan tombol di bawah untuk membuka file langsung.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase hover:bg-neutral-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka PDF
                </a>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-neutral-900 text-xs font-bold uppercase hover:bg-amber-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh PDF
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 96px)' : 'calc(100vh - 140px)' }}
            title={`Pratinjau: ${docName}`}
            onError={() => setLoadError(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-600 animate-pulse">
            Memuat Pratinjau Dokumen...
          </div>
        </div>
      }
    >
      <PDFViewerContent />
    </Suspense>
  );
}
