// ocwidget.js -- Ask Olive Floating Widget v3.2.0
//
// v3.2.0 (2026-05-29): SERVER-AUTHORITATIVE session_id.
//   * Removed the upfront client-UUID generation in getSession(). Turn 1 now
//     ships with empty session_id; the webchat function issues the canonical
//     UUID and the widget stores + reuses it for every subsequent send.
//   * generate_lead GA4 conversion moved to fire AFTER the server returns a
//     session_id, keyed off that authoritative ID. Eliminates the prior
//     "Turn-1-phantom-UUID" mismatch where GA4/octracker/CRM analytics
//     referenced a UUID the backend never tracked.
//   * Stale or unknown stored session_ids are gracefully replaced -- backend
//     issues a fresh one on the next send and the widget swaps to it.
//

// Migrated to canonical olivec-prod webchat function. Replaces the legacy
// olive-cover-prod /chat/send + /chat/thread stack that depended on a
// decommissioned project.
//
// v3.1.0 (2026-05-29): MULTI-TURN CONTEXT RETENTION via two-layer approach.
//   * Widget accumulates a local conversation thread (chatState.thread) of
//     {role, text} entries across the session.
//   * On each send, prepends an "[Earlier in this conversation: ...]" prefix
//     made from prior VISITOR messages so the current backend (which passes
//     the message field straight to Gemini) can produce context-aware replies.
//     Verified end-to-end: probe showed Gemini references "your Cumming home"
//     when the city was provided as bracketed prefix in the message.
//   * Also sends a structured `conversation_history: [{role,text},...]` field
//     for the upcoming OC Tech webchat update that will read the structured
//     form and pass it as proper Gemini multi-turn messages. Current backend
//     ignores the field gracefully (unknown JSON field).
//   * When OC Tech ships structured-history support, the inline prefix is
//     removed (the structured field becomes the source of truth and the
//     visitor message in CRM is no longer noisy).
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
  var WGT_VER = '3.6.0';
  // forceForm: when true, render the capture form even for a known contact, so
  // a returning visitor can reach it via "Update details" (Bug 2 handoff).
  var forceForm = false;

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

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Bug 1 fix (OC-Clip handoff 2026-05-30): Olive's URLs were rendered as plain
  // text. Escape the whole string first (msg.body is AI/server output -- never
  // assign it raw to innerHTML), THEN wrap URL substrings in anchors. Matches
  // http(s):// , www.* , and bare domain.tld/path.
  function linkify(text) {
    return escapeHtml(text).replace(
      /((?:https?:\/\/|www\.)[^\s<]+|\b[a-z0-9][a-z0-9.-]*\.(?:com|org|net|io|co|gov)(?:\/[^\s<]*)?)/gi,
      function (m) {
        var trail = '';
        var tm = m.match(/[.,;:!?)\]]+$/);
        if (tm) { trail = tm[0]; m = m.slice(0, m.length - trail.length); }
        var href = /^https?:\/\//i.test(m) ? m : 'https://' + m;
        return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + m + '</a>' + trail;
      }
    );
  }

  // Server-issued session ID is authoritative. On Turn 1 we send an empty session_id;
  // the webchat function issues a UUID and returns it. We store it and use it from
  // Turn 2 onward. Stale/unknown stored IDs are gracefully replaced -- the backend
  // issues a fresh one and the widget swaps to it.
  // v3.2.0: removed the upfront client-UUID generation that v2.x and v3.0/3.1 carried
  // forward from the legacy olive-cover-prod stack. Eliminates the Turn-1-phantom-UUID
  // mismatch where GA4/octracker/CRM analytics keyed off a UUID the backend never used.
  function getSession() {
    return localStorage.getItem('oc_chat_session') || '';
  }
  function storeServerSession(sid) {
    if (sid && typeof sid === 'string') {
      try { localStorage.setItem('oc_chat_session', sid); } catch (e) {}
    }
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
      // v3.3.0: start collapsed -- only the launcher (summary) shows until the
      // visitor clicks it. The absolutely-positioned panel was rendering even
      // when the <details> was closed, so it auto-opened on every page load.
      '.oc-widget-root:not([open]) .oc-widget-panel{display:none !important;}',
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
      // Update-details link (returning visitors reach the capture form)
      '.oc-widget-edit-row{padding:8px 16px 0;text-align:right;}',
      '.oc-widget-edit-link{background:none;border:none;color:rgba(27,58,92,0.55);font-size:0.75rem;cursor:pointer;text-decoration:underline;padding:0;font-family:Inter,sans-serif;}',
      '.oc-widget-edit-link:hover{color:#1B3A5C;}',
      // Inline "Book a call" chip on Olive replies that reference the booking link
      '.oc-widget-reply-chip{align-self:flex-start;margin-top:6px;background:#B8934A;color:#1B3A5C;border:none;border-radius:50px;padding:7px 16px;font-family:Inter,sans-serif;font-size:0.8125rem;font-weight:600;cursor:pointer;}',
      '.oc-widget-reply-chip:hover{background:#C7A24B;}',
      // AI-suggested follow-up chips (Gemini-generated next questions)
      '.oc-widget-suggest-row{display:flex;flex-wrap:wrap;gap:6px;padding:4px 16px 10px;align-items:flex-start;}',
      '.oc-widget-suggest-chip{background:#F5EDD8;color:#1B3A5C;border:1px solid #B8934A;border-radius:50px;padding:5px 12px;font-family:Inter,sans-serif;font-size:0.75rem;cursor:pointer;text-align:left;}',
      '.oc-widget-suggest-chip:hover{background:#efe4c8;}',
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
      '<div class="oc-widget-edit-row"><button id="oc-wgt-edit-contact" type="button" class="oc-widget-edit-link">Not you? Update details</button></div>',
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
      // Phone is optional (v3.3.0) -- a contact is "complete" with name + email.
      // forceForm (Update details) shows the form even for a known contact.
      var complete = !forceForm && contact && contact.name && contact.email;
      if (complete) {
        el.innerHTML = TOGGLE_HTML + PANEL_TOP + threadBlockHTML() + PANEL_FOOTER;
      } else {
        var prefName = (contact && contact.name) || '';
        var prefEmail = (contact && contact.email) || '';
        var prefPhone = (contact && contact.phone) || '';
        var attrVal = function (v) { return String(v).replace(/"/g, '&quot;'); };
        // v3.3.0: visible state selector, defaulting to the cached oc_state so
        // it matches the other forms and chat leads carry a state for CRM
        // licensed-vs-waitlist routing.
        var capState = '';
        try { capState = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {}
        var capStateOpts = '<option value="">What state are you in?</option>' +
          STATES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === capState ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('');
        el.innerHTML = TOGGLE_HTML + PANEL_TOP + [
          '<form id="oc-wgt-capture-form" class="oc-widget-form">',
          '<p class="oc-wgt-intro">Before we chat, how should we reach you?</p>',
          '<select id="oc-wgt-cap-state" class="oc-widget-input oc-widget-select" aria-label="What state are you in?" required>' + capStateOpts + '</select>',
          '<input id="oc-wgt-name" class="oc-widget-input" type="text" placeholder="Your name" autocomplete="name" value="' + attrVal(prefName) + '" required/>',
          '<input id="oc-wgt-email" class="oc-widget-input" type="email" placeholder="Email" autocomplete="email" value="' + attrVal(prefEmail) + '" required/>',
          '<input id="oc-wgt-phone" class="oc-widget-input" type="tel" placeholder="Phone (optional)" autocomplete="tel" value="' + attrVal(prefPhone) + '"/>',
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

  // chatState.thread accumulates the conversation locally so we can pass prior context
  // to Gemini on each new send. The backend currently does NOT pull session history
  // from Firestore into the AI prompt, so the widget includes context two ways:
  //   1) Prepended inside the `message` field (Gemini reads it today) -- enables
  //      visitor-aware replies like "for your Cumming home" right now.
  //   2) Structured `conversation_history` field (forward-compatible) -- ignored by
  //      current backend, will be honored by the upcoming OC Tech webchat update.
  // Once OC Tech ships the structured-history support, the prefix in (1) is removed.
  var chatState = { rendered: {}, optimistic: {}, pollTimer: null, typingTimer: null, thread: [] };
  var MAX_HISTORY_TURNS = 12;       // last 12 messages (~6 round trips)
  var MAX_PREFIX_CHARS = 800;       // cap on inline-prefix length
  function buildHistoryPayload() {
    // Return last MAX_HISTORY_TURNS entries from chatState.thread for the structured field
    if (!chatState.thread || chatState.thread.length === 0) return [];
    return chatState.thread.slice(-MAX_HISTORY_TURNS).map(function (m) {
      return { role: m.role, text: (m.text || '').slice(0, 600) };
    });
  }
  function buildInlinePrefix() {
    // Concatenate the prior VISITOR messages only (skip Olive's) into a short brief.
    // Olive's replies are typically routing language ("our Coverage Review..."), not info to recall.
    var userMsgs = (chatState.thread || []).filter(function (m) { return m.role === 'user'; });
    if (userMsgs.length === 0) return '';
    var combined = userMsgs.map(function (m) { return m.text; }).join(' ');
    if (combined.length > MAX_PREFIX_CHARS) combined = '...' + combined.slice(-MAX_PREFIX_CHARS);
    return '[Earlier in this conversation: ' + combined + ']\n\n';
  }

  // AI leverage (2026-05-30): consume CLIP/Gemini's structured reply.
  //   * Topic-aware booking: CLIP returns data.booking{topic,prefill}; until then
  //     infer topic from the reply text. Opens the matching E!A meeting type via
  //     OC_OpenBooking (ocpatch maps topic -> serviceId).
  //   * AI follow-up chips: CLIP returns data.suggested_replies[]; rendered as
  //     tappable chips that send that question on click.
  function inferTopic(text) {
    text = String(text || '').toLowerCase();
    if (/claim/.test(text)) return 'claims-help';
    if (/business|commercial|\bllc\b|company|liability|workers|fleet/.test(text)) return 'commercial';
    return 'coverage-review';
  }

  function appendReplyChip(topic, prefill) {
    var outs = document.querySelectorAll('#oc-wgt-thread .oc-widget-msg-wrap--out');
    var wrap = outs[outs.length - 1];
    if (!wrap || wrap.querySelector('.oc-widget-reply-chip')) return;
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'oc-widget-reply-chip';
    chip.textContent = 'Book a call';
    chip.addEventListener('click', function () {
      try { if (typeof window.gtag === 'function') window.gtag('event', 'widget_chip_click', { event_category: 'engagement', event_label: 'Book a call', chip_target: '/book', chip_source: 'olive_reply', topic: topic || 'coverage-review' }); } catch (e) {}
      var c = getContact() || {};
      var pf = prefill || { name: c.name, email: c.email, phone: c.phone, verified_state: c.state };
      pf.trigger_source = 'olive_reply';
      if (typeof window.OC_OpenBooking === 'function') window.OC_OpenBooking(topic || 'coverage-review', pf);
      else window.location.href = '/book';
    });
    wrap.appendChild(chip);
  }

  function renderSuggestions(arr) {
    var thread = document.getElementById('oc-wgt-thread');
    if (!thread) return;
    var old = document.getElementById('oc-wgt-suggestions');
    if (old && old.parentNode) old.parentNode.removeChild(old); // keep only the most recent set
    var row = document.createElement('div');
    row.id = 'oc-wgt-suggestions';
    row.className = 'oc-widget-suggest-row';
    arr.forEach(function (q) {
      if (!q) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'oc-widget-suggest-chip';
      b.textContent = String(q);
      b.addEventListener('click', function () {
        try { if (typeof window.gtag === 'function') window.gtag('event', 'widget_suggested_reply_click', { event_category: 'engagement', event_label: String(q).slice(0, 60) }); } catch (e) {}
        if (row.parentNode) row.parentNode.removeChild(row);
        sendMessage(String(q));
      });
      row.appendChild(b);
    });
    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
  }

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
    bubble.innerHTML = linkify(msg.body);
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
    // generate_lead conversion fires after the server returns a session_id so it
    // is keyed off the authoritative ID (not a phantom client UUID). See the
    // .then() block below for the fire site. The guard against double-fire moves
    // there as well.

    // Optimistic render of the user's own bubble
    var localId = 'local-' + Date.now();
    chatState.optimistic[body] = localId;
    renderBubble({ id: localId, direction: 'inbound', body: body, created_at: Date.now() });
    showTyping();
    if (sendBtn) { sendBtn.textContent = '...'; sendBtn.disabled = true; }

    // Build context BEFORE pushing the new message to thread so prefix reflects PRIOR turns only.
    var historyPayload = buildHistoryPayload();
    var inlinePrefix = buildInlinePrefix();
    // Record the new visitor message in local thread for the next round trip.
    chatState.thread.push({ role: 'user', text: body });
    // Send body with prefix prepended so the current backend (which passes message
    // straight to Gemini) gets the prior-turn context. Older bundles + the backend
    // both treat this as a single message; only Gemini parses the prefix as context.
    var messageToSend = inlinePrefix + body;

    var requestBody = {
      session_id: sessionId,
      message: messageToSend,
      conversation_history: historyPayload,  // forward-compatible; ignored by current backend
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
            // Record Olive's reply in the local thread so it informs subsequent context
            // (visitor side only, used today; structured-history side will use it after
            // the backend update lands).
            chatState.thread.push({ role: 'olive', text: data.reply });
            // AI leverage: topic-aware booking chip + AI-suggested follow-up chips.
            // data.booking{topic,prefill} and data.suggested_replies[] are optional
            // (CLIP/Gemini); booking intent falls back to a reply-text heuristic.
            try {
              var bk = data.booking || null;
              var wantsBooking = !!bk || /book\.olivecover\.com|olivecover\.com\/book|\/book(?:\b|\/)/i.test(data.reply || '');
              if (wantsBooking) appendReplyChip((bk && bk.topic) || data.topic || inferTopic(data.reply), bk && bk.prefill);
              var sugg = data.suggested_replies || data.suggestions;
              if (Array.isArray(sugg) && sugg.length) renderSuggestions(sugg.slice(0, 3));
            } catch (e) {}
          }
          if (data && data.session_id) {
            // Server is authoritative for session_id. Store whatever it returns so
            // every subsequent send uses the same canonical ID (Turn 2..N).
            storeServerSession(data.session_id);
            // Fire generate_lead once per session, keyed off the SERVER session_id.
            try {
              var firedKey = 'oc_chat_lead_fired_' + data.session_id;
              if (!sessionStorage.getItem(firedKey)) {
                fireGenerateLead('widget-chat');
                sessionStorage.setItem(firedKey, '1');
              }
            } catch (e) {}
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

  // Bug 2 fix (OC-Clip handoff 2026-05-30): a returning visitor with a cached
  // oc_chat_contact was sent straight to the thread, so the capture form was
  // unreachable. "Update details" re-renders with forceForm=true (form shows,
  // pre-filled). Reuses injectHTML/initChat/wireClose -- no separate render path.
  function showCaptureForm() {
    forceForm = true;
    var r = document.getElementById('oc-widget-root');
    if (r && r.parentNode) r.parentNode.removeChild(r);
    injectHTML();
    initChat();
    wireClose();
    var nr = document.getElementById('oc-widget-root');
    if (nr) nr.setAttribute('open', '');
  }

  function wireInputBar() {
    var editBtn = document.getElementById('oc-wgt-edit-contact');
    if (editBtn) editBtn.addEventListener('click', showCaptureForm);
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
    // Write oc_state immediately on state change so the rest of the site
    // defaults to it (the cache/default behavior shared by all forms).
    var stEl = document.getElementById('oc-wgt-cap-state');
    if (stEl) {
      stEl.addEventListener('change', function () {
        try { if (stEl.value) localStorage.setItem('oc_state', stEl.value.toUpperCase()); } catch (e) {}
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('oc-wgt-name').value || '').trim();
      var email = (document.getElementById('oc-wgt-email').value || '').trim();
      var phone = (document.getElementById('oc-wgt-phone').value || '').trim();
      var stateSel = document.getElementById('oc-wgt-cap-state');
      var state = (stateSel && stateSel.value ? stateSel.value : '').toUpperCase().trim();
      if (!state) { try { state = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {} }
      // Phone is optional (v3.3.0); name + email + state required.
      if (!name || !email) {
        if (errEl) { errEl.textContent = 'Please enter your name and email.'; errEl.style.display = 'block'; }
        return;
      }
      if (email.indexOf('@') < 0) {
        if (errEl) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; }
        return;
      }
      if (!state) {
        if (errEl) { errEl.textContent = 'Please select your state.'; errEl.style.display = 'block'; }
        return;
      }
      if (errEl) errEl.style.display = 'none';
      try { if (state) localStorage.setItem('oc_state', state); } catch (e) {}
      saveContact({ name: name, email: email, phone: phone, state: state });
      forceForm = false; // reset: future loads with a complete contact go straight to the thread
      // Fire generate_lead conversion on contact capture (the actual lead moment)
      fireGenerateLead('widget-capture-form');
      switchToThread();
    });
  }

  function initChat() {
    var contact = getContact();
    var complete = !forceForm && contact && contact.name && contact.email;
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
