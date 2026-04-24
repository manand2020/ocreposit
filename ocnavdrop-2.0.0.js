/* ocnavdrop v2.0.0 — 3-column hover dropdowns for Personal, Commercial, Carriers */
(function(){
  var MENUS = {
    personal: {
      cols: [
        [
          {label:'Homeowners',    href:'/personal-insurance/homeowners-insurance'},
          {label:'Auto Insurance',href:'/personal-insurance/auto-insurance'}
        ],
        [
          {label:'Umbrella',      href:'/personal-insurance/umbrella-insurance'},
          {label:'Renters',       href:'/personal-insurance/renters-insurance'}
        ],
        [
          {label:'Flood Insurance',href:'/personal-insurance/flood-insurance'},
          {label:'Landlord',      href:'/personal-insurance/landlord-insurance'}
        ]
      ]
    },
    commercial: {
      cols: [
        [
          {label:'Business Owners Policy',href:'/commercial-insurance/business-owners-policy'},
          {label:'General Liability',     href:'/commercial-insurance/general-liability'}
        ],
        [
          {label:'Commercial Auto',   href:'/commercial-insurance/commercial-auto'},
          {label:'Workers Comp',      href:'/commercial-insurance/workers-compensation'}
        ],
        [
          {label:'Cyber Insurance',   href:'/commercial-insurance/cyber-insurance'}
        ]
      ]
    },
    carriers: {
      cols: [
        [
          {label:'Travelers',   href:'/carriers/travelers-insurance'},
          {label:'Progressive', href:'/carriers/progressive-insurance'}
        ],
        [
          {label:'Nationwide',  href:'/carriers/nationwide-insurance'},
          {label:'Safeco',      href:'/carriers/safeco-insurance'}
        ],
        [
          {label:'The Hartford',    href:'/carriers/hartford-insurance'},
          {label:'View all carriers',href:'/carriers/travelers-insurance'}
        ]
      ]
    }
  };

  var CSS = [
    '#oc-static-nav-bar{overflow:visible!important;}',
    '#ocnav-links-desktop{overflow:visible!important;}',
    '.ocnav-dd-wrap{position:relative;display:inline-flex;align-items:center;}',
    '.ocnav-dd-label{font-family:Inter,sans-serif;font-size:15px;font-weight:500;color:rgba(255,255,255,0.82);text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:5px;padding:8px 12px;border-radius:6px;transition:color .15s;}',
    '.ocnav-dd-label:hover{color:#fff;}',
    '.ocnav-dd-label svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.5;transition:transform .2s;}',
    '.ocnav-dd-wrap:hover .ocnav-dd-label svg{transform:rotate(180deg);}',
    '.ocnav-dd{display:none;position:absolute;top:calc(100% + 10px);left:50%;transform:translateX(-50%);background:#fff;border:1px solid #E8EDF2;border-radius:12px;box-shadow:0 16px 48px rgba(27,58,92,.16);padding:16px;z-index:99999;min-width:480px;}',
    '.ocnav-dd-wrap:hover .ocnav-dd{display:flex!important;}',
    '.ocnav-dd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0 4px;width:100%;}',
    '.ocnav-dd-col{display:flex;flex-direction:column;padding:0 4px;}',
    '.ocnav-dd-col-hdr{font-family:Inter,sans-serif;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;padding:6px 10px 4px;margin-bottom:2px;}',
    '.ocnav-dd a{display:block;font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#1B3A5C!important;text-decoration:none;padding:9px 12px;border-radius:7px;white-space:nowrap;transition:background .12s,color .12s;}',
    '.ocnav-dd a:hover{background:#F2F4F8;color:#1B3A5C!important;}',
    '.ocnav-dd-divider{width:1px;background:#E8EDF2;margin:0 4px;}'
  ].join('');

  function buildDropdown(key){
    var def = MENUS[key];
    if(!def) return null;
    var inner = '<div class="ocnav-dd-grid">';
    def.cols.forEach(function(col, i){
      if(i > 0) inner += '<div class="ocnav-dd-divider"></div>';
      inner += '<div class="ocnav-dd-col">';
      col.forEach(function(item){
        inner += '<a href="' + item.href + '">' + item.label + '</a>';
      });
      inner += '</div>';
    });
    inner += '</div>';
    return inner;
  }

  function run(){
    var linksBar = document.getElementById('ocnav-links-desktop');
    if(!linksBar) return;

    // Inject CSS
    if(!document.getElementById('oc-navdrop-css')){
      var s = document.createElement('style');
      s.id = 'oc-navdrop-css';
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    // Find Personal, Commercial, Carriers links by text
    var links = linksBar.querySelectorAll('a.ocnav-link, a');
    links.forEach(function(a){
      var txt = a.textContent.trim().toLowerCase();
      var key = null;
      if(txt === 'personal') key = 'personal';
      else if(txt === 'commercial') key = 'commercial';
      else if(txt === 'carriers') key = 'carriers';
      if(!key) return;
      if(a.parentNode.classList.contains('ocnav-dd-wrap')) return; // already wrapped

      var inner = buildDropdown(key);
      if(!inner) return;

      var wrap = document.createElement('div');
      wrap.className = 'ocnav-dd-wrap';

      var label = document.createElement('span');
      label.className = 'ocnav-dd-label';
      label.innerHTML = a.textContent.trim() +
        '<svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4"/></svg>';

      var panel = document.createElement('div');
      panel.className = 'ocnav-dd';
      panel.innerHTML = inner;

      wrap.appendChild(label);
      wrap.appendChild(panel);
      a.parentNode.replaceChild(wrap, a);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    setTimeout(run, 150); // allow ocjs/nav build first
  }
})();
