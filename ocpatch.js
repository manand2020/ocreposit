// ocpatch.js v1.4.1 -- Consolidated runtime patcher for Olive Cover.
//
// Merges five standalone inline-site-scripts that previously each loaded a
// separate file and/or ran its own MutationObserver + TreeWalker pass on
// every page:
//
//   ocagentadvisor  -> agent->advisor text rewrite
//   ocbrandpatcher  -> brand-attribution body text + JSON-LD rewrite
//   ocbookpromo     -> Book a call CTA (nav + footer), GA4 + Clip CRM bridge,
//                      AEO JSON-LD on /book and /coverage-gap-calculator
//   ocwidgetchips   -> Ask Olive widget quick-action chips
//   occtafix        -> strip stray inline color on claims/stub CTAs (v1.1.0)
//
// Optimization: ONE jsDelivr request instead of five, ONE shared
// MutationObserver instead of multiple, ONE TreeWalker text pass instead of
// three. All text rules (agent + brand + cross) are applied in a single
// traversal.
//
// Every operation is idempotent. Reversible by unregistering the `ocpatch`
// inline-site-script.
(function () {
  'use strict';

  var path = location.pathname;
  var ON_BOOK = (path === '/book' || path === '/book/');
  var ON_GAPCALC = (path === '/coverage-gap-calculator' || path === '/coverage-gap-calculator/');
  var ON_COMMERCIAL_CARRIERS = (path === '/commercial-carriers' || path === '/commercial-carriers/');
  var WIDGET_SKIP = (path === '/' || path === '/ask-olive-disclaimer' || path === '/ask-olive-disclaimer/');

  var BOOK_URL = '/book';
  var BOOK_LABEL = 'Book a call';
  var FORMS_BASE = 'https://forms-3q26d3khpa-ue.a.run.app/forms';
  var FORMS_AUTH = 'fLnkE70cjSKztJ2VGnThheVSFwuW16WepOCxcSrDeHY=';

  // ====================================================================
  // 1. TEXT RULES (applied in a single TreeWalker pass)
  // ====================================================================

  // agent -> advisor (brand voice)
  var AGENT_RULES = [
    [/\blicensed insurance agent, broker, or counselor\b/g, 'licensed insurance advisor, broker, or counselor'],
    [/\blicensed insurance agent\b/g, 'licensed insurance advisor'],
    [/\blicensed agent\b/g, 'licensed advisor'],
    [/\binsurance agent.s license\b/g, "insurance advisor's license"],
    [/\binsurance agent\b/g, 'insurance advisor'],
    [/\bindependent agent\b/g, 'independent advisor'],
    [/\bIndependent Agent\b/g, 'Independent Advisor'],
    [/\bcaptive agent\b/g, 'captive advisor'],
    [/\bYour Agent Needs It\b/g, 'Your Advisor Needs It'],
    [/\byour agent\b/g, 'your advisor'],
    [/\bYour agent\b/g, 'Your advisor'],
    [/\bour agent\b/g, 'our advisor'],
    [/\bThe agent is who you buy from\b/g, 'The advisor is who you buy from'],
    [/\bthe agent is who you buy from\b/g, 'the advisor is who you buy from'],
    [/\bagent will follow up\b/g, 'advisor will follow up']
  ];

  // brand attribution: "Olive Cover is a licensed [...] agency" ->
  // "Olive Insurance Services, LLC (dba Olive Cover) is a licensed [...] agency"
  var BRAND_RULES = [
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
    [/^We are a licensed P$/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P'],
    [/^We are a licensed P\s*$/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P ']
  ];

  // /commercial-carriers carrier-appetite cells: "real estate" -> "commercial property"
  var CROSS_RULES = [
    [/(commercial,\s*manufacturing,\s*construction,\s*)real estate\b/gi, '$1commercial property'],
    [/(Retail,\s*professional services,\s*)real estate(,\s*hospitality)/gi, '$1commercial property$2']
  ];

  function nodeMatters(v) {
    if (!v) return false;
    if (/\bagent\b/i.test(v)) return true;
    if (v.indexOf('Olive Cover') >= 0) return true;
    if (/We are a licensed P/i.test(v)) return true;
    if (ON_COMMERCIAL_CARRIERS && /real estate/i.test(v)) return true;
    return false;
  }

  function patchText() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        while (p) {
          var tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return nodeMatters(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var i, j;
    nodes.forEach(function (n) {
      var t = n.nodeValue;
      var orig = t;
      for (i = 0; i < AGENT_RULES.length; i++) t = t.replace(AGENT_RULES[i][0], AGENT_RULES[i][1]);
      for (i = 0; i < BRAND_RULES.length; i++) t = t.replace(BRAND_RULES[i][0], BRAND_RULES[i][1]);
      if (ON_COMMERCIAL_CARRIERS) for (j = 0; j < CROSS_RULES.length; j++) t = t.replace(CROSS_RULES[j][0], CROSS_RULES[j][1]);
      if (t !== orig) n.nodeValue = t;
    });
  }

  function patchJSONLD() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.dataset.ocPatchDone === '1') continue;
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
      if (changed) { try { s.textContent = JSON.stringify(data); } catch (e) {} }
      s.dataset.ocPatchDone = '1';
    }
  }

  // ====================================================================
  // 2. BOOK A CALL -- footer + nav CTA
  // ====================================================================

  function injectFooter() {
    if (document.querySelector('[data-oc-book-footer="1"]')) return;
    var faqLinks = document.querySelectorAll('a[href="/faq"], a[href$="/faq"]');
    if (!faqLinks.length) return;
    var footerFaq = faqLinks[faqLinks.length - 1];
    var linkWrap = footerFaq.parentElement;
    var column = linkWrap && linkWrap.parentElement;
    if (!column) return;
    var newWrap = document.createElement(linkWrap.tagName);
    newWrap.setAttribute('data-oc-book-footer', '1');
    if (linkWrap.className) newWrap.className = linkWrap.className;
    var a = document.createElement('a');
    a.href = BOOK_URL;
    a.textContent = BOOK_LABEL;
    a.className = footerFaq.className || '';
    newWrap.appendChild(a);
    column.appendChild(newWrap);
  }

  function injectNav() {
    if (ON_BOOK) return;
    if (document.querySelector('[data-oc-book-nav="1"]')) return;
    var navCTA = null;
    var anchors = document.querySelectorAll('a[href="/coverage-review"]');
    for (var i = 0; i < anchors.length; i++) {
      var inNav = anchors[i].closest('nav') || anchors[i].closest('header') || anchors[i].closest('[class*="oc-nav"]');
      if (inNav) { navCTA = anchors[i]; break; }
    }
    if (!navCTA) return;
    var book = document.createElement('a');
    book.href = BOOK_URL;
    book.setAttribute('data-oc-book-nav', '1');
    book.textContent = BOOK_LABEL;
    book.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;padding:0 14px;height:44px;margin-right:8px;color:#1B3A5C;font-family:Inter,system-ui,sans-serif;font-size:0.9375rem;font-weight:600;text-decoration:none;border-radius:6px;border:1px solid #B8934A;background:transparent;transition:background-color 0.15s ease,color 0.15s ease';
    book.addEventListener('mouseenter', function () { book.style.background = '#B8934A'; book.style.color = '#FFFFFF'; });
    book.addEventListener('mouseleave', function () { book.style.background = 'transparent'; book.style.color = '#1B3A5C'; });
    navCTA.parentNode.insertBefore(book, navCTA);
  }

  // ====================================================================
  // 3. BOOKING conversion tracking + Clip CRM bridge (/book only)
  // ====================================================================

  var bookingListenerBound = false;
  function trackBookings() {
    if (!ON_BOOK || bookingListenerBound) return;
    bookingListenerBound = true;
    window.addEventListener('message', function (ev) {
      try {
        if (!ev || !ev.data) return;
        var data = ev.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) { return; } }
        var t = data && (data.type || data.event || data.action);
        if (!t) return;
        if (!/booking/i.test(String(t)) || !/success/i.test(String(t))) return;
        var payload = data.payload || data.data || {};
        try {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'book_appointment', {
              event_category: 'conversion',
              event_label: 'cal_diy_advisor_call',
              source_url: location.href,
              booking_uid: payload.uid || payload.bookingUid || '',
              event_type: payload.eventType && payload.eventType.slug ? payload.eventType.slug : 'advisorcall'
            });
          }
        } catch (e) {}
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'book_appointment', booking_source: 'cal_diy', booking_uid: payload.uid || payload.bookingUid || '' });
        } catch (e) {}
        showConfirmation();
        sendBookingToCRM(payload);
      } catch (e) {}
    }, false);
  }

  function sendBookingToCRM(payload) {
    try {
      var uid = (payload && (payload.uid || payload.bookingUid)) || ('anon-' + Date.now());
      var key = 'oc_booking_sent_' + uid;
      if (sessionStorage.getItem(key) === '1') return;
      sessionStorage.setItem(key, '1');
      var attendee = (payload && payload.attendees && payload.attendees[0]) || {};
      var body = {
        form_type: 'booking',
        source: 'cal_diy_advisor_call',
        booking_uid: uid,
        event_type: payload && payload.eventType && payload.eventType.slug ? payload.eventType.slug : 'advisorcall',
        start_time: payload && (payload.startTime || (payload.booking && payload.booking.startTime)) || null,
        name: attendee.name || '',
        email: attendee.email || '',
        phone: attendee.phone || '',
        page_url: location.href,
        notes: 'Booked via cal.diy on book.olivecover.com. See cal.diy booking ' + uid + ' for full details.'
      };
      fetch(FORMS_BASE + '/booking', {
        method: 'POST', mode: 'cors',
        headers: { 'Content-Type': 'application/json', 'X-Forms-Auth': FORMS_AUTH },
        body: JSON.stringify(body), keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  function showConfirmation() {
    if (document.querySelector('[data-oc-book-confirm="1"]')) return;
    var host = document.querySelector('#oc-cal-inline') || document.querySelector('[id*="cal-inline"]') || document.body;
    var box = document.createElement('div');
    box.setAttribute('data-oc-book-confirm', '1');
    box.style.cssText = 'margin:24px auto;padding:20px 28px;max-width:680px;background:#F5EDD8;border:2px solid #B8934A;border-radius:10px;font-family:Inter,system-ui,sans-serif;color:#1B3A5C;text-align:center';
    box.innerHTML = '<div style="font-family:Playfair Display,Georgia,serif;font-size:1.4rem;font-weight:600;margin-bottom:6px">Your call is booked.</div>' +
      '<div style="font-size:0.95rem;line-height:1.5">Confirmation email is on its way. We will reach out before the call to confirm any details. If you need to reschedule, use the link in the confirmation email.</div>';
    if (host && host.parentNode) host.parentNode.insertBefore(box, host); else document.body.appendChild(box);
  }

  // ====================================================================
  // 4. AEO JSON-LD on /book and /coverage-gap-calculator
  // ====================================================================

  function injectSchema() {
    if (!ON_BOOK && !ON_GAPCALC) return;
    if (document.querySelector('script[data-oc-patch-schema="1"]')) return;
    var schema;
    if (ON_BOOK) {
      schema = {
        "@context": "https://schema.org", "@type": "Service",
        "name": "Insurance advisor consultation", "alternateName": "Book a call with Olive Cover",
        "description": "Schedule a free call with a licensed insurance advisor at Olive Insurance Services, LLC (dba Olive Cover). Review your current coverage, find gaps, and get quotes across multiple A-rated carriers.",
        "provider": { "@type": "InsuranceAgency", "name": "Olive Cover", "legalName": "Olive Insurance Services, LLC", "url": "https://olivecover.com", "telephone": "+1-678-888-1011", "address": { "@type": "PostalAddress", "streetAddress": "6470 East Johns Crossing Suite 160", "addressLocality": "Johns Creek", "addressRegion": "GA", "postalCode": "30097", "addressCountry": "US" } },
        "areaServed": { "@type": "State", "name": "Georgia" },
        "audience": { "@type": "Audience", "audienceType": "Personal and small business insurance buyers" },
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" },
        "url": "https://olivecover.com/book"
      };
    } else {
      schema = {
        "@context": "https://schema.org", "@type": ["WebApplication", "HowTo"],
        "name": "Coverage Gap Calculator",
        "description": "Free interactive tool to estimate four common insurance coverage gaps: dwelling underinsurance, liability vs. net worth, wind and hail deductible exposure, and flood exclusion.",
        "applicationCategory": "FinanceApplication", "operatingSystem": "Web", "browserRequirements": "Requires JavaScript",
        "url": "https://olivecover.com/coverage-gap-calculator",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "InsuranceAgency", "name": "Olive Cover", "legalName": "Olive Insurance Services, LLC", "url": "https://olivecover.com" },
        "step": [
          { "@type": "HowToStep", "name": "Enter home and net worth basics", "text": "Provide your home replacement cost, current dwelling limit, liability limit, and net worth." },
          { "@type": "HowToStep", "name": "Choose your hazard exposures", "text": "Indicate proximity to coast, hail-prone metro, or flood zone." },
          { "@type": "HowToStep", "name": "Review your gap signals", "text": "See four scored gap signals with plain-language guidance on how to close each one." }
        ]
      };
    }
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-oc-patch-schema', '1');
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  // ====================================================================
  // 5. Ask Olive widget quick-action chips
  // ====================================================================

  var CHIPS = [
    { label: 'Book a call', href: '/book' },
    { label: 'Free coverage review', href: '/coverage-review' },
    { label: 'Browse FAQ', href: '/faq' }
  ];
  var CHIPS_SUPPRESS = false;

  function injectChips() {
    if (WIDGET_SKIP || CHIPS_SUPPRESS) return;
    var greeting = document.querySelector('#oc-wgt-greeting');
    if (!greeting) return;
    if (document.querySelector('#oc-wgt-chips')) return;
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
      a.addEventListener('click', function () {
        try {
          if (typeof window.gtag === 'function') window.gtag('event', 'widget_chip_click', { event_category: 'engagement', event_label: c.label, chip_target: c.href });
          if (window.dataLayer) window.dataLayer.push({ event: 'widget_chip_click', chip_target: c.href });
        } catch (e) {}
      });
      row.appendChild(a);
    });
    if (greeting.nextSibling) greeting.parentNode.insertBefore(row, greeting.nextSibling);
    else greeting.parentNode.appendChild(row);
    bindHideOnSubmit();
  }

  function bindHideOnSubmit() {
    // NOTE: do NOT hide chips on form submit -- the capture form's "Start Chat"
    // is a form submit and must NOT suppress the chips (that was the bug where
    // chips vanished after Start Chat). Chips are hidden only when an actual
    // inbound chat message appears (handled by the thread observer below).
    var thread = document.querySelector('#oc-wgt-thread');
    if (thread && !thread.dataset.ocChipsObserved) {
      thread.dataset.ocChipsObserved = '1';
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 1 && /msg-wrap--in|bubble--in/.test(n.className || '')) { hideChips(); return; }
          }
        }
      });
      obs.observe(thread, { childList: true, subtree: true });
    }
  }

  function hideChips() {
    CHIPS_SUPPRESS = true;
    var row = document.querySelector('#oc-wgt-chips');
    if (row) row.remove();
  }

  // ====================================================================
  // 6. CTA color fix (folded in from occtafix) -- remove stray inline color
  //    on claims hero CTA and stub primary CTA so brand styling wins.
  // ====================================================================

  function fixCTAColor() {
    var els = document.querySelectorAll('.oc-claims-hero-cta, .oc-stub-cta-primary');
    for (var i = 0; i < els.length; i++) els[i].style.removeProperty('color');
  }

  // ====================================================================
  // 7. Homepage Ask Olive lead-form button -- brand the generic "Submit".
  // ====================================================================

  function fixHomeButton() {
    if (location.pathname !== '/' && location.pathname !== '') return;
    var form = document.querySelector('#oc-lead-form-el');
    if (!form) return;
    var btn = form.querySelector('input[type="submit"]');
    if (btn && btn.value !== 'Ask Olive') {
      btn.value = 'Ask Olive';
      // keep the "please wait" state on-brand too
      try { btn.setAttribute('data-wait', 'Sending...'); } catch (e) {}
    }
  }

  // ====================================================================
  // 8. /contact topic select -- add an aria-label (a11y; selects can't use
  //    placeholder, and this one had no associated label).
  // ====================================================================

  function fixContactSelect() {
    if (location.pathname.indexOf('/contact') !== 0) return;
    var sel = document.querySelector('select[name="topic"]');
    if (sel && !sel.getAttribute('aria-label') && !sel.getAttribute('aria-labelledby')) {
      sel.setAttribute('aria-label', 'What is your inquiry about?');
    }
  }

  // /book is Olive-gated: it should funnel to the Ask Olive chat, NOT embed a
  // directly-bookable calendar. Hide the old inline cal.diy embed and inject a
  // "talk to Olive" CTA that opens the chat widget (Olive qualifies the visitor,
  // then triggers the booking popup via OC_OpenBooking). Per OC-Clip rev3 spec.
  function fixBookPage() {
    if (location.pathname !== '/book' && location.pathname !== '/book/') return;
    var embed = document.querySelector('#oc-cal-inline');
    if (embed) embed.style.display = 'none';
    if (document.querySelector('[data-oc-book-chat-cta]')) return;
    var box = document.createElement('div');
    box.setAttribute('data-oc-book-chat-cta', '1');
    box.style.cssText = 'max-width:640px;margin:24px auto;padding:28px 30px;background:#F5EDD8;border:2px solid #B8934A;border-radius:12px;font-family:Inter,system-ui,sans-serif;color:#1B3A5C;text-align:center';
    box.innerHTML = '<div style="font-family:Playfair Display,Georgia,serif;font-size:1.5rem;font-weight:600;margin-bottom:8px">Talk to Olive to find your fit</div>' +
      '<div style="font-size:0.95rem;line-height:1.55;margin-bottom:18px">Tell Olive what you need (coverage review, a claim question, or anything else) and she will help you book the right time with a licensed Olive Cover advisor.</div>' +
      '<button type="button" data-oc-book-chat-open style="display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 22px;background:#1B3A5C;color:#F5EDD8;border:none;border-radius:6px;font-family:Inter,system-ui,sans-serif;font-size:0.95rem;font-weight:600;cursor:pointer">Chat with Olive</button>';
    box.querySelector('[data-oc-book-chat-open]').addEventListener('click', function () {
      var r = document.getElementById('oc-widget-root');
      if (r) { try { r.open = true; r.setAttribute('open', ''); } catch (e) {} r.scrollIntoView({ block: 'center' }); }
    });
    if (embed && embed.parentNode) embed.parentNode.insertBefore(box, embed);
    else (document.querySelector('main') || document.body).appendChild(box);
  }

  // ====================================================================
  // 9. Suggest-a-correction widget -- add a state select + carry state in the
  //    feedback create-case payload (the ocfeedback widget in ocshim had no
  //    state field). Done here (owned, low-risk) rather than editing ocshim.
  // ====================================================================

  var OC_STATES = [
    ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
    ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],
    ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],
    ['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],
    ['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],
    ['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
    ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
    ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],
    ['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],
    ['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],
    ['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']
  ];

  function fixFeedbackState() {
    var modal = document.getElementById('oc-fb-modal');
    if (!modal) return;
    if (modal.querySelector('#oc-fb-state')) return;
    var emailLabel = modal.querySelector('label[for="oc-fb-email"]');
    if (!emailLabel) return;
    var cur = '';
    try { cur = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {}
    var lbl = document.createElement('label');
    lbl.setAttribute('for', 'oc-fb-state');
    lbl.textContent = 'Which state does this relate to? (optional)';
    var sel = document.createElement('select');
    sel.id = 'oc-fb-state';
    sel.setAttribute('aria-label', 'Which state does this relate to?');
    sel.style.cssText = 'width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:4px;font:14px Inter,sans-serif;box-sizing:border-box;background:#fff;color:#1B3A5C';
    var o0 = document.createElement('option');
    o0.value = ''; o0.textContent = 'Select a state (optional)';
    sel.appendChild(o0);
    OC_STATES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s[0]; o.textContent = s[1];
      if (s[0] === cur) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      try { if (sel.value) localStorage.setItem('oc_state', sel.value); } catch (e) {}
    });
    emailLabel.parentNode.insertBefore(lbl, emailLabel);
    emailLabel.parentNode.insertBefore(sel, emailLabel);
  }

  // Wrap fetch once so the feedback create-case POST carries the state value
  // (from the injected select, falling back to cached oc_state).
  function wrapFeedbackFetch() {
    if (window.__ocFbFetchWrapped) return;
    window.__ocFbFetchWrapped = true;
    var of = window.fetch;
    if (typeof of !== 'function') return;
    window.fetch = function (u, o) {
      try {
        var url = (typeof u === 'string') ? u : (u && u.url);
        if (url && /\/feedback\/create-case/.test(url) && o && typeof o.body === 'string') {
          var selEl = document.getElementById('oc-fb-state');
          var stv = (selEl && selEl.value) ? selEl.value : '';
          if (!stv) { try { stv = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {} }
          if (stv) {
            var d = JSON.parse(o.body);
            if (d && typeof d === 'object' && !d.state) { d.state = stv; o.body = JSON.stringify(d); }
          }
        }
      } catch (e) {}
      return of.apply(this, arguments);
    };
  }

  // ====================================================================
  // 10. cal.diy booking embed (Olive-gated). Loads the cal.diy embed lib
  //     latently sitewide and exposes window.OC_OpenBooking(eventType, prefill)
  //     so Olive triggers a branded booking popup from chat after she
  //     state-qualifies the visitor (GA + booking-fit). Per OC-Clip
  //     booking-integration spec (2026-05-28, rev 3). GA4: book_popup_open,
  //     book_completed.
  // ====================================================================

  function loadCalEmbed() {
    if (window.OC_OpenBooking) return; // once
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal; var ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); };
          var namespace = ar[1];
          api.q = api.q || [];
          typeof namespace === 'string' ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://book.olivecover.com/embed/embed.js', 'init');

    window.Cal('init', { origin: 'https://book.olivecover.com' });
    window.Cal('ui', {
      theme: 'light',
      styles: { branding: { brandColor: '#1B3A5C' } },
      cssVarsPerTheme: { light: {
        'cal-bg': '#FFFFFF', 'cal-bg-muted': '#F5EDD8', 'cal-text': '#1B3A5C',
        'cal-text-emphasis': '#1B3A5C', 'cal-border': '#B8934A', 'cal-brand': '#1B3A5C',
        'cal-brand-emphasis': '#0F2640', 'cal-bg-success': '#F5EDD8'
      } },
      hideEventTypeDetails: false
    });

    // Verified 2026-05-30: the only live cal.diy event is `olivecover/advisorcall`.
    // The per-topic events (olive-cover/coverage-review|claims-help|general-questions)
    // in the OC-Clip spec do NOT exist yet (all 404), and the username is
    // `olivecover` not `olive-cover`. Map every topic to the working event for
    // now; the requested topic is still carried in metadata[topic]/topic_classification.
    // When OC-Clip creates the per-topic events, update CAL_USER/CAL_EVENTS.
    var CAL_USER = 'olivecover';
    var CAL_EVENTS = { 'coverage-review': 'advisorcall', 'claims-help': 'advisorcall', 'general-questions': 'advisorcall', 'advisorcall': 'advisorcall' };
    window.OC_OpenBooking = function (eventType, prefill) {
      eventType = eventType || 'coverage-review';
      prefill = prefill || {};
      var qp = new URLSearchParams(location.search);
      window.Cal('popup', {
        calLink: CAL_USER + '/' + (CAL_EVENTS[eventType] || 'advisorcall'),
        config: {
          name: prefill.name || '',
          email: prefill.email || '',
          phone: prefill.phone || '',
          'metadata[topic]': prefill.topic || '',
          'metadata[session_id]': prefill.session_id || (window.OC_SESSION && window.OC_SESSION.uid ? window.OC_SESSION.uid() : '') || '',
          'metadata[olive_chat_id]': prefill.olive_chat_id || '',
          'metadata[verified_state]': prefill.verified_state || 'GA',
          'metadata[topic_classification]': prefill.topic_classification || '',
          'metadata[utm_source]': qp.get('utm_source') || '',
          'metadata[utm_campaign]': qp.get('utm_campaign') || '',
          layout: 'month_view',
          theme: 'light'
        }
      });
      try {
        if (window.gtag) window.gtag('event', 'book_popup_open', { event_category: 'booking', event_type: eventType, trigger_source: prefill.trigger_source || 'olive_chat' });
      } catch (e) {}
    };

    window.Cal('on', { action: 'bookingSuccessful', callback: function (e) {
      try {
        if (window.gtag) window.gtag('event', 'book_completed', { event_category: 'booking', event_type: (e && e.detail && e.detail.data && e.detail.data.booking && e.detail.data.booking.eventType && e.detail.data.booking.eventType.slug) || 'unknown' });
      } catch (err) {}
      if (window.OC_OliveOnBookingSuccess) { try { window.OC_OliveOnBookingSuccess(e.detail && e.detail.data); } catch (err) {} }
    }});
  }

  // ====================================================================
  // 11. Boot -- one shared, debounced observer drives all idempotent tasks
  // ====================================================================

  function runOnce() {
    try { patchText(); } catch (e) {}
    try { patchJSONLD(); } catch (e) {}
    try { injectFooter(); } catch (e) {}
    try { injectNav(); } catch (e) {}
    try { injectChips(); } catch (e) {}
    try { trackBookings(); } catch (e) {}
    try { injectSchema(); } catch (e) {}
    try { fixCTAColor(); } catch (e) {}
    try { fixHomeButton(); } catch (e) {}
    try { fixContactSelect(); } catch (e) {}
    try { fixFeedbackState(); } catch (e) {}
    try { fixBookPage(); } catch (e) {}
  }

  var debounceTimer = null;
  function scheduleRun() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(function () { debounceTimer = null; runOnce(); }, 200);
  }

  function boot() {
    try { wrapFeedbackFetch(); } catch (e) {}
    try { loadCalEmbed(); } catch (e) {}
    runOnce();
    // Shared observer: catches late-mounted CMS content, widget mount, and
    // widget re-renders (which wipe chips). Debounced to avoid thrashing.
    var obs = new MutationObserver(function () { scheduleRun(); });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    // Stop the broad observer after 60s; by then the page is settled. Chips
    // get their own thread-scoped observer in bindHideOnSubmit for the rest
    // of the session.
    setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 60000);
    // Defensive late passes for slow CMS pages.
    setTimeout(runOnce, 1500);
    setTimeout(runOnce, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
