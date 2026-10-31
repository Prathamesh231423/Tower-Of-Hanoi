import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BackgroundFx from '@/components/shared/BackgroundFx';

export default function PageShell({ title, subtitle, backTo = '/', backLabel = 'Main menu', children }) {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />
      <div className="relative mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-200"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <header className="mt-6">
          <h1 className="font-heading text-3xl font-bold text-gradient sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p> : null}
        </header>
        <main className="mt-8 space-y-4">{children}</main>
      </div>
    </div>
  );
}