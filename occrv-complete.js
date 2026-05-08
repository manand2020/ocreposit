// Olive Cover - Coverage Review form behavior v2.0
// 5-step intake with personal/commercial tracks, auto-save, session recovery
// Source of truth: github.com/manand2020/ocreposit/coverage-review/occrv-complete.js
// Served via jsdelivr CDN. Bump version query string when updating.
// No inline event handlers in markup. All handlers wired via addEventListener in init().

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const fbConfig = {
  apiKey: "AIzaSyC5120ZI3hnX1t8o8myErM8Ez7tjJ-kvtc",
  authDomain: "olivecover-web.firebaseapp.com",
  projectId: "olivecover-web",
  storageBucket: "olivecover-web.firebasestorage.app",
  messagingSenderId: "122726346450",
  appId: "1:122726346450:web:9d455ee22e14bf8407070b"
};
const app = initializeApp(fbConfig);
const db = getFirestore(app);
const storage = getStorage(app);

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

function setStep(n) {
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
  if (back) back.style.display = n > 1 ? "" : "none";
  if (next) next.style.display = n < 5 ? "" : "none";
  if (submit) submit.style.display = n === 5 ? "" : "none";
  showErr("");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
      const sid = getOrCreateSession();
      const safeName = sid + "-" + Date.now() + "-" + file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const r = ref(storage, folder + "/" + safeName);
      await uploadBytes(r, file, { contentType: file.type });
      STATE[stateUrlKey] = await getDownloadURL(r);
      STATE[stateNameKey] = file.name;
      if (lbl) lbl.textContent = file.name;
      scheduleSave();
    } catch (err) {
      console.error("[oc-crv] file upload failed:", err);
      showErr("File upload failed. Please try again.");
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
    if (!fn.trim() || !ln.trim()) { showErr("Please enter your first and last name."); return false; }
    if (!/^\S+@\S+\.\S+$/.test(em.trim())) { showErr("Please enter a valid email address."); return false; }
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

function onBack(e) { e.preventDefault(); if (STATE.step > 1) setStep(STATE.step - 1); }
function onNext(e) {
  e.preventDefault();
  if (!validateStep(STATE.step)) return;
  setStep(STATE.step + 1);
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

async function onStartOver(e) {
  e.preventDefault();
  try {
    const sid = localStorage.getItem(SID_KEY);
    if (sid) await setDoc(doc(db, "coverage-reviews", sid), { status: "cleared", clearedAt: serverTimestamp() }, { merge: true });
  } catch (err) { console.warn("[oc-crv] clear session failed:", err); }
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
  return {
    step: STATE.step,
    track: STATE.track,
    contactPref: STATE.contactPref.slice(),
    contact: {
      firstName: v("oc-crv-fn"),
      lastName: v("oc-crv-ln"),
      email: v("oc-crv-em"),
      phone: v("oc-crv-ph"),
      zip: v("oc-crv-zp")
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
    pageUrl: location.href,
    userAgent: navigator.userAgent,
    savedAt: serverTimestamp()
  };
}

async function saveSession() {
  if (STATE.saving) return;
  STATE.saving = true;
  try {
    const sid = getOrCreateSession();
    await setDoc(doc(db, "coverage-reviews", sid), buildPartialPayload(), { merge: true });
  } catch (err) { console.warn("[oc-crv] auto-save failed:", err); }
  finally { STATE.saving = false; }
}

// ---- Session recovery on load ---------------------------------

async function tryRestoreSession() {
  const sid = localStorage.getItem(SID_KEY);
  if (!sid) return;
  try {
    const snap = await getDoc(doc(db, "coverage-reviews", sid));
    if (!snap.exists()) return;
    const d = snap.data();
    if (!d || d.status !== "in_progress") return;
    // Restore contact fields
    const set = (id, val) => { const el = $(id); if (el && val) el.value = val; };
    set("oc-crv-fn", d.contact && d.contact.firstName);
    set("oc-crv-ln", d.contact && d.contact.lastName);
    set("oc-crv-em", d.contact && d.contact.email);
    set("oc-crv-ph", d.contact && d.contact.phone);
    set("oc-crv-zp", d.contact && d.contact.zip);
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
    // Jump back to their last step
    if (startStep > 1) setStep(startStep);
  } catch (err) { console.warn("[oc-crv] session restore failed:", err); }
}

// ---- Submit (Step 5) ------------------------------------------

async function onSubmit(e) {
  e.preventDefault();
  if (!STATE.wantsQuotes) { showErr("Please select yes or no for the carrier comparison."); return; }
  const btn = $("oc-crv-submit");
  if (!btn) return;
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = "Sending...";
  showErr("");
  try {
    const sid = getOrCreateSession();
    const v = (id) => { const el = $(id); return el ? (el.value || "").trim() : ""; };
    const checks = (sel) => Array.from(document.querySelectorAll(sel + ":checked")).map((c) => c.value);
    const payload = Object.assign(buildPartialPayload(), {
      status: "submitted",
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    delete payload.savedAt;
    await setDoc(doc(db, "coverage-reviews", sid), payload, { merge: true });
    clearSession();
    const wrap = $("oc-crv-wrap");
    const ok = $("oc-crv-ok");
    if (wrap) wrap.style.display = "none";
    if (ok) ok.style.display = "";
    try { window.scrollTo({ top: (ok ? ok.getBoundingClientRect().top + window.scrollY - 80 : 0), behavior: "smooth" }); } catch (e2) {}
  } catch (err) {
    console.error("[oc-crv] submit failed:", err);
    showErr("Couldn't send right now. Please try again, or email mahesh@olivecover.com.");
    btn.disabled = false;
    btn.textContent = origText || "Send for Review";
  }
}

// ---- Input change listeners (schedule save on text input) -----

function bindInputSave(id) {
  const el = $(id);
  if (el) el.addEventListener("input", scheduleSave);
}

// ---- Init ------------------------------------------------------

function init() {
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
  setupFileUpload("oc-crv-file-dec", "oc-crv-dec-trigger", "oc-crv-fname-dec", "decFileUrl", "decFileName", "coverage-reviews/dec-pages", 10);
  setupFileUpload("oc-crv-file-pol", "oc-crv-pol-trigger", "oc-crv-fname-pol", "policyFileUrl", "policyFileName", "coverage-reviews/policies", 25);

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

  // Initial step
  setStep(1);

  // Show only Step 3 personal lines until track chosen (hidden by CSS; shown after track selected)
  const pl = $("oc-crv-pl"); if (pl) pl.style.display = "none";
  const cl = $("oc-crv-cl"); if (cl) cl.style.display = "none";
  const qDetail = $("oc-crv-q-detail"); if (qDetail) qDetail.style.display = "none";

  // Try session recovery
  tryRestoreSession();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
