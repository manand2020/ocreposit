/* ocsearch-complete.js v1.0.0
 * Olive Cover — Live CMS search using Webflow Data API.
 * Queries 6 collections, scores results, renders grouped output.
 * Applied to /site-search page only.
 */
(function(){
'use strict';
if(window._ocSearchComplete) return;
window._ocSearchComplete = true;

var SITE_ID = '69e03a098b0bf5d05f9f777b';
var TOKEN   = 'f1cd7b01d876bdaf90c167f7211fdb9b88f05cd75dd50b194f874a4a4d8fe042';
var API     = 'https://api.webflow.com/v2';

var COLLECTIONS = [
  {id:'69e2c47342c9cc359235da7b', label:'Personal Coverage',    prefix:'/personal-insurance/',  nameField:'name',         descField:'short-description'},
  {id:'69e309313129d5885beb556b', label:'Business Coverage',    prefix:'/commercial-insurance/', nameField:'name',         descField:'short-description'},
  {id:'69e2c474c6e942f8dc3a92a4', label:'Personal Carriers',    prefix:'/personal-carriers/',    nameField:'carrier-name', descField:'carrier-card-summary'},
  {id:'69e2cbe680de971437c3f0ca', label:'Commercial Carriers',  prefix:'/commercial-carriers/',  nameField:'carrier-name', descField:'carrier-card-summary'},
  {id:'69e2c7f90ef88a50c39b2bc2', label:'FAQ',                  prefix:'/faq',                   nameField:'question',     descField:'answer'},
  {id:'69e2e92dc55b625dc265b1f0', label:'Local',                prefix:'/cities/',               nameField:'name',         descField:'short-description'}
];

/* ============================================================
   CSS
============================================================ */
function injectCSS(){
  if(document.getElementById('ocsearch-css')) return;
  var s = document.createElement('style');
  s.id = 'ocsearch-css';
  s.textContent = `
body { background: #F5EDD8; }
#oc-s { font-family: Inter, sans-serif; min-height: 60vh; }

/* Hero */
#oc-s-hero {
  background: #1B3A5C;
  padding: 72px 24px 56px;
}
#oc-s-inner {
  max-width: 720px;
  margin: 0 auto;
}
#oc-s-eye {
  font-size: 11px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: #B8934A; margin: 0 0 12px;
  display: block;
}
#oc-s-h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 40px; font-weight: 600; color: #fff;
  margin: 0 0 32px; line-height: 1.15;
}
#oc-s-bar {
  display: flex; align-items: center; background: #fff;
  border-radius: 8px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,.18);
}
#oc-s-bar-icon {
  padding: 0 16px; font-size: 18px; color: #94a3b8; flex-shrink: 0;
}
#oc-s-inp {
  flex: 1; height: 54px; border: none; outline: none;
  font-family: Inter, sans-serif; font-size: 16px;
  color: #1B3A5C; background: transparent;
}
#oc-s-btn {
  height: 54px; padding: 0 28px; background: #B8934A;
  color: #1B3A5C; border: none; cursor: pointer;
  font-family: Inter, sans-serif; font-size: 14px; font-weight: 700;
  flex-shrink: 0; transition: background .15s;
}
#oc-s-btn:hover { background: #c9a456; }
#oc-s-hint {
  font-size: 13px; color: rgba(255,255,255,.4); margin: 12px 0 0;
}

/* Body */
#oc-s-body {
  max-width: 720px; margin: 0 auto; padding: 40px 24px 80px;
}
#oc-s-status {
  font-size: 14px; color: #64748b; margin-bottom: 28px; min-height: 22px;
}

/* Groups */
.osr-group { margin-bottom: 40px; }
.osr-label {
  font-size: 10px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: #B8934A;
  margin-bottom: 14px; padding-bottom: 10px;
  border-bottom: 2px solid #e8dcc8; display: block;
}

/* Result card */
.osr {
  display: block; padding: 16px 18px; border-radius: 8px;
  text-decoration: none; border: 1px solid #e2d9c8;
  margin-bottom: 8px; background: #fff;
  transition: border-color .12s, background .12s, box-shadow .12s;
}
.osr:hover {
  border-color: #B8934A; background: #fdf9f3;
  box-shadow: 0 2px 12px rgba(184,147,74,.12);
}
.osr-tag {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: #B8934A; background: #fdf5e8;
  border: 1px solid #e8d8b8; border-radius: 4px;
  padding: 2px 7px; margin-bottom: 7px; display: inline-block;
}
.osr-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px; font-weight: 600; color: #1B3A5C;
  display: block; margin-bottom: 4px;
}
.osr-desc {
  font-size: 13px; color: #64748b; display: block; line-height: 1.5;
}

/* Empty state */
#oc-s-empty {
  text-align: center; padding: 56px 24px;
  border: 1px solid #e2d9c8; border-radius: 12px; background: #fff;
}
#oc-s-empty-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px; color: #1B3A5C; margin: 0 0 10px;
}
#oc-s-empty-sub {
  font-size: 15px; color: #64748b; margin: 0 0 28px; line-height: 1.55;
}
#oc-s-empty-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px; background: #B8934A; color: #1B3A5C;
  font-family: Inter, sans-serif; font-size: 14px; font-weight: 700;
  text-decoration: none; border-radius: 20px;
  box-shadow: 0 2px 12px rgba(184,147,74,.35);
}

/* Loading spinner */
.oc-s-loading {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid #e2d9c8; border-top-color: #B8934A;
  border-radius: 50%; animation: oc-spin .7s linear infinite;
  vertical-align: middle; margin-right: 8px;
}
@keyframes oc-spin { to { transform: rotate(360deg); } }

@media(max-width:600px){
  #oc-s-h1 { font-size: 28px; }
  #oc-s-btn { padding: 0 16px; font-size: 13px; }
}
  `;
  document.head.appendChild(s);
}

/* ============================================================
   HELPERS
============================================================ */
function getQ(){
  try {
    return (new URLSearchParams(window.location.search)).get('q') || '';
  } catch(e){ return ''; }
}

function qs(id){ return document.getElementById(id); }

function truncate(str, n){
  if(!str) return '';
  return str.length > n ? str.substring(0, n).replace(/\s\S*$/, '') + '...' : str;
}

/* ============================================================
   API
============================================================ */
function fetchCollection(col){
  return fetch(API + '/collections/' + col.id + '/items?limit=100', {
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Accept': 'application/json'
    }
  })
  .then(function(r){ return r.json(); })
  .then(function(d){ return d.items || []; });
}

/* ============================================================
   SCORING
============================================================ */
function score(item, col, q){
  var fd  = item.fieldData || {};
  var name = (fd[col.nameField] || '').toLowerCase();
  var desc = (fd[col.descField] || '').toLowerCase();
  var tags = (fd['coverage-type'] || fd['insurance-type'] || fd['best-fit-profile'] || '').toLowerCase();
  var qlo  = q.toLowerCase();
  var s    = 0;

  if(name === qlo) s += 20;
  else if(name.indexOf(qlo) === 0) s += 15;
  else if(name.indexOf(qlo) > -1) s += 10;

  if(desc.indexOf(qlo) > -1) s += 5;
  if(tags.indexOf(qlo) > -1) s += 4;

  var words = qlo.split(/\s+/);
  words.forEach(function(w){
    if(w.length < 3) return;
    if(name.indexOf(w) > -1) s += 3;
    if(desc.indexOf(w) > -1) s += 1;
    if(tags.indexOf(w) > -1) s += 1;
  });

  return s;
}

/* ============================================================
   RENDER
============================================================ */
function renderResults(groups){
  var resultsEl = qs('oc-s-results');
  var emptyEl   = qs('oc-s-empty');
  var statusEl  = qs('oc-s-status');
  var total     = 0;
  groups.forEach(function(g){ total += g.items.length; });

  if(total === 0){
    resultsEl.innerHTML = '';
    emptyEl.style.display = 'block';
    statusEl.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';
  statusEl.textContent = total + ' result' + (total === 1 ? '' : 's') + ' for "' + groups._query + '"';

  var html = '';
  groups.forEach(function(g){
    if(!g.items.length) return;
    html += '<div class="osr-group"><span class="osr-label">' + g.label + '</span>';
    g.items.slice(0, 6).forEach(function(item){
      var fd   = item.fieldData || {};
      var name = fd[g.nameField] || 'Untitled';
      var desc = truncate(fd[g.descField] || '', 130);
      var slug = fd.slug || '';
      var href = g.prefix + (g.prefix.indexOf('#') > -1 ? '' : slug);
      html += '<a href="' + href + '" class="osr">';
      html += '<span class="osr-tag">' + g.label + '</span>';
      html += '<span class="osr-name">' + name + '</span>';
      if(desc) html += '<span class="osr-desc">' + desc + '</span>';
      html += '</a>';
    });
    html += '</div>';
  });

  resultsEl.innerHTML = html;
}

/* ============================================================
   SEARCH
============================================================ */
function doSearch(q){
  q = q.trim();
  var statusEl  = qs('oc-s-status');
  var resultsEl = qs('oc-s-results');
  var emptyEl   = qs('oc-s-empty');

  if(!q){
    statusEl.innerHTML = '';
    resultsEl.innerHTML = '';
    emptyEl.style.display = 'none';
    return;
  }

  statusEl.innerHTML = '<span class="oc-s-loading"></span>Searching...';
  resultsEl.innerHTML = '';
  emptyEl.style.display = 'none';

  Promise.all(COLLECTIONS.map(function(col){
    return fetchCollection(col).then(function(items){
      var scored = items
        .map(function(item){ return {item: item, s: score(item, col, q)}; })
        .filter(function(x){ return x.s > 0; })
        .sort(function(a, b){ return b.s - a.s; })
        .map(function(x){ return x.item; });
      return {
        label:     col.label,
        prefix:    col.prefix,
        nameField: col.nameField,
        descField: col.descField,
        items:     scored
      };
    });
  })).then(function(groups){
    groups._query = q;
    renderResults(groups);
  }).catch(function(err){
    statusEl.textContent = 'Search is temporarily unavailable. Please try browsing coverage or carriers.';
    console.warn('ocsearch error:', err);
  });
}

/* ============================================================
   BUILD UI
============================================================ */
function buildUI(){
  var root = document.getElementById('oc-search-root');
  if(!root) return;

  root.innerHTML =
    '<div id="oc-s">' +
      '<div id="oc-s-hero">' +
        '<div id="oc-s-inner">' +
          '<span id="oc-s-eye">Search</span>' +
          '<h1 id="oc-s-h1">What are you looking for?</h1>' +
          '<div id="oc-s-bar">' +
            '<span id="oc-s-bar-icon">&#128269;</span>' +
            '<input id="oc-s-inp" type="text" placeholder="Coverage, carriers, FAQ..." autocomplete="off" aria-label="Search">' +
            '<button id="oc-s-btn">Search</button>' +
          '</div>' +
          '<p id="oc-s-hint">Try: homeowners, cyber liability, Travelers, flood, workers comp</p>' +
        '</div>' +
      '</div>' +
      '<div id="oc-s-body">' +
        '<div id="oc-s-status"></div>' +
        '<div id="oc-s-results"></div>' +
        '<div id="oc-s-empty" style="display:none">' +
          '<p id="oc-s-empty-title">No results found</p>' +
          '<p id="oc-s-empty-sub">Try different keywords, or start a free coverage review and we will point you in the right direction.</p>' +
          '<a href="/coverage-review" id="oc-s-empty-cta">Free Coverage Review &#8594;</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ============================================================
   EVENTS
============================================================ */
function bindEvents(){
  var inp = qs('oc-s-inp');
  var btn = qs('oc-s-btn');
  if(!inp || !btn) return;

  var q = getQ();
  if(q){
    inp.value = q;
    doSearch(q);
  }

  btn.addEventListener('click', function(){
    var v = inp.value.trim();
    if(v) window.history.replaceState(null, '', '/site-search?q=' + encodeURIComponent(v));
    doSearch(v);
  });

  inp.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      var v = inp.value.trim();
      if(v) window.history.replaceState(null, '', '/site-search?q=' + encodeURIComponent(v));
      doSearch(v);
    }
  });
}

/* ============================================================
   INIT
============================================================ */
function init(){
  injectCSS();
  buildUI();
  bindEvents();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
