const SVG_NS = 'http://www.w3.org/2000/svg';

export function createSvgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val !== undefined && val !== null) {
      el.setAttribute(key, String(val));
    }
  }
  return el;
}

export function clearSvgGroup(group) {
  while (group && group.firstChild) {
    group.removeChild(group.firstChild);
  }
}

export function createSvgText({ x, y, text, size = 16, fill = '#222222', weight = 'normal', anchor = 'start' }) {
  const t = createSvgEl('text', {
    x,
    y,
    fill,
    'font-size': size,
    'font-weight': weight,
    'text-anchor': anchor,
    'dominant-baseline': 'middle'
  });
  t.textContent = text;
  return t;
}

export function createSvgButton({ x, y, width, height, label, onClick, active = false, fill, textColor }) {
  const g = createSvgEl('g', {
    class: active ? 'svg-btn active' : 'svg-btn'
  });

  const bgFill = fill || (active ? '#0d9488' : '#ffffff');
  const fgFill = textColor || (active ? '#ffffff' : '#222222');
  const borderStroke = active ? '#0d9488' : '#cccccc';

  const rect = createSvgEl('rect', {
    x,
    y,
    width,
    height,
    rx: 6,
    fill: bgFill,
    stroke: borderStroke,
    'stroke-width': 1.5
  });

  const txt = createSvgText({
    x: x + width / 2,
    y: y + height / 2,
    text: label,
    size: 15,
    fill: fgFill,
    weight: active ? '600' : '500',
    anchor: 'middle'
  });

  g.appendChild(rect);
  g.appendChild(txt);

  if (typeof onClick === 'function') {
    g.addEventListener('click', onClick);
  }

  return g;
}

export function createSvgCard({ x, y, width, height, title, subtitle, onClick }) {
  const g = createSvgEl('g', {
    class: onClick ? 'svg-card svg-card-click' : 'svg-card'
  });

  const rect = createSvgEl('rect', {
    x,
    y,
    width,
    height,
    rx: 8,
    fill: '#ffffff',
    stroke: '#dddddd',
    'stroke-width': 1.5
  });
  g.appendChild(rect);

  if (title) {
    const titleEl = createSvgText({
      x: x + 24,
      y: y + 36,
      text: title,
      size: 20,
      fill: '#222222',
      weight: '600'
    });
    g.appendChild(titleEl);
  }

  if (subtitle) {
    const subEl = createSvgText({
      x: x + 24,
      y: y + 66,
      text: subtitle,
      size: 14,
      fill: '#666666'
    });
    g.appendChild(subEl);
  }

  if (typeof onClick === 'function') {
    g.addEventListener('click', onClick);
  }

  return g;
}
