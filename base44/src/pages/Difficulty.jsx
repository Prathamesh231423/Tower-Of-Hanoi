import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, Play } from 'lucide-react';
import PageShell from '@/components/shared/PageShell';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  DIFFICULTIES,
  MODE_IDS,
  TIME_LIMITS,
  ALLOWANCE_OPTIONS,
  autoTimeLimit,
  difficultyName,
  getMode,
} from '@/lib/hanoi/modes';
import { MAX_DISKS, MIN_DISKS, clampDiskCount, minMovesFor } from '@/lib/hanoi/engine';
import { formatTime } from '@/lib/hanoi/format';

export default function Difficulty() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const modeParam = params.get('mode');
  const mode = getMode(MODE_IDS.includes(modeParam) ? modeParam : 'classic');

  const [disks, setDisks] = useState(3);
  const [limitChoice, setLimitChoice] = useState('auto');
  const [factor, setFactor] = useState(1);

  const valid = Number.isInteger(disks) && disks >= MIN_DISKS && disks <= MAX_DISKS;
  const minimum = minMovesFor(disks);
  const timeLimit =
    mode.id === 'timed' ? (limitChoice === 'auto' ? autoTimeLimit(disks) : Number(limitChoice)) : null;
  const allowance = mode.id === 'moves' ? Math.max(1, Math.ceil(minimum * factor)) : null;

  const start = () => {
    const safeDisks = clampDiskCount(disks);
    const query = new URLSearchParams({ mode: mode.id, disks: String(safeDisks) });
    if (mode.id === 'timed') {
      query.set('limit', String(limitChoice === 'auto' ? autoTimeLimit(safeDisks) : Number(limitChoice)));
    }
    if (mode.id === 'moves') {
      query.set('allowance', String(Math.max(1, Math.ceil(minMovesFor(safeDisks) * factor))));
    }
    navigate(`/play?${query.toString()}`);
  };

  const step = (delta) => setDisks((current) => clampDiskCount(current + delta));

  return (
    <PageShell
      title={mode.name}
      subtitle={`${mode.description} Choose a difficulty preset or set a custom disk count.`}
      backTo="/modes"
      backLabel="All modes"
    >
      <section className="toh-panel rounded-2xl p-5">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Difficulty presets</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DIFFICULTIES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setDisks(preset.disks)}
              className={cn(
                'rounded-xl border px-3 py-3 text-center transition-all duration-200',
                disks === preset.disks
                  ? 'border-violet-300/50 bg-violet-500/20 shadow-[0_0_30px_-12px_rgba(139,92,246,0.9)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.06]'
              )}
            >
              <span className="block font-heading text-sm font-semibold text-slate-100">{preset.name}</span>
              <span className="mt-1 block font-mono text-[11px] text-slate-400">{preset.disks} disks</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Custom disk count</h2>
            <p className="mt-1 text-xs text-slate-500">
              Between {MIN_DISKS} and {MAX_DISKS} disks ({difficultyName(disks)})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => step(-1)}
              disabled={disks <= MIN_DISKS}
              aria-label="Fewer disks"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-mono text-2xl font-semibold text-slate-100">{disks}</span>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => step(1)}
              disabled={disks >= MAX_DISKS}
              aria-label="More disks"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Slider
            value={[disks]}
            min={MIN_DISKS}
            max={MAX_DISKS}
            step={1}
            onValueChange={(value) => setDisks(clampDiskCount(value[0]))}
          />
        </div>
      </section>

      {mode.id === 'timed' ? (
        <section className="toh-panel rounded-2xl p-5">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Time limit</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLimitChoice('auto')}
              className={cn(
                'rounded-xl border px-4 py-2 text-sm transition-colors',
                limitChoice === 'auto'
                  ? 'border-cyan-300/50 bg-cyan-500/15 text-cyan-100'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
              )}
            >
              Auto · {formatTime(autoTimeLimit(disks))}
            </button>
            {TIME_LIMITS.map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => setLimitChoice(String(limit))}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm transition-colors',
                  limitChoice === String(limit)
                    ? 'border-cyan-300/50 bg-cyan-500/15 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                )}
              >
                {formatTime(limit)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {mode.id === 'moves' ? (
        <section className="toh-panel rounded-2xl p-5">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Move allowance</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ALLOWANCE_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setFactor(option.factor)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm transition-colors',
                  factor === option.factor
                    ? 'border-cyan-300/50 bg-cyan-500/15 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Minimum is <span className="font-mono text-slate-200">{minimum}</span> moves — this allows{' '}
            <span className="font-mono text-cyan-200">{Math.ceil(minimum * factor)}</span>.
          </p>
        </section>
      ) : null}

      <section className="toh-panel rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Disks</p>
            <p className="mt-1 font-mono text-lg text-slate-100">{disks}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Minimum moves</p>
            <p className="mt-1 font-mono text-lg text-cyan-200">{minimum}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Towers</p>
            <p className="mt-1 font-mono text-lg text-slate-100">A → C</p>
          </div>
        </div>
        {!valid ? (
          <p className="mt-4 text-sm text-rose-300">
            Choose a disk count between {MIN_DISKS} and {MAX_DISKS}.
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={start} disabled={!valid} className="gap-2">
            <Play className="h-4 w-4" />
            Start game
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/modes">Back</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}