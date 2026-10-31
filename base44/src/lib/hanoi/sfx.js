// Optional audio: small synthesised blips, so the game needs no sound assets
// and keeps working when audio is unavailable or muted.

let context = null;
let audioSettings = { volume: 0.6, muted: false };

export function configureAudio(settings) {
  if (!settings || typeof settings !== 'object') return;
  audioSettings = {
    volume: Math.max(0, Math.min(1, Number(settings.volume)) || 0),
    muted: Boolean(settings.muted),
  };
}

function audioContext() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!context) {
    try {
      context = new Ctor();
    } catch (error) {
      context = null;
      return null;
    }
  }
  if (context && context.state === 'suspended') {
    try {
      context.resume();
    } catch (error) {
      /* audio is optional */
    }
  }
  return context;
}

export function tone({ freq = 440, duration = 0.12, type = 'triangle', peak = 0.3, slideTo = null }) {
  const level = audioSettings.muted ? 0 : audioSettings.volume * peak;
  if (level <= 0) return;
  const ctx = audioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, now);
    if (slideTo) oscillator.frequency.linearRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch (error) {
    /* audio is optional */
  }
}

export const sfx = {
  select: () => tone({ freq: 520, duration: 0.08, peak: 0.2, type: 'triangle' }),
  // A disk lifted off a tower, and the same disk settling back down.
  pickup: () => tone({ freq: 660, slideTo: 820, duration: 0.09, peak: 0.16, type: 'sine' }),
  land: () => tone({ freq: 280, slideTo: 190, duration: 0.14, peak: 0.2, type: 'sine' }),
  tick: () => tone({ freq: 660, duration: 0.06, peak: 0.14, type: 'square' }),
  invalid: () => tone({ freq: 200, slideTo: 120, duration: 0.22, peak: 0.2, type: 'sawtooth' }),
  hint: () => tone({ freq: 640, slideTo: 880, duration: 0.18, peak: 0.22, type: 'sine' }),
  warning: () => tone({ freq: 300, duration: 0.3, peak: 0.16, type: 'square' }),
  win: () => {
    [523, 659, 784, 1046].forEach((freq, index) => {
      window.setTimeout(() => tone({ freq, duration: 0.28, peak: 0.28, type: 'triangle' }), index * 110);
    });
  },
};