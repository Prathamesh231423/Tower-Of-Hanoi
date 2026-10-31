import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACCENTS, CARD_BASE } from '@/components/shared/cardStyles';
import DiskCountPicker from '@/components/shared/DiskCountPicker';
import ResumeRow from '@/components/shared/ResumeRow';
import { loadResume } from '@/lib/hanoi/resume';

// The Play card: pick a disk count, start, or continue an unfinished game.
export default function PlayCard() {
  const [disks, setDisks] = useState(3);
  const [record, setRecord] = useState(() => loadResume());
  const tone = ACCENTS.violet;

  return (
    <div className={cn(CARD_BASE, 'flex flex-col px-4 py-3.5 hover:-translate-y-0.5', tone.card)}>
      <div className="flex items-center gap-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105',
            tone.icon
          )}
        >
          <Play className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-base font-semibold text-slate-50">Play</span>
          <span className="mt-0.5 block text-xs font-medium text-slate-300">
            Classic puzzle — choose your disks
          </span>
        </span>
      </div>

      {record ? <ResumeRow record={record} onDiscard={() => setRecord(null)} /> : null}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">Disks</span>
          <DiskCountPicker value={disks} onChange={setDisks} />
        </div>
        <Button
          asChild
          size="sm"
          className="h-9 rounded-xl px-4 font-heading font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-violet-500/40 active:translate-y-0 active:scale-[0.97]"
        >
          <Link to={`/play?mode=classic&disks=${disks}`}>
            Start
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}