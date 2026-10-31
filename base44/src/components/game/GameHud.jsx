import React from 'react';
import { cn } from '@/lib/utils';

export default function GameHud({ chips, progress, progressLabel }) {
  return (
    <section className="toh-panel rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-1.5',
              chip.tone === 'warn'
                ? 'border-rose-400/40 bg-rose-500/10'
                : chip.tone === 'accent'
                  ? 'border-cyan-300/30 bg-cyan-500/10'
                  : 'border-white/10 bg-white/[0.03]'
            )}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{chip.label}</span>
            <span
              className={cn(
                'font-mono text-sm font-semibold',
                chip.tone === 'warn' ? 'text-rose-200' : chip.tone === 'accent' ? 'text-cyan-100' : 'text-slate-100'
              )}
            >
              {chip.value}
            </span>
          </div>
        ))}
      </div>

      {progress !== undefined ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300 transition-[width] duration-500 ease-out"
              style={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] text-slate-400">{progressLabel}</span>
        </div>
      ) : null}
    </section>
  );
}