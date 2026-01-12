(function () {
  const STYLE_ID = "galileu-navbar-auth-style";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Garantir contraste do botão de conta (alguns estilos do tema deixam o texto preto) */
      .user-menu-btn, .user-menu-btn * { color: #fff !important; }
      .user-menu-btn { display: inline-flex; align-items: center; gap: 8px; }

      .user-menu { position: relative; }

      .user-menu-dropdown{
        display:none;
        position:absolute;
        right:0;
        top: calc(100% + 10px);
        background:#fff;
        border-radius:14px;
        box-shadow:0 10px 30px rgba(0,0,0,.15);
        overflow:hidden;
        min-width: 200px;
        z-index: 9999;
      }

      .user-menu-dropdown .dropdown-item{
        display:block;
        width:100%;
        text-align:left;
        padding:12px 14px;
        background:transparent;
        border:0;
        font:inherit;
        cursor:pointer;
        color:#111;
      }
      .user-menu-dropdown .dropdown-item:hover{
        background:rgba(0,0,0,.06);
      }
      .user-menu-dropdown .logout{
        color:#b00020;
        font-weight:600;
      }

      /* hamburguer (linhas brancas no topo preto) */
      .hamburger span{ background:#fff !important; }
    `;
    document.head.appendChild(style);
  }

  function getEls() {
    return {
      authArea: document.getElementById("auth-area") || document.querySelector(".auth-buttons"),
      userMenu: document.getElementById("user-menu"),
      userName: document.getElementById("user-name"),
      menuBtn: document.getElementById("user-menu-btn"),
      menuDd: document.getElementById("user-menu-dropdown"),
      logoutBtn: document.getElementById("btn-logout"),
      hamburger: document.getElementById("hamburger") || document.querySelector(".hamburger"),
      navLinks: document.getElementById("nav-links") || document.querySelector(".nav-links"),
    };
  }

  function mountLoggedIn(me) {
    const { authArea, userMenu, userName } = getEls();
    if (authArea) authArea.style.display = "none";
    if (userMenu) userMenu.style.display = "block";

    if (userName) {
      userName.textContent = (me && (me.name || me.email)) ? (me.name || me.email) : "CONTA";
    }
  }

  function mountLoggedOut() {
    const { authArea, userMenu, userName } = getEls();
    if (authArea) authArea.style.display = "";
    if (userMenu) userMenu.style.display = "none";
    if (userName) userName.textContent = "CONTA";
  }

  function setupAccountMenu() {
    const { menuBtn, menuDd, logoutBtn } = getEls();
    if (!menuBtn || !menuDd) return;

    function close() {
      menuDd.style.display = "none";
      menuBtn.setAttribute("aria-expanded", "false");
    }

    function toggle() {
      const isOpen = menuDd.style.display === "block";
      if (isOpen) close();
      else {
        menuDd.style.display = "block";
        menuBtn.setAttribute("aria-expanded", "true");
      }
    }

    menuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    menuDd.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", () => close());
    window.addEventListener("resize", () => close());

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          if (window.GalileuAuth && window.GalileuAuth.logout) {
            await window.GalileuAuth.logout();
          }
        } catch (_) {
          // mesmo que dê erro, vamos "forçar" o estado a atualizar
        }
        // Volta pro home e o navbar vai recalcular o estado (me)
        window.location.href = "/index.html";
      });
    }
  }

  function setupHamburger() {
    const { hamburger, navLinks } = getEls();
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      hamburger.classList.toggle("open");
    });
  }

  async function refreshAuthState() {
    if (!window.GalileuAuth || !window.GalileuAuth.me) {
      mountLoggedOut();
      return;
    }

    try {
      const me = await window.GalileuAuth.me();
      // /me/ pode retornar {authenticated: true}
      if (me && (me.authenticated === true || me.ok === true)) mountLoggedIn(me);
      else mountLoggedOut();
    } catch (_) {
      mountLoggedOut();
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    injectStyles();
    setupHamburger();
    setupAccountMenu();
    await refreshAuthState();
  });
})();