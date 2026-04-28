/* ocnav-complete.js v3.0.0
 * Olive Cover — Full nav per spec v2.
 * Coverage (merged personal+commercial) | Carriers | Learn | About | State Switcher | CTA
 */
(function(){
'use strict';
if(window._ocNavComplete) return;
window._ocNavComplete = true;

/* ============================================================
   STATE
============================================================ */
var STATES = [
  {name:'Georgia',    slug:'georgia',    flag:'🍑', active:true},
  {name:'California', slug:'california', flag:'🐻', active:true},
  {name:'Florida',    slug:'florida',    flag:'☀️', active:false},
  {name:'Texas',      slug:'texas',      flag:'⭐', active:false}
];

function getState(){
  try{ return localStorage.getItem('oc_state')||'georgia'; }catch(e){ return 'georgia'; }
}
function setState(s){
  try{
    localStorage.setItem('oc_state',s);
    window.dispatchEvent(new CustomEvent('oc_state_changed',{detail:{state:s}}));
  }catch(e){}
}
function getStateInfo(slug){
  return STATES.find(function(s){ return s.slug===slug; })||STATES[0];
}

/* IP geo detection — only if no manual override */
(function detectGeo(){
  try{
    if(localStorage.getItem('oc_state')) return;
    var x=new XMLHttpRequest();
    x.open('GET','https://ip-api.com/json/?fields=regionName',true);
    x.onload=function(){
      try{
        var d=JSON.parse(x.responseText);
        var r=(d.regionName||'').toLowerCase();
        var active=STATES.filter(function(s){return s.active;});
        var match=active.find(function(s){return r.indexOf(s.name.toLowerCase())>-1;});
        if(match) localStorage.setItem('oc_state',match.slug);
      }catch(e){}
    };
    x.send();
  }catch(e){}
})();

/* ============================================================
   COVERAGE ITEMS — state-sensitive situation lines
============================================================ */
function getCoverageItems(state){
  var wcLine = state==='california'
    ? 'California requires workers comp for any employer with 1+ employees'
    : 'Georgia requires workers comp for most employers';
  return {
    personal:[
      {name:'My Home',          sub:'I own a home, condo, or rental property',           href:'/personal-insurance/homeowners-insurance'},
      {name:'My Car',           sub:'I drive and want real protection, not just minimums',href:'/personal-insurance/auto-insurance'},
      {name:'My Belongings',    sub:"I rent and my landlord's policy does not cover me",  href:'/personal-insurance/renters-insurance'},
      {name:'Against a Big Loss',sub:'One lawsuit could wipe out everything I have built',href:'/personal-insurance/umbrella-insurance'},
      {name:'Against Flooding', sub:'My standard policy covers zero flood damage',        href:'/personal-insurance/flood-insurance'},
      {name:'My Rental Income', sub:'I rent out a property and need landlord coverage',   href:'/personal-insurance/landlord-insurance'}
    ],
    commercial:[
      {name:'My Business Property and Liability',sub:'I need one policy that covers my business basics',            href:'/commercial-insurance/business-owners-policy'},
      {name:'Against a Customer Claim',          sub:'Someone got hurt or I caused damage to their property',       href:'/commercial-insurance/general-liability-insurance'},
      {name:'My Business Vehicles',              sub:'My personal auto policy does not cover business use',         href:'/commercial-insurance/commercial-auto-insurance'},
      {name:'My Employees',                      sub:wcLine,                                                        href:'/commercial-insurance/workers-compensation-insurance'},
      {name:'Against a Data Breach',             sub:'A cyberattack could cost my business $200,000 or more',      href:'/commercial-insurance/cyber-insurance'},
      {name:'My Professional Work',              sub:'My advice or service caused a loss and I am being sued',      href:'/commercial-insurance/professional-liability-insurance'}
    ]
  };
}

var CARRIERS_PERSONAL=[
  {name:'Travelers',   ctx:'Complex homes',  href:'/carriers/travelers-insurance'},
  {name:'Progressive', ctx:'Auto bundling',  href:'/carriers/progressive-insurance'},
  {name:'Nationwide',  ctx:'Broad coverage', href:'/carriers/nationwide-insurance'},
  {name:'Safeco',      ctx:'Mid-range homes',href:'/carriers/safeco-insurance'},
  {name:'Openly',      ctx:'High value homes',href:'/carriers/openly-insurance'},
  {name:'Hippo',       ctx:'Newer construction',href:'/carriers/hippo-insurance'}
];
var CARRIERS_COMMERCIAL=[
  {name:'Travelers',   ctx:'Broad commercial',      href:'/carriers/travelers-insurance'},
  {name:'The Hartford',ctx:'Small business',        href:'/carriers/hartford-insurance'},
  {name:'Nationwide',  ctx:'Mid-market',            href:'/carriers/nationwide-insurance'},
  {name:'CNA',         ctx:'Professional liability',href:'/carriers/cna-insurance'},
  {name:'Hanover',     ctx:'Complex risks',         href:'/carriers/hanover-insurance'},
  {name:'AIG',         ctx:'High value risks',      href:'/carriers/aig-insurance'}
];

var LOGO='https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';

/* ============================================================
   CSS
============================================================ */
function injectCSS(){
  if(document.getElementById('ocnav-css')) return;
  var s=document.createElement('style');
  s.id='ocnav-css';
  s.textContent=`
body{padding-top:64px!important;}

/* Gold accent line */
#ocnav-bar::before{
  content:'';position:absolute;top:0;left:0;width:100%;height:2px;
  background:linear-gradient(90deg,transparent 0%,rgba(184,147,74,0.7) 50%,transparent 100%);
  pointer-events:none;z-index:1;
}

/* Bar */
#ocnav-bar{
  position:fixed!important;top:0!important;left:0!important;
  width:100%!important;height:64px!important;background:#1B3A5C!important;
  display:flex!important;align-items:center!important;
  padding:0 28px!important;box-sizing:border-box!important;
  z-index:9999!important;border-bottom:1px solid rgba(184,147,74,0.2)!important;
  gap:0!important;
}

/* Logo */
#ocnav-bar .ocn-logo{text-decoration:none;display:flex;align-items:center;flex-shrink:0;margin-right:20px;}
#ocnav-bar .ocn-logo img{height:30px!important;width:auto!important;display:block!important;}

/* Search bar */
#ocnav-bar .ocn-search-wrap{position:relative;margin-right:20px;flex-shrink:0;}
#ocnav-bar .ocn-search{
  width:220px;height:34px;padding:0 14px 0 34px;
  background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);
  border-radius:20px;color:#fff;font-family:Inter,sans-serif;font-size:13px;
  outline:none;box-sizing:border-box;transition:background 0.15s,border 0.15s;
}
#ocnav-bar .ocn-search::placeholder{color:rgba(255,255,255,0.5);}
#ocnav-bar .ocn-search:focus{background:rgba(255,255,255,0.16);border-color:rgba(184,147,74,0.6);}
#ocnav-bar .ocn-search-icon{
  position:absolute;left:11px;top:50%;transform:translateY(-50%);
  color:rgba(255,255,255,0.45);font-size:12px;pointer-events:none;
}

/* Nav links row */
#ocnav-bar .ocn-links{display:flex;align-items:center;gap:0;flex:1;height:64px;}

/* Top-level item wrapper */
#ocnav-bar .ocn-item{position:relative;height:64px;display:flex;align-items:center;}

/* Label link (navigates to hub) */
#ocnav-bar .ocn-label{
  color:rgba(255,255,255,0.82);font-family:Inter,sans-serif;font-size:14px;font-weight:500;
  text-decoration:none;padding:0 4px 0 14px;height:64px;display:flex;align-items:center;
  white-space:nowrap;transition:color 0.15s;
}
#ocnav-bar .ocn-label:hover{color:#fff;}

/* Chevron button (opens dropdown) */
#ocnav-bar .ocn-chev-btn{
  background:none;border:none;cursor:pointer;padding:0 10px 0 2px;height:64px;
  display:flex;align-items:center;color:rgba(255,255,255,0.6);transition:color 0.15s;
}
#ocnav-bar .ocn-chev-btn:hover{color:#fff;}
#ocnav-bar .ocn-chev-btn svg{transition:transform 0.2s;display:block;}
#ocnav-bar .ocn-item.ocn-open .ocn-chev-btn svg{transform:rotate(180deg);}

/* Flat link (About) */
#ocnav-bar .ocn-flat{
  color:rgba(255,255,255,0.82);font-family:Inter,sans-serif;font-size:14px;font-weight:500;
  text-decoration:none;padding:0 14px;height:64px;display:flex;align-items:center;
  white-space:nowrap;transition:color 0.15s;
}
#ocnav-bar .ocn-flat:hover{color:#fff;}

/* ---- COVERAGE DROPDOWN ---- */
#ocn-coverage-panel{
  display:none;position:fixed;top:64px;left:0;width:100%;
  background:#fff;border-top:2px solid #B8934A;
  box-shadow:0 12px 40px rgba(27,58,92,0.14);
  z-index:9998;padding:28px 40px 24px;box-sizing:border-box;
  animation:ocnFadeSlide 0.18s ease;
}
#ocnav-bar .ocn-item.ocn-open #ocn-coverage-panel{display:block;}

.ocn-cov-inner{display:flex;max-width:1120px;margin:0 auto;gap:0;}

.ocn-cov-hdr{
  font-family:'Playfair Display',Georgia,serif;font-size:13px;font-weight:600;
  color:#94a3b8;margin-bottom:20px;
}

.ocn-cov-section{flex:1;padding:0 32px;border-right:1px solid #eef1f5;}
.ocn-cov-section:first-child{padding-left:0;}
.ocn-cov-section:last-child{border-right:none;}

.ocn-sec-label{
  font-family:Inter,sans-serif;font-size:10px;font-weight:700;
  color:#B8934A;letter-spacing:0.12em;text-transform:uppercase;
  margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f0ebe0;
  display:block;
}

.ocn-cov-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;}

.ocn-cov-item{
  display:block;padding:8px 6px;text-decoration:none;
  border-radius:6px;transition:background 0.12s;
}
.ocn-cov-item:hover{background:#f8f5ef;}
.ocn-cov-item-name{
  font-family:Inter,sans-serif;font-size:13px;font-weight:600;
  color:#1B3A5C;display:block;margin-bottom:2px;
}
.ocn-cov-item-sub{
  font-family:Inter,sans-serif;font-size:11.5px;color:#64748b;
  display:block;line-height:1.35;
}

.ocn-sec-footer{
  margin-top:14px;padding-top:12px;border-top:1px solid #f0ebe0;
  font-family:Inter,sans-serif;font-size:12px;color:#64748b;
}
.ocn-sec-footer a{color:#B8934A;font-weight:600;text-decoration:none;}
.ocn-sec-footer a:hover{text-decoration:underline;}
.ocn-sec-footer .ocn-see-all{
  display:inline-block;margin-top:4px;font-size:11.5px;color:#94a3b8;font-weight:500;
}

.ocn-cov-overall-footer{
  max-width:1120px;margin:16px auto 0;padding-top:14px;
  border-top:1px solid #f0ebe0;text-align:center;
  font-family:Inter,sans-serif;font-size:12px;color:#64748b;
}
.ocn-cov-overall-footer a{color:#B8934A;font-weight:600;text-decoration:none;}
.ocn-cov-overall-footer a:hover{text-decoration:underline;}

/* ---- CARRIERS DROPDOWN ---- */
#ocn-carriers-panel{
  display:none;position:absolute;top:calc(100% + 0px);left:-20px;
  min-width:520px;background:#fff;border-radius:12px;
  border-top:2px solid #B8934A;
  box-shadow:0 12px 40px rgba(27,58,92,0.15);
  z-index:10000;padding:20px 24px 16px;box-sizing:border-box;
  animation:ocnFadeSlide 0.18s ease;
}
#ocnav-bar .ocn-item.ocn-open #ocn-carriers-panel{display:block;}

.ocn-car-hdr{
  font-family:'Playfair Display',Georgia,serif;font-size:13px;color:#1B3A5C;
  margin-bottom:4px;font-weight:600;
}
.ocn-car-trust{
  font-family:Inter,sans-serif;font-size:11.5px;color:#64748b;
  margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0f0f0;
}
.ocn-car-cols{display:flex;gap:0;}
.ocn-car-col{flex:1;padding:0 20px;border-right:1px solid #eef1f5;}
.ocn-car-col:first-child{padding-left:0;}
.ocn-car-col:last-child{border-right:none;}
.ocn-car-col-label{
  font-family:Inter,sans-serif;font-size:10px;font-weight:700;
  color:#B8934A;letter-spacing:0.12em;text-transform:uppercase;
  margin-bottom:10px;display:block;
}
.ocn-car-row{
  display:flex;align-items:baseline;gap:6px;padding:6px 0;
  text-decoration:none;border-bottom:1px solid #f8f8f8;
}
.ocn-car-row:last-child{border-bottom:none;}
.ocn-car-row:hover .ocn-car-name{color:#B8934A;}
.ocn-car-name{
  font-family:Inter,sans-serif;font-size:13px;font-weight:600;
  color:#1B3A5C;transition:color 0.12s;
}
.ocn-car-ctx{font-family:Inter,sans-serif;font-size:11px;color:#94a3b8;}
.ocn-car-footer{
  margin-top:14px;padding-top:12px;border-top:1px solid #f0ebe0;
  font-family:Inter,sans-serif;font-size:12px;color:#64748b;text-align:center;
}
.ocn-car-footer a{color:#B8934A;font-weight:600;text-decoration:none;}
.ocn-car-footer a:hover{text-decoration:underline;}

/* ---- LEARN DROPDOWN ---- */
#ocn-learn-panel{
  display:none;position:absolute;top:calc(100% + 0px);left:-20px;
  min-width:340px;background:#fff;border-radius:12px;
  border-top:2px solid #B8934A;
  box-shadow:0 12px 40px rgba(27,58,92,0.15);
  z-index:10000;padding:16px 20px;box-sizing:border-box;
  animation:ocnFadeSlide 0.18s ease;
}
#ocnav-bar .ocn-item.ocn-open #ocn-learn-panel{display:block;}

.ocn-learn-hdr{
  font-family:'Playfair Display',Georgia,serif;font-size:13px;color:#1B3A5C;
  margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;font-weight:600;
}
.ocn-learn-item{
  display:flex;align-items:flex-start;gap:12px;padding:10px 8px;
  text-decoration:none;border-radius:8px;transition:background 0.12s;
}
.ocn-learn-item:hover{background:#f8f5ef;}
.ocn-learn-icon{
  width:36px;height:36px;border-radius:8px;background:#1B3A5C;
  display:flex;align-items:center;justify-content:center;
  font-size:16px;flex-shrink:0;
}
.ocn-learn-text-name{
  font-family:Inter,sans-serif;font-size:13px;font-weight:600;
  color:#1B3A5C;display:block;margin-bottom:3px;
}
.ocn-learn-text-sub{
  font-family:Inter,sans-serif;font-size:11.5px;color:#64748b;
  display:block;line-height:1.35;
}

/* ---- STATE SWITCHER DESKTOP ---- */
#ocnav-bar .ocn-state-wrap{position:relative;margin-left:8px;flex-shrink:0;}
#ocnav-bar .ocn-state-pill{
  display:flex;align-items:center;gap:6px;padding:5px 12px;
  background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);
  border-radius:20px;cursor:pointer;font-family:Inter,sans-serif;
  font-size:12px;font-weight:600;color:#fff;transition:background 0.15s;
  white-space:nowrap;user-select:none;
}
#ocnav-bar .ocn-state-pill:hover{background:rgba(255,255,255,0.18);}
#ocnav-bar .ocn-state-pill svg{transition:transform 0.2s;flex-shrink:0;}
#ocnav-bar .ocn-state-wrap.ocn-state-open .ocn-state-pill svg{transform:rotate(180deg);}

#ocn-state-panel{
  display:none;position:absolute;top:calc(100% + 8px);right:0;
  min-width:320px;background:#fff;border-radius:12px;
  box-shadow:0 12px 40px rgba(27,58,92,0.18);
  z-index:10001;padding:16px;box-sizing:border-box;
  animation:ocnFadeSlide 0.18s ease;border-top:2px solid #B8934A;
}
.ocn-state-wrap.ocn-state-open #ocn-state-panel{display:block;}

.ocn-state-panel-hdr{
  font-family:Inter,sans-serif;font-size:11.5px;color:#64748b;
  margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #f0f0f0;
}
.ocn-state-panel-hdr strong{color:#1B3A5C;}
.ocn-state-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.ocn-state-card{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:12px 8px;border-radius:8px;border:2px solid #eef1f5;
  cursor:pointer;transition:all 0.15s;text-decoration:none;
}
.ocn-state-card.active-state{border-color:#1B3A5C;background:#f0f4f8;}
.ocn-state-card.active-state:hover{background:#e8eef5;border-color:#1B3A5C;}
.ocn-state-card.coming-soon{opacity:0.45;cursor:default;pointer-events:none;}
.ocn-state-flag{font-size:22px;margin-bottom:4px;line-height:1;}
.ocn-state-name{font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#1B3A5C;}
.ocn-state-status{font-family:Inter,sans-serif;font-size:10px;margin-top:2px;}
.ocn-state-card.active-state .ocn-state-status{color:#16a34a;}
.ocn-state-card.coming-soon .ocn-state-status{color:#94a3b8;}

/* ---- CTA BUTTON ---- */
#ocnav-bar .ocn-cta{
  margin-left:12px;flex-shrink:0;padding:0 18px;height:38px;
  background:#B8934A;color:#1B3A5C;border-radius:20px;
  font-family:Inter,sans-serif;font-size:13px;font-weight:700;
  text-decoration:none;display:flex;align-items:center;gap:6px;
  white-space:nowrap;box-shadow:0 2px 12px rgba(184,147,74,0.35);
  transition:background 0.15s,transform 0.15s,box-shadow 0.15s;
}
#ocnav-bar .ocn-cta:hover{
  background:#c9a456;transform:translateY(-1px);
  box-shadow:0 4px 16px rgba(184,147,74,0.45);
}
#ocnav-bar .ocn-cta svg{flex-shrink:0;}

/* ---- HAMBURGER ---- */
#ocnav-mob-btn{
  display:none;background:none;border:none;cursor:pointer;
  padding:8px;flex-direction:column;gap:5px;margin-left:auto;
}
#ocnav-mob-btn .ocn-hb{
  display:block;width:22px;height:2px;background:#B8934A;border-radius:2px;
  transition:transform 0.25s,opacity 0.25s;transform-origin:center;
}
#ocnav-mob-btn.ocn-mob-open .ocn-hb:nth-child(1){transform:translateY(7px) rotate(45deg);}
#ocnav-mob-btn.ocn-mob-open .ocn-hb:nth-child(2){opacity:0;}
#ocnav-mob-btn.ocn-mob-open .ocn-hb:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

/* ---- MOBILE MENU ---- */
#ocnav-mobile{
  display:none;position:fixed;top:64px;right:-100%;width:100%;
  background:#122840;z-index:9998;
  max-height:calc(100vh - 64px);overflow-y:auto;
  transition:right 0.28s cubic-bezier(0.4,0,0.2,1);
  box-sizing:border-box;
}
#ocnav-mobile.ocn-mob-open{display:block;right:0;}

/* Mobile search */
.ocn-mob-search-wrap{padding:16px 16px 8px;position:relative;}
.ocn-mob-search{
  width:100%;height:40px;padding:0 14px 0 38px;
  background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
  border-radius:20px;color:#fff;font-family:Inter,sans-serif;font-size:14px;
  outline:none;box-sizing:border-box;
}
.ocn-mob-search::placeholder{color:rgba(255,255,255,0.4);}
.ocn-mob-search-icon{
  position:absolute;left:28px;top:50%;transform:translateY(-50%);
  color:rgba(255,255,255,0.4);font-size:14px;pointer-events:none;
}

/* Mobile accordion */
.ocn-mob-acc{border-bottom:1px solid rgba(255,255,255,0.07);}
.ocn-mob-acc-hdr{
  display:flex;align-items:center;padding:0 16px;height:50px;
}
.ocn-mob-acc-link{
  flex:1;font-family:Inter,sans-serif;font-size:15px;font-weight:500;
  color:rgba(255,255,255,0.88);text-decoration:none;
}
.ocn-mob-acc-link:hover{color:#B8934A;}
.ocn-mob-acc-chev{
  background:none;border:none;cursor:pointer;padding:8px;
  color:rgba(255,255,255,0.5);transition:transform 0.2s,color 0.15s;
}
.ocn-mob-acc-chev:hover{color:#fff;}
.ocn-mob-acc.ocn-mob-acc-open .ocn-mob-acc-chev{transform:rotate(180deg);}

.ocn-mob-acc-body{display:none;padding:0 16px 12px;}
.ocn-mob-acc.ocn-mob-acc-open .ocn-mob-acc-body{display:block;}

.ocn-mob-sec-label{
  font-family:Inter,sans-serif;font-size:10px;font-weight:700;
  color:#B8934A;letter-spacing:0.12em;text-transform:uppercase;
  padding:10px 0 6px;display:block;
}
.ocn-mob-cov-item{
  display:block;padding:9px 0;text-decoration:none;
  border-bottom:1px solid rgba(255,255,255,0.05);
}
.ocn-mob-cov-item:last-child{border-bottom:none;}
.ocn-mob-cov-name{
  font-family:Inter,sans-serif;font-size:13.5px;font-weight:500;
  color:rgba(255,255,255,0.85);display:block;
}
.ocn-mob-cov-sub{
  font-family:Inter,sans-serif;font-size:11.5px;
  color:rgba(255,255,255,0.4);display:block;margin-top:2px;
}
.ocn-mob-cov-item:hover .ocn-mob-cov-name{color:#B8934A;}

.ocn-mob-trust{
  font-family:Inter,sans-serif;font-size:11.5px;color:rgba(255,255,255,0.45);
  padding:8px 0 12px;
}
.ocn-mob-car-row{
  display:flex;align-items:baseline;gap:8px;padding:7px 0;
  text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.05);
}
.ocn-mob-car-row:last-child{border-bottom:none;}
.ocn-mob-car-name{font-family:Inter,sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);}
.ocn-mob-car-ctx{font-family:Inter,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);}
.ocn-mob-car-row:hover .ocn-mob-car-name{color:#B8934A;}

.ocn-mob-flat-link{
  display:block;padding:14px 16px;font-family:Inter,sans-serif;font-size:15px;font-weight:500;
  color:rgba(255,255,255,0.85);text-decoration:none;
  border-bottom:1px solid rgba(255,255,255,0.07);
}
.ocn-mob-flat-link:hover{color:#B8934A;}

.ocn-mob-cta-wrap{padding:16px;}
.ocn-mob-cta{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:14px;background:#B8934A;color:#1B3A5C;
  font-family:Inter,sans-serif;font-size:15px;font-weight:700;
  text-decoration:none;border-radius:20px;box-sizing:border-box;
  box-shadow:0 2px 12px rgba(184,147,74,0.3);
}

/* Mobile state switcher */
.ocn-mob-state-section{padding:12px 16px 20px;}
.ocn-mob-state-label{
  font-family:Inter,sans-serif;font-size:10px;font-weight:700;
  color:rgba(255,255,255,0.35);letter-spacing:0.1em;text-transform:uppercase;
  display:block;margin-bottom:10px;
}
.ocn-mob-state-hdr{
  font-family:Inter,sans-serif;font-size:11.5px;color:rgba(255,255,255,0.5);
  margin-bottom:10px;
}
.ocn-mob-state-hdr strong{color:rgba(255,255,255,0.75);}
.ocn-mob-state-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.ocn-mob-state-card{
  display:flex;flex-direction:column;align-items:center;padding:10px 6px;
  border-radius:8px;border:2px solid rgba(255,255,255,0.1);
  cursor:pointer;transition:all 0.15s;text-decoration:none;
}
.ocn-mob-state-card.active-state{border-color:rgba(184,147,74,0.6);background:rgba(184,147,74,0.08);}
.ocn-mob-state-card.coming-soon{opacity:0.35;pointer-events:none;}
.ocn-mob-state-flag{font-size:20px;margin-bottom:3px;}
.ocn-mob-state-name{font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.85);}
.ocn-mob-state-status{font-family:Inter,sans-serif;font-size:10px;margin-top:2px;}
.ocn-mob-state-card.active-state .ocn-mob-state-status{color:#4ade80;}
.ocn-mob-state-card.coming-soon .ocn-mob-state-status{color:rgba(255,255,255,0.3);}

/* Animation */
@keyframes ocnFadeSlide{
  from{opacity:0;transform:translateY(-8px);}
  to{opacity:1;transform:translateY(0);}
}

/* Responsive */
@media(max-width:960px){
  #ocnav-bar .ocn-links{display:none!important;}
  #ocnav-bar .ocn-search-wrap{display:none!important;}
  #ocnav-bar .ocn-state-wrap{display:none!important;}
  #ocnav-bar .ocn-cta{display:none!important;}
  #ocnav-mob-btn{display:flex!important;}
}
@media(max-width:479px){
  #ocnav-bar .ocn-cta{display:none!important;}
}
`;
  document.head.insertBefore(s,document.head.firstChild);
}

/* ============================================================
   ICONS (inline SVG helpers)
============================================================ */
function chevSVG(size){
  size=size||10;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function arrowSVG(){
  return '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function searchSVG(){
  return '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M8.5 8.5L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
}

/* ============================================================
   HIDE CANVAS NAV
============================================================ */
function hideCanvasNav(){
  ['oc-static-nav','oc-static-nav-bar','oc-nav','oc-navbar'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.cssText='display:none!important;';
  });
}

/* ============================================================
   BUILD DESKTOP COVERAGE PANEL
============================================================ */
function buildCoveragePanel(state){
  var items=getCoverageItems(state);
  var perItems=items.personal.map(function(i){
    return '<a href="'+i.href+'" class="ocn-cov-item">'+
      '<span class="ocn-cov-item-name">'+i.name+'</span>'+
      '<span class="ocn-cov-item-sub">'+i.sub+'</span>'+
    '</a>';
  }).join('');
  var comItems=items.commercial.map(function(i){
    return '<a href="'+i.href+'" class="ocn-cov-item">'+
      '<span class="ocn-cov-item-name">'+i.name+'</span>'+
      '<span class="ocn-cov-item-sub">'+i.sub+'</span>'+
    '</a>';
  }).join('');
  return '<div id="ocn-coverage-panel">'+
    '<div class="ocn-cov-inner">'+
      '<div class="ocn-cov-section">'+
        '<span class="ocn-sec-label">My Home and Family</span>'+
        '<div class="ocn-cov-grid">'+perItems+'</div>'+
        '<div class="ocn-sec-footer">'+
          'Not sure what you need? <a href="/coverage-review">Free Coverage Review</a><br>'+
          '<a href="/personal-insurance" class="ocn-see-all">See all personal coverage</a>'+
        '</div>'+
      '</div>'+
      '<div class="ocn-cov-section">'+
        '<span class="ocn-sec-label">My Business</span>'+
        '<div class="ocn-cov-grid">'+comItems+'</div>'+
        '<div class="ocn-sec-footer">'+
          'Not sure what your business needs? <a href="/coverage-review">Free Coverage Review</a><br>'+
          '<a href="/commercial-insurance" class="ocn-see-all">See all business coverage</a>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="ocn-cov-overall-footer">'+
      'Not sure where to start? <a href="/coverage-review">Start free review</a>'+
    '</div>'+
  '</div>';
}

/* ============================================================
   BUILD DESKTOP CARRIERS PANEL
============================================================ */
function buildCarriersPanel(){
  var perRows=CARRIERS_PERSONAL.map(function(c){
    return '<a href="'+c.href+'" class="ocn-car-row">'+
      '<span class="ocn-car-name">'+c.name+'</span>'+
      '<span class="ocn-car-ctx">'+c.ctx+'</span>'+
    '</a>';
  }).join('');
  var comRows=CARRIERS_COMMERCIAL.map(function(c){
    return '<a href="'+c.href+'" class="ocn-car-row">'+
      '<span class="ocn-car-name">'+c.name+'</span>'+
      '<span class="ocn-car-ctx">'+c.ctx+'</span>'+
    '</a>';
  }).join('');
  return '<div id="ocn-carriers-panel">'+
    '<div class="ocn-car-hdr">We shop all of these for you. You see every option.</div>'+
    '<div class="ocn-car-trust">12 A-rated carriers. One independent agent. No loyalty to any single company.</div>'+
    '<div class="ocn-car-cols">'+
      '<div class="ocn-car-col">'+
        '<span class="ocn-car-col-label">Personal</span>'+perRows+
      '</div>'+
      '<div class="ocn-car-col">'+
        '<span class="ocn-car-col-label">Commercial</span>'+comRows+
      '</div>'+
    '</div>'+
    '<div class="ocn-car-footer">'+
      'How do these carriers actually compare? <a href="/carriers">View all carriers</a>'+
    '</div>'+
  '</div>';
}

/* ============================================================
   BUILD DESKTOP LEARN PANEL
============================================================ */
function buildLearnPanel(){
  var items=[
    {icon:'📖',name:'Understand Your Coverage',     sub:'Plain English guides on what policies cover and what they do not',href:'/insights'},
    {icon:'❓',name:'Get a Specific Question Answered',sub:'500+ questions answered without insurance jargon',              href:'/faq'},
    {icon:'📍',name:"Know Your State's Rules",       sub:'Georgia and California have different requirements, minimums, and restrictions',href:'/where-we-do-business'}
  ];
  var rows=items.map(function(i){
    return '<a href="'+i.href+'" class="ocn-learn-item">'+
      '<div class="ocn-learn-icon">'+i.icon+'</div>'+
      '<div>'+
        '<span class="ocn-learn-text-name">'+i.name+'</span>'+
        '<span class="ocn-learn-text-sub">'+i.sub+'</span>'+
      '</div>'+
    '</a>';
  }).join('');
  return '<div id="ocn-learn-panel">'+
    '<div class="ocn-learn-hdr">What are you trying to figure out?</div>'+
    rows+
  '</div>';
}

/* ============================================================
   BUILD STATE PANEL HTML
============================================================ */
function buildStatePanelHTML(currentSlug){
  var stateInfo=getStateInfo(currentSlug);
  var cards=STATES.map(function(s){
    var cls='ocn-state-card'+(s.active?' active-state':' coming-soon');
    var status=s.active?'Licensed and active':'Coming soon';
    var attrs=s.active?'data-state="'+s.slug+'"':'';
    return '<div class="'+cls+'" '+attrs+'>'+
      '<span class="ocn-state-flag">'+s.flag+'</span>'+
      '<span class="ocn-state-name">'+s.name+'</span>'+
      '<span class="ocn-state-status">'+status+'</span>'+
    '</div>';
  }).join('');
  return '<div id="ocn-state-panel">'+
    '<div class="ocn-state-panel-hdr">Viewing coverage for <strong>'+stateInfo.name+'</strong></div>'+
    '<div class="ocn-state-grid">'+cards+'</div>'+
  '</div>';
}

/* ============================================================
   BUILD MOBILE MENU
============================================================ */
function buildMobileMenu(state){
  var items=getCoverageItems(state);
  var stateInfo=getStateInfo(state);

  var perLinks=items.personal.map(function(i){
    return '<a href="'+i.href+'" class="ocn-mob-cov-item">'+
      '<span class="ocn-mob-cov-name">'+i.name+'</span>'+
      '<span class="ocn-mob-cov-sub">'+i.sub+'</span>'+
    '</a>';
  }).join('');
  var comLinks=items.commercial.map(function(i){
    return '<a href="'+i.href+'" class="ocn-mob-cov-item">'+
      '<span class="ocn-mob-cov-name">'+i.name+'</span>'+
      '<span class="ocn-mob-cov-sub">'+i.sub+'</span>'+
    '</a>';
  }).join('');

  var perCarRows=CARRIERS_PERSONAL.map(function(c){
    return '<a href="'+c.href+'" class="ocn-mob-car-row">'+
      '<span class="ocn-mob-car-name">'+c.name+'</span>'+
      '<span class="ocn-mob-car-ctx">'+c.ctx+'</span>'+
    '</a>';
  }).join('');
  var comCarRows=CARRIERS_COMMERCIAL.map(function(c){
    return '<a href="'+c.href+'" class="ocn-mob-car-row">'+
      '<span class="ocn-mob-car-name">'+c.name+'</span>'+
      '<span class="ocn-mob-car-ctx">'+c.ctx+'</span>'+
    '</a>';
  }).join('');

  var stateCards=STATES.map(function(s){
    var cls='ocn-mob-state-card'+(s.active?' active-state':' coming-soon');
    var status=s.active?'Licensed and active':'Coming soon';
    var attrs=s.active?'data-state="'+s.slug+'"':'';
    return '<div class="'+cls+'" '+attrs+'>'+
      '<span class="ocn-mob-state-flag">'+s.flag+'</span>'+
      '<span class="ocn-mob-state-name">'+s.name+'</span>'+
      '<span class="ocn-mob-state-status">'+status+'</span>'+
    '</div>';
  }).join('');

  return ''+
    /* Search */
    '<div class="ocn-mob-search-wrap">'+
      '<span class="ocn-mob-search-icon">'+searchSVG()+'</span>'+
      '<input class="ocn-mob-search" type="text" placeholder="Search coverage, FAQ, carriers...">'+
    '</div>'+

    /* Coverage accordion */
    '<div class="ocn-mob-acc" id="ocn-mob-coverage">'+
      '<div class="ocn-mob-acc-hdr">'+
        '<a href="/coverage" class="ocn-mob-acc-link">Coverage</a>'+
        '<button class="ocn-mob-acc-chev" data-acc="ocn-mob-coverage">'+chevSVG(14)+'</button>'+
      '</div>'+
      '<div class="ocn-mob-acc-body">'+
        '<span class="ocn-mob-sec-label">My Home and Family</span>'+perLinks+
        '<span class="ocn-mob-sec-label" style="margin-top:12px;">My Business</span>'+comLinks+
      '</div>'+
    '</div>'+

    /* Carriers accordion */
    '<div class="ocn-mob-acc" id="ocn-mob-carriers">'+
      '<div class="ocn-mob-acc-hdr">'+
        '<a href="/carriers" class="ocn-mob-acc-link">Carriers</a>'+
        '<button class="ocn-mob-acc-chev" data-acc="ocn-mob-carriers">'+chevSVG(14)+'</button>'+
      '</div>'+
      '<div class="ocn-mob-acc-body">'+
        '<div class="ocn-mob-trust">We shop all of these for you. You see every option.</div>'+
        '<span class="ocn-mob-sec-label">Personal</span>'+perCarRows+
        '<span class="ocn-mob-sec-label" style="margin-top:12px;">Commercial</span>'+comCarRows+
        '<a href="/carriers" style="display:block;padding:10px 0;font-family:Inter,sans-serif;font-size:13px;font-weight:600;color:#B8934A;text-decoration:none;">View all carriers &rarr;</a>'+
      '</div>'+
    '</div>'+

    /* Learn accordion */
    '<div class="ocn-mob-acc" id="ocn-mob-learn">'+
      '<div class="ocn-mob-acc-hdr">'+
        '<a href="/insights" class="ocn-mob-acc-link">Learn</a>'+
        '<button class="ocn-mob-acc-chev" data-acc="ocn-mob-learn">'+chevSVG(14)+'</button>'+
      '</div>'+
      '<div class="ocn-mob-acc-body">'+
        '<a href="/insights" class="ocn-mob-cov-item"><span class="ocn-mob-cov-name">Understand Your Coverage</span><span class="ocn-mob-cov-sub">Plain English guides on what policies cover and what they do not</span></a>'+
        '<a href="/faq" class="ocn-mob-cov-item"><span class="ocn-mob-cov-name">Get a Specific Question Answered</span><span class="ocn-mob-cov-sub">500+ questions answered without insurance jargon</span></a>'+
        '<a href="/where-we-do-business" class="ocn-mob-cov-item"><span class="ocn-mob-cov-name">Know Your State\'s Rules</span><span class="ocn-mob-cov-sub">Georgia and California have different requirements, minimums, and restrictions</span></a>'+
      '</div>'+
    '</div>'+

    /* Flat links */
    '<a href="/about" class="ocn-mob-flat-link">About</a>'+
    '<a href="/contact" class="ocn-mob-flat-link">Contact</a>'+

    /* CTA */
    '<div class="ocn-mob-cta-wrap">'+
      '<a href="/coverage-review" class="ocn-mob-cta">Free Coverage Review '+arrowSVG()+'</a>'+
    '</div>'+

    /* State switcher */
    '<div class="ocn-mob-state-section">'+
      '<span class="ocn-mob-state-label">Your state</span>'+
      '<div class="ocn-mob-state-hdr">Viewing coverage for <strong>'+stateInfo.name+'</strong></div>'+
      '<div class="ocn-mob-state-grid" id="ocn-mob-state-grid">'+stateCards+'</div>'+
    '</div>';
}

/* ============================================================
   BUILD NAV
============================================================ */
function buildNav(){
  var state=getState();
  var stateInfo=getStateInfo(state);

  /* Remove previous */
  ['ocnav-bar','ocnav-mobile'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.remove();
  });

  /* ---- Desktop bar ---- */
  var bar=document.createElement('nav');
  bar.id='ocnav-bar';
  bar.setAttribute('role','navigation');
  bar.setAttribute('aria-label','Main navigation');

  bar.innerHTML=
    /* Logo */
    '<a href="/" class="ocn-logo"><img src="'+LOGO+'" alt="Olive Cover"></a>'+

    /* Search */
    '<div class="ocn-search-wrap">'+
      '<span class="ocn-search-icon">'+searchSVG()+'</span>'+
      '<input class="ocn-search" type="text" placeholder="Search coverage, FAQ, carriers..." aria-label="Site search">'+
    '</div>'+

    /* Nav links */
    '<div class="ocn-links">'+

      /* Coverage */
      '<div class="ocn-item" id="ocn-item-coverage">'+
        '<a href="/coverage" class="ocn-label">Coverage</a>'+
        '<button class="ocn-chev-btn" aria-label="Open coverage menu" aria-expanded="false">'+chevSVG(10)+'</button>'+
        buildCoveragePanel(state)+
      '</div>'+

      /* Carriers */
      '<div class="ocn-item" id="ocn-item-carriers">'+
        '<a href="/carriers" class="ocn-label">Carriers</a>'+
        '<button class="ocn-chev-btn" aria-label="Open carriers menu" aria-expanded="false">'+chevSVG(10)+'</button>'+
        buildCarriersPanel()+
      '</div>'+

      /* Learn */
      '<div class="ocn-item" id="ocn-item-learn">'+
        '<a href="/insights" class="ocn-label">Learn</a>'+
        '<button class="ocn-chev-btn" aria-label="Open learn menu" aria-expanded="false">'+chevSVG(10)+'</button>'+
        buildLearnPanel()+
      '</div>'+

      /* About - flat */
      '<a href="/about" class="ocn-flat">About</a>'+

    '</div>'+

    /* State switcher */
    '<div class="ocn-state-wrap" id="ocn-state-wrap">'+
      '<button class="ocn-state-pill" id="ocn-state-pill" aria-label="Switch state">'+
        '<span id="ocn-state-flag">'+stateInfo.flag+'</span>'+
        '<span id="ocn-state-name">'+stateInfo.name+'</span>'+
        chevSVG(9)+
      '</button>'+
      buildStatePanelHTML(state)+
    '</div>'+

    /* CTA */
    '<a href="/coverage-review" class="ocn-cta">Free Coverage Review '+arrowSVG()+'</a>'+

    /* Hamburger */
    '<button id="ocnav-mob-btn" aria-label="Open menu">'+
      '<span class="ocn-hb"></span>'+
      '<span class="ocn-hb"></span>'+
      '<span class="ocn-hb"></span>'+
    '</button>';

  document.body.insertBefore(bar,document.body.firstChild);

  /* ---- Mobile menu ---- */
  var mob=document.createElement('div');
  mob.id='ocnav-mobile';
  mob.innerHTML=buildMobileMenu(state);
  document.body.insertBefore(mob,bar.nextSibling);

  /* ============================================================
     EVENTS
  ============================================================ */

  /* Desktop chevron dropdowns — only one open at a time */
  var items=document.querySelectorAll('#ocnav-bar .ocn-item');
  items.forEach(function(item){
    var btn=item.querySelector('.ocn-chev-btn');
    if(!btn) return;
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var isOpen=item.classList.contains('ocn-open');
      items.forEach(function(i){
        i.classList.remove('ocn-open');
        var b=i.querySelector('.ocn-chev-btn');
        if(b) b.setAttribute('aria-expanded','false');
      });
      closeStateSwitcher();
      if(!isOpen){
        item.classList.add('ocn-open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  /* State switcher */
  var stateWrap=document.getElementById('ocn-state-wrap');
  var statePill=document.getElementById('ocn-state-pill');
  function closeStateSwitcher(){
    if(stateWrap) stateWrap.classList.remove('ocn-state-open');
  }
  if(statePill){
    statePill.addEventListener('click',function(e){
      e.stopPropagation();
      items.forEach(function(i){ i.classList.remove('ocn-open'); });
      stateWrap.classList.toggle('ocn-state-open');
    });
  }
  /* State card clicks in desktop panel */
  var statePanel=document.getElementById('ocn-state-panel');
  if(statePanel){
    statePanel.addEventListener('click',function(e){
      var card=e.target.closest('[data-state]');
      if(!card) return;
      var newState=card.getAttribute('data-state');
      if(newState){
        setState(newState);
        closeStateSwitcher();
        buildNav(); /* rebuild with new state */
      }
    });
  }

  /* Close all on outside click */
  document.addEventListener('click',function(){
    items.forEach(function(i){ i.classList.remove('ocn-open'); });
    closeStateSwitcher();
  });

  /* Hamburger */
  var hbtn=document.getElementById('ocnav-mob-btn');
  var mobMenu=document.getElementById('ocnav-mobile');
  if(hbtn){
    hbtn.addEventListener('click',function(e){
      e.stopPropagation();
      var open=hbtn.classList.toggle('ocn-mob-open');
      if(open) mobMenu.classList.add('ocn-mob-open');
      else mobMenu.classList.remove('ocn-mob-open');
    });
  }

  /* Mobile accordion chevrons */
  document.querySelectorAll('.ocn-mob-acc-chev').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var accId=btn.getAttribute('data-acc');
      var acc=document.getElementById(accId);
      if(!acc) return;
      var isOpen=acc.classList.contains('ocn-mob-acc-open');
      document.querySelectorAll('.ocn-mob-acc').forEach(function(a){
        a.classList.remove('ocn-mob-acc-open');
      });
      if(!isOpen) acc.classList.add('ocn-mob-acc-open');
    });
  });

  /* Mobile state card clicks */
  var mobGrid=document.getElementById('ocn-mob-state-grid');
  if(mobGrid){
    mobGrid.addEventListener('click',function(e){
      var card=e.target.closest('[data-state]');
      if(!card) return;
      var newState=card.getAttribute('data-state');
      if(newState){
        setState(newState);
        buildNav();
      }
    });
  }

  /* Search — basic submit on Enter */
  document.querySelectorAll('.ocn-search,.ocn-mob-search').forEach(function(inp){
    inp.addEventListener('keydown',function(e){
      if(e.key==='Enter'&&inp.value.trim()){
        window.location.href='/search?q='+encodeURIComponent(inp.value.trim());
      }
    });
  });
}

/* ============================================================
   INIT
============================================================ */
function init(){
  injectCSS();
  hideCanvasNav();
  buildNav();
}

window.addEventListener('oc_state_changed',function(){
  buildNav();
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  init();
}

})();
