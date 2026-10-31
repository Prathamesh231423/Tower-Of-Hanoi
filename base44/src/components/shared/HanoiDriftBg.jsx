import React, { useState } from 'react';
import { loadSave } from '@/lib/hanoi/storage';

const PEGS = [280, 600, 920];

// Each disk drifts back and forth between pegs on its own height, slowly and quietly.
const DISKS = [
  { id: 'a', width: 240, height: 26, cx: 280, y: 330, drift: '320px', lift: '160px', duration: '26s', start: '0s', tone: 'fill-violet-400/70' },
  { id: 'b', width: 200, height: 24, cx: 600, y: 306, drift: '-320px', lift: '180px', duration: '33s', start: '-9s', tone: 'fill-cyan-300/70' },
  { id: 'c', width: 160, height: 22, cx: 920, y: 282, drift: '-640px', lift: '200px', duration: '39s', start: '-18s', tone: 'fill-fuchsia-400/70' },
  { id: 'd', width: 120, height: 20, cx: 600, y: 258, drift: '320px', lift: '140px', duration: '29s', start: '-4s', tone: 'fill-emerald-300/70' },
];

// Decorative backdrop for the menu. Honours the "reduce effects" setting.
export default function HanoiDriftBg() {
  const [reduced] = useState(() => loadSave().settings.reduceEffects);
  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-15 sm:opacity-20"
    >
      <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax meet" className="h-full w-full">
        <rect x="180" y="356" width="840" height="16" rx="8" className="fill-slate-300/25" />
        {PEGS.map((cx) => (
          <rect key={cx} x={cx - 8} y="150" width="16" height="208" rx="8" className="fill-slate-300/25" />
        ))}
        {DISKS.map((disk) => (
          <g
            key={disk.id}
            className="toh-drift"
            style={{
              '--drift-x': disk.drift,
              '--drift-y': disk.lift,
              '--drift-dur': disk.duration,
              '--drift-start': disk.start,
            }}
          >
            <rect
              x={disk.cx - disk.width / 2}
              y={disk.y}
              width={disk.width}
              height={disk.height}
              rx={disk.height / 2}
              className={disk.tone}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}