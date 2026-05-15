// Olive Cover - Contact form handler v1.3.0
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
    userAgent: (navigator.userAgent || "").slice(0, 300),
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    status: "new"
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
  } catch (err) {
    console.error("[oc-contact] submit failed:", err);
    showFail(form);
    showInlineError(form, "Couldn't send right now. Please try again, or email hello@olivecover.com.");
    if (btn) { btn.disabled = false; btn.value = origVal; }
  }
}

ready(init);
