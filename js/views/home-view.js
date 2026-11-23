import { createSvgEl, createSvgText, createSvgCard, createSvgButton } from '../svg-ui.js';
import { navigate } from '../router.js';
import { getTodayMinutes, getSessions } from '../main.js';
import { speak } from '../tts.js';

export function renderHomeView(container) {
  const todayMins = getTodayMinutes();
  const totalSessions = getSessions().length;

  const banner = createSvgCard({
    x: 60,
    y: 115,
    width: 1080,
    height: 170,
    title: 'Welcome to VectorFlow',
    subtitle: 'Pure SVG workspace for deep focus sessions, paced breathing, and daily progress.'
  });

  const statBadge = createSvgEl('rect', {
    x: 84,
    y: 205,
    width: 260,
    height: 52,
    rx: 6,
    fill: '#f0fdfa',
    stroke: '#0d9488',
    'stroke-width': 1.5
  });
  const statText = createSvgText({
    x: 102,
    y: 231,
    text: 'Today Focus: ' + todayMins + ' min (' + totalSessions + ' total)',
    size: 15,
    fill: '#0f766e',
    weight: '600'
  });

  const speakSummaryBtn = createSvgButton({
    x: 365,
    y: 211,
    width: 165,
    height: 40,
    label: 'Speak Summary',
    onClick: () => {
      speak('You have completed ' + todayMins + ' focus minutes today across ' + totalSessions + ' total sessions.');
    }
  });

  banner.appendChild(statBadge);
  banner.appendChild(statText);
  banner.appendChild(speakSummaryBtn);
  container.appendChild(banner);

  const cards = [
    {
      x: 60,
      title: 'Focus Timer',
      subtitle: 'Pomodoro SVG progress ring with 1m, 15m, 25m, and 45m presets.',
      cta: 'Open Focus Timer',
      path: '/focus',
      accent: '#0d9488'
    },
    {
      x: 430,
      title: 'Breathing Coach',
      subtitle: 'Guided SVG breathing orb with Box 4-4-4-4 and Relax 4-7-8 voice cues.',
      cta: 'Start Breathing',
      path: '/breathe',
      accent: '#2563eb'
    },
    {
      x: 800,
      title: 'Session Stats',
      subtitle: '7-day SVG bar chart, total focus minutes, and day streak log.',
      cta: 'View Stats',
      path: '/stats',
      accent: '#d97706'
    }
  ];

  for (const item of cards) {
    const card = createSvgCard({
      x: item.x,
      y: 325,
      width: 340,
      height: 360,
      title: item.title,
      subtitle: ''
    });

    const desc1 = createSvgText({
      x: item.x + 24,
      y: 398,
      text: item.subtitle.slice(0, 44),
      size: 14,
      fill: '#555555'
    });
    const desc2 = createSvgText({
      x: item.x + 24,
      y: 420,
      text: item.subtitle.slice(44),
      size: 14,
      fill: '#555555'
    });

    const previewCircle = createSvgEl('circle', {
      cx: item.x + 170,
      cy: 515,
      r: 48,
      fill: '#f8fafc',
      stroke: item.accent,
      'stroke-width': 4
    });

    const openBtn = createSvgButton({
      x: item.x + 24,
      y: 615,
      width: 292,
      height: 44,
      label: item.cta,
      active: true,
      onClick: () => navigate(item.path)
    });

    card.appendChild(desc1);
    card.appendChild(desc2);
    card.appendChild(previewCircle);
    card.appendChild(openBtn);
    container.appendChild(card);
  }
}
