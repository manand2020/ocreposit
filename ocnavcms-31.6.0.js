/* ocnavcms v31.6.0 | Olive Cover | Built 2026-04-23 */
/* Changes from 31.5.0:
   - NAV.locations.georgia: added Suwanee, Sugar Hill, Buford
*/
(function(){
'use strict';

var COLLECTION_ID='69e2c474742df85703a42d14';
var LOGO='https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
var chevron='<svg width="10" height="6" viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z" fill="currentColor"/></svg>';
var FLAGS={georgia:'🍑',california:'🌴',texas:'⭐',florida:'🌊',nevada:'🎲',arizona:'🌵',colorado:'⛰️',oregon:'🌲',washington:'🌧️'};

function detectState(states){
  var path=window.location.pathname;
  var stored=localStorage.getItem('oc_state');
  for(var i=0;i<states.length;i++){
    if(path.indexOf('/states/'+states[i].slug)===0||path.indexOf('/'+states[i].slug+'-')>-1){
      localStorage.setItem('oc_state',states[i].slug);
      return states[i].slug;
    }
  }
  return stored||'georgia';
}

function fetchStates(token,cb){
  var cached=sessionStorage.getItem('oc_states');
  if(cached){try{return cb(JSON.parse(cached));}catch(e){}}
  fetch('https://api.webflow.com/v2/collections/'+COLLECTION_ID+'/items?limit=100',{
    headers:{'Authorization':'Bearer '+token,'accept':'application/json'}
  }).then(function(r){return r.json();})
  .then(function(data){
    var items=(data.items||[])
      .filter(function(i){return i.fieldData['is-active']!==false;})
      .map(function(i){return{
        slug:i.fieldData.slug,
        name:i.fieldData.name,
        flag:FLAGS[i.fieldData.slug]||'📍',
        path:'/states/'+i.fieldData.slug
      };});
    if(items.length){sessionStorage.setItem('oc_states',JSON.stringify(items));}
    cb(items.length?items:fallbackStates());
  }).catch(function(){cb(fallbackStates());});
}

function fallbackStates(){
  return[
    {slug:'georgia',name:'Georgia',flag:'🍑',path:'/states/georgia'},
    {slug:'california',name:'California',flag:'🌴',path:'/states/california'}
  ];
}

var NAV={
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
      {label:'Jewelry Insurance',href:'/personal-insurance/jewelry-insurance'},
      {label:'Home Business',href:'/personal-insurance/home-business-insurance'},
      {label:'Farm & Rural',href:'/personal-insurance/farm-rural-property-insurance'}
    ],
    california:[
      {label:'Homeowners Insurance',href:'/personal-insurance/homeowners-insurance-california'},
      {label:'Auto Insurance',href:'/personal-insurance/auto-insurance-california'},
      {label:'Umbrella Insurance',href:'/personal-insurance/umbrella-insurance-california'},
      {label:'Renters Insurance',href:'/personal-insurance/renters-insurance-california'},
      {label:'Condo Insurance',href:'/personal-insurance/condo-insurance-california'},
      {label:'Landlord Insurance',href:'/personal-insurance/landlord-insurance-california'},
      {label:'Flood Insurance',href:'/personal-insurance/flood-insurance-california'},
      {label:'Short-Term Rental',href:'/personal-insurance/short-term-rental-insurance-california'},
      {label:'Boat Insurance',href:'/personal-insurance/boat-insurance-california'},
      {label:'Motorcycle Insurance',href:'/personal-insurance/motorcycle-insurance-california'},
      {label:'Jewelry Insurance',href:'/personal-insurance/jewelry-insurance-california'},
      {label:'Home Business',href:'/personal-insurance/home-business-insurance-california'},
      {label:'Scheduled Articles',href:'/personal-insurance/scheduled-articles-insurance-california'},
      {label:'Collector Auto',href:'/personal-insurance/collector-auto-insurance-california'}
    ]
  },
  commercial:{
    global:[
      {label:'Business Owners Policy',href:'/commercial-insurance/business-owners-policy'},
      {label:'General Liability',href:'/commercial-insurance/general-liability-insurance'},
      {label:'Commercial Auto',href:'/commercial-insurance/commercial-auto-insurance'},
      {label:'Workers Comp',href:'/commercial-insurance/workers-compensation-insurance'},
      {label:'Professional Liability',href:'/commercial-insurance/professional-liability-insurance'},
      {label:'Cyber Liability',href:'/commercial-insurance/cyber-liability-insurance'},
      {label:'Management Liability',href:'/commercial-insurance/management-liability-insurance'},
      {label:'Habitational',href:'/commercial-insurance/habitational-insurance'},
      {label:'Nonprofit Insurance',href:'/commercial-insurance/nonprofit-insurance'},
      {label:'Surety Bonds',href:'/commercial-insurance/surety-bonds-insurance'}
    ]
  },
  about:[
    {label:'FAQ',href:'/faq'},
    {label:'Contact',href:'/contact'},
    {label:'Where We Work',href:'/where-we-do-business'},
    {label:'Our Carriers',href:'/personal-insurance/homeowners-insurance'}
  ],
  locations:{
    georgia:[
      {label:'Johns Creek',href:'/cities/georgia-johns-creek'},
      {label:'Alpharetta',href:'/cities/georgia-alpharetta'},
      {label:'Suwanee',href:'/cities/georgia-suwanee'},
      {label:'Cumming',href:'/cities/georgia-cumming'},
      {label:'Duluth',href:'/cities/georgia-duluth'},
      {label:'Lawrenceville',href:'/cities/georgia-lawrenceville'},
      {label:'Sugar Hill',href:'/cities/georgia-sugar-hill'},
      {label:'Buford',href:'/cities/georgia-buford'}
    ],
    california:[
      {label:'Coverage in California',href:'/states/california'}
    ]
  }
};

var CSS=[
'#ocnav-bar{position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;align-items:center;gap:0;background:#1B3A5C;height:64px;padding:0 24px;font-family:Inter,sans-serif;}',
'#ocnav-logo{display:flex;align-items:center;flex-shrink:0;margin-right:24px;}',
'#ocnav-logo img{height:32px;width:auto;}',
'#ocnav-links{display:flex;align-items:center;gap:4px;flex:1;}',
'.ocnav-top{color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;text-decoration:none;padding:8px 12px;border-radius:4px;white-space:nowrap;position:relative;background:none;border:none;cursor:pointer;font-family:Inter,sans-serif;}',
'.ocnav-top:hover{background:rgba(255,255,255,0.1);color:#fff;}',
'.ocnav-dd{position:relative;}',
'.ocnav-dd-menu{display:none;position:absolute;top:100%;left:0;background:#fff;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.15);padding:8px 0;min-width:220px;z-index:10000;}',
'.ocnav-dd-menu.wide{min-width:480px;display:none;grid-template-columns:1fr 1fr;gap:0;padding:16px;}',
'.ocnav-dd:hover .ocnav-dd-menu{display:block;}',
'.ocnav-dd:hover .ocnav-dd-menu.wide{display:grid;}',
'.ocnav-dd-menu a{display:block;padding:8px 16px;color:#1B3A5C;font-size:14px;text-decoration:none;white-space:nowrap;}',
'.ocnav-dd-menu a:hover{background:#f5f7fa;color:#1B3A5C;}',
'.ocnav-dd-menu-section{padding:0;}',
'.ocnav-dd-menu-head{font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;padding:4px 16px 2px;}',
'.ocnav-state-btn{color:rgba(255,255,255,0.7);font-size:13px;font-weight:500;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;padding:5px 10px;font-family:Inter,sans-serif;margin-left:4px;}',
'.ocnav-state-btn:hover{background:rgba(255,255,255,0.2);color:#fff;}',
'#ocnav-cta{background:#C7A24B;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:9px 18px;border-radius:5px;white-space:nowrap;margin-left:8px;flex-shrink:0;}',
'#ocnav-cta:hover{background:#b8922f;}',
'#ocnav-mobile-toggle{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px;margin-left:auto;}',
'#ocnav-mobile-toggle span{display:block;width:22px;height:2px;background:#fff;border-radius:1px;}',
'#ocnav-mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;bottom:0;background:#1B3A5C;z-index:9998;overflow-y:auto;padding:16px 0;}',
'#ocnav-mobile-menu.open{display:block;}',
'.ocnav-mobile-section{}',
'.ocnav-mobile-head{color:#fff;font-size:15px;font-weight:500;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.08);}',
'.ocnav-mobile-links{display:none;background:rgba(0,0,0,0.2);}',
'.ocnav-mobile-links.open{display:block;}',
'.ocnav-mobile-links a{display:block;padding:12px 32px;color:rgba(255,255,255,0.8);font-size:14px;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06);}',
'.ocnav-mobile-cta{display:block;margin:16px 24px;background:#C7A24B;color:#fff;text-align:center;padding:14px;border-radius:5px;font-size:15px;font-weight:600;text-decoration:none;}',
'body{padding-top:64px;}',
'@media(max-width:768px){#ocnav-links{display:none;}#ocnav-mobile-toggle{display:flex;}#ocnav-cta{display:none;}}'
].join('');

function hideOldNav(){
  var selectors=[
    '.navbar','[class*="nav-bar"]','[class*="navbar"]',
    '.w-nav','.w-nav-button','.w-nav-menu','.w-nav-overlay',
    'header>*:not(#ocnav-bar):not(#ocnav-mobile-menu)'
  ];
  selectors.forEach(function(sel){
    try{
      document.querySelectorAll(sel).forEach(function(el){
        if(el.id!=='ocnav-bar'&&el.id!=='ocnav-mobile-menu'){
          el.style.cssText='display:none!important;visibility:hidden!important;opacity:0!important;';
        }
      });
    }catch(e){}
  });
}

function sec(title,items){
  var h=title?'<div class="ocnav-dd-menu-head">'+title+'</div>':'';
  return h+items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('');
}

function btn(label,content,noChevron){
  return'<div class="ocnav-dd ocnav-top-wrap">'+
    '<button class="ocnav-top">'+label+(noChevron?'':' '+chevron)+'</button>'+
    '<div class="ocnav-dd-menu">'+content+'</div>'+
  '</div>';
}

function widebtn(label,col1,col2){
  return'<div class="ocnav-dd ocnav-top-wrap">'+
    '<button class="ocnav-top">'+label+' '+chevron+'</button>'+
    '<div class="ocnav-dd-menu wide">'+
      '<div class="ocnav-dd-menu-section">'+col1+'</div>'+
      '<div class="ocnav-dd-menu-section">'+col2+'</div>'+
    '</div>'+
  '</div>';
}

function msec(title,items){
  return'<div class="ocnav-mobile-section">'+
    '<div class="ocnav-mobile-head" onclick="this.nextElementSibling.classList.toggle(\'open\')">'+title+' '+chevron+'</div>'+
    '<div class="ocnav-mobile-links">'+items.map(function(i){return'<a href="'+i.href+'">'+i.label+'</a>';}).join('')+'</div>'+
  '</div>';
}

function switchState(e){
  e.preventDefault();
  var cur=localStorage.getItem('oc_state')||'georgia';
  var next=cur==='georgia'?'california':'georgia';
  localStorage.setItem('oc_state',next);
  window.location.href=next==='california'?'/states/california':'/states/georgia';
}

function buildNav(states,active){
  if(document.getElementById('ocnav-bar'))return;

  var style=document.createElement('style');
  style.textContent=CSS;
  document.head.appendChild(style);

  var p=NAV.personal[active]||NAV.personal.georgia;
  var c=NAV.commercial.global;
  var l=NAV.locations[active]||NAV.locations.georgia;
  var stateLabel=active==='california'?'CA':'GA';
  var stateToggle=active==='california'?'Switch to Georgia':'Switch to California';

  var half=Math.ceil(p.length/2);
  var links=[
    widebtn('Personal Lines',
      sec('',p.slice(0,half)),
      sec('',p.slice(half))
    ),
    widebtn('Commercial Lines',
      sec('',c.slice(0,5)),
      sec('',c.slice(5))
    ),
    btn('Locations',sec('',l)),
    btn('About Olive Cover',sec('',NAV.about),true),
    '<a class="ocnav-top" href="/coverage-review" style="background:rgba(199,162,75,0.15);border-radius:4px;margin-left:4px;">Coverage Review</a>',
    '<button class="ocnav-state-btn" onclick="window.__ocSwitchState(event)">State: '+stateLabel+'</button>'
  ].join('');

  var mob=[
    msec('Personal Lines',p),
    msec('Commercial Lines',c),
    msec('Locations',l),
    msec('About',NAV.about),
    '<a class="ocnav-mobile-cta" href="/coverage-review">Start Coverage Review</a>',
    '<div style="text-align:center;padding:0 24px 24px;"><button class="ocnav-state-btn" onclick="window.__ocSwitchState(event)">'+stateToggle+'</button></div>'
  ].join('');

  var bar=document.createElement('nav');
  bar.id='ocnav-bar';
  bar.innerHTML=
    '<a id="ocnav-logo" href="/"><img src="'+LOGO+'" alt="Olive Cover"></a>'+
    '<div id="ocnav-links">'+links+'</div>'+
    '<a id="ocnav-cta" href="/coverage-review">Coverage Review</a>'+
    '<button id="ocnav-mobile-toggle" onclick="document.getElementById(\'ocnav-mobile-menu\').classList.toggle(\'open\')">'+
      '<span></span><span></span><span></span>'+
    '</button>';

  var mob_menu=document.createElement('div');
  mob_menu.id='ocnav-mobile-menu';
  mob_menu.innerHTML=mob;

  document.body.insertBefore(mob_menu,document.body.firstChild);
  document.body.insertBefore(bar,document.body.firstChild);

  window.__ocSwitchState=switchState;
  hideOldNav();
  setTimeout(hideOldNav,300);
  setTimeout(hideOldNav,1000);
}

function fixCmsHeroOverlay(){
  var overlay=document.querySelector('.oc-hero-overlay');
  if(!overlay)return;
  overlay.style.background='linear-gradient(105deg,rgba(27,58,92,0.82) 0%,rgba(27,58,92,0.48) 55%,rgba(27,58,92,0.16) 100%)';
}

var HERO_IMAGES={
  '/contact':'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&auto=format&fit=crop',
  '/faq':'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80&auto=format&fit=crop',
  '/coverage-review':'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80&auto=format&fit=crop',
  '/about':'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1600&q=80&auto=format&fit=crop'
};
var HERO_IDS={
  '/contact':'oc-contact-hero',
  '/faq':'oc-faq-hero',
  '/coverage-review':'oc-cr-hero',
  '/about':'oc-about-hero'
};

function fixInlineHeroes(){
  var path=location.pathname.replace(/\/$/,'');
  var img=HERO_IMAGES[path];
  var id=HERO_IDS[path];
  if(!img||!id)return;
  var hero=document.getElementById(id);
  if(!hero)return;
  hero.style.backgroundImage='url('+img+')';
  hero.style.backgroundSize='cover';
  hero.style.backgroundPosition='center';
  var ov=hero.querySelector('.oc-hero-overlay');
  if(ov)ov.style.background='linear-gradient(105deg,rgba(27,58,92,0.82) 0%,rgba(27,58,92,0.48) 55%,rgba(27,58,92,0.16) 100%)';
}

function fixFooter(){
  document.querySelectorAll('*').forEach(function(el){
    if(el.children.length===0&&el.textContent.indexOf('appointed in Georgia')>-1){
      el.textContent=el.textContent.replace('appointed in Georgia','A-rated and appointed');
    }
  });
}

function fixCarrierText(){
  document.querySelectorAll('*').forEach(function(el){
    if(el.children.length===0&&el.textContent.trim()==='Not available for this coverage'){
      el.textContent='';
    }
    if(el.children.length===0&&el.textContent.trim()==='Georgia Range'){
      el.textContent='Coverage Cost';
    }
  });
}

function fixTrustBar(){
  document.querySelectorAll('*').forEach(function(el){
    if(el.children.length===0&&el.textContent.indexOf('Agency NPN')>-1&&el.textContent.indexOf('Georgia licensed')>-1){
      el.innerHTML=el.innerHTML.replace('Georgia licensed',' | Georgia Licensed');
    }
  });
}

function init(){
  var token=window._ocToken;
  if(token){
    fetchStates(token,function(states){
      var active=detectState(states);
      buildNav(states,active);
      setTimeout(function(){fixFooter();fixCarrierText();fixTrustBar();fixCmsHeroOverlay();fixInlineHeroes();},500);
    });
  }else{
    var states=fallbackStates();
    var active=detectState(states);
    buildNav(states,active);
    setTimeout(function(){fixFooter();fixCarrierText();fixTrustBar();fixCmsHeroOverlay();fixInlineHeroes();},500);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}

window._ocNavVersion='31.6.0';
})();
