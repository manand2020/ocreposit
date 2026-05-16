// OC Web Session Tracker v1.1.0 -- site-wide tracking for olivecover.com
// v1.1.0: Migrated from olivecover-web to olive-cover-prod project per Mahesh 2026-05-16.
//         Web sessions now write to olive-cover-prod default DB. OC Tech Functions
//         (CRM sync, linkWebSession) must be updated to read from olive-cover-prod
//         instead of olivecover-web. Coordinate before deploy.
// Auto-loaded via Webflow footer IIFE. Source: manand2020/ocreposit/octracker.js
  import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import { getFirestore, doc, setDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const FB_CONFIG = {
    apiKey: "AIzaSyB1JuGUbJCkz0he8JnKNbQyRBTwtONZnWM",
    authDomain: "olive-cover-prod.firebaseapp.com",
    projectId: "olive-cover-prod",
    storageBucket: "olive-cover-prod.firebasestorage.app",
    messagingSenderId: "781066018428",
    appId: "1:781066018428:web:535d07b690283027f9f3f9"
  };

  // ── Page category (mirrors HIGH_VALUE_PATHS in Firebase Functions) ──────────
  const CATEGORIES = [
    { re: /coverage.?review/i, cat: "coverage_review" },
    { re: /flood/i,            cat: "flood" },
    { re: /quote/i,            cat: "quote" },
    { re: /home.?insurance/i,  cat: "home" },
    { re: /auto.?insurance/i,  cat: "auto" },
    { re: /contact/i,          cat: "contact" },
    { re: /about/i,            cat: "about" },
    { re: /blog/i,             cat: "blog" },
  ];

  function pageCategory(url, title) {
    const s = url + " " + (title || "");
    for (const { re, cat } of CATEGORIES) if (re.test(s)) return cat;
    return "general";
  }

  function entrySource() {
    const ref = document.referrer;
    const params = new URLSearchParams(location.search);
    if (params.get("utm_source")) return params.get("utm_source");
    if (!ref) return "direct";
    try {
      const host = new URL(ref).hostname;
      if (/google|bing|yahoo|duckduckgo/i.test(host)) return "search";
      if (/facebook|instagram|linkedin|twitter/i.test(host)) return "social";
      if (host && host !== location.hostname) return "referral";
    } catch { /* ignore */ }
    return "direct";
  }

  // ── Session rotation: 30 min inactivity ────────────────────────────────────
  const SESSION_KEY = "oc_sid";      // stores {uid, ts} JSON
  const PREV_KEY    = "oc_prev_uid";
  const PAGE_KEY    = "oc_page";     // {url, title, cat, t0} of current page
  const INACTIVITY  = 30 * 60 * 1000;

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
  }
  function saveSession(uid) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ uid, ts: Date.now() }));
  }
  function isSessionFresh(s) {
    return s && s.uid && (Date.now() - (s.ts || 0)) < INACTIVITY;
  }
  function touchSession(uid) {
    saveSession(uid);
  }

  function prevPage() {
    try { return JSON.parse(localStorage.getItem(PAGE_KEY) || "null"); } catch { return null; }
  }
  function savePage(url, title, cat) {
    localStorage.setItem(PAGE_KEY, JSON.stringify({ url, title, cat, t0: Date.now() }));
  }
  function clearPage() { localStorage.removeItem(PAGE_KEY); }

  // ── 90-day TTL for anonymous sessions ──────────────────────────────────────
  function expiresAt90d() {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return Timestamp.fromDate(d);
  }

  // ── Core state ──────────────────────────────────────────────────────────────
  let _uid = null;
  let _db  = null;
  let _pageEntered = Date.now();
  let _scrollFired = false;

  // Expose to form scripts
  window.OC_SESSION = { uid: () => _uid };

  // ── Init ────────────────────────────────────────────────────────────────────
  // Use named app to avoid conflicts with other Firebase instances on the page
  // (form scripts use named apps for olive-cover-prod; getApp() would fail if
  //  no default app exists yet, which is the case with named-app-only contexts).
  const TRACKER_APP_NAME = "oc-tracker";
  const app = getApps().find(a => a.name === TRACKER_APP_NAME) || initializeApp(FB_CONFIG, TRACKER_APP_NAME);
  const auth = getAuth(app);
  _db = getFirestore(app);

  async function startSession(user) {
    _uid = user.uid;
    saveSession(_uid);

    const prev = prevPage();
    const existing = loadSession();
    const isNew = !existing || !isSessionFresh(existing) || existing.uid !== _uid;

    const url   = location.href;
    const title = document.title;
    const cat   = pageCategory(url, title);

    // Flush previous page's time if we have it (carry-over from last page load)
    const prevP = prevPage();
    const flushedPage = prevP
      ? { url: prevP.url, title: prevP.title, category: prevP.cat, seconds: Math.round((Date.now() - prevP.t0) / 1000), enteredAt: Timestamp.fromMillis(prevP.t0) }
      : null;

    savePage(url, title, cat);
    _pageEntered = Date.now();
    _scrollFired = false;

    const currentPage = { url, title, category: cat, seconds: 0, enteredAt: serverTimestamp() };

    const prevUid = localStorage.getItem(PREV_KEY);
    const isReturn = !!prevUid && prevUid !== _uid;

    if (isNew) {
      // New session doc
      localStorage.setItem(PREV_KEY, _uid);
      const base = {
        sessionStart: serverTimestamp(),
        lastActivity: serverTimestamp(),
        entrySource: entrySource(),
        entryUrl: url,
        pages: flushedPage ? [flushedPage, currentPage] : [currentPage],
        durationSeconds: 0,
        triggerActions: isReturn ? ["return_visitor"] : [],
        prevSessionId: prevUid || null,
        identified: false,
        parentType: null,
        parentId: null,
        identifiedMethod: null,
        crmUpdated: false,
        expiresAt: expiresAt90d(),
      };
      await setDoc(doc(_db, "web_sessions", _uid), base);
    } else {
      // Resume: append page visit and flush previous page's seconds
      const updates = {
        lastActivity: serverTimestamp(),
        pages: arrayUnion(currentPage),
      };
      if (flushedPage) updates.pages = arrayUnion(flushedPage, currentPage);
      await updateDoc(doc(_db, "web_sessions", _uid), updates).catch(() =>
        setDoc(doc(_db, "web_sessions", _uid), {
          sessionStart: serverTimestamp(),
          lastActivity: serverTimestamp(),
          entrySource: entrySource(),
          entryUrl: url,
          pages: [currentPage],
          durationSeconds: 0,
          triggerActions: [],
          prevSessionId: prevUid || null,
          identified: false,
          parentType: null,
          parentId: null,
          identifiedMethod: null,
          crmUpdated: false,
          expiresAt: expiresAt90d(),
        })
      );
    }

    // Fire page-category trigger actions
    if (cat !== "general" && cat !== "about" && cat !== "blog") {
      await addTrigger(`${cat}_page_visited`);
    }
    if (isReturn) await addTrigger("return_visitor");
  }

  async function addTrigger(action) {
    if (!_uid || !_db) return;
    try {
      await updateDoc(doc(_db, "web_sessions", _uid), {
        triggerActions: arrayUnion(action),
        lastActivity: serverTimestamp(),
      });
    } catch { /* best-effort */ }
  }

  async function flushDuration() {
    if (!_uid || !_db) return;
    const elapsed = Math.round((Date.now() - _pageEntered) / 1000);
    touchSession(_uid);
    try {
      await updateDoc(doc(_db, "web_sessions", _uid), {
        durationSeconds: elapsed, // overwrite; Functions sum across sessions via visitCount
        lastActivity: serverTimestamp(),
      });
    } catch { /* best-effort */ }
  }

  // ── Scroll depth trigger ────────────────────────────────────────────────────
  function onScroll() {
    if (_scrollFired) return;
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    if (total > 0 && scrolled / total >= 0.75) {
      _scrollFired = true;
      const cat = pageCategory(location.href, document.title);
      addTrigger(`deep_scroll_${cat}`);
    }
  }

  // ── Coverage review form open trigger ──────────────────────────────────────
  function watchCoverageForm() {
    // The coverage-review form wrapper has id="oc-crv-wrap"
    const wrap = document.getElementById("oc-crv-wrap");
    if (!wrap) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        addTrigger("coverage_review_started");
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(wrap);
  }

  // ── Page visibility / unload — flush current page duration ─────────────────
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushDuration();
  });
  window.addEventListener("pagehide", flushDuration, { capture: true });

  // ── Auth + boot ─────────────────────────────────────────────────────────────
  const cached = loadSession();
  if (isSessionFresh(cached)) {
    // Silently sign in with existing anonymous user via persistence
    onAuthStateChanged(auth, (user) => {
      if (user && user.uid === cached.uid) {
        startSession(user);
      } else {
        signInAnonymously(auth).then((cred) => startSession(cred.user)).catch(console.error);
      }
    });
  } else {
    signInAnonymously(auth).then((cred) => startSession(cred.user)).catch(console.error);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchCoverageForm);
  else watchCoverageForm();
