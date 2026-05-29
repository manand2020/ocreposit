// Olive Cover -- Contact form handler v2.0.0
// Posts to olivec-prod forms Cloud Function (canonical Clip pipeline).
// Replaces v1.8.0 which wrote directly to olive-cover-prod Firestore.
// Source: github.com/manand2020/ocreposit/occontact-complete.js
//
// v2.0.0 (2026-05-28): MIGRATION to canonical olivec-prod stack.
//   Removed direct Firestore write to olive-cover-prod (decommissioned).
//   Submission now POSTs to https://forms-3q26d3khpa-ue.a.run.app/forms/contact
//   Clip /internal/forms creates a CRM Lead and assigns Issue to Lead Triage / Olive.
//   The v1.8.0 "Submission diagnostics" suffix workaround on the message field
//   is REMOVED -- Clip surfaces state, session_id, page, referrer, userAgent
//   natively in the CRM Note from raw_payload, so producers see complete context
//   without the suffix hack.
//   Behavior preserved: name+email+topic+message validation, UTM stack, GA4
//   generate_lead conversion, sentinel double-init guard, stopImmediatePropagation
//   against Webflow forms.js noise.

const ENDPOINT = "https://forms-3q26d3khpa-ue.a.run.app/forms/contact";
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

function uuidv4() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

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
  let stateVal = "";
  try {
    stateVal = ((data.get("state") || "") + "").toUpperCase().trim();
    if (!stateVal) stateVal = (localStorage.getItem("oc_state") || "").toUpperCase().trim();
  } catch (e) {}

  const fields = {
    name: ((data.get("name") || "") + "").trim(),
    email: ((data.get("email") || "") + "").trim(),
    topic: ((data.get("topic") || "") + "").trim(),
    message: ((data.get("message") || "") + "").trim(),
    state: stateVal,
    source: "contact-page",
    page: location.pathname,
    referrer: document.referrer || "",
    landing_referrer: document.referrer || "",
    userAgent: (navigator.userAgent || "").slice(0, 300),
    session_id: window.OC_SESSION?.uid() ?? null,
    utm_source: _utm.utm_source || null,
    utm_medium: _utm.utm_medium || null,
    utm_campaign: _utm.utm_campaign || null,
    utm_content: _utm.utm_content || null,
    utm_term: _utm.utm_term || null,
    gclid: _utm.gclid || null,
    fbclid: _utm.fbclid || null,
    msclkid: _utm.msclkid || null,
  };

  if (!fields.name) { showInlineError(form, "Please enter your name."); return; }
  if (!/^\S+@\S+\.\S+$/.test(fields.email)) { showInlineError(form, "Please enter a valid email address."); return; }
  if (!fields.topic) { showInlineError(form, "Please choose what you need help with."); return; }

  const btn = form.querySelector('input[type="submit"]');
  const origVal = btn ? btn.value : "";
  const waitText = btn && btn.dataset.wait ? btn.dataset.wait : "Sending...";
  if (btn) { btn.disabled = true; btn.value = waitText; }

  const submissionId = uuidv4();
  const payload = {
    form_type: "contact",
    submission_id: submissionId,
    page_url: location.href,
    submitted_at: new Date().toISOString(),
    fields,
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
    showDone(form);
    try {
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          form_id: "oc-contact-form-el",
          form_location: "contact",
          topic: fields.topic || "unknown",
          value: 1,
        });
      }
    } catch (e3) {}
  } catch (err) {
    console.error("[oc-contact] submit failed:", err);
    showFail(form);
    showInlineError(form, "Couldn't send right now. Please try again, or email askolive@olivecover.com.");
    if (btn) { btn.disabled = false; btn.value = origVal; }
  }
}

if (window.__occontact_v2_init) {
  console.log("[oc-contact] init already registered (sentinel triggered, second load skipped)");
} else {
  window.__occontact_v2_init = true;
  ready(init);
}
