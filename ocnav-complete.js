/* ocnav-complete.js v4.4.0
 * Olive Cover — State manager + dropdown behavior.
 * Nav HTML and CSS are native in Webflow Designer.
 * CSS classes linked via Webflow styles. This script handles:
 *   1. imgraw -> img conversion (Webflow canvas artifact fix)
 *   2. State management (localStorage oc_state)
 *   3. Dropdown open/close behavior
 *   4. State pill update
 */

(function () {
  'use strict';

  var LOGO_URL = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
  var DEFAULT_STATE = 'georgia';
  var STORAGE_KEY = 'oc_state';

  // 1. Fix Webflow imgraw elements -> real img tags
  function fixImgRaw() {
    var rawImgs = document.querySelectorAll('imgraw');
    rawImgs.forEach(function (el) {
      var src = el.getAttribute('data-raw-src') || el.getAttribute('src') || LOGO_URL;
      var img = document.createElement('img');
      // Copy all attributes
      Array.from(el.attributes).forEach(function (attr) {
        if (attr.name !== 'data-raw-src') {
          img.setAttribute(attr.name, attr.value);
        }
      });
      img.src = src;
      img.alt = 'Olive Cover';
      img.style.height = el.style.height || '32px';
      img.style.width = 'auto';
      el.parentNode.replaceChild(img, el);
    });
  }

  // 2. Get/set state
  function getState() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_STATE;
  }

  function setState(s) {
    localStorage.setItem(STORAGE_KEY, s);
  }

  // 3. Update state pill text
  function updateStatePill(state) {
    var pill = document.querySelector('#oc-state-pill, .oc-state-pill, [data-oc-state-pill]');
    if (pill) {
      var label = state.charAt(0).toUpperCase() + state.slice(1);
      pill.textContent = label;
    }
  }

  // 4. Dropdown behavior
  function initDropdowns() {
    var triggers = document.querySelectorAll('[data-oc-dropdown], .oc-dropdown-trigger, .oc-nav-item-has-dropdown > a, .oc-nav-item-has-dropdown > button');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var parent = trigger.closest('[data-oc-dropdown], .oc-nav-item-has-dropdown');
        if (!parent) return;
        var isOpen = parent.classList.contains('open');
        // Close all
        document.querySelectorAll('[data-oc-dropdown].open, .oc-nav-item-has-dropdown.open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!isOpen) {
          parent.classList.add('open');
        }
      });
    });
    // Close on outside click
    document.addEventListener('click', function () {
      document.querySelectorAll('[data-oc-dropdown].open, .oc-nav-item-has-dropdown.open').forEach(function (el) {
        el.classList.remove('open');
      });
    });
  }

  // 5. State switcher clicks
  function initStateSwitcher() {
    var switchers = document.querySelectorAll('[data-oc-state], .oc-state-option');
    switchers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var newState = el.getAttribute('data-oc-state') || el.textContent.trim().toLowerCase();
        setState(newState);
        updateStatePill(newState);
      });
    });
  }

  // Init
  function init() {
    fixImgRaw();
    var state = getState();
    updateStatePill(state);
    initDropdowns();
    initStateSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
