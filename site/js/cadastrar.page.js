(function () {
  const $ = (id) => document.getElementById(id);

  function showAlert(msg, type = "error") {
    const el = $("auth-alert");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    // se quiser diferenciar cor por tipo, dá pra estilizar via CSS depois
  }

  function clearAlert() {
    const el = $("auth-alert");
    if (!el) return;
    el.textContent = "";
    el.classList.remove("show");
  }

  function onlyDigits(s) {
    return (s || "").replace(/\D/g, "");
  }

  // valida CPF de verdade (11 dígitos + dígitos verificadores)
  function isValidCPF(cpfRaw) {
    const cpf = onlyDigits(cpfRaw);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

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

  async function onLoginSubmit(ev) {
    ev.preventDefault();
    clearAlert();

    if (!window.GalileuAuth) {
      showAlert("GalileuAuth não carregou. Confira o <script src='/js/auth.js'> e a ordem dos scripts.");
      return;
    }

    const email = ($("login-email")?.value || "").trim().toLowerCase();
    const password = $("login-senha")?.value || "";

    try {
      await window.GalileuAuth.login({ email, password });
      // logou -> vai pra minha equipe
      window.location.href = "/minha-equipe.html";
    } catch (err) {
      showAlert(err.message || "Erro ao logar");
    }
  }

  async function onRegisterSubmit(ev) {
    ev.preventDefault();
    clearAlert();

    if (!window.GalileuAuth) {
      showAlert("GalileuAuth não carregou. Confira o <script src='/js/auth.js'> e a ordem dos scripts.");
      return;
    }

    const email = ($("cadastro-email")?.value || "").trim().toLowerCase();
    const name = ($("cadastro-nome")?.value || "").trim();
    const nascimento = $("cadastro-nascimento")?.value || "";
    const cpf = $("cadastro-cpf")?.value || "";
    const telefone = $("cadastro-telefone")?.value || "";
    const senha = $("cadastro-senha")?.value || "";
    const confirmar = $("cadastro-confirmar")?.value || "";

    if (!email || !name) {
      showAlert("Preencha email e nome.");
      return;
    }

    if (senha.length < 8) {
      showAlert("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmar) {
      showAlert("As senhas não conferem.");
      return;
    }

    if (!isValidCPF(cpf)) {
      showAlert("CPF inválido.");
      return;
    }

    // OBS: backend ainda só salva email/nome/senha.
    // cpf/telefone/nascimento ficam validados no front por enquanto.
    try {
      await window.GalileuAuth.register({ email, password: senha, name });

      showAlert("Conta criada! Agora faça login.", "success");

      // joga o email pro login e dá foco na senha
      if ($("login-email")) $("login-email").value = email;
      $("login-senha")?.focus();
    } catch (err) {
      showAlert(err.message || "Erro ao cadastrar");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = $("login-form");
    const cadastroForm = $("cadastro-form");

    if (loginForm) loginForm.addEventListener("submit", onLoginSubmit);
    if (cadastroForm) cadastroForm.addEventListener("submit", onRegisterSubmit);
  });
})();
