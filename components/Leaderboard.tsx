
import React, { useMemo, useState } from 'react';
import { CONFIG, RANK_TIERS } from '../constants';
import { getDhakaDate } from '../services/storageService';
import RankBadge from './RankBadge';

interface LeaderboardProps {
  userMonthlySessions: number;
  userAvgEfficiency: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  sessions: number;
  efficiency: number;
  rank: number;
  isUser?: boolean;
}

const BOT_NAMES = ["Abir_X", "Sajid_H", "Tausif_Z", "Nafis_07", "Mehedi_K", "Arafat_B", "Anika_D", "Jarin_S", "Sifat_V", "Piyal_L", "Tanvir_M", "Fahim_R", "Nayeem_W", "Tahmid_A", "Emon_N"];

const Leaderboard: React.FC<LeaderboardProps> = ({ userMonthlySessions, userAvgEfficiency }) => {
  const [activeTab, setActiveTab] = useState<'LOCAL' | 'GRANDMASTER' | 'TIERS'>('LOCAL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const today = getDhakaDate();
  const currentDay = today.getDate() || 1;

  // New Formula: Points = Total Sessions * Efficiency (0-100)
  const userScore = userMonthlySessions * userAvgEfficiency;
  const userAvgSess = userMonthlySessions / currentDay;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const grandmasters = useMemo(() => {
    const list: LeaderboardEntry[] = Array.from({ length: 100 }, (_, i) => {
      const sessionsPerDay = 16.5 - (i * 0.02); 
      const totalSessions = Math.floor(sessionsPerDay * currentDay);
      const efficiency = 98 - (i * 0.05);
      const score = totalSessions * efficiency;
      
      return {
        id: `gm-${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length] + `_${i + 1}`,
        score,
        sessions: totalSessions,
        efficiency: Math.round(efficiency),
        rank: i + 1,
      };
    });

    const userIndex = list.findIndex(gm => userScore > gm.score);
    if (userIndex !== -1) {
      const userEntry: LeaderboardEntry = {
        id: 'user-id',
        name: 'YOU (CANDIDATE)',
        score: userScore,
        sessions: userMonthlySessions,
        efficiency: Math.round(userAvgEfficiency),
        rank: userIndex + 1,
        isUser: true
      };
      list.splice(userIndex, 0, userEntry);
      list.pop(); 
      return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
    return list;
  }, [currentDay, userScore, userMonthlySessions, userAvgEfficiency]);

  const globalRank = useMemo(() => {
    const userInGm = grandmasters.find(gm => gm.isUser);
    if (userInGm) return userInGm.rank;
    if (userMonthlySessions === 0 && userAvgEfficiency === 0) return CONFIG.POPULATION_SIZE;

    let targetTier = RANK_TIERS[7]; 
    if (userAvgSess >= 14.4) targetTier = RANK_TIERS[1]; 
    else if (userAvgSess >= 9.6) targetTier = RANK_TIERS[1];
    else if (userAvgSess >= 7.2) targetTier = RANK_TIERS[2];
    else if (userAvgSess >= 4.8) targetTier = RANK_TIERS[3];
    else if (userAvgSess >= 3.6) targetTier = RANK_TIERS[4];
    else if (userAvgSess >= 2.4) targetTier = RANK_TIERS[5];
    else if (userAvgSess >= 1.2) targetTier = RANK_TIERS[6];

    const range = targetTier.maxRank - targetTier.minRank;
    const fakePeakForTier = 12 * currentDay * 85; 
    const progress = Math.min(0.99, userScore / fakePeakForTier);
    return targetTier.minRank + Math.floor(range * (1 - progress));
  }, [userAvgSess, userScore, grandmasters, currentDay, userMonthlySessions, userAvgEfficiency]);

  const localPeers = useMemo(() => {
    const userInGm = grandmasters.find(gm => gm.isUser);
    if (userInGm) return []; 

    const list: LeaderboardEntry[] = [];
    const startRank = Math.max(101, globalRank - 25);
    
    for (let i = 0; i < 50; i++) {
      const currentRank = startRank + i;
      if (currentRank > CONFIG.POPULATION_SIZE) break;

      if (currentRank === globalRank) {
        list.push({
          id: 'user-id',
          name: 'YOU (CANDIDATE)',
          score: userScore,
          sessions: userMonthlySessions,
          efficiency: Math.round(userAvgEfficiency),
          rank: globalRank,
          isUser: true
        });
      } else {
        const rankPercentile = 1 - (currentRank / CONFIG.POPULATION_SIZE);
        const sessionsPerDay = (Math.pow(rankPercentile, 3.5) * 15) + 0.4;
        const sessions = Math.floor(sessionsPerDay * currentDay);
        
        let baseEff = 10;
        if (rankPercentile > 0.99) baseEff = 90;
        else if (rankPercentile > 0.95) baseEff = 80;
        else if (rankPercentile > 0.8) baseEff = 60;
        else if (rankPercentile > 0.5) baseEff = 40;
        else if (rankPercentile > 0.2) baseEff = 25;
        
        const efficiency = baseEff + (Math.random() * 10);
        const score = sessions * efficiency;

        list.push({
          id: `peer-${currentRank}`,
          name: `Candidate_${currentRank.toString().slice(-4)}`,
          score,
          sessions,
          efficiency: Math.round(efficiency),
          rank: currentRank
        });
      }
    }
    return list;
  }, [globalRank, userScore, userMonthlySessions, userAvgEfficiency, currentDay, grandmasters]);

  const displayList = activeTab === 'GRANDMASTER' ? grandmasters : localPeers;

  return (
    <div className="flex flex-col h-full bg-[#111318] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-white tracking-tighter italic uppercase leading-none">Bangladesh Arena</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Census: 2M Candidates</p>
          </div>
          <button onClick={handleRefresh} className={`p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-6 overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab('LOCAL')} className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'LOCAL' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>My Lobby</button>
          <button onClick={() => setActiveTab('GRANDMASTER')} className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'GRANDMASTER' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'text-slate-500 hover:text-slate-300'}`}>Top 100</button>
          <button onClick={() => setActiveTab('TIERS')} className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'TIERS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}>Tiers Info</button>
        </div>

        <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Global Rank</p>
              <p className="text-2xl font-black text-white italic">#{globalRank.toLocaleString()}</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Pure Points</p>
              <div className="flex items-center gap-2 justify-end">
                <p className="text-lg font-black text-white">{Math.round(userScore).toLocaleString()}</p>
                <RankBadge rank={globalRank} size="sm" />
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'TIERS' ? (
          <div className="space-y-3">
            {RANK_TIERS.map((t) => (
              <div key={t.tier} className="flex items-center gap-4 p-3 bg-white/2 border border-white/5 rounded-xl">
                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: t.color }} />
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase tracking-wider">{t.label}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{t.sessionThreshold}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase">POSITIONS</p>
                  <p className="text-[10px] font-mono text-slate-500">#{t.minRank.toLocaleString()} — #{t.maxRank.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayList.map((entry) => (
              <div key={entry.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${entry.isUser ? 'bg-blue-600/20 border border-blue-500/50 ring-2 ring-blue-500/20 scale-[1.02] z-10 relative' : 'bg-white/2 border border-white/5 opacity-80'}`}>
                <div className={`w-10 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${entry.rank <= 100 ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                  #{entry.rank > 9999 ? Math.floor(entry.rank / 1000) + 'k' : entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold truncate ${entry.isUser ? 'text-blue-400' : 'text-slate-300'}`}>{entry.isUser ? 'YOU (STUDENT)' : entry.name}</p>
                    <RankBadge rank={entry.rank} size="sm" />
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">{entry.sessions} SESS</span>
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">{entry.efficiency}% EFF</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${entry.isUser ? 'text-blue-400' : 'text-slate-300'}`}>{Math.round(entry.score).toLocaleString()}</p>
                  <p className="text-[7px] text-slate-600 uppercase font-black tracking-tighter">PTS</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 bg-black/40 text-center">
        <p className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Formula: Total Sessions × Efficiency (%)</p>
      </div>
    </div>
  );
};

export default Leaderboard;
