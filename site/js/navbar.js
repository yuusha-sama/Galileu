(function () {
  function ensureNavCss() {
    if (document.getElementById("galileu-nav-extra-css")) return;

    const css = `
/* ===== Galileu navbar extras (hamburger + user menu) ===== */
.hamburger{display:none;align-items:center;justify-content:center;width:44px;height:44px;border:0;background:transparent;cursor:pointer;border-radius:10px}
.hamburger span{display:block;width:24px;height:2px;margin:4px 0;background:#111;border-radius:2px}
.nav-links{list-style:none}
.user-menu{display:flex;align-items:center;gap:10px}
.user-menu-btn{border:0;background:transparent;cursor:pointer;font-family:inherit;font-weight:700;display:flex;align-items:center;gap:6px;padding:10px 12px;border-radius:12px}
.user-menu-dropdown{position:absolute;right:16px;top:72px;min-width:200px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:8px;box-shadow:0 10px 24px rgba(0,0,0,.10);z-index:9999}
.user-menu-dropdown a, .user-menu-dropdown button{display:block;width:100%;text-align:left;border:0;background:transparent;padding:10px 10px;border-radius:10px;cursor:pointer;font-family:inherit}
.user-menu-dropdown a:hover, .user-menu-dropdown button:hover{background:rgba(0,0,0,.06)}
/* mobile */
@media (max-width: 860px){
  .hamburger{display:flex}
  .nav-links{display:none;position:absolute;left:0;right:0;top:72px;background:#fff;border-top:1px solid rgba(0,0,0,.08);padding:12px 16px;gap:10px;flex-direction:column;z-index:9998}
  .nav-links.open{display:flex}
}
`;
    const style = document.createElement("style");
    style.id = "galileu-nav-extra-css";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function qs(id) { return document.getElementById(id); }

  async function getMe() {
    try {
      if (!window.GalileuAuth) return null;
      return await window.GalileuAuth.me();
    } catch (e) {
      return null;
    }
  }

  function openDropdown(open) {
    const btn = qs("user-menu-btn");
    const dd = qs("user-menu-dropdown");
    if (!btn || !dd) return;

    dd.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function openNav(open) {
    const nav = qs("nav-links");
    const btn = qs("hamburger-btn");
    if (!nav || !btn) return;

    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function mountLoggedOut() {
    document.body.classList.remove("authenticated");
    const userMenu = qs("user-menu");
    if (userMenu) userMenu.hidden = true;

    const authArea = qs("auth-area");
    if (authArea) authArea.style.display = "";
  }

  function mountLoggedIn(me) {
    document.body.classList.add("authenticated");

    const authArea = qs("auth-area");
    if (authArea) authArea.style.display = "none";

    const userMenu = qs("user-menu");
    if (userMenu) userMenu.hidden = false;

    const userName = qs("user-name");
    if (userName) userName.textContent = me?.name ? me.name : (me?.email || "Conta");
  }

  async function bindLogout() {
    const btnLogout = qs("btn-logout");
    if (!btnLogout) return;

    btnLogout.addEventListener("click", async () => {
      try { await window.GalileuAuth.logout(); } catch (_) {}
      location.href = "/index.html";
    });
  }

  function bindHamburger() {
    const btn = qs("hamburger-btn");
    const nav = qs("nav-links");
    if (!btn || !nav) return;

    btn.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      openNav(open);
      openDropdown(false);
    });
  }

  function bindUserDropdown() {
    const btn = qs("user-menu-btn");
    const dd = qs("user-menu-dropdown");
    if (!btn || !dd) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = dd.hidden;
      openDropdown(open);
      openNav(false);
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!dd.hidden) {
        const inside = dd.contains(target) || btn.contains(target);
        if (!inside) openDropdown(false);
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        openDropdown(false);
        openNav(false);
      }
    });
  }

  async function init() {
    ensureNavCss();

    bindHamburger();
    bindUserDropdown();
    bindLogout();

    const me = await getMe();
    if (me && (me.authenticated === true || me.ok === true)) {
      mountLoggedIn(me);
    } else {
      mountLoggedOut();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
