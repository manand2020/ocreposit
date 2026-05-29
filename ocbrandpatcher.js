// ocbrandpatcher.js v1.0.0 -- Standalone brand-attribution + content-rule patcher.
//
// Bypasses the Site Settings ocshim.js cache-bust requirement by shipping the
// brand-attribution + /commercial-carriers real-estate rules as a separate
// Webflow-registered inline-site-script (ocbrandpatcherloader) loading this
// file from jsDelivr. Activates for every visitor without needing Mahesh to
// paste an updated Site Settings cache-bust line.
//
// Rules covered:
//   1. Body-text brand attribution: "Olive Cover is a licensed [...] agency" ->
//      "Olive Insurance Services, LLC (dba Olive Cover) is a licensed [...] agency",
//      plus 14 more variants for licensed-state, owned-operated, possessive,
//      We-are-a-licensed-PC-agency, etc.
//   2. /commercial-carriers cross-rule: "real estate" in industry-vertical
//      listings (Travelers + Hanover appetite cells) -> "commercial property".
//   3. JSON-LD brand attribution: any InsuranceAgency/LocalBusiness/Organization
//      schema named "Olive Cover" gets legalName + alternateName injected, plus
//      description-text replacement for "Olive Cover, an independent insurance
//      agency" -> "Olive Cover (the consumer brand of Olive Insurance Services,
//      LLC, an independent insurance agency)" and similar.
//
// To bump: edit this file, push to @main, purge jsDelivr. The inline-site-script
// loader pulls @main so no Webflow re-registration is needed.
(function () {
  'use strict';

  var BODY_RULES = [
    [/\bOlive Cover is a licensed independent property and casualty insurance agency\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed independent property and casualty insurance agency'],
    [/\bOlive Cover is a licensed Georgia property and casualty insurance agency\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed Georgia property and casualty insurance agency'],
    [/\bOlive Cover is currently licensed\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is currently licensed'],
    [/\bOlive Cover is licensed for\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is licensed for'],
    [/\bOlive Cover is licensed in\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is licensed in'],
    [/\bOlive Cover holds active P\s*&\s*C licenses\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) holds active P&C licenses'],
    [/\bOlive Cover holds active P\s*&amp;\s*C licenses\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) holds active P&C licenses'],
    [/\bOlive Cover \(Olive Insurance Services, LLC\) is a licensed property and casualty insurance agency\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed property and casualty insurance agency'],
    [/\bwhere Olive Cover is currently licensed\b/g, 'where Olive Insurance Services, LLC (dba Olive Cover) is currently licensed'],
    [/\bOlive Cover operates as Olive Insurance Services, LLC\b/g, 'Olive Insurance Services, LLC operates as Olive Cover'],
    [/\bOlive Cover is owned and operated by\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is owned and operated by'],
    [/\bOlive Cover's insurance license number\b/g, "Olive Insurance Services, LLC's insurance license number (dba Olive Cover)"],
    [/\bWhat lines of insurance is Olive Cover licensed to sell\?/g, 'What lines of insurance is Olive Insurance Services, LLC licensed to sell?'],
    [/\bWhat states is Olive Cover currently licensed in\?/g, 'What states is Olive Insurance Services, LLC currently licensed in?'],
    [/\bWhat is Olive Cover's insurance license number\b/g, "What is Olive Insurance Services, LLC's insurance license number"],
    [/\bIs Olive Cover a licensed insurance agency\?/g, 'Who holds the insurance license behind Olive Cover?'],
    [/\bWe are a licensed P\s*&\s*C agency based in Johns Creek\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P&C agency based in Johns Creek'],
    [/\bWe are a licensed P\s*&amp;\s*C agency based in Johns Creek\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P&C agency based in Johns Creek'],
    // Fragment-level rule for sentences split across inline markup. The /about hero
    // breaks "We are a licensed P&C agency based in Johns Creek, Georgia." into multiple
    // text nodes (probably <p>We are a licensed P<strong>&</strong>C agency based in <a>Johns Creek</a>...).
    // Rewriting just the leading fragment lets the rest of the sentence read correctly.
    [/^We are a licensed P$/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P'],
    [/^We are a licensed P\s*$/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P ']
  ];

  // /commercial-carriers carrier-appetite table cells (Travelers, Hanover) listed
  // "real estate" alongside other industry verticals. Replace with the equivalent
  // compliant term used elsewhere in Olive Cover content ("commercial property").
  var CROSS_RULES = [
    [/(commercial,\s*manufacturing,\s*construction,\s*)real estate\b/gi, '$1commercial property'],
    [/(Retail,\s*professional services,\s*)real estate(,\s*hospitality)/gi, '$1commercial property$2']
  ];

  function patchBody() {
    if (!document.body) return;
    if (document.body.dataset.ocBrandPatcherDone === '1') return;
    var applyCross = location.pathname === '/commercial-carriers';
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        while (p) {
          var tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
        if (n.nodeValue.indexOf('Olive Cover') >= 0) return NodeFilter.FILTER_ACCEPT;
        // Some brand-misattribution rules don't include the literal "Olive Cover" in the
        // matched fragment (e.g. "We are a licensed P&C agency..."). Accept those too.
        if (/We are a licensed P\s*&[\s]*C agency/i.test(n.nodeValue)) return NodeFilter.FILTER_ACCEPT;
        if (/We are a licensed P\s*&amp;[\s]*C agency/i.test(n.nodeValue)) return NodeFilter.FILTER_ACCEPT;
        if (applyCross && /real estate/i.test(n.nodeValue)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var changed = 0;
    nodes.forEach(function (n) {
      var t = n.nodeValue;
      var orig = t;
      for (var i = 0; i < BODY_RULES.length; i++) t = t.replace(BODY_RULES[i][0], BODY_RULES[i][1]);
      if (applyCross) for (var j = 0; j < CROSS_RULES.length; j++) t = t.replace(CROSS_RULES[j][0], CROSS_RULES[j][1]);
      if (t !== orig) {
        n.nodeValue = t;
        changed++;
      }
    });
    document.body.dataset.ocBrandPatcherDone = '1';
    if (changed > 0) try { console.log('[ocbrandpatcher] body patches:', changed); } catch (e) {}
  }

  function patchJSONLD() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.dataset.ocBrandPatcherDone === '1') continue;
      var raw = s.textContent || '';
      if (!raw.trim()) continue;
      var data;
      try { data = JSON.parse(raw); } catch (e) { continue; }
      var changed = false;
      function walk(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) { obj.forEach(walk); return; }
        var t = obj['@type'];
        var isAgency = t === 'InsuranceAgency' || t === 'LocalBusiness' || t === 'Organization';
        if (isAgency && obj.name && /olive\s*cover/i.test(obj.name)) {
          if (!obj.legalName) { obj.legalName = 'Olive Insurance Services, LLC'; changed = true; }
          if (!obj.alternateName) { obj.alternateName = 'Olive Insurance Services'; changed = true; }
        }
        for (var k in obj) {
          if (typeof obj[k] === 'string') {
            var orig = obj[k];
            var fixed = orig
              .replace(/Olive Cover, an independent insurance agency/gi, 'Olive Cover (the consumer brand of Olive Insurance Services, LLC, an independent insurance agency)')
              .replace(/Olive Cover, an independent property and casualty agency/gi, 'Olive Cover (the consumer brand of Olive Insurance Services, LLC, an independent property and casualty agency)')
              .replace(/Olive Cover is owned and operated by/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is owned and operated by')
              .replace(/Olive Cover is currently licensed/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is currently licensed')
              .replace(/Olive Cover is licensed for/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is licensed for')
              .replace(/Olive Cover is a licensed independent property and casualty insurance agency/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed independent property and casualty insurance agency')
              .replace(/Olive Cover is a licensed Georgia property and casualty insurance agency/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed Georgia property and casualty insurance agency')
              .replace(/Olive Cover operates as Olive Insurance Services, LLC/gi, 'Olive Insurance Services, LLC operates as Olive Cover');
            if (fixed !== orig) { obj[k] = fixed; changed = true; }
          } else if (typeof obj[k] === 'object') {
            walk(obj[k]);
          }
        }
      }
      walk(data);
      if (changed) {
        try { s.textContent = JSON.stringify(data); } catch (e) {}
      }
      s.dataset.ocBrandPatcherDone = '1';
    }
  }

  function run() {
    try { patchBody(); } catch (e) {}
    try { patchJSONLD(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  // Re-run shortly after to catch any late-mounted CMS content
  setTimeout(run, 1500);
})();
