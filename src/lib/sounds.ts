// Simple sound effects using Web Audio API
const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

// Preload bird sound so playback starts instantly on first click
const birdsAudio = typeof Audio !== "undefined" ? new Audio("/sounds/birds-fly.mp3") : (null as any);
if (birdsAudio) {
  birdsAudio.preload = "auto";
  try { birdsAudio.load(); } catch {}
}

const playTone = (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {}
};

export const sounds = {
  atmButton: () => playTone(800, 0.08, "square", 0.06),
  atmProcess: () => {
    playTone(440, 0.15, "sine", 0.1);
    setTimeout(() => playTone(550, 0.15, "sine", 0.1), 200);
    setTimeout(() => playTone(660, 0.15, "sine", 0.1), 400);
  },
  atmSuccess: () => {
    playTone(523, 0.2, "sine", 0.12);
    setTimeout(() => playTone(659, 0.2, "sine", 0.12), 150);
    setTimeout(() => playTone(784, 0.3, "sine", 0.12), 300);
  },
  atmError: () => {
    playTone(300, 0.2, "square", 0.08);
    setTimeout(() => playTone(250, 0.3, "square", 0.08), 200);
  },
  envelopeOpen: () => {
    playTone(600, 0.3, "sine", 0.06);
    setTimeout(() => playTone(800, 0.2, "sine", 0.04), 150);
  },
  paper: () => playTone(2000, 0.05, "triangle", 0.03),
  balloonPop: () => {
    playTone(200, 0.1, "sawtooth", 0.15);
    playTone(100, 0.15, "square", 0.1);
  },
  correct: () => {
    playTone(523, 0.15, "sine", 0.1);
    setTimeout(() => playTone(784, 0.25, "sine", 0.1), 120);
  },
  wrong: () => playTone(200, 0.3, "square", 0.06),
  vaultUnlock: () => {
    playTone(330, 0.3, "sine", 0.08);
    setTimeout(() => playTone(415, 0.2, "sine", 0.08), 200);
    setTimeout(() => playTone(523, 0.4, "sine", 0.1), 400);
  },
  petalFall: () => playTone(1200, 0.15, "sine", 0.04),
  secretReveal: () => {
    playTone(392, 0.25, "sine", 0.06);
    setTimeout(() => playTone(494, 0.25, "sine", 0.06), 200);
    setTimeout(() => playTone(587, 0.35, "sine", 0.08), 400);
  },
  happyBirthday: () => {
    try {
      const c = ctx();
      // [frequency Hz, duration s, start offset s]
      const notes: [number, number, number][] = [
        [392, 0.22, 0.00], [392, 0.10, 0.28], [440, 0.32, 0.42], [392, 0.32, 0.80],
        [523, 0.32, 1.18], [494, 0.65, 1.56],
        [392, 0.22, 2.40], [392, 0.10, 2.68], [440, 0.32, 2.82], [392, 0.32, 3.20],
        [587, 0.32, 3.58], [523, 0.65, 3.96],
        [392, 0.22, 4.80], [392, 0.10, 5.08], [784, 0.32, 5.22], [659, 0.32, 5.60],
        [523, 0.22, 5.98], [494, 0.22, 6.26], [440, 0.55, 6.54],
        [698, 0.22, 7.30], [698, 0.10, 7.58], [659, 0.32, 7.72], [523, 0.32, 8.10],
        [587, 0.32, 8.48], [523, 0.75, 8.86],
      ];
      notes.forEach(([freq, dur, start]) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, c.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.2, c.currentTime + start + 0.02);
        gain.gain.setValueAtTime(0.2, c.currentTime + start + dur - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime + start);
        osc.stop(c.currentTime + start + dur + 0.05);
      });
    } catch {}
  },
  birdsFly: () => {
    try {
      const audio = birdsAudio.cloneNode(true) as HTMLAudioElement;
      audio.volume = 0.6;
      audio.playbackRate = 1.5;
      (audio as any).preservesPitch = false;
      (audio as any).mozPreservesPitch = false;
      (audio as any).webkitPreservesPitch = false;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  },
};
