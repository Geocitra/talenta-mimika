'use client';

import React from 'react';
import { ModernBadge, ModernButton } from '@/components/ui/ModernPrimitives';
import { StepItem } from './types';
import { Check, Save } from 'lucide-react';

interface EmployerProfileStepperProps {
  steps: StepItem[];
  currentStep: number;
  completedCount: number;
  progressPercentage: number;
  onStepClick: (stepId: number) => void;
  onQuickSave: () => void;
  saving?: boolean;
}

export function EmployerProfileStepper({
  steps,
  currentStep,
  completedCount,
  progressPercentage,
  onStepClick,
  onQuickSave,
  saving = false,
}: EmployerProfileStepperProps) {
  const activeStep = steps[currentStep - 1] || steps[0];

  return (
    <div className="space-y-4">
      {/* Stepper Header Status Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-300 rounded-full border border-slate-700">
              Tahap 0{currentStep} dari 0{steps.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              • Formulir Profiling Korporat
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {activeStep.title}
          </h2>
          <p className="text-xs text-slate-300/90 leading-relaxed max-w-2xl">
            {activeStep.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Kemajuan Profil</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {completedCount} dari {steps.length} Tahap Lengkap ({progressPercentage}%)
            </div>
          </div>
          <ModernButton
            type="button"
            onClick={onQuickSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2"
            title="Simpan perubahan langsung"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </ModernButton>
        </div>
      </div>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-slate-900 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Interactive Stepper Indicator Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.isComplete();
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 ring-1 ring-slate-900/5'
                  : 'hover:bg-white/70 text-slate-600 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  0{step.id}
                </span>
                {isCompleted ? (
                  <ModernBadge variant="success" className="text-[10px] px-2 py-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Terisi
                  </ModernBadge>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <div>
                <h3 className={`text-xs font-bold tracking-tight block ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                  {step.shortTitle}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {step.caption}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
