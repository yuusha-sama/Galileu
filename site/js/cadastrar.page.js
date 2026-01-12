(function () {
  function onlyDigits(s) {
    return String(s || "").replace(/\D+/g, "");
  }

  function isValidCPF(cpf) {
    cpf = onlyDigits(cpf);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
    let d1 = (sum * 10) % 11;
    if (d1 === 10) d1 = 0;
    if (d1 !== parseInt(cpf[9], 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
    let d2 = (sum * 10) % 11;
    if (d2 === 10) d2 = 0;
    if (d2 !== parseInt(cpf[10], 10)) return false;

    return true;
  }

  function ensureFlash() {
    let box = document.getElementById("flash");
    if (box) return box;

    box = document.createElement("div");
    box.id = "flash";
    box.style.maxWidth = "1100px";
    box.style.margin = "20px auto 0";
    box.style.padding = "12px 14px";
    box.style.borderRadius = "12px";
    box.style.display = "none";
    box.style.fontWeight = "700";

    const main = document.querySelector("main");
    if (main) main.insertAdjacentElement("afterbegin", box);
    else document.body.insertAdjacentElement("afterbegin", box);

    return box;
  }

  function flash(msg, type = "error") {
    const box = ensureFlash();
    box.textContent = msg;
    box.style.display = "block";
    box.style.border = "1px solid rgba(0,0,0,.15)";
    box.style.background = type === "success" ? "rgba(0, 180, 60, .12)" : "rgba(255, 123, 0, .12)";
    box.style.color = "#111";
  }

  function clearFlash() {
    const box = document.getElementById("flash");
    if (box) box.style.display = "none";
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const cadastroForm = document.getElementById("cadastro-form");

    if (!window.GalileuAuth) {
      flash("GalileuAuth não carregou. Confira /config.js, /js/auth.js e a ordem dos scripts.", "error");
      return;
    }

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFlash();

        const email = val("login-email").trim().toLowerCase();
        const senha = val("login-senha");

        if (!email || !senha) {
          flash("Preencher email e senha para entrar.", "error");
          return;
        }

        try {
          await window.GalileuAuth.login({ email, password: senha });
          window.location.href = "/minha-equipe.html";
        } catch (err) {
          flash(err.message || "Falha no login.", "error");
        }
      });
    }

    if (cadastroForm) {
      cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFlash();

        const email = val("cad-email").trim().toLowerCase();
        const nome = val("cad-nome").trim();
        const dataNasc = val("cad-data");
        const cpf = val("cad-cpf");
        const telefone = val("cad-telefone").trim();
        const senha = val("cad-senha");

        if (!email || !nome || !senha) {
          flash("Preencher email, nome e senha para cadastrar.", "error");
          return;
        }

        if (senha.length < 8) {
          flash("Senha deve ter pelo menos 8 caracteres.", "error");
          return;
        }

        if (cpf && !isValidCPF(cpf)) {
          flash("CPF inválido.", "error");
          return;
        }

        try {
          // Backend atual só usa email, password, name — os outros campos ficam para a próxima etapa
          await window.GalileuAuth.register({ email, password: senha, name: nome, birthdate: dataNasc, cpf, telefone });
          flash("Cadastro realizado! Agora faça login para entrar.", "success");
          cadastroForm.reset();
        } catch (err) {
          flash(err.message || "Falha no cadastro.", "error");
        }
      });
    }
  });
})();