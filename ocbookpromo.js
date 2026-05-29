// ocbookpromo.js v1.0.2 -- Book a call discoverability + GA4 conversion tracking.
//
// Three concerns in one file:
//   1. Inject a "Book a call" link into the OC Footer link list (site-wide).
//   2. Inject a "Book a call" affordance into the desktop nav next to "Free
//      Coverage Review" (site-wide, skipped on /book itself).
//   3. On /book, listen for cal.diy iframe postMessage events and fire a GA4
//      `book_appointment` conversion event when a booking succeeds. Also
//      surface a thank-you overlay so the visitor knows the booking landed.
//
// Bypasses Designer surgery on the OC Nav and OC Footer components. Runtime
// injection only; reversible by removing the inline-site-script.
(function () {
  'use strict';

  var BOOK_URL = '/book';
  var BOOK_LABEL = 'Book a call';
  var ON_BOOK = (location.pathname === '/book' || location.pathname === '/book/');

  // ---------- Footer injection ----------
  // OC Footer is a DIV-grid structure (not ul/li). The "FAQ" link in the footer
  // is the most reliable anchor for finding the footer link column: its
  // grand-parent DIV is the column container with ~5-8 sibling links. We
  // append a new link DIV that mirrors the FAQ link's parent DIV class.
  function injectFooter() {
    if (document.querySelector('[data-oc-book-footer="1"]')) return;
    var faqLinks = document.querySelectorAll('a[href="/faq"], a[href$="/faq"]');
    if (!faqLinks.length) return false;
    // Pick the LAST faq link on the page — that's the footer one (header/nav
    // FAQ links appear earlier in source order).
    var footerFaq = faqLinks[faqLinks.length - 1];
    // The link's parent is a wrapper DIV in the footer column; the grand-parent
    // is the column itself. We append a sibling wrapper that matches.
    var linkWrap = footerFaq.parentElement;
    var column = linkWrap && linkWrap.parentElement;
    if (!column) return false;
    var newWrap = document.createElement(linkWrap.tagName);
    newWrap.setAttribute('data-oc-book-footer', '1');
    if (linkWrap.className) newWrap.className = linkWrap.className;
    var a = document.createElement('a');
    a.href = BOOK_URL;
    a.textContent = BOOK_LABEL;
    a.className = footerFaq.className || '';
    newWrap.appendChild(a);
    column.appendChild(newWrap);
    return true;
  }

  // ---------- Nav injection ----------
  function injectNav() {
    if (ON_BOOK) return false;
    if (document.querySelector('[data-oc-book-nav="1"]')) return;
    // Find the existing "Free Coverage Review" CTA in nav.
    var navCTA = null;
    var anchors = document.querySelectorAll('a[href="/coverage-review"]');
    for (var i = 0; i < anchors.length; i++) {
      // Pick the first one in the page top area (header/nav)
      var inNav = anchors[i].closest('nav') || anchors[i].closest('header') || anchors[i].closest('[class*="oc-nav"]');
      if (inNav) { navCTA = anchors[i]; break; }
    }
    if (!navCTA) return false;
    // Create a subtle text link as sibling, NOT a competing button.
    var book = document.createElement('a');
    book.href = BOOK_URL;
    book.setAttribute('data-oc-book-nav', '1');
    book.textContent = BOOK_LABEL;
    book.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;padding:0 14px;height:44px;margin-right:8px;color:#1B3A5C;font-family:Inter,system-ui,sans-serif;font-size:0.9375rem;font-weight:600;text-decoration:none;border-radius:6px;border:1px solid #B8934A;background:transparent;transition:background-color 0.15s ease,color 0.15s ease';
    book.addEventListener('mouseenter', function () { book.style.background = '#B8934A'; book.style.color = '#FFFFFF'; });
    book.addEventListener('mouseleave', function () { book.style.background = 'transparent'; book.style.color = '#1B3A5C'; });
    // Insert before the Coverage Review CTA so order reads: [Book a call] [Free Coverage Review]
    navCTA.parentNode.insertBefore(book, navCTA);
    return true;
  }

  // ---------- GA4 conversion tracking on /book ----------
  function trackBookings() {
    if (!ON_BOOK) return;
    // cal.diy emits postMessage events with origin matching the embed iframe.
    window.addEventListener('message', function (ev) {
      try {
        if (!ev || !ev.data) return;
        var data = ev.data;
        // cal.com / cal.diy sends { type: 'CAL:event-name', payload: {...} } when wrapped via embed.js
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { return; }
        }
        var t = data && (data.type || data.event || data.action);
        if (!t) return;
        // Patterns observed across Cal.com / cal.diy releases:
        //   "bookingSuccessful", "CAL:bookingSuccessful", "booking_successful"
        if (!/booking/i.test(String(t)) || !/success/i.test(String(t))) return;
        var payload = data.payload || data.data || {};
        // Fire GA4 conversion event.
        try {
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'book_appointment', {
              event_category: 'conversion',
              event_label: 'cal_diy_advisor_call',
              source_url: location.href,
              booking_uid: payload.uid || payload.bookingUid || '',
              event_type: payload.eventType && payload.eventType.slug ? payload.eventType.slug : 'advisorcall'
            });
          }
        } catch (e) {}
        // Also push to dataLayer for GTM compatibility (defensive).
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'book_appointment',
            booking_source: 'cal_diy',
            booking_uid: payload.uid || payload.bookingUid || ''
          });
        } catch (e) {}
        // Surface a confirmation toast above the iframe so the visitor knows.
        showConfirmation();
      } catch (e) {}
    }, false);
  }

  function showConfirmation() {
    if (document.querySelector('[data-oc-book-confirm="1"]')) return;
    var host = document.querySelector('#oc-cal-inline') || document.querySelector('[id*="cal-inline"]') || document.body;
    var box = document.createElement('div');
    box.setAttribute('data-oc-book-confirm', '1');
    box.style.cssText = 'margin:24px auto;padding:20px 28px;max-width:680px;background:#F5EDD8;border:2px solid #B8934A;border-radius:10px;font-family:Inter,system-ui,sans-serif;color:#1B3A5C;text-align:center';
    box.innerHTML = '<div style="font-family:Playfair Display,Georgia,serif;font-size:1.4rem;font-weight:600;margin-bottom:6px">Your call is booked.</div>' +
      '<div style="font-size:0.95rem;line-height:1.5">Confirmation email is on its way. We will reach out before the call to confirm any details. If you need to reschedule, use the link in the confirmation email.</div>';
    if (host && host.parentNode) {
      host.parentNode.insertBefore(box, host);
    } else {
      document.body.appendChild(box);
    }
  }

  // ---------- Boot ----------
  function run() {
    try { injectFooter(); } catch (e) {}
    try { injectNav(); } catch (e) {}
    try { trackBookings(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  // Run again after CMS / navigation late-mount.
  setTimeout(run, 1500);
})();
