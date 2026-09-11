'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertModalProps {
  isOpen: boolean;
  type?: AlertType;
  title?: string;
  message: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function useAlertModal() {
  const [config, setConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title?: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    confirmText?: string,
    onConfirm?: () => void,
  ) => {
    setConfig({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    alertProps: {
      ...config,
      onClose: closeAlert,
    },
    showAlert,
    closeAlert,
  };
}

export function AlertModal({
  isOpen,
  type = 'success',
  title,
  message,
  confirmText = 'Mengerti',
  onClose,
  onConfirm,
}: AlertModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'Enter' && isOpen) {
        if (onConfirm) onConfirm();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getStyleConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-emerald-600" />,
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          defaultTitle: 'Berhasil Disimpan',
          buttonBg: 'bg-neutral-900 hover:bg-neutral-800 text-white',
          ringColor: 'bg-emerald-50 border-emerald-200',
        };
      case 'error':
        return {
          icon: <XCircle className="w-12 h-12 text-rose-600" />,
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          defaultTitle: 'Terjadi Kesalahan',
          buttonBg: 'bg-rose-700 hover:bg-rose-800 text-white',
          ringColor: 'bg-rose-50 border-rose-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-600" />,
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          defaultTitle: 'Peringatan Sistem',
          buttonBg: 'bg-neutral-900 hover:bg-neutral-800 text-white',
          ringColor: 'bg-amber-50 border-amber-200',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-12 h-12 text-blue-600" />,
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          defaultTitle: 'Informasi',
          buttonBg: 'bg-neutral-900 hover:bg-neutral-800 text-white',
          ringColor: 'bg-blue-50 border-blue-200',
        };
    }
  };

  const config = getStyleConfig();
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-neutral-900 w-full max-w-md p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Animated Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${config.ringColor} shadow-inner`}>
            {config.icon}
          </div>
        </div>

        {/* Title & Badge */}
        <div className="space-y-1.5">
          <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 border ${config.badgeBg}`}>
            {type.toUpperCase()}
          </span>
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-neutral-900">
            {displayTitle}
          </h3>
        </div>

        {/* Detailed Message */}
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
          {message}
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className={`w-full ${config.buttonBg} py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer`}
          >
            <span>{confirmText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
