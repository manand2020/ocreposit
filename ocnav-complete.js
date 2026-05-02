/* ocnav-complete.js v4.5.0
 * Olive Cover — State manager + nav search widget.
 * Nav HTML is native in Webflow Designer.
 * This script handles:
 *   1. imgraw -> img fix (Webflow canvas artifact)
 *   2. State management (localStorage oc_state)
 *   3. Dropdown open/close
 *   4. State pill update
 *   5. Search widget injection + behavior
 */
(function () {
  'use strict';

  var LOGO_URL = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
  var DEFAULT_STATE = 'georgia';
  var STORAGE_KEY = 'oc_state';
  var SEARCH_PAGE = '/site-search';

  // 1. Fix imgraw -> real img
  function fixImgRaw() {
    var rawImgs = document.querySelectorAll('imgraw');
    rawImgs.forEach(function (el) {
      var src = el.getAttribute('data-raw-src') || el.getAttribute('src') || LOGO_URL;
      var img = document.createElement('img');
      Array.from(el.attributes).forEach(function (attr) {
        if (attr.name !== 'data-raw-src') img.setAttribute(attr.name, attr.value);
      });
      img.src = src;
      img.alt = 'Olive Cover';
      img.style.height = '40px';
      img.style.width = 'auto';
      img.style.display = 'block';
      el.parentNode.replaceChild(img, el);
    });
  }

  // 2. State helpers
  function getState() { return localStorage.getItem(STORAGE_KEY) || DEFAULT_STATE; }
  function setState(s) { localStorage.setItem(STORAGE_KEY, s); }

  // 3. Update state pill
  function updateStatePill(state) {
    var pill = document.querySelector('#oc-state-pill, .oc-state-pill, [data-oc-state-pill]');
    if (pill) pill.textContent = state.charAt(0).toUpperCase() + state.slice(1);
  }

  // 4. Dropdown behavior
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

  // 5. State switcher
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

  // 6. Inject search widget into nav
  function injectSearch() {
    var navBar = document.querySelector('#ocnav-bar');
    if (!navBar || document.querySelector('#oc-nav-search')) return;

    // Build CSS once
    if (!document.querySelector('#oc-nav-search-css')) {
      var style = document.createElement('style');
      style.id = 'oc-nav-search-css';
      style.textContent = [
        '#oc-nav-search{position:relative;display:flex;align-items:center;margin-right:8px;}',
        '#oc-search-toggle{background:transparent;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:6px;color:#fff;opacity:0.75;transition:opacity 0.2s;flex-shrink:0;}',
        '#oc-search-toggle:hover{opacity:1;}',
        '#oc-search-form{display:flex;align-items:center;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.25);border-radius:24px;overflow:hidden;max-width:0;opacity:0;transition:max-width 0.3s ease,opacity 0.25s ease;}',
        '#oc-search-form.open{max-width:260px;opacity:1;}',
        '#oc-search-input{background:transparent;border:none;outline:none;color:#fff;font-family:Inter,sans-serif;font-size:14px;padding:8px 14px;width:190px;}',
        '#oc-search-input::placeholder{color:rgba(255,255,255,0.5);}',
        '#oc-search-submit{background:transparent;border:none;cursor:pointer;padding:6px 10px;color:#fff;display:flex;align-items:center;opacity:0.8;flex-shrink:0;}'
      ].join('');
      document.head.appendChild(style);
    }

    // Build widget HTML
    var wrap = document.createElement('div');
    wrap.id = 'oc-nav-search';
    wrap.innerHTML = [
      '<button id="oc-search-toggle" aria-label="Search" type="button">',
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      '</svg></button>',
      '<div id="oc-search-form">',
      '<input id="oc-search-input" type="search" placeholder="Search coverage, carriers..." autocomplete="off"/>',
      '<button id="oc-search-submit" type="button" aria-label="Go">',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
      '<polyline points="9 18 15 12 9 6"/></svg>',
      '</button></div>'
    ].join('');

    // Insert before the CTA (last child of navBar)
    var cta = navBar.lastElementChild;
    navBar.insertBefore(wrap, cta);

    // Wire behavior
    var toggle = document.getElementById('oc-search-toggle');
    var form = document.getElementById('oc-search-form');
    var input = document.getElementById('oc-search-input');
    var submit = document.getElementById('oc-search-submit');
    var isOpen = false;

    function openSearch() {
      isOpen = true;
      form.classList.add('open');
      setTimeout(function () { input.focus(); }, 50);
    }
    function closeSearch() {
      isOpen = false;
      form.classList.remove('open');
      input.value = '';
    }
    function doSearch() {
      var q = input.value.trim();
      if (q) window.location.href = SEARCH_PAGE + '?q=' + encodeURIComponent(q);
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen ? closeSearch() : openSearch();
    });
    submit.addEventListener('click', doSearch);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
      if (e.key === 'Escape') closeSearch();
    });
    document.addEventListener('click', function (e) {
      if (isOpen && !wrap.contains(e.target)) closeSearch();
    });
  }

  // Init
  function init() {
    fixImgRaw();
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
