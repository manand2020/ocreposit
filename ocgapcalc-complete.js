// ocgapcalc-complete.js -- Olive Cover Coverage Gap Calculator v1.0.0
//
// Self-contained interactive tool. Drop a `<div id="oc-gap-calc"></div>` on any
// Webflow page (typically /coverage-gap-calculator or /coverage as a section);
// this script mounts the calculator inside it. No build step, no framework, no
// dependencies. Vanilla JS + inline styles, brand-compliant (no emojis, no
// jargon codes, no California, no rating agency names, no em-dashes).
//
// Visitor enters home value, current dwelling and liability limits, net worth,
// year built, wind/hail deductible, and flood-coverage status. The module
// computes four educational gap signals (dwelling underinsurance, liability
// vs net worth, wind/hail out-of-pocket exposure, flood exclusion) and
// produces a plain-language gap report with a "Free Coverage Review" CTA
// linking to /coverage-review.
//
// No backend dependency. No PII captured. No POST to Firebase. The math is
// approximate and intentionally conservative -- this is a teaching tool, not
// a quote. Visitors who want a real number are guided to /coverage-review.
//
// Brand attribution: Olive Insurance Services, LLC (dba Olive Cover).
(function () {
  'use strict';

  var TARGET_ID = 'oc-gap-calc';
  var target = document.getElementById(TARGET_ID);
  if (!target) return;
  if (target.dataset.ocGapMounted === '1') return;
  target.dataset.ocGapMounted = '1';

  // ---- Styles (scoped via .ocgc- prefix) ----
  var css = [
    '.ocgc-wrap{font-family:Inter,system-ui,sans-serif;color:#1B3A5C;background:#F5EDD8;padding:32px 24px;border-radius:8px;max-width:760px;margin:0 auto}',
    '.ocgc-head{font-family:"Playfair Display",Georgia,serif;font-size:1.75rem;line-height:1.2;margin:0 0 12px}',
    '.ocgc-sub{font-size:1rem;color:#1B3A5C;opacity:0.78;margin:0 0 24px}',
    '.ocgc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}',
    '@media (max-width:600px){.ocgc-grid{grid-template-columns:1fr}}',
    '.ocgc-field{display:flex;flex-direction:column;gap:6px}',
    '.ocgc-field--full{grid-column:1/-1}',
    '.ocgc-lbl{font-size:0.875rem;font-weight:600;color:#1B3A5C}',
    '.ocgc-hint{font-size:0.75rem;color:#1B3A5C;opacity:0.6;margin-top:-2px}',
    '.ocgc-input,.ocgc-select{font-family:Inter,system-ui,sans-serif;font-size:1rem;color:#1B3A5C;background:#FFFFFF;border:1px solid rgba(27,58,92,0.2);border-radius:6px;padding:10px 12px;width:100%;box-sizing:border-box}',
    '.ocgc-input:focus,.ocgc-select:focus{outline:none;border-color:#B8934A;box-shadow:0 0 0 3px rgba(184,147,74,0.15)}',
    '.ocgc-cta{margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;align-items:center}',
    '.ocgc-btn{font-family:Inter,system-ui,sans-serif;font-size:1rem;font-weight:600;background:#B8934A;color:#FFFFFF;border:none;border-radius:6px;padding:12px 24px;cursor:pointer;text-decoration:none;display:inline-block;min-height:44px;line-height:20px}',
    '.ocgc-btn:hover{background:#9d7d3f}',
    '.ocgc-btn--secondary{background:transparent;color:#1B3A5C;border:1px solid #1B3A5C}',
    '.ocgc-btn--secondary:hover{background:rgba(27,58,92,0.06)}',
    '.ocgc-report{margin-top:32px;background:#FFFFFF;border:1px solid rgba(27,58,92,0.12);border-radius:8px;padding:24px;display:none}',
    '.ocgc-report.is-shown{display:block}',
    '.ocgc-report-head{font-family:"Playfair Display",Georgia,serif;font-size:1.375rem;margin:0 0 8px;color:#1B3A5C}',
    '.ocgc-report-sub{font-size:0.9375rem;color:#1B3A5C;opacity:0.7;margin:0 0 18px}',
    '.ocgc-gap{padding:14px 16px;border-radius:6px;margin-bottom:10px;border-left:4px solid #999}',
    '.ocgc-gap--ok{background:#f0f8f0;border-left-color:#3a8a3a}',
    '.ocgc-gap--watch{background:#fff7e0;border-left-color:#d18f00}',
    '.ocgc-gap--high{background:#fceeee;border-left-color:#b13030}',
    '.ocgc-gap-h{font-weight:700;font-size:0.9375rem;margin:0 0 4px}',
    '.ocgc-gap-body{font-size:0.875rem;line-height:1.5;margin:0 0 4px;color:#1B3A5C}',
    '.ocgc-gap-fix{font-size:0.8125rem;color:#1B3A5C;opacity:0.85;margin:6px 0 0;font-style:italic}',
    '.ocgc-summary{margin:18px 0;padding:14px;background:#F5EDD8;border-radius:6px;font-size:0.9375rem;color:#1B3A5C}',
    '.ocgc-summary strong{color:#1B3A5C}',
    '.ocgc-disclaimer{font-size:0.75rem;color:#1B3A5C;opacity:0.55;margin-top:20px;line-height:1.5}'
  ].join('');
  var styleEl = document.createElement('style');
  styleEl.id = 'ocgc-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---- HTML scaffold ----
  target.innerHTML = [
    '<div class="ocgc-wrap" role="region" aria-label="Insurance coverage gap calculator">',
    '<h2 class="ocgc-head" id="ocgc-head">Find your coverage gaps in 60 seconds.</h2>',
    '<p class="ocgc-sub">A quick, no-jargon look at where your homeowners policy may fall short. We pull together four common gaps and explain each in plain language.</p>',
    '<div class="ocgc-grid" role="group" aria-labelledby="ocgc-head">',
      '<div class="ocgc-field">',
        '<label class="ocgc-lbl" for="ocgc-hv">Home market value</label>',
        '<input class="ocgc-input" type="number" id="ocgc-hv" min="50000" max="20000000" step="10000" placeholder="650000" inputmode="numeric" autocomplete="off">',
        '<span class="ocgc-hint">What it would sell for today</span>',
      '</div>',
      '<div class="ocgc-field">',
        '<label class="ocgc-lbl" for="ocgc-dc">Current dwelling coverage</label>',
        '<input class="ocgc-input" type="number" id="ocgc-dc" min="50000" max="20000000" step="10000" placeholder="500000" inputmode="numeric" autocomplete="off">',
        '<span class="ocgc-hint">From your declarations page, Coverage A</span>',
      '</div>',
      '<div class="ocgc-field">',
        '<label class="ocgc-lbl" for="ocgc-yb">Year your home was built</label>',
        '<input class="ocgc-input" type="number" id="ocgc-yb" min="1880" max="2030" step="1" placeholder="2010" inputmode="numeric" autocomplete="off">',
        '<span class="ocgc-hint">Affects rebuild cost and code-upgrade exposure</span>',
      '</div>',
      '<div class="ocgc-field">',
        '<label class="ocgc-lbl" for="ocgc-ll">Current liability limit</label>',
        '<select class="ocgc-select" id="ocgc-ll">',
          '<option value="">Select</option>',
          '<option value="100000">$100,000</option>',
          '<option value="300000">$300,000</option>',
          '<option value="500000">$500,000</option>',
          '<option value="1000000">$1,000,000</option>',
        '</select>',
        '<span class="ocgc-hint">From your declarations page, Coverage E</span>',
      '</div>',
      '<div class="ocgc-field">',
        '<label class="ocgc-lbl" for="ocgc-nw">Approximate household net worth</label>',
        '<select class="ocgc-select" id="ocgc-nw">',
          '<option value="">Select</option>',
          '<option value="200000">Under $250K</option>',
          '<option value="400000">$250K to $500K</option>',
          '<option value="750000">$500K to $1M</option>',
          '<option value="1500000">$1M to $2M</option>',
          '<option value="3000000">Over $2M</option>',
        '</select>',
        '<span class="ocgc-hint">Includes home equity, retirement, savings</span>',
      '</div>',
      '<div class="ocgc-field">',
        '<label class="ocgc-lbl" for="ocgc-whd">Wind and hail deductible</label>',
        '<select class="ocgc-select" id="ocgc-whd">',
          '<option value="">Select</option>',
          '<option value="flat-1000">Flat $1,000</option>',
          '<option value="flat-2500">Flat $2,500</option>',
          '<option value="flat-5000">Flat $5,000</option>',
          '<option value="pct-1">1% of dwelling coverage</option>',
          '<option value="pct-2">2% of dwelling coverage</option>',
          '<option value="pct-5">5% of dwelling coverage</option>',
          '<option value="unknown">I don\'t know</option>',
        '</select>',
        '<span class="ocgc-hint">Often separate from the all-other-perils deductible</span>',
      '</div>',
      '<div class="ocgc-field ocgc-field--full">',
        '<label class="ocgc-lbl" for="ocgc-fl">Do you carry flood insurance?</label>',
        '<select class="ocgc-select" id="ocgc-fl">',
          '<option value="">Select</option>',
          '<option value="yes">Yes, separate flood policy</option>',
          '<option value="no">No</option>',
          '<option value="unsure">Not sure</option>',
        '</select>',
        '<span class="ocgc-hint">Standard homeowners excludes flood damage</span>',
      '</div>',
    '</div>',
    '<div class="ocgc-cta">',
      '<button class="ocgc-btn" id="ocgc-run" type="button">See my gaps</button>',
      '<a class="ocgc-btn ocgc-btn--secondary" id="ocgc-cr" href="/coverage-review">Skip to Free Coverage Review</a>',
    '</div>',
    '<div class="ocgc-report" id="ocgc-report" aria-live="polite"></div>',
    '<p class="ocgc-disclaimer">Educational tool only. Estimates are approximate and based on the values you enter. Actual policy gaps depend on full underwriting and your specific declarations page. Olive Insurance Services, LLC (dba Olive Cover) is a licensed independent property and casualty agency in Georgia. For a real-world coverage review across multiple carriers, start a free Coverage Review.</p>',
    '</div>'
  ].join('');

  // ---- Logic ----
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return n.toLocaleString('en-US'); }

  function classify(severity) {
    return severity === 'ok' ? 'ocgc-gap--ok' : severity === 'watch' ? 'ocgc-gap--watch' : 'ocgc-gap--high';
  }
  function sevLabel(severity) {
    return severity === 'ok' ? 'OK' : severity === 'watch' ? 'Watch' : 'Significant gap';
  }

  function analyze() {
    var hv = parseFloat($('ocgc-hv').value) || 0;
    var dc = parseFloat($('ocgc-dc').value) || 0;
    var yb = parseInt($('ocgc-yb').value) || 0;
    var ll = parseFloat($('ocgc-ll').value) || 0;
    var nw = parseFloat($('ocgc-nw').value) || 0;
    var whd = $('ocgc-whd').value;
    var fl = $('ocgc-fl').value;
    var gaps = [];

    // Gap 1: Dwelling coverage
    if (hv && dc) {
      // Rebuild cost typically tracks market value within +/- 20% in metro Atlanta.
      // For homes built before 1990, code-upgrade exposure adds ~15%.
      var rebuildFactor = (yb && yb < 1990) ? 1.15 : 1.0;
      var recommendedMin = Math.round(hv * 0.85 * rebuildFactor);
      var ratio = dc / hv;
      if (ratio < 0.7) {
        gaps.push({
          sev: 'high',
          title: 'Dwelling coverage looks well below rebuild cost',
          body: 'Your dwelling coverage of $' + fmt(dc) + ' is ' + Math.round((1 - ratio) * 100) + '% lower than your home market value of $' + fmt(hv) + '. Rebuild cost in metro Atlanta usually tracks market value within twenty percent. A total loss at this gap size could leave $' + fmt(Math.round(hv * 0.85 * rebuildFactor - dc)) + ' or more uncovered.',
          fix: 'Ask for a current rebuild-cost estimate from your carrier, or send your declarations page to Olive Cover and we will run replacement-cost comparisons across multiple carriers.'
        });
      } else if (ratio < 0.85) {
        gaps.push({
          sev: 'watch',
          title: 'Dwelling coverage may be on the low side',
          body: 'Your coverage of $' + fmt(dc) + ' is roughly ' + Math.round(ratio * 100) + '% of market value. Rebuild cost may be higher than this depending on local construction prices and code requirements.',
          fix: 'Have your dec page reviewed against current rebuild estimates. Code-upgrade endorsements often cost very little and protect against six-figure exposure.'
        });
      } else if (yb && yb < 1990 && ratio < 1.0) {
        gaps.push({
          sev: 'watch',
          title: 'Older home plus standard coverage equals code-upgrade exposure',
          body: 'Homes built before 1990 often need code-upgrade work in a major repair (current electrical, plumbing, energy codes). Standard policies cap this at ten percent of dwelling coverage unless you add an Ordinance and Law endorsement.',
          fix: 'Ask your carrier for the Ordinance and Law endorsement, or have us shop carriers that include it by default.'
        });
      } else {
        gaps.push({
          sev: 'ok',
          title: 'Dwelling coverage looks aligned',
          body: 'Your $' + fmt(dc) + ' dwelling coverage is within range of your $' + fmt(hv) + ' market value. Worth confirming against an actual rebuild-cost estimate, but the dollar gap is reasonable.',
          fix: ''
        });
      }
    }

    // Gap 2: Liability vs net worth
    if (ll && nw) {
      var liabilityShortfall = nw - ll;
      if (liabilityShortfall > 0) {
        gaps.push({
          sev: liabilityShortfall > 500000 ? 'high' : 'watch',
          title: 'Liability protection trails your net worth',
          body: 'Your homeowners liability of $' + fmt(ll) + ' is $' + fmt(liabilityShortfall) + ' below your approximate net worth. In a serious lawsuit, assets above the liability limit can be exposed.',
          fix: 'A personal umbrella policy typically adds $1,000,000 to $5,000,000 of liability coverage for around $200 to $500 per year. We can quote umbrella alongside your homeowners and auto.'
        });
      } else {
        gaps.push({
          sev: 'ok',
          title: 'Liability coverage matches your asset profile',
          body: 'Your $' + fmt(ll) + ' liability limit covers your approximate net worth. Adding a small umbrella for headroom is still common at this level, but you are not exposed today.',
          fix: ''
        });
      }
    }

    // Gap 3: Wind and hail deductible
    if (whd && dc) {
      var whdAmount = 0;
      if (whd === 'flat-1000') whdAmount = 1000;
      else if (whd === 'flat-2500') whdAmount = 2500;
      else if (whd === 'flat-5000') whdAmount = 5000;
      else if (whd === 'pct-1') whdAmount = dc * 0.01;
      else if (whd === 'pct-2') whdAmount = dc * 0.02;
      else if (whd === 'pct-5') whdAmount = dc * 0.05;
      else if (whd === 'unknown') {
        gaps.push({
          sev: 'watch',
          title: 'Wind and hail deductible unknown',
          body: 'In Georgia, the wind and hail deductible is often separate from your all-other-perils deductible and is frequently a percentage of dwelling coverage (1% to 5%). At your coverage of $' + fmt(dc) + ', a 2% deductible would be $' + fmt(Math.round(dc * 0.02)) + ' out of pocket on a storm loss.',
          fix: 'Pull your declarations page and look for the Wind/Hail or Named Storm deductible. We can review whether the dollar amount makes sense given your savings.'
        });
        whdAmount = 0;
      }
      if (whdAmount > 0) {
        if (whdAmount >= 10000) {
          gaps.push({
            sev: 'high',
            title: 'Wind and hail deductible would cost $' + fmt(Math.round(whdAmount)) + ' out of pocket',
            body: 'On a storm loss, you would pay the first $' + fmt(Math.round(whdAmount)) + ' before insurance starts. In a high wind or hail year this is the most common out-of-pocket exposure homeowners face.',
            fix: 'Some carriers offer a flat dollar wind/hail deductible (often $1,000 to $2,500). Switching the deductible structure can be worth a few hundred dollars per year for the right risk profile.'
          });
        } else if (whdAmount >= 5000) {
          gaps.push({
            sev: 'watch',
            title: 'Wind and hail deductible is $' + fmt(Math.round(whdAmount)),
            body: 'Manageable for most households but worth checking against your savings. Several Georgia carriers offer lower deductible structures.',
            fix: 'We can compare deductible structures across carriers as part of a Coverage Review.'
          });
        } else {
          gaps.push({
            sev: 'ok',
            title: 'Wind and hail deductible looks reasonable',
            body: 'Your wind/hail exposure of $' + fmt(Math.round(whdAmount)) + ' is within normal range for Georgia. Worth confirming on your dec page.',
            fix: ''
          });
        }
      }
    }

    // Gap 4: Flood
    if (fl === 'no' || fl === 'unsure') {
      gaps.push({
        sev: 'watch',
        title: fl === 'no' ? 'No flood insurance in place' : 'Flood insurance status unknown',
        body: 'Standard homeowners policies exclude flood damage. In Georgia, even one inch of water can run $25,000 or more in damage. Flood zone status varies parcel by parcel; FEMA Special Flood Hazard Areas are required for mortgaged homes but coverage is recommended elsewhere too.',
        fix: 'Check your address against the FEMA flood map at msc.fema.gov. We can quote separate flood insurance through the NFIP or a private flood carrier.'
      });
    } else if (fl === 'yes') {
      gaps.push({
        sev: 'ok',
        title: 'Flood coverage in place',
        body: 'Good. Worth confirming the dwelling and contents limits on your separate flood policy align with your homeowners limits.',
        fix: ''
      });
    }

    return gaps;
  }

  function render(gaps) {
    var report = $('ocgc-report');
    if (!gaps.length) {
      report.innerHTML = '<p class="ocgc-report-sub">Fill in the fields above and click "See my gaps" to get your report.</p>';
      report.classList.add('is-shown');
      return;
    }
    var highCount = gaps.filter(function (g) { return g.sev === 'high'; }).length;
    var watchCount = gaps.filter(function (g) { return g.sev === 'watch'; }).length;
    var okCount = gaps.filter(function (g) { return g.sev === 'ok'; }).length;
    var summary = '<strong>' + highCount + ' significant gap' + (highCount === 1 ? '' : 's') + ', ' +
                  watchCount + ' worth a closer look</strong>, ' + okCount + ' area' + (okCount === 1 ? '' : 's') + ' aligned.';
    var html = '<h3 class="ocgc-report-head">Your coverage gap report</h3>';
    html += '<p class="ocgc-report-sub">Based on the values you entered. Estimates are approximate; the real picture comes from a full review of your declarations page.</p>';
    html += '<div class="ocgc-summary">' + summary + '</div>';
    gaps.forEach(function (g) {
      html += '<div class="ocgc-gap ' + classify(g.sev) + '">';
      html += '<p class="ocgc-gap-h">' + sevLabel(g.sev) + ': ' + g.title + '</p>';
      html += '<p class="ocgc-gap-body">' + g.body + '</p>';
      if (g.fix) html += '<p class="ocgc-gap-fix">What to do: ' + g.fix + '</p>';
      html += '</div>';
    });
    html += '<div class="ocgc-cta"><a class="ocgc-btn" href="/coverage-review">Free Coverage Review</a></div>';
    report.innerHTML = html;
    report.classList.add('is-shown');
    // Scroll the report into view
    try { report.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    // GA4 event if gtag available
    try {
      if (window.gtag) {
        window.gtag('event', 'gap_calculator_run', {
          significant_gaps: highCount,
          watch_gaps: watchCount,
          aligned_areas: okCount
        });
      }
    } catch (e) {}
  }

  $('ocgc-run').addEventListener('click', function () {
    var gaps = analyze();
    render(gaps);
  });

  // Optional: also re-render on Enter from any input
  Array.prototype.forEach.call(target.querySelectorAll('.ocgc-input,.ocgc-select'), function (el) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var gaps = analyze();
        render(gaps);
      }
    });
  });
})();
