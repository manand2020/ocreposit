/* ocnav-complete.js v4.5.4
 * Olive Cover — State manager + nav search icon.
 * Nav HTML is native in Webflow Designer.
 * This script handles:
 *   1. State management (localStorage oc_state)
 *   2. Dropdown open/close
 *   3. State pill update
 *   4. Search icon link injection (links to /search)
 *
 * v4.5.4 changes from v4.5.3:
 *   - Removed fixImgRaw() entirely -- logo is a native Webflow Image element,
 *     no imgraw tag exists in the DOM
 *   - No CSS changes needed for the logo (inline-imgraw-0 already has height/width natively)
 */
(function () {
  'use strict';

  var DEFAULT_STATE = 'national';
  var STORAGE_KEY = 'oc_state';
  var SEARCH_PAGE = '/search';

  var STATES = {
    'national': '🇺🇸 National',
    'georgia':  '🍑 Georgia',
  };

  function getStateLabel(s) {
    return STATES[s] || (s.charAt(0).toUpperCase() + s.slice(1));
  }

  // 1. State helpers
  function getState() { return localStorage.getItem(STORAGE_KEY) || DEFAULT_STATE; }
  function setState(s) { localStorage.setItem(STORAGE_KEY, s); }

  // 2. Update state pill
  function updateStatePill(state) {
    var pill = document.querySelector('#oc-state-pill, .oc-state-pill, [data-oc-state-pill]');
    if (pill) pill.textContent = getStateLabel(state);
  }

  // 3. Dropdown behavior
  function initDropdowns() {
    var triggers = document.querySelectorAll('.oc-nav-item-has-dropdown > a, .oc-nav-item-has-dropdown > button, [data-oc-dropdown]');
    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        var parent = t.closest('[data-oc-dropdown], .oc-nav-item-has-dropdown');
        if (!parent) return;
        var isOpen = parent.classList.contains('open');
        document.querySelectorAll('.open').forEach(function (el) { el.classList.remove('open'); });
        if (!isOpen) parent.classList.add('open');
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.open').forEach(function (el) { el.classList.remove('open'); });
    });
  }

  // 4. State switcher
  function initStateSwitcher() {
    document.querySelectorAll('[data-oc-state], .oc-state-option').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var s = el.getAttribute('data-oc-state') || el.textContent.trim().toLowerCase();
        setState(s);
        updateStatePill(s);
      });
    });
  }

  // 5. Inject search icon link into nav
  function injectSearch() {
    var navBar = document.querySelector('#ocnav-bar');
    if (!navBar || document.querySelector('#oc-nav-search')) return;

    var link = document.createElement('a');
    link.id = 'oc-nav-search';
    link.href = SEARCH_PAGE;
    link.setAttribute('aria-label', 'Search');
    link.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

    var cta = navBar.lastElementChild;
    navBar.insertBefore(link, cta);
  }

  // Init
  function init() {
    updateStatePill(getState());
    initDropdowns();
    initStateSwitcher();
    injectSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
