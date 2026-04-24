(function(){

/* ============================================================
   OLIVE COVER — ocnav-complete.js
   Single consolidated nav script. Contains:
   1. Nav bar CSS
   2. Mega menu CSS
   3. Mobile CSS
   4. Hamburger handler
   5. Mega menu dropdown builder
   Version: 1.0.0 | April 24, 2026
   ============================================================ */

/* ---- 1. INJECT ALL CSS ---- */
var s = document.createElement('style');
s.id = 'ocnav-styles';
s.textContent = [

  /* Base nav bar */
  '#oc-static-nav{position:relative;z-index:9999;}',
  '#oc-static-nav-bar{',
    'position:fixed;top:0;left:0;width:100%;height:64px;',
    'background:#1B3A5C;',
    'display:flex;align-items:center;justify-content:space-between;',
    'padding:0 32px;box-sizing:border-box;',
    'z-index:9999;',
    'border-bottom:1px solid rgba(199,162,75,0.25);',
  '}',
  'body{padding-top:64px;}',

  /* Logo */
  '#ocnav-logo-img{height:32px;width:auto;display:block;}',

  /* Desktop links container */
  '#ocnav-links-desktop{',
    'display:flex;align-items:center;gap:2px;',
    'height:64px;margin-left:auto;',
  '}',

  /* Flat nav links (Insights, About) */
  '.ocnav-link{',
    'color:rgba(255,255,255,0.82);',
    'font-family:Inter,sans-serif;font-size:14px;font-weight:500;',
    'text-decoration:none;padding:0 14px;height:64px;',
    'display:flex;align-items:center;',
    'transition:color 0.15s;white-space:nowrap;',
  '}',
  '.ocnav-link:hover{color:#fff;}',

  /* Gold CTA button */
  '.ocnav-cta-1{',
    'background:#C7A24B;color:#fff;',
    'font-family:Inter,sans-serif;font-size:13px;font-weight:600;',
    'text-decoration:none;padding:0 20px;height:38px;',
    'display:flex;align-items:center;',
    'border-radius:7px;margin-left:14px;',
    'white-space:nowrap;flex-shrink:0;',
    'transition:background 0.15s;',
  '}',
  '.ocnav-cta-1:hover{background:#b8914a;}',

  /* Hamburger button */
  '#ocnav-hamburger{',
    'display:none;flex-direction:column;gap:5px;',
    'cursor:pointer;padding:8px;',
    'background:none;border:none;',
  '}',
  '#ocnav-hamburger span{',
    'display:block;width:22px;height:2px;',
    'background:#C7A24B;border-radius:2px;',
  '}',

  /* Mobile menu panel */
  '#ocnav-mob{',
    'display:none;position:fixed;top:64px;left:0;width:100%;',
    'background:#1B3A5C;z-index:9998;',
    'padding:8px 16px 20px;',
    'max-height:calc(100vh - 64px);overflow-y:auto;',
  '}',
  '#ocnav-mob.ocnav-open{display:block;}',
  '.ocnav-mob-section-title{',
    'font-family:Inter,sans-serif;font-size:10px;font-weight:700;',
    'color:#C7A24B;letter-spacing:0.1em;text-transform:uppercase;',
    'padding:16px 0 6px;',
  '}',
  '.ocnav-mob-link{',
    'display:block;color:rgba(255,255,255,0.82);',
    'font-family:Inter,sans-serif;font-size:14px;font-weight:500;',
    'text-decoration:none;padding:10px 0;',
    'border-bottom:1px solid rgba(255,255,255,0.07);',
  '}',
  '.ocnav-mob-link:hover{color:#fff;}',
  '.ocnav-mob-divider{height:1px;background:rgba(255,255,255,0.1);margin:8px 0;}',
  '.ocnav-mob-cta{',
    'display:block;margin:16px 0 0;padding:13px 16px;',
    'background:#C7A24B;color:#fff;',
    'font-family:Inter,sans-serif;font-size:14px;font-weight:600;',
    'text-decoration:none;border-radius:7px;text-align:center;',
  '}',

  /* ---- MEGA MENU DROPDOWN ---- */
  '.ocnav-dd-wrap{',
    'position:relative;height:64px;display:flex;align-items:center;',
  '}',
  '.ocnav-dd-trigger{',
    'color:rgba(255,255,255,0.82);',
    'font-family:Inter,sans-serif;font-size:14px;font-weight:500;',
    'padding:0 14px;height:64px;',
    'display:flex;align-items:center;gap:5px;',
    'cursor:pointer;white-space:nowrap;',
    'transition:color 0.15s;user-select:none;',
  '}',
  '.ocnav-dd-trigger:hover{color:#fff;}',
  '.ocnav-chevron{',
    'font-size:9px;opacity:0.65;',
    'transition:transform 0.2s;display:inline-block;line-height:1;',
  '}',
  '.ocnav-dd-wrap:hover .ocnav-chevron{transform:rotate(180deg);}',

  /* Full-width panel */
  '.ocnav-dd-panel{',
    'display:none;',
    'position:fixed;top:64px;left:0;width:100%;',
    'background:#fff;',
    'border-top:2px solid #C7A24B;',
    'box-shadow:0 12px 40px rgba(27,58,92,0.14);',
    'z-index:9998;',
    'padding:32px 40px 36px;',
    'box-sizing:border-box;',
  '}',
  '.ocnav-dd-wrap:hover .ocnav-dd-panel{display:block;}',

  /* Mega menu inner */
  '.ocnav-mega{',
    'display:flex;gap:0;',
    'max-width:1100px;margin:0 auto;',
  '}',
  '.ocnav-mega-col{',
    'flex:1;padding:0 28px;',
    'border-right:1px solid #eef1f5;',
  '}',
  '.ocnav-mega-col:first-child{padding-left:0;}',
  '.ocnav-mega-col:last-child{border-right:none;}',
  '.ocnav-mega-col-title{',
    'font-family:Inter,sans-serif;font-size:10px;font-weight:700;',
    'color:#C7A24B;letter-spacing:0.1em;text-transform:uppercase;',
    'margin-bottom:12px;padding-bottom:8px;',
    'border-bottom:1px solid #f0ebe0;',
  '}',
  '.ocnav-mega-col a{',
    'display:block;padding:7px 0;',
    'color:#1B3A5C;',
    'font-family:Inter,sans-serif;font-size:13.5px;font-weight:500;',
    'text-decoration:none;',
    'border-bottom:1px solid #f8f8f8;',
    'transition:color 0.12s, padding-left 0.12s;',
  '}',
  '.ocnav-mega-col a:hover{color:#C7A24B;padding-left:4px;}',
  '.ocnav-mega-col a:last-child{border-bottom:none;}',
  '.ocnav-mega-view-all{',
    'display:inline-block;margin-top:10px;',
    'color:#C7A24B!important;font-weight:600!important;font-size:13px!important;',
    'border-bottom:none!important;',
  '}',

  /* Responsive breakpoints */
  '@media(max-width:960px){',
    '#ocnav-links-desktop{display:none;}',
    '#ocnav-hamburger{display:flex;}',
    '.ocnav-dd-wrap{display:none;}',
  '}',

  /* Mobile viewport fix */
  'html,body{max-width:100vw;overflow-x:hidden;}',

  /* Carrier marquee */
  '@keyframes oc-marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}',
  '.oc-carriers-inner{',
    'animation:oc-marquee 30s linear infinite;',
    'display:flex;width:max-content;',
    'will-change:transform;white-space:nowrap;',
  '}',
  '.oc-carriers-inner:hover{animation-play-state:paused;}',

  /* Insights grid responsive */
  '@media(max-width:1024px){#ins5-grid{grid-template-columns:repeat(2,1fr)!important;}}',
  '@media(max-width:480px){#ins5-grid{grid-template-columns:1fr!important;}}',

  /* Footer responsive */
  '@media(max-width:900px){#oc-footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important;}}',
  '@media(max-width:600px){#oc-footer-grid{grid-template-columns:1fr!important;gap:24px!important;}}',

].join('');
document.head.appendChild(s);

/* ---- 2. HAMBURGER HANDLER ---- */
document.addEventListener('DOMContentLoaded', function(){

  var h = document.getElementById('ocnav-hamburger');
  if(h){
    h.onclick = function(){
      var m = document.getElementById('ocnav-mob');
      if(m) m.classList.toggle('ocnav-open');
    };
  }

  /* ---- 3. MEGA MENU DROPDOWN BUILDER ---- */
  var desktop = document.getElementById('ocnav-links-desktop');
  if(!desktop) return;

  var cfg = {
    personal: {
      label: 'Personal',
      cols: [
        {
          title: 'Home & Property',
          links: [
            {t:'Homeowners Insurance', u:'/personal-insurance/homeowners-insurance'},
            {t:'Condo Insurance',       u:'/personal-insurance/condo-insurance'},
            {t:'Renters Insurance',     u:'/personal-insurance/renters-insurance'},
            {t:'Landlord Insurance',    u:'/personal-insurance/landlord-insurance'},
            {t:'Flood Insurance',       u:'/personal-insurance/flood-insurance'}
          ]
        },
        {
          title: 'Auto & Vehicle',
          links: [
            {t:'Auto Insurance',        u:'/personal-insurance/auto-insurance'},
            {t:'Motorcycle Insurance',  u:'/personal-insurance/motorcycle-insurance'},
            {t:'Boat Insurance',        u:'/personal-insurance/boat-insurance'},
            {t:'Collector Auto',        u:'/personal-insurance/collector-auto-insurance'},
            {t:'Scheduled Articles',    u:'/personal-insurance/scheduled-articles'}
          ]
        },
        {
          title: 'Personal Liability',
          links: [
            {t:'Umbrella Insurance',    u:'/personal-insurance/umbrella-insurance'},
            {t:'Identity Theft',        u:'/personal-insurance/identity-theft'},
            {t:'Pet Insurance',         u:'/personal-insurance/pet-insurance'}
          ]
        }
      ]
    },
    commercial: {
      label: 'Commercial',
      cols: [
        {
          title: 'Business Property',
          links: [
            {t:'Business Owners Policy', u:'/commercial-insurance/business-owners-policy'},
            {t:'Commercial Property',    u:'/commercial-insurance/commercial-property'},
            {t:'Inland Marine',          u:'/commercial-insurance/inland-marine'}
          ]
        },
        {
          title: 'Liability',
          links: [
            {t:'General Liability',      u:'/commercial-insurance/general-liability'},
            {t:'Professional Liability', u:'/commercial-insurance/professional-liability'},
            {t:'Cyber Insurance',        u:'/commercial-insurance/cyber-insurance'},
            {t:'Management Liability',   u:'/commercial-insurance/management-liability'}
          ]
        },
        {
          title: 'Auto & Workforce',
          links: [
            {t:'Commercial Auto',        u:'/commercial-insurance/commercial-auto-insurance'},
            {t:'Workers Compensation',   u:'/commercial-insurance/workers-compensation'},
            {t:'Surety Bonds',           u:'/commercial-insurance/surety-bonds'}
          ]
        }
      ]
    },
    carriers: {
      label: 'Carriers',
      cols: [
        {
          title: 'Personal Lines',
          links: [
            {t:'Travelers',   u:'/carriers/travelers-insurance'},
            {t:'Progressive', u:'/carriers/progressive-insurance'},
            {t:'Safeco',      u:'/carriers/safeco-insurance'},
            {t:'Hippo',       u:'/carriers/hippo-insurance'},
            {t:'Openly',      u:'/carriers/openly-insurance'}
          ]
        },
        {
          title: 'Commercial Lines',
          links: [
            {t:'Nationwide',   u:'/carriers/nationwide-insurance'},
            {t:'The Hartford', u:'/carriers/hartford-insurance'},
            {t:'Stillwater',   u:'/carriers/stillwater-insurance'},
            {t:'Chubb',        u:'/carriers/chubb-insurance'}
          ]
        },
        {
          title: 'Find the Right Fit',
          links: [
            {t:'View all carriers \u2192', u:'/carriers/travelers-insurance', cls:'ocnav-mega-view-all'}
          ]
        }
      ]
    }
  };

  var links = desktop.querySelectorAll('a.ocnav-link');
  links.forEach(function(link){
    var txt = (link.textContent || '').trim().toLowerCase();
    Object.keys(cfg).forEach(function(key){
      if(txt !== cfg[key].label.toLowerCase()) return;

      /* Build wrapper */
      var wrap = document.createElement('div');
      wrap.className = 'ocnav-dd-wrap';

      /* Trigger span */
      var trig = document.createElement('span');
      trig.className = 'ocnav-dd-trigger';
      trig.innerHTML = cfg[key].label + ' <span class="ocnav-chevron">&#9660;</span>';

      /* Full-width panel */
      var panel = document.createElement('div');
      panel.className = 'ocnav-dd-panel';

      var mega = document.createElement('div');
      mega.className = 'ocnav-mega';

      cfg[key].cols.forEach(function(col){
        var c = document.createElement('div');
        c.className = 'ocnav-mega-col';

        var title = document.createElement('div');
        title.className = 'ocnav-mega-col-title';
        title.textContent = col.title;
        c.appendChild(title);

        col.links.forEach(function(item){
          var a = document.createElement('a');
          a.href = item.u;
          a.textContent = item.t;
          if(item.cls) a.className = item.cls;
          c.appendChild(a);
        });

        mega.appendChild(c);
      });

      panel.appendChild(mega);
      wrap.appendChild(trig);
      wrap.appendChild(panel);

      link.parentNode.insertBefore(wrap, link);
      link.parentNode.removeChild(link);
    });
  });

  /* ---- 4. MOBILE MENU BUILDER ---- */
  var mob = document.getElementById('ocnav-mob');
  if(!mob) return;

  /* Clear existing canvas mobile links */
  mob.innerHTML = '';

  var mobSections = [
    {
      title: 'Personal Lines',
      links: [
        {t:'Homeowners',        u:'/personal-insurance/homeowners-insurance'},
        {t:'Auto Insurance',    u:'/personal-insurance/auto-insurance'},
        {t:'Umbrella',          u:'/personal-insurance/umbrella-insurance'},
        {t:'Renters Insurance', u:'/personal-insurance/renters-insurance'},
        {t:'Flood Insurance',   u:'/personal-insurance/flood-insurance'},
        {t:'Motorcycle',        u:'/personal-insurance/motorcycle-insurance'},
        {t:'Boat Insurance',    u:'/personal-insurance/boat-insurance'}
      ]
    },
    {
      title: 'Commercial Lines',
      links: [
        {t:'Business Owners Policy', u:'/commercial-insurance/business-owners-policy'},
        {t:'General Liability',      u:'/commercial-insurance/general-liability'},
        {t:'Commercial Auto',        u:'/commercial-insurance/commercial-auto-insurance'},
        {t:'Workers Comp',           u:'/commercial-insurance/workers-compensation'},
        {t:'Cyber Insurance',        u:'/commercial-insurance/cyber-insurance'}
      ]
    },
    {
      title: 'Company',
      links: [
        {t:'Insights',         u:'/insights'},
        {t:'About',            u:'/about'},
        {t:'FAQ',              u:'/faq'},
        {t:'Contact',          u:'/contact'}
      ]
    }
  ];

  mobSections.forEach(function(section, i){
    var title = document.createElement('div');
    title.className = 'ocnav-mob-section-title';
    title.textContent = section.title;
    mob.appendChild(title);

    section.links.forEach(function(item){
      var a = document.createElement('a');
      a.className = 'ocnav-mob-link';
      a.href = item.u;
      a.textContent = item.t;
      mob.appendChild(a);
    });

    if(i < mobSections.length - 1){
      var div = document.createElement('div');
      div.className = 'ocnav-mob-divider';
      mob.appendChild(div);
    }
  });

  var cta = document.createElement('a');
  cta.className = 'ocnav-mob-cta';
  cta.href = '/coverage-review';
  cta.textContent = 'Start your coverage review';
  mob.appendChild(cta);

});

})();
