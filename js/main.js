import { createSvgEl, clearSvgGroup, createSvgText, createSvgButton } from './svg-ui.js';
import { registerRoute, initRouter, navigate, getCurrentPath } from './router.js';
import { isMuted, toggleMute, getRate, cycleRate, speak } from './tts.js';
import { renderHomeView } from './views/home-view.js';
import { renderFocusView, cleanupFocusView } from './views/focus-view.js';
import { renderBreatheView, cleanupBreatheView } from './views/breathe-view.js';
import { renderStatsView } from './views/stats-view.js';

const STORAGE_KEY = 'vectorflow_sessions';

export function getSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveSession(minutes) {
  const list = getSessions();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  list.push({
    id: Date.now(),
    minutes: Number(minutes) || 1,
    date: dateStr,
    timestamp: now.toISOString()
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function clearSessions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

export function getTodayMinutes() {
  const today = new Date().toISOString().slice(0, 10);
  const list = getSessions();
  let total = 0;
  for (const item of list) {
    if (item.date === today) {
      total += Number(item.minutes) || 0;
    }
  }
  return total;
}

function renderNavBar(activePath) {
  const navGroup = document.getElementById('nav-bar');
  if (!navGroup) return;
  clearSvgGroup(navGroup);

  const bg = createSvgEl('rect', {
    x: 0,
    y: 0,
    width: 1200,
    height: 76,
    fill: '#ffffff',
    stroke: '#dddddd',
    'stroke-width': 1
  });
  navGroup.appendChild(bg);

  const logoRing = createSvgEl('circle', {
    cx: 48,
    cy: 38,
    r: 14,
    fill: 'none',
    stroke: '#0d9488',
    'stroke-width': 2.5
  });
  const logoWave = createSvgEl('path', {
    d: 'M 39 38 Q 43.5 31 48 38 T 57 38',
    fill: 'none',
    stroke: '#0d9488',
    'stroke-width': 2.5,
    'stroke-linecap': 'round'
  });
  navGroup.appendChild(logoRing);
  navGroup.appendChild(logoWave);

  const brand = createSvgText({
    x: 74,
    y: 38,
    text: 'VectorFlow',
    size: 22,
    fill: '#222222',
    weight: '700'
  });
  navGroup.appendChild(brand);

  const navItems = [
    { path: '/', label: 'Home', x: 340 },
    { path: '/focus', label: 'Focus', x: 455 },
    { path: '/breathe', label: 'Breathe', x: 570 },
    { path: '/stats', label: 'Stats', x: 685 }
  ];

  for (const item of navItems) {
    const btn = createSvgButton({
      x: item.x,
      y: 19,
      width: 102,
      height: 38,
      label: item.label,
      active: activePath === item.path,
      onClick: () => navigate(item.path)
    });
    navGroup.appendChild(btn);
  }

  const ttsGroup = createSvgEl('g', { id: 'tts-toggle' });

  const rateBtn = createSvgButton({
    x: 945,
    y: 19,
    width: 95,
    height: 38,
    label: 'Rate ' + getRate() + 'x',
    active: false,
    onClick: () => {
      cycleRate();
      renderNavBar(getCurrentPath());
    }
  });

  const muteBtn = createSvgButton({
    x: 1050,
    y: 19,
    width: 115,
    height: 38,
    label: isMuted() ? 'TTS: Muted' : 'TTS: On',
    active: !isMuted(),
    onClick: () => {
      toggleMute();
      renderNavBar(getCurrentPath());
    }
  });

  ttsGroup.appendChild(rateBtn);
  ttsGroup.appendChild(muteBtn);
  navGroup.appendChild(ttsGroup);
}

const ROUTE_SPEECH = {
  '/': 'Home overview',
  '/focus': 'Focus timer view',
  '/breathe': 'Breathing coach',
  '/stats': 'Statistics view'
};

function setupApp() {
  const viewContainer = document.getElementById('view-container');

  registerRoute('/', () => {
    clearSvgGroup(viewContainer);
    renderHomeView(viewContainer);
  });

  registerRoute('/focus', () => {
    clearSvgGroup(viewContainer);
    renderFocusView(viewContainer);
  });

  registerRoute('/breathe', () => {
    clearSvgGroup(viewContainer);
    renderBreatheView(viewContainer);
  });

  registerRoute('/stats', () => {
    clearSvgGroup(viewContainer);
    renderStatsView(viewContainer);
  });

  initRouter((newPath, shouldAnnounce) => {
    cleanupFocusView();
    cleanupBreatheView();
    renderNavBar(newPath);
    if (shouldAnnounce && ROUTE_SPEECH[newPath]) {
      speak(ROUTE_SPEECH[newPath]);
    }
  });
}

setupApp();
