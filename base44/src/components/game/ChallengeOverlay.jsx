import React from 'react';
import { Link } from 'react-router-dom';
import { House, RotateCcw, Timer, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChallengeOverlay({ result, onRetry }) {
  const isTimeUp = result.type === 'timeup';
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="toh-panel toh-fade-in w-full max-w-md rounded-3xl p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-500/15 text-rose-200">
          {isTimeUp ? <Timer className="h-6 w-6" /> : <Gauge className="h-6 w-6" />}
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold text-slate-100">
          {isTimeUp ? "TIME'S UP" : 'MOVE LIMIT EXCEEDED'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {isTimeUp
            ? `The ${result.disks}-disk puzzle was not finished within the time limit.`
            : `You used ${result.moves} moves — the allowance was ${result.allowance}. The puzzle rules kept working, but the challenge is lost.`}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Moves</p>
            <p className="mt-1 font-mono text-sm text-slate-100">{result.moves}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Minimum</p>
            <p className="mt-1 font-mono text-sm text-slate-100">{result.minMoves}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={onRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="secondary" className="gap-2">
            <Link to="/modes">
              <House className="h-4 w-4" />
              Change mode
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}