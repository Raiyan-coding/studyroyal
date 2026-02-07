
import React from 'react';
import { RANK_TIERS, EnhancedRankInfo } from '../constants';

interface RankBadgeProps {
  rank: number; // Pass the position here
  size?: 'sm' | 'md' | 'lg';
}

export const getRankDataFromPosition = (rank: number) => {
  const currentRank = RANK_TIERS.find(t => rank >= t.minRank && rank <= t.maxRank) || RANK_TIERS[RANK_TIERS.length - 1];
  
  let divisionNum = 1;
  if (currentRank.tier !== 'GRANDMASTER' && currentRank.division > 1) {
    const range = currentRank.maxRank - currentRank.minRank;
    const progressInTier = currentRank.maxRank - rank; // Better rank = smaller number
    const divSize = range / currentRank.division;
    // Ascending: Rank 1 is higher than Rank 3 within a tier
    divisionNum = Math.min(currentRank.division, Math.floor(progressInTier / divSize) + 1);
  }

  return { currentRank, divisionNum };
};

const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md' }) => {
  const { currentRank, divisionNum } = getRankDataFromPosition(rank);

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[8px]',
    md: 'px-2 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-xs'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 font-black rounded border uppercase tracking-tighter ${sizeClasses[size]} shadow-sm transition-all duration-500`}
      style={{ 
        backgroundColor: `${currentRank.color}15`, 
        borderColor: `${currentRank.color}40`,
        color: currentRank.color,
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentRank.color }} />
      {currentRank.label} {currentRank.tier !== 'GRANDMASTER' ? divisionNum : ''}
    </div>
  );
};

export default RankBadge;
