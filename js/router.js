const routes = {};
let currentPath = '/';
let changeCallback = null;

export function getBasePath() {
  const path = window.location.pathname;
  if (path.startsWith('/vectorflow')) {
    return '/vectorflow';
  }
  return '';
}

export function normalizePath(rawPath) {
  const base = getBasePath();
  let clean = rawPath || '/';
  if (base && clean.startsWith(base)) {
    clean = clean.slice(base.length);
  }
  clean = clean.split('?')[0].split('#')[0];
  if (clean.endsWith('/index.html')) {
    clean = clean.slice(0, -11);
  }
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return routes[clean] ? clean : '/';
}

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function getCurrentPath() {
  return currentPath;
}

function runRoute(path, announce = true) {
  currentPath = normalizePath(path);
  if (typeof changeCallback === 'function') {
    changeCallback(currentPath, announce);
  }
  const renderFn = routes[currentPath] || routes['/'];
  if (typeof renderFn === 'function') {
    renderFn();
  }
}

export function navigate(path, replace = false) {
  const target = normalizePath(path);
  const fullPath = (getBasePath() + (target === '/' ? '/' : target)) || '/';

  if (replace) {
    window.history.replaceState({ path: target }, '', fullPath);
  } else if (target !== currentPath || window.location.pathname !== fullPath) {
    window.history.pushState({ path: target }, '', fullPath);
  }
  runRoute(target, !replace);
}

export function initRouter(onRouteChanged) {
  changeCallback = onRouteChanged;

  const savedRedirect = sessionStorage.getItem('vf_redirect');
  if (savedRedirect) {
    sessionStorage.removeItem('vf_redirect');
    const restored = normalizePath(savedRedirect);
    const fullPath = (getBasePath() + (restored === '/' ? '/' : restored)) || '/';
    window.history.replaceState({ path: restored }, '', fullPath);
  }

  window.addEventListener('popstate', (e) => {
    const nextPath = (e.state && e.state.path) ? e.state.path : window.location.pathname;
    runRoute(nextPath, true);
  });

  runRoute(window.location.pathname, false);
}
