// askolive-complete.js -- Canonical Ask Olive widget loader.
//
// Loads ocwidget.js from jsDelivr at a pinned SHA. This is the SOLE loader
// for the chat widget. Replaces:
//   * The widget-loader IIFE that was tacked onto ocnav-complete.js (nav is
//     for navigation, not chat).
//   * The "ocwgthealer" module that was carried inside ocshim.js (shim is
//     for cross-cutting site overlays, not module loading).
//
// To bump the widget: update WGT_SHA + WGT_VER below, push to @main, and
// bump the Webflow inline-site-script `askolive` cache-bust.
//
// v3.2.0 pin: ocwidget commit 5d0c436f (server-authoritative session_id +
//             multi-turn context retention).
(function () {
  // Skip the network fetch on pages that don't render the widget.
  var path = window.location.pathname;
  if (path === '/' || path === '/ask-olive-disclaimer') return;

  // If a widget is already loaded (or loading) at the correct SHA, no-op.
  var WGT_SHA = '5d0c436f1bdecf16df532d42d455f1b34ffa2294';
  var WGT_VER = '3.2.0';
  var scripts = document.querySelectorAll('script[src*="ocreposit"][src*="ocwidget.js"]');
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf(WGT_SHA) >= 0) return; // already there
  }

  // Defensively strip any stray widget script tags that pin a different SHA
  // (legacy ocnav or pre-fix ocshim healer can leave dangling loaders behind).
  for (var j = 0; j < scripts.length; j++) {
    if (scripts[j].src.indexOf(WGT_SHA) < 0) {
      try { scripts[j].parentNode.removeChild(scripts[j]); } catch (e) {}
    }
  }
  // Same idea for any partially-mounted widget root from a prior SHA.
  var root = document.getElementById('oc-widget-root');
  if (root && root.getAttribute('data-wgt-ver') !== WGT_VER) {
    try { root.parentNode.removeChild(root); } catch (e) {}
  }

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@' + WGT_SHA + '/ocwidget.js?v=' + WGT_VER;
  s.async = true;
  document.head.appendChild(s);
})();
