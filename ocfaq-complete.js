/**
 * ocfaq-complete.js v1.1.0
 * Olive Cover FAQ rendering engine
 *
 * Responsibilities:
 *  1. Read active state from body[data-state] (set by ocnav-complete)
 *  2. Filter rendered FAQ items by state -- show national baseline,
 *     overlay state-specific items, dedupe by question-number
 *  3. Drive accordion expand/collapse via native <details>/<summary>
 *  4. Inject FAQPage JSON-LD schema from visible items for AEO
 *  5. Re-run on state change events fired by ocnav-complete
 *
 * FAQ item expected DOM structure (Webflow Collection Item):
 *   <div class="oc-faq-item"
 *        data-state="national|georgia|texas..."
 *        data-question-number="101"
 *        data-page-slug="homeowners-insurance">
 *     <details>
 *       <summary class="oc-faq-q">Question text<\/summary>
 *       <div class="oc-faq-a">Answer text<\/div>
 *     <\/details>
 *   <\/div>
 *
 * Note: When data-state / data-question-number bindings are not yet set
 * in Webflow, all items are treated as national and all are shown.
 * The /faq index page (oc-faq-static) is intentionally left as link rows.
 */
(function () {
  'use strict';

  var VERSION = '1.1.0';

  // -- Selectors
  var FAQ_LIST_SELECTOR  = '.oc-faq-list, .oc-faq-list-1, [id$="-faq-list"], [id$="-faq-collection"]';
  var FAQ_ITEM_SELECTOR  = '.oc-faq-item';
  var SCHEMA_SCRIPT_ID   = 'oc-faq-schema';
  var DEFAULT_STATE      = 'national';

  // -- Utilities
  function getActiveState() {
    return (document.body.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
  }

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  function getAllFaqItems() {
    return toArray(document.querySelectorAll(FAQ_ITEM_SELECTOR));
  }

  function getQuestionText(item) {
    var el = item.querySelector('summary, .oc-faq-q');
    return el ? el.textContent.trim() : '';
  }

  function getAnswerText(item) {
    var el = item.querySelector('.oc-faq-a, details > div, details > p');
    return el ? el.innerHTML.trim() : '';
  }

  // -- State filtering
  function applyStateFilter() {
    var activeState = getActiveState();
    var items = getAllFaqItems();
    if (!items.length) return;

    var hasStateData = items.some(function (item) {
      return item.getAttribute('data-state') !== null;
    });

    if (!hasStateData) {
      items.forEach(function (item) { item.style.display = ''; });
      buildFaqSchema();
      return;
    }

    var overridden = {};
    items.forEach(function (item) {
      var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
      var qNum = item.getAttribute('data-question-number');
      if (itemState === activeState && itemState !== DEFAULT_STATE && qNum) {
        overridden[qNum] = true;
      }
    });

    items.forEach(function (item) {
      var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
      var qNum = item.getAttribute('data-question-number');
      var show = false;
      if (itemState === DEFAULT_STATE) {
        show = !overridden[qNum];
      } else if (itemState === activeState) {
        show = true;
      }
      item.style.display = show ? '' : 'none';
    });

    toArray(document.querySelectorAll(FAQ_LIST_SELECTOR)).forEach(function (list) {
      var visible = toArray(list.querySelectorAll(FAQ_ITEM_SELECTOR)).filter(function (item) {
        return item.style.display !== 'none';
      });
      visible.sort(function (a, b) {
        return parseInt(a.getAttribute('data-question-number') || '0', 10) -
               parseInt(b.getAttribute('data-question-number') || '0', 10);
      });
      visible.forEach(function (item) { list.appendChild(item); });
    });

    buildFaqSchema();
  }

  // -- Accordion: one open at a time per list
  function initAccordion() {
    toArray(document.querySelectorAll(FAQ_LIST_SELECTOR)).forEach(function (list) {
      list.addEventListener('click', function (e) {
        var summary = e.target.closest('summary');
        if (!summary) return;
        var clicked = summary.closest('details');
        if (!clicked) return;
        toArray(list.querySelectorAll('details')).forEach(function (d) {
          if (d !== clicked && d.open) d.open = false;
        });
      });
    });
  }

  // -- Schema
  function buildFaqSchema() {
    var items = getAllFaqItems().filter(function (item) {
      return item.style.display !== 'none';
    });
    if (!items.length) return;

    var entities = items.map(function (item) {
      var q = getQuestionText(item);
      var a = getAnswerText(item);
      if (!q || !a || q === 'FAQ Question') return null;
      return {
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': { '@type': 'Answer', 'text': a.replace(/<[^>]+>/g, '').trim() }
      };
    }).filter(Boolean);

    if (!entities.length) return;

    var existing = document.getElementById(SCHEMA_SCRIPT_ID);
    if (existing) existing.parentNode.removeChild(existing);

    var script = document.createElement('script');
    script.id = SCHEMA_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': entities }, null, 2);
    document.head.appendChild(script);
  }

  // -- CSS
  function injectStyles() {
    if (document.getElementById('oc-faq-styles')) return;

    var css = [
      '.oc-faq-list, .oc-faq-list-1 { display: flex; flex-direction: column; }',
      '.oc-faq-item { border-bottom: 1px solid rgba(27,58,92,0.12); }',
      '.oc-faq-item:first-child { border-top: 1px solid rgba(27,58,92,0.12); }',
      '.oc-faq-item details { cursor: pointer; }',
      '.oc-faq-item summary { list-style: none; }',
      '.oc-faq-item summary::-webkit-details-marker { display: none; }',
      '.oc-faq-q { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px 0; font-family: "Playfair Display", Georgia, serif; font-size: 1.05rem; font-weight: 600; line-height: 1.4; color: #1B3A5C; cursor: pointer; user-select: none; }',
      '.oc-faq-q::after { content: "+"; font-size: 1.4rem; font-weight: 300; color: #B8934A; flex-shrink: 0; line-height: 1.1; transition: transform 0.2s ease; }',
      'details[open] > summary.oc-faq-q::after { content: "\u2212"; }',
      '.oc-faq-item details > div, .oc-faq-item details > p, .oc-faq-a { padding: 0 24px 20px 0; font-family: Inter, system-ui, sans-serif; font-size: 0.95rem; line-height: 1.75; color: #374151; max-width: 72ch; animation: oc-faq-open 0.2s ease; }',
      '.oc-faq-item details > div p, .oc-faq-a p { margin: 0 0 12px; }',
      '.oc-faq-item details > div p:last-child, .oc-faq-a p:last-child { margin-bottom: 0; }',
      '.oc-faq-item details > div a, .oc-faq-a a { color: #B8934A; text-decoration: underline; }',
      '.oc-faq-item details > div strong, .oc-faq-a strong { color: #1B3A5C; }',
      '@keyframes oc-faq-open { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }',
      '.oc-faq-empty { font-family: Inter, system-ui, sans-serif; font-size: 0.9rem; color: #6B7280; font-style: italic; padding: 16px 0; }',
      '@media (max-width: 767px) { .oc-faq-q { font-size: 0.95rem; padding: 16px 0; } .oc-faq-item details > div, .oc-faq-a { font-size: 0.9rem; padding-bottom: 16px; } }',
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'oc-faq-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // -- Empty state
  function handleEmptyStates() {
    toArray(document.querySelectorAll(FAQ_LIST_SELECTOR)).forEach(function (list) {
      var visible = toArray(list.querySelectorAll(FAQ_ITEM_SELECTOR)).filter(function (item) {
        return item.style.display !== 'none';
      });
      var existing = list.querySelector('.oc-faq-empty');
      if (!visible.length) {
        if (!existing) {
          var msg = document.createElement('p');
          msg.className = 'oc-faq-empty';
          msg.textContent = 'No questions found for this topic.';
          list.appendChild(msg);
        }
      } else {
        if (existing) existing.parentNode.removeChild(existing);
      }
    });
  }

  // -- State change listener
  function listenForStateChanges() {
    window.addEventListener('oc:statechange', function () {
      applyStateFilter();
      handleEmptyStates();
    });
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName === 'data-state') {
            applyStateFilter();
            handleEmptyStates();
          }
        });
      }).observe(document.body, { attributes: true, attributeFilter: ['data-state'] });
    }
  }

  // -- Init
  function init() {
    if (!document.querySelectorAll(FAQ_LIST_SELECTOR).length) return;
    injectStyles();
    initAccordion();
    applyStateFilter();
    handleEmptyStates();
    listenForStateChanges();
    window.OC = window.OC || {};
    window.OC.faq = { version: VERSION };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();