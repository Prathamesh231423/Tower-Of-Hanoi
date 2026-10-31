import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, Trash2 } from 'lucide-react';
import PageShell from '@/components/shared/PageShell';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { clearSave, defaultSave, loadSave, persist, withSettings } from '@/lib/hanoi/storage';
import { configureAudio } from '@/lib/hanoi/sfx';

const SPEED_OPTIONS = [
  { label: 'Slow', value: '0.5' },
  { label: 'Normal', value: '1' },
  { label: 'Fast', value: '2' },
  { label: 'Very fast', value: '4' },
];

export default function Settings() {
  const [save, setSave] = useState(() => loadSave());
  const [confirmReset, setConfirmReset] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && Boolean(document.fullscreenElement)
  );
  const settings = save.settings;

  useEffect(() => {
    configureAudio(settings);
  }, [settings.volume, settings.muted]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const patch = (values) => {
    setSave((current) => {
      const next = withSettings(current, values);
      persist(next);
      return next;
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      /* fullscreen is optional */
    }
  };

  return (
    <PageShell
      title="Settings"
      subtitle="Sound, animation speed and visual effects. Your choices are saved on this device."
      backTo="/"
    >
      <section className="toh-panel rounded-2xl p-5">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Audio</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-slate-300">Sound-effect volume</Label>
            <span className="font-mono text-xs text-slate-400">
              {settings.muted ? 'muted' : `${Math.round(settings.volume * 100)}%`}
            </span>
          </div>
          <Slider
            value={[Math.round(settings.volume * 100)]}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) => patch({ volume: (value[0] || 0) / 100 })}
          />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Label className="text-sm text-slate-300">Mute all sound</Label>
          <Switch checked={settings.muted} onCheckedChange={(checked) => patch({ muted: checked })} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          The game uses short synthesised tones — no sound files to download, and it plays silently if audio is
          unavailable.
        </p>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Gameplay</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-slate-300">Animation speed</Label>
            <p className="mt-0.5 text-xs text-slate-500">How fast disks travel between towers.</p>
          </div>
          <Select value={String(settings.animSpeed)} onValueChange={(value) => patch({ animSpeed: Number(value) })}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPEED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-slate-300">Show hints</Label>
            <p className="mt-0.5 text-xs text-slate-500">
              When off, the hint button is disabled (practice mode always allows hints).
            </p>
          </div>
          <Switch checked={settings.showHints} onCheckedChange={(checked) => patch({ showHints: checked })} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-slate-300">Reduce decorative effects</Label>
            <p className="mt-0.5 text-xs text-slate-500">Turns off the drifting background glow.</p>
          </div>
          <Switch
            checked={settings.reduceEffects}
            onCheckedChange={(checked) => patch({ reduceEffects: checked })}
          />
        </div>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Display</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-slate-300">Fullscreen</Label>
            <p className="mt-0.5 text-xs text-slate-500">Play the board without browser chrome, where supported.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={toggleFullscreen} className="gap-2">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit' : 'Enter'}
          </Button>
        </div>
      </section>

      <section className="toh-panel rounded-2xl p-5">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Data</h2>
        <p className="mt-3 text-sm text-slate-400">
          Statistics and achievements are stored locally on this device. A missing or damaged file is ignored and the
          game starts from fresh defaults rather than failing.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 gap-2 text-rose-200"
          onClick={() => setConfirmReset(true)}
        >
          <Trash2 className="h-4 w-4" />
          Reset statistics
        </Button>
      </section>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all statistics?</AlertDialogTitle>
            <AlertDialogDescription>
              Every recorded run, best time, best move count and achievement will be deleted. Your settings are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const keptSettings = save.settings;
                clearSave();
                const fresh = { ...defaultSave(), settings: keptSettings };
                setSave(fresh);
                persist(fresh);
                setConfirmReset(false);
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}