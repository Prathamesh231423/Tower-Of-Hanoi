import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { clearResume } from '@/lib/hanoi/resume';
import { difficultyName, getMode } from '@/lib/hanoi/modes';
import { formatTime } from '@/lib/hanoi/format';

// Continue / discard strip shown inside the Play card when a game is unfinished.
export default function ResumeRow({ record, onDiscard }) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const modeInfo = getMode(record.mode);
  const query = [`mode=${record.mode}`, `disks=${record.disks}`];
  if (record.timeLimit) query.push(`limit=${record.timeLimit}`);
  if (record.moveAllowance) query.push(`allowance=${record.moveAllowance}`);
  query.push('resume=1');

  const details = [
    modeInfo.short,
    difficultyName(record.disks),
    `${record.moves} move${record.moves === 1 ? '' : 's'} in ${formatTime(record.seconds)}`,
  ].join(' · ');

  return (
    <div className="toh-fade-in mt-3 rounded-xl border border-violet-400/30 bg-violet-500/10 p-2.5">
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-100">
          Unfinished game
        </span>
        <button
          type="button"
          onClick={() => setConfirmDiscard(true)}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-rose-200"
        >
          <X className="h-3 w-3" />
          Discard
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="px-1 text-xs font-medium text-slate-100">{details}</span>
        <Button
          asChild
          size="sm"
          className="h-8 rounded-lg px-3 font-heading font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-violet-500/40 active:translate-y-0 active:scale-[0.97]"
        >
          <Link to={`/play?${query.join('&')}`}>
            <RotateCcw className="h-3.5 w-3.5" />
            Continue
          </Link>
        </Button>
      </div>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this unfinished game?</AlertDialogTitle>
            <AlertDialogDescription>
              The saved position ({details}) will be removed. Statistics already recorded stay untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearResume();
                setConfirmDiscard(false);
                if (onDiscard) onDiscard();
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}