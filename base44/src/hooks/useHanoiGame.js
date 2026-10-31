import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HanoiEngine, TARGET_TOWER, TOWER_LABELS } from '@/lib/hanoi/engine';
import { nextHint, solveFromState } from '@/lib/hanoi/solver';
import { scoreBreakdown, starsFor } from '@/lib/hanoi/score';
import { markTutorialDone } from '@/lib/hanoi/tutorial';
import { sfx } from '@/lib/hanoi/sfx';
import useFlightAnimation from '@/hooks/useFlightAnimation';
import useGameTimer from '@/hooks/useGameTimer';

const SHAKE_MS = 420;
const FLASH_MS = 2600;
const NO_TOWERS = [];

export default function useHanoiGame({
  diskCount,
  mode,
  timeLimit = null,
  moveAllowance = null,
  animSpeed = 1,
  showHints = true,
  layoutRef,
  initialState = null,
  tutorialEnabled = false,
}) {
  const engineRef = useRef(null);
  const restoredRef = useRef(false);
  if (!engineRef.current) {
    engineRef.current = new HanoiEngine(diskCount);
    if (initialState) restoredRef.current = engineRef.current.loadState(initialState);
  }

  const [snapshot, setSnapshot] = useState(() => engineRef.current.snapshot());
  const [runId, setRunId] = useState(0);
  const [selected, setSelected] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [message, setMessage] = useState(() =>
    restoredRef.current
      ? { kind: 'info', text: 'Puzzle restored — carrying on from your saved position.' }
      : null
  );
  const [shakeTower, setShakeTower] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(() => (restoredRef.current ? initialState.hintsUsed : 0));
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(null);
  const [autoSolve, setAutoSolve] = useState(null);
  const [shakeDisk, setShakeDisk] = useState(null);
  const [tutorialOn, setTutorialOn] = useState(Boolean(tutorialEnabled));

  const autoRef = useRef(null);
  const speedRef = useRef(animSpeed);
  const pausedRef = useRef(false);
  const flashTimer = useRef(null);
  const shakeTimer = useRef(null);
  const shakeDiskTimer = useRef(null);
  const readElapsed = useRef(() => 0);

  const currentSpeed = autoSolve && autoSolve.speed !== 'instant' ? autoSolve.speed : animSpeed;
  speedRef.current = currentSpeed;
  pausedRef.current = paused || (autoSolve ? autoSolve.paused : false);

  const timerRunning =
    !paused && !finished && !autoSolve && (snapshot.moves > 0 || mode === 'timed');
  const timer = useGameTimer({
    running: timerRunning,
    countdownFrom: mode === 'timed' ? timeLimit : null,
    initialSeconds: restoredRef.current ? initialState.seconds : 0,
  });
  readElapsed.current = timer.read;

  const flash = useCallback((msg, ms = FLASH_MS) => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = null;
    setMessage(msg);
    if (ms > 0) flashTimer.current = window.setTimeout(() => setMessage(null), ms);
  }, []);

  const shake = useCallback((towerIndex) => {
    if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    setShakeTower(towerIndex);
    shakeTimer.current = window.setTimeout(() => setShakeTower(null), SHAKE_MS);
  }, []);

  // An illegal move shakes the disk the player aimed, not the tower they aimed at.
  const shakeDiskOn = useCallback((disk) => {
    if (disk === null || disk === undefined) return;
    if (shakeDiskTimer.current) window.clearTimeout(shakeDiskTimer.current);
    setShakeDisk(disk);
    shakeDiskTimer.current = window.setTimeout(() => setShakeDisk(null), SHAKE_MS);
  }, []);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
      if (shakeDiskTimer.current) window.clearTimeout(shakeDiskTimer.current);
    },
    []
  );

  // A committed move is applied to the logical board exactly once, at the drop.
  const handleCommit = useCallback((job) => {
    const engine = engineRef.current;
    const auto = autoRef.current !== null;
    if (!engine.move(job.from, job.to, { count: !auto, record: !auto })) return;
    setSnapshot(engine.snapshot());
    if (auto) sfx.tick();
    else sfx.land();
    if (auto && autoRef.current) {
      const next = { ...autoRef.current, index: autoRef.current.index + 1 };
      autoRef.current = next;
      setAutoSolve(next);
    }
  }, []);

  const animation = useFlightAnimation({
    speedRef,
    pausedRef,
    onCommit: handleCommit,
    layoutRef,
  });

  const requestMove = useCallback(
    (from, to, { auto = false, origin = null } = {}) => {
      const engine = engineRef.current;
      if (engine.isSolved) return false;
      if (animation.flight) return false;
      if (!auto && (paused || finished || autoRef.current)) return false;

      if (!engine.canMove(from, to)) {
        if (!auto) {
          flash({ kind: 'invalid', text: engine.invalidReason(from, to) });
          const blocked = engine.topDiskAt(from);
          if (blocked === null) shake(to);
          else shakeDiskOn(blocked);
          sfx.invalid();
        }
        return false;
      }

      const layout = layoutRef ? layoutRef.current : null;
      if (!layout) return false;
      return animation.startFlight({
        disk: engine.topDiskAt(from),
        from,
        to,
        fromIndex: engine.towers[from].length - 1,
        toIndex: engine.towers[to].length,
        layout,
        origin,
      });
    },
    [animation, finished, flash, layoutRef, paused, shake, shakeDiskOn]
  );

  const selectTower = useCallback(
    (index) => {
      const engine = engineRef.current;
      if (finished || paused || autoRef.current || animation.flight) return;
      setCursor(index);

      if (selected === null) {
        if (engine.topDiskAt(index) === null) {
          flash({ kind: 'invalid', text: `Tower ${TOWER_LABELS[index]} is empty.` });
          shake(index);
          sfx.invalid();
          return;
        }
        setSelected(index);
        setMessage(null);
        sfx.pickup();
        return;
      }

      if (selected === index) {
        setSelected(null);
        setMessage(null);
        sfx.select();
        return;
      }

      if (requestMove(selected, index)) {
        setSelected(null);
        setMessage(null);
      }
    },
    [animation.flight, finished, flash, paused, requestMove, selected, shake]
  );

  const moveCursor = useCallback((direction) => {
    setCursor((current) => (current + direction + 3) % 3);
  }, []);

  const undo = useCallback(() => {
    if (finished || paused || autoRef.current || animation.flight) return false;
    const ok = engineRef.current.undo();
    if (ok) {
      setSnapshot(engineRef.current.snapshot());
      setSelected(null);
      setMessage(null);
      sfx.select();
    }
    return ok;
  }, [animation.flight, finished, paused]);

  const redo = useCallback(() => {
    if (finished || paused || autoRef.current || animation.flight) return false;
    const ok = engineRef.current.redo();
    if (ok) {
      setSnapshot(engineRef.current.snapshot());
      setSelected(null);
      setMessage(null);
      sfx.select();
    }
    return ok;
  }, [animation.flight, finished, paused]);

  const hintsAllowed = showHints || mode === 'practice';

  const hint = useCallback(() => {
    if (!hintsAllowed || finished || paused || autoRef.current || animation.flight) return null;
    const engine = engineRef.current;
    if (engine.isSolved) return null;
    const move = nextHint(engine.towers, engine.diskCount, TARGET_TOWER);
    if (!move) {
      flash({ kind: 'info', text: 'Nothing left to move — the puzzle is already solved.' });
      return null;
    }
    setHintsUsed((count) => count + 1);
    const disk = engine.topDiskAt(move.from);
    flash(
      {
        kind: 'hint',
        text: `Move disk ${disk} from tower ${TOWER_LABELS[move.from]} to tower ${TOWER_LABELS[move.to]}.`,
      },
      0
    );
    sfx.hint();
    return move;
  }, [animation.flight, finished, flash, hintsAllowed, paused]);

  const stopAutoSolve = useCallback(() => {
    autoRef.current = null;
    setAutoSolve(null);
  }, []);

  const startAutoSolve = useCallback((speed = 1) => {
    const engine = engineRef.current;
    if (!engine || autoRef.current || engine.isSolved) return;
    const queue = solveFromState(engine.towers, engine.diskCount, TARGET_TOWER);
    if (queue.length === 0) return;
    const state = { queue, index: 0, total: queue.length, paused: false, speed };
    autoRef.current = state;
    setAutoSolve(state);
    setSelected(null);
    setMessage(null);
    if (speed === 'instant') {
      queue.forEach((move) => {
        engine.move(move.from, move.to, { count: false, record: false });
      });
      const done = { ...state, index: queue.length };
      autoRef.current = done;
      setAutoSolve(done);
      setSnapshot(engine.snapshot());
      sfx.win();
    }
  }, []);

  const setAutoSpeed = useCallback(
    (speed) => {
      const auto = autoRef.current;
      if (!auto) return;
      const engine = engineRef.current;
      if (speed === 'instant') {
        animation.cancelFlight();
        for (let index = auto.index; index < auto.queue.length; index += 1) {
          engine.move(auto.queue[index].from, auto.queue[index].to, { count: false, record: false });
        }
        const done = { ...auto, index: auto.queue.length, speed };
        autoRef.current = done;
        setAutoSolve(done);
        setSnapshot(engine.snapshot());
        return;
      }
      const next = { ...auto, speed };
      autoRef.current = next;
      setAutoSolve(next);
    },
    [animation]
  );

  const toggleAutoPause = useCallback(() => {
    if (!autoRef.current) return;
    const next = { ...autoRef.current, paused: !autoRef.current.paused };
    autoRef.current = next;
    setAutoSolve(next);
  }, []);

  const togglePause = useCallback(() => {
    if (finished) return;
    setPaused((value) => !value);
  }, [finished]);

  const restart = useCallback(() => {
    animation.cancelFlight();
    autoRef.current = null;
    setAutoSolve(null);
    engineRef.current.reset(diskCount);
    setSnapshot(engineRef.current.snapshot());
    setSelected(null);
    setCursor(0);
    setMessage(null);
    setShakeTower(null);
    setHintsUsed(0);
    setFinished(null);
    setPaused(false);
    timer.reset();
    setRunId((value) => value + 1);
  }, [animation, diskCount, timer]);

  const restartRef = useRef(restart);
  restartRef.current = restart;

  // Towers a disk may legally move to — drives the target glow.
  const validTargetsFor = useCallback(
    (towerIndex) => {
      const engine = engineRef.current;
      if (!engine || towerIndex === null || towerIndex === undefined) return NO_TOWERS;
      if (finished || paused || autoRef.current) return NO_TOWERS;
      return [0, 1, 2].filter((index) => engine.canMove(towerIndex, index));
    },
    [finished, paused]
  );

  const playPickup = useCallback(() => sfx.pickup(), []);

  // A dragged disk: the flight starts where the pointer let go.
  const dropDisk = useCallback(
    (from, to, origin) => {
      setSelected(null);
      return requestMove(from, to, { origin });
    },
    [requestMove]
  );

  const skipTutorial = useCallback(() => {
    setTutorialOn(false);
    markTutorialDone();
  }, []);

  // The tutorial points at the next move of a perfect solution, so it stays
  // correct even when the player wanders off the optimal path.
  const tutorial = useMemo(() => {
    if (!tutorialOn || finished || autoSolve) return null;
    const engine = engineRef.current;
    if (!engine || engine.isSolved) return null;
    const move = nextHint(engine.towers, engine.diskCount, TARGET_TOWER);
    if (!move) return null;
    return {
      from: move.from,
      to: move.to,
      disk: engine.topDiskAt(move.from),
      step: engine.moves + 1,
      total: Math.max(engine.minMoves, engine.moves + 1),
      // Once the right disk is lifted, the guidance switches to the destination peg.
      phase: selected === move.from ? 'drop' : 'pickup',
    };
  }, [autoSolve, finished, selected, snapshot, tutorialOn]);

  // A new disk count always rebuilds the board and clears every dependent state.
  // The key guard leaves the first render alone, so a restored board survives mount.
  const resetKeyRef = useRef(`${mode}:${diskCount}`);
  useEffect(() => {
    const key = `${mode}:${diskCount}`;
    if (resetKeyRef.current === key) return;
    resetKeyRef.current = key;
    restartRef.current();
  }, [diskCount, mode]);

  // Auto-solve mode starts solving as soon as the board exists.
  useEffect(() => {
    if (mode !== 'auto') return;
    if (autoRef.current || finished) return;
    startAutoSolve(1);
  }, [finished, mode, startAutoSolve, runId]);

  // Drive the auto-solve queue, one animated move at a time.
  useEffect(() => {
    if (!autoSolve || autoSolve.paused || finished) return;
    if (animation.flight) return;
    const auto = autoRef.current;
    if (!auto || auto.index >= auto.queue.length) return;
    const move = auto.queue[auto.index];
    requestMove(move.from, move.to, { auto: true });
  }, [animation.flight, autoSolve, finished, requestMove]);

  // Victory — only once every disk is on the target tower and the disk has landed.
  useEffect(() => {
    if (finished || animation.flight) return;
    const engine = engineRef.current;
    if (!engine.isSolved) return;
    const isAuto = autoRef.current !== null;
    const seconds = Math.round(readElapsed.current());
    const secondsLeft = mode === 'timed' && timeLimit ? Math.max(0, timeLimit - seconds) : 0;
    setFinished({
      type: 'win',
      mode,
      autoSolved: isAuto,
      disks: engine.diskCount,
      moves: engine.moves,
      minMoves: engine.minMoves,
      hintsUsed,
      tutorial: tutorialOn,
      seconds,
      stars: starsFor(engine.minMoves, engine.moves),
      score: scoreBreakdown({
        disks: engine.diskCount,
        minMoves: engine.minMoves,
        actualMoves: engine.moves,
        hintsUsed,
        timeBonusFraction: timeLimit ? secondsLeft / timeLimit : 0,
        autoSolved: isAuto,
      }),
    });
    autoRef.current = null;
    setAutoSolve(null);
    if (tutorialOn) {
      setTutorialOn(false);
      markTutorialDone();
    }
    if (isAuto) sfx.hint();
    else sfx.win();
  }, [animation.flight, finished, hintsUsed, mode, snapshot, timeLimit, tutorialOn]);

  // Timed challenge ends when the countdown reaches zero.
  useEffect(() => {
    if (finished || mode !== 'timed' || !timeLimit) return;
    if (engineRef.current.isSolved) return;
    if (timer.elapsed < timeLimit) return;
    setFinished({
      type: 'timeup',
      mode,
      disks: diskCount,
      moves: snapshot.moves,
      minMoves: engineRef.current.minMoves,
      seconds: Math.round(timer.elapsed),
    });
    sfx.warning();
  }, [diskCount, finished, mode, snapshot.moves, timeLimit, timer.elapsed]);

  // Move challenge ends when the allowance is exceeded (a winning move still wins).
  useEffect(() => {
    if (finished || mode !== 'moves' || !moveAllowance) return;
    if (engineRef.current.isSolved) return;
    if (snapshot.moves <= moveAllowance) return;
    setFinished({
      type: 'movelimit',
      mode,
      disks: diskCount,
      moves: snapshot.moves,
      allowance: moveAllowance,
      minMoves: engineRef.current.minMoves,
      seconds: Math.round(readElapsed.current()),
    });
    sfx.warning();
  }, [diskCount, finished, mode, moveAllowance, snapshot.moves]);

  return {
    runId,
    snapshot,
    board: snapshot.towers,
    moves: snapshot.moves,
    minMoves: snapshot.minMoves,
    canUndo: snapshot.canUndo,
    canRedo: snapshot.canRedo,
    progress: diskCount > 0 ? snapshot.towers[TARGET_TOWER].length / diskCount : 0,
    selected,
    cursor,
    message,
    shakeTower,
    hintsUsed,
    hintsAllowed,
    paused,
    finished,
    autoSolve,
    flight: animation.flight,
    isAnimating: animation.flight !== null,
    selectTower,
    moveCursor,
    undo,
    redo,
    hint,
    restart,
    togglePause,
    startAutoSolve,
    setAutoSpeed,
    toggleAutoPause,
    stopAutoSolve,
    validTargetsFor,
    dropDisk,
    playPickup,
    shakeDisk,
    tutorial,
    skipTutorial,
    timer,
  };
}