(function () {
  async function loadMe() {
    if (!window.GalileuAuth) return null;
    try { return await window.GalileuAuth.me(); } catch { return null; }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
  }

  async function init() {
    const me = await loadMe();
    if (!me || me.authenticated !== true) {
      location.href = "/cadastrar.html?next=" + encodeURIComponent("/minha-equipe.html");
      return;
    }

    setText("me-nome", me.name);
    setText("me-email", me.email);
    setText("me-nascimento", me.birth_date);
    setText("me-cpf", me.cpf);
    setText("me-telefone", me.phone);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
