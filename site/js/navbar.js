(function () {
  const AUTH_BASE = (window.GALILEU_CONFIG && window.GALILEU_CONFIG.AUTH_BASE) || "/api/auth";

  function injectStyleOnce() {
    if (document.getElementById("galileu-auth-navbar-style")) return;
    const style = document.createElement("style");
    style.id = "galileu-auth-navbar-style";
    style.textContent = `
      /* Auth dropdown (scoped) */
      #account-menu { position: relative; display: inline-flex; align-items: center; }
      #account-menu[hidden] { display: none !important; }
      #btn-login-nav[hidden] { display: none !important; }

      /* Reaproveita o mesmo visual do botão .auth-buttons a.btn (CSS existente) */
      #account-toggle.account-btn { width: 250px; justify-content: flex-start; gap: 10px; padding-left: 18px; padding-right: 18px; }
      #account-toggle .label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #account-toggle .caret { opacity: .9; }
      #account-toggle .hamb { font-size: 18px; line-height: 1; }

      #account-dropdown { position: absolute; top: 60px; right: 0; width: 280px; background: #fff; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.20); overflow: hidden; z-index: 9999; }
      #account-dropdown[hidden] { display: none !important; }
      #account-dropdown .account-meta { padding: 14px 16px; border-bottom: 1px solid #eee; }
      #account-dropdown .account-meta-name { font-weight: 700; color: #111; }
      #account-dropdown .account-meta-email { font-size: 12px; color: #666; margin-top: 2px; word-break: break-all; }

      #account-dropdown a.account-item,
      #account-dropdown button.account-item { display: block; width: 100%; text-align: left; background: transparent; border: 0; padding: 12px 16px; font-size: 14px; color: #111; cursor: pointer; }
      #account-dropdown a.account-item:hover,
      #account-dropdown button.account-item:hover { background: #f5f5f5; }
      #account-dropdown button.account-item.logout { color: #c00; }
    `;
    document.head.appendChild(style);
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function ensureAuthElements() {
    const authButtons = qs(".auth-buttons");
    if (!authButtons) return null;

    // Login button
    let loginBtn = document.getElementById("btn-login-nav");
    if (!loginBtn) {
      // tenta achar um botão existente
      loginBtn = authButtons.querySelector('a[href*="cadastrar"], a[href*="login"], a.btn');
      if (loginBtn) loginBtn.id = "btn-login-nav";
    }

    // Account menu
    let accountMenu = document.getElementById("account-menu");
    if (!accountMenu) {
      accountMenu = document.createElement("div");
      accountMenu.id = "account-menu";
      accountMenu.hidden = true;

      const toggle = document.createElement("a");
      toggle.href = "#";
      toggle.id = "account-toggle";
      toggle.className = "btn account-btn";
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = `
        <span class="hamb" aria-hidden="true">☰</span>
        <span class="label" id="account-name">CONTA</span>
        <span class="caret" aria-hidden="true">▾</span>
      `;

      const dropdown = document.createElement("div");
      dropdown.id = "account-dropdown";
      dropdown.hidden = true;
      dropdown.innerHTML = `
        <div class="account-meta">
          <div class="account-meta-name" id="account-meta-name">—</div>
          <div class="account-meta-email" id="account-meta-email">—</div>
        </div>
        <a class="account-item" href="/minha-equipe.html">Minha equipe</a>
        <button class="account-item logout" type="button" data-action="logout">Sair</button>
      `;

      accountMenu.appendChild(toggle);
      accountMenu.appendChild(dropdown);
      authButtons.appendChild(accountMenu);
    }

    const toggle = document.getElementById("account-toggle");
    const dropdown = document.getElementById("account-dropdown");
    const nameInBtn = document.getElementById("account-name");
    const metaName = document.getElementById("account-meta-name");
    const metaEmail = document.getElementById("account-meta-email");

    return { authButtons, loginBtn, accountMenu, toggle, dropdown, nameInBtn, metaName, metaEmail };
  }

  async function fetchMe() {
    const url = AUTH_BASE.replace(/\/$/, "") + "/me/";
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) return null;
    const data = await r.json().catch(() => null);
    if (!data) return null;

    // Normaliza respostas possíveis
    if (data.authenticated === true) {
      return {
        authenticated: true,
        name: data.name || data.first_name || data.username || "",
        email: data.email || "",
      };
    }
    if (data.ok === true && (data.email || data.name)) {
      return {
        authenticated: true,
        name: data.name || "",
        email: data.email || "",
      };
    }
    return null;
  }

  function closeDropdown(ui) {
    if (!ui?.dropdown) return;
    ui.dropdown.hidden = true;
    ui.toggle?.setAttribute("aria-expanded", "false");
  }

  function openDropdown(ui) {
    if (!ui?.dropdown) return;
    ui.dropdown.hidden = false;
    ui.toggle?.setAttribute("aria-expanded", "true");
  }

  function toggleDropdown(ui) {
    if (!ui?.dropdown) return;
    if (ui.dropdown.hidden) openDropdown(ui);
    else closeDropdown(ui);
  }

  async function doLogout(ui) {
    const url = AUTH_BASE.replace(/\/$/, "") + "/logout/";
    try {
      await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } finally {
      // UI -> deslogado
      if (ui?.loginBtn) ui.loginBtn.hidden = false;
      if (ui?.accountMenu) ui.accountMenu.hidden = true;
      closeDropdown(ui);
      // volta pro home
      if (!location.pathname.endsWith("/index.html") && location.pathname !== "/") {
        location.href = "/index.html";
      }
    }
  }

  async function mount() {
    injectStyleOnce();
    const ui = ensureAuthElements();
    if (!ui) return;

    // Toggle abre/fecha
    if (ui.toggle && ui.dropdown) {
      ui.toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown(ui);
      });

      ui.dropdown.addEventListener("click", (e) => {
        // não fechar quando clicar dentro
        e.stopPropagation();
      });

      document.addEventListener("click", () => closeDropdown(ui));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDropdown(ui);
      });
    }

    // Logout (dropdown + botão da página "minha equipe")
    document.addEventListener("click", async (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const isLogout = el.matches('[data-action="logout"], #btn-sair, .btn-sair, .logout');
      if (!isLogout) return;
      e.preventDefault();
      await doLogout(ui);
    });

    // Verifica sessão
    const me = await fetchMe();
    if (me?.authenticated) {
      // Esconde login, mostra conta
      if (ui.loginBtn) ui.loginBtn.hidden = true;
      ui.accountMenu.hidden = false;

      const name = (me.name || "").trim();
      const email = (me.email || "").trim();

      // Botão: nome (ou "CONTA" se não tiver)
      if (ui.nameInBtn) ui.nameInBtn.textContent = name ? name.toUpperCase() : "CONTA";
      if (ui.metaName) ui.metaName.textContent = name || "Conta";
      if (ui.metaEmail) ui.metaEmail.textContent = email || "";

    } else {
      // Deslogado: esconde conta, mostra login
      if (ui.loginBtn) ui.loginBtn.hidden = false;
      ui.accountMenu.hidden = true;
      closeDropdown(ui);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
