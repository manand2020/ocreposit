/* ocnavcms v31.4.2 | Olive Cover | CMS-driven multistate nav + insurance page + home section CSS | city URL fix Apr22 */
(function(){
'use strict';

var COLLECTION_ID = '69e2c474742df85703a42d14';
var LOGO = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';
var chevron = '<svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg>';

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ State flags map ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
var FLAGS = {georgia:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ',california:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ´',texas:'ÃÂÃÂ¢ÃÂÃÂ­ÃÂÃÂ',florida:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ',nevada:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ²',arizona:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂµ',colorado:'ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ°ÃÂÃÂ¯ÃÂÃÂ¸ÃÂÃÂ',oregon:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ²',washington:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂ¯ÃÂÃÂ¸ÃÂÃÂ'};

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ State detection ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Fetch states from CMS ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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
        flag: FLAGS[i.fieldData.slug]||'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ',
        path: '/states/'+i.fieldData.slug
      };});
    if(items.length){sessionStorage.setItem('oc_states',JSON.stringify(items));}
    cb(items.length ? items : fallbackStates());
  }).catch(function(){cb(fallbackStates());});
}

function fallbackStates(){
  return[
    {slug:'georgia',name:'Georgia',flag:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ',path:'/states/georgia'},
    {slug:'california',name:'California',flag:'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ´',path:'/states/california'}
  ];
}

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Nav data ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ CSS ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Helpers ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Build state dropdown HTML ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Update switcher after CMS fetch ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
function updateSwitcher(states, currentSlug){
  var item = document.getElementById('oc-state-switcher');
  if(item) item.outerHTML = buildStateDropdown(states, currentSlug);
  var mob = document.getElementById('oc-mobile-state');
  if(mob) mob.outerHTML = buildMobileStateSection(states, currentSlug);
}

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Set state ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
function setStateAndNavigate(slug){
  localStorage.setItem('oc_state', slug);
  sessionStorage.removeItem('oc_states');
  window.location.href = '/states/'+slug;
}

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Build nav ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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

  /* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Hover with delay so mouse can travel to dropdown ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
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
  // Run fixes with retry on DOM changes
  function runFixes(){fixFooter();fixCarrierText();fixTrustBar();fixAboutPage();
  fixBindPlaceholders();
  fixMobile();
  removeErgo();
  fixInsurancePage();
  fixHomeSections();fixHomePage();}
  setTimeout(runFixes,300);
  setTimeout(runFixes,800);
  setTimeout(runFixes,2000);
  setTimeout(runFixes,4000);
  var obs=new MutationObserver(function(){runFixes();});
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(function(){obs.disconnect();},8000);
}

function fixFooter(){
  document.querySelectorAll("a").forEach(function(a){
    if(a.textContent.trim()==="About Mahesh"){a.textContent="About Olive Cover";}
  });
}
function fixCarrierText(){
  var p=window.location.pathname;
  var isCA=p.indexOf("california")>-1||p.indexOf("-california")>-1;
  if(!isCA)return;
  document.querySelectorAll("p,span,div,h2,h3").forEach(function(el){
    if(el.children.length===0){
      if(el.textContent.indexOf("appointed in Georgia")>-1){
        el.textContent=el.textContent.replace("appointed in Georgia","available for this coverage");
      }
      if(el.textContent.trim()==="Georgia Range"){el.textContent="Coverage Cost";}
    }
  });
}
function fixTrustBar(){
  document.querySelectorAll("*").forEach(function(el){
    if(el.children.length===0){
      var t=el.textContent;
      if(t.indexOf("Agency NPN")>-1&&t.indexOf("Georgia licensed")>-1&&t.indexOf(" | ")===-1){
        el.textContent=t.replace("Georgia licensed"," | Georgia Licensed");
      }
    }
  });
}



function fixHomePage(){
  if(window.location.pathname!=='/')return;
  if(document.getElementById('oc-home-css-injected'))return;
  var s=document.createElement('style');
  s.id='oc-home-css-injected';
  s.textContent='.oc-coverage-section{background:#fff!important;padding:80px 0!important}.oc-coverage-inner{max-width:1200px!important;margin:0 auto!important;padding:0 32px!important}.oc-coverage-header{text-align:center!important;margin-bottom:40px!important}.oc-coverage-eyebrow{font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.1em!important;color:#C7A24B!important;margin-bottom:12px!important}.oc-coverage-h2{font-family:"Playfair Display",serif!important;font-size:38px!important;font-weight:700!important;color:#1B3A5C!important;margin:0 0 8px!important}.oc-coverage-view-all{color:#1B3A5C!important;font-weight:600!important;font-size:14px!important}.oc-coverage-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:24px!important}.oc-coverage-card{background:#fff!important;border:1px solid #E5E7EB!important;border-radius:8px!important;padding:24px!important;cursor:pointer!important}.oc-coverage-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)!important}.oc-coverage-card-icon{font-size:28px!important;margin-bottom:12px!important;display:block!important}.oc-coverage-card-title{font-family:"Playfair Display",serif!important;font-size:18px!important;font-weight:700!important;color:#1B3A5C!important;margin:0 0 8px!important;display:block!important}.oc-coverage-card-sub{font-size:14px!important;color:#444!important;line-height:1.55!important;display:block!important}.oc-coverage-card-learn{display:block!important;margin-top:12px!important;color:#1B3A5C!important;font-size:13px!important;font-weight:600!important;text-decoration:none!important}.oc-gaps-section{background:#1B3A5C!important;padding:80px 0!important}.oc-gaps-inner{max-width:1200px!important;margin:0 auto!important;padding:0 32px!important;display:grid!important;grid-template-columns:1fr 2fr!important;gap:48px!important;align-items:start!important}.oc-gaps-header{}.oc-gaps-eyebrow{font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.1em!important;color:#C7A24B!important;margin:0 0 12px!important;display:block!important}.oc-gaps-h2{font-family:"Playfair Display",serif!important;font-size:34px!important;font-weight:700!important;color:#fff!important;margin:0 0 16px!important}.oc-gaps-p{color:rgba(255,255,255,.75)!important;font-size:16px!important;line-height:1.65!important;margin:0 0 24px!important}.oc-gaps-cta{background:#C7A24B!important;color:#fff!important;padding:12px 24px!important;border-radius:4px!important;font-weight:600!important;text-decoration:none!important;display:inline-block!important;font-size:14px!important}.oc-gaps-list{}.oc-gap-item{padding:16px 0!important;border-bottom:1px solid rgba(255,255,255,.12)!important}.oc-gap-item:last-child{border-bottom:none!important}.oc-gap-item-title{color:#fff!important;font-weight:600!important;font-size:15px!important;margin:0 0 6px!important;display:block!important}.oc-gap-item-body{color:rgba(255,255,255,.7)!important;font-size:14px!important;line-height:1.55!important}.oc-gap-item-link{color:#C7A24B!important;font-weight:600!important;text-decoration:none!important}.oc-why-section{background:#F2F4F8!important;padding:80px 0!important}.oc-why-inner{max-width:1200px!important;margin:0 auto!important;padding:0 32px!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:64px!important;align-items:start!important}.oc-why-eyebrow{font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.1em!important;color:#C7A24B!important;margin:0 0 12px!important;display:block!important}.oc-why-h2{font-family:"Playfair Display",serif!important;font-size:34px!important;font-weight:700!important;color:#1B3A5C!important;margin:0 0 16px!important}.oc-why-sub{color:#444!important;font-size:16px!important;line-height:1.65!important;margin:0 0 32px!important}.oc-why-point{display:flex!important;gap:16px!important;margin-bottom:24px!important}.oc-why-point-icon{font-size:24px!important;flex-shrink:0!important;margin-top:2px!important}.oc-why-point-title{font-weight:600!important;color:#1B3A5C!important;font-size:15px!important;margin:0 0 4px!important;display:block!important}.oc-why-point-body{color:#444!important;font-size:14px!important;line-height:1.55!important}.oc-why-photo{height:420px!important;width:100%!important;overflow:hidden!important;border-radius:12px!important;margin-bottom:24px!important}.oc-why-cta-box{background:#1B3A5C!important;border-radius:8px!important;padding:24px!important}.oc-why-cta-title{color:#fff!important;font-weight:600!important;font-size:16px!important;margin:0 0 8px!important;display:block!important}.oc-why-cta-line{color:rgba(255,255,255,.75)!important;font-size:14px!important;padding:6px 0!important;display:block!important}#oc-why-photo-img{background-image:url(https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=840&q=80)!important;}.oc-testimonials-section{background:#fff!important;padding:80px 0!important}.oc-testi-inner{max-width:1200px!important;margin:0 auto!important;padding:0 32px!important}.oc-testi-header{display:flex!important;justify-content:space-between!important;align-items:baseline!important;margin-bottom:40px!important}.oc-testi-eyebrow{font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.1em!important;color:#C7A24B!important;margin:0 0 8px!important;display:block!important}.oc-testi-h2{font-family:"Playfair Display",serif!important;font-size:34px!important;font-weight:700!important;color:#1B3A5C!important;margin:0!important}.oc-testi-header-cta{color:#1B3A5C!important;font-weight:600!important;font-size:14px!important;text-decoration:none!important}.oc-testi-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:24px!important}.oc-testi-card{background:#F9F7F3!important;border:1px solid #E5E7EB!important;border-radius:8px!important;padding:28px!important}.oc-testi-stars{color:#C7A24B!important;font-size:18px!important;margin-bottom:12px!important}.oc-testi-quote{font-size:15px!important;color:#444!important;line-height:1.65!important;margin:0 0 20px!important;font-style:italic!important}.oc-testi-name{font-weight:600!important;color:#1B3A5C!important;font-size:14px!important}.oc-testi-location{color:#666!important;font-size:13px!important}.oc-cta-section{position:relative!important;padding:80px 0!important;overflow:hidden!important}.oc-cta-bg{position:absolute!important;inset:0!important;background:url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80) center/cover!important}.oc-cta-overlay{position:absolute!important;inset:0!important;background:rgba(27,58,92,.88)!important}.oc-cta-content{position:relative!important;max-width:700px!important;margin:0 auto!important;padding:0 32px!important;text-align:center!important}.oc-cta-eyebrow{font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.1em!important;color:#C7A24B!important;margin:0 0 16px!important;display:block!important}.oc-cta-h2{font-family:"Playfair Display",serif!important;font-size:38px!important;font-weight:700!important;color:#fff!important;margin:0 0 16px!important}.oc-cta-sub{color:rgba(255,255,255,.82)!important;font-size:16px!important;line-height:1.65!important;margin:0 0 32px!important}.oc-cta-primary{background:#C7A24B!important;color:#fff!important;padding:14px 32px!important;border-radius:4px!important;font-weight:600!important;font-size:16px!important;text-decoration:none!important;display:inline-block!important}.oc-cta-footer-line{color:rgba(255,255,255,.55)!important;font-size:13px!important;margin-top:16px!important}@media(max-width:900px){.oc-coverage-grid{grid-template-columns:1fr 1fr!important}.oc-gaps-inner{grid-template-columns:1fr!important}.oc-why-inner{grid-template-columns:1fr!important}.oc-testi-grid{grid-template-columns:1fr!important}}';
  document.head.appendChild(s);
}

function fixAboutPage(){
  if(window.location.pathname.indexOf('/about')<0)return;
  document.querySelectorAll('.oc-about-section p').forEach(function(p){
    if(/We also serve Georgia|hold a California/i.test(p.textContent)){p.remove();}
  });
  var lic=document.querySelector('.oc-about-license');
  if(lic){
    lic.innerHTML='<p style="font-family:Inter,sans-serif;font-size:15px;line-height:1.6;color:#444;">Olive Cover is a licensed property and casualty insurance agency. <a href="/where-we-do-business" style="color:#1B3A5C;font-weight:600;">View licensed states and compliance details ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ</a></p>';
  }
}


/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Fix Insurance Page Carrier Cards ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
function fixInsurancePage(){
  var path = window.location.pathname;
  if(path.indexOf('/personal-insurance/')===-1 && path.indexOf('/commercial-insurance/')===-1) return;
  if(document.getElementById('oc-ins-css')) return;
  var s=document.createElement('style');
  s.id='oc-ins-css';
  s.textContent=[
    /* Section wrapper */
    '.oc-carriers-section{background:#F2F4F8;padding:72px 24px;}',
    '.oc-carriers-inner{max-width:1200px;margin:0 auto;}',
    '.oc-carriers-eyebrow{font-family:Inter,sans-serif;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#C7A24B;margin-bottom:12px;}',
    '.oc-carriers-h2{font-family:"Playfair Display",serif;font-size:36px;font-weight:700;color:#1B3A5C;margin:0 0 8px;}',
    '.oc-carriers-sub{font-family:Inter,sans-serif;font-size:16px;color:#666;margin:0 0 40px;}',
    /* Grid */
    '.w-dyn-items{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:20px!important;padding:0!important;margin:0!important;list-style:none!important;}',
    '.w-dyn-item{list-style:none!important;padding:0!important;margin:0!important;}',
    /* Card */
    '.w-dyn-item > div, .w-dyn-item > a{background:#fff!important;border:1px solid #E5E7EB!important;border-radius:8px!important;padding:24px!important;display:flex!important;flex-direction:column!important;gap:6px!important;text-decoration:none!important;transition:box-shadow .2s!important;}',
    '.w-dyn-item > div:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)!important;}',
    /* LOB eyebrow */
    '.w-dyn-item p:first-child, .oc-carrier-lob{font-family:Inter,sans-serif!important;font-size:11px!important;font-weight:600!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:#C7A24B!important;margin:0 0 4px!important;}',
    /* Carrier name h3 */
    '.w-dyn-item h3{font-family:"Playfair Display",serif!important;font-size:22px!important;font-weight:700!important;color:#1B3A5C!important;margin:0 0 4px!important;}',
    /* AM Best pill */
    '.oc-am-best, .w-dyn-item p:nth-child(3){display:inline-block!important;background:#EEF2F7!important;color:#1B3A5C!important;font-family:Inter,sans-serif!important;font-size:12px!important;font-weight:600!important;padding:3px 10px!important;border-radius:20px!important;margin:0 0 10px!important;}',
    /* Appetite text */
    '.w-dyn-item p:nth-child(4){font-family:Inter,sans-serif!important;font-size:14px!important;line-height:1.6!important;color:#444!important;margin:0 0 12px!important;flex:1!important;}',
    /* View link */
    '.w-dyn-item a{font-family:Inter,sans-serif!important;font-size:13px!important;font-weight:600!important;color:#1B3A5C!important;text-decoration:none!important;display:inline-flex!important;align-items:center!important;gap:4px!important;}',
    '.w-dyn-item a:hover{color:#C7A24B!important;}',
    '@media(max-width:900px){.w-dyn-items{grid-template-columns:1fr!important;}}'
  ].join('');
  document.head.appendChild(s);

  /* Also fix coverage/exclusion sections on insurance pages */
  if(document.getElementById('oc-cov-css')) return;
  var s2=document.createElement('style');
  s2.id='oc-cov-css';
  s2.textContent=[
    '.oc-coverage-section,.oc-exclusions-section{padding:72px 24px;max-width:1200px;margin:0 auto;}',
    '.oc-coverage-grid,.oc-exclusions-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:32px;}',
    '.oc-coverage-card,.oc-exclusion-card{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:24px;}',
    '.oc-coverage-card h3,.oc-exclusion-card h3{font-family:"Playfair Display",serif;font-size:18px;font-weight:700;color:#1B3A5C;margin:0 0 10px;}',
    '.oc-coverage-card p,.oc-exclusion-card p{font-family:Inter,sans-serif;font-size:14px;line-height:1.6;color:#444;margin:0;}',
    '@media(max-width:900px){.oc-coverage-grid,.oc-exclusions-grid{grid-template-columns:1fr;}}'
  ].join('');
  document.head.appendChild(s2);
}

/* ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ Fix Home Coverage and Gaps Sections ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ */
function fixHomeSections(){
  if(window.location.pathname !== '/') return;
  if(document.getElementById('oc-homesec-css')) return;
  var s=document.createElement('style');
  s.id='oc-homesec-css';
  s.textContent=[
    /* Coverage section */
    '.oc-coverage-section{background:#fff!important;padding:80px 24px!important;}',
    '.oc-coverage-inner{max-width:1200px!important;margin:0 auto!important;}',
    '.oc-coverage-header{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;margin-bottom:40px!important;}',
    '.oc-coverage-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:20px!important;}',
    '.oc-coverage-card{background:#fff!important;border:1px solid #E5E7EB!important;border-radius:8px!important;padding:24px!important;text-decoration:none!important;display:block!important;transition:box-shadow .2s!important;}',
    '.oc-coverage-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)!important;}',
    '.oc-coverage-card-icon{font-size:28px!important;margin-bottom:12px!important;display:block!important;}',
    '.oc-coverage-card-title{font-family:"Playfair Display",serif!important;font-size:18px!important;font-weight:700!important;color:#1B3A5C!important;display:block!important;margin-bottom:8px!important;}',
    '.oc-coverage-card-sub{font-family:Inter,sans-serif!important;font-size:14px!important;color:#666!important;line-height:1.5!important;display:block!important;margin-bottom:12px!important;}',
    '.oc-coverage-card-learn{font-family:Inter,sans-serif!important;font-size:13px!important;font-weight:600!important;color:#1B3A5C!important;}',
    '.oc-coverage-eyebrow{font-family:Inter,sans-serif!important;font-size:12px!important;font-weight:600!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:#C7A24B!important;margin-bottom:8px!important;display:block!important;}',
    '.oc-coverage-h2{font-family:"Playfair Display",serif!important;font-size:40px!important;font-weight:700!important;color:#1B3A5C!important;margin:0!important;}',
    '.oc-coverage-view-all{font-family:Inter,sans-serif!important;font-size:14px!important;color:#1B3A5C!important;text-decoration:none!important;font-weight:600!important;}',
    /* Gaps section */
    '.oc-gaps-section{background:#1B3A5C!important;padding:80px 24px!important;}',
    '.oc-gaps-inner{max-width:1200px!important;margin:0 auto!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:64px!important;align-items:start!important;}',
    '.oc-gaps-eyebrow{font-family:Inter,sans-serif!important;font-size:12px!important;font-weight:600!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:#C7A24B!important;margin-bottom:12px!important;display:block!important;}',
    '.oc-gaps-h2{font-family:"Playfair Display",serif!important;font-size:36px!important;font-weight:700!important;color:#fff!important;margin:0 0 16px!important;}',
    '.oc-gaps-p{font-family:Inter,sans-serif!important;font-size:16px!important;color:rgba(255,255,255,.75)!important;margin:0 0 28px!important;line-height:1.6!important;}',
    '.oc-gaps-cta{background:#C7A24B!important;color:#fff!important;font-family:Inter,sans-serif!important;font-size:14px!important;font-weight:600!important;padding:12px 24px!important;border-radius:6px!important;text-decoration:none!important;display:inline-block!important;}',
    '.oc-gaps-list{display:flex!important;flex-direction:column!important;gap:16px!important;}',
    '.oc-gap-item{background:rgba(255,255,255,.07)!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:8px!important;padding:20px!important;}',
    '.oc-gap-item-title{font-family:Inter,sans-serif!important;font-size:15px!important;font-weight:600!important;color:#fff!important;margin-bottom:6px!important;display:block!important;}',
    '.oc-gap-item-body{font-family:Inter,sans-serif!important;font-size:13px!important;color:rgba(255,255,255,.65)!important;line-height:1.5!important;display:block!important;}',
    '.oc-gap-item-link{font-family:Inter,sans-serif!important;font-size:13px!important;color:#C7A24B!important;text-decoration:none!important;font-weight:600!important;margin-top:8px!important;display:inline-block!important;}',
    '@media(max-width:900px){.oc-coverage-grid{grid-template-columns:1fr 1fr!important;}.oc-gaps-inner{grid-template-columns:1fr!important;}}'
  ].join('');
  document.head.appendChild(s);

  // Trust bar: force column layout on each badge
  document.querySelectorAll('.oc-trust-badge').forEach(function(b){
    b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;';
    var m=b.querySelector('.oc-trust-badge-main');
    var s=b.querySelector('.oc-trust-badge-sub');
    if(m)m.style.cssText='display:block;font-size:15px;font-weight:700;color:#1B3A5C;';
    if(s)s.style.cssText='display:block;font-size:12px;color:#666;';
  });
  // Clear dupe text in Bundle & Save card
  document.querySelectorAll('.oc-coverage-card-sub').forEach(function(el){
    if(el.textContent.indexOf('simplify')>-1){el.textContent='Combine home and auto. Save 10 to 25% with one agent.';}
  });
}


function fixMobile(){
  if(window.innerWidth>900)return;
  document.documentElement.style.cssText='max-width:100%!important;overflow-x:hidden!important';
  document.body.style.overflowX='hidden';
  document.body.style.maxWidth='100%';
  var vw=window.innerWidth;
  document.querySelectorAll('section,div,header,footer,nav').forEach(function(el){
    try{if(el.getBoundingClientRect().width>vw+4){el.style.maxWidth='100%';el.style.overflowX='hidden';el.style.boxSizing='border-box';}}catch(e){}
  });
  var cg=document.querySelector('.oc-coverage-grid');if(cg){cg.style.gridTemplateColumns='1fr 1fr';cg.style.gap='12px';}
  var hg=document.querySelector('.oc-hero-cards-grid');if(hg){hg.style.gridTemplateColumns='1fr 1fr';hg.style.gap='8px';}
  var gg=document.querySelector('.oc-gaps-grid');if(gg){gg.style.gridTemplateColumns='1fr';gg.style.gap='24px';}
  var wi=document.querySelector('.oc-why-inner');if(wi){wi.style.gridTemplateColumns='1fr';wi.style.gap='24px';}
  var tg=document.querySelector('.oc-testi-grid');if(tg){tg.style.gridTemplateColumns='1fr';}
  document.querySelectorAll('.w-dyn-items').forEach(function(g){g.style.gridTemplateColumns='1fr';});
}
function removeErgo(){
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  var node;
  while((node=walker.nextNode())){
    if(node.nodeValue&&node.nodeValue.indexOf('ERGO')>-1){
      node.nodeValue=node.nodeValue.replace(/[ÃÂ·|]s*E&O:s*ERGO Next/gi,'').replace(/E&O:s*ERGO Nexts*[ÃÂ·|]?/gi,'').replace(/E&O:s*ERGOs*Next/gi,'').trim();
    }
  }
}

function fixBindPlaceholders(){
  // Hide any elements containing BIND: placeholder text
  var all = document.querySelectorAll('*');
  all.forEach(function(el){
    if(el.children.length === 0 && el.textContent.indexOf('BIND:') === 0){
      el.style.display = 'none';
      if(el.parentElement) el.parentElement.style.display = 'none';
    }
  });
  // Remove entire carrier section if it only has placeholder content
  var sections = document.querySelectorAll('section, .oc-section, [class*="carrier"]');
  sections.forEach(function(s){
    var text = s.textContent || '';
    if(text.indexOf('BIND:') > -1 && text.indexOf('BIND:') < 50){
      s.style.opacity = '0';
      s.style.height = '0';
      s.style.overflow = 'hidden';
      s.style.padding = '0';
      s.style.margin = '0';
    }
  });
}
})();


// ============================================================
// INSIGHTS PAGE - ocinsights v1.0.1
// Fetches CMS articles, renders state-aware grid with filters
// ============================================================
(function(){
  if(window.location.pathname.indexOf('/insights')===-1)return;
  var COLL='69e7aab3da8662897ee1211f';
  var activeFilter='all';
  var s=document.createElement('style');
  s.textContent=[
    '#oc-insights-hero{background:#1B3A5C;padding:80px 24px 0;position:relative;overflow:hidden}',
    '#oc-insights-hero::before{content:"";position:absolute;inset:0;background:url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80) center/cover;opacity:0.18}',
    '#oc-insights-hero>*{position:relative;z-index:1}',
    '#oc-insights-hero p:first-child{font-family:Inter,sans-serif;font-size:12px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:#C7A24B;margin:0 0 10px}',
    '#oc-insights-hero h1{font-family:\"Playfair Display\",serif;font-size:clamp(36px,5vw,56px);font-weight:700;color:#fff;margin:0 0 14px;line-height:1.1}',
    '#oc-insights-filters{display:flex;flex-wrap:wrap;gap:8px;padding-bottom:32px;margin-top:16px}',
    '.oc-filter-btn{font-family:Inter,sans-serif;font-size:13px;font-weight:500;padding:7px 16px;border-radius:99px;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.75);text-decoration:none;border:1px solid rgba(255,255,255,0.2);transition:all 0.15s;cursor:pointer;display:inline-block}',
    '.oc-filter-btn.active,.oc-filter-btn:hover{background:#C7A24B;color:#fff;border-color:#C7A24B}',
    '#oc-insights-body{background:#F2F4F8;padding:60px 24px 80px}',
    '#oc-insights-state-bar{max-width:1200px;margin:0 auto 24px;display:flex;align-items:center;gap:8px;font-size:14px;color:#666;font-family:Inter,sans-serif}',
    '#oc-insights-state-bar a{color:#1B3A5C;font-weight:600;text-decoration:none}',
    '#oc-insights-loading{text-align:center;padding:40px;color:#666;font-family:Inter,sans-serif}',
    '#oc-insights-empty{text-align:center;padding:40px;color:#666;font-family:Inter,sans-serif;display:none}',
    '#oc-insights-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}',
    '.oc-insight-card{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:24px;display:flex;flex-direction:column;gap:10px;transition:box-shadow 0.2s,transform 0.2s}',
    '.oc-insight-card:hover{box-shadow:0 6px 20px rgba(27,58,92,0.12);transform:translateY(-2px)}',
    '.oc-ic-meta{display:flex;align-items:center;gap:10px}',
    '.oc-ic-cat{font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#C7A24B}',
    '.oc-ic-time{font-size:12px;color:#999;margin-left:auto}',
    '.oc-ic-title{font-family:\"Playfair Display\",serif;font-size:20px;font-weight:700;color:#1B3A5C;margin:0;line-height:1.3}',
    '.oc-ic-excerpt{font-family:Inter,sans-serif;font-size:14px;color:#555;line-height:1.65;margin:0;flex:1}',
    '.oc-ic-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px;border-top:1px solid #E5E7EB}',
    '.oc-ic-date{font-size:12px;color:#999}',
    '.oc-ic-link{font-size:13px;font-weight:600;color:#1B3A5C;text-decoration:none}',
    '.oc-ic-link:hover{text-decoration:underline}',
    '@media(max-width:900px){#oc-insights-grid{grid-template-columns:1fr 1fr}}',
    '@media(max-width:600px){#oc-insights-grid{grid-template-columns:1fr}}'
  ].join('');
  document.head.appendChild(s);
  function getState(){return(localStorage.getItem('oc_state')||'georgia').toLowerCase();}
  function buildCard(item){
    var f=item.fieldData||{};
    var slug=f.slug||item.slug||'';
    var cat=f.category||'';
    var scope=(f.scope||'national').toLowerCase();
    var stateSlug=(f['state-slug']||'all').toLowerCase();
    var readTime=f['read-time']||'5 min read';
    var date=f['published-date']?new Date(f['published-date']).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
    return '<article class="oc-insight-card" data-category="'+cat+'" data-scope="'+scope+'" data-state="'+stateSlug+'">'+
      '<div class="oc-ic-meta"><span class="oc-ic-cat">'+cat+'</span><span class="oc-ic-time">'+readTime+'</span></div>'+
      '<h3 class="oc-ic-title">'+(f.name||'')+'</h3>'+
      '<p class="oc-ic-excerpt">'+(f.excerpt||'')+'</p>'+
      '<div class="oc-ic-footer"><span class="oc-ic-date">'+date+'</span><a href="/insights/'+slug+'" class="oc-ic-link">Read more &rarr;</a></div>'+
      '</article>';
  }
  function filterCards(){
    var st=getState();
    var vis=0;
    document.querySelectorAll('.oc-insight-card').forEach(function(c){
      var ok=(c.getAttribute('data-scope')==='national'||c.getAttribute('data-scope')===''||c.getAttribute('data-state')===st||c.getAttribute('data-state')==='all')&&(activeFilter==='all'||c.getAttribute('data-category')===activeFilter);
      c.style.display=ok?'':' none';
      if(ok)vis++;
    });
    var e=document.getElementById('oc-insights-empty');
    if(e)e.style.display=vis===0?'block':'none';
    var sn=document.getElementById('oc-insights-state-name');
    if(sn){var s=getState();sn.textContent=s.charAt(0).toUpperCase()+s.slice(1);}
  }
  function render(items){
    var grid=document.getElementById('oc-insights-grid');
    var loading=document.getElementById('oc-insights-loading');
    if(loading)loading.style.display='none';
    if(!grid)return;
    grid.innerHTML=items.map(buildCard).join('');
    filterCards();
  }
  function load(){
    fetch('https://api.webflow.com/v2/collections/'+COLL+'/items?limit=100',{
      headers:{'Authorization':'Bearer '+(window._ocToken||''),'accept':'application/json'}
    }).then(function(r){return r.json();})
    .then(function(d){render(d.items||[]);})
    .catch(function(){var l=document.getElementById('oc-insights-loading');if(l)l.textContent='Unable to load articles.';});
  }
  document.querySelectorAll('[data-filter]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      activeFilter=btn.getAttribute('data-filter')||'all';
      document.querySelectorAll('[data-filter]').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      filterCards();
    });
  });
  window.addEventListener('storage',function(e){
    if(e.key==='oc_state')filterCards();
  });
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',load);}else{load();}
})();