/* ocsearch-complete.js v3.0.0
 * Olive Cover — Live CMS search using Webflow Data API.
 * v3: Zero CSS injection. All styles applied natively in Webflow Designer.
 *     Script handles only: canvas patching, API queries, rendering, events.
 */
(function(){
'use strict';
if(window._ocSearchComplete) return;
window._ocSearchComplete = true;

var TOKEN = 'f1cd7b01d876bdaf90c167f7211fdb9b88f05cd75dd50b194f874a4a4d8fe042';
var API   = 'https://api.webflow.com/v2';

var COLLECTIONS = [
  {id:'69e2c47342c9cc359235da7b', label:'Personal Coverage',   prefix:'/personal-insurance/',  nameField:'name',         descField:'short-description'},
  {id:'69e309313129d5885beb556b', label:'Business Coverage',   prefix:'/commercial-insurance/', nameField:'name',         descField:'short-description'},
  {id:'69e2c474c6e942f8dc3a92a4', label:'Personal Carriers',   prefix:'/personal-carriers/',    nameField:'carrier-name', descField:'carrier-card-summary'},
  {id:'69e2cbe680de971437c3f0ca', label:'Commercial Carriers', prefix:'/commercial-carriers/',  nameField:'carrier-name', descField:'carrier-card-summary'},
  {id:'69e2c7f90ef88a50c39b2bc2', label:'FAQ',                 prefix:'/faq',                   nameField:'question',     descField:'answer'},
  {id:'69e2e92dc55b625dc265b1f0', label:'Local',               prefix:'/cities/',               nameField:'name',         descField:'short-description'}
];

var SUGGESTED = [
  {label:'Does my homeowners policy cover floods?',     q:'flood homeowners'},
  {label:'What does a business owners policy cover?',   q:'business owners policy'},
  {label:'How much auto insurance do I actually need?', q:'auto insurance minimums'},
  {label:'What is umbrella insurance?',                 q:'umbrella insurance'},
  {label:'Do I need workers comp for my business?',     q:'workers compensation'},
  {label:'Which carriers does Olive Cover work with?',  q:'Travelers Progressive Nationwide'}
];

/* ============================================================
   HELPERS
============================================================ */
function getQ(){
  try{ return (new URLSearchParams(window.location.search)).get('q')||''; }catch(e){ return ''; }
}
function qs(id){ return document.getElementById(id); }
function truncate(str, n){
  if(!str) return '';
  str = str.replace(/<[^>]+>/g,'');
  return str.length>n ? str.substring(0,n).replace(/\s\S*$/,'')+'...' : str;
}

/* ============================================================
   API
============================================================ */
function fetchCollection(col){
  return fetch(API+'/collections/'+col.id+'/items?limit=100',{
    headers:{'Authorization':'Bearer '+TOKEN,'Accept':'application/json'}
  }).then(function(r){ return r.json(); }).then(function(d){ return d.items||[]; });
}

/* ============================================================
   SCORING
============================================================ */
function score(item, col, q){
  var fd   = item.fieldData||{};
  var name = (fd[col.nameField]||'').toLowerCase();
  var desc = (fd[col.descField]||'').toLowerCase();
  var tags = (fd['coverage-type']||fd['insurance-type']||fd['best-fit-profile']||'').toLowerCase();
  var qlo  = q.toLowerCase();
  var s    = 0;
  if(name===qlo) s+=20;
  else if(name.indexOf(qlo)===0) s+=15;
  else if(name.indexOf(qlo)>-1) s+=10;
  if(desc.indexOf(qlo)>-1) s+=5;
  if(tags.indexOf(qlo)>-1) s+=4;
  q.split(/\s+/).forEach(function(w){
    if(w.length<3) return;
    var wl=w.toLowerCase();
    if(name.indexOf(wl)>-1) s+=3;
    if(desc.indexOf(wl)>-1) s+=1;
    if(tags.indexOf(wl)>-1) s+=1;
  });
  return s;
}

/* ============================================================
   PATCH CANVAS
   Fixes placeholder text and injects SVG icon + breadcrumb.
   Uses only element manipulation — no style injection.
============================================================ */
function patchCanvas(){
  /* Fix heading */
  var h1 = document.querySelector('.oc-srch-h1');
  if(h1) h1.textContent = 'Find answers about your coverage';

  /* Replace bar icon div content with SVG — no style changes */
  var icon = document.querySelector('.oc-srch-bar-icon');
  if(icon){
    icon.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.5" stroke="#94a3b8" stroke-width="1.8"/><path d="M12.5 12.5L16 16" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  /* Clear status placeholder text */
  var statusEl = qs('oc-s-status');
  if(statusEl && statusEl.textContent.indexOf('div block')>-1){
    statusEl.textContent = '';
  }

  /* Inject breadcrumb before eyebrow */
  var inner = document.querySelector('.oc-srch-hero-inner');
  if(inner && !document.getElementById('oc-srch-breadcrumb')){
    var bc = document.createElement('nav');
    bc.id = 'oc-srch-breadcrumb';
    bc.setAttribute('aria-label','Breadcrumb');
    bc.innerHTML = '<a href="/">Home</a><span aria-hidden="true">›</span><span>Search</span>';
    inner.insertBefore(bc, inner.firstChild);
  }
}

/* ============================================================
   DEFAULT STATE — shown when no query present
============================================================ */
function renderDefault(){
  var resultsEl = qs('oc-s-results');
  var emptyEl   = qs('oc-s-empty');
  var statusEl  = qs('oc-s-status');

  if(emptyEl) emptyEl.style.display='none';
  if(statusEl) statusEl.textContent='';

  var html = '<div id="oc-s-default">';
  html += '<span class="osr-label">Common questions people ask</span>';
  SUGGESTED.forEach(function(s){
    html += '<button class="oc-s-suggestion" data-q="'+s.q+'">'+
      '<span class="oc-s-suggestion-icon">&#8594;</span>'+s.label+'</button>';
  });
  html += '<p class="oc-s-default-sub">Not finding what you need? '+
    '<a href="/coverage-review">Start a free coverage review</a> '+
    'and we will answer your specific questions.</p>';
  html += '</div>';

  if(resultsEl) resultsEl.innerHTML = html;

  document.querySelectorAll('.oc-s-suggestion').forEach(function(btn){
    btn.addEventListener('click', function(){
      var q = btn.getAttribute('data-q');
      var inp = qs('oc-s-inp');
      if(inp) inp.value = q;
      window.history.replaceState(null,'','/site-search?q='+encodeURIComponent(q));
      doSearch(q);
    });
  });
}

/* ============================================================
   RENDER RESULTS
============================================================ */
function renderResults(groups, q){
  var resultsEl = qs('oc-s-results');
  var emptyEl   = qs('oc-s-empty');
  var statusEl  = qs('oc-s-status');
  var total = 0;
  groups.forEach(function(g){ total+=g.items.length; });

  if(total===0){
    if(resultsEl) resultsEl.innerHTML='';
    if(emptyEl) emptyEl.style.display='block';
    if(statusEl) statusEl.textContent='';
    return;
  }

  if(emptyEl) emptyEl.style.display='none';
  if(statusEl) statusEl.textContent=total+' result'+(total===1?'':'s')+' for "'+q+'"';

  var html='';
  groups.forEach(function(g){
    if(!g.items.length) return;
    html+='<div class="osr-group"><span class="osr-label">'+g.label+'</span>';
    g.items.slice(0,6).forEach(function(item){
      var fd   = item.fieldData||{};
      var name = fd[g.nameField]||'Untitled';
      var desc = truncate(fd[g.descField]||'',130);
      var slug = fd.slug||'';
      var href = g.prefix+(g.prefix.slice(-1)==='#'?'':slug);
      html+='<a href="'+href+'" class="osr">';
      html+='<span class="osr-tag">'+g.label+'</span>';
      html+='<span class="osr-name">'+name+'</span>';
      if(desc) html+='<span class="osr-desc">'+desc+'</span>';
      html+='</a>';
    });
    html+='</div>';
  });

  if(resultsEl) resultsEl.innerHTML=html;
}

/* ============================================================
   SEARCH
============================================================ */
function doSearch(q){
  q = q.trim();
  var statusEl  = qs('oc-s-status');
  var resultsEl = qs('oc-s-results');
  var emptyEl   = qs('oc-s-empty');

  if(!q){ renderDefault(); return; }

  if(statusEl) statusEl.textContent='Searching...';
  if(resultsEl) resultsEl.innerHTML='';
  if(emptyEl) emptyEl.style.display='none';

  Promise.all(COLLECTIONS.map(function(col){
    return fetchCollection(col).then(function(items){
      var scored = items
        .map(function(item){ return {item:item,s:score(item,col,q)}; })
        .filter(function(x){ return x.s>0; })
        .sort(function(a,b){ return b.s-a.s; })
        .map(function(x){ return x.item; });
      return {label:col.label,prefix:col.prefix,nameField:col.nameField,descField:col.descField,items:scored};
    });
  })).then(function(groups){
    renderResults(groups,q);
  }).catch(function(err){
    if(statusEl) statusEl.textContent='Search is temporarily unavailable. Try browsing coverage or carriers.';
    console.warn('ocsearch error:',err);
  });
}

/* ============================================================
   EVENTS
============================================================ */
function bindEvents(){
  var inp = qs('oc-s-inp');
  var btn = qs('oc-s-btn');
  if(!inp||!btn) return;

  var q = getQ();
  if(q){ inp.value=q; doSearch(q); }
  else { renderDefault(); }

  btn.addEventListener('click',function(){
    var v=inp.value.trim();
    if(v) window.history.replaceState(null,'','/site-search?q='+encodeURIComponent(v));
    doSearch(v);
  });
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){
      var v=inp.value.trim();
      if(v) window.history.replaceState(null,'','/site-search?q='+encodeURIComponent(v));
      doSearch(v);
    }
  });
}

/* ============================================================
   INIT
============================================================ */
function init(){
  patchCanvas();
  bindEvents();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  init();
}

})();
