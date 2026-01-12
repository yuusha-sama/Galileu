(function () {
  const STYLE_ID = "galileu-navbar-v3-style";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
/* ===== Galileu Navbar V3 (override leve) ===== */
.navbar { display:flex; align-items:center; justify-content:space-between; gap:24px; position:relative; }
.navbar-logo img { height:40px; width:auto; display:block; }
.navbar-links { display:flex; align-items:center; gap:48px; list-style:none; margin:0; padding:0; }
.navbar-links a { color:#fff; text-decoration:none; font-weight:800; letter-spacing:.5px; }
.navbar-actions { display:flex; align-items:center; gap:14px; }

.btn-login { display:inline-flex; align-items:center; gap:10px; padding:10px 16px; border-radius:999px; background:#ff7b00; color:#fff; font-weight:800; text-decoration:none; white-space:nowrap; }
.btn-login img { width:22px; height:22px; display:block; }

.hamburger { display:none; background:transparent; border:1px solid rgba(255,255,255,.45); border-radius:12px; width:44px; height:44px; color:#fff; font-size:20px; align-items:center; justify-content:center; cursor:pointer; }

.account { position:relative; }
.account-toggle { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:999px; background:#ff7b00; color:#fff; font-weight:800; border:none; cursor:pointer; white-space:nowrap; }
.account-toggle:focus { outline: 2px solid rgba(255,255,255,.35); outline-offset: 2px; }
.account-toggle .caret { font-size:12px; line-height:1; }

.account-dropdown { position:absolute; right:0; top:calc(100% + 10px); min-width:260px; background:#fff; border-radius:14px; box-shadow:0 12px 30px rgba(0,0,0,.18); padding:10px; z-index:9999; }
.account-meta { padding:10px 10px 8px; border-bottom:1px solid rgba(0,0,0,.08); margin-bottom:8px; }
.account-meta-name { font-weight:900; color:#111; }
.account-meta-email { font-size:13px; color:#555; margin-top:4px; word-break:break-all; }

.account-item { width:100%; display:block; text-align:left; padding:10px; border-radius:10px; color:#111; text-decoration:none; background:transparent; border:none; cursor:pointer; font:inherit; }
.account-item:hover { background: rgba(0,0,0,.06); }
.account-logout { color:#b00020; font-weight:900; }

/* Mobile */
@media (max-width: 980px) {
  .hamburger { display:flex; }
  .navbar-links { display:none; position:absolute; left:0; right:0; top:70px; background:#000; border-top:1px solid rgba(255,255,255,.12); padding:12px 0; gap:0; flex-direction:column; }
  .navbar-links.open { display:flex; }
  .navbar-links li { width:100%; }
  .navbar-links a { display:block; padding:14px 24px; width:100%; }
}
`;
    document.head.appendChild(style);
  }

  async function safeMe() {
    if (!window.GalileuAuth || typeof window.GalileuAuth.me !== "function") return null;
    try {
      const data = await window.GalileuAuth.me();
      if (data && data.authenticated === false) return null;
      return data || null;
    } catch {
      return null;
    }
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function setLoggedOut() {
    const loginBtn = qs("btn-login-nav");
    const accountMenu = qs("account-menu");

    if (loginBtn) loginBtn.hidden = false;
    if (accountMenu) accountMenu.hidden = true;

    closeAccountDropdown();
  }

  function setLoggedIn(me) {
    const loginBtn = qs("btn-login-nav");
    const accountMenu = qs("account-menu");

    if (loginBtn) loginBtn.hidden = true;
    if (accountMenu) accountMenu.hidden = false;

    const displayName = (me && (me.name || me.first_name)) ? (me.name || me.first_name) : "Conta";
    const email = (me && me.email) ? me.email : "";

    const nameInButton = qs("account-name");
    const nameLine = qs("account-meta-name");
    const emailLine = qs("account-meta-email");

    if (nameInButton) nameInButton.textContent = displayName.toUpperCase();
    if (nameLine) nameLine.textContent = displayName;
    if (emailLine) emailLine.textContent = email;
  }

  function openAccountDropdown() {
    const dropdown = qs("account-dropdown");
    const toggle = qs("account-toggle");
    if (!dropdown || !toggle) return;

    dropdown.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeAccountDropdown() {
    const dropdown = qs("account-dropdown");
    const toggle = qs("account-toggle");
    if (!dropdown || !toggle) return;

    dropdown.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  function toggleAccountDropdown() {
    const dropdown = qs("account-dropdown");
    if (!dropdown) return;
    if (dropdown.hidden) openAccountDropdown();
    else closeAccountDropdown();
  }

  function bindAccountMenu() {
    const toggle = qs("account-toggle");
    const dropdown = qs("account-dropdown");
    const menu = qs("account-menu");

    if (!toggle || !dropdown || !menu) return;

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleAccountDropdown();
    });

    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
      // fecha clicando fora
      if (!menu.contains(e.target)) closeAccountDropdown();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAccountDropdown();
    });
  }

  function bindHamburger() {
    const btn = qs("btn-hamburger");
    const links = qs("nav-links");
    if (!btn || !links) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });

    // Fecha menu ao clicar em um link
    links.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function bindLogoutEverywhere() {
    const bindOne = (el) => {
      if (!el || el.dataset.logoutBound === "1") return;
      el.dataset.logoutBound = "1";

      el.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          if (window.GalileuAuth && typeof window.GalileuAuth.logout === "function") {
            await window.GalileuAuth.logout();
          } else {
            await fetch("/api/auth/logout/", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" });
          }
        } catch {
          // ignore
        }
        window.location.href = "/index.html";
      });
    };

    document.querySelectorAll('[data-action="logout"]').forEach(bindOne);

    // compat: botão antigo
    bindOne(qs("btn-sair"));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    injectStyle();
    bindHamburger();
    bindAccountMenu();
    bindLogoutEverywhere();

    const me = await safeMe();
    if (me) setLoggedIn(me);
    else setLoggedOut();
  });
})();