/*
 * Night mode for every PNU CVLab page.
 * Load this in <head> without defer so the theme is set before the page paints.
 * Any element with a data-theme-toggle attribute becomes an animated day/night switch;
 * its look lives here so it is identical on every page (pages only position it).
 * Pages start in light mode; the visitor's choice is remembered once they switch.
 */
(function () {
  var KEY = 'pnucvlab-theme';
  var root = document.documentElement;

  /* A slim switch: translucent track (pages may set --tt-track / --tt-line), white knob
     with a line-icon sun that cross-fades to a crescent moon. */
  var CSS = [
    '.theme-toggle[data-theme-toggle]{position:relative;display:inline-block;flex:none;width:44px;height:24px;padding:0;border-radius:999px;cursor:pointer;vertical-align:middle;',
    'border:1px solid var(--tt-line,rgba(255,255,255,.55));background:var(--tt-track,rgba(255,255,255,.22));transition:background .3s ease,border-color .3s ease}',
    '.theme-toggle[data-theme-toggle]:hover{background:var(--tt-track-hover,rgba(255,255,255,.34))}',
    '.theme-toggle[data-theme-toggle]:focus-visible{outline:2px solid var(--tt-focus,#fff);outline-offset:3px}',
    '.theme-toggle .tt-knob{position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);',
    'transition:transform .3s cubic-bezier(.4,0,.2,1)}',
    '.theme-toggle .tt-knob svg{position:absolute;inset:3px;width:12px;height:12px;transition:opacity .25s ease,transform .3s ease}',
    '.theme-toggle .tt-sun{color:#298ba1;opacity:1}',
    '.theme-toggle .tt-moon{color:#1b2733;opacity:0;transform:rotate(-40deg)}',
    'html[data-theme="dark"] .theme-toggle[data-theme-toggle]{border-color:var(--tt-line-dark,rgba(255,255,255,.28));background:var(--tt-track-dark,rgba(255,255,255,.1))}',
    'html[data-theme="dark"] .theme-toggle .tt-knob{transform:translateX(20px)}',
    'html[data-theme="dark"] .theme-toggle .tt-sun{opacity:0;transform:rotate(40deg)}',
    'html[data-theme="dark"] .theme-toggle .tt-moon{opacity:1;transform:none}',
    '@media (prefers-reduced-motion:reduce){.theme-toggle[data-theme-toggle],.theme-toggle[data-theme-toggle] *{transition:none!important}}'
  ].join('');

  var SUN = '<svg class="tt-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="currentColor"/>' +
    '<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>';
  var MOON = '<svg class="tt-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';
  var INNER = '<span class="tt-knob">' + SUN + MOON + '</span>';

  function injectStyle() {
    if (document.getElementById('theme-toggle-style')) return;
    var style = document.createElement('style');
    style.id = 'theme-toggle-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncButtons() {
    var dark = current() === 'dark';
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      if (!buttons[i].querySelector('.tt-knob')) buttons[i].innerHTML = INNER;
      buttons[i].setAttribute('aria-pressed', String(dark));
      buttons[i].setAttribute('aria-label', 'Night mode');
      buttons[i].setAttribute('title', dark ? 'Switch to light mode' : 'Switch to night mode');
    }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    syncButtons();
  }

  injectStyle();
  // Light is the default for everyone; night mode only when the visitor turns it on.
  apply(stored() === 'dark' ? 'dark' : 'light');

  document.addEventListener('DOMContentLoaded', syncButtons);

  document.addEventListener('click', function (e) {
    var button = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!button) return;
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (err) {}
    apply(next);
  });

  // Keep other open tabs of the site (and embedded explorers) in step.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && e.newValue) apply(e.newValue);
  });
})();
