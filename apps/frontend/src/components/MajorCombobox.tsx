'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Sparkles, Check, ChevronDown, Search, Loader2, Edit3 } from 'lucide-react';
import { NormalizeMajorResultDto } from '@mimika-talenta/shared-types';

export interface MajorComboboxValue {
  major: string;
  rawMajorInput?: string;
  isAiNormalized?: boolean;
  aiConfidence?: number;
}

interface MajorComboboxProps {
  value: string;
  rawInput?: string;
  onChange: (val: MajorComboboxValue) => void;
  placeholder?: string;
  className?: string;
}

export function MajorCombobox({
  value,
  rawInput = '',
  onChange,
  placeholder = 'Pilih atau ketik jurusan...',
  className = '',
}: MajorComboboxProps) {
  const [selectedMajor, setSelectedMajor] = useState(value);
  const [inputText, setInputText] = useState(value || rawInput);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<NormalizeMajorResultDto | null>(null);
  const [isNormalizing, setIsNormalizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi jika value berubah dari luar
  useEffect(() => {
    setSelectedMajor(value);
    if (!isCustomMode) {
      setInputText(value);
    }
  }, [value, isCustomMode]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch autocomplete suggestions dari master database
  useEffect(() => {
    if (isCustomMode) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const q = encodeURIComponent(inputText.trim());
        const res = await apiFetch<any>(`/majors/search?q=${q}`);
        if (res.status === 'success' && Array.isArray(res.data)) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.error('Gagal mengambil saran jurusan:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [inputText, isCustomMode]);

  // Debounced AI Normalization saat di Custom Mode atau saat mengetik
  useEffect(() => {
    if (!inputText || inputText.trim().length < 3) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsNormalizing(true);
      try {
        const res = await apiFetch<NormalizeMajorResultDto>('/majors/normalize', {
          method: 'POST',
          body: JSON.stringify({ rawInput: inputText.trim() }),
        });

        const rawRes: any = res;
        const data: NormalizeMajorResultDto = rawRes.data || rawRes;
        if (data && data.hasCorrection && data.suggestedCanonical && data.suggestedCanonical !== inputText) {
          setAiSuggestion(data);
        } else {
          setAiSuggestion(null);
        }
      } catch (err) {
        console.error('Error normalizing major:', err);
      } finally {
        setIsNormalizing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText]);

  const handleSelectCanonical = (name: string) => {
    setSelectedMajor(name);
    setInputText(name);
    setIsCustomMode(false);
    setIsOpen(false);
    setAiSuggestion(null);
    onChange({
      major: name,
      rawMajorInput: isCustomMode ? inputText : undefined,
      isAiNormalized: false,
    });
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion?.suggestedCanonical) return;
    const cleanMajor = aiSuggestion.suggestedCanonical;
    setSelectedMajor(cleanMajor);
    setInputText(cleanMajor);
    setIsCustomMode(false);
    onChange({
      major: cleanMajor,
      rawMajorInput: inputText,
      isAiNormalized: true,
      aiConfidence: aiSuggestion.confidence,
    });
    setAiSuggestion(null);
  };

  const handleCustomInputCommit = (val: string) => {
    setInputText(val);
    setSelectedMajor(val);
    onChange({
      major: val,
      rawMajorInput: val,
      isAiNormalized: false,
    });
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            const val = e.target.value;
            setInputText(val);
            if (!isOpen && !isCustomMode) setIsOpen(true);
            if (isCustomMode) {
              handleCustomInputCommit(val);
            }
          }}
          onFocus={() => {
            if (!isCustomMode) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full border border-neutral-300 px-3 py-2 pr-16 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white font-medium"
        />

        <div className="absolute right-2 flex items-center gap-1.5 text-neutral-400">
          {isNormalizing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />
          ) : isCustomMode ? (
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                setIsOpen(true);
              }}
              title="Kembali ke Daftar Resmi"
              className="text-[10px] text-neutral-500 hover:text-black font-bold uppercase tracking-wider"
            >
              List
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:text-neutral-900"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Popover Dropdown Saran Resmi Master Taksonomi */}
      {isOpen && !isCustomMode && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-900 shadow-xl max-h-60 overflow-y-auto rounded-none divide-y divide-neutral-100">
          <div className="px-3 py-1.5 bg-neutral-100 border-b border-neutral-200 flex justify-between items-center text-[10px] text-neutral-600 font-semibold tracking-wider uppercase">
            <span>Taksonomi Jurusan Resmi Mimika</span>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-neutral-500" />}
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectCanonical(m.name)}
                className="w-full text-left px-3 py-2 text-xs text-neutral-900 hover:bg-neutral-100 flex items-center justify-between group transition-colors"
              >
                <span className="font-semibold">{m.name}</span>
                <span className="text-[9px] font-mono uppercase text-neutral-400 group-hover:text-neutral-700">
                  {m.category.replace(/_/g, ' ')}
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-xs text-neutral-500 italic text-center">
              Tidak ada jurusan yang cocok persis.
            </div>
          )}

          {/* Opsi Custom: Sebutkan Sesuai Ijazah */}
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(true);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 bg-neutral-50 hover:bg-neutral-200 text-xs font-bold text-neutral-800 flex items-center gap-2 border-t border-neutral-300"
          >
            <Edit3 className="w-3.5 h-3.5 text-neutral-700" />
            <span>Jurusan Lainnya (Ketik Manual Sesuai Ijazah)</span>
          </button>
        </div>
      )}

      {/* AI Suggestion Hint Banner (Self-Healing In-Flight Alert) */}
      {aiSuggestion && aiSuggestion.suggestedCanonical && (
        <div className="mt-1.5 p-2.5 bg-neutral-900 text-white border border-neutral-900 flex items-start justify-between gap-3 text-xs shadow-md animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-neutral-300">
                Sistem mendeteksi format/kesalahan ketik. Maksud Anda:
              </p>
              <p className="font-bold text-white text-xs mt-0.5">
                &ldquo;{aiSuggestion.suggestedCanonical}&rdquo;
                {aiSuggestion.category && (
                  <span className="ml-1.5 text-[9px] text-amber-300 uppercase tracking-widest font-normal">
                    ({aiSuggestion.category.replace(/_/g, ' ')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleApplyAiSuggestion}
              className="px-2.5 py-1 bg-white text-neutral-900 text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
            >
              Gunakan Saran Ini
            </button>
            <button
              type="button"
              onClick={() => setAiSuggestion(null)}
              className="px-1.5 py-1 text-neutral-400 hover:text-white text-[11px]"
              title="Abaikan"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
