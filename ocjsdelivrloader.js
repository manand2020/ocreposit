/* ocjsdelivrloader.js v1.0.1
 * Olive Cover - loads site-wide scripts from jsDelivr
 * Idempotent: skips loading if any script tag already references the same file path
 */
(function(){
  var ROOT = "https://cdn.jsdelivr.net/gh/manand2020/ocreposit@main/";
  var SCRIPTS = [
    {src: "ocnav-complete.js", v: "4.9.0"},
    {src: "ocfaq-complete.js", v: "2.1.0"}
  ];
  function alreadyLoaded(filename) {
    var tags = document.querySelectorAll('script[src*="' + filename + '"]');
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].getAttribute("data-oc-loader") !== "jsdelivr") return true;
    }
    return false;
  }
  function loadOne(item) {
    if (alreadyLoaded(item.src)) {
      // Mark the existing tag so the loader does not double-load on reruns
      var tags = document.querySelectorAll('script[src*="' + item.src + '"]');
      for (var i = 0; i < tags.length; i++) tags[i].setAttribute("data-oc-loader-skipped", "true");
      return;
    }
    var s = document.createElement("script");
    s.src = ROOT + item.src + "?v=" + item.v;
    s.defer = true;
    s.setAttribute("data-oc-loader", "jsdelivr");
    document.head.appendChild(s);
  }
  for (var i = 0; i < SCRIPTS.length; i++) loadOne(SCRIPTS[i]);
})();
