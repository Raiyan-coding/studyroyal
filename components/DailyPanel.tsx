
import React from 'react';
import { DayData, StudySession } from '../types';
import { CONFIG } from '../constants';
import { sounds } from '../services/audioService';

interface DailyPanelProps {
  dateKey: string;
  data: DayData;
  onUpdate: (data: DayData) => void;
}

const DailyPanel: React.FC<DailyPanelProps> = ({ dateKey, data, onUpdate }) => {
  const [sessions, setSessions] = React.useState<StudySession[]>(data.sessions);

  // Sync state with props
  React.useEffect(() => {
    setSessions(data.sessions);
  }, [data.sessions]);

  const calculateEfficiency = (currentSessions: StudySession[]) => {
    const ratings = currentSessions
      .map(s => s.rating)
      .filter((r): r is number => r !== null);
    if (ratings.length === 0) return 0;
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.round((avg / 10) * 100);
  };

  const handleSessionChange = (index: number, field: keyof StudySession, value: any) => {
    if (field === 'rating') sounds.click();
    
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

  const removeSession = (index: number) => {
    sounds.delete();
    if (index < CONFIG.FIXED_SESSIONS) return;
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
    const eff = calculateEfficiency(updated);
    onUpdate({ ...data, sessions: updated, efficiency: eff });
  };

  const formattedDate = new Date(dateKey).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-[#111318] rounded-2xl border border-white/5 shadow-2xl flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-white/5 shrink-0">
        <h3 className="text-xl font-bold text-white mb-1">Daily Log</h3>
        <p className="text-slate-500 text-sm font-medium">{formattedDate}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-bold border border-blue-500/20">
            Efficiency: {data.efficiency}%
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {sessions.filter(s => s.rating !== null).length} Sessions logged
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
                placeholder="Subject/Topic"
                className="w-full bg-transparent text-white placeholder-slate-600 text-sm font-medium focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={session.rating === null ? '' : session.rating}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Math.min(10, parseInt(e.target.value)));
                    handleSessionChange(index, 'rating', val);
                  }}
                  className="w-16 h-8 bg-[#0b0c0e] border border-white/10 rounded-lg text-center text-sm font-bold focus:border-blue-500 transition-colors"
                  placeholder="0-10"
                />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Quality</span>
              </div>
            </div>

            {index >= CONFIG.FIXED_SESSIONS && (
              <button 
                onClick={() => removeSession(index)}
                className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        ))}
        
        <button 
          onClick={addSession}
          className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-slate-500 text-sm font-bold hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Extra Session
        </button>
      </div>

      <div className="p-6 border-t border-white/5 bg-white/2 shrink-0 rounded-b-2xl">
        <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
          Note: Mandatory 8 sessions. Ratings directly impact your efficiency. 
          Target is 12. Aim for quality >= 8 for "Pure" study hours.
        </p>
      </div>
    </div>
  );
};

export default DailyPanel;
