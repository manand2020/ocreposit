// ocwidget.js -- Ask Olive Floating Widget v3.0.0
// Migrated to canonical olivec-prod webchat function. Replaces the legacy
// olive-cover-prod /chat/send + /chat/thread stack that depended on a
// decommissioned project.
//
// v3.0.0 (2026-05-28): MIGRATION to canonical olivec-prod stack.
//   * Endpoint switched to olivec-prod webchat function (synchronous reply).
//   * Polling removed -- webchat returns Olive's reply in the same response,
//     so there is no need to fetch a thread on a timer. Simpler + less load.
//   * Firebase SDK fallback removed (no more direct Firestore writes from
//     the browser). Network failure falls back to mailto + the static
//     follow-up bubble, same UX as before, minus the cloud round-trip.
//   * Lead-capture (Phase 2) path also rewritten to POST to the canonical
//     forms function as a homepage-style lead, so a visitor who never
//     types a chat message but fills the capture form still lands in CRM.
//   * Auth: X-Webchat-Auth header (Cloud Run rejects "Authorization: Bearer"
//     against gen2 services unless it is a valid Google IAM token).
//   * UTM + landing_referrer + state still captured per v2.15 logic.
//
// v2.x history compacted; refer to git for the OC Tech-era changes.
(function () {
  'use strict';

  var OC_CHAT_ENABLED = true;
  var WEBCHAT_ENDPOINT = 'https://webchat-3q26d3khpa-ue.a.run.app';
  var FORMS_ENDPOINT = 'https://forms-3q26d3khpa-ue.a.run.app/forms/widget-capture';
  var GATEWAY_TOKEN = 'fLnkE70cjSKztJ2VGnThheVSFwuW16WepOCxcSrDeHY=';
  var WGT_VER = '3.0.0';

  var path = window.location.pathname;
  if (path === '/' || path === '/ask-olive-disclaimer') return;

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

  // Capture UTM/click-id params with 30-day stickiness
  function getUTM() {
    var fields = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','msclkid'];
    var params = new URLSearchParams(location.search);
    var captured = {};
    var hasAny = false;
    fields.forEach(function(f){
      var v = params.get(f);
      if (v) { captured[f] = v; hasAny = true; }
    });
    if (hasAny) {
      captured._captured_at = Date.now();
      try { localStorage.setItem('oc_utm', JSON.stringify(captured)); } catch (e) {}
      return captured;
    }
    try {
      var stored = JSON.parse(localStorage.getItem('oc_utm') || '{}');
      if (stored._captured_at && (Date.now() - stored._captured_at < 30 * 86400 * 1000)) return stored;
    } catch (e) {}
    return {};
  }

  // Merge UTM into the contact object passed to /chat/send
  function contactWithAttribution() {
    var c = getContact() || {};
    var u = getUTM();
    var enriched = Object.assign({}, c);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','msclkid'].forEach(function(k){
      if (u[k]) enriched[k] = u[k];
    });
    if (document.referrer) enriched.landing_referrer = document.referrer;
    return enriched;
  }

  function fireGenerateLead(source) {
    try {
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          form_id: 'oc-widget',
          form_location: source || 'widget',
          value: 1
        });
      }
    } catch (e) { /* gtag missing */ }
  }

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
      '.oc-widget-close{position:absolute;top:8px;right:8px;width:28px;height:28px;border:none;background:transparent;font-size:24px;line-height:1;color:#1B3A5C;cursor:pointer;padding:0;border-radius:4px;display:flex;align-items:center;justify-content:center;opacity:0.6;z-index:1;}',
      '.oc-widget-close:hover{opacity:1;background:rgba(27,58,92,0.06);}',
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
    '<button id="oc-wgt-close" class="oc-widget-close" type="button" aria-label="Close Ask Olive">&times;</button>',
    '<div class="oc-widget-panel-header">',
    '<p class="oc-widget-panel-title">Ask Olive</p>',
    '<p class="oc-widget-panel-sub">Ask anything about insurance. Quotes, coverage, claims, or a quick callback.</p>',
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
      var complete = contact && contact.name && contact.email && contact.phone;
      if (complete) {
        el.innerHTML = TOGGLE_HTML + PANEL_TOP + threadBlockHTML() + PANEL_FOOTER;
      } else {
        var prefName = (contact && contact.name) || '';
        var prefEmail = (contact && contact.email) || '';
        var prefPhone = (contact && contact.phone) || '';
        var attrVal = function (v) { return String(v).replace(/"/g, '&quot;'); };
        el.innerHTML = TOGGLE_HTML + PANEL_TOP + [
          '<form id="oc-wgt-capture-form" class="oc-widget-form">',
          '<p class="oc-wgt-intro">Before we chat, how should we reach you?</p>',
          '<input id="oc-wgt-name" class="oc-widget-input" type="text" placeholder="Your name" autocomplete="name" value="' + attrVal(prefName) + '" required/>',
          '<input id="oc-wgt-email" class="oc-widget-input" type="email" placeholder="Email" autocomplete="email" value="' + attrVal(prefEmail) + '" required/>',
          '<input id="oc-wgt-phone" class="oc-widget-input" type="tel" placeholder="Phone" autocomplete="tel" value="' + attrVal(prefPhone) + '" required/>',
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
        '<div id="oc-wgt-success" class="oc-widget-success"><p>Thanks. Send your first question above to start the conversation.</p></div>'
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

      var subId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('wgt-' + Date.now());
      var sessionId = window.OC_SESSION && window.OC_SESSION.uid ? window.OC_SESSION.uid() : null;
      fetch(FORMS_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json', 'X-Forms-Auth': GATEWAY_TOKEN },
        body: JSON.stringify({
          form_type: 'widget-capture',
          submission_id: subId,
          page_url: location.href,
          submitted_at: new Date().toISOString(),
          fields: {
            name: name,
            contact: contact,
            intent: intent || 'not-specified',
            state: state || '',
            source: 'widget',
            session_id: sessionId
          }
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
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
    var isOptimistic = String(msg.id || '').indexOf('local-') === 0;
    // Dedupe: server-echo of a message we already optimistic-rendered
    if (!isOptimistic && msg.direction === 'inbound' && chatState.optimistic[msg.body]) {
      delete chatState.optimistic[msg.body];
      chatState.rendered[msg.id] = true;
      return;
    }
    // Dedupe: server-echo of an AI outbound we already rendered inline from /chat/send
    if (!isOptimistic && msg.direction === 'outbound' && chatState.optimisticOutbound && chatState.optimisticOutbound[msg.body]) {
      delete chatState.optimisticOutbound[msg.body];
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

  // v3.0.0: pollThread removed. The webchat endpoint is synchronous --
  // Olive's reply lands in the same HTTP response, so there is no thread to
  // poll. Producer takeovers happen out-of-band on the CRM; visitors who
  // come back to the widget start a fresh session.

  function renderGreeting() {
    var thread = document.getElementById('oc-wgt-thread');
    if (!thread) return;
    if (document.getElementById('oc-wgt-greeting')) return;
    if (thread.firstChild) return;
    var wrap = document.createElement('div');
    wrap.id = 'oc-wgt-greeting';
    wrap.className = 'oc-widget-msg-wrap oc-widget-msg-wrap--out';
    var bubble = document.createElement('div');
    bubble.className = 'oc-widget-bubble oc-widget-bubble--out';
    bubble.textContent = 'Hi! I am Olive, Olive Cover’s AI assistant. Ask any insurance question, get a quick estimate, or schedule time to talk. I can help with most things directly.';
    var time = document.createElement('div');
    time.className = 'oc-widget-bubble-time';
    try { time.textContent = fmtTime(Date.now()); } catch (e) { time.textContent = ''; }
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;
  }

  function renderFallbackAck() {
    var thread = document.getElementById('oc-wgt-thread');
    if (!thread) return;
    var wrap = document.createElement('div');
    wrap.className = 'oc-widget-msg-wrap oc-widget-msg-wrap--out';
    var bubble = document.createElement('div');
    bubble.className = 'oc-widget-bubble oc-widget-bubble--out';
    bubble.textContent = 'Got it. An Olive Cover team member will follow up shortly. For anything urgent, call (678) 888-1011 or email askolive@olivecover.com.';
    var time = document.createElement('div');
    time.className = 'oc-widget-bubble-time';
    try { time.textContent = fmtTime(Date.now()); } catch (e) { time.textContent = ''; }
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;
  }

  function startPolling() {
    renderGreeting();
  }

  function stopPolling() { /* v3.0.0: no-op (no timer) */ }

  // v3.0.0: fallbackCaptureMessage removed. When the webchat call fails the
  // user gets a mailto fallback inline (see sendMessage catch handler) --
  // no more direct Firestore writes from the browser.

  function sendMessage(body) {
    var sessionId = getSession();
    var contact = contactWithAttribution();
    var sendBtn = document.getElementById('oc-wgt-send');
    var errEl = document.getElementById('oc-wgt-error');

    // Fire generate_lead once per session.
    try {
      var firedKey = 'oc_chat_lead_fired_' + sessionId;
      if (!sessionStorage.getItem(firedKey)) {
        fireGenerateLead('widget-chat');
        sessionStorage.setItem(firedKey, '1');
      }
    } catch (e) {}

    // Optimistic render of the user's own bubble
    var localId = 'local-' + Date.now();
    chatState.optimistic[body] = localId;
    renderBubble({ id: localId, direction: 'inbound', body: body, created_at: Date.now() });
    showTyping();
    if (sendBtn) { sendBtn.textContent = '...'; sendBtn.disabled = true; }

    var requestBody = {
      session_id: sessionId,
      message: body,
      page_url: location.href,
      visitor: {
        name: contact && contact.name ? contact.name : null,
        email: contact && contact.email ? contact.email : null,
        phone: contact && contact.phone ? contact.phone : null,
        state: contact && contact.state ? contact.state : null,
        utm_source: contact && contact.utm_source ? contact.utm_source : null,
        utm_medium: contact && contact.utm_medium ? contact.utm_medium : null,
        utm_campaign: contact && contact.utm_campaign ? contact.utm_campaign : null,
        utm_content: contact && contact.utm_content ? contact.utm_content : null,
        utm_term: contact && contact.utm_term ? contact.utm_term : null,
        gclid: contact && contact.gclid ? contact.gclid : null,
        fbclid: contact && contact.fbclid ? contact.fbclid : null,
        msclkid: contact && contact.msclkid ? contact.msclkid : null,
        landing_referrer: contact && contact.landing_referrer ? contact.landing_referrer : null
      }
    };

    fetch(WEBCHAT_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-Webchat-Auth': GATEWAY_TOKEN
      },
      body: JSON.stringify(requestBody)
    }).then(function (r) {
      return r.text().then(function (txt) {
        if (!r.ok) {
          console.error('[oc-widget] webchat non-OK', r.status, txt);
          throw new Error('HTTP ' + r.status + ': ' + txt.substring(0, 120));
        }
        clearTyping();
        try {
          var data = JSON.parse(txt);
          if (data && data.reply) {
            var localOutId = 'local-out-' + Date.now();
            renderBubble({ id: localOutId, direction: 'outbound', body: data.reply, created_at: Date.now() });
          }
          if (data && data.session_id && data.session_id !== sessionId) {
            // Server canonicalized the session id -- store it for follow-ups
            try { localStorage.setItem('oc_chat_session', data.session_id); } catch (e) {}
          }
        } catch (e) {
          console.error('[oc-widget] reply parse error:', e && e.message ? e.message : e);
        }
      });
    }).catch(function (err) {
      console.error('[oc-widget] send error', err && err.message ? err.message : err);
      clearTyping();
      if (errEl) {
        var subj = encodeURIComponent('Ask Olive chat: ' + body.substring(0, 60));
        var emailBody = encodeURIComponent(
          'Message from Ask Olive widget (network recovery):\n\n' + body +
          '\n\n---\nName: ' + ((contact && contact.name) || 'Anonymous') +
          '\nEmail: ' + ((contact && contact.email) || 'Not provided') +
          '\nPhone: ' + ((contact && contact.phone) || 'Not provided') +
          '\nSession: ' + sessionId +
          '\nPage: ' + location.href +
          '\nSubmitted: ' + new Date().toISOString()
        );
        var mail = 'mailto:askolive@olivecover.com?subject=' + subj + '&body=' + emailBody;
        errEl.innerHTML = 'Could not connect. <a href="' + mail + '" style="color:#B8934A;font-weight:600;text-decoration:underline;">Send via email instead</a> or call (678) 888-1011.';
        errEl.style.display = 'block';
      }
      renderFallbackAck();
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
      var email = (document.getElementById('oc-wgt-email').value || '').trim();
      var phone = (document.getElementById('oc-wgt-phone').value || '').trim();
      if (!name || !email || !phone) {
        if (errEl) { errEl.textContent = 'Please enter your name, email, and phone.'; errEl.style.display = 'block'; }
        return;
      }
      if (email.indexOf('@') < 0) {
        if (errEl) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; }
        return;
      }
      if (errEl) errEl.style.display = 'none';
      var state = '';
      try { state = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {}
      saveContact({ name: name, email: email, phone: phone, state: state });
      // Fire generate_lead conversion on contact capture (the actual lead moment)
      fireGenerateLead('widget-capture-form');
      switchToThread();
    });
  }

  function initChat() {
    var contact = getContact();
    var complete = contact && contact.name && contact.email && contact.phone;
    if (!complete) {
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

  function wireClose() {
    var closeBtn = document.getElementById('oc-wgt-close');
    var root = document.getElementById('oc-widget-root');
    if (!closeBtn || !root) return;
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      root.removeAttribute('open');
      stopPolling();
    });
  }

  function init() {
    injectCSS();
    injectHTML();
    if (OC_CHAT_ENABLED) {
      initChat();
    } else {
      wirePhase2Form();
    }
    wireClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
