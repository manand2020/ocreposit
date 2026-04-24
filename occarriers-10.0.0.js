/* occarriers v10.0.0 — Personal Insurance carrier section renderer + state-aware header text */
(function(){
  function stateFromPage(){
    var path = window.location.pathname;
    if(/california/.test(path)) return 'california';
    return 'georgia';
  }

  function patchHeaders(state){
    var label = state === 'california' ? 'California' : 'Georgia';
    var eyebrow = document.getElementById('ins-carrier-eyebrow');
    var subhdr  = document.getElementById('ins-carrier-subhdr');
    if(eyebrow) eyebrow.textContent = 'Our ' + label + ' Carrier Panel';
    if(subhdr)  subhdr.textContent  =
      'All carriers are A-rated by AM Best and appointed in ' + label +
      '. We compare them and recommend the right fit for your situation.';
  }

  function injectCSS(){
    if(document.getElementById('oc-carriers-css')) return;
    var s = document.createElement('style');
    s.id = 'oc-carriers-css';
    s.textContent = [
      '#ins-carrier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:24px;}',
      '@media(max-width:900px){#ins-carrier-grid{grid-template-columns:1fr 1fr;}}',
      '@media(max-width:600px){#ins-carrier-grid{grid-template-columns:1fr;}}',
      '.oc-carrier-card{background:#fff;border:1px solid #E8EDF2;border-radius:8px;padding:20px 22px;display:flex;flex-direction:column;gap:5px;}',
      '.oc-carrier-lob{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B8934A;}',
      '.oc-carrier-name{font-size:17px;font-weight:700;color:#1B3A5C;font-family:\'Playfair Display\',serif;line-height:1.3;}',
      '.oc-carrier-rating{font-size:12px;color:#64748b;font-weight:500;}',
      '.oc-carrier-notes{font-size:13px;color:#1E293B;line-height:1.55;flex:1;margin-top:4px;}',
      '.oc-carrier-link{font-size:13px;color:#B8934A;font-weight:600;text-decoration:none;margin-top:10px;display:inline-block;}',
      '.oc-carrier-link:hover{text-decoration:underline;}'
    ].join('');
    document.head.appendChild(s);
  }

  function renderCarriers(state){
    var grid = document.getElementById('ins-carrier-grid');
    if(!grid) return;
    var raw = null;
    var hidden = document.getElementById('oc-carriers-data');
    if(hidden) raw = hidden.textContent;
    if(!raw){ var el = document.querySelector('[data-carriers-json]'); if(el) raw = el.getAttribute('data-carriers-json'); }
    if(!raw || raw === 'null' || raw === '[]'){ return; }
    var carriers;
    try { carriers = JSON.parse(raw); } catch(e){ return; }
    if(!carriers || !carriers.length) return;
    var html = '';
    carriers.forEach(function(c){
      var slug   = c.pageSlug  || '';
      var name   = c.name      || '';
      var rating = c.amBest    || '';
      var notes  = c.appetiteNotes || '';
      var lob    = c.lineOfBusiness || '';
      var cleanSlug = slug.replace(/-california$/, '');
      var href = slug ? '/carriers/' + (state === 'california' ? cleanSlug + '-california' : cleanSlug) : '';
      html += '<div class="oc-carrier-card">' +
        (lob   ? '<div class="oc-carrier-lob">'    + lob    + '</div>' : '') +
        (name  ? '<div class="oc-carrier-name">'   + name   + '</div>' : '') +
        (rating? '<div class="oc-carrier-rating">' + rating + '</div>' : '') +
        (notes ? '<div class="oc-carrier-notes">'  + notes  + '</div>' : '') +
        (href  ? '<a href="' + href + '" class="oc-carrier-link">View full review \u2192</a>' : '') +
        '</div>';
    });
    grid.innerHTML = html;
  }

  function run(){
    var state = stateFromPage();
    injectCSS();
    patchHeaders(state);
    renderCarriers(state);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
