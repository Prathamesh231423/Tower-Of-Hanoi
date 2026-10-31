import React from 'react';
import { Link } from 'react-router-dom';
import { House, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SPEED_OPTIONS = [
  { label: 'Slow', value: '0.5' },
  { label: 'Normal', value: '1' },
  { label: 'Fast', value: '2' },
  { label: 'Very fast', value: '4' },
];

export default function PauseOverlay({ onResume, onRestart, settings, onSettingsChange }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="toh-panel toh-fade-in w-full max-w-md rounded-3xl p-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300/80">Paused</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-slate-100">Game paused</h2>
        <p className="mt-1 text-xs text-slate-400">The clock and any animation are frozen.</p>

        <div className="mt-6 space-y-2">
          <Button onClick={onResume} className="w-full gap-2">
            <Play className="h-4 w-4" />
            Resume
          </Button>
          <Button variant="secondary" onClick={onRestart} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart puzzle
          </Button>
          <Button variant="secondary" asChild className="w-full gap-2">
            <Link to="/">
              <House className="h-4 w-4" />
              Main menu
            </Link>
          </Button>
        </div>

        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Quick settings</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-300">Sound volume</Label>
              <span className="font-mono text-xs text-slate-400">
                {settings.muted ? 'muted' : `${Math.round(settings.volume * 100)}%`}
              </span>
            </div>
            <Slider
              value={[Math.round(settings.volume * 100)]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onSettingsChange({ volume: (value[0] || 0) / 100 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-300">Mute sound</Label>
            <Switch checked={settings.muted} onCheckedChange={(checked) => onSettingsChange({ muted: checked })} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-xs text-slate-300">Animation speed</Label>
            <Select
              value={String(settings.animSpeed)}
              onValueChange={(value) => onSettingsChange({ animSpeed: Number(value) })}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-300">Show hints</Label>
            <Switch
              checked={settings.showHints}
              onCheckedChange={(checked) => onSettingsChange({ showHints: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}