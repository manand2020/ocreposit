// Olive Cover - Homepage Lead Capture v1.3.0
// Handles homepage inline form (oc-lead-*) -> Firestore home-leads.
// Loaded as type="module" by ocnav-complete.js when path === '/'.
// Uses capture-phase listener to prevent Webflow's built-in form handler.

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

function init() {
  const form = document.getElementById("oc-lead-form-el");
  if (!form) return;

  const successEl = document.getElementById("oc-lead-success");
  const errEl = document.getElementById("oc-lead-error");
  const submitBtn = document.getElementById("oc-lead-submit");

  // Capture phase: runs before Webflow's bubble-phase handler, stopImmediatePropagation
  // prevents w-form-loading state from hijacking the UX.
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const name = (document.getElementById("oc-lead-name").value || "").trim();
    const contact = (document.getElementById("oc-lead-contact").value || "").trim();
    const intent = (document.getElementById("oc-lead-intent") ? document.getElementById("oc-lead-intent").value : "") || "";

    if (!name || !contact) {
      if (errEl) { errEl.textContent = "Please enter your name and a way to reach you."; errEl.style.display = "block"; }
      return;
    }
    if (errEl) errEl.style.display = "none";
    if (submitBtn) { submitBtn.value = "Sending..."; submitBtn.disabled = true; }

    try {
      await addDoc(collection(db, "home-leads"), {
        name,
        contact,
        intent: intent.trim() || "not-specified",
        source: "homepage",
        ts: serverTimestamp()
      });
      form.style.display = "none";
      if (successEl) successEl.style.display = "block";
    } catch (err) {
      console.error("[oc-leads] save error:", err);
      if (errEl) { errEl.textContent = "Something went wrong. Please call us at (678) 888-1011."; errEl.style.display = "block"; }
      if (submitBtn) { submitBtn.value = "Ask Olive"; submitBtn.disabled = false; }
    }
  }, true); // true = capture phase
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
