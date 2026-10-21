import { addOvertime, remainingSeconds, startBaseTimer, startShotTimer, subtractMinute } from './timer';

const NOW = 1_700_000_000_000;

test('základní čas podle typu zápasu', () => {
  expect(remainingSeconds(startBaseTimer('1v1', NOW), NOW)).toBe(600);
  expect(remainingSeconds(startBaseTimer('2v2', NOW), NOW)).toBe(900);
  expect(remainingSeconds(startBaseTimer('3v3', NOW), NOW)).toBe(1200);
});

test('zbývající čas se počítá z času konce, ne z počtu tiků', () => {
  const timer = startBaseTimer('1v1', NOW);
  // 4 minuty "zamčený mobil" bez jediného tiku
  expect(remainingSeconds(timer, NOW + 4 * 60_000)).toBe(360);
});

test('zbývající čas neklesne pod nulu', () => {
  expect(remainingSeconds(startShotTimer(NOW), NOW + 60_000)).toBe(0);
});

test('zaokrouhluje nahoru, aby 0:00 znamenalo opravdu konec', () => {
  expect(remainingSeconds(startShotTimer(NOW), NOW + 19_001)).toBe(1);
});

test('overtime přidá 5 minut', () => {
  const timer = addOvertime(startBaseTimer('1v1', NOW), NOW);
  expect(remainingSeconds(timer, NOW)).toBe(900);
});

test('-1 min nesmí posunout konec do minulosti', () => {
  const timer = subtractMinute(startShotTimer(NOW), NOW);
  expect(timer.endsAt).toBe(NOW);
});
