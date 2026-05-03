/* ocnav-complete.js v4.8.0
 * Olive Cover — State manager + state switcher + state-aware link rewriting.
 * Nav HTML is native in Webflow Designer.
 * This script handles ONLY behavior:
 *   1. State management (localStorage oc_state, default national)
 *   2. State pill text update
 *   3. State switcher dropdown open/close (#oc-state-pill toggles #oc-state-panel)
 *   4. State option click sets state, updates pill, rewrites nav links,
 *      redirects current page to state-specific version if exists, else reloads
 *   5. Click-outside / ESC closes panel
 *   6. Existing nav dropdown open/close (legacy — kept for compatibility)
 *   7. Minimum behavioral CSS injection — DOCUMENTED EXCEPTION
 *   8. State-aware link rewriting on every page load — appends state slug
 *      to nav links whose base path is in STATE_MANIFEST for current state
 *
 * v4.8.0 changes from v4.7.1:
 *   - Added STATE_MANIFEST: per-state list of base paths that have state-specific versions
 *   - Added rewriteNavLinks(): on page load, rewrites nav anchor hrefs based on current state
 *   - Added attemptRedirectToStatePage(): on state change, tries to redirect current
 *     page to its state-specific version if available
 *   - State change flow: setState -> updateStatePill -> rewriteNavLinks ->
 *     attemptRedirectToStatePage (which either redirects or reloads)
 */
(function () {
  'use strict';

  var DEFAULT_STATE = 'national';
  var STORAGE_KEY = 'oc_state';

  var STATES = {
    'national': '⭐ National',
    'georgia':  '🍑 Georgia'
  };

  // Manifest: which base paths have state-specific versions per state.
  // Add a base path here when a state-specific page is published in Webflow.
  // Base path = the national URL path (e.g., "/insurance/auto-insurance").
  // The state-specific URL is always base + "-" + state slug
  // (e.g., "/insurance/auto-insurance-georgia").
  // National state has no manifest — it always uses base paths as-is.
  var STATE_MANIFEST = {
    'georgia': [
      // Add base paths here as Georgia-specific pages are published.
      // Example: '/insurance/auto-insurance',
    ]
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
    try { localStorage.setItem(STORAGE_KEY, s); } catch (e) {}
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

  // Given a base path (no state suffix) and a target state, return the path
  // for that state if available per manifest, else return base path.
  function resolvePathForState(basePath, state) {
    if (state === 'national' || state === DEFAULT_STATE) return basePath;
    var manifest = STATE_MANIFEST[state] || [];
    if (manifest.indexOf(basePath) !== -1) {
      return basePath + '-' + state;
    }
    return basePath;
  }

  // Rewrite all <a href> inside the nav bar based on current state.
  // Strategy: every nav link's current href is reduced to its base path
  // (state suffix stripped), then resolved for the current state.
  function rewriteNavLinks() {
    var state = getState();
    var nav = document.getElementById('ocnav-bar');
    if (!nav) return;
    var links = nav.querySelectorAll('a[href]');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      // Skip external links, anchors, mailto, tel
      if (href.indexOf('://') !== -1) return;
      if (href.charAt(0) === '#') return;
      if (href.indexOf('mailto:') === 0) return;
      if (href.indexOf('tel:') === 0) return;
      // Split path from query/hash
      var qIdx = href.search(/[?#]/);
      var path = qIdx === -1 ? href : href.slice(0, qIdx);
      var tail = qIdx === -1 ? '' : href.slice(qIdx);
      // Reduce to base, then resolve for state
      var basePath = stripStateSuffix(path);
      var newPath = resolvePathForState(basePath, state);
      var newHref = newPath + tail;
      if (newHref !== href) {
        a.setAttribute('href', newHref);
      }
    });
  }

  // Try to redirect the current page to its state-specific version.
  // If current page already matches target state's resolution, just reload.
  function attemptRedirectToStatePage() {
    var state = getState();
    var currentPath = window.location.pathname;
    var basePath = stripStateSuffix(currentPath);
    var targetPath = resolvePathForState(basePath, state);
    if (targetPath !== currentPath) {
      // Preserve query/hash from current URL
      window.location.href = targetPath + window.location.search + window.location.hash;
    } else {
      window.location.reload();
    }
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
        closePanel();
        attemptRedirectToStatePage();
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
