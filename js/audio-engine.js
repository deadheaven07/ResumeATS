/**
 * RESUMETRACKER: SYNTHESIZED WEB AUDIO MICRO-HAPTICS ENGINE
 * Native zero-dependency audio synthesizer using the Web Audio API.
 * Emits ultra-low latency, crisp tactile audio feedback without external audio files.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isAudioEnabled() {
  return localStorage.getItem("resumetracker_audio") !== "false";
}

export function setAudioEnabled(enabled) {
  localStorage.setItem("resumetracker_audio", enabled ? "true" : "false");
}

export function toggleAudio() {
  const current = isAudioEnabled();
  setAudioEnabled(!current);
  if (!current) {
    playPop();
  }
  return !current;
}

/**
 * Plays a subtle, crisp micro-click (tab switches, navigation, toggles)
 */
export function playTick() {
  if (!isAudioEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch (e) {
    // Audio autoplay restrictions or unsupported browser
  }
}

/**
 * Plays a bubbly, tactile pop (accepting diffs, copy to clipboard, checkbox click)
 */
export function playPop() {
  if (!isAudioEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Audio restriction fallback
  }
}

/**
 * Plays a pleasant celebratory harmonic chime (high scores >= 80%, goal completion)
 */
export function playChime() {
  if (!isAudioEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Harmonic chord: C5 (523.25Hz) + E5 (659.25Hz)
    const frequencies = [523.25, 659.25, 1046.5];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.03, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.28);
    });
  } catch (e) {
    // Audio restriction fallback
  }
}
