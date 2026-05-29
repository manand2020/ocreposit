// Olive Cover -- Homepage Lead Capture v2.0.0
// Posts to olivec-prod forms Cloud Function (canonical Clip pipeline).
// Replaces v1.7.0 which wrote directly to olive-cover-prod Firestore.
// Source: github.com/manand2020/ocreposit/ochomeleads.js
//
// v2.0.0 (2026-05-28): MIGRATION to canonical olivec-prod stack.
//   Removed direct Firestore write (olive-cover-prod was decommissioned).
//   Submission now POSTs to https://forms-3q26d3khpa-ue.a.run.app/forms/homepage-lead
//   which writes to olivec-prod Firestore, forwards to Clip /internal/forms,
//   Clip creates a CRM Lead and assigns a Paperclip Issue to Lead Triage / Olive.
//   Behavior preserved: name+email+phone+intent capture, UTM stack, state from
//   oc_state localStorage, GA4 generate_lead conversion, sentinel double-init
//   guard, stopImmediatePropagation against Webflow forms.js noise.

const ENDPOINT = "https://forms-3q26d3khpa-ue.a.run.app/forms/homepage-lead";
const BEARER = "fLnkE70cjSKztJ2VGnThheVSFwuW16WepOCxcSrDeHY=";

function captureUTM() {
  const fields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "msclkid"];
  const params = new URLSearchParams(location.search);
  const captured = {};
  let hasAny = false;
  fields.forEach(function (f) {
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

function uuidv4() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function init() {
  const form = document.getElementById("oc-lead-form-el");
  if (!form) return;

  const successEl = document.getElementById("oc-lead-success");
  const errEl = document.getElementById("oc-lead-error");
  const submitBtn = document.getElementById("oc-lead-submit");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

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
    submitBtn.value = "Sending...";
    submitBtn.disabled = true;

    const submissionId = uuidv4();
    const payload = {
      form_type: "homepage-lead",
      submission_id: submissionId,
      page_url: location.href,
      submitted_at: new Date().toISOString(),
      fields: {
        name,
        email,
        phone,
        intent: intent || "not-specified",
        state,
        source: "homepage",
        session_id: window.OC_SESSION?.uid() ?? null,
        utm_source: _utm.utm_source || null,
        utm_medium: _utm.utm_medium || null,
        utm_campaign: _utm.utm_campaign || null,
        utm_content: _utm.utm_content || null,
        utm_term: _utm.utm_term || null,
        gclid: _utm.gclid || null,
        fbclid: _utm.fbclid || null,
        msclkid: _utm.msclkid || null,
        landing_referrer: _landing_referrer,
      },
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-Forms-Auth": BEARER,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("HTTP " + res.status + " " + (await res.text().catch(() => "")));
      }
      form.style.display = "none";
      if (successEl) successEl.style.display = "block";
      try {
        if (window.gtag) {
          window.gtag("event", "generate_lead", {
            form_id: "oc-lead-form-el",
            form_location: "homepage",
            state: state || "unknown",
            value: 1,
          });
        }
      } catch (e) {}
    } catch (err) {
      console.error("[oc-leads] submit failed:", err);
      errEl.textContent = "Something went wrong. Please call us at (678) 888-1011.";
      errEl.style.display = "block";
      submitBtn.value = "Ask Olive";
      submitBtn.disabled = false;
    }
  });
}

if (window.__ochomeleads_v2_init) {
  console.log("[oc-leads] init already registered (sentinel triggered, second load skipped)");
} else {
  window.__ochomeleads_v2_init = true;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
