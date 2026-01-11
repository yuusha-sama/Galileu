(function () {
  // Não mexe em auth/sessão (pra não “deslogar” ninguém).
  function init() {}
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
