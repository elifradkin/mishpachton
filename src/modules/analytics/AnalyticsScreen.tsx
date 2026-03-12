import React from 'react';
import { t } from '../../i18n';
import { formatShortDate, formatDuration, formatPercentage } from '../../utils';
import { ChartsRepository, DashboardRepository, MotherRecoveryRepository, AlertsRepository } from '../../layers/data-access/repositories';
import { Card, StatCard, SectionHeader, Badge, Sparkline } from '../../components/common';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Activity } from 'lucide-react';

export function AnalyticsScreen() {
  const feedingData = ChartsRepository.getFeedingDaily();
  const sleepData = ChartsRepository.getSleepDaily();
  const diaperData = ChartsRepository.getDiaperDaily();
  const dashboard = DashboardRepository.getTodaySummary();
  const motherMetrics = MotherRecoveryRepository.getMetrics();
  const alerts = AlertsRepository.getOpen();

  // Combined data for multi-series chart
  const combinedData = feedingData.map((f, i) => ({
    date: f.date,
    feedings: f.value,
    sleep: sleepData[i]?.value || 0,
    diapers: diaperData[i]?.value || 0,
  }));

  // Trends
  const feedingAvg = feedingData.reduce((s, d) => s + d.value, 0) / feedingData.length;
  const sleepAvg = sleepData.reduce((s, d) => s + d.value, 0) / sleepData.length;
  const diaperAvg = diaperData.reduce((s, d) => s + d.value, 0) / diaperData.length;

  const feedingRecent = feedingData.slice(-3).reduce((s, d) => s + d.value, 0) / 3;
  const sleepRecent = sleepData.slice(-3).reduce((s, d) => s + d.value, 0) / 3;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">{t('analytics.title')}</h1>
        <p className="text-sage-500 text-sm mt-0.5">{t('analytics.trends')} ו{t('analytics.insights')} — 14 ימים אחרונים</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-sage-500 mb-1">ממוצע האכלות/יום</p>
              <p className="font-display font-bold text-xl text-brand-600">{feedingAvg.toFixed(1)}</p>
            </div>
            <div className="flex items-center gap-1">
              {feedingRecent > feedingAvg ?
                <TrendingUp size={14} className="text-sage-400" /> :
                <TrendingDown size={14} className="text-rose-400" />}
              <Sparkline values={feedingData.map(d => d.value)} color="#d6802e" height={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-sage-500 mb-1">ממוצע שינה/יום</p>
              <p className="font-display font-bold text-xl text-sky-600">{sleepAvg.toFixed(1)} שע׳</p>
            </div>
            <div className="flex items-center gap-1">
              {sleepRecent > sleepAvg ?
                <TrendingUp size={14} className="text-sage-400" /> :
                <TrendingDown size={14} className="text-rose-400" />}
              <Sparkline values={sleepData.map(d => d.value)} color="#4b96e9" height={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-sage-500 mb-1">ממוצע חיתולים/יום</p>
              <p className="font-display font-bold text-xl text-sage-700">{diaperAvg.toFixed(1)}</p>
            </div>
            <Sparkline values={diaperData.map(d => d.value)} color="#577d55" height={24} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-sage-500 mb-1">שינת אמא (ממוצע)</p>
              <p className="font-display font-bold text-xl text-sky-500">{motherMetrics.averageSleepHours.toFixed(1)} שע׳</p>
            </div>
            <Sparkline
              values={motherMetrics.dailySummaries.slice().reverse().map(d => d.sleepHours || 0)}
              color="#4b96e9"
              height={24}
            />
          </div>
        </Card>
      </div>

      {/* Combined Overview Chart */}
      <Card className="p-5 mb-6">
        <SectionHeader title="סקירה משולבת — 14 ימים" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
              <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
              <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }}
                labelFormatter={(l) => formatShortDate(l)}
              />
              <Area type="monotone" dataKey="feedings" fill="#d6802e20" stroke="#d6802e" strokeWidth={2} name="האכלות" />
              <Area type="monotone" dataKey="diapers" fill="#577d5520" stroke="#577d55" strokeWidth={2} name="חיתולים" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 justify-center mt-3 text-xs text-sage-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-brand-400" /> האכלות</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-sage-500" /> חיתולים</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sleep Trend */}
        <Card className="p-5">
          <SectionHeader title={t('analytics.sleepTrend')} />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Line type="monotone" dataKey="value" stroke="#4b96e9" strokeWidth={2} dot={{ r: 3 }} name="שעות שינה" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Feeding Trend */}
        <Card className="p-5">
          <SectionHeader title={t('analytics.feedingTrend')} />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedingData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 11, fill: '#789b76' }} />
                <YAxis tick={{ fontSize: 11, fill: '#789b76' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' }} />
                <Bar dataKey="value" fill="#d6802e" radius={[4, 4, 0, 0]} name="האכלות" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alerts & Anomalies */}
      {alerts.length > 0 && (
        <Card className="p-5">
          <SectionHeader title={`${t('analytics.alerts')} ו${t('analytics.anomalies')}`} />
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.severity === 'critical' ? 'bg-rose-50' :
                alert.severity === 'warning' ? 'bg-brand-50' : 'bg-sky-50'
              }`}>
                <AlertTriangle size={16} className={
                  alert.severity === 'critical' ? 'text-rose-500' :
                  alert.severity === 'warning' ? 'text-brand-500' : 'text-sky-500'
                } />
                <div className="flex-1">
                  <p className="text-sm font-medium text-sage-800">{alert.title}</p>
                  <p className="text-xs text-sage-500">{alert.message}</p>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}>
                  {t(`alerts.severity.${alert.severity}`)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card className="p-5 mt-6">
        <SectionHeader title={t('analytics.insights')} />
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-sage-50 rounded-lg">
            <Activity size={16} className="text-sage-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-sage-700">
              מספר ההאכלות היומי יציב סביב {feedingAvg.toFixed(0)} האכלות ביום.
              {feedingRecent > feedingAvg ? ' נראית מגמת עלייה קלה בימים האחרונים.' : ' ללא שינוי משמעותי.'}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sage-50 rounded-lg">
            <Activity size={16} className="text-sage-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-sage-700">
              ממוצע שינת תינוק: {sleepAvg.toFixed(1)} שעות ביום.
              {sleepRecent > sleepAvg ? ' שיפור בימים האחרונים.' : ' ירידה קלה — שווה לעקוב.'}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-sage-50 rounded-lg">
            <Activity size={16} className="text-sage-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-sage-700">
              היענות שתייה של אמא: {formatPercentage(motherMetrics.hydrationAdherence)}.
              היענות תוספים: {formatPercentage(motherMetrics.supplementAdherence)}.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
