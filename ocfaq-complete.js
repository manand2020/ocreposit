/**
* ocfaq-complete.js v2.4.0
* Olive Cover FAQ rendering engine
*
* What changed in v2.4.0 (2026-06-07):
* - Added FAQ detail page quick-answer module. On /faq/{slug} pages, fetches
*   faq-index.json (now includes sa=short-answer field), finds the entry for
*   the current slug, and injects a styled "Quick answer" callout between the
*   h1 question and the full answer body. No Designer changes needed.
*
* What changed in v2.3.0 (2026-05-24):
* - Hub search now searches across ALL FAQs in the collection (494 items), not just
*   the ~34 link rows rendered on /faq. New module: load faq-index.json from
*   jsDelivr (manand2020/ocreposit@main/faq-index.json), then on each keystroke
*   filter both the featured 34 rows AND the full index. Cross-FAQ matches are
*   listed under a "More matching questions" heading at the bottom of the hub,
*   linking to /faq/{slug}. Matches in the featured groups are de-duped.
*
* What changed in v2.2.0:
* - Replaced API-driven hub module with DOM-based search.
*   Prior version fetched from api.webflow.com which is blocked by CORS
*   in browser context, causing "Search all 0 questions" placeholder.
*   New module reads .oc-faq-group / .oc-faq-link-row from existing static DOM.
*   No API calls, no CORS issues.
*
* What changed in v1.1.2:
* - Removed border lines between FAQ accordion items (no top or bottom borders)
*
* What changed in v1.1.1:
* - handleEmptyStates() now distinguishes between:
* (a) list has zero .w-dyn-item rows total (CMS returned nothing OR Webflow
* "Empty State" placeholder is showing) -- suppress "No questions found"
* (b) list has items but all filtered out by state -- show "No questions
* found for this topic" (correct behaviour, state switcher context)
* - Placeholder detection: if all visible items contain "FAQ Question" text,
* treat the list as unbound and show nothing rather than the empty message
* - getFaqLists() dedup now uses el.id || el.className || index fallback so
* anonymous divs with identical classes are not dropped
*
* v2.1.0 changes from v1.2.0:
* - Fixed pre-existing syntax error: removed orphan IIFE wrapper at hub-search section.
* - Consolidated ocfaqshort: FAQ short-format renderer plus its CSS.
* - Consolidated ocfaqkill: page-level FAQ section killer.
* - Removed standalone CSS rule that hid all native HTML disclosure widgets globally.
* That rule was breaking mobile nav and any other intentional disclosure widget use.
*/
(function () {
'use strict';

// FAQ accordion runs on /faq only
if (window.location.pathname !== '/faq') return;

var OC_FAQ_VERSION = '1.1.2';
var FAQ_ITEM_CLASS = 'oc-faq-item';
var FAQ_ITEM_SEL = '.' + FAQ_ITEM_CLASS;
var FAQ_Q_CLASS = 'oc-faq-q';
var FAQ_A_CLASS = 'oc-faq-a';
var SCHEMA_SCRIPT_ID = 'oc-faq-schema';
var DEFAULT_STATE = 'national';

function getActiveState() {
return (document.body.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
}

function getAllFaqItems() {
return Array.prototype.slice.call(document.querySelectorAll(FAQ_ITEM_SEL));
}

function getFaqLists() {
var byClass = Array.prototype.slice.call(document.querySelectorAll('.oc-faq-list'));
var byId = Array.prototype.slice.call(document.querySelectorAll('[id*="faq-list"]'));
var seen = new Set ? new Set() : null;
var seenArr = [];
function isSeen(el) {
if (seen) { if (seen.has(el)) return true; seen.add(el); return false; }
if (seenArr.indexOf(el) !== -1) return true;
seenArr.push(el);
return false;
}
return byClass.concat(byId).filter(function (el) { return !isSeen(el); });
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

function isPlaceholderText(text) {
var t = text.trim();
return t === 'FAQ Question' || t === 'FAQ Answer' || t === '';
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
var items = getAllFaqItems();
if (!items.length) return;

var overriddenNumbers = {};
items.forEach(function (item) {
var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
var qNum = item.getAttribute('data-question-number');
if (itemState === activeState && itemState !== DEFAULT_STATE && qNum)
overriddenNumbers[qNum] = true;
});

items.forEach(function (item) {
var itemState = (item.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
var qNum = item.getAttribute('data-question-number');
var show;
if (!itemState || itemState === DEFAULT_STATE) {
show = !overriddenNumbers[qNum];
} else if (itemState === activeState) {
show = true;
} else {
show = false;
}
var row = item.closest('.w-dyn-item') || item;
row.style.display = show ? '' : 'none';
});

getFaqLists().forEach(function (list) {
var rows = Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item')).filter(function (row) {
return row.style.display !== 'none';
});
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
if (!q || !a || isPlaceholderText(q) || isPlaceholderText(a)) return null;
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

function injectStyles() {
if (document.getElementById('oc-faq-styles')) return;
var css = [
'.oc-faq-list, [id*="faq-list"] { display: flex; flex-direction: column; }',
'.oc-faq-item { }',
'.oc-faq-item:first-child { }',
'.oc-faq-item details { cursor: pointer; }',
'.oc-faq-item details summary { list-style: none; }',
'.oc-faq-item details summary::-webkit-details-marker { display: none; }',
'.oc-faq-q { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px 0; font-family: "Playfair Display", Georgia, serif; font-size: 1.05rem; font-weight: 600; line-height: 1.4; color: #1B3A5C; cursor: pointer; user-select: none; }',
'.oc-faq-q::after { content: "+"; font-size: 1.5rem; font-weight: 300; color: #B8934A; flex-shrink: 0; line-height: 1; margin-top: 2px; transition: transform 0.2s ease; }',
'details[open] .oc-faq-q::after { content: "−"; color: #B8934A; }',
'.oc-faq-a { padding: 0 24px 20px 0; font-family: Inter, system-ui, sans-serif; font-size: 0.95rem; line-height: 1.75; color: #374151; max-width: 72ch; }',
'.oc-faq-a p { margin: 0 0 12px; } .oc-faq-a p:last-child { margin-bottom: 0; }',
'.oc-faq-a a { color: #B8934A; text-decoration: underline; } .oc-faq-a strong { color: #1B3A5C; }',
'details[open] .oc-faq-a { animation: oc-faq-open 0.2s ease; }',
'@keyframes oc-faq-open { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }',
'.oc-faq-empty { font-family: Inter, system-ui, sans-serif; font-size: 0.9rem; color: #6B7280; font-style: italic; padding: 16px 0; }',
'@media (max-width: 767px) { .oc-faq-q { font-size: 0.95rem; padding: 16px 0; } .oc-faq-a { font-size: 0.9rem; padding-bottom: 16px; } }',
].join('\n');
var style = document.createElement('style');
style.id = 'oc-faq-styles';
style.textContent = css;
document.head.appendChild(style);
}

function handleEmptyStates() {
getFaqLists().forEach(function (list) {
var allRows = Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item'));
var visibleRows = allRows.filter(function (row) { return row.style.display !== 'none'; });
var existing = list.querySelector('.oc-faq-empty');

if (!allRows.length) {
if (existing) existing.parentNode.removeChild(existing);
return;
}

var allPlaceholders = visibleRows.length > 0 && visibleRows.every(function (row) {
var item = row.querySelector(FAQ_ITEM_SEL);
if (!item) return true;
return isPlaceholderText(getQuestionText(item));
});
if (allPlaceholders) {
if (existing) existing.parentNode.removeChild(existing);
return;
}

if (!visibleRows.length) {
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

function listenForStateChanges() {
window.addEventListener('oc:statechange', function () {
applyStateFilter();
handleEmptyStates();
});
if (typeof MutationObserver !== 'undefined') {
var obs = new MutationObserver(function (mutations) {
mutations.forEach(function (m) {
if (m.attributeName === 'data-state') {
applyStateFilter();
handleEmptyStates();
}
});
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
window.OC = window.OC || {};
window.OC.faq = { version: OC_FAQ_VERSION };
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
})();

/* ============================================================
* HUB SEARCH MODULE - /faq only, DOM-based (no API, no CORS)
* v1.1.0 -- reads .oc-faq-group / .oc-faq-link-row from static DOM
* ============================================================ */

/**
* Searches existing .oc-faq-group / .oc-faq-link-row elements.
* Does not call the Webflow CMS API (which is blocked by CORS in
* browser context). Works entirely from the rendered page DOM.
*/
(function () {
'use strict';
if (window.location.pathname !== '/faq') return;

function injectCss() {
if (document.getElementById('oc-fh-css')) return;
var s = document.createElement('style');
s.id = 'oc-fh-css';
s.textContent =
'.oc-fh-sw{position:relative;margin-bottom:24px}' +
'.oc-fh-si{width:100%;padding:13px 44px 13px 16px;border:1.5px solid rgba(27,58,92,.18);border-radius:10px;font-size:.95rem;font-family:Inter,system-ui,sans-serif;color:#1B3A5C;background:#fff;outline:none;box-sizing:border-box;transition:border-color .2s}' +
'.oc-fh-si:focus{border-color:#B8934A}' +
'.oc-fh-sico{position:absolute;right:13px;top:50%;transform:translateY(-50%);color:rgba(27,58,92,.35);pointer-events:none;font-size:1rem}' +
'.oc-fh-no-results{font-family:Inter,system-ui,sans-serif;font-size:.9rem;color:rgba(27,58,92,.5);padding:12px 0;display:none}' +
'.oc-fh-extra{margin-top:28px;padding-top:24px;border-top:1px solid rgba(27,58,92,.12);display:none}' +
'.oc-fh-extra-h{font-family:"Playfair Display",Georgia,serif;font-size:1.1rem;color:#1B3A5C;margin:0 0 14px;font-weight:600}' +
'.oc-fh-extra-list{list-style:none;padding:0;margin:0}' +
'.oc-fh-extra-row{padding:10px 0;border-bottom:1px solid rgba(27,58,92,.08);font-family:Inter,system-ui,sans-serif;font-size:.92rem;line-height:1.5}' +
'.oc-fh-extra-row:last-child{border-bottom:none}' +
'.oc-fh-extra-row a{color:#1B3A5C;text-decoration:none;font-weight:500}' +
'.oc-fh-extra-row a:hover{color:#B8934A;text-decoration:underline}' +
'.oc-fh-extra-cat{display:inline-block;font-size:.72rem;color:#B8934A;background:rgba(184,147,74,.08);border:1px solid rgba(184,147,74,.25);border-radius:4px;padding:2px 8px;margin-right:10px;text-transform:uppercase;letter-spacing:.04em;font-weight:600;vertical-align:middle}';
document.head.appendChild(s);
}

// Full FAQ index lives at jsDelivr (494 items); fetched once and cached.
var FAQ_INDEX_URL = 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/faq-index.json';
var __faqIndex = null;
var __faqIndexPending = null;

function loadFaqIndex() {
if (__faqIndex) return Promise.resolve(__faqIndex);
if (__faqIndexPending) return __faqIndexPending;
__faqIndexPending = fetch(FAQ_INDEX_URL, { cache: 'force-cache' })
.then(function (r) { return r.ok ? r.json() : []; })
.then(function (data) { __faqIndex = data; return data; })
.catch(function () { __faqIndex = []; return []; });
return __faqIndexPending;
}

function searchAllFaqs(q, max) {
if (!__faqIndex || !q || q.length < 2) return [];
var lower = q.toLowerCase();
var results = [];
for (var i = 0; i < __faqIndex.length && results.length < max; i++) {
var it = __faqIndex[i];
if ((it.q || '').toLowerCase().indexOf(lower) >= 0 ||
    (it.a || '').toLowerCase().indexOf(lower) >= 0) {
results.push(it);
}
}
return results;
}

function init() {
var hub = document.querySelector('[data-hub="faq"]');
if (!hub) return;

var groups = Array.prototype.slice.call(hub.querySelectorAll('.oc-faq-group'));
if (!groups.length) return;

injectCss();
loadFaqIndex();

var sw = document.createElement('div');
sw.className = 'oc-fh-sw';
sw.innerHTML =
'<input class="oc-fh-si" id="oc-fh-si" type="text"' +
' placeholder="Search FAQs"' +
' autocomplete="off">' +
'<span class="oc-fh-sico">&#128269;</span>';
hub.insertBefore(sw, hub.firstChild);

var noRes = document.createElement('p');
noRes.className = 'oc-fh-no-results';
noRes.textContent = 'No questions found. Try different words.';
sw.parentNode.insertBefore(noRes, sw.nextSibling);

// Extra results container (full-FAQ-index hits)
var extra = document.createElement('div');
extra.className = 'oc-fh-extra';
extra.innerHTML =
'<h3 class="oc-fh-extra-h">More matching questions</h3>' +
'<ul class="oc-fh-extra-list" id="oc-fh-extra-list"></ul>';
hub.appendChild(extra);
var extraList = document.getElementById('oc-fh-extra-list');

// Track which slugs are already shown in the featured groups (avoid duplicates)
var featuredSlugs = {};
groups.forEach(function (group) {
group.querySelectorAll('.oc-faq-link-row').forEach(function (link) {
var a = link.querySelector('a');
var href = a ? a.getAttribute('href') : '';
if (href) {
var slug = href.split('/').pop();
if (slug) featuredSlugs[slug.toLowerCase()] = true;
}
// Fallback: scan text content for slug
var slugEl = link.querySelector('.oc-faq-slug');
if (slugEl) featuredSlugs[slugEl.textContent.trim().toLowerCase()] = true;
});
});

function render(q) {
var lower = q.toLowerCase().trim();
var anyVisibleInFeatured = false;
groups.forEach(function (group) {
var links = Array.prototype.slice.call(group.querySelectorAll('.oc-faq-link-row'));
var groupHasMatch = false;
links.forEach(function (link) {
var show = !lower || link.textContent.toLowerCase().indexOf(lower) >= 0;
link.style.display = show ? '' : 'none';
if (show) groupHasMatch = true;
});
group.style.display = (!lower || groupHasMatch) ? '' : 'none';
if (groupHasMatch || !lower) anyVisibleInFeatured = true;
});

// Cross-FAQ-index results
extraList.innerHTML = '';
if (lower && lower.length >= 2) {
var results = searchAllFaqs(lower, 50);
// Filter out any FAQs already shown in featured groups
results = results.filter(function (r) { return !featuredSlugs[(r.s || '').toLowerCase()]; });
if (results.length > 0) {
extra.style.display = 'block';
results.forEach(function (r) {
var li = document.createElement('li');
li.className = 'oc-fh-extra-row';
var catSpan = '';
if (r.c) catSpan = '<span class="oc-fh-extra-cat">' + escapeHtml(r.c) + '</span>';
li.innerHTML = catSpan + '<a href="/faq/' + encodeURIComponent(r.s) + '">' + escapeHtml(r.q) + '</a>';
extraList.appendChild(li);
});
// We have hits in the index — overall has results
anyVisibleInFeatured = true;
} else {
extra.style.display = 'none';
}
} else {
extra.style.display = 'none';
}

noRes.style.display = (lower && !anyVisibleInFeatured) ? 'block' : 'none';
}

function escapeHtml(s) {
return String(s).replace(/[&<>"']/g, function (c) {
return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
});
}

// Debounce search input
var debounceTimer = null;
document.getElementById('oc-fh-si').addEventListener('input', function () {
var val = this.value;
clearTimeout(debounceTimer);
debounceTimer = setTimeout(function () {
loadFaqIndex().then(function () { render(val); });
}, 80);
});
}

document.readyState === 'loading'
? document.addEventListener('DOMContentLoaded', init)
: init();

window.OC = window.OC || {};
window.OC.faqHub = { version: '1.2.0' };
})();

/* ============================================================
* v2.1.0 CONSOLIDATED MODULES (folded from standalone scripts)
* ============================================================ */

(function(){var V='2.0.0',path=window.location.pathname;if(path==='/faq'||path.indexOf('/faq/')===0)return;var DS='national';function gs(){return(document.body.getAttribute('data-state')||DS).toLowerCase();}function getLists(){var a=Array.prototype.slice.call(document.querySelectorAll('.oc-faq-list')),b=Array.prototype.slice.call(document.querySelectorAll('[id$="-faq-list"]')),seen={};return a.concat(b).filter(function(el){var k=el.id||el.className;if(seen[k])return false;seen[k]=true;return true;});}function getQ(item){var el=item.querySelector('summary')||item.querySelector('.oc-faq-q');return el?el.textContent.trim():'';}function getSA(item){var el=item.querySelector('.oc-faq-short');var t=el?el.textContent.trim():'';if(t)return t;var ae=item.querySelector('.oc-faq-a');if(!ae)return'';var f=ae.textContent.trim();var d=f.indexOf('. ');return d>0?f.substring(0,d+1):f.substring(0,120);}function getSlug(item){var el=item.querySelector('.oc-faq-slug');return el?el.textContent.trim():'';}function isP(t){return!t||t==='FAQ Question'||t==='FAQ Answer';}function css(){if(document.getElementById('oc-fqs'))return;var s=document.createElement('style');s.id='oc-fqs';s.textContent='.oc-faq-short-item{padding:18px 0;border-bottom:1px solid rgba(27,58,92,.1)}.oc-faq-short-item:last-child{border-bottom:none}.oc-faq-short-q{font-family:"Playfair Display",Georgia,serif;font-size:1.05rem;font-weight:600;color:#1B3A5C;margin:0 0 6px;line-height:1.4}.oc-faq-short-a{font-family:Inter,system-ui,sans-serif;font-size:.9rem;color:#374151;line-height:1.65;margin:0 0 8px;background:transparent!important;padding:0!important}.oc-faq-short-link{font-family:Inter,system-ui,sans-serif;font-size:.82rem;font-weight:600;color:#B8934A;text-decoration:none}.oc-faq-a{display:none!important}.oc-faq-placeholder{display:none!important}';document.head.appendChild(s);}function render(){var activeState=gs();getLists().forEach(function(list){var dis=Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item'));if(!dis.length)return;list.querySelectorAll('.oc-faq-short-list').forEach(function(el){el.parentNode.removeChild(el);});dis.forEach(function(di){di.style.display='';});var cont=document.createElement('div');cont.className='oc-faq-short-list';var n=0;dis.forEach(function(di){var item=di.querySelector('.oc-faq-item')||di;var st=(item.getAttribute('data-state')||DS).toLowerCase();if(st!==DS&&st!==activeState)return;var q=getQ(item),a=getSA(item),sl=getSlug(item);if(isP(q)||!q)return;var row=document.createElement('div');row.className='oc-faq-short-item';var qEl=document.createElement('p');qEl.className='oc-faq-short-q';qEl.textContent=q;row.appendChild(qEl);if(a&&!isP(a)){var aEl=document.createElement('p');aEl.className='oc-faq-short-a';aEl.textContent=a;row.appendChild(aEl);}if(sl){var lk=document.createElement('a');lk.className='oc-faq-short-link';lk.href='/faq/'+sl;lk.textContent='Read full answer →';row.appendChild(lk);}cont.appendChild(row);n++;});if(n>0){dis.forEach(function(di){di.style.display='none';});list.appendChild(cont);}});}function init(){css();render();window.addEventListener('oc:statechange',render);}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();window.OC=window.OC||{};window.OC.faq={version:V};})();

(function(){var p=window.location.pathname;if(p==='/faq'||p.startsWith('/faq/'))return;function h(){['#ins-faq','#car-faq','#about-faq','#wwdb-faq'].forEach(function(s){var el=document.querySelector(s);if(el){el.style.cssText='display:none!important';el.setAttribute('aria-hidden','true');}});}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',h):h();})();

/* ============================================================
 * FAQ DETAIL: Quick-answer callout
 * v2.4.0 -- runs on /faq/{slug} only
 * Loads faq-index.json (includes sa=short-answer), injects a
 * "Quick answer" block between the h1 question and full answer.
 * ============================================================ */
(function(){
'use strict';
var path=window.location.pathname;
if(path==='/faq'||path.indexOf('/faq/')!==0)return;
var slug=path.replace(/^\/faq\//,'').replace(/\/+$/,'').toLowerCase();
if(!slug)return;
var IDX='https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/faq-index.json';
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function css(){if(document.getElementById('oc-fqd-css'))return;var s=document.createElement('style');s.id='oc-fqd-css';s.textContent='.oc-faq-quick{background:#F9F5ED;border-left:3px solid #B8934A;border-radius:0 6px 6px 0;padding:14px 20px;margin:0 0 28px}.oc-faq-quick-lbl{font-family:Inter,system-ui,sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#B8934A;margin:0 0 5px}.oc-faq-quick-txt{font-family:Inter,system-ui,sans-serif;font-size:.97rem;line-height:1.7;color:#1B3A5C;margin:0;font-weight:500}';document.head.appendChild(s);}
function inject(sa){if(!sa||document.querySelector('.oc-faq-quick'))return;var h1=document.querySelector('#faq-item h1');if(!h1)return;var ans=h1.nextElementSibling;if(!ans)return;css();var box=document.createElement('div');box.className='oc-faq-quick';box.innerHTML='<p class="oc-faq-quick-lbl">Quick answer</p><p class="oc-faq-quick-txt">'+esc(sa)+'</p>';h1.parentNode.insertBefore(box,ans);}
function run(){fetch(IDX,{cache:'force-cache'}).then(function(r){return r.ok?r.json():[];}).then(function(idx){for(var i=0;i<idx.length;i++){if((idx[i].s||'').toLowerCase()===slug){inject(idx[i].sa||idx[i].a||'');return;}}}).catch(function(){});}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run):run();
})();
