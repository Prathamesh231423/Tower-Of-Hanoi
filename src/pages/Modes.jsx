import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Timer, Gauge, GraduationCap, Cpu, ChevronRight } from 'lucide-react';
import PageShell from '@/components/shared/PageShell';
import { MODES } from '@/lib/hanoi/modes';

const ICONS = {
  classic: Target,
  timed: Timer,
  moves: Gauge,
  practice: GraduationCap,
  auto: Cpu,
};

export default function Modes() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="Game Modes"
      subtitle="Five ways to play the same puzzle. Pick a mode, then choose how many disks to use."
    >
      {MODES.map((mode) => {
        const Icon = ICONS[mode.id] || Target;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => navigate(`/difficulty?mode=${mode.id}`)}
            className="group flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-left transition-all duration-300 hover:border-cyan-300/30 hover:bg-slate-900/70 active:scale-[0.995] sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-200/90 transition-colors group-hover:border-cyan-300/40">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-heading text-base font-semibold text-slate-100">{mode.name}</span>
                <span className="hidden text-[11px] uppercase tracking-[0.2em] text-slate-500 sm:inline">
                  {mode.tagline}
                </span>
              </span>
              <span className="mt-1 block text-sm text-slate-400">{mode.description}</span>
              <span className="mt-3 flex flex-wrap gap-2">
                {mode.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300"
                  >
                    {highlight}
                  </span>
                ))}
              </span>
            </span>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cyan-200" />
          </button>
        );
      })}
    </PageShell>
  );
}