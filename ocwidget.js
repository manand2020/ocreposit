// ocwidget.js - Ask Olive Floating Widget v1.1.0
// Injects a fixed-position "Ask Olive" widget on all pages except homepage and disclaimer.
// Toggle: <details>/<summary> (CSS-only, no JS needed). Form: Firebase Firestore.
(function () {
  'use strict';

  var path = window.location.pathname;
  // Do not show on homepage (inline form exists) or on the disclaimer page itself
  if (path === '/' || path === '/ask-olive-disclaimer') return;

  var FB_CONFIG = {
    apiKey: 'AIzaSyB1JuGUbJCkz0he8JnKNbQyRBTwtONZnWM',
    authDomain: 'olive-cover-prod.firebaseapp.com',
    projectId: 'olive-cover-prod',
    storageBucket: 'olive-cover-prod.firebasestorage.app',
    messagingSenderId: '781066018428',
    appId: '1:781066018428:web:535d07b690283027f9f3f9'
  }

  var STATES = [
    ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
    ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],
    ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],
    ['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],
    ['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],
    ['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
    ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
    ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],
    ['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],
    ['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],
    ['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']
  ];;

  function injectCSS() {
    if (document.getElementById('oc-widget-css')) return;
    var s = document.createElement('style');
    s.id = 'oc-widget-css';
    s.textContent = [
      '.oc-widget-root{position:fixed;bottom:24px;right:24px;z-index:9998;font-family:Inter,sans-serif;}',
      '.oc-widget-toggle{display:flex;align-items:center;gap:8px;background:#1B3A5C;color:#F5EDD8;border:none;border-radius:50px;padding:12px 20px;cursor:pointer;font-size:0.9375rem;font-weight:600;list-style:none;box-shadow:0 4px 16px rgba(27,58,92,0.3);}',
      '.oc-widget-toggle::-webkit-details-marker{display:none;}',
      '.oc-widget-toggle:hover{background:#163250;}',
      '.oc-widget-panel{position:absolute;bottom:calc(100% + 12px);right:0;width:320px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(27,58,92,0.18);overflow:hidden;}',
      '.oc-widget-panel-header{background:#1B3A5C;padding:16px 20px;}',
      '.oc-widget-panel-title{font-size:1rem;font-weight:700;color:#F5EDD8;margin:0 0 4px;font-family:"Playfair Display",serif;}',
      '.oc-widget-panel-sub{font-size:0.8125rem;color:rgba(245,237,216,0.75);margin:0;line-height:1.4;}',
      '.oc-widget-err{font-size:0.8125rem;color:#c44;padding:8px 16px 0;display:none;}',
      '.oc-widget-form{display:flex;flex-direction:column;gap:10px;padding:16px;}',
      '.oc-widget-input{font-family:Inter,sans-serif;font-size:0.875rem;color:#1B3A5C;background:#F5EDD8;border:1.5px solid transparent;border-radius:6px;padding:10px 14px;width:100%;box-sizing:border-box;}',
      '.oc-widget-input:focus{outline:none;border-color:#B8934A;}',
      '.oc-widget-select{font-family:Inter,sans-serif;font-size:0.875rem;color:#1B3A5C;background:#F5EDD8;border:1.5px solid transparent;border-radius:6px;padding:10px 14px;width:100%;box-sizing:border-box;-webkit-appearance:none;appearance:none;cursor:pointer;}',
      '.oc-widget-select:focus{outline:none;border-color:#B8934A;}',
            '.oc-widget-ta{min-height:64px;resize:vertical;}',
      '.oc-widget-btn{font-family:Inter,sans-serif;font-size:0.875rem;font-weight:600;color:#1B3A5C;background:#B8934A;border:none;border-radius:6px;padding:12px 20px;cursor:pointer;width:100%;}',
      '.oc-widget-btn:hover{background:#C7A24B;}',
      '.oc-widget-btn:disabled{opacity:0.6;cursor:not-allowed;}',
      '.oc-widget-success{display:none;padding:20px 16px;font-size:0.9375rem;color:#1B3A5C;line-height:1.55;}',
      '.oc-widget-panel-footer{padding:10px 16px 12px;border-top:1px solid #F5EDD8;font-size:0.75rem;color:rgba(27,58,92,0.5);}',
      '.oc-widget-disc-link{color:rgba(27,58,92,0.5);text-decoration:none;}',
      '.oc-widget-disc-link:hover{text-decoration:underline;}',
      '@media(max-width:767px){.oc-widget-root{bottom:16px;right:16px;}.oc-widget-panel{width:calc(100vw - 32px);}}'
    ].join('');
    document.head.appendChild(s);
  }

  function injectHTML() {
    if (document.getElementById('oc-widget-root')) return;
    var stateOpts = '<option value="">State (optional)</option>' +
      STATES.map(function(s){ return '<option value="'+s[0]+'">'+s[1]+'</option>'; }).join('');
    var el = document.createElement('details');
    el.id = 'oc-widget-root';
    el.className = 'oc-widget-root';
    el.innerHTML = [
      '<summary class="oc-widget-toggle">',
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      '<span>Ask Olive</span>',
      '</summary>',
      '<div class="oc-widget-panel">',
      '<div class="oc-widget-panel-header">',
      '<p class="oc-widget-panel-title">Ask Olive</p>',
      '<p class="oc-widget-panel-sub">A licensed agent follows up within one business day.</p>',
      '</div>',
      '<div id="oc-wgt-error" class="oc-widget-err"></div>',
      '<form id="oc-wgt-form" class="oc-widget-form">',
      '<input id="oc-wgt-name" class="oc-widget-input" type="text" placeholder="Your name" autocomplete="name" required/>',
      '<input id="oc-wgt-contact" class="oc-widget-input" type="text" placeholder="Email or phone" autocomplete="email" required/>',
      '<select id="oc-wgt-state" class="oc-widget-select">'+stateOpts+'</select>',
      '<textarea id="oc-wgt-intent" class="oc-widget-input oc-widget-ta" placeholder="What do you need? (optional)"></textarea>',
      '<button id="oc-wgt-submit" class="oc-widget-btn" type="submit">Ask Olive</button>',
      '</form>',
      '<div id="oc-wgt-success" class="oc-widget-success"><p>Got it. Someone will reach out within one business day.</p></div>',
      '<div class="oc-widget-panel-footer">',
      '<a href="/ask-olive-disclaimer" class="oc-widget-disc-link">AI Disclaimer</a>',
      ' &middot; ',
      '<a href="/privacy-policy" class="oc-widget-disc-link">Privacy Policy</a>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(el);
  }

  function wireForm() {
    var form = document.getElementById('oc-wgt-form');
    if (!form) return;
    var submitBtn = document.getElementById('oc-wgt-submit');
    var successEl = document.getElementById('oc-wgt-success');
    var errEl = document.getElementById('oc-wgt-error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('oc-wgt-name').value || '').trim();
      var contact = (document.getElementById('oc-wgt-contact').value || '').trim();
      var state = (document.getElementById('oc-wgt-state').value || '').trim();
      var intent = (document.getElementById('oc-wgt-intent').value || '').trim();
      if (!name || !contact) {
        errEl.textContent = 'Please enter your name and a way to reach you.';
        errEl.style.display = 'block';
        return;
      }
      errEl.style.display = 'none';
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'),
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js')
      ]).then(function (mods) {
        var initializeApp = mods[0].initializeApp, getApps = mods[0].getApps;
        var getFirestore = mods[1].getFirestore, coll = mods[1].collection, addDoc = mods[1].addDoc, serverTimestamp = mods[1].serverTimestamp;
        var getAuth = mods[2].getAuth, signInAnonymously = mods[2].signInAnonymously;
        var APP_NAME = 'oc-home-leads';
        var app = getApps().find(function (a) { return a.name === APP_NAME; }) || initializeApp(FB_CONFIG, APP_NAME);
        var db = getFirestore(app);
        return signInAnonymously(getAuth(app)).then(function () {
          var payload = { name: name, contact: contact, intent: intent || 'not-specified', source: 'widget', ts: serverTimestamp() };
          if (state) payload.state = state;
          return addDoc(coll(db, 'home-leads'), payload);
        });
      }).then(function () {
        form.style.display = 'none';
        if (successEl) successEl.style.display = 'block';
      }).catch(function (err) {
        console.error('[oc-widget]', err);
        errEl.textContent = 'Something went wrong. Please call us at (678) 888-1011.';
        errEl.style.display = 'block';
        submitBtn.textContent = 'Ask Olive';
        submitBtn.disabled = false;
      });
    });
  }

  function init() {
    injectCSS();
    injectHTML();
    wireForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();