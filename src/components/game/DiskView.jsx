import React from 'react';
import { cn } from '@/lib/utils';

// Distinct colour per disk size, high contrast against the board.
const DISK_STYLES = [
  'from-rose-400 to-rose-600',
  'from-orange-400 to-orange-600',
  'from-amber-300 to-amber-500',
  'from-lime-400 to-lime-600',
  'from-emerald-400 to-emerald-600',
  'from-teal-300 to-teal-500',
  'from-cyan-400 to-cyan-600',
  'from-sky-400 to-sky-600',
  'from-indigo-400 to-indigo-600',
  'from-violet-400 to-violet-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-pink-400 to-pink-600',
];

// The outer element carries the board position (a transform), the inner one the
// look — so a shake can animate without fighting the position.
export default function DiskView({
  disk,
  x,
  y,
  width,
  height,
  flying = false,
  dragging = false,
  highlight = false,
  shake = false,
}) {
  const index = Math.max(0, (Math.round(disk) - 1) % DISK_STYLES.length);
  return (
    <div
      data-disk={disk}
      className={cn('absolute left-0 top-0', (flying || dragging) && 'z-20', dragging && 'pointer-events-none')}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)`, width, height }}
    >
      <div
        className={cn(
          'h-full w-full rounded-full bg-gradient-to-b shadow-[0_8px_20px_rgba(0,0,0,0.45)] ring-1 ring-white/25',
          DISK_STYLES[index],
          (flying || dragging) && 'ring-2 ring-white/50 shadow-[0_14px_34px_rgba(0,0,0,0.6)]',
          dragging && 'scale-[1.04]',
          highlight && 'animate-pulse ring-2 ring-cyan-200/80 shadow-[0_0_34px_rgba(103,232,249,0.5)]',
          shake && 'toh-shake'
        )}
      >
        <div className="h-1/3 w-full rounded-t-full bg-white/25" />
      </div>
    </div>
  );
}