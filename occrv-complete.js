// Olive Cover - Coverage Review form behavior
// Source of truth: github.com/manand2020/ocreposit/coverage-review/occoverage-review.js
// Served via jsdelivr CDN. Bump version query string when updating.
// No inline event handlers in markup. All click/change handlers wired via addEventListener here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

const STATE = { step: 1, type: null, focus: [] };
const $ = (id) => document.getElementById(id);
const showErr = (msg) => {
  const e = $("oc-crv-err");
  if (!e) return;
  e.textContent = msg || "";
  e.style.display = msg ? "block" : "none";
};

function setStep(n) {
  STATE.step = n;
  [["oc-crv-p1", 1], ["oc-crv-p2", 2], ["oc-crv-p3", 3]].forEach(([id, i]) => {
    const el = $(id);
    if (el) el.style.display = (i === n) ? "" : "none";
  });
  [["oc-crv-s1", 1], ["oc-crv-s2", 2], ["oc-crv-s3", 3]].forEach(([id, i]) => {
    const el = $(id);
    if (!el) return;
    if (i === n) el.classList.add("oc-crv-step-active");
    else el.classList.remove("oc-crv-step-active");
  });
  const titles = ["Start with your contact info", "Tell us about your coverage", "What should we focus on?"];
  const subs = ["No spam. Straight answer within 1 business day.", "Pick the lines that apply.", "Help us prioritize the review."];
  if ($("oc-crv-htitle")) $("oc-crv-htitle").textContent = titles[n - 1];
  const sub = document.querySelector(".oc-crv-card-sub");
  if (sub) sub.textContent = subs[n - 1];
  const back = $("oc-crv-back");
  const next = $("oc-crv-next");
  const submit = $("oc-crv-submit");
  if (back) back.style.display = n > 1 ? "" : "none";
  if (next) next.style.display = n < 3 ? "" : "none";
  if (submit) submit.style.display = n === 3 ? "" : "none";
  showErr("");
}

function onTypeClick(e) {
  const card = e.currentTarget;
  document.querySelectorAll(".oc-crv-type-card").forEach((c) => c.classList.remove("oc-crv-type-card-active"));
  card.classList.add("oc-crv-type-card-active");
  STATE.type = card.dataset.t;
  const pl = $("oc-crv-pl");
  const cl = $("oc-crv-cl");
  if (pl) pl.style.display = STATE.type === "personal" ? "" : "none";
  if (cl) cl.style.display = STATE.type === "commercial" ? "" : "none";
}

function onChipClick(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const on = btn.classList.toggle("oc-crv-chip-on");
  const v = btn.dataset.v;
  if (!v) return;
  if (on) { if (!STATE.focus.includes(v)) STATE.focus.push(v); }
  else { STATE.focus = STATE.focus.filter((x) => x !== v); }
}

function onBack(e) { e.preventDefault(); if (STATE.step > 1) setStep(STATE.step - 1); }

function onNext(e) {
  e.preventDefault();
  if (STATE.step === 1) {
    const fn = ($("oc-crv-fn") || {}).value || "";
    const ln = ($("oc-crv-ln") || {}).value || "";
    const em = ($("oc-crv-em") || {}).value || "";
    if (!fn.trim() || !ln.trim()) return showErr("Please enter your first and last name.");
    if (!/^\S+@\S+\.\S+$/.test(em.trim())) return showErr("Please enter a valid email.");
    if (!STATE.type) return showErr("Please pick personal or commercial.");
    setStep(2);
  } else if (STATE.step === 2) {
    const sel = STATE.type === "personal" ? "#oc-crv-pl input[type=checkbox]:checked" : "#oc-crv-cl input[type=checkbox]:checked";
    const checked = document.querySelectorAll(sel);
    if (!checked.length) return showErr("Pick at least one coverage line.");
    setStep(3);
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const btn = $("oc-crv-submit");
  if (!btn) return;
  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = "Sending...";
  showErr("");
  try {
    const personalLines = Array.from(document.querySelectorAll("#oc-crv-pl input[type=checkbox]:checked")).map((c) => c.value);
    const commercialLines = Array.from(document.querySelectorAll("#oc-crv-cl input[type=checkbox]:checked")).map((c) => c.value);
    const v = (id) => { const el = $(id); return el ? (el.value || "").trim() : ""; };
    const payload = {
      contact: { firstName: v("oc-crv-fn"), lastName: v("oc-crv-ln"), email: v("oc-crv-em"), phone: v("oc-crv-ph"), zip: v("oc-crv-zp") },
      coverageType: STATE.type,
      personalLines: personalLines,
      commercialLines: commercialLines,
      homeValue: v("oc-crv-hv"),
      yearBuilt: v("oc-crv-yb"),
      vehicles: v("oc-crv-vh"),
      drivers: v("oc-crv-dv"),
      businessType: v("oc-crv-bt"),
      employees: v("oc-crv-ee"),
      revenue: v("oc-crv-rv"),
      focus: STATE.focus.slice(),
      currentCarrier: v("oc-crv-ca"),
      annualPremium: v("oc-crv-pr"),
      renewalDate: v("oc-crv-rd"),
      notes: v("oc-crv-nt"),
      decFileUrl: null,
      decFileName: null,
      userAgent: navigator.userAgent,
      pageUrl: location.href,
      createdAt: serverTimestamp()
    };
    const fileInput = $("oc-crv-file");
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) throw new Error("File too large. Max 10MB.");
      const safeName = (Date.now() + "-" + file.name).replace(/[^A-Za-z0-9._-]/g, "_");
      const r = ref(storage, "coverage-reviews/" + safeName);
      await uploadBytes(r, file, { contentType: file.type });
      payload.decFileUrl = await getDownloadURL(r);
      payload.decFileName = file.name;
    }
    await addDoc(collection(db, "coverage-reviews"), payload);
    const wrap = $("oc-crv-wrap");
    const ok = $("oc-crv-ok");
    if (wrap) wrap.style.display = "none";
    if (ok) ok.style.display = "";
    try { window.scrollTo({ top: ok.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); } catch (e2) {}
  } catch (err) {
    console.error("[oc-crv] submit failed:", err);
    showErr("Couldn't send right now. Please try again, or email mahesh@olivecover.com.");
    btn.disabled = false;
    btn.textContent = origText || "Send for Review";
  }
}

function onFileChange(e) {
  const file = e.target.files && e.target.files[0];
  const lbl = $("oc-crv-fname");
  if (file && lbl) { lbl.textContent = file.name; lbl.style.display = ""; }
}

function init() {
  document.querySelectorAll(".oc-crv-type-card").forEach((c) => c.addEventListener("click", onTypeClick));
  document.querySelectorAll(".oc-crv-chip").forEach((c) => c.addEventListener("click", onChipClick));
  const back = $("oc-crv-back"); if (back) back.addEventListener("click", onBack);
  const next = $("oc-crv-next"); if (next) next.addEventListener("click", onNext);
  const submit = $("oc-crv-submit"); if (submit) submit.addEventListener("click", onSubmit);
  const file = $("oc-crv-file"); if (file) file.addEventListener("change", onFileChange);
  setStep(1);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
