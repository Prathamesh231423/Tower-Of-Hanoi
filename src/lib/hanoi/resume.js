// One unfinished game, remembered between visits.
// Everything read back is sanitized: a corrupted or hand-edited record is ignored.

import { MODE_IDS } from '@/lib/hanoi/modes';
import { TARGET_TOWER, isValidDiskCount } from '@/lib/hanoi/engine';

const KEY = 'toh-resume-v1';
const MAX_HISTORY = 400;

const toInt = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
};

export function sanitizeResume(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const mode = MODE_IDS.includes(raw.mode) && raw.mode !== 'auto' ? raw.mode : null;
  const disks = toInt(raw.disks);
  if (!mode || !isValidDiskCount(disks)) return null;

  if (!Array.isArray(raw.towers) || raw.towers.length !== 3) return null;
  const towers = [];
  for (const stack of raw.towers) {
    if (!Array.isArray(stack)) return null;
    const clean = stack.map(toInt);
    if (clean.some((disk) => disk === null)) return null;
    towers.push(clean);
  }

  const all = towers.flat();
  if (all.length !== disks) return null;
  if (new Set(all).size !== all.length) return null;
  if (all.some((disk) => disk < 1 || disk > disks)) return null;
  const stacked = towers.every((stack) => stack.every((disk, index) => index === 0 || stack[index - 1] > disk));
  if (!stacked) return null;
  if (towers[TARGET_TOWER].length === disks) return null;

  const moves = toInt(raw.moves);
  const seconds = toInt(raw.seconds);
  if (moves === null || moves <= 0) return null;
  if (seconds === null || seconds < 0) return null;

  const timeLimit = toInt(raw.timeLimit);
  const allowance = toInt(raw.moveAllowance);

  const history = Array.isArray(raw.history)
    ? raw.history
        .filter(
          (entry) =>
            entry &&
            Number.isInteger(entry.from) &&
            Number.isInteger(entry.to) &&
            Number.isInteger(entry.disk) &&
            entry.from >= 0 &&
            entry.from <= 2 &&
            entry.to >= 0 &&
            entry.to <= 2 &&
            entry.disk >= 1 &&
            entry.disk <= disks
        )
        .slice(-MAX_HISTORY)
        .map((entry) => ({ from: entry.from, to: entry.to, disk: entry.disk }))
    : [];

  return {
    mode,
    disks,
    timeLimit: mode === 'timed' && timeLimit && timeLimit >= 30 ? timeLimit : null,
    moveAllowance: mode === 'moves' && allowance && allowance >= 1 ? allowance : null,
    towers,
    history,
    moves,
    seconds,
    hintsUsed: Math.max(0, toInt(raw.hintsUsed) ?? 0),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

export function loadResume() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return sanitizeResume(JSON.parse(raw));
  } catch (error) {
    return null;
  }
}

export function saveResume(record) {
  const clean = sanitizeResume({ ...record, updatedAt: new Date().toISOString() });
  if (!clean) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(clean));
    return true;
  } catch (error) {
    return false;
  }
}

export function clearResume() {
  try {
    window.localStorage.removeItem(KEY);
    return true;
  } catch (error) {
    return false;
  }
}