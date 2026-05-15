// Simple sound effects using Web Audio API
const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

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
  birdsFly: () => {
    try {
      const audio = new Audio("/sounds/birds-fly.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
  },
};
