
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
      const [y, m, d] = key.split('-').map(Number);
      const isCorrectMonth = (m - 1) === month && y === year;
      if (!isCorrectMonth) return false;
      const dayData = value as DayData;
      return dayData.submitted || dayData.sessions.some(s => s.rating !== null);
    }).map(([key, value]) => {
      const dayData = value as DayData;
      return {
        date: key,
        day: parseInt(key.split('-')[2]),
        sessions: dayData.sessions.filter(s => s.rating !== null).length,
        efficiency: dayData.efficiency,
        rawSessions: dayData.sessions
      };
    }).sort((a, b) => a.day - b.day);
  }, [missionData, month, year]);

  const subjectStats = useMemo(() => {
    const stats: Record<string, { count: number, totalEff: number }> = {};
    dataForMonth.forEach(d => {
      d.rawSessions.forEach(s => {
        if (s.subject && s.rating !== null) {
          const sub = s.subject.toUpperCase().trim();
          if (!stats[sub]) stats[sub] = { count: 0, totalEff: 0 };
          stats[sub].count++;
          stats[sub].totalEff += (s.rating * 10);
        }
      });
    });
    return Object.entries(stats).map(([name, data]) => ({
      name,
      count: data.count,
      efficiency: Math.round(data.totalEff / data.count)
    })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [dataForMonth]);

  const summary = useMemo(() => {
    const totalSessions = dataForMonth.reduce((acc, curr) => acc + curr.sessions, 0);
    const avgEff = dataForMonth.length ? dataForMonth.reduce((acc, curr) => acc + curr.efficiency, 0) / dataForMonth.length : 0;
    const progressPercent = Math.min(100, Math.round((totalSessions / CONFIG.MONTHLY_TARGET_SESSIONS) * 100));
    return { totalSessions, avgEff, progressPercent };
  }, [dataForMonth]);

  return (
    <div className={`space-y-6 ${expanded ? 'grid grid-cols-1 md:grid-cols-2 gap-8 space-y-0' : ''}`}>
      {/* Subject Master Analytics */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl h-80">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Subject Strongholds (Efficiency vs Volume)</h4>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={subjectStats} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.02)'}}
              content={({payload}) => {
                if(payload && payload.length) return (
                  <div className="bg-[#0b0c0e] border border-white/10 p-2 text-[10px] text-white rounded">
                    <p className="font-black text-blue-400 uppercase">{payload[0].payload.name}</p>
                    <p>{payload[0].value} Sessions</p>
                    <p className="text-emerald-400">Avg Quality: {payload[0].payload.efficiency}%</p>
                  </div>
                );
                return null;
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
              {subjectStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.efficiency >= 80 ? '#10b981' : entry.efficiency >= 60 ? '#3b82f6' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Card */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Quota Progression</h4>
          <span className="text-blue-400 font-mono text-xs">{summary.totalSessions} / {CONFIG.MONTHLY_TARGET_SESSIONS}</span>
        </div>
        <div className="h-2 bg-[#0b0c0e] rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-1000"
            style={{ width: `${summary.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 shadow-xl h-80">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Force Concentration (Daily Activity)</h4>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={dataForMonth}>
            <XAxis dataKey="day" stroke="#64748b" fontSize={9} axisLine={false} tickLine={false} />
            <Tooltip content={({active, payload}) => {
              if (active && payload?.length) return (
                <div className="bg-[#0b0c0e] border border-white/10 p-2 text-[10px] text-white rounded">
                  <p className="font-black">Day {payload[0].payload.day}</p>
                  <p className="text-blue-400">{payload[0].value} SESS</p>
                  <p className="text-emerald-400">{payload[1]?.value}% EFF</p>
                </div>
              );
              return null;
            }} />
            <Line type="stepAfter" dataKey="sessions" stroke="#3b82f6" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
