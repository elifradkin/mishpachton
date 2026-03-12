import React, { useState } from 'react';
import { t } from '../../i18n';
import { formatRelativeTime, formatDuration, formatHebrewTime, formatHebrewDateTime, formatShortDate } from '../../utils';
import { FeedingsRepository, SleepsRepository, DiapersRepository, HealthRepository, MedicationsRepository, ChartsRepository } from '../../layers/data-access/repositories';
import { Card, StatCard, SectionHeader, Badge, Tabs, EmptyState, Sparkline, ProgressBar } from '../../components/common';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Baby, Moon, Droplets, Activity, Pill, TrendingUp, Scale } from 'lucide-react';

const COLORS = {
  feeding: '#d6802e',
  sleep: '#4b96e9',
  diaper: '#577d55',
  health: '#ea5c5c',
  medication: '#9dcdf6',
};

const subTabs = [
  { key: 'feeding', label: t('baby.feeding') },
  { key: 'sleep', label: t('baby.sleep') },
  { key: 'diapers', label: t('baby.diapers') },
  { key: 'health', label: t('baby.health') },
  { key: 'medications', label: t('baby.medications') },
];

export function BabyScreen() {
  const [activeTab, setActiveTab] = useState('feeding');

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-sage-900">{t('baby.title')} — נועם 👶</h1>
          <p className="text-sage-500 text-sm mt-0.5">בן 45 ימים</p>
        </div>
      </div>

      <Tabs tabs={subTabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {activeTab === 'feeding' && <FeedingTab />}
      {activeTab === 'sleep' && <SleepTab />}
      {activeTab === 'diapers' && <DiaperTab />}
      {activeTab === 'health' && <HealthTab />}
      {activeTab === 'medications' && <MedicationsTab />}
    </div>
  );
}

function FeedingTab() {
  const feedings = FeedingsRepository.getAll();
  const lastFeeding = FeedingsRepository.getLast();
  const chartData = ChartsRepository.getFeedingDaily();
  const todayCount = feedings.length;
  const totalMinutes = feedings.reduce((sum, f) => sum + (f.durationMinutes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('baby.lastFeed')}
          value={lastFeeding ? formatRelativeTime(lastFeeding.startTime) : '—'}
          subtitle={lastFeeding ? t(`baby.feedingType.${lastFeeding.type}`) : undefined}
          icon={<Baby size={20} />}
          color="text-brand-600"
        />
        <StatCard label={t('baby.totalToday')} value={todayCount} subtitle={`${t('baby.feedings')}`} color="text-brand-500" />
        <StatCard label="זמן כולל" value={formatDuration(totalMinutes)} color="text-sage-700" />
        <StatCard label="כמות (מ״ל)" value={`${feedings.reduce((s, f) => s + (f.amountMl || 0), 0)} ${t('baby.ml')}`} color="text-sage-700" />
      </div>

      {/* Chart */}
      <Card className="p-5">
        <SectionHeader title={t('analytics.feedingTrend')} />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
              <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
              <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }}
                labelFormatter={(l) => formatShortDate(l)}
              />
              <Bar dataKey="value" fill={COLORS.feeding} radius={[4, 4, 0, 0]} name="האכלות" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Timeline */}
      <div>
        <SectionHeader title={`${t('baby.feedings')} — היום`} />
        <div className="space-y-2">
          {feedings.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                  <div>
                    <p className="font-medium text-sage-800 text-sm">{t(`baby.feedingType.${f.type}`)}</p>
                    <p className="text-xs text-sage-400">{formatHebrewTime(f.startTime)}</p>
                  </div>
                </div>
                <div className="text-left">
                  {f.durationMinutes && <Badge>{f.durationMinutes} {t('baby.minutes')}</Badge>}
                  {f.amountMl && <Badge variant="info" className="mr-1">{f.amountMl} {t('baby.ml')}</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SleepTab() {
  const sleeps = SleepsRepository.getAll();
  const totalMinutes = SleepsRepository.getTotalTodayMinutes();
  const chartData = ChartsRepository.getSleepDaily();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('dashboard.totalSleep')} value={formatDuration(totalMinutes)} icon={<Moon size={20} />} color="text-sky-600" />
        <StatCard label={t('baby.sessions')} value={sleeps.length} color="text-sky-500" />
        <StatCard label="ממוצע לישיבה" value={formatDuration(sleeps.length > 0 ? totalMinutes / sleeps.length : 0)} color="text-sage-700" />
      </div>

      <Card className="p-5">
        <SectionHeader title={t('analytics.sleepTrend')} />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
              <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
              <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }}
                labelFormatter={(l) => formatShortDate(l)}
              />
              <Line type="monotone" dataKey="value" stroke={COLORS.sleep} strokeWidth={2} dot={{ r: 3 }} name="שעות שינה" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <SectionHeader title="ישיבות שינה" />
        <div className="space-y-2">
          {sleeps.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.type === 'night_sleep' ? 'bg-sky-500' : 'bg-sky-300'}`} />
                  <div>
                    <p className="font-medium text-sage-800 text-sm">{t(`baby.sleepType.${s.type}`)}</p>
                    <p className="text-xs text-sage-400">{formatHebrewTime(s.startTime)} — {s.endTime ? formatHebrewTime(s.endTime) : 'עדיין ישן'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.quality === 'good' ? 'success' : s.quality === 'poor' ? 'danger' : 'default'}>
                    {t(`baby.sleepQuality.${s.quality || 'unknown'}`)}
                  </Badge>
                  <span className="text-sm text-sage-500">{formatDuration(s.durationMinutes)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiaperTab() {
  const diapers = DiapersRepository.getAll();
  const chartData = ChartsRepository.getDiaperDaily();
  const wet = diapers.filter(d => d.type === 'wet' || d.type === 'both').length;
  const dirty = diapers.filter(d => d.type === 'dirty' || d.type === 'both').length;

  const pieData = [
    { name: t('baby.diaperType.wet'), value: wet, color: '#4b96e9' },
    { name: t('baby.diaperType.dirty'), value: dirty, color: '#d6802e' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('dashboard.diaperCount')} value={diapers.length} icon={<Droplets size={20} />} color="text-sage-700" />
        <StatCard label={t('baby.diaperType.wet')} value={wet} color="text-sky-500" />
        <StatCard label={t('baby.diaperType.dirty')} value={dirty} color="text-brand-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader title={t('analytics.diaperTrend')} />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Bar dataKey="value" fill={COLORS.diaper} radius={[4, 4, 0, 0]} name="חיתולים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="פילוח" />
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-sage-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="היסטוריה" />
        <div className="space-y-2">
          {diapers.map((d) => (
            <Card key={d.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    d.type === 'wet' ? 'bg-sky-400' : d.type === 'dirty' ? 'bg-brand-400' : 'bg-sage-400'
                  }`} />
                  <div>
                    <p className="font-medium text-sage-800 text-sm">{t(`baby.diaperType.${d.type}`)}</p>
                    <p className="text-xs text-sage-400">{formatHebrewTime(d.time)}</p>
                  </div>
                </div>
                {d.consistency && <Badge>{d.consistency}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthTab() {
  const healthLogs = HealthRepository.getAll();
  const weights = HealthRepository.getWeightHistory('baby-1');

  return (
    <div className="space-y-6">
      {/* Weight Chart */}
      {weights.length > 0 && (
        <Card className="p-5">
          <SectionHeader title="מעקב משקל" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weights.map(w => ({ date: w.time, value: w.value }))} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis tick={{ fontSize: 11, fill: '#789b76' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Line type="monotone" dataKey="value" stroke={COLORS.health} strokeWidth={2} dot={{ r: 4 }} name="משקל (ק״ג)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Health Logs */}
      <div>
        <SectionHeader title="יומן בריאות" />
        <div className="space-y-2">
          {healthLogs.map((h) => (
            <Card key={h.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    h.type === 'weight' ? 'bg-brand-50 text-brand-500' :
                    h.type === 'milestone' ? 'bg-sky-50 text-sky-500' :
                    h.type === 'temperature' ? 'bg-rose-50 text-rose-500' :
                    'bg-sage-50 text-sage-500'
                  }`}>
                    {h.type === 'weight' ? <Scale size={16} /> :
                     h.type === 'milestone' ? <TrendingUp size={16} /> :
                     <Activity size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-sage-800 text-sm">
                      {h.description || (h.value ? `${h.value} ${h.unit || ''}` : h.type)}
                    </p>
                    <p className="text-xs text-sage-400">{formatHebrewDateTime(h.time)}</p>
                  </div>
                </div>
                {h.value && <span className="font-display font-bold text-sage-700">{h.value} {h.unit}</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedicationsTab() {
  const meds = MedicationsRepository.getAll();
  const babyMeds = MedicationsRepository.getTodayByPerson('baby-1');
  const motherMeds = MedicationsRepository.getTodayByPerson('mother-1');

  return (
    <div className="space-y-6">
      {/* Baby Medications */}
      <div>
        <SectionHeader title="תרופות תינוק — היום" />
        {babyMeds.length === 0 ? (
          <EmptyState title="אין תרופות היום" />
        ) : (
          <div className="space-y-2">
            {babyMeds.map((m) => (
              <Card key={m.id} className={`p-4 ${m.taken ? 'border-r-4 border-r-sage-300' : 'border-r-4 border-r-brand-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill size={16} className={m.taken ? 'text-sage-400' : 'text-brand-500'} />
                    <div>
                      <p className="font-medium text-sage-800 text-sm">{m.name}</p>
                      <p className="text-xs text-sage-400">{m.dosage} · {formatHebrewTime(m.time)}</p>
                    </div>
                  </div>
                  <Badge variant={m.taken ? 'success' : 'warning'}>{m.taken ? t('mother.taken') : 'טרם נלקח'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mother Medications */}
      <div>
        <SectionHeader title="תוספי אמא — היום" />
        {motherMeds.length === 0 ? (
          <EmptyState title="אין תוספים היום" />
        ) : (
          <div className="space-y-2">
            {motherMeds.map((m) => (
              <Card key={m.id} className={`p-4 ${m.taken ? 'border-r-4 border-r-sage-300' : 'border-r-4 border-r-rose-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill size={16} className={m.taken ? 'text-sage-400' : 'text-rose-400'} />
                    <div>
                      <p className="font-medium text-sage-800 text-sm">{m.name}</p>
                      <p className="text-xs text-sage-400">{m.dosage} · {formatHebrewTime(m.time)}</p>
                    </div>
                  </div>
                  <Badge variant={m.taken ? 'success' : 'danger'}>{m.taken ? t('mother.taken') : t('mother.missed')}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
