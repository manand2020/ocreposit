/**
 * ocfaq-complete.js v1.1.0
 * Olive Cover FAQ rendering engine
 *
 * What changed in v1.1.0:
 *  - normaliseFaqItems() adds oc-faq-item, oc-faq-q, oc-faq-a classes at
 *    runtime so the script works with the actual Webflow-rendered DOM
 *    (wrapper divs have data attrs but no class; summary/answer div have
 *    no classes either).
 *  - getFaqLists() finds lists by id*=faq-list in addition to .oc-faq-list
 *  - Filter/sort operates on .w-dyn-item rows (Webflow list items)
 *  - /faq/{slug} detail pages skipped (isDetailPage check)
 *  - /faq index page (oc-faq-static) left unchanged -- link rows stay as links
 *  - Schema skips placeholder text ("FAQ Question" / "FAQ Answer")
 */
(function () {
  'use strict';

  var OC_FAQ_VERSION   = '1.1.0';
  var FAQ_ITEM_CLASS   = 'oc-faq-item';
  var FAQ_ITEM_SEL     = '.' + FAQ_ITEM_CLASS;
  var FAQ_Q_CLASS      = 'oc-faq-q';
  var FAQ_A_CLASS      = 'oc-faq-a';
  var SCHEMA_SCRIPT_ID = 'oc-faq-schema';
  var DEFAULT_STATE    = 'national';

  function getActiveState() {
    return (document.body.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
  }

  function getAllFaqItems() {
    return Array.prototype.slice.call(document.querySelectorAll(FAQ_ITEM_SEL));
  }

  function getFaqLists() {
    var byClass = Array.prototype.slice.call(document.querySelectorAll('.oc-faq-list'));
    var byId    = Array.prototype.slice.call(document.querySelectorAll('[id*="faq-list"]'));
    var seen = {};
    return byClass.concat(byId).filter(function (el) {
      var key = el.id || el.className;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function isDetailPage() {
    var parts = window.location.pathname.replace(/^\/|\/$/g, '').split('/');
    return parts[0] === 'faq' && parts.length >= 2;
  }

  function getQuestionText(item) {
    var el = item.querySelector('summary.' + FAQ_Q_CLASS) ||
             item.querySelector('summary') ||
             item.querySelector('.' + FAQ_Q_CLASS);
    return el ? el.textContent.trim() : '';
  }

  function getAnswerText(item) {
    var el = item.querySelector('.' + FAQ_A_CLASS);
    return el ? el.innerHTML.trim() : '';
  }

  function normaliseFaqItems() {
    var candidates = Array.prototype.slice.call(
      document.querySelectorAll('[data-question-number]')
    );
    getFaqLists().forEach(function (list) {
      var dynItems = list.querySelectorAll('.w-dyn-item > div');
      Array.prototype.forEach.call(dynItems, function (div) {
        if (div.querySelector('details') && candidates.indexOf(div) === -1) {
          candidates.push(div);
        }
      });
    });
    candidates.forEach(function (div) {
      if (!div.classList.contains(FAQ_ITEM_CLASS)) div.classList.add(FAQ_ITEM_CLASS);
      var details = div.querySelector('details');
      if (!details) return;
      var summary = details.querySelector('summary');
      if (summary && !summary.classList.contains(FAQ_Q_CLASS)) summary.classList.add(FAQ_Q_CLASS);
      Array.prototype.forEach.call(details.children, function (child) {
        if (child.tagName !== 'SUMMARY' && !child.classList.contains(FAQ_A_CLASS)) {
          child.classList.add(FAQ_A_CLASS);
        }
      });
    });
  }

  function applyStateFilter() {
    var activeState = getActiveState();
    var items       = getAllFaqItems();
    if (!items.length) return;
    var overriddenNumbers = {};
    items.forEach(function (item) {
      var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
      var qNum      = item.getAttribute('data-question-number');
      if (itemState === activeState && itemState !== DEFAULT_STATE && qNum) overriddenNumbers[qNum] = true;
    });
    items.forEach(function (item) {
      var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
      var qNum      = item.getAttribute('data-question-number');
      var show;
      if (!itemState || itemState === DEFAULT_STATE) { show = !overriddenNumbers[qNum]; }
      else if (itemState === activeState) { show = true; }
      else { show = false; }
      var row = item.closest('.w-dyn-item') || item;
      row.style.display = show ? '' : 'none';
    });
    getFaqLists().forEach(function (list) {
      var rows = Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item')).filter(function (row) { return row.style.display !== 'none'; });
      rows.sort(function (a, b) {
        var iA = a.querySelector(FAQ_ITEM_SEL), iB = b.querySelector(FAQ_ITEM_SEL);
        var numA = parseInt((iA && iA.getAttribute('data-question-number')) || '0', 10);
        var numB = parseInt((iB && iB.getAttribute('data-question-number')) || '0', 10);
        return numA - numB;
      });
      rows.forEach(function (row) { list.appendChild(row); });
    });
    buildFaqSchema();
  }

  function initAccordion() {
    getFaqLists().forEach(function (list) {
      list.addEventListener('click', function (e) {
        var summary = e.target.closest('summary');
        if (!summary) return;
        var clicked = summary.closest('details');
        if (!clicked) return;
        Array.prototype.forEach.call(list.querySelectorAll('details'), function (d) {
          if (d !== clicked && d.open) d.open = false;
        });
      });
    });
  }

  function buildFaqSchema() {
    var items = getAllFaqItems().filter(function (item) {
      var row = item.closest('.w-dyn-item') || item;
      return row.style.display !== 'none';
    });
    if (!items.length) return;
    var entities = items.map(function (item) {
      var q = getQuestionText(item), a = getAnswerText(item);
      if (!q || !a || q === 'FAQ Question' || a === 'FAQ Answer') return null;
      return { '@type': 'Question', 'name': q, 'acceptedAnswer': { '@type': 'Answer', 'text': a.replace(/<[^>]+>/g, '').trim() } };
    }).filter(Boolean);
    if (!entities.length) return;
    var existing = document.getElementById(SCHEMA_SCRIPT_ID);
    if (existing) existing.parentNode.removeChild(existing);
    var script = document.createElement('script');
    script.id = SCHEMA_SCRIPT_ID; script.type = 'application/ld+json';
    script.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': entities }, null, 2);
    document.head.appendChild(script);
  }

  function injectStyles() {
    if (document.getElementById('oc-faq-styles')) return;
    var css = [
      '.oc-faq-list, [id*="faq-list"] { display: flex; flex-direction: column; }',
      '.oc-faq-item { border-bottom: 1px solid rgba(27,58,92,0.12); }',
      '.oc-faq-item:first-child { border-top: 1px solid rgba(27,58,92,0.12); }',
      '.oc-faq-item details { cursor: pointer; }',
      '.oc-faq-item details summary { list-style: none; }',
      '.oc-faq-item details summary::-webkit-details-marker { display: none; }',
      '.oc-faq-q { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px 0; font-family: "Playfair Display", Georgia, serif; font-size: 1.05rem; font-weight: 600; line-height: 1.4; color: #1B3A5C; cursor: pointer; user-select: none; }',
      '.oc-faq-q::after { content: "+"; font-size: 1.5rem; font-weight: 300; color: #B8934A; flex-shrink: 0; line-height: 1; margin-top: 2px; transition: transform 0.2s ease; }',
      'details[open] .oc-faq-q::after { content: "\u2212"; color: #B8934A; }',
      '.oc-faq-a { padding: 0 24px 20px 0; font-family: Inter, system-ui, sans-serif; font-size: 0.95rem; line-height: 1.75; color: #374151; max-width: 72ch; }',
      '.oc-faq-a p { margin: 0 0 12px; } .oc-faq-a p:last-child { margin-bottom: 0; }',
      '.oc-faq-a a { color: #B8934A; text-decoration: underline; } .oc-faq-a strong { color: #1B3A5C; }',
      'details[open] .oc-faq-a { animation: oc-faq-open 0.2s ease; }',
      '@keyframes oc-faq-open { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }',
      '.oc-faq-empty { font-family: Inter, system-ui, sans-serif; font-size: 0.9rem; color: #6B7280; font-style: italic; padding: 16px 0; }',
      '@media (max-width: 767px) { .oc-faq-q { font-size: 0.95rem; padding: 16px 0; } .oc-faq-a { font-size: 0.9rem; padding-bottom: 16px; } }',
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'oc-faq-styles'; style.textContent = css;
    document.head.appendChild(style);
  }

  function handleEmptyStates() {
    getFaqLists().forEach(function (list) {
      var visible = Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item')).filter(function (row) { return row.style.display !== 'none'; });
      var existing = list.querySelector('.oc-faq-empty');
      if (!visible.length) {
        if (!existing) { var msg = document.createElement('p'); msg.className = 'oc-faq-empty'; msg.textContent = 'No questions found for this topic.'; list.appendChild(msg); }
      } else { if (existing) existing.parentNode.removeChild(existing); }
    });
  }

  function listenForStateChanges() {
    window.addEventListener('oc:statechange', function () { applyStateFilter(); handleEmptyStates(); });
    if (typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) { if (m.attributeName === 'data-state') { applyStateFilter(); handleEmptyStates(); } });
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ['data-state'] });
    }
  }

  function init() {
    if (isDetailPage()) return;
    if (!getFaqLists().length) return;
    injectStyles();
    normaliseFaqItems();
    initAccordion();
    applyStateFilter();
    handleEmptyStates();
    listenForStateChanges();
    window.OC = window.OC || {}; window.OC.faq = { version: OC_FAQ_VERSION };
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();