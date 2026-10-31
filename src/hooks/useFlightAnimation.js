import { useCallback, useEffect, useRef, useState } from 'react';
import { diskWidth, slotY } from '@/lib/hanoi/layout';

// One disk move, animated as lift -> travel -> drop.
// Progress is time based (delta time), so it never depends on the frame rate,
// and it can be paused mid-flight without the board and the picture disagreeing:
// the logical move is committed at the start of the drop.

const LIFT_END = 0.22;
const TRAVEL_END = 0.72;
const BASE_DURATION = 520;
const MAX_STEP_MS = 64;

const ease = (value) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

function positionAt(job) {
  const layout = job.layout;
  const width = diskWidth(layout, job.disk);
  // A drag can start the flight from wherever the pointer released the disk.
  const startX = job.origin ? job.origin.x : layout.towerXs[job.from] - width / 2;
  const endX = layout.towerXs[job.to] - width / 2;
  const startY = job.origin ? job.origin.y : slotY(layout, job.fromIndex);
  const restY = slotY(layout, job.toIndex);
  const riseY = Math.max(4, layout.pegTopY - layout.diskH - 8);
  const t = job.t;

  if (t <= LIFT_END) {
    const p = ease(t / LIFT_END);
    return { x: startX, y: startY + (riseY - startY) * p };
  }
  if (t <= TRAVEL_END) {
    const p = ease((t - LIFT_END) / (TRAVEL_END - LIFT_END));
    return { x: startX + (endX - startX) * p, y: riseY };
  }
  const p = ease((t - TRAVEL_END) / (1 - TRAVEL_END));
  return { x: endX, y: riseY + (restY - riseY) * p };
}

export default function useFlightAnimation({ speedRef, pausedRef, onCommit, layoutRef }) {
  const [flight, setFlight] = useState(null);
  const jobRef = useRef(null);
  const rafRef = useRef(null);
  const handlers = useRef({ onCommit });
  handlers.current = { onCommit };

  const cancelFlight = useCallback(() => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    jobRef.current = null;
    setFlight(null);
  }, []);

  const step = useCallback(
    (now) => {
      const job = jobRef.current;
      if (!job) {
        rafRef.current = null;
        return;
      }
      if (layoutRef && layoutRef.current) job.layout = layoutRef.current;

      const dt = Math.min(MAX_STEP_MS, Math.max(0, now - job.lastTime));
      job.lastTime = now;
      const paused = pausedRef.current;
      if (!paused) job.t += (dt / job.duration) * Math.max(0.1, speedRef.current || 1);

      if (job.t >= TRAVEL_END && !job.committed) {
        job.committed = true;
        handlers.current.onCommit?.({ disk: job.disk, from: job.from, to: job.to });
      }

      if (job.t >= 1) {
        rafRef.current = null;
        jobRef.current = null;
        setFlight(null);
        return;
      }

      if (!paused) {
        const { x, y } = positionAt(job);
        setFlight({
          disk: job.disk,
          from: job.from,
          to: job.to,
          x,
          y,
          width: diskWidth(job.layout, job.disk),
          height: job.layout.diskH,
        });
      }
      rafRef.current = window.requestAnimationFrame(step);
    },
    [layoutRef, pausedRef, speedRef]
  );

  const startFlight = useCallback(
    ({ disk, from, to, fromIndex, toIndex, layout, origin = null }) => {
      if (jobRef.current || !layout) return false;
      const job = {
        disk,
        from,
        to,
        fromIndex,
        toIndex,
        layout,
        origin,
        t: 0,
        duration: BASE_DURATION,
        lastTime: performance.now(),
        committed: false,
      };
      jobRef.current = job;
      const { x, y } = positionAt(job);
      setFlight({
        disk,
        from,
        to,
        x,
        y,
        width: diskWidth(layout, disk),
        height: layout.diskH,
      });
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(step);
      return true;
    },
    [step]
  );

  useEffect(
    () => () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      jobRef.current = null;
    },
    []
  );

  return { flight, startFlight, cancelFlight };
}