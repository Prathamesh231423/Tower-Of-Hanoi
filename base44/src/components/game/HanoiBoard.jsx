import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import DiskView from '@/components/game/DiskView';
import useDiskDrag from '@/hooks/useDiskDrag';
import { restingPosition } from '@/lib/hanoi/layout';
import { TOWER_LABELS } from '@/lib/hanoi/engine';

export default function HanoiBoard({
  layout,
  towers,
  flight,
  selected,
  shakeTower,
  shakeDisk,
  cursor,
  showCursor,
  onSelect,
  locked,
  targetTower = 2,
  validTargetsFor,
  tutorial = null,
  onDrop,
  onPickup,
}) {
  const boardRef = useRef(null);
  const { drag, bindTower, consumeSuppressedClick } = useDiskDrag({
    boardRef,
    layout,
    towers,
    locked,
    onDrop,
    onPickup,
  });

  if (!layout || !towers) return null;

  const flyingDisk = flight ? flight.disk : null;
  const resting = [];
  towers.forEach((stack, towerIndex) => {
    stack.forEach((disk, stackIndex) => {
      if (disk === flyingDisk) return;
      if (drag && disk === drag.disk) return;
      const position = restingPosition(layout, towerIndex, disk, stackIndex);
      resting.push({ disk, ...position });
    });
  });

  const activeSource = drag ? drag.from : selected;
  const validGlow =
    validTargetsFor && activeSource !== null && activeSource !== undefined ? validTargetsFor(activeSource) : [];
  // The tutorial target gets its own, slightly stronger highlight.
  const glowTargets = tutorial ? validGlow.filter((index) => index !== tutorial.to) : validGlow;
  // Guidance moves in two beats: lift the glowing disk, then aim at the outlined peg.
  const tutorialDrop = Boolean(tutorial) && tutorial.phase === 'drop';

  const towerBox = (index) => ({
    left: layout.towerXs[index] - layout.width / 6 + 6,
    width: layout.width / 3 - 12,
    top: Math.max(0, layout.pegTopY - 28),
    bottom: 0,
  });

  return (
    <div ref={boardRef} className="absolute inset-0 select-none">
      <div
        className="absolute rounded-full bg-gradient-to-r from-slate-700/60 via-slate-400/40 to-slate-700/60 shadow-[0_16px_44px_rgba(0,0,0,0.55)]"
        style={{ left: layout.width * 0.055, right: layout.width * 0.055, top: layout.baseY, height: 12 }}
      />

      {glowTargets.map((index) => (
        <div
          key={`glow-${index}`}
          className="pointer-events-none absolute animate-pulse rounded-3xl border-2 border-cyan-300/45 bg-cyan-400/[0.1] shadow-[0_0_50px_rgba(103,232,249,0.35)]"
          style={towerBox(index)}
        />
      ))}

      {layout.towerXs.map((x, index) => (
        <div
          key={`peg-${index}`}
          className={cn(
            'absolute rounded-full bg-gradient-to-b from-slate-400/50 via-slate-600/70 to-slate-700/60 transition-all duration-300',
            (selected === index || (tutorial && !tutorialDrop && tutorial.from === index)) &&
              'from-violet-300 via-violet-400 to-violet-600 shadow-[0_0_30px_rgba(139,92,246,0.65)]',
            tutorialDrop &&
              tutorial.to === index &&
              'from-cyan-200 via-cyan-300 to-cyan-500 shadow-[0_0_30px_rgba(103,232,249,0.6)]'
          )}
          style={{ left: x - 5, top: layout.pegTopY, height: Math.max(24, layout.baseY - layout.pegTopY), width: 10 }}
        />
      ))}

      {tutorial ? (
        <>
          <div
            className={cn(
              'pointer-events-none absolute rounded-3xl border-2',
              tutorialDrop
                ? 'animate-pulse border-cyan-300/60 bg-cyan-400/[0.08] shadow-[0_0_40px_rgba(103,232,249,0.25)]'
                : 'border-dashed border-cyan-300/30'
            )}
            style={towerBox(tutorial.to)}
          />
          <ChevronDown
            className={cn(
              'toh-nudge pointer-events-none absolute h-6 w-6',
              tutorialDrop ? 'text-cyan-200' : 'text-violet-200'
            )}
            style={{
              left: layout.towerXs[tutorialDrop ? tutorial.to : tutorial.from] - 12,
              top: Math.max(0, layout.pegTopY - 44),
            }}
          />
        </>
      ) : null}

      {layout.towerXs.map((x, index) => (
        <button
          key={`hit-${index}`}
          type="button"
          {...bindTower(index)}
          onClick={() => {
            if (consumeSuppressedClick()) return;
            onSelect(index);
          }}
          disabled={locked}
          aria-label={`Tower ${TOWER_LABELS[index]}${index === targetTower ? ' (target)' : ''}`}
          className={cn(
            'absolute z-10 touch-none select-none rounded-3xl border border-transparent transition-colors duration-200 [-webkit-touch-callout:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed',
            selected === index
              ? 'border-violet-400/30 bg-violet-500/10'
              : 'hover:border-white/10 hover:bg-white/[0.05]',
            drag && drag.hover === index ? 'border-cyan-300/50 bg-cyan-400/10' : null,
            showCursor && cursor === index && 'border-cyan-300/60 bg-cyan-400/[0.06]',
            shakeTower === index && 'toh-shake border-rose-400/50 bg-rose-500/15'
          )}
          style={towerBox(index)}
        />
      ))}

      {resting.map((slot) => (
        <DiskView
          key={slot.disk}
          disk={slot.disk}
          x={slot.x}
          y={slot.y}
          width={slot.width}
          height={slot.height}
          shake={shakeDisk === slot.disk}
          highlight={Boolean(tutorial && tutorial.disk === slot.disk)}
        />
      ))}

      {flight ? (
        <DiskView disk={flight.disk} x={flight.x} y={flight.y} width={flight.width} height={flight.height} flying />
      ) : null}

      {drag ? (
        <DiskView disk={drag.disk} x={drag.x} y={drag.y} width={drag.width} height={drag.height} dragging />
      ) : null}

      {layout.towerXs.map((x, index) => (
        <div
          key={`label-${index}`}
          className="absolute flex flex-col items-center"
          style={{ left: x - 60, width: 120, top: layout.baseY + 18 }}
        >
          <span
            className={cn(
              'font-heading text-sm font-semibold tracking-[0.35em]',
              selected === index || (tutorial && tutorial.from === index) ? 'text-violet-200' : 'text-slate-400',
              glowTargets.includes(index) || (tutorial && tutorial.to === index) ? 'text-cyan-200' : null
            )}
          >
            {TOWER_LABELS[index]}
          </span>
          {index === targetTower ? (
            <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">target</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}