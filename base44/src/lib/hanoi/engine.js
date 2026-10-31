// Tower of Hanoi puzzle engine — pure logic, no rendering dependency.
// Implements the full rule set: only the top disk moves, never onto a smaller disk,
// and invalid moves never mutate the board.

export const TOWER_LABELS = ['A', 'B', 'C'];
export const MIN_DISKS = 3;
export const MAX_DISKS = 12;
export const TARGET_TOWER = 2;

export function isValidDiskCount(value) {
  return Number.isInteger(value) && value >= MIN_DISKS && value <= MAX_DISKS;
}

export function clampDiskCount(value) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return MIN_DISKS;
  return Math.min(MAX_DISKS, Math.max(MIN_DISKS, Math.round(parsed)));
}

// Theoretical minimum number of moves for n disks: 2^n - 1.
// Guarded so the result can never overflow or go negative.
export function minMovesFor(disks) {
  if (!isValidDiskCount(disks)) return 0;
  return Math.pow(2, disks) - 1;
}

export class HanoiEngine {
  constructor(diskCount = MIN_DISKS, target = TARGET_TOWER) {
    this.target = target;
    this.reset(diskCount);
  }

  reset(diskCount = this.diskCount) {
    this.diskCount = clampDiskCount(diskCount);
    this.towers = [[], [], []];
    for (let size = this.diskCount; size >= 1; size -= 1) this.towers[0].push(size);
    this.moves = 0;
    this.history = [];
    this.redoStack = [];
    return this;
  }

  get minMoves() {
    return minMovesFor(this.diskCount);
  }

  get canUndo() {
    return this.history.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  get isSolved() {
    return this.towers[this.target].length === this.diskCount;
  }

  topDiskAt(towerIndex) {
    const stack = this.towers[towerIndex];
    if (!stack || stack.length === 0) return null;
    return stack[stack.length - 1];
  }

  canMove(from, to) {
    if (!Number.isInteger(from) || !Number.isInteger(to)) return false;
    if (from < 0 || from > 2 || to < 0 || to > 2) return false;
    if (from === to) return false;
    const source = this.towers[from];
    const destination = this.towers[to];
    if (source.length === 0) return false;
    if (destination.length === 0) return true;
    return source[source.length - 1] < destination[destination.length - 1];
  }

  invalidReason(from, to) {
    if (from === to) return 'Source and destination are the same tower.';
    if (this.towers[from].length === 0) return `Tower ${TOWER_LABELS[from]} is empty.`;
    return "A bigger disk can't go on a smaller one.";
  }

  // Commits a move only when it satisfies every rule.
  move(from, to, { count = true, record = true } = {}) {
    if (!this.canMove(from, to)) return false;
    const disk = this.towers[from].pop();
    this.towers[to].push(disk);
    if (count) this.moves += 1;
    if (record) {
      this.history.push({ from, to, disk });
      this.redoStack = [];
    }
    return true;
  }

  undo() {
    if (!this.canUndo) return false;
    const entry = this.history.pop();
    const target = this.towers[entry.to];
    if (target.length === 0 || target[target.length - 1] !== entry.disk) return false;
    this.towers[entry.to].pop();
    this.towers[entry.from].push(entry.disk);
    this.moves = Math.max(0, this.moves - 1);
    this.redoStack.push(entry);
    return true;
  }

  redo() {
    if (!this.canRedo) return false;
    const entry = this.redoStack[this.redoStack.length - 1];
    if (!this.canMove(entry.from, entry.to)) return false;
    this.redoStack.pop();
    this.towers[entry.from].pop();
    this.towers[entry.to].push(entry.disk);
    this.moves += 1;
    this.history.push(entry);
    return true;
  }

  // Restores a saved position (used when an unfinished game is resumed).
  // Rejects anything that does not satisfy the puzzle invariants.
  loadState({ towers, moves = 0, history = [] } = {}) {
    if (!Array.isArray(towers) || towers.length !== 3) return false;
    const all = towers.flat();
    if (all.length !== this.diskCount) return false;
    if (new Set(all).size !== all.length) return false;
    if (all.some((disk) => !Number.isInteger(disk) || disk < 1 || disk > this.diskCount)) return false;
    const stacked = towers.every((stack) => stack.every((disk, index) => index === 0 || stack[index - 1] > disk));
    if (!stacked) return false;

    this.towers = towers.map((stack) => [...stack]);
    this.moves = Math.max(0, Math.round(Number(moves) || 0));
    this.history = Array.isArray(history)
      ? history
          .filter(
            (entry) =>
              entry &&
              Number.isInteger(entry.from) &&
              Number.isInteger(entry.to) &&
              Number.isInteger(entry.disk) &&
              entry.from >= 0 &&
              entry.from <= 2 &&
              entry.to >= 0 &&
              entry.to <= 2
          )
          .map((entry) => ({ from: entry.from, to: entry.to, disk: entry.disk }))
      : [];
    this.redoStack = [];
    return true;
  }

  // Every invariant the puzzle must always satisfy.
  invariantsHold() {
    const all = this.towers.flat();
    if (all.length !== this.diskCount) return false;
    if (new Set(all).size !== all.length) return false;
    return this.towers.every((stack) => stack.every((disk, index) => index === 0 || stack[index - 1] > disk));
  }

  snapshot() {
    return {
      towers: this.towers.map((stack) => [...stack]),
      moves: this.moves,
      minMoves: this.minMoves,
      diskCount: this.diskCount,
      history: this.history.map((entry) => ({ ...entry })),
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      solved: this.isSolved,
    };
  }
}