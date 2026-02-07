
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const sounds = {
  click: () => playTone(800, 'sine', 0.1, 0.1),
  success: () => {
    playTone(600, 'sine', 0.2, 0.1);
    setTimeout(() => playTone(900, 'sine', 0.3, 0.1), 100);
  },
  delete: () => playTone(200, 'sawtooth', 0.15, 0.05),
  toggle: () => playTone(400, 'triangle', 0.1, 0.1),
  rankUp: () => {
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.4, 0.05), i * 80);
    });
  }
};
