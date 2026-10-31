import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Pause, Play as PlayIcon } from 'lucide-react';
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
import BackgroundFx from '@/components/shared/BackgroundFx';
import HanoiBoard from '@/components/game/HanoiBoard';
import GameHud from '@/components/game/GameHud';
import GameControls from '@/components/game/GameControls';
import AutoSolveBar from '@/components/game/AutoSolveBar';
import TutorialBar from '@/components/game/TutorialBar';
import PauseOverlay from '@/components/game/PauseOverlay';
import VictoryOverlay from '@/components/game/VictoryOverlay';
import ChallengeOverlay from '@/components/game/ChallengeOverlay';
import useHanoiGame from '@/hooks/useHanoiGame';
import { computeLayout } from '@/lib/hanoi/layout';
import { MAX_DISKS, clampDiskCount, minMovesFor } from '@/lib/hanoi/engine';
import { MODE_IDS, autoTimeLimit, difficultyName, getMode } from '@/lib/hanoi/modes';
import { configureAudio } from '@/lib/hanoi/sfx';
import { formatTime } from '@/lib/hanoi/format';
import { loadSave, persist, recordRun, withSettings } from '@/lib/hanoi/storage';
import { clearResume, loadResume, saveResume } from '@/lib/hanoi/resume';
import { isTutorialDone } from '@/lib/hanoi/tutorial';
import { cn } from '@/lib/utils';

export default function Play() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // The guided tutorial always runs the classic 3-disk puzzle, whatever the link says.
  const wantsTutorial = params.get('tutorial') === '1';
  const modeParam = params.get('mode');
  const mode = wantsTutorial ? 'classic' : MODE_IDS.includes(modeParam) ? modeParam : 'classic';
  const modeInfo = getMode(mode);
  const diskCount = wantsTutorial ? 3 : clampDiskCount(Number(params.get('disks')));

  const limitParam = Number(params.get('limit'));
  const timeLimit =
    mode === 'timed'
      ? Number.isFinite(limitParam) && limitParam >= 30 && limitParam <= 1800
        ? Math.round(limitParam)
        : autoTimeLimit(diskCount)
      : null;

  const allowanceParam = Number(params.get('allowance'));
  const moveAllowance =
    mode === 'moves'
      ? Number.isFinite(allowanceParam) && allowanceParam >= 1
        ? Math.round(allowanceParam)
        : minMovesFor(diskCount)
      : null;

  // A saved game is restored only when the link asks for it and it matches this setup.
  const [saved] = useState(() => (params.get('resume') === '1' ? loadResume() : null));
  const initialState = useMemo(
    () => (saved && saved.mode === mode && saved.disks === diskCount ? saved : null),
    [saved, diskCount, mode]
  );

  const [save, setSave] = useState(() => loadSave());
  const settings = save.settings;
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [bestInfo, setBestInfo] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const recordedRef = useRef(false);

  useEffect(() => {
    configureAudio(settings);
  }, [settings.volume, settings.muted]);

  const boardBoxRef = useRef(null);
  const layoutRef = useRef(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = boardBoxRef.current;
    if (!element) return undefined;
    const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () => computeLayout(box.width, box.height, diskCount),
    [box.width, box.height, diskCount]
  );
  layoutRef.current = layout;

  // A first-time player gets the short guided tutorial on their first 3-disk game.
  const [tutorialEnabled] = useState(
    () => wantsTutorial || (mode === 'classic' && diskCount === 3 && !initialState && !isTutorialDone())
  );

  const game = useHanoiGame({
    diskCount,
    mode,
    timeLimit,
    moveAllowance,
    animSpeed: settings.animSpeed,
    showHints: settings.showHints,
    layoutRef,
    initialState,
    tutorialEnabled,
  });

  const patchSettings = useCallback((patch) => {
    setSave((current) => {
      const next = withSettings(current, patch);
      persist(next);
      return next;
    });
  }, []);

  const gameRef = useRef(game);
  gameRef.current = game;

  // The unfinished game is remembered so a reload or a trip to the menu can continue it.
  const writeResume = useCallback(() => {
    const current = gameRef.current;
    if (mode === 'auto' || current.finished || current.moves === 0) return;
    saveResume({
      mode,
      disks: diskCount,
      timeLimit,
      moveAllowance,
      towers: current.snapshot.towers,
      history: current.snapshot.history,
      moves: current.moves,
      seconds: Math.round(current.timer.read()),
      hintsUsed: current.hintsUsed,
    });
  }, [diskCount, mode, moveAllowance, timeLimit]);

  // Saved on every change, refreshed while time passes, and once more on the way out.
  useEffect(() => {
    if (mode === 'auto') return undefined;
    const write = () => writeResume();
    const id = window.setInterval(write, 5000);
    document.addEventListener('visibilitychange', write);
    window.addEventListener('beforeunload', write);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', write);
      window.removeEventListener('beforeunload', write);
      write();
    };
  }, [mode, writeResume]);

  useEffect(() => {
    writeResume();
  }, [writeResume, game.hintsUsed, game.moves, game.paused]);

  const handleRestart = useCallback(() => {
    clearResume();
    gameRef.current.restart();
  }, []);

  const requestRestart = useCallback(() => {
    const current = gameRef.current;
    if (current.snapshot.moves > 0 && !current.finished) {
      setConfirmRestart(true);
      return;
    }
    handleRestart();
  }, [handleRestart]);
  const requestRestartRef = useRef(requestRestart);
  requestRestartRef.current = requestRestart;

  // Keyboard control: arrows to choose a tower, Enter/Space to select or confirm.
  useEffect(() => {
    const onKeyDown = (event) => {
      const current = gameRef.current;
      const key = event.key;

      if (key === 'Escape') {
        event.preventDefault();
        if (!current.finished) current.togglePause();
        return;
      }
      if (current.finished || current.paused) return;

      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        event.preventDefault();
        setKeyboardActive(true);
        current.moveCursor(key === 'ArrowLeft' ? -1 : 1);
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        setKeyboardActive(true);
        current.selectTower(current.cursor);
        return;
      }
      if (key === 'u' || key === 'U') current.undo();
      else if (key === 'y' || key === 'Y') current.redo();
      else if (key === 'h' || key === 'H') current.hint();
      else if (key === 'p' || key === 'P') current.togglePause();
      else if (key === 'r' || key === 'R') requestRestartRef.current();
      else if (key === 'a' || key === 'A') current.startAutoSolve(1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    recordedRef.current = false;
    setBestInfo(null);
    setNewAchievements([]);
  }, [game.runId]);

  // Persist a finished run: best moves/times, score, achievements and history.
  useEffect(() => {
    const result = game.finished;
    if (!result || recordedRef.current) return;
    recordedRef.current = true;
    clearResume();
    if (result.type === 'win' && result.autoSolved) return;

    const seconds = Math.round(result.seconds || 0);
    const priorTime = save.bestTimes[diskCount] || null;
    const priorMoves = save.bestMoves[diskCount] || null;
    const { save: next, newAchievements: unlocked } = recordRun(save, { ...result, seconds });

    setSave(next);
    persist(next);
    setNewAchievements(unlocked);
    setBestInfo({
      time: next.bestTimes[diskCount] || priorTime,
      moves: next.bestMoves[diskCount] || priorMoves,
      newTime: result.type === 'win' && seconds > 0 && (!priorTime || seconds < priorTime),
      newMoves: result.type === 'win' && result.moves > 0 && (!priorMoves || result.moves < priorMoves),
    });
  }, [diskCount, game.finished]);

  const secondsLeft =
    mode === 'timed' && timeLimit ? Math.max(0, timeLimit - Math.floor(game.timer.elapsed)) : null;
  const lowTime = secondsLeft !== null && secondsLeft <= Math.max(10, timeLimit * 0.2);

  const chips = [
    { label: 'Disks', value: diskCount },
    {
      label: 'Moves',
      value:
        mode === 'moves' && moveAllowance
          ? `${game.moves} / ${moveAllowance}`
          : `${game.moves} / ${game.minMoves} min`,
    },
    { label: 'Minimum', value: game.minMoves },
  ];
  if (mode === 'timed') {
    chips.push({ label: 'Time left', value: formatTime(secondsLeft), tone: lowTime ? 'warn' : 'accent' });
  } else if (mode !== 'auto') {
    chips.push({ label: 'Time', value: formatTime(game.timer.elapsed) });
  }
  if (mode === 'moves' && moveAllowance) {
    chips.push({
      label: 'Left',
      value: Math.max(0, moveAllowance - game.moves),
      tone: lowTime ? 'warn' : undefined,
    });
  }
  if (game.hintsUsed > 0) chips.push({ label: 'Hints used', value: game.hintsUsed });
  chips.push({ label: 'Mode', value: autoSolveActiveLabel(game, modeInfo), tone: 'accent' });

  const boardLocked = Boolean(game.finished || game.paused || game.autoSolve || game.isAnimating);

  return (
    <div className="relative min-h-screen">
      <BackgroundFx />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-3 px-3 py-4 sm:px-6 sm:py-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Menu
            </Link>
            <div>
              <h1 className="font-heading text-lg font-bold text-slate-100 sm:text-xl">TOWER OF HANOI</h1>
              <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-300/70">
                {modeInfo.short} · {difficultyName(diskCount)}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={game.togglePause} className="gap-2">
            {game.paused ? <PlayIcon className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {game.paused ? 'Resume' : 'Pause'}
          </Button>
        </header>

        <GameHud
          chips={chips}
          progress={game.progress}
          progressLabel={`${Math.round(game.progress * 100)}% — disks on tower C`}
        />

        <div
          ref={boardBoxRef}
          className="toh-panel relative min-h-[300px] flex-1 overflow-hidden rounded-2xl sm:min-h-[420px]"
        >
          <HanoiBoard
            layout={layout}
            towers={game.board}
            flight={game.flight}
            selected={game.selected}
            shakeTower={game.shakeTower}
            shakeDisk={game.shakeDisk}
            cursor={game.cursor}
            showCursor={keyboardActive}
            onSelect={game.selectTower}
            validTargetsFor={game.validTargetsFor}
            tutorial={game.tutorial}
            onDrop={game.dropDisk}
            onPickup={game.playPickup}
            locked={boardLocked}
          />
        </div>

        <div className="min-h-[22px] text-sm">
          {game.message ? (
            <p
              data-message={game.message.kind}
              className={cn(
                'toh-fade-in',
                game.message.kind === 'invalid'
                  ? 'text-rose-300'
                  : game.message.kind === 'hint'
                    ? 'text-cyan-200'
                    : 'text-slate-300'
              )}
            >
              {game.message.text}
            </p>
          ) : (
            <p className="text-slate-500">
              Click a tower to lift its top disk, then click the tower it should move to. Arrow keys and Enter work
              too.
            </p>
          )}
        </div>

        {game.autoSolve ? (
          <AutoSolveBar
            state={game.autoSolve}
            onTogglePause={game.toggleAutoPause}
            onSpeedChange={game.setAutoSpeed}
            onStop={game.stopAutoSolve}
            onRestart={requestRestart}
          />
        ) : null}

        <TutorialBar tutorial={game.tutorial} onSkip={game.skipTutorial} />

        <GameControls
          onUndo={game.undo}
          onRedo={game.redo}
          onHint={game.hint}
          onRestart={requestRestart}
          onPause={game.togglePause}
          onAutoSolve={() => game.startAutoSolve(1)}
          canUndo={game.canUndo}
          canRedo={game.canRedo}
          hintDisabled={!game.hintsAllowed || Boolean(game.autoSolve) || Boolean(game.finished)}
          autoSolveActive={Boolean(game.autoSolve)}
          paused={game.paused}
        />
      </div>

      {game.paused && !game.finished ? (
        <PauseOverlay
          onResume={game.togglePause}
          onRestart={handleRestart}
          settings={settings}
          onSettingsChange={patchSettings}
        />
      ) : null}

      {game.finished && game.finished.type === 'win' ? (
        <VictoryOverlay
          result={game.finished}
          best={bestInfo}
          newAchievements={newAchievements}
          nextDisks={diskCount < MAX_DISKS ? diskCount + 1 : null}
          onReplay={game.restart}
        />
      ) : null}

      {game.finished && game.finished.type !== 'win' ? (
        <ChallengeOverlay result={game.finished} onRetry={game.restart} />
      ) : null}

      <AlertDialog open={confirmRestart} onOpenChange={setConfirmRestart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart this puzzle?</AlertDialogTitle>
            <AlertDialogDescription>
              Your moves, timer and history for this run will be reset. Statistics already saved stay untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep playing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleRestart();
                setConfirmRestart(false);
              }}
            >
              Yes, restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function autoSolveActiveLabel(game, modeInfo) {
  if (game.autoSolve) return `auto · ${Math.min(game.autoSolve.index + 1, game.autoSolve.total)}/${game.autoSolve.total}`;
  return modeInfo.short;
}