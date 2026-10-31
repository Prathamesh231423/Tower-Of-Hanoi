import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DIFFICULTY = {
  easy:   { disks: 3, label: "Easy (3 disks)" },
  medium: { disks: 5, label: "Medium (5 disks)" },
  hard:   { disks: 7, label: "Hard (7 disks)" },
};

const DISK_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
];

function initTowers(n) {
  return [
    Array.from({ length: n }, (_, i) => n - i),
    [],
    [],
  ];
}

function minMoves(n) {
  return Math.pow(2, n) - 1;
}

export default function Home() {
  const [difficulty, setDifficulty] = useState("easy");
  const [towers, setTowers] = useState(() => initTowers(DIFFICULTY.easy.disks));
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const numDisks = DIFFICULTY[difficulty].disks;

  // Timer
  useEffect(() => {
    if (won || moves === 0) return;
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [won, moves]);

  // Win detection
  useEffect(() => {
    if (towers[2].length === numDisks && moves > 0) {
      setWon(true);
      clearInterval(timerRef.current);
    }
  }, [towers, numDisks, moves]);

  const resetGame = useCallback((diff) => {
    const d = diff || difficulty;
    setTowers(initTowers(DIFFICULTY[d].disks));
    setSelected(null);
    setMoves(0);
    setWon(false);
    setHistory([]);
    setRedoStack([]);
    setTimer(0);
    clearInterval(timerRef.current);
  }, [difficulty]);

  const handleDifficulty = (d) => {
    setDifficulty(d);
    resetGame(d);
  };

  const handlePegClick = (pegIdx) => {
    if (won) return;

    if (selected === null) {
      if (towers[pegIdx].length === 0) return;
      setSelected(pegIdx);
    } else {
      if (selected === pegIdx) {
        setSelected(null);
        return;
      }
      const from = towers[selected];
      const to = towers[pegIdx];
      const disk = from[from.length - 1];

      if (to.length > 0 && to[to.length - 1] < disk) {
        setSelected(null);
        return;
      }

      const newTowers = towers.map((t) => [...t]);
      newTowers[selected].pop();
      newTowers[pegIdx].push(disk);

      setHistory((h) => [...h, { towers: towers.map((t) => [...t]), from: selected, to: pegIdx }]);
      setRedoStack([]);
      setTowers(newTowers);
      setMoves((m) => m + 1);
      setSelected(null);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((r) => [...r, { towers: towers.map((t) => [...t]) }]);
    setTowers(last.towers);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => m - 1);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, { towers: towers.map((t) => [...t]) }]);
    setTowers(next.towers);
    setRedoStack((r) => r.slice(0, -1));
    setMoves((m) => m + 1);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const maxDiskWidth = 180;
  const minDiskWidth = 50;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          Tower of Hanoi
        </h1>
        <p className="text-muted-foreground mt-1">The Logic Challenge</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {Object.entries(DIFFICULTY).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleDifficulty(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              difficulty === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {val.label}
          </button>
        ))}
        <button
          onClick={() => resetGame()}
          className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Moves:</span>
          <span className="font-bold text-foreground">{moves}</span>
          <span className="text-muted-foreground">/ {minMoves(numDisks)} min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-bold text-foreground">{formatTime(timer)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="px-3 py-1 rounded text-xs bg-secondary text-secondary-foreground disabled:opacity-40 hover:bg-secondary/80 transition-colors"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="px-3 py-1 rounded text-xs bg-secondary text-secondary-foreground disabled:opacity-40 hover:bg-secondary/80 transition-colors"
          >
            Redo
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex gap-6 md:gap-12 items-end justify-center w-full max-w-4xl">
        {towers.map((peg, pegIdx) => (
          <div
            key={pegIdx}
            onClick={() => handlePegClick(pegIdx)}
            className={`relative flex flex-col items-center justify-end cursor-pointer rounded-lg p-2 pb-0 transition-all ${
              selected === pegIdx
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-secondary/40"
            }`}
            style={{ width: maxDiskWidth + 40, minHeight: numDisks * 28 + 60 }}
          >
            {/* Peg pole */}
            <div className="absolute bottom-2 w-1.5 bg-muted-foreground/30 rounded-full" style={{ height: numDisks * 28 + 20 }} />

            {/* Peg base */}
            <div className="w-full h-1.5 bg-muted-foreground/30 rounded-full relative z-10" />

            {/* Disks */}
            <div className="absolute bottom-4 flex flex-col-reverse items-center gap-0.5">
              <AnimatePresence>
                {peg.map((disk, diskIdx) => {
                  const width = minDiskWidth + ((disk - 1) / (numDisks - 1 || 1)) * (maxDiskWidth - minDiskWidth);
                  return (
                    <motion.div
                      key={disk}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`h-6 rounded-md ${DISK_COLORS[(disk - 1) % DISK_COLORS.length]} shadow-lg`}
                      style={{ width }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Peg label */}
            <span className="mt-2 text-xs text-muted-foreground font-medium">
              {["A", "B", "C"][pegIdx]}
            </span>
          </div>
        ))}
      </div>

      {/* Hint */}
      {selected !== null && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Click a destination peg to move disk {towers[selected][towers[selected].length - 1]}
        </p>
      )}

      {/* Win Banner */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
          >
            <div className="bg-card border border-border rounded-xl p-8 text-center shadow-2xl max-w-sm">
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">
                🎉 You Win!
              </h2>
              <p className="text-muted-foreground mb-1">
                Solved in <span className="font-bold text-foreground">{moves}</span> moves
                (optimal: {minMoves(numDisks)})
              </p>
              <p className="text-muted-foreground mb-4">
                Time: <span className="font-bold text-foreground">{formatTime(timer)}</span>
              </p>
              {moves === minMoves(numDisks) && (
                <p className="text-emerald-400 font-semibold mb-4">⭐ Perfect score!</p>
              )}
              <button
                onClick={() => resetGame()}
                className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground max-w-md mt-4">
        <p>Click a peg to pick up the top disk, then click another peg to place it.</p>
        <p>Move all disks from peg A to peg C. A larger disk cannot be placed on a smaller one.</p>
      </div>
    </div>
  );
}
