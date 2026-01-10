// site/js/cadastrar.page.js
(function () {
  function showAlert(msg, type = "warn") {
    const box = document.getElementById("auth-alert");
    if (!box) return alert(msg);
    box.textContent = msg;
    box.classList.add("show");
  }

  function hideAlert() {
    const box = document.getElementById("auth-alert");
    if (!box) return;
    box.textContent = "";
    box.classList.remove("show");
  }

  function onlyDigits(s) {
    return (s || "").replace(/\D/g, "");
  }

  function isValidCPF(cpf) {
    cpf = onlyDigits(cpf);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 >= 10) d1 = 0;
    if (d1 !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    let d2 = 11 - (sum % 11);
    if (d2 >= 10) d2 = 0;
    if (d2 !== parseInt(cpf[10])) return false;

    return true;
  }

  async function handleRegister(ev) {
    ev.preventDefault();
    hideAlert();

    const email = document.getElementById("cadastro-email").value.trim().toLowerCase();
    const name = document.getElementById("cadastro-nome").value.trim();
    const cpf = document.getElementById("cadastro-cpf").value.trim();
    const senha = document.getElementById("cadastro-senha").value;
    const confirmar = document.getElementById("cadastro-confirmar").value;

    if (!email || !name) return showAlert("Preencha email e nome.");
    if (!isValidCPF(cpf)) return showAlert("CPF inválido.");
    if (!senha || senha.length < 8) return showAlert("Senha deve ter pelo menos 8 caracteres.");
    if (senha !== confirmar) return showAlert("As senhas não coincidem.");

    try {
      await window.Auth.register({ email, password: senha, name });

      // login automático depois do cadastro
      await window.Auth.login({ email, password: senha });

      window.location.href = "/minha-equipe.html";
    } catch (e) {
      showAlert(e.message || "Erro ao cadastrar.");
    }
  }

  async function handleLogin(ev) {
    ev.preventDefault();
    hideAlert();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const senha = document.getElementById("login-senha").value;

    if (!email || !senha) return showAlert("Informe email e senha.");

    try {
      await window.Auth.login({ email, password: senha });
      window.location.href = "/minha-equipe.html";
    } catch (e) {
      showAlert(e.message || "Login inválido.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cadastro-form")?.addEventListener("submit", handleRegister);
    document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  });
})();
