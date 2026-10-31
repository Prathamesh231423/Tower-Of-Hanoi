import React, { useState } from 'react';
import { Award, Lock, Trophy } from 'lucide-react';
import PageShell from '@/components/shared/PageShell';
import { ACHIEVEMENTS, loadSave } from '@/lib/hanoi/storage';
import { DIFFICULTIES, difficultyName, getMode } from '@/lib/hanoi/modes';
import { formatDate, formatDuration, formatTime } from '@/lib/hanoi/format';

export default function Stats() {
  const [save] = useState(() => loadSave());
  const hasRuns = save.runs.length > 0;

  const diskRows = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(
    (disks) => save.bestMoves[disks] || save.bestTimes[disks]
  );

  return (
    <PageShell
      title="Statistics"
      subtitle="Everything you have finished, your best runs and the achievements you have unlocked."
      backTo="/"
    >
      <section className="toh-panel rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
          <Trophy className="h-4 w-4 text-cyan-200" />
          Totals
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Puzzles solved</p>
            <p className="mt-1 font-mono text-lg text-slate-100">{save.totalCompleted}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Total score</p>
            <p className="mt-1 font-mono text-lg text-cyan-200">{save.totalScore}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Play time</p>
            <p className="mt-1 font-mono text-lg text-slate-100">{formatDuration(save.totalPlaySeconds)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Highest difficulty</p>
            <p className="mt-1 font-mono text-lg text-slate-100">
              {save.highestDisks > 0 ? `${save.highestDisks} disks` : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="font-heading text-base font-semibold text-slate-100">Personal bests</h2>
        {diskRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No completed puzzle yet. Finish a puzzle and your best moves and fastest time will appear here.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Difficulty</th>
                  <th className="px-3 py-2 font-medium">Best moves</th>
                  <th className="px-3 py-2 font-medium">Best time</th>
                </tr>
              </thead>
              <tbody>
                {diskRows.map((disks) => (
                  <tr key={disks} className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-200">{difficultyName(disks)}</td>
                    <td className="px-3 py-2 font-mono text-slate-200">{save.bestMoves[disks] ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-slate-200">
                      {save.bestTimes[disks] ? formatTime(save.bestTimes[disks]) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Presets: {DIFFICULTIES.map((preset) => `${preset.name} (${preset.disks})`).join(' · ')}
        </p>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
          <Award className="h-4 w-4 text-cyan-200" />
          Achievements
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = Boolean(save.achievements[achievement.id]);
            return (
              <div
                key={achievement.id}
                className={
                  unlocked
                    ? 'flex items-start gap-3 rounded-xl border border-violet-300/40 bg-violet-500/10 p-3'
                    : 'flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3'
                }
              >
                <span
                  className={
                    unlocked
                      ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/25 text-violet-100'
                      : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-500'
                  }
                >
                  {unlocked ? <Award className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </span>
                <span>
                  <span className={unlocked ? 'block text-sm font-semibold text-slate-100' : 'block text-sm font-semibold text-slate-400'}>
                    {achievement.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">{achievement.description}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="font-heading text-base font-semibold text-slate-100">Recent runs</h2>
        {!hasRuns ? (
          <p className="mt-3 text-sm text-slate-400">Your last completed puzzles will be listed here.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {save.runs.map((run, index) => (
              <li
                key={`${run.date}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-cyan-200">{getMode(run.mode).short}</span>
                  <span className="text-slate-200">{difficultyName(run.disks)}</span>
                  <span className="text-xs text-slate-500">{formatDate(run.date)}</span>
                </span>
                <span className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-300">
                  <span>{run.moves} moves</span>
                  <span>{formatTime(run.seconds)}</span>
                  <span className="text-cyan-200">{run.efficiency}%</span>
                  <span className="text-violet-200">{run.score} pts</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}