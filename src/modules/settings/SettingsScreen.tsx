import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { fetchSyncLog } from '../../layers/sync/apiClient';
import { Card, SectionHeader, Badge } from '../../components/common';
import { Settings, RefreshCw, Server, Clock, CheckCircle2, XCircle, Wifi, WifiOff, HardDrive } from 'lucide-react';

export function SettingsScreen() {
  const { triggerSync, isBackendOnline, lastFetchTime } = useDataStore();
  const syncState = useDataStore(s => s.getSyncState());
  const [syncing, setSyncing] = useState(false);
  const [log, setLog] = useState<any[]>([]);
  useEffect(() => { fetchSyncLog().then(setLog); }, []);
  const handleSync = async () => { setSyncing(true); await triggerSync(); const l = await fetchSyncLog(); setLog(l); setSyncing(false); };
  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-sage-900 mb-6">הגדרות ⚙️</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader title="סנכרון" />
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
              <div className="flex items-center gap-2">{isBackendOnline ? <Wifi size={16} className="text-sage-500" /> : <WifiOff size={16} className="text-rose-500" />}<span className="text-sm font-medium text-sage-700">סטטוס</span></div>
              <Badge variant={isBackendOnline ? 'success' : 'danger'}>{isBackendOnline ? 'מחובר' : 'לא מחובר'}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm"><span className="text-sage-500">עדכון אחרון</span><span className="text-sage-700">{lastFetchTime ? new Date(lastFetchTime).toLocaleString('he-IL') : 'טרם סונכרן'}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-sage-500">קבצים עודכנו</span><span className="text-sage-700">{syncState?.filesUpdated ?? '—'}</span></div>
            <button onClick={handleSync} disabled={syncing} className="btn btn-primary w-full"><RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />{syncing ? 'מסנכרן...' : 'סנכרן עכשיו'}</button>
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader title="חיבור שרת" />
          <div className="space-y-3">
            <div><label className="block text-xs text-sage-500 mb-1">שרת</label><div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg border border-sage-200"><Server size={14} className="text-sage-400" /><span className="text-sm text-sage-600 font-mono">5.78.70.179</span></div></div>
            <div><label className="block text-xs text-sage-500 mb-1">נתיב מרוחק</label><div className="px-3 py-2 bg-sage-50 rounded-lg border border-sage-200 text-sm text-sage-600 font-mono">/root/.openclaw/workspace-zohar/family-manager/data</div></div>
            <div><label className="block text-xs text-sage-500 mb-1">אימות</label><div className="px-3 py-2 bg-sage-50 rounded-lg border border-sage-200 text-sm text-sage-600">SSH Key (ed25519)</div></div>
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="יומן סנכרון" />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {log.length === 0 ? <p className="text-sm text-sage-400">אין רשומות עדיין</p> : log.map((entry: any, i: number) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${entry.level === 'error' ? 'bg-rose-50' : entry.level === 'warn' ? 'bg-brand-50' : 'bg-sage-50'}`}>
                {entry.level === 'error' ? <XCircle size={14} className="text-rose-500 mt-0.5" /> : <CheckCircle2 size={14} className="text-sage-500 mt-0.5" />}
                <div><p className="text-sage-700">{entry.message}</p><p className="text-sage-400 mt-0.5">{new Date(entry.timestamp).toLocaleString('he-IL')}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
