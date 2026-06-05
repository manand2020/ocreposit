// ocpatch.js v1.11.9 -- Consolidated runtime patcher for Olive Cover.
//
//   revealPageFaqs (v1.10.16): generalized the carrier FAQ fix to ALL page-level
//                      FAQ sections (#car-faq, #ins-faq, #about-faq, #wwdb-faq)
//                      on their own pages -- reveal + clean collapsed accordion
//                      + hide duplicate short-list + Q/A differentiation + hub
//                      link. Skips /faq (wired natively). Robust answer-finder
//                      handles both <p class="oc-faq-a"> and bare <div> answers.
//   revealCarrierFaqs (v1.10.15): differentiate the FAQ question from its
//                      answer -- question is bold navy Inter, answer is set off
//                      with a gold left rule + indent (template rendered both
//                      as similar gray text, hard to tell apart).
//   revealCarrierFaqs (v1.10.14): wire the carrier-page FAQ accordion. The
//                      answer (.oc-faq-a) is hidden by template CSS regardless
//                      of the <details> open state (native toggle was only
//                      wired on /faq), so a toggle listener now reveals the
//                      answer on click. Collapsed by default. Also hides the
//                      duplicate questions-only list (.oc-faq-short-list) and
//                      adds a single "View all insurance FAQs ->" hub link.
//
//   insightsHub      -> /insights enhancements (v1.10.6). The featured lead
//                      block (.oc-feat-card*) and the category filter bar
//                      (.oc-news-filter) are built natively in the Designer;
//                      this (a) loads every paginated card into the grid so
//                      category filtering spans the whole collection and hides
//                      the now-redundant pagination, (b) fills the featured
//                      block from the newest article and removes that duplicate
//                      card from the grid, (c) builds one chip per distinct
//                      category and wires show/hide filtering. Behavior + DOM
//                      only; all styling lives in native classes.
//
// Merges five standalone inline-site-scripts that previously each loaded a
// separate file and/or ran its own MutationObserver + TreeWalker pass on
// every page:
//
//   ocagentadvisor  -> agent->advisor text rewrite
//   ocbrandpatcher  -> brand-attribution body text + JSON-LD rewrite
//   ocbookpromo     -> Book a call CTA (nav + footer) + GA4; opens the
//                      Easy!Appointments booking modal (book.olivecover.com).
//                      Booking->CRM is server-side (E!A webhook -> CLIP).
//   ocwidgetchips   -> Ask Olive widget quick-action chips
//   occtafix        -> strip stray inline color on claims/stub CTAs (v1.1.0)
//   occarrierhub    -> add NFIP to the hand-built carrier hub pages: a proper
//                      row in the /personal-carriers flood comparison table
//                      (clone the Selective flood row + relabel); cleanup-only
//                      on the other hubs. Static pages, not CMS-driven. (v1.7.0)
//   fixCarrierClaimsPhone -> set the claims phone on carrier profile pages for
//                      carriers not yet in ocshim's occarrierphones map (new
//                      carriers, e.g. NFIP -> Selective flood WYO line). (v1.8.0)
//   fixCarrierTableNA -> replace bare "N/A" text in the carrier comparison
//                      tables (/personal-carriers, /commercial-carriers) with a
//                      muted dash; keeps the cell's class so it stays gray and
//                      reads cleaner next to the green checks. (v1.9.0)
//   injectNewsNav    -> add a "News" entry to the global nav: if About sits in
//                      a dropdown, nest "News & Updates" there; else add a clean
//                      native-styled top-level "News" link after About. Adds a
//                      gold recency dot when the newest News post is < 30 days
//                      old. Insights is left under Resources untouched. (v1.10.0)
//   injectNewsSchema -> NewsArticle + BreadcrumbList JSON-LD on /news/{slug},
//                      built from the rendered article DOM (headline, date,
//                      category, hero image, summary). AEO payload. (v1.10.0)
//   wireAboutDropdown -> the About nav dropdown is hand-built in the Designer
//                      (oc-nav-dropdown + oc-nav-panel), but the existing nav
//                      panels open via per-element Webflow interactions that
//                      cannot be replicated on a new element. This wires the
//                      About panel's open/close on hover + keyboard focus by
//                      toggling its display (behavior, not styling -- same
//                      approach the nav script uses for the mobile panel).
//                      (v1.10.1)
//   injectNewsNav    -> (v1.10.2) also adds "News and Updates" to the flat
//                      mobile menu (.oc-mobile-panel-link) after About; desktop
//                      block now stands down when the Designer About dropdown's
//                      tagged News link is present.
//   injectDefinedTermSchema -> DefinedTerm + BreadcrumbList JSON-LD on every
//                      /insurance-terms/{slug} detail page. Reads term name from
//                      H1, description from .oc-term-short or meta description.
//                      Adds spatialCoverage if body[data-oc-jurisdiction="Georgia"]
//                      (Designer binding; absent = Federal, no spatial scope).
//                      (v1.10.28)
//   injectJurisdictionNotice -> Displays a one-line "Georgia-specific content"
//                      notice after the H1 on Georgia FAQ and Insights detail
//                      pages. Uses baked-in lookup maps (OC_FAQ_GA_SLUGS from
//                      state-slug field, OC_INSIGHTS_SCOPE from scope field),
//                      both fetched via Data API on 2026-06-05 (534 FAQs,
//                      23 Insights). Insurance Terms skipped (all null juris.).
//                      (v1.10.30)
//   augmentQAPageSchema -> Adds spatialCoverage {State: Georgia} to the CMS-
//                      rendered QAPage JSON-LD on Georgia FAQ detail pages.
//                      Guards via data-oc-schema-aug attribute. (v1.10.30)
//   augmentInsightsSchema -> Adds spatialCoverage {State: Georgia} to the CMS-
//                      rendered Article JSON-LD on Georgia-scope Insights pages.
//                      Guards via data-oc-schema-aug attribute. (v1.10.30)
//   v1.10.31: Insurance Terms jurisdiction classified and CMS updated for 5
//                      terms (Federal: nfip, flood-zone, elevation-certificate;
//                      Georgia: workers-compensation, sr-22). OC_TERMS_GEO +
//                      OC_TERMS_FED + OC_TERMS_CITE maps added. injectDefinedTermSchema
//                      now reads from slug maps (supplements data-oc-jurisdiction)
//                      and adds citation property. injectJurisdictionNotice extended
//                      to Insurance Terms. augmentQAPageSchema and
//                      augmentInsightsSchema now read citation URLs from a DOM
//                      element [data-oc-faq-sources] / [data-oc-insights-sources]
//                      when bound via Designer (no-op until binding exists).
//   augmentDefinedTermSchema -> Augments the CMS-rendered DefinedTerm JSON-LD on
//                      Insurance Terms pages with spatialCoverage (Georgia) and
//                      citation. Separate from injectDefinedTermSchema because
//                      that function early-returns when the CMS has already
//                      rendered a DefinedTerm schema (which it always does on live
//                      pages). Guards via data-oc-schema-aug attribute. (v1.10.32)
//   injectFooterCTA    -> Exclude /carriers/* and /insurance/* from footer CTA
//                      injection -- those templates have a native Webflow CTA
//                      section, so the injected one was duplicating it. (v1.10.32)
//
// v1.11.1 -- nodeMatters() fix: added "office visits by appointment only" pattern
//            so patchText() TreeWalker visits footer appointment text nodes.
// v1.11.9 -- injectRelatedTerms + injectRelatedFaqs: extend both to run on
//            /insurance/* and /carriers/* pages, placing RelTerms -> RelFAQs
//            before footer in a race-safe manner. Slug keywords drive term
//            matching; H1 text drives FAQ matching; General fills remainder.
// v1.11.8 -- injectRelatedTerms + injectRelatedFaqs: anchor both sections off
//            .oc-term-cta-section on /insurance-terms/* pages so order CTA ->
//            RelTerms -> RelFAQs is enforced regardless of which async fetch
//            (terms-index.json vs faq-index.json) resolves first.
// v1.11.7 -- injectDefinedTermSchema: remove Webflow-embed bare JSON-LD text
//            node and body-level LD script before injecting proper head schema.
//            Webflow strips <script> wrappers from embeds, rendering the JSON
//            as a visible bare text node at the top of /insurance-terms/* pages.
// v1.11.6 -- injectFooterCTA: add /insights/* to exclusion regex so insights
//            pages with a native Webflow CTA section do not get a second injected CTA.
// v1.11.5 -- Remove insights email capture components from runOnce() --
//            injectInsightsInlineCTA, injectInsightsStickyBar,
//            injectExitIntentModal disabled pending PDF + CLIP wiring.
//            Code preserved in file; re-enable when ready.
// v1.11.4 -- Insights capture fixes:
//   injectExitIntentModal -> "Open Ask Olive" FAB selector updated to include
//                      `summary.oc-widget-toggle` so clicking the button in
//                      the modal actually opens the widget. The widget toggle
//                      is a <summary> element -- prior selectors all missed it.
//   injectInsightsInlineCTA, injectInsightsStickyBar -> success message softened
//                      from "Check your inbox -- your guide is on the way."
//                      to "Got it! We'll send your checklist shortly." since
//                      email delivery is pending Mailchimp setup.
// v1.11.3 -- Version bump for Webflow registration (no functional change from v1.11.2).
// v1.11.2 -- Terms page fixes:
//   hideDetailedRelTerms -> no longer hides .oc-term-cta-section; native
//                      contextual CTA ("Want this checked against your actual
//                      policy?") should remain visible. Only .oc-term-related-section
//                      is suppressed (replaced by injected pills).
//   injectFooterCTA    -> Added /insurance-terms/ to exclusion regex so generic
//                      CTA is not injected on terms pages that have native CTA.
//   buildRelFaqSection -> Changed from closed <details> accordion to direct
//                      linked list -- question text is a clickable link to the
//                      FAQ page; no click-to-expand required.
//
// v1.11.0 -- Consolidation: absorbed ocattribution.js + ocstagingfixesv12 to
//            eliminate two registered scripts and two maintained files.
//   initAttribution    -> GCLID + UTM form attribution capture (was ocattribution.js
//                      v1.0.0). Persists to sessionStorage; populates hidden inputs
//                      on all forms; MutationObserver covers dynamic forms.
//   augmentCarrierReviewRating -> Adds reviewRating {5/5} to Review JSON-LD on
//                      /carriers/* when absent (was ocstagingfixesv12 fixSchema).
//   restrictCoverageReviewDropdown -> Restricts state <select> to Georgia-only
//                      on /coverage-review (was ocstagingfixesv12 fixDD).
//   AGENT_RULES        -> Added "office visits by appointment only" text fix
//                      (was ocstagingfixesv12 fixFt TreeWalker).
//   injectNewsSchema   -> Now skips injection when CMS has already rendered a
//                      NewsArticle schema (absorbs ocstagingfixesv12 injNews dedup).
//
// Optimization: ONE jsDelivr request instead of five, ONE shared
// MutationObserver instead of multiple, ONE TreeWalker text pass instead of
// three. All text rules (agent + brand + cross) are applied in a single
// traversal.
//
// Every operation is idempotent. Reversible by unregistering the `ocpatch`
// inline-site-script.
(function () {
  'use strict';

  var path = location.pathname;
  var ON_BOOK = (path === '/book' || path === '/book/');
  var ON_GAPCALC = (path === '/coverage-gap-calculator' || path === '/coverage-gap-calculator/');
  var ON_COMMERCIAL_CARRIERS = (path === '/commercial-carriers' || path === '/commercial-carriers/');
  var WIDGET_SKIP = (path === '/' || path === '/ask-olive-disclaimer' || path === '/ask-olive-disclaimer/');

  var BOOK_URL = '/book';
  var BOOK_LABEL = 'Book a call';

  // ====================================================================
  // JURISDICTION LOOKUP MAPS (baked from CMS Data API, 2026-06-05)
  // FAQs: state-slug field. 266 of 534 FAQs are Georgia-specific.
  // Insights: scope field. 8 of 23 articles are Georgia-scope.
  // Insurance Terms: all 84 items have jurisdiction=null; skipped.
  // ====================================================================
  var OC_FAQ_GA_SLUGS = {
    "aig-ga-high-net-worth":1,"alpharetta-best-carriers":1,"alpharetta-hoa":1,
    "alpharetta-tech-workers":1,"alpharetta-tech-workers-coverage":1,
    "amtrust-workers-comp-georgia-coverage":1,"berkley-aspire-ga-surplus-lines":1,
    "berkley-mgmt-do-epl-specialty":1,"boat-lake-lanier":1,"bop-employee-injury":1,
    "branch-ga-atlanta-limits":1,"branch-ga-community-underwriting":1,
    "buford-insurance-lake-lanier-commercial":1,"cheapest-renters-georgia":1,
    "cherokee-forsyth-best-carriers":1,"cherokee-forsyth-rural":1,
    "cherokee-forsyth-rural-coverage":1,"cherokee-forsyth-shop":1,
    "chubb-commercial-do-epl-specialty":1,"chubb-ga-masterpiece-high-value":1,
    "cna-commercial-ga-professional-liability":1,"coalition-cyber-active-insurance":1,
    "collector-auto-insurance-vs-regular":1,"columbus-best-carriers":1,
    "columbus-military-insurance-fort-moore":1,"columbus-military-needs":1,
    "columbus-weather-flood":1,"condo-insurance-amount":1,
    "cowbell-cyber-ai-underwriting":1,"cumming-best-carriers":1,
    "cumming-dwelling-review":1,"cumming-lake-lanier-boat":1,
    "cumming-new-construction-coverage":1,
    "difference-between-insurance-carrier-and-agent":1,
    "does-georgia-require-workers-compensation":1,"duluth-best-carriers":1,
    "duluth-business-gaps":1,"duluth-business-insurance-community":1,
    "duluth-flood":1,"employers-wc-ga-small-business":1,
    "foremost-ga-specialty-lines":1,"ga-auto-minimums":1,
    "ga-auto-teen-driver-premium":1,"ga-auto-um-coverage-why":1,
    "ga-auto-um-needed":1,"ga-auto-um-why":1,"ga-boat-liability-limits":1,
    "ga-boat-liability-limits-96694":1,"ga-boat-liability-limits-needed":1,
    "ga-bop-cost-vs-separate":1,"ga-bop-included-excluded":1,
    "ga-bop-property-limit-check":1,"ga-bop-who-needs":1,
    "ga-commercial-auto-hnoa":1,"ga-commercial-auto-hnoa-needed":1,
    "ga-commercial-auto-minimums":1,"ga-commercial-auto-rate-factors":1,
    "ga-commercial-umbrella-needed":1,"ga-condo-bare-walls-all-in":1,
    "ga-condo-earthquake":1,"ga-condo-liability":1,
    "ga-condo-loss-assessment-coverage":1,"ga-condo-loss-assessment-ga":1,
    "ga-condo-master-gap":1,"ga-condo-water-backup-drains":1,
    "ga-cyber-average-claim-cost":1,"ga-cyber-security-controls":1,
    "ga-cyber-social-engineering":1,"ga-cyber-underwriting-controls-mfa":1,
    "ga-cyber-what-covered-excluded":1,"ga-cyber-who-needs":1,
    "ga-eo-how-much-limits":1,"ga-epo-claims-made-how-works":1,
    "ga-farm-fire-protection-class":1,"ga-farm-hobby-classification":1,
    "ga-farm-livestock":1,"ga-farm-protection-class":1,"ga-farm-regions":1,
    "ga-farm-vs-homeowners":1,"ga-farm-what-covered":1,"ga-fault-state":1,
    "ga-flood-private-vs-nfip":1,"ga-flood-private-vs-nfip-when":1,
    "ga-flood-zone-x":1,"ga-flood-zone-x-risk":1,
    "ga-gl-coi-vs-additional-insured":1,"ga-gl-how-much-limits":1,
    "ga-gl-key-exclusions":1,"ga-gl-limits-standard":1,
    "ga-habitational-apartment-building":1,"ga-habitational-common-claims":1,
    "ga-habitational-earthquake-excluded":1,"ga-habitational-hoa-master-policy":1,
    "ga-habitational-liability-limits":1,
    "ga-habitational-loss-of-rents-excluded":1,"ga-ho-dog-bite":1,
    "ga-ho-dog-bite-liability":1,"ga-ho-extended-replacement-cost":1,
    "ga-ho-rcv-vs-acv":1,"ga-ho-rcv-vs-acv-explained":1,
    "ga-ho-wind-hail-deductible":1,"ga-home-biz-client-injury":1,
    "ga-home-biz-ecommerce-products":1,"ga-home-biz-eo-needed":1,
    "ga-home-biz-equipment-gap":1,"ga-home-biz-exclusion-explained":1,
    "ga-home-biz-liability":1,"ga-homeowners-required":1,
    "ga-jewelry-appraisal-docs":1,"ga-jewelry-appraisal-needed":1,
    "ga-jewelry-homeowners-sublimit-gap":1,
    "ga-jewelry-homeowners-vs-standalone":1,
    "ga-jewelry-mysterious-disappearance":1,
    "ga-jewelry-mysterious-disappearance-3c870":1,
    "ga-landlord-loss-of-rents":1,"ga-landlord-loss-of-rents-amount":1,
    "ga-landlord-require-tenants-renters":1,"ga-landlord-what-covered":1,
    "ga-mgmt-fiduciary-erisa":1,"ga-mgmt-liability-claims-made":1,
    "ga-mgmt-liability-do-claim-triggers":1,
    "ga-mgmt-liability-do-epl-who-needs":1,
    "ga-mgmt-liability-epl-triggers":1,"ga-mgmt-liability-personal-exposure":1,
    "ga-moto-coverage-recommendations":1,"ga-moto-custom-accessories":1,
    "ga-moto-liability-limits":1,"ga-moto-minimum-required":1,
    "ga-moto-passenger-coverage":1,"ga-moto-required-coverage":1,
    "ga-moto-theft-comprehensive":1,"ga-nonprofit-abuse-molestation":1,
    "ga-nonprofit-board-do-liability":1,"ga-nonprofit-carriers":1,
    "ga-nonprofit-do-donor-claims":1,"ga-nonprofit-required-coverage":1,
    "ga-nonprofit-three-coverages":1,"ga-other-commercial-contractor-package":1,
    "ga-other-commercial-liquor-liability":1,"ga-other-commercial-specialty":1,
    "ga-other-commercial-what-needed":1,"ga-other-manufactured-home":1,
    "ga-other-personal-available":1,"ga-other-personal-carriers":1,
    "ga-other-personal-event-wedding":1,"ga-other-personal-identity-theft":1,
    "ga-other-personal-pet-insurance":1,"ga-other-personal-rv-coverage":1,
    "ga-other-personal-specialty":1,"ga-other-rv-coverage":1,
    "ga-other-vacation-home":1,"ga-pl-exclusions":1,"ga-pl-retroactive-date":1,
    "ga-pl-tail-coverage":1,"ga-renters-ale-displacement":1,
    "ga-renters-how-much-coverage":1,"ga-require-renters":1,
    "ga-scheduled-advantages-over-ho":1,"ga-scheduled-articles-items":1,
    "ga-scheduled-vs-standalone":1,"ga-scheduled-what-to-schedule":1,
    "ga-state-auto-minimums-enough":1,"ga-state-flood-risk-statewide":1,
    "ga-state-homeowners-common-mistakes":1,"ga-state-how-differs":1,
    "ga-state-licensed-all-counties":1,"ga-str-occasional-vs-full-time":1,
    "ga-str-permit-rules":1,"ga-str-permits":1,"ga-str-type-policy-needed":1,
    "ga-umbrella-assets-protected":1,"ga-umbrella-how-much-coverage":1,
    "ga-umbrella-underlying-limits":1,"ga-umbrella-who-needs-it":1,
    "ga-wc-employee-count":1,"ga-wc-premium-calculation-7b719":1,
    "ga-wc-threshold":1,"ga-wc-threshold-counting-employees":1,
    "georgia-at-fault-no-fault-auto-insurance":1,
    "georgia-minimum-auto-insurance-requirements":1,
    "gwinnett-best-carriers":1,"gwinnett-county-business-insurance":1,
    "gwinnett-shop-multiple":1,"gwinnett-weather-flood":1,
    "hanover-commercial-ga-small-mid-market":1,
    "hartford-commercial-ga-bop-wc":1,"hartford-commercial-service":1,
    "hartford-ga-best-fit":1,"hartford-ga-personal-lines":1,
    "hippo-ga-best-fit":1,"hippo-ga-smart-home-difference":1,
    "how-to-file-insurance-complaint-georgia":1,
    "insurance-alpharetta-homeowners-georgia":1,
    "insurance-buford-lake-lanier-georgia":1,
    "insurance-cumming-forsyth-county-georgia":1,
    "insurance-duluth-gwinnett-county-georgia":1,
    "insurance-lawrenceville-gwinnett-georgia":1,
    "insurance-needs-johns-creek-homeowners":1,"insurance-sugar-hill-georgia":1,
    "insurance-suwanee-georgia":1,"jewelers-mutual-ga-claims-process":1,
    "johns-creek-best-carriers":1,"johns-creek-cost-reason":1,
    "johns-creek-hoa-coverage":1,"johns-creek-underinsured-dwelling":1,
    "lawrenceville-best-carriers":1,"lawrenceville-medical-professional-coverage":1,
    "lawrenceville-professional":1,"lawrenceville-weather":1,
    "my-renewal-went-up-should-i-shop-around":1,
    "national-general-ga-non-standard":1,"nationwide-claims-quality":1,
    "nationwide-commercial-claims":1,"nationwide-commercial-ga-appointed":1,
    "nationwide-commercial-ga-farm-bop":1,"nationwide-ga-appointed":1,
    "nationwide-ga-claims-satisfaction":1,"nationwide-ga-farm-rural":1,
    "nationwide-ga-farm-rural-b237f":1,"nfip-vs-private-ga":1,
    "north-atlanta-best-carriers":1,"north-atlanta-common-coverage-gaps":1,
    "north-atlanta-weather-risks":1,"north-atlanta-why-different":1,
    "olive-licensed":1,"openly-ga-appetite":1,"openly-ga-appointed":1,
    "openly-ga-high-value-homes":1,"philadelphia-insurance-ga-nonprofit":1,
    "progressive-commercial-ga-appointed":1,"progressive-commercial-ga-auto":1,
    "progressive-commercial-wc":1,"progressive-ga-appointed":1,
    "progressive-ga-auto-pricing":1,"progressive-ga-best-for":1,
    "progressive-ga-snapshot-telematics":1,"progressive-specialty-vehicles":1,
    "renters-required-georgia":1,"rli-ga-standalone-umbrella":1,
    "safeco-ga-appointed":1,"safeco-ga-auto-pricing":1,"safeco-ga-best-for":1,
    "safeco-independent-agent-only":1,"savannah-active-carriers":1,
    "savannah-coastal-different":1,"savannah-coastal-homeowners-coverage":1,
    "savannah-tybee-flood":1,"selective-ga-flood-private":1,
    "steadily-ga-str-landlord":1,"stillwater-ga-appointed":1,
    "stillwater-ga-non-standard":1,"stillwater-pricing-context":1,
    "sugar-hill-homeowners-coverage-issues":1,"suwanee-hoa-coverage-interaction":1,
    "travelers-am-best-explained":1,"travelers-commercial-business-size":1,
    "travelers-commercial-ga-appointed":1,"travelers-commercial-ga-mid-market":1,
    "travelers-ga-am-best-rating":1,"travelers-ga-best-pricing":1,
    "travelers-ga-claims-experience":1,"travelers-ga-homeowners-appetite":1,
    "umbrella-asset-protection-ga":1,"us-assure-builders-risk-georgia":1,
    "wc-1099-contractors":1,"wc-3-employee-rule":1
  };

  // Insights scope: Georgia (g) or National (n). 8 Georgia-scope articles.
  var OC_INSIGHTS_SCOPE = {
    "acv-vs-rcv-replacement-cost-coverage-explained":"n",
    "atlanta-tornado-hail-wind-coverage":"g",
    "georgia-auto-insurance-minimum-limits":"g",
    "georgia-bop-insurance-guide":"n",
    "georgia-commercial-auto-insurance-guide-b880e":"n",
    "georgia-cyber-insurance-guide":"n",
    "georgia-flood-insurance-nfip-vs-private":"n",
    "georgia-general-liability-insurance-guide":"n",
    "georgia-home-underinsured-dwelling-coverage":"n",
    "georgia-homeowners-insurance-common-gaps":"n",
    "georgia-professional-liability-insurance-guide":"n",
    "georgia-renters-insurance-guide":"n",
    "georgia-sewer-backup-water-damage-coverage":"g",
    "georgia-small-business-insurance-guide":"n",
    "georgia-umbrella-insurance-guide":"n",
    "georgia-wind-hail-deductibles-explained":"g",
    "georgia-workers-compensation-guide":"g",
    "nfip-flood-insurance-georgia":"n",
    "north-atlanta-homeowners-underinsured":"g",
    "north-atlanta-insurance-markets-guide":"g",
    "not-at-fault-georgia-accident-insurance":"g",
    "personal-umbrella-insurance-georgia":"n",
    "what-is-a-declarations-page":"n"
  };

  // Insurance Terms jurisdiction maps (2026-06-05 classification).
  // Federal: FEMA programs/forms. Georgia: state-law-specific terms.
  // All other 79 terms have null jurisdiction and no notice.
  var OC_TERMS_GEO = {'workers-compensation':1,'sr-22':1};
  var OC_TERMS_FED = {'nfip':1,'flood-zone':1,'elevation-certificate':1};
  // Citation URLs for the classified terms (authoritative primary sources).
  var OC_TERMS_CITE = {
    'nfip':'https://www.fema.gov/flood-insurance',
    'flood-zone':'https://msc.fema.gov',
    'elevation-certificate':'https://www.fema.gov/flood-maps/tools-resources/flood-map-products/elevation-certificate',
    'workers-compensation':'https://sbwc.georgia.gov',
    'sr-22':'https://dds.georgia.gov'
  };

  // ====================================================================
  // 1. TEXT RULES (applied in a single TreeWalker pass)
  // ====================================================================

  // agent -> advisor (brand voice)
  var AGENT_RULES = [
    [/\blicensed insurance agent, broker, or counselor\b/g, 'licensed insurance advisor, broker, or counselor'],
    [/\blicensed insurance agent\b/g, 'licensed insurance advisor'],
    [/\blicensed agent\b/g, 'licensed advisor'],
    [/\binsurance agent.s license\b/g, "insurance advisor's license"],
    [/\binsurance agent\b/g, 'insurance advisor'],
    [/\bindependent agent\b/g, 'independent advisor'],
    [/\bIndependent Agent\b/g, 'Independent Advisor'],
    [/\bcaptive agent\b/g, 'captive advisor'],
    [/\bYour Agent Needs It\b/g, 'Your Advisor Needs It'],
    [/\byour agent\b/g, 'your advisor'],
    [/\bYour agent\b/g, 'Your advisor'],
    [/\bour agent\b/g, 'our advisor'],
    [/\bThe agent is who you buy from\b/g, 'The advisor is who you buy from'],
    [/\bthe agent is who you buy from\b/g, 'the advisor is who you buy from'],
    [/\bagent will follow up\b/g, 'advisor will follow up'],
    [/office visits by appointment only/gi, 'by appointment so we can give you our full attention']
  ];

  // brand attribution: "Olive Cover is a licensed [...] agency" ->
  // "Olive Insurance Services, LLC (dba Olive Cover) is a licensed [...] agency"
  var BRAND_RULES = [
    [/\bOlive Cover is a licensed independent property and casualty insurance agency\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed independent property and casualty insurance agency'],
    [/\bOlive Cover is a licensed Georgia property and casualty insurance agency\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed Georgia property and casualty insurance agency'],
    [/\bOlive Cover is currently licensed\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is currently licensed'],
    [/\bOlive Cover is licensed for\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is licensed for'],
    [/\bOlive Cover is licensed in\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is licensed in'],
    [/\bOlive Cover holds active P\s*&\s*C licenses\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) holds active P&C licenses'],
    [/\bOlive Cover holds active P\s*&amp;\s*C licenses\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) holds active P&C licenses'],
    [/\bOlive Cover \(Olive Insurance Services, LLC\) is a licensed property and casualty insurance agency\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed property and casualty insurance agency'],
    [/\bwhere Olive Cover is currently licensed\b/g, 'where Olive Insurance Services, LLC (dba Olive Cover) is currently licensed'],
    [/\bOlive Cover operates as Olive Insurance Services, LLC\b/g, 'Olive Insurance Services, LLC operates as Olive Cover'],
    [/\bOlive Cover is owned and operated by\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is owned and operated by'],
    [/\bOlive Cover's insurance license number\b/g, "Olive Insurance Services, LLC's insurance license number (dba Olive Cover)"],
    [/\bWhat lines of insurance is Olive Cover licensed to sell\?/g, 'What lines of insurance is Olive Insurance Services, LLC licensed to sell?'],
    [/\bWhat states is Olive Cover currently licensed in\?/g, 'What states is Olive Insurance Services, LLC currently licensed in?'],
    [/\bWhat is Olive Cover's insurance license number\b/g, "What is Olive Insurance Services, LLC's insurance license number"],
    [/\bIs Olive Cover a licensed insurance agency\?/g, 'Who holds the insurance license behind Olive Cover?'],
    [/\bWe are a licensed P\s*&\s*C agency based in Johns Creek\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P&C agency based in Johns Creek'],
    [/\bWe are a licensed P\s*&amp;\s*C agency based in Johns Creek\b/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P&C agency based in Johns Creek'],
    [/^We are a licensed P$/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P'],
    [/^We are a licensed P\s*$/g, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed P ']
  ];

  // /commercial-carriers carrier-appetite cells: "real estate" -> "commercial property"
  var CROSS_RULES = [
    [/(commercial,\s*manufacturing,\s*construction,\s*)real estate\b/gi, '$1commercial property'],
    [/(Retail,\s*professional services,\s*)real estate(,\s*hospitality)/gi, '$1commercial property$2']
  ];

  function nodeMatters(v) {
    if (!v) return false;
    if (/\bagent\b/i.test(v)) return true;
    if (v.indexOf('Olive Cover') >= 0) return true;
    if (/We are a licensed P/i.test(v)) return true;
    if (/office visits by appointment only/i.test(v)) return true;
    if (ON_COMMERCIAL_CARRIERS && /real estate/i.test(v)) return true;
    return false;
  }

  function patchText() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        while (p) {
          var tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return nodeMatters(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var i, j;
    nodes.forEach(function (n) {
      var t = n.nodeValue;
      var orig = t;
      for (i = 0; i < AGENT_RULES.length; i++) t = t.replace(AGENT_RULES[i][0], AGENT_RULES[i][1]);
      for (i = 0; i < BRAND_RULES.length; i++) t = t.replace(BRAND_RULES[i][0], BRAND_RULES[i][1]);
      if (ON_COMMERCIAL_CARRIERS) for (j = 0; j < CROSS_RULES.length; j++) t = t.replace(CROSS_RULES[j][0], CROSS_RULES[j][1]);
      if (t !== orig) n.nodeValue = t;
    });
  }

  function patchJSONLD() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.dataset.ocPatchDone === '1') continue;
      var raw = s.textContent || '';
      if (!raw.trim()) continue;
      var data;
      try { data = JSON.parse(raw); } catch (e) { continue; }
      var changed = false;
      function walk(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) { obj.forEach(walk); return; }
        var t = obj['@type'];
        var isAgency = t === 'InsuranceAgency' || t === 'LocalBusiness' || t === 'Organization';
        if (isAgency && obj.name && /olive\s*cover/i.test(obj.name)) {
          if (!obj.legalName) { obj.legalName = 'Olive Insurance Services, LLC'; changed = true; }
          if (!obj.alternateName) { obj.alternateName = 'Olive Insurance Services'; changed = true; }
        }
        for (var k in obj) {
          if (typeof obj[k] === 'string') {
            var orig = obj[k];
            var fixed = orig
              .replace(/Olive Cover, an independent insurance agency/gi, 'Olive Cover (the consumer brand of Olive Insurance Services, LLC, an independent insurance agency)')
              .replace(/Olive Cover, an independent property and casualty agency/gi, 'Olive Cover (the consumer brand of Olive Insurance Services, LLC, an independent property and casualty agency)')
              .replace(/Olive Cover is owned and operated by/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is owned and operated by')
              .replace(/Olive Cover is currently licensed/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is currently licensed')
              .replace(/Olive Cover is licensed for/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is licensed for')
              .replace(/Olive Cover is a licensed independent property and casualty insurance agency/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed independent property and casualty insurance agency')
              .replace(/Olive Cover is a licensed Georgia property and casualty insurance agency/gi, 'Olive Insurance Services, LLC (dba Olive Cover) is a licensed Georgia property and casualty insurance agency')
              .replace(/Olive Cover operates as Olive Insurance Services, LLC/gi, 'Olive Insurance Services, LLC operates as Olive Cover');
            if (fixed !== orig) { obj[k] = fixed; changed = true; }
          } else if (typeof obj[k] === 'object') {
            walk(obj[k]);
          }
        }
      }
      walk(data);
      if (changed) { try { s.textContent = JSON.stringify(data); } catch (e) {} }
      s.dataset.ocPatchDone = '1';
    }
  }

  // ====================================================================
  // 2. BOOK A CALL -- footer + nav CTA
  // ====================================================================

  function injectFooter() {
    if (document.querySelector('[data-oc-book-footer="1"]')) return;
    var faqLinks = document.querySelectorAll('a[href="/faq"], a[href$="/faq"]');
    if (!faqLinks.length) return;
    var footerFaq = faqLinks[faqLinks.length - 1];
    var linkWrap = footerFaq.parentElement;
    var column = linkWrap && linkWrap.parentElement;
    if (!column) return;
    var newWrap = document.createElement(linkWrap.tagName);
    newWrap.setAttribute('data-oc-book-footer', '1');
    if (linkWrap.className) newWrap.className = linkWrap.className;
    var a = document.createElement('a');
    a.href = BOOK_URL;
    a.textContent = BOOK_LABEL;
    a.className = footerFaq.className || '';
    newWrap.appendChild(a);
    column.appendChild(newWrap);
  }

  function injectNav() {
    if (ON_BOOK) return;
    if (document.querySelector('[data-oc-book-nav="1"]')) return;
    var navCTA = null;
    var anchors = document.querySelectorAll('a[href="/coverage-review"]');
    for (var i = 0; i < anchors.length; i++) {
      var inNav = anchors[i].closest('nav') || anchors[i].closest('header') || anchors[i].closest('[class*="oc-nav"]');
      if (inNav) { navCTA = anchors[i]; break; }
    }
    if (!navCTA) return;
    var book = document.createElement('a');
    book.href = BOOK_URL;
    book.setAttribute('data-oc-book-nav', '1');
    book.textContent = BOOK_LABEL;
    book.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;padding:0 14px;height:44px;margin-right:8px;color:#1B3A5C;font-family:Inter,system-ui,sans-serif;font-size:0.9375rem;font-weight:600;text-decoration:none;border-radius:6px;border:1px solid #B8934A;background:transparent;transition:background-color 0.15s ease,color 0.15s ease';
    book.addEventListener('mouseenter', function () { book.style.background = '#B8934A'; book.style.color = '#FFFFFF'; });
    book.addEventListener('mouseleave', function () { book.style.background = 'transparent'; book.style.color = '#1B3A5C'; });
    navCTA.parentNode.insertBefore(book, navCTA);
  }

  // ====================================================================
  // 4. AEO JSON-LD on /book and /coverage-gap-calculator
  // ====================================================================

  function injectSchema() {
    if (!ON_BOOK && !ON_GAPCALC) return;
    if (document.querySelector('script[data-oc-patch-schema="1"]')) return;
    var schema;
    if (ON_BOOK) {
      schema = {
        "@context": "https://schema.org", "@type": "Service",
        "name": "Insurance advisor consultation", "alternateName": "Book a call with Olive Cover",
        "description": "Schedule a free call with a licensed insurance advisor at Olive Insurance Services, LLC (dba Olive Cover). Review your current coverage, find gaps, and get quotes across multiple A-rated carriers.",
        "provider": { "@type": "InsuranceAgency", "name": "Olive Cover", "legalName": "Olive Insurance Services, LLC", "url": "https://olivecover.com", "telephone": "+1-678-888-1011", "address": { "@type": "PostalAddress", "streetAddress": "6470 East Johns Crossing Suite 160", "addressLocality": "Johns Creek", "addressRegion": "GA", "postalCode": "30097", "addressCountry": "US" } },
        "areaServed": { "@type": "State", "name": "Georgia" },
        "audience": { "@type": "Audience", "audienceType": "Personal and small business insurance buyers" },
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" },
        "url": "https://olivecover.com/book"
      };
    } else {
      schema = {
        "@context": "https://schema.org", "@type": ["WebApplication", "HowTo"],
        "name": "Coverage Gap Calculator",
        "description": "Free interactive tool to estimate four common insurance coverage gaps: dwelling underinsurance, liability vs. net worth, wind and hail deductible exposure, and flood exclusion.",
        "applicationCategory": "FinanceApplication", "operatingSystem": "Web", "browserRequirements": "Requires JavaScript",
        "url": "https://olivecover.com/coverage-gap-calculator",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "InsuranceAgency", "name": "Olive Cover", "legalName": "Olive Insurance Services, LLC", "url": "https://olivecover.com" },
        "step": [
          { "@type": "HowToStep", "name": "Enter home and net worth basics", "text": "Provide your home replacement cost, current dwelling limit, liability limit, and net worth." },
          { "@type": "HowToStep", "name": "Choose your hazard exposures", "text": "Indicate proximity to coast, hail-prone metro, or flood zone." },
          { "@type": "HowToStep", "name": "Review your gap signals", "text": "See four scored gap signals with plain-language guidance on how to close each one." }
        ]
      };
    }
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-oc-patch-schema', '1');
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  // ====================================================================
  // 5. Ask Olive widget quick-action chips
  // ====================================================================

  var CHIPS = [
    { label: 'Book a call', href: '/book' },
    { label: 'Free coverage review', href: '/coverage-review' },
    { label: 'Browse FAQ', href: '/faq' }
  ];
  var CHIPS_SUPPRESS = false;

  function injectChips() {
    if (WIDGET_SKIP || CHIPS_SUPPRESS) return;
    var greeting = document.querySelector('#oc-wgt-greeting');
    if (!greeting) return;
    if (document.querySelector('#oc-wgt-chips')) return;
    var row = document.createElement('div');
    row.id = 'oc-wgt-chips';
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px 0;padding:0 4px;font-family:Inter,system-ui,sans-serif';
    CHIPS.forEach(function (c) {
      var a = document.createElement('a');
      a.href = c.href;
      a.textContent = c.label;
      a.setAttribute('data-oc-chip', c.href);
      a.style.cssText = 'display:inline-flex;align-items:center;padding:6px 12px;background:#FFFFFF;color:#1B3A5C;font-size:0.8125rem;font-weight:600;text-decoration:none;border:1.5px solid #B8934A;border-radius:18px;line-height:1.2;cursor:pointer;transition:background-color 0.15s ease,color 0.15s ease';
      a.addEventListener('mouseenter', function () { a.style.background = '#B8934A'; a.style.color = '#FFFFFF'; });
      a.addEventListener('mouseleave', function () { a.style.background = '#FFFFFF'; a.style.color = '#1B3A5C'; });
      a.addEventListener('click', function () {
        try {
          if (typeof window.gtag === 'function') window.gtag('event', 'widget_chip_click', { event_category: 'engagement', event_label: c.label, chip_target: c.href });
          if (window.dataLayer) window.dataLayer.push({ event: 'widget_chip_click', chip_target: c.href });
        } catch (e) {}
      });
      row.appendChild(a);
    });
    if (greeting.nextSibling) greeting.parentNode.insertBefore(row, greeting.nextSibling);
    else greeting.parentNode.appendChild(row);
    bindHideOnSubmit();
  }

  function bindHideOnSubmit() {
    // NOTE: do NOT hide chips on form submit -- the capture form's "Start Chat"
    // is a form submit and must NOT suppress the chips (that was the bug where
    // chips vanished after Start Chat). Chips are hidden only when an actual
    // inbound chat message appears (handled by the thread observer below).
    var thread = document.querySelector('#oc-wgt-thread');
    if (thread && !thread.dataset.ocChipsObserved) {
      thread.dataset.ocChipsObserved = '1';
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 1 && /msg-wrap--in|bubble--in/.test(n.className || '')) { hideChips(); return; }
          }
        }
      });
      obs.observe(thread, { childList: true, subtree: true });
    }
  }

  function hideChips() {
    CHIPS_SUPPRESS = true;
    var row = document.querySelector('#oc-wgt-chips');
    if (row) row.remove();
  }

  // ====================================================================
  // 6. CTA color fix (folded in from occtafix) -- remove stray inline color
  //    on claims hero CTA and stub primary CTA so brand styling wins.
  // ====================================================================

  function fixCTAColor() {
    var els = document.querySelectorAll('.oc-claims-hero-cta, .oc-stub-cta-primary, [data-oc-footer-cta] a');
    for (var i = 0; i < els.length; i++) els[i].style.removeProperty('color');
  }

  // ====================================================================
  // 7. Homepage Ask Olive lead-form button -- brand the generic "Submit".
  // ====================================================================

  function fixHomeButton() {
    if (location.pathname !== '/' && location.pathname !== '') return;
    var form = document.querySelector('#oc-lead-form-el');
    if (!form) return;
    var btn = form.querySelector('input[type="submit"]');
    if (btn && btn.value !== 'Ask Olive') {
      btn.value = 'Ask Olive';
      // keep the "please wait" state on-brand too
      try { btn.setAttribute('data-wait', 'Sending...'); } catch (e) {}
    }
  }

  // ====================================================================
  // 8. /contact topic select -- add an aria-label (a11y; selects can't use
  //    placeholder, and this one had no associated label).
  // ====================================================================

  function fixContactSelect() {
    if (location.pathname.indexOf('/contact') !== 0) return;
    var sel = document.querySelector('select[name="topic"]');
    if (sel && !sel.getAttribute('aria-label') && !sel.getAttribute('aria-labelledby')) {
      sel.setAttribute('aria-label', 'What is your inquiry about?');
    }
  }

  // /book is Olive-gated: it should funnel to the Ask Olive chat, NOT embed a
  // directly-bookable calendar. Hide any leftover inline embed and inject a
  // "talk to Olive" CTA that opens the chat widget (Olive qualifies the visitor,
  // then triggers the booking popup via OC_OpenBooking). Per OC-Clip rev3 spec.
  function fixBookPage() {
    if (location.pathname !== '/book' && location.pathname !== '/book/') return;
    var embed = document.querySelector('#oc-cal-inline');
    if (embed) embed.style.display = 'none';
    if (document.querySelector('[data-oc-book-chat-cta]')) return;
    var box = document.createElement('div');
    box.setAttribute('data-oc-book-chat-cta', '1');
    box.style.cssText = 'max-width:640px;margin:24px auto;padding:28px 30px;background:#F5EDD8;border:2px solid #B8934A;border-radius:12px;font-family:Inter,system-ui,sans-serif;color:#1B3A5C;text-align:center';
    box.innerHTML = '<div style="font-family:Playfair Display,Georgia,serif;font-size:1.5rem;font-weight:600;margin-bottom:8px">Talk to Olive to find your fit</div>' +
      '<div style="font-size:0.95rem;line-height:1.55;margin-bottom:18px">Tell Olive what you need (coverage review, a claim question, or anything else) and she will help you book the right time with a licensed Olive Cover advisor.</div>' +
      '<button type="button" data-oc-book-chat-open style="display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 22px;background:#1B3A5C;color:#F5EDD8;border:none;border-radius:6px;font-family:Inter,system-ui,sans-serif;font-size:0.95rem;font-weight:600;cursor:pointer">Chat with Olive</button>';
    box.querySelector('[data-oc-book-chat-open]').addEventListener('click', function () {
      var r = document.getElementById('oc-widget-root');
      if (r) { try { r.open = true; r.setAttribute('open', ''); } catch (e) {} r.scrollIntoView({ block: 'center' }); }
    });
    if (embed && embed.parentNode) embed.parentNode.insertBefore(box, embed);
    else (document.querySelector('main') || document.body).appendChild(box);
  }

  // ====================================================================
  // 9. Suggest-a-correction widget -- add a state select + carry state in the
  //    feedback create-case payload (the ocfeedback widget in ocshim had no
  //    state field). Done here (owned, low-risk) rather than editing ocshim.
  // ====================================================================

  var OC_STATES = [
    ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
    ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],
    ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],
    ['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],
    ['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],
    ['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
    ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
    ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],
    ['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],
    ['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],
    ['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']
  ];

  function fixFeedbackState() {
    var modal = document.getElementById('oc-fb-modal');
    if (!modal) return;
    if (modal.querySelector('#oc-fb-state')) return;
    var emailLabel = modal.querySelector('label[for="oc-fb-email"]');
    if (!emailLabel) return;
    var cur = '';
    try { cur = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {}
    var lbl = document.createElement('label');
    lbl.setAttribute('for', 'oc-fb-state');
    lbl.textContent = 'Which state does this relate to? (optional)';
    var sel = document.createElement('select');
    sel.id = 'oc-fb-state';
    sel.setAttribute('aria-label', 'Which state does this relate to?');
    sel.style.cssText = 'width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:4px;font:14px Inter,sans-serif;box-sizing:border-box;background:#fff;color:#1B3A5C';
    var o0 = document.createElement('option');
    o0.value = ''; o0.textContent = 'Select a state (optional)';
    sel.appendChild(o0);
    OC_STATES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s[0]; o.textContent = s[1];
      if (s[0] === cur) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      try { if (sel.value) localStorage.setItem('oc_state', sel.value); } catch (e) {}
    });
    emailLabel.parentNode.insertBefore(lbl, emailLabel);
    emailLabel.parentNode.insertBefore(sel, emailLabel);
  }

  // Wrap fetch once so the feedback create-case POST carries the state value
  // (from the injected select, falling back to cached oc_state).
  function wrapFeedbackFetch() {
    if (window.__ocFbFetchWrapped) return;
    window.__ocFbFetchWrapped = true;
    var of = window.fetch;
    if (typeof of !== 'function') return;
    window.fetch = function (u, o) {
      try {
        var url = (typeof u === 'string') ? u : (u && u.url);
        if (url && /\/feedback\/create-case/.test(url) && o && typeof o.body === 'string') {
          var selEl = document.getElementById('oc-fb-state');
          var stv = (selEl && selEl.value) ? selEl.value : '';
          if (!stv) { try { stv = (localStorage.getItem('oc_state') || '').toUpperCase().trim(); } catch (e) {} }
          if (stv) {
            var d = JSON.parse(o.body);
            if (d && typeof d === 'object' && !d.state) { d.state = stv; o.body = JSON.stringify(d); }
          }
        }
      } catch (e) {}
      return of.apply(this, arguments);
    };
  }

  // ====================================================================
  // 10. Booking (Olive-gated). Opens the Easy!Appointments booking page in a
  //     branded modal iframe; exposes window.OC_OpenBooking(eventType, prefill)
  //     so Olive triggers a branded booking popup from chat after she
  //     state-qualifies the visitor (GA + booking-fit). Per OC-Clip
  //     booking-integration spec (2026-05-28, rev 3). GA4: book_popup_open,
  //     book_completed.
  // ====================================================================

  function setupBooking() {
    if (window.OC_OpenBooking) return; // once

    // Easy!Appointments (book.olivecover.com) replaces cal.diy. There is no
    // embed SDK; we open the branded booking page in a modal iframe. Olive
    // (in chat) calls OC_OpenBooking(topic, prefill) after she state-qualifies
    // the visitor. Booking COMPLETION is captured server-side via the
    // E!A -> CLIP webhook (appointment_save) -> CRM, so there is no front-end
    // CRM post. The booking page is brand-themed + english-only and only
    // frameable from olivecover.com + staging (CSP frame-ancestors).
    var EA_BASE = 'https://book.olivecover.com/index.php/booking';
    // topic -> E!A service id (see _oc-clip-deliverables/easyappointments-clip-integration.md)
    var EA_SVC = {
      'coverage-review': 2, 'free-coverage-review': 2,
      'personal': 3, 'personal-consultation': 3,
      'commercial': 4, 'business': 4, 'commercial-consultation': 4,
      'customer-service': 5, 'billing': 5, 'general-questions': 5,
      'claims-help': 6, 'claims': 6
    };

    function closeModal() {
      var m = document.getElementById('oc-ea-modal');
      if (m && m.parentNode) m.parentNode.removeChild(m);
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') closeModal(); }

    window.OC_OpenBooking = function (eventType, prefill) {
      prefill = prefill || {};
      var svc = EA_SVC[eventType] || 2;
      var qp = new URLSearchParams();
      var nm = String(prefill.name || '').trim().split(/\s+/);
      if (nm[0]) qp.set('first_name', nm[0]);
      if (nm.length > 1) qp.set('last_name', nm.slice(1).join(' '));
      if (prefill.email) qp.set('email', prefill.email);
      if (prefill.phone) qp.set('phone_number', prefill.phone);
      qp.set('service', svc);
      var url = EA_BASE + '?' + qp.toString();

      if (document.getElementById('oc-ea-modal')) return;
      var ov = document.createElement('div');
      ov.id = 'oc-ea-modal';
      ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(15,38,64,0.6);display:flex;align-items:center;justify-content:center;padding:16px';
      var box = document.createElement('div');
      box.style.cssText = 'position:relative;width:100%;max-width:920px;height:90vh;background:#F5EDD8;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4)';
      var cl = document.createElement('button');
      cl.type = 'button';
      cl.setAttribute('aria-label', 'Close booking');
      cl.style.cssText = 'position:absolute;top:8px;right:8px;width:32px;height:32px;border:none;border-radius:50%;background:#1B3A5C;cursor:pointer;z-index:2;padding:0';
      cl.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="display:block;margin:auto"><path d="M2 2 L12 12 M12 2 L2 12" stroke="#F5EDD8" stroke-width="2" stroke-linecap="round"/></svg>';
      cl.addEventListener('click', closeModal);
      var ifr = document.createElement('iframe');
      ifr.src = url;
      ifr.title = 'Book a time with an Olive Cover advisor';
      ifr.style.cssText = 'width:100%;height:100%;border:0;display:block';
      box.appendChild(cl);
      box.appendChild(ifr);
      ov.appendChild(box);
      ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
      document.addEventListener('keydown', onEsc);
      document.body.appendChild(ov);

      try {
        if (window.gtag) window.gtag('event', 'book_popup_open', { event_category: 'booking', event_type: eventType || 'coverage-review', trigger_source: prefill.trigger_source || 'olive_chat' });
      } catch (e) {}
    };

    // If the E!A confirmation later postMessages {ocBooking:'success'} from the
    // book origin, fire book_completed + close. (Authoritative completion is the
    // server-side webhook; this is a best-effort front-end signal.)
    window.addEventListener('message', function (ev) {
      try {
        if (!ev || ev.origin !== 'https://book.olivecover.com') return;
        var d = ev.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { return; } }
        if (!d || d.ocBooking !== 'success') return;
        if (window.gtag) window.gtag('event', 'book_completed', { event_category: 'booking' });
        closeModal();
      } catch (e) {}
    }, false);
  }

  // ====================================================================
  // 10.5 occarrierhub -- add NFIP to the hand-built carrier hub pages
  // (/personal-carriers, /commercial-carriers, /carriers). These pages are
  // static (not CMS-driven). On /personal-carriers the right home for NFIP is
  // the "Flood, Jewelry, Umbrella & Landlord" comparison table, so we clone
  // the existing flood carrier's row (Selective), relabel it for NFIP, and
  // insert it right after. On the other hubs we only clean up the stray chip
  // an earlier version appended to the top quick-pick strip (no good flood row
  // to clone there). Idempotent.
  // ====================================================================

  var CARRIER_HUB = {
    '/personal-carriers': {
      cloneFrom: 'selective-insurance', slug: 'nfip-flood-insurance',
      name: 'NFIP Flood', tagline: 'Federal flood program (FEMA)',
      rating: 'Federal',
      notesMatch: /Higher limits than NFIP/,
      notes: 'Federal flood program (FEMA); up to $250K building and $100K contents; the baseline when private flood will not write.'
    },
    '/commercial-carriers': { cleanupOnly: true, slug: 'nfip-flood-insurance' },
    '/carriers': { cleanupOnly: true, slug: 'nfip-flood-insurance' }
  };

  function ocRelabelRow(clone, cfg) {
    var as = clone.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href') || '';
      if (h.indexOf(cfg.cloneFrom) >= 0) as[i].setAttribute('href', '/carriers/' + cfg.slug);
    }
    var w = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null);
    var t, ns = [];
    while (t = w.nextNode()) ns.push(t);
    for (var j = 0; j < ns.length; j++) {
      var nv = ns[j].nodeValue, s = nv.trim();
      if (s === 'Selective') ns[j].nodeValue = nv.replace('Selective', cfg.name);
      else if (s === 'Private flood specialist') ns[j].nodeValue = cfg.tagline;
      else if (s === 'Private Flood') ns[j].nodeValue = 'Federal Flood';
      else if (s === 'A') ns[j].nodeValue = cfg.rating;
      else if (cfg.notesMatch && cfg.notesMatch.test(nv)) ns[j].nodeValue = cfg.notes;
    }
  }

  function injectCarrierHub() {
    var cfg = CARRIER_HUB[path.replace(/\/$/, '') || '/'];
    if (!cfg) return;
    // Remove the stray chip an earlier version appended to a quick-pick strip.
    var stale = document.querySelectorAll('a[data-oc-injected="1"]');
    for (var i = 0; i < stale.length; i++) {
      if ((stale[i].getAttribute('href') || '').indexOf(cfg.slug) >= 0 && stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
    }
    if (cfg.cleanupOnly || !cfg.cloneFrom) return;
    if (document.querySelector('[data-oc-injected="floodrow"]')) return;
    var refs = document.querySelectorAll('a[href*="' + cfg.cloneFrom + '"]');
    if (!refs.length) return;
    var seen = [];
    for (var r = 0; r < refs.length; r++) {
      var row = refs[r].closest ? refs[r].closest('tr') : null;
      if (!row || row === document.body || seen.indexOf(row) >= 0) continue;
      if (!/flood/i.test(row.textContent)) continue; // only the flood row
      seen.push(row);
      var clone = row.cloneNode(true);
      ocRelabelRow(clone, cfg);
      clone.setAttribute('data-oc-injected', 'floodrow');
      if (row.parentNode) row.parentNode.insertBefore(clone, row.nextSibling);
    }
  }

  // ====================================================================
  // 10.6 fixCarrierClaimsPhone -- ocshim's occarrierphones holds a static map
  // of the original 41 carriers; a NEW carrier's profile shows the template's
  // "Phone unavailable" fallback. Patch known new carriers here until they are
  // added to ocshim's map. NFIP claims route through the Selective flood WYO
  // line. Idempotent.
  // ====================================================================

  var NEW_CARRIER_PHONES = { 'nfip-flood-insurance': '877-348-0552' };

  function fixCarrierClaimsPhone() {
    var m = location.pathname.match(/^\/carriers\/([a-z0-9-]+)\/?$/);
    if (!m) return;
    var phone = NEW_CARRIER_PHONES[m[1]];
    if (!phone) return;
    var link = document.getElementById('carrier-claims-phone-link');
    if (!link) return;
    var tel = phone.replace(/[^0-9]/g, '');
    if (link.getAttribute('href') === 'tel:' + tel) return; // already set
    link.setAttribute('href', 'tel:' + tel);
    link.textContent = phone;
    link.style.setProperty('color', '#B8934A', 'important');
    link.style.setProperty('font-weight', '600', 'important');
  }

  // ====================================================================
  // 10.7 fixCarrierTableNA -- the carrier comparison tables show a bare "N/A"
  // in feature columns a carrier does not apply to. Replace that text with a
  // muted dash (the cell keeps its existing class, so it stays gray) so it
  // reads cleaner next to the green checks. Neutral on purpose: these columns
  // are "not offered / not applicable", not a failing grade, so no red cross.
  // Class-agnostic (personal uses .no/.no-1, commercial uses .c-no-1).
  // ====================================================================

  function fixCarrierTableNA() {
    if (!/^\/(personal|commercial)-carriers\/?$/.test(location.pathname)) return;
    var cells = document.querySelectorAll('table td');
    for (var i = 0; i < cells.length; i++) {
      var td = cells[i], target = null;
      if (td.children.length === 0) {
        if (td.textContent.trim() === 'N/A') target = td;
      } else {
        var leaves = td.querySelectorAll('*');
        for (var j = 0; j < leaves.length; j++) {
          if (leaves[j].children.length === 0 && leaves[j].textContent.trim() === 'N/A') { target = leaves[j]; break; }
        }
      }
      if (target) { target.textContent = '–'; if (target.setAttribute) target.setAttribute('aria-label', 'Not applicable'); }
    }
  }

  // ====================================================================
  // 12. News section -- nav entry + recency dot, and NewsArticle +
  //     BreadcrumbList JSON-LD on /news/{slug}. The /news hub + detail
  //     template + homepage strip + footer link are built in the Designer;
  //     this adds the global-nav discoverability and the AEO payload.
  // ====================================================================

  // Newest News post date (ISO yyyy-mm-dd). Drives the nav recency dot (<30
  // days). Bump this when a newer News post is published (or have CLIP set it).
  var NEWS_LATEST = '2026-06-02';

  function newsIsRecent() {
    try {
      var d = new Date(NEWS_LATEST + 'T00:00:00');
      return (Date.now() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
    } catch (e) { return false; }
  }

  function addRecencyDot(a) {
    if (!newsIsRecent()) return;
    if (a.querySelector('[data-oc-news-dot]')) return;
    var dot = document.createElement('span');
    dot.setAttribute('data-oc-news-dot', '1');
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText = 'display:inline-block;width:7px;height:7px;border-radius:50%;background:#B8934A;margin-left:6px;vertical-align:middle';
    a.appendChild(dot);
  }

  function injectNewsNav() {
    // DESKTOP: the About dropdown (Designer-built) already holds a News link
    // tagged data-oc-news-nav, so this block stands down. It remains only as a
    // defensive fallback: if that tagged link is ever absent, nest into an
    // About dropdown if one exists, else add a top-level News link by About.
    if (!document.querySelector('[data-oc-news-nav="1"]')) {
      var links = document.querySelectorAll('a[href="/about"], a[href$="/about"]');
      var about = null, i;
      for (i = 0; i < links.length; i++) {
        if ((links[i].className || '').indexOf('ocnav-link') >= 0) { about = links[i]; break; }
      }
      if (about) {
        var dd = about.closest ? about.closest('.w-dropdown, [class*="dropdown"]') : null;
        var list = dd ? dd.querySelector('.w-dropdown-list, [class*="dropdown-list"]') : null;
        if (list && list !== about.parentNode) {
          var sub = document.createElement('a');
          sub.href = '/news';
          sub.textContent = 'News & Updates';
          sub.setAttribute('data-oc-news-nav', '1');
          var sib = list.querySelector('a');
          if (sib) sub.className = sib.className || '';
          list.appendChild(sub);
          addRecencyDot(sub);
        } else {
          var news = document.createElement('a');
          news.href = '/news';
          news.textContent = 'News';
          news.setAttribute('data-oc-news-nav', '1');
          news.className = about.className || '';
          if (about.parentNode) about.parentNode.insertBefore(news, about.nextSibling);
          addRecencyDot(news);
        }
      }
    }

    // MOBILE: the mobile menu is a flat list of .oc-mobile-panel-link items.
    // Add "News and Updates" right after "About Olive Cover". Independent of the
    // desktop guard so it always runs.
    var mAbout = document.querySelector('.oc-mobile-panel-link[href="/about"], .oc-mobile-panel-link[href$="/about"]');
    if (mAbout && !document.querySelector('[data-oc-news-mnav="1"]')) {
      var mnews = document.createElement('a');
      mnews.href = '/news';
      mnews.textContent = 'News and Updates';
      mnews.setAttribute('data-oc-news-mnav', '1');
      mnews.className = 'oc-mobile-panel-link';
      if (mAbout.parentNode) mAbout.parentNode.insertBefore(mnews, mAbout.nextSibling);
    }
  }

  var OC_BRAND_LOGO = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/6a13bd76b6e65cc6a3bcd114_Blue%20Olive%20Cover%20Logo.png';

  function injectNewsSchema() {
    var p = location.pathname.replace(/\/$/, '');
    if (p === '/news' || p.indexOf('/news/') !== 0) return; // only /news/{slug}
    if (document.querySelector('script[data-oc-news-schema="1"]')) return;
    // Skip if CMS has already rendered a NewsArticle (prevents duplicate schema)
    var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var ci = 0; ci < ldScripts.length; ci++) {
      try {
        var lo = JSON.parse(ldScripts[ci].textContent);
        var la = lo['@graph'] || [lo];
        if (la.some(function(it){ return it && it['@type'] === 'NewsArticle'; })) return;
      } catch(e) {}
    }
    var h1 = document.querySelector('h1.oc-news-h1') || document.querySelector('h1');
    if (!h1) return;
    var headline = (h1.textContent || '').trim().slice(0, 110);
    if (!headline) return;

    var catEl = document.querySelector('.oc-news-cat');
    var section = catEl ? (catEl.textContent || '').trim() : '';
    var dateEl = document.querySelector('.oc-news-date');
    var pubISO = '';
    if (dateEl) { var dt = new Date((dateEl.textContent || '').trim()); if (!isNaN(dt.getTime())) pubISO = dt.toISOString(); }
    var imgEl = document.querySelector('.oc-news-hero-bg') || document.querySelector('.oc-news-hero img');
    var img = imgEl ? (imgEl.getAttribute('src') || imgEl.src || '') : '';
    var descMeta = document.querySelector('meta[name="description"]');
    var desc = descMeta ? (descMeta.getAttribute('content') || '') : '';
    var canonical = location.origin + location.pathname;

    var publisher = {
      '@type': 'Organization', 'name': 'Olive Cover', 'legalName': 'Olive Insurance Services, LLC',
      'logo': { '@type': 'ImageObject', 'url': OC_BRAND_LOGO }
    };
    var article = {
      '@context': 'https://schema.org', '@type': 'NewsArticle',
      'headline': headline,
      'author': { '@type': 'Organization', 'name': 'Olive Cover', 'legalName': 'Olive Insurance Services, LLC' },
      'publisher': publisher,
      'mainEntityOfPage': canonical, 'inLanguage': 'en-US'
    };
    if (pubISO) { article.datePublished = pubISO; article.dateModified = pubISO; }
    if (section) article.articleSection = section;
    if (img) article.image = img;
    if (desc) article.description = desc;

    var crumbs = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': location.origin + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'News', 'item': location.origin + '/news' },
        { '@type': 'ListItem', 'position': 3, 'name': headline, 'item': canonical }
      ]
    };

    [article, crumbs].forEach(function (obj) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-oc-news-schema', '1');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }

  function injectDefinedTermSchema() {
    var p = location.pathname.replace(/\/$/, '');
    if (p.indexOf('/insurance-terms/') !== 0) return;
    var slug = p.slice('/insurance-terms/'.length);
    if (!slug) return;
    // Webflow embed strips <script> wrappers, leaving a bare JSON text node
    // directly in <body> and sometimes also a body-level <script> LD tag.
    // Remove both before injecting the proper head schema.
    var bWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var bNode, bJsonNodes = [];
    while ((bNode = bWalker.nextNode())) {
      if (bNode.parentNode === document.body && bNode.textContent.indexOf('"@context"') !== -1) bJsonNodes.push(bNode);
    }
    bJsonNodes.forEach(function(n) { n.parentNode.removeChild(n); });
    var bLdScripts = document.body.querySelectorAll('script[type="application/ld+json"]');
    for (var bi = 0; bi < bLdScripts.length; bi++) {
      try { if (JSON.parse(bLdScripts[bi].textContent)['@type'] === 'DefinedTerm') bLdScripts[bi].parentNode.removeChild(bLdScripts[bi]); } catch(e) {}
    }
    if (document.querySelector('script[data-oc-term-schema="1"]')) return;
    var h1 = document.querySelector('h1');
    if (!h1) return;
    var termName = (h1.textContent || '').trim();
    if (!termName) return;
    var descEl = document.querySelector('.oc-term-short, .oc-term-def-short');
    var desc = descEl ? (descEl.textContent || '').trim() : '';
    if (!desc) {
      var metaEl = document.querySelector('meta[name="description"]');
      desc = metaEl ? (metaEl.getAttribute('content') || '').trim() : '';
    }
    var juris = (document.body.getAttribute('data-oc-jurisdiction') || '').trim();
    if (!juris && OC_TERMS_GEO[slug]) juris = 'Georgia';
    if (!juris && OC_TERMS_FED[slug]) juris = 'Federal';
    var term = {
      '@context': 'https://schema.org', '@type': 'DefinedTerm',
      'name': termName, 'url': location.origin + location.pathname,
      'inDefinedTermSet': { '@type': 'DefinedTermSet', 'name': 'Olive Cover Insurance Glossary', 'url': location.origin + '/insurance-terms' }
    };
    if (desc) term.description = desc;
    if (juris === 'Georgia') term.spatialCoverage = { '@type': 'State', 'name': 'Georgia, United States' };
    if (OC_TERMS_CITE[slug]) term.citation = OC_TERMS_CITE[slug];
    var crumbs = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': location.origin + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Insurance Terms', 'item': location.origin + '/insurance-terms' },
        { '@type': 'ListItem', 'position': 3, 'name': termName, 'item': location.origin + location.pathname }
      ]
    };
    [term, crumbs].forEach(function (obj) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-oc-term-schema', '1');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }

  // News collection cards (hub + homepage strip) carry data-news-slug bound to
  // the item Slug. Webflow's current-item link could not be expressed via the
  // API (page-link resolved to /news, collectionPage output the slug literally),
  // so the card href is set here from the slug. Fallback href is /news.
  // v1.10.5: news/insights hub card images are CMS-bound Webflow Images that
  // default to loading="lazy". Below the tall hero they don't load until
  // scrolled, so the navy card background ("blue box") shows. These hubs have
  // only ~12 small cards/page, so load them eagerly to remove the blue boxes.
  function eagerCardImages() {
    var imgs = document.querySelectorAll('a.oc-newscard img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (img.getAttribute('loading') === 'lazy') {
        img.setAttribute('loading', 'eager');
        var s = img.getAttribute('src');
        if (s && !img.complete) { img.src = s; }
      }
    }
  }

  function fixNewsCardLinks() {
    // v1.10.4: also handles the rebuilt /insights hub (data-insights-slug).
    var maps = [['data-news-slug', '/news/'], ['data-insights-slug', '/insights/']];
    for (var m = 0; m < maps.length; m++) {
      var attr = maps[m][0], base = maps[m][1];
      var cards = document.querySelectorAll('a[' + attr + ']');
      for (var i = 0; i < cards.length; i++) {
        var slug = (cards[i].getAttribute(attr) || '').trim();
        if (!slug) continue;
        var want = base + slug;
        if (cards[i].getAttribute('href') !== want) cards[i].setAttribute('href', want);
      }
    }
  }

  function wireAboutDropdown() {
    var dd = document.getElementById('ocn-item-about');
    var panel = document.getElementById('ocn-item-about-panel');
    if (!dd || !panel) return;
    if (dd.dataset.ocAboutWired === '1') return;
    dd.dataset.ocAboutWired = '1';
    var show = function () { panel.style.setProperty('display', 'flex'); dd.setAttribute('aria-expanded', 'true'); };
    var hide = function () { panel.style.setProperty('display', 'none'); dd.setAttribute('aria-expanded', 'false'); };
    dd.addEventListener('mouseenter', show);
    dd.addEventListener('mouseleave', hide);
    dd.addEventListener('focusin', show);
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) hide(); });
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hide(); } });
  }

  // --- News/Insights hub (v1.10.6+): featured lead block + category filter ---
  // Shared logic for both /insights and /news (same oc-newshub/oc-newscard/
  // oc-feat-card/oc-news-filter markup); only the slug attribute and link base
  // differ per hub. (v1.10.9: extended to /news.)
  function hubKind() {
    var p = location.pathname.replace(/\/+$/, '');
    if (p === '/insights') return { slugAttr: 'data-insights-slug', base: '/insights/' };
    if (p === '/news') return { slugAttr: 'data-news-slug', base: '/news/' };
    return null;
  }

  function insightsFeatured() {
    var hk = hubKind(); if (!hk) return;
    var feat = document.querySelector('[class*="oc-feat-card"]');
    var grid = document.querySelector('.oc-news-grid');
    if (!feat || !grid) return;
    if (feat.dataset.ocFilled === '1') return;
    var item = grid.querySelector('.w-dyn-item');
    if (!item) return;
    var card = item.querySelector('a.oc-newscard') || item.querySelector('a');
    if (!card) return;
    var pick = function (sel) { var el = card.querySelector(sel); return el ? el.textContent.trim() : ''; };
    var set = function (sel, val) { var el = feat.querySelector(sel); if (el && val) el.textContent = val; };
    set('.oc-feat-cat', pick('.oc-newscard-cat'));
    set('.oc-feat-title', pick('.oc-newscard-title'));
    set('.oc-feat-excerpt', pick('.oc-newscard-sum'));
    set('.oc-feat-read', pick('.oc-newscard-rt'));
    // Date span: the whtml insert dropped the .oc-feat-date class on this span,
    // so fall back to the first span in the meta row (the read-time span keeps
    // its class and is matched separately above).
    var dateVal = pick('.oc-newscard-date');
    var dateEl = feat.querySelector('.oc-feat-date');
    if (!dateEl) {
      var metaRow = feat.querySelector('.oc-feat-meta');
      if (metaRow) {
        var spans = metaRow.querySelectorAll('span');
        for (var di = 0; di < spans.length; di++) {
          if (spans[di].className.indexOf('oc-feat-read') < 0) { dateEl = spans[di]; break; }
        }
      }
    }
    if (dateEl && dateVal) dateEl.textContent = dateVal;
    var srcImg = card.querySelector('.oc-newscard-img');
    var fImg = feat.querySelector('.oc-feat-img');
    if (fImg && srcImg) {
      var s = srcImg.getAttribute('src') || srcImg.currentSrc || '';
      var ialt = srcImg.getAttribute('alt') || '';
      if (s) {
        // whtml turned the <img> into a non-rendering <imgraw>; swap in a real
        // <img> so the photo actually displays (keeps the native class + CSS).
        if ((fImg.tagName || '').toLowerCase() === 'imgraw') {
          var real = document.createElement('img');
          real.setAttribute('class', fImg.getAttribute('class') || 'oc-feat-img');
          real.setAttribute('loading', 'eager');
          real.setAttribute('alt', ialt);
          real.setAttribute('src', s);
          if (fImg.parentNode) fImg.parentNode.replaceChild(real, fImg);
        } else {
          fImg.setAttribute('src', s);
          fImg.setAttribute('loading', 'eager');
          if (ialt) fImg.setAttribute('alt', ialt);
        }
      }
    }
    var slug = (card.getAttribute(hk.slugAttr) || '').trim();
    if (slug) {
      feat.setAttribute('href', hk.base + slug);
      feat.setAttribute(hk.slugAttr, slug);
    } else {
      var h = card.getAttribute('href');
      if (h && h !== '#') feat.setAttribute('href', h);
    }
    feat.dataset.ocFilled = '1';
    // Remove the now-duplicated newest card from the grid.
    if (item.parentNode) item.parentNode.removeChild(item);
  }

  function insightsLoadAll() {
    var hk = hubKind(); if (!hk) return;
    var grid = document.querySelector('.oc-news-grid');
    if (!grid) return;
    var state = grid.getAttribute('data-oc-loadall');
    if (state === 'loading' || state === 'done') return;
    var next = document.querySelector('.w-pagination-next');
    if (!next) { grid.setAttribute('data-oc-loadall', 'done'); return; }
    grid.setAttribute('data-oc-loadall', 'loading');
    var seen = {};
    var keyOf = function (it) {
      var a = it.querySelector('a[data-insights-slug],a[data-news-slug]');
      if (a) { return a.getAttribute('data-insights-slug') || a.getAttribute('href') || ''; }
      var t = it.querySelector('.oc-newscard-title');
      return t ? t.textContent.trim() : '';
    };
    var cur = grid.querySelectorAll('.w-dyn-item');
    for (var c = 0; c < cur.length; c++) { seen[keyOf(cur[c])] = 1; }
    var finish = function () {
      grid.setAttribute('data-oc-loadall', 'done');
      var pag = document.querySelector('.w-pagination-wrapper');
      if (pag) pag.style.setProperty('display', 'none');
    };
    var fetchPage = function (url, guard) {
      if (guard > 20) { finish(); return; }
      fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.oc-news-grid .w-dyn-item');
        for (var i = 0; i < items.length; i++) {
          var k = keyOf(items[i]);
          if (k && seen[k]) continue;
          seen[k] = 1;
          grid.appendChild(document.importNode(items[i], true));
        }
        var nxt = doc.querySelector('.w-pagination-next');
        if (nxt && nxt.getAttribute('href')) {
          fetchPage(new URL(nxt.getAttribute('href'), location.origin + location.pathname).toString(), guard + 1);
        } else { finish(); }
      }).catch(function () { finish(); });
    };
    fetchPage(new URL(next.getAttribute('href'), location.origin + location.pathname).toString(), 0);
  }

  function insightsFilter() {
    var hk = hubKind(); if (!hk) return;
    var bar = document.querySelector('.oc-news-filter');
    var grid = document.querySelector('.oc-news-grid');
    if (!bar || !grid) return;
    if (bar.dataset.ocBuilt === '1') return;
    if (grid.getAttribute('data-oc-loadall') !== 'done') return;
    var tmpl = bar.querySelector('.oc-news-chip');
    if (!tmpl) return;
    bar.dataset.ocBuilt = '1';
    var items = [].slice.call(grid.querySelectorAll('.w-dyn-item'));
    // Single-article hub: the featured block consumed the only post, leaving no
    // grid items. Hide the empty grid and the now-pointless filter bar so the
    // featured card stands alone.
    if (items.length === 0) {
      bar.style.setProperty('display', 'none');
      var wrap0 = document.querySelector('.oc-newshub-list-inner .w-dyn-list');
      if (wrap0) wrap0.style.setProperty('display', 'none');
      return;
    }
    var cats = [];
    items.forEach(function (it) {
      var ce = it.querySelector('.oc-newscard-cat');
      var t = ce ? ce.textContent.trim() : '';
      if (t && cats.indexOf(t) < 0) cats.push(t);
    });
    cats.sort();
    // Only one category present -> a filter offers nothing; hide the bar.
    if (cats.length < 2) { bar.style.setProperty('display', 'none'); return; }
    cats.forEach(function (t) {
      var chip = tmpl.cloneNode(true);
      chip.classList.remove('oc-news-chip-active');
      chip.setAttribute('data-cat', t);
      chip.textContent = t;
      bar.appendChild(chip);
    });
    var apply = function (cat) {
      items.forEach(function (it) {
        var ce = it.querySelector('.oc-newscard-cat');
        var t = ce ? ce.textContent.trim() : '';
        it.style.display = (!cat || t === cat) ? '' : 'none';
      });
    };
    bar.addEventListener('click', function (e) {
      var chip = e.target && e.target.closest ? e.target.closest('.oc-news-chip') : null;
      if (!chip) return;
      var chips = bar.querySelectorAll('.oc-news-chip');
      for (var i = 0; i < chips.length; i++) { chips[i].classList.remove('oc-news-chip-active'); }
      chip.classList.add('oc-news-chip-active');
      apply(chip.getAttribute('data-cat') || '');
    });
  }

  // --- Page-level FAQ sections (v1.10.16) ---
  // ocfaq-complete.js force-hides every per-page FAQ section (#car-faq,
  // #ins-faq, #about-faq, #wwdb-faq) on all non-/faq pages, and only wires the
  // accordion + state filter on /faq. This reveals each such section on its own
  // page and makes it a clean, working accordion: hides the duplicate
  // questions-only "table of contents" (.oc-faq-short-list) when present,
  // collapses each item by default, reveals the answer on click, differentiates
  // question vs answer visually, and adds one "View all insurance FAQs ->" hub
  // link. Appointments are national, so untagged FAQs always show; a FAQ tagged
  // with a state shows only when that state is the active one.
  function processFaqSection(sec) {
    // hide the questions-only "table of contents" duplicate, if present
    var shortList = sec.querySelector('.oc-faq-short-list');
    if (shortList) shortList.style.setProperty('display', 'none', 'important');
    var coll = sec.querySelector('[id$="-faq-collection"], .w-dyn-list') || sec;
    var items = [].slice.call(coll.querySelectorAll('.w-dyn-item'));
    if (!items.length) return; // no FAQs -> leave hidden
    var DEFAULT_STATE = 'national';
    var active = (document.body.getAttribute('data-state') || DEFAULT_STATE).toLowerCase();
    var stateOf = function (it) {
      var d = it.querySelector('[data-state]') || it;
      var s = (d.getAttribute && d.getAttribute('data-state')) || '';
      return (s || DEFAULT_STATE).toLowerCase();
    };
    var qnum = function (it) { var d = it.querySelector('[data-question-number]'); return d ? d.getAttribute('data-question-number') : null; };
    var over = {};
    items.forEach(function (it) { var s = stateOf(it), q = qnum(it); if (s === active && s !== DEFAULT_STATE && q) over[q] = true; });
    var anyVis = false;
    items.forEach(function (it) {
      var s = stateOf(it), q = qnum(it), show;
      if (s === DEFAULT_STATE) { show = !over[q]; }
      else if (s === active) { show = true; }
      else { show = false; }
      it.style.display = show ? '' : 'none';
      if (show) anyVis = true;
      // Wire the accordion: on some templates the answer (.oc-faq-a) is hidden
      // by template CSS regardless of the <details> open state (the native
      // toggle was only ever wired by ocfaq-complete.js on /faq). Drive the
      // answer's visibility from the details' toggle event (collapsed by
      // default, reveals on click). Harmless where the answer shows natively.
      var det = it.querySelector('details');
      if (det && !det.getAttribute('data-oc-faq-wired')) {
        det.setAttribute('data-oc-faq-wired', '1');
        var ans = det.querySelector('.oc-faq-a') || det.querySelector('p') ||
          [].slice.call(det.children).filter(function (c) { return c.tagName !== 'SUMMARY'; })[0];
        var sum = det.querySelector('summary');
        // Differentiate question from answer: question is bold navy (Inter),
        // answer is set off with a gold left rule + indent so the two read as
        // distinct. (template default renders both as similar gray text).
        if (sum) {
          sum.style.setProperty('cursor', 'pointer');
          sum.style.setProperty('font-family', 'Inter, system-ui, sans-serif');
          sum.style.setProperty('font-weight', '700');
          sum.style.setProperty('color', '#1B3A5C');
          sum.style.setProperty('font-size', '1.0625rem');
          sum.style.setProperty('line-height', '1.4');
        }
        if (ans) {
          ans.style.setProperty('margin-top', '10px');
          ans.style.setProperty('padding-left', '14px');
          ans.style.setProperty('border-left', '2px solid #B8934A');
          ans.style.setProperty('color', '#374151');
        }
        var sync = function () {
          if (!ans) return;
          ans.style.setProperty('display', det.open ? 'block' : 'none', 'important');
        };
        det.addEventListener('toggle', sync);
        det.removeAttribute('open'); // start collapsed
        sync();
      }
    });
    if (anyVis) {
      sec.classList.remove('oc-hidden');
      sec.style.setProperty('display', 'block', 'important');
      sec.removeAttribute('aria-hidden');
      // add a single link to the full FAQ hub for discoverability + internal linking
      if (!sec.querySelector('.oc-cfaq-allfaq')) {
        var wrap = document.createElement('div');
        wrap.className = 'oc-cfaq-allfaq-wrap';
        wrap.style.setProperty('margin-top', '24px');
        var a = document.createElement('a');
        a.className = 'oc-cfaq-allfaq';
        a.setAttribute('href', '/faq');
        a.textContent = 'View all insurance FAQs →';
        a.style.setProperty('color', '#B8934A', 'important');
        a.style.setProperty('font-weight', '600', 'important');
        a.style.setProperty('text-decoration', 'none', 'important');
        wrap.appendChild(a);
        coll.appendChild(wrap);
      }
    }
  }
  function revealPageFaqs() {
    if (location.pathname.indexOf('/faq') === 0) return; // /faq is wired natively by ocfaq-complete.js
    var secs = [].slice.call(document.querySelectorAll('[id$="-faq"]'));
    secs.forEach(function (sec) { try { processFaqSection(sec); } catch (e) {} });
  }

  // ====================================================================
  // 12. Related FAQs -- /faq/{slug} and /insurance-terms/{slug} detail pages
  //     Fetches the static faq-index.json (hosted on GitHub / jsDelivr),
  //     finds same-category FAQs, and renders a collapsed accordion below
  //     the main answer / related-terms section. Same Q/A styling as the
  //     page-level FAQ sections (bold-navy Q, gold-rule A). Link to full
  //     answer so the visitor can read the canonical FAQ page.
  // ====================================================================
  var _faqIdx = null;
  function fetchFaqIdx(cb) {
    if (_faqIdx !== null) { cb(_faqIdx); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/faq-index.json');
    xhr.onload = function () {
      try { _faqIdx = JSON.parse(xhr.responseText); } catch (e) { _faqIdx = []; }
      cb(_faqIdx);
    };
    xhr.onerror = function () { _faqIdx = []; cb([]); };
    xhr.send();
  }

  var TERM_FAQ_CATS = {
    'Auto': ['Auto', 'Commercial Auto', 'Motorcycle', 'Collector Auto', 'Boat'],
    'Home': ['Homeowners', 'Landlord', 'Renters', 'Flood'],
    'Commercial': ['Commercial', 'Commercial Auto', 'Commercial Property', 'Business Owners Policy', 'General Liability', 'Workers Compensation', 'Professional Liability', 'Cyber', 'Management Liability'],
    'Flood': ['Flood', 'Homeowners'],
    'Business': ['Business Owners Policy', 'General Liability', 'Workers Compensation', 'Professional Liability', 'Cyber', 'Management Liability', 'Commercial'],
    'General': ['General', 'Umbrella', 'Carrier']
  };

  function buildRelFaqSection(faqs) {
    var sec = document.createElement('section');
    sec.setAttribute('data-oc-rel-faqs', '1');
    sec.style.cssText = 'max-width:860px;margin:40px auto 0;padding:24px 24px 0;border-top:2px solid #e5e7eb;';
    var h = document.createElement('h3');
    h.textContent = 'Related Questions';
    h.style.cssText = 'font-family:Playfair Display,serif;font-size:1.25rem;font-weight:700;color:#1B3A5C;margin:0 0 16px;';
    sec.appendChild(h);
    faqs.forEach(function (f) {
      var row = document.createElement('div');
      row.style.cssText = 'border-bottom:1px solid #e5e7eb;padding:11px 0;';
      var a = document.createElement('a');
      a.href = '/faq/' + f.s;
      a.textContent = f.q;
      a.style.cssText = 'font-family:Inter,system-ui,sans-serif;font-weight:600;color:#1B3A5C;font-size:1rem;text-decoration:none;display:block;line-height:1.4;';
      row.appendChild(a);
      sec.appendChild(row);
    });
    return sec;
  }

  function injectRelatedFaqs() {
    if (document.querySelector('[data-oc-rel-faqs]')) return;
    var pg = location.pathname;
    var isFaqDetail = /^\/faq\/[^/]+/.test(pg);
    var isTermDetail = /^\/insurance-terms\/[^/]+/.test(pg);
    var isInsuranceDetail = /^\/insurance\/[^/]+/.test(pg);
    var isCarrierDetail = /^\/carriers\/[^/]+/.test(pg);
    if (!isFaqDetail && !isTermDetail && !isInsuranceDetail && !isCarrierDetail) return;
    fetchFaqIdx(function (idx) {
      if (!idx.length || document.querySelector('[data-oc-rel-faqs]')) return;
      var related;
      var seenSlugs = {}, seenQs = {};
      function dedupFilter(arr) {
        return arr.filter(function (f) {
          if (seenSlugs[f.s] || seenQs[f.q]) return false;
          seenSlugs[f.s] = 1; seenQs[f.q] = 1; return true;
        });
      }
      if (isFaqDetail) {
        var sl = pg.replace(/^\/faq\//, '').replace(/\/$/, '');
        var cur = null;
        for (var i = 0; i < idx.length; i++) { if (idx[i].s === sl) { cur = idx[i]; break; } }
        if (!cur) return;
        related = dedupFilter(idx.filter(function (f) { return f.c === cur.c && f.s !== sl; })).slice(0, 4);
      } else {
        // Term page: keyword-match FAQs by H1 term name; fill with General if < 4
        var h1el = document.querySelector('h1');
        var termName = h1el ? h1el.textContent.trim().toLowerCase() : '';
        var byName = termName ? dedupFilter(idx.filter(function (f) { return f.q.toLowerCase().indexOf(termName) !== -1; })) : [];
        if (byName.length < 4) {
          dedupFilter(idx.filter(function (f) { return f.c === 'General'; })).forEach(function (f) { byName.push(f); });
        }
        related = byName.slice(0, 4);
      }
      if (!related.length) return;
      var el = buildRelFaqSection(related);
      // On FAQ pages: if terms pills already injected above, insert after them.
      var relTermsSec = document.querySelector('[data-oc-rel-terms]');
      if (relTermsSec && relTermsSec.parentNode) {
        relTermsSec.parentNode.insertBefore(el, relTermsSec.nextSibling); return;
      }
      // Term detail: anchor after CTA (Terms will wedge between CTA and FAQs
      // when it resolves, producing CTA -> RelTerms -> RelFAQs above footer).
      if (isTermDetail) {
        var ctaSec = document.querySelector('.oc-term-cta-section');
        if (ctaSec && ctaSec.parentNode) { ctaSec.parentNode.insertBefore(el, ctaSec.nextSibling); return; }
        insertBeforeFooter(el); return;
      }
      // FAQ detail: insert after the answer or back-link section.
      var anc = document.querySelector('.oc-faq-a,.oc-faq-back-link');
      if (anc) {
        var ps = anc.closest('section') || anc.parentElement;
        if (ps && ps.parentNode) { ps.parentNode.insertBefore(el, ps.nextSibling); return; }
      }
      insertBeforeFooter(el);
    });
  }

  // ====================================================================
  // 13. Related Terms -- /faq/{slug} detail pages
  //     Fetches terms-index.json, maps the FAQ category to glossary term
  //     categories, and renders 3-4 term pills below the Related Questions
  //     section. Links each pill to /insurance-terms/{slug}.
  // ====================================================================
  var _termsIdx = null;
  function fetchTermsIdx(cb) {
    if (_termsIdx !== null) { cb(_termsIdx); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/terms-index.json');
    xhr.onload = function () {
      try { _termsIdx = JSON.parse(xhr.responseText); } catch (e) { _termsIdx = []; }
      cb(_termsIdx);
    };
    xhr.onerror = function () { _termsIdx = []; cb([]); };
    xhr.send();
  }

  // Maps FAQ category -> term categories (for filtering terms-index)
  var FAQ_TERM_CATS = {
    'Auto': ['Auto'],
    'Commercial Auto': ['Auto', 'Commercial'],
    'Motorcycle': ['Auto'],
    'Collector Auto': ['Auto'],
    'Boat': ['Auto'],
    'Homeowners': ['Home'],
    'Renters': ['Home'],
    'Landlord': ['Home'],
    'Flood': ['Flood', 'Home'],
    'Commercial': ['Commercial', 'Business'],
    'Commercial Property': ['Commercial', 'Business'],
    'Business Owners Policy': ['Business', 'Commercial'],
    'General Liability': ['Business', 'Commercial'],
    'Workers Compensation': ['Business'],
    'Professional Liability': ['Business', 'Commercial'],
    'Cyber': ['Business', 'Commercial'],
    'Management Liability': ['Business', 'Commercial'],
    'General': ['General'],
    'Umbrella': ['General'],
    'Carrier': ['General'],
    'State': ['General']
  };

  function buildRelTermsSection(terms) {
    var sec = document.createElement('section');
    sec.setAttribute('data-oc-rel-terms', '1');
    sec.style.cssText = 'max-width:860px;margin:32px auto 0;padding:20px 24px 0;border-top:1px solid #e5e7eb;';
    var h = document.createElement('h3');
    h.textContent = 'Related Insurance Terms';
    h.style.cssText = 'font-family:Playfair Display,serif;font-size:1.1rem;font-weight:700;color:#1B3A5C;margin:0 0 14px;';
    sec.appendChild(h);
    var grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';
    terms.forEach(function (t) {
      var a = document.createElement('a');
      a.href = '/insurance-terms/' + t.s;
      a.textContent = t.n;
      a.style.cssText = 'display:inline-block;padding:7px 14px;border:1.5px solid #B8934A;border-radius:20px;color:#1B3A5C;background:#fff;font-family:Inter,system-ui,sans-serif;font-size:0.875rem;font-weight:500;text-decoration:none;line-height:1.4;';
      a.addEventListener('mouseover', function () { a.style.background = '#B8934A'; a.style.color = '#fff'; });
      a.addEventListener('mouseout', function () { a.style.background = '#fff'; a.style.color = '#1B3A5C'; });
      grid.appendChild(a);
    });
    sec.appendChild(grid);
    return sec;
  }

  // Walk up from any oc-footer element to its direct body-child ancestor,
  // then insert the given element immediately before it. Keeps injected
  // sections above the footer regardless of where they're called from.
  function findFooterWrapper() {
    var fl = document.querySelector('[class*="oc-footer"]');
    if (!fl) return null;
    var p = fl;
    while (p.parentElement && p.parentElement !== document.body) p = p.parentElement;
    return p.parentElement === document.body ? p : null;
  }
  function insertBeforeFooter(el) {
    var fw = findFooterWrapper();
    if (fw) { document.body.insertBefore(el, fw); } else { document.body.appendChild(el); }
  }

  var TERM_STOP = /^(what|is|a|an|the|how|does|do|i|my|can|will|are|for|to|in|of|on|with|and|or|if|it|be|not|when|why|which|who|from|at|by|this|that|have|has|had|was|were|should|would|could|may|might|need|use|get|give|make|help|own|set|does|do|covers|covered|cover|work|works)$/;

  function slugKeywords(slug) {
    return slug.split(/[-_]+/).filter(function (w) { return w.length > 2 && !TERM_STOP.test(w); });
  }

  function injectRelatedTerms() {
    if (document.querySelector('[data-oc-rel-terms]')) return;
    var pg = location.pathname;
    var isFaqDetail = /^\/faq\/[^/]+/.test(pg);
    var isTermDetail = /^\/insurance-terms\/[^/]+/.test(pg);
    var isInsuranceDetail = /^\/insurance\/[^/]+/.test(pg);
    var isCarrierDetail = /^\/carriers\/[^/]+/.test(pg);
    if (!isFaqDetail && !isTermDetail && !isInsuranceDetail && !isCarrierDetail) return;

    function buildAndInsertTerms(subset, onFaqPage) {
      if (!subset.length || document.querySelector('[data-oc-rel-terms]')) return;
      var el = buildRelTermsSection(subset);
      if (onFaqPage) {
        // Terms go ABOVE the FAQ section -- insert before it if present, else after anchor
        var relFaqSec = document.querySelector('[data-oc-rel-faqs]');
        if (relFaqSec && relFaqSec.parentNode) {
          relFaqSec.parentNode.insertBefore(el, relFaqSec); return;
        }
        var anc2 = document.querySelector('.oc-faq-a,.oc-faq-back-link');
        if (anc2) {
          var ps2 = anc2.closest('section') || anc2.parentElement;
          if (ps2 && ps2.parentNode) { ps2.parentNode.insertBefore(el, ps2.nextSibling); return; }
        }
      } else {
        // Term detail page -- insert immediately after native CTA section.
        // Using cta.nextSibling ensures Terms wedges between CTA and FAQs
        // even when injectRelatedFaqs resolves first (race-safe).
        var ctaSec2 = document.querySelector('.oc-term-cta-section');
        if (ctaSec2 && ctaSec2.parentNode) {
          ctaSec2.parentNode.insertBefore(el, ctaSec2.nextSibling); return;
        }
        var cmsSec = document.querySelector('.oc-term-related-section');
        if (cmsSec && cmsSec.parentNode) {
          cmsSec.parentNode.insertBefore(el, cmsSec.nextSibling); return;
        }
        // Insurance/carrier: if RelFAQs already landed, go before it (race-safe).
        var existingFaqs = document.querySelector('[data-oc-rel-faqs]');
        if (existingFaqs && existingFaqs.parentNode) {
          existingFaqs.parentNode.insertBefore(el, existingFaqs); return;
        }
      }
      insertBeforeFooter(el);
    }

    if (isFaqDetail) {
      var sl = pg.replace(/^\/faq\//, '').replace(/\/$/, '');
      fetchFaqIdx(function (faqIdx) {
        if (!faqIdx.length) return;
        var cur = null;
        for (var i = 0; i < faqIdx.length; i++) { if (faqIdx[i].s === sl) { cur = faqIdx[i]; break; } }
        if (!cur) return;
        var termCats = FAQ_TERM_CATS[cur.c] || ['General'];
        var kws = slugKeywords(sl);
        fetchTermsIdx(function (tIdx) {
          if (!tIdx.length || document.querySelector('[data-oc-rel-terms]')) return;
          var seen = {};
          function dedup(arr) {
            return arr.filter(function (t) { if (seen[t.s]) return false; seen[t.s] = 1; return true; });
          }
          var byKw = kws.length ? tIdx.filter(function (t) {
            var nl = t.n.toLowerCase();
            return kws.some(function (k) { return nl.indexOf(k) !== -1; });
          }) : [];
          var result = dedup(byKw);
          if (result.length < 5) {
            dedup(tIdx.filter(function (t) { return termCats.indexOf(t.c) !== -1; })).forEach(function (t) { result.push(t); });
          }
          if (result.length < 3) {
            dedup(tIdx.filter(function (t) { return t.c === 'General'; })).forEach(function (t) { result.push(t); });
          }
          buildAndInsertTerms(result.slice(0, 5), true);
        });
      });
    } else {
      // Term/insurance/carrier detail: keyword-match terms from page slug
      var tsl = isTermDetail ? pg.replace(/^\/insurance-terms\//, '').replace(/\/$/, '')
               : isInsuranceDetail ? pg.replace(/^\/insurance\//, '').replace(/\/$/, '')
               : pg.replace(/^\/carriers\//, '').replace(/\/$/, '');
      fetchTermsIdx(function (tIdx) {
        if (!tIdx.length || document.querySelector('[data-oc-rel-terms]')) return;
        var cur = null;
        for (var i = 0; i < tIdx.length; i++) { if (tIdx[i].s === tsl) { cur = tIdx[i]; break; } }
        var curCat = cur ? cur.c : 'General';
        var kws = slugKeywords(tsl);
        var seen = {}; seen[tsl] = 1; // exclude current term
        function dedup(arr) {
          return arr.filter(function (t) { if (seen[t.s]) return false; seen[t.s] = 1; return true; });
        }
        var byKw = kws.length ? tIdx.filter(function (t) {
          var nl = t.n.toLowerCase();
          return kws.some(function (k) { return nl.indexOf(k) !== -1; });
        }) : [];
        var result = dedup(byKw);
        if (result.length < 5) {
          dedup(tIdx.filter(function (t) { return t.c === curCat; })).forEach(function (t) { result.push(t); });
        }
        if (result.length < 3) {
          dedup(tIdx.filter(function (t) { return t.c === 'General'; })).forEach(function (t) { result.push(t); });
        }
        buildAndInsertTerms(result.slice(0, 5), false);
      });
    }
  }

  // ====================================================================
  // 11. Marketing consent fields
  //     /contact + /quote-request: visible checkbox above submit button
  //     /coverage-review: implicit consent hidden input
  // ====================================================================

  function injectMarketingConsentFields() {
    // /coverage-review: hidden implicit consent field
    if (/^\/coverage-review(\/|$)/.test(location.pathname)) {
      var crvForm = document.querySelector('#oc-crv-wrap');
      if (crvForm && !crvForm.querySelector('input[name="marketing_consent_implicit"]')) {
        var imp = document.createElement('input');
        imp.type = 'hidden';
        imp.name = 'marketing_consent_implicit';
        imp.value = 'true';
        imp.setAttribute('data-oc-mktg', '1');
        crvForm.appendChild(imp);
      }
      return;
    }
    // /contact + /quote-request: visible opt-in checkbox above submit
    var isContact = /^\/contact(\/|$)/.test(location.pathname);
    var isQuote = /^\/quote-request(\/|$)/.test(location.pathname);
    if (!isContact && !isQuote) return;
    var form = document.querySelector(isContact ? '#oc-contact-form-el' : 'form');
    if (!form) form = document.querySelector('form');
    if (!form || form.querySelector('[data-oc-mktg-consent]')) return;
    var submit = form.querySelector('input[type="submit"], button[type="submit"]');
    if (!submit) return;
    var wrap = document.createElement('div');
    wrap.setAttribute('data-oc-mktg-consent', '1');
    wrap.style.cssText = 'display:flex;align-items:flex-start;gap:10px;margin:0 0 16px;font-family:Inter,system-ui,sans-serif;';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'marketing_consent_checkbox';
    cb.value = 'true';
    cb.id = 'oc-mktg-consent';
    cb.style.cssText = 'margin-top:3px;flex-shrink:0;accent-color:#B8934A;width:16px;height:16px;cursor:pointer;';
    var lbl = document.createElement('label');
    lbl.setAttribute('for', 'oc-mktg-consent');
    lbl.textContent = 'Yes, send me practical Georgia insurance tips by email (one a week, unsubscribe anytime).';
    lbl.style.cssText = 'font-size:0.875rem;color:#1B3A5C;line-height:1.5;cursor:pointer;';
    wrap.appendChild(cb);
    wrap.appendChild(lbl);
    var submitParent = submit.parentElement;
    if (submitParent) submitParent.insertBefore(wrap, submit);
  }

  // ====================================================================
  // 12. Boot -- one shared, debounced observer drives all idempotent tasks
  // ====================================================================

  function runOnce() {
    try { patchText(); } catch (e) {}
    try { patchJSONLD(); } catch (e) {}
    try { injectFooter(); } catch (e) {}
    try { injectNav(); } catch (e) {}
    try { injectChips(); } catch (e) {}
    try { injectSchema(); } catch (e) {}
    try { fixCTAColor(); } catch (e) {}
    try { fixHomeButton(); } catch (e) {}
    try { fixContactSelect(); } catch (e) {}
    try { fixFeedbackState(); } catch (e) {}
    try { fixBookPage(); } catch (e) {}
    try { injectCarrierHub(); } catch (e) {}
    try { fixCarrierClaimsPhone(); } catch (e) {}
    try { fixCarrierTableNA(); } catch (e) {}
    try { injectNewsNav(); } catch (e) {}
    try { injectNewsSchema(); } catch (e) {}
    try { injectDefinedTermSchema(); } catch (e) {}
    try { augmentQAPageSchema(); } catch (e) {}
    try { augmentInsightsSchema(); } catch (e) {}
    try { augmentDefinedTermSchema(); } catch (e) {}
    try { injectJurisdictionNotice(); } catch (e) {}
    try { wireAboutDropdown(); } catch (e) {}
    try { fixNewsCardLinks(); } catch (e) {}
    try { eagerCardImages(); } catch (e) {}
    try { insightsFeatured(); } catch (e) {}
    try { insightsLoadAll(); } catch (e) {}
    try { insightsFilter(); } catch (e) {}
    try { revealPageFaqs(); } catch (e) {}
    try { injectRelatedFaqs(); } catch (e) {}
    try { injectRelatedTerms(); } catch (e) {}
    try { hideDetailedRelTerms(); } catch (e) {}
    try { injectMarketingConsentFields(); } catch (e) {}
    try { augmentCarrierReviewRating(); } catch (e) {}
    try { restrictCoverageReviewDropdown(); } catch (e) {}
    // try { injectInsightsInlineCTA(); } catch (e) {}   // disabled: PDF + CLIP not ready
    // try { injectInsightsStickyBar(); } catch (e) {}   // disabled: PDF + CLIP not ready
    // try { injectExitIntentModal(); } catch (e) {}     // disabled: PDF + CLIP not ready
    try { injectFooterCTA(); } catch (e) {}
  }

  // Injects a one-line notice after the H1 on Georgia-specific FAQ and Insights
  // detail pages. Reads from OC_FAQ_GA_SLUGS and OC_INSIGHTS_SCOPE.
  // Insurance Terms: skipped (all items have null jurisdiction as of 2026-06-05).
  function injectJurisdictionNotice() {
    if (document.querySelector('[data-oc-juris-notice]')) return;
    var p = location.pathname.replace(/\/$/, '');
    var msg = null;
    var m;
    m = p.match(/^\/faq\/(.+)$/);
    if (m && OC_FAQ_GA_SLUGS[m[1]]) {
      msg = 'Georgia-specific. Rules and requirements described here apply to Georgia residents. Details may differ in other states.';
    }
    if (!msg) {
      m = p.match(/^\/insights\/(.+)$/);
      if (m && OC_INSIGHTS_SCOPE[m[1]] === 'g') {
        msg = 'Georgia-specific. Coverage rules described in this article apply to Georgia. Requirements may differ in other states.';
      }
    }
    if (!msg) {
      m = p.match(/^\/insurance-terms\/(.+)$/);
      if (m) {
        if (OC_TERMS_GEO[m[1]]) {
          msg = 'Georgia-specific. Rules and requirements described here apply specifically to Georgia. Details may differ in other states.';
        } else if (OC_TERMS_FED[m[1]]) {
          msg = 'Federal program. This term is defined under federal law and applies across all states.';
        }
      }
    }
    if (!msg) return;
    var h1 = document.querySelector('h1');
    if (!h1) return;
    var div = document.createElement('div');
    div.setAttribute('data-oc-juris-notice', '1');
    div.style.cssText = 'display:block;background:#F5EDD8;border-left:3px solid #B8934A;padding:7px 12px;margin:10px 0 18px;font-size:13px;color:#1B3A5C;line-height:1.5;border-radius:0 3px 3px 0;font-family:Inter,sans-serif;font-weight:400;';
    div.textContent = msg;
    h1.parentNode.insertBefore(div, h1.nextSibling);
  }

  // Augments the CMS-rendered QAPage JSON-LD on Georgia FAQ detail pages with
  // spatialCoverage. Modifies in-place to keep exactly one QAPage schema.
  function augmentQAPageSchema() {
    var m = location.pathname.replace(/\/$/, '').match(/^\/faq\/(.+)$/);
    if (!m || !OC_FAQ_GA_SLUGS[m[1]]) return;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].hasAttribute('data-oc-schema-aug')) continue;
      try {
        var obj = JSON.parse(scripts[i].textContent);
        if (obj['@type'] === 'QAPage') {
          obj.spatialCoverage = {'@type': 'State', 'name': 'Georgia, United States'};
          var srcEl = document.querySelector('[data-oc-faq-sources]');
          if (srcEl) {
            var citeLinks = srcEl.querySelectorAll('a[href]');
            if (citeLinks.length) obj.citation = Array.prototype.map.call(citeLinks, function(a){return a.href;});
          }
          scripts[i].textContent = JSON.stringify(obj);
          scripts[i].setAttribute('data-oc-schema-aug', '1');
          return;
        }
      } catch (e) {}
    }
  }

  // Augments the CMS-rendered Article JSON-LD on Georgia-scope Insights pages
  // with spatialCoverage. Modifies in-place to keep exactly one Article schema.
  function augmentInsightsSchema() {
    var m = location.pathname.replace(/\/$/, '').match(/^\/insights\/(.+)$/);
    if (!m || OC_INSIGHTS_SCOPE[m[1]] !== 'g') return;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].hasAttribute('data-oc-schema-aug')) continue;
      try {
        var obj = JSON.parse(scripts[i].textContent);
        if (obj['@type'] === 'Article') {
          obj.spatialCoverage = {'@type': 'State', 'name': 'Georgia, United States'};
          var srcEl = document.querySelector('[data-oc-insights-sources]');
          if (srcEl) {
            var citeLinks = srcEl.querySelectorAll('a[href]');
            if (citeLinks.length) obj.citation = Array.prototype.map.call(citeLinks, function(a){return a.href;});
          }
          scripts[i].textContent = JSON.stringify(obj);
          scripts[i].setAttribute('data-oc-schema-aug', '1');
          return;
        }
      } catch (e) {}
    }
  }

  // Augments the CMS-rendered DefinedTerm JSON-LD on Insurance Terms pages with
  // spatialCoverage and citation. Modifies in-place (injectDefinedTermSchema early-
  // returns when CMS already has one, so this separate augmenter handles it).
  function augmentDefinedTermSchema() {
    var m = location.pathname.replace(/\/$/, '').match(/^\/insurance-terms\/(.+)$/);
    if (!m) return;
    var slug = m[1];
    if (!OC_TERMS_GEO[slug] && !OC_TERMS_FED[slug] && !OC_TERMS_CITE[slug]) return;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].hasAttribute('data-oc-schema-aug')) continue;
      try {
        var obj = JSON.parse(scripts[i].textContent);
        if (obj['@type'] === 'DefinedTerm') {
          if (OC_TERMS_GEO[slug]) obj.spatialCoverage = {'@type': 'State', 'name': 'Georgia, United States'};
          if (OC_TERMS_CITE[slug]) obj.citation = OC_TERMS_CITE[slug];
          scripts[i].textContent = JSON.stringify(obj);
          scripts[i].setAttribute('data-oc-schema-aug', '1');
          return;
        }
      } catch (e) {}
    }
  }

  // Hides the CMS-bound detailed related-terms section on /insurance-terms/{slug}
  // pages since the injected pill section replaces it.
  function hideDetailedRelTerms() {
    if (/^\/insurance-terms\/[^/]+/.test(location.pathname)) {
      ['.oc-term-related-section'].forEach(function (sel) {
        var sec = document.querySelector(sel);
        if (sec && sec.style.display !== 'none') sec.style.display = 'none';
      });
    }
    if (/^\/faq\/[^/]+/.test(location.pathname)) {
      var faqItem = document.querySelector('#faq-item');
      if (faqItem) {
        var wrapper = faqItem.firstElementChild;
        if (wrapper) {
          var last = wrapper.lastElementChild;
          if (last && last.textContent.indexOf('Have a question') !== -1 && last.style.display !== 'none') {
            last.style.display = 'none';
          }
        }
      }
    }
  }

  // Injects a "Free Coverage Review" CTA strip just above the footer on all
  // pages except the coverage-review and contact forms themselves.
  function injectFooterCTA() {
    if (document.querySelector('[data-oc-footer-cta]')) return;
    var pg = location.pathname.replace(/\/$/, '');
    if (/^\/(coverage-review|contact|book|carriers|insurance(-terms)?|insights)(\/|$)/.test(pg) || pg === '') return;
    var sec = document.createElement('section');
    sec.setAttribute('data-oc-footer-cta', '1');
    sec.style.cssText = 'background:#F5EDD8;padding:48px 24px;text-align:center;';
    var inner = document.createElement('div');
    inner.style.cssText = 'max-width:600px;margin:0 auto;';
    var h = document.createElement('p');
    h.textContent = 'Not sure what coverage you need?';
    h.style.cssText = 'font-family:Playfair Display,serif;font-size:1.5rem;font-weight:700;color:#1B3A5C;margin:0 0 10px;';
    var sub = document.createElement('p');
    sub.textContent = 'A free coverage review takes under 10 minutes. No obligation.';
    sub.style.cssText = 'font-family:Inter,system-ui,sans-serif;font-size:0.9375rem;color:#1B3A5C;opacity:0.75;margin:0 0 22px;';
    var btn = document.createElement('a');
    btn.href = '/coverage-review';
    btn.textContent = 'Free Coverage Review';
    btn.style.cssText = 'display:inline-block;padding:0 28px;background:#B8934A;font-family:Inter,system-ui,sans-serif;font-size:0.9375rem;font-weight:600;text-decoration:none;border-radius:4px;height:44px;line-height:44px;';
    // Use a scoped <style> rule rather than inline setProperty -- ocshim's global
    // link-color fixer runs after us and overwrites inline color even with !important.
    if (!document.querySelector('#oc-footer-cta-style')) {
      var st = document.createElement('style');
      st.id = 'oc-footer-cta-style';
      st.textContent = '[data-oc-footer-cta] a{color:#fff!important}[data-oc-footer-cta] a:hover{background:#C7A24B!important;color:#fff!important}';
      document.head.appendChild(st);
    }
    btn.addEventListener('mouseover', function () { btn.style.background = '#C7A24B'; });
    btn.addEventListener('mouseout', function () { btn.style.background = '#B8934A'; });
    inner.appendChild(h);
    inner.appendChild(sub);
    inner.appendChild(btn);
    sec.appendChild(inner);
    insertBeforeFooter(sec);
  }

  // ====================================================================
  // 13. Carrier Review schema augmentation (absorbed from ocstagingfixesv12)
  //     Adds reviewRating {5/5} to any Review JSON-LD on /carriers/* that
  //     lacks it. Guard: only runs when the field is absent.
  // ====================================================================

  function augmentCarrierReviewRating() {
    if (!/^\/carriers\/[^/]+/.test(location.pathname)) return;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s) {
      try {
        var o = JSON.parse(s.textContent);
        var arr = o['@graph'] || [o];
        var changed = false;
        arr.forEach(function(it) {
          if (it && it['@type'] === 'Review' && !it.reviewRating) {
            it.reviewRating = {'@type': 'Rating', 'ratingValue': '5', 'bestRating': '5', 'worstRating': '1'};
            changed = true;
          }
        });
        if (changed) s.textContent = JSON.stringify(o);
      } catch(e) {}
    });
  }

  // Restricts both state <select> elements on /coverage-review to Georgia only.
  // Removes all options except the placeholder and Georgia. Idempotent.
  function restrictCoverageReviewDropdown() {
    if (location.pathname !== '/coverage-review') return;
    if (document.querySelector('[data-oc-dd-restricted]')) return;
    var restricted = 0;
    document.querySelectorAll('select').forEach(function(sel) {
      Array.from(sel.options).forEach(function(opt) {
        var v = (opt.value || '').toLowerCase();
        var x = (opt.text || '').toLowerCase();
        if (v && v !== 'ga' && v !== 'georgia' && x.indexOf('georgia') < 0 && x.indexOf('select') < 0) {
          opt.remove();
        }
      });
      sel.setAttribute('data-oc-dd-restricted', '1');
      restricted++;
    });
  }

  // ====================================================================
  // 14. Insights email capture
  //     Component 1: inline article CTA (mid-scroll card)
  //     Component 2: sticky bottom bar (mobile-primary, dismissable)
  //     Component 3: exit-intent modal (desktop only, routes to Ask Olive)
  //     Email submissions POST to OliveCRM via CLIP forms endpoint.
  //     Mailchimp audience tagging is a follow-up task (needs account setup).
  // ====================================================================

  var OC_EC_ENDPOINT = 'https://forms-3q26d3khpa-ue.a.run.app/forms/email-capture';
  var OC_EC_AUTH = 'fLnkE70cjSKztJ2VGnThheVSFwuW16WepOCxcSrDeHY=';

  var OC_MAGNETS = {
    '/insights/georgia-flood-insurance-nfip-vs-private': {
      id: 'flood-decision-guide',
      headline: 'Get the GA Flood Zone Decision Guide',
      desc: 'NFIP vs private flood, waiting periods, and zone classifications explained in plain English. One page.'
    },
    '/insights/georgia-homeowners-insurance-common-gaps': {
      id: 'coverage-gaps-checklist',
      headline: 'Get the Coverage Gaps Checklist',
      desc: 'The 7 coverage gaps most Georgia homeowners miss, with plain-language explanations of each.'
    },
    '/insights/personal-umbrella-insurance-georgia': {
      id: 'umbrella-calculator',
      headline: 'Try the Umbrella Coverage Calculator',
      desc: 'Enter your assets and exposure -- get a suggested umbrella limit in under 2 minutes.'
    }
  };

  var OC_MAGNET_DEFAULT = {
    id: 'coverage-gaps-checklist',
    headline: 'Get the Coverage Gaps Checklist',
    desc: 'A free plain-English guide to the 7 coverage gaps most Georgia homeowners miss.'
  };

  function ocGetMagnet() {
    return OC_MAGNETS[location.pathname.replace(/\/$/, '')] || OC_MAGNET_DEFAULT;
  }

  function ocPushCapture(name, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
  }

  function ocSubmitCapture(email, magnetId, placement, onSuccess, onError) {
    var payload = {
      form_type: 'email-capture',
      submission_id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)),
      page_url: location.href,
      submitted_at: new Date().toISOString(),
      fields: {
        email: email,
        lead_magnet_id: magnetId,
        placement: placement,
        source: 'insights',
        page_path: location.pathname,
        state: (function () { try { return (localStorage.getItem('oc_state') || '').toUpperCase(); } catch (e) { return ''; } })()
      }
    };
    fetch(OC_EC_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', 'X-Forms-Auth': OC_EC_AUTH },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      ocPushCapture('email_capture_submitted', { placement: placement, magnet: magnetId, page_path: location.pathname });
      onSuccess();
    }).catch(function () { onError(); });
  }

  function ocMakeEmailInput(idAttr, placeholder) {
    var inp = document.createElement('input');
    inp.type = 'email';
    inp.id = idAttr;
    inp.name = 'email';
    inp.placeholder = placeholder || 'Your email address';
    inp.required = true;
    inp.autocomplete = 'email';
    return inp;
  }

  // Component 1: inline card inserted after the 2nd H2 in /insights/* articles
  function injectInsightsInlineCTA() {
    if (!/^\/insights\/[^/]+/.test(location.pathname)) return;
    if (document.querySelector('[data-oc-email-capture="inline"]')) return;
    var h2s = Array.from(document.querySelectorAll('h2'));
    var anchor = h2s[1] || h2s[0];
    if (!anchor) return;
    var magnet = ocGetMagnet();

    var wrap = document.createElement('div');
    wrap.setAttribute('data-oc-email-capture', 'inline');
    wrap.setAttribute('data-magnet', magnet.id);
    wrap.style.cssText = 'background:#F5EDD8;border:1px solid #B8934A;border-radius:8px;padding:24px;margin:32px 0;font-family:Inter,system-ui,sans-serif;';

    var hEl = document.createElement('p');
    hEl.textContent = magnet.headline;
    hEl.style.cssText = 'font-family:Playfair Display,serif;font-size:1.125rem;font-weight:700;color:#1B3A5C;margin:0 0 8px;';

    var dEl = document.createElement('p');
    dEl.textContent = magnet.desc;
    dEl.style.cssText = 'font-size:0.875rem;color:#1B3A5C;opacity:0.75;margin:0 0 16px;line-height:1.5;';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';

    var inp = ocMakeEmailInput('oc-ec-inline-email', 'Your email');
    inp.style.cssText = 'flex:1 1 180px;padding:0 12px;height:40px;border:1px solid #B8934A;border-radius:4px;font-size:0.875rem;font-family:Inter,system-ui,sans-serif;background:#fff;color:#1B3A5C;min-width:0;';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Get the PDF';
    btn.style.cssText = 'padding:0 20px;height:40px;background:#B8934A;color:#fff;border:none;border-radius:4px;font-size:0.875rem;font-weight:600;font-family:Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0;';

    var msgEl = document.createElement('p');
    msgEl.style.cssText = 'font-size:0.8125rem;color:#1B3A5C;margin:8px 0 0;display:none;';

    var fine = document.createElement('p');
    fine.textContent = 'One email. No spam. Unsubscribe anytime.';
    fine.style.cssText = 'font-size:0.75rem;color:#1B3A5C;opacity:0.55;margin:8px 0 0;';

    btn.addEventListener('click', function () {
      var em = inp.value.trim();
      if (!em || em.indexOf('@') < 0) { msgEl.textContent = 'Please enter a valid email address.'; msgEl.style.display = 'block'; return; }
      btn.textContent = 'Sending...'; btn.disabled = true; msgEl.style.display = 'none';
      ocSubmitCapture(em, magnet.id, 'inline',
        function () { btn.textContent = 'Sent!'; msgEl.textContent = 'Got it! We\'ll send your checklist shortly.'; msgEl.style.display = 'block'; },
        function () { btn.textContent = 'Get the PDF'; btn.disabled = false; msgEl.textContent = 'Something went wrong. Please try again.'; msgEl.style.display = 'block'; }
      );
    });

    row.appendChild(inp); row.appendChild(btn);
    wrap.appendChild(hEl); wrap.appendChild(dEl); wrap.appendChild(row);
    wrap.appendChild(msgEl); wrap.appendChild(fine);
    anchor.parentNode.insertBefore(wrap, anchor.nextSibling);

    if (window.IntersectionObserver) {
      var seen = false;
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !seen) {
          seen = true;
          ocPushCapture('email_capture_displayed', { placement: 'inline', magnet: magnet.id, page_path: location.pathname });
        }
      }).observe(wrap);
    }
  }

  // Component 2: sticky bottom bar, /insights/* only, dismissable
  function injectInsightsStickyBar() {
    if (!/^\/insights\/[^/]+/.test(location.pathname)) return;
    if (document.querySelector('[data-oc-email-bar]')) return;
    try { if (sessionStorage.getItem('oc_bar_dismissed')) return; } catch (e) {}

    var bar = document.createElement('div');
    bar.setAttribute('data-oc-email-bar', '1');
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;background:#1B3A5C;padding:12px 16px;display:none;align-items:center;gap:10px;flex-wrap:wrap;font-family:Inter,system-ui,sans-serif;box-shadow:0 -2px 8px rgba(0,0,0,0.15);';

    var lbl = document.createElement('span');
    lbl.textContent = 'Want a free Georgia insurance tip every week?';
    lbl.style.cssText = 'color:#F5EDD8;font-size:0.875rem;flex:1 1 180px;';

    var inp = ocMakeEmailInput('oc-ec-bar-email', 'Your email');
    inp.style.cssText = 'width:200px;max-width:100%;padding:0 10px;height:36px;border:1px solid #B8934A;border-radius:4px;font-size:0.875rem;background:#fff;color:#1B3A5C;';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Subscribe';
    btn.style.cssText = 'padding:0 16px;height:36px;background:#B8934A;color:#fff;border:none;border-radius:4px;font-size:0.875rem;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.textContent = 'x';
    closeBtn.style.cssText = 'background:none;border:none;color:#F5EDD8;opacity:0.6;font-size:1.25rem;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;';

    closeBtn.addEventListener('click', function () {
      bar.style.display = 'none';
      try { sessionStorage.setItem('oc_bar_dismissed', '1'); } catch (e) {}
      ocPushCapture('email_capture_dismissed', { placement: 'sticky_bar', page_path: location.pathname });
    });

    btn.addEventListener('click', function () {
      var em = inp.value.trim();
      if (!em || em.indexOf('@') < 0) { inp.style.borderColor = '#c00'; return; }
      inp.style.borderColor = '#B8934A';
      btn.textContent = 'Sending...'; btn.disabled = true;
      var magnet = ocGetMagnet();
      ocSubmitCapture(em, magnet.id, 'sticky_bar',
        function () { btn.textContent = 'Subscribed!'; inp.style.display = 'none'; },
        function () { btn.textContent = 'Subscribe'; btn.disabled = false; }
      );
    });

    bar.appendChild(lbl); bar.appendChild(inp); bar.appendChild(btn); bar.appendChild(closeBtn);
    document.body.appendChild(bar);

    function showBar() {
      if (bar.style.display === 'flex') return;
      bar.style.display = 'flex';
      ocPushCapture('email_capture_displayed', { placement: 'sticky_bar', page_path: location.pathname });
    }

    var scrollFired = false;
    window.addEventListener('scroll', function () {
      if (scrollFired) return;
      var pct = (window.scrollY + window.innerHeight) / Math.max(document.body.scrollHeight, 1);
      if (pct >= 0.5) { scrollFired = true; showBar(); }
    }, { passive: true });

    setTimeout(showBar, 30000);
  }

  // Component 3: exit-intent modal (desktop only), routes to Ask Olive chat
  function injectExitIntentModal() {
    if (!/^\/insights\/[^/]+/.test(location.pathname)) return;
    if (window.innerWidth < 768) return;
    if (document.querySelector('[data-oc-exit-modal]')) return;
    try { if (sessionStorage.getItem('oc_exit_shown')) return; } catch (e) {}

    var overlay = document.createElement('div');
    overlay.setAttribute('data-oc-exit-modal', '1');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.45);display:none;align-items:center;justify-content:center;';

    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:8px;padding:32px 28px;max-width:380px;width:90%;text-align:center;font-family:Inter,system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.2);';

    var h = document.createElement('p');
    h.textContent = 'Hold on -- got a question?';
    h.style.cssText = 'font-family:Playfair Display,serif;font-size:1.25rem;font-weight:700;color:#1B3A5C;margin:0 0 10px;';

    var sub = document.createElement('p');
    sub.textContent = 'Ask Olive for an instant plain-English answer about your coverage.';
    sub.style.cssText = 'font-size:0.9375rem;color:#1B3A5C;opacity:0.75;line-height:1.5;margin:0 0 24px;';

    var chatBtn = document.createElement('a');
    chatBtn.href = '#';
    chatBtn.textContent = 'Open Ask Olive';
    chatBtn.style.cssText = 'display:block;padding:0 28px;height:44px;line-height:44px;background:#B8934A;color:#fff;text-decoration:none;border-radius:4px;font-size:0.9375rem;font-weight:600;margin-bottom:12px;';
    chatBtn.addEventListener('click', function (e) {
      e.preventDefault();
      overlay.style.display = 'none';
      var fab = document.querySelector('summary.oc-widget-toggle, .oc-widget-toggle, #oc-widget-fab, #oc-wgt-fab, .oc-widget-fab, [data-oc-widget-toggle]');
      if (fab) fab.click();
      ocPushCapture('email_capture_dismissed', { placement: 'exit_modal', action: 'open_chat', page_path: location.pathname });
    });

    var noBtn = document.createElement('button');
    noBtn.type = 'button';
    noBtn.textContent = 'No thanks';
    noBtn.style.cssText = 'display:block;width:100%;background:none;border:none;color:#1B3A5C;opacity:0.5;font-size:0.875rem;cursor:pointer;padding:4px 0;font-family:Inter,system-ui,sans-serif;';
    noBtn.addEventListener('click', function () {
      overlay.style.display = 'none';
      ocPushCapture('email_capture_dismissed', { placement: 'exit_modal', action: 'declined', page_path: location.pathname });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        ocPushCapture('email_capture_dismissed', { placement: 'exit_modal', action: 'backdrop', page_path: location.pathname });
      }
    });

    box.appendChild(h); box.appendChild(sub); box.appendChild(chatBtn); box.appendChild(noBtn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Scoped white-text rule so ocshim's global gold link color doesn't bleed in
    if (!document.querySelector('#oc-exit-modal-style')) {
      var st = document.createElement('style');
      st.id = 'oc-exit-modal-style';
      st.textContent = '[data-oc-exit-modal] a{color:#fff!important}[data-oc-exit-modal] a:hover{background:#C7A24B!important;color:#fff!important}';
      document.head.appendChild(st);
    }

    function showModal() {
      overlay.style.display = 'flex';
      try { sessionStorage.setItem('oc_exit_shown', '1'); } catch (e) {}
      ocPushCapture('email_capture_displayed', { placement: 'exit_modal', page_path: location.pathname });
      document.removeEventListener('mouseleave', onMouseLeave);
    }

    function onMouseLeave(e) {
      if (e.clientY <= 10) showModal();
    }

    document.addEventListener('mouseleave', onMouseLeave);
  }

  // ====================================================================
  // 15. Form attribution -- GCLID + UTM capture (absorbed from ocattribution.js)
  //     Persists first-touch data to sessionStorage; populates hidden inputs
  //     on all forms site-wide. MutationObserver covers dynamic forms (CRV
  //     multi-step, widget capture form).
  // ====================================================================

  var OC_ATTR_KEY = 'oc_attr';
  var OC_ATTR_PARAMS = ['gclid','gbraid','wbraid','fbclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  var OC_ATTR_FIELDS = OC_ATTR_PARAMS.concat(['referrer','landing_page','attribution_capture_ts']);

  function ocAttrReadUrl() {
    var search = new URLSearchParams(location.search);
    var out = {};
    OC_ATTR_PARAMS.forEach(function(k){ var v=search.get(k); if(v) out[k]=v.substring(0,500); });
    return out;
  }

  function ocAttrReadGclCookie() {
    var m = document.cookie.match(/_gcl_aw=([^;]+)/);
    if (!m) return null;
    var parts = decodeURIComponent(m[1]).split('.');
    return parts.length >= 3 ? parts.slice(2).join('.') : null;
  }

  function ocAttrGet() {
    try {
      var stored = sessionStorage.getItem(OC_ATTR_KEY);
      if (stored) { var p = JSON.parse(stored); if (p && p.attribution_capture_ts) return p; }
    } catch(e) {}
    var fresh = ocAttrReadUrl();
    if (!fresh.gclid) { var cg = ocAttrReadGclCookie(); if (cg) fresh.gclid = cg; }
    fresh.referrer = (document.referrer || '').substring(0, 500);
    fresh.landing_page = (location.origin + location.pathname).substring(0, 500);
    fresh.attribution_capture_ts = new Date().toISOString();
    try { sessionStorage.setItem(OC_ATTR_KEY, JSON.stringify(fresh)); } catch(e) {}
    return fresh;
  }

  function ocAttrPopulateForms(attr) {
    document.querySelectorAll('form').forEach(function(form) {
      OC_ATTR_FIELDS.forEach(function(name) {
        var inp = form.querySelector('input[name="' + name + '"]');
        if (!inp) {
          inp = document.createElement('input');
          inp.type = 'hidden'; inp.name = name;
          inp.setAttribute('data-oc-attr', '1');
          form.appendChild(inp);
        }
        if (attr[name]) inp.value = attr[name];
      });
    });
  }

  function initAttribution() {
    var attr = ocAttrGet();
    ocAttrPopulateForms(attr);
    var obs = new MutationObserver(function(){ ocAttrPopulateForms(attr); });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(function(){ try { obs.disconnect(); } catch(e){} }, 60000);
  }

  var debounceTimer = null;
  function scheduleRun() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(function () { debounceTimer = null; runOnce(); }, 200);
  }

  function boot() {
    try { initAttribution(); } catch (e) {}
    try { wrapFeedbackFetch(); } catch (e) {}
    try { setupBooking(); } catch (e) {}
    runOnce();
    // Shared observer: catches late-mounted CMS content, widget mount, and
    // widget re-renders (which wipe chips). Debounced to avoid thrashing.
    var obs = new MutationObserver(function () { scheduleRun(); });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    // Stop the broad observer after 60s; by then the page is settled. Chips
    // get their own thread-scoped observer in bindHideOnSubmit for the rest
    // of the session.
    setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 60000);
    // Defensive late passes for slow CMS pages.
    setTimeout(runOnce, 1500);
    setTimeout(runOnce, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
