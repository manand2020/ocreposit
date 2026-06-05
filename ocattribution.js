// ocattribution.js v1.0.0 -- GCLID + UTM form attribution capture for Olive Cover.
//
// Captures Google Ads click IDs (gclid/gbraid/wbraid), UTM parameters, referrer,
// landing page, and a capture timestamp into all Webflow capture forms on the site.
//
// Strategy:
//   1. On page load, read URL params + _gcl_aw cookie for first-touch attribution.
//   2. Persist the snapshot in sessionStorage (first-touch wins across navigations).
//   3. For each <form> on the page, ensure 12 hidden inputs exist (create if absent).
//   4. Populate those inputs from the snapshot.
//   5. MutationObserver re-runs on dynamically added forms (CRV multi-step, widget).
//
// The script creates missing hidden inputs rather than requiring Designer changes --
// form submissions carry the fields to the Cloud Function, which forwards them to
// OliveCRM. No Designer changes are needed. Idempotent + fully reversible.
//
// Related spec: _oc-marketing-deliverables/gclid-utm-form-capture-2026-06-05.md
(function () {
  'use strict';

  var STORAGE_KEY = 'oc_attr';
  var URL_PARAMS = ['gclid', 'gbraid', 'wbraid', 'fbclid',
                    'utm_source', 'utm_medium', 'utm_campaign',
                    'utm_content', 'utm_term'];
  var ALL_FIELDS = URL_PARAMS.concat(['referrer', 'landing_page', 'attribution_capture_ts']);

  // 1. Read URL params for first-touch attribution
  function readUrlParams() {
    var search = new URLSearchParams(location.search);
    var out = {};
    URL_PARAMS.forEach(function (key) {
      var val = search.get(key);
      if (val) out[key] = val.substring(0, 500);
    });
    return out;
  }

  // 2. Extract gclid from _gcl_aw cookie as fallback
  //    Format: GCL.YYYYMMDD.<gclid>
  function readGclAwCookie() {
    var match = document.cookie.match(/_gcl_aw=([^;]+)/);
    if (!match) return null;
    var parts = decodeURIComponent(match[1]).split('.');
    return parts.length >= 3 ? parts.slice(2).join('.') : null;
  }

  // 3. Get-or-create attribution snapshot in sessionStorage (first-touch wins)
  function getAttribution() {
    try {
      var stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && parsed.attribution_capture_ts) return parsed;
      }
    } catch (e) {}

    var fresh = readUrlParams();
    if (!fresh.gclid) {
      var cookieGclid = readGclAwCookie();
      if (cookieGclid) fresh.gclid = cookieGclid;
    }
    fresh.referrer = (document.referrer || '').substring(0, 500);
    fresh.landing_page = (location.origin + location.pathname).substring(0, 500);
    fresh.attribution_capture_ts = new Date().toISOString();

    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch (e) {}
    return fresh;
  }

  // 4. Ensure a hidden input exists in the form for each attribution field.
  //    Creates it if absent so no Designer changes are required.
  function ensureInput(form, name) {
    var existing = form.querySelector('input[name="' + name + '"]');
    if (existing) return existing;
    var inp = document.createElement('input');
    inp.type = 'hidden';
    inp.name = name;
    inp.setAttribute('data-oc-attr', '1');
    form.appendChild(inp);
    return inp;
  }

  // 5. Populate all forms on the page with attribution data
  function populateForms(attr) {
    document.querySelectorAll('form').forEach(function (form) {
      ALL_FIELDS.forEach(function (name) {
        var inp = ensureInput(form, name);
        if (attr[name]) inp.value = attr[name];
      });
    });
  }

  function init() {
    var attr = getAttribution();
    populateForms(attr);

    // Re-populate on dynamically added forms (CRV multi-step, widget capture form)
    var observer = new MutationObserver(function () { populateForms(attr); });
    observer.observe(document.body, { childList: true, subtree: true });

    // Stop observer after 60s -- page is settled by then
    setTimeout(function () { try { observer.disconnect(); } catch (e) {} }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
