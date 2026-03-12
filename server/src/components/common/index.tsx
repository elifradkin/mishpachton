import React from 'react';
import { t } from '../../i18n';
import { Loader2, AlertTriangle, WifiOff, Inbox } from 'lucide-react';

// --- Card ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-sage-100 shadow-sm transition-shadow duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// --- Stat Card ---
interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  className?: string;
}
export function StatCard({ label, value, subtitle, icon, color = 'text-sage-900', className = '' }: StatCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-sage-500 font-medium mb-1">{label}</p>
          <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-sage-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center text-sage-400 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// --- Section Header ---
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}
export function SectionHeader({ title, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2 className="font-display font-bold text-lg text-sage-800">{title}</h2>
      {action}
    </div>
  );
}

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}
export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const colors = {
    success: 'bg-sage-100 text-sage-700',
    warning: 'bg-brand-100 text-brand-700',
    danger: 'bg-rose-100 text-rose-500',
    info: 'bg-sky-100 text-sky-600',
    default: 'bg-sage-50 text-sage-500',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
}

// --- Loading State ---
export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-sage-400">
      <Loader2 size={32} className="animate-spin mb-3" />
      <p className="text-sm">{message || t('common.loading')}</p>
    </div>
  );
}

// --- Empty State ---
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-sage-400">
      {icon || <Inbox size={40} className="mb-3 opacity-50" />}
      <p className="font-medium text-sage-600 mb-1">{title}</p>
      {description && <p className="text-sm text-sage-400 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// --- Error State ---
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertTriangle size={40} className="text-brand-400 mb-3" />
      <p className="font-medium text-sage-700 mb-1">{title || t('common.error')}</p>
      {message && <p className="text-sm text-sage-400 mb-4">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary text-sm">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

// --- Stale Data Banner ---
export function StaleDataBanner() {
  return (
    <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-brand-700 text-sm mb-4">
      <AlertTriangle size={16} className="flex-shrink-0" />
      <span>{t('dashboard.staleWarning')}</span>
    </div>
  );
}

// --- Offline Banner ---
export function OfflineBanner() {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-rose-600 text-sm mb-4">
      <WifiOff size={16} className="flex-shrink-0" />
      <span>{t('errors.offlineMode')}</span>
    </div>
  );
}

// --- Tabs ---
interface TabsProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}
export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 p-1 bg-sage-50 rounded-lg ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
            activeTab === tab.key
              ? 'bg-white text-sage-800 shadow-sm'
              : 'text-sage-500 hover:text-sage-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// --- Progress Bar ---
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
  className?: string;
}
export function ProgressBar({ value, max, label, color = 'bg-brand-400', className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs text-sage-500 mb-1">
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className="w-full h-2 bg-sage-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// --- Mini Chart Sparkline (CSS-only) ---
interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
}
export function Sparkline({ values, color = '#d6802e', height = 32 }: SparklineProps) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="rounded-sm flex-1 min-w-[3px] transition-all duration-300"
          style={{
            height: `${((v - min) / range) * 80 + 20}%`,
            backgroundColor: color,
            opacity: 0.6 + ((v - min) / range) * 0.4,
          }}
        />
      ))}
    </div>
  );
}
