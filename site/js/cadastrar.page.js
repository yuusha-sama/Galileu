(function () {
  const msgEl = document.getElementById("auth-msg");
  const loginForm = document.getElementById("login-form");
  const cadastroForm = document.getElementById("cadastro-form");

  function setMsg(text, type = "error") {
    if (!msgEl) {
      if (type !== "ok") alert(text);
      return;
    }
    msgEl.style.display = "block";
    msgEl.textContent = text;

    if (type === "ok") {
      msgEl.style.borderColor = "#10b981";
      msgEl.style.background = "#ecfdf5";
      msgEl.style.color = "#065f46";
    } else {
      msgEl.style.borderColor = "#ff7a00";
      msgEl.style.background = "#fff3e8";
      msgEl.style.color = "#7a2d00";
    }
  }

  function clearMsg() {
    if (!msgEl) return;
    msgEl.style.display = "none";
    msgEl.textContent = "";
  }

  function safeNext() {
    const sp = new URLSearchParams(location.search);
    let next = sp.get("next") || "/minha-equipe.html";

    try {
      next = decodeURIComponent(next);
    } catch (_) {}

    // allow only same-origin paths
    if (next.includes("://") || next.startsWith("//")) next = "/minha-equipe.html";
    if (!next.startsWith("/")) next = "/" + next.replace(/^\.\//, "");

    // avoid looping back to login page
    if (next.includes("cadastrar")) next = "/minha-equipe.html";

    return next;
  }

  function stripCredentialsFromUrl() {
    const url = new URL(location.href);
    const params = url.searchParams;

    // common keys from accidental form GET submit
    const keys = ["email", "senha", "password"];
    let changed = false;

    for (const k of keys) {
      if (params.has(k)) {
        params.delete(k);
        changed = true;
      }
    }

    if (changed) {
      const qs = params.toString();
      history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);
    }
  }

  stripCredentialsFromUrl();

  const NEXT = safeNext();

  async function me() {
    if (!window.GalileuAuth || !window.GalileuAuth.me) return null;
    try {
      return await window.GalileuAuth.me();
    } catch (_) {
      return null;
    }
  }

  async function doLogin(email, password) {
    if (!window.GalileuAuth || !window.GalileuAuth.login) {
      throw new Error("GalileuAuth não carregou. Confira se /js/auth.js está sendo carregado.");
    }
    await window.GalileuAuth.login({ email, password });
  }

  // If already logged, don't show login page
  (async () => {
    const r = await me();
    if (r && r.authenticated) {
      location.replace(NEXT);
    }
  })();

  loginForm?.addEventListener(
    "submit",
    async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      clearMsg();

      const email = (document.getElementById("login-email")?.value || "").trim();
      const password = document.getElementById("login-senha")?.value || "";

      if (!email || !password) {
        setMsg("Preencha email e senha.");
        return;
      }

      try {
        await doLogin(email, password);
        setMsg("Login realizado. Redirecionando...", "ok");
        setTimeout(() => (location.href = NEXT), 200);
      } catch (err) {
        setMsg(err?.message || "Falha no login.");
      }
    },
    true
  );

  cadastroForm?.addEventListener(
    "submit",
    async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      clearMsg();

      const email = (document.getElementById("cadastro-email")?.value || "").trim();
      const name = (document.getElementById("cadastro-nome")?.value || "").trim();
      const password = document.getElementById("cadastro-senha")?.value || "";
      const password2 = document.getElementById("cadastro-confirmar")?.value || "";

      const cpf = (document.getElementById("cadastro-cpf")?.value || "").trim();
      const birthdate = (document.getElementById("cadastro-nascimento")?.value || "").trim();

      if (!email || !name || !password) {
        setMsg("Preencha email, nome e senha.");
        return;
      }

      if (password.length < 8) {
        setMsg("Senha deve ter pelo menos 8 caracteres.");
        return;
      }

      if (password !== password2) {
        setMsg("As senhas não coincidem.");
        return;
      }

      if (!window.GalileuAuth || !window.GalileuAuth.register) {
        setMsg("GalileuAuth não carregou. Confira se /js/auth.js está sendo carregado.");
        return;
      }

      try {
        await window.GalileuAuth.register({ email, password, name, cpf, birthdate });
        // auto-login after register
        await doLogin(email, password);
        setMsg("Cadastro realizado. Redirecionando...", "ok");
        setTimeout(() => (location.href = NEXT), 200);
      } catch (err) {
        setMsg(err?.message || "Falha no cadastro.");
      }
    },
    true
  );
})();