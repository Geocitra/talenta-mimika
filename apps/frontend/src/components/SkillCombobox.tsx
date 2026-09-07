'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Search, Loader2, Plus, Sparkles, Check } from 'lucide-react';
import { MasterSkillDto } from '@mimika-talenta/shared-types';

interface SkillComboboxProps {
  value: string;
  onChange: (skillName: string) => void;
  placeholder?: string;
  className?: string;
}

export function SkillCombobox({
  value,
  onChange,
  placeholder = 'Ketik keahlian (cth: Fullstack, Las 3G, Operator Excavator)...',
  className = '',
}: SkillComboboxProps) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<MasterSkillDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch<MasterSkillDto[]>(
          `/skills/search?q=${encodeURIComponent(query.trim())}`,
        );
        const raw: any = res;
        const data = raw.data || raw;
        if (Array.isArray(data)) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Gagal memuat master keahlian:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (skillName: string) => {
    setQuery(skillName);
    onChange(skillName);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!isOpen && val.length >= 1) {
      setIsOpen(true);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'DIGITAL_IT':
        return { label: 'IT & SOFTWARE', bg: 'bg-blue-50 text-blue-900 border-blue-200' };
      case 'TAMBANG_ALAT_BERAT':
        return { label: 'TAMBANG & ALAT BERAT', bg: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'WELDING_FABRIKASI':
        return { label: 'PENGELASAN & PABRIKASI', bg: 'bg-orange-50 text-orange-900 border-orange-200' };
      case 'ELEKTRIKAL':
        return { label: 'KELISTRIKAN', bg: 'bg-yellow-50 text-yellow-900 border-yellow-200' };
      case 'K3_SAFETY':
        return { label: 'K3 & KESELAMATAN', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
      case 'LOGISTIK_ADMIN':
        return { label: 'LOGISTIK & BISNIS', bg: 'bg-purple-50 text-purple-900 border-purple-200' };
      default:
        return { label: category, bg: 'bg-neutral-100 text-neutral-800 border-neutral-300' };
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (query.trim().length >= 1) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full border border-neutral-300 px-3 py-2 pr-8 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white ${className}`}
        />
        <div className="absolute right-2.5 flex items-center pointer-events-none text-neutral-400">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />
          ) : (
            <Search className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </div>
      </div>

      {isOpen && query.trim().length >= 1 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-900 shadow-xl max-h-60 overflow-y-auto rounded-none divide-y divide-neutral-100">
          <div className="px-3 py-1.5 bg-neutral-100 border-b border-neutral-200 flex justify-between items-center text-[10px] text-neutral-600 font-semibold tracking-wider uppercase">
            <span>Katalog Master Keahlian Industri</span>
            {results.length > 0 && <span>{results.length} rekomendasi</span>}
          </div>

          {results.length > 0 ? (
            results.map((item) => {
              const catBadge = getCategoryLabel(item.category);
              const isSelected = item.name.toLowerCase() === query.trim().toLowerCase();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.name)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 transition-colors flex items-center justify-between group ${
                    isSelected ? 'bg-neutral-50 font-bold' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-neutral-900 group-hover:text-black">{item.name}</span>
                    {item.description && (
                      <span className="text-[10px] text-neutral-500 line-clamp-1">{item.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase tracking-wider ${catBadge.bg}`}>
                      {catBadge.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center">
              <p className="text-xs text-neutral-600">Keahlian spesifik belum terdaftar di Master Katalog.</p>
              <button
                type="button"
                onClick={() => handleSelect(query.trim())}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <Plus className="w-3 h-3" /> Gunakan &quot;{query}&quot; Sebagai Keahlian Khusus
              </button>
            </div>
          )}

          {/* Opsi Custom jika query belum persis sama dengan salah satu hasil */}
          {results.length > 0 && !results.some((r) => r.name.toLowerCase() === query.trim().toLowerCase()) && (
            <div className="p-2 bg-neutral-50 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => handleSelect(query.trim())}
                className="w-full text-left text-[11px] text-neutral-700 hover:text-neutral-900 flex items-center gap-1.5 font-medium"
              >
                <Sparkles className="w-3 h-3 text-neutral-500" />
                <span>Gunakan nama kustom: <strong className="text-neutral-900">&quot;{query}&quot;</strong></span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
