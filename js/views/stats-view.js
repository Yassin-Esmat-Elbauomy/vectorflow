import { createSvgEl, clearSvgGroup, createSvgText, createSvgCard, createSvgButton } from '../svg-ui.js';
import { getSessions, clearSessions } from '../main.js';
import { speak } from '../tts.js';

function getLast7DaysData(sessions) {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const shortLabel = iso.slice(5);
    let minutes = 0;
    for (const s of sessions) {
      if (s.date === iso) {
        minutes += Number(s.minutes) || 0;
      }
    }
    days.push({ date: iso, label: shortLabel, minutes });
  }
  return days;
}

function computeStreak(sessions) {
  const activeDates = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (activeDates.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function renderStatsView(container) {
  const sessions = getSessions();
  const totalSessions = sessions.length;
  let totalMinutes = 0;
  for (const s of sessions) {
    totalMinutes += Number(s.minutes) || 0;
  }
  const streak = computeStreak(sessions);

  const statItems = [
    { x: 60, label: 'Total Sessions', value: String(totalSessions) },
    { x: 430, label: 'Total Minutes', value: totalMinutes + 'm' },
    { x: 800, label: 'Current Streak', value: streak + (streak === 1 ? ' day' : ' days') }
  ];

  for (const item of statItems) {
    const card = createSvgCard({
      x: item.x,
      y: 115,
      width: 340,
      height: 130,
      title: item.label,
      subtitle: ''
    });

    const valText = createSvgText({
      x: item.x + 24,
      y: 195,
      text: item.value,
      size: 34,
      fill: '#0d9488',
      weight: '700'
    });
    card.appendChild(valText);
    container.appendChild(card);
  }

  const chartPanel = createSvgCard({
    x: 60,
    y: 270,
    width: 1080,
    height: 465,
    title: 'Last 7 Days Focus Minutes',
    subtitle: 'Pure SVG bar chart computed from saved localStorage focus sessions.'
  });
  container.appendChild(chartPanel);

  const speakBtn = createSvgButton({
    x: 790,
    y: 290,
    width: 155,
    height: 38,
    label: 'Speak Stats',
    onClick: () => {
      speak('You have ' + totalSessions + ' sessions, ' + totalMinutes + ' total focus minutes, and a streak of ' + streak + ' days.');
    }
  });

  const clearBtn = createSvgButton({
    x: 960,
    y: 290,
    width: 150,
    height: 38,
    label: 'Clear History',
    onClick: () => {
      clearSessions();
      speak('Session history cleared');
      clearSvgGroup(container);
      renderStatsView(container);
    }
  });

  container.appendChild(speakBtn);
  container.appendChild(clearBtn);

  const chartDays = getLast7DaysData(sessions);
  let maxMins = 60;
  for (const d of chartDays) {
    if (d.minutes > maxMins) maxMins = d.minutes;
  }

  const chartBottom = 665;
  const chartHeight = 250;
  const startX = 160;
  const stepX = 135;

  const axisLine = createSvgEl('line', {
    x1: 120,
    y1: chartBottom,
    x2: 1080,
    y2: chartBottom,
    stroke: '#cccccc',
    'stroke-width': 2
  });
  container.appendChild(axisLine);

  for (let i = 0; i < chartDays.length; i++) {
    const day = chartDays[i];
    const barWidth = 72;
    const barX = startX + i * stepX;
    const rawH = Math.round((day.minutes / maxMins) * chartHeight);
    const barH = Math.max(6, rawH);
    const barY = chartBottom - barH;

    const barRect = createSvgEl('rect', {
      x: barX,
      y: barY,
      width: barWidth,
      height: barH,
      rx: 5,
      fill: day.minutes > 0 ? '#0d9488' : '#e5e7eb'
    });

    const valLabel = createSvgText({
      x: barX + barWidth / 2,
      y: barY - 14,
      text: day.minutes + 'm',
      size: 13,
      fill: '#333333',
      weight: '600',
      anchor: 'middle'
    });

    const dateLabel = createSvgText({
      x: barX + barWidth / 2,
      y: chartBottom + 24,
      text: day.label,
      size: 14,
      fill: '#555555',
      anchor: 'middle'
    });

    container.appendChild(barRect);
    container.appendChild(valLabel);
    container.appendChild(dateLabel);
  }
}
