/* ocnav-complete.js v4.9.6
 * Olive Cover Ã¢ÂÂ State manager + state switcher + JS-positioned state panel.
 * Nav HTML is native in Webflow Designer.
 *
 * v4.8.5 changes from v4.8.4:
 * - Added hover-bridge pseudo-element above each .oc-nav-panel so the
 *   cursor gap between the nav trigger and the dropdown panel does not
 *   close the panel prematurely. Adds 12px transparent ::before bridge.
 * - No other logic changes.
 
 * v4.9.0 changes from v4.8.5:
 * - Added mobile nav hamburger toggle handler.
 * - Toggles data-oc-mnav-open attribute on .oc-mobile-nav-wrap.
 * - Locks body scroll, closes on link click and ESC key.
 
 *
 * v4.9.2 changes from v4.9.1:
 * - DEFAULT_STATE changed from 'national' to 'georgia' so GA-specific content
 *   shows by default for all users who have not previously selected a state.
 *   Correct for current GA-only business; revert to 'national' when multi-state
 *   expansion goes live and the state pill is shown.
 *
 * v4.9.1 changes from v4.9.0:
 * - Mobile nav panel display now toggled directly via JS inline style.
 * - Removes dependency on Webflow CSS preprocessor honoring attribute-descendant selectors.
 * - Survives Webflow auto-renaming child element classes.
 */
(function () {
  'use strict';

  var DEFAULT_STATE = 'georgia';
  var STORAGE_KEY   = 'oc_state';
  var STATES = {
    'national': 'Ã¢Â­Â National',
    'georgia':  'Ã°ÂÂÂ Georgia'
  };
  var STATE_MANIFEST = { 'georgia': [] };
  var _resizeRaf = null;

  function injectBehaviorCSS() {
    if (document.getElementById('oc-nav-behavior-css')) return;
    var s = document.createElement('style');
    s.id = 'oc-nav-behavior-css';
    s.textContent = [
      /* State panel show/hide */
      '#oc-state-pill-anchor{display:none!important;}',
      '#oc-state-panel{display:none!important;}',
      '#oc-state-panel.open{display:block!important;}',
      /* Hover bridge: transparent pseudo-element above each nav panel
         fills the gap between the trigger and the panel so moving the
         cursor down does not briefly leave both elements and close it. */
      '@media (min-width:992px){',
      '  .oc-nav-panel::before{',
      '    content:"";',
      '    display:block;',
      '    position:absolute;',
      '    top:-12px;',
      '    left:0;',
      '    right:0;',
      '    height:12px;',
      '    background:transparent;',
      '  }',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function getStateLabel(s) {
    return STATES[s] || (s.charAt(0).toUpperCase() + s.slice(1));
  }

  function getState() {
    try { var s = localStorage.getItem(STORAGE_KEY); return (s && STATES[s]) ? s : DEFAULT_STATE; } catch (e) { return DEFAULT_STATE; }
  }

  function setState(s) {
    if (!STATES[s]) return;
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
      if (path.endsWith(suffix)) { return path.slice(0, -suffix.length); }
    }
    return path;
  }

  function resolvePathForState(basePath, state) {
    if (state === 'national' || state === DEFAULT_STATE) return basePath;
    var manifest = STATE_MANIFEST[state] || [];
    if (manifest.indexOf(basePath) !== -1) { return basePath + '-' + state; }
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
      var newPath  = resolvePathForState(basePath, state);
      var newHref  = newPath + tail;
      if (newHref !== href) { a.setAttribute('href', newHref); }
    });
  }

  function updateStatePill(state) {
    var pill = document.querySelector('#oc-state-pill, .oc-state-pill, [data-oc-state-pill]');
    if (!pill) return;
    var labelTxt = getStateLabel(state);
    var set = false;
    for (var i = 0; i < pill.childNodes.length; i++) {
      var n = pill.childNodes[i];
      if (n.nodeType === 3 && n.textContent.trim()) { n.textContent = labelTxt; set = true; break; }
    }
    if (!set) { pill.insertBefore(document.createTextNode(labelTxt), pill.firstChild); }
  }

  function positionPanel() {
    var pill  = document.getElementById('oc-state-pill');
    var panel = document.getElementById('oc-state-panel');
    if (!pill || !panel) return;
    if (!panel.classList.contains('open')) return;
    var pillRect    = pill.getBoundingClientRect();
    var panelWidth  = panel.offsetWidth;
    var panelHeight = panel.offsetHeight;
    var left = pillRect.right - panelWidth;
    var top  = pillRect.bottom + 8;
    if (left < 8) left = 8;
    var vw = window.innerWidth || document.documentElement.clientWidth;
    if (left + panelWidth > vw - 8) { left = vw - panelWidth - 8; }
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (top + panelHeight > vh - 8) {
      top = pillRect.top - panelHeight - 8;
      if (top < 8) top = 8;
    }
    panel.style.position = 'fixed';
    panel.style.left     = left + 'px';
    panel.style.top      = top  + 'px';
    panel.style.right    = 'auto';
    panel.style.bottom   = 'auto';
  }

  function schedulePositionPanel() {
    if (_resizeRaf) return;
    _resizeRaf = window.requestAnimationFrame(function () { _resizeRaf = null; positionPanel(); });
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
    positionPanel();
  }

  function initStateSwitcher() {
    var pill  = document.getElementById('oc-state-pill');
    var panel = document.getElementById('oc-state-panel');
    if (pill) {
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = panel && panel.classList.contains('open');
        if (open) closePanel(); else openPanel();
      });
      pill.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pill.click(); }
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
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
        document.querySelectorAll('.oc-nav-item-has-dropdown.open, [data-oc-dropdown].open').forEach(function (el) { el.classList.remove('open'); });
        if (!isOpen) parent.classList.add('open');
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.oc-nav-item-has-dropdown.open, [data-oc-dropdown].open').forEach(function (el) { el.classList.remove('open'); });
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

  window.OC          = window.OC || {};
  window.OC.setState = setState;
  window.OC.getState = getState;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* === v4.9.0 mobile nav hamburger toggle === */
  function initMobileNav() {
    var wrap = document.querySelector('.oc-mobile-nav-wrap');
    if (!wrap) return;
    var btn = wrap.querySelector('[data-oc-mnav-toggle]');
    var panel = wrap.querySelector('[data-oc-mnav-panel]');
    if (!btn || !panel) return;
    function setOpen(open) {
      wrap.setAttribute('data-oc-mnav-open', open ? 'true' : 'false');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('oc-mnav-locked', open);
      panel.style.setProperty('display', open ? 'flex' : 'none', 'important');
    }
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var isOpen = wrap.getAttribute('data-oc-mnav-open') === 'true';
      setOpen(!isOpen);
    });
    panel.addEventListener('click', function(e) {
      var target = e.target.closest('a');
      if (target) setOpen(false);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && wrap.getAttribute('data-oc-mnav-open') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }

})();

// Ask Olive Widget loader (v4.9.6+)
(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/manand2020/ocreposit@6868cddeac1bc7c5465d42fa4f7d5893b4def50f/ocwidget.js';s.async=true;document.head.appendChild(s);})();