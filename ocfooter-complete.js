/* ocfooter-complete.js v1.0.0
 * Olive Cover — Footer only.
 * Scope: responsive CSS for #oc-footer-grid and footer bar.
 * Nothing else.
 */
(function(){
  if(document.getElementById('ocfooter-css')) return;
  var s = document.createElement('style');
  s.id = 'ocfooter-css';
  s.textContent = [
    '@media(max-width:900px){',
      '#oc-footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important;}',
    '}',
    '@media(max-width:600px){',
      '#oc-footer-grid{grid-template-columns:1fr!important;gap:24px!important;}',
      '#oc-footer-bar{flex-direction:column!important;gap:16px!important;',
        'padding:20px!important;text-align:center!important;}',
      '#oc-footer-links{flex-direction:row!important;flex-wrap:wrap!important;',
        'justify-content:center!important;gap:12px!important;}',
    '}'
  ].join('');
  document.head.appendChild(s);
})();
