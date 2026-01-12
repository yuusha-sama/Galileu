(function () {
  const ME_URL = "/api/auth/me/";
  const LOGOUT_URL = "/api/auth/logout/";
  const LOGIN_PAGE = "/cadastrar.html";
  const TEAM_PAGE = "/minha-equipe.html";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function currentPathWithQuery() {
    const p = window.location.pathname || "/";
    const q = window.location.search || "";
    const h = window.location.hash || "";
    return p + q + h;
  }

  async function fetchMe() {
    try {
      const res = await fetch(ME_URL, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();

      // suporta os dois formatos: {authenticated:true,...} ou {ok:true,...}
      if (data && data.authenticated === true) return data;
      if (data && data.ok === true) {
        return {
          authenticated: true,
          email: data.email,
          name: data.name,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  function findNavRoot() {
    // prioriza nav dentro do header, mas funciona em qualquer layout
    return $("header nav") || $("nav") || $(".navbar");
  }

  function ensureAuthContainer(nav) {
    let c = $(".auth-buttons", nav);
    if (c) return c;

    const inner = $(".nav-inner", nav) || nav;
    c = document.createElement("div");
    c.className = "auth-buttons";
    inner.appendChild(c);
    return c;
  }

  function removeLegacyRightSide(nav) {
    const auth = $(".auth-buttons", nav);

    // remove elementos duplicados que existam fora do container de auth
    const legacySelectors = [
      "a.login-btn",
      "a.btn-login",
      "a[href*='cadastrar.html']",
      "button.account-btn",
      ".account-menu",
      "#loginBtn",
      "#loginButton",
      "#accountBtn",
      "#accountMenu",
    ];

    $$(legacySelectors.join(","), nav).forEach((el) => {
      if (auth && auth.contains(el)) return;

      // só mexer no lado direito (evitar apagar links do menu principal)
      // Heurística: só remove se estiver perto do final do nav ou dentro de containers comuns
      const parent = el.parentElement;
      const parentOk = parent && (
        parent.classList.contains("auth-buttons") ||
        parent.classList.contains("nav-right") ||
        parent.classList.contains("nav-inner") ||
        parent.tagName === "NAV" ||
        parent.tagName === "HEADER"
      );

      if (parentOk) {
        el.remove();
      }
    });
  }

  function renderLoggedOut(nav) {
    const auth = ensureAuthContainer(nav);
    auth.innerHTML = "";

    const a = document.createElement("a");
    a.className = "login-btn";
    a.href = `${LOGIN_PAGE}?next=${encodeURIComponent(currentPathWithQuery())}`;
    a.textContent = "LOGIN / CADASTRE-SE";

    auth.appendChild(a);
  }

  function renderLoggedIn(nav, me) {
    const auth = ensureAuthContainer(nav);
    auth.innerHTML = "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "account-btn";
    btn.setAttribute("aria-label", "Abrir menu");

    const menu = document.createElement("div");
    menu.className = "account-menu hidden";

    const name = (me?.name || "").trim() || "Conta";
    const email = (me?.email || "").trim();

    menu.innerHTML = `
      <div class="account-meta">
        <div class="account-name">${escapeHtml(name)}</div>
        ${email ? `<div class="account-email">${escapeHtml(email)}</div>` : ""}
      </div>
      <a href="${TEAM_PAGE}">Minha equipe</a>
      <button type="button" class="danger" data-action="logout">Sair</button>
    `;

    auth.appendChild(btn);
    auth.appendChild(menu);

    function closeMenu() {
      menu.classList.add("hidden");
    }

    function toggleMenu() {
      menu.classList.toggle("hidden");
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    const logoutBtn = $("[data-action='logout']", menu);
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await fetch(LOGOUT_URL, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
        } catch {
          // ignorar
        }
        window.location.href = "/index.html";
      });
    }
  }

  async function init() {
    const nav = findNavRoot();
    if (!nav) return;

    ensureAuthContainer(nav);
    removeLegacyRightSide(nav);

    const me = await fetchMe();

    // se já tem algo hardcoded, remove antes de renderizar
    removeLegacyRightSide(nav);

    if (me && me.authenticated) {
      renderLoggedIn(nav, me);
    } else {
      renderLoggedOut(nav);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
