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
  // Two legacy `ocwgthealer` variants still run on the live site and fight
  // this loader:
  //   * ocshim @v1.10.63 (Site Settings pin) -> pins ocwidget v2.17.0,
  //     commit 8589056ffb28b0e51c6b89b17161bd6fcd6ab976.
  //   * a stale-cached old ocnav/ocshim (jsDelivr/browser cache, ?v= never
  //     bumped after removal; not in current @main) -> pins ocwidget v2.1.0,
  //     commit ecf00af9b675b6ef618f474f43c793e20b486e5d.
  // Each healer's heal() runs on a timer and, if it does NOT find a <script>
  // whose src contains ITS GOOD_SHA + "ocwidget.js", removes every widget
  // that isn't its SHA and injects its old version -- killing our v3.2.0.
  //
  // We plant ONE inert decoy (type="text/plain" => never fetched/executed)
  // whose src contains BOTH stale SHAs. Each healer finds its SHA, believes
  // its version is already present, and stands down -- it never removes our
  // v3.2.0 and never injects an old widget. Runs on EVERY page (before the
  // path skip) so the healers also can't inject an unwanted widget on pages
  // like / that intentionally have none. The base @ ref is a non-widget
  // placeholder so this never matches our own WGT_SHA early-return check.
  // Harmless once the Site Settings ocshim pin is bumped to v1.10.81 and the
  // ocnav cache-bust is refreshed (no healers); remove the block then.
  var STALE_HEALER_SHAS = [
    '8589056ffb28b0e51c6b89b17161bd6fcd6ab976',
    'ecf00af9b675b6ef618f474f43c793e20b486e5d'
  ];
  try {
    if (!document.querySelector('script[data-oc-wgt-decoy]')) {
      var d = document.createElement('script');
      d.type = 'text/plain';
      d.setAttribute('data-oc-wgt-decoy', '1');
      d.src = 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@stale-healer-decoy/ocwidget.js?neutralize=' + STALE_HEALER_SHAS.join('+');
      (document.head || document.documentElement).appendChild(d);
    }
  } catch (e) {}

  // Skip the network fetch on pages that don't render the widget.
  var path = window.location.pathname;
  if (path === '/' || path === '/ask-olive-disclaimer' || path === '/ask-olive-disclaimer/') return;

  // If a widget is already loaded (or loading) at the correct SHA, no-op.
  var WGT_SHA = '250bce182d8190766cfbec4bf16e89595f0d8cb4';
  var WGT_VER = '3.4.0';
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
