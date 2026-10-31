import React from 'react';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SPEEDS = [
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
  { label: 'Instant', value: 'instant' },
];

export default function AutoSolveBar({ state, onTogglePause, onSpeedChange, onStop, onRestart }) {
  if (!state) return null;
  const step = Math.min(state.index + 1, state.total);

  return (
    <section className="toh-panel rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">Auto-solving</span>
          <span className="font-mono text-sm text-slate-100">
            Step {step} / {state.total}
          </span>
          {state.paused ? <span className="text-[11px] text-amber-200/90">paused</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {SPEEDS.map((speed) => (
              <button
                key={speed.label}
                type="button"
                onClick={() => onSpeedChange(speed.value)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  state.speed === speed.value ? 'bg-violet-500/80 text-white' : 'text-slate-300 hover:bg-white/10'
                )}
              >
                {speed.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={onTogglePause} className="gap-2">
            {state.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {state.paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="secondary" size="sm" onClick={onRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
          <Button variant="secondary" size="sm" onClick={onStop} className="gap-2">
            <X className="h-4 w-4" />
            Stop
          </Button>
        </div>
      </div>
    </section>
  );
}