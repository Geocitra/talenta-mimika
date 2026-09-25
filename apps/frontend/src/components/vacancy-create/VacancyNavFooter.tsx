'use client';

import React from 'react';
import { ModernButton } from '@/components/ui/ModernPrimitives';
import { ArrowLeft, ArrowRight, Info, Send } from 'lucide-react';

interface VacancyNavFooterProps {
  currentStep: number;
  totalSteps: number;
  prevStepTitle: string;
  nextStepTitle: string;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  submitting?: boolean;
}

export function VacancyNavFooter({
  currentStep,
  totalSteps,
  prevStepTitle,
  nextStepTitle,
  onPrev,
  onNext,
  onSaveDraft,
  submitting = false,
}: VacancyNavFooterProps) {
  return (
    <div className="sticky bottom-4 z-20 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="w-full sm:w-auto flex items-center gap-2">
        {currentStep > 1 ? (
          <ModernButton
            type="button"
            variant="outline"
            onClick={onPrev}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali: {prevStepTitle}</span>
          </ModernButton>
        ) : (
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 hidden sm:flex">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Tahap 01: Detail Posisi &amp; Hubungan Kerja</span>
          </div>
        )}
      </div>

      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
        {currentStep < totalSteps ? (
          <>
            <button
              type="button"
              onClick={onSaveDraft}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Simpan Draf
            </button>
            <ModernButton
              type="button"
              variant="primary"
              onClick={onNext}
              className="w-full sm:w-auto"
            >
              <span>Lanjut: {nextStepTitle}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </ModernButton>
          </>
        ) : (
          <ModernButton
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Menerbitkan...' : 'Terbitkan & Buka Radar Kandidat AI'}</span>
          </ModernButton>
        )}
      </div>
    </div>
  );
}
