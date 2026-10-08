/*
 * Scroll reveal for the main site. Elements matching REVEAL fade up as they enter the
 * viewport; siblings in the same container are staggered. The "reveal-on" class (set in
 * _includes/head.html unless the visitor prefers reduced motion) is what hides them first.
 */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('reveal-on')) return;

  var REVEAL = [
    '.page-intro > *',
    '.page-section',
    '.research-intro > *',
    '.research-section',
    '.topic-grid > a',
    '.member', '.alumnus',
    '.year-block',
    '.event',
    '.contact-item', '.map',
    '.news-list li'
  ].join(',');

  var items = document.querySelectorAll(REVEAL);

  // Stagger siblings that share a parent (e.g. cards in a grid), capped so long lists stay quick.
  for (var i = 0; i < items.length; i++) {
    var el = items[i], parent = el.parentElement, n = 0;
    for (var c = parent.firstElementChild; c && c !== el; c = c.nextElementSibling) {
      if (c.matches && c.matches(REVEAL)) n++;
    }
    el.style.setProperty('--reveal-delay', Math.min(n, 5) * 70 + 'ms');
  }

  // After the fade-up finishes, mark it done so the element's own hover transitions apply again.
  function show(el) {
    el.classList.add('is-visible');
    var delay = parseInt(el.style.getPropertyValue('--reveal-delay'), 10) || 0;
    setTimeout(function () { el.classList.add('reveal-done'); }, delay + 750);
  }

  if (!('IntersectionObserver' in window)) {
    for (var k = 0; k < items.length; k++) show(items[k]);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  for (var j = 0; j < items.length; j++) io.observe(items[j]);
  root.classList.add('reveal-ready');
})();
