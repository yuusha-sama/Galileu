(function () {
  const alertEl = document.getElementById("auth-alert");

  function showAlert(msg) {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.classList.add("show");
  }

  function hideAlert() {
    if (!alertEl) return;
    alertEl.textContent = "";
    alertEl.classList.remove("show");
  }

  function onlyDigits(s) {
    return (s || "").replace(/\D/g, "");
  }

  function isValidCPF(cpf) {
    cpf = onlyDigits(cpf);
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i), 10) * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 >= 10) d1 = 0;
    if (d1 !== parseInt(cpf.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i), 10) * (11 - i);
    let d2 = 11 - (sum % 11);
    if (d2 >= 10) d2 = 0;
    if (d2 !== parseInt(cpf.charAt(10), 10)) return false;

    return true;
  }

  function getNext() {
    const url = new URL(location.href);
    const next = url.searchParams.get("next");
    return next && next.startsWith("/") ? next : "/minha-equipe.html";
  }

  async function onRegister(e) {
    e.preventDefault();
    hideAlert();

    if (!window.GalileuAuth) {
      showAlert("GalileuAuth não carregou. Confira os <script> no final da página.");
      return;
    }

    const email = (document.getElementById("cadastro-email")?.value || "").trim().toLowerCase();
    const name = (document.getElementById("cadastro-nome")?.value || "").trim();
    const birth_date = (document.getElementById("cadastro-nascimento")?.value || "").trim();
    const cpf = (document.getElementById("cadastro-cpf")?.value || "").trim();
    const phone = (document.getElementById("cadastro-telefone")?.value || "").trim();
    const password = (document.getElementById("cadastro-senha")?.value || "");
    const confirm = (document.getElementById("cadastro-confirmar")?.value || "");

    if (!email || !name || !birth_date || !cpf || !phone || !password) {
      showAlert("Preencha todos os campos do cadastro.");
      return;
    }

    if (!isValidCPF(cpf)) {
      showAlert("CPF inválido.");
      return;
    }

    if (password.length < 8) {
      showAlert("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      showAlert("As senhas não conferem.");
      return;
    }

    try {
      await window.GalileuAuth.register({ email, password, name, cpf, phone, birth_date });
      showAlert("Cadastro criado! Agora faça o login.");
      document.getElementById("login-email").value = email;
      document.getElementById("login-email")?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showAlert(err.message || "Erro no cadastro.");
    }
  }

  async function onLogin(e) {
    e.preventDefault();
    hideAlert();

    const email = (document.getElementById("login-email")?.value || "").trim().toLowerCase();
    const password = (document.getElementById("login-senha")?.value || "");

    if (!email || !password) {
      showAlert("Informe email e senha.");
      return;
    }

    try {
      await window.GalileuAuth.login({ email, password });
      location.href = getNext();
    } catch (err) {
      showAlert(err.message || "Erro no login.");
    }
  }

  function onForgot(e) {
    e.preventDefault();
    showAlert("Recuperação de senha por email ainda não está implementada (vamos fazer em seguida).");
  }

  function init() {
    document.getElementById("cadastro-form")?.addEventListener("submit", onRegister);
    document.getElementById("login-form")?.addEventListener("submit", onLogin);
    document.getElementById("forgot-link")?.addEventListener("click", onForgot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
