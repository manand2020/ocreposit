// ocwidget.js - Ask Olive Floating Widget v2.0.1
// v2.0.1: widget Phase 2 writes to "submissions" DB; adds session_id to payload.
// Phase 3 chat (OC_CHAT_ENABLED=false by default) with Phase 2 lead-capture fallback.
// No Firebase SDK when Phase 3 is active -- HTTP endpoints only.
// Self-healing: removes stale v1.x widget automatically via data-wgt-ver guard.
(function () {
  'use strict';

  var OC_CHAT_ENABLED = false; // Set true when OC Tech confirms /chat/send + /chat/thread are live
  var CHAT_SEND = 'https://olive-cover-prod.web.app/chat/send';
  var CHAT_THREAD = 'https://olive-cover-prod.web.app/chat/thread';
  var WGT_VER = '2.0.0';

  var path = window.location.pathname;
  if (path === '/' || path === '/ask-olive-disclaimer') return;

  var FB_CONFIG = {
    apiKey: 'AIzaSyB1JuGUbJCkz0he8JnKNbQyRBTwtONZnWM',
    authDomain: 'olive-cover-prod.firebaseapp.com',
    projectId: 'olive-cover-prod',
    storageBucket: 'olive-cover-prod.firebasestorage.app',
    messagingSenderId: '781066018428',
    appId: '1:781066018428:web:535d07b690283027f9f3f9'
  };

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
  ];

  // --- Helpers ---

  function genUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    var mo = d.toLocaleString('default', { month: 'short' });
    var hr = d.getHours() % 12 || 12;
    var mi = d.getMinutes().toString().padStart(2, '0');
    var ap = d.getHours() < 12 ? 'AM' : 'PM';
    return mo + ' ' + d.getDate() + ', ' + hr + ':' + mi + ' ' + ap;
  }

  function getSession() {
    var id = localStorage.getItem('oc_chat_session');
    if (!id) { id = genUUID(); localStorage.setItem('oc_chat_session', id); }
    return id;
  }

  function getContact() {
    try { return JSON.parse(localStorage.getItem('oc_chat_contact') || 'null'); } catch (e) { return null; }
  }

  function saveContact(c) { localStorage.setItem('oc_chat_contact', JSON.stringify(c)); }

  // --- CSS ---

  function injectCSS() {
    if (document.getElementById('oc-widget-css')) return;
    var s = document.createElement('style');
    s.id = 'oc-widget-css';
    s.textContent = [
      // Base / toggle
      '.oc-widget-root{position:fixed;bottom:24px;right:24px;z-index:9998;font-family:Inter,sans-serif;}',
      '.oc-widget-toggle{display:flex;align-items:center;gap:8px;background:#1B3A5C;color:#F5EDD8;border:none;border-radius:50px;padding:12px 20px;cursor:pointer;font-size:0.9375rem;font-weight:600;list-style:none;box-shadow:0 4px 16px rgba(27,58,92,0.3);}',
      '.oc-widget-toggle::-webkit-details-marker{display:none;}',
      '.oc-widget-toggle:hover{background:#163250;}',
      // Panel shell
      '.oc-widget-panel{position:absolute;bottom:calc(100% + 12px);right:0;width:320px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(27,58,92,0.18);overflow:hidden;}',
      '.oc-widget-panel-header{background:#1B3A5C;padding:16px 20px;}',
      '.oc-widget-panel-title{font-size:1rem;font-weight:700;color:#F5EDD8;margin:0 0 4px;font-family:"Playfair Display",serif;}',
      '.oc-widget-panel-sub{font-size:0.8125rem;color:rgba(245,237,216,0.75);margin:0;line-height:1.4;}',
      '.oc-widget-err{font-size:0.8125rem;color:#c44;padding:8px 16px 0;display:none;}',
      // Phase 2 form
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
      // Phase 3 chat
      '.oc-wgt-intro{font-size:0.875rem;color:#1B3A5C;margin:0 0 8px;line-height:1.5;}',
      '.oc-widget-thread{height:240px;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px;}',
      '.oc-widget-msg-wrap{display:flex;flex-direction:column;}',
      '.oc-widget-msg-wrap--in{align-items:flex-end;}',
      '.oc-widget-msg-wrap--out{align-items:flex-start;}',
      '.oc-widget-bubble{max-width:85%;padding:8px 12px;border-radius:12px;font-size:0.875rem;line-height:1.45;word-break:break-word;}',
      '.oc-widget-bubble--in{background:#1B3A5C;color:#fff;border-bottom-right-radius:3px;}',
      '.oc-widget-bubble--out{background:#F5EDD8;color:#1B3A5C;border-bottom-left-radius:3px;}',
      '.oc-widget-bubble-time{font-size:0.6875rem;margin-top:3px;}',
      '.oc-widget-msg-wrap--in .oc-widget-bubble-time{color:rgba(255,255,255,0.55);text-align:right;}',
      '.oc-widget-msg-wrap--out .oc-widget-bubble-time{color:rgba(27,58,92,0.4);}',
      '.oc-widget-typing{padding:0 16px 6px;font-size:0.8125rem;color:rgba(27,58,92,0.5);font-style:italic;}',
      '.oc-widget-input-bar{display:flex;gap:8px;padding:10px 16px;border-top:1px solid #F5EDD8;}',
      '.oc-widget-msg-input{flex:1;font-family:Inter,sans-serif;font-size:0.875rem;color:#1B3A5C;background:#F5EDD8;border:1.5px solid transparent;border-radius:6px;padding:8px 12px;box-sizing:border-box;}',
      '.oc-widget-msg-input:focus{outline:none;border-color:#B8934A;}',
      '.oc-widget-send-btn{font-family:Inter,sans-serif;font-size:0.875rem;font-weight:600;color:#1B3A5C;background:#B8934A;border:none;border-radius:6px;padding:8px 14px;cursor:pointer;white-space:nowrap;}',
      '.oc-widget-send-btn:hover{background:#C7A24B;}',
      '.oc-widget-send-btn:disabled{opacity:0.6;cursor:not-allowed;}',
      // Footer
      '.oc-widget-panel-footer{padding:10px 16px 12px;border-top:1px solid #F5EDD8;font-size:0.75rem;color:rgba(27,58,92,0.5);}',
      '.oc-widget-disc-link{color:rgba(27,58,92,0.5);text-decoration:none;}',
      '.oc-widget-disc-link:hover{text-decoration:underline;}',
      '@media(max-width:767px){.oc-widget-root{bottom:16px;right:16px;}.oc-widget-panel{width:calc(100vw - 32px);}}'
    ].join('');
    document.head.appendChild(s);
  }

  // --- HTML fragments ---

  var TOGGLE_HTML = [
    '<summary class="oc-widget-toggle">',
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    '</svg>',
    '<span>Ask Olive</span>',
    '</summary>'
  ].join('');

  var PANEL_TOP = [
    '<div class="oc-widget-panel">',
    '<div class="oc-widget-panel-header">',
    '<p class="oc-widget-panel-title">Ask Olive</p>',
    '<p class="oc-widget-panel-sub">A licensed agent follows up within one business day.</p>',
    '</div>',
    '<div id="oc-wgt-error" class="oc-widget-err"></div>'
  ].join('');

  var PANEL_FOOTER = [
    '<div class="oc-widget-panel-footer">',
    '<a href="/ask-olive-disclaimer" class="oc-widget-disc-link">AI Disclaimer</a>',
    ' &middot; ',
    '<a href="/privacy-policy" class="oc-widget-disc-link">Privacy Policy</a>',
    '</div>',
    '</div>'
  ].join('');

  function threadBlockHTML() {
    return [
      '<div id="oc-wgt-thread" class="oc-widget-thread"></div>',
      '<div id="oc-wgt-typing" class="oc-widget-typing" style="display:none">Olive is typing...</div>',
      '<div class="oc-widget-input-bar">',
      '<input id="oc-wgt-msg" class="oc-widget-msg-input" type="text" placeholder="Type a message..." autocomplete="off"/>',
      '<button id="oc-wgt-send" class="oc-widget-send-btn" type="button">Send</button>',
      '</div>'
    ].join('');
  }

  function injectHTML() {
    var existing = document.getElementById('oc-widget-root');
    if (existing && existing.getAttribute('data-wgt-ver') === WGT_VER) return;
    if (existing) existing.parentNode.removeChild(existing);

    var el = document.createElement('details');
    el.id = 'oc-widget-root';
    el.className = 'oc-widget-root';
    el.setAttribute('data-wgt-ver', WGT_VER);

    if (OC_CHAT_ENABLED) {
      var contact = getContact();
      if (contact) {
        el.innerHTML = TOGGLE_HTML + PANEL_TOP + threadBlockHTML() + PANEL_FOOTER;
      } else {
        el.innerHTML = TOGGLE_HTML + PANEL_TOP + [
          '<form id="oc-wgt-capture-form" class="oc-widget-form">',
          '<p class="oc-wgt-intro">Before we chat, how should we reach you?</p>',
          '<input id="oc-wgt-name" class="oc-widget-input" type="text" placeholder="Your name" autocomplete="name" required/>',
          '<input id="oc-wgt-contact-val" class="oc-widget-input" type="text" placeholder="Email or phone" autocomplete="email" required/>',
          '<button id="oc-wgt-start" class="oc-widget-btn" type="submit">Start Chat</button>',
          '</form>'
        ].join('') + PANEL_FOOTER;
      }
    } else {
      var stateOpts = '<option value="">State (optional)</option>' +
        STATES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('');
      el.innerHTML = TOGGLE_HTML + PANEL_TOP + [
        '<form id="oc-wgt-form" class="oc-widget-form">',
        '<input id="oc-wgt-name" class="oc-widget-input" type="text" placeholder="Your name" autocomplete="name" required/>',
        '<input id="oc-wgt-contact" class="oc-widget-input" type="text" placeholder="Email or phone" autocomplete="email" required/>',
        '<select id="oc-wgt-state" class="oc-widget-select">' + stateOpts + '</select>',
        '<textarea id="oc-wgt-intent" class="oc-widget-input oc-widget-ta" placeholder="What do you need? (optional)"></textarea>',
        '<button id="oc-wgt-submit" class="oc-widget-btn" type="submit">Ask Olive</button>',
        '</form>',
        '<div id="oc-wgt-success" class="oc-widget-success"><p>Got it. Someone will reach out within one business day.</p></div>'
      ].join('') + PANEL_FOOTER;
    }

    document.body.appendChild(el);
  }

  // --- Phase 2: lead capture form ---

  function wirePhase2Form() {
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
        var db = getFirestore(app, 'submissions');
        return signInAnonymously(getAuth(app)).then(function () {
          var payload = { name: name, contact: contact, intent: intent || 'not-specified', source: 'widget', session_id: (window.OC_SESSION && window.OC_SESSION.uid ? window.OC_SESSION.uid() : null), ts: serverTimestamp() };
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

  // --- Phase 3: chat ---

  var chatState = { rendered: {}, optimistic: {}, pollTimer: null, typingTimer: null };

  function renderBubble(msg) {
    if (chatState.rendered[msg.id]) return;
    // Deduplicate optimistic inbound messages against server echo
    if (msg.direction === 'inbound' && chatState.optimistic[msg.body]) {
      delete chatState.optimistic[msg.body];
      chatState.rendered[msg.id] = true;
      return;
    }
    chatState.rendered[msg.id] = true;
    var thread = document.getElementById('oc-wgt-thread');
    if (!thread) return;
    var isIn = msg.direction === 'inbound';
    var wrap = document.createElement('div');
    wrap.className = 'oc-widget-msg-wrap oc-widget-msg-wrap--' + (isIn ? 'in' : 'out');
    var bubble = document.createElement('div');
    bubble.className = 'oc-widget-bubble oc-widget-bubble--' + (isIn ? 'in' : 'out');
    bubble.textContent = msg.body;
    var time = document.createElement('div');
    time.className = 'oc-widget-bubble-time';
    time.textContent = fmtTime(msg.created_at);
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;
  }

  function clearTyping() {
    if (chatState.typingTimer) { clearTimeout(chatState.typingTimer); chatState.typingTimer = null; }
    var el = document.getElementById('oc-wgt-typing');
    if (el) el.style.display = 'none';
  }

  function showTyping() {
    var el = document.getElementById('oc-wgt-typing');
    if (el) el.style.display = 'block';
    if (chatState.typingTimer) clearTimeout(chatState.typingTimer);
    chatState.typingTimer = setTimeout(clearTyping, 30000);
  }

  function pollThread() {
    var sessionId = getSession();
    return fetch(CHAT_THREAD + '?session=' + encodeURIComponent(sessionId))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data.messages)) return;
        var hadNewOutbound = false;
        data.messages.forEach(function (msg) {
          if (!chatState.rendered[msg.id]) {
            if (msg.direction === 'outbound') hadNewOutbound = true;
            renderBubble(msg);
          }
        });
        if (hadNewOutbound) clearTyping();
      })
      .catch(function (err) { console.error('[oc-widget] poll error', err); });
  }

  function startPolling() {
    pollThread();
    if (!chatState.pollTimer) chatState.pollTimer = setInterval(pollThread, 10000);
  }

  function stopPolling() {
    if (chatState.pollTimer) { clearInterval(chatState.pollTimer); chatState.pollTimer = null; }
  }

  function sendMessage(body) {
    var sessionId = getSession();
    var contact = getContact();
    var sendBtn = document.getElementById('oc-wgt-send');
    var errEl = document.getElementById('oc-wgt-error');

    // Optimistic render
    var localId = 'local-' + Date.now();
    chatState.optimistic[body] = localId;
    chatState.rendered[localId] = true;
    renderBubble({ id: localId, direction: 'inbound', body: body, created_at: Date.now() });
    showTyping();
    if (sendBtn) { sendBtn.textContent = '...'; sendBtn.disabled = true; }

    fetch(CHAT_SEND, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, body: body, direction: 'inbound', contact: contact })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
    }).catch(function (err) {
      console.error('[oc-widget] send error', err);
      clearTyping();
      if (errEl) { errEl.textContent = 'Message failed. Please try again or call (678) 888-1011.'; errEl.style.display = 'block'; }
    }).finally(function () {
      if (sendBtn) { sendBtn.textContent = 'Send'; sendBtn.disabled = false; }
    });
  }

  function wireInputBar() {
    var sendBtn = document.getElementById('oc-wgt-send');
    var msgInput = document.getElementById('oc-wgt-msg');
    if (!sendBtn || !msgInput) return;
    function doSend() {
      var body = (msgInput.value || '').trim();
      if (!body) return;
      msgInput.value = '';
      sendMessage(body);
    }
    sendBtn.addEventListener('click', doSend);
    msgInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
  }

  function switchToThread() {
    var panel = document.querySelector('#oc-widget-root .oc-widget-panel');
    if (!panel) return;
    var captureForm = document.getElementById('oc-wgt-capture-form');
    if (captureForm) captureForm.parentNode.removeChild(captureForm);
    var footer = panel.querySelector('.oc-widget-panel-footer');
    var tmp = document.createElement('div');
    tmp.innerHTML = threadBlockHTML();
    while (tmp.firstChild) {
      if (footer) panel.insertBefore(tmp.firstChild, footer);
      else panel.appendChild(tmp.firstChild);
    }
    wireInputBar();
    startPolling();
  }

  function wireContactCapture() {
    var form = document.getElementById('oc-wgt-capture-form');
    var errEl = document.getElementById('oc-wgt-error');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('oc-wgt-name').value || '').trim();
      var contactVal = (document.getElementById('oc-wgt-contact-val').value || '').trim();
      if (!name || !contactVal) {
        if (errEl) { errEl.textContent = 'Please enter your name and a way to reach you.'; errEl.style.display = 'block'; }
        return;
      }
      if (errEl) errEl.style.display = 'none';
      saveContact({
        name: name,
        email: contactVal.indexOf('@') !== -1 ? contactVal : '',
        phone: contactVal.indexOf('@') === -1 ? contactVal : ''
      });
      switchToThread();
    });
  }

  function initChat() {
    var contact = getContact();
    if (!contact) {
      wireContactCapture();
    } else {
      wireInputBar();
      startPolling();
    }
    var root = document.getElementById('oc-widget-root');
    if (root) {
      root.addEventListener('toggle', function () {
        if (root.open) startPolling();
        else stopPolling();
      });
    }
  }

  // --- Boot ---

  function init() {
    injectCSS();
    injectHTML();
    if (OC_CHAT_ENABLED) {
      initChat();
    } else {
      wirePhase2Form();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
