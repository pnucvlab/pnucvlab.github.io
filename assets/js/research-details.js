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
    if (!iframe || iframe.getAttribute('src')) return;
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
      var doc = iframe && iframe.contentDocument;
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
      fit(iframe);
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
  function startEncoderPrefetch(dataSrc) {
    var base = new URL('3d-scene-assets/', new URL(dataSrc, location.href)).href;
    var names = ['features.bin', 'clip-tokenizer.json', 'ort-wasm-simd.wasm'];
    var state = { got: 0, total: 0, urls: [], files: null };
    for (var i = 0; i < 5; i++) names.push('text-model.part' + i);
    state.urls = names.map(function (name) { return base + name; });

    function concat(chunks, size) {
      var out = new Uint8Array(size);
      var offset = 0;
      for (var n = 0; n < chunks.length; n++) {
        out.set(chunks[n], offset);
        offset += chunks[n].length;
      }
      return out;
    }

    function fromNetwork(url) {
      return fetch(url).then(function (response) {
        if (!response.ok || !response.body) throw new Error('Could not load ' + url.split('/').pop() + '.');
        var declared = Number(response.headers.get('Content-Length')) || 0;
        if (declared) state.total += declared;
        var reader = response.body.getReader();
        var chunks = [];
        var size = 0;
        function read() {
          return reader.read().then(function (result) {
            if (result.done) {
              var out = concat(chunks, size);
              if (!declared) state.total += size;
              if (window.caches) setTimeout(function () {
                caches.open('pnu-3d-encoder-v1').then(function (cache) {
                  return cache.put(url, new Response(out.slice()));
                }).catch(function () {});
              }, 8000);
              return out;
            }
            chunks.push(result.value);
            size += result.value.length;
            state.got += result.value.length;
            return read();
          });
        }
        return read();
      });
    }

    function loadOne(url) {
      if (!window.caches) return fromNetwork(url);
      var lookup = caches.open('pnu-3d-encoder-v1').then(function (cache) {
        return cache.match(url);
      });
      var giveUp = new Promise(function (resolve) { setTimeout(function () { resolve('timeout'); }, 300); });
      return Promise.race([lookup, giveUp]).then(function (hit) {
        if (!hit || hit === 'timeout') return fromNetwork(url);
        return hit.arrayBuffer().then(function (buffer) {
          var out = new Uint8Array(buffer);
          state.got += out.length;
          state.total += out.length;
          return out;
        });
      }).catch(function () { return fromNetwork(url); });
    }

    state.files = Promise.all(state.urls.map(loadOne));
    return state;
  }

  // Download the 3D text encoder while the research page is open, before More details.
  var encoderPanel = document.getElementById('3d-recognition-details');
  var encoderFrame = encoderPanel && encoderPanel.querySelector('iframe');
  if (encoderFrame) window.sceneEncoderPrefetch = startEncoderPrefetch(encoderFrame.getAttribute('data-src'));

  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('resize', function () {
    document.querySelectorAll('.research-details iframe.is-loaded').forEach(fit);
  });
})();
