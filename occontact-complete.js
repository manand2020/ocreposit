// Olive Cover - Contact form handler v1.6.0
// v1.6.0 (2026-05-23): Two defensive fixes paralleling ochomeleads v1.7.0 pattern.
//   (1) e.stopImmediatePropagation() inside onSubmit blocks Webflow's native
//       forms.js submit listener from firing in parallel. preventDefault alone
//       stops the browser's default form action but not other JS listeners.
//       Without this, every contact submission risks a Webflow no-reply
//       notification email (containing only the phone field) sent to the site
//       owner, mirroring the homepage form noise pattern observed 2026-05-23.
//   (2) Sentinel guard via window.__occontact_v16_init prevents double-init if
//       the script ever gets loaded via multiple paths in the future. ES module
//       dedup works only for identical URLs; if dual loaders pin to different
//       commits the dedup fails and the submit handler binds twice. Defense
//       in depth.
// v1.5.0: Capture full UTM stack (utm_*, gclid, fbclid, msclkid, landing_referrer)
//         into payload. Fire gtag('event','generate_lead') on successful submit
//         for Google Ads conversion-optimized bidding.
// v1.4.0: session_id added to payload (links submission to web_sessions doc).
// Source of truth: github.com/manand2020/ocreposit/occontact-complete.js
// Served via jsdelivr CDN. Bump version query string when updating.
// Writes submissions to Firestore (olive-cover-prod project, submissions DB, contact-submissions collection)
// v1.1.0: fixed getFirestore to use named "submissions" database; added signInAnonymously for auth.
// v1.2.0: await _authReady in onSubmit to eliminate auth/write race condition.
// v1.3.0: _authReady now resolves via onAuthStateChanged (fires after Firestore SDK receives token via
//         onIdTokenChanged) rather than raw signInAnonymously promise (resolves before SDK is notified).

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const fbConfig = {
  apiKey: "AIzaSyB1JuGUbJCkz0he8JnKNbQyRBTwtONZnWM",
  authDomain: "olive-cover-prod.firebaseapp.com",
  projectId: "olive-cover-prod",
  storageBucket: "olive-cover-prod.firebasestorage.app",
  messagingSenderId: "781066018428",
  appId: "1:781066018428:web:535d07b690283027f9f3f9"
};
const APP_NAME = "oc-contact";
const app = getApps().find(a => a.name === APP_NAME) || initializeApp(fbConfig, APP_NAME);
const db = getFirestore(app, "submissions");
const auth = getAuth(app);

// onAuthStateChanged fires after onIdTokenChanged, ensuring Firestore SDK has received the token.
const _authReady = new Promise((resolve) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) { unsub(); resolve(user); }
  });
  signInAnonymously(auth).catch(e => console.warn("[oc-contact] anon auth:", e.code));
});

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

function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

function init() {
  const form = document.getElementById("oc-contact-form-el");
  if (!form) return;

  const wrap = form.closest(".w-form") || form.parentElement;
  if (wrap) wrap.removeAttribute("style");
  form.removeAttribute("style");

  form.setAttribute("action", "/thank-you");
  form.setAttribute("method", "get");

  form.addEventListener("submit", onSubmit);
}

function showInlineError(form, msg) {
  let err = form.querySelector(".oc-contact-err");
  if (!err) {
    err = document.createElement("div");
    err.className = "oc-contact-err";
    err.style.cssText = "color:#b91c1c;background:#fef2f2;border-left:3px solid #b91c1c;padding:10px 14px;margin:10px 0;font-family:Inter,sans-serif;font-size:14px;line-height:1.4;border-radius:4px";
    form.insertBefore(err, form.firstChild);
  }
  err.textContent = msg;
  err.style.display = msg ? "block" : "none";
}

function showDone(form) {
  const wrap = form.closest(".w-form") || form.parentElement;
  if (!wrap) return;
  const done = wrap.querySelector(".w-form-done");
  if (done) done.style.display = "block";
  form.style.display = "none";
}

function showFail(form) {
  const wrap = form.closest(".w-form") || form.parentElement;
  if (!wrap) return;
  const fail = wrap.querySelector(".w-form-fail");
  if (fail) fail.style.display = "block";
}

async function onSubmit(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  const form = e.currentTarget;
  showInlineError(form, "");

  const data = new FormData(form);
  const payload = {
    name: ((data.get("name") || "") + "").trim(),
    email: ((data.get("email") || "") + "").trim(),
    topic: ((data.get("topic") || "") + "").trim(),
    message: ((data.get("message") || "") + "").trim(),
    source: "contact-page",
    page: location.pathname,
    referrer: document.referrer || "",
    landing_referrer: document.referrer || "",
    userAgent: (navigator.userAgent || "").slice(0, 300),
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    status: "new",
    session_id: window.OC_SESSION?.uid() ?? null,
    utm_source: _utm.utm_source || null,
    utm_medium: _utm.utm_medium || null,
    utm_campaign: _utm.utm_campaign || null,
    utm_content: _utm.utm_content || null,
    utm_term: _utm.utm_term || null,
    gclid: _utm.gclid || null,
    fbclid: _utm.fbclid || null,
    msclkid: _utm.msclkid || null
  };

  if (!payload.name) { showInlineError(form, "Please enter your name."); return; }
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) { showInlineError(form, "Please enter a valid email address."); return; }
  if (!payload.topic) { showInlineError(form, "Please choose what you need help with."); return; }

  const btn = form.querySelector('input[type="submit"]');
  const origVal = btn ? btn.value : "";
  const waitText = btn && btn.dataset.wait ? btn.dataset.wait : "Sending...";
  if (btn) { btn.disabled = true; btn.value = waitText; }

  try {
    await _authReady;
    await addDoc(collection(db, "contact-submissions"), payload);
    showDone(form);
    // GA4 conversion event for Google Ads bidding optimization
    try {
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          form_id: "oc-contact-form-el",
          form_location: "contact",
          topic: payload.topic || "unknown",
          value: 1
        });
      }
    } catch (e3) { /* gtag missing */ }
  } catch (err) {
    console.error("[oc-contact] submit failed:", err);
    showFail(form);
    showInlineError(form, "Couldn't send right now. Please try again, or email hello@olivecover.com.");
    if (btn) { btn.disabled = false; btn.value = origVal; }
  }
}

// Sentinel guard: defend against future dual-loader regressions. If the script is loaded
// twice via different fetch paths (page-level inline-site-script + some other loader), the
// second load's init() is a no-op so we never bind the submit handler twice.
if (window.__occontact_v16_init) {
  console.log("[oc-contact] init already registered (sentinel triggered, second load skipped)");
} else {
  window.__occontact_v16_init = true;
  ready(init);
}

