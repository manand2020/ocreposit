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
  // ------------------------------------------------------------------
  // STALE-HEALER NEUTRALIZER (2026-05-29).
  // Site Settings still pins ocshim to @v1.10.63, which carries the old
  // `ocwgthealer` module. That healer force-loads ocwidget v2.17.0
  // (commit 8589056f) on a timer and REMOVES any widget that isn't its
  // pinned SHA -- so it kills this loader's v3.2.0 and reverts the site to
  // the old widget. ocshim @main/@v1.10.81 already removed the healer, but
  // the Site Settings loader bump is blocked by the CodeMirror save desync.
  //
  // The healer's heal() returns early if it finds ANY <script> whose src
  // contains its GOOD_SHA (8589056f) + "ocwidget.js". We plant an inert
  // decoy (type="text/plain" => never fetched or executed) carrying that
  // SHA, so the healer believes its version is already present and stands
  // down -- it never removes our real v3.2.0 and never injects v2.17.0.
  // Runs on EVERY page (before the path skip) so the healer also can't
  // inject an unwanted widget on pages like / that intentionally have none.
  // Harmless once ocshim is bumped to v1.10.81 (no healer); remove then.
  var STALE_HEALER_SHA = '8589056ffb28b0e51c6b89b17161bd6fcd6ab976';
  try {
    if (!document.querySelector('script[data-oc-wgt-decoy]')) {
      var d = document.createElement('script');
      d.type = 'text/plain';
      d.setAttribute('data-oc-wgt-decoy', '1');
      d.src = 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@' + STALE_HEALER_SHA + '/ocwidget.js?neutralized=1';
      (document.head || document.documentElement).appendChild(d);
    }
  } catch (e) {}

  // Skip the network fetch on pages that don't render the widget.
  var path = window.location.pathname;
  if (path === '/' || path === '/ask-olive-disclaimer' || path === '/ask-olive-disclaimer/') return;

  // If a widget is already loaded (or loading) at the correct SHA, no-op.
  var WGT_SHA = '5d0c436f1bdecf16df532d42d455f1b34ffa2294';
  var WGT_VER = '3.2.0';
  var scripts = document.querySelectorAll('script[src*="ocreposit"][src*="ocwidget.js"]');
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf(WGT_SHA) >= 0) return; // already there
  }

  // Defensively strip any stray widget script tags that pin a different SHA
  // (legacy ocnav or pre-fix ocshim healer can leave dangling loaders behind).
  // Never strip our own inert decoy.
  for (var j = 0; j < scripts.length; j++) {
    if (scripts[j].hasAttribute('data-oc-wgt-decoy')) continue;
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
