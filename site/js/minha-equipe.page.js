(function () {
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  async function loadMe() {
    if (!window.GalileuAuth) throw new Error("GalileuAuth não carregou");

    const me = await window.GalileuAuth.me();
    if (!me || me.authenticated === false) throw new Error("Não autenticado");

    return me;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const me = await loadMe();
      setText("me-email", me.email || "-");
      setText("me-nome", me.name || "-");
      // placeholders (não vieram do backend ainda)
      setText("me-data", "-");
      setText("me-cpf", "-");
    } catch {
      window.location.href = "/cadastrar.html";
      return;
    }

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
      btnSair.addEventListener("click", async (e) => {
        e.preventDefault();
        try { await window.GalileuAuth.logout(); } catch {}
        window.location.href = "/index.html";
      });
    }
  });
})();