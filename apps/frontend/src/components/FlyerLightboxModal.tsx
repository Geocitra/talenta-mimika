'use client';

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, ExternalLink, Sparkles } from 'lucide-react';

interface FlyerLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  providerName?: string;
}

export default function FlyerLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  providerName,
}: FlyerLightboxModalProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.75, prev - 0.25));
  const handleReset = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Bar: Title & Controls */}
      <div className="flex items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 px-5 py-3 text-white max-w-7xl mx-auto w-full">
        <div className="space-y-0.5 truncate">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500 text-neutral-950 uppercase tracking-wider">
              Brosur & Poster Resmi
            </span>
            <span className="text-xs text-neutral-400 font-mono truncate hidden sm:inline">
              {providerName || 'Disnakertrans Kab. Mimika'}
            </span>
          </div>
          <h2 className="text-sm font-bold uppercase truncate font-sans text-neutral-100">
            {title}
          </h2>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-neutral-800 border border-neutral-700 p-1 space-x-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-neutral-300 font-bold select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Ukuran"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <a
            href={imageUrl}
            download={`${title.replace(/\s+/g, '-').toLowerCase()}-flyer.jpg`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-mono"
            title="Buka Tab Baru / Unduh"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Unduh</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-neutral-800 hover:bg-rose-600 border border-neutral-700 text-white transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewing Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-2 my-2 select-none">
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[82vh] max-w-[95vw] object-contain border-2 border-neutral-800 shadow-2xl bg-neutral-900"
          />
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="max-w-7xl mx-auto w-full text-center py-2 text-[11px] font-mono text-neutral-400">
        Gunakan tombol pembesar atau scroll untuk memeriksa detail brosur & jadwal pelatihan. Tekan{' '}
        <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[10px]">
          ESC
        </kbd>{' '}
        untuk kembali.
      </div>
    </div>
  );
}
