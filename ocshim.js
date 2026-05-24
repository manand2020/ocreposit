// ocshim.js -- Consolidated Olive Cover site shims v1.10.28
// v1.10.28 (2026-05-24): ocbatch1024 v1.0.7 HOTFIX -- second-overlay-below-text bug.
//   .oc-pi-hero-left (text column) has its OWN navy linear-gradient bg from Webflow,
//   stacking on top of the hero wrap's photo + ::before overlay. Result: visible
//   navy strip below text. Fix: zero out background on .oc-pi-hero-left / -right (and
//   /commercial-insurance equivalents) so the photo+overlay show through cleanly.
// v1.10.27 (2026-05-24): ocbatch1024 v1.0.6 -- /personal-insurance VISUAL polish.
//   (1) Force ALL 3 page-section grids (.oc-pi-id-grid, .oc-pi-sys-stack, .oc-pi-gaps-grid)
//       to 4-col on desktop with html-level selector specificity (previous CSS targeted
//       only .oc-pi-sf-grid which is not the actual class used).
//   (2) Hero bg-image set DIRECTLY on .oc-pi-hero-wrap (the standalone photo block is
//       hidden by ocstylefixes.fixHeroPhotos; wrap-level bg ensures hero photo renders).
//       Navy 78-92% gradient overlay via ::before for readability.
//   (3) .oc-pi-id-card polish: white bg, gold border on hover, lift on hover, subtle shadow.
//   Parallel rules added for /commercial-insurance (.oc-ci-* variants) for symmetry.
// v1.10.26 (2026-05-24): ocbatch1024 v1.0.5 HOTFIX -- Terms-section-move target was
//   matching .oc-widget-panel-footer (inside Ask Olive widget) instead of the real
//   site footer. Result: on /personal-insurance the Terms section was getting moved
//   INSIDE the chat widget panel and disappearing from main page flow. Fixed by
//   pinning the footer target to #oc-footer-new (the actual site footer DIV).
// v1.10.25 (2026-05-24): ocbatch1024 v1.0.4 -- /personal-insurance polish.
//   (1) Force .oc-pi-sys-stack to 4-column grid (6 cards wrap to 4+2 rows).
//   (2) Wire each .oc-pi-sys-block as an anchor link to the corresponding
//       product card below (which already has stable IDs: #homeowners, #auto,
//       #renters, #flood, #umbrella, #landlord). Cards become clickable +
//       scroll-to the matching section.
//   (3) Hero polish: tighten oc-pi-hero spacing + ensure navy overlay so it
//       reads like the homepage hero treatment. (Full structural match needs
//       Designer canvas rework — out of shim scope.)
// v1.10.24 (2026-05-24): ocbatch1024 v1.0.3 HOTFIX -- previous version's
//   section:has(.oc-cov2-q-label) rule + DOM walk-up to <section> were too
//   aggressive: they removed the ENTIRE hero section on /coverage (including
//   H1 + subtitle). User reported: "now the whole hero section is gone on
//   coverage page." Replacing with targeted class hides on the eyebrow +
//   question card classes only, leaving the parent hero intact.
// v1.10.23 (2026-05-24): ocbatch1024 v1.0.2 -- Terms section move + broader 4x1.
//   (1) Move "Insurance Terms / Glossary" CTA section (#pi-glossary-link) to be
//       the LAST section before the footer on /personal-insurance and
//       /commercial-insurance. Pure DOM reorder; CMS content unchanged.
//   (2) Broaden 4x1 card grid CSS so the section-below-hero on the insurance
//       hubs also gets the 4-column treatment when it has ~4 cards.
//   NOTE on items deferred from this session's review: "/personal-insurance
//   hero = 100% match homepage" requires Designer canvas template rework
//   (different DOM structures between oc-pi-hero-* and oc-hero-*) and cannot
//   be done at runtime via shim. Card anchor-links to sections below also
//   deferred because many target sections lack stable IDs.
// v1.10.22 (2026-05-24): ocbatch1024 v1.0.1 -- expand /coverage question-section
//   removal. v1.0.0 targeted h1-h4 + .oc-pi-hero-qlabel + [class*="hero-qlabel"]
//   but /coverage uses <p class="oc-cov2-q-label"> for the eyebrow and <p
//   class="oc-cov2-q"> for each of the 4 question cards. Adding [class*="oc-cov2-q"]
//   to the killSelectors so the parent section gets removed. Also adds a CSS
//   :has() fallback to hide the section immediately if DOM walk fails.
// v1.10.21 (2026-05-24): ocbatch1024 v1.0.0 -- comprehensive review-batch fixes.
//   (1) Footer: update Facebook URL to https://www.facebook.com/olivecoverins
//       and hide Instagram link (account not yet active).
//   (2) /faq: replace search placeholder "Search all 34 questions" with
//       "Search FAQs" (stale count, total is 494).
//   (3) /personal-insurance + /commercial-insurance + /coverage: remove the
//       "What brought you here?" section (low-information UX clutter).
//   (4) /coverage: also remove "What do I actually need?", "Am I already
//       covered?", "What am I missing?" — same clutter pattern.
//   (5) /personal-insurance + /commercial-insurance: force "If any of these
//       sounds familiar" section card grid to 1-row 4-column.
//   (6) /about: force A-Rated Carriers/Johns Creek/Licensed in GA/Independent
//       Agent trust-strip cards to 1-row 4-column.
//   (7) /insurance-terms: shrink card text + add row-gap so cards are smaller
//       and rows visibly separated.
//   (8) Nav: strip pill formatting from Resources active state so it matches
//       the plain-text treatment of other nav items.
//   (9) Homepage: force #oc-social-proof "Real Outcomes" cards to 1-row
//       3-column.
//   Text-content matching is used for sections without stable IDs (more
//   robust against Webflow generated class names).
// v1.10.20 (2026-05-24): ocnavcarrcomm v1.0.1 -- additionally remove the AIG
//   link from the Commercial Lines column of the Carriers nav panel. /carriers/
//   aig-insurance is AIG Private Client (personal lines high-net-worth), not
//   commercial. There is no /carriers/aig-commercial-insurance slug. Cleanest
//   fix is removing it from the Commercial column entirely until/unless a
//   commercial AIG slug is added later.
// v1.10.19 (2026-05-24): ocnavcarrcomm v1.0.0 -- fix commercial column carrier
//   nav links that wrongly pointed to personal/generic carrier slugs. Three swaps:
//   travelers-insurance -> travelers-commercial-insurance, hartford-insurance ->
//   hartford-commercial-insurance, nationwide-insurance -> nationwide-commercial-
//   insurance. AIG stays generic (no aig-commercial-insurance slug exists).
//   Runtime DOM patch: finds "Commercial Lines" label in nav panels (desktop +
//   mobile) and updates the href on matching <a> elements within the column
//   container. Independent of Designer canvas (canonical fix is to edit the OC
//   Nav component link hrefs but that requires Designer access).
// v1.10.18 (2026-05-24): ocinsfix v1.0.0 -- /insights page polish + Insurance
//   What is Covered cards equal-height. Four targeted fixes:
//   (1) oc-ins-featured-grid + oc-ins-all-grid: force 4-column equal cards
//       (cards previously collapsed to 0px width and uneven heights).
//   (2) Remove blank article.oc-ic-1 cards (no title + no link) from All
//       Articles section. Legacy Designer placeholders left over from pre-CMS
//       wiring. Was hidden in v1.9.4 via display:none; this version removes
//       them from the DOM entirely so they do not affect grid sizing.
//   (3) Remove .oc-art-sidebar-hint-body container on /insights/{slug} detail
//       pages. The IN THIS ARTICLE sidebar hint had generic filler text (Use
//       the headings below to navigate. Each section explains a specific
//       aspect of this topic clearly and without jargon.) which provides no
//       useful content. Post-launch this will be replaced with per-article
//       researched TOC content via CMS field; until then, hide the empty
//       shell.
//   (4) Insurance template What is Covered cards: enforce equal heights on
//       the card grids via grid-auto-rows:1fr and flex column layout so
//       uneven body text length does not produce uneven card heights.
// v1.10.17 (2026-05-23): ocstep4reorder v1.0.1 -- wrap dec + policy upload
//   inputs in a flex row so they sit side-by-side on desktop. Auto-stack on
//   mobile via flex-wrap + min-width:240px on each child.
// v1.10.16 (2026-05-23): ocstep4reorder module v1.0.0 -- /coverage-review Step 4
//   reorder: upload (decFile + polFile) and "Anything we should know?" textarea
//   move to TOP of the panel (above personal/commercial detail sections). The
//   "Current coverage (optional)" sub-section stays in place. Pure DOM reorder;
//   form field names + Firestore payload unchanged.
// v1.10.15 (2026-05-23): ocbreadcrumb v1.0.2 hotfix -- v1.10.14 had a literal
//   newline inside a JS string literal which broke the entire file parse and
//   caused FAQPage + Breadcrumb to silently not emit. This fix removes the
//   broken H1 fallback block (document.title is always populated anyway).
// v1.10.14 (2026-05-23): ocbreadcrumb v1.0.1 polish -- use document.title
//   (split on '|') as the final crumb label instead of H1.textContent, which
//   was including hero taglines. Cleaner labels like "Homeowners Insurance"
//   instead of "Homeowners insurance for the home you actually live in."
// v1.10.13 (2026-05-23): ocbreadcrumb module v1.0.0 -- extracts .oc-breadcrumb
//   DOM items, appends current H1 as final crumb, emits BreadcrumbList JSON-LD.
//   AEO win for Google search breadcrumb display + AI Overviews context.
// v1.10.12 (2026-05-23): ocfaqschema module v1.0.0 -- detects DOM FAQs
//   (.oc-faq-q + .oc-faq-a or .oc-faq-short-q/a pairs), extracts Q+A text,
//   emits FAQPage JSON-LD at runtime. Big AEO win for Google AI Overviews
//   on Insurance pages (8-16 FAQs each), Carrier pages, and any other
//   surface with the FAQ markup. Skips if FAQPage schema already present.
// v1.10.11 (2026-05-22): occarrierurls bumped to v1.0.1 -- use CMS carrier-name
//   as brand label source instead of parsing H1. Fixes 3 carriers where H1 was
//   a long descriptor (AEGIS Deductible Buy-Back..., Forge Small Business...,
//   Next Insurance Small Business...) and produced awkward button labels.
//   Now uses a slug->clean-name map mirrored from Carriers CMS.
// v1.10.10 (2026-05-22): ocmobile module bumped to v1.0.1 -- cap nav logo size
//   on mobile (max-height:32px, max-width:96px). Logo rendered at 108x40 desktop
//   was visually oversized on narrow viewports.
// v1.10.9 (2026-05-22): ocmobile module v1.0.0 -- mobile UX optimization for
//   viewports <= 767px. Applies: 16px form-field font (kills iOS zoom-on-focus),
//   H1/H2 max-size caps, horizontal safe-area padding, table-overflow wrappers,
//   sticky-bar/feedback-widget overlap guard, full-width buttons, image
//   max-width:100%, body overflow-x:hidden. Re-evaluates on resize.
// v1.10.8 (2026-05-22): Two polish items:
//   (1) ochubmore PERSONAL_MORE + COMMERCIAL_MORE trimmed to the 6+6 truly new
//       Insurance pages each (was 14+11 — included items already on the hubs).
//   (2) occarrierurls brand-label fix — strips trailing " Review" from the
//       carrier H1 so the button reads "Visit Travelers Insurance website"
//       instead of "Visit Travelers Insurance Review website".
// v1.10.7 (2026-05-22): /carriers/{slug} pages get 3 URL buttons injected near
//   the existing claims phone card: brand website, customer service portal,
//   claims portal. Source data: Carrier Extras CMS collection (mirrored into
//   the ocshim module body as a slug->URLs map). Same render pattern as
//   occarrierphones. Designer template binding is the planned long-term
//   replacement; shim renders today.
// v1.10.6 (2026-05-22): /personal-insurance + /commercial-insurance hub pages
//   get "More coverage we review" section injected before footer. Discoverability
//   for the 12 new Insurance pages (6 personal + 6 commercial) that weren't on
//   the static hub cards. Closes manual queue items 5 + 6 without Designer work.
// v1.10.5 (2026-05-22): /carriers hub + /commercial-carriers static text
//   runtime swaps. Headlines and intro paragraphs reframed to Position C
//   neutral review tone (was: "We Work With..." / "We are appointed with..."
//   → "Independent Carrier Reviews..." / "We review and compare...").
//   Closes manual queue items 1 + 2.
// v1.10.4 (2026-05-22): Fix /about brand badge swap — actual text is just
//   "Licensed & Appointed" (no "Agency" suffix). Now swapping to
//   "Licensed in Georgia" which is factual + avoids redundancy with the
//   "Independent Agent" sibling badge.
// v1.10.3 (2026-05-22): Two more Position C runtime text-swaps:
//   - /personal-carriers AIG cell: "best-in-class claims" → "specialized
//     claims handling for high-value homes" (hyperbole cleanup)
//   - /about brand badge: "Licensed & Appointed Agency" → "Licensed
//     Independent Agency" (Position C jargon cleanup) — was wrong text, fixed in v1.10.4
// v1.10.2 (2026-05-22): /auto-home-quote adds state-aware notice for non-GA
//   visitors. Reads localStorage.oc_state — if not GA, prepend a clear notice
//   above the iframe explaining Olive Cover is licensed in Georgia today.
//   Visitor can still use the form but expectations are set correctly.
// v1.10.1 (2026-05-22): /auto-home-quote now fetches real #oc-nav and
//   #oc-footer-new from homepage and clones them in, so the page visually
//   matches the rest of the site (instead of inline simplified nav/footer).
// v1.10.0 (2026-05-22): /auto-home-quote page wraps Vertafore CRQ iframe in
//   Olive Cover branding. Page exists in Webflow as empty page (HTTP 200);
//   shim injects nav + hero + bail-out callout + iframe + below-fold contact
//   + footer at runtime. CRQ CTAs updated to point to /auto-home-quote
//   (same-tab navigation, no more new tab to consumerratequotes.com).
//   Brand continuity preserved; visitor URL stays olivecover.com.
// v1.9.9 (2026-05-22): Cap form width on desktop. Homepage Ask Olive form
//   fields were ~720px wide on 1568px+ viewports (looked stretched).
//   New max-width 480px on form fields + state notice on desktop only;
//   mobile keeps full-width. Conversion-path desktop UX polish.
// v1.9.8 (2026-05-22): Rebrand "Report an error" widget to content-feedback
//   focus. Button now says "Suggest a correction" (was: "Report an error"
//   which sounded like a bug-report widget). Modal title "Help us keep this
//   accurate." Form labels reframed around content accuracy: "What looks
//   incorrect?" / "What should it say instead?" Submit button "Send feedback"
//   (was: "Open a Case"). Email subject prefix [Olive Cover web feedback]
//   preserved for OC Tech Case-routing compatibility.
// v1.9.7 (2026-05-22): Mobile-keyboard input types. Email/phone/ZIP fields
//   were type="text" — wrong mobile keyboard. Phone gets numpad, email gets
//   @-key, ZIP gets numpad. Also adds autocomplete attrs. Conversion-path
//   mobile UX critical.
// v1.9.6 (2026-05-22): Branded form success/fail messages. All 3 forms
//   (homepage, CRV, contact) had Webflow's generic "Thank you!" + "Oops!"
//   defaults. Replaced with form-specific helpful text that tells users
//   what happens next + provides phone + email fallback. Conversion-path
//   UX critical pre-launch.
// v1.9.5 (2026-05-22): Fix "Example Text" Webflow-default placeholders on
//   Coverage Review form inputs. 7 visible fields had unhelpful default
//   placeholder text instead of useful hints. Runtime swap until canonical
//   Designer canvas edits. Conversion-path UX improvement pre-launch.
// v1.9.4 (2026-05-22): Hide blank Insights cards on /insights page. 4 legacy
//   <article class="oc-ic-1"> placeholders from Designer canvas remain alongside
//   the CMS-bound Collection List items. They have data-category + read-time
//   span but no <a> child. Runtime hide via JS until canonical Designer
//   canvas cleanup.
// v1.9.3 (2026-05-22): Hide "No items found." messages on empty Collection Lists
//   site-wide (Webflow's default w-dyn-empty text). Quality polish so visitors
//   never see the placeholder string. Pairs with content fixes that populate
//   featured-faqs and state-notes.
// v1.9.2 (2026-05-22): JSON-LD coverage extended to /faq/{slug}, /claims,
//   /insights (hub), /states/{slug}, /where-we-do-business. AEO completeness.
// v1.9.1 (2026-05-22): Simpler state-select notice copy. Non-licensed states now
//   read "We can answer general insurance questions for {State}. Olive Cover
//   places coverage in Georgia today." (was: "We are not yet licensed in
//   {State}... waitlist..." which read regulatory-y and salesy).
// v1.9.0 (2026-05-22): Position C template text replacement. Insurance template
//   carrier panel "Carriers We Use for This Coverage" + intro paragraph
//   contained "carriers we work with hold an A rating and are appointed"
//   leaking placement jargon. Carrier template row "Do We Work With Them?"
//   similarly. Runtime DOM swaps both to Position C neutral review tone.
//   These are belt-and-suspenders; canonical fix is Designer canvas (queued).
// v1.8.0 (2026-05-22): Position C JSON-LD alignment. /carriers/{slug} pages
//   now emit Review schema (itemReviewed: InsuranceCompany, author: Olive Cover)
//   instead of InsuranceAgency (which incorrectly framed Olive Cover as the
//   carrier's parent org). Aligns the structured-data signal to the visitor-
//   facing review tone established in v1.7.0.
// v1.7.0 (2026-05-22): expanded the carrier-page rating disclaimer into the
//   uniform carrier-section disclaimer covering BOTH rating data attribution
//   AND the placement-via-appointments-or-partnerships clarification. Applies
//   to all /carriers pages including the hub. Pairs with the universal review-
//   style positioning across all 43 carrier pages (no appointed vs not-appointed
//   distinction in visitor-facing copy).
// v1.6.0 (2026-05-21): inject the rating disclaimer near the ratings section on
//   all 41 carrier pages (legal/compliance requirement per CLAUDE.md). Was missing
//   from every carrier page; now rendered client-side until Designer template
//   edit adds it to static HTML too.
// v1.5.2 (2026-05-21): fixHeroPhotos was overwriting fixCrvHeroBg's softened
//   gradient with the old 0.82-uniform one. Updated fixHeroPhotos to use the
//   same softened 105deg gradient so /coverage-review (and any other page where
//   fixHeroPhotos walks to a hero ancestor) gets the visible photo treatment.
// v1.5.1 (2026-05-21): soften /coverage-review hero gradient to match Insurance
//   template approach (105deg gradient, 0.88→0.55→0.30) so the hero photo is
//   actually visible behind the navy overlay.
// v1.5.0 (2026-05-21): swap hello@olivecover.com → askolive@olivecover.com
//   site-wide (footer, body text, error fallbacks). Add "Or email us at
//   askolive@" tertiary line below contact form. Reinforces "Ask Olive"
//   trademark and consolidates email contact path.
// v1.4.0 (2026-05-21): ocschemaexpand expanded to cover /coverage-review,
//   /personal-insurance, /commercial-insurance, /carriers (hub), /faq,
//   /insurance-terms (hub). Was previously /insurance/* and /carriers/* only.
// Generated 2026-05-18 from 7 inline site-scripts.
// v1.1.0 (2026-05-21): added oc-content-rules (California pill removal,
//   FAQ slug DOM removal, /commercial-carriers Coming Soon hide + real estate
//   text swap, /commercial-insurance leading-bang strip).
// Modules: ocaeleven, ocschemaexpand, ocfeedback, ocstateselect,
//   occarrierphones, ocwgthealer, ocstylefixes, oc-content-rules


// === ocaeleven.js ===
(function(){function run(){var inputs=document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([aria-label]):not([aria-labelledby]), textarea:not([aria-label]):not([aria-labelledby])');inputs.forEach(function(el){if(el.labels&&el.labels.length)return;var label=el.getAttribute('placeholder')||el.getAttribute('name')||el.id||'Form input';el.setAttribute('aria-label',label);});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}setTimeout(run,1500);})();

// === ocschemaexpand.js (v1.4.0 — Position C: carrier pages now use Review schema) ===
(function(){
  function inject(obj){
    var e=document.createElement('script');
    e.type='application/ld+json';
    e.textContent=JSON.stringify(obj);
    document.head.appendChild(e);
  }
  function getH1(){var h=document.querySelector('h1');return h?h.textContent.trim():'';}
  function getDesc(){var d=document.querySelector('meta[name=description]');return d?d.content:'';}
  function getOgImg(){var o=document.querySelector('meta[property="og:image"]');return o?o.content:'';}
  function run(){
    var p=location.pathname.replace(/\/$/,'')||'/';
    var existing=Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(function(s){try{return JSON.parse(s.textContent)['@type'];}catch(e){return null;}});
    var ag={'@type':'InsuranceAgency','name':'Olive Cover','url':'https://www.olivecover.com','telephone':'+1-678-888-1011'};
    var ar={'@type':'State','name':'Georgia'};
    var siteUrl='https://www.olivecover.com';
    var s=null;
    // /insurance/{slug} → Service
    if(/^\/insurance\/[^/]+$/.test(p)&&existing.indexOf('Service')<0){
      var sl=p.substring(11);
      var n=getH1()||sl.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
      var d=getDesc()||'Independent placement of '+sl.replace(/-/g,' ')+'.';
      var st=sl.replace(/-insurance$/,'').replace(/-/g,' ');
      s={'@context':'https://schema.org','@type':'Service','name':n,'provider':ag,'description':d,'areaServed':ar,'serviceType':st,'url':siteUrl+p};
    }
    // /carriers/{slug} → Review (Position C: carrier reviewed by Olive Cover, not represented)
    else if(/^\/carriers\/[^/]+$/.test(p)&&existing.indexOf('Review')<0){
      var cs=p.substring(10);
      var cn=getH1()||cs.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
      var cd=getDesc()||'Carrier review for '+cn+'.';
      s={'@context':'https://schema.org','@type':'Review','itemReviewed':{'@type':'InsuranceCompany','name':cn,'areaServed':ar},'author':{'@type':'Organization','name':'Olive Cover','url':siteUrl},'publisher':ag,'reviewBody':cd,'url':siteUrl+p,'datePublished':new Date().toISOString().substring(0,10)};
    }
    // /coverage-review → Service (Free Coverage Review)
    else if(p==='/coverage-review'&&existing.indexOf('Service')<0){
      s={'@context':'https://schema.org','@type':'Service','name':'Free Coverage Review','provider':ag,'description':getDesc()||'A 15-minute consultation to review your insurance coverage. Olive Cover shops multiple carriers to find the right policy for your needs.','areaServed':ar,'serviceType':'Insurance coverage consultation','url':siteUrl+p};
    }
    // /personal-insurance → WebPage / CollectionPage for personal P&C products
    else if(p==='/personal-insurance'&&existing.indexOf('CollectionPage')<0){
      s={'@context':'https://schema.org','@type':'CollectionPage','name':getH1()||'Personal Insurance','description':getDesc()||'Personal property and casualty insurance lines: homeowners, auto, renters, umbrella, and more. Independent placement across multiple carriers.','url':siteUrl+p,'publisher':ag,'about':{'@type':'Thing','name':'Personal Insurance'}};
    }
    // /commercial-insurance → CollectionPage for commercial products
    else if(p==='/commercial-insurance'&&existing.indexOf('CollectionPage')<0){
      s={'@context':'https://schema.org','@type':'CollectionPage','name':getH1()||'Commercial Insurance','description':getDesc()||'Commercial property and casualty insurance lines: business owners policy, general liability, workers compensation, commercial auto, and more.','url':siteUrl+p,'publisher':ag,'about':{'@type':'Thing','name':'Commercial Insurance'}};
    }
    // /carriers (hub) → CollectionPage listing carrier partners
    else if(p==='/carriers'&&existing.indexOf('CollectionPage')<0){
      s={'@context':'https://schema.org','@type':'CollectionPage','name':getH1()||'Our Carriers','description':getDesc()||'Insurance carriers Olive Cover compares to find the right policy for personal and commercial coverage in Georgia.','url':siteUrl+p,'publisher':ag};
    }
    // /faq → FAQPage assembled from featured Q&As on the hub
    else if(p==='/faq'&&existing.indexOf('FAQPage')<0){
      var qas=[];
      // Extract featured FAQ entries from the hub. Look for question + answer patterns.
      document.querySelectorAll('.oc-fqc-q-1, .oc-faq-link-row, [class*="faq-question"]').forEach(function(qEl){
        var q=(qEl.textContent||'').trim();
        if(q.length<10||q.length>250) return;
        // Try to find the answer nearby
        var aEl=qEl.parentElement?qEl.parentElement.querySelector('.oc-fqc-a-1, [class*="faq-answer"]'):null;
        var a=aEl?(aEl.textContent||'').trim():'';
        if(q&&a){qas.push({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}});}
        if(qas.length>=4) return;
      });
      if(qas.length){
        s={'@context':'https://schema.org','@type':'FAQPage','mainEntity':qas};
      } else {
        // Fallback: lighter FAQPage with no entities (still helps Google understand page type)
        s={'@context':'https://schema.org','@type':'WebPage','name':getH1()||'Insurance FAQs','description':getDesc()||'Frequently asked questions about insurance coverage, claims, and Olive Cover services.','url':siteUrl+p};
      }
    }
    // /insurance-terms (glossary hub) → CollectionPage
    else if(p==='/insurance-terms'&&existing.indexOf('CollectionPage')<0){
      s={'@context':'https://schema.org','@type':'CollectionPage','name':getH1()||'Insurance Terms','description':getDesc()||'Plain-language definitions of common insurance terms, organized by category.','url':siteUrl+p,'publisher':ag};
    }
    // /faq/{slug} (individual FAQ) → FAQPage with one Question
    else if(/^\/faq\/[^/]+$/.test(p)&&existing.indexOf('FAQPage')<0){
      var q=getH1()||p.substring(5).replace(/-/g,' ');
      // Try to extract answer body from common DOM patterns
      var aEl=document.querySelector('.oc-faq-answer, [class*="faq-answer"], article p, main p');
      var a=aEl?(aEl.textContent||'').trim().substring(0,500):getDesc();
      s={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}],'url':siteUrl+p};
    }
    // /claims → Service (claims handling)
    else if(p==='/claims'&&existing.indexOf('Service')<0){
      s={'@context':'https://schema.org','@type':'Service','name':getH1()||'Insurance Claims Handling','provider':ag,'description':getDesc()||'Insurance claims guidance and advocacy for Olive Cover policyholders in Georgia.','areaServed':ar,'serviceType':'Insurance claims handling','url':siteUrl+p};
    }
    // /insights (hub) → CollectionPage (blog index)
    else if(p==='/insights'&&existing.indexOf('CollectionPage')<0){
      s={'@context':'https://schema.org','@type':'CollectionPage','name':getH1()||'Insurance Insights','description':getDesc()||'Insurance education, market analysis, and consumer guidance from Olive Cover.','url':siteUrl+p,'publisher':ag,'about':{'@type':'Thing','name':'Insurance education'}};
    }
    // /states/{slug} → WebPage with about Place
    else if(/^\/states\/[^/]+$/.test(p)&&existing.indexOf('WebPage')<0){
      var stateSlug=p.substring(8);
      var stateName=stateSlug.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
      s={'@context':'https://schema.org','@type':'WebPage','name':getH1()||(stateName+' Insurance'),'description':getDesc()||('Insurance coverage and licensing for '+stateName+' from Olive Cover.'),'url':siteUrl+p,'about':{'@type':'State','name':stateName},'publisher':ag};
    }
    // /where-we-do-business → WebPage with location info
    else if(p==='/where-we-do-business'&&existing.indexOf('WebPage')<0){
      s={'@context':'https://schema.org','@type':'WebPage','name':getH1()||'Where We Do Business','description':getDesc()||'States and territories where Olive Cover places insurance coverage, plus our service area expansion plans.','url':siteUrl+p,'publisher':ag,'about':{'@type':'AdministrativeArea','name':'Olive Cover service area'}};
    }
    if(s){inject(s);}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();

// === ochubmore.js (v1.0.0 — inject "More coverage we review" section on /personal-insurance + /commercial-insurance hubs) ===
(function(){
  var p = location.pathname.replace(/\/$/,'');
  var personal = (p === '/personal-insurance');
  var commercial = (p === '/commercial-insurance');
  if(!personal && !commercial) return;

  var PERSONAL_MORE = [
    {slug:'rv-insurance', name:'RV Insurance', tag:'Motorhome, travel trailer, fifth-wheel'},
    {slug:'mobile-home-insurance', name:'Mobile Home Insurance', tag:'Manufactured and mobile home coverage'},
    {slug:'vacant-home-insurance', name:'Vacant Home Insurance', tag:'Empty home between owners or in transition'},
    {slug:'pet-insurance', name:'Pet Insurance', tag:'Market review (direct-to-consumer carriers)'},
    {slug:'identity-theft-insurance', name:'Identity Theft Insurance', tag:'Recovery expense, often a home endorsement'},
    {slug:'equine-insurance', name:'Equine Insurance', tag:'Horse mortality, medical, liability'},
  ];
  var COMMERCIAL_MORE = [
    {slug:'commercial-property-insurance', name:'Commercial Property', tag:'Building, business income, extra expense'},
    {slug:'liquor-liability-insurance', name:'Liquor Liability', tag:'Restaurants, bars, breweries'},
    {slug:'inland-marine-insurance', name:'Inland Marine', tag:'Contractor equipment and goods in transit'},
    {slug:'builders-risk-insurance', name:'Builders Risk', tag:'Coverage during construction'},
    {slug:'equipment-breakdown-insurance', name:'Equipment Breakdown', tag:'Mechanical and electrical failure of business systems'},
    {slug:'commercial-crime-insurance', name:'Commercial Crime', tag:'Employee theft, fidelity, wire fraud'},
  ];

  function injectStyles(){
    if(document.getElementById('oc-hubmore-styles')) return;
    var st = document.createElement('style');
    st.id = 'oc-hubmore-styles';
    st.textContent =
      '#oc-hubmore-sec{background:#F5EDD8;padding:64px 5%;font-family:Inter,sans-serif;}'+
      '#oc-hubmore-sec .wrap{max-width:1280px;margin:0 auto;}'+
      '#oc-hubmore-sec .eb{font:600 13px Inter,sans-serif;letter-spacing:2px;color:#B8934A;text-transform:uppercase;margin-bottom:8px;display:block;}'+
      '#oc-hubmore-sec h2{font-family:"Playfair Display",serif;font-weight:600;font-size:2rem;color:#1B3A5C;margin:0 0 12px;line-height:1.2;}'+
      '#oc-hubmore-sec .sh{font:16px Inter,sans-serif;color:#1B3A5C;max-width:720px;margin:0 0 32px;line-height:1.5;}'+
      '#oc-hubmore-sec .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}'+
      '#oc-hubmore-sec .card{background:#fff;border:1px solid #C7A24B;border-radius:8px;padding:18px 20px;text-decoration:none;display:block;transition:transform 0.15s,box-shadow 0.15s;}'+
      '#oc-hubmore-sec .card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(27,58,92,0.12);}'+
      '#oc-hubmore-sec .name{font-family:"Playfair Display",serif;font-weight:600;font-size:1.05rem;color:#1B3A5C;margin:0 0 6px;display:block;}'+
      '#oc-hubmore-sec .tag{font:13px Inter,sans-serif;color:#1B3A5C;opacity:0.75;margin:0 0 8px;display:block;line-height:1.4;}'+
      '#oc-hubmore-sec .arrow{font:13px Inter,sans-serif;color:#B8934A;font-weight:600;}'+
      '@media (max-width:768px){#oc-hubmore-sec{padding:40px 5%;}#oc-hubmore-sec h2{font-size:1.5rem;}}';
    document.head.appendChild(st);
  }

  function build(){
    if(document.getElementById('oc-hubmore-sec')) return;
    injectStyles();
    var list = personal ? PERSONAL_MORE : COMMERCIAL_MORE;
    var label = personal ? 'Personal' : 'Commercial';
    var sec = document.createElement('section');
    sec.id = 'oc-hubmore-sec';
    var html = '<div class="wrap">'+
      '<span class="eb">More coverage</span>'+
      '<h2>' + label + ' coverage we also review</h2>'+
      '<p class="sh">Beyond the most common coverages above, we also write and review these ' + label.toLowerCase() + ' lines. Click any to read more.</p>'+
      '<div class="grid">';
    list.forEach(function(it){
      html += '<a class="card" href="/insurance/' + it.slug + '">'+
        '<span class="name">' + it.name + '</span>'+
        '<span class="tag">' + it.tag + '</span>'+
        '<span class="arrow">Read more &rarr;</span>'+
        '</a>';
    });
    html += '</div></div>';
    sec.innerHTML = html;

    // Insert before footer (use first footer-like element)
    var footer = document.querySelector('[id*="footer"], footer');
    if(footer && footer.parentNode){
      footer.parentNode.insertBefore(sec, footer);
    } else {
      document.body.appendChild(sec);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
  setTimeout(build, 1000);
})();

// === ocautohomequote.js (v1.1.0 — wrap Vertafore CRQ in REAL Olive Cover nav + footer) ===
(function(){
  if(location.pathname !== '/auto-home-quote') return;

  function injectStyles(){
    if(document.getElementById('oc-ahq-styles')) return;
    var st = document.createElement('style');
    st.id = 'oc-ahq-styles';
    st.textContent =
      '#oc-ahq-main{background:#F5EDD8;padding:56px 5% 96px;min-height:calc(100vh - 200px);font-family:Inter,sans-serif;}'+
      '#oc-ahq-main .wrap{max-width:1280px;margin:0 auto;}'+
      '#oc-ahq-main .eb{font:600 13px Inter,sans-serif;letter-spacing:2px;color:#B8934A;text-transform:uppercase;margin-bottom:8px;display:block;}'+
      '#oc-ahq-main h1{font-family:"Playfair Display",serif;font-weight:600;font-size:2.5rem;color:#1B3A5C;margin:0 0 16px;line-height:1.15;}'+
      '#oc-ahq-main .sh{font:18px Inter,sans-serif;color:#1B3A5C;max-width:720px;margin:0 0 28px;line-height:1.5;}'+
      '#oc-ahq-main .bail{background:#fff;border-left:3px solid #B8934A;padding:14px 18px;border-radius:4px;margin:0 0 28px;max-width:720px;font:14px Inter,sans-serif;color:#1B3A5C;line-height:1.5;}'+
      '#oc-ahq-main .bail a{color:#B8934A;font-weight:600;text-decoration:underline;text-underline-offset:3px;}'+
      '#oc-ahq-main .state-notice{background:#FFF7E6;border-left:3px solid #C7A24B;padding:14px 18px;border-radius:4px;margin:0 0 16px;max-width:720px;font:14px Inter,sans-serif;color:#1B3A5C;line-height:1.5;}'+
      '#oc-ahq-main .state-notice a{color:#B8934A;font-weight:600;text-decoration:underline;text-underline-offset:3px;}'+
      '#oc-ahq-main .ifr{width:100%;min-height:900px;border:1px solid #C7A24B;border-radius:8px;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:block;}'+
      '#oc-ahq-main .ct{font:14px Inter,sans-serif;color:#1B3A5C;margin-top:24px;text-align:center;}'+
      '#oc-ahq-main .ct a{color:#B8934A;font-weight:600;text-decoration:none;}'+
      '#oc-ahq-main .ds{font:12px Inter,sans-serif;color:#666;margin-top:16px;text-align:center;font-style:italic;max-width:600px;margin-left:auto;margin-right:auto;}'+
      '@media (max-width:768px){#oc-ahq-main h1{font-size:1.75rem;}#oc-ahq-main{padding:40px 5% 64px;}#oc-ahq-main .ifr{min-height:700px;}}';
    document.head.appendChild(st);
  }

  function getState(){
    try { return (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch(e) { return ''; }
  }

  function stateNoticeHTML(){
    var s = getState();
    if(!s || s === 'GA') return '';
    var stateNames = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'DC',FL:'Florida',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};
    var stateName = stateNames[s] || s;
    return '<div class="state-notice"><strong>Olive Cover is licensed in Georgia today.</strong> If you are in ' + stateName + ', the quote engine below may still show results, but Olive Cover cannot bind coverage outside Georgia. For ' + stateName + ' guidance, start with the <a href="/coverage-review">Free Coverage Review</a>.</div>';
  }

  function buildMainSection(){
    if(document.getElementById('oc-ahq-main')) return null;
    var main = document.createElement('main');
    main.id = 'oc-ahq-main';
    main.innerHTML = '<div class="wrap">'+
      '<span class="eb">Detailed quotes</span>'+
      '<h1>Detailed home + auto quotes</h1>'+
      '<p class="sh">Compare home and auto rates from A-rated carriers in Georgia. Fill out the form below and we will email comparison results, plus a follow-up call with a licensed agent.</p>'+
      stateNoticeHTML()+
      '<div class="bail"><strong>Looking for commercial insurance, umbrella, jewelry, life, or other coverage?</strong> Start with the <a href="/coverage-review">Free Coverage Review</a> for those.</div>'+
      '<iframe class="ifr" src="https://secure.consumerratequotes.com/ConsumerV2?id=65159" loading="lazy" title="Olive Cover Quote Engine - Personal Home and Auto"></iframe>'+
      '<p class="ct">Need help? Call <a href="tel:+16788881011">(678) 888-1011</a> or email <a href="mailto:askolive@olivecover.com">askolive@olivecover.com</a></p>'+
      '<p class="ds">Quote engine powered by Vertafore. Our secure quote engine collects your details and emails comparison results.</p>'+
      '</div>';
    return main;
  }

  function cloneNavAndFooter(){
    // Fetch homepage HTML, extract real OC nav + footer, clone into /auto-home-quote.
    // This makes the page visually consistent with the rest of the site.
    fetch('/', {credentials:'same-origin'}).then(function(r){return r.text();}).then(function(html){
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var navEl = doc.getElementById('oc-nav');
      var footerEl = doc.getElementById('oc-footer-new') || doc.querySelector('[id*="footer"]');
      var main = buildMainSection();
      if(navEl){
        document.body.insertBefore(navEl.cloneNode(true), document.body.firstChild);
      }
      if(main){
        // Insert main after nav (or at top if no nav)
        var nav = document.getElementById('oc-nav');
        if(nav && nav.parentNode){
          nav.parentNode.insertBefore(main, nav.nextSibling);
        } else {
          document.body.appendChild(main);
        }
      }
      if(footerEl){
        document.body.appendChild(footerEl.cloneNode(true));
      }
      document.title = 'Detailed Auto + Home Quote | Olive Cover';
    }).catch(function(err){
      // Fallback: build minimal page if fetch fails
      console.error('[ocautohomequote] fetch failed:', err);
      var main = buildMainSection();
      if(main) document.body.appendChild(main);
      document.title = 'Detailed Auto + Home Quote | Olive Cover';
    });
  }

  function buildPage(){
    if(document.getElementById('oc-ahq-main')) return;
    injectStyles();
    cloneNavAndFooter();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildPage);
  } else {
    buildPage();
  }
})();

// === ocformwidth.js (v1.0.0 — cap Ask Olive form width on desktop) ===
(function(){
  if(document.getElementById('oc-form-width-fix')) return;
  var st = document.createElement('style');
  st.id = 'oc-form-width-fix';
  st.textContent = '@media (min-width:768px){' +
    '#oc-lead-form-el .oc-aof-input,' +
    '#oc-lead-form-el .oc-aof-ta,' +
    '#oc-lead-form-el #oc-state-select,' +
    '#oc-lead-form-el .oc-state-notice,' +
    '#oc-lead-form-el [data-oc-state-wrap]{' +
    'max-width:480px;}' +
    '#oc-lead-form-el .oc-aof-btn{margin-right:auto;}}' +
    '@media (min-width:1024px){#oc-lead-form-el{max-width:520px;margin-left:auto;margin-right:auto;}}';
  document.head.appendChild(st);
})();

// === ocinputtypes.js (v1.0.0 — mobile-keyboard input types + autocomplete) ===
(function(){
  var FIELDS = [
    // Coverage Review
    {id:'oc-crv-em', type:'email', autocomplete:'email', inputmode:'email'},
    {id:'oc-crv-ph', type:'tel', autocomplete:'tel', inputmode:'tel'},
    {id:'oc-crv-zp', type:'text', autocomplete:'postal-code', inputmode:'numeric', pattern:'[0-9]{5}'},
    {id:'oc-crv-fn', type:'text', autocomplete:'given-name'},
    {id:'oc-crv-ln', type:'text', autocomplete:'family-name'},
    {id:'oc-crv-year-built', type:'text', autocomplete:'off', inputmode:'numeric', pattern:'[0-9]{4}'},
    // Homepage Ask Olive form (phone is injected by shim as oc-lead-phone)
    {id:'oc-lead-phone', type:'tel', autocomplete:'tel', inputmode:'tel'},
    {id:'oc-lead-contact', type:'email', autocomplete:'email', inputmode:'email'},
    // Widget form
    {id:'oc-wgt-contact', type:'email', autocomplete:'email', inputmode:'email'},
    {id:'oc-wgt-contact-val', type:'tel', autocomplete:'tel', inputmode:'tel'},
  ];
  function run(){
    FIELDS.forEach(function(f){
      var el = document.getElementById(f.id);
      if(!el) return;
      if(f.type && el.type !== f.type) el.type = f.type;
      if(f.autocomplete) el.setAttribute('autocomplete', f.autocomplete);
      if(f.inputmode) el.setAttribute('inputmode', f.inputmode);
      if(f.pattern) el.setAttribute('pattern', f.pattern);
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setTimeout(run, 3000);
})();

// === ocformmessages.js (v1.0.0 — branded form success/fail messages) ===
(function(){
  var MESSAGES = {
    '/': {
      done: "Thanks! Our team will follow up shortly. For anything urgent, call us at (678) 888-1011.",
      fail: "Something went wrong on our end. Please try again, or reach us directly at (678) 888-1011 or askolive@olivecover.com.",
    },
    '/coverage-review': {
      done: "Coverage Review submitted. A licensed Olive Cover agent will reach out within one business day. Need to talk sooner? Call (678) 888-1011.",
      fail: "Something went wrong submitting your review. Please try again in a moment, or call us at (678) 888-1011 to start your Coverage Review by phone.",
    },
    '/contact': {
      done: "Message received. We will respond shortly. For anything urgent, call (678) 888-1011 or email askolive@olivecover.com.",
      fail: "Something went wrong sending your message. Please try again, or reach us directly at (678) 888-1011 or askolive@olivecover.com.",
    },
  };
  function run(){
    var msgs = MESSAGES[location.pathname];
    if(!msgs) return;
    var dones = document.querySelectorAll('.w-form-done');
    for(var i=0;i<dones.length;i++){
      var d = dones[i];
      // Only swap if it contains the Webflow default text
      if(d.textContent.indexOf('Your submission has been received') >= 0 || d.textContent.trim() === 'Thank you!'){
        d.innerHTML = '<div style="font:14px Inter,sans-serif;color:#1B3A5C;line-height:1.5">' + msgs.done + '</div>';
      }
    }
    var fails = document.querySelectorAll('.w-form-fail');
    for(var i=0;i<fails.length;i++){
      var f = fails[i];
      if(f.textContent.indexOf('Oops') >= 0 || f.textContent.indexOf('Something went wrong while') >= 0){
        f.innerHTML = '<div style="font:14px Inter,sans-serif;color:#1B3A5C;line-height:1.5">' + msgs.fail + '</div>';
      }
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  setTimeout(run, 500);
  setTimeout(run, 1500);
})();

// === occrvplaceholders.js (v1.0.0 — fix Coverage Review form placeholders) ===
(function(){
  if(location.pathname!=='/coverage-review') return;
  var PH = {
    'oc-crv-fn': 'Your first name',
    'oc-crv-ln': 'Your last name',
    'oc-crv-em': 'you@example.com',
    'oc-crv-ph': '(555) 555-5555',
    'oc-crv-zp': '5-digit ZIP',
    'oc-crv-ca': 'e.g., Travelers, Nationwide, GEICO',
    'oc-crv-rd': 'MM/DD/YYYY (renewal date)',
    'oc-crv-year-built': 'YYYY',
  };
  function run(){
    for(var id in PH){
      var el = document.getElementById(id);
      if(el && (el.placeholder==='Example Text' || el.placeholder==='' || !el.placeholder)){
        el.placeholder = PH[id];
      }
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  setTimeout(run, 500);
  setTimeout(run, 1500);
})();

// === ocinsightsblankcards.js (v1.0.0 — hide legacy blank article cards on /insights) ===
(function(){
  function run(){
    // Hide any <article> on /insights that has no <a href> child (legacy static placeholder)
    if(!/^\/insights/.test(location.pathname)) return;
    var articles = document.querySelectorAll('article.oc-ic-1, article.oc-ins-article-card');
    for(var i=0;i<articles.length;i++){
      var a = articles[i];
      var link = a.querySelector('a[href*="/insights/"]');
      var heading = a.querySelector('h1, h2, h3, h4, .oc-ic-title-1-2, [class*="title"]');
      var hasContent = link || (heading && heading.textContent.trim().length > 5);
      if(!hasContent){
        a.style.display = 'none';
      }
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  setTimeout(run,500);
  setTimeout(run,1500);
})();

// === ocemptylisthide.js (v1.0.0 — hide Webflow empty Collection List messages) ===
(function(){
  // Webflow renders 'No items found.' inside .w-dyn-empty when a Collection List
  // has no items. Hide these site-wide; populate the underlying CMS field instead
  // for content. Also hide if the section heading and the empty are the only kids.
  function run(){
    var emp = document.querySelectorAll('.w-dyn-empty');
    for(var i=0;i<emp.length;i++){
      var el=emp[i];
      // Hide the empty itself
      el.style.display='none';
      // Walk up: if parent section's text content is now just a heading + nothing,
      // and the heading is "Frequently Asked Questions" or "How this works in Georgia",
      // hide the whole section to avoid orphan heading.
      var parent=el.closest('section, .w-section, [class*="-section"]');
      if(parent){
        var visible=parent.querySelectorAll('.w-dyn-item, .oc-faq-item, p, ul, ol, .oc-state-notes-body');
        var hasVisibleContent=false;
        for(var j=0;j<visible.length;j++){
          if(visible[j].offsetParent!==null && visible[j].textContent.trim().length>10){
            hasVisibleContent=true; break;
          }
        }
        if(!hasVisibleContent){
          // Hide the whole section if it has a heading + empty list and nothing else
          var headings=parent.querySelectorAll('h1,h2,h3');
          if(headings.length>0 && headings.length<=2){
            parent.style.display='none';
          }
        }
      }
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  setTimeout(run,800);
  setTimeout(run,2000);
})();

// === ocpositioncfixes.js (v1.0.0 — Position C template tone replacement) ===
(function(){
  // Insurance template + Carrier template have static heading/text that leak
  // placement jargon ("we work with", "appointed", "Carriers We Use", "Do We
  // Work With Them?"). Position C requires neutral review tone. Runtime swaps
  // are belt-and-suspenders; canonical fix is Designer canvas (queued).
  var REPLS = [
    // Insurance template carrier panel
    ['Carriers We Use for This Coverage', 'Carriers in Our Review Set'],
    ['carriers we work with hold an A or better financial strength rating and are appointed in the state',
     'carriers in our review set hold an A or better financial strength rating in the state'],
    ['all carriers we work with hold',
     'all carriers in our review set hold'],
    ['All carriers we work with hold',
     'All carriers in our review set hold'],
    // Carrier template placement-status row label
    ['Do We Work With Them?', 'Active Comparison Set'],
    // /personal-carriers AIG cell — hyperbolic claim cleanup
    ['best-in-class claims', 'specialized claims handling for high-value homes'],
    // /about brand badge — Position C jargon cleanup. Actual text is just "Licensed & Appointed"
    // (without "Agency"; "Agency NPN 22116940" is shown on the line below as a separate sub-label).
    ['Licensed & Appointed', 'Licensed in Georgia'],
    ['Licensed &amp; Appointed', 'Licensed in Georgia'],
    // /carriers hub static text — Position C neutral review tone
    ['We Work With the Carriers That Are Right for You', 'Independent Carrier Reviews to Help You Choose'],
    ['How We Use Our Carrier Relationships', 'How Our Carrier Reviews Work'],
    ['Having appointments is one thing. Using them well is another.', 'Independent reviews are only useful when they connect to real placement.'],
    ['As an independent agency, we are not tied to one insurance company. We hold appointments with a range of personal and commercial carriers and place your coverage with the one that fits your situation best.', 'As an independent agency, we review and compare a range of personal and commercial carriers and place your coverage with the one that fits your situation best.'],
    // /commercial-carriers static text — Position C neutral review tone
    ['We are appointed with commercial carriers across business package coverage,', 'We review and compare commercial carriers across business package coverage,'],
    // Generic safety net for any residual
    [' we work with ', ' we review '],
  ];
  function walk(node){
    if(!node) return;
    if(node.nodeType===3){ // text node
      var t=node.nodeValue;
      var changed=false;
      for(var i=0;i<REPLS.length;i++){
        if(t.indexOf(REPLS[i][0])>=0){
          t=t.split(REPLS[i][0]).join(REPLS[i][1]);
          changed=true;
        }
      }
      if(changed) node.nodeValue=t;
      return;
    }
    if(node.nodeType!==1) return;
    var tag=node.tagName;
    if(tag==='SCRIPT'||tag==='STYLE'||tag==='NOSCRIPT') return;
    var k=node.childNodes;
    for(var i=0;i<k.length;i++) walk(k[i]);
  }
  function run(){walk(document.body);}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  setTimeout(run,800);
  setTimeout(run,2000);
})();

// === ocfeedback.js (v1.3.0 — content-correction rebrand) ===
(function(){var ENDPOINT='https://olive-cover-prod.web.app/feedback/create-case';var VER='1.3.0';function inject(){['oc-fb-link','oc-fb-bg','oc-fb-css'].forEach(function(id){var el=document.getElementById(id);if(el&&el.getAttribute('data-ocfb-ver')!==VER){el.parentNode.removeChild(el);}});if(document.getElementById('oc-fb-link'))return;var st=document.createElement('style');st.id='oc-fb-css';st.setAttribute('data-ocfb-ver',VER);st.textContent='#oc-fb-link{position:fixed;bottom:16px;left:16px;right:auto;z-index:9998;background:#1B3A5C;color:#F5EDD8;padding:8px 14px;border-radius:6px;font-size:13px;border:none;cursor:pointer;font-family:Inter,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.2)}#oc-fb-link:hover{background:#0F2237}#oc-fb-bg{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px}#oc-fb-bg.open{display:flex}#oc-fb-modal{background:#fff;max-width:500px;width:100%;padding:24px;border-radius:8px;font-family:Inter,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,0.3)}#oc-fb-modal h3{font-family:"Playfair Display",serif;color:#1B3A5C;margin:0 0 8px;font-size:1.25rem}#oc-fb-modal p.sub{font-size:13px;color:#666;margin:0 0 12px;line-height:1.5}#oc-fb-modal label{display:block;font-size:13px;color:#1B3A5C;margin:12px 0 4px;font-weight:600}#oc-fb-modal input,#oc-fb-modal textarea{width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:4px;font:14px Inter,sans-serif;box-sizing:border-box}#oc-fb-modal textarea{min-height:80px;resize:vertical}#oc-fb-submit{background:#B8934A;color:#fff;padding:10px 20px;border:none;border-radius:4px;font-weight:600;cursor:pointer;margin-top:14px;font-family:Inter,sans-serif}#oc-fb-submit:hover{background:#C7A24B}#oc-fb-submit:disabled{opacity:0.6;cursor:wait}#oc-fb-close{float:right;background:none;border:none;font-size:24px;cursor:pointer;color:#1B3A5C;line-height:1;padding:0}#oc-fb-status{margin-top:10px;font-size:13px;min-height:18px}@media(max-width:600px){#oc-fb-link{bottom:80px;left:8px;right:auto;font-size:12px;padding:6px 10px}}';document.head.appendChild(st);var btn=document.createElement('button');btn.id='oc-fb-link';btn.setAttribute('data-ocfb-ver',VER);btn.textContent='Suggest a correction';btn.setAttribute('aria-label','Suggest a content correction or improvement to this page');document.body.appendChild(btn);var bg=document.createElement('div');bg.id='oc-fb-bg';bg.setAttribute('data-ocfb-ver',VER);bg.innerHTML='<div id="oc-fb-modal" role="dialog" aria-labelledby="oc-fb-title"><button id="oc-fb-close" aria-label="Close">&times;</button><h3 id="oc-fb-title">Help us keep this accurate</h3><p class="sub">Notice something incorrect or out of date? A coverage description, a carrier review, an FAQ answer? Let us know what looks wrong and we will review it.</p><label for="oc-fb-what">What looks incorrect?</label><textarea id="oc-fb-what" placeholder="e.g., This carrier no longer writes in Georgia, or the FAQ on flood deductibles is missing X"></textarea><label for="oc-fb-should">What should it say instead? (optional)</label><textarea id="oc-fb-should" placeholder="The correct information, if you know it"></textarea><label for="oc-fb-email">Your email (optional, for follow-up)</label><input type="email" id="oc-fb-email" placeholder="you@example.com"><button id="oc-fb-submit">Send feedback</button><div id="oc-fb-status"></div></div>';document.body.appendChild(bg);function open(){bg.classList.add('open');setTimeout(function(){document.getElementById('oc-fb-what').focus();},100);}function close(){bg.classList.remove('open');document.getElementById('oc-fb-status').textContent='';}btn.addEventListener('click',open);document.getElementById('oc-fb-close').addEventListener('click',close);bg.addEventListener('click',function(e){if(e.target===bg)close();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&bg.classList.contains('open'))close();});document.getElementById('oc-fb-submit').addEventListener('click',function(){var what=document.getElementById('oc-fb-what').value.trim();var should=document.getElementById('oc-fb-should').value.trim();var em=document.getElementById('oc-fb-email').value.trim();var s=document.getElementById('oc-fb-status');var btn2=document.getElementById('oc-fb-submit');if(!what){s.textContent='Please tell us what looks incorrect.';s.style.color='#B91C1C';return;}btn2.disabled=true;s.textContent='Sending...';s.style.color='#666';var payload={subject:'Web feedback: '+(document.title||location.pathname).substring(0,80),description:what,suggested_correction:should||null,source:'web-feedback-widget',source_url:location.href,page_title:document.title,reporter_email:em||null,reporter_user_agent:navigator.userAgent,reporter_session_id:(window.OC_SESSION&&window.OC_SESSION.uid)?window.OC_SESSION.uid():null,submitted_at:new Date().toISOString(),case_type:'website_error_report',priority:'normal'};fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){if(r.ok){return r.json().catch(function(){return {};}).then(function(j){var caseId=j&&j.case_id?' (Case '+j.case_id+')':'';s.textContent='Thanks. We will review and follow up.';s.style.color='#1B5E20';setTimeout(close,3000);});}else{throw new Error('endpoint_'+r.status);}}).catch(function(e){var subj='[Olive Cover web feedback] '+(document.title||location.pathname).substring(0,60);var body='--- Please send this email to share the content correction ---\n\nWhat looks incorrect:\n'+what+'\n\nWhat should it say instead:\n'+(should||'(not specified)')+'\n\nPage URL: '+location.href+'\nPage title: '+document.title+'\nReporter email: '+(em||'anonymous')+'\nSession: '+(payload.reporter_session_id||'none')+'\nSubmitted: '+payload.submitted_at;var mail='mailto:website-errors@olivecover.com?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);window.location.href=mail;s.textContent='Opening your email to send the feedback...';s.style.color='#1B5E20';btn2.disabled=false;});});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',inject);}else{inject();}setTimeout(inject,2000);})();

// === ocstateselect.js ===
(function(){var STATES=[['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']];var LICENSED=['GA'];var VER='1.0.14';var FORM_IDS=['oc-lead-form-el','oc-crv-wrap','oc-contact-form-el','oc-wgt-form'];function nameFor(code){for(var i=0;i<STATES.length;i++)if(STATES[i][0]===code)return STATES[i][1];return code;}function lookupState(v){if(!v)return null;v=String(v).toUpperCase().trim();for(var i=0;i<STATES.length;i++){if(STATES[i][0]===v||STATES[i][1].toUpperCase()===v)return STATES[i][0];}return null;}function getInitialState(){var qs=new URLSearchParams(location.search);var found=lookupState(qs.get('state'));if(found){try{localStorage.setItem('oc_state',found);}catch(e){}return found;}var stored;try{stored=localStorage.getItem('oc_state');}catch(e){}if(stored){var s=lookupState(stored);if(s)return s;}return null;}function geoDetect(cb){fetch('https://ipapi.co/json/').then(function(r){return r.ok?r.json():null;}).then(function(j){if(!j){cb(null);return;}var s=lookupState(j.region||j.region_code);if(s){try{localStorage.setItem('oc_state',s);}catch(e){}}cb(s);}).catch(function(){cb(null);});}function updateNotice(wrap,code){var notice=wrap.querySelector('.oc-state-notice');if(!notice)return;if(!code){notice.style.display='none';notice.innerHTML='';return;}var licensed=LICENSED.indexOf(code)>=0;var stateName=nameFor(code);if(licensed){notice.style.cssText='display:block;margin-top:8px;padding:10px 12px;background:#F5EDD8;border-left:3px solid #B8934A;border-radius:4px;font:13px Inter,sans-serif;color:#1B3A5C;line-height:1.5;';notice.innerHTML='<strong>Olive Cover is licensed in '+stateName+'.</strong> We can quote and place coverage today.';}else{notice.style.cssText='display:block;margin-top:8px;padding:10px 12px;background:#FFF7E6;border-left:3px solid #C7A24B;border-radius:4px;font:13px Inter,sans-serif;color:#1B3A5C;line-height:1.5;';notice.innerHTML='<strong>We can answer general insurance questions for '+stateName+'.</strong> Olive Cover places coverage in Georgia today.';}}function buildSelect(current,wrap){var sel=document.createElement('select');sel.name='state';sel.id='oc-state-select';sel.setAttribute('aria-label','Your state');sel.style.cssText='width:100%;padding:10px 12px;font:14px Inter,sans-serif;border:1px solid #cbd5e1;border-radius:4px;background:#fff;color:#1B3A5C;box-sizing:border-box;';var opt0=document.createElement('option');opt0.value='';opt0.textContent='Select your state';sel.appendChild(opt0);STATES.forEach(function(s){var o=document.createElement('option');o.value=s[0];o.textContent=s[1];if(current&&s[0]===current)o.selected=true;sel.appendChild(o);});sel.addEventListener('change',function(){if(this.value){try{localStorage.setItem('oc_state',this.value);}catch(e){}}updateNotice(wrap,this.value);});return sel;}function cleanupOld(){Array.from(document.querySelectorAll('[data-oc-state-wrap]')).forEach(function(w){if(w.getAttribute('data-oc-state-wrap-ver')!==VER&&w.parentNode){w.parentNode.removeChild(w);}});var seen=[];Array.from(document.querySelectorAll('[data-oc-state-wrap]')).forEach(function(w){if(seen.indexOf(w.parentNode)>=0){w.parentNode.removeChild(w);}else{seen.push(w.parentNode);}});}function findFirstFieldContainer(form){var firstField=form.querySelector('input:not([type=hidden]):not([type=submit]):not([type=button]),textarea,select');if(!firstField)return null;var wrap=firstField.closest('div');if(wrap&&wrap.parentElement===form)return wrap;if(wrap)return wrap;return firstField;}function injectDropdown(form,state){cleanupOld();var firstContainer=findFirstFieldContainer(form);if(!firstContainer)return;if(firstContainer.parentNode.querySelector('[data-oc-state-wrap][data-oc-state-wrap-ver="'+VER+'"]'))return;var wrap=document.createElement('div');wrap.setAttribute('data-oc-state-wrap','1');wrap.setAttribute('data-oc-state-wrap-ver',VER);wrap.style.cssText='margin:0 0 16px 0;';var label=document.createElement('label');label.textContent='What state are you in?';label.htmlFor='oc-state-select';label.style.cssText='display:block;font:13px Inter,sans-serif;color:#1B3A5C;margin-bottom:4px;font-weight:600;';wrap.appendChild(label);wrap.appendChild(buildSelect(state,wrap));var notice=document.createElement('div');notice.className='oc-state-notice';notice.style.display='none';wrap.appendChild(notice);firstContainer.parentNode.insertBefore(wrap,firstContainer);if(state)updateNotice(wrap,state);}function run(){var forms=[];FORM_IDS.forEach(function(id){var f=document.getElementById(id);if(f)forms.push(f);});if(!forms.length)return;var initial=getInitialState();if(initial){forms.forEach(function(f){injectDropdown(f,initial);});}else{forms.forEach(function(f){injectDropdown(f,null);});geoDetect(function(detected){if(detected){forms.forEach(function(f){var sel=f.querySelector('#oc-state-select');if(sel&&!sel.value){sel.value=detected;var wrap=sel.closest('[data-oc-state-wrap]');if(wrap)updateNotice(wrap,detected);}});}});}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}setTimeout(run,1500);setTimeout(run,3000);})();

// === occarrierphones.js ===
(function(){var P={"us-assure-builders-risk":"800-987-3373","travelers-commercial-insurance":"1-800-238-6225","hartford-commercial-insurance":"1-800-327-3636","selective-flood-insurance":"877-348-0552","rt-specialty-insurance":"312-784-6001","progressive-commercial-insurance":"1-800-776-4737","pie-insurance":"844-581-0828","philadelphia-insurance":"1-800-765-9749","next-insurance":"1-855-222-5919","nationwide-commercial-insurance":"1-800-421-3535","liberty-mutual-commercial":"800-225-2467","honeycomb-commercial-insurance":"877-414-3815","hanover-commercial-insurance":"800-628-0250","forge-insurance":"202-547-8700","employers-workers-comp":"888-682-6671","cowbell-cyber-insurance":"833-633-8666","coalition-cyber-insurance":"1-833-866-1337","cna-commercial-insurance":"877-262-2727","chubb-commercial-insurance":"1-800-252-4670","bhhc-commercial-insurance":"800-356-5750","berkley-management-protection":"email claims@berkleymp.com","berkley-aspire-insurance":"866-412-7742","amtrust-workers-comp":"888-239-3909","aegis-insurance":"800-233-2160","travelers-insurance":"1-800-252-4633","hartford-insurance":"1-800-243-5860","stillwater-insurance":"800-220-1351","steadily-insurance":"888-966-1611","selective-insurance":"866-455-9969","safeco-insurance":"800-332-3226","rli-insurance":"800-444-0406","progressive-insurance":"1-800-776-4737","openly-insurance":"888-808-4842","nationwide-insurance":"1-800-421-3535","national-general-insurance":"1-800-468-3466","jewelers-mutual-insurance":"888-884-2424","hippo-insurance":"855-999-9746","foremost-insurance":"800-527-3907","chubb-insurance":"1-800-252-4670","branch-insurance":"833-427-2624","aig-insurance":"1-888-760-9195"};function fix(){var m=location.pathname.match(/^\/carriers\/([a-z0-9_-]+)\/?$/i);if(!m)return;var slug=m[1].toLowerCase();var phone=P[slug];var link=document.getElementById('carrier-claims-phone-link');if(phone&&link){if(phone.indexOf('email')===0){link.setAttribute('href','mailto:'+phone.replace(/^email\s+/,''));link.textContent=phone.replace(/^email\s+/,'');}else{var tel=phone.replace(/[^0-9]/g,'');link.setAttribute('href','tel:'+tel);link.textContent=phone;}link.style.setProperty('color','#B8934A','important');link.style.setProperty('font-weight','600','important');}var oldCallout=document.getElementById('oc-agent-callout');if(oldCallout)oldCallout.parentNode.removeChild(oldCallout);var phoneCard=document.getElementById('carrier-claims-phone-card');if(phoneCard&&!document.getElementById('carrier-cs-phone-card')&&phone&&phone.indexOf('email')!==0){var csCard=document.createElement('div');csCard.id='carrier-cs-phone-card';csCard.className='oc-card oc-card-accent-1';csCard.style.cssText='margin-top:16px;';csCard.innerHTML='<h3 class="oc-h3">Customer Service</h3><p class="oc-p oc-claims-phone-label">General inquiries, billing, policy questions:</p><a id="carrier-cs-phone-link" href="tel:'+phone.replace(/[^0-9]/g,'')+'" class="oc-claims-phone-link" style="color:#B8934A;font-weight:600;text-decoration:none;">'+phone+'</a><p style="margin-top:8px;font-size:0.8125rem;color:#1B3A5C;opacity:0.7;line-height:1.5;">Open to anyone. Most carriers handle billing, policy, and claims questions on the same line.</p>';phoneCard.parentNode.insertBefore(csCard,phoneCard.nextSibling);}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}setTimeout(fix,1500);})();

// === occarrierurls.js (v1.0.1 -- render 3 URL buttons on /carriers/{slug} pages) ===
(function(){var U={"aegis-insurance":["https://www.aegislink.com","https://www.aegislink.com/contact-us","https://www.aegisinsurance.com/claims"],"aig-insurance":["https://www.aig.com","https://www.aig.com","https://www.aig.com/home/claims"],"amtrust-workers-comp":["https://amtrustfinancial.com","https://amtrustfinancial.com","https://www.amtrustfinancial.com/claims"],"auto-owners-commercial-insurance":["https://www.auto-owners.com","https://www.auto-owners.com/contact-us","https://www.auto-owners.com/insurance/claims"],"auto-owners-insurance":["https://www.auto-owners.com","https://www.auto-owners.com/contact-us","https://www.auto-owners.com/insurance/claims"],"berkley-aspire-insurance":["https://berkleyaspire.com","https://berkleyaspire.com","https://www.berkleyaspire.com/claims/"],"berkley-management-protection":["https://www.berkleymp.com","https://www.berkleymp.com/contact/","https://www.berkleymp.com/contact/"],"bhhc-commercial-insurance":["https://www.bhhc.com","https://www.bhhc.com/contact","https://www.bhhc.com/claims"],"branch-insurance":["https://www.ourbranch.com","https://www.ourbranch.com","https://app.ourbranch.com/"],"chubb-commercial-insurance":["https://www.chubb.com","https://www.chubb.com","https://www.chubb.com/us-en/claims/"],"chubb-insurance":["https://www.chubb.com","https://www.chubb.com","https://www.chubb.com/us-en/claims/"],"cincinnati-commercial-insurance":["https://www.cinfin.com","https://www.cinfin.com/contact-us","https://www.cinfin.com/insurance/business/claims"],"cincinnati-insurance":["https://www.cinfin.com","https://www.cinfin.com/contact-us","https://www.cinfin.com/insurance/personal/claims"],"cna-commercial-insurance":["https://www.cna.com","https://www.cna.com/web/guest/cna/contact-us","https://www.cna.com/web/guest/cna/claims"],"coalition-cyber-insurance":["https://www.coalitioninc.com","https://www.coalitioninc.com/contact","https://www.coalitioninc.com/claims"],"cowbell-cyber-insurance":["https://cowbell.insure","https://cowbell.insure/contact","https://www.cowbell.insure/claims"],"employers-workers-comp":["https://www.employers.com","https://www.employers.com/contact-us","https://www.employers.com/claims"],"encompass-insurance":["https://www.encompassinsurance.com","https://www.encompassinsurance.com/customer-service","https://www.encompassinsurance.com/claims"],"fcci-commercial-insurance":["https://www.fcci-group.com","https://www.fcci-group.com/contact-us","https://www.fcci-group.com/claims"],"foremost-insurance":["https://www.foremost.com","https://www.foremost.com","https://www.foremost.com/claims"],"forge-insurance":["https://www.forgeinsurance.com","https://forgeinsurance.com/contact","https://forgeinsurance.com/claims"],"hanover-commercial-insurance":["https://www.hanover.com","https://www.hanover.com","https://www.hanover.com/claims/report-a-claim.html"],"hanover-insurance":["https://www.hanover.com","https://www.hanover.com","https://www.hanover.com/claims/report-a-claim.html"],"hartford-commercial-insurance":["https://www.thehartford.com","https://www.thehartford.com/business-insurance/customer-service","https://www.thehartford.com/claims"],"hartford-insurance":["https://www.thehartford.com","https://www.thehartford.com/contact-us","https://www.thehartford.com/claims"],"hippo-insurance":["https://www.hippo.com","https://www.hippo.com/contact-us","https://myhippo.com/claims"],"honeycomb-commercial-insurance":["https://www.honeycombinsurance.com","https://honeycombinsurance.com/contact","https://www.honeycombinsurance.com/claims"],"jewelers-mutual-insurance":["https://www.jewelersmutual.com","https://www.jewelersmutual.com/contact-us","https://www.jewelersmutual.com/claims"],"liberty-mutual-commercial":["https://business.libertymutual.com","https://business.libertymutual.com/contact-us/","https://www.libertymutual.com/claims"],"markel-commercial-insurance":["https://www.markel.com","https://www.markel.com/contact-us","https://www.markel.com/insurance/claims"],"national-general-insurance":["https://www.nationalgeneral.com","https://www.nationalgeneral.com","https://www.nationalgeneral.com/claims"],"nationwide-commercial-insurance":["https://www.nationwide.com/business","https://www.nationwide.com/business","https://www.nationwide.com/business/claims/"],"nationwide-insurance":["https://www.nationwide.com","https://www.nationwide.com/personal/contact","https://www.nationwide.com/personal/claims/"],"next-insurance":["https://www.nextinsurance.com","https://www.nextinsurance.com/contact","https://www.next-insurance.com/claims/"],"openly-insurance":["https://openly.com","https://openly.com/contact","https://www.openly.com/claims"],"philadelphia-insurance":["https://www.phly.com","https://www.phly.com","https://www.phly.com/claims/reportAClaim.aspx"],"pie-insurance":["https://pieinsurance.com","https://pieinsurance.com","https://www.nationwide.com/personal/claims/"],"progressive-commercial-insurance":["https://www.progressivecommercial.com","https://www.progressivecommercial.com/contact-us/","https://www.phly.com/claims/reportAClaim.aspx"],"progressive-insurance":["https://www.progressive.com","https://www.progressive.com/manage-policy/","https://www.progressive.com/claims/"],"pure-insurance":["https://www.pureinsurance.com","https://www.pureinsurance.com/contact-us","https://www.pureinsurance.com/claims"],"rli-insurance":["https://www.rlicorp.com","https://www.rlicorp.com/contact","https://www.rlicorp.com/claims"],"rt-specialty-insurance":["https://rtspecialty.com","https://rtspecialty.com/contact","https://rtspecialty.com/report-a-claim/"],"safeco-insurance":["https://www.safeco.com","https://customer.safeco.com","https://www.safeco.com/claims"],"selective-flood-insurance":["https://www.selective.com","https://www.selective.com/contact-us","https://www.selective.com/claims"],"selective-insurance":["https://www.selective.com","https://www.selective.com/contact-us","https://www.selective.com/claims"],"steadily-insurance":["https://www.steadily.com","https://www.steadily.com/contact","https://www.steadily.com/claims"],"stillwater-insurance":["https://www.stillwaterinsurance.com","https://www.stillwaterinsurance.com/Customer-Service","https://www.stillwaterinsurance.com/claims"],"travelers-commercial-insurance":["https://www.travelers.com/business-insurance","https://www.travelers.com/contact-us","https://www.travelers.com/claims"],"travelers-insurance":["https://www.travelers.com","https://www.travelers.com/contact-us","https://www.travelers.com/claims"],"us-assure-builders-risk":["https://www.usassure.com","https://www.usassure.com/contact-us/","https://www.usassure.com/claims"],"zurich-commercial-insurance":["https://www.zurichna.com","https://www.zurichna.com/contact-us","https://www.zurichna.com/claims"]};var N={"aegis-insurance":"AEGIS","aig-insurance":"AIG","amtrust-workers-comp":"AmTrust","auto-owners-commercial-insurance":"Auto-Owners","auto-owners-insurance":"Auto-Owners","berkley-aspire-insurance":"Berkley Aspire","berkley-management-protection":"Berkley Management Protection","bhhc-commercial-insurance":"BHHC","branch-insurance":"Branch","chubb-commercial-insurance":"Chubb Commercial","chubb-insurance":"Chubb","cincinnati-commercial-insurance":"Cincinnati","cincinnati-insurance":"Cincinnati","cna-commercial-insurance":"CNA","coalition-cyber-insurance":"Coalition","cowbell-cyber-insurance":"Cowbell Cyber","employers-workers-comp":"Employers","encompass-insurance":"Encompass","fcci-commercial-insurance":"FCCI","foremost-insurance":"Foremost Signature/Star","forge-insurance":"Forge","hanover-commercial-insurance":"Hanover","hanover-insurance":"Hanover","hartford-commercial-insurance":"The Hartford","hartford-insurance":"The Hartford","hippo-insurance":"Hippo","honeycomb-commercial-insurance":"Honeycomb","jewelers-mutual-insurance":"Jewelers Mutual","liberty-mutual-commercial":"Liberty Mutual","markel-commercial-insurance":"Markel","national-general-insurance":"National General","nationwide-commercial-insurance":"Nationwide","nationwide-insurance":"Nationwide","next-insurance":"Next Insurance","openly-insurance":"Openly","philadelphia-insurance":"Philadelphia","pie-insurance":"Pie Insurance","progressive-commercial-insurance":"Progressive","progressive-insurance":"Progressive","pure-insurance":"PURE","rli-insurance":"RLI","rt-specialty-insurance":"RT Specialty","safeco-insurance":"Safeco","selective-flood-insurance":"Selective","selective-insurance":"Selective","steadily-insurance":"Steadily","stillwater-insurance":"Stillwater","travelers-commercial-insurance":"Travelers","travelers-insurance":"Travelers","us-assure-builders-risk":"US Assure","zurich-commercial-insurance":"Zurich"};function fix(){var m=location.pathname.match(/^\/carriers\/([a-z0-9_-]+)\/?$/i);if(!m)return;var slug=m[1].toLowerCase();var urls=U[slug];if(!urls)return;var anchor=document.getElementById('carrier-cs-phone-card')||document.getElementById('carrier-claims-phone-card');if(!anchor)return;if(document.getElementById('carrier-urls-card'))return;var card=document.createElement('div');card.id='carrier-urls-card';card.className='oc-card oc-card-accent-1';card.style.cssText='margin-top:16px;padding:20px 22px;background:#fff;border:1px solid #C7A24B;border-radius:8px;font-family:Inter,sans-serif;';var brandName=N[slug];if(!brandName){var name=document.querySelector('#carrier-hero-h1')||document.querySelector('h1');brandName=name?name.textContent.split('|')[0].replace(/\s+Review\s*$/i,'').trim():'this carrier';}var labels=['Visit '+brandName+' website','Log in / Customer service','File a claim'];var hrefs=urls;var html='<h3 class="oc-h3" style="margin:0 0 10px;font-family:Playfair Display,serif;color:#1B3A5C;font-size:1rem;font-weight:600;">Useful '+brandName+' links</h3><p style="margin:0 0 14px;font-size:0.8125rem;color:#1B3A5C;opacity:0.75;line-height:1.5;">Direct links for general info, account access, and claim filing. Open in a new tab.</p><div style="display:flex;flex-direction:column;gap:8px;">';for(var i=0;i<3;i++){if(!hrefs[i])continue;html+='<a href="'+hrefs[i]+'" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#F5EDD8;color:#1B3A5C;text-decoration:none;border-radius:6px;font-size:0.875rem;font-weight:500;transition:background 0.15s;" onmouseover="this.style.background=\'#EDE3C8\'" onmouseout="this.style.background=\'#F5EDD8\'"><span>'+labels[i]+'</span><span style="color:#B8934A;font-weight:600;">&rarr;</span></a>';}html+='</div>';card.innerHTML=html;anchor.parentNode.insertBefore(card,anchor.nextSibling);}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}setTimeout(fix,1500);setTimeout(fix,3000);})();


// === ocmobile.js (v1.0.1 -- mobile UX optimization for viewports <= 767px) ===
(function(){
  var APPLIED_AT = 0;
  function isMobile(){ return window.innerWidth <= 767; }
  function fix(){
    if(!isMobile()) return;
    var now = Date.now();
    if(now - APPLIED_AT < 250) return;
    APPLIED_AT = now;
    document.body.style.setProperty('overflow-x','hidden','important');
    document.documentElement.style.setProperty('overflow-x','hidden','important');
    document.querySelectorAll('input, textarea, select').forEach(function(el){
      if(el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return;
      var fs = parseFloat(window.getComputedStyle(el).fontSize);
      if(fs < 16) el.style.setProperty('font-size','16px','important');
    });
    document.querySelectorAll('h1').forEach(function(h){
      var fs = parseFloat(window.getComputedStyle(h).fontSize);
      if(fs > 36) h.style.setProperty('font-size','32px','important');
      h.style.setProperty('line-height','1.2','important');
    });
    document.querySelectorAll('h2').forEach(function(h){
      var fs = parseFloat(window.getComputedStyle(h).fontSize);
      if(fs > 28) h.style.setProperty('font-size','24px','important');
      h.style.setProperty('line-height','1.25','important');
    });
    document.querySelectorAll('img, iframe, video').forEach(function(el){
      el.style.setProperty('max-width','100%','important');
      if(el.tagName === 'IMG' && !el.style.height) el.style.setProperty('height','auto','important');
    });
    // 5b. Cap nav logo size on mobile so it does not dominate the bar
    var nav = document.getElementById('oc-nav');
    if(nav){
      nav.querySelectorAll('img').forEach(function(im){
        var src = (im.src||'').toLowerCase();
        if(src.indexOf('logo') >= 0 || src.indexOf('olive_logo') >= 0){
          im.style.setProperty('max-height','32px','important');
          im.style.setProperty('max-width','96px','important');
          im.style.setProperty('width','auto','important');
          im.style.setProperty('height','auto','important');
          var p = im.parentElement;
          while(p && p !== nav){
            if(p.tagName === 'A' || p.tagName === 'DIV'){
              p.style.setProperty('flex-shrink','0','important');
            }
            p = p.parentElement;
          }
        }
      });
    }
    document.querySelectorAll('table').forEach(function(t){
      if(t.parentNode && t.parentNode.getAttribute('data-oc-table-wrap') === '1') return;
      var wrap = document.createElement('div');
      wrap.setAttribute('data-oc-table-wrap','1');
      wrap.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%;';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });
    document.querySelectorAll('.oc-hero-cta-primary, .oc-hero-cta-secondary, .oc-cov2-cta-primary, .oc-cov2-cta-secondary, .oc-cta-btn-1, .oc-cov-fcta-btn, .ch-btn-gold, .oc-fcta-btn, .oc-pi-cta-btn, .oc-mobile-cta').forEach(function(b){
      b.style.setProperty('width','100%','important');
      b.style.setProperty('min-width','0','important');
      b.style.setProperty('max-width','none','important');
    });
    document.querySelectorAll('section, [class*="oc-sec-"], [id^="oc-"][class*="section"]').forEach(function(s){
      var cs = window.getComputedStyle(s);
      var pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
      if(pl < 16) s.style.setProperty('padding-left','16px','important');
      if(pr < 16) s.style.setProperty('padding-right','16px','important');
    });
    var fb = document.getElementById('oc-fb-link');
    var sticky = document.querySelector('.oc-sticky-mobile-bar');
    if(sticky){
      sticky.style.setProperty('display','flex','important');
      sticky.style.setProperty('gap','8px','important');
      sticky.style.setProperty('padding','8px','important');
      sticky.querySelectorAll('a, button').forEach(function(b){
        b.style.setProperty('flex','1 1 0','important');
        b.style.setProperty('min-width','0','important');
        b.style.setProperty('height','44px','important');
        b.style.setProperty('font-size','14px','important');
      });
      var stickyH = sticky.getBoundingClientRect().height || 64;
      if(fb) fb.style.setProperty('bottom', (stickyH + 12) + 'px', 'important');
      document.body.style.setProperty('padding-bottom', stickyH + 'px', 'important');
    }
    if(window.innerWidth < 480 && fb){
      fb.style.setProperty('padding','6px 10px','important');
      fb.style.setProperty('font-size','11px','important');
    }
    document.querySelectorAll('.oc-nav-panel, [id*="ocn-item-"][id$="-panel"]').forEach(function(p){
      p.style.setProperty('max-width','calc(100vw - 32px)','important');
      p.style.setProperty('box-sizing','border-box','important');
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fix);
  } else {
    fix();
  }
  setTimeout(fix, 1500);
  setTimeout(fix, 3000);
  window.addEventListener('resize', fix);
  window.addEventListener('orientationchange', fix);
})();


// === ocfaqschema.js (v1.0.0 -- emit FAQPage JSON-LD from DOM FAQs) ===
(function(){
  function build(){
    if(document.getElementById('oc-faq-schema')) return;
    // Skip if any existing FAQPage JSON-LD is already on the page
    var existing = document.querySelectorAll('script[type="application/ld+json"]');
    for(var i=0;i<existing.length;i++){
      var t = (existing[i].textContent||'');
      if(/"@type"\s*:\s*"FAQPage"/.test(t)) return;
    }
    // Collect Q/A pairs from common FAQ patterns
    var pairs = [];
    var qs = document.querySelectorAll('.oc-faq-q, .oc-faq-short-q, .oc-ifaq-q, .oc-fqc-q');
    qs.forEach(function(q){
      var qText = (q.textContent||'').trim();
      if(qText.length < 8 || qText.length > 200) return;
      var aText = null;
      var p = q.parentElement;
      if(p){
        var aEl = p.querySelector('.oc-faq-a, .oc-faq-short-a, .oc-ifaq-a, .oc-fqc-a');
        if(aEl) aText = (aEl.textContent||'').trim();
      }
      if(!aText){
        var next = q.nextElementSibling;
        while(next && !aText){
          var c = (next.className||'').toString();
          if(/oc-(faq|ifaq|fqc).*-(a|short-a)/i.test(c)) aText = (next.textContent||'').trim();
          next = next.nextElementSibling;
        }
      }
      if(aText && aText.length >= 20 && aText.length <= 2000){
        pairs.push({ q: qText, a: aText });
      }
    });
    if(pairs.length === 0) return;
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': pairs.map(function(p){
        return {
          '@type': 'Question',
          'name': p.q,
          'acceptedAnswer': { '@type': 'Answer', 'text': p.a }
        };
      })
    };
    var s = document.createElement('script');
    s.id = 'oc-faq-schema';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(build, 500); });
  } else {
    setTimeout(build, 500);
  }
  setTimeout(build, 2000);
  setTimeout(build, 4000);
})();


// === ocbreadcrumb.js (v1.0.2 -- hotfix: remove broken H1 fallback block) ===
(function(){
  function build(){
    if(document.getElementById('oc-breadcrumb-schema')) return;
    // Skip if BreadcrumbList already present
    var existing = document.querySelectorAll('script[type="application/ld+json"]');
    for(var i=0;i<existing.length;i++){
      if(/"@type"\s*:\s*"BreadcrumbList"/.test(existing[i].textContent||'')) return;
    }
    var nav = document.querySelector('.oc-breadcrumb');
    if(!nav) return;
    var items = [];
    nav.querySelectorAll('.oc-breadcrumb-item').forEach(function(li){
      var a = li.querySelector('a');
      var text = (li.textContent||'').trim();
      if(!text) return;
      var href = a ? a.getAttribute('href') : null;
      items.push({ name: text, href: href });
    });
    if(items.length === 0) return;
    // Append current page as final crumb -- use document.title (split on '|') 
    var pageTitle = (document.title || '').split('|')[0].split(' - ')[0].trim();
    if(pageTitle && !items.some(function(it){ return it.name === pageTitle; })){
      items.push({ name: pageTitle, href: location.pathname });
    }
    var origin = location.protocol + '//' + location.host;
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map(function(it, i){
        var url = it.href ? (it.href.indexOf('http')===0 ? it.href : origin + it.href) : null;
        var entry = { '@type': 'ListItem', position: i+1, name: it.name };
        if(url) entry.item = url;
        return entry;
      })
    };
    var s = document.createElement('script');
    s.id = 'oc-breadcrumb-schema';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(build, 400); });
  } else {
    setTimeout(build, 400);
  }
  setTimeout(build, 1800);
})();


// === ocstep4reorder.js (v1.0.1 -- upload + textarea on top, dec/policy side-by-side) ===
(function(){
  if(location.pathname.replace(/\/$/,'') !== '/coverage-review') return;
  function run(){
    var p4 = document.getElementById('oc-crv-p4');
    if(!p4) return;
    if(p4.getAttribute('data-oc-step4-reordered') === '1') return;
    var shared = document.getElementById('oc-crv-p4-shared');
    if(!shared) return;
    // Find boundary: H4 with text "Current coverage"
    var boundary = null;
    var kids = Array.from(shared.children);
    for(var i = 0; i < kids.length; i++){
      if(/h[1-6]/i.test(kids[i].tagName) && /current\s+coverage/i.test(kids[i].textContent || '')){
        boundary = i; break;
      }
    }
    if(boundary === null || boundary === 0) return;
    // Children 0..boundary-1 are the upload section + textarea + descriptions
    var toMove = kids.slice(0, boundary);
    if(toMove.length === 0) return;
    // Create new wrapper at top of p4 (after panel H3 title)
    var intro = document.createElement('div');
    intro.id = 'oc-crv-p4-intro';
    intro.setAttribute('data-oc-step4-intro', '1');
    // Move the nodes
    toMove.forEach(function(n){ intro.appendChild(n); });
    // Insert after panel title (first H heading direct child of p4)
    var title = null;
    Array.from(p4.children).forEach(function(c){
      if(!title && /h[1-6]/i.test(c.tagName)) title = c;
    });
    if(title && title.nextSibling){
      p4.insertBefore(intro, title.nextSibling);
    } else {
      p4.insertBefore(intro, p4.firstChild);
    }
    p4.setAttribute('data-oc-step4-reordered', '1');
    // v1.0.1: wrap dec + policy upload areas in a flex row for side-by-side
    var dec = document.getElementById('oc-crv-dec-area');
    var pol = document.getElementById('oc-crv-pol-area');
    if(dec && pol && dec.parentNode === pol.parentNode && !document.getElementById('oc-crv-upload-row')){
      var row = document.createElement('div');
      row.id = 'oc-crv-upload-row';
      row.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;margin:0 0 16px 0;';
      dec.parentNode.insertBefore(row, dec);
      [dec, pol].forEach(function(el){
        el.style.setProperty('flex','1 1 240px','important');
        el.style.setProperty('min-width','0','important');
        el.style.setProperty('margin','0','important');
        row.appendChild(el);
      });
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(run, 300); });
  } else {
    setTimeout(run, 300);
  }
  setTimeout(run, 1500);
})();

// === ocwgthealer.js ===
(function(){var GOOD_SHA='e83190096165ffa9585c8d9af5e6cac3604c5bc4';function heal(){var r=document.getElementById('oc-widget-root');if(r&&r.getAttribute('data-wgt-ver')==='2.16.0')return;var bad=document.querySelectorAll('script[src*="ocreposit"][src*="ocwidget.js"]');var goodLoaded=false;bad.forEach(function(s){if(s.src.indexOf(GOOD_SHA)>=0)goodLoaded=true;});if(goodLoaded)return;if(r)r.parentNode.removeChild(r);bad.forEach(function(s){if(s.src.indexOf(GOOD_SHA)<0)s.parentNode.removeChild(s);});var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/manand2020/ocreposit@'+GOOD_SHA+'/ocwidget.js?v=2.16.0&r='+Date.now();s.async=true;document.head.appendChild(s);}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(heal,800);});}else{setTimeout(heal,800);}setTimeout(heal,3500);setTimeout(heal,6000);})();

// === ocstylefixes.js ===
(function(){function fixInvalidJsonLd(){document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){var c=(s.textContent||'').trim();if(c.indexOf('&quot;')<0)return;var d=c.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'");try{JSON.parse(d);var n=document.createElement('script');n.type='application/ld+json';n.textContent=d;s.parentNode.replaceChild(n,s);}catch(e){}});}function hideFaqSlugs(){document.querySelectorAll('.oc-faq-slug').forEach(function(el){el.style.setProperty('display','none','important');});}function fixHomepageSpacing(){if(location.pathname.replace(/\/$/,'')!=='')return;var targets=[{sel:'.oc-hp-aware-section',pv:'64px',ph:'24px'},{sel:'.oc-crt-section',pv:'48px',ph:'24px'},{sel:'.oc-sp-wrap-1',pv:'64px',ph:'20px'},{sel:'.oc-gaps-section',pv:'64px',ph:'24px'},{sel:'.oc-steps-section',pv:'64px',ph:'24px'},{sel:'.oc-recog-section',pv:'64px',ph:'20px'}];targets.forEach(function(t){var el=document.querySelector(t.sel);if(el){el.style.setProperty('padding-top',t.pv,'important');el.style.setProperty('padding-bottom',t.pv,'important');el.style.setProperty('padding-left',t.ph,'important');el.style.setProperty('padding-right',t.ph,'important');}});}function fixDescribeCards(){if(location.pathname.replace(/\/$/,'')!=='')return;document.querySelectorAll('.oc-recog-card-body').forEach(function(el){var t=(el.textContent||'').trim();if(t.indexOf('A client or partner is asking')===0&&t.indexOf('Most business owners do not until')>0){el.textContent='A client or partner is asking for proof of coverage. Do you know immediately what your policy covers, what its limits are, and whether those limits are sufficient for the work you do?';}});}function fixCrvHeroBg(){if(location.pathname.replace(/\/$/,'')!=='/coverage-review')return;var hero=document.querySelector('.oc-crv-hero');if(!hero)return;var imgraw=document.querySelector('imgraw[data-raw-src*="hero-coverage-review"], imgraw[data-raw-src*="hero-crv"], imgraw[data-raw-src*="coverage-review"], img[src*="hero-coverage-review"]');if(!imgraw)imgraw=Array.from(document.querySelectorAll('imgraw')).find(function(i){var s=i.getAttribute('data-raw-src')||'';return s.indexOf('hero')>=0;});if(!imgraw)return;var imgUrl=imgraw.getAttribute('data-raw-src')||imgraw.src||imgraw.getAttribute('src');if(!imgUrl)return;imgraw.style.setProperty('display','none','important');hero.style.setProperty('background-image','linear-gradient(105deg, rgba(27,58,92,0.88) 0%, rgba(27,58,92,0.55) 50%, rgba(27,58,92,0.30) 100%), url("'+imgUrl+'")','important');hero.style.setProperty('background-size','cover','important');hero.style.setProperty('background-position','center','important');hero.style.setProperty('background-repeat','no-repeat','important');}function fixPiPage(){if(location.pathname.replace(/\/$/,'')!=='/personal-insurance')return;var prodnav=document.querySelector('.oc-pi-prodnav-inner')||document.querySelector('.oc-pi-prodnav')||document.getElementById('oc-pi-prodnav');if(prodnav){var holder=prodnav.closest('section')||prodnav.parentElement;if(holder&&(holder.className||'').indexOf('oc-pi-prodnav')>=0){holder.style.setProperty('display','none','important');}else{prodnav.style.setProperty('display','none','important');}}var pills=document.querySelectorAll('.oc-pi-hero-pills .oc-pi-hero-pill');if(pills.length){var pwrap=pills[0].parentElement;if(pwrap){pwrap.style.setProperty('display','flex','important');pwrap.style.setProperty('flex-wrap','wrap','important');pwrap.style.setProperty('gap','10px','important');pwrap.style.setProperty('align-items','center','important');pwrap.style.setProperty('margin-bottom','20px','important');}var ctaRow=document.querySelector('.oc-hero-cta-row');if(ctaRow){ctaRow.style.setProperty('margin-top','20px','important');ctaRow.style.setProperty('display','flex','important');ctaRow.style.setProperty('flex-wrap','wrap','important');ctaRow.style.setProperty('gap','12px','important');ctaRow.style.setProperty('align-items','center','important');}var cleanText=function(s){return s.replace(/[·•]\s*[A-Z][A-Za-z]+\s+\d{4}/g,'').replace(/[\u{1F300}-\u{1F9FF}⏩-⏺⏰-⏳⚠-⛿✀-➿]/gu,'').replace(/\s+/g,' ').trim();};pills.forEach(function(p){var walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT,null);var nodes=[];var n;while((n=walker.nextNode()))nodes.push(n);nodes.forEach(function(tn){var t=cleanText(tn.nodeValue);if(t!==tn.nodeValue){tn.nodeValue=t;}});p.style.setProperty('flex','0 0 auto','important');p.style.setProperty('display','inline-flex','important');p.style.setProperty('align-items','center','important');p.style.setProperty('justify-content','center','important');p.style.setProperty('text-align','center','important');p.style.setProperty('padding','8px 16px','important');p.style.setProperty('white-space','nowrap','important');p.style.setProperty('line-height','1.4','important');p.style.setProperty('height','44px','important');p.style.setProperty('min-height','44px','important');p.style.setProperty('max-height','44px','important');p.style.setProperty('box-sizing','border-box','important');p.style.setProperty('font-size','13px','important');});}}function fixHeroPhotos(){document.querySelectorAll('[class*="oc-hero-photo"]').forEach(function(b){var c=b.className||'';if(typeof c!=='string'||!/(^|\s)oc-hero-photo([\-\s]|$)/.test(c))return;var i=b.querySelector('imgraw[data-raw-src], img[src]');var u=null;if(i){u=i.getAttribute('data-raw-src')||i.getAttribute('src');}var h=b.querySelector('h1')?b:null;if(!h){var p=b.parentElement;while(p&&p!==document.body){var pc=p.className||'';if(typeof pc==='string'&&/\b[a-z]*hero[a-z0-9\-]*\b/.test(pc)){h=p;break;}p=p.parentElement;}}if(h&&u){h.style.setProperty('background-image','linear-gradient(105deg, rgba(27,58,92,0.88) 0%, rgba(27,58,92,0.55) 50%, rgba(27,58,92,0.30) 100%), url("'+u+'")','important');h.style.setProperty('background-size','cover','important');h.style.setProperty('background-position','center','important');h.style.setProperty('background-repeat','no-repeat','important');if(h===b){b.querySelectorAll('imgraw, img').forEach(function(im){var s=im.getAttribute('data-raw-src')||im.getAttribute('src')||'';if(/\bhero/i.test(s))im.style.setProperty('display','none','important');});}else{b.style.setProperty('display','none','important');}}else{b.style.setProperty('display','none','important');}});}function fixCoverageHero(){if(location.pathname.replace(/\/$/,'')!=='/coverage')return;var sub=document.querySelector('.oc-cov2-sub');if(sub&&sub.textContent.indexOf('This guide explains how')===0){sub.textContent='A plain-language guide to coverage, exclusions, and the gaps that cost people money.';}var caption=document.querySelector('.oc-cov2-q-caption');if(caption)caption.style.setProperty('display','none','important');var qLabel=document.querySelector('.oc-cov2-q-label');if(qLabel){qLabel.style.setProperty('font-size','0.875rem','important');qLabel.style.setProperty('opacity','0.85','important');qLabel.style.setProperty('letter-spacing','0.05em','important');qLabel.style.setProperty('text-transform','uppercase','important');qLabel.style.setProperty('margin-bottom','12px','important');}var qList=document.querySelector('.oc-cov2-q-list');if(qList)qList.style.setProperty('gap','8px','important');var qBlock=document.querySelector('.oc-cov2-q-block');if(qBlock)qBlock.style.setProperty('margin-top','32px','important');var ctaRow=document.querySelector('.oc-cov2-cta-row');if(ctaRow)ctaRow.style.setProperty('margin-top','24px','important');}var INS_STATE_NOTES={'/insurance/home-auto-bundle':'How bundling works in Georgia. Nationwide and Travelers consistently offer the largest multi-policy discounts in metro Atlanta, often 15 to 20 percent on the combined premium. Progressive is competitive on auto in Georgia and pairs reasonably on home, with a single-event deductible waiver when storm damage hits both policies. Branch and Hippo are strong bundle options for newer suburban homes in Forsyth, Gwinnett, and Cherokee counties. North Atlanta homes built before 2000 may price better with Travelers or Nationwide. Coastal Georgia properties may need a separate surplus lines homeowners carrier; splitting is normal there. We run both scenarios every time and show you the actual numbers.'};function fixInsState(){var path=location.pathname.replace(/\/$/,'');var note=INS_STATE_NOTES[path];if(!note)return;var section=document.getElementById('ins-state-notes');if(!section)return;var empty=section.querySelector('.w-dyn-empty');if(empty){var p=document.createElement('p');p.style.cssText='font-family:Inter,sans-serif;color:#1B3A5C;line-height:1.6;font-size:1rem;margin:0;';p.textContent=note;empty.parentNode.replaceChild(p,empty);}}function fixITCards(){if(location.pathname.replace(/\/$/,'')!=='/insurance-terms')return;document.querySelectorAll('.oc-it-card').forEach(function(c){c.style.setProperty('height','500px','important');c.style.setProperty('display','flex','important');c.style.setProperty('flex-direction','column','important');c.style.setProperty('overflow','hidden','important');var desc=c.querySelector('p');if(desc){desc.style.setProperty('display','-webkit-box','important');desc.style.setProperty('-webkit-line-clamp','9','important');desc.style.setProperty('-webkit-box-orient','vertical','important');desc.style.setProperty('overflow','hidden','important');}var cat=c.querySelector('.oc-it-card-cat');if(cat){cat.style.setProperty('margin-top','auto','important');cat.style.setProperty('align-self','flex-start','important');}});}var CTA_SEL='a[href="/coverage-review"].oc-cta-btn-1,a[href="/coverage-review"].oc-cov-fcta-btn,a[href="/coverage-review"].ch-btn-gold,a[href="/coverage-review"].oc-fcta-btn,a[href="/coverage-review"].oc-pi-cta-btn,a[href="/coverage-review"].oc-mobile-cta';function fixCTA(){document.querySelectorAll(CTA_SEL).forEach(function(b){if(b.classList.contains('oc-hero-cta-primary'))return;if(b.classList.contains('oc-cov2-cta-primary'))return;b.style.setProperty('background','#B8934A','important');b.style.setProperty('color','#FFFFFF','important');b.style.setProperty('padding','14px 28px','important');b.style.setProperty('border-radius','6px','important');b.style.setProperty('font-family','Inter,sans-serif','important');b.style.setProperty('font-weight','600','important');b.style.setProperty('font-size','16px','important');b.style.setProperty('text-decoration','none','important');b.style.setProperty('display','inline-block','important');b.style.setProperty('border','0','important');b.style.setProperty('text-align','center','important');b.style.setProperty('line-height','1.4','important');if(!b.getAttribute('data-oc-cta-hover')){b.setAttribute('data-oc-cta-hover','1');b.addEventListener('mouseenter',function(){this.style.setProperty('background','#C7A24B','important');});b.addEventListener('mouseleave',function(){this.style.setProperty('background','#B8934A','important');});}});}function fixSearch(){if(location.pathname!=='/search')return;document.querySelectorAll('.search-result-item-2, [class*="search-result-item"]').forEach(function(item){var a=item.querySelector('a.search-result-title, a[class*="search-result-title"]');if(!a)return;var urlDiv=a.nextElementSibling;if(!urlDiv)return;var urlText=(urlDiv.textContent||'').trim();var m=urlText.match(/olivecover\.com(\/.*)$/i);if(!m){m=urlText.match(/(\/[a-z0-9_\-]+(?:\/[a-z0-9_\-]+)*)/i);}if(m){var path=m[1];if(path.indexOf('/insurance-state-data/')===0||path.indexOf('/state-insurance-notes/')===0){item.style.setProperty('display','none','important');return;}if(a.getAttribute('href')==='#'||!a.getAttribute('href')){a.setAttribute('href',path);}}});}function decpageReplace(){var skipPaths=['/insurance-terms','/insights/what-is-a-declarations-page'];for(var i=0;i<skipPaths.length;i++){if(location.pathname.indexOf(skipPaths[i])===0)return;}var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentElement;if(!p)return NodeFilter.FILTER_REJECT;if(p.closest('.oc-term-card,.oc-term-related-card,.oc-it-card,script,style'))return NodeFilter.FILTER_REJECT;return /dec page/i.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});var node;while((node=walker.nextNode())){node.nodeValue=node.nodeValue.replace(/\bdec pages\b/gi,'declarations pages').replace(/\bdec page\b/gi,'declarations page');}}function fixCRQCTA(){var CRQ_PATHS=['/personal-insurance','/insurance/auto-insurance','/insurance/homeowners-insurance','/insurance/home-auto-bundle'];var path=location.pathname.replace(/\/$/,'');var state='';try{state=(localStorage.getItem('oc_state')||'').toUpperCase().trim();}catch(e){}if(state&&state!=='GA')return;if(path===''){if(document.querySelector('a.oc-crq-cta-link'))return;var hp1=document.querySelector('.oc-hero-cta-primary');if(!hp1)return;var insertAfter=hp1.parentNode;var link=document.createElement('a');link.className='oc-crq-cta-link';link.href='/auto-home-quote';link.rel='noopener';link.textContent='Or skip ahead and get detailed quotes →';link.style.cssText='display:inline-block;margin-top:16px;font-family:Inter,sans-serif;font-size:14px;color:#B8934A;text-decoration:underline;text-underline-offset:3px;font-weight:500;cursor:pointer;';link.addEventListener('click',function(){try{if(window.gtag){gtag('event','crq_click',{page:location.pathname,placement:'homepage_link',state:state||'unknown'});}}catch(e){}});if(insertAfter.parentNode){insertAfter.parentNode.insertBefore(link,insertAfter.nextSibling);}return;}if(CRQ_PATHS.indexOf(path)<0)return;if(document.querySelector('a.oc-crq-cta'))return;var anchorEl=document.querySelector('.oc-hero-cta-row')||document.querySelector('#ins-cta .oc-cta-btn-1')||document.querySelector('.oc-hero-cta-primary')||document.querySelector('#ins-cta')||document.querySelector('.oc-pi-cta-btn');if(!anchorEl)return;var insertInto=anchorEl.parentNode;var insertBefore=anchorEl.nextSibling;if(anchorEl.classList&&anchorEl.classList.contains('oc-hero-cta-row')){insertInto=anchorEl;insertBefore=null;}var btn=document.createElement('a');btn.className='oc-crq-cta';btn.href='/auto-home-quote';btn.rel='noopener';btn.textContent='Start a Detailed Quote';btn.style.cssText='display:inline-flex;align-items:center;justify-content:center;height:44px;min-height:44px;max-height:44px;padding:0 22px;background:transparent;border:1px solid #B8934A;color:#B8934A;font-family:Inter,sans-serif;font-weight:600;font-size:14px;line-height:1;text-decoration:none;border-radius:6px;box-sizing:border-box;white-space:nowrap;text-align:center;margin:8px 0 0 8px;cursor:pointer;';btn.addEventListener('mouseenter',function(){this.style.setProperty('background','#B8934A','important');this.style.setProperty('color','#FFFFFF','important');});btn.addEventListener('mouseleave',function(){this.style.setProperty('background','transparent','important');this.style.setProperty('color','#B8934A','important');});btn.addEventListener('click',function(){try{if(window.gtag){gtag('event','crq_click',{page:location.pathname,state:state||'unknown'});}}catch(e){}});if(insertBefore){insertInto.insertBefore(btn,insertBefore);}else{insertInto.appendChild(btn);}}function fixHomepageLeadForm(){if(location.pathname.replace(/\/$/,'')!=='')return;var contactInput=document.getElementById('oc-lead-contact');if(!contactInput)return;if(contactInput.getAttribute('data-oc-hp-retrofit')==='1')return;contactInput.setAttribute('data-oc-hp-retrofit','1');contactInput.setAttribute('type','email');contactInput.setAttribute('placeholder','Email');contactInput.setAttribute('autocomplete','email');contactInput.setAttribute('inputmode','email');if(document.getElementById('oc-lead-phone'))return;var phoneInput=document.createElement('input');phoneInput.id='oc-lead-phone';phoneInput.name='phone';phoneInput.type='tel';phoneInput.placeholder='Phone';phoneInput.setAttribute('autocomplete','tel');phoneInput.setAttribute('inputmode','tel');phoneInput.required=true;phoneInput.className=contactInput.className||'';var cs=getComputedStyle(contactInput);phoneInput.style.cssText='width:100%;box-sizing:border-box;margin:8px 0 0 0;padding:'+cs.padding+';font:'+cs.font+';border:'+cs.border+';border-radius:'+cs.borderRadius+';background:'+cs.backgroundColor+';color:'+cs.color+';';contactInput.parentNode.insertBefore(phoneInput,contactInput.nextSibling);}function fixWidgetFbToggle(){var widgetRoot=document.getElementById('oc-widget-root');var fbLink=document.getElementById('oc-fb-link');if(!widgetRoot||!fbLink)return;if(widgetRoot.getAttribute('data-oc-fb-listener')==='1')return;widgetRoot.setAttribute('data-oc-fb-listener','1');var update=function(){fbLink.style.setProperty('display',widgetRoot.open?'none':'block','important');};widgetRoot.addEventListener('toggle',update);update();}function fixTCPA(){var sel='input[type="tel"], input[name="phone"], input[name*="phone" i], input[placeholder*="phone" i], input[id*="phone" i], #oc-wgt-contact-val, #oc-wgt-contact, #oc-crv-ph, #oc-lead-phone';var TCPA='By providing your phone, you agree to receive calls or texts from Olive Cover, including automated. Consent is not required to purchase. Msg/data rates apply. Reply STOP to opt out.';document.querySelectorAll(sel).forEach(function(input){if(!input.parentNode)return;var sib=input.nextElementSibling;while(sib){if(sib.getAttribute&&sib.getAttribute('data-oc-tcpa')==='1')return;sib=sib.nextElementSibling;}var note=document.createElement('div');note.setAttribute('data-oc-tcpa','1');note.style.cssText='font-family:Inter,sans-serif;font-size:11px;color:#6B7280;font-style:italic;line-height:1.4;margin:4px 0 12px 0;padding:0;max-width:100%;';note.textContent=TCPA;input.parentNode.insertBefore(note,input.nextSibling);});}function fixHero(){var path=location.pathname.replace(/\/$/,'');var h1=document.querySelector('h1');if(!h1)return;if(path==='/about'){var sec=h1.closest('section');if(sec){sec.style.setProperty('max-width','1180px','important');sec.style.setProperty('margin','0 auto','important');sec.style.setProperty('padding','80px 32px 72px','important');}}if(path==='/personal-insurance'){var pi=document.querySelector('.oc-pi-hero-left')||h1.closest('section');if(pi){pi.style.setProperty('max-width','1180px','important');pi.style.setProperty('margin','0 auto','important');pi.style.setProperty('padding-left','32px','important');pi.style.setProperty('padding-right','32px','important');}}}function fixSpacing(){document.querySelectorAll('.oc-steps-label').forEach(function(el){el.style.setProperty('white-space','nowrap','important');});var cta=document.querySelector('#ins-cta .oc-cta-btn-1, #ins-cta a[class*=cta-btn]');if(cta){cta.style.setProperty('margin-top','28px','important');}var leadForm=document.getElementById('oc-lead-form-el');if(leadForm){leadForm.querySelectorAll('input, textarea, select').forEach(function(f){if(!f.matches('[type=submit], [type=hidden]')&&f.id!=='oc-state-select'){f.style.setProperty('margin-bottom','16px','important');}});}}function fix(){fixInvalidJsonLd();var skip=new RegExp('(btn|ocnav|oc-breadcrumb|oc-nav-|ch-|oc-it-|oc-faq-|inline-a-|oc-cta|oc-aof|oc-sp-|ocsticky|ch-ghost|w--current|search-result|oc-hero-cta|oc-cov2-cta|oc-cov-fcta|oc-fcta|oc-pi-cta|oc-path-pill)');document.querySelectorAll('a').forEach(function(a){var href=a.getAttribute('href')||'';if(href.startsWith('#')||href.startsWith('tel:')||href.startsWith('mailto:'))return;var cls=a.className||'';if(cls&&skip.test(cls))return;a.style.setProperty('color','#B8934A','important');a.style.setProperty('text-decoration','none','important');});document.querySelectorAll('[data-oc-claims-state-band="true"]').forEach(function(el){var firstDiv=el.querySelector('div');var t=firstDiv?(firstDiv.textContent||'').trim():(el.textContent||'').trim();if(/^(Showing\s+claims\s+info\s+for:?|Claims\s+info\s+for:?|Showing\s+for:?)\s*$/i.test(t)){el.style.setProperty('display','none','important');}});var resLink=document.querySelector('#ocn-item-learn > a.ocnav-link');if(resLink&&resLink.getAttribute('href')==='/insights'){resLink.setAttribute('href','#');resLink.setAttribute('role','button');}var covPanel=document.getElementById('ocn-item-coverage-panel');if(covPanel){var allDivs=covPanel.querySelectorAll('div');allDivs.forEach(function(r){if(r.querySelector('div'))return;var t=(r.textContent||'').toLowerCase().trim();if(t.length<80&&/^not sure (what you need|what your business needs|where to start)/i.test(t)){r.style.setProperty('display','none','important');}});}var which=document.getElementById('which-situation');if(which){var howWrap=which.closest('.oc-cov-route-wrap');var routeGrid=document.querySelector('.oc-cov-route-grid');if(howWrap&&routeGrid&&howWrap.nextElementSibling!==routeGrid){howWrap.parentNode.insertBefore(routeGrid,howWrap.nextSibling);}}document.querySelectorAll('.oc-nav-panel').forEach(function(panel){panel.style.setProperty('padding','1rem 1.25rem','important');});var insSub=document.querySelector('.oc-ins-hero-sub');if(insSub&&insSub.textContent.indexOf('Honest coverage guidance')>=0){insSub.textContent='What we think you should know about insurance, before you sign, renew, or file a claim.';}document.querySelectorAll('.oc-ins-fc-overlay').forEach(function(o){o.style.setProperty('background','linear-gradient(to top, rgba(27,58,92,0.92) 0%, rgba(27,58,92,0.55) 50%, rgba(27,58,92,0.25) 100%)','important');});var ifb=document.getElementById('oc-insights-filters');if(ifb){ifb.style.setProperty('display','none','important');}document.querySelectorAll('.oc-ins-body-hidden').forEach(function(el){el.style.setProperty('display','none','important');});document.querySelectorAll('article.oc-ic-1').forEach(function(c){c.style.setProperty('min-height','180px','important');c.style.setProperty('display','flex','important');c.style.setProperty('flex-direction','column','important');c.style.setProperty('text-align','left','important');});var hp=document.querySelector('.oc-hero-cta-primary');var hs=document.querySelector('.oc-hero-cta-secondary');if(hp&&hs){[hp,hs].forEach(function(b){b.style.setProperty('font-size','16px','important');b.style.setProperty('padding','14px 28px','important');b.style.setProperty('width','260px','important');b.style.setProperty('min-width','260px','important');b.style.setProperty('max-width','260px','important');b.style.setProperty('box-sizing','border-box','important');b.style.setProperty('text-align','center','important');b.style.setProperty('justify-content','center','important');b.style.setProperty('color','#FFFFFF','important');b.style.setProperty('text-decoration','none','important');});hp.style.setProperty('background','#B8934A','important');hp.style.setProperty('border','0','important');hs.style.setProperty('background','rgba(255,255,255,0.08)','important');hs.style.setProperty('border','1px solid rgba(255,255,255,0.35)','important');}var aboutA=document.querySelector('#ocnav-bar a[href="/about"]');if(aboutA){aboutA.style.setProperty('margin-right','14px','important');aboutA.style.setProperty('margin-left','6px','important');}var claimsPanel=document.getElementById('ocn-item-claims-panel');if(claimsPanel){var featuredCol=claimsPanel.querySelector('[data-oc-claims-col="featured"]');if(featuredCol){var head=featuredCol.querySelector('.oc-nav-panel-heading');var par=featuredCol.querySelector('p');var lnk=featuredCol.querySelector('a');if(head)head.style.setProperty('font-size','0.875rem','important');if(par){par.style.setProperty('font-size','0.8125rem','important');par.style.setProperty('margin-bottom','8px','important');}if(lnk){lnk.style.setProperty('color','#B8934A','important');lnk.style.setProperty('font-weight','600','important');lnk.style.setProperty('text-decoration','none','important');}}}var SOCIAL={'facebook.com':'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>','instagram.com':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/></svg>','linkedin.com':'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 18v-9H6v9zm-1.25-10.3a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9zM18 18v-5.4c0-2.5-1.35-3.6-3.15-3.6a2.7 2.7 0 0 0-2.45 1.35V9h-2.5v9h2.5v-4.7c0-1.25.8-1.9 1.7-1.9.85 0 1.45.55 1.45 1.85V18z"/></svg>'};document.querySelectorAll('#oc-footer-new a[target="_blank"]').forEach(function(a){var h=a.getAttribute('href')||'';Object.keys(SOCIAL).forEach(function(d){if(h.indexOf(d)>=0&&a.textContent.length<5){a.innerHTML=SOCIAL[d];a.style.setProperty('width','32px','important');a.style.setProperty('height','32px','important');a.style.setProperty('display','inline-flex','important');a.style.setProperty('align-items','center','important');a.style.setProperty('justify-content','center','important');a.style.setProperty('color','#B8934A','important');}});});document.querySelectorAll('.ch-step h3').forEach(function(h){h.style.setProperty('font-family','"Playfair Display",Georgia,serif','important');h.style.setProperty('color','#1B3A5C','important');h.style.setProperty('font-weight','600','important');h.style.setProperty('font-size','1.125rem','important');});fixHero();fixCoverageHero();fixCrvHeroBg();fixHeroPhotos();fixPiPage();fixDescribeCards();fixHomepageSpacing();fixHomepageLeadForm();fixWidgetFbToggle();fixSearch();fixSpacing();fixCTA();fixITCards();fixInsState();hideFaqSlugs();decpageReplace();fixTCPA();fixCRQCTA();var BTN_SEL='.oc-hero-cta-primary,.oc-hero-cta-secondary,.oc-cov2-cta-primary,.oc-cov2-cta-secondary,.oc-cta-btn-1,.oc-cov-fcta-btn,.ch-btn-gold,.oc-fcta-btn,.oc-pi-cta-btn,.oc-mobile-cta,.oc-sticky-call-btn,.oc-sticky-review-btn,.oc-sp-cta,.oc-cta-btn,.oc-aof-cta,.oc-term-cta-btn,.oc-ins-cta-btn,.oc-widget-btn,#ocnav-bar a[href="/coverage-review"]';document.querySelectorAll(BTN_SEL).forEach(function(b){b.style.setProperty('height','44px','important');b.style.setProperty('min-height','44px','important');b.style.setProperty('max-height','44px','important');b.style.setProperty('padding-top','0','important');b.style.setProperty('padding-bottom','0','important');b.style.setProperty('display','inline-flex','important');b.style.setProperty('align-items','center','important');b.style.setProperty('justify-content','center','important');b.style.setProperty('line-height','1','important');b.style.setProperty('box-sizing','border-box','important');});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}setTimeout(fix,1500);setTimeout(fix,3000);})();


// === oc-content-rules v1.0.0 ===
(function(){
  function fix(){
    // California pill removal (Insights template state row)
    document.querySelectorAll('.oc-art-state-pill--california').forEach(function(el){
      if(el.parentNode) el.parentNode.removeChild(el);
    });
    // FAQ slug elements: remove from DOM so brand names do not leak in source
    document.querySelectorAll('.oc-faq-slug').forEach(function(el){
      if(el.parentNode) el.parentNode.removeChild(el);
    });
    var path = location.pathname.replace(/\/$/,'') || '/';
    // /commercial-carriers fixes
    if(path === '/commercial-carriers'){
      // Coming Soon labels: hide entire .ccr-li legend, hide table-cell pill
      document.querySelectorAll('.c-soon-1').forEach(function(el){
        var li = el.closest('.ccr-li');
        if(li){ li.style.setProperty('display','none','important'); }
        else { el.style.setProperty('display','none','important'); }
      });
      // 'real estate' in carrier appetite cells -> 'property management'
      document.querySelectorAll('.ccr-td').forEach(function(td){
        var walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT, null);
        var n;
        while(n = walker.nextNode()){
          if(/real estate/i.test(n.nodeValue)){
            n.nodeValue = n.nodeValue.replace(/real estate/gi, 'property management');
          }
        }
      });
    }
    // Force-load Insurance template hero photos (their loading=lazy is failing to trigger)
    document.querySelectorAll('img.oc-ins-hero-photo').forEach(function(img){
      if (img.loading === 'lazy') img.loading = 'eager';
      if (img.naturalWidth === 0 && img.src) {
        var s = img.src;
        img.removeAttribute('src');
        img.src = s;
      }
    });
    // Carrier pages: inject the uniform carrier-section disclaimer (covers rating data
    // attribution AND placement-via-appointments-or-partnerships clarification).
    // Applies to all carrier pages including the /carriers hub.
    if(path.indexOf('/carriers') === 0){
      if(!document.getElementById('oc-carrier-section-disclaimer')){
        // Pick the anchor: prefer ratings section if present, otherwise top of main content
        var anchor = document.querySelector('#carrier-ratings-heading, [id*="carrier-ratings"]');
        var disclaimerHost = null;
        if(anchor){
          disclaimerHost = anchor.closest('section') || anchor.parentElement;
        }
        // Fallback: insert at top of main carrier content area
        if(!disclaimerHost){
          disclaimerHost = document.querySelector('main, .oc-carrier-wrap, .oc-wrap') || document.body;
        }
        if(disclaimerHost){
          var disclaimer = document.createElement('p');
          disclaimer.id = 'oc-carrier-section-disclaimer';
          disclaimer.style.cssText = 'font-family:Inter,sans-serif;font-size:0.75rem;color:#6B7280;font-style:italic;line-height:1.5;margin:16px auto 0;padding:12px 20px;max-width:980px;text-align:center;border-top:1px solid rgba(184,147,74,0.18);';
          disclaimer.textContent = 'Carrier reviews and financial-strength ratings on this site are based on publicly available industry data and are provided for informational purposes only. They do not constitute an endorsement of any carrier. Olive Cover places coverage through active carrier appointments and partnerships; not every carrier reviewed here is part of our current placement list. Talk to us about which carriers fit your situation.';
          // Insert near the anchor or at the top of the host
          if(anchor && disclaimerHost.nextSibling){
            disclaimerHost.parentNode.insertBefore(disclaimer, disclaimerHost.nextSibling);
          } else {
            disclaimerHost.appendChild(disclaimer);
          }
        }
      }
    }
    // Insurance template: soften the navy hero so the photo shows through.
    // Section has solid #1B3A5C bg covering the absolutely-positioned IMG behind it.
    // Replace with a gradient overlay that lets the photo show.
    var insHero = document.getElementById('ins-hero');
    if (insHero && path.indexOf('/insurance/') === 0) {
      insHero.style.setProperty('background-color', 'transparent', 'important');
      insHero.style.setProperty('background-image', 'linear-gradient(105deg, rgba(27,58,92,0.88) 0%, rgba(27,58,92,0.55) 50%, rgba(27,58,92,0.30) 100%)', 'important');
      insHero.style.setProperty('background-size', 'cover', 'important');
    }
    // Site-wide: swap hello@olivecover.com → askolive@olivecover.com (canonical brand-aligned email
    // matching the filed "Ask Olive" trademark). Updates href + visible text + any text nodes.
    document.querySelectorAll('a[href*="mailto:hello@olivecover.com"]').forEach(function(a){
      try { a.href = a.href.replace(/hello@olivecover\.com/g, 'askolive@olivecover.com'); } catch(e){}
      if (a.textContent && a.textContent.indexOf('hello@olivecover.com') >= 0) {
        // Walk text nodes inside the link to preserve markup
        var w = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null);
        var tn;
        while ((tn = w.nextNode())) {
          if (tn.nodeValue && tn.nodeValue.indexOf('hello@olivecover.com') >= 0) {
            tn.nodeValue = tn.nodeValue.replace(/hello@olivecover\.com/g, 'askolive@olivecover.com');
          }
        }
      }
    });
    // Catch plain-text mentions outside anchors (e.g., contact-page intro copy, error messages)
    var bodyWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('a[href*="mailto:askolive"]')) return NodeFilter.FILTER_REJECT;
        return /hello@olivecover\.com/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var tn2;
    while ((tn2 = bodyWalker.nextNode())) {
      tn2.nodeValue = tn2.nodeValue.replace(/hello@olivecover\.com/g, 'askolive@olivecover.com');
    }
    // Contact page: add "Or just email us" tertiary line below the form
    if (path === '/contact') {
      var contactForm = document.getElementById('oc-contact-form-el');
      if (contactForm && !document.getElementById('oc-contact-email-tertiary')) {
        var orLine = document.createElement('p');
        orLine.id = 'oc-contact-email-tertiary';
        orLine.style.cssText = 'margin:16px 0 0;font:14px Inter,sans-serif;color:#1B3A5C;opacity:0.85;line-height:1.5;';
        orLine.innerHTML = 'Prefer email? Reach us at <a href="mailto:askolive@olivecover.com" style="color:#B8934A;font-weight:600;text-decoration:none;">askolive@olivecover.com</a>. A licensed agent will follow up within one business day.';
        var parent = contactForm.parentNode;
        if (parent) parent.insertBefore(orLine, contactForm.nextSibling);
      }
    }
    // FAQ category badge expansion: replace BOP/GL/WC abbreviations with full names
    // Site-wide because the badge appears on /faq/* entry pages AND inside the /faq hub list
    var FAQ_BADGE_SWAPS = {
      'BOP': 'Business Owners Policy',
      'GL': 'General Liability',
      'WC': 'Workers Compensation',
      'PL': 'Professional Liability',
      'CC': 'Commercial'
    };
    // Selector: <p> immediately after the back-link, and any FAQ category pill class
    var faqBadgeSelectors = [
      '.oc-faq-back-link + p',
      '.oc-fqc-cat-1',
      '[class*="oc-faq-cat"]',
      '.oc-faq-pill'
    ].join(',');
    document.querySelectorAll(faqBadgeSelectors).forEach(function(el){
      var t = (el.textContent || '').trim();
      if (FAQ_BADGE_SWAPS[t]) {
        el.textContent = FAQ_BADGE_SWAPS[t];
      }
    });
    // /commercial-insurance: strip leading '!' from any hero pill text
    if(path === '/commercial-insurance'){
      document.querySelectorAll('[class*="pill"]').forEach(function(p){
        if(!p.textContent || p.textContent.length > 200) return;
        var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
        var n;
        while(n = walker.nextNode()){
          var s = n.nodeValue;
          if(/^[\s]*!\s*/.test(s)){
            n.nodeValue = s.replace(/^[\s]*!\s*/, '');
            break;
          }
        }
      });
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fix);
  } else {
    fix();
  }
  setTimeout(fix, 1500);
  setTimeout(fix, 3000);
})();

// === ocinsfix v1.0.0 (2026-05-24): /insights page polish + Insurance What is Covered cards ===
(function(){
  if (window.__ocinsfix_init) return;
  window.__ocinsfix_init = true;

  // Inject CSS once via template-literal (no escape issues with apostrophes)
  if (!document.getElementById('oc-insfix-css')) {
    var st = document.createElement('style');
    st.id = 'oc-insfix-css';
    st.textContent = `
/* /insights featured + all-articles grids -- 4-col equal cards */
.oc-ins-featured-grid, .oc-ins-all-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 16px !important;
  width: 100% !important;
  max-width: 1180px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding: 0 20px !important;
  box-sizing: border-box !important;
}
.oc-ins-featured-grid > *, .oc-ins-all-grid > * {
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
}
@media (max-width: 991px) {
  .oc-ins-featured-grid, .oc-ins-all-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 600px) {
  .oc-ins-featured-grid, .oc-ins-all-grid {
    grid-template-columns: 1fr !important;
  }
}
/* /personal-insurance + /commercial-insurance: force any card grid with ~4 children to 4-col layout.
   Targets common Webflow grid wrapper classes used on these hubs. */
body[class*="personal-insurance"] .w-layout-grid:has(> :nth-child(4):last-child),
body[class*="commercial-insurance"] .w-layout-grid:has(> :nth-child(4):last-child) {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 16px !important;
}
@media (max-width: 991px) {
  body[class*="personal-insurance"] .w-layout-grid:has(> :nth-child(4):last-child),
  body[class*="commercial-insurance"] .w-layout-grid:has(> :nth-child(4):last-child) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 600px) {
  body[class*="personal-insurance"] .w-layout-grid:has(> :nth-child(4):last-child),
  body[class*="commercial-insurance"] .w-layout-grid:has(> :nth-child(4):last-child) {
    grid-template-columns: 1fr !important;
  }
}

/* Insurance pages -- "What is Covered" card grids: enforce equal heights */
.oc-ins-cov-cards-grid, .oc-ins-coverage-grid, .oc-ins-cards-grid,
[class*="ins-cov-cards"], [class*="ins-coverage-cards"] {
  display: grid !important;
  grid-auto-rows: 1fr !important;
  align-items: stretch !important;
}
.oc-ins-cov-cards-grid > *, .oc-ins-coverage-grid > *, .oc-ins-cards-grid > *,
[class*="ins-cov-cards"] > *, [class*="ins-coverage-cards"] > * {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  box-sizing: border-box !important;
}
`;
    document.head.appendChild(st);
  }

  function fix(){
    // Remove blank oc-ic-1 article cards (no title or no link) from /insights All Articles
    document.querySelectorAll('article.oc-ic-1').forEach(function(card){
      var hasTitle = !!card.querySelector('.oc-ic-title-1-2');
      var hasLink = !!card.querySelector('a[href]:not([href="#"])');
      if (!hasTitle || !hasLink) { card.remove(); }
    });

    // Remove IN THIS ARTICLE sidebar hint card on /insights/{slug} detail pages.
    // Filler content; post-launch will be replaced with per-article TOC content via CMS.
    document.querySelectorAll('.oc-art-sidebar-hint-body').forEach(function(p){
      var node = p;
      var removed = false;
      for (var i = 0; i < 6 && node && node !== document.body; i++) {
        var cls = (node.className || '').toString();
        if (/sidebar.?hint|art-sidebar/i.test(cls) && node !== p) {
          node.remove();
          removed = true;
          break;
        }
        node = node.parentElement;
      }
      if (!removed) { p.remove(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fix);
  } else {
    fix();
  }
  setTimeout(fix, 1500);
  setTimeout(fix, 3000);
})();

// === ocnavcarrcomm v1.0.0 (2026-05-24): fix commercial-column carrier nav links ===
(function(){
  if (window.__ocnavcarrcomm_init) return;
  window.__ocnavcarrcomm_init = true;
  var SWAPS = {
    '/carriers/travelers-insurance': '/carriers/travelers-commercial-insurance',
    '/carriers/hartford-insurance': '/carriers/hartford-commercial-insurance',
    '/carriers/nationwide-insurance': '/carriers/nationwide-commercial-insurance'
  };
  function fix(){
    var labels = Array.prototype.filter.call(
      document.querySelectorAll('p, span, h3, h4, .oc-nav-panel-col-label'),
      function(el){ return (el.textContent || '').trim() === 'Commercial Lines'; }
    );
    labels.forEach(function(lbl){
      var col = lbl.parentElement;
      for (var i = 0; i < 5 && col; i++) {
        if (col.querySelector && col.querySelector('a[href*="/carriers/"]')) break;
        col = col.parentElement;
      }
      if (!col) return;
      col.querySelectorAll('a[href]').forEach(function(a){
        try {
          var u = new URL(a.href, location.origin);
          if (SWAPS[u.pathname]) {
            a.setAttribute('href', SWAPS[u.pathname]);
          }
          // Remove AIG link from Commercial column. AIG Private Client is personal-lines.
          if (u.pathname === '/carriers/aig-insurance') {
            var item = a.closest('li, [role="menuitem"]') || a;
            if (item && item.parentNode) item.parentNode.removeChild(item);
          }
        } catch (e) {}
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fix);
  } else {
    fix();
  }
  setTimeout(fix, 800);
  setTimeout(fix, 2000);
  setTimeout(fix, 4000);
})();

// === ocbatch1024 v1.0.7 (2026-05-24): batch review fixes for layout + footer ===
(function(){
  if (window.__ocbatch1024_init) return;
  window.__ocbatch1024_init = true;

  // Inject CSS once
  if (!document.getElementById('oc-batch1024-css')) {
    var st = document.createElement('style');
    st.id = 'oc-batch1024-css';
    st.textContent = `
/* /personal-insurance + /commercial-insurance: force ALL section grids to 4-col on desktop.
   Real grid classes on these pages: .oc-pi-id-grid (Identify), .oc-pi-sys-stack (Numbered),
   .oc-pi-gaps-grid (Coverage Gaps), .oc-pi-sf-grid (If any sounds familiar - legacy). */
html body .oc-pi-id-grid,
html body .oc-pi-gaps-grid,
html body .oc-pi-sf-grid,
html body .oc-ci-id-grid,
html body .oc-ci-gaps-grid,
html body .oc-ci-sf-grid,
html body [data-sec="sounds-familiar"] {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 20px !important;
  width: 100% !important;
  max-width: 1180px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
html body .oc-pi-id-grid > *,
html body .oc-pi-gaps-grid > *,
html body .oc-pi-sf-grid > *,
html body .oc-ci-id-grid > *,
html body .oc-ci-gaps-grid > *,
html body .oc-ci-sf-grid > *,
html body [data-sec="sounds-familiar"] > * {
  height: 100% !important;
  min-width: 0 !important;
}
@media (max-width: 991px) {
  html body .oc-pi-id-grid,
  html body .oc-pi-gaps-grid,
  html body .oc-pi-sf-grid,
  html body .oc-ci-id-grid,
  html body .oc-ci-gaps-grid,
  html body .oc-ci-sf-grid,
  html body [data-sec="sounds-familiar"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 600px) {
  html body .oc-pi-id-grid,
  html body .oc-pi-gaps-grid,
  html body .oc-pi-sf-grid,
  html body .oc-ci-id-grid,
  html body .oc-ci-gaps-grid,
  html body .oc-ci-sf-grid,
  html body [data-sec="sounds-familiar"] {
    grid-template-columns: 1fr !important;
  }
}

/* "If any of these sound familiar" section card polish - white bg, gold accent, hover lift */
html body .oc-pi-id-card,
html body .oc-ci-id-card {
  background: #FFFFFF !important;
  border: 1px solid rgba(184, 147, 74, 0.25) !important;
  border-radius: 10px !important;
  padding: 24px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease !important;
  box-shadow: 0 1px 3px rgba(27, 58, 92, 0.06) !important;
}
html body .oc-pi-id-card:hover,
html body .oc-ci-id-card:hover {
  transform: translateY(-3px) !important;
  border-color: #B8934A !important;
  box-shadow: 0 8px 20px rgba(27, 58, 92, 0.12) !important;
}
html body .oc-pi-id-card .oc-pi-id-icon,
html body .oc-ci-id-card .oc-ci-id-icon {
  color: #B8934A !important;
  width: 28px !important;
  height: 28px !important;
}

/* /about trust-strip: A-Rated/Johns Creek/Licensed/Independent — 4-col */
[data-sec="about-trust-strip"] {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 16px !important;
}
[data-sec="about-trust-strip"] > * {
  height: 100% !important;
  min-width: 0 !important;
}
@media (max-width: 991px) {
  [data-sec="about-trust-strip"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 600px) {
  [data-sec="about-trust-strip"] {
    grid-template-columns: 1fr !important;
  }
}

/* Homepage social-proof: Real Outcomes Near You — 3-col */
#oc-social-proof .oc-sp-grid, [data-sec="social-proof-grid"] {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 24px !important;
}
@media (max-width: 991px) {
  #oc-social-proof .oc-sp-grid, [data-sec="social-proof-grid"] {
    grid-template-columns: 1fr !important;
  }
}

/* /insurance-terms: shrink card text + add row-gap */
.oc-it-grid {
  row-gap: 20px !important;
}
.oc-it-card {
  padding: 16px !important;
}
.oc-it-card .oc-it-card-title, .oc-it-card h2, .oc-it-card h3 {
  font-size: 0.95rem !important;
  line-height: 1.3 !important;
}
.oc-it-card .oc-it-card-body, .oc-it-card p {
  font-size: 0.8125rem !important;
  line-height: 1.4 !important;
}

/* /personal-insurance .oc-pi-sys-stack: 6 numbered cards in a 4-col grid */
.oc-pi-sys-stack {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 12px !important;
  width: 100% !important;
  max-width: 1180px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.oc-pi-sys-stack > * {
  min-width: 0 !important;
}
@media (max-width: 991px) {
  .oc-pi-sys-stack { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
}
@media (max-width: 600px) {
  .oc-pi-sys-stack { grid-template-columns: 1fr !important; }
}
/* Make oc-pi-sys-block clickable + visual cue */
a.oc-pi-sys-block-anchor {
  text-decoration: none !important;
  color: inherit !important;
  cursor: pointer !important;
  display: block !important;
  transition: transform 0.15s ease !important;
}
a.oc-pi-sys-block-anchor:hover {
  transform: translateY(-2px) !important;
}
a.oc-pi-sys-block-anchor:hover .oc-pi-sys-block-name {
  text-decoration: underline !important;
}

/* /personal-insurance + /commercial-insurance hero: set bg-image directly on hero wrap
   (the standalone photo block is hidden by ocstylefixes.fixHeroPhotos, so we cannot
   rely on it as a positioned child anymore). Set bg-image on the wrap itself and overlay
   with a navy gradient via ::before for the content stacking. */
.oc-pi-hero-wrap,
.oc-ci-hero-wrap {
  position: relative !important;
  min-height: 520px !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  isolation: isolate !important;
}
.oc-pi-hero-wrap {
  background-image: url('https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/6a0201a3f074c287a2a3ca00_hero-personal-insurance.jpg') !important;
}
.oc-pi-hero-wrap::before,
.oc-ci-hero-wrap::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(180deg, rgba(27,58,92,0.78) 0%, rgba(27,58,92,0.92) 100%) !important;
  z-index: 0 !important;
  pointer-events: none !important;
}
.oc-pi-hero-wrap > *,
.oc-ci-hero-wrap > * {
  position: relative !important;
  z-index: 1 !important;
}
.oc-pi-hero-h1,
.oc-ci-hero-h1 {
  color: #F5EDD8 !important;
}
.oc-pi-hero-sub,
.oc-ci-hero-sub,
.oc-pi-hero-wrap p,
.oc-ci-hero-wrap p {
  color: rgba(245, 237, 216, 0.92) !important;
}
/* CRITICAL: .oc-pi-hero-left has its own navy linear-gradient bg from Webflow that
   stacks ON TOP of the hero wrap's photo + ::before overlay, creating a visible
   second overlay below the text. Make these inner columns transparent so the wrap's
   photo+overlay shows through cleanly. */
.oc-pi-hero-wrap > .oc-pi-hero-left,
.oc-pi-hero-wrap > .oc-pi-hero-right,
.oc-ci-hero-wrap > .oc-ci-hero-left,
.oc-ci-hero-wrap > .oc-ci-hero-right {
  background: transparent !important;
  background-image: none !important;
}

/* /coverage: hide only the question-prompt eyebrow + question cards, NOT the hero section
   that contains them. v1.0.2 used section:has() which removed the whole hero — too aggressive.
   Target the specific question-related classes individually. */
p.oc-cov2-q-label,
p.oc-cov2-q,
[class*="oc-cov2-q-card"],
[class*="oc-cov2-q-grid"],
[class*="oc-cov2-q-wrap"],
[class*="oc-cov2-questions"] {
  display: none !important;
}

/* Nav Resources active-state: strip pill background to match plain text */
.ocnav-link[href*="/insights"].w--current,
.ocnav-link[href*="resources"].w--current,
#ocn-item-resources .ocnav-link.w--current,
#ocn-item-resources a.w--current {
  background: transparent !important;
  background-color: transparent !important;
  border-radius: 0 !important;
  padding: inherit !important;
  box-shadow: none !important;
}
`;
    document.head.appendChild(st);
  }

  // ----- DOM patches -----
  function fix(){
    // (1) Footer social: Facebook URL update + Instagram hide
    document.querySelectorAll('a[href*="facebook.com/olivecover"]').forEach(function(a){
      a.href = 'https://www.facebook.com/olivecoverins';
      a.setAttribute('aria-label', 'Olive Cover on Facebook');
    });
    document.querySelectorAll('a[href*="instagram.com/olivecover"]').forEach(function(a){
      a.style.display = 'none';
      a.setAttribute('aria-hidden', 'true');
    });

    // (2) /faq search placeholder
    document.querySelectorAll('input[placeholder*="Search all" i], input[placeholder*="questions" i]').forEach(function(inp){
      if (/\d+/.test(inp.placeholder || '')) {
        inp.placeholder = 'Search FAQs';
      }
    });

    // (3) Remove "What brought you here?" eyebrow + 4 question-sections on /coverage.
    // Match: eyebrow labels (uppercase span) AND headings (any case).
    // Removes the largest enclosing <section> if found, else just the element.
    var killTexts = [
      'what brought you here?',
      'what do i actually need?',
      'am i already covered?',
      'what am i missing?'
    ];
    var killSelectors = 'h1, h2, h3, h4, span.oc-pi-hero-qlabel, span.oc-ci-hero-qlabel, [class*="hero-qlabel"], [class*="eyebrow"], p.oc-cov2-q-label, p.oc-cov2-q';
    document.querySelectorAll(killSelectors).forEach(function(el){
      var t = (el.textContent || '').trim().toLowerCase();
      if (killTexts.indexOf(t) < 0) return;
      // Walk up to find the enclosing section (or major wrapper)
      // For oc-cov2-q-label / oc-cov2-q elements, just hide the element + its closest div wrap
      // (don't walk up to <section> — that's too aggressive on /coverage where the questions
      // are inside the hero section).
      var clsName = (el.className || '').toString();
      if (clsName.indexOf('oc-cov2') >= 0) {
        // Hide the immediate wrap div (question card container) but not the whole section
        var wrap = el.closest('[class*="oc-cov2-q"]') || el.closest('div') || el;
        wrap.style.display = 'none';
        return;
      }
      // For non-coverage pages (e.g. /personal-insurance hero qlabel), walk up to <section>
      // and remove (legacy behavior preserved for those page-specific eyebrow patterns).
      var node = el;
      for (var i = 0; i < 6 && node && node !== document.body; i++) {
        if (node.tagName === 'SECTION') { node.remove(); return; }
        node = node.parentElement;
      }
      var wrap2 = el.closest('div') || el;
      wrap2.style.display = 'none';
    });

    // (4) Tag "If any of these sound familiar" + commercial equivalent parent grids — for 4-col CSS rule
    var familiarPhrases = [
      'any of these sound familiar',      // /personal-insurance singular
      'any of these sounds familiar',     // variant
      'if any of these describe your situation',  // /commercial-insurance
      'any of these describe your situation'
    ];
    document.querySelectorAll('h1, h2, h3, h4').forEach(function(h){
      var t = (h.textContent || '').trim().toLowerCase();
      var match = familiarPhrases.some(function(p){ return t.indexOf(p) >= 0; });
      if (!match) return;
      // Walk forward to find the next grid container with cards
      var section = h.closest('section') || h.parentElement;
      if (!section) return;
      var grid = section.querySelector('[class*="grid"], [class*="cards"], .w-layout-grid, [class*="oc-pi-id"], [class*="oc-ci-id"]');
      if (grid) {
        grid.setAttribute('data-sec', 'sounds-familiar');
      }
    });

    // (5) Tag /about trust-strip parent — when on /about path
    if (location.pathname === '/about') {
      var trustWords = ['A-Rated Carriers', 'Based in Johns Creek', 'Licensed in Georgia', 'Independent Agent'];
      var foundTrustEls = [];
      document.querySelectorAll('h2, h3, h4, p, strong, span').forEach(function(el){
        var t = (el.textContent || '').trim();
        if (trustWords.indexOf(t) >= 0) foundTrustEls.push(el);
      });
      // If found, walk up to the common ancestor
      if (foundTrustEls.length >= 3) {
        var common = foundTrustEls[0];
        for (var i = 0; i < 8 && common; i++) {
          if (common.contains(foundTrustEls[1]) && common.contains(foundTrustEls[2])) {
            common.setAttribute('data-sec', 'about-trust-strip');
            break;
          }
          common = common.parentElement;
        }
      }
    }

    // (5.4) /personal-insurance: wire .oc-pi-sys-block elements as anchor links to product cards
    if (location.pathname === '/personal-insurance') {
      var blockNameToId = {
        'homeowners': 'homeowners',
        'auto': 'auto',
        'renters': 'renters',
        'flood': 'flood',
        'umbrella': 'umbrella',
        'landlord': 'landlord'
      };
      document.querySelectorAll('.oc-pi-sys-block').forEach(function(block){
        if (block.dataset.linkWired === '1') return;
        var nameEl = block.querySelector('.oc-pi-sys-block-name');
        if (!nameEl) return;
        var name = (nameEl.textContent || '').trim().toLowerCase();
        var targetId = blockNameToId[name];
        if (!targetId) return;
        // Wrap the block's content in an <a> tag pointing to the target
        var existing = block.querySelector('a.oc-pi-sys-block-anchor');
        if (existing) return;
        var a = document.createElement('a');
        a.href = '#' + targetId;
        a.className = 'oc-pi-sys-block-anchor';
        a.setAttribute('aria-label', 'Jump to ' + name + ' insurance section');
        // Move all of block's children into the anchor
        while (block.firstChild) a.appendChild(block.firstChild);
        block.appendChild(a);
        block.dataset.linkWired = '1';
      });
    }

    // (5.5) Move Terms/Glossary CTA section above the SITE FOOTER on /personal-insurance + /commercial-insurance
    // v1.0.5 fix: Previous selector 'footer, .oc-footer, [class*="footer"]' matched
    // .oc-widget-panel-footer (inside Ask Olive chat widget) FIRST, so terms got
    // moved INSIDE the widget panel and disappeared from main page flow.
    // Site footer on this Webflow build is #oc-footer-new (direct child of body, no <footer> tag).
    if (location.pathname === '/personal-insurance' || location.pathname === '/commercial-insurance') {
      var termsSec = document.getElementById('pi-glossary-link');
      var footer = document.getElementById('oc-footer-new');
      if (termsSec && footer && footer.previousElementSibling !== termsSec) {
        try {
          footer.parentNode.insertBefore(termsSec, footer);
        } catch (e) {}
      }
    }

    // (5.6) Hero photo bg-image: dynamically discover hero photo URL from the (hidden)
    // standalone photo block and apply it as background-image on the hero wrap. CSS already
    // sets a known URL for /personal-insurance, this DOM step covers /commercial-insurance
    // (and other Insurance subpaths) where the URL is page-specific.
    if (location.pathname === '/personal-insurance' || location.pathname === '/commercial-insurance' || location.pathname.indexOf('/insurance/') === 0) {
      var heroWrap = document.querySelector('.oc-pi-hero-wrap, .oc-ci-hero-wrap, [class*="oc-hero-wrap"]');
      if (heroWrap && !heroWrap.dataset.bgApplied) {
        var photoEl = heroWrap.querySelector('[class*="oc-hero-photo"]') ||
                      document.querySelector('section [class*="oc-hero-photo"]');
        if (photoEl) {
          var url = (getComputedStyle(photoEl).backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
          if (url && url[1]) {
            heroWrap.style.setProperty('background-image', 'url("' + url[1] + '")', 'important');
            heroWrap.style.setProperty('background-size', 'cover', 'important');
            heroWrap.style.setProperty('background-position', 'center', 'important');
            heroWrap.style.setProperty('background-repeat', 'no-repeat', 'important');
            heroWrap.dataset.bgApplied = '1';
          }
        }
      }
    }

    // (6) Tag homepage social-proof grid — when on home
    if (location.pathname === '/' || location.pathname === '') {
      var sp = document.getElementById('oc-social-proof') || document.querySelector('[id*="social-proof"]');
      if (sp) {
        var grid = sp.querySelector('[class*="grid"], [class*="cards"], .w-layout-grid');
        if (grid) grid.setAttribute('data-sec', 'social-proof-grid');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fix);
  } else {
    fix();
  }
  setTimeout(fix, 800);
  setTimeout(fix, 2000);
  setTimeout(fix, 4000);
})();
