// Tower of Hanoi solver. Independent of rendering, so it can be used for
// auto-solve and hints, and validated on its own.
//
// solveFromStart  — the classic recursion (n-1 to auxiliary, largest to
//                   destination, n-1 from auxiliary). Always 2^n - 1 moves.
// solveFromState  — the optimal completion from *any* legal position, used for
//                   hints and auto-solve after the player has already moved.

export function solveFromStart(disks, from = 0, to = 2) {
  const moves = [];
  const walk = (n, source, destination, auxiliary) => {
    if (n === 0) return;
    walk(n - 1, source, auxiliary, destination);
    moves.push({ from: source, to: destination });
    walk(n - 1, auxiliary, destination, source);
  };
  walk(disks, from, to, 3 - from - to);
  return moves;
}

export function solveFromState(towers, diskCount, target = 2) {
  const simulation = towers.map((stack) => [...stack]);
  const moves = [];

  const positionOf = (disk) => {
    for (let i = 0; i < 3; i += 1) {
      if (simulation[i].includes(disk)) return i;
    }
    return -1;
  };

  const commit = (from, to) => {
    if (from < 0 || to < 0 || from === to) return;
    simulation[to].push(simulation[from].pop());
    moves.push({ from, to });
  };

  const moveTowerTo = (n, destination) => {
    if (n === 0) return;
    const position = positionOf(n);
    if (position === destination) {
      moveTowerTo(n - 1, destination);
      return;
    }
    const spare = 3 - position - destination;
    moveTowerTo(n - 1, spare);
    commit(positionOf(n), destination);
    moveTowerTo(n - 1, destination);
  };

  moveTowerTo(diskCount, target);
  return moves;
}

export function nextHint(towers, diskCount, target = 2) {
  const moves = solveFromState(towers, diskCount, target);
  return moves.length > 0 ? moves[0] : null;
}

export function remainingMoves(towers, diskCount, target = 2) {
  return solveFromState(towers, diskCount, target).length;
}