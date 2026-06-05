// ocpatch.js v1.10.15 -- Consolidated runtime patcher for Olive Cover.
//
//   revealCarrierFaqs (v1.10.15): differentiate the FAQ question from its
//                      answer -- question is bold navy Inter, answer is set off
//                      with a gold left rule + indent (template rendered both
//                      as similar gray text, hard to tell apart).
//   revealCarrierFaqs (v1.10.14): wire the carrier-page FAQ accordion. The
//                      answer (.oc-faq-a) is hidden by template CSS regardless
//                      of the <details> open state (native toggle was only
//                      wired on /faq), so a toggle listener now reveals the
//                      answer on click. Collapsed by default. Also hides the
//                      duplicate questions-only list (.oc-faq-short-list) and
//                      adds a single "View all insurance FAQs ->" hub link.
//
//   insightsHub      -> /insights enhancements (v1.10.6). The featured lead
//                      block (.oc-feat-card*) and the category filter bar
//                      (.oc-news-filter) are built natively in the Designer;
//                      this (a) loads every paginated card into the grid so
//                      category filtering spans the whole collection and hides
//                      the now-redundant pagination, (b) fills the featured
//                      block from the newest article and removes that duplicate
//                      card from the grid, (c) builds one chip per distinct
//                      category and wires show/hide filtering. Behavior + DOM
//                      only; all styling lives in native classes.
//
// Merges five standalone inline-site-scripts that previously each loaded a
// separate file and/or ran its own MutationObserver + TreeWalker pass on
// every page:
//
//   ocagentadvisor  -> agent->advisor text rewrite
//   ocbrandpatcher  -> brand-attribution body text + JSON-LD rewrite
//   ocbookpromo     -> Book a call CTA (nav + footer) + GA4; opens the
//                      Easy!Appointments booking modal (book.olivecover.com).
//                      Booking->CRM is server-side (E!A webhook -> CLIP).
//   ocwidgetchips   -> Ask Olive widget quick-action chips
//   occtafix        -> strip stray inline color on claims/stub CTAs (v1.1.0)
//   occarrierhub    -> add NFIP to the hand-built carrier hub pages: a proper
//                      row in the /personal-carriers flood comparison table
//                      (clone the Selective flood row + relabel); cleanup-only
//                      on the other hubs. Static pages, not CMS-driven. (v1.7.0)
//   fixCarrierClaimsPhone -> set the claims phone on carrier profile pages for
//                      carriers not yet in ocshim's occarrierphones map (new
//                      carriers, e.g. NFIP -> Selective flood WYO line). (v1.8.0)
//   fixCarrierTableNA -> replace bare "N/A" text in the carrier comparison
//                      tables (/personal-carriers, /commercial-carriers) with a
//                      muted dash; keeps the cell's class so it stays gray and
//                      reads cleaner next to the green checks. (v1.9.0)
//   injectNewsNav    -> add a "News" entry to the global nav: if About sits in
//                      a dropdown, nest "News & Updates" there; else add a clean
//                      native-styled top-level "News" link after About. Adds a
//                      gold recency dot when the newest News post is < 30 days
//                      old. Insights is left under Resources untouched. (v1.10.0)
//   injectNewsSchema -> NewsArticle + BreadcrumbList JSON-LD on /news/{slug},
//                      built from the rendered article DOM (headline, date,
//                      category, hero image, summary). AEO payload. (v1.10.0)
//   wireAboutDropdown -> the About nav dropdown is hand-built in the Designer
//                      (oc-nav-dropdown + oc-nav-panel), but the existing nav
//                      panels open via per-element Webflow interactions that
//                      cannot be replicated on a new element. This wires the
//                      About panel's open/close on hover + keyboard focus by
//                      toggling its display (behavior, not styling -- same
//                      approach the nav script uses for the mobile panel).
//                      (v1.10.1)
//   injectNewsNav    -> (v1.10.2) also adds "News and Updates" to the flat
//                      mobile menu (.oc-mobile-panel-link) after About; desktop
//                      block now stands down when the Designer About dropdown's
//                      tagged News link is present.
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
  // directly-bookable calendar. Hide any leftover inline embed and inject a
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
  // 10. Booking (Olive-gated). Opens the Easy!Appointments booking page in a
  //     branded modal iframe; exposes window.OC_OpenBooking(eventType, prefill)
  //     so Olive triggers a branded booking popup from chat after she
  //     state-qualifies the visitor (GA + booking-fit). Per OC-Clip
  //     booking-integration spec (2026-05-28, rev 3). GA4: book_popup_open,
  //     book_completed.
  // ====================================================================

  function setupBooking() {
    if (window.OC_OpenBooking) return; // once

    // Easy!Appointments (book.olivecover.com) replaces cal.diy. There is no
    // embed SDK; we open the branded booking page in a modal iframe. Olive
    // (in chat) calls OC_OpenBooking(topic, prefill) after she state-qualifies
    // the visitor. Booking COMPLETION is captured server-side via the
    // E!A -> CLIP webhook (appointment_save) -> CRM, so there is no front-end
    // CRM post. The booking page is brand-themed + english-only and only
    // frameable from olivecover.com + staging (CSP frame-ancestors).
    var EA_BASE = 'https://book.olivecover.com/index.php/booking';
    // topic -> E!A service id (see _oc-clip-deliverables/easyappointments-clip-integration.md)
    var EA_SVC = {
      'coverage-review': 2, 'free-coverage-review': 2,
      'personal': 3, 'personal-consultation': 3,
      'commercial': 4, 'business': 4, 'commercial-consultation': 4,
      'customer-service': 5, 'billing': 5, 'general-questions': 5,
      'claims-help': 6, 'claims': 6
    };

    function closeModal() {
      var m = document.getElementById('oc-ea-modal');
      if (m && m.parentNode) m.parentNode.removeChild(m);
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') closeModal(); }

    window.OC_OpenBooking = function (eventType, prefill) {
      prefill = prefill || {};
      var svc = EA_SVC[eventType] || 2;
      var qp = new URLSearchParams();
      var nm = String(prefill.name || '').trim().split(/\s+/);
      if (nm[0]) qp.set('first_name', nm[0]);
      if (nm.length > 1) qp.set('last_name', nm.slice(1).join(' '));
      if (prefill.email) qp.set('email', prefill.email);
      if (prefill.phone) qp.set('phone_number', prefill.phone);
      qp.set('service', svc);
      var url = EA_BASE + '?' + qp.toString();

      if (document.getElementById('oc-ea-modal')) return;
      var ov = document.createElement('div');
      ov.id = 'oc-ea-modal';
      ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(15,38,64,0.6);display:flex;align-items:center;justify-content:center;padding:16px';
      var box = document.createElement('div');
      box.style.cssText = 'position:relative;width:100%;max-width:920px;height:90vh;background:#F5EDD8;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4)';
      var cl = document.createElement('button');
      cl.type = 'button';
      cl.setAttribute('aria-label', 'Close booking');
      cl.style.cssText = 'position:absolute;top:8px;right:8px;width:32px;height:32px;border:none;border-radius:50%;background:#1B3A5C;cursor:pointer;z-index:2;padding:0';
      cl.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="display:block;margin:auto"><path d="M2 2 L12 12 M12 2 L2 12" stroke="#F5EDD8" stroke-width="2" stroke-linecap="round"/></svg>';
      cl.addEventListener('click', closeModal);
      var ifr = document.createElement('iframe');
      ifr.src = url;
      ifr.title = 'Book a time with an Olive Cover advisor';
      ifr.style.cssText = 'width:100%;height:100%;border:0;display:block';
      box.appendChild(cl);
      box.appendChild(ifr);
      ov.appendChild(box);
      ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
      document.addEventListener('keydown', onEsc);
      document.body.appendChild(ov);

      try {
        if (window.gtag) window.gtag('event', 'book_popup_open', { event_category: 'booking', event_type: eventType || 'coverage-review', trigger_source: prefill.trigger_source || 'olive_chat' });
      } catch (e) {}
    };

    // If the E!A confirmation later postMessages {ocBooking:'success'} from the
    // book origin, fire book_completed + close. (Authoritative completion is the
    // server-side webhook; this is a best-effort front-end signal.)
    window.addEventListener('message', function (ev) {
      try {
        if (!ev || ev.origin !== 'https://book.olivecover.com') return;
        var d = ev.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { return; } }
        if (!d || d.ocBooking !== 'success') return;
        if (window.gtag) window.gtag('event', 'book_completed', { event_category: 'booking' });
        closeModal();
      } catch (e) {}
    }, false);
  }

  // ====================================================================
  // 10.5 occarrierhub -- add NFIP to the hand-built carrier hub pages
  // (/personal-carriers, /commercial-carriers, /carriers). These pages are
  // static (not CMS-driven). On /personal-carriers the right home for NFIP is
  // the "Flood, Jewelry, Umbrella & Landlord" comparison table, so we clone
  // the existing flood carrier's row (Selective), relabel it for NFIP, and
  // insert it right after. On the other hubs we only clean up the stray chip
  // an earlier version appended to the top quick-pick strip (no good flood row
  // to clone there). Idempotent.
  // ====================================================================

  var CARRIER_HUB = {
    '/personal-carriers': {
      cloneFrom: 'selective-insurance', slug: 'nfip-flood-insurance',
      name: 'NFIP Flood', tagline: 'Federal flood program (FEMA)',
      rating: 'Federal',
      notesMatch: /Higher limits than NFIP/,
      notes: 'Federal flood program (FEMA); up to $250K building and $100K contents; the baseline when private flood will not write.'
    },
    '/commercial-carriers': { cleanupOnly: true, slug: 'nfip-flood-insurance' },
    '/carriers': { cleanupOnly: true, slug: 'nfip-flood-insurance' }
  };

  function ocRelabelRow(clone, cfg) {
    var as = clone.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href') || '';
      if (h.indexOf(cfg.cloneFrom) >= 0) as[i].setAttribute('href', '/carriers/' + cfg.slug);
    }
    var w = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null);
    var t, ns = [];
    while (t = w.nextNode()) ns.push(t);
    for (var j = 0; j < ns.length; j++) {
      var nv = ns[j].nodeValue, s = nv.trim();
      if (s === 'Selective') ns[j].nodeValue = nv.replace('Selective', cfg.name);
      else if (s === 'Private flood specialist') ns[j].nodeValue = cfg.tagline;
      else if (s === 'Private Flood') ns[j].nodeValue = 'Federal Flood';
      else if (s === 'A') ns[j].nodeValue = cfg.rating;
      else if (cfg.notesMatch && cfg.notesMatch.test(nv)) ns[j].nodeValue = cfg.notes;
    }
  }

  function injectCarrierHub() {
    var cfg = CARRIER_HUB[path.replace(/\/$/, '') || '/'];
    if (!cfg) return;
    // Remove the stray chip an earlier version appended to a quick-pick strip.
    var stale = document.querySelectorAll('a[data-oc-injected="1"]');
    for (var i = 0; i < stale.length; i++) {
      if ((stale[i].getAttribute('href') || '').indexOf(cfg.slug) >= 0 && stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
    }
    if (cfg.cleanupOnly || !cfg.cloneFrom) return;
    if (document.querySelector('[data-oc-injected="floodrow"]')) return;
    var refs = document.querySelectorAll('a[href*="' + cfg.cloneFrom + '"]');
    if (!refs.length) return;
    var seen = [];
    for (var r = 0; r < refs.length; r++) {
      var row = refs[r].closest ? refs[r].closest('tr') : null;
      if (!row || row === document.body || seen.indexOf(row) >= 0) continue;
      if (!/flood/i.test(row.textContent)) continue; // only the flood row
      seen.push(row);
      var clone = row.cloneNode(true);
      ocRelabelRow(clone, cfg);
      clone.setAttribute('data-oc-injected', 'floodrow');
      if (row.parentNode) row.parentNode.insertBefore(clone, row.nextSibling);
    }
  }

  // ====================================================================
  // 10.6 fixCarrierClaimsPhone -- ocshim's occarrierphones holds a static map
  // of the original 41 carriers; a NEW carrier's profile shows the template's
  // "Phone unavailable" fallback. Patch known new carriers here until they are
  // added to ocshim's map. NFIP claims route through the Selective flood WYO
  // line. Idempotent.
  // ====================================================================

  var NEW_CARRIER_PHONES = { 'nfip-flood-insurance': '877-348-0552' };

  function fixCarrierClaimsPhone() {
    var m = location.pathname.match(/^\/carriers\/([a-z0-9-]+)\/?$/);
    if (!m) return;
    var phone = NEW_CARRIER_PHONES[m[1]];
    if (!phone) return;
    var link = document.getElementById('carrier-claims-phone-link');
    if (!link) return;
    var tel = phone.replace(/[^0-9]/g, '');
    if (link.getAttribute('href') === 'tel:' + tel) return; // already set
    link.setAttribute('href', 'tel:' + tel);
    link.textContent = phone;
    link.style.setProperty('color', '#B8934A', 'important');
    link.style.setProperty('font-weight', '600', 'important');
  }

  // ====================================================================
  // 10.7 fixCarrierTableNA -- the carrier comparison tables show a bare "N/A"
  // in feature columns a carrier does not apply to. Replace that text with a
  // muted dash (the cell keeps its existing class, so it stays gray) so it
  // reads cleaner next to the green checks. Neutral on purpose: these columns
  // are "not offered / not applicable", not a failing grade, so no red cross.
  // Class-agnostic (personal uses .no/.no-1, commercial uses .c-no-1).
  // ====================================================================

  function fixCarrierTableNA() {
    if (!/^\/(personal|commercial)-carriers\/?$/.test(location.pathname)) return;
    var cells = document.querySelectorAll('table td');
    for (var i = 0; i < cells.length; i++) {
      var td = cells[i], target = null;
      if (td.children.length === 0) {
        if (td.textContent.trim() === 'N/A') target = td;
      } else {
        var leaves = td.querySelectorAll('*');
        for (var j = 0; j < leaves.length; j++) {
          if (leaves[j].children.length === 0 && leaves[j].textContent.trim() === 'N/A') { target = leaves[j]; break; }
        }
      }
      if (target) { target.textContent = '–'; if (target.setAttribute) target.setAttribute('aria-label', 'Not applicable'); }
    }
  }

  // ====================================================================
  // 12. News section -- nav entry + recency dot, and NewsArticle +
  //     BreadcrumbList JSON-LD on /news/{slug}. The /news hub + detail
  //     template + homepage strip + footer link are built in the Designer;
  //     this adds the global-nav discoverability and the AEO payload.
  // ====================================================================

  // Newest News post date (ISO yyyy-mm-dd). Drives the nav recency dot (<30
  // days). Bump this when a newer News post is published (or have CLIP set it).
  var NEWS_LATEST = '2026-06-02';

  function newsIsRecent() {
    try {
      var d = new Date(NEWS_LATEST + 'T00:00:00');
      return (Date.now() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
    } catch (e) { return false; }
  }

  function addRecencyDot(a) {
    if (!newsIsRecent()) return;
    if (a.querySelector('[data-oc-news-dot]')) return;
    var dot = document.createElement('span');
    dot.setAttribute('data-oc-news-dot', '1');
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText = 'display:inline-block;width:7px;height:7px;border-radius:50%;background:#B8934A;margin-left:6px;vertical-align:middle';
    a.appendChild(dot);
  }

  function injectNewsNav() {
    // DESKTOP: the About dropdown (Designer-built) already holds a News link
    // tagged data-oc-news-nav, so this block stands down. It remains only as a
    // defensive fallback: if that tagged link is ever absent, nest into an
    // About dropdown if one exists, else add a top-level News link by About.
    if (!document.querySelector('[data-oc-news-nav="1"]')) {
      var links = document.querySelectorAll('a[href="/about"], a[href$="/about"]');
      var about = null, i;
      for (i = 0; i < links.length; i++) {
        if ((links[i].className || '').indexOf('ocnav-link') >= 0) { about = links[i]; break; }
      }
      if (about) {
        var dd = about.closest ? about.closest('.w-dropdown, [class*="dropdown"]') : null;
        var list = dd ? dd.querySelector('.w-dropdown-list, [class*="dropdown-list"]') : null;
        if (list && list !== about.parentNode) {
          var sub = document.createElement('a');
          sub.href = '/news';
          sub.textContent = 'News & Updates';
          sub.setAttribute('data-oc-news-nav', '1');
          var sib = list.querySelector('a');
          if (sib) sub.className = sib.className || '';
          list.appendChild(sub);
          addRecencyDot(sub);
        } else {
          var news = document.createElement('a');
          news.href = '/news';
          news.textContent = 'News';
          news.setAttribute('data-oc-news-nav', '1');
          news.className = about.className || '';
          if (about.parentNode) about.parentNode.insertBefore(news, about.nextSibling);
          addRecencyDot(news);
        }
      }
    }

    // MOBILE: the mobile menu is a flat list of .oc-mobile-panel-link items.
    // Add "News and Updates" right after "About Olive Cover". Independent of the
    // desktop guard so it always runs.
    var mAbout = document.querySelector('.oc-mobile-panel-link[href="/about"], .oc-mobile-panel-link[href$="/about"]');
    if (mAbout && !document.querySelector('[data-oc-news-mnav="1"]')) {
      var mnews = document.createElement('a');
      mnews.href = '/news';
      mnews.textContent = 'News and Updates';
      mnews.setAttribute('data-oc-news-mnav', '1');
      mnews.className = 'oc-mobile-panel-link';
      if (mAbout.parentNode) mAbout.parentNode.insertBefore(mnews, mAbout.nextSibling);
    }
  }

  var OC_BRAND_LOGO = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/6a13bd76b6e65cc6a3bcd114_Blue%20Olive%20Cover%20Logo.png';

  function injectNewsSchema() {
    var p = location.pathname.replace(/\/$/, '');
    if (p === '/news' || p.indexOf('/news/') !== 0) return; // only /news/{slug}
    if (document.querySelector('script[data-oc-news-schema="1"]')) return;
    var h1 = document.querySelector('h1.oc-news-h1') || document.querySelector('h1');
    if (!h1) return;
    var headline = (h1.textContent || '').trim().slice(0, 110);
    if (!headline) return;

    var catEl = document.querySelector('.oc-news-cat');
    var section = catEl ? (catEl.textContent || '').trim() : '';
    var dateEl = document.querySelector('.oc-news-date');
    var pubISO = '';
    if (dateEl) { var dt = new Date((dateEl.textContent || '').trim()); if (!isNaN(dt.getTime())) pubISO = dt.toISOString(); }
    var imgEl = document.querySelector('.oc-news-hero-bg') || document.querySelector('.oc-news-hero img');
    var img = imgEl ? (imgEl.getAttribute('src') || imgEl.src || '') : '';
    var descMeta = document.querySelector('meta[name="description"]');
    var desc = descMeta ? (descMeta.getAttribute('content') || '') : '';
    var canonical = location.origin + location.pathname;

    var publisher = {
      '@type': 'Organization', 'name': 'Olive Cover', 'legalName': 'Olive Insurance Services, LLC',
      'logo': { '@type': 'ImageObject', 'url': OC_BRAND_LOGO }
    };
    var article = {
      '@context': 'https://schema.org', '@type': 'NewsArticle',
      'headline': headline,
      'author': { '@type': 'Organization', 'name': 'Olive Cover', 'legalName': 'Olive Insurance Services, LLC' },
      'publisher': publisher,
      'mainEntityOfPage': canonical, 'inLanguage': 'en-US'
    };
    if (pubISO) { article.datePublished = pubISO; article.dateModified = pubISO; }
    if (section) article.articleSection = section;
    if (img) article.image = img;
    if (desc) article.description = desc;

    var crumbs = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': location.origin + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'News', 'item': location.origin + '/news' },
        { '@type': 'ListItem', 'position': 3, 'name': headline, 'item': canonical }
      ]
    };

    [article, crumbs].forEach(function (obj) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-oc-news-schema', '1');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }

  // News collection cards (hub + homepage strip) carry data-news-slug bound to
  // the item Slug. Webflow's current-item link could not be expressed via the
  // API (page-link resolved to /news, collectionPage output the slug literally),
  // so the card href is set here from the slug. Fallback href is /news.
  // v1.10.5: news/insights hub card images are CMS-bound Webflow Images that
  // default to loading="lazy". Below the tall hero they don't load until
  // scrolled, so the navy card background ("blue box") shows. These hubs have
  // only ~12 small cards/page, so load them eagerly to remove the blue boxes.
  function eagerCardImages() {
    var imgs = document.querySelectorAll('a.oc-newscard img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (img.getAttribute('loading') === 'lazy') {
        img.setAttribute('loading', 'eager');
        var s = img.getAttribute('src');
        if (s && !img.complete) { img.src = s; }
      }
    }
  }

  function fixNewsCardLinks() {
    // v1.10.4: also handles the rebuilt /insights hub (data-insights-slug).
    var maps = [['data-news-slug', '/news/'], ['data-insights-slug', '/insights/']];
    for (var m = 0; m < maps.length; m++) {
      var attr = maps[m][0], base = maps[m][1];
      var cards = document.querySelectorAll('a[' + attr + ']');
      for (var i = 0; i < cards.length; i++) {
        var slug = (cards[i].getAttribute(attr) || '').trim();
        if (!slug) continue;
        var want = base + slug;
        if (cards[i].getAttribute('href') !== want) cards[i].setAttribute('href', want);
      }
    }
  }

  function wireAboutDropdown() {
    var dd = document.getElementById('ocn-item-about');
    var panel = document.getElementById('ocn-item-about-panel');
    if (!dd || !panel) return;
    if (dd.dataset.ocAboutWired === '1') return;
    dd.dataset.ocAboutWired = '1';
    var show = function () { panel.style.setProperty('display', 'flex'); dd.setAttribute('aria-expanded', 'true'); };
    var hide = function () { panel.style.setProperty('display', 'none'); dd.setAttribute('aria-expanded', 'false'); };
    dd.addEventListener('mouseenter', show);
    dd.addEventListener('mouseleave', hide);
    dd.addEventListener('focusin', show);
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) hide(); });
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hide(); } });
  }

  // --- News/Insights hub (v1.10.6+): featured lead block + category filter ---
  // Shared logic for both /insights and /news (same oc-newshub/oc-newscard/
  // oc-feat-card/oc-news-filter markup); only the slug attribute and link base
  // differ per hub. (v1.10.9: extended to /news.)
  function hubKind() {
    var p = location.pathname.replace(/\/+$/, '');
    if (p === '/insights') return { slugAttr: 'data-insights-slug', base: '/insights/' };
    if (p === '/news') return { slugAttr: 'data-news-slug', base: '/news/' };
    return null;
  }

  function insightsFeatured() {
    var hk = hubKind(); if (!hk) return;
    var feat = document.querySelector('[class*="oc-feat-card"]');
    var grid = document.querySelector('.oc-news-grid');
    if (!feat || !grid) return;
    if (feat.dataset.ocFilled === '1') return;
    var item = grid.querySelector('.w-dyn-item');
    if (!item) return;
    var card = item.querySelector('a.oc-newscard') || item.querySelector('a');
    if (!card) return;
    var pick = function (sel) { var el = card.querySelector(sel); return el ? el.textContent.trim() : ''; };
    var set = function (sel, val) { var el = feat.querySelector(sel); if (el && val) el.textContent = val; };
    set('.oc-feat-cat', pick('.oc-newscard-cat'));
    set('.oc-feat-title', pick('.oc-newscard-title'));
    set('.oc-feat-excerpt', pick('.oc-newscard-sum'));
    set('.oc-feat-read', pick('.oc-newscard-rt'));
    // Date span: the whtml insert dropped the .oc-feat-date class on this span,
    // so fall back to the first span in the meta row (the read-time span keeps
    // its class and is matched separately above).
    var dateVal = pick('.oc-newscard-date');
    var dateEl = feat.querySelector('.oc-feat-date');
    if (!dateEl) {
      var metaRow = feat.querySelector('.oc-feat-meta');
      if (metaRow) {
        var spans = metaRow.querySelectorAll('span');
        for (var di = 0; di < spans.length; di++) {
          if (spans[di].className.indexOf('oc-feat-read') < 0) { dateEl = spans[di]; break; }
        }
      }
    }
    if (dateEl && dateVal) dateEl.textContent = dateVal;
    var srcImg = card.querySelector('.oc-newscard-img');
    var fImg = feat.querySelector('.oc-feat-img');
    if (fImg && srcImg) {
      var s = srcImg.getAttribute('src') || srcImg.currentSrc || '';
      var ialt = srcImg.getAttribute('alt') || '';
      if (s) {
        // whtml turned the <img> into a non-rendering <imgraw>; swap in a real
        // <img> so the photo actually displays (keeps the native class + CSS).
        if ((fImg.tagName || '').toLowerCase() === 'imgraw') {
          var real = document.createElement('img');
          real.setAttribute('class', fImg.getAttribute('class') || 'oc-feat-img');
          real.setAttribute('loading', 'eager');
          real.setAttribute('alt', ialt);
          real.setAttribute('src', s);
          if (fImg.parentNode) fImg.parentNode.replaceChild(real, fImg);
        } else {
          fImg.setAttribute('src', s);
          fImg.setAttribute('loading', 'eager');
          if (ialt) fImg.setAttribute('alt', ialt);
        }
      }
    }
    var slug = (card.getAttribute(hk.slugAttr) || '').trim();
    if (slug) {
      feat.setAttribute('href', hk.base + slug);
      feat.setAttribute(hk.slugAttr, slug);
    } else {
      var h = card.getAttribute('href');
      if (h && h !== '#') feat.setAttribute('href', h);
    }
    feat.dataset.ocFilled = '1';
    // Remove the now-duplicated newest card from the grid.
    if (item.parentNode) item.parentNode.removeChild(item);
  }

  function insightsLoadAll() {
    var hk = hubKind(); if (!hk) return;
    var grid = document.querySelector('.oc-news-grid');
    if (!grid) return;
    var state = grid.getAttribute('data-oc-loadall');
    if (state === 'loading' || state === 'done') return;
    var next = document.querySelector('.w-pagination-next');
    if (!next) { grid.setAttribute('data-oc-loadall', 'done'); return; }
    grid.setAttribute('data-oc-loadall', 'loading');
    var seen = {};
    var keyOf = function (it) {
      var a = it.querySelector('a[data-insights-slug],a[data-news-slug]');
      if (a) { return a.getAttribute('data-insights-slug') || a.getAttribute('href') || ''; }
      var t = it.querySelector('.oc-newscard-title');
      return t ? t.textContent.trim() : '';
    };
    var cur = grid.querySelectorAll('.w-dyn-item');
    for (var c = 0; c < cur.length; c++) { seen[keyOf(cur[c])] = 1; }
    var finish = function () {
      grid.setAttribute('data-oc-loadall', 'done');
      var pag = document.querySelector('.w-pagination-wrapper');
      if (pag) pag.style.setProperty('display', 'none');
    };
    var fetchPage = function (url, guard) {
      if (guard > 20) { finish(); return; }
      fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.oc-news-grid .w-dyn-item');
        for (var i = 0; i < items.length; i++) {
          var k = keyOf(items[i]);
          if (k && seen[k]) continue;
          seen[k] = 1;
          grid.appendChild(document.importNode(items[i], true));
        }
        var nxt = doc.querySelector('.w-pagination-next');
        if (nxt && nxt.getAttribute('href')) {
          fetchPage(new URL(nxt.getAttribute('href'), location.origin + location.pathname).toString(), guard + 1);
        } else { finish(); }
      }).catch(function () { finish(); });
    };
    fetchPage(new URL(next.getAttribute('href'), location.origin + location.pathname).toString(), 0);
  }

  function insightsFilter() {
    var hk = hubKind(); if (!hk) return;
    var bar = document.querySelector('.oc-news-filter');
    var grid = document.querySelector('.oc-news-grid');
    if (!bar || !grid) return;
    if (bar.dataset.ocBuilt === '1') return;
    if (grid.getAttribute('data-oc-loadall') !== 'done') return;
    var tmpl = bar.querySelector('.oc-news-chip');
    if (!tmpl) return;
    bar.dataset.ocBuilt = '1';
    var items = [].slice.call(grid.querySelectorAll('.w-dyn-item'));
    // Single-article hub: the featured block consumed the only post, leaving no
    // grid items. Hide the empty grid and the now-pointless filter bar so the
    // featured card stands alone.
    if (items.length === 0) {
      bar.style.setProperty('display', 'none');
      var wrap0 = document.querySelector('.oc-newshub-list-inner .w-dyn-list');
      if (wrap0) wrap0.style.setProperty('display', 'none');
      return;
    }
    var cats = [];
    items.forEach(function (it) {
      var ce = it.querySelector('.oc-newscard-cat');
      var t = ce ? ce.textContent.trim() : '';
      if (t && cats.indexOf(t) < 0) cats.push(t);
    });
    cats.sort();
    // Only one category present -> a filter offers nothing; hide the bar.
    if (cats.length < 2) { bar.style.setProperty('display', 'none'); return; }
    cats.forEach(function (t) {
      var chip = tmpl.cloneNode(true);
      chip.classList.remove('oc-news-chip-active');
      chip.setAttribute('data-cat', t);
      chip.textContent = t;
      bar.appendChild(chip);
    });
    var apply = function (cat) {
      items.forEach(function (it) {
        var ce = it.querySelector('.oc-newscard-cat');
        var t = ce ? ce.textContent.trim() : '';
        it.style.display = (!cat || t === cat) ? '' : 'none';
      });
    };
    bar.addEventListener('click', function (e) {
      var chip = e.target && e.target.closest ? e.target.closest('.oc-news-chip') : null;
      if (!chip) return;
      var chips = bar.querySelectorAll('.oc-news-chip');
      for (var i = 0; i < chips.length; i++) { chips[i].classList.remove('oc-news-chip-active'); }
      chip.classList.add('oc-news-chip-active');
      apply(chip.getAttribute('data-cat') || '');
    });
  }

  // --- Carrier profile FAQ section (v1.10.11) ---
  // ocfaq-complete.js force-hides per-page FAQ sections (#car-faq etc.) on all
  // non-/faq pages, and its state filter only runs on /faq. Carrier appointments
  // are national (where the agency and carrier do business), so carrier FAQs
  // should show on the carrier profile regardless of the visitor's state, while
  // any state-regulation-specific FAQ (tagged with a state) shows only when that
  // state is selected. This reveals #car-faq on /carriers/{slug} and applies that
  // model: national/untagged FAQs always show; state-tagged FAQs gate on state.
  function revealCarrierFaqs() {
    if (location.pathname.indexOf('/carriers/') !== 0) return;
    var sec = document.getElementById('car-faq');
    if (!sec) return;
    // The section renders TWO lists: a questions-only "table of contents"
    // (.oc-faq-short-list) and the real accordion (#car-faq-collection). The
    // short list duplicates the accordion's questions, so hide it entirely and
    // keep only the collapsed accordion below.
    var shortList = sec.querySelector('.oc-faq-short-list');
    if (shortList) shortList.style.setProperty('display', 'none', 'important');
    var coll = sec.querySelector('#car-faq-collection') || sec;
    var items = [].slice.call(coll.querySelectorAll('.w-dyn-item'));
    var list = coll;
    if (!items.length) return; // no FAQs for this carrier -> leave hidden
    var DEFAULT_STATE = 'national';
    var active = (document.body.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
    var stateOf = function (it) {
      var d = it.querySelector('[data-state]') || it;
      var s = (d.getAttribute && d.getAttribute('data-state')) || '';
      return (s || DEFAULT_STATE).toLowerCase();
    };
    var qnum = function (it) { var d = it.querySelector('[data-question-number]'); return d ? d.getAttribute('data-question-number') : null; };
    var over = {};
    items.forEach(function (it) { var s = stateOf(it), q = qnum(it); if (s === active && s !== DEFAULT_STATE && q) over[q] = true; });
    var anyVis = false;
    items.forEach(function (it) {
      var s = stateOf(it), q = qnum(it), show;
      if (s === DEFAULT_STATE) { show = !over[q]; }
      else if (s === active) { show = true; }
      else { show = false; }
      it.style.display = show ? '' : 'none';
      if (show) anyVis = true;
      // Wire the accordion: the answer (.oc-faq-a) is hidden by template CSS
      // regardless of the <details> open state, because the native toggle was
      // only ever wired by ocfaq-complete.js on /faq. So drive the answer's
      // visibility from the details' toggle event (collapsed by default,
      // reveals the answer on click).
      var det = it.querySelector('details');
      if (det && !det.getAttribute('data-oc-faq-wired')) {
        det.setAttribute('data-oc-faq-wired', '1');
        var ans = det.querySelector('.oc-faq-a') || det.querySelector('p');
        var sum = det.querySelector('summary');
        // Differentiate question from answer: question is bold navy (Inter),
        // answer is set off with a gold left rule + indent so the two read as
        // distinct. (template default renders both as similar gray text).
        if (sum) {
          sum.style.setProperty('cursor', 'pointer');
          sum.style.setProperty('font-family', 'Inter, system-ui, sans-serif');
          sum.style.setProperty('font-weight', '700');
          sum.style.setProperty('color', '#1B3A5C');
          sum.style.setProperty('font-size', '1.0625rem');
          sum.style.setProperty('line-height', '1.4');
        }
        if (ans) {
          ans.style.setProperty('margin-top', '10px');
          ans.style.setProperty('padding-left', '14px');
          ans.style.setProperty('border-left', '2px solid #B8934A');
          ans.style.setProperty('color', '#374151');
        }
        var sync = function () {
          if (!ans) return;
          ans.style.setProperty('display', det.open ? 'block' : 'none', 'important');
        };
        det.addEventListener('toggle', sync);
        det.removeAttribute('open'); // start collapsed
        sync();
      }
    });
    if (anyVis) {
      sec.classList.remove('oc-hidden');
      sec.style.setProperty('display', 'block', 'important');
      sec.removeAttribute('aria-hidden');
      // add a single link to the full FAQ hub for discoverability + internal linking
      if (!sec.querySelector('.oc-cfaq-allfaq')) {
        var wrap = document.createElement('div');
        wrap.className = 'oc-cfaq-allfaq-wrap';
        wrap.style.setProperty('margin-top', '24px');
        var a = document.createElement('a');
        a.className = 'oc-cfaq-allfaq';
        a.setAttribute('href', '/faq');
        a.textContent = 'View all insurance FAQs →';
        a.style.setProperty('color', '#B8934A', 'important');
        a.style.setProperty('font-weight', '600', 'important');
        a.style.setProperty('text-decoration', 'none', 'important');
        wrap.appendChild(a);
        list.appendChild(wrap);
      }
    }
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
    try { injectSchema(); } catch (e) {}
    try { fixCTAColor(); } catch (e) {}
    try { fixHomeButton(); } catch (e) {}
    try { fixContactSelect(); } catch (e) {}
    try { fixFeedbackState(); } catch (e) {}
    try { fixBookPage(); } catch (e) {}
    try { injectCarrierHub(); } catch (e) {}
    try { fixCarrierClaimsPhone(); } catch (e) {}
    try { fixCarrierTableNA(); } catch (e) {}
    try { injectNewsNav(); } catch (e) {}
    try { injectNewsSchema(); } catch (e) {}
    try { wireAboutDropdown(); } catch (e) {}
    try { fixNewsCardLinks(); } catch (e) {}
    try { eagerCardImages(); } catch (e) {}
    try { insightsFeatured(); } catch (e) {}
    try { insightsLoadAll(); } catch (e) {}
    try { insightsFilter(); } catch (e) {}
    try { revealCarrierFaqs(); } catch (e) {}
  }

  var debounceTimer = null;
  function scheduleRun() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(function () { debounceTimer = null; runOnce(); }, 200);
  }

  function boot() {
    try { wrapFeedbackFetch(); } catch (e) {}
    try { setupBooking(); } catch (e) {}
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
