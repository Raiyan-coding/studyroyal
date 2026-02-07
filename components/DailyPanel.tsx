
import React, { useState, useEffect } from 'react';
import { DayData, StudySession } from '../types';
import { CONFIG } from '../constants';
import { sounds } from '../services/audioService';

interface DailyPanelProps {
  dateKey: string;
  data: DayData;
  onUpdate: (data: DayData) => void;
}

const DailyPanel: React.FC<DailyPanelProps> = ({ dateKey, data, onUpdate }) => {
  const [sessions, setSessions] = useState<StudySession[]>(data.sessions);
  const [timer, setTimer] = useState(CONFIG.POMODORO_WORK * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (data.sessions) {
      setSessions(data.sessions);
    }
  }, [data.sessions]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      sounds.success();
      alert("Mission Accomplished! Log your session now.");
      setTimer(CONFIG.POMODORO_WORK * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const toggleTimer = () => {
    sounds.toggle();
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateEfficiency = (currentSessions: StudySession[]) => {
    const ratings = currentSessions
      .map(s => s.rating)
      .filter((r): r is number => typeof r === 'number' && r !== null);
    if (ratings.length === 0) return 0;
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.round((avg / 10) * 100);
  };

  const handleSessionChange = (index: number, field: keyof StudySession, value: any) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
    
    const eff = calculateEfficiency(updated);
    onUpdate({
      ...data,
      sessions: updated,
      efficiency: eff,
      submitted: true,
      submittedAt: new Date().toISOString()
    });
  };

  const addSession = () => {
    sounds.success();
    const updated = [...sessions, { subject: '', rating: null }];
    setSessions(updated);
    onUpdate({ ...data, sessions: updated });
  };

  const timerStatusColor = isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700';

  return (
    <div className="bg-[#111318] rounded-2xl border border-white/5 shadow-2xl flex flex-col h-[calc(100vh-8rem)]">
      {/* Timer Section */}
      <div className="p-6 bg-gradient-to-b from-blue-600/10 to-transparent border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Mission Timer</h3>
          <div className={`w-2 h-2 rounded-full ${timerStatusColor}`} />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black font-mono text-white mb-4 tracking-tighter">
            {formatTime(timer)}
          </div>
          <div className="flex gap-2 w-full">
            <button 
              onClick={toggleTimer}
              className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                isActive ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              }`}
            >
              {isActive ? 'Abort' : 'Commence'}
            </button>
            <button 
              onClick={() => { sounds.toggle(); setTimer(CONFIG.POMODORO_WORK * 60); setIsActive(false); }}
              className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl font-black text-xs uppercase"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {sessions.map((session, index) => (
          <div key={index} className="group flex items-start gap-3 bg-white/2 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
            <div className="mt-2 w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400 shrink-0">
              {index + 1}
            </div>
            
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={session.subject}
                onChange={(e) => handleSessionChange(index, 'subject', e.target.value)}
                placeholder="Target Subject"
                className="w-full bg-transparent text-white placeholder-slate-600 text-sm font-medium focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={session.rating === null ? '' : session.rating}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const val = rawValue === '' ? null : Math.max(0, Math.min(10, parseInt(rawValue)));
                    handleSessionChange(index, 'rating', val);
                  }}
                  className="w-16 h-8 bg-[#0b0c0e] border border-white/10 rounded-lg text-center text-sm font-bold focus:border-blue-500 transition-colors"
                />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Quality Score</span>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          onClick={addSession}
          className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-slate-500 text-sm font-bold hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
        >
          Add Session
        </button>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 text-center shrink-0">
         <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
           Efficiency Target: 80 Percent
         </p>
      </div>
    </div>
  );
};

export default DailyPanel;
