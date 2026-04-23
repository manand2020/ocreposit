/* ocnavcms v31.6.0 - Olive Cover Nav CMS
 * Adds Suwanee, Sugar Hill, Buford to Georgia locations
 * State switcher: Georgia / California
 * localStorage key: oc_state
 */
(function(){
'use strict';

var NAV={
  personal:[
    {name:'Homeowners Insurance',href:'/personal-insurance/homeowners-insurance'},
    {name:'Auto Insurance',href:'/personal-insurance/auto-insurance'},
    {name:'Umbrella Insurance',href:'/personal-insurance/umbrella-insurance'},
    {name:'Flood Insurance',href:'/personal-insurance/flood-insurance'},
    {name:'Renters Insurance',href:'/personal-insurance/renters-insurance'},
    {name:'Landlord Insurance',href:'/personal-insurance/landlord-insurance'},
    {name:'Motorcycle Insurance',href:'/personal-insurance/motorcycle-insurance'},
    {name:'Boat Insurance',href:'/personal-insurance/boat-insurance'},
    {name:'Collector Auto Insurance',href:'/personal-insurance/collector-auto-insurance'},
    {name:'Scheduled Articles',href:'/personal-insurance/scheduled-articles-insurance'}
  ],
  commercial:[
    {name:'Business Owners Policy (BOP)',href:'/commercial-insurance/bop-insurance'},
    {name:'General Liability',href:'/commercial-insurance/general-liability-insurance'},
    {name:'Workers Compensation',href:'/commercial-insurance/workers-comp-insurance'},
    {name:'Commercial Auto',href:'/commercial-insurance/commercial-auto-insurance'},
    {name:'Professional Liability',href:'/commercial-insurance/professional-liability-insurance'},
    {name:'Cyber Liability',href:'/commercial-insurance/cyber-liability-insurance'},
    {name:'Management Liability',href:'/commercial-insurance/management-liability-insurance'},
    {name:'Habitational',href:'/commercial-insurance/habitational-insurance'},
    {name:'Surety Bonds',href:'/commercial-insurance/surety-bonds-insurance'}
  ],
  about:[
    {name:'FAQ',href:'/faq'},
    {name:'Contact',href:'/contact'},
    {name:'Where We Work',href:'/where-we-do-business'},
    {name:'Our Carriers',href:'/personal-insurance/homeowners-insurance'}
  ],
  locations:{
    georgia:[
      {name:'Johns Creek',href:'/cities/georgia-johns-creek'},
      {name:'Alpharetta',href:'/cities/georgia-alpharetta'},
      {name:'Cumming',href:'/cities/georgia-cumming'},
      {name:'Duluth',href:'/cities/georgia-duluth'},
      {name:'Lawrenceville',href:'/cities/georgia-lawrenceville'},
      {name:'Suwanee',href:'/cities/georgia-suwanee'},
      {name:'Sugar Hill',href:'/cities/georgia-sugar-hill'},
      {name:'Buford',href:'/cities/georgia-buford'}
    ],
    california:[
      {name:'Los Angeles',href:'/locations/los-angeles-metro'},
      {name:'San Diego',href:'/locations/san-diego'},
      {name:'Bay Area',href:'/locations/bay-area'},
      {name:'Sacramento',href:'/locations/sacramento'},
      {name:'Inland Empire',href:'/locations/inland-empire'}
    ]
  },
  states:[
    {name:'Georgia',slug:'georgia',label:'GA'},
    {name:'California',slug:'california',label:'CA'}
  ]
};

function getState(){try{return localStorage.getItem('oc_state')||'georgia';}catch(e){return 'georgia';}}
function setState(s){try{localStorage.setItem('oc_state',s);window.dispatchEvent(new CustomEvent('oc_state_changed',{detail:{state:s}}));}catch(e){}}

function escHtml(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function hideOldNav(){
  var nav=document.getElementById('oc-nav');
  if(nav)nav.style.cssText='display:none!important';
  var children=document.querySelectorAll('#oc-nav > *');
  children.forEach(function(c){c.style.cssText='display:none!important';});
}

function injectCSS(){
  if(document.getElementById('ocnav-css'))return;
  var s=document.createElement('style');
  s.id='ocnav-css';
  s.textContent=[
    '#ocnav-bar{position:fixed;top:0;left:0;right:0;z-index:9999;background:#1B3A5C;height:60px;display:flex;align-items:center;font-family:Inter,sans-serif;}',
    '#ocnav-bar .ocn-inner{display:flex;align-items:center;width:100%;max-width:1200px;margin:0 auto;padding:0 24px;gap:0;}',
    '#ocnav-bar .ocn-logo{text-decoration:none;display:flex;align-items:center;margin-right:32px;flex-shrink:0;}',
    '#ocnav-bar .ocn-logo img{height:28px;width:auto;}',
    '#ocnav-bar .ocn-links{display:flex;align-items:center;gap:4px;flex:1;}',
    '#ocnav-bar .ocn-item{position:relative;}',
    '#ocnav-bar .ocn-btn{background:none;border:none;cursor:pointer;padding:8px 12px;font-family:Inter,sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,.85);display:flex;align-items:center;gap:5px;border-radius:4px;transition:color .15s,background .15s;white-space:nowrap;}',
    '#ocnav-bar .ocn-btn:hover,.ocn-item.ocn-open .ocn-btn{color:#fff;background:rgba(255,255,255,.08);}',
    '#ocnav-bar .ocn-chevron{font-size:9px;opacity:.7;transition:transform .2s;}',
    '#ocnav-bar .ocn-item.ocn-open .ocn-chevron{transform:rotate(180deg);}',
    '#ocnav-bar .ocn-drop{display:none;position:absolute;top:calc(100% + 6px);left:0;min-width:220px;background:#fff;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.15);padding:6px 0;z-index:10000;}',
    '#ocnav-bar .ocn-drop.ocn-right{left:auto;right:0;}',
    '#ocnav-bar .ocn-item.ocn-open .ocn-drop{display:block;}',
    '#ocnav-bar .ocn-drop a{display:block;padding:9px 16px;font-family:Inter,sans-serif;font-size:13px;color:#1B3A5C;text-decoration:none;transition:background .1s;}',
    '#ocnav-bar .ocn-drop a:hover{background:#F2F4F8;color:#C7A24B;}',
    '#ocnav-bar .ocn-drop .ocn-drop-hd{padding:10px 16px 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;border-top:1px solid #f1f5f9;}',
    '#ocnav-bar .ocn-drop .ocn-drop-hd:first-child{border-top:none;}',
    '#ocnav-bar .ocn-state-btn{margin-left:8px;display:flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:20px;cursor:pointer;font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#fff;transition:background .15s;}',
    '#ocnav-bar .ocn-state-btn:hover{background:rgba(255,255,255,.18);}',
    '#ocnav-bar .ocn-state-flag{font-size:14px;line-height:1;}',
    '#ocnav-bar .ocn-cta{margin-left:auto;flex-shrink:0;padding:8px 18px;background:#C7A24B;color:#fff;border-radius:5px;font-family:Inter,sans-serif;font-size:13px;font-weight:600;text-decoration:none;transition:background .15s;white-space:nowrap;}',
    '#ocnav-bar .ocn-cta:hover{background:#b8923e;}',
    '#ocnav-spacer{height:60px;}',
    '#ocnav-mobile-btn{display:none;background:none;border:none;cursor:pointer;padding:8px;color:#fff;font-size:22px;margin-left:auto;}',
    '#ocnav-mobile{display:none;position:fixed;top:60px;left:0;right:0;bottom:0;background:#1B3A5C;z-index:9998;overflow-y:auto;padding:16px 0;}',
    '#ocnav-mobile.ocn-mob-open{display:block;}',
    '#ocnav-mobile a{display:block;padding:13px 24px;font-family:Inter,sans-serif;font-size:15px;color:rgba(255,255,255,.9);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.06);}',
    '#ocnav-mobile a:hover{color:#C7A24B;}',
    '#ocnav-mobile .ocn-mob-hd{padding:16px 24px 6px;font-family:Inter,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.4);}',
    '#ocnav-mobile .ocn-mob-cta{margin:20px 24px 0;display:block;text-align:center;padding:14px;background:#C7A24B;border-radius:6px;font-family:Inter,sans-serif;font-size:15px;font-weight:700;color:#fff;text-decoration:none;}',
    '@media(max-width:900px){#ocnav-bar .ocn-links{display:none;}#ocnav-bar .ocn-state-btn{display:none;}#ocnav-bar .ocn-cta{display:none;}#ocnav-mobile-btn{display:block;}}',
    '@media(min-width:901px){#ocnav-mobile{display:none!important;}}'
  ].join('');
  document.head.insertBefore(s,document.head.firstChild);
}

function buildDesktopNav(){
  var state=getState();
  var stateInfo=NAV.states.find(function(s){return s.slug===state;})||NAV.states[0];
  var flag=state==='georgia'?'&#127468;&#127463;':'&#127464;&#127462;';

  var locs=NAV.locations[state]||NAV.locations.georgia;
  var locItems=locs.map(function(l){return '<a href="'+l.href+'">'+escHtml(l.name)+'</a>';}).join('');

  var perItems=NAV.personal.map(function(i){return '<a href="'+i.href+'">'+escHtml(i.name)+'</a>';}).join('');
  var comItems=NAV.commercial.map(function(i){return '<a href="'+i.href+'">'+escHtml(i.name)+'</a>';}).join('');
  var abtItems=NAV.about.map(function(i){return '<a href="'+i.href+'">'+escHtml(i.name)+'</a>';}).join('');

  var logoUrl='https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';

  var html='<div class="ocn-inner">'
    +'<a href="/" class="ocn-logo"><img src="'+logoUrl+'" alt="Olive Cover"></a>'
    +'<div class="ocn-links">'
    +'<div class="ocn-item" id="ocn-personal">'
      +'<button class="ocn-btn">Personal <span class="ocn-chevron">&#9660;</span></button>'
      +'<div class="ocn-drop">'+perItems+'</div>'
    +'</div>'
    +'<div class="ocn-item" id="ocn-commercial">'
      +'<button class="ocn-btn">Commercial <span class="ocn-chevron">&#9660;</span></button>'
      +'<div class="ocn-drop">'+comItems+'</div>'
    +'</div>'
    +'<div class="ocn-item" id="ocn-locations">'
      +'<button class="ocn-btn">Locations <span class="ocn-chevron">&#9660;</span></button>'
      +'<div class="ocn-drop">'+locItems+'</div>'
    +'</div>'
    +'<div class="ocn-item" id="ocn-about">'
      +'<button class="ocn-btn">About <span class="ocn-chevron">&#9660;</span></button>'
      +'<div class="ocn-drop ocn-right">'+abtItems+'</div>'
    +'</div>'
    +'</div>'
    +'<button class="ocn-state-btn" id="ocn-state-toggle">'
      +'<span class="ocn-state-flag">'+flag+'</span>'
      +'<span>'+escHtml(stateInfo.name)+'</span>'
    +'</button>'
    +'<a href="/coverage-review" class="ocn-cta">Coverage Review</a>'
    +'<button id="ocnav-mobile-btn" aria-label="Menu">&#9776;</button>'
    +'</div>';

  return html;
}

function buildMobileNav(){
  var state=getState();
  var locs=NAV.locations[state]||NAV.locations.georgia;
  var html='';

  html+='<div class="ocn-mob-hd">Personal Coverage</div>';
  NAV.personal.forEach(function(i){html+='<a href="'+i.href+'">'+escHtml(i.name)+'</a>';});
  html+='<div class="ocn-mob-hd">Commercial Coverage</div>';
  NAV.commercial.forEach(function(i){html+='<a href="'+i.href+'">'+escHtml(i.name)+'</a>';});
  html+='<div class="ocn-mob-hd">Locations</div>';
  locs.forEach(function(l){html+='<a href="'+l.href+'">'+escHtml(l.name)+'</a>';});
  html+='<div class="ocn-mob-hd">About</div>';
  NAV.about.forEach(function(i){html+='<a href="'+i.href+'">'+escHtml(i.name)+'</a>';});
  html+='<a href="/coverage-review" class="ocn-mob-cta">Free Coverage Review</a>';

  NAV.states.forEach(function(s){
    if(s.slug!==state){
      var flag=s.slug==='georgia'?'&#127468;&#127463;':'&#127464;&#127462;';
      html+='<a href="/states/'+s.slug+'" style="margin-top:16px;opacity:.6;font-size:13px;" onclick="localStorage.setItem(\'oc_state\',\''+s.slug+'\')">Switch to '+flag+' '+escHtml(s.name)+'</a>';
    }
  });

  return html;
}

function bindDropdowns(){
  var items=document.querySelectorAll('#ocnav-bar .ocn-item');
  items.forEach(function(item){
    var btn=item.querySelector('.ocn-btn');
    if(!btn)return;
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var wasOpen=item.classList.contains('ocn-open');
      items.forEach(function(i){i.classList.remove('ocn-open');});
      if(!wasOpen)item.classList.add('ocn-open');
    });
  });
  document.addEventListener('click',function(){
    items.forEach(function(i){i.classList.remove('ocn-open');});
  });
}

function bindMobile(){
  var btn=document.getElementById('ocnav-mobile-btn');
  var mob=document.getElementById('ocnav-mobile');
  if(!btn||!mob)return;
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    mob.classList.toggle('ocn-mob-open');
  });
}

function bindStateToggle(){
  var btn=document.getElementById('ocn-state-toggle');
  if(!btn)return;
  btn.addEventListener('click',function(){
    var cur=getState();
    var next=cur==='georgia'?'california':'georgia';
    setState(next);
    window.location.href='/states/'+next;
  });
}

function buildNav(){
  hideOldNav();
  injectCSS();

  var existing=document.getElementById('ocnav-bar');
  if(existing)existing.remove();
  var existingMob=document.getElementById('ocnav-mobile');
  if(existingMob)existingMob.remove();
  var existingSpacer=document.getElementById('ocnav-spacer');
  if(existingSpacer)existingSpacer.remove();

  var bar=document.createElement('div');
  bar.id='ocnav-bar';
  bar.innerHTML=buildDesktopNav();
  document.body.insertBefore(bar,document.body.firstChild);

  var mob=document.createElement('div');
  mob.id='ocnav-mobile';
  mob.innerHTML=buildMobileNav();
  document.body.insertBefore(mob,bar.nextSibling);

  var spacer=document.createElement('div');
  spacer.id='ocnav-spacer';
  document.body.insertBefore(spacer,mob.nextSibling);

  bindDropdowns();
  bindMobile();
  bindStateToggle();
}

window.addEventListener('oc_state_changed',function(){buildNav();});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',buildNav);
}else{
  buildNav();
}

})();
