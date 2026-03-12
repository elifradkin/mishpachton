import React from 'react';
import { useDataStore } from '../../layers/data-access/liveDataStore';
import { Card, StatCard, SectionHeader, Badge, EmptyState } from '../../components/common';
import { Baby, Droplets, Moon, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#d6802e', '#4b96e9', '#577d55', '#ea5c5c', '#9dcdf6'];

export function AnalyticsScreen() {
  const feedings = useDataStore((s: any) => s.getFeedings());
  const diapers = useDataStore((s: any) => s.getDiapers());
  const sleepLog = useDataStore((s: any) => s.getSleep());
  const babyMetrics = useDataStore((s: any) => s.getBabyMetrics());
  const dashboard = useDataStore((s: any) => s.getDashboard());
  const alerts = useDataStore((s: any) => s.getAlerts());
  const persons = useDataStore((s: any) => s.getPersons());
  const baby = persons.find((p: any) => p.role === 'baby');

  const m = babyMetrics?.metrics;
  const feeding = m?.feeding;
  const diaper = m?.diapers;
  const sleep = m?.sleep;
  const health = m?.health;

  // Build chart data from dashboard chart_series
  const feedingChartData = dashboard?.chart_series?.feedings_24h || [];

  // Build feeding type pie data
  const feedingPieData = feeding ? [
    { name: 'הנקה', value: feeding.nursing_count, color: '#d6802e' },
    { name: 'בקבוק', value: feeding.bottle_count, color: '#4b96e9' },
  ].filter((d: any) => d.value > 0) : [];

  // Build diaper pie data
  const diaperPieData = diaper ? [
    { name: 'רטוב', value: diaper.wet_count, color: '#4b96e9' },
    { name: 'מלוכלך', value: diaper.dirty_count, color: '#d6802e' },
    { name: 'שניהם', value: diaper.both_count, color: '#577d55' },
  ].filter((d: any) => d.value > 0) : [];

  if (!m && feedings.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-sage-900 mb-4">אנליטיקה 📈</h1>
        <EmptyState title="אין מספיק נתונים לניתוח" description="נתונים יופיעו כשיצטברו אירועים בשרת" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-sage-900">אנליטיקה 📈</h1>
        <p className="text-sage-500 text-sm mt-0.5">
          {baby ? `${baby.name} — ` : ''}{babyMetrics?.date || 'היום'} · {babyMetrics?.summary_he || ''}
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="האכלות" value={feeding?.total_count ?? feedings.length} subtitle={feeding ? `${feeding.nursing_count} הנקות · ${feeding.bottle_count} בקבוקים` : undefined} icon={<Baby size={20} />} color="text-brand-600" />
        <StatCard label="חיתולים" value={diaper?.total_count ?? diapers.length} subtitle={diaper ? `${diaper.wet_count} רטוב · ${diaper.dirty_count} מלוכלך` : undefined} icon={<Droplets size={20} />} color="text-sage-700" />
        <StatCard label="שינה" value={sleep?.total_naps ?? sleepLog.length} subtitle={sleep?.total_sleep_minutes ? `${sleep.total_sleep_minutes} דק׳ סה״כ` : 'אין נתונים'} icon={<Moon size={20} />} color="text-sky-600" />
        <StatCard label="בריאות" value={health ? `${health.temperature_readings + health.weight_readings + health.medications_given}` : '0'} subtitle="מדידות ותרופות" icon={<Activity size={20} />} color="text-sage-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feeding Timeline Chart */}
        {feedingChartData.length > 0 && (
          <Card className="p-5">
            <SectionHeader title="האכלות ב-24 שעות אחרונות" />
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedingChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ebe3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#789b76' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#789b76' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' as const }} />
                  <Bar dataKey="count" fill="#d6802e" radius={[4, 4, 0, 0]} name="האכלות" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Feeding Type Pie */}
        {feedingPieData.length > 0 && (
          <Card className="p-5">
            <SectionHeader title="פילוח סוגי האכלה" />
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={feedingPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={5}>
                    {feedingPieData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4ebe3', fontSize: 12, direction: 'rtl' as const }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {feedingPieData.map((d: any) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-sage-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Feeding Detail Stats */}
        {feeding && (
          <Card className="p-5">
            <SectionHeader title="פרטי האכלה 🍼" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-50 rounded-lg p-3 text-center">
                  <p className="font-display font-bold text-xl text-brand-600">{feeding.total_nursing_minutes || 0}</p>
                  <p className="text-xs text-brand-500">דקות הנקה</p>
                </div>
                <div className="bg-sky-50 rounded-lg p-3 text-center">
                  <p className="font-display font-bold text-xl text-sky-600">{feeding.total_bottle_ml || 0}</p>
                  <p className="text-xs text-sky-500">מ״ל בקבוק</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm"><span className="text-sage-500">מרווח ממוצע</span><span className="font-medium text-sage-700">{feeding.avg_gap_hours} שעות</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-sage-500">מרווח ארוך ביותר</span><span className="font-medium text-sage-700">{feeding.longest_gap_hours} שעות</span></div>
              {feeding.minutes_since_last_feeding != null && (
                <div className="bg-sage-50 rounded-lg p-3 flex items-center gap-2">
                  <TrendingUp size={14} className="text-sage-400" />
                  <span className="text-sm text-sage-600">
                    {feeding.minutes_since_last_feeding < 60
                      ? `האכלה אחרונה לפני ${feeding.minutes_since_last_feeding} דקות`
                      : `האכלה אחרונה לפני ${(feeding.minutes_since_last_feeding / 60).toFixed(1)} שעות`}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Diaper Stats + Pie */}
        {diaper && (
          <Card className="p-5">
            <SectionHeader title="ניתוח חיתולים 🧷" />
            <div className="space-y-4">
              {diaperPieData.length > 0 && (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={diaperPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={5}>
                        {diaperPieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, direction: 'rtl' as const }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex justify-center gap-3">
                {diaperPieData.map((d: any) => (
                  <span key={d.name} className="flex items-center gap-1 text-xs text-sage-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}
                  </span>
                ))}
              </div>
              {diaper.hours_since_last_diaper != null && (
                <div className={`rounded-lg p-3 flex items-center gap-2 ${diaper.hours_since_last_diaper > 6 ? 'bg-brand-50' : 'bg-sage-50'}`}>
                  {diaper.hours_since_last_diaper > 6 ? <AlertTriangle size={14} className="text-brand-500" /> : <TrendingUp size={14} className="text-sage-400" />}
                  <span className={`text-sm ${diaper.hours_since_last_diaper > 6 ? 'text-brand-600' : 'text-sage-600'}`}>
                    חיתול אחרון לפני {diaper.hours_since_last_diaper} שעות{diaper.hours_since_last_diaper > 6 ? ' — שימו לב!' : ''}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Sleep */}
        <Card className="p-5">
          <SectionHeader title="שינה 😴" />
          {sleep && sleep.total_naps > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sky-50 rounded-lg p-3 text-center">
                  <p className="font-display font-bold text-xl text-sky-600">{sleep.total_naps}</p>
                  <p className="text-xs text-sky-500">ישיבות</p>
                </div>
                <div className="bg-sky-50 rounded-lg p-3 text-center">
                  <p className="font-display font-bold text-xl text-sky-600">{sleep.total_sleep_minutes}</p>
                  <p className="text-xs text-sky-500">דקות סה״כ</p>
                </div>
              </div>
              {sleep.longest_sleep_minutes > 0 && (
                <div className="flex items-center justify-between text-sm"><span className="text-sage-500">שינה ארוכה ביותר</span><span className="font-medium text-sage-700">{sleep.longest_sleep_minutes} דקות</span></div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Moon size={32} className="text-sage-200 mx-auto mb-2" />
              <p className="text-sm text-sage-400">אין נתוני שינה עדיין</p>
              <p className="text-xs text-sage-300 mt-1">נתונים יופיעו כשיתעדכנו</p>
            </div>
          )}
        </Card>

        {/* Health */}
        <Card className="p-5">
          <SectionHeader title="בריאות ❤️" />
          {health ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="text-sage-500">מדידות טמפרטורה</span><span className="font-medium text-sage-700">{health.temperature_readings}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-sage-500">מדידות משקל</span><span className="font-medium text-sage-700">{health.weight_readings}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-sage-500">תרופות/ויטמינים</span><span className="font-medium text-sage-700">{health.medications_given}</span></div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity size={32} className="text-sage-200 mx-auto mb-2" />
              <p className="text-sm text-sage-400">אין נתוני בריאות</p>
            </div>
          )}
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-6">
          <SectionHeader title="התראות ⚠️" />
          <div className="space-y-2">
            {alerts.map((alert: any, i: number) => (
              <Card key={alert.id || i} className={`p-4 ${alert.severity === 'critical' ? 'border-r-4 border-r-rose-300' : alert.severity === 'warning' ? 'border-r-4 border-r-brand-300' : ''}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className={alert.severity === 'critical' ? 'text-rose-500' : 'text-brand-500'} />
                  <div className="flex-1"><p className="font-medium text-sage-800 text-sm">{alert.title_he || alert.title}</p><p className="text-xs text-sage-500">{alert.message_he || alert.message}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <Card className="p-5 mt-6">
        <SectionHeader title="תובנות 💡" />
        <div className="space-y-3">
          {feeding && (
            <div className="flex items-start gap-3 p-3 bg-sage-50 rounded-lg">
              <Baby size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-sage-700">
                {feeding.total_count} האכלות היום — {feeding.nursing_count} הנקות ו-{feeding.bottle_count} בקבוקים.
                {feeding.avg_gap_hours <= 3 ? ' תדירות האכלה תקינה.' : ` מרווח ממוצע ${feeding.avg_gap_hours} שעות.`}
              </p>
            </div>
          )}
          {diaper && diaper.hours_since_last_diaper > 6 && (
            <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-lg">
              <AlertTriangle size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-brand-700">עברו {diaper.hours_since_last_diaper} שעות מהחיתול האחרון — כדאי לבדוק.</p>
            </div>
          )}
          {sleep && sleep.total_naps === 0 && (
            <div className="flex items-start gap-3 p-3 bg-sky-50 rounded-lg">
              <Moon size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-sky-700">אין נתוני שינה מתועדים עדיין — שווה להתחיל לעקוב.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
