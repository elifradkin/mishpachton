import React from 'react';
import { t } from '../../i18n';
import { formatHebrewDateTime, formatRelativeTime } from '../../utils';
import { SyncRepository } from '../../layers/data-access/repositories';
import { useAppStore } from '../../hooks/useAppStore';
import { Card, SectionHeader, Badge } from '../../components/common';
import {
  Settings, RefreshCw, Server, Key, FolderOpen, Clock, AlertTriangle, CheckCircle2,
  XCircle, Wifi, WifiOff, HardDrive, Globe, ToggleLeft, ToggleRight
} from 'lucide-react';

export function SettingsScreen() {
  const { syncStatus, lastSyncTime, isAutoSyncEnabled, toggleAutoSync, triggerSync } = useAppStore();
  const syncLog = SyncRepository.getLog();

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">{t('settings.title')}</h1>
        <p className="text-sage-500 text-sm mt-0.5">{t('settings.sync')} ו{t('settings.cache')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Status */}
        <Card className="p-5">
          <SectionHeader title={t('settings.sync')} />
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
              <div className="flex items-center gap-2">
                {syncStatus === 'syncing' ? (
                  <RefreshCw size={16} className="animate-spin text-sky-500" />
                ) : syncStatus === 'success' ? (
                  <Wifi size={16} className="text-sage-500" />
                ) : syncStatus === 'error' ? (
                  <WifiOff size={16} className="text-rose-500" />
                ) : (
                  <AlertTriangle size={16} className="text-brand-500" />
                )}
                <span className="text-sm font-medium text-sage-700">{t('settings.status')}</span>
              </div>
              <Badge variant={
                syncStatus === 'success' ? 'success' :
                syncStatus === 'syncing' ? 'info' :
                syncStatus === 'error' ? 'danger' : 'warning'
              }>
                {t(`sync.${syncStatus}`)}
              </Badge>
            </div>

            {/* Last Sync */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-500">{t('settings.lastSync')}</span>
              <span className="text-sage-700">{lastSyncTime ? formatRelativeTime(lastSyncTime) : t('sync.never')}</span>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-sage-700">{t('settings.autoSync')}</span>
              <button
                onClick={toggleAutoSync}
                className="flex items-center gap-1 text-sage-500 hover:text-sage-700 transition-colors"
              >
                {isAutoSyncEnabled ? (
                  <ToggleRight size={28} className="text-brand-500" />
                ) : (
                  <ToggleLeft size={28} className="text-sage-300" />
                )}
              </button>
            </div>

            {/* Sync Now Button */}
            <button
              onClick={triggerSync}
              disabled={syncStatus === 'syncing'}
              className="btn btn-primary w-full"
            >
              <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              {syncStatus === 'syncing' ? t('sync.syncing') : t('settings.syncNow')}
            </button>
          </div>
        </Card>

        {/* Connection Config (Scaffold) */}
        <Card className="p-5">
          <SectionHeader title={t('settings.syncConfig')} />
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-sage-500 mb-1">{t('settings.host')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg border border-sage-200">
                <Server size={14} className="text-sage-400" />
                <span className="text-sm text-sage-600 font-mono">192.168.1.100</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-sage-500 mb-1">{t('settings.port')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg border border-sage-200">
                <span className="text-sm text-sage-600 font-mono">22</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-sage-500 mb-1">{t('settings.username')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg border border-sage-200">
                <Key size={14} className="text-sage-400" />
                <span className="text-sm text-sage-600 font-mono">family-sync</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-sage-500 mb-1">{t('settings.remotePath')}</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg border border-sage-200">
                <FolderOpen size={14} className="text-sage-400" />
                <span className="text-sm text-sage-600 font-mono">/data</span>
              </div>
            </div>
            <p className="text-xs text-sage-400 mt-2">
              הגדרות חיבור מוגדרות דרך משתני סביבה. לשינוי — עדכן את קובץ ה-.env
            </p>
          </div>
        </Card>

        {/* Cache Health */}
        <Card className="p-5">
          <SectionHeader title={t('settings.cacheHealth')} />
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-500">{t('settings.cacheVersion')}</span>
              <span className="text-sage-700 font-mono text-xs">v1.0.2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-500">קבצים במטמון</span>
              <span className="text-sage-700">24 קבצים</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-500">גודל מטמון</span>
              <span className="text-sage-700">1.2 MB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-500">Snapshot אחרון</span>
              <span className="text-sage-700">{lastSyncTime ? formatRelativeTime(lastSyncTime) : '—'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-sage-50 rounded-lg">
              <HardDrive size={14} className="text-sage-400" />
              <span className="text-xs text-sage-500">מטמון תקין — last known good snapshot שמור</span>
            </div>
          </div>
        </Card>

        {/* Sync Log */}
        <Card className="p-5">
          <SectionHeader title={t('settings.syncLog')} />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {syncLog.map((entry, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                entry.status === 'error' ? 'bg-rose-50' :
                entry.status === 'warning' ? 'bg-brand-50' :
                'bg-sage-50'
              }`}>
                {entry.status === 'success' ? (
                  <CheckCircle2 size={14} className="text-sage-500 mt-0.5 flex-shrink-0" />
                ) : entry.status === 'error' ? (
                  <XCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sage-700">{entry.message}</p>
                  <p className="text-sage-400 mt-0.5">{formatHebrewDateTime(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Future: Localization */}
      <Card className="p-5 mt-6">
        <SectionHeader title="שפה ולוקליזציה" />
        <div className="flex items-center gap-3">
          <Globe size={16} className="text-sage-400" />
          <span className="text-sm text-sage-600">עברית (ברירת מחדל)</span>
          <Badge>פעיל</Badge>
        </div>
        <p className="text-xs text-sage-400 mt-2">
          תמיכה באנגלית מתוכננת לגרסה עתידית. הארכיטקטורה תומכת ב-i18n עם מילוני שפה נפרדים.
        </p>
      </Card>
    </div>
  );
}
