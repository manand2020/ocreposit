/* ocnavcms v31.2.0 | Olive Cover | Built 2026-04-20 */
(function(){
'use strict';

/* ── Hide old nav aggressively ───────────────────────────── */
function hideOldNav(){
  var selectors=['.w-nav','[data-wf-page] nav','[class*="navbar"]','[class*="nav-bar"]','[id*="navbar"]','[id*="nav-bar"]','.ocnav-btn','[class*="oc-nav"]'];
  selectors.forEach(function(s){
    try{document.querySelectorAll(s).forEach(function(el){
      if(el.id!=='ocnav-bar'&&el.id!=='ocnav-mobile-menu'){el.style.cssText='display:none!important;visibility:hidden!important;';}
    });}catch(e){}
  });
}

/* ── State detection ─────────────────────────────────────── */
function detectState(){
  var path=window.location.pathname;
  var stored=localStorage.getItem('oc_state');
  if(/california|los-angeles|san-diego|san-francisco|sacramento|inland-empire/.test(path)){localStorage.setItem('oc_state','california');return'california';}
  if(/georgia|johns-creek|alpharetta|cumming|duluth|lawrenceville|suwanee|sugar-hill|buford|north-atlanta|gwinnett|cherokee|savannah|columbus/.test(path)){localStorage.setItem('oc_state','georgia');return'georgia';}
  return stored||'georgia';
}

/* ── Nav data ────────────────────────────────────────────── */
var NAV={personal:{georgia:[
  {label:'Homeowners Insurance',href:'/personal-insurance/homeowners-insurance'},
  {label:'Auto Insurance',href:'/personal-insurance/auto-insurance'},
  {label:'Umbrella Insurance',href:'/personal-insurance/umbrella-insurance'},
  {label:'Motorcycle Insurance',href:'/personal-insurance/motorcycle-insurance'},
  {label:'Boat Insurance',href:'/personal-insurance/boat-insurance'},
  {label:'Scheduled Articles',href:'/personal-insurance/scheduled-articles-insurance'},
  {label:'Collector Auto',href:'/personal-insurance/collector-auto-insurance'},
  {label:'Renters Insurance',href:'/personal-insurance/renters-insurance'},
  {label:'Condo Insurance',href:'/personal-insurance/condo-insurance'},
  {label:'Landlord Insurance',href:'/personal-insurance/landlord-insurance'},
  {label:'Short-Term Rental',href:'/personal-insurance/short-term-rental-insurance'},
  {label:'Flood Insurance',href:'/personal-insurance/flood-insurance'},
  {label:'Home Business',href:'/personal-insurance/home-business-insurance'},
  {label:'Jewelry Insurance',href:'/personal-insurance/jewelry-insurance'}
],california:[
  {label:'Homeowners Insurance',href:'/personal-insurance/homeowners-insurance-california'},
  {label:'Auto Insurance',href:'/personal-insurance/auto-insurance-california'},
  {label:'Umbrella Insurance',href:'/personal-insurance/umbrella-insurance-california'},
  {label:'Motorcycle Insurance',href:'/personal-insurance/motorcycle-insurance-california'},
  {label:'Boat Insurance',href:'/personal-insurance/boat-insurance-california'},
  {label:'Scheduled Articles',href:'/personal-insurance/scheduled-articles-insurance-california'},
  {label:'Collector Auto',href:'/personal-insurance/collector-auto-insurance-california'},
  {label:'Renters Insurance',href:'/personal-insurance/renters-insurance-california'},
  {label:'Condo Insurance',href:'/personal-insurance/condo-insurance-california'},
  {label:'Landlord Insurance',href:'/personal-insurance/landlord-insurance-california'},
  {label:'Short-Term Rental',href:'/personal-insurance/short-term-rental-insurance-california'},
  {label:'Flood Insurance',href:'/personal-insurance/flood-insurance-california'},
  {label:'Home Business',href:'/personal-insurance/home-business-insurance-california'},
  {label:'Jewelry Insurance',href:'/personal-insurance/jewelry-insurance-california'}
]},commercial:{global:[
  {label:'Business Owners Policy',href:'/commercial-insurance/business-owners-policy'},
  {label:'General Liability',href:'/commercial-insurance/general-liability-insurance'},
  {label:'Workers Compensation',href:'/commercial-insurance/workers-compensation-insurance'},
  {label:'Commercial Auto',href:'/commercial-insurance/commercial-auto-insurance'},
  {label:'Professional Liability',href:'/commercial-insurance/professional-liability-insurance'},
  {label:'Cyber Liability',href:'/commercial-insurance/cyber-liability-insurance'},
  {label:'Surety Bonds',href:'/commercial-insurance/surety-bonds-insurance'},
  {label:'Management Liability',href:'/commercial-insurance/management-liability-insurance'},
  {label:'Nonprofit Insurance',href:'/commercial-insurance/nonprofit-insurance'},
  {label:'Habitational',href:'/commercial-insurance/habitational-insurance'}
]},carriers:{georgia:[
  {label:'Travelers',href:'/carriers/travelers-insurance'},
  {label:'Progressive',href:'/carriers/progressive-insurance'},
  {label:'Nationwide',href:'/carriers/nationwide-insurance'},
  {label:'Safeco',href:'/carriers/safeco-insurance'},
  {label:'The Hartford',href:'/carriers/hartford-insurance'},
  {label:'Openly',href:'/carriers/openly-insurance'},
  {label:'Hippo',href:'/carriers/hippo-insurance'},
  {label:'Stillwater',href:'/carriers/stillwater-insurance'},
  {label:'Branch',href:'/carriers/branch-insurance'},
  {label:'Chubb',href:'/carriers/chubb-insurance'},
  {label:'AIG',href:'/carriers/aig-insurance'},
  {label:'RLI',href:'/carriers/rli-insurance'},
  {label:'Jewelers Mutual',href:'/carriers/jewelers-mutual-insurance'},
  {label:'Selective (Flood)',href:'/carriers/selective-insurance'}
],california:[
  {label:'Travelers',href:'/carriers/travelers-insurance-california'},
  {label:'Stillwater',href:'/carriers/stillwater-insurance-california'},
  {label:'Progressive',href:'/carriers/progressive-insurance-california'},
  {label:'Chubb',href:'/carriers/chubb-insurance-california'},
  {label:'AIG',href:'/carriers/aig-insurance-california'},
  {label:'RLI',href:'/carriers/rli-insurance-california'},
  {label:'Steadily',href:'/carriers/steadily-insurance-california'},
  {label:'Openly',href:'/carriers/openly-insurance-california'},
  {label:'Selective (Flood)',href:'/carriers/selective-insurance-california'},
  {label:'Jewelers Mutual',href:'/carriers/jewelers-mutual-insurance-california'}
]},locations:{georgia:[
  {label:'Insurance in Georgia',href:'/states/georgia'},
  {label:'North Atlanta',href:'/locations/north-atlanta'},
  {label:'Gwinnett County',href:'/locations/gwinnett-county'},
  {label:'Cherokee & Forsyth',href:'/locations/cherokee-forsyth-county'},
  {label:'Savannah',href:'/locations/savannah'},
  {label:'Columbus',href:'/locations/columbus'},
  {label:'Johns Creek',href:'/cities/fulton-county-johns-creek'},
  {label:'Alpharetta',href:'/cities/fulton-county-alpharetta'},
  {label:'Cumming',href:'/cities/forsyth-county-cumming'},
  {label:'Duluth',href:'/cities/gwinnett-county-duluth'},
  {label:'Lawrenceville',href:'/cities/gwinnett-county-lawrenceville'},
  {label:'Suwanee',href:'/cities/gwinnett-county-suwanee'},
  {label:'Sugar Hill',href:'/cities/gwinnett-county-sugar-hill'},
  {label:'Buford',href:'/cities/gwinnett-county-buford'}
],california:[
  {label:'Insurance in California',href:'/states/california'},
  {label:'Los Angeles Metro',href:'/locations/los-angeles-metro'},
  {label:'San Francisco Bay Area',href:'/locations/san-francisco-bay-area'},
  {label:'San Diego Metro',href:'/locations/san-diego-metro'},
  {label:'Sacramento Metro',href:'/locations/sacramento-metro'},
  {label:'Inland Empire',href:'/locations/inland-empire'}
]},about:[
  {label:'About Olive Cover',href:'/about'},
  {label:'FAQ',href:'/faq'},
  {label:'Contact Us',href:'/contact'},
  {label:'Coverage Review',href:'/coverage-review'}
]};

/* ── CSS ─────────────────────────────────────────────────── */
var CSS=['#ocnav-bar{position:fixed;top:0;left:0;right:0;z-index:99999;background:#1B3A5C;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;box-shadow:0 2px 8px rgba(0,0,0,.25);}','#ocnav-logo{display:flex;align-items:center;text-decoration:none;flex-shrink:0;}','#ocnav-logo img{height:36px;width:auto;}','#ocnav-links{display:flex;align-items:center;gap:4px;flex:1;justify-content:flex-end;}','.ocnav-item{position:relative;}','.ocnav-top{color:#fff;font-family:Inter,sans-serif;font-size:14px;font-weight:500;padding:8px 12px;border-radius:4px;cursor:pointer;white-space:nowrap;background:none;border:none;display:flex;align-items:center;gap:4px;text-decoration:none;}','.ocnav-top:hover{background:rgba(255,255,255,.12);}','.ocnav-top svg{width:12px;height:12px;fill:#fff;opacity:.7;}','.ocnav-dropdown{display:none;position:absolute;top:100%;left:0;background:#fff;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,.16);min-width:220px;padding:8px 0;z-index:100000;}','.ocnav-dropdown.right{left:auto;right:0;}','.ocnav-item:hover .ocnav-dropdown{display:block;}','.ocnav-dropdown a{display:block;padding:8px 16px;color:#1B3A5C;font-family:Inter,sans-serif;font-size:14px;font-weight:400;text-decoration:none;white-space:nowrap;}','.ocnav-dropdown a:hover{background:#F2F4F8;color:#1B3A5C;}','.ocnav-dropdown-section{padding:4px 0;border-top:1px solid #E5E7EB;}','.ocnav-dropdown-section:first-child{border-top:none;}','.ocnav-section-label{display:block;padding:6px 16px 2px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#666;font-family:Inter,sans-serif;}','.ocnav-state-btn{color:#C7A24B;font-family:Inter,sans-serif;font-size:13px;font-weight:500;padding:6px 10px;border:1px solid rgba(199,162,75,.5);border-radius:4px;cursor:pointer;background:none;white-space:nowrap;}','.ocnav-state-btn:hover{background:rgba(199,162,75,.15);}','#ocnav-mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px;}','#ocnav-mobile-toggle span{display:block;width:22px;height:2px;background:#fff;margin:4px 0;transition:all .2s;}','#ocnav-mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;bottom:0;background:#1B3A5C;overflow-y:auto;z-index:99998;padding:16px 0;}','#ocnav-mobile-menu.open{display:block;}','.ocnav-mobile-section{border-bottom:1px solid rgba(255,255,255,.1);}','.ocnav-mobile-head{color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:600;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;}','.ocnav-mobile-head svg{width:14px;height:14px;fill:#fff;opacity:.7;transition:transform .2s;}','.ocnav-mobile-head.open svg{transform:rotate(180deg);}','.ocnav-mobile-links{display:none;padding:0 0 8px;}','.ocnav-mobile-links.open{display:block;}','.ocnav-mobile-links a{display:block;color:rgba(255,255,255,.8);font-family:Inter,sans-serif;font-size:14px;padding:10px 36px;text-decoration:none;}','.ocnav-mobile-links a:hover{color:#fff;}','.ocnav-mobile-cta{display:block;background:#C7A24B;color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:600;text-align:center;padding:14px 24px;margin:16px 24px;border-radius:6px;text-decoration:none;}','@media(max-width:900px){#ocnav-links{display:none;}#ocnav-mobile-toggle{display:block;}}','body{padding-top:64px!important;}'].join('');

var LOGO='https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
var chevron='<svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg>';

function li(items){return items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('');}
function sec(label,items){return'<div class="ocnav-dropdown-section"><span class="ocnav-section-label">'+label+'</span>'+li(items)+'</div>';}
function dd(cls,html){return'<div class="ocnav-dropdown'+(cls?' '+cls:'')+'" >'+html+'</div>';}
function btn(label,content,r){return'<div class="ocnav-item"><button class="ocnav-top">'+label+' '+chevron+'</button>'+dd(r?'right':'',content)+'</div>';}

function switchState(e){e.preventDefault();var cur=localStorage.getItem('oc_state')||'georgia';var next=cur==='georgia'?'california':'georgia';localStorage.setItem('oc_state',next);window.location.href=next==='california'?'/states/california':'/states/georgia';}

function buildNav(){
  if(document.getElementById('ocnav-bar'))return;
  var state=detectState();
  var stateLabel=state==='california'?'CA':'GA';
  var stateToggle=state==='california'?'Switch to Georgia':'Switch to California';

  var style=document.createElement('style');
  style.textContent=CSS;
  document.head.appendChild(style);

  var p=NAV.personal[state]||NAV.personal.georgia;
  var c=NAV.carriers[state]||NAV.carriers.georgia;
  var l=NAV.locations[state]||NAV.locations.georgia;

  var links=[
    btn('Personal Lines',sec('Personal Lines',p.slice(0,7))+sec('More Coverage',p.slice(7))),
    btn('Commercial Lines',sec('Commercial Lines',NAV.commercial.global.slice(0,5))+sec('More Commercial',NAV.commercial.global.slice(5))),
    btn('Carriers',sec('Carriers',c)),
    btn('Locations',sec('Locations',l)),
    btn('About',sec('',NAV.about),true),
    '<a class="ocnav-top" href="/coverage-review" style="background:#C7A24B;border-radius:4px;margin-left:4px;">Coverage Review</a>',
    '<button class="ocnav-state-btn" onclick="window.__ocSwitchState(event)">State: '+stateLabel+'</button>'
  ].join('');

  function msec(title,items){return'<div class="ocnav-mobile-section"><div class="ocnav-mobile-head" onclick="this.classList.toggle(\'open\');this.nextElementSibling.classList.toggle(\'open\')">'+title+' '+chevron+'</div><div class="ocnav-mobile-links">'+items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('')+'</div></div>';}

  var mob=[msec('Personal Lines',p),msec('Commercial Lines',NAV.commercial.global),msec('Carriers',c),msec('Locations',l),msec('About',NAV.about),'<a class="ocnav-mobile-cta" href="/coverage-review">Start Coverage Review</a>','<div style="text-align:center;padding:0 24px 24px;"><button class="ocnav-state-btn" onclick="window.__ocSwitchState(event)">'+stateToggle+'</button></div>'].join('');

  var bar=document.createElement('nav');
  bar.id='ocnav-bar';
  bar.innerHTML='<a id="ocnav-logo" href="/"><img src="'+LOGO+'" alt="Olive Cover"></a><div id="ocnav-links">'+links+'</div><button id="ocnav-mobile-toggle" onclick="document.getElementById(\'ocnav-mobile-menu\').classList.toggle(\'open\')"><span></span><span></span><span></span></button>';

  var mob_menu=document.createElement('div');
  mob_menu.id='ocnav-mobile-menu';
  mob_menu.innerHTML=mob;

  document.body.insertBefore(mob_menu,document.body.firstChild);
  document.body.insertBefore(bar,document.body.firstChild);

  window.__ocSwitchState=switchState;
  hideOldNav();
  setTimeout(hideOldNav,500);
  setTimeout(hideOldNav,1500);
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',buildNav);}else{buildNav();}
})();
