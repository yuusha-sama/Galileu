(function () {
  async function safeMe() {
    try {
      const r = await fetch("/api/auth/me/", { credentials: "include" });
      if (r.status === 401) return null;

      const data = await r.json().catch(() => null);
      if (!r.ok) return null;

      // backend pode retornar authenticated:true (me) ou ok:true (login)
      if (data && (data.authenticated === true || data.ok === true)) return data;
      return null;
    } catch {
      return null;
    }
  }

  function init() {
    const loginBtn = document.getElementById("btn-login-nav");
    const accountWrapper = document.getElementById("account-wrapper");
    const accountToggle = document.getElementById("account-toggle");
    const accountDropdown = document.getElementById("account-dropdown");
    const accountName = document.getElementById("account-name");
    const accountEmail = document.getElementById("account-email");
    const btnLogout = document.getElementById("btn-logout");

    if (!loginBtn && !accountWrapper) return;

    function closeMenu() {
      if (accountDropdown) accountDropdown.hidden = true;
    }

    function setLoggedOut() {
      if (accountWrapper) accountWrapper.hidden = true;
      if (accountDropdown) accountDropdown.hidden = true;
      if (loginBtn) loginBtn.hidden = false;

      if (accountName) accountName.textContent = "";
      if (accountEmail) accountEmail.textContent = "";
      if (accountToggle) accountToggle.textContent = "Conta ▾";
    }

    function setLoggedIn(me) {
      const name = me.name || me.first_name || me.username || "Conta";
      const email = me.email || "";

      if (loginBtn) loginBtn.hidden = true;

      if (accountWrapper) accountWrapper.hidden = false;
      if (accountDropdown) accountDropdown.hidden = true;

      if (accountName) accountName.textContent = name;
      if (accountEmail) accountEmail.textContent = email;

      if (accountToggle) accountToggle.textContent = `${name.toUpperCase()} ▾`;
    }

    if (accountToggle && accountDropdown) {
      accountToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        accountDropdown.hidden = !accountDropdown.hidden;
      });
    }

    document.addEventListener("click", (e) => {
      if (!accountDropdown || accountDropdown.hidden) return;
      if (accountWrapper && accountWrapper.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    if (btnLogout) {
      btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await fetch("/api/auth/logout/", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
        } catch {}
        window.location.href = "/index.html";
      });
    }

    (async () => {
      const me = await safeMe();
      if (me) setLoggedIn(me);
      else setLoggedOut();
    })();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.GalileuNavbar = { refresh: init };
})();
