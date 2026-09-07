'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Search, Loader2, Building, GraduationCap, School } from 'lucide-react';

export interface InstitutionItem {
  id: string;
  name: string;
  shortName?: string | null;
  category: 'KAMPUS' | 'SMA' | 'SMK';
  status?: string | null;
  provinceName?: string | null;
  regencyName?: string | null;
}

interface InstitutionAutocompleteProps {
  value: string;
  onChange: (value: string, item?: InstitutionItem) => void;
  category?: 'KAMPUS' | 'SMA' | 'SMK';
  placeholder?: string;
  className?: string;
}

export function InstitutionAutocomplete({
  value,
  onChange,
  category,
  placeholder = 'Ketik nama sekolah / perguruan tinggi...',
  className = '',
}: InstitutionAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<InstitutionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi jika nilai value prop berubah dari luar
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener untuk menutup popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const catParam = category ? `&category=${category}` : '';
        const res = await apiFetch<InstitutionItem[]>(
          `/institutions/search?q=${encodeURIComponent(query.trim())}${catParam}`,
        );
        if (res.status === 'success' && Array.isArray(res.data)) {
          setResults(res.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Gagal mencari institusi:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, category]);

  const handleSelect = (item: InstitutionItem) => {
    setQuery(item.name);
    onChange(item.name, item);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!isOpen && val.length >= 2) {
      setIsOpen(true);
    }
  };

  const getCategoryBadge = (cat: 'KAMPUS' | 'SMA' | 'SMK') => {
    switch (cat) {
      case 'KAMPUS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-neutral-900 text-white">
            <GraduationCap className="w-2.5 h-2.5" /> Kampus
          </span>
        );
      case 'SMK':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-neutral-200 text-neutral-800 border border-neutral-300">
            <Building className="w-2.5 h-2.5" /> SMK
          </span>
        );
      case 'SMA':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-neutral-100 text-neutral-700 border border-neutral-300">
            <School className="w-2.5 h-2.5" /> SMA
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
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

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-900 shadow-xl max-h-64 overflow-y-auto rounded-none">
          <div className="px-3 py-1.5 bg-neutral-100 border-b border-neutral-200 flex justify-between items-center text-[10px] text-neutral-600 font-semibold tracking-wider uppercase">
            <span>Saran Institusi Nasional & Daerah</span>
            {results.length > 0 && <span>{results.length} ditemukan</span>}
          </div>

          {results.length === 0 ? (
            <div className="p-3 text-center">
              <p className="text-xs text-neutral-600">Institusi tidak ditemukan di database referensi.</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Tetap menggunakan nama: <span className="font-semibold text-neutral-900">&quot;{query}&quot;</span>
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Gunakan Nama Ini
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-neutral-100 transition-colors flex flex-col gap-0.5 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-900 group-hover:text-black">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.shortName && (
                        <span className="text-[10px] font-mono text-neutral-500 font-bold">
                          {item.shortName}
                        </span>
                      )}
                      {getCategoryBadge(item.category)}
                    </div>
                  </div>
                  {(item.regencyName || item.provinceName) && (
                    <div className="text-[10px] text-neutral-500 tracking-wide uppercase">
                      {[item.regencyName, item.provinceName].filter(Boolean).join(', ')}
                      {item.status ? ` • ${item.status}` : ''}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
