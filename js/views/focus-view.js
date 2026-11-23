import { createSvgEl, clearSvgGroup, createSvgText, createSvgCard, createSvgButton } from '../svg-ui.js';
import { saveSession } from '../main.js';
import { speak } from '../tts.js';

const PRESETS = [1, 15, 25, 45];
const RADIUS = 135;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

let selectedMinutes = 25;
let remainingSeconds = 25 * 60;
let totalSeconds = 25 * 60;
let isRunning = false;
let timerId = null;

let timeTextEl = null;
let statusTextEl = null;
let progressCircleEl = null;
let activeContainer = null;

export function cleanupFocusView() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
}

function formatClock(sec) {
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  const mStr = String(mins).padStart(2, '0');
  const sStr = String(rem).padStart(2, '0');
  return mStr + ':' + sStr;
}

function updateRingDisplay() {
  if (timeTextEl) {
    timeTextEl.textContent = formatClock(remainingSeconds);
  }
  if (progressCircleEl) {
    const ratio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
    const offset = CIRCUMFERENCE * (1 - ratio);
    progressCircleEl.setAttribute('stroke-dashoffset', String(offset));
  }
}

function handleTick() {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    updateRingDisplay();
  }

  if (remainingSeconds <= 0) {
    cleanupFocusView();
    saveSession(selectedMinutes);
    if (statusTextEl) {
      statusTextEl.textContent = 'Session complete! Saved ' + selectedMinutes + 'm to history.';
    }
    speak('Focus session complete! Great work.');
    if (activeContainer) {
      clearSvgGroup(activeContainer);
      renderFocusView(activeContainer);
    }
  }
}

export function renderFocusView(container) {
  activeContainer = container;

  const panel = createSvgCard({
    x: 150,
    y: 115,
    width: 900,
    height: 620,
    title: 'Focus Timer',
    subtitle: 'Select a duration preset and start a distraction-free focus block.'
  });
  container.appendChild(panel);

  const presetY = 205;
  for (let i = 0; i < PRESETS.length; i++) {
    const mins = PRESETS[i];
    const btn = createSvgButton({
      x: 370 + i * 120,
      y: presetY,
      width: 100,
      height: 38,
      label: mins + 'm',
      active: selectedMinutes === mins,
      onClick: () => {
        cleanupFocusView();
        selectedMinutes = mins;
        totalSeconds = mins * 60;
        remainingSeconds = totalSeconds;
        speak(mins + ' minute preset selected');
        clearSvgGroup(container);
        renderFocusView(container);
      }
    });
    container.appendChild(btn);
  }

  const centerX = 600;
  const centerY = 425;

  const trackCircle = createSvgEl('circle', {
    cx: centerX,
    cy: centerY,
    r: RADIUS,
    fill: 'none',
    stroke: '#e5e7eb',
    'stroke-width': 14
  });

  const ratio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const initialOffset = CIRCUMFERENCE * (1 - ratio);

  progressCircleEl = createSvgEl('circle', {
    cx: centerX,
    cy: centerY,
    r: RADIUS,
    fill: 'none',
    stroke: '#0d9488',
    'stroke-width': 14,
    'stroke-linecap': 'round',
    'stroke-dasharray': String(CIRCUMFERENCE),
    'stroke-dashoffset': String(initialOffset),
    transform: 'rotate(-90 ' + centerX + ' ' + centerY + ')',
    class: 'ring-progress'
  });

  timeTextEl = createSvgText({
    x: centerX,
    y: centerY - 8,
    text: formatClock(remainingSeconds),
    size: 46,
    fill: '#222222',
    weight: '700',
    anchor: 'middle'
  });

  statusTextEl = createSvgText({
    x: centerX,
    y: centerY + 38,
    text: isRunning ? 'Focusing...' : 'Ready (' + selectedMinutes + 'm preset)',
    size: 15,
    fill: '#666666',
    anchor: 'middle'
  });

  container.appendChild(trackCircle);
  container.appendChild(progressCircleEl);
  container.appendChild(timeTextEl);
  container.appendChild(statusTextEl);

  const startPauseBtn = createSvgButton({
    x: 455,
    y: 625,
    width: 140,
    height: 46,
    label: isRunning ? 'Pause' : 'Start',
    active: true,
    onClick: () => {
      if (isRunning) {
        cleanupFocusView();
        speak('Session paused');
      } else {
        if (remainingSeconds <= 0) {
          remainingSeconds = selectedMinutes * 60;
          totalSeconds = remainingSeconds;
        }
        isRunning = true;
        speak('Focus session started for ' + selectedMinutes + ' minutes');
        timerId = setInterval(handleTick, 1000);
      }
      clearSvgGroup(container);
      renderFocusView(container);
    }
  });

  const resetBtn = createSvgButton({
    x: 615,
    y: 625,
    width: 130,
    height: 46,
    label: 'Reset',
    active: false,
    onClick: () => {
      cleanupFocusView();
      totalSeconds = selectedMinutes * 60;
      remainingSeconds = totalSeconds;
      speak('Timer reset');
      clearSvgGroup(container);
      renderFocusView(container);
    }
  });

  container.appendChild(startPauseBtn);
  container.appendChild(resetBtn);
}
