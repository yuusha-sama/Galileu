// site/js/main.js
// Lógica GLOBAL do site: navbar + sessão + logout + proteção de páginas

function $(id) {
  return document.getElementById(id);
}

function isProtectedPage() {
  // coloque aqui as páginas que só podem abrir logado:
  const protectedPages = ["minha-equipe.html"];
  const current = (location.pathname.split("/").pop() || "").toLowerCase();
  return protectedPages.includes(current);
}

function renderNavbarLoggedOut() {
  // Exemplo: mantém o botão LOGIN/CADASTRE-SE
  const btnLogin = $("btn-login-nav");
  if (btnLogin) btnLogin.style.display = "inline-flex";

  const authMenu = $("auth-menu");
  if (authMenu) authMenu.remove();
}

function renderNavbarLoggedIn(user) {
  // Esconde botão "LOGIN / CADASTRE-SE"
  const btnLogin = $("btn-login-nav");
  if (btnLogin) btnLogin.style.display = "none";

  // Cria menu simples autenticado (hamburger)
  // Você pode estilizar depois no CSS
  let authMenu = $("auth-menu");
  if (!authMenu) {
    authMenu = document.createElement("div");
    authMenu.id = "auth-menu";
    authMenu.style.display = "flex";
    authMenu.style.alignItems = "center";
    authMenu.style.gap = "10px";

    authMenu.innerHTML = `
      <button id="hamburger-btn" aria-label="Menu" style="font-size:18px; cursor:pointer;">☰</button>
      <div id="hamburger-panel" style="
        display:none;
        position:absolute;
        top:70px;
        right:20px;
        background:#fff;
        border:1px solid rgba(0,0,0,.15);
        border-radius:10px;
        padding:10px;
        min-width:180px;
        z-index:9999;
      ">
        <div style="font-family:Lato, Arial; font-size:14px; margin-bottom:8px;">
          Olá, <b>${(user?.name || "Usuário")}</b>
        </div>
        <a href="minha-equipe.html" style="display:block; padding:8px; text-decoration:none;">Minha equipe</a>
        <button id="logout-btn" style="width:100%; padding:8px; cursor:pointer;">Sair</button>
      </div>
    `;

    // coloca dentro do <nav> no final (ajuste se quiser)
    const nav = document.querySelector("nav");
    if (nav) nav.appendChild(authMenu);
  }

  // Toggle hamburger
  const btn = $("hamburger-btn");
  const panel = $("hamburger-panel");
  if (btn && panel) {
    btn.onclick = () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    };

    // fecha clicando fora
    document.addEventListener("click", (e) => {
      const clickedInside = authMenu.contains(e.target);
      if (!clickedInside) panel.style.display = "none";
    });
  }

  // Logout
  const logoutBtn = $("logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      try {
        await Auth.logout();
      } catch (e) {}
      // volta pro index
      location.href = "index.html";
    };
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const me = await Auth.me(); // { authenticated: true, name, email }
    renderNavbarLoggedIn(me);
  } catch (err) {
    renderNavbarLoggedOut();

    if (isProtectedPage()) {
      location.href = "cadastrar.html";
    }
  }
});
