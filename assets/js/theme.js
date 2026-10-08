/*
 * Night mode for every PNU CVLab page.
 * Load this in <head> without defer so the theme is set before the page paints.
 * Any element with a data-theme-toggle attribute becomes a light/dark switch.
 * The visitor's choice is remembered; until they choose, the OS setting is followed.
 */
(function () {
  var KEY = 'pnucvlab-theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 14.6A8.5 8.5 0 0 1 9.4 3a8.5 8.5 0 1 0 11.6 11.6z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></g></svg>';

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
      buttons[i].innerHTML = dark ? SUN : MOON;
      buttons[i].setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to night mode');
      buttons[i].setAttribute('title', dark ? 'Light mode' : 'Night mode');
    }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    syncButtons();
  }

  apply(stored() || (media && media.matches ? 'dark' : 'light'));

  if (media) {
    var follow = function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); };
    if (media.addEventListener) media.addEventListener('change', follow);
    else if (media.addListener) media.addListener(follow);
  }

  document.addEventListener('DOMContentLoaded', syncButtons);

  document.addEventListener('click', function (e) {
    var button = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!button) return;
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (err) {}
    apply(next);
  });

  // Keep other open tabs of the site in step.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && e.newValue) apply(e.newValue);
  });
})();
