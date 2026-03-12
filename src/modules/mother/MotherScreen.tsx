import React from 'react';
import { t } from '../../i18n';
import { formatShortDate, formatPercentage } from '../../utils';
import { MotherRecoveryRepository } from '../../layers/data-access/repositories';
import { Card, StatCard, SectionHeader, Badge, ProgressBar } from '../../components/common';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Heart, Droplets, Pill, Moon, Smile, Zap } from 'lucide-react';

export function MotherScreen() {
  const metrics = MotherRecoveryRepository.getMetrics();
  const latest = MotherRecoveryRepository.getLatestDaily();

  const sleepData = metrics.dailySummaries.slice().reverse().map(d => ({
    date: d.date,
    value: d.sleepHours || 0,
  }));

  const moodData = metrics.dailySummaries.slice().reverse().map(d => ({
    date: d.date,
    mood: d.moodRating || 0,
    energy: d.energyRating || 0,
  }));

  const hydrationData = metrics.dailySummaries.slice().reverse().map(d => ({
    date: d.date,
    value: d.hydrationGlasses || 0,
    goal: d.hydrationGoal || 10,
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">{t('mother.title')} — שירה 💜</h1>
        <p className="text-sage-500 text-sm mt-0.5">{t('mother.recovery')} ו{t('mother.trends')}</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t('mother.sleep')}
          value={`${metrics.averageSleepHours.toFixed(1)} שע׳`}
          subtitle="ממוצע שבועי"
          icon={<Moon size={20} />}
          color="text-sky-600"
        />
        <StatCard
          label={t('mother.hydration')}
          value={formatPercentage(metrics.hydrationAdherence)}
          subtitle={t('mother.adherence')}
          icon={<Droplets size={20} />}
          color="text-sky-500"
        />
        <StatCard
          label={t('mother.mood')}
          value={`${metrics.averageMoodRating.toFixed(1)}/5`}
          subtitle="ממוצע שבועי"
          icon={<Smile size={20} />}
          color="text-brand-500"
        />
        <StatCard
          label={t('mother.supplements')}
          value={formatPercentage(metrics.supplementAdherence)}
          subtitle={t('mother.adherence')}
          icon={<Pill size={20} />}
          color="text-sage-600"
        />
      </div>

      {/* Today's Check-In */}
      {latest && (
        <Card className="p-5 mb-6">
          <SectionHeader title="צ׳ק-אין היום" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-sage-400 mb-2">{t('mother.hydration')}</p>
              <ProgressBar
                value={latest.hydrationGlasses || 0}
                max={latest.hydrationGoal || 10}
                label={`${latest.hydrationGlasses}/${latest.hydrationGoal} ${t('mother.glasses')}`}
                color="bg-sky-400"
              />
            </div>
            <div>
              <p className="text-xs text-sage-400 mb-2">{t('mother.supplements')}</p>
              <div className="space-y-1">
                {latest.supplementsTaken?.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                    <span className="text-xs text-sage-600">{s}</span>
                    <Badge variant="success" className="text-[10px] py-0 px-1.5">{t('mother.taken')}</Badge>
                  </div>
                ))}
                {latest.supplementsMissed?.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                    <span className="text-xs text-sage-600">{s}</span>
                    <Badge variant="danger" className="text-[10px] py-0 px-1.5">{t('mother.missed')}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-sage-400 mb-1">{t('mother.mood')}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    v <= (latest.moodRating || 0) ? 'bg-brand-100 text-brand-600' : 'bg-sage-50 text-sage-300'
                  }`}>
                    {v <= (latest.moodRating || 0) ? '😊' : '○'}
                  </div>
                ))}
              </div>
              <p className="text-xs text-sage-400 mt-2">{t('mother.energy')}</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    v <= (latest.energyRating || 0) ? 'bg-sky-100 text-sky-600' : 'bg-sage-50 text-sage-300'
                  }`}>
                    {v <= (latest.energyRating || 0) ? '⚡' : '○'}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-sage-400 mb-1">{t('mother.symptoms')}</p>
              {latest.symptoms && latest.symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {latest.symptoms.map((s, i) => <Badge key={i} variant="warning">{s}</Badge>)}
                </div>
              ) : (
                <p className="text-xs text-sage-400">אין תסמינים 🎉</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <SectionHeader title="מגמת שינה (שעות)" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Bar dataKey="value" fill="#4b96e9" radius={[4, 4, 0, 0]} name="שעות שינה" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="מצב רוח ואנרגיה" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#789b76' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Line type="monotone" dataKey="mood" stroke="#d6802e" strokeWidth={2} dot={{ r: 3 }} name={t('mother.mood')} />
                <Line type="monotone" dataKey="energy" stroke="#4b96e9" strokeWidth={2} dot={{ r: 3 }} name={t('mother.energy')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center mt-2 text-xs text-sage-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-400" /> {t('mother.mood')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> {t('mother.energy')}</span>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="שתייה יומית" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hydrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis tick={{ fontSize: 11, fill: '#789b76' }} domain={[0, 12]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Bar dataKey="value" fill="#4b96e9" radius={[4, 4, 0, 0]} name="כוסות" />
                <Bar dataKey="goal" fill="#e4ebe3" radius={[4, 4, 0, 0]} name="יעד" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Symptom Frequency */}
      <Card className="p-5 mt-6">
        <SectionHeader title="תדירות תסמינים (14 ימים)" />
        <div className="flex flex-wrap gap-3">
          {Object.entries(metrics.symptomFrequency).map(([symptom, count]) => (
            <div key={symptom} className="flex items-center gap-2 bg-sage-50 rounded-lg px-3 py-2">
              <span className="text-sm text-sage-700">{symptom}</span>
              <Badge variant={count > 5 ? 'danger' : count > 2 ? 'warning' : 'default'}>{count} פעמים</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
