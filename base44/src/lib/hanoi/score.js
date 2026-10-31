// Scoring — documented, clamped to a non-negative integer, overflow safe.
//
//   completion   =  100 x disks x efficiency        (efficiency = min/actual)
//   perfect      = +50 x disks x 100               (finished in minimum moves)
//   no hints     = +10 x disks x 100               (no hint used)
//   time bonus   = +50 x disks x 100 x (time left / limit)   (timed mode)
//
// Auto-solved runs never score.

const MAX_SCORE = 1000000;

export function moveEfficiency(minMoves, actualMoves) {
  const min = Number(minMoves);
  const actual = Number(actualMoves);
  if (!Number.isFinite(min) || !Number.isFinite(actual)) return 0;
  if (min <= 0 || actual <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((min / actual) * 100)));
}

// Star rating: 3 stars for a perfect run, 2 within 25% extra moves, 1 otherwise.
export function starsFor(minMoves, actualMoves) {
  const min = Number(minMoves);
  const actual = Number(actualMoves);
  if (!Number.isFinite(min) || !Number.isFinite(actual) || min <= 0 || actual <= 0) return 0;
  if (actual <= min) return 3;
  if (actual <= Math.ceil(min * 1.25)) return 2;
  return 1;
}

export function scoreBreakdown({
  disks,
  minMoves,
  actualMoves,
  hintsUsed = 0,
  timeBonusFraction = 0,
  autoSolved = false,
}) {
  const efficiency = moveEfficiency(minMoves, actualMoves);
  if (autoSolved) {
    return { total: 0, efficiency, items: [{ label: 'Solved by the solver', value: 0 }] };
  }

  const base = Math.max(1, Number(disks) || 1) * 100;
  const completion = Math.round(base * (efficiency / 100));
  const perfect = actualMoves === minMoves ? Math.round(base * 0.5) : 0;
  const noHints = hintsUsed === 0 ? Math.round(base * 0.1) : 0;
  const bonusPool = Math.max(0, Math.min(1, Number(timeBonusFraction) || 0));
  const timeBonus = bonusPool > 0 ? Math.round(base * 0.5 * bonusPool) : 0;

  const items = [
    { label: 'Completion', value: completion },
    perfect > 0 ? { label: 'Perfect (minimum moves)', value: perfect } : null,
    noHints > 0 ? { label: 'No hints used', value: noHints } : null,
    timeBonus > 0 ? { label: 'Time bonus', value: timeBonus } : null,
  ].filter(Boolean);

  const raw = items.reduce((sum, item) => sum + item.value, 0);
  const total = Math.max(0, Math.min(MAX_SCORE, Math.round(raw)));
  return { total, efficiency, items };
}