// site/js/minha-equipe.page.js
(function () {
  async function protect() {
    const me = await window.Auth.me();
    if (!me || !me.authenticated) {
      window.location.href = "/cadastrar.html";
      return;
    }

    // Se você tiver campos na página pra preencher:
    // Ex: <span id="me-email"></span> etc
    const emailEl = document.getElementById("me-email");
    if (emailEl) emailEl.textContent = me.email || "-";

    const nameEl = document.getElementById("me-name");
    if (nameEl) nameEl.textContent = me.name || "-";
  }

  async function doLogout() {
    try {
      await window.Auth.logout();
    } catch (_) {}
    window.location.href = "/index.html";
  }

  document.addEventListener("DOMContentLoaded", () => {
    protect();

    // botão sair da sua página (coloca id nele)
    document.getElementById("btn-sair")?.addEventListener("click", (e) => {
      e.preventDefault();
      doLogout();
    });
  });
})();
