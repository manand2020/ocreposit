/* ocnav-complete.js v3.0.0
 * Olive Cover — Full nav per spec v2.
 * Desktop: Logo | Search | Coverage | Carriers | Learn | About | State Switcher | Free Coverage Review
 * Mobile: Full-screen overlay from right, accordion structure, search first, state switcher last
 */
(function () {
  'use strict';
  if (window._ocNavComplete) return;
  window._ocNavComplete = true;

  var LOGO = 'https://cdn.prod.website-files.com/69e03a098b0bf5d05f9f777b/69e2a6656e5c5ae44d546a9d_olive_logo_white.png';

  /* ============================================================
     STATE MANAGEMENT
  ============================================================ */
  var STATES = [
    { name: 'Georgia',    slug: 'georgia',    flag: '\uD83C\uDDEC\uD83C\uDDE7', active: true },
    { name: 'California', slug: 'california', flag: '\uD83C\uDDE8\uD83C\uDDE6', active: true },
    { name: 'Florida',    slug: 'florida',    flag: '\u2600\uFE0F',              active: false },
    { name: 'Texas',      slug: 'texas',      flag: '\u2B50',                    active: false }
  ];
