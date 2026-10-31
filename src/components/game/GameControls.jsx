import React from 'react';
import { Undo2, Redo2, Lightbulb, RotateCcw, Pause, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameControls({
  onUndo,
  onRedo,
  onHint,
  onRestart,
  onPause,
  onAutoSolve,
  canUndo,
  canRedo,
  hintDisabled,
  autoSolveActive,
  paused,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 [&>button]:min-h-[42px] [&>button]:flex-1 sm:[&>button]:min-h-0 sm:[&>button]:flex-none">
      <Button variant="secondary" size="sm" onClick={onUndo} disabled={!canUndo} className="gap-2">
        <Undo2 className="h-4 w-4" />
        Undo
      </Button>
      <Button variant="secondary" size="sm" onClick={onRedo} disabled={!canRedo} className="gap-2">
        <Redo2 className="h-4 w-4" />
        Redo
      </Button>
      <Button variant="secondary" size="sm" onClick={onHint} disabled={hintDisabled} className="gap-2">
        <Lightbulb className="h-4 w-4" />
        Hint
      </Button>
      <Button variant="secondary" size="sm" onClick={onRestart} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Restart
      </Button>
      <Button variant="secondary" size="sm" onClick={onPause} className="gap-2">
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        {paused ? 'Resume' : 'Pause'}
      </Button>
      <Button size="sm" onClick={onAutoSolve} disabled={autoSolveActive} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Auto-Solve
      </Button>
    </div>
  );
}