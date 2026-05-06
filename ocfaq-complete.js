/**
 * ocfaq-complete.js v2.1.0
 * Olive Cover FAQ rendering engine
 *
 * What changed in v1.1.2:
 * - Removed border lines between FAQ accordion items (no top or bottom borders)
 *
 * What changed in v1.1.1:
 * - handleEmptyStates() now distinguishes between:
 *   (a) list has zero .w-dyn-item rows total (CMS returned nothing OR Webflow
 *       "Empty State" placeholder is showing) -- suppress "No questions found"
 *   (b) list has items but all filtered out by state -- show "No questions
 *       found for this topic" (correct behaviour, state switcher context)
 * - Placeholder detection: if all visible items contain "FAQ Question" text,
 *   treat the list as unbound and show nothing rather than the empty message
 * - getFaqLists() dedup now uses el.id || el.className || index fallback so
 *   anonymous divs with identical classes are not dropped
 
 *
 * v2.1.0 changes from v1.2.0:
 * - Fixed pre-existing syntax error: removed orphan IIFE wrapper at hub-search section.
 * - Consolidated ocfaqshort: FAQ short-format renderer plus its CSS.
 * - Consolidated ocfaqkill: page-level FAQ section killer.
 * - Removed standalone CSS rule that hid all native HTML disclosure widgets globally.
 *   That rule was breaking mobile nav and any other intentional disclosure widget use.
 */
(function () {
  'use strict';

  // FAQ disabled on all pages except /faq
  if (window.location.pathname !== '/faq') return;


  var OC_FAQ_VERSION   = '1.1.2';
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
    script.id   = SCHEMA_SCRIPT_ID;
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
    style.id = 'oc-faq-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function handleEmptyStates() {
    getFaqLists().forEach(function (list) {
      var allRows     = Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item'));
      var visibleRows = allRows.filter(function (row) { return row.style.display !== 'none'; });
      var existing    = list.querySelector('.oc-faq-empty');

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
          msg.className   = 'oc-faq-empty';
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
 * HUB SEARCH MODULE - runs on /faq only
 * ============================================================ */

  /**
 * ocfaqhub-complete.js v1.0.1
 * Olive Cover FAQ Hub - categorized, filterable accordion
 * Only runs on /faq
 */
(function(){
'use strict';
if(window.location.pathname!=='/faq')return;
var API_TOKEN='f1cd7b01d876bdaf90c167f7211fdb9b88f05cd75dd50b194f874a4a4d8fe042';
var COLLECTION_ID='69e2c7f90ef88a50c39b2bc2';
var CAT={'5690ed6ed87ac8820f7ab5cb9ab3acbf':'Homeowners','65328be1d7a01cdc461bc9b8c6fc1be8':'Auto','777a0ae004cf168b861eb5756a5b2fd4':'Umbrella','ab9e5948dead49e054c94b03f59142e7':'Motorcycle','c51e68a01eac651b38b9b4c9e8146725':'Boat','357486fa26d16ed6642f3c6a24b4279e':'Collector Auto','cd826588b60db5083028cb2df78ac7a9':'Scheduled Articles','c7b989ec066929a3382212c952cd4881':'Renters','bd21ea859d216417bc2b20cc4dc818f9':'Flood','2a99ce0a73b6babb24a7b495915fa79c':'Landlord','458fdc6e1c7765e221233daed68dddd9':'Cyber','4e498b83aff7e1b4c6ebfc0d79d7c124':'Commercial','7599a9aca4f4ef5a57f563f239f76129':'Carriers','6db64e32d08a9adb88a8c54601c3898b':'Local','088f524bb9e5ff0cc66827025a88b903':'State','3946d154b8a6ada3f97e695dff362f32':'General','a1be0afc37960b1aadbd9658ccefcd7d':'BOP','7c8423df7324303aff1b9333e48238a3':'General Liability','ece5b107bf5b29bd04721981c679ce71':'Workers Comp','e1ae54e9f3d0973f2e3fd31d109708a3':'Commercial Auto','1f7064b9a6ed3ed9cc816dbaccbf4afe':'Professional Liability','acd84502c34242c718c55ae77a57d37f':'Management Liability','75fe14af74fd52873ac438f59c34a72e':'Commercial Property'};
var CAT_ORDER=['5690ed6ed87ac8820f7ab5cb9ab3acbf','65328be1d7a01cdc461bc9b8c6fc1be8','bd21ea859d216417bc2b20cc4dc818f9','777a0ae004cf168b861eb5756a5b2fd4','c7b989ec066929a3382212c952cd4881','2a99ce0a73b6babb24a7b495915fa79c','cd826588b60db5083028cb2df78ac7a9','a1be0afc37960b1aadbd9658ccefcd7d','7c8423df7324303aff1b9333e48238a3','ece5b107bf5b29bd04721981c679ce71','e1ae54e9f3d0973f2e3fd31d109708a3','1f7064b9a6ed3ed9cc816dbaccbf4afe','acd84502c34242c718c55ae77a57d37f','75fe14af74fd52873ac438f59c34a72e','458fdc6e1c7765e221233daed68dddd9','7599a9aca4f4ef5a57f563f239f76129','4e498b83aff7e1b4c6ebfc0d79d7c124','ab9e5948dead49e054c94b03f59142e7','c51e68a01eac651b38b9b4c9e8146725','357486fa26d16ed6642f3c6a24b4279e','3946d154b8a6ada3f97e695dff362f32','6db64e32d08a9adb88a8c54601c3898b','088f524bb9e5ff0cc66827025a88b903'];
var PERSONAL=['5690ed6ed87ac8820f7ab5cb9ab3acbf','65328be1d7a01cdc461bc9b8c6fc1be8','bd21ea859d216417bc2b20cc4dc818f9','777a0ae004cf168b861eb5756a5b2fd4','c7b989ec066929a3382212c952cd4881','2a99ce0a73b6babb24a7b495915fa79c','cd826588b60db5083028cb2df78ac7a9','ab9e5948dead49e054c94b03f59142e7','c51e68a01eac651b38b9b4c9e8146725','357486fa26d16ed6642f3c6a24b4279e'];
var S={filter:'all',search:'',openId:null};
var ALL=[];
function css(){if(document.getElementById('oc-fh-css'))return;var s=document.createElement('style');s.id='oc-fh-css';s.textContent='#oc-faq-hub{font-family:Inter,system-ui,sans-serif;padding:40px 0 80px}.oc-fh-sw{position:relative;margin-bottom:24px}.oc-fh-si{width:100%;padding:13px 44px 13px 16px;border:1.5px solid rgba(27,58,92,.18);border-radius:10px;font-size:.95rem;font-family:Inter,system-ui,sans-serif;color:#1B3A5C;background:#fff;outline:none;box-sizing:border-box;transition:border-color .2s}.oc-fh-si:focus{border-color:#B8934A}.oc-fh-sico{position:absolute;right:13px;top:50%;transform:translateY(-50%);color:rgba(27,58,92,.35);pointer-events:none}.oc-fh-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px}.oc-fh-pill{padding:7px 15px;border-radius:100px;border:1.5px solid rgba(27,58,92,.2);background:#fff;color:#1B3A5C;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap;font-family:Inter,system-ui,sans-serif}.oc-fh-pill:hover{border-color:#1B3A5C;background:#eef2f6}.oc-fh-pill.active{background:#1B3A5C;border-color:#1B3A5C;color:#fff}.oc-fh-glabel{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#B8934A;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid rgba(27,58,92,.1)}.oc-fh-group{margin-bottom:36px}.oc-fh-catsec{margin-bottom:24px}.oc-fh-cattitle{font-family:"Playfair Display",Georgia,serif;font-size:1rem;font-weight:700;color:#1B3A5C;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:11px 15px;background:#f7f5f1;border-radius:8px;user-select:none;margin:0}.oc-fh-cattitle:hover{background:#f0ece4}.oc-fh-catct{font-size:.75rem;font-weight:600;color:#B8934A;background:rgba(184,147,74,.1);padding:2px 8px;border-radius:100px;margin-left:6px;flex-shrink:0}.oc-fh-chev{font-size:.75rem;color:rgba(27,58,92,.4);transition:transform .2s;flex-shrink:0;margin-left:8px}.oc-fh-chev.open{transform:rotate(180deg)}.oc-fh-items{display:none}.oc-fh-items.open{display:block}.oc-fh-item{border-bottom:1px solid rgba(27,58,92,.07)}.oc-fh-item:last-child{border-bottom:none}.oc-fh-q{padding:15px 0;cursor:pointer;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.oc-fh-qt{font-size:.9rem;font-weight:600;color:#1B3A5C;line-height:1.45;flex:1}.oc-fh-tog{flex-shrink:0;width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(27,58,92,.25);display:flex;align-items:center;justify-content:center;color:rgba(27,58,92,.45);font-size:.65rem;transition:all .18s;margin-top:3px}.oc-fh-item.open .oc-fh-tog{background:#1B3A5C;border-color:#1B3A5C;color:#fff;transform:rotate(45deg)}.oc-fh-a{display:none;padding:0 0 16px;font-size:.875rem;line-height:1.75;color:#374151}.oc-fh-item.open .oc-fh-a{display:block}.oc-fh-empty{padding:40px 0;text-align:center;color:rgba(27,58,92,.45);font-size:.9rem}.oc-fh-loading{padding:48px 0;text-align:center;color:rgba(27,58,92,.45)}.oc-fh-spin{display:inline-block;width:26px;height:26px;border:3px solid rgba(27,58,92,.1);border-top-color:#B8934A;border-radius:50%;animation:oc-fh-spin .7s linear infinite;margin-bottom:10px}@keyframes oc-fh-spin{to{transform:rotate(360deg)}}.oc-fh-rc{font-size:.8rem;color:rgba(27,58,92,.45);margin-bottom:16px}mark.oc-fh-hl{background:rgba(184,147,74,.2);color:inherit;border-radius:2px;padding:0 2px}@media(max-width:600px){.oc-fh-pill{font-size:.76rem;padding:6px 11px}.oc-fh-qt{font-size:.855rem}}';document.head.appendChild(s);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function hl(t,q){if(!q)return esc(t);var re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');return esc(t).replace(re,'<mark class="oc-fh-hl">$1</mark>');}
function fetch_all(offset,acc,cb){acc=acc||[];offset=offset||0;fetch('https://api.webflow.com/v2/collections/'+COLLECTION_ID+'/items?limit=100&offset='+offset,{headers:{'Authorization':'Bearer '+API_TOKEN,'accept':'application/json'}}).then(function(r){return r.json();}).then(function(d){var items=d.items||[];acc=acc.concat(items);if(items.length===100&&acc.length<d.pagination.total){fetch_all(offset+100,acc,cb);}else{cb(acc);}}).catch(function(){cb(acc);});}
function filtered(){var q=S.search.toLowerCase().trim();return ALL.filter(function(f){var fd=f.fieldData;if(S.filter!=='all'&&fd.category!==S.filter)return false;if(q){return(fd.question||'').toLowerCase().indexOf(q)>=0||(fd.answer||'').toLowerCase().indexOf(q)>=0;}return true;});}
function grouped(faqs){var g={};faqs.forEach(function(f){var c=f.fieldData.category||'3946d154b8a6ada3f97e695dff362f32';if(!g[c])g[c]=[];g[c].push(f);});return g;}
function render(){var el=document.getElementById('oc-faq-hub');if(!el)return;var f=filtered(),g=grouped(f),q=S.search.trim();
var ord=CAT_ORDER.filter(function(id){return g[id]&&g[id].length;});Object.keys(g).forEach(function(id){if(ord.indexOf(id)<0)ord.push(id);});
var pcats=ord.filter(function(id){return PERSONAL.indexOf(id)>=0;});
var ccats=ord.filter(function(id){return PERSONAL.indexOf(id)<0;});
var awf=CAT_ORDER.filter(function(id){return ALL.some(function(x){return x.fieldData.category===id;});});
var h='<div class="oc-fh-sw"><input class="oc-fh-si" id="oc-fh-si" type="text" placeholder="Search all '+ALL.length+' questions..." value="'+esc(S.search)+'" autocomplete="off"><span class="oc-fh-sico">&#128269;</span></div>';
h+='<div class="oc-fh-pills"><button class="oc-fh-pill'+(S.filter==='all'?' active':''+'" data-cat="all">All ('+ALL.length+')</button>');
awf.forEach(function(id){var cnt=ALL.filter(function(x){return x.fieldData.category===id;}).length;h+='<button class="oc-fh-pill'+(S.filter===id?' active':'')+('" data-cat="'+id+'">'+(CAT[id]||'Other')+' <span style="opacity:.6;font-weight:400">('+cnt+')</span></button>');});
h+='</div>';
if(q)h+='<p class="oc-fh-rc">'+f.length+' result'+(f.length!==1?'s':'')+' matching &ldquo;'+esc(q)+'&rdquo;</p>';
if(!f.length){h+='<div class="oc-fh-empty">No questions found. Try different words or clear the filter.</div>';}
else{
function rg(label,cats){
if(!cats.length)return'';
var o='<div class="oc-fh-group">';
if(label&&ord.length>1&&S.filter==='all')o+='<p class="oc-fh-glabel">'+label+'</p>';
cats.forEach(function(cid){var items=g[cid]||[];if(!items.length)return;
items.sort(function(a,b){var sa=a.fieldData['sort-order']||999,sb=b.fieldData['sort-order']||999;return sa!==sb?sa-sb:(a.fieldData['faq-number']||0)-(b.fieldData['faq-number']||0);});
var op=S.filter===cid||q?' open':'';
o+='<div class="oc-fh-catsec"><div class="oc-fh-cattitle" data-tc="'+cid+'"><span>'+(CAT[cid]||'Other')+' <span class="oc-fh-catct">'+items.length+'</span></span><span class="oc-fh-chev'+(op?' open':'')+'">&#9660;</span></div>';
o+='<div class="oc-fh-items'+op+'" data-ci="'+cid+'">';
items.forEach(function(f){var fd=f.fieldData,io=S.openId===f.id?' open':'';
o+='<div class="oc-fh-item'+io+'" data-id="'+f.id+'"><div class="oc-fh-q"><span class="oc-fh-qt">'+hl(fd.question,q)+'</span><span class="oc-fh-tog">+</span></div><div class="oc-fh-a">'+hl(fd.answer,q)+'</div></div>';});
o+='</div></div>';});
return o+'</div>';
}
if(S.filter!=='all'){h+=rg('',ord);}else{h+=rg('Personal Lines',pcats);h+=rg('Commercial Lines',ccats);}
}
el.innerHTML=h;bind();}
function bind(){
var si=document.getElementById('oc-fh-si');
if(si)si.addEventListener('input',function(){S.search=this.value;S.openId=null;render();var e=document.getElementById('oc-fh-si');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}});
document.querySelectorAll('.oc-fh-pill').forEach(function(p){p.addEventListener('click',function(){S.filter=this.getAttribute('data-cat');S.openId=null;render();var h=document.getElementById('oc-faq-hub');if(h)h.scrollIntoView({behavior:'smooth',block:'start'});});});
document.querySelectorAll('[data-tc]').forEach(function(el){el.addEventListener('click',function(){var c=this.getAttribute('data-tc'),it=document.querySelector('[data-ci="'+c+'"]'),ch=this.querySelector('.oc-fh-chev');if(it){var o=it.classList.contains('open');it.classList.toggle('open',!o);if(ch)ch.classList.toggle('open',!o);}});});
document.querySelectorAll('.oc-fh-item').forEach(function(item){var q=item.querySelector('.oc-fh-q');if(q)q.addEventListener('click',function(){var id=item.getAttribute('data-id');S.openId=S.openId===id?null:id;render();if(S.search){var e=document.getElementById('oc-fh-si');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}}});});}
function init(){
var el=document.querySelector('[data-hub="faq"]');
if(el){el.id='oc-faq-hub';el.innerHTML='';}
else{el=document.createElement('div');el.id='oc-faq-hub';el.style.cssText='max-width:800px;margin:0 auto;padding:40px 32px 0;';var footer=document.querySelector('.oc-footer,footer');if(footer)footer.insertAdjacentElement('beforebegin',el);else document.body.appendChild(el);}
css();
el.innerHTML='<div class="oc-fh-loading"><div class="oc-fh-spin"></div><br>Loading questions...</div>';
fetch_all(0,[],function(faqs){ALL=faqs.filter(function(f){return!f.isArchived&&!f.isDraft;});render();});}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
window.OC=window.OC||{};window.OC.faqHub={version:'1.0.1'};

})();

/* ============================================================
 * v2.1.0 CONSOLIDATED MODULES (folded from standalone scripts)
 * ============================================================ */

(function(){var V='2.0.0',path=window.location.pathname;if(path==='/faq'||path.indexOf('/faq/')===0)return;var DS='national';function gs(){return(document.body.getAttribute('data-state')||DS).toLowerCase();}function getLists(){var a=Array.prototype.slice.call(document.querySelectorAll('.oc-faq-list')),b=Array.prototype.slice.call(document.querySelectorAll('[id$="-faq-list"]')),seen={};return a.concat(b).filter(function(el){var k=el.id||el.className;if(seen[k])return false;seen[k]=true;return true;});}function getQ(item){var el=item.querySelector('summary')||item.querySelector('.oc-faq-q');return el?el.textContent.trim():'';}function getSA(item){var el=item.querySelector('.oc-faq-short');var t=el?el.textContent.trim():'';if(t)return t;var ae=item.querySelector('.oc-faq-a');if(!ae)return'';var f=ae.textContent.trim();var d=f.indexOf('. ');return d>0?f.substring(0,d+1):f.substring(0,120);}function getSlug(item){var el=item.querySelector('.oc-faq-slug');return el?el.textContent.trim():'';}function isP(t){return!t||t==='FAQ Question'||t==='FAQ Answer';}function css(){if(document.getElementById('oc-fqs'))return;var s=document.createElement('style');s.id='oc-fqs';s.textContent='.oc-faq-short-item{padding:18px 0;border-bottom:1px solid rgba(27,58,92,.1)}.oc-faq-short-item:last-child{border-bottom:none}.oc-faq-short-q{font-family:"Playfair Display",Georgia,serif;font-size:1.05rem;font-weight:600;color:#1B3A5C;margin:0 0 6px;line-height:1.4}.oc-faq-short-a{font-family:Inter,system-ui,sans-serif;font-size:.9rem;color:#374151;line-height:1.65;margin:0 0 8px;background:transparent!important;padding:0!important}.oc-faq-short-link{font-family:Inter,system-ui,sans-serif;font-size:.82rem;font-weight:600;color:#B8934A;text-decoration:none}.oc-faq-a{display:none!important}.oc-faq-placeholder{display:none!important}';document.head.appendChild(s);}function render(){var activeState=gs();getLists().forEach(function(list){var dis=Array.prototype.slice.call(list.querySelectorAll('.w-dyn-item'));if(!dis.length)return;list.querySelectorAll('.oc-faq-short-list').forEach(function(el){el.parentNode.removeChild(el);});dis.forEach(function(di){di.style.display='';});var cont=document.createElement('div');cont.className='oc-faq-short-list';var n=0;dis.forEach(function(di){var item=di.querySelector('.oc-faq-item')||di;var st=(item.getAttribute('data-state')||DS).toLowerCase();if(st!==DS&&st!==activeState)return;var q=getQ(item),a=getSA(item),sl=getSlug(item);if(isP(q)||!q)return;var row=document.createElement('div');row.className='oc-faq-short-item';var qEl=document.createElement('p');qEl.className='oc-faq-short-q';qEl.textContent=q;row.appendChild(qEl);if(a&&!isP(a)){var aEl=document.createElement('p');aEl.className='oc-faq-short-a';aEl.textContent=a;row.appendChild(aEl);}if(sl){var lk=document.createElement('a');lk.className='oc-faq-short-link';lk.href='/faq/'+sl;lk.textContent='Read full answer →';row.appendChild(lk);}cont.appendChild(row);n++;});if(n>0){dis.forEach(function(di){di.style.display='none';});list.appendChild(cont);}});}function init(){css();render();window.addEventListener('oc:statechange',render);}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();window.OC=window.OC||{};window.OC.faq={version:V};})();

(function(){var p=window.location.pathname;if(p==='/faq'||p.startsWith('/faq/'))return;function h(){['#ins-faq','#car-faq','#about-faq','#wwdb-faq'].forEach(function(s){var el=document.querySelector(s);if(el){el.style.cssText='display:none!important';el.setAttribute('aria-hidden','true');}});}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',h):h();})();
