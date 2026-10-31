import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENTS, CARD_BASE } from '@/components/shared/cardStyles';

export default function MenuButton({ icon: Icon, label, description, to, onClick, accent = 'cyan' }) {
  const tone = ACCENTS[accent] || ACCENTS.cyan;
  const classes = cn(CARD_BASE, 'flex items-center gap-4 px-4 py-3 hover:-translate-y-1', tone.card);

  const content = (
    <>
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105',
          tone.icon
        )}
      >
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-base font-semibold text-slate-50">{label}</span>
        {description ? <span className="mt-0.5 block text-xs font-medium text-slate-300">{description}</span> : null}
      </span>
      <ChevronRight
        className={cn('h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1', tone.chevron)}
      />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}