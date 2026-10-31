import React from 'react';
import { LayoutGrid, BookOpen, BarChart3, Settings as SettingsIcon, GraduationCap } from 'lucide-react';
import BackgroundFx from '@/components/shared/BackgroundFx';
import HanoiDriftBg from '@/components/shared/HanoiDriftBg';
import HanoiMark from '@/components/shared/HanoiMark';
import MenuButton from '@/components/shared/MenuButton';
import PlayCard from '@/components/shared/PlayCard';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundFx />
      <HanoiDriftBg />

      <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 pb-16 sm:px-6 sm:pb-14">
        <div className="my-auto w-full space-y-7">
          <div className="toh-fade-in text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10">
              <HanoiMark className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-gradient text-4xl font-bold tracking-tight sm:text-6xl">
              TOWER OF HANOI
            </h1>
            <p className="mt-3 font-heading text-xs font-medium uppercase tracking-[0.42em] text-cyan-100 sm:text-sm">
              The Logic Challenge
            </p>
          </div>

          <div className="mx-auto w-full max-w-md space-y-2.5">
            <PlayCard />
            <MenuButton
              to="/play?mode=classic&disks=3&tutorial=1"
              icon={GraduationCap}
              accent="violet"
              label="Guided Tutorial"
              description="Step-by-step walkthrough of your first solve"
            />
            <MenuButton
              to="/modes"
              icon={LayoutGrid}
              accent="cyan"
              label="Game Modes"
              description="Classic, timed, move limit, practice, auto-solve"
            />
            <MenuButton
              to="/how-to-play"
              icon={BookOpen}
              accent="amber"
              label="How to Play"
              description="Rules, controls and scoring"
            />
            <MenuButton
              to="/stats"
              icon={BarChart3}
              accent="emerald"
              label="Statistics"
              description="Best runs, achievements and progress"
            />
            <MenuButton
              to="/settings"
              icon={SettingsIcon}
              accent="fuchsia"
              label="Settings"
              description="Sound, animation speed and effects"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-slate-300 sm:text-sm">
          Minimum possible moves for n disks:{' '}
          <span className="font-mono text-cyan-200">2ⁿ − 1</span>
        </p>
      </main>
    </div>
  );
}