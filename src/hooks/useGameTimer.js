import { useCallback, useEffect, useRef, useState } from 'react';

// Monotonic gameplay timer built on performance.now().
// Paused time is never counted; the clock can also count down.
export default function useGameTimer({ running, countdownFrom = null, initialSeconds = 0 }) {
  // initialSeconds seeds the clock once, so a resumed game keeps its stored time.
  const seed = Math.max(0, Number(initialSeconds) || 0);
  const [elapsed, setElapsed] = useState(seed);
  const accumulated = useRef(seed);
  const startedAt = useRef(null);
  const runningRef = useRef(false);
  runningRef.current = Boolean(running);

  useEffect(() => {
    if (!running) {
      if (startedAt.current !== null) {
        accumulated.current += (performance.now() - startedAt.current) / 1000;
        startedAt.current = null;
      }
      setElapsed(accumulated.current);
      return undefined;
    }

    startedAt.current = performance.now();
    const id = window.setInterval(() => {
      if (startedAt.current === null) return;
      setElapsed(accumulated.current + (performance.now() - startedAt.current) / 1000);
    }, 200);

    return () => {
      window.clearInterval(id);
      if (startedAt.current !== null) {
        accumulated.current += (performance.now() - startedAt.current) / 1000;
        startedAt.current = null;
      }
    };
  }, [running]);

  const reset = useCallback(() => {
    accumulated.current = 0;
    startedAt.current = runningRef.current ? performance.now() : null;
    setElapsed(0);
  }, []);

  // Exact current value, including the fraction since the last display tick.
  const read = useCallback(() => {
    const live = startedAt.current === null ? 0 : (performance.now() - startedAt.current) / 1000;
    return accumulated.current + live;
  }, []);

  const secondsLeft = countdownFrom ? Math.max(0, countdownFrom - elapsed) : null;

  return { elapsed, secondsLeft, reset, read };
}