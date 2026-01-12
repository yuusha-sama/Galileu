(function () {
  const ME_URL = "/api/auth/me/";
  const LOGOUT_URL = "/api/auth/logout/";
  const LOGIN_PAGE = "/cadastrar.html";
  const TEAM_PAGE = "/minha-equipe.html";

  function escapeHTML(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function findOrCreateAuthContainer(nav) {
    // Prefer a dedicated container if present
    let box = nav.querySelector(".auth-buttons");
    if (box) return box;

    // Try to attach to a "nav-inner" wrapper
    const inner = nav.querySelector(".nav-inner") || nav;

    box = document.createElement("div");
    box.className = "auth-buttons";
    inner.appendChild(box);
    return box;
  }

  async function fetchMe() {
    try {
      const r = await fetch(ME_URL, { credentials: "include" });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  function renderLoggedOut(container) {
    container.innerHTML = "";
    const a = document.createElement("a");
    a.href = LOGIN_PAGE;
    a.className = "login-btn";
    a.textContent = "LOGIN / CADASTRE-SE";
    container.appendChild(a);
  }

  function attachOutsideClose(menu, btn) {
    function onDocClick(e) {
      if (menu.classList.contains("hidden")) return;
      if (menu.contains(e.target) || btn.contains(e.target)) return;
      menu.classList.add("hidden");
    }
    document.addEventListener("click", onDocClick);
  }

  function renderLoggedIn(container, user) {
    container.innerHTML = "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "account-btn";
    btn.id = "accountBtn";
    btn.setAttribute("aria-label", "Conta");

    const menu = document.createElement("div");
    menu.className = "account-menu hidden";

    const name = escapeHTML(user?.name || user?.first_name || "Conta");
    const email = escapeHTML(user?.email || "");

    menu.innerHTML = `
      <div class="account-meta">
        <div class="account-name">${name}</div>
        <div class="account-email">${email}</div>
      </div>
      <a class="menu-item" href="${TEAM_PAGE}">Minha equipe</a>
      <button class="menu-item danger" type="button" data-action="logout">Sair</button>
    `;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });

    // Prevent the "click outside" handler from instantly closing when clicking inside
    menu.addEventListener("click", (e) => e.stopPropagation());

    attachOutsideClose(menu, btn);

    const logoutBtn = menu.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await fetch(LOGOUT_URL, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
        } catch {
          // ignore
        }
        window.location.href = LOGIN_PAGE;
      });
    }

    container.appendChild(btn);
    container.appendChild(menu);
  }

  async function init() {
    const navs = Array.from(document.querySelectorAll("nav.navbar"));
    if (!navs.length) return;

    const user = await fetchMe();

    navs.forEach((nav) => {
      const container = findOrCreateAuthContainer(nav);
      if (!user || user.authenticated === false) {
        renderLoggedOut(container);
      } else {
        renderLoggedIn(container, user);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
