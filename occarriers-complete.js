/**
 * occarriers-complete.js v1.0.0
 * Olive Cover — Insurance Template carrier card renderer.
 *
 * Fetches static carrier data JSON from GitHub CDN and injects
 * carrier cards into #ins-carrier-list on insurance template pages.
 * Bypasses the broken Webflow DynamoItem binding without touching
 * the canvas or requiring Designer changes.
 */
(function () {
  'use strict';

  var DATA_URL = 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/carrier-data.json';
  var CONTAINER_ID = 'ins-carrier-list';

  function getInsuranceSlug() {
    var parts = window.location.pathname.replace(/^\/|\/$/g, '').split('/');
    // /insurance/{slug}
    if (parts[0] === 'insurance' && parts[1]) return parts[1];
    return null;
  }

  function injectStyles() {
    if (document.getElementById('oc-carriers-css')) return;
    var css = [
      '.oc-carrier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:8px;}',
      '@media(max-width:991px){.oc-carrier-grid{grid-template-columns:repeat(2,1fr);}}',
      '@media(max-width:767px){.oc-carrier-grid{grid-template-columns:1fr;}}',
      '.oc-carrier-card{display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.08);border-radius:12px;padding:20px 22px;text-decoration:none;transition:background 0.2s ease,transform 0.15s ease;}',
      '.oc-carrier-card:hover{background:rgba(255,255,255,0.14);transform:translateY(-2px);}',
      '.oc-carrier-card__rating{color:#B8934A;font-family:Inter,system-ui,sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}',
      '.oc-carrier-card__name{color:#ffffff;font-family:"Playfair Display",Georgia,serif;font-size:1.05rem;font-weight:600;line-height:1.3;}',
      '.oc-carrier-card__summary{color:rgba(255,255,255,0.72);font-family:Inter,system-ui,sans-serif;font-size:0.85rem;line-height:1.55;flex:1;}',
      '.oc-carrier-card__link{color:#B8934A;font-family:Inter,system-ui,sans-serif;font-size:0.82rem;font-weight:600;margin-top:6px;}',
    ].join('');
    var s = document.createElement('style');
    s.id = 'oc-carriers-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function renderCards(carriers) {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Hide the empty Webflow dynamo list
    var dynList = container.querySelector('.w-dyn-list');
    if (dynList) dynList.style.display = 'none';

    // Remove any existing grid we may have injected
    var existing = container.querySelector('.oc-carrier-grid');
    if (existing) existing.parentNode.removeChild(existing);

    var grid = document.createElement('div');
    grid.className = 'oc-carrier-grid';

    carriers.forEach(function (c) {
      var a = document.createElement('a');
      a.className = 'oc-carrier-card';
      a.href = '/carriers/' + c.sl;

      var rating = document.createElement('p');
      rating.className = 'oc-carrier-card__rating';
      rating.textContent = c.r || '';

      var name = document.createElement('p');
      name.className = 'oc-carrier-card__name';
      name.textContent = c.n || '';

      var summary = document.createElement('p');
      summary.className = 'oc-carrier-card__summary';
      summary.textContent = c.s || '';

      var link = document.createElement('p');
      link.className = 'oc-carrier-card__link';
      link.textContent = 'View carrier profile \u2192';

      a.appendChild(rating);
      a.appendChild(name);
      if (c.s) a.appendChild(summary);
      a.appendChild(link);
      grid.appendChild(a);
    });

    container.appendChild(grid);
  }

  function init() {
    var slug = getInsuranceSlug();
    if (!slug) return;
    if (!document.getElementById(CONTAINER_ID)) return;

    injectStyles();

    fetch(DATA_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var carriers = data.ins && data.ins[slug];
        if (carriers && carriers.length) {
          renderCards(carriers);
        }
      })
      .catch(function () {
        // Silent fail — Webflow empty state stays visible
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OC = window.OC || {};
  window.OC.carriers = { version: '1.0.0' };
})();
