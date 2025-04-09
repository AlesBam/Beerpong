export type MatchType = '1v1' | '2v2' | '3v3';

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
} 