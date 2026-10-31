import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { House, RotateCcw, ChevronRight, Award, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Stars from '@/components/game/Stars';
import { formatTime } from '@/lib/hanoi/format';
import { ACHIEVEMENTS, loadSave } from '@/lib/hanoi/storage';

function Tile({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${tone === 'accent' ? 'text-cyan-100' : 'text-slate-100'}`}>
        {value}
      </p>
    </div>
  );
}

export default function VictoryOverlay({ result, best, newAchievements = [], nextDisks = null, onReplay }) {
  const extra = Math.max(0, result.moves - result.minMoves);
  const stars = Math.max(0, Math.min(3, Number(result.stars) || 0));
  const unlocked = ACHIEVEMENTS.filter((achievement) => newAchievements.includes(achievement.id));
  const [reduced] = useState(() => loadSave().settings.reduceEffects);

  // A short confetti burst for a scored win.
  useEffect(() => {
    if (result.autoSolved || reduced) return undefined;
    const colors = ['#a78bfa', '#67e8f9', '#f0abfc', '#fcd34d'];
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.35 },
      colors,
      disableForReducedMotion: true,
    });
    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 110,
        startVelocity: 30,
        origin: { y: 0.5 },
        colors,
        disableForReducedMotion: true,
      });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [reduced, result.autoSolved]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm sm:items-center">
      <div className="toh-panel toh-fade-in my-auto w-full max-w-xl rounded-3xl p-6">
        <p className="text-center text-[11px] uppercase tracking-[0.4em] text-cyan-300/80">Tower of Hanoi</p>
        {result.tutorial ? (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-100">
            <GraduationCap className="h-3.5 w-3.5" />
            Tutorial complete — you're ready to play
          </span>
        ) : null}
        <h2 className="mt-2 text-center font-heading text-3xl font-bold text-gradient">PUZZLE SOLVED!</h2>
        {result.autoSolved ? (
          <p className="mt-2 text-center text-sm text-amber-200/90">
            Solved by the solver — this run is not scored or saved.
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-slate-400">
            {result.moves === result.minMoves
              ? 'Perfect solution — exactly the minimum number of moves.'
              : `You finished ${extra} move${extra === 1 ? '' : 's'} above the minimum.`}
          </p>
        )}

        {!result.autoSolved && stars > 0 ? <Stars count={stars} /> : null}

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Tile label="Disks" value={result.disks} />
          <Tile label="Total moves" value={result.moves} />
          <Tile label="Minimum" value={result.minMoves} />
          <Tile label="Extra moves" value={extra} />
          <Tile label="Time" value={formatTime(result.seconds)} />
          <Tile
            label="Efficiency"
            value={`${result.score.efficiency}%`}
            tone="accent"
          />
          <Tile label="Best time" value={best && best.time ? formatTime(best.time) : '—'} />
          <Tile label="Best moves" value={best && best.moves ? best.moves : '—'} />
          <Tile label="Score" value={result.autoSolved ? '—' : result.score.total} tone="accent" />
        </div>

        {!result.autoSolved && result.score.items.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Score breakdown</p>
            <ul className="mt-2 space-y-1">
              {result.score.items.map((item) => (
                <li key={item.label} className="flex items-center justify-between text-xs text-slate-300">
                  <span>{item.label}</span>
                  <span className="font-mono text-slate-100">+{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {best && (best.newTime || best.newMoves) ? (
          <p className="mt-3 text-center text-xs font-medium text-cyan-200">
            {best.newTime && best.newMoves
              ? 'New best time and best moves for this disk count!'
              : best.newTime
                ? 'New best time for this disk count!'
                : 'New best move count for this disk count!'}
          </p>
        ) : null}

        {unlocked.length > 0 ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {unlocked.map((achievement) => (
              <span
                key={achievement.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/40 bg-violet-500/15 px-3 py-1 text-xs text-violet-100"
              >
                <Award className="h-3.5 w-3.5" />
                {achievement.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={onReplay} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Play again
          </Button>
          {nextDisks ? (
            <Button asChild variant="secondary" className="gap-2">
              <Link to={`/play?mode=${result.mode}&disks=${nextDisks}`}>
                Next level
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="secondary" className="gap-2">
            <Link to="/">
              <House className="h-4 w-4" />
              Main menu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}