import React from 'react';
import { Link } from 'react-router-dom';
import { MousePointer2, Keyboard, Calculator, Timer, Undo2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageShell from '@/components/shared/PageShell';
import { MODES } from '@/lib/hanoi/modes';

const RULES = [
  'All disks start stacked on tower A, largest at the bottom, smallest on top.',
  'Move the whole stack to tower C. Tower B is the spare tower.',
  'Only one disk may be moved at a time.',
  'Only the top disk of a tower can be picked up.',
  'A larger disk may never be placed on top of a smaller one.',
  'A move is accepted only when every rule is satisfied — an illegal move never changes the board.',
  'The puzzle is solved when all disks sit on tower C in the correct order.',
];

const CONTROLS = [
  ['Click a tower', 'Lift that tower’s top disk (it is highlighted)'],
  ['Click another tower', 'Move the lifted disk there'],
  ['Click the same tower again', 'Cancel the selection'],
  ['← / →', 'Choose a tower with the keyboard'],
  ['Enter / Space', 'Select the chosen tower, or confirm the move'],
  ['Escape', 'Pause the game (or close the pause menu)'],
  ['U / Y', 'Undo / redo the last move'],
  ['H', 'Show the next recommended move'],
  ['R', 'Restart the puzzle'],
  ['A', 'Start the auto-solver'],
];

export default function HowToPlay() {
  return (
    <PageShell title="How to Play" subtitle="The rules, the controls, the modes and how your score is worked out.">
      <section className="toh-panel rounded-2xl p-5">
        <h2 className="font-heading text-base font-semibold text-slate-100">The rules</h2>
        <ul className="mt-3 space-y-2">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-3 text-sm text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
              {rule}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
          Minimum possible moves for <span className="font-mono text-cyan-200">n</span> disks:{' '}
          <span className="font-mono text-cyan-200">2ⁿ − 1</span> — that is 7 moves for 3 disks and 31 for 5 disks.
        </p>
        <Button asChild className="mt-4 gap-2">
          <Link to="/play?mode=classic&disks=3&tutorial=1">
            <GraduationCap className="h-4 w-4" />
            Start the guided tutorial
          </Link>
        </Button>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
          <MousePointer2 className="h-4 w-4 text-cyan-200" />
          Mouse
        </h2>
        <ul className="mt-3 space-y-2">
          {CONTROLS.slice(0, 3).map(([action, effect]) => (
            <li key={action} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:gap-3">
              <span className="font-mono text-xs text-cyan-200 sm:w-56">{action}</span>
              <span className="text-slate-300">{effect}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
          <Keyboard className="h-4 w-4 text-cyan-200" />
          Keyboard
        </h2>
        <ul className="mt-3 space-y-2">
          {CONTROLS.slice(3).map(([action, effect]) => (
            <li key={action} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:gap-3">
              <span className="font-mono text-xs text-cyan-200 sm:w-56">{action}</span>
              <span className="text-slate-300">{effect}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="font-heading text-base font-semibold text-slate-100">Game modes</h2>
        <div className="mt-3 space-y-3">
          {MODES.map((mode) => (
            <div key={mode.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="font-heading text-sm font-semibold text-slate-100">{mode.name}</p>
              <p className="mt-1 text-sm text-slate-400">{mode.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
          <Calculator className="h-4 w-4 text-cyan-200" />
          Scoring
        </h2>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <p>
            <span className="font-mono text-cyan-200">Efficiency</span> = minimum moves ÷ your moves × 100.
          </p>
          <p>
            <span className="font-mono text-cyan-200">Completion</span> = disks × 100 × efficiency.
          </p>
          <p>
            <span className="font-mono text-cyan-200">Perfect bonus</span> = +50 bonus for finishing in exactly the
            minimum number of moves.
          </p>
          <p>
            <span className="font-mono text-cyan-200">No hints</span> = +10% of the completion value when you solve it
            without hints.
          </p>
          <p>
            <span className="font-mono text-cyan-200">Time bonus</span> = up to +50% of the completion value for time
            left over in a timed challenge.
          </p>
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
            Scores are whole numbers, never negative, and are capped at 1,000,000. A puzzle solved by the auto-solver
            is not scored and does not change your records.
          </p>
        </div>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
          <Timer className="h-4 w-4 text-cyan-200" />
          Timer, undo and history
        </h2>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <p>The clock starts with your first valid move (immediately in a timed challenge) and stops when you finish.</p>
          <p>Pausing freezes the clock and any move animation. Paused time is never counted.</p>
          <p>
            <Undo2 className="mr-1 inline h-3.5 w-3.5 text-cyan-200" />
            Undo and redo restore a full valid board state and adjust the move counter. The timer keeps running through
            undo and redo, because it measures your session. Making a new move after an undo clears the redo history.
          </p>
        </div>
      </section>
    </PageShell>
  );
}