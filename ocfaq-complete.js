/* ocfaqloader v7.0.0 - Olive Cover Site-Wide Top FAQ Block
 * Injects top 4 relevant FAQs above footer on every page
 * State-aware (georgia / california), page-aware category matching
 * Skips injection on /faq (full index already there)
 */
(function () {
  'use strict';

  /* ── PAGE → CATEGORY MAPPING ─────────────────────────────────────── */
  var PAGE_MAP = [
    { match: ['homeowners-insurance', 'home-insurance', 'ho3', 'ho5', 'dwelling'], cats: ['5690ed6ed87ac8820f7ab5cb9ab3acbf'] },
    { match: ['auto-insurance', 'car-insurance', 'vehicle-insurance'],             cats: ['65328be1d7a01cdc461bc9b8c6fc1be8'] },
    { match: ['umbrella-insurance', 'personal-umbrella'],                           cats: ['777a0ae004cf168b861eb5756a5b2fd4'] },
    { match: ['flood-insurance', 'nfip', 'private-flood'],                          cats: ['bd21ea859d216417bc2b20cc4dc818f9'] },
    { match: ['renters-insurance', 'renter-insurance', 'tenant-insurance'],         cats: ['c7b989ec066929a3382212c952cd4881'] },
    { match: ['landlord-insurance', 'rental-property', 'dp3', 'dp-3'],             cats: ['2a99ce0a73b6babb24a7b495915fa79c'] },
    { match: ['motorcycle-insurance', 'moto-insurance'],                            cats: ['ab9e5948dead49e054c94b03f59142e7'] },
    { match: ['boat-insurance', 'watercraft-insurance'],                             cats: ['c51e68a01eac651b38b9b4c9e8146725'] },
    { match: ['collector-auto', 'classic-car', 'classic-auto'],                     cats: ['357486fa26d16ed6642f3c6a24b4279e'] },
    { match: ['scheduled-articles', 'jewelry-insurance', 'valuables'],              cats: ['cd826588b60db5083028cb2df78ac7a9'] },
    { match: ['business-owners-policy', 'bop-insurance'],                           cats: ['comm-bop'] },
    { match: ['general-liability', 'gl-insurance', 'liability-insurance'],          cats: ['comm-gl'] },
    { match: ['commercial-auto', 'business-auto'],                                  cats: ['comm-ca'] },
    { match: ['workers-compensation', 'workers-comp', 'workerscomp'],               cats: ['comm-wc'] },
    { match: ['professional-liability', 'errors-omissions', 'eo-insurance'],        cats: ['comm-pl'] },
    { match: ['cyber-insurance', 'cyber-liability', 'data-breach'],                 cats: ['comm-cyber'] },
    { match: ['commercial-insurance', 'business-insurance'],                        cats: ['comm-bop', 'comm-gl', 'comm-ca'] },
    { match: ['personal-insurance'],                                                 cats: ['5690ed6ed87ac8820f7ab5cb9ab3acbf', '65328be1d7a01cdc461bc9b8c6fc1be8'] },
    { match: ['carriers', 'carrier'],                                                cats: ['7599a9aca4f4ef5a57f563f239f76129'] },
    { match: ['states', 'georgia'],                                                  cats: ['088f524bb9e5ff0cc66827025a88b903'] },
    { match: ['california'],                                                          cats: ['088f524bb9e5ff0cc66827025a88b903'] },
    { match: ['cities', 'johns-creek', 'alpharetta', 'cumming', 'duluth', 'lawrenceville', 'suwanee', 'sugar-hill', 'buford'], cats: ['6db64e32d08a9adb88a8c54601c3898b'] },
    { match: ['locations', 'north-atlanta', 'gwinnett', 'cherokee', 'forsyth'],     cats: ['6db64e32d08a9adb88a8c54601c3898b'] },
    { match: ['about', 'coverage-review', 'contact', 'where-we-do-business', 'licensing', 'insights', 'thank-you'], cats: ['3946d154b8a6ada3f97e695dff362f32'] }
  ];

  /* ── FULL FAQ DATA (state, category, priority) ───────────────────── */
  var DATA = [{"s":"aig-ga-high-net-worth","q":"When do we use AIG for Georgia personal insurance?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"georgia","o":1},{"s":"aircover-vs-insurance","q":"Does Airbnb's AirCover replace the need for STR insurance?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":1},{"s":"alpharetta-tech-workers","q":"What insurance gaps do Alpharetta tech workers typically have?","c":"6db64e32d08a9adb88a8c54601c3898b","st":"georgia","o":1},{"s":"auto-minimum-limits-georgia","q":"Are Georgia minimum auto insurance limits enough?","c":"65328be1d7a01cdc461bc9b8c6fc1be8","st":"global","o":1},{"s":"berkley-aspire-ga-surplus-lines","q":"When do we use Berkley Aspire for Georgia commercial insurance?","c":"comm-other","st":"georgia","o":1},{"s":"berkley-mgmt-do-epl-specialty","q":"What makes Berkley Management Protection the choice for D&O and EPL coverage?","c":"comm-mgmt","st":"georgia","o":1},{"s":"branch-ga-atlanta-limits","q":"Does Branch write insurance everywhere in Georgia?","c":"7599a9aca4f4ef5a57f563f239f76129","st":"georgia","o":1},{"s":"branch-ga-community-underwriting","q":"How does Branch Insurance work for Georgia homeowners?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"georgia","o":1},{"s":"ca-other-personal-specialty","q":"What specialty personal insurance is available in California beyond standard home and auto?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"california","o":1},{"s":"cna-commercial-ga-professional-liability","q":"What is CNA's commercial insurance strength in Georgia?","c":"comm-other","st":"georgia","o":1},{"s":"ca-cyber-ccpa-notification","q":"What are California's data breach notification requirements?","c":"comm-cyber","st":"california","o":1},{"s":"ca-surety-cslb-requirement","q":"What surety bond does California require for a contractor license?","c":"comm-ca","st":"california","o":1},{"s":"ca-eo-claims-made-tail","q":"What is tail coverage and when do I need it for my California E&O policy?","c":"comm-ca","st":"california","o":1},{"s":"ca-gl-litigation-defense-cost","q":"Why should California businesses worry about defense costs being inside their GL limits?","c":"comm-gl","st":"california","o":1},{"s":"ca-str-la-primary-residence","q":"Can I rent my California investment property on Airbnb?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"california","o":1},{"s":"ca-wc-state-fund","q":"What is the California State Fund and when would I use it?","c":"comm-ca","st":"california","o":1},{"s":"ca-auto-minimums","q":"What are California's minimum auto insurance requirements?","c":"65328be1d7a01cdc461bc9b8c6fc1be8","st":"california","o":1},{"s":"ca-prop-103-credit-scoring","q":"What makes California insurance different from most other states?","c":"088f524bb9e5ff0cc66827025a88b903","st":"california","o":1},{"s":"bop-vs-gl-alone","q":"Do I really need a BOP if I already have general liability?","c":"comm-bop","st":"global","o":1},{"s":"ho-flood-damage","q":"Does homeowners insurance cover flood damage?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":1},{"s":"boat-homeowners","q":"Does homeowners insurance cover my boat?","c":"c51e68a01eac651b38b9b4c9e8146725","st":"global","o":1},{"s":"jewelry-homeowners","q":"Does homeowners insurance cover my jewelry?","c":"cd826588b60db5083028cb2df78ac7a9","st":"global","o":1},{"s":"moto-passenger","q":"Does motorcycle insurance cover a passenger injury?","c":"ab9e5948dead49e054c94b03f59142e7","st":"global","o":1},{"s":"umbrella-business","q":"Does umbrella insurance cover my business?","c":"777a0ae004cf168b861eb5756a5b2fd4","st":"global","o":1},{"s":"flood-excluded-home","q":"Does my homeowners policy cover flood damage?","c":"bd21ea859d216417bc2b20cc4dc818f9","st":"global","o":1},{"s":"ga-auto-minimums","q":"What are Georgia's minimum auto insurance requirements?","c":"088f524bb9e5ff0cc66827025a88b903","st":"georgia","o":1},{"s":"renters-required-georgia","q":"Is renters insurance required in Georgia?","c":"c7b989ec066929a3382212c952cd4881","st":"georgia","o":1},{"s":"ho3-vs-ho6","q":"What is the difference between HO-3 and HO-6 insurance?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":1},{"s":"why-independent-agent","q":"Why use an independent agent instead of going direct to a carrier?","c":"3946d154b8a6ada3f97e695dff362f32","st":"global","o":1},{"s":"pl-vs-gl","q":"What is the difference between general liability and professional liability?","c":"comm-gl","st":"global","o":1},{"s":"gl-limits-small-business","q":"What limits should I carry on general liability?","c":"comm-gl","st":"global","o":1},{"s":"collector-agreed-vs-acv","q":"What is agreed value vs actual cash value for classic cars?","c":"357486fa26d6ed6642f3c6a24b4279e","st":"global","o":1},{"s":"ca-fair-plan-explained","q":"What is the California FAIR Plan and when do I need it?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"california","o":1},{"s":"hartford-ga-appointed","q":"Is Hartford only for AARP members?","c":"7599a9aca4f4ef5a57f563f239f76129","st":"global","o":1},{"s":"wc-3-employee-rule","q":"Is workers comp really required for a 3-person business in Georgia?","c":"comm-wc","st":"georgia","o":1},{"s":"cyber-breach-cost","q":"How much does a data breach actually cost a small business?","c":"comm-cyber","st":"global","o":1},{"s":"do-epl-fiduciary","q":"What is the difference between D&O, EPL, and fiduciary liability?","c":"comm-mgmt","st":"global","o":1},{"s":"ga-homeowners-required","q":"Is homeowners insurance required in Georgia?","c":"088f524bb9e5ff0cc66827025a88b903","st":"georgia","o":1},{"s":"ga-fault-state","q":"Is Georgia a fault or no-fault state for auto insurance?","c":"088f524bb9e5ff0cc66827025a88b903","st":"georgia","o":1},{"s":"coverage-review-cost","q":"How much does a coverage review cost?","c":"3946d154b8a6ada3f97e695dff362f32","st":"global","o":2},{"s":"agent-cost-extra","q":"Does using an independent agent cost more?","c":"3946d154b8a6ada3f97e695dff362f32","st":"global","o":3},{"s":"olive-licensed","q":"Is Olive Cover a licensed insurance agency?","c":"3946d154b8a6ada3f97e695dff362f32","st":"georgia","o":4},{"s":"ga-wc-threshold","q":"When is workers compensation required for a Georgia business?","c":"088f524bb9e5ff0cc66827025a88b903","st":"georgia","o":4},{"s":"nfip-vs-private-ga","q":"Should I buy NFIP or private flood insurance in Georgia?","c":"bd21ea859d216417bc2b20cc4dc818f9","st":"georgia","o":2},{"s":"flood-waiting-period","q":"Is there a waiting period for flood insurance?","c":"bd21ea859d216417bc2b20cc4dc818f9","st":"global","o":3},{"s":"flood-zone-x-needed","q":"Do I need flood insurance if I am in FEMA Zone X?","c":"bd21ea859d216417bc2b20cc4dc818f9","st":"global","o":5},{"s":"auto-uninsured-motorist","q":"What does uninsured motorist coverage do?","c":"65328be1d7a01cdc461bc9b8c6fc1be8","st":"global","o":2},{"s":"auto-rental-car-coverage","q":"Does my auto policy cover a rental car?","c":"65328be1d7a01cdc461bc9b8c6fc1be8","st":"global","o":3},{"s":"umbrella-cost-georgia","q":"How much does umbrella insurance cost in Georgia?","c":"777a0ae004cf168b861eb5756a5b2fd4","st":"global","o":2},{"s":"umbrella-renters","q":"Do I need umbrella insurance if I rent my home?","c":"777a0ae004cf168b861eb5756a5b2fd4","st":"global","o":3},{"s":"landlord-vs-renters-policy","q":"Does my landlord's insurance cover my belongings?","c":"c7b989ec066929a3382212c952cd4881","st":"global","o":2},{"s":"renters-ale-coverage","q":"Does renters insurance cover hotel costs if I have to move out temporarily?","c":"c7b989ec066929a3382212c952cd4881","st":"global","o":5},{"s":"moto-storage","q":"Is my motorcycle covered if I store it for winter?","c":"ab9e5948dead49e054c94b03f59142e7","st":"global","o":2},{"s":"boat-what-covered","q":"What does a boat insurance policy actually cover?","c":"c51e68a01eac651b38b9b4c9e8146725","st":"global","o":3},{"s":"mysterious-disappearance","q":"What is mysterious disappearance coverage and why does it matter?","c":"cd826588b60db5083028cb2df78ac7a9","st":"global","o":2},{"s":"jewelry-appraisal-required","q":"Do I need an appraisal to insure my jewelry?","c":"cd826588b60db5083028cb2df78ac7a9","st":"global","o":3},{"s":"pl-claims-made","q":"What does claims-made mean on a professional liability policy?","c":"comm-pl","st":"global","o":2},{"s":"gl-completed-operations","q":"Does GL cover my work after I finish a project?","c":"comm-gl","st":"global","o":2},{"s":"bop-business-size","q":"What size business is a BOP designed for?","c":"comm-bop","st":"global","o":2},{"s":"cyber-ransomware","q":"Does cyber insurance cover ransomware and business interruption?","c":"comm-cyber","st":"global","o":2},{"s":"wc-experience-mod","q":"What is an experience modification rate and why does it matter?","c":"comm-wc","st":"global","o":2},{"s":"ho-dwelling-coverage-amount","q":"How much dwelling coverage do I actually need?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":3},{"s":"hoa-master-vs-unit","q":"What does the HOA master policy cover vs what unit owners need?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":2},{"s":"ho-rental-coverage","q":"What happens to my homeowners policy if I rent out my home?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":2},{"s":"ga-gl-limits-standard","q":"What GL limits should a Georgia small business carry?","c":"comm-gl","st":"georgia","o":4},{"s":"ga-bop-who-needs","q":"Which Georgia businesses need a Business Owners Policy?","c":"comm-bop","st":"georgia","o":4},{"s":"ga-commercial-auto-minimums","q":"What are Georgia's commercial auto insurance minimums?","c":"comm-ca","st":"georgia","o":4},{"s":"ga-wc-threshold-counting-employees","q":"How do I know when I am required to have workers compensation in Georgia?","c":"comm-wc","st":"georgia","o":4},{"s":"johns-creek-cost-reason","q":"Why is Johns Creek homeowners insurance more expensive?","c":"6db64e32d08a9adb88a8c54601c3898b","st":"georgia","o":1},{"s":"north-atlanta-why-different","q":"What makes North Atlanta insurance different?","c":"6db64e32d08a9adb88a8c54601c3898b","st":"georgia","o":1},{"s":"gwinnett-shop-multiple","q":"Why do Gwinnett County insurance quotes vary so much?","c":"6db64e32d08a9adb88a8c54601c3898b","st":"georgia","o":1},{"s":"ca-homeowners-carrier-pullback","q":"Why is California homeowners insurance so hard to place right now?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"california","o":2},{"s":"ca-umbrella-litigation-exposure","q":"Why is umbrella insurance especially important in California?","c":"777a0ae004cf168b861eb5756a5b2fd4","st":"california","o":1},{"s":"ca-no-credit-scoring","q":"Does California use credit scoring for auto insurance?","c":"65328be1d7a01cdc461bc9b8c6fc1be8","st":"california","o":2},{"s":"ca-landlord-dp3-required","q":"Do I need a landlord policy if I rent out my California home?","c":"2a99ce0a73b6babb24a7b495915fa79c","st":"california","o":2},{"s":"ca-cyber-ransomware-small-biz","q":"Are California small businesses really targeted by ransomware?","c":"comm-cyber","st":"california","o":2},{"s":"ca-workers-comp-threshold","q":"When does a California business need workers compensation?","c":"comm-ca","st":"california","o":1},{"s":"ca-gl-certificate-requirements","q":"What GL limits do California contracts typically require?","c":"comm-gl","st":"california","o":2},{"s":"ho-wind-hail-deductible","q":"What is a wind and hail deductible in Georgia?","c":"5690ed6ed87ac8820f7ab5cb9ab3acbf","st":"global","o":4}];

  /* ── HELPERS ──────────────────────────────────────────────────────── */
  function getState() {
    try { return localStorage.getItem('oc_state') || 'georgia'; } catch (e) { return 'georgia'; }
  }

  function getSlug() {
    var p = window.location.pathname.replace(/^\/|\/$/g, '');
    return p || 'home';
  }

  function getCatsForSlug(slug) {
    for (var i = 0; i < PAGE_MAP.length; i++) {
      var entry = PAGE_MAP[i];
      for (var j = 0; j < entry.match.length; j++) {
        if (slug.indexOf(entry.match[j]) > -1) return entry.cats;
      }
    }
    return ['3946d154b8a6ada3f97e695dff362f32']; // fallback: general
  }

  function pickFAQs(cats, state) {
    var matched = DATA.filter(function (f) {
      if (cats.indexOf(f.c) < 0) return false;
      var st = f.st || 'global';
      return st === 'global' || st === state;
    });
    matched.sort(function (a, b) { return (a.o || 99) - (b.o || 99); });
    // dedupe by question slug
    var seen = {};
    var out = [];
    for (var i = 0; i < matched.length; i++) {
      if (!seen[matched[i].s]) { seen[matched[i].s] = true; out.push(matched[i]); }
      if (out.length === 4) break;
    }
    // pad with global generals if under 4
    if (out.length < 4) {
      DATA.filter(function (f) { return f.c === '3946d154b8a6ada3f97e695dff362f32' && f.st === 'global'; })
        .slice(0, 4 - out.length)
        .forEach(function (f) { if (!seen[f.s]) { seen[f.s] = true; out.push(f); } });
    }
    return out.slice(0, 4);
  }

  /* ── CSS INJECTION ────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('ocfl-css')) return;
    var s = document.createElement('style');
    s.id = 'ocfl-css';
    s.textContent = [
      '#oc-page-faqs{background:#F2F4F8;padding:48px 0;}',
      '.ocfl-inner{max-width:1160px;margin:0 auto;padding:0 24px;}',
      '.ocfl-eyebrow{font-family:Inter,sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#C7A24B;margin-bottom:8px;}',
      '.ocfl-heading{font-family:"Playfair Display",serif;font-size:22px;font-weight:700;color:#1B3A5C;margin-bottom:24px;}',
      '.ocfl-grid{display:grid;grid-template-columns:1fr;gap:12px;}',
      '@media(min-width:540px){.ocfl-grid{grid-template-columns:repeat(2,1fr);}}',
      '@media(min-width:900px){.ocfl-grid{grid-template-columns:repeat(4,1fr);}}',
      '.ocfl-card{background:#fff;border:1px solid #e8edf2;border-radius:10px;padding:18px 16px;text-decoration:none;display:flex;flex-direction:column;gap:6px;transition:all .15s;cursor:pointer;}',
      '.ocfl-card:hover{border-color:#1B3A5C;box-shadow:0 4px 16px rgba(27,58,92,.10);transform:translateY(-2px);}',
      '.ocfl-card-q{font-family:Inter,sans-serif;font-size:13px;font-weight:600;color:#1B3A5C;line-height:1.45;flex:1;}',
      '.ocfl-card-link{font-family:Inter,sans-serif;font-size:11px;color:#C7A24B;font-weight:700;margin-top:4px;}',
      '.ocfl-more{margin-top:20px;text-align:center;}',
      '.ocfl-more a{font-family:Inter,sans-serif;font-size:13px;font-weight:600;color:#1B3A5C;text-decoration:underline;}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── BLOCK BUILDER ────────────────────────────────────────────────── */
  function buildBlock(faqs, state) {
    var label = state === 'california' ? 'California' : 'Georgia';
    var wrap = document.createElement('section');
    wrap.id = 'oc-page-faqs';
    var inner = document.createElement('div');
    inner.className = 'ocfl-inner';

    var ey = document.createElement('div');
    ey.className = 'ocfl-eyebrow';
    ey.textContent = 'Common Questions';
    inner.appendChild(ey);

    var hd = document.createElement('div');
    hd.className = 'ocfl-heading';
    hd.textContent = label + ' Insurance Questions We Hear Often';
    inner.appendChild(hd);

    var grid = document.createElement('div');
    grid.className = 'ocfl-grid';

    faqs.forEach(function (f) {
      var card = document.createElement('a');
      card.className = 'ocfl-card';
      card.href = '/faq/' + f.s;

      var q = document.createElement('div');
      q.className = 'ocfl-card-q';
      q.textContent = f.q;
      card.appendChild(q);

      var lnk = document.createElement('div');
      lnk.className = 'ocfl-card-link';
      lnk.textContent = 'Read answer \u2192';
      card.appendChild(lnk);

      grid.appendChild(card);
    });

    inner.appendChild(grid);

    var more = document.createElement('div');
    more.className = 'ocfl-more';
    more.innerHTML = '<a href="/faq">Browse all ' + label + ' insurance questions</a>';
    inner.appendChild(more);

    wrap.appendChild(inner);
    return wrap;
  }

  /* ── INJECTION ────────────────────────────────────────────────────── */
  function inject() {
    var slug = getSlug();

    // skip FAQ pages entirely
    if (slug === 'faq' || slug.indexOf('faq/') === 0) return;
    // skip 404 and thank-you (no meaningful context)
    if (slug === 'page-not-found' || slug === 'thank-you') return;
    // skip if already injected
    if (document.getElementById('oc-page-faqs')) return;

    var state = getState();
    var cats = getCatsForSlug(slug);
    var faqs = pickFAQs(cats, state);
    if (!faqs.length) return;

    injectCSS();
    var block = buildBlock(faqs, state);

    // insert before footer — try OC footer component first, then body last child
    var footer = document.querySelector('#oc-footer, .oc-footer, footer, [data-w-id*="4cc72df0"]');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(block, footer);
    } else {
      document.body.appendChild(block);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
