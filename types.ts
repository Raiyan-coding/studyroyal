
export interface StudySession {
  subject: string;
  rating: number | null;
}

export interface DayData {
  sessions: StudySession[];
  efficiency: number;
  submitted: boolean;
  submittedAt?: string;
  historical?: boolean;
}

export interface MissionDataStore {
  [key: string]: DayData;
}

export type RankTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'HEROIC' | 'MASTER' | 'GRANDMASTER';

export interface RankInfo {
  tier: RankTier;
  division: number; // 1-5
  label: string;
  color: string;
  minScore: number;
}
