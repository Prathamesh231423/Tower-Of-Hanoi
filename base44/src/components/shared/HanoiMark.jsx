import React from 'react';

// Small Tower of Hanoi mark: three pegs with three stacked coloured disks.
export default function HanoiMark({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect x="5" y="40" width="38" height="4" rx="2" className="fill-slate-200/80" />
      <rect x="12" y="17" width="3" height="23" rx="1.5" className="fill-slate-300/70" />
      <rect x="22.5" y="17" width="3" height="23" rx="1.5" className="fill-slate-300/70" />
      <rect x="33" y="17" width="3" height="23" rx="1.5" className="fill-slate-300/70" />
      <rect x="6" y="35" width="15" height="4.5" rx="2.25" className="fill-violet-400" />
      <rect x="8" y="30" width="11" height="4.5" rx="2.25" className="fill-cyan-300" />
      <rect x="10" y="25" width="7" height="4.5" rx="2.25" className="fill-fuchsia-400" />
    </svg>
  );
}