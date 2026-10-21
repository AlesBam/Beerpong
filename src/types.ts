export type MatchType = '1v1' | '2v2' | '3v3';

export type LeagueType = '1. League' | '2. League';

export type TimerPhase = 'base' | 'shot';

export interface MatchTimer {
  phase: TimerPhase;
  endsAt: number; // epoch ms
}

export interface Player {
  name: string;
  hits: number;
  misses: number;
}

export interface Match {
  id: string;
  type: MatchType;
  players: Player[];
  history: {
    playerIndex: number;
    result: 'hit' | 'miss';
    timestamp: string;
  }[];
  team1Name: string;
  team2Name: string;
  useTimer: boolean;
  timer?: MatchTimer;
  premierLeague: boolean;
  selectedLeague?: LeagueType;
  endTimestamp?: string;
} 