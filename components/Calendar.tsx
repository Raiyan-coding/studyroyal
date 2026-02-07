
import React, { useMemo } from 'react';
import { MissionDataStore, DayData } from '../types';
import { WEEKDAYS, MONTHS, CONFIG } from '../constants';

interface CalendarProps {
  missionData: MissionDataStore;
  viewMonth: number;
  viewYear: number;
  selectedDateKey: string;
  onSelectDate: (key: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  missionData,
  viewMonth,
  viewYear,
  selectedDateKey,
  onSelectDate,
  onPrevMonth,
  onNextMonth
}) => {
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const stats = useMemo(() => {
    const relevantEntries = Object.entries(missionData).filter(([key]) => {
      const [y, m] = key.split('-').map(Number);
      return y === viewYear && (m - 1) === viewMonth;
    });

    let totalSessions = 0;
    let totalEff = 0;
    let daysWithData = 0;

    relevantEntries.forEach(([_, day]) => {
      const activeSessions = day.sessions.filter(s => s.rating !== null).length;
      if (activeSessions > 0 || day.efficiency > 0) {
        totalSessions += activeSessions;
        totalEff += day.efficiency;
        daysWithData++;
      }
    });

    return {
      totalSessions,
      avgEfficiency: daysWithData > 0 ? Math.round(totalEff / daysWithData) : 0,
      avgSessionsPerDay: daysWithData > 0 ? (totalSessions / daysWithData).toFixed(1) : "0.0"
    };
  }, [missionData, viewMonth, viewYear]);

  const getDayColor = (day: number) => {
    const key = `${viewYear}-${viewMonth + 1}-${day}`;
    const data = missionData[key];
    if (!data) return 'bg-[#1a1c23] hover:bg-[#252833]';

    const filledCount = data.sessions.filter(s => s.rating !== null).length;
    if (filledCount === 0) return 'bg-[#1a1c23] hover:bg-[#252833]';
    
    if (filledCount >= 16) return 'bg-purple-600/60 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]';
    if (filledCount >= 12) return 'bg-blue-600/60 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]';
    if (filledCount >= 10) return 'bg-sky-500/60 shadow-[0_0_15px_-3px_rgba(14,165,233,0.4)]';
    if (filledCount >= 8) return 'bg-green-600/60 shadow-[0_0_15px_-3px_rgba(22,163,74,0.4)]';
    if (filledCount >= 6) return 'bg-yellow-600/60 shadow-[0_0_15px_-3px_rgba(202,138,4,0.4)]';
    return 'bg-red-600/60 shadow-[0_0_15px_-3px_rgba(220,38,38,0.4)]';
  };

  return (
    <div className="w-full">
      {/* Monthly Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col items-center group hover:bg-white/5 transition-colors">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Total Sessions</p>
          <div className="flex items-baseline gap-1">
             <p className="text-2xl font-black text-white">{stats.totalSessions}</p>
             <span className="text-[10px] text-slate-600 font-bold">MONTHLY</span>
          </div>
        </div>
        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col items-center group hover:bg-white/5 transition-colors">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Avg Efficiency</p>
          <p className="text-2xl font-black text-emerald-400">{stats.avgEfficiency}%</p>
        </div>
        <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col items-center group hover:bg-white/5 transition-colors">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Sessions / Day</p>
          <p className="text-2xl font-black text-blue-400">{stats.avgSessionsPerDay}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-slate-400 font-medium tracking-tight uppercase">{MONTHS[viewMonth]}</span>
          <span className="text-slate-600 font-mono">{viewYear}</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} className="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          </button>
          <button onClick={onNextMonth} className="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest pb-2">
            {day}
          </div>
        ))}
        
        {blanks.map(i => (
          <div key={`blank-${i}`} className="aspect-square bg-transparent" />
        ))}

        {days.map(day => {
          const key = `${viewYear}-${viewMonth + 1}-${day}`;
          const isSelected = key === selectedDateKey;
          const isToday = key === `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
          
          return (
            <button
              key={key}
              onClick={() => onSelectDate(key)}
              className={`
                aspect-square relative rounded-xl transition-all duration-300 group
                flex flex-col items-center justify-center
                ${getDayColor(day)}
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-[#111318] scale-105 z-10' : ''}
                ${isToday ? 'border-2 border-white/20' : ''}
              `}
            >
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white/80'}`}>{day}</span>
              {missionData[key]?.efficiency > 0 && (
                <span className="text-[10px] text-white/50 font-mono mt-0.5">{missionData[key].efficiency}%</span>
              )}
              {isToday && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#111318]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
