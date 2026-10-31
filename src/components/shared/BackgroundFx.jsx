import React, { useState } from 'react';
import { loadSave } from '@/lib/hanoi/storage';

// Decorative backdrop. Honours the "reduce effects" setting from the save file.
export default function BackgroundFx({ enabled }) {
  const [reduced] = useState(() => loadSave().settings.reduceEffects);
  const active = enabled === undefined ? !reduced : enabled;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1c2350_0%,#0b1020_45%,#05070f_100%)]" />
      {active ? (
        <>
          <div className="toh-float absolute -left-24 top-8 h-72 w-72 rounded-full bg-violet-600/25 blur-[100px]" />
          <div
            className="toh-float absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-cyan-500/20 blur-[110px]"
            style={{ animationDelay: '1.4s' }}
          />
          <div
            className="toh-float absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-[120px]"
            style={{ animationDelay: '2.6s' }}
          />
        </>
      ) : null}
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:56px_56px]" />
    </div>
  );
}