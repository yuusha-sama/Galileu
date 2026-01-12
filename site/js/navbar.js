(function () {
  const BASE = (window.GALILEU_CONFIG && window.GALILEU_CONFIG.AUTH_BASE) || "/api/auth";

  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text };
    }

    return { res, data };
  }

  function ensureAuthUI() {
    const authButtons = document.querySelector("header nav .auth-buttons") || document.querySelector(".auth-buttons");
    if (!authButtons) return null;

    // Login button (already exists in most pages)
    let loginLink = document.getElementById("btn-login-nav");
    if (!loginLink) {
      // fallback: find by href
      loginLink = authButtons.querySelector('a[href*="cadastrar"], a[href*="login"], a.btn');
    }
    if (!loginLink) {
      loginLink = document.createElement("a");
      loginLink.id = "btn-login-nav";
      loginLink.href = "/cadastrar.html";
      loginLink.className = "btn";
      loginLink.textContent = "LOGIN / CADASTRE-SE";
      authButtons.appendChild(loginLink);
    }

    // Account hamburger button
    let accountBtn = document.getElementById("btn-account-menu");
    if (!accountBtn) {
      accountBtn = document.createElement("button");
      accountBtn.type = "button";
      accountBtn.id = "btn-account-menu";
      accountBtn.className = "auth-hamburger-btn";
      accountBtn.setAttribute("aria-label", "Conta");
      accountBtn.innerHTML = '<img src="/assets/img/cardapio.png" alt="Menu" />';
      authButtons.appendChild(accountBtn);
    }

    // Dropdown
    let dropdown = document.getElementById("account-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "account-dropdown";
      dropdown.className = "auth-dropdown";
      dropdown.hidden = true;
      dropdown.innerHTML = `
        <div class="auth-user">
          <p class="name" id="auth-user-name"></p>
          <p class="email" id="auth-user-email"></p>
        </div>
        <div class="auth-actions">
          <a href="/minha-equipe.html">Minha equipe</a>
          <button type="button" class="logout" id="auth-logout-btn">Sair</button>
        </div>
      `;
      authButtons.appendChild(dropdown);
    }

    // Keep it hidden by default; we'll enable after /me
    accountBtn.style.display = "none";
    dropdown.hidden = true;
    loginLink.style.display = "";

    return { authButtons, loginLink, accountBtn, dropdown };
  }

  function closeDropdown(dropdown) {
    dropdown.hidden = true;
  }

  function toggleDropdown(dropdown) {
    dropdown.hidden = !dropdown.hidden;
  }

  async function init() {
    const ui = ensureAuthUI();
    if (!ui) return;

    const { loginLink, accountBtn, dropdown } = ui;

    // Wire events once
    if (!accountBtn.dataset.bound) {
      accountBtn.dataset.bound = "1";
      accountBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown(dropdown);
      });

      document.addEventListener("click", (e) => {
        if (dropdown.hidden) return;
        if (dropdown.contains(e.target) || accountBtn.contains(e.target)) return;
        closeDropdown(dropdown);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDropdown(dropdown);
      });
    }

    const logoutBtn = dropdown.querySelector("#auth-logout-btn");
    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = "1";
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          await fetchJSON(`${BASE}/logout/`, { method: "POST", body: "{}" });
        } catch {
          // ignore
        }

        // reload to refresh UI state
        window.location.href = "/index.html";
      });
    }

    // Check session
    const { res, data } = await fetchJSON(`${BASE}/me/`, { method: "GET" });

    if (res.ok && data && (data.authenticated === true || data.ok === true)) {
      // logged in
      const nameEl = dropdown.querySelector("#auth-user-name");
      const emailEl = dropdown.querySelector("#auth-user-email");

      const name = (data.name || "").trim();
      const email = (data.email || "").trim();

      if (nameEl) nameEl.textContent = name || "Conta";
      if (emailEl) emailEl.textContent = email || "";

      loginLink.style.display = "none";
      accountBtn.style.display = "inline-flex";
    } else {
      // logged out
      loginLink.style.display = "";
      accountBtn.style.display = "none";
      dropdown.hidden = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
