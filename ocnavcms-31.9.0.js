/* ocnavcms v31.9.0 - Olive Cover Nav CMS
 * 3-column dropdown grids restored
 * Insights top-level removed; Insights gets own dropdown with featured articles
 * State switcher GA/CA
 * The Hartford display name fix
 */
(function(){
'use strict';

var NAV={
  personal:[
    {name:'Homeowners Insurance',href:'/personal-insurance/homeowners-insurance',sub:'Home, Condo, Rental'},
    {name:'Auto Insurance',href:'/personal-insurance/auto-insurance',sub:'Beyond state minimums'},
    {name:'Umbrella Insurance',href:'/personal-insurance/umbrella-insurance',sub:'$1M protection, ~$200/yr'},
    {name:'Flood Insurance',href:'/personal-insurance/flood-insurance',sub:'Not covered by homeowners'},
    {name:'Renters Insurance',href:'/personal-insurance/renters-insurance',sub:'Protect your belongings'},
    {name:'Landlord Insurance',href:'/personal-insurance/landlord-insurance',sub:'For rental properties'},
    {name:'Motorcycle Insurance',href:'/personal-insurance/motorcycle-insurance',sub:''},
    {name:'Boat Insurance',href:'/personal-insurance/boat-insurance',sub:''},
    {name:'Collector Auto',href:'/personal-insurance/collector-auto-insurance',sub:''},
    {name:'Scheduled Articles',href:'/personal-insurance/scheduled-articles-insurance',sub:'Jewelry, art, valuables'},
    {name:'Condo Insurance',href:'/personal-insurance/condo-insurance',sub:''},
    {name:'Home + Auto Bundle',href:'/personal-insurance/home-auto-bundle',sub:'Save 10-25%'}
  ],
  commercial:[
    {name:'Business Owners Policy',href:'/commercial-insurance/business-owners-policy',sub:'GL + property bundled'},
    {name:'General Liability',href:'/commercial-insurance/general-liability-insurance',sub:'Required by most leases'},
    {name:'Workers Compensation',href:'/commercial-insurance/workers-compensation-insurance',sub:'GA: 3+ employees'},
    {name:'Commercial Auto',href:'/commercial-insurance/commercial-auto-insurance',sub:'Business vehicles'},
    {name:'Professional Liability',href:'/commercial-insurance/professional-liability-insurance',sub:'E\u0026O coverage'},
    {name:'Cyber Liability',href:'/commercial-insurance/cyber-liability-insurance',sub:'Data breach protection'},
    {name:'Management Liability',href:'/commercial-insurance/management-liability-insurance',sub:'D\u0026O, EPL'},
    {name:'Surety Bonds',href:'/commercial-insurance/surety-bonds-insurance',sub:''}
  ],
  carriers_ga:[
    {name:'Travelers',href:'/carriers/travelers-insurance'},
    {name:'Progressive',href:'/carriers/progressive-insurance'},
    {name:'Nationwide',href:'/carriers/nationwide-insurance'},
    {name:'Safeco',href:'/carriers/safeco-insurance'},
    {name:'The Hartford',href:'/carriers/hartford-insurance'},
    {name:'Openly',href:'/carriers/openly-insurance'},
    {name:'Hippo',href:'/carriers/hippo-insurance'},
    {name:'Stillwater',href:'/carriers/stillwater-insurance'}
  ],
  carriers_ca:[
    {name:'Travelers',href:'/carriers/travelers-insurance-california'},
    {name:'Stillwater',href:'/carriers/stillwater-insurance-california'},
    {name:'Progressive',href:'/carriers/progressive-insurance-california'},
    {name:'Chubb',href:'/carriers/chubb-insurance-california'},
    {name:'AIG',href:'/carriers/aig-insurance-california'}
  ],
  locations_ga:[
    {name:'Insurance in Georgia',href:'/states/georgia'},
    {name:'North Atlanta',href:'/locations/north-atlanta'},
    {name:'Gwinnett County',href:'/locations/gwinnett-county'},
    {name:'Cherokee \u0026 Forsyth',href:'/locations/cherokee-forsyth-county'},
    {name:'Johns Creek',href:'/cities/georgia-johns-creek'},
    {name:'Alpharetta',href:'/cities/georgia-alpharetta'},
    {name:'Suwanee',href:'/cities/georgia-suwanee'},
    {name:'Cumming',href:'/cities/georgia-cumming'},
    {name:'Duluth',href:'/cities/georgia-duluth'},
    {name:'Lawrenceville',href:'/cities/georgia-lawrenceville'},
    {name:'Sugar Hill',href:'/cities/georgia-sugar-hill'},
    {name:'Buford',href:'/cities/georgia-buford'},
    {name:'Savannah',href:'/locations/savannah'},
    {name:'Columbus',href:'/locations/columbus'}
  ],
  locations_ca:[
    {name:'Insurance in California',href:'/states/california'},
    {name:'Los Angeles',href:'/locations/los-angeles-metro'},
    {name:'Bay Area',href:'/locations/san-francisco-bay-area'},
    {name:'San Diego',href:'/locations/san-diego-metro'},
    {name:'Sacramento',href:'/locations/sacramento-metro'},
    {name:'Inland Empire',href:'/locations/inland-empire'}
  ],
  insights:[
    {name:'Why North Atlanta Homeowners Are Underinsured',href:'/insights/north-atlanta-homeowners-underinsured',sub:'Market Update'},
    {name:'Georgia Wind \u0026 Hail Deductibles Explained',href:'/insights/georgia-wind-hail-deductibles-explained',sub:'Coverage Explained'},
    {name:'How Independent Agents Actually Get Paid',href:'/insights/how-independent-agents-get-paid',sub:'Coverage Explained'},
    {name:'California Homeowners Insurance in 2026',href:'/insights/california-homeowners-insurance-2026',sub:'Market Update'},
    {name:'Georgia Flood Insurance: NFIP vs Private',href:'/insights/georgia-flood-insurance-nfip-vs-private',sub:'Coverage Explained'},
    {name:'View All Insights',href:'/insights',sub:''}
  ],
  about:[
    {name:'About Olive Cover',href:'/about'},
    {name:'FAQ',href:'/faq'},
    {name:'Where We Do Business',href:'/where-we-do-business'},
    {name:'Licensing',href:'/licensing'}
  ]
};

function getState(){try{return localStorage.getItem('oc_state')||'georgia';}catch(e){return 'georgia';}}
function setState(s){try{localStorage.setItem('oc_state',s);}catch(e){}}

function injectCSS(){
  if(document.getElementById('ocnav-css'))return;
  var s=document.createElement('style');
  s.id='ocnav-css';
  s.textContent=[
    '#ocnav-bar{display:flex;align-items:center;justify-content:space-between;height:60px;background:#1B3A5C;padding:0 24px;position:fixed;top:0;left:0;right:0;z-index:9999;font-family:Inter,sans-serif;}',
    '#ocnav-spacer{height:60px;}',
    '#ocnav-bar .ocn-logo{display:flex;align-items:center;text-decoration:none;flex-shrink:0;}',
    '#ocnav-bar .ocn-logo img{height:32px;width:auto;}',
    '#ocnav-bar .ocn-links{display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0;}',
    '#ocnav-bar .ocn-item{position:relative;}',
    '#ocnav-bar .ocn-btn{display:flex;align-items:center;gap:4px;padding:8px 12px;color:rgba(255,255,255,.9);font-size:14px;font-weight:500;background:none;border:none;cursor:pointer;border-radius:6px;white-space:nowrap;transition:background .15s;}',
    '#ocnav-bar .ocn-btn:hover{background:rgba(255,255,255,.1);}',
    '#ocnav-bar .ocn-btn .ocn-arr{font-size:9px;opacity:.6;transition:transform .2s;}',
    '#ocnav-bar .ocn-item.ocn-open .ocn-btn .ocn-arr{transform:rotate(180deg);}',
    '#ocnav-bar .ocn-drop{display:none;position:absolute;top:calc(100% + 6px);left:0;background:#fff;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.18);z-index:10000;min-width:660px;overflow:hidden;}',
    '#ocnav-bar .ocn-drop.ocn-right{left:auto;right:0;min-width:220px;}',
    '#ocnav-bar .ocn-drop.ocn-narrow{min-width:200px;}',
    '#ocnav-bar .ocn-item.ocn-open .ocn-drop{display:block;}',
    '#ocnav-bar .ocn-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding:8px;}',
    '#ocnav-bar .ocn-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:0;padding:8px;}',
    '#ocnav-bar .ocn-col{}',
    '#ocnav-bar .ocn-col-hd{padding:8px 14px 4px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#B8934A;border-bottom:1px solid #f1f5f9;margin-bottom:2px;}',
    '#ocnav-bar .ocn-drop a{display:flex;flex-direction:column;padding:8px 14px;color:#1B3A5C;text-decoration:none;font-size:13px;font-weight:500;border-radius:6px;transition:background .12s;}',
    '#ocnav-bar .ocn-drop a:hover{background:#f2f4f8;}',
    '#ocnav-bar .ocn-drop a .ocn-sub{font-size:11px;color:#94a3b8;font-weight:400;margin-top:1px;}',
    '#ocnav-bar .ocn-drop a:hover .ocn-sub{color:#64748b;}',
    '#ocnav-bar .ocn-drop .ocn-divider{height:1px;background:#f1f5f9;margin:4px 8px;}',
    '#ocnav-bar .ocn-drop .ocn-view-all{display:block;text-align:center;padding:10px;color:#B8934A !important;font-size:12px;font-weight:600;border-top:1px solid #f1f5f9;margin:4px 0 0;background:none !important;}',
    '#ocnav-bar .ocn-drop .ocn-view-all:hover{background:#fef9f0 !important;}',
    '#ocnav-bar .ocn-right-group{display:flex;align-items:center;gap:8px;}',
    '#ocnav-bar .ocn-state-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:20px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap;}',
    '#ocnav-bar .ocn-state-btn:hover{background:rgba(255,255,255,.2);}',
    '#ocnav-bar .ocn-cta{display:flex;align-items:center;padding:9px 18px;background:#C7A24B;color:#fff;font-size:13px;font-weight:600;border-radius:6px;text-decoration:none;white-space:nowrap;transition:background .15s;}',
    '#ocnav-bar .ocn-cta:hover{background:#b8934a;}',
    '#ocnav-bar .ocn-phone{color:rgba(255,255,255,.75);font-size:12px;text-decoration:none;}',
    '#ocnav-bar .ocn-phone:hover{color:#fff;}',
    '@media(max-width:900px){#ocnav-bar .ocn-links{display:none;}#ocnav-bar .ocn-phone{display:none;}#ocn-hamburger{display:flex !important;}}'
  ].join('');
  document.head.appendChild(s);
}

function makeLink(item){
  var a=document.createElement('a');
  a.href=item.href;
  if(item.name==='View All Insights'){
    a.className='ocn-view-all';
    a.textContent=item.name;
    return a;
  }
  var nm=document.createElement('span');
  nm.textContent=item.name;
  a.appendChild(nm);
  if(item.sub){
    var sb=document.createElement('span');
    sb.className='ocn-sub';
    sb.textContent=item.sub;
    a.appendChild(sb);
  }
  return a;
}

function makeGrid3(cols){
  // cols: array of {hd:string, items:[]}
  var drop=document.createElement('div');
  drop.className='ocn-drop';
  var grid=document.createElement('div');
  grid.className='ocn-grid';
  cols.forEach(function(col){
    var c=document.createElement('div');
    c.className='ocn-col';
    if(col.hd){
      var h=document.createElement('div');
      h.className='ocn-col-hd';
      h.textContent=col.hd;
      c.appendChild(h);
    }
    col.items.forEach(function(item){
      c.appendChild(makeLink(item));
    });
    grid.appendChild(c);
  });
  drop.appendChild(grid);
  return drop;
}

function makeGrid2(cols){
  var drop=document.createElement('div');
  drop.className='ocn-drop';
  var grid=document.createElement('div');
  grid.className='ocn-grid-2';
  cols.forEach(function(col){
    var c=document.createElement('div');
    c.className='ocn-col';
    if(col.hd){
      var h=document.createElement('div');
      h.className='ocn-col-hd';
      h.textContent=col.hd;
      c.appendChild(h);
    }
    col.items.forEach(function(item){
      c.appendChild(makeLink(item));
    });
    grid.appendChild(c);
  });
  drop.appendChild(grid);
  return drop;
}

function makeSimple(items){
  var drop=document.createElement('div');
  drop.className='ocn-drop ocn-narrow ocn-right';
  items.forEach(function(item){drop.appendChild(makeLink(item));});
  return drop;
}

function buildNav(){
  hideOldNav();
  var state=getState();
  injectCSS();

  var bar=document.createElement('div');
  bar.id='ocnav-bar';

  // Logo
  var logoLink=document.createElement('a');
  logoLink.href='/';
  logoLink.className='ocn-logo';
  logoLink.id='ocnav-logo';
  bar.appendChild(logoLink);

  // Links
  var ul=document.createElement('ul');
  ul.className='ocn-links';

  var p=NAV.personal;
  var navItems=[
    {label:'Personal Lines',drop:makeGrid3([
      {hd:'Home \u0026 Property',items:p.slice(0,4)},
      {hd:'Protection',items:p.slice(4,8)},
      {hd:'Specialty \u0026 Bundle',items:p.slice(8,12)}
    ])},
    {label:'Commercial',drop:makeGrid3([
      {hd:'Core Coverage',items:NAV.commercial.slice(0,3)},
      {hd:'Liability \u0026 Pro',items:NAV.commercial.slice(3,6)},
      {hd:'Specialty',items:NAV.commercial.slice(6,8)}
    ])},
    {label:'Carriers',drop:makeGrid2([
      {hd:state==='california'?'California Carriers':'Georgia Carriers',items:state==='california'?NAV.carriers_ca:NAV.carriers_ga},
      {hd:'Commercial',items:[
        {name:'Travelers Commercial',href:'/commercial-carriers/travelers-commercial-insurance'},
        {name:'The Hartford Commercial',href:'/commercial-carriers/hartford-commercial-insurance'},
        {name:'Nationwide Commercial',href:'/commercial-carriers/nationwide-commercial-insurance'},
        {name:'CNA',href:'/commercial-carriers/cna-commercial-insurance'},
        {name:'Hanover',href:'/commercial-carriers/hanover-commercial-insurance'}
      ]}
    ])},
    {label:'Locations',drop:makeGrid2([
      {hd:state==='california'?'California':'Georgia',items:state==='california'?NAV.locations_ca:NAV.locations_ga.slice(0,8)},
      {hd:state==='california'?'':'More Georgia',items:state==='california'?[]:[
        {name:'Sugar Hill',href:'/cities/georgia-sugar-hill'},
        {name:'Buford',href:'/cities/georgia-buford'},
        {name:'Savannah',href:'/locations/savannah'},
        {name:'Columbus',href:'/locations/columbus'},
        {name:'Cherokee \u0026 Forsyth',href:'/locations/cherokee-forsyth-county'}
      ]}
    ])},
    {label:'Insights',drop:makeGrid2([
      {hd:'Georgia',items:NAV.insights.slice(0,2)},
      {hd:'All Topics',items:NAV.insights.slice(2,6)}
    ])},
    {label:'About',drop:makeSimple(NAV.about)}
  ];

  navItems.forEach(function(ni){
    var li=document.createElement('li');
    li.className='ocn-item';
    var btn=document.createElement('button');
    btn.className='ocn-btn';
    btn.innerHTML=ni.label+' <span class="ocn-arr">\u25BE</span>';
    li.appendChild(btn);
    li.appendChild(ni.drop);
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var wasOpen=li.classList.contains('ocn-open');
      document.querySelectorAll('#ocnav-bar .ocn-item.ocn-open').forEach(function(el){el.classList.remove('ocn-open');});
      if(!wasOpen)li.classList.add('ocn-open');
    });
    // Hover open/close
    li.addEventListener('mouseenter',function(){
      document.querySelectorAll('#ocnav-bar .ocn-item.ocn-open').forEach(function(el){el.classList.remove('ocn-open');});
      li.classList.add('ocn-open');
    });
    li.addEventListener('mouseleave',function(){li.classList.remove('ocn-open');});
    ul.appendChild(li);
  });
  document.addEventListener('click',function(){
    document.querySelectorAll('#ocnav-bar .ocn-item.ocn-open').forEach(function(el){el.classList.remove('ocn-open');});
  });

  bar.appendChild(ul);

  // Right group
  var rg=document.createElement('div');
  rg.className='ocn-right-group';

  // Phone
  var ph=document.createElement('a');
  ph.href='tel:+16788881011';
  ph.className='ocn-phone';
  ph.textContent='(678) 888-1011';
  rg.appendChild(ph);

  // State switcher
  var sw=document.createElement('button');
  sw.className='ocn-state-btn';
  sw.id='ocn-state-switch';
  var stateLabel=state==='california'?'\uD83C\uDDE8\uD83C\uDDE6 California':'\uD83C\uDDEC\uD83C\uDDE6 Georgia';
  sw.innerHTML=stateLabel;
  sw.addEventListener('click',function(){
    var ns=state==='georgia'?'california':'georgia';
    setState(ns);
    window.location.href='/states/'+ns;
  });
  rg.appendChild(sw);

  // CTA
  var cta=document.createElement('a');
  cta.href='/contact';
  cta.className='ocn-cta';
  cta.textContent='Start your coverage review';
  rg.appendChild(cta);

  // Hamburger (hidden on desktop)
  var hb=document.createElement('button');
  hb.id='ocn-hamburger';
  hb.setAttribute('aria-label','Open navigation');
  hb.style.cssText='display:none;background:none;border:none;cursor:pointer;padding:8px;flex-direction:column;gap:5px;';
  for(var i=0;i<3;i++){var sp=document.createElement('span');sp.style.cssText='display:block;width:22px;height:2px;background:#fff;transition:all .2s;';hb.appendChild(sp);}
  rg.appendChild(hb);

  bar.appendChild(rg);

  // Spacer
  var spacer=document.createElement('div');
  spacer.id='ocnav-spacer';

  document.body.insertBefore(spacer,document.body.firstChild);
  document.body.insertBefore(bar,document.body.firstChild);

  // Logo injection handled by oclogofix polling
}

function hideOldNav(){
  var nav=document.getElementById('oc-nav');
  if(nav)nav.style.display='none';
}

function fixFooter(){
  // Fix footer carrier link
  var links=document.querySelectorAll('a[href]');
  links.forEach(function(a){
    if(a.textContent.trim()==='Our Carriers'&&a.getAttribute('href')==='/carriers'){
      a.href='/carriers/travelers-insurance';
    }
  });
}

function fixCarrierText(){
  if(!window.location.pathname.match('/california'))return;
  document.querySelectorAll('*').forEach(function(el){
    if(el.children.length>0)return;
    var t=el.textContent;
    if(t==='Appointed in Georgia')el.textContent='Recently appointed';
    if(t==='Georgia Range')el.textContent='California Range';
  });
}

function fixTrustBar(){
  var badges=document.querySelectorAll('.oc-trust-badge');
  badges.forEach(function(b){
    var txt=b.textContent||'';
    if(txt.indexOf('NPN')>-1&&txt.indexOf('Georgia')>-1){
      b.innerHTML=b.innerHTML.replace('NPN 2790083Georgia','NPN 2790083 | Georgia');
    }
  });
}

function fixAboutPage(){
  if(window.location.pathname!=='/about')return;
  setTimeout(function(){
    var els=document.querySelectorAll('.oc-about-license');
    els.forEach(function(el){el.style.display='none';});
  },300);
}

function fixHomePage(){
  if(window.location.pathname!=='/')return;
  var state=getState();
  var hero=document.getElementById('oc-hero');
  if(hero){
    var bg=hero.querySelector('#oc-hero-bg,[data-unsplash-query]');
    if(bg&&state==='california'){
      bg.setAttribute('data-unsplash-query','California Pacific Coast Highway Los Angeles');
    }
  }
}

function fixPhoneLinks(){
  document.querySelectorAll('*').forEach(function(el){
    if(el.children.length>0)return;
    if(el.textContent.trim()==='(678) 888-1011'){
      var p=el.parentElement;
      if(p&&p.tagName!=='A'){
        var a=document.createElement('a');
        a.href='tel:+16788881011';
        a.style.cssText='color:inherit;text-decoration:none;';
        a.textContent='(678) 888-1011';
        p.replaceChild(a,el);
      }
    }
  });
}

function fixSocialIcons(){
  var icons={
    'f':'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    'ig':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    'in':'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
  };
  document.querySelectorAll('a').forEach(function(a){
    var t=a.textContent.trim();
    if(icons[t]){a.innerHTML=icons[t];a.setAttribute('aria-label',t==='f'?'Facebook':t==='ig'?'Instagram':'LinkedIn');}
  });
}

function fixGeoFallback(){
  setTimeout(function(){
    try{if(!localStorage.getItem('oc_state'))localStorage.setItem('oc_state','georgia');}catch(e){}
  },3000);
}

function fixInsights(){
  if(window.location.pathname!=='/insights')return;
  var state=getState();
  document.querySelectorAll('[data-scope],[data-state]').forEach(function(el){
    var scope=el.getAttribute('data-scope')||el.getAttribute('data-state')||'national';
    el.style.display=(scope==='national'||scope===state)?'':'none';
  });
}

function fixCarrierCards(){
  if(!window.location.pathname.match('/(personal-insurance|commercial-insurance|carriers|commercial-carriers)'))return;
  var s=document.getElementById('oc-carrier-card-css');
  if(s)return;
  var style=document.createElement('style');
  style.id='oc-carrier-card-css';
  style.textContent='#ins-carriers .w-dyn-list,.ins-carrier-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;}.ins-carrier-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;}';
  document.head.appendChild(style);
}

function fixFooterCarriersLink(){
  document.querySelectorAll('a').forEach(function(a){
    if(a.textContent.trim()==='Our Carriers'&&(a.href.endsWith('/carriers')||a.href.endsWith('/carriers/'))){
      a.href='/carriers/travelers-insurance';
    }
  });
}

function fixTestimonials(){
  if(window.location.pathname!=='/')return;
  var token=window._ocToken;
  if(!token)return;
  var state;
  try{state=localStorage.getItem('oc_state')||'georgia';}catch(e){state='georgia';}
  fetch('https://api.webflow.com/v2/collections/69ea23994c529b33d152eb17/items?limit=50',{
    headers:{Authorization:'Bearer '+token}
  }).then(function(r){return r.json();}).then(function(d){
    var items=(d.items||[]).filter(function(i){
      var s=(i.fieldData['state-slug']||'').toLowerCase();
      var active=i.fieldData['is-active']!==false;
      var featured=i.fieldData['is-featured']===true;
      return active&&featured&&(s==='global'||s===state||s==='');
    }).sort(function(a,b){
      return (a.fieldData['sort-order']||99)-(b.fieldData['sort-order']||99);
    }).slice(0,3);
    if(!items.length)return;
    var grid=document.getElementById('testi-grid');
    if(!grid)return;
    grid.innerHTML='';
    items.forEach(function(i){
      var f=i.fieldData;
      var card=document.createElement('div');
      card.className='oc-testi-card';
      card.innerHTML='<div class="oc-testi-stars">\u2605\u2605\u2605\u2605\u2605</div>'+
        '<div class="oc-testi-open">\u201c</div>'+
        '<p class="oc-testi-text">'+f.quote+'</p>'+
        '<div class="oc-testi-close">\u201d</div>'+
        '<div class="oc-testi-meta">'+
          '<span class="oc-testi-name">'+f.name+'</span>'+
          '<span class="oc-testi-sep">\u00b7</span>'+
          '<span class="oc-testi-loc">'+f.location+' </span>'+
          '<span class="oc-testi-sep">\u00b7</span>'+
          '<span class="oc-testi-cov"> '+f['coverage-type']+'</span>'+
        '</div>';
      grid.appendChild(card);
    });
  }).catch(function(){});
}

function fixTemplateSEO(){
  var token=window._ocToken;
  if(!token)return;
  var path=window.location.pathname;
  var collections=[
    {prefix:'/personal-insurance/',id:'69e2c47342c9cc359235da7b',slugField:'page-slug'},
    {prefix:'/commercial-insurance/',id:'69e309313129d5885beb556b',slugField:'page-slug'},
    {prefix:'/carriers/',id:'69e2c474c6e942f8dc3a92a4',slugField:'page-slug'},
    {prefix:'/commercial-carriers/',id:'69e2cbe680de971437c3f0ca',slugField:'page-slug'},
    {prefix:'/locations/',id:'69e2c47442c9cc359235dacd',slugField:'page-slug'},
    {prefix:'/states/',id:'69e2c474742df85703a42d14',slugField:'slug'},
    {prefix:'/cities/',id:'69e2e92dc55b625dc265b1f0',slugField:'slug'},
    {prefix:'/faq/',id:'69e2c7f90ef88a50c39b2bc2',slugField:'slug'},
    {prefix:'/insights/',id:'69e7aab3da8662897ee1211f',slugField:'slug'}
  ];
  var match=collections.find(function(c){return path.indexOf(c.prefix)===0&&path.length>c.prefix.length;});
  if(!match)return;
  var slug=path.replace(match.prefix,'').replace(/\/$/,'');
  if(!slug)return;
  fetch('https://api.webflow.com/v2/collections/'+match.id+'/items?limit=100',{
    headers:{Authorization:'Bearer '+token}
  }).then(function(r){return r.json();}).then(function(d){
    var items=d.items||[];
    var item=items.find(function(i){
      var s=i.fieldData[match.slugField]||i.fieldData.slug||'';
      return s===slug;
    });
    if(!item)return;
    var f=item.fieldData;
    if(f['seo-title']){
      document.title=f['seo-title'];
      var og=document.querySelector('meta[property="og:title"]');
      if(og)og.setAttribute('content',f['seo-title']);
    }
    if(f['seo-description']){
      var meta=document.querySelector('meta[name="description"]');
      if(meta)meta.setAttribute('content',f['seo-description']);
      else{var m=document.createElement('meta');m.name='description';m.content=f['seo-description'];document.head.appendChild(m);}
      var ogD=document.querySelector('meta[property="og:description"]');
      if(ogD)ogD.setAttribute('content',f['seo-description']);
    }
  }).catch(function(){});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',buildNav);
}else{
  buildNav();
}
fixGeoFallback();

document.addEventListener('DOMContentLoaded',function(){
  fixFooter();
  fixCarrierText();
  fixTrustBar();
  fixAboutPage();
  fixHomePage();
  fixPhoneLinks();
  fixSocialIcons();
  fixFooterCarriersLink();
  fixCarrierCards();
  fixInsights();
  fixTestimonials();
  fixTemplateSEO();
});

})();