/**
 * ocfaq-complete.js v1.0.0
 * Olive Cover FAQ rendering engine
 *
 * Responsibilities:
 *  1. Read active state from body[data-state] (set by ocnav-complete)
 *  2. Filter rendered FAQ items by state -- show national baseline,
 *     overlay state-specific items, dedupe by question-number
 *  3. Render accordion expand/collapse behavior (pure CSS details/summary)
 *  4. Inject FAQPage JSON-LD schema from visible items for AEO
 *  5. Re-run on state change events fired by ocnav-complete
 *
 * Dependencies: ocnav-complete must run first (sets body[data-state])
 * No external API calls. All content is pre-rendered in DOM by Webflow.
 *
 * FAQ item expected DOM structure (Webflow Collection Item):
 *   <div class="oc-faq-item"
 *        data-state="national|georgia|texas..."
 *        data-question-number="101"
 *        data-page-slug="homeowners-insurance">
 *     <details>
 *       <summary class="oc-faq-q">Question text</summary>
 *       <div class="oc-faq-a">Answer text</div>
 *     </details>
 *   </div>
 */

(function () {
  'use strict';

  var OC_FAQ_VERSION = '1.0.0';

  // ─── Constants ────────────────────────────────────────────────────────────

  var FAQ_ITEM_SELECTOR   = '.oc-faq-item';
  var FAQ_LIST_SELECTOR   = '.oc-faq-list';
  var SCHEMA_SCRIPT_ID    = 'oc-faq-schema';
  var DEFAULT_STATE       = 'national';

  // ─── Utility ──────────────────────────────────────────────────────────────

  function getActiveState() {
    return (document.body.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
  }

  function getAllFaqItems() {
    return Array.prototype.slice.call(document.querySelectorAll(FAQ_ITEM_SELECTOR));
  }

  function getQuestionText(item) {
    var summary = item.querySelector('summary, .oc-faq-q, [data-faq-question]');
    return summary ? summary.textContent.trim() : '';
  }

  function getAnswerText(item) {
    var answer = item.querySelector('.oc-faq-a, [data-faq-answer]');
    return answer ? answer.innerHTML.trim() : '';
  }

  // ─── Core filtering logic ─────────────────────────────────────────────────

  /**
   * Apply state-aware FAQ visibility.
   *
   * Rules:
   * 1. Collect all items for the active state
   * 2. Note their question-numbers -- these override national versions
   * 3. Show national items UNLESS overridden by state-specific item
   * 4. Show active-state items
   * 5. Hide all other state items
   */
  function applyStateFilter() {
    var activeState = getActiveState();
    var items       = getAllFaqItems();

    if (!items.length) return;

    // Collect question-numbers that have a state-specific override
    var overriddenNumbers = {};
    items.forEach(function (item) {
      var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
      var qNum      = item.getAttribute('data-question-number');
      if (itemState === activeState && itemState !== DEFAULT_STATE && qNum) {
        overriddenNumbers[qNum] = true;
      }
    });

    // Apply visibility
    items.forEach(function (item) {
      var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
      var qNum      = item.getAttribute('data-question-number');
      var show      = false;

      if (itemState === DEFAULT_STATE) {
        // National item: show unless overridden by active state
        show = !overriddenNumbers[qNum];
      } else if (itemState === activeState) {
        // Active state item: always show
        show = true;
      } else {
        // Different state item: always hide
        show = false;
      }

      item.style.display = show ? '' : 'none';
    });

    // Sort visible items by question-number within each FAQ list
    var lists = document.querySelectorAll(FAQ_LIST_SELECTOR);
    Array.prototype.forEach.call(lists, function (list) {
      var visibleItems = Array.prototype.slice.call(
        list.querySelectorAll(FAQ_ITEM_SELECTOR)
      ).filter(function (item) {
        return item.style.display !== 'none';
      });

      visibleItems.sort(function (a, b) {
        var numA = parseInt(a.getAttribute('data-question-number') || '0', 10);
        var numB = parseInt(b.getAttribute('data-question-number') || '0', 10);
        return numA - numB;
      });

      visibleItems.forEach(function (item) {
        list.appendChild(item);
      });
    });

    // Rebuild schema after filter
    buildFaqSchema();
  }

  // ─── Accordion behavior ───────────────────────────────────────────────────

  /**
   * Initialise accordion using native <details>/<summary>.
   * CSS handles the animation. JS only ensures one item open at a time
   * per FAQ list (optional -- remove if multiple open is preferred).
   */
  function initAccordion() {
    var lists = document.querySelectorAll(FAQ_LIST_SELECTOR);
    Array.prototype.forEach.call(lists, function (list) {
      list.addEventListener('click', function (e) {
        var summary = e.target.closest('summary');
        if (!summary) return;
        var clickedDetails = summary.closest('details');
        if (!clickedDetails) return;

        // Close other open details in same list
        var allDetails = list.querySelectorAll('details');
        Array.prototype.forEach.call(allDetails, function (d) {
          if (d !== clickedDetails && d.open) {
            d.open = false;
          }
        });
      });
    });
  }

  // ─── FAQPage JSON-LD schema ───────────────────────────────────────────────

  /**
   * Build FAQPage schema from currently visible FAQ items.
   * Includes all visible items (national baseline for national state,
   * merged national + state for state-specific view).
   * Replaces existing schema block on re-run.
   */
  function buildFaqSchema() {
    var items = getAllFaqItems().filter(function (item) {
      return item.style.display !== 'none';
    });

    if (!items.length) return;

    var entities = items.map(function (item) {
      var q = getQuestionText(item);
      var a = getAnswerText(item);
      if (!q || !a) return null;
      return {
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': a.replace(/<[^>]+>/g, '').trim()
        }
      };
    }).filter(Boolean);

    if (!entities.length) return;

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': entities
    };

    // Remove existing schema block
    var existing = document.getElementById(SCHEMA_SCRIPT_ID);
    if (existing) existing.parentNode.removeChild(existing);

    // Inject new schema block
    var script = document.createElement('script');
    script.id   = SCHEMA_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  // ─── CSS injection ────────────────────────────────────────────────────────

  /**
   * Inject accordion and FAQ styles natively.
   * Applied once at init. Uses Olive Cover brand tokens.
   */
  function injectStyles() {
    if (document.getElementById('oc-faq-styles')) return;

    var css = [
      /* FAQ section */
      '.oc-faq-list { display: flex; flex-direction: column; margin-top: 32px; }',

      /* FAQ item */
      '.oc-faq-item { border-bottom: 1px solid rgba(27,58,92,0.12); }',
      '.oc-faq-item:first-child { border-top: 1px solid rgba(27,58,92,0.12); }',

      /* details/summary reset */
      '.oc-faq-item details { cursor: pointer; }',
      '.oc-faq-item details summary { list-style: none; }',
      '.oc-faq-item details summary::-webkit-details-marker { display: none; }',

      /* Summary row */
      '.oc-faq-q {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: flex-start;',
      '  gap: 16px;',
      '  padding: 20px 0;',
      '  font-family: "Playfair Display", Georgia, serif;',
      '  font-size: 1.05rem;',
      '  font-weight: 600;',
      '  line-height: 1.4;',
      '  color: #1B3A5C;',
      '  cursor: pointer;',
      '  user-select: none;',
      '}',

      /* Plus/minus icon */
      '.oc-faq-q::after {',
      '  content: "+";',
      '  font-size: 1.5rem;',
      '  font-weight: 300;',
      '  color: #B8934A;',
      '  flex-shrink: 0;',
      '  line-height: 1;',
      '  transition: transform 0.2s ease;',
      '}',
      'details[open] .oc-faq-q::after { content: "\u2212"; }',

      /* Answer panel */
      '.oc-faq-a {',
      '  padding: 0 24px 20px 0;',
      '  font-family: Inter, system-ui, sans-serif;',
      '  font-size: 0.95rem;',
      '  line-height: 1.75;',
      '  color: #374151;',
      '  max-width: 72ch;',
      '}',
      '.oc-faq-a p { margin: 0 0 12px; }',
      '.oc-faq-a p:last-child { margin-bottom: 0; }',
      '.oc-faq-a a { color: #B8934A; text-decoration: underline; }',
      '.oc-faq-a strong { color: #1B3A5C; }',

      /* Smooth open/close animation */
      'details .oc-faq-a {',
      '  overflow: hidden;',
      '  animation: oc-faq-open 0.2s ease;',
      '}',
      '@keyframes oc-faq-open {',
      '  from { opacity: 0; transform: translateY(-4px); }',
      '  to   { opacity: 1; transform: translateY(0); }',
      '}',

      /* Empty state */
      '.oc-faq-empty {',
      '  font-family: Inter, system-ui, sans-serif;',
      '  font-size: 0.9rem;',
      '  color: #6B7280;',
      '  font-style: italic;',
      '  padding: 16px 0;',
      '}',

      /* Mobile */
      '@media (max-width: 767px) {',
      '  .oc-faq-q { font-size: 0.98rem; padding: 16px 0; }',
      '  .oc-faq-a { font-size: 0.9rem; }',
      '}',
    ].join('\n');

    var style = document.createElement('style');
    style.id   = 'oc-faq-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── Empty state handling ─────────────────────────────────────────────────

  function handleEmptyStates() {
    var lists = document.querySelectorAll(FAQ_LIST_SELECTOR);
    Array.prototype.forEach.call(lists, function (list) {
      var visible = Array.prototype.slice.call(
        list.querySelectorAll(FAQ_ITEM_SELECTOR)
      ).filter(function (item) {
        return item.style.display !== 'none';
      });

      var existing = list.querySelector('.oc-faq-empty');
      if (!visible.length) {
        if (!existing) {
          var msg = document.createElement('p');
          msg.className   = 'oc-faq-empty';
          msg.textContent = 'No questions found for this topic.';
          list.appendChild(msg);
        }
      } else {
        if (existing) existing.parentNode.removeChild(existing);
      }
    });
  }

  // ─── State change listener ────────────────────────────────────────────────

  /**
   * Listen for state change events fired by ocnav-complete.
   * ocnav-complete fires: window.dispatchEvent(new CustomEvent('oc:statechange', { detail: { state: 'georgia' } }))
   */
  function listenForStateChanges() {
    window.addEventListener('oc:statechange', function (e) {
      applyStateFilter();
      handleEmptyStates();
    });

    // Also watch for body data-state attribute changes as fallback
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === 'data-state') {
            applyStateFilter();
            handleEmptyStates();
          }
        });
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['data-state'] });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    if (!document.querySelectorAll(FAQ_LIST_SELECTOR).length) return;

    injectStyles();
    initAccordion();
    applyStateFilter();
    handleEmptyStates();
    listenForStateChanges();

    // Expose version
    window.OC = window.OC || {};
    window.OC.faq = { version: OC_FAQ_VERSION };
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
