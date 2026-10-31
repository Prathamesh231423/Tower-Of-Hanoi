import React from 'react';
import { GraduationCap, X } from 'lucide-react';
import { TOWER_LABELS } from '@/lib/hanoi/engine';

// Step-by-step guidance for a first-time player: first the disk to lift, then
// the tower to drop it on. The board glows in step with this text.
export default function TutorialBar({ tutorial, onSkip }) {
  if (!tutorial) return null;

  const picking = tutorial.phase !== 'drop';
  const fromLabel = TOWER_LABELS[tutorial.from];
  const toLabel = TOWER_LABELS[tutorial.to];

  const instruction = picking
    ? `Tap the glowing disk on tower ${fromLabel} to lift it.`
    : `Now tap tower ${toLabel} to place the disk there.`;

  return (
    <div className="toh-fade-in flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-400/15 text-cyan-100">
        <GraduationCap className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Tutorial · Step {tutorial.step} of {tutorial.total}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-100">{instruction}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Only the top disk of a tower can move, and a bigger disk never goes on a smaller one.
        </p>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3 w-3" />
        Skip
      </button>
    </div>
  );
}