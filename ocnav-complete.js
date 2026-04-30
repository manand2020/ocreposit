/* ocnav-complete.js v4.0.0
 * Olive Cover — State manager only.
 * Nav HTML and CSS are native in Webflow Designer.
 * This script only sets body[data-state] for state-aware content.
 *
 * To add a new state:
 *   1. Add to STATES array with active:true
 *   2. Add state-specific CMS content
 *   3. Uncomment IP geo block below
 *   4. Add state switcher UI to OC Nav component in Designer
 */
(function(){
'use strict';
if(window._ocNavComplete) return;
window._ocNavComplete = true;

/* ============================================================
   STATES — Georgia only. Extend when licensed in new states.
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
   IP GEO — Disabled. Only one active state.
   Re-enable when additional states go live.
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
   STATE CARD CLICKS — Wired for future state switcher UI.
   Cards need data-state attribute inside #oc-static-nav.
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

})();
