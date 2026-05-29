// ocwidgetchips.js v1.0.1 -- Quick-action chips for Ask Olive widget.
//
// Injects three shortcut chips below the widget greeting bubble: "Book a call",
// "Free coverage review", and "Browse FAQ". Visitors who arrive in the widget
// with intent (not just a free-text question) get a 1-click path to the
// highest-converting surfaces. Chips hide once the visitor submits a real chat
// message so the thread stays clean.
//
// Implemented as a separate inline-site-script that overlays the existing
// ocwidget.js DOM. Does NOT modify ocwidget.js -- safer, isolated, reversible.
//
// Loaded site-wide via the inline-site-script `ocwidgetchips`. Skips pages
// where the widget is not rendered (/ and /ask-olive-disclaimer).
(function () {
  'use strict';

  if (location.pathname === '/' || location.pathname === '/ask-olive-disclaimer' || location.pathname === '/ask-olive-disclaimer/') return;

  var CHIPS = [
    { label: 'Book a call', href: '/book', emoji: '' },
    { label: 'Free coverage review', href: '/coverage-review', emoji: '' },
    { label: 'Browse FAQ', href: '/faq', emoji: '' }
  ];

  var INJECTED = false;

  function injectChips() {
    if (INJECTED) return true;
    var greeting = document.querySelector('#oc-wgt-greeting');
    if (!greeting) return false;
    if (document.querySelector('#oc-wgt-chips')) { INJECTED = true; return true; }
    var row = document.createElement('div');
    row.id = 'oc-wgt-chips';
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px 0;padding:0 4px;font-family:Inter,system-ui,sans-serif';
    CHIPS.forEach(function (c) {
      var a = document.createElement('a');
      a.href = c.href;
      a.textContent = c.label;
      a.setAttribute('data-oc-chip', c.href);
      a.style.cssText = 'display:inline-flex;align-items:center;padding:6px 12px;background:#FFFFFF;color:#1B3A5C;font-size:0.8125rem;font-weight:600;text-decoration:none;border:1.5px solid #B8934A;border-radius:18px;line-height:1.2;cursor:pointer;transition:background-color 0.15s ease,color 0.15s ease';
      a.addEventListener('mouseenter', function () { a.style.background = '#B8934A'; a.style.color = '#FFFFFF'; });
      a.addEventListener('mouseleave', function () { a.style.background = '#FFFFFF'; a.style.color = '#1B3A5C'; });
      // Track GA4 event on click for funnel attribution.
      a.addEventListener('click', function () {
        try {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'widget_chip_click', {
              event_category: 'engagement',
              event_label: c.label,
              chip_target: c.href
            });
          }
          if (window.dataLayer) {
            window.dataLayer.push({ event: 'widget_chip_click', chip_target: c.href });
          }
        } catch (e) {}
      });
      row.appendChild(a);
    });
    // Insert after the greeting bubble.
    if (greeting.nextSibling) {
      greeting.parentNode.insertBefore(row, greeting.nextSibling);
    } else {
      greeting.parentNode.appendChild(row);
    }
    INJECTED = true;
    bindHideOnSubmit();
    return true;
  }

  function bindHideOnSubmit() {
    // Hide chips once the visitor sends a chat message. The widget submits
    // via #oc-wgt-form (form id). When ocwidget appends a user-side bubble
    // we hide the chips so the conversation stays uncluttered.
    var form = document.querySelector('#oc-wgt-form');
    if (form && !form.dataset.ocChipsBound) {
      form.dataset.ocChipsBound = '1';
      form.addEventListener('submit', function () { hideChips(); });
    }
    // Also observe the thread for new user bubbles in case the submit is
    // intercepted upstream and submit-event doesn't fire.
    var thread = document.querySelector('#oc-wgt-thread');
    if (thread && !thread.dataset.ocChipsObserved) {
      thread.dataset.ocChipsObserved = '1';
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 1 && /msg-wrap--in|bubble--in/.test(n.className || '')) {
              hideChips();
              return;
            }
          }
        }
      });
      obs.observe(thread, { childList: true, subtree: true });
    }
  }

  function hideChips() {
    var row = document.querySelector('#oc-wgt-chips');
    if (row && row.style.display !== 'none') {
      row.style.display = 'none';
    }
  }

  // Wait for the greeting bubble via MutationObserver -- robust against late
  // widget mount on heavy CMS pages where polling can time out. Falls back to
  // polling as belt-and-suspenders.
  function watch() {
    if (injectChips()) return;
    var obs = new MutationObserver(function () {
      if (injectChips()) {
        obs.disconnect();
      }
    });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    // Safety: stop observing after 60s of no greeting (saves memory on rare
    // pages where widget never mounts).
    setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 60000);
    // Also poll for the first 7.5s as a defensive belt-and-suspenders for
    // browsers / observers that miss the initial mount.
    var tries = 0;
    (function poll() {
      if (INJECTED) return;
      if (injectChips()) return;
      if (++tries > 30) return;
      setTimeout(poll, 250);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
})();
