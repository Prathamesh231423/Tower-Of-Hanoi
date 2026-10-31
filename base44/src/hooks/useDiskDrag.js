import { useCallback, useRef, useState } from 'react';
import { diskWidth } from '@/lib/hanoi/layout';

// Tap and drag share one gesture: a pointer held on a tower lifts its top disk.
// A quick tap still selects the tower; a move beyond the threshold carries the
// disk, and releasing it over another tower drops it there. Mouse and touch both
// go through pointer events, so the gesture behaves the same on a phone.
const MOUSE_THRESHOLD = 6;
const TOUCH_THRESHOLD = 11; // a finger wobbles more than a cursor
const MOUSE_LIFT = 26;
const TOUCH_LIFT = 46; // the finger covers the disk it holds, so carry it higher
const SUPPRESS_MS = 400;

function towerIndexAt(layout, x) {
  return Math.max(0, Math.min(2, Math.floor(x / (layout.width / 3))));
}

// Where the carried disk sits relative to the pointer, kept inside the board.
function liftedBox(point, layout, disk, lift) {
  const width = diskWidth(layout, disk);
  return {
    x: Math.min(Math.max(0, point.x - width / 2), Math.max(0, layout.width - width)),
    y: Math.max(0, point.y - layout.diskH - lift),
    width,
    height: layout.diskH,
  };
}

function buzz(ms) {
  const vibrate = typeof navigator !== 'undefined' ? navigator.vibrate : null;
  if (typeof vibrate !== 'function') return;
  try {
    vibrate.call(navigator, ms);
  } catch (error) {
    /* haptics are optional */
  }
}

export default function useDiskDrag({ boardRef, layout, towers, locked, onDrop, onPickup }) {
  const [drag, setDrag] = useState(null);
  const layoutRef = useRef(layout);
  const towersRef = useRef(towers);
  const lockedRef = useRef(locked);
  const handlersRef = useRef({ onDrop, onPickup });
  const pendingRef = useRef(null);
  const draggingRef = useRef(false);
  const suppressRef = useRef(false);

  layoutRef.current = layout;
  towersRef.current = towers;
  lockedRef.current = locked;
  handlersRef.current = { onDrop, onPickup };

  const pointFrom = useCallback(
    (event) => {
      const board = boardRef.current;
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    [boardRef]
  );

  const start = useCallback((event, towerIndex) => {
    // A fresh press is always a real tap for this tower, never a leftover drag.
    suppressRef.current = false;
    if (lockedRef.current) return;
    if (pendingRef.current) return; // one pointer owns the gesture at a time
    if (event.isPrimary === false) return;
    const stack = towersRef.current ? towersRef.current[towerIndex] : null;
    if (!stack || stack.length === 0) return;

    // Capture on press so a fast flick that leaves the tower still reports moves.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      /* pointer capture is optional */
    }

    pendingRef.current = {
      towerIndex,
      pointerId: event.pointerId,
      touch: event.pointerType === 'touch',
      startX: event.clientX,
      startY: event.clientY,
      disk: stack[stack.length - 1],
    };
  }, []);

  const move = useCallback(
    (event) => {
      const pending = pendingRef.current;
      if (!pending || pending.pointerId !== event.pointerId) return;
      const current = layoutRef.current;
      const point = pointFrom(event);
      if (!current || !point) return;

      if (!draggingRef.current) {
        const threshold = pending.touch ? TOUCH_THRESHOLD : MOUSE_THRESHOLD;
        const travel = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY);
        if (travel < threshold) return;
        draggingRef.current = true;
        suppressRef.current = true;
        if (pending.touch) buzz(10);
        handlersRef.current.onPickup?.();
      }

      const box = liftedBox(point, current, pending.disk, pending.touch ? TOUCH_LIFT : MOUSE_LIFT);
      setDrag({
        from: pending.towerIndex,
        disk: pending.disk,
        ...box,
        hover: towerIndexAt(current, point.x),
      });
    },
    [pointFrom]
  );

  const finish = useCallback(
    (event, dropped) => {
      const pending = pendingRef.current;
      if (pending && event && pending.pointerId !== event.pointerId) return;
      pendingRef.current = null;
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDrag(null);

      // A drag is usually followed by a click on the tower: swallow it, but never
      // let a stray suppressed click eat the player's next tap.
      if (suppressRef.current) {
        window.setTimeout(() => {
          suppressRef.current = false;
        }, SUPPRESS_MS);
      }

      if (!pending || !dropped) return;
      const current = layoutRef.current;
      const point = pointFrom(event);
      if (!current || !point) return;
      const to = towerIndexAt(current, point.x);
      if (to === pending.towerIndex) return;

      if (pending.touch) buzz(12);
      const origin = liftedBox(point, current, pending.disk, pending.touch ? TOUCH_LIFT : MOUSE_LIFT);
      handlersRef.current.onDrop?.(pending.towerIndex, to, { x: origin.x, y: origin.y });
    },
    [pointFrom]
  );

  const bindTower = useCallback(
    (towerIndex) => ({
      onPointerDown: (event) => start(event, towerIndex),
      onPointerMove: (event) => move(event),
      onPointerUp: (event) => finish(event, true),
      onPointerCancel: (event) => finish(event, false),
      onLostPointerCapture: (event) => finish(event, false),
    }),
    [finish, move, start]
  );

  // The drop ends with a click on the tower: swallow it so it is not read as a tap.
  const consumeSuppressedClick = useCallback(() => {
    const suppressed = suppressRef.current;
    suppressRef.current = false;
    return suppressed;
  }, []);

  return { drag, bindTower, consumeSuppressedClick };
}