import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// 1 to 3 stars: 3 for a perfect run, 2 within 25% extra moves, 1 otherwise.
export default function Stars({ count }) {
  const filled = Math.max(0, Math.min(3, Number(count) || 0));
  return (
    <div className="mt-4 flex flex-col items-center gap-1">
      <div className="flex items-center gap-2" aria-label={`${filled} out of 3 stars`}>
        {[1, 2, 3].map((index) => (
          <Star
            key={index}
            className={cn(
              'h-9 w-9 transition-colors',
              index <= filled
                ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,0.5)]'
                : 'text-slate-600'
            )}
          />
        ))}
      </div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{filled} of 3 stars</p>
    </div>
  );
}