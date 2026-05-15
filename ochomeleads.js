// Olive Cover - Homepage Lead Capture + Widget v1.2.0
// Handles: homepage inline form (oc-lead-*) + floating widget form (oc-wgt-*)
// Source: github.com/manand2020/ocreposit/ochomeleads.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const FB_CONFIG = {
  apiKey: "AIzaSyB1JuGUbJCkz0he8JnKNbQyRBTwtONZnWM",
  authDomain: "olive-cover-prod.firebaseapp.com",
  projectId: "olive-cover-prod",
  storageBucket: "olive-cover-prod.firebasestorage.app",
  messagingSenderId: "781066018428",
  appId: "1:781066018428:web:535d07b690283027f9f3f9"
};

const APP_NAME = "oc-home-leads";
const app = getApps().find(a => a.name === APP_NAME) || initializeApp(FB_CONFIG, APP_NAME);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth).catch(e => console.warn("[oc-leads] auth:", e.code));

function wireForm({ formId, nameId, contactId, intentId, submitId, successId, errId, source }) {
  const form = document.getElementById(formId);
  if (!form) return;
  const successEl = document.getElementById(successId);
  const errEl = document.getElementById(errId);
  const submitBtn = document.getElementById(submitId);

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const name = (document.getElementById(nameId).value || "").trim();
    const contact = (document.getElementById(contactId).value || "").trim();
    const intent = (document.getElementById(intentId).value || "").trim();

    if (!name || !contact) {
      if (errEl) { errEl.textContent = "Please enter your name and a way to reach you."; errEl.style.display = "block"; }
      return;
    }
    if (errEl) errEl.style.display = "none";
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      await addDoc(collection(db, "home-leads"), {
        name,
        contact,
        intent: intent || "not-specified",
        source,
        ts: serverTimestamp()
      });
      form.style.display = "none";
      if (successEl) successEl.style.display = "block";
    } catch (err) {
      console.error("[oc-leads] save error:", err);
      if (errEl) { errEl.textContent = "Something went wrong. Please call us at (678) 888-1011."; errEl.style.display = "block"; }
      submitBtn.textContent = "Ask Olive";
      submitBtn.disabled = false;
    }
  });
}

function init() {
  // Homepage inline form
  wireForm({ formId: "oc-lead-form-el", nameId: "oc-lead-name", contactId: "oc-lead-contact", intentId: "oc-lead-intent", submitId: "oc-lead-submit", successId: "oc-lead-success", errId: "oc-lead-error", source: "homepage" });
  // Floating widget form
  wireForm({ formId: "oc-wgt-form", nameId: "oc-wgt-name", contactId: "oc-wgt-contact", intentId: "oc-wgt-intent", submitId: "oc-wgt-submit", successId: "oc-wgt-success", errId: "oc-wgt-error", source: "widget" });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}