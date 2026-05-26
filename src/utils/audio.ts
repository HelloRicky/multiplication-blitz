// Synthesized retro-sound engine using browser's built-in Web Audio API.
// No external files, completely client-side and instantly responsive.

let isMuted = false;

// We initialize AudioContext lazily on first interaction to comply with browser autoplay policies.
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  if (!audioCtx) {
    // Standard AudioContext or WebkitAudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume context if suspended
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (muted && audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

export function getMuted(): boolean {
  return isMuted;
}

// 1. Warm popping sound for custom buttons & choices
export function playPop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  // Sweet pitch sweep upwards for bubble popping
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// 2. Beautiful Sparkly Arpeggio for correct answer
export function playCorrect() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    // Add tiny vibrato
    osc.frequency.linearRampToValueAtTime(freq + 10, startTime + duration);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // Harmonious Major Chord (C major: C5, E5, G5, C6)
  playNote(523.25, now, 0.25); // C5
  playNote(659.25, now + 0.06, 0.25); // E5
  playNote(783.99, now + 0.12, 0.30); // G5
  playNote(1046.50, now + 0.18, 0.40); // C6
}

// 3. Low comic slide for incorrect answers (gentle, not irritating)
export function playIncorrect() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.35);

  // Soft lowpass filter to make it sound warm and vintage instead of harsh
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, now);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

// 4. Quick tick for final seconds countdown of the clock
export function playTick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

// 5. Dual beep warning for emergency alert/running out of time
export function playWarning() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playBeep = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);

    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.12);
  };

  playBeep(now);
  playBeep(now + 0.15);
}

// 6. Glorious level up/game over award fanfare!
export function playFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playNote = (freq: number, startTime: number, duration: number, volume = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // Happy rising bouncy fanfare!
  const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25, 783.99, 1046.50];
  const tempo = 0.085;

  notes.forEach((freq, idx) => {
    const isLast = idx === notes.length - 1;
    playNote(freq, now + idx * tempo, isLast ? 0.8 : 0.12, isLast ? 0.15 : 0.08);
  });
}

// 7. Dynamic whoosh sound effect when a badge of achievement is unlocked
export function playUnlocksBadge() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(1500, now + 0.5);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.005, now + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.5);
}

// 8. Streak sound (pitch increases as streak grows)
export function playStreakUp(streak: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = 440;
  // Increase frequency by roughly a half step each streak milestone
  const frequency = baseFreq * Math.pow(1.059463, Math.min(streak, 12));

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.2);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}
