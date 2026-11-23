const RATE_STEPS = [1, 1.25, 0.85];

let muted = false;
let rateIdx = 0;

function loadTtsPrefs() {
  try {
    const savedMute = localStorage.getItem('vf_tts_muted');
    const savedRate = localStorage.getItem('vf_tts_rate');
    if (savedMute === 'true') muted = true;
    if (savedRate !== null) {
      const idx = RATE_STEPS.indexOf(Number(savedRate));
      if (idx !== -1) rateIdx = idx;
    }
  } catch (e) {
    // ignore storage errors
  }
}

loadTtsPrefs();

export function isMuted() {
  return muted;
}

export function getRate() {
  return RATE_STEPS[rateIdx];
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speak(text) {
  if (muted || !text) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = getRate();
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    // ignore browser speech errors
  }
}

export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('vf_tts_muted', String(muted));
  } catch (e) {}

  if (muted) {
    stopSpeech();
  } else {
    speak('Voice enabled');
  }
  return muted;
}

export function cycleRate() {
  rateIdx = (rateIdx + 1) % RATE_STEPS.length;
  const nextRate = getRate();
  try {
    localStorage.setItem('vf_tts_rate', String(nextRate));
  } catch (e) {}
  speak('Speech speed ' + nextRate + 'x');
  return nextRate;
}
