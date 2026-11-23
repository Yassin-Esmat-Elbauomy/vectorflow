import { createSvgEl, clearSvgGroup, createSvgText, createSvgCard, createSvgButton } from '../svg-ui.js';
import { speak } from '../tts.js';

const PATTERNS = {
  box: {
    name: 'Box 4-4-4-4',
    phases: [
      { label: 'Inhale...', speech: 'Inhale', seconds: 4, radius: 135, color: '#0d9488' },
      { label: 'Hold...', speech: 'Hold', seconds: 4, radius: 135, color: '#0f766e' },
      { label: 'Exhale...', speech: 'Exhale', seconds: 4, radius: 70, color: '#2563eb' },
      { label: 'Hold...', speech: 'Hold', seconds: 4, radius: 70, color: '#1d4ed8' }
    ]
  },
  relax: {
    name: 'Relax 4-7-8',
    phases: [
      { label: 'Inhale...', speech: 'Inhale', seconds: 4, radius: 135, color: '#0d9488' },
      { label: 'Hold...', speech: 'Hold', seconds: 7, radius: 135, color: '#0f766e' },
      { label: 'Exhale...', speech: 'Exhale', seconds: 8, radius: 70, color: '#2563eb' }
    ]
  }
};

let currentPatternKey = 'box';
let isBreathing = false;
let phaseIndex = 0;
let phaseSecondsLeft = 4;
let breatheTimerId = null;

let orbEl = null;
let phaseLabelEl = null;
let countLabelEl = null;

export function cleanupBreatheView() {
  if (breatheTimerId) {
    clearInterval(breatheTimerId);
    breatheTimerId = null;
  }
  isBreathing = false;
}

function getActivePhases() {
  return PATTERNS[currentPatternKey].phases;
}

function applyPhaseVisuals() {
  const phase = getActivePhases()[phaseIndex];
  if (!phase) return;
  if (orbEl) {
    orbEl.setAttribute('r', String(phase.radius));
    orbEl.setAttribute('fill', phase.color);
  }
  if (phaseLabelEl) {
    phaseLabelEl.textContent = isBreathing ? phase.label : 'Press Start';
  }
  if (countLabelEl) {
    countLabelEl.textContent = isBreathing ? phaseSecondsLeft + 's' : 'Ready';
  }
}

function stepBreathing() {
  phaseSecondsLeft -= 1;
  if (phaseSecondsLeft <= 0) {
    const phases = getActivePhases();
    phaseIndex = (phaseIndex + 1) % phases.length;
    const nextPhase = phases[phaseIndex];
    phaseSecondsLeft = nextPhase.seconds;
    speak(nextPhase.speech);
  }
  applyPhaseVisuals();
}

export function renderBreatheView(container) {
  const panel = createSvgCard({
    x: 150,
    y: 115,
    width: 900,
    height: 620,
    title: 'Breathing Coach',
    subtitle: 'Follow the animated SVG orb and spoken cues to pace your breathing.'
  });
  container.appendChild(panel);

  const keys = Object.keys(PATTERNS);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const pat = PATTERNS[key];
    const btn = createSvgButton({
      x: 410 + i * 200,
      y: 205,
      width: 180,
      height: 38,
      label: pat.name,
      active: currentPatternKey === key,
      onClick: () => {
        cleanupBreatheView();
        currentPatternKey = key;
        phaseIndex = 0;
        phaseSecondsLeft = PATTERNS[key].phases[0].seconds;
        speak(pat.name + ' pattern selected');
        clearSvgGroup(container);
        renderBreatheView(container);
      }
    });
    container.appendChild(btn);
  }

  const centerX = 600;
  const centerY = 430;

  const outerGuide = createSvgEl('circle', {
    cx: centerX,
    cy: centerY,
    r: 142,
    fill: 'none',
    stroke: '#dddddd',
    'stroke-width': 2,
    'stroke-dasharray': '6 6'
  });

  const activePhase = getActivePhases()[phaseIndex];
  const currentRadius = isBreathing ? activePhase.radius : 95;
  const currentColor = isBreathing ? activePhase.color : '#0d9488';

  orbEl = createSvgEl('circle', {
    cx: centerX,
    cy: centerY,
    r: currentRadius,
    fill: currentColor,
    opacity: '0.88',
    class: 'breathe-orb'
  });

  phaseLabelEl = createSvgText({
    x: centerX,
    y: centerY - 10,
    text: isBreathing ? activePhase.label : 'Press Start',
    size: 26,
    fill: '#ffffff',
    weight: '700',
    anchor: 'middle'
  });

  countLabelEl = createSvgText({
    x: centerX,
    y: centerY + 26,
    text: isBreathing ? phaseSecondsLeft + 's' : PATTERNS[currentPatternKey].name,
    size: 17,
    fill: '#e6fffa',
    weight: '500',
    anchor: 'middle'
  });

  container.appendChild(outerGuide);
  container.appendChild(orbEl);
  container.appendChild(phaseLabelEl);
  container.appendChild(countLabelEl);

  const toggleBtn = createSvgButton({
    x: 520,
    y: 625,
    width: 160,
    height: 46,
    label: isBreathing ? 'Stop' : 'Start Breathing',
    active: true,
    onClick: () => {
      if (isBreathing) {
        cleanupBreatheView();
        speak('Breathing coach stopped');
      } else {
        isBreathing = true;
        phaseIndex = 0;
        const firstPhase = getActivePhases()[0];
        phaseSecondsLeft = firstPhase.seconds;
        speak(firstPhase.speech);
        breatheTimerId = setInterval(stepBreathing, 1000);
      }
      clearSvgGroup(container);
      renderBreatheView(container);
    }
  });

  container.appendChild(toggleBtn);
}
