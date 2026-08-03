// Koçer Tur — küçük ve bağımlılıksız arayüz betiği.
(function () {
  "use strict";

  var dugme = document.querySelector(".menu-dugme");
  var menu = document.getElementById("ana-menu");
  if (!dugme || !menu) return;

  function kapat() {
    dugme.setAttribute("aria-expanded", "false");
    menu.setAttribute("data-acik", "false");
    document.body.style.removeProperty("overflow");
  }

  function ac() {
    dugme.setAttribute("aria-expanded", "true");
    menu.setAttribute("data-acik", "true");
    document.body.style.overflow = "hidden";
  }

  dugme.addEventListener("click", function () {
    var acikMi = dugme.getAttribute("aria-expanded") === "true";
    acikMi ? kapat() : ac();
  });

  // Menüden bir bağlantıya tıklanınca kapansın
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) kapat();
  });

  // Esc ile kapansın
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") kapat();
  });

  // Masaüstüne geçilince menü durumu sıfırlansın
  var mq = window.matchMedia("(min-width: 900px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
    function (e) {
      if (e.matches) kapat();
    }
  );
})();
