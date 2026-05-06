/* ocjsdelivrloader.js v1.0.0
 * Olive Cover - loads site-wide scripts from jsDelivr
 * Idempotent: skips loading if script tag already exists
 */
(function(){
  var ROOT = "https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/";
  var SCRIPTS = [
    {src: "ocnav-complete.js", v: "4.9.0"},
    {src: "ocfaq-complete.js", v: "2.1.0"}
  ];
  function loadOne(item) {
    var url = ROOT + item.src + "?v=" + item.v;
    if (document.querySelector('script[src^="' + ROOT + item.src + '"]')) return;
    var s = document.createElement("script");
    s.src = url;
    s.defer = true;
    s.setAttribute("data-oc-loader", "jsdelivr");
    document.head.appendChild(s);
  }
  for (var i = 0; i < SCRIPTS.length; i++) loadOne(SCRIPTS[i]);
})();
