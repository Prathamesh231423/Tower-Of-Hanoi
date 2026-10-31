export const MODES = [
  {
    id: 'classic',
    name: 'Classic Puzzle',
    short: 'Classic',
    tagline: 'Your pace, your record',
    description:
      'Move every disk to tower C. No clock and no limit — just logic. Your moves and time are recorded.',
    highlights: ['Unlimited time', 'Move & time tracking', 'Scored at the end'],
  },
  {
    id: 'timed',
    name: 'Timed Challenge',
    short: 'Timed',
    tagline: 'Beat the clock',
    description:
      'The same puzzle with a countdown. Finish before time runs out — the clock warns you before it gets tight.',
    highlights: ['Configurable time limit', 'Low-time warning', 'Time bonus in your score'],
  },
  {
    id: 'moves',
    name: 'Move Challenge',
    short: 'Move limit',
    tagline: 'Efficiency under pressure',
    description:
      'You get a fixed number of moves on top of the theoretical minimum. Every wasted move counts against you.',
    highlights: ['Move allowance', 'Remaining moves shown', 'Perfect play rewarded'],
  },
  {
    id: 'practice',
    name: 'Practice Mode',
    short: 'Practice',
    tagline: 'Learn the pattern',
    description:
      'No clock and no penalties. Use hints, undo and redo freely to learn the recursive pattern behind the puzzle.',
    highlights: ['Hints always on', 'Undo & redo', 'No penalties'],
  },
  {
    id: 'auto',
    name: 'Auto-Solve',
    short: 'Auto-solve',
    tagline: 'Watch the algorithm',
    description:
      'The recursive solver walks through a perfect solution step by step. Pause it, change the speed, or run it instantly.',
    highlights: ['Step-by-step animation', 'Speed control', 'Pause & resume'],
  },
];

export const MODE_IDS = MODES.map((mode) => mode.id);

export function getMode(id) {
  return MODES.find((mode) => mode.id === id) || MODES[0];
}

export const DIFFICULTIES = [
  { name: 'Beginner', disks: 3 },
  { name: 'Easy', disks: 4 },
  { name: 'Medium', disks: 5 },
  { name: 'Hard', disks: 6 },
  { name: 'Expert', disks: 7 },
];

export function difficultyName(disks) {
  const preset = DIFFICULTIES.find((entry) => entry.disks === disks);
  return preset ? preset.name : `Custom · ${disks} disks`;
}

export const TIME_LIMITS = [60, 120, 180, 300];

export const ALLOWANCE_OPTIONS = [
  { label: 'Perfect play only', factor: 1 },
  { label: '25% extra', factor: 1.25 },
  { label: '50% extra', factor: 1.5 },
  { label: 'Double the minimum', factor: 2 },
];

export function autoTimeLimit(disks) {
  const minimum = Math.pow(2, disks) - 1;
  return Math.max(60, Math.ceil((minimum * 5) / 30) * 30);
}