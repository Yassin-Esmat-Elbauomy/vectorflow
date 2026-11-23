# VectorFlow

VectorFlow is a focus timer, guided breathing coach, and session stats app built completely inside a single inline SVG canvas with vanilla JavaScript.

## How to run

Open `index.html` with a local static server (like VS Code Live Server or `npx serve .`) so the History API routes work cleanly.

## Features

- Entire interface rendered inside `<svg id="app-svg">` with `<g>`, `<rect>`, `<circle>`, `<path>`, and `<text>`
- Client-side History API router (`/`, `/focus`, `/breathe`, `/stats`) plus `404.html` fallback for GitHub Pages
- Pomodoro focus timer with circular SVG progress ring, 1m/15m/25m/45m presets, and `localStorage` session saving
- Guided breathing orb with Box 4-4-4-4 and Relax 4-7-8 patterns
- Web Speech Synthesis voice cues with mute toggle and speech rate button in the top bar
- 7-day SVG bar chart, total sessions, focus minutes, and day streak counter
