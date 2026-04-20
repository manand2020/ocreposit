/* ocnavcms v31.4.0 | Olive Cover | CMS-driven multistate nav */
(function(){
'use strict';

var COLLECTION_ID = '69e2c474742df85703a42d14';
var LOGO = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
var chevron = '<svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg>';

/* ── State flags map ─────────────────────────────────────── */
var FLAGS = {georgia:'🍑',california:'🌴',texas:'⭐',florida:'🌊',nevada:'🎲',arizona:'🌵',colorado:'⛰️',oregon:'🌲',washington:'🌧️'};

/* ── State detection ─────────────────────────────────────── */
function detectState(states){
  var path = window.location.pathname;
  var stored = localStorage.getItem('oc_state');
  for(var i=0;i<states.length;i++){
    if(path.indexOf(states[i].slug)>-1){
      localStorage.setItem('oc_state',states[i].slug);
      return states[i].slug;
    }
  }
  return stored||'georgia';
}

/* ── Fetch states from CMS ───────────────────────────────── */
function fetchStates(token, cb){
  var cached = sessionStorage.getItem('oc_states');
  if(cached){try{return cb(JSON.parse(cached));}catch(e){}}
  fetch('https://api.webflow.com/v2/collections/'+COLLECTION_ID+'/items?limit=100',{
    headers:{'Authorization':'Bearer '+token,'accept':'application/json'}
  }).then(function(r){return r.json();})
  .then(function(data){
    var items = (data.items||[])
      .filter(function(i){return i.fieldData['is-active']!==false;})
      .map(function(i){return{
        slug: i.fieldData.slug,
        name: i.fieldData.name,
        flag: FLAGS[i.fieldData.slug]||'📍',
        path: '/states/'+i.fieldData.slug
      };});
    if(items.length){sessionStorage.setItem('oc_states',JSON.stringify(items));}
    cb(items.length ? items : fallbackStates());
  }).catch(function(){cb(fallbackStates());});
}

function fallbackStates(){
  return[
    {slug:'georgia',name:'Georgia',flag:'🍑',path:'/states/georgia'},
    {slug:'california',name:'California',flag:'🌴',path:'/states/california'}
  ];
}

/* ── Nav data ────────────────────────────────────────────── */
var NAV = {
  personal:{
    georgia:[
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
    ],
    california:[
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
    ]
  },
  commercial:{global:[
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
  ]},
  carriers:{
    georgia:[
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
    ],
    california:[
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
    ]
  },
  locations:{
    georgia:[
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
    ],
    california:[
      {label:'Insurance in California',href:'/states/california'},
      {label:'Los Angeles Metro',href:'/locations/los-angeles-metro'},
      {label:'San Francisco Bay Area',href:'/locations/san-francisco-bay-area'},
      {label:'San Diego Metro',href:'/locations/san-diego-metro'},
      {label:'Sacramento Metro',href:'/locations/sacramento-metro'},
      {label:'Inland Empire',href:'/locations/inland-empire'}
    ]
  },
  about:[
    {label:'About Olive Cover',href:'/about'},
    {label:'FAQ',href:'/faq'},
    {label:'Contact Us',href:'/contact'},
    {label:'Coverage Review',href:'/coverage-review'}
  ]
};

/* ── CSS ─────────────────────────────────────────────────── */
var CSS=[
  '#ocnav-bar{position:fixed;top:0;left:0;right:0;width:100%;max-width:none!important;z-index:99999;background:#1B3A5C;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;box-shadow:0 2px 8px rgba(0,0,0,.25);box-sizing:border-box;}',
  '#ocnav-logo{display:flex;align-items:center;text-decoration:none;flex-shrink:0;}',
  '#ocnav-logo img{height:36px;width:auto;}',
  '#ocnav-links{display:flex;align-items:center;gap:2px;flex:1;justify-content:flex-end;}',
  '.ocnav-item{position:relative;}',
  '.ocnav-top{color:#fff;font-family:Inter,sans-serif;font-size:14px;font-weight:500;padding:8px 10px;border-radius:4px;cursor:pointer;white-space:nowrap;background:none;border:none;display:flex;align-items:center;gap:4px;text-decoration:none;}',
  '.ocnav-top:hover{background:rgba(255,255,255,.12);}',
  '.ocnav-top svg{width:10px;height:10px;fill:#fff;opacity:.7;}',
  '.ocnav-dropdown{display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,.18);min-width:220px;padding:8px 0;z-index:100000;}',
  '.ocnav-dropdown.right{left:auto;right:0;}',
  '.ocnav-item.open .ocnav-dropdown{display:block;}',
  '.ocnav-dropdown a{display:block;padding:8px 16px;color:#1B3A5C;font-family:Inter,sans-serif;font-size:13px;font-weight:400;text-decoration:none;white-space:nowrap;}',
  '.ocnav-dropdown a:hover{background:#F2F4F8;}',
  '.ocnav-dropdown-section{padding:4px 0;border-top:1px solid #E5E7EB;}',
  '.ocnav-dropdown-section:first-child{border-top:none;}',
  '.ocnav-section-label{display:block;padding:6px 16px 2px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#999;font-family:Inter,sans-serif;}',
  '.ocnav-dropdown.cols{min-width:560px;}',
  '.ocnav-dropdown.cols .ocnav-dropdown-section{border-top:none;}',
  '.ocnav-dropdown-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding:8px 0;}',
  '.ocnav-col-head{display:block;padding:8px 16px 4px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#999;font-family:Inter,sans-serif;}',
  '.ocnav-col a{display:block;padding:7px 16px;color:#1B3A5C;font-family:Inter,sans-serif;font-size:13px;font-weight:400;text-decoration:none;white-space:nowrap;}',
  '.ocnav-col a:hover{background:#F2F4F8;}',
  '.ocnav-state-item{position:relative;}',
  '.ocnav-state-btn{color:#C7A24B;font-family:Inter,sans-serif;font-size:13px;font-weight:600;padding:6px 10px;border:1px solid rgba(199,162,75,.6);border-radius:4px;cursor:pointer;background:none;white-space:nowrap;display:flex;align-items:center;gap:5px;}',
  '.ocnav-state-btn:hover{background:rgba(199,162,75,.12);}',
  '.ocnav-state-btn svg{width:10px;height:10px;fill:#C7A24B;}',
  '.ocnav-state-dropdown{display:none;position:absolute;top:calc(100% + 4px);right:0;background:#fff;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,.18);min-width:200px;padding:8px 0;z-index:100000;}',
  '.ocnav-state-item.open .ocnav-state-dropdown{display:block;}',
  '.ocnav-state-option{display:flex;align-items:center;gap:10px;padding:10px 16px;color:#1B3A5C;font-family:Inter,sans-serif;font-size:14px;text-decoration:none;cursor:pointer;border:none;background:none;width:100%;text-align:left;}',
  '.ocnav-state-option:hover{background:#F2F4F8;}',
  '.ocnav-state-option.active{font-weight:700;background:#F9F7F3;}',
  '.ocnav-state-option .oc-flag{font-size:16px;line-height:1;}',
  '.ocnav-state-option .oc-name{flex:1;}',
  '.ocnav-state-option .oc-check{color:#C7A24B;}',
  '.ocnav-state-header{display:block;padding:6px 16px 4px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#999;font-family:Inter,sans-serif;}',
  '.ocnav-state-loading{padding:12px 16px;color:#999;font-family:Inter,sans-serif;font-size:13px;}',
  '#ocnav-cta{background:#C7A24B;color:#fff!important;font-family:Inter,sans-serif;font-size:14px;font-weight:600;padding:8px 14px;border-radius:4px;text-decoration:none;white-space:nowrap;margin-left:4px;}',
  '#ocnav-cta:hover{background:#b8913e;}',
  '#ocnav-mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px;}',
  '#ocnav-mobile-toggle span{display:block;width:22px;height:2px;background:#fff;margin:4px 0;}',
  '#ocnav-mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;bottom:0;background:#1B3A5C;overflow-y:auto;z-index:99998;padding:16px 0;}',
  '#ocnav-mobile-menu.open{display:block;}',
  '.ocnav-mobile-section{border-bottom:1px solid rgba(255,255,255,.1);}',
  '.ocnav-mobile-head{color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:600;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;}',
  '.ocnav-mobile-head svg{width:14px;height:14px;fill:#fff;opacity:.7;transition:transform .2s;}',
  '.ocnav-mobile-head.open svg{transform:rotate(180deg);}',
  '.ocnav-mobile-links{display:none;padding:0 0 8px;}',
  '.ocnav-mobile-links.open{display:block;}',
  '.ocnav-mobile-links a{display:block;color:rgba(255,255,255,.8);font-family:Inter,sans-serif;font-size:14px;padding:10px 36px;text-decoration:none;}',
  '.ocnav-mobile-cta{display:block;background:#C7A24B;color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:600;text-align:center;padding:14px 24px;margin:16px 24px;border-radius:6px;text-decoration:none;}',
  '.ocnav-mobile-state{padding:16px 24px;border-top:1px solid rgba(255,255,255,.1);}',
  '.ocnav-mobile-state-label{color:rgba(255,255,255,.5);font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;}',
  '.ocnav-mobile-state-opt{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.8);font-family:Inter,sans-serif;font-size:15px;padding:10px 0;cursor:pointer;border:none;background:none;width:100%;text-align:left;}',
  '.ocnav-mobile-state-opt.active{color:#C7A24B;font-weight:700;}',
  '@media(max-width:900px){#ocnav-links{display:none;}#ocnav-mobile-toggle{display:block;}}',
  'body{padding-top:64px!important;}.w-nav{display:none!important;}'
].join('');

/* ── Helpers ─────────────────────────────────────────────── */
function li(items){return items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('');}
function sec(label,items){return'<div class="ocnav-dropdown-section">'+(label?'<span class="ocnav-section-label">'+label+'</span>':'')+li(items)+'</div>';}
function dd(cls,html){return'<div class="ocnav-dropdown'+(cls?' '+cls:'')+'">'+html+'</div>';}
function coldd(cols3,r){
  var html='<div class="ocnav-dropdown-cols">';
  cols3.forEach(function(col){
    html+='<div class="ocnav-col">';
    if(col.head) html+='<span class="ocnav-col-head">'+col.head+'</span>';
    col.items.forEach(function(i){html+='<a href="'+i.href+'">'+i.label+'</a>';});
    html+='</div>';
  });
  html+='</div>';
  return'<div class="ocnav-dropdown cols'+(r?' right':'')+'">'+html+'</div>';
}
function btn(label,content,r){return'<div class="ocnav-item"><button class="ocnav-top">'+label+' '+chevron+'</button>'+dd(r?'right':'',content)+'</div>';}

/* ── Build state dropdown HTML ───────────────────────────── */
function buildStateDropdown(states, currentSlug){
  var current = states.filter(function(s){return s.slug===currentSlug;})[0]||states[0];
  var options = states.map(function(s){
    var active = s.slug===currentSlug;
    return '<button class="ocnav-state-option'+(active?' active':'')+'" onclick="window.__ocSetState(\''+s.slug+'\')">'+'<span class="oc-flag">'+s.flag+'</span>'+'<span class="oc-name">'+s.name+'</span>'+(active?'<span class="oc-check">&#10003;</span>':'')+'</button>';
  }).join('');
  return '<div class="ocnav-state-item">'+
    '<button class="ocnav-state-btn">'+current.flag+' '+current.name+' '+chevron+'</button>'+
    '<div class="ocnav-state-dropdown">'+
      '<span class="ocnav-state-header">Select your state</span>'+
      options+
    '</div>'+
  '</div>';
}

function buildMobileStateSection(states, currentSlug){
  var opts = states.map(function(s){
    var active = s.slug===currentSlug;
    return '<button class="ocnav-mobile-state-opt'+(active?' active':'')+'" onclick="window.__ocSetState(\''+s.slug+'\')">'+s.flag+' '+s.name+(active?' &#10003;':'')+'</button>';
  }).join('');
  return '<div class="ocnav-mobile-state"><div class="ocnav-mobile-state-label">Select your state</div>'+opts+'</div>';
}

/* ── Update switcher after CMS fetch ─────────────────────── */
function updateSwitcher(states, currentSlug){
  var item = document.getElementById('oc-state-switcher');
  if(item) item.outerHTML = buildStateDropdown(states, currentSlug);
  var mob = document.getElementById('oc-mobile-state');
  if(mob) mob.outerHTML = buildMobileStateSection(states, currentSlug);
}

/* ── Set state ───────────────────────────────────────────── */
function setStateAndNavigate(slug){
  localStorage.setItem('oc_state', slug);
  sessionStorage.removeItem('oc_states');
  window.location.href = '/states/'+slug;
}

/* ── Build nav ───────────────────────────────────────────── */
function buildNav(){
  if(document.getElementById('ocnav-bar')) return;

  var token = window._ocToken;
  var currentSlug = detectState([{slug:'georgia'},{slug:'california'}]);
  var p = NAV.personal[currentSlug]||NAV.personal.georgia;
  var c = NAV.carriers[currentSlug]||NAV.carriers.georgia;
  var l = NAV.locations[currentSlug]||NAV.locations.georgia;

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* Build with loading placeholder for state switcher */
  var links = [
    '<div class="ocnav-item"><button class="ocnav-top">Personal Lines '+chevron+'</button>'+coldd([{head:'Home & Property',items:p.slice(0,5)},{head:'Auto & Recreation',items:p.slice(5,9)},{head:'More Coverage',items:p.slice(9)}])+'</div>',
    '<div class="ocnav-item"><button class="ocnav-top">Commercial Lines '+chevron+'</button>'+coldd([{head:'Core Lines',items:NAV.commercial.global.slice(0,4)},{head:'Specialty Lines',items:NAV.commercial.global.slice(4,7)},{head:'More',items:NAV.commercial.global.slice(7)}])+'</div>',
    '<div class="ocnav-item"><button class="ocnav-top">Carriers '+chevron+'</button>'+coldd([{head:'Top Carriers',items:c.slice(0,5)},{head:'More Carriers',items:c.slice(5,10)},{head:'',items:c.slice(10)}])+'</div>',
    btn('Locations', sec('Locations',l)),
    btn('About', sec('',NAV.about), true),
    '<a id="ocnav-cta" href="/coverage-review">Coverage Review</a>',
    '<div id="oc-state-switcher"><div class="ocnav-state-item"><button class="ocnav-state-btn"><span class="ocnav-state-loading">...</span></button></div></div>'
  ].join('');

  function msec(title,items){
    return '<div class="ocnav-mobile-section">'+
      '<div class="ocnav-mobile-head" onclick="this.classList.toggle(\'open\');this.nextElementSibling.classList.toggle(\'open\')">'+title+' '+chevron+'</div>'+
      '<div class="ocnav-mobile-links">'+items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('')+'</div>'+
    '</div>';
  }

  var mob = [
    msec('Personal Lines',p),
    msec('Commercial Lines',NAV.commercial.global),
    msec('Carriers',c),
    msec('Locations',l),
    msec('About',NAV.about),
    '<a class="ocnav-mobile-cta" href="/coverage-review">Start Coverage Review</a>',
    '<div id="oc-mobile-state"></div>'
  ].join('');

  var bar = document.createElement('nav');
  bar.id = 'ocnav-bar';
  bar.innerHTML =
    '<a id="ocnav-logo" href="/"><img src="'+LOGO+'" alt="Olive Cover"></a>'+
    '<div id="ocnav-links">'+links+'</div>'+
    '<button id="ocnav-mobile-toggle" onclick="document.getElementById(\'ocnav-mobile-menu\').classList.toggle(\'open\')">'+
      '<span></span><span></span><span></span>'+
    '</button>';

  var mobileMenu = document.createElement('div');
  mobileMenu.id = 'ocnav-mobile-menu';
  mobileMenu.innerHTML = mob;

  document.body.insertBefore(mobileMenu, document.body.firstChild);
  document.body.insertBefore(bar, document.body.firstChild);

  window.__ocSetState = setStateAndNavigate;

  /* ── Hover with delay so mouse can travel to dropdown ── */
  var _timer = null;
  document.querySelectorAll('.ocnav-item, .ocnav-state-item').forEach(function(item){
    item.addEventListener('mouseenter', function(){
      clearTimeout(_timer);
      // Close all others
      document.querySelectorAll('.ocnav-item.open, .ocnav-state-item.open').forEach(function(o){
        if(o !== item) o.classList.remove('open');
      });
      item.classList.add('open');
    });
    item.addEventListener('mouseleave', function(){
      var self = item;
      _timer = setTimeout(function(){ self.classList.remove('open'); }, 150);
    });
    // Keep open when mouse enters the dropdown
    var dd = item.querySelector('.ocnav-dropdown, .ocnav-state-dropdown');
    if(dd){
      dd.addEventListener('mouseenter', function(){ clearTimeout(_timer); });
      dd.addEventListener('mouseleave', function(){
        _timer = setTimeout(function(){ item.classList.remove('open'); }, 150);
      });
    }
  });

  /* Close dropdowns on outside click */
  document.addEventListener('click', function(e){
    if(!e.target.closest('.ocnav-item') && !e.target.closest('.ocnav-state-item')){
      document.querySelectorAll('.ocnav-item.open, .ocnav-state-item.open').forEach(function(o){
        o.classList.remove('open');
      });
    }
  });

  /* Fetch states from CMS and update switcher */
  if(token){
    fetchStates(token, function(states){
      var slug = detectState(states);
      updateSwitcher(states, slug);
      /* Also update nav links if state changed after detection */
      var p2 = NAV.personal[slug]||NAV.personal.georgia;
      var c2 = NAV.carriers[slug]||NAV.carriers.georgia;
      var l2 = NAV.locations[slug]||NAV.locations.georgia;
      /* Links already built correctly from initial detection -- no rebuild needed */
    });
  } else {
    /* No token -- use fallback states */
    updateSwitcher(fallbackStates(), currentSlug);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', buildNav);
} else {
  buildNav();
}

})();
