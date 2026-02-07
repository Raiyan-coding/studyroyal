
import { RankInfo, RankTier } from './types';

export const CONFIG = {
  FIXED_SESSIONS: 8,
  DAILY_TARGET: 12,
  MONTHLY_TARGET_SESSIONS: 310,
  SESSION_DURATION_MINS: 50,
  STORAGE_KEY: 'mission_tracker_pro_data',
  TIMEZONE: 'Asia/Dhaka',
  POPULATION_SIZE: 2000000,
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface EnhancedRankInfo {
  tier: RankTier;
  label: string;
  color: string;
  minRank: number; 
  maxRank: number; 
  division: number;
  percentile: string;
  sessionThreshold: string;
}

/**
 * Position-Based Ranking System
 * Calibrated for 2M candidates in Bangladesh based on provided study hour distribution
 */
export const RANK_TIERS: EnhancedRankInfo[] = [
  { tier: 'GRANDMASTER', label: 'Grandmaster', color: '#facc15', minRank: 1, maxRank: 100, division: 1, percentile: 'Top 100 Elite', sessionThreshold: '12+ Hours/Day' },
  { tier: 'MASTER', label: 'Master', color: '#d946ef', minRank: 101, maxRank: 19000, division: 3, percentile: 'Top 0.95%', sessionThreshold: '8-12 Hours/Day' },
  { tier: 'HEROIC', label: 'Heroic', color: '#f43f5e', minRank: 19001, maxRank: 49000, division: 3, percentile: 'Top 2.45%', sessionThreshold: '6-8 Hours/Day' },
  { tier: 'DIAMOND', label: 'Diamond', color: '#6366f1', minRank: 49001, maxRank: 149000, division: 3, percentile: 'Top 7.45%', sessionThreshold: '4-6 Hours/Day' },
  { tier: 'PLATINUM', label: 'Platinum', color: '#22d3ee', minRank: 149001, maxRank: 449000, division: 3, percentile: 'Top 22.45%', sessionThreshold: '3-4 Hours/Day' },
  { tier: 'GOLD', label: 'Gold', color: '#fbbf24', minRank: 449001, maxRank: 1049000, division: 3, percentile: 'Top 52.45%', sessionThreshold: '2-3 Hours/Day' },
  { tier: 'SILVER', label: 'Silver', color: '#94a3b8', minRank: 1049001, maxRank: 1749000, division: 3, percentile: 'Top 87.45%', sessionThreshold: '1-2 Hours/Day' },
  { tier: 'BRONZE', label: 'Bronze', color: '#cd7f32', minRank: 1749001, maxRank: 2000000, division: 3, percentile: 'Bottom 12.55%', sessionThreshold: '0-1 Hours/Day' }
];
