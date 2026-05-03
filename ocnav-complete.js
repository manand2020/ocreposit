/* ocnav-complete.js v4.8.2
 * Olive Cover — State manager + state switcher + minimal link rewriting infrastructure.
 * Nav HTML is native in Webflow Designer.
 *
 * ARCHITECTURE (committed May 3 2026):
 *   Single-URL with state-aware CMS-driven sections is canonical.
 *   Product pages, claims, carriers all use ONE URL with conditional content
 *   rendering based on body[data-state]. Server-rendered, AEO-friendly.
 *   State hub pages (/states/{state}) are the only state-specific URLs.
 *
 * This script handles ONLY behavior:
 *   1. State management (localStorage oc_state, default national)
 *   2. State pill text update
 *   3. State switcher dropdown open/close (#oc-state-pill toggles #oc-state-panel)
 *   4. State option click sets state, updates pill, sets body[data-state],
 *      closes panel — NO PAGE RELOAD. CSS rules show/hide state-aware sections.
 *   5. Click-outside / ESC closes panel
 *   6. Existing nav dropdown open/close (legacy — kept for compatibility)
 *   7. Minimum behavioral CSS injection — DOCUMENTED EXCEPTION
 *   8. State-aware link rewriting infrastructure (manifest currently empty;
 *      reserved for future state hub use cases)
 *
 * v4.8.2 changes from v4.8.1:
 *   - Removed page reload on state change
 *   - Removed redirect logic (attemptRedirectToStatePage)
 *   - Emptied STATE_MANIFEST (consolidating to single-URL architecture)
 *   - State change is now instant: just toggles body[data-state]
 *   - Kept rewriteNavLinks() infrastructure for future state hub URLs
 *
 * v4.8.1 changes from v4.8.0:
 *   - Populated STATE_MANIFEST.georgia with 27 Insurance page paths
 *
 * v4.8.0 changes from v4.7.1:
 *   - Added STATE_MANIFEST + rewriteNavLinks() infrastructure
 */
(function () {
  'use strict';

  var DEFAULT_STATE = 'national';
  var STORAGE_KEY = 'oc_state';

  var STATES = {
    'national': '⭐ National',
    'georgia':  '🍑 Georgia'
  };

  // Manifest reserved for future state-specific URLs (state hubs only).
  // Architecture decision May 3 2026: product/claims/carrier pages consolidate
  // to single URLs with state-aware CMS sections. Manifest stays empty unless
  // a genuinely state-specific page is built (e.g., /states/{state} hub).
  var STATE_MANIFEST = {
    'georgia': []
  };

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

  // Strip any known state suffix from a path. "/foo-georgia" -> "/foo"
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

  // Rewrite all <a href> inside the nav bar based on current state.
  // No-op when manifest is empty (current state).
  function rewriteNavLinks() {
    var state = getState();
    var nav = document.getElementById('ocnav-bar');
    if (!nav) return;
    var manifest = STATE_MANIFEST[state] || [];
    if (manifest.length === 0 && state !== DEFAULT_STATE) {
      // Still strip stale state suffixes if user switched back to national
    }
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
        // No reload, no redirect. body[data-state] is set; CSS handles the rest.
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
    // Set body[data-state] on load so state-aware CSS sections render correctly
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
