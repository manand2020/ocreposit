// Olive Cover - Homepage Lead Capture v1.5.0
// Quick intake form: name + email + phone + intent -> Firestore home-leads collection (submissions DB)
// Source: github.com/manand2020/ocreposit/ochomeleads.js
// Loaded as ES module via IIFE registered script on homepage footer.
// v1.5.0: Parity with widget v2.8.0 - email + phone are separate required fields,
//         state captured silently from oc_state cookie. Backward-compatible with
//         the legacy single-contact field name.
// v1.4.0: onAuthStateChanged _authReady pattern (eliminates auth/Firestore SDK race).

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getFirestore(app, "submissions");
const auth = getAuth(app);

const _authReady = new Promise((resolve) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) { unsub(); resolve(user); }
  });
  signInAnonymously(auth).catch(e => console.warn("[oc-leads] auth:", e.code));
});

function init() {
  const form = document.getElementById("oc-lead-form-el");
  if (!form) return;

  const successEl = document.getElementById("oc-lead-success");
  const errEl = document.getElementById("oc-lead-error");
  const submitBtn = document.getElementById("oc-lead-submit");

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = (document.getElementById("oc-lead-name").value || "").trim();
    const emailEl = document.getElementById("oc-lead-email") || document.getElementById("oc-lead-contact");
    const email = (emailEl ? emailEl.value : "").trim();
    const phoneEl = document.getElementById("oc-lead-phone");
    const phone = (phoneEl ? phoneEl.value : "").trim();
    const intent = (document.getElementById("oc-lead-intent").value || "").trim();

    let state = "";
    try { state = (localStorage.getItem("oc_state") || "").toUpperCase().trim(); } catch (e) {}

    if (!name || !email || !phone) {
      errEl.textContent = "Please enter your name, email, and phone.";
      errEl.style.display = "block";
      return;
    }
    if (email.indexOf("@") < 0) {
      errEl.textContent = "Please enter a valid email address.";
      errEl.style.display = "block";
      return;
    }
    errEl.style.display = "none";
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      await _authReady;
      await addDoc(collection(db, "home-leads"), {
        name,
        email,
        phone,
        contact: email,
        intent: intent || "not-specified",
        state,
        source: "homepage",
        session_id: window.OC_SESSION?.uid() ?? null,
        ts: serverTimestamp()
      });
      form.style.display = "none";
      if (successEl) successEl.style.display = "block";
    } catch (err) {
      console.error("[oc-leads] save error:", err);
      errEl.textContent = "Something went wrong. Please call us at (678) 888-1011.";
      errEl.style.display = "block";
      submitBtn.textContent = "Ask Olive";
      submitBtn.disabled = false;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
