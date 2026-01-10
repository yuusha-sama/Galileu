// site/js/main.js
(function () {
  function el(sel) {
    return document.querySelector(sel);
  }

  function setVisible(selector, show) {
    const node = el(selector);
    if (!node) return;
    node.style.display = show ? "" : "none";
  }

  function setText(selector, text) {
    const node = el(selector);
    if (!node) return;
    node.textContent = text;
  }

  function bindClick(selector, fn) {
    const node = el(selector);
    if (!node) return;
    node.addEventListener("click", fn);
  }

  async function bootNavbar() {
    const me = await window.Auth.me();

    // IDs recomendados no HTML:
    // #btn-login-nav (botão laranja)
    // #hamburger (botão menu)
    // #menu-user (dropdown do usuário)
    // #menu-user-name (nome do usuário)
    // #btn-logout (sair)

    if (me && me.authenticated) {
      setVisible("#btn-login-nav", false);
      setVisible("#hamburger", true);
      setVisible("#menu-user", false);
      setText("#menu-user-name", me.name || me.email || "Conta");

      bindClick("#hamburger", () => {
        const m = el("#menu-user");
        if (!m) return;
        const open = m.getAttribute("data-open") === "1";
        m.setAttribute("data-open", open ? "0" : "1");
        m.style.display = open ? "none" : "block";
      });

      bindClick("#btn-logout", async (ev) => {
        ev.preventDefault();
        try {
          await window.Auth.logout();
        } catch (_) {}
        window.location.href = "/index.html";
      });
    } else {
      setVisible("#btn-login-nav", true);
      setVisible("#hamburger", false);
      setVisible("#menu-user", false);
    }
  }

  document.addEventListener("DOMContentLoaded", bootNavbar);
})();
