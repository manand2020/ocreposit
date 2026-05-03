/* ocnav-complete.js v4.8.3
 * Olive Cover — State manager + state switcher + JS-positioned state panel.
 * Nav HTML is native in Webflow Designer.
 *
 * ARCHITECTURE (committed May 3 2026):
 *   Single-URL with state-aware CMS-driven sections is canonical.
 *   Product pages, claims, carriers all use ONE URL with conditional content
 *   rendering based on body[data-state]. Server-rendered, AEO-friendly.
 *   State hub pages (/states/{state}) are the only state-specific URLs.
 *
 * v4.8.3 changes from v4.8.2:
 *   - Added positionPanel() that measures pill location and sets panel
 *     position:fixed with left/top calculated from pill rect. This bypasses
 *     parent-context positioning issues since panel and pill are siblings
 *     in the OC Nav DOM.
 *   - positionPanel() runs inside openPanel(), and on window resize/scroll
 *     while panel is open, throttled via rAF.
 *   - Edge clamp: if pill is too far right for panel width, clamp left to
 *     8px from viewport edge.
 *
 * v4.8.2 changes from v4.8.1:
 *   - Removed page reload on state change
 *   - Removed redirect logic
 *   - Emptied STATE_MANIFEST (single-URL architecture)
 */
(function () {
  'use strict';

  var DEFAULT_STATE = 'national';
  var STORAGE_KEY = 'oc_state';

  var STATES = {
    'national': '⭐ National',
    'georgia':  '🍑 Georgia'
  };

  var STATE_MANIFEST = {
    'georgia': []
  };

  var _resizeRaf = null;

  function injectBehaviorCSS() {
    if (document.getElementById('oc-nav-behavior-css')) return;
    var s = document.createElement('style');
    s.id = 'oc-nav-behavior-css';
    s.textContent = [
      '#oc-state-panel{display:none!important;}',
      '#oc-state-panel.open{display:block!important;}'
    ].join('');
    document.head.appendChild(s);
  }

  function getStateLabel(s) {
    return STATES[s] || (s.charAt(0).toUpperCase() + s.slice(1));
  }

  function getState() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_STATE; }
    catch (e) { return DEFAULT_STATE; }
  }

  function setState(s) {
    try {
      localStorage.setItem(STORAGE_KEY, s);
      document.body.dataset.state = s;
      window.dispatchEvent(new CustomEvent('oc_state_changed', { detail: { state: s } }));
    } catch (e) {}
  }

  function getKnownStateSlugs() {
    return Object.keys(STATES).filter(function (s) { return s !== 'national'; });
  }

  function stripStateSuffix(path) {
    var slugs = getKnownStateSlugs();
    for (var i = 0; i < slugs.length; i++) {
      var suffix = '-' + slugs[i];
      if (path.endsWith(suffix)) {
        return path.slice(0, -suffix.length);
      }
    }
    return path;
  }

  function resolvePathForState(basePath, state) {
    if (state === 'national' || state === DEFAULT_STATE) return basePath;
    var manifest = STATE_MANIFEST[state] || [];
    if (manifest.indexOf(basePath) !== -1) {
      return basePath + '-' + state;
    }
    return basePath;
  }

  function rewriteNavLinks() {
    var state = getState();
    var nav = document.getElementById('ocnav-bar');
    if (!nav) return;
    var links = nav.querySelectorAll('a[href]');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      if (href.indexOf('://') !== -1) return;
      if (href.charAt(0) === '#') return;
      if (href.indexOf('mailto:') === 0) return;
      if (href.indexOf('tel:') === 0) return;
      var qIdx = href.search(/[?#]/);
      var path = qIdx === -1 ? href : href.slice(0, qIdx);
      var tail = qIdx === -1 ? '' : href.slice(qIdx);
      var basePath = stripStateSuffix(path);
      var newPath = resolvePathForState(basePath, state);
      var newHref = newPath + tail;
      if (newHref !== href) {
        a.setAttribute('href', newHref);
      }
    });
  }

  function updateStatePill(state) {
    var pill = document.querySelector('#oc-state-pill, .oc-state-pill, [data-oc-state-pill]');
    if (!pill) return;
    var labelTxt = getStateLabel(state);
    var set = false;
    for (var i = 0; i < pill.childNodes.length; i++) {
      var n = pill.childNodes[i];
      if (n.nodeType === 3 && n.textContent.trim()) {
        n.textContent = labelTxt;
        set = true;
        break;
      }
    }
    if (!set) {
      pill.insertBefore(document.createTextNode(labelTxt), pill.firstChild);
    }
  }

  // Position the panel relative to pill via JS measurements.
  // Uses position:fixed so we bypass parent-context positioning issues
  // (pill and panel are siblings in OC Nav DOM, not parent-child).
  function positionPanel() {
    var pill  = document.getElementById('oc-state-pill');
    var panel = document.getElementById('oc-state-panel');
    if (!pill || !panel) return;
    if (!panel.classList.contains('open')) return;

    // Measure
    var pillRect = pill.getBoundingClientRect();
    // Panel must be temporarily measurable — it's already display:block via .open class
    var panelWidth = panel.offsetWidth;
    var panelHeight = panel.offsetHeight;

    // Default: panel right edge aligns with pill right edge
    var left = pillRect.right - panelWidth;
    var top  = pillRect.bottom + 8;

    // Edge clamp left side
    if (left < 8) left = 8;

    // Edge clamp right side
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    if (left + panelWidth > viewportWidth - 8) {
      left = viewportWidth - panelWidth - 8;
    }

    // If panel would go below viewport, flip above pill
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (top + panelHeight > viewportHeight - 8) {
      top = pillRect.top - panelHeight - 8;
      if (top < 8) top = 8;
    }

    panel.style.position = 'fixed';
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  function schedulePositionPanel() {
    if (_resizeRaf) return;
    _resizeRaf = window.requestAnimationFrame(function () {
      _resizeRaf = null;
      positionPanel();
    });
  }

  function closePanel() {
    var panel = document.getElementById('oc-state-panel');
    var pill  = document.getElementById('oc-state-pill');
    if (panel) panel.classList.remove('open');
    if (pill)  pill.setAttribute('aria-expanded', 'false');
  }

  function openPanel() {
    var panel = document.getElementById('oc-state-panel');
    var pill  = document.getElementById('oc-state-pill');
    if (panel) panel.classList.add('open');
    if (pill)  pill.setAttribute('aria-expanded', 'true');
    // Position after class is set (so panel is rendered and measurable)
    positionPanel();
  }

  function initStateSwitcher() {
    var pill = document.getElementById('oc-state-pill');
    var panel = document.getElementById('oc-state-panel');

    if (pill) {
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = panel && panel.classList.contains('open');
        if (open) closePanel(); else openPanel();
      });
      pill.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pill.click();
        }
      });
    }

    document.querySelectorAll('[data-oc-state]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var s = el.getAttribute('data-oc-state');
        if (!s) return;
        setState(s);
        updateStatePill(s);
        rewriteNavLinks();
        closePanel();
      });
    });

    document.addEventListener('click', function (e) {
      if (!panel || !pill) return;
      if (panel.contains(e.target) || pill.contains(e.target)) return;
      closePanel();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    // Reposition on resize/scroll while open
    window.addEventListener('resize', schedulePositionPanel);
    window.addEventListener('scroll', schedulePositionPanel, true);
  }

  function initNavDropdowns() {
    var triggers = document.querySelectorAll('.oc-nav-item-has-dropdown > a, .oc-nav-item-has-dropdown > button, [data-oc-dropdown]');
    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        var parent = t.closest('[data-oc-dropdown], .oc-nav-item-has-dropdown');
        if (!parent) return;
        var isOpen = parent.classList.contains('open');
        document.querySelectorAll('.oc-nav-item-has-dropdown.open, [data-oc-dropdown].open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!isOpen) parent.classList.add('open');
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.oc-nav-item-has-dropdown.open, [data-oc-dropdown].open').forEach(function (el) {
        el.classList.remove('open');
      });
    });
  }

  function init() {
    injectBehaviorCSS();
    document.body.dataset.state = getState();
    updateStatePill(getState());
    rewriteNavLinks();
    initStateSwitcher();
    initNavDropdowns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
