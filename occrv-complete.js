// Olive Cover -- Coverage Review form behavior v3.3.0
// Posts to olivec-prod forms Cloud Function (canonical Clip pipeline).
// Uploads dec-page + policy files to olive-cover-prod Firebase Storage (legacy bucket,
// retained until olivec-prod public file-upload endpoint ships).
// Source: github.com/manand2020/ocreposit/occrv-complete.js
//
// v3.3.0 (2026-06-06): Collect shared contact (first/last name, email, phone, STATE)
//   on the gateway BEFORE the user picks Quick vs Full. Both paths inherit them:
//   Quick form then only asks for documents; Full form skips its contact step (step 2).
//   State is now an explicit required dropdown on the gateway (previously the Quick
//   form had no visible state field and relied on a hidden selector/localStorage).
//   ZIP is no longer required (Full form step 2 is skipped).
//
// v3.2.0 (2026-06-06): Add gateway + quick-upload path (Option A). Gateway panel
//   shown before the 5-step form; users choose "Walk me through it" (full form) or
//   "Quick upload" (name/email/phone + dec page + policy). Both POST to the same
//   ENDPOINT with fields.mode = "full" or "quick-upload". Back from step 1 returns
//   to gateway. Session restore skips gateway and goes directly to saved step.
//
// v3.1.0 (2026-05-29): RESTORE file uploads. Form POST still targets olivec-prod
//   forms function, but dec page and current policy bytes are uploaded to the
//   legacy olive-cover-prod Storage bucket so advisors see download URLs in the
//   CRM Lead. Anonymous Firebase auth used solely for Storage writes.
//   v3.0.0 dropped this; restored to remove the regression Mahesh flagged.
//
// v3.0.0 (2026-05-28): MIGRATION to canonical olivec-prod stack.
//   * Final submit POSTs to https://forms-3q26d3khpa-ue.a.run.app/forms/coverage-review
//     which writes to olivec-prod Firestore + forwards to Clip /internal/forms.
//     Clip creates a CRM Lead, opens a Paperclip Issue, and routes to Service Triage.
//   * Auto-save migrated from Firestore cloud-sync to localStorage-only:
//     Same-device resume still works. Cross-device resume removed (rare in practice).
//   * All UI logic (5-step, chip groups, validation, GA4 conversion) UNCHANGED.
//
// v2.14.0 (2026-05-23): State dropdown read fix (oc-state-select).
// v2.13.0: gtag generate_lead conversion + full UTM stack.
// v2.12.1: stopImmediatePropagation on nav handlers.
// v2.12: ZIP format validation.
// v2.11: named app (oc-crv).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const ENDPOINT = "https://forms-3q26d3khpa-ue.a.run.app/forms/coverage-review";
const BEARER = "fLnkE70cjSKztJ2VGnThheVSFwuW16WepOCxcSrDeHY=";
const STATE_LS_KEY = "oc_crv_state_v3";

// Firebase init -- Storage only, on the legacy olive-cover-prod bucket. Named app
// "oc-crv-storage" so this never collides with other named-app instances on the page.
const _fbConfig = {
  apiKey: "AIzaSyB1JuGUbJCkz0he8JnKNbQyRBTwtONZnWM",
  authDomain: "olive-cover-prod.firebaseapp.com",
  projectId: "olive-cover-prod",
  storageBucket: "olive-cover-prod.firebasestorage.app",
  messagingSenderId: "781066018428",
  appId: "1:781066018428:web:535d07b690283027f9f3f9"
};
const _fbApp = initializeApp(_fbConfig, "oc-crv-storage");
const _fbStorage = getStorage(_fbApp);
const _fbAuth = getAuth(_fbApp);
let _fbAuthReady = false;
signInAnonymously(_fbAuth).catch(function (err) { console.warn("[oc-crv] anon auth failed:", err); });
onAuthStateChanged(_fbAuth, function (u) { if (u) _fbAuthReady = true; });
function waitForAuth(maxMs) {
  return new Promise(function (resolve) {
    if (_fbAuthReady) return resolve(true);
    const start = Date.now();
    const t = setInterval(function () {
      if (_fbAuthReady || Date.now() - start > (maxMs || 4000)) {
        clearInterval(t);
        resolve(_fbAuthReady);
      }
    }, 100);
  });
}

// Capture UTM/click-id params with 30-day stickiness in localStorage
function captureUTM() {
  const fields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "msclkid"];
  const params = new URLSearchParams(location.search);
  let captured = {};
  let hasAny = false;
  fields.forEach(function(f) {
    const v = params.get(f);
    if (v) { captured[f] = v; hasAny = true; }
  });
  if (hasAny) {
    captured._captured_at = Date.now();
    try { localStorage.setItem("oc_utm", JSON.stringify(captured)); } catch (e) {}
    return captured;
  }
  try {
    const stored = JSON.parse(localStorage.getItem("oc_utm") || "{}");
    if (stored._captured_at && (Date.now() - stored._captured_at < 30 * 86400 * 1000)) {
      return stored;
    }
  } catch (e) {}
  return {};
}
const _utm = captureUTM();
const _landing_referrer = document.referrer || "";

// v3.0.0: anonymous auth removed -- direct fetch to olivec-prod forms function.

// ---- Session management ----------------------------------------

const SID_KEY = "oc_crv_sid";

function uuidv4() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getOrCreateSession() {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) { sid = uuidv4(); localStorage.setItem(SID_KEY, sid); }
  return sid;
}

function clearSession() {
  localStorage.removeItem(SID_KEY);
}

// ---- State -----------------------------------------------------

const STATE = {
  step: 1,
  mode: "gateway",  // "gateway" | "full" | "quick"
  track: null,
  contactPref: [],
  personalLines: [],
  commercialLines: [],
  homeValue: null,
  yearBuilt: null,
  vehicles: null,
  drivers: null,
  claims: null,
  credit: null,
  bizType: null,
  employees: null,
  revenue: null,
  yearsInBiz: null,
  currentPremium: null,
  wantsQuotes: null,
  quoteImportance: [],
  frustrations: [],
  connectTiming: null,
  decFileUrl: null,
  decFileName: null,
  policyFileUrl: null,
  policyFileName: null,
  qDecFileUrl: null,
  qDecFileName: null,
  qPolFileUrl: null,
  qPolFileName: null,
  saveTimer: null,
  saving: false,
  restored: false
};

// ---- DOM helpers -----------------------------------------------

const $ = (id) => document.getElementById(id);
const showErr = (msg) => {
  const e = $("oc-crv-err");
  if (!e) return;
  e.textContent = msg || "";
  e.style.display = msg ? "block" : "none";
};

// ---- Step management -------------------------------------------

const STEP_TITLES = [
  "What brings you here?",
  "Your contact info",
  "Coverage lines",
  "Coverage details",
  "Quick comparison check"
];
const STEP_SUBS = [
  "Personal or business -- we handle both.",
  "No spam. Straight answer within 1 business day.",
  "Select everything that applies to your situation.",
  "Help us understand your current picture.",
  "We can run your info with multiple carriers."
];

function setStep(n, doScroll) {
  STATE.step = n;
  for (let i = 1; i <= 5; i++) {
    const p = $("oc-crv-p" + i);
    if (p) p.style.display = (i === n) ? "" : "none";
    const s = $("oc-crv-s" + i);
    if (!s) continue;
    if (i < n) { s.classList.add("oc-crv-step-done"); s.classList.remove("oc-crv-step-active"); }
    else if (i === n) { s.classList.add("oc-crv-step-active"); s.classList.remove("oc-crv-step-done"); }
    else { s.classList.remove("oc-crv-step-active", "oc-crv-step-done"); }
  }
  const ht = $("oc-crv-htitle");
  if (ht) ht.textContent = STEP_TITLES[n - 1];
  const sub = document.querySelector(".oc-crv-card-sub");
  if (sub) sub.textContent = STEP_SUBS[n - 1];
  const back = $("oc-crv-back");
  const next = $("oc-crv-next");
  const submit = $("oc-crv-submit");
  if (back) back.style.display = (n > 1 || STATE.mode === "full") ? "" : "none";
  if (next) next.style.display = n < 5 ? "" : "none";
  if (submit) submit.style.display = n === 5 ? "" : "none";
  showErr("");
  if (doScroll) {
    var _f = document.getElementById('oc-crv-form-section') || document.getElementById('oc-crv-wrap');
    var _t = _f ? _f.getBoundingClientRect().top + window.scrollY - 80 : 0;
    window.scrollTo({ top: Math.max(0, _t), behavior: 'smooth' });
  }
  scheduleSave();
}

// ---- Track card selection (Step 1) -----------------------------

function onTrackClick(e) {
  const card = e.currentTarget;
  document.querySelectorAll(".oc-crv-type-card").forEach((c) => c.classList.remove("oc-crv-type-card-active"));
  card.classList.add("oc-crv-type-card-active");
  STATE.track = card.dataset.t;
  scheduleSave();
}

// ---- Single-select chip groups ---------------------------------

function setupSingleChips(groupSelector, stateKey) {
  document.querySelectorAll(groupSelector + " .oc-crv-chip").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(groupSelector + " .oc-crv-chip").forEach((b) => b.classList.remove("oc-crv-chip-on"));
      btn.classList.add("oc-crv-chip-on");
      STATE[stateKey] = btn.dataset.v;
      scheduleSave();
    });
  });
}

// ---- Multi-select chip groups ----------------------------------

function setupMultiChips(groupSelector, stateKey) {
  document.querySelectorAll(groupSelector + " .oc-crv-chip").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const on = btn.classList.toggle("oc-crv-chip-on");
      const v = btn.dataset.v;
      if (!v) return;
      if (on) { if (!STATE[stateKey].includes(v)) STATE[stateKey].push(v); }
      else { STATE[stateKey] = STATE[stateKey].filter((x) => x !== v); }
      scheduleSave();
    });
  });
}

// ---- Coverage line checkboxes (Step 3) -------------------------

function onCkChange() { scheduleSave(); }

// ---- File upload handlers (Step 4) ----------------------------
// v3.1.0: cloud uploads RESTORED. Files write to the legacy olive-cover-prod
// Storage bucket under the original coverage-review/dec-pages and
// coverage-review/policies prefixes. Download URL is embedded in the submission
// payload so the advisor sees a link in the CRM Lead. The form POST itself
// still goes to the olivec-prod canonical forms function.

function setupFileUpload(inputId, triggerId, labelId, stateUrlKey, stateNameKey, folder, maxMB) {
  const input = $(inputId);
  if (!input) return;
  const trigger = $(triggerId);
  if (trigger) trigger.addEventListener("click", (e) => { e.preventDefault(); input.click(); });
  input.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const lbl = $(labelId);
    if (file.size > maxMB * 1024 * 1024) {
      showErr("File too large. Max " + maxMB + " MB.");
      e.target.value = "";
      return;
    }
    if (lbl) lbl.textContent = "Uploading...";
    try {
      await waitForAuth(4000);
      const sid = getOrCreateSession();
      const safeName = sid + "-" + Date.now() + "-" + file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const r = ref(_fbStorage, folder + "/" + safeName);
      await uploadBytes(r, file, { contentType: file.type });
      STATE[stateUrlKey] = await getDownloadURL(r);
      STATE[stateNameKey] = file.name;
      if (lbl) lbl.textContent = file.name;
      scheduleSave();
    } catch (err) {
      console.error("[oc-crv] file upload failed:", err);
      showErr("File upload failed. Please try again or email it to askolive@olivecover.com.");
      if (lbl) lbl.textContent = "Upload failed";
    }
  });
}

// ---- Navigation ------------------------------------------------

function validateStep(n) {
  if (n === 1) {
    if (!STATE.track) { showErr("Please choose Personal or Commercial."); return false; }
  } else if (n === 2) {
    const fn = ($("oc-crv-fn") || {}).value || "";
    const ln = ($("oc-crv-ln") || {}).value || "";
    const em = ($("oc-crv-em") || {}).value || "";
    const zp = ($("oc-crv-zp") || {}).value || "";
    if (!fn.trim() || !ln.trim()) { showErr("Please enter your first and last name."); return false; }
    if (!/^\S+@\S+\.\S+$/.test(em.trim())) { showErr("Please enter a valid email address."); return false; }
    if (!zp.trim()) { showErr("Please enter your ZIP code."); return false; }
    if (!/^\d{5}(-\d{4})?$/.test(zp.trim())) { showErr("Please enter a valid 5-digit ZIP code."); return false; }
  } else if (n === 3) {
    const sel = STATE.track === "personal"
      ? "#oc-crv-pl input[type=checkbox]:checked"
      : "#oc-crv-cl input[type=checkbox]:checked";
    if (!document.querySelectorAll(sel).length) {
      showErr("Please select at least one coverage line."); return false;
    }
  }
  return true;
}

function onBack(e) {
  e.preventDefault();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  if (STATE.mode === "full" && STATE.step === 1) { showGateway(true); return; }
  // Step 2 (contact) is collected on the gateway and skipped, so step 3 goes back to step 1
  if (STATE.mode === "full" && STATE.step === 3) { setStep(1, true); return; }
  if (STATE.step > 1) setStep(STATE.step - 1, true);
}
function onNext(e) {
  e.preventDefault();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  if (!validateStep(STATE.step)) return;
  // Skip step 2 (contact) in full mode -- collected on the gateway
  const nextStep = (STATE.mode === "full" && STATE.step === 1) ? 3 : STATE.step + 1;
  setStep(nextStep, true);
  if (STATE.step === 3) {
    const pl = $("oc-crv-pl");
    const cl = $("oc-crv-cl");
    if (pl) pl.style.display = STATE.track === "personal" ? "" : "none";
    if (cl) cl.style.display = STATE.track === "commercial" ? "" : "none";
  }
  if (STATE.step === 4) {
    const pd = $("oc-crv-p4-personal");
    const cd = $("oc-crv-p4-commercial");
    if (pd) pd.style.display = STATE.track === "personal" ? "" : "none";
    if (cd) cd.style.display = STATE.track === "commercial" ? "" : "none";
  }
}

// ---- Quote comparison card (Step 5) ---------------------------

function onQuoteCardClick(e) {
  const card = e.currentTarget;
  document.querySelectorAll(".oc-crv-quote-card").forEach((c) => c.classList.remove("oc-crv-type-card-active"));
  card.classList.add("oc-crv-type-card-active");
  STATE.wantsQuotes = card.dataset.q;
  const qDetail = $("oc-crv-q-detail");
  if (qDetail) qDetail.style.display = STATE.wantsQuotes === "yes" ? "" : "none";
  scheduleSave();
}

// ---- Session resume banner ------------------------------------

function dismissResume(e) {
  e.preventDefault();
  const banner = $("oc-crv-resume");
  if (banner) banner.style.display = "none";
}

function onStartOver(e) {
  e.preventDefault();
  try { localStorage.removeItem(STATE_LS_KEY); } catch (err) {}
  clearSession();
  location.reload();
}

// ---- Auto-save (debounce 1.5s) --------------------------------

function scheduleSave() {
  clearTimeout(STATE.saveTimer);
  STATE.saveTimer = setTimeout(saveSession, 1500);
}

function buildPartialPayload() {
  const v = (id) => { const el = $(id); return el ? (el.value || "").trim() : ""; };
  const checks = (sel) => Array.from(document.querySelectorAll(sel + ":checked")).map((c) => c.value);
  // State is injected by ocstateselect.js into the form as a <select id="oc-state-select"
  // name="state"> dropdown (NOT as oc-crv-st which previous code expected and never found).
  // Prefer the live element value (reflects user's current selection), fall back to
  // localStorage where ocstateselect writes on change. Mirrors the working pattern in
  // ochomeleads.js + ocwidget.js + occontact-complete.js v1.7.0.
  let stateVal = "";
  try {
    const sel = document.getElementById("oc-state-select");
    if (sel && sel.value) stateVal = sel.value.toUpperCase().trim();
    if (!stateVal) stateVal = (localStorage.getItem("oc_state") || "").toUpperCase().trim();
  } catch (e) {}
  return {
    step: STATE.step,
    track: STATE.track,
    contactPref: STATE.contactPref.slice(),
    contact: {
      firstName: v("oc-crv-fn"),
      lastName: v("oc-crv-ln"),
      email: v("oc-crv-em"),
      phone: v("oc-crv-ph"),
      zip: v("oc-crv-zp"),
      state: stateVal
    },
    personalLines: checks("#oc-crv-pl input[type=checkbox]"),
    commercialLines: checks("#oc-crv-cl input[type=checkbox]"),
    homeValue: STATE.homeValue,
    yearBuilt: v("oc-crv-yb"),
    vehicles: STATE.vehicles,
    drivers: STATE.drivers,
    claims: STATE.claims,
    credit: STATE.credit,
    bizType: STATE.bizType,
    employees: STATE.employees,
    revenue: STATE.revenue,
    yearsInBiz: STATE.yearsInBiz,
    currentCarrier: v("oc-crv-ca"),
    currentPremium: STATE.currentPremium,
    renewalDate: v("oc-crv-rd"),
    notes: v("oc-crv-nt"),
    decFileUrl: STATE.decFileUrl,
    decFileName: STATE.decFileName,
    policyFileUrl: STATE.policyFileUrl,
    policyFileName: STATE.policyFileName,
    wantsQuotes: STATE.wantsQuotes,
    quoteImportance: STATE.quoteImportance.slice(),
    frustrations: STATE.frustrations.slice(),
    connectTiming: STATE.connectTiming,
    status: "in_progress",
    session_id: window.OC_SESSION?.uid() ?? null,
    pageUrl: location.href,
    userAgent: navigator.userAgent,
    utm_source: _utm.utm_source || null,
    utm_medium: _utm.utm_medium || null,
    utm_campaign: _utm.utm_campaign || null,
    utm_content: _utm.utm_content || null,
    utm_term: _utm.utm_term || null,
    gclid: _utm.gclid || null,
    fbclid: _utm.fbclid || null,
    msclkid: _utm.msclkid || null,
    landing_referrer: _landing_referrer,
    savedAt: Date.now()
  };
}

function saveSession() {
  if (STATE.saving) return;
  STATE.saving = true;
  try {
    getOrCreateSession();
    localStorage.setItem(STATE_LS_KEY, JSON.stringify(buildPartialPayload()));
  } catch (err) { console.warn("[oc-crv] auto-save failed:", err); }
  finally { STATE.saving = false; }
}

// ---- Session recovery on load ---------------------------------

function tryRestoreSession() {
  const sid = localStorage.getItem(SID_KEY);
  if (!sid) return;
  try {
    const raw = localStorage.getItem(STATE_LS_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (!d || d.status !== "in_progress") return;
    // Restore contact fields
    const set = (id, val) => { const el = $(id); if (el && val) el.value = val; };
    set("oc-crv-fn", d.contact && d.contact.firstName);
    set("oc-crv-ln", d.contact && d.contact.lastName);
    set("oc-crv-em", d.contact && d.contact.email);
    set("oc-crv-ph", d.contact && d.contact.phone);
    set("oc-crv-zp", d.contact && d.contact.zip);
    set("oc-crv-st", d.contact && d.contact.state);
    set("oc-crv-yb", d.yearBuilt);
    set("oc-crv-ca", d.currentCarrier);
    set("oc-crv-rd", d.renewalDate);
    set("oc-crv-nt", d.notes);
    // Restore track
    if (d.track) {
      STATE.track = d.track;
      const card = document.querySelector('.oc-crv-type-card[data-t="' + d.track + '"]');
      if (card) card.classList.add("oc-crv-type-card-active");
    }
    // Restore multi-chips (contact pref)
    if (Array.isArray(d.contactPref)) {
      STATE.contactPref = d.contactPref.slice();
      d.contactPref.forEach((v) => {
        const btn = document.querySelector('#oc-crv-contact-pref .oc-crv-chip[data-v="' + v + '"]');
        if (btn) btn.classList.add("oc-crv-chip-on");
      });
    }
    // Restore coverage line checkboxes
    const restoreCks = (sel, arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((v) => {
        const ck = document.querySelector(sel + '[value="' + v + '"]');
        if (ck) ck.checked = true;
      });
    };
    restoreCks('#oc-crv-pl input[type=checkbox]', d.personalLines);
    restoreCks('#oc-crv-cl input[type=checkbox]', d.commercialLines);
    // Restore single-select chips via helper
    const restoreSingle = (groupSel, stateKey, val) => {
      if (!val) return;
      STATE[stateKey] = val;
      const btn = document.querySelector(groupSel + ' .oc-crv-chip[data-v="' + val + '"]');
      if (btn) { document.querySelectorAll(groupSel + " .oc-crv-chip").forEach((b) => b.classList.remove("oc-crv-chip-on")); btn.classList.add("oc-crv-chip-on"); }
    };
    restoreSingle("#oc-crv-hv", "homeValue", d.homeValue);
    restoreSingle("#oc-crv-vh", "vehicles", d.vehicles);
    restoreSingle("#oc-crv-dv", "drivers", d.drivers);
    restoreSingle("#oc-crv-cl-claims", "claims", d.claims);
    restoreSingle("#oc-crv-cr", "credit", d.credit);
    restoreSingle("#oc-crv-bt", "bizType", d.bizType);
    restoreSingle("#oc-crv-ee", "employees", d.employees);
    restoreSingle("#oc-crv-rv", "revenue", d.revenue);
    restoreSingle("#oc-crv-yib", "yearsInBiz", d.yearsInBiz);
    restoreSingle("#oc-crv-pr", "currentPremium", d.currentPremium);
    // Restore file names (display only -- re-upload needed)
    if (d.decFileName) { STATE.decFileUrl = d.decFileUrl; STATE.decFileName = d.decFileName; const lbl = $("oc-crv-fname-dec"); if (lbl) { lbl.textContent = d.decFileName; lbl.style.display = ""; } }
    if (d.policyFileName) { STATE.policyFileUrl = d.policyFileUrl; STATE.policyFileName = d.policyFileName; const lbl = $("oc-crv-fname-pol"); if (lbl) { lbl.textContent = d.policyFileName; lbl.style.display = ""; } }
    // Restore quote step
    if (d.wantsQuotes) {
      STATE.wantsQuotes = d.wantsQuotes;
      const qCard = document.querySelector('.oc-crv-quote-card[data-q="' + d.wantsQuotes + '"]');
      if (qCard) qCard.classList.add("oc-crv-type-card-active");
      const qDetail = $("oc-crv-q-detail");
      if (qDetail) qDetail.style.display = d.wantsQuotes === "yes" ? "" : "none";
    }
    if (Array.isArray(d.quoteImportance)) {
      STATE.quoteImportance = d.quoteImportance.slice();
      d.quoteImportance.forEach((v) => { const b = document.querySelector('#oc-crv-qi .oc-crv-chip[data-v="' + v + '"]'); if (b) b.classList.add("oc-crv-chip-on"); });
    }
    if (Array.isArray(d.frustrations)) {
      STATE.frustrations = d.frustrations.slice();
      d.frustrations.forEach((v) => { const b = document.querySelector('#oc-crv-fr .oc-crv-chip[data-v="' + v + '"]'); if (b) b.classList.add("oc-crv-chip-on"); });
    }
    restoreSingle("#oc-crv-ct", "connectTiming", d.connectTiming);
    // Show resume banner if they were past step 1
    const startStep = (typeof d.step === "number" && d.step >= 1 && d.step <= 5) ? d.step : 1;
    STATE.restored = startStep > 1;
    if (STATE.restored) {
      const banner = $("oc-crv-resume");
      if (banner) banner.style.display = "";
    }
    // Jump back to their last step in full-form mode (skips gateway)
    if (STATE.restored) {
      STATE.mode = "full";
      const _p0 = $("oc-crv-p0"); if (_p0) _p0.style.display = "none";
      // Step 2 (contact) is collected on the gateway in v3.3.0; keep its tab hidden
      for (let _i = 1; _i <= 5; _i++) { const _s = $("oc-crv-s" + _i); if (_s) _s.style.display = (_i === 2) ? "none" : ""; }
    }
    if (startStep > 1) setStep(startStep);
  } catch (err) { console.warn("[oc-crv] session restore failed:", err); }
}

function uuidv4Submission() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---- Submit (Step 5) ------------------------------------------

async function onSubmit(e) {
  e.preventDefault();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  if (!STATE.wantsQuotes) { showErr("Please select yes or no for the carrier comparison."); return; }
  const btn = $("oc-crv-submit");
  if (!btn) return;
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = "Sending...";
  showErr("");
  try {
    getOrCreateSession();
    const fields = Object.assign(buildPartialPayload(), {
      status: "submitted",
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    delete fields.savedAt;
    const requestBody = {
      form_type: "coverage-review",
      submission_id: uuidv4Submission(),
      page_url: location.href,
      submitted_at: new Date().toISOString(),
      fields,
    };
    const res = await fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "X-Forms-Auth": BEARER,
      },
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text().catch(() => "")));
    try { localStorage.removeItem(STATE_LS_KEY); } catch (e) {}
    clearSession();
    const payload = fields;
    const wrap = $("oc-crv-wrap");
    const ok = $("oc-crv-ok");
    if (wrap) wrap.style.display = "none";
    if (ok) ok.style.display = "";
    try { window.scrollTo({ top: (ok ? ok.getBoundingClientRect().top + window.scrollY - 80 : 0), behavior: "smooth" }); } catch (e2) {}
    // GA4 conversion event for Google Ads bidding optimization
    try {
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          form_id: "oc-crv-wrap",
          form_location: "coverage-review",
          track: STATE.track || "unknown",
          state: payload.contact && payload.contact.state ? payload.contact.state : "unknown",
          value: 5
        });
      }
    } catch (e3) { /* gtag missing */ }
  } catch (err) {
    console.error("[oc-crv] submit failed:", err);
    showErr("Couldn't send right now. Please try again, or email askolive@olivecover.com.");
    btn.disabled = false;
    btn.textContent = origText || "Send for Review";
  }
}

// ---- Gateway (choice screen before full / quick form) ----------

function injectGateway() {
  const wrap = $("oc-crv-wrap");
  if (!wrap || $("oc-crv-p0")) return;
  const el = document.createElement("div");
  el.id = "oc-crv-p0";
  el.innerHTML =
    '<div style="margin-bottom:18px">' +
      '<div style="display:flex;gap:8px;margin-bottom:8px">' +
        '<input id="oc-crv-gw-fn" type="text" placeholder="First name" class="w-input" style="flex:1;margin:0">' +
        '<input id="oc-crv-gw-ln" type="text" placeholder="Last name" class="w-input" style="flex:1;margin:0">' +
      '</div>' +
      '<input id="oc-crv-gw-em" type="email" placeholder="Email address" class="w-input" style="width:100%;margin-bottom:8px;box-sizing:border-box">' +
      '<input id="oc-crv-gw-ph" type="tel" placeholder="Phone (optional)" class="w-input" style="width:100%;margin-bottom:8px;box-sizing:border-box">' +
      '<select id="oc-crv-gw-state" class="w-input w-select" style="width:100%;margin:0;box-sizing:border-box">' +
        '<option value="">Select your state</option>' +
        '<option value="GA">Georgia</option>' +
      '</select>' +
      '<div id="oc-crv-gw-err" style="display:none;color:#c00;margin-top:8px;font-size:0.9em"></div>' +
    '</div>' +
    '<p style="margin:0 0 10px;font-weight:500">How would you like to continue?</p>' +
    '<div class="oc-crv-type-grid">' +
      '<div class="oc-crv-type-card" id="oc-crv-g-full" data-gw="full">' +
        '<p><strong>Walk me through it</strong></p>' +
        '<p style="font-size:0.9em;opacity:0.8;margin:4px 0 0">Answer a few questions about your current coverage -- takes about 3 minutes.</p>' +
      '</div>' +
      '<div class="oc-crv-type-card" id="oc-crv-g-quick" data-gw="quick">' +
        '<p><strong>Quick upload</strong></p>' +
        '<p style="font-size:0.9em;opacity:0.8;margin:4px 0 0">Just upload your dec page -- we already have your contact details. We\'ll handle the rest.</p>' +
      '</div>' +
    '</div>';
  wrap.insertBefore(el, wrap.firstChild);
  $("oc-crv-g-full").addEventListener("click", onGatewaySelect);
  $("oc-crv-g-quick").addEventListener("click", onGatewaySelect);
}

function injectQuickForm() {
  const wrap = $("oc-crv-wrap");
  if (!wrap || $("oc-crv-pq")) return;
  const el = document.createElement("div");
  el.id = "oc-crv-pq";
  el.style.display = "none";
  el.innerHTML =
    // Contact is collected on the gateway (v3.3.0); these mirror fields stay hidden
    // so onQuickSubmit can read them without change.
    '<div id="oc-crv-pq-contact" style="display:none">' +
      '<div style="display:flex;gap:8px;margin-bottom:8px">' +
        '<input id="oc-crv-qfn" type="text" placeholder="First name" class="w-input" style="flex:1;margin:0">' +
        '<input id="oc-crv-qln" type="text" placeholder="Last name" class="w-input" style="flex:1;margin:0">' +
      '</div>' +
      '<input id="oc-crv-qem" type="email" placeholder="Email address" class="w-input" style="width:100%;margin-bottom:8px;box-sizing:border-box">' +
      '<input id="oc-crv-qph" type="tel" placeholder="Phone (optional)" class="w-input" style="width:100%;margin-bottom:16px;box-sizing:border-box">' +
    '</div>' +
    '<div style="margin-bottom:12px">' +
      '<p style="margin:0 0 6px;font-size:0.9em;font-weight:500">Dec page PDF <span style="opacity:0.6">(optional)</span></p>' +
      '<a id="oc-crv-qdec-trigger" class="oc-crv-btn-ghost w-button" href="#">Upload dec page</a>' +
      '<span id="oc-crv-qfname-dec" style="display:none;margin-left:10px;font-size:0.85em"></span>' +
      '<input id="oc-crv-qfile-dec" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none">' +
    '</div>' +
    '<div style="margin-bottom:20px">' +
      '<p style="margin:0 0 6px;font-size:0.9em;font-weight:500">Full policy PDF <span style="opacity:0.6">(optional)</span></p>' +
      '<a id="oc-crv-qpol-trigger" class="oc-crv-btn-ghost w-button" href="#">Upload policy</a>' +
      '<span id="oc-crv-qfname-pol" style="display:none;margin-left:10px;font-size:0.85em"></span>' +
      '<input id="oc-crv-qfile-pol" type="file" accept=".pdf" style="display:none">' +
    '</div>' +
    '<div id="oc-crv-qerr" style="display:none;color:#c00;margin-bottom:10px;font-size:0.9em"></div>' +
    '<div style="display:flex;gap:10px;align-items:center">' +
      '<a id="oc-crv-qback" class="oc-crv-btn-ghost w-button" href="#" style="white-space:nowrap">← Back</a>' +
      '<button id="oc-crv-qsubmit" class="oc-crv-btn-ghost w-button" style="flex:1">Send for Review</button>' +
    '</div>';
  wrap.appendChild(el);
  $("oc-crv-qdec-trigger").addEventListener("click", function(e) { e.preventDefault(); $("oc-crv-qfile-dec").click(); });
  $("oc-crv-qpol-trigger").addEventListener("click", function(e) { e.preventDefault(); $("oc-crv-qfile-pol").click(); });
  $("oc-crv-qback").addEventListener("click", function(e) { e.preventDefault(); showGateway(true); });
  $("oc-crv-qsubmit").addEventListener("click", onQuickSubmit);
  setupQuickFileUpload("oc-crv-qfile-dec", "oc-crv-qfname-dec", "qDecFileUrl", "qDecFileName", "coverage-review/dec-pages", 10);
  setupQuickFileUpload("oc-crv-qfile-pol", "oc-crv-qfname-pol", "qPolFileUrl", "qPolFileName", "coverage-review/policies", 25);
}

function showGateway(doScroll) {
  STATE.mode = "gateway";
  for (let i = 1; i <= 5; i++) {
    const p = $("oc-crv-p" + i); if (p) p.style.display = "none";
    const s = $("oc-crv-s" + i); if (s) s.style.display = "none";
  }
  const pq = $("oc-crv-pq"); if (pq) pq.style.display = "none";
  const p0 = $("oc-crv-p0"); if (p0) p0.style.display = "";
  const back = $("oc-crv-back"); if (back) back.style.display = "none";
  const next = $("oc-crv-next"); if (next) next.style.display = "none";
  const submit = $("oc-crv-submit"); if (submit) submit.style.display = "none";
  const ht = $("oc-crv-htitle"); if (ht) ht.textContent = "Free Coverage Review";
  const sub = document.querySelector(".oc-crv-card-sub");
  if (sub) sub.textContent = "Choose how you'd like to start -- both paths get you a free review from a licensed advisor.";
  showErr("");
  if (doScroll) {
    const f = $("oc-crv-form-section") || $("oc-crv-wrap");
    window.scrollTo({ top: Math.max(0, f ? f.getBoundingClientRect().top + window.scrollY - 80 : 0), behavior: "smooth" });
  }
}

function showQuickForm() {
  STATE.mode = "quick";
  const p0 = $("oc-crv-p0"); if (p0) p0.style.display = "none";
  for (let i = 1; i <= 5; i++) {
    const p = $("oc-crv-p" + i); if (p) p.style.display = "none";
    const s = $("oc-crv-s" + i); if (s) s.style.display = "none";
  }
  const pq = $("oc-crv-pq"); if (pq) pq.style.display = "";
  const back = $("oc-crv-back"); if (back) back.style.display = "none";
  const next = $("oc-crv-next"); if (next) next.style.display = "none";
  const submit = $("oc-crv-submit"); if (submit) submit.style.display = "none";
  const ht = $("oc-crv-htitle"); if (ht) ht.textContent = "Quick Coverage Upload";
  const sub = document.querySelector(".oc-crv-card-sub");
  if (sub) sub.textContent = "Upload your declarations page (and full policy if you have it). We already have your contact details.";
  showErr("");
}

function gatewayContact() {
  return {
    fn: ((($("oc-crv-gw-fn") || {}).value) || "").trim(),
    ln: ((($("oc-crv-gw-ln") || {}).value) || "").trim(),
    em: ((($("oc-crv-gw-em") || {}).value) || "").trim(),
    ph: ((($("oc-crv-gw-ph") || {}).value) || "").trim(),
    state: ((($("oc-crv-gw-state") || {}).value) || "").trim().toUpperCase()
  };
}

function showGwErr(msg) {
  const e = $("oc-crv-gw-err");
  if (!e) return;
  e.textContent = msg || "";
  e.style.display = msg ? "block" : "none";
}

// Mirror the gateway contact block into both the full-form and quick-form fields
// so the existing payload builders (buildPartialPayload, onQuickSubmit) pick them
// up unchanged. State is written to localStorage + any global state <select>.
function mirrorGatewayContact(c) {
  const set = (id, v) => { const el = $(id); if (el) el.value = v; };
  set("oc-crv-fn", c.fn); set("oc-crv-ln", c.ln); set("oc-crv-em", c.em); set("oc-crv-ph", c.ph);
  set("oc-crv-qfn", c.fn); set("oc-crv-qln", c.ln); set("oc-crv-qem", c.em); set("oc-crv-qph", c.ph);
  try { if (c.state) localStorage.setItem("oc_state", c.state); } catch (e) {}
  const sel = $("oc-state-select"); if (sel && c.state) sel.value = c.state;
}

function onGatewaySelect(e) {
  const card = e.currentTarget;
  const c = gatewayContact();
  if (!c.fn || !c.ln) { showGwErr("Please enter your first and last name."); return; }
  if (!/^\S+@\S+\.\S+$/.test(c.em)) { showGwErr("Please enter a valid email address."); return; }
  if (!c.state) { showGwErr("Please select your state."); return; }
  showGwErr("");
  mirrorGatewayContact(c);
  document.querySelectorAll("#oc-crv-p0 .oc-crv-type-card").forEach(function(x) { x.classList.remove("oc-crv-type-card-active"); });
  card.classList.add("oc-crv-type-card-active");
  const choice = card.dataset.gw;
  if (choice === "full") {
    STATE.mode = "full";
    const p0 = $("oc-crv-p0"); if (p0) p0.style.display = "none";
    // Show step tabs except step 2 (contact already collected on the gateway)
    for (let i = 1; i <= 5; i++) { const s = $("oc-crv-s" + i); if (s) s.style.display = (i === 2) ? "none" : ""; }
    setStep(1, true);
  } else if (choice === "quick") {
    showQuickForm();
  }
}

function setupQuickFileUpload(inputId, labelId, stateUrlKey, stateNameKey, folder, maxMB) {
  const input = $(inputId);
  if (!input) return;
  input.addEventListener("change", async function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const lbl = $(labelId);
    const qerr = $("oc-crv-qerr");
    if (file.size > maxMB * 1024 * 1024) {
      if (qerr) { qerr.textContent = "File too large. Max " + maxMB + " MB."; qerr.style.display = "block"; }
      e.target.value = "";
      return;
    }
    if (lbl) { lbl.textContent = "Uploading..."; lbl.style.display = ""; }
    if (qerr) qerr.style.display = "none";
    try {
      await waitForAuth(4000);
      const sid = getOrCreateSession();
      const safeName = sid + "-" + Date.now() + "-" + file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const r = ref(_fbStorage, folder + "/" + safeName);
      await uploadBytes(r, file, { contentType: file.type });
      STATE[stateUrlKey] = await getDownloadURL(r);
      STATE[stateNameKey] = file.name;
      if (lbl) lbl.textContent = file.name;
    } catch (err) {
      console.error("[oc-crv] quick upload failed:", err);
      if (qerr) { qerr.textContent = "Upload failed. Please try again."; qerr.style.display = "block"; }
      if (lbl) { lbl.textContent = "Upload failed"; }
    }
  });
}

async function onQuickSubmit(e) {
  e.preventDefault();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  const qerr = $("oc-crv-qerr");
  if (qerr) { qerr.style.display = "none"; qerr.textContent = ""; }
  const fn = (($("oc-crv-qfn") || {}).value || "").trim();
  const ln = (($("oc-crv-qln") || {}).value || "").trim();
  const em = (($("oc-crv-qem") || {}).value || "").trim();
  const ph = (($("oc-crv-qph") || {}).value || "").trim();
  if (!fn || !ln) {
    if (qerr) { qerr.textContent = "Please enter your first and last name."; qerr.style.display = "block"; }
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(em)) {
    if (qerr) { qerr.textContent = "Please enter a valid email address."; qerr.style.display = "block"; }
    return;
  }
  const btn = $("oc-crv-qsubmit");
  if (!btn) return;
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = "Sending...";
  let stateVal = "";
  try {
    const sel = document.getElementById("oc-state-select");
    if (sel && sel.value) stateVal = sel.value.toUpperCase().trim();
    if (!stateVal) stateVal = (localStorage.getItem("oc_state") || "").toUpperCase().trim();
  } catch (_e) {}
  try {
    const requestBody = {
      form_type: "coverage-review",
      submission_id: uuidv4Submission(),
      page_url: location.href,
      submitted_at: new Date().toISOString(),
      fields: {
        mode: "quick-upload",
        track: "personal",
        status: "submitted",
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        contact: { firstName: fn, lastName: ln, email: em, phone: ph, state: stateVal },
        decFileUrl: STATE.qDecFileUrl || null,
        decFileName: STATE.qDecFileName || null,
        policyFileUrl: STATE.qPolFileUrl || null,
        policyFileName: STATE.qPolFileName || null,
        utm_source: _utm.utm_source || null,
        utm_medium: _utm.utm_medium || null,
        utm_campaign: _utm.utm_campaign || null,
        gclid: _utm.gclid || null,
        landing_referrer: _landing_referrer,
        session_id: window.OC_SESSION ? window.OC_SESSION.uid() : null,
        userAgent: navigator.userAgent,
        pageUrl: location.href
      }
    };
    const res = await fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json", "X-Forms-Auth": BEARER },
      body: JSON.stringify(requestBody)
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text().catch(function() { return ""; })));
    clearSession();
    const wrap = $("oc-crv-wrap");
    const ok = $("oc-crv-ok");
    if (wrap) wrap.style.display = "none";
    if (ok) ok.style.display = "";
    try { window.scrollTo({ top: (ok ? ok.getBoundingClientRect().top + window.scrollY - 80 : 0), behavior: "smooth" }); } catch (_e2) {}
    try {
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          form_id: "oc-crv-quick",
          form_location: "coverage-review",
          mode: "quick-upload",
          state: stateVal || "unknown",
          value: 5
        });
      }
    } catch (_e3) {}
  } catch (err) {
    console.error("[oc-crv] quick submit failed:", err);
    if (qerr) { qerr.textContent = "Couldn't send right now. Please try again, or email askolive@olivecover.com."; qerr.style.display = "block"; }
    btn.disabled = false;
    btn.textContent = origText || "Send for Review";
  }
}

// ---- Input change listeners (schedule save on text input) -----

function bindInputSave(id) {
  const el = $(id);
  if (el) el.addEventListener("input", scheduleSave);
}

// ---- Field defaults: placeholders and preselected contact prefs

function applyFieldDefaults() {
  const placeholders = {
    "oc-crv-fn": "First name",
    "oc-crv-ln": "Last name",
    "oc-crv-em": "you@example.com",
    "oc-crv-ph": "(555) 123-4567",
    "oc-crv-zp": "ZIP code",
    "oc-crv-yb": "e.g. 2008",
    "oc-crv-year-built": "e.g. 2008",
    "oc-crv-ca": "e.g. State Farm, Allstate",
    "oc-crv-rd": "MM / YYYY",
    "oc-crv-nt": "Anything we should know? (optional)"
  };
  for (const id in placeholders) {
    const el = $(id);
    if (!el) continue;
    if (!el.placeholder || /example text/i.test(el.placeholder)) {
      el.placeholder = placeholders[id];
    }
  }
  // Default contact preferences: Email and Text are pre-selected
  const defaultPrefs = ["email", "text"];
  if (STATE.contactPref.length === 0) {
    STATE.contactPref = defaultPrefs.slice();
    document.querySelectorAll("#oc-crv-contact-pref .oc-crv-chip").forEach((btn) => {
      if (defaultPrefs.includes(btn.dataset.v)) btn.classList.add("oc-crv-chip-on");
    });
  }
}

// ---- Reorder Step 4: docs upload before optional details -------

function reorderStep4() {
  const shared = $("oc-crv-p4-shared");
  if (!shared) return;
  const kids = [...shared.children];
  const detailsHeader = kids.find((c) => c.tagName === "H4" && /current coverage|optional detailed/i.test(c.textContent));
  const docsHeader = kids.find((c) => c.tagName === "H4" && /upload documents/i.test(c.textContent));
  const decArea = $("oc-crv-dec-area");
  const polArea = $("oc-crv-pol-area");
  if (!detailsHeader || !docsHeader || !decArea || !polArea) return;

  // Mark current coverage section as optional in the header itself
  detailsHeader.textContent = "Current coverage (optional)";

  // Find the "Anything else" label (P) and its sibling textarea (oc-crv-nt)
  const noteInput = $("oc-crv-nt");
  let noteLabel = null;
  if (noteInput) {
    let p = noteInput.previousElementSibling;
    while (p && p.tagName !== "P" && p.tagName !== "LABEL") p = p.previousElementSibling;
    noteLabel = p;
  }

  // Move docs section (header + dec area + pol area) to appear BEFORE the details header
  detailsHeader.parentNode.insertBefore(docsHeader, detailsHeader);
  detailsHeader.parentNode.insertBefore(decArea, detailsHeader);
  detailsHeader.parentNode.insertBefore(polArea, detailsHeader);

  // Then place the "Anything else" label + textarea immediately AFTER the doc upload, BEFORE current coverage
  if (noteLabel) detailsHeader.parentNode.insertBefore(noteLabel, detailsHeader);
  if (noteInput) detailsHeader.parentNode.insertBefore(noteInput, detailsHeader);
}

// ---- Init ------------------------------------------------------

function init() {
  // Version guard: always let the newest script win over stale app-registered loaders
  if (window._OC_CRV_VERSION >= 3.30) return;
  window._OC_CRV_VERSION = 3.30;

  // Forcibly reset all step panels to hidden so stale init calls from old scripts
  // cannot leave p4/p5 visible while p1 is also showing
  for (let i = 1; i <= 5; i++) {
    const p = $("oc-crv-p" + i);
    if (p) p.style.display = "none";
  }
  // Hide confirmation panel; it's shown only after successful submit
  const ok = $("oc-crv-ok");
  if (ok) ok.style.display = "none";

  // Track selection
  document.querySelectorAll(".oc-crv-type-card").forEach((c) => c.addEventListener("click", onTrackClick));

  // Contact preference (multi)
  setupMultiChips("#oc-crv-contact-pref", "contactPref");

  // Step 3: coverage lines checkboxes
  document.querySelectorAll('#oc-crv-pl input[type=checkbox], #oc-crv-cl input[type=checkbox]').forEach((ck) => ck.addEventListener("change", onCkChange));

  // Step 4: personal detail chips
  setupSingleChips("#oc-crv-hv", "homeValue");
  setupSingleChips("#oc-crv-vh", "vehicles");
  setupSingleChips("#oc-crv-dv", "drivers");
  setupSingleChips("#oc-crv-cl-claims", "claims");
  setupSingleChips("#oc-crv-cr", "credit");

  // Step 4: commercial detail chips
  setupSingleChips("#oc-crv-bt", "bizType");
  setupSingleChips("#oc-crv-ee", "employees");
  setupSingleChips("#oc-crv-rv", "revenue");
  setupSingleChips("#oc-crv-yib", "yearsInBiz");

  // Step 4: shared chips
  setupSingleChips("#oc-crv-pr", "currentPremium");

  // File uploads
  setupFileUpload("oc-crv-file-dec", "oc-crv-dec-trigger", "oc-crv-fname-dec", "decFileUrl", "decFileName", "coverage-review/dec-pages", 10);
  setupFileUpload("oc-crv-file-pol", "oc-crv-pol-trigger", "oc-crv-fname-pol", "policyFileUrl", "policyFileName", "coverage-review/policies", 25);

  // Step 5: quote comparison
  document.querySelectorAll(".oc-crv-quote-card").forEach((c) => c.addEventListener("click", onQuoteCardClick));
  setupMultiChips("#oc-crv-qi", "quoteImportance");
  setupMultiChips("#oc-crv-fr", "frustrations");
  setupSingleChips("#oc-crv-ct", "connectTiming");

  // Nav buttons
  const back = $("oc-crv-back"); if (back) back.addEventListener("click", onBack);
  const next = $("oc-crv-next"); if (next) next.addEventListener("click", onNext);
  const submit = $("oc-crv-submit"); if (submit) submit.addEventListener("click", onSubmit);

  // Resume banner
  const dismissBtn = $("oc-crv-resume-dismiss"); if (dismissBtn) dismissBtn.addEventListener("click", dismissResume);
  const startOverBtn = $("oc-crv-start-over"); if (startOverBtn) startOverBtn.addEventListener("click", onStartOver);

  // Text field auto-save
  ["oc-crv-fn","oc-crv-ln","oc-crv-em","oc-crv-ph","oc-crv-zp",
   "oc-crv-yb","oc-crv-ca","oc-crv-rd","oc-crv-nt"].forEach(bindInputSave);

  applyFieldDefaults();
  reorderStep4();

  // Hide step tabs until user picks the full-form path from the gateway
  for (let i = 1; i <= 5; i++) { const s = $("oc-crv-s" + i); if (s) s.style.display = "none"; }

  // Inject gateway choice panel (p0) and quick-upload form (pq)
  injectGateway();
  injectQuickForm();

  // Show only Step 3 personal lines until track chosen (hidden by CSS; shown after track selected)
  const pl = $("oc-crv-pl"); if (pl) pl.style.display = "none";
  const cl = $("oc-crv-cl"); if (cl) cl.style.display = "none";
  const qDetail = $("oc-crv-q-detail"); if (qDetail) qDetail.style.display = "none";

  // Try session recovery; if nothing to restore, show the gateway choice screen
  tryRestoreSession();
  if (!STATE.restored) showGateway();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

