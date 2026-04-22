/* ocnavcms v31.5.2 | Olive Cover | CMS-driven multistate nav + gradient hero overlays | city URL fix Apr22 */
(function(){
'use strict';

var COLLECTION_ID = '69e2c474742df85703a42d14';
var LOGO = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
var chevron = '<svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg>';

var FLAGS = {georgia:'',california:'',texas:'',florida:'',nevada:'',arizona:'',colorado:'',oregon:'',washington:''};

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
        flag: FLAGS[i.fieldData.slug]||'',
        path: '/states/'+i.fieldData.slug
      };});
    if(items.length){sessionStorage.setItem('oc_states',JSON.stringify(items));}
    cb(items.length ? items : fallbackStates());
  }).catch(function(){cb(fallbackStates());});
}

function fallbackStates(){
  return[
    {slug:'georgia',name:'Georgia',flag:'',path:'/states/georgia'},
    {slug:'california',name:'California',flag:'',path:'/states/california'}
  ];
}

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
      {label:'Johns Creek',href:'/cities/georgia-johns-creek'},
      {label:'Alpharetta',href:'/cities/georgia-alpharetta'},
      {label:'Cumming',href:'/cities/georgia-cumming'},
      {label:'Duluth',href:'/cities/georgia-duluth'},
      {label:'Lawrenceville',href:'/cities/georgia-lawrenceville'},
      {label:'Suwanee',href:'/cities/georgia-suwanee'},
      {label:'Sugar Hill',href:'/cities/georgia-sugar-hill'},
      {label:'Buford',href:'/cities/georgia-buford'}
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
    {label:'Coverage Review',href:'/coverage-review'},
    {label:'Where We Do Business',href:'/where-we-do-business'}
  ]
};

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

function buildStateDropdown(states, currentSlug){
  var current = states.filter(function(s){return s.slug===currentSlug;})[0]||states[0];
  var options = states.map(function(s){
    var active = s.slug===currentSlug;
    return '<button class="ocnav-state-option'+(active?' active':'')+'" onclick="window.__ocSetState(\''+s.slug+'\')">'+''+'<span class="oc-name">'+s.name+'</span>'+(active?'<span class="oc-check">&#10003;</span>':'')+'</button>';
  }).join('');
  return '<div class="ocnav-state-item">'+
    '<button class="ocnav-state-btn">'+current.name+' '+chevron+'</button>'+
    '<div class="ocnav-state-dropdown">'+
      '<span class="ocnav-state-header">Select your state</span>'+
      options+
    '</div>'+
  '</div>';
}

function buildMobileStateSection(states, currentSlug){
  var opts = states.map(function(s){
    var active = s.slug===currentSlug;
    return '<button class="ocnav-mobile-state-opt'+(active?' active':'')+'" onclick="window.__ocSetState(\''+s.slug+'\')">'+s.name+(active?' &#10003;':'')+'</button>';
  }).join('');
  return '<div class="ocnav-mobile-state"><div class="ocnav-mobile-state-label">Select your state</div>'+opts+'</div>';
}

function updateSwitcher(states, currentSlug){
  var item = document.getElementById('oc-state-switcher');
  if(item) item.outerHTML = buildStateDropdown(states, currentSlug);
  var mob = document.getElementById('oc-mobile-state');
  if(mob) mob.outerHTML = buildMobileStateSection(states, currentSlug);
}

function setStateAndNavigate(slug){
  localStorage.setItem('oc_state', slug);
  sessionStorage.removeItem('oc_states');
  window.location.href = '/states/'+slug;
}

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

  var links = [
    '<div class="ocnav-item"><button class="ocnav-top">Personal Lines '+chevron+'</button>'+coldd([{head:'Home & Property',items:p.slice(0,5)},{head:'Auto & Recreation',items:p.slice(5,9)},{head:'More Coverage',items:p.slice(9)}])+'</div>',
    '<div class="ocnav-item"><button class="ocnav-top">Commercial Lines '+chevron+'</button>'+coldd([{head:'Core Lines',items:NAV.commercial.global.slice(0,4)},{head:'Specialty Lines',items:NAV.commercial.global.slice(4,7)},{head:'More',items:NAV.commercial.global.slice(7)}])+'</div>',
    '<div class="ocnav-item"><button class="ocnav-top">Carriers '+chevron+'</button>'+coldd([{head:'Top Carriers',items:c.slice(0,5)},{head:'More Carriers',items:c.slice(5,10)},{head:'',items:c.slice(10)}])+'</div>',
    btn('Locations', sec('Locations',l)),
    btn('About', sec('',NAV.about), true),
    '<a id="ocnav-cta" href="/coverage-review">Coverage Review</a>',
    '<div id="oc-state-switcher"><div class="ocnav-state-item"><button class="ocnav-state-btn"><span class="ocnav-state-loading">...</span></button></div></div>'
  ].join('');

  var mobileSections = [
    '<div class="ocnav-mobile-section"><div class="ocnav-mobile-head">Personal Lines <svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg></div><div class="ocnav-mobile-links">'+li(p)+'</div></div>',
    '<div class="ocnav-mobile-section"><div class="ocnav-mobile-head">Commercial Lines <svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg></div><div class="ocnav-mobile-links">'+li(NAV.commercial.global)+'</div></div>',
    '<div class="ocnav-mobile-section"><div class="ocnav-mobile-head">Carriers <svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg></div><div class="ocnav-mobile-links">'+li(c)+'</div></div>',
    '<div class="ocnav-mobile-section"><div class="ocnav-mobile-head">Locations <svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg></div><div class="ocnav-mobile-links">'+li(l)+'</div></div>',
    '<div class="ocnav-mobile-section"><div class="ocnav-mobile-head">About <svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg></div><div class="ocnav-mobile-links">'+li(NAV.about)+'</div></div>',
    '<a class="ocnav-mobile-cta" href="/coverage-review">Coverage Review</a>',
    '<div id="oc-mobile-state"><div class="ocnav-mobile-state"><div class="ocnav-mobile-state-label">Select your state</div></div></div>'
  ].join('');

  var bar = document.createElement('div');
  bar.id = 'ocnav-bar';
  bar.innerHTML =
    '<a id="ocnav-logo" href="/"><img src="'+LOGO+'" alt="Olive Cover"></a>'+
    '<div id="ocnav-links">'+links+'</div>'+
    '<button id="ocnav-mobile-toggle" aria-label="Menu"><span></span><span></span><span></span></button>';
  document.body.insertBefore(bar, document.body.firstChild);

  var mob = document.createElement('div');
  mob.id = 'ocnav-mobile-menu';
  mob.innerHTML = mobileSections;
  document.body.insertBefore(mob, bar.nextSibling);

  /* Hover with delay */
  var delay = 150, timers = {};
  document.querySelectorAll('.ocnav-item').forEach(function(item){
    item.addEventListener('mouseenter', function(){
      clearTimeout(timers[item]);
      timers[item] = setTimeout(function(){item.classList.add('open');}, delay);
    });
    item.addEventListener('mouseleave', function(){
      clearTimeout(timers[item]);
      timers[item] = setTimeout(function(){item.classList.remove('open');}, delay);
    });
  });
  document.querySelectorAll('.ocnav-state-item').forEach(function(item){
    item.addEventListener('mouseenter', function(){item.classList.add('open');});
    item.addEventListener('mouseleave', function(){item.classList.remove('open');});
  });

  /* Mobile toggles */
  document.getElementById('ocnav-mobile-toggle').addEventListener('click', function(){
    document.getElementById('ocnav-mobile-menu').classList.toggle('open');
  });
  document.querySelectorAll('.ocnav-mobile-head').forEach(function(h){
    h.addEventListener('click', function(){
      h.classList.toggle('open');
      var links = h.nextElementSibling;
      if(links) links.classList.toggle('open');
    });
  });

  /* Close on outside click */
  document.addEventListener('click', function(e){
    if(!e.target.closest('.ocnav-item')) document.querySelectorAll('.ocnav-item').forEach(function(i){i.classList.remove('open');});
    if(!e.target.closest('.ocnav-state-item')) document.querySelectorAll('.ocnav-state-item').forEach(function(i){i.classList.remove('open');});
  });

  /* State switcher */
  window.__ocSetState = setStateAndNavigate;
  if(token){
    fetchStates(token, function(states){
      var slug = detectState(states);
      updateSwitcher(states, slug);
      /* Update nav links for detected state */
      var np = NAV.personal[slug]||NAV.personal.georgia;
      var nc = NAV.carriers[slug]||NAV.carriers.georgia;
      var nl = NAV.locations[slug]||NAV.locations.georgia;
      /* Rebuild personal/carriers/locations cols */
      var cols = document.querySelectorAll('.ocnav-dropdown.cols');
      if(cols[0]) cols[0].querySelector('.ocnav-dropdown-cols').innerHTML =
        [{head:'Home & Property',items:np.slice(0,5)},{head:'Auto & Recreation',items:np.slice(5,9)},{head:'More Coverage',items:np.slice(9)}]
        .map(function(col){return'<div class="ocnav-col"><span class="ocnav-col-head">'+col.head+'</span>'+col.items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('')+'</div>';}).join('');
      if(cols[2]) cols[2].querySelector('.ocnav-dropdown-cols').innerHTML =
        [{head:'Top Carriers',items:nc.slice(0,5)},{head:'More Carriers',items:nc.slice(5,10)},{head:'',items:nc.slice(10)}]
        .map(function(col){return'<div class="ocnav-col">'+(col.head?'<span class="ocnav-col-head">'+col.head+'</span>':'')+col.items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('')+'</div>';}).join('');
      var locdd = document.querySelectorAll('.ocnav-dropdown')[3];
      if(locdd) locdd.innerHTML = sec('Locations', nl);
    });
  }
}

/* Ã¢ÂÂÃ¢ÂÂ fixFooter Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixFooter(){
  document.querySelectorAll('a').forEach(function(a){
    if(a.textContent.trim()==='About Mahesh') a.textContent = 'About Olive Cover';
  });
}

/* Ã¢ÂÂÃ¢ÂÂ fixCarrierText Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixCarrierText(){
  var state = localStorage.getItem('oc_state')||'georgia';
  if(state!=='california') return;
  document.querySelectorAll('*').forEach(function(el){
    if(el.children.length) return;
    if(el.textContent.indexOf('appointed in Georgia')>-1)
      el.textContent = el.textContent.replace(/appointed in Georgia/g,'appointed in California');
    if(el.textContent.indexOf('Georgia Range')>-1)
      el.textContent = el.textContent.replace(/Georgia Range/g,'California Range');
  });
}

/* Ã¢ÂÂÃ¢ÂÂ fixTrustBar Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixTrustBar(){
  var badges = document.querySelectorAll('.oc-trust-badge');
  badges.forEach(function(b,i){
    if(i>0 && !b.previousElementSibling.classList.contains('oc-trust-sep')){
      var sep = document.createElement('span');
      sep.className = 'oc-trust-sep';
      sep.style.cssText = 'color:rgba(255,255,255,.4);margin:0 4px;';
      sep.textContent = '|';
      b.parentNode.insertBefore(sep, b);
    }
  });
}

/* Ã¢ÂÂÃ¢ÂÂ fixAboutPage Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixAboutPage(){
  if(window.location.pathname !== '/about') return;
  setTimeout(function(){
    document.querySelectorAll('p,div').forEach(function(el){
      if(el.textContent.indexOf('We also serve Georgia broadly')>-1) el.remove();
    });
    var licSection = document.querySelector('.oc-about-license');
    if(licSection){
      licSection.innerHTML = '<a href="/where-we-do-business" style="color:#C7A24B;font-family:Inter,sans-serif;font-size:14px;">View licensed states and compliance details</a>';
    }
  }, 300);
}

/* Ã¢ÂÂÃ¢ÂÂ fixHomePage (redundant backup to ochomefaq) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixHomePage(){
  if(window.location.pathname !== '/') return;
  if(document.getElementById('oc-hcss-backup')) return;
  var s = document.createElement('style');
  s.id = 'oc-hcss-backup';
  s.textContent = [
    /* Gradient overlay -- photo visible, text legible */
    '.oc-hero-overlay{position:absolute!important;inset:0!important;background:linear-gradient(105deg,rgba(27,58,92,0.82) 0%,rgba(27,58,92,0.48) 55%,rgba(27,58,92,0.18) 100%)!important;z-index:1!important;}',
    '.oc-cta-overlay{position:absolute!important;inset:0!important;background:linear-gradient(180deg,rgba(27,58,92,0.55) 0%,rgba(27,58,92,0.80) 100%)!important;z-index:1!important;}',
    '.oc-coverage-section{background:#fff!important;padding:80px 24px!important;}',
    '.oc-coverage-inner{max-width:1200px;margin:0 auto;}',
    '.oc-coverage-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:32px;}',
    '.oc-coverage-card{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:24px;}',
    '.oc-gaps-section{background:#1B3A5C!important;padding:80px 24px!important;color:#fff!important;}',
    '.oc-gaps-inner{max-width:1200px;margin:0 auto;}',
    '.oc-why-section{background:#F2F4F8!important;padding:80px 24px!important;}',
    '.oc-why-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}',
    '#oc-why-photo-img{background-image:url("https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=840&q=80");background-size:cover;background-position:center;border-radius:8px;min-height:400px;}',
    '.oc-testimonials-section{background:#fff!important;padding:80px 24px!important;}',
    '.oc-testi-inner{max-width:1200px;margin:0 auto;}',
    '.oc-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:32px;}',
    '.oc-testi-card{background:#F9F7F3;border:1px solid #E5E7EB;border-radius:8px;padding:24px;}',
    '.oc-cta-section{position:relative!important;overflow:hidden!important;padding:80px 24px!important;}',
    '.oc-cta-bg{position:absolute!important;inset:0!important;background-image:url("https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80")!important;background-size:cover!important;background-position:center!important;}',
    '@media(max-width:900px){.oc-coverage-grid,.oc-testi-grid{grid-template-columns:1fr!important;}.oc-why-inner{grid-template-columns:1fr!important;}}'
  ].join('');
  document.head.appendChild(s);
}

/* Ã¢ÂÂÃ¢ÂÂ fixInsights Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixInsights(){
  if(window.location.pathname.indexOf('/insights')<0) return;
  var state = localStorage.getItem('oc_state')||'georgia';
  document.querySelectorAll('.oc-ic').forEach(function(card){
    var scope = card.getAttribute('data-scope')||'national';
    card.style.display = (scope==='national'||scope===state) ? '' : 'none';
  });
  var label = document.getElementById('oc-insights-state-label');
  if(label) label.textContent = state.charAt(0).toUpperCase()+state.slice(1);
}

/* Ã¢ÂÂÃ¢ÂÂ fixCards Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function fixCards(){
  var s = document.querySelector('style#oc-card-fix');
  if(s) return;
  s = document.createElement('style');
  s.id = 'oc-card-fix';
  s.textContent = '.oc-carrier-card{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:24px;}.oc-carrier-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}';
  document.head.appendChild(s);
}

/* Ã¢ÂÂÃ¢ÂÂ fixInlineHeroes (v31.5.3 - Olive Cover Nav (no flag emojis)
/*
 * Replaces solid navy hero backgrounds on inline pages with real Unsplash
 * photos + a gradient overlay so images show through while text stays legible.
 * Pages covered: /contact, /faq, /coverage-review, /about
 */
function fixInlineHeroes(){
  var path = window.location.pathname;

  /* Page config: hero element id, unsplash photo id, gradient direction */
  var pages = {
    '/contact':{
      id:'oc-contact-hero',
      photo:'photo-1521791136064-7986c2920216', /* handshake / meeting */
      grad:'linear-gradient(105deg,rgba(27,58,92,0.88) 0%,rgba(27,58,92,0.55) 55%,rgba(27,58,92,0.22) 100%)'
    },
    '/faq':{
      id:'oc-faq-hero',
      photo:'photo-1507003211169-0a1dd7228f2d', /* desk / questions */
      grad:'linear-gradient(105deg,rgba(27,58,92,0.88) 0%,rgba(27,58,92,0.55) 55%,rgba(27,58,92,0.22) 100%)'
    },
    '/coverage-review':{
      id:'oc-cr-hero',
      photo:'photo-1450101499163-c8848c66ca85', /* documents review */
      grad:'linear-gradient(105deg,rgba(27,58,92,0.88) 0%,rgba(27,58,92,0.55) 55%,rgba(27,58,92,0.22) 100%)'
    },
    '/about':{
      id:'oc-about-hero',
      photo:'photo-1497366216548-37526070297c', /* modern office */
      grad:'linear-gradient(105deg,rgba(27,58,92,0.85) 0%,rgba(27,58,92,0.50) 60%,rgba(27,58,92,0.20) 100%)'
    }
  };

  var cfg = pages[path];
  if(!cfg) return;

  /* Inject override CSS */
  if(!document.getElementById('oc-hero-photo-css')){
    var s = document.createElement('style');
    s.id = 'oc-hero-photo-css';
    s.textContent =
      '#'+cfg.id+'{' +
        'position:relative!important;' +
        'background-image:url("https://images.unsplash.com/'+cfg.photo+'?w=1400&q=80")!important;' +
        'background-size:cover!important;' +
        'background-position:center top!important;' +
        'min-height:420px!important;' +
      '}' +
      '#'+cfg.id+'::before{' +
        'content:"";' +
        'position:absolute;' +
        'inset:0;' +
        'background:'+cfg.grad+';' +
        'z-index:0;' +
        'pointer-events:none;' +
      '}' +
      '#'+cfg.id+' > *{position:relative;z-index:1;}';
    document.head.appendChild(s);
  }

  /* About page: inject a hero section if none exists */
  if(path==='/about'){
    var existing = document.getElementById('oc-about-hero');
    if(!existing){
      /* Find the first section after nav and prepend a hero */
      var pageRoot = document.getElementById('oc-page-root');
      if(pageRoot){
        var heroDiv = document.createElement('section');
        heroDiv.id = 'oc-about-hero';
        heroDiv.style.cssText = 'padding:80px 24px 64px;';
        heroDiv.innerHTML =
          '<div style="max-width:760px;">' +
            '<p style="font-family:Inter,sans-serif;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:12px;">Independent Insurance Agency</p>' +
            '<h1 style="font-family:\'Playfair Display\',serif;font-size:52px;font-weight:700;color:#fff;line-height:1.15;margin-bottom:16px;">About Olive Cover</h1>' +
            '<p style="font-family:Inter,sans-serif;font-size:18px;color:rgba(255,255,255,.88);line-height:1.6;margin-bottom:28px;">We are an independent P&amp;C agency based in Johns Creek, Georgia. We work for you, not for one insurance company.</p>' +
            '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
              '<a href="/coverage-review" style="background:#C7A24B;color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:4px;text-decoration:none;">Start your coverage review</a>' +
              '<a href="/where-we-do-business" style="background:transparent;color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:500;padding:12px 24px;border:1px solid rgba(255,255,255,.5);border-radius:4px;text-decoration:none;">Where we do business</a>' +
            '</div>' +
          '</div>';
        pageRoot.insertBefore(heroDiv, pageRoot.firstChild);
      }
    }
  }
}

/* Ã¢ÂÂÃ¢ÂÂ CMS template hero overlay: gradient instead of solid Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
 * Targets .oc-hero-overlay on all CMS template pages
 * (insurance pages, carrier pages, local, state, city, FAQ detail)
 */
function fixCmsHeroOverlay(){
  /* Only run on CMS-driven pages, not inline pages */
  var inlinePages = ['/','/about','/contact','/faq','/coverage-review','/where-we-do-business','/insights','/licensing','/privacy-policy','/terms-of-service'];
  var path = window.location.pathname;
  for(var i=0;i<inlinePages.length;i++){
    if(path===inlinePages[i]) return;
  }
  if(document.getElementById('oc-cms-overlay-fix')) return;
  var s = document.createElement('style');
  s.id = 'oc-cms-overlay-fix';
  s.textContent =
    '.oc-hero-overlay{' +
      'background:linear-gradient(105deg,rgba(27,58,92,0.82) 0%,rgba(27,58,92,0.48) 55%,rgba(27,58,92,0.16) 100%)!important;' +
    '}';
  document.head.appendChild(s);
}

/* Ã¢ÂÂÃ¢ÂÂ Init Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */
function init(){
  buildNav();
  fixFooter();
  fixCarrierText();
  fixTrustBar();
  fixAboutPage();
  fixHomePage();
  fixInsights();
  fixCards();
  fixInlineHeroes();
  fixCmsHeroOverlay();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('storage', function(e){
  if(e.key==='oc_state'){
    fixCarrierText();
    fixInsights();
    fixInlineHeroes();
  }
});

})();


// ââ v31.5.1 additions ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function fixPhoneLinks(){
  var t='tel:+16788881011';
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  var n,ns=[];
  while((n=w.nextNode()))ns.push(n);
  ns.forEach(function(n){
    if(n.textContent.indexOf('(678) 888-1011')>-1&&n.parentNode&&n.parentNode.tagName!=='A'){
      var s=document.createElement('span');
      s.innerHTML=n.textContent.replace(/\(678\) 888-1011/g,'<a href="'+t+'" style="color:inherit;text-decoration:none">(678) 888-1011</a>');
      n.parentNode.replaceChild(s,n);
    }
  });
}

function fixCarrierCards(){
  if(!location.pathname.match(/\/(personal-insurance|commercial-insurance|carriers|commercial-carriers)\//)|| document.getElementById('oc-cc'))return;
  var s=document.createElement('style');s.id='oc-cc';
  s.textContent='.w-dyn-list{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}@media(max-width:900px){.w-dyn-list{grid-template-columns:1fr}}.w-dyn-item{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:24px;transition:box-shadow .15s}.w-dyn-item:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}';
  document.head.appendChild(s);
}

function fixSocialIcons(){
  var fb='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>';
  var ig='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/></svg>';
  var li='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>';
  document.querySelectorAll('footer a').forEach(function(a){
    var t=(a.textContent||'').trim();
    if(t==='f'){a.innerHTML=fb;a.setAttribute('aria-label','Facebook');}
    else if(t==='ig'){a.innerHTML=ig;a.setAttribute('aria-label','Instagram');}
    else if(t==='in'){a.innerHTML=li;a.setAttribute('aria-label','LinkedIn');}
  });
}

function fixFooterCarriersLink(){
  document.querySelectorAll('a').forEach(function(a){
    if((a.textContent||'').trim()==='Our Carriers'&&(a.href||'').indexOf('homeowners')>-1)
      a.href='/carriers/travelers-insurance';
  });
}

function fixGeoFallback(){
  if(!localStorage.getItem('oc_state'))
    setTimeout(function(){if(!localStorage.getItem('oc_state'))localStorage.setItem('oc_state','georgia');},3000);
}

// v31.5.1 init calls
fixPhoneLinks();
fixCarrierCards();
fixSocialIcons();
fixFooterCarriersLink();
fixGeoFallback();
document.addEventListener('DOMContentLoaded',function(){fixGeoFallback();});
