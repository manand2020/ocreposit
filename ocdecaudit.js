// ocdecaudit.js v1.0.0 -- Dec Page Audit upload widget for Olive Cover.
//
// Mounts into any element with class `oc-dec-audit-widget`.
// Backend endpoints configured via window.OC_DEC_AUDIT_CONFIG (set in page head).
//
// States: IDLE -> UPLOADING -> PROCESSING -> CAPTURED -> SUCCESS | ERROR
//
// GA4 events fired: dec_audit_upload_started, dec_audit_upload_completed,
//   dec_audit_processing_started, dec_audit_processing_completed,
//   dec_audit_processing_failed, dec_audit_capture_displayed,
//   dec_audit_capture_submitted, dec_audit_capture_skipped
//
// Backend dependencies (3 Cloud Functions -- must be live before widget activates):
//   POST /api/dec-page/signed-upload-url  -> { signed_url, storage_path, audit_id }
//   POST /api/audit-dec-page              -> { audit_id, carrier, premium, renewal, gaps, summary }
//   POST /api/dec-page/send-report        -> 200 on success
//
// Related spec: _oc-marketing-deliverables/dec-page-audit-upload-component-2026-06-05.md

(function () {
  'use strict';

  var CFG = window.OC_DEC_AUDIT_CONFIG || {};
  var UPLOAD_URL_EP  = CFG.uploadEndpoint   || 'https://api.olivecover.com/dec-page/signed-upload-url';
  var AUDIT_EP       = CFG.auditEndpoint    || 'https://api.olivecover.com/audit-dec-page';
  var SEND_REPORT_EP = CFG.sendReportEndpoint || 'https://api.olivecover.com/dec-page/send-report';
  var MAX_MB         = CFG.maxFileSizeMb    || 10;
  var FORMS_AUTH     = 'fLnkE70cjSKztJ2VGnThheVSFwuW16WepOCxcSrDeHY=';

  // ── Styles ──────────────────────────────────────────────────────────────────

  var CSS = [
    '.oc-da-wrap{font-family:Inter,system-ui,sans-serif;color:#1B3A5C;max-width:600px;margin:0 auto;}',
    '.oc-da-card{background:#fff;border:1px solid #e2dcd0;border-radius:8px;padding:32px 28px;}',
    '.oc-da-h{font-family:"Playfair Display",serif;font-size:1.375rem;font-weight:700;margin:0 0 12px;}',
    '.oc-da-sub{font-size:0.9375rem;line-height:1.6;margin:0 0 24px;opacity:0.8;}',
    '.oc-da-privacy{font-size:0.8125rem;opacity:0.55;margin:12px 0 0;}',
    '.oc-da-dropzone{border:2px dashed #B8934A;border-radius:8px;padding:32px 20px;text-align:center;cursor:pointer;background:#FDFAF5;transition:background 0.15s;}',
    '.oc-da-dropzone.drag-over{background:#F5EDD8;}',
    '.oc-da-dz-label{font-size:0.9375rem;color:#1B3A5C;margin:0 0 12px;}',
    '.oc-da-btn{display:inline-block;padding:0 28px;height:44px;line-height:44px;background:#B8934A;color:#fff;border:none;border-radius:4px;font-size:0.9375rem;font-weight:600;font-family:inherit;cursor:pointer;text-decoration:none;}',
    '.oc-da-btn:hover{background:#C7A24B;}',
    '.oc-da-btn:disabled{opacity:0.5;cursor:default;}',
    '.oc-da-btn-secondary{background:none;border:1px solid #B8934A;color:#B8934A;}',
    '.oc-da-btn-secondary:hover{background:#F5EDD8;}',
    '.oc-da-progress-wrap{margin:20px 0;}',
    '.oc-da-progress-bg{height:6px;background:#e2dcd0;border-radius:3px;overflow:hidden;}',
    '.oc-da-progress-fill{height:6px;background:#B8934A;border-radius:3px;transition:width 0.3s;width:0%;}',
    '.oc-da-progress-label{font-size:0.8125rem;margin:6px 0 0;opacity:0.65;}',
    '.oc-da-anim{text-align:center;padding:16px 0;}',
    '.oc-da-anim-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#B8934A;margin:0 3px;animation:oc-da-pulse 1.2s infinite ease-in-out;}',
    '.oc-da-anim-dot:nth-child(2){animation-delay:0.2s;}',
    '.oc-da-anim-dot:nth-child(3){animation-delay:0.4s;}',
    '@keyframes oc-da-pulse{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}',
    '.oc-da-result-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0ebe0;font-size:0.875rem;}',
    '.oc-da-result-row:last-child{border-bottom:none;}',
    '.oc-da-result-label{opacity:0.65;}',
    '.oc-da-gap-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #f0ebe0;font-size:0.875rem;}',
    '.oc-da-gap-item:last-child{border-bottom:none;}',
    '.oc-da-gap-flag{color:#B8934A;font-weight:700;flex-shrink:0;}',
    '.oc-da-field{width:100%;padding:0 12px;height:44px;border:1px solid #d0c9bc;border-radius:4px;font-size:0.9375rem;font-family:inherit;color:#1B3A5C;box-sizing:border-box;margin-bottom:12px;}',
    '.oc-da-field:focus{outline:none;border-color:#B8934A;}',
    '.oc-da-consent-row{display:flex;align-items:flex-start;gap:10px;margin:0 0 20px;}',
    '.oc-da-consent-cb{margin-top:3px;flex-shrink:0;accent-color:#B8934A;width:16px;height:16px;cursor:pointer;}',
    '.oc-da-consent-lbl{font-size:0.875rem;line-height:1.5;cursor:pointer;}',
    '.oc-da-msg{font-size:0.875rem;padding:10px 14px;border-radius:4px;margin:12px 0 0;display:none;}',
    '.oc-da-msg-err{background:#fff0f0;color:#c00;}',
    '.oc-da-msg-ok{background:#f0fff0;color:#2a7a2a;}',
    '.oc-da-disclaimer{font-size:0.75rem;opacity:0.5;margin:16px 0 0;line-height:1.5;}',
    '.oc-da-success-icon{font-size:2rem;margin:0 0 12px;}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('oc-da-css')) return;
    var s = document.createElement('style');
    s.id = 'oc-da-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── GA4 helper ──────────────────────────────────────────────────────────────

  function pushGA4(name, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }

  // ── UUID ────────────────────────────────────────────────────────────────────

  function uuid() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
  }

  // ── Widget factory ──────────────────────────────────────────────────────────

  function mountWidget(root) {
    injectStyles();
    root.innerHTML = '';
    root.className = 'oc-da-wrap';

    var state = { file: null, auditId: null, auditData: null };

    // ── IDLE state ─────────────────────────────────────────────────────────

    function renderIdle() {
      root.innerHTML = '';
      var card = el('div', 'oc-da-card');

      var h = el('p', 'oc-da-h');
      h.textContent = 'Get a free audit of your insurance policy.';

      var sub = el('p', 'oc-da-sub');
      sub.textContent = 'Upload your declarations page. We compare it against the 7 most common gaps Georgia homeowners miss. Plain English. 60 seconds.';

      var notice = el('p', 'oc-da-privacy');
      notice.textContent = 'We use this to identify coverage gaps. The document is deleted from our systems after 24 hours. We do not share it with anyone.';

      var dz = el('div', 'oc-da-dropzone');
      var dzLabel = el('p', 'oc-da-dz-label');
      dzLabel.textContent = 'Drag your PDF here, or click to select a file.';

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/pdf,.pdf';
      fileInput.style.display = 'none';

      var uploadBtn = el('button', 'oc-da-btn');
      uploadBtn.type = 'button';
      uploadBtn.textContent = 'Upload your PDF';
      uploadBtn.addEventListener('click', function () {
        pushGA4('dec_audit_upload_started', { page_path: location.pathname });
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
      });

      dz.addEventListener('click', function (e) {
        if (e.target !== uploadBtn) {
          pushGA4('dec_audit_upload_started', { page_path: location.pathname });
          fileInput.click();
        }
      });

      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag-over'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('drag-over'); });
      dz.addEventListener('drop', function (e) {
        e.preventDefault(); dz.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      });

      var errMsg = el('p', 'oc-da-msg oc-da-msg-err');

      var privFine = el('p', 'oc-da-privacy');
      privFine.textContent = 'Private. PDF deleted after 24 hours. No card. No commitment.';

      dz.appendChild(dzLabel);
      dz.appendChild(uploadBtn);
      dz.appendChild(fileInput);
      card.appendChild(h);
      card.appendChild(sub);
      card.appendChild(notice);
      card.appendChild(dz);
      card.appendChild(errMsg);
      card.appendChild(privFine);
      root.appendChild(card);

      function handleFile(file) {
        errMsg.style.display = 'none';
        var isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
        if (!isPdf) {
          errMsg.textContent = 'That file is not a PDF. Try again with your declarations page in PDF format.';
          errMsg.style.display = 'block'; return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
          errMsg.textContent = 'That PDF is over ' + MAX_MB + ' MB. Most declarations pages are under 2 MB. Try saving it as a smaller file, or email it to hello@olivecover.com.';
          errMsg.style.display = 'block'; return;
        }
        state.file = file;
        renderUploading();
      }
    }

    // ── UPLOADING state ────────────────────────────────────────────────────

    function renderUploading() {
      root.innerHTML = '';
      var card = el('div', 'oc-da-card');

      var h = el('p', 'oc-da-h');
      h.textContent = 'Uploading your policy...';

      var progressWrap = el('div', 'oc-da-progress-wrap');
      var progressBg = el('div', 'oc-da-progress-bg');
      var progressFill = el('div', 'oc-da-progress-fill');
      var progressLabel = el('p', 'oc-da-progress-label');
      progressLabel.textContent = '0%';
      progressBg.appendChild(progressFill);
      progressWrap.appendChild(progressBg);
      progressWrap.appendChild(progressLabel);

      card.appendChild(h);
      card.appendChild(progressWrap);
      root.appendChild(card);

      // Get signed upload URL then upload via XHR for progress tracking
      fetch(UPLOAD_URL_EP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forms-Auth': FORMS_AUTH },
        body: JSON.stringify({ file_name: state.file.name, file_size: state.file.size })
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          state.auditId = data.audit_id;
          var xhr = new XMLHttpRequest();
          xhr.open('PUT', data.signed_url);
          xhr.setRequestHeader('Content-Type', 'application/pdf');
          xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              var pct = Math.round((e.loaded / e.total) * 100);
              progressFill.style.width = pct + '%';
              progressLabel.textContent = pct + '%';
            }
          });
          xhr.addEventListener('load', function () {
            if (xhr.status >= 200 && xhr.status < 300) {
              pushGA4('dec_audit_upload_completed', { page_path: location.pathname });
              renderProcessing(data.storage_path);
            } else {
              renderError('network');
            }
          });
          xhr.addEventListener('error', function () { renderError('network'); });
          xhr.send(state.file);
        })
        .catch(function () { renderError('network'); });
    }

    // ── PROCESSING state ───────────────────────────────────────────────────

    function renderProcessing(storagePath) {
      root.innerHTML = '';
      var card = el('div', 'oc-da-card');
      card.style.textAlign = 'center';

      var h = el('p', 'oc-da-h');
      h.textContent = 'Reading your policy...';

      var sub = el('p', 'oc-da-sub');
      sub.textContent = 'This takes about 30 seconds. Please keep this window open.';

      var anim = el('div', 'oc-da-anim');
      [1, 2, 3].forEach(function () { anim.appendChild(el('span', 'oc-da-anim-dot')); });

      card.appendChild(h);
      card.appendChild(anim);
      card.appendChild(sub);
      root.appendChild(card);

      pushGA4('dec_audit_processing_started', { page_path: location.pathname });

      fetch(AUDIT_EP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forms-Auth': FORMS_AUTH },
        body: JSON.stringify({ audit_id: state.auditId, storage_path: storagePath })
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          pushGA4('dec_audit_processing_completed', { page_path: location.pathname });
          state.auditData = data;
          renderCapture();
        })
        .catch(function () {
          pushGA4('dec_audit_processing_failed', { page_path: location.pathname });
          renderError('audit');
        });
    }

    // ── CAPTURED state (result preview + email form) ───────────────────────

    function renderCapture() {
      root.innerHTML = '';
      var d = state.auditData;
      var card = el('div', 'oc-da-card');

      var h = el('p', 'oc-da-h');
      h.textContent = 'Here is what we found:';

      // Extracted policy data rows
      var dataTable = el('div', '');
      dataTable.style.cssText = 'background:#FDFAF5;border-radius:6px;padding:12px 16px;margin:0 0 20px;';
      [
        ['Carrier', d.carrier || 'Not detected'],
        ['Annual premium', d.premium ? '$' + d.premium.toLocaleString() : 'Not detected'],
        ['Renewal date', d.renewal || 'Not detected']
      ].forEach(function (row) {
        var rowEl = el('div', 'oc-da-result-row');
        var lbl = el('span', 'oc-da-result-label'); lbl.textContent = row[0];
        var val = el('span', ''); val.textContent = row[1];
        rowEl.appendChild(lbl); rowEl.appendChild(val);
        dataTable.appendChild(rowEl);
      });

      var gapHead = el('p', '');
      gapHead.style.cssText = 'font-weight:600;margin:0 0 8px;font-size:0.9375rem;';
      var gaps = d.top_gaps || [];
      gapHead.textContent = gaps.length > 0
        ? 'Top ' + Math.min(gaps.length, 2) + ' gap' + (Math.min(gaps.length, 2) === 1 ? '' : 's') + ' in your current policy:'
        : 'Your policy details have been extracted.';

      var gapList = el('div', '');
      gapList.style.cssText = 'background:#FDFAF5;border-radius:6px;padding:8px 16px;margin:0 0 20px;';
      gaps.slice(0, 2).forEach(function (gap) {
        var item = el('div', 'oc-da-gap-item');
        var flag = el('span', 'oc-da-gap-flag'); flag.textContent = '!';
        var text = el('span', ''); text.textContent = gap;
        item.appendChild(flag); item.appendChild(text);
        gapList.appendChild(item);
      });
      if (gaps.length === 0) {
        var noGap = el('p', ''); noGap.style.cssText = 'font-size:0.875rem;margin:0;opacity:0.7;';
        noGap.textContent = 'See the full report for a detailed gap analysis.';
        gapList.appendChild(noGap);
      }

      var cta = el('p', 'oc-da-sub');
      cta.style.marginBottom = '20px';
      cta.textContent = 'We can email you the full report with every gap, the typical premium impact to fix each one, and what to ask your current agent.';

      // Capture form
      var emailEl = document.createElement('input');
      emailEl.type = 'email'; emailEl.name = 'email'; emailEl.placeholder = 'Email';
      emailEl.className = 'oc-da-field'; emailEl.autocomplete = 'email';

      var nameEl = document.createElement('input');
      nameEl.type = 'text'; nameEl.name = 'name'; nameEl.placeholder = 'Name';
      nameEl.className = 'oc-da-field'; nameEl.autocomplete = 'name';

      var phoneEl = document.createElement('input');
      phoneEl.type = 'tel'; phoneEl.name = 'phone'; phoneEl.placeholder = 'Phone (optional)';
      phoneEl.className = 'oc-da-field'; phoneEl.autocomplete = 'tel';

      var consentRow = el('div', 'oc-da-consent-row');
      var consentCb = document.createElement('input');
      consentCb.type = 'checkbox'; consentCb.id = 'oc-da-consent'; consentCb.className = 'oc-da-consent-cb';
      var consentLbl = el('label', 'oc-da-consent-lbl');
      consentLbl.setAttribute('for', 'oc-da-consent');
      consentLbl.textContent = 'Yes, send my audit and one practical Georgia insurance tip per week.';
      consentRow.appendChild(consentCb); consentRow.appendChild(consentLbl);

      var submitBtn = el('button', 'oc-da-btn');
      submitBtn.type = 'button'; submitBtn.textContent = 'Send my report';
      submitBtn.style.width = '100%';

      var msgEl = el('p', 'oc-da-msg oc-da-msg-err');

      var disclaimer = el('p', 'oc-da-disclaimer');
      disclaimer.textContent = 'This audit is for general education. Verify with your agent or carrier before changing coverage.';

      submitBtn.addEventListener('click', function () {
        var email = emailEl.value.trim();
        var name = nameEl.value.trim();
        if (!email || email.indexOf('@') < 0) { msgEl.textContent = 'Please enter a valid email address.'; msgEl.style.display = 'block'; return; }
        if (!name) { msgEl.textContent = 'Please enter your name.'; msgEl.style.display = 'block'; return; }
        msgEl.style.display = 'none';
        submitBtn.textContent = 'Sending...'; submitBtn.disabled = true;

        fetch(SEND_REPORT_EP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Forms-Auth': FORMS_AUTH },
          body: JSON.stringify({
            audit_id: state.auditId,
            email: email,
            name: name,
            phone: phoneEl.value.trim() || null,
            marketing_consent: consentCb.checked,
            page_path: location.pathname
          })
        })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function () {
            pushGA4('dec_audit_capture_submitted', { page_path: location.pathname, marketing_consent: consentCb.checked });
            renderSuccess();
          })
          .catch(function () {
            submitBtn.textContent = 'Send my report'; submitBtn.disabled = false;
            msgEl.textContent = 'Something went wrong. Please try again or email hello@olivecover.com.';
            msgEl.style.display = 'block';
          });
      });

      card.appendChild(h);
      card.appendChild(dataTable);
      card.appendChild(gapHead);
      card.appendChild(gapList);
      card.appendChild(cta);
      card.appendChild(nameEl);
      card.appendChild(emailEl);
      card.appendChild(phoneEl);
      card.appendChild(consentRow);
      card.appendChild(submitBtn);
      card.appendChild(msgEl);
      card.appendChild(disclaimer);
      root.appendChild(card);

      pushGA4('dec_audit_capture_displayed', { page_path: location.pathname });
    }

    // ── SUCCESS state ──────────────────────────────────────────────────────

    function renderSuccess() {
      root.innerHTML = '';
      var card = el('div', 'oc-da-card');
      card.style.textAlign = 'center';

      var icon = el('p', 'oc-da-success-icon');
      icon.textContent = 'OK';
      icon.style.cssText = 'font-family:Inter,system-ui,sans-serif;font-size:1rem;font-weight:700;color:#2a7a2a;background:#f0fff0;border-radius:50%;width:40px;height:40px;line-height:40px;margin:0 auto 16px;';

      var h = el('p', 'oc-da-h');
      h.textContent = 'Sent. Check your inbox in 60 seconds.';

      var sub = el('p', 'oc-da-sub');
      sub.textContent = 'If you do not see it, check spam -- the first email from a new sender sometimes lands there.';

      var cta = el('p', '');
      cta.style.cssText = 'font-size:0.9375rem;margin:20px 0 0;';
      cta.textContent = 'Want to talk through the gaps with one of our agents? ';
      var ctaLink = document.createElement('a');
      ctaLink.href = '/coverage-review';
      ctaLink.textContent = 'Free Coverage Review';
      ctaLink.style.cssText = 'color:#B8934A;font-weight:600;';
      cta.appendChild(ctaLink);

      card.appendChild(icon); card.appendChild(h); card.appendChild(sub); card.appendChild(cta);
      root.appendChild(card);
    }

    // ── ERROR state ────────────────────────────────────────────────────────

    function renderError(type) {
      root.innerHTML = '';
      var card = el('div', 'oc-da-card');

      var h = el('p', 'oc-da-h');
      h.textContent = 'We hit a problem.';

      var msg = el('p', 'oc-da-sub');
      if (type === 'audit') {
        msg.textContent = 'We could not read this declarations page. Common reasons: scanned image quality is too low, or it is not a US homeowners policy. Email it to hello@olivecover.com and we will take a look.';
      } else {
        msg.textContent = 'Something went wrong uploading your file. Please check your connection and try again, or email your declarations page directly to hello@olivecover.com.';
      }

      var retryBtn = el('button', 'oc-da-btn');
      retryBtn.type = 'button'; retryBtn.textContent = 'Try again';
      retryBtn.addEventListener('click', function () { state.file = null; state.auditId = null; state.auditData = null; renderIdle(); });

      card.appendChild(h); card.appendChild(msg); card.appendChild(retryBtn);
      root.appendChild(card);
    }

    // ── DOM helper ─────────────────────────────────────────────────────────

    function el(tag, cls) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      return e;
    }

    // ── Track page departure without submitting ────────────────────────────

    window.addEventListener('beforeunload', function () {
      if (state.file && !state.auditData) {
        pushGA4('dec_audit_capture_skipped', { page_path: location.pathname, stage: 'pre_result' });
      } else if (state.auditData && !root.querySelector('.oc-da-success-icon')) {
        pushGA4('dec_audit_capture_skipped', { page_path: location.pathname, stage: 'pre_submit' });
      }
    });

    // ── Boot ───────────────────────────────────────────────────────────────

    renderIdle();
    pushGA4('dec_audit_page_view', { page_path: location.pathname });
  }

  // ── Mount all widgets ────────────────────────────────────────────────────

  function mount() {
    document.querySelectorAll('.oc-dec-audit-widget').forEach(function (root) {
      if (!root.dataset.ocDaMounted) {
        root.dataset.ocDaMounted = '1';
        mountWidget(root);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
