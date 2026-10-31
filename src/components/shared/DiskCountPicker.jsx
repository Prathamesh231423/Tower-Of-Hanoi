import React from 'react';
import { cn } from '@/lib/utils';

const DISK_OPTIONS = [3, 4, 5, 6, 7, 8];

export default function DiskCountPicker({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Number of disks"
      className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-slate-950/50 p-0.5"
    >
      {DISK_OPTIONS.map((count) => (
        <button
          key={count}
          type="button"
          aria-pressed={value === count}
          onClick={() => onChange(count)}
          className={cn(
            'h-7 w-7 rounded-lg font-mono text-xs transition-all duration-150 active:scale-95',
            value === count
              ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/40'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          )}
        >
          {count}
        </button>
      ))}
    </div>
  );
}