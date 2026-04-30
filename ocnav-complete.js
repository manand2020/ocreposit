/* ocnav-complete.js v4.3.0
 * Olive Cover — State manager + dropdown behavior.
 * Nav HTML and CSS are native in Webflow Designer.
 * CSS classes live in Webflow style system — zero CSS in this file.
 */
(function(){
'use strict';
if(window._ocNavComplete) return;
window._ocNavComplete = true;

/* ============================================================
   STATES
============================================================ */
var STATES = [
  {name:'Georgia', slug:'georgia', flag:'🍑', active:true}
];

function getState(){
  try{ return localStorage.getItem('oc_state')||'georgia'; }catch(e){ return 'georgia'; }
}

function setState(s){
  try{
    localStorage.setItem('oc_state', s);
    document.body.dataset.state = s;
    window.dispatchEvent(new CustomEvent('oc_state_changed', {detail:{state:s}}));
  }catch(e){}
}

function getStateInfo(slug){
  return STATES.find(function(s){ return s.slug===slug; })||STATES[0];
}

/* ============================================================
   IP GEO — Disabled. Re-enable when additional states go live.
============================================================ */
/*
(function detectGeo(){
  try{
    if(localStorage.getItem('oc_state')) return;
    var x = new XMLHttpRequest();
    x.open('GET','https://ip-api.com/json/?fields=regionName',true);
    x.onload = function(){
      try{
        var d = JSON.parse(x.responseText);
        var r = (d.regionName||'').toLowerCase();
        var active = STATES.filter(function(s){ return s.active; });
        var match = active.find(function(s){ return r.indexOf(s.name.toLowerCase())>-1; });
        if(match) setState(match.slug);
      }catch(e){}
    };
    x.send();
  }catch(e){}
})();
*/

/* ============================================================
   INIT
============================================================ */
document.body.dataset.state = getState();

/* ============================================================
   STATE CARD CLICKS
============================================================ */
document.addEventListener('click', function(e){
  var card = e.target.closest('[data-state]');
  if(!card) return;
  if(!card.closest('#oc-static-nav')) return;
  var newState = card.getAttribute('data-state');
  if(newState && STATES.find(function(s){ return s.slug===newState && s.active; })){
    setState(newState);
  }
});

/* ============================================================
   DROPDOWN BEHAVIOR
   Uses readyState guard — script loads async after DOMContentLoaded
   has already fired, so we call initDropdowns() immediately if
   the document is already interactive or complete.
============================================================ */
function initDropdowns(){
  var bar = document.getElementById('oc-static-nav-bar');
  if(!bar) return;
  var items = bar.querySelectorAll('[id^="ocn-item-"]');

  function closeAll(){
    items.forEach(function(item){
      var panel = item.querySelector('[id$="-panel"]');
      var svg = item.querySelector('svg');
      if(panel) panel.style.display = 'none';
      if(svg) svg.style.transform = '';
    });
  }

  items.forEach(function(item){
    var btn = item.querySelector('.w-button');
    var panel = item.querySelector('[id$="-panel"]');
    if(!btn || !panel) return;
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var isOpen = panel.style.display === 'block';
      closeAll();
      if(!isOpen){
        panel.style.display = 'block';
        var svg = btn.querySelector('svg');
        if(svg) svg.style.transform = 'rotate(180deg)';
      }
    });
  });

  document.addEventListener('click', closeAll);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initDropdowns);
} else {
  initDropdowns();
}

})();
