import { MatchTimer, MatchType } from './types';

export const SHOT_DURATION_MS = 20_000;
export const OVERTIME_MS = 5 * 60_000;
export const SUBTRACT_MS = 60_000;

const BASE_DURATION_MS: Record<MatchType, number> = {
  '1v1': 10 * 60_000,
  '2v2': 15 * 60_000,
  '3v3': 20 * 60_000,
};

// Časovač neukládá "kolik zbývá", ale "kdy to skončí" (endsAt, epoch ms).
// Zbývající čas se vždy dopočítá z aktuálního času, takže ho nerozbije
// obnovení stránky ani prohlížeč, který v pozadí zpomalí nebo zastaví setInterval.

export function startBaseTimer(type: MatchType, now: number): MatchTimer {
  return { phase: 'base', endsAt: now + BASE_DURATION_MS[type] };
}

export function startShotTimer(now: number): MatchTimer {
  return { phase: 'shot', endsAt: now + SHOT_DURATION_MS };
}

export function remainingSeconds(timer: MatchTimer, now: number): number {
  return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
}

export function addOvertime(timer: MatchTimer, now: number): MatchTimer {
  return { ...timer, endsAt: Math.max(timer.endsAt, now) + OVERTIME_MS };
}

export function subtractMinute(timer: MatchTimer, now: number): MatchTimer {
  return { ...timer, endsAt: Math.max(now, timer.endsAt - SUBTRACT_MS) };
}
