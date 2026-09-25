import React, { forwardRef } from 'react';

// ==========================================
// ModernCard
// ==========================================
export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModernCard.displayName = 'ModernCard';

// ==========================================
// ModernBadge
// ==========================================
export type ModernBadgeVariant = 'success' | 'info' | 'neutral' | 'warning';

export interface ModernBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ModernBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const badgeVariantStyles: Record<ModernBadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
};

export const ModernBadge = forwardRef<HTMLSpanElement, ModernBadgeProps>(
  ({ variant = 'neutral', children, className = '', ...props }, ref) => {
    const variantStyle = badgeVariantStyles[variant] || badgeVariantStyles.neutral;
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyle} ${className}`.trim()}
        {...props}
      >
        {children}
      </span>
    );
  }
);

ModernBadge.displayName = 'ModernBadge';

// ==========================================
// ModernButton
// ==========================================
export type ModernButtonVariant = 'primary' | 'outline';

export interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ModernButtonVariant;
  children?: React.ReactNode;
  className?: string;
}

const buttonVariantStyles: Record<ModernButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-800',
};

export const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ variant = 'primary', type = 'button', children, className = '', ...props }, ref) => {
    const variantStyle = buttonVariantStyles[variant] || buttonVariantStyles.primary;
    return (
      <button
        ref={ref}
        type={type}
        className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${variantStyle} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ModernButton.displayName = 'ModernButton';
