// Shared card styling for the main menu. Every class is a literal string so the
// Tailwind build always keeps it.

export const CARD_BASE =
  'group w-full rounded-2xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:translate-y-0 active:scale-[0.985]';

export const ACCENTS = {
  violet: {
    card: 'border-violet-400/25 bg-violet-500/[0.07] hover:border-violet-300/50 hover:bg-violet-500/[0.12] hover:shadow-lg hover:shadow-violet-500/20',
    icon: 'border-violet-400/30 bg-violet-500/10 text-violet-200 group-hover:border-violet-300/50 group-hover:text-violet-100',
    chevron: 'text-violet-300/50 group-hover:text-violet-200',
  },
  cyan: {
    card: 'border-white/10 bg-slate-900/40 hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20',
    icon: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200 group-hover:border-cyan-300/50 group-hover:text-cyan-100',
    chevron: 'text-cyan-300/50 group-hover:text-cyan-200',
  },
  amber: {
    card: 'border-white/10 bg-slate-900/40 hover:border-amber-300/40 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20',
    icon: 'border-amber-400/30 bg-amber-500/10 text-amber-200 group-hover:border-amber-300/50 group-hover:text-amber-100',
    chevron: 'text-amber-300/50 group-hover:text-amber-200',
  },
  emerald: {
    card: 'border-white/10 bg-slate-900/40 hover:border-emerald-300/40 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20',
    icon: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 group-hover:border-emerald-300/50 group-hover:text-emerald-100',
    chevron: 'text-emerald-300/50 group-hover:text-emerald-200',
  },
  fuchsia: {
    card: 'border-white/10 bg-slate-900/40 hover:border-fuchsia-300/40 hover:bg-fuchsia-500/10 hover:shadow-lg hover:shadow-fuchsia-500/20',
    icon: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200 group-hover:border-fuchsia-300/50 group-hover:text-fuchsia-100',
    chevron: 'text-fuchsia-300/50 group-hover:text-fuchsia-200',
  },
};