/*
 * "More details" panels on the research page.
 * Each toggle opens the panel named in aria-controls and loads the explorer into its
 * iframe the first time. The iframe is resized to fit its content, and the URL hash
 * (#<panel-id>) is kept in sync so an open panel can be shared as a link.
 */
(function () {
  var toggles = document.querySelectorAll('.details-toggle');

  function panelFor(toggle) {
    return document.getElementById(toggle.getAttribute('aria-controls'));
  }

  function fit(iframe) {
    try {
      var body = iframe.contentDocument && iframe.contentDocument.body;
      if (body) iframe.style.height = Math.ceil(body.getBoundingClientRect().height) + 'px';
    } catch (e) {}
  }

  function load(iframe) {
    if (iframe.getAttribute('src')) return;
    iframe.addEventListener('load', function () {
      iframe.classList.add('is-loaded');
      fit(iframe);
      try {
        var doc = iframe.contentDocument;
        if (window.ResizeObserver) new ResizeObserver(function () { fit(iframe); }).observe(doc.body);
        else doc.addEventListener('click', function () { setTimeout(function () { fit(iframe); }, 50); });
      } catch (e) {}
    });
    iframe.setAttribute('src', iframe.getAttribute('data-src'));
  }

  // Pause videos in a closed panel and let the explorer resume them when reopened.
  function setPlaying(iframe, playing) {
    try {
      var doc = iframe.contentDocument;
      if (!doc) return;
      if (playing) doc.dispatchEvent(new Event('visibilitychange'));
      else doc.querySelectorAll('video').forEach(function (v) { v.pause(); });
    } catch (e) {}
  }

  function setOpen(toggle, open, scroll) {
    var panel = panelFor(toggle);
    var iframe = panel.querySelector('iframe');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.details-label').textContent = open ? 'Show less' : 'More details';
    panel.hidden = !open;

    if (open) {
      load(iframe);
      setPlaying(iframe, true);
      if (scroll && panel.getBoundingClientRect().top > window.innerHeight * 0.65) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setPlaying(iframe, false);
    }

    var hash = '#' + panel.id;
    if (open && location.hash !== hash) history.replaceState(null, '', hash);
    if (!open && location.hash === hash) history.replaceState(null, '', location.pathname + location.search);
  }

  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener('click', function () {
      setOpen(this, this.getAttribute('aria-expanded') !== 'true', true);
    });
  }

  // A shared link like /research/#3dgs-manipulation-details opens that panel.
  function openFromHash() {
    if (!location.hash) return;
    var target = document.querySelector('.details-toggle[aria-controls="' + location.hash.slice(1) + '"]');
    if (target && target.getAttribute('aria-expanded') !== 'true') {
      setOpen(target, true, false);
      panelFor(target).scrollIntoView({ block: 'start' });
    }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('resize', function () {
    document.querySelectorAll('.research-details iframe.is-loaded').forEach(fit);
  });
})();
