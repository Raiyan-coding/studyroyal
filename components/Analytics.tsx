
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { MissionDataStore, DayData } from '../types';
import { CONFIG } from '../constants';
import { getDhakaDate, getDateKey } from '../services/storageService';

interface AnalyticsProps {
  missionData: MissionDataStore;
  monthLabel: string;
  month: number;
  year: number;
  expanded?: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ missionData, month, year, expanded }) => {
  const todayDate = getDhakaDate();
  const todayKey = getDateKey(todayDate);

  const dataForMonth = useMemo(() => {
    return Object.entries(missionData).filter(([key, value]) => {
      // Parse the key into a date object for comparison
      const [y, m, d] = key.split('-').map(Number);
      const entryDate = new Date(y, m - 1, d);
      
      // Basic month/year match
      const isCorrectMonth = (m - 1) === month && y === year;
      if (!isCorrectMonth) return false;

      const dayData = value as DayData;
      
      // 1. Never include days that are strictly in the future unless they have data (edge case)
      const isFuture = entryDate > todayDate && key !== todayKey;
      
      // 2. We only want to include days in analytics if they have actual session data
      // This prevents placeholder entries created by just "viewing" a day in the calendar from skewing distribution buckets.
      const hasActualActivity = dayData.submitted || dayData.sessions.some(s => s.rating !== null);
      
      // If it's a future day, only count if it actually has data (unlikely but possible if pre-logged)
      // If it's today or the past, only count if it has data. 
      // Note: If you want to count "missed" past days as 0, you could change this.
      // But for "Distribution" we only want to see work that was actually logged.
      return !isFuture && hasActualActivity;
    }).map(([key, value]) => {
      const dayData = value as DayData;
      return {
        date: key,
        day: parseInt(key.split('-')[2]),
        sessions: dayData.sessions.filter(s => s.rating !== null).length,
        efficiency: dayData.efficiency
      };
    }).sort((a, b) => a.day - b.day);
  }, [missionData, month, year, todayKey]);

  const summary = useMemo(() => {
    const totalSessions = dataForMonth.reduce((acc, curr) => acc + curr.sessions, 0);
    const avgEff = dataForMonth.length ? dataForMonth.reduce((acc, curr) => acc + curr.efficiency, 0) / dataForMonth.length : 0;
    const progressPercent = Math.min(100, Math.round((totalSessions / CONFIG.MONTHLY_TARGET_SESSIONS) * 100));
    
    return { totalSessions, avgEff, progressPercent };
  }, [dataForMonth]);

  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {
      '<6': 0, '6-7': 0, '8-9': 0, '10-11': 0, '12-15': 0, '16+': 0
    };
    dataForMonth.forEach(d => {
      if (d.sessions < 6) counts['<6']++;
      else if (d.sessions < 8) counts['6-7']++;
      else if (d.sessions < 10) counts['8-9']++;
      else if (d.sessions < 12) counts['10-11']++;
      else if (d.sessions < 16) counts['12-15']++;
      else counts['16+']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dataForMonth]);

  const radarData = useMemo(() => {
    const daysGE8 = dataForMonth.filter(d => d.sessions >= 8).length;
    const daysGE12 = dataForMonth.filter(d => d.sessions >= 12).length;
    const highQualityDays = dataForMonth.filter(d => d.efficiency >= 80).length;
    
    return [
      { subject: 'Consistency', value: Math.min(100, (dataForMonth.length / (todayDate.getDate() || 1)) * 100) },
      { subject: 'Volume', value: (summary.totalSessions / CONFIG.MONTHLY_TARGET_SESSIONS) * 100 },
      { subject: 'Efficiency', value: summary.avgEff },
      { subject: 'Mandatory Met', value: (daysGE8 / (dataForMonth.length || 1)) * 100 },
      { subject: 'Targets Met', value: (daysGE12 / (dataForMonth.length || 1)) * 100 },
      { subject: 'Quality', value: (highQualityDays / (dataForMonth.length || 1)) * 100 },
    ];
  }, [dataForMonth, summary, todayDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111318] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white text-xs font-bold mb-1">Day {label}</p>
          <p className="text-blue-400 text-xs font-medium">{payload[0].value} Sessions</p>
          <p className="text-emerald-400 text-xs font-medium">{payload[1]?.value}% Efficiency</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${expanded ? 'grid grid-cols-1 md:grid-cols-2 gap-8 space-y-0' : ''}`}>
      {/* Progress Card */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Goal Tracker</h4>
          <span className="text-blue-400 font-mono text-sm">{summary.totalSessions} / {CONFIG.MONTHLY_TARGET_SESSIONS} Sessions</span>
        </div>
        <div className="h-4 bg-[#0b0c0e] rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-1000 ease-out"
            style={{ width: `${summary.progressPercent}%` }}
          />
        </div>
        <p className="mt-3 text-[10px] text-slate-500 font-medium">
          Month progression based on target of {CONFIG.MONTHLY_TARGET_SESSIONS} sessions ({CONFIG.SESSION_DURATION_MINS}m each).
        </p>
      </div>

      {/* Distribution Chart */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl h-80">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Work Distribution (Logged Days)</h4>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={distributionData}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={({payload}) => {
                if(payload && payload.length) return <div className="bg-[#1a1c23] border border-white/10 p-2 text-xs text-white rounded shadow-xl">{payload[0].value} days</div>;
                return null;
            }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.name === '<6' ? '#ef4444' :
                  entry.name === '6-7' ? '#f59e0b' :
                  entry.name === '8-9' ? '#10b981' :
                  entry.name === '10-11' ? '#0ea5e9' :
                  entry.name === '12-15' ? '#3b82f6' : '#a855f7'
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Trend (Line Chart) */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl h-80">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Daily Activity Trend</h4>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={dataForMonth}>
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={3} dot={{r: 3, fill: '#3b82f6'}} activeDot={{r: 5}} />
            <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Radar */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl h-80">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Overall Metric Profile</h4>
        <ResponsiveContainer width="100%" height="80%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
