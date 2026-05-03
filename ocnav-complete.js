/* ocnav-complete.js v4.6.0
 * Olive Cover — State manager + state switcher dropdown.
 * Nav HTML is native in Webflow Designer.
 * This script handles ONLY behavior:
 *   1. State management (localStorage oc_state, default national)
 *   2. State pill text update
 *   3. State switcher dropdown open/close (#oc-state-pill toggles #oc-state-panel)
 *   4. State option click (data-oc-state="national"|"georgia") sets state, updates pill, closes panel, reloads page
 *   5. Click-outside closes panel
 *   6. Existing nav dropdown open/close (.oc-nav-item-has-dropdown / [data-oc-dropdown])
 *
 * v4.6.0 changes from v4.5.4:
 *   - Removed injectSearch() (search icon belongs in Designer canvas, not script-injected)
 *   - Added state switcher dropdown toggle behavior
 *   - State change reloads page so state-aware content re-renders
 */
(function () {
  'use strict';

  var DEFAULT_STATE = 'national';
  var STORAGE_KEY = 'oc_state';

  var STATES = {
    'national': '🇺🇸 National',
    'georgia':  '🍑 Georgia'
  };

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
        window.location.reload();
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
    updateStatePill(getState());
    initStateSwitcher();
    initNavDropdowns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
