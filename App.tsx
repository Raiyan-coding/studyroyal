
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MissionDataStore, DayData } from './types';
import { CONFIG, MONTHS } from './constants';
import { loadFromStorage, saveToStorage, getDhakaDate, getDateKey } from './services/storageService';
import { sounds } from './services/audioService';
import Calendar from './components/Calendar';
import DailyPanel from './components/DailyPanel';
import Analytics from './components/Analytics';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  const [missionData, setMissionData] = useState<MissionDataStore>(() => loadFromStorage());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(getDateKey(getDhakaDate()));
  const [viewMonth, setViewMonth] = useState<number>(getDhakaDate().getMonth());
  const [viewYear, setViewYear] = useState<number>(getDhakaDate().getFullYear());
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  useEffect(() => {
    saveToStorage(missionData);
  }, [missionData]);

  useEffect(() => {
    if (!missionData[selectedDateKey]) {
      const defaultSessions = Array.from({ length: CONFIG.FIXED_SESSIONS }, () => ({
        subject: '',
        rating: null
      }));
      setMissionData(prev => ({
        ...prev,
        [selectedDateKey]: {
          sessions: defaultSessions,
          efficiency: 0,
          submitted: false
        }
      }));
    }
  }, [selectedDateKey, missionData]);

  const updateDayData = useCallback((key: string, data: DayData) => {
    setMissionData(prev => ({
      ...prev,
      [key]: data
    }));
  }, []);

  const monthLabel = useMemo(() => `${MONTHS[viewMonth]} ${viewYear}`, [viewMonth, viewYear]);

  const monthlyStats = useMemo(() => {
    const relevantEntries = Object.entries(missionData).filter(([key]) => {
      const [y, m] = key.split('-').map(Number);
      return y === viewYear && (m - 1) === viewMonth;
    });

    let totalSessions = 0;
    let totalEff = 0;
    let daysWithEff = 0;

    relevantEntries.forEach(([_, day]) => {
      const sessions = day.sessions.filter(s => s.rating !== null).length;
      totalSessions += sessions;
      if (day.efficiency > 0) {
        totalEff += day.efficiency;
        daysWithEff++;
      }
    });

    return {
      sessions: totalSessions,
      avgEff: daysWithEff > 0 ? totalEff / daysWithEff : 0
    };
  }, [missionData, viewMonth, viewYear]);

  const handleOpenAnalytics = () => {
    sounds.toggle();
    setIsAnalysisOpen(true);
  };

  const handleOpenLeaderboard = () => {
    sounds.rankUp();
    setIsLeaderboardOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-slate-200 p-4 md:p-8 flex flex-col">
      <header className="max-w-7xl mx-auto mb-8 w-full flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-500 italic">MISSION</span> TRACKER PRO
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">v7.0</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Nationwide Candidate Simulation Engine</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenLeaderboard}
            className="px-5 py-2.5 bg-gradient-to-br from-yellow-600 to-amber-500 hover:scale-105 active:scale-95 text-white rounded-xl font-black italic transition-all shadow-xl shadow-yellow-900/20 flex items-center gap-2 border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            LEADERBOARD
          </button>
          <button 
            onClick={handleOpenAnalytics}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5 shadow-lg flex items-center gap-2"
          >
            REPORTS
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[#111318] rounded-2xl border border-white/5 shadow-2xl overflow-hidden p-6">
            <Calendar 
              missionData={missionData}
              viewMonth={viewMonth}
              viewYear={viewYear}
              selectedDateKey={selectedDateKey}
              onSelectDate={(key) => { sounds.click(); setSelectedDateKey(key); }}
              onPrevMonth={() => { sounds.toggle(); setViewMonth(m => m === 0 ? 11 : m - 1); }}
              onNextMonth={() => { sounds.toggle(); setViewMonth(m => m === 11 ? 0 : m + 1); }}
            />
          </section>
          <section>
             <Analytics missionData={missionData} monthLabel={monthLabel} month={viewMonth} year={viewYear} />
          </section>
        </div>
        <div className="lg:col-span-4 h-full">
          <div className="sticky top-8 h-fit">
            <DailyPanel 
              dateKey={selectedDateKey}
              data={missionData[selectedDateKey] || { sessions: [], efficiency: 0, submitted: false }}
              onUpdate={(data) => updateDayData(selectedDateKey, data)}
            />
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full py-12 mt-8 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em]">Developer Information</p>
          <p className="text-sm font-bold text-white tracking-wide">
            Made by <span className="text-blue-500 italic">Md Raiyan Islam</span>
          </p>
          <a 
            href="mailto:devspakle@gmail.com" 
            className="text-[11px] font-mono text-slate-500 hover:text-blue-400 transition-colors"
          >
            devspakle@gmail.com
          </a>
        </div>
      </footer>

      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0b0c0e]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
           <div className="max-w-md w-full h-[85vh] relative">
              <button onClick={() => { sounds.toggle(); setIsLeaderboardOpen(false); }} className="absolute -top-14 right-0 p-2 text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <Leaderboard userMonthlySessions={monthlyStats.sessions} userAvgEfficiency={monthlyStats.avgEff} />
           </div>
        </div>
      )}

      {isAnalysisOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b0c0e]/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300">
           <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-white tracking-tight">Performance Deep Dive: {monthLabel}</h2>
                 <button onClick={() => { sounds.toggle(); setIsAnalysisOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <Analytics missionData={missionData} monthLabel={monthLabel} month={viewMonth} year={viewYear} expanded />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
