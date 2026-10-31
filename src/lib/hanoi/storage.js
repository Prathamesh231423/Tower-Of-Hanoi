// Versioned local save. Every read is sanitized: a missing, corrupted or
// incompatible file loads defaults instead of throwing.

const KEY = 'toh-save-v1';
export const SAVE_VERSION = 1;

export const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Steps', description: 'Complete your first puzzle' },
  { id: 'perfect', name: 'Flawless Logic', description: 'Finish a puzzle in the minimum number of moves' },
  { id: 'no_hint', name: 'Unaided', description: 'Solve a 5-disk puzzle without hints' },
  { id: 'expert', name: 'Tower Master', description: 'Complete the 7-disk expert puzzle' },
  { id: 'speedy', name: 'Quick Thinker', description: 'Finish a 5-disk puzzle in under 3 minutes' },
  { id: 'veteran', name: 'Veteran', description: 'Complete 10 puzzles in total' },
];

export function defaultSettings() {
  return { volume: 0.6, muted: false, animSpeed: 1, showHints: true, reduceEffects: false };
}

export function defaultSave() {
  return {
    version: SAVE_VERSION,
    totalCompleted: 0,
    totalScore: 0,
    totalPlaySeconds: 0,
    highestDisks: 0,
    bestMoves: {},
    bestTimes: {},
    achievements: {},
    runs: [],
    settings: defaultSettings(),
  };
}

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function sanitizeCountMap(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.keys(raw).forEach((key) => {
    const diskKey = String(toNumber(key, NaN));
    const value = toNumber(raw[key], NaN);
    if (Number.isFinite(Number(key)) && Number.isFinite(value) && value >= 0) out[diskKey] = value;
  });
  return out;
}

function sanitizeSettings(raw) {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;
  const speed = toNumber(raw.animSpeed, base.animSpeed);
  return {
    volume: Math.max(0, Math.min(1, toNumber(raw.volume, base.volume))),
    muted: Boolean(raw.muted),
    animSpeed: [0.5, 1, 2, 4].includes(speed) ? speed : base.animSpeed,
    showHints: raw.showHints === undefined ? base.showHints : Boolean(raw.showHints),
    reduceEffects: Boolean(raw.reduceEffects),
  };
}

function sanitizeRuns(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((run) => run && typeof run === 'object')
    .map((run) => ({
      date: typeof run.date === 'string' ? run.date : new Date().toISOString(),
      mode: typeof run.mode === 'string' ? run.mode : 'classic',
      disks: Math.max(0, Math.round(toNumber(run.disks, 0))),
      moves: Math.max(0, Math.round(toNumber(run.moves, 0))),
      minMoves: Math.max(0, Math.round(toNumber(run.minMoves, 0))),
      seconds: Math.max(0, Math.round(toNumber(run.seconds, 0))),
      score: Math.max(0, Math.round(toNumber(run.score, 0))),
      efficiency: Math.max(0, Math.min(100, Math.round(toNumber(run.efficiency, 0)))),
    }))
    .slice(0, 12);
}

export function sanitize(raw) {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const achievements = {};
  if (raw.achievements && typeof raw.achievements === 'object') {
    ACHIEVEMENTS.forEach((achievement) => {
      if (raw.achievements[achievement.id]) achievements[achievement.id] = true;
    });
  }
  return {
    version: SAVE_VERSION,
    totalCompleted: Math.max(0, Math.round(toNumber(raw.totalCompleted, 0))),
    totalScore: Math.max(0, Math.min(1000000000, Math.round(toNumber(raw.totalScore, 0)))),
    totalPlaySeconds: Math.max(0, Math.round(toNumber(raw.totalPlaySeconds, 0))),
    highestDisks: Math.max(0, Math.min(12, Math.round(toNumber(raw.highestDisks, 0)))),
    bestMoves: sanitizeCountMap(raw.bestMoves),
    bestTimes: sanitizeCountMap(raw.bestTimes),
    achievements,
    runs: sanitizeRuns(raw.runs),
    settings: sanitizeSettings(raw.settings),
  };
}

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return sanitize(JSON.parse(raw));
  } catch (error) {
    return defaultSave();
  }
}

export function persist(save) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sanitize(save)));
    return true;
  } catch (error) {
    return false;
  }
}

export function clearSave() {
  try {
    window.localStorage.removeItem(KEY);
    return true;
  } catch (error) {
    return false;
  }
}

export function withSettings(save, patch) {
  return sanitize({ ...save, settings: { ...save.settings, ...patch } });
}

// Records a finished run. Returns the new save plus the achievements unlocked.
export function recordRun(save, result) {
  const next = sanitize(save);
  const seconds = Math.max(0, Math.round(toNumber(result.seconds, 0)));
  const newAchievements = [];
  next.totalPlaySeconds += seconds;

  const isWin = result.type === 'win' && !result.autoSolved;
  if (!isWin) return { save: next, newAchievements };

  const disks = Math.round(toNumber(result.disks, 0));
  const moves = Math.max(0, Math.round(toNumber(result.moves, 0)));
  const score = Math.max(0, Math.round(toNumber(result.score && result.score.total, 0)));
  const key = String(disks);

  next.totalCompleted += 1;
  next.totalScore += score;
  next.highestDisks = Math.max(next.highestDisks, disks);
  if (moves > 0 && (!next.bestMoves[key] || moves < next.bestMoves[key])) next.bestMoves[key] = moves;
  if (seconds > 0 && (!next.bestTimes[key] || seconds < next.bestTimes[key])) next.bestTimes[key] = seconds;

  const unlock = (id, condition) => {
    if (condition && !next.achievements[id]) {
      next.achievements[id] = true;
      newAchievements.push(id);
    }
  };
  unlock('first_win', true);
  unlock('perfect', moves === Math.round(toNumber(result.minMoves, -1)));
  unlock('no_hint', disks >= 5 && Math.round(toNumber(result.hintsUsed, 0)) === 0);
  unlock('expert', disks >= 7);
  unlock('speedy', disks >= 5 && seconds > 0 && seconds < 180);
  unlock('veteran', next.totalCompleted >= 10);

  next.runs = [
    {
      date: new Date().toISOString(),
      mode: typeof result.mode === 'string' ? result.mode : 'classic',
      disks,
      moves,
      minMoves: Math.round(toNumber(result.minMoves, 0)),
      seconds,
      score,
      efficiency: Math.round(toNumber(result.score && result.score.efficiency, 0)),
    },
    ...next.runs,
  ].slice(0, 12);

  return { save: next, newAchievements };
}