'use client';

import React from 'react';
import { ModernBadge } from '@/components/ui/ModernPrimitives';
import { MIMIKA_PRESETS } from './types';
import { MapPin, Navigation } from 'lucide-react';

interface EmployerStepGeospatialProps {
  address: string;
  setAddress: (val: string) => void;
  locationLat: number | '';
  setLocationLat: (val: number | '') => void;
  locationLng: number | '';
  setLocationLng: (val: number | '') => void;
  hasGps: boolean;
  onApplyPreset: (preset: { lat: number; lng: number; label: string }) => void;
  onGetLiveLocation: () => void;
}

export function EmployerStepGeospatial({
  address,
  setAddress,
  locationLat,
  setLocationLat,
  locationLng,
  setLocationLng,
  hasGps,
  onApplyPreset,
  onGetLiveLocation,
}: EmployerStepGeospatialProps) {
  return (
    <div className="step-transition space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-800">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-slate-900">
              03. Jangkar Geospasial Kantor Operasional Mimika
            </h3>
            <p className="text-xs text-slate-500">
              Titik koordinat GPS kantor sebagai acuan kalkulasi jarak radius talenta.
            </p>
          </div>
        </div>
        <ModernBadge variant="neutral" className="self-start sm:self-auto">
          Basis Jarak GIS Talenta
        </ModernBadge>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Alamat Lengkap Kantor Operasional / Site di Mimika <span className="text-rose-600">*</span>
        </label>
        <textarea
          rows={2}
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Contoh: Jl. Cenderawasih No. 88, Kuala Kencana, Mimika, Papua Tengah"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none leading-relaxed"
        />
        <p className="text-[11px] text-slate-500 mt-1.5">
          Alamat ini otomatis menjadi lokasi bawaan saat menerbitkan lowongan pekerjaan atau panggilan wawancara.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Titik Garis Lintang (Latitude) <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            step="any"
            required
            value={locationLat}
            onChange={(e) => setLocationLat(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Contoh: -4.5445"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Titik Garis Bujur (Longitude) <span className="text-rose-600">*</span>
          </label>
          <input
            type="number"
            step="any"
            required
            value={locationLng}
            onChange={(e) => setLocationLng(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Contoh: 136.8872"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all outline-none"
          />
        </div>
      </div>

      {/* QUICK PRESET BUTTONS */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Pilih Cepat Koordinat Wilayah Mimika:
          </span>
          {hasGps && (
            <ModernBadge variant="success">GPS Terkunci</ModernBadge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MIMIKA_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onApplyPreset(p)}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{p.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onGetLiveLocation}
            className="rounded-xl border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Deteksi GPS Perangkat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
