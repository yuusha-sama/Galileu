(function () {
  function qs(sel) { return document.querySelector(sel); }

  async function me() {
    const r = await fetch("/api/auth/me/", { credentials: "include" });
    if (!r.ok) return null;
    return await r.json();
  }

  async function doLogout() {
    // logout no backend (session cookie)
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }).catch(() => {});
    // manda pra tela de login/cadastro
    window.location.href = "/cadastrar.html";
  }

  function setLoggedOutUI() {
    const btnLogin = qs("#btn-login-nav");
    const hamburger = qs("#hamburger-btn");
    const menu = qs("#user-menu");

    if (btnLogin) btnLogin.style.display = "inline-flex";
    if (hamburger) hamburger.style.display = "none";
    if (menu) menu.classList.remove("open");
  }

  function setLoggedInUI(user) {
    const btnLogin = qs("#btn-login-nav");
    const hamburger = qs("#hamburger-btn");
    const menu = qs("#user-menu");

    const nameEl = qs("#user-menu-name");
    const emailEl = qs("#user-menu-email");

    if (btnLogin) btnLogin.style.display = "none";
    if (hamburger) hamburger.style.display = "inline-flex";

    if (nameEl) nameEl.textContent = user.name || "Usuário";
    if (emailEl) emailEl.textContent = user.email || "";
    if (menu) menu.setAttribute("aria-hidden", "false");
  }

  function setupMenuHandlers() {
    const hamburger = qs("#hamburger-btn");
    const menu = qs("#user-menu");
    const logoutBtn = qs("#btn-logout");

    if (hamburger && menu) {
      hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("open");
      });

      document.addEventListener("click", (e) => {
        // fecha ao clicar fora
        if (!menu.contains(e.target) && e.target !== hamburger) {
          menu.classList.remove("open");
        }
      });

      // ESC fecha
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") menu.classList.remove("open");
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", doLogout);
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    setupMenuHandlers();

    const user = await me();
    if (user && user.authenticated) {
      setLoggedInUI(user);
    } else {
      setLoggedOutUI();
    }
  });
})();
