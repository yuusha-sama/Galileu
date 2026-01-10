// site/js/cadastrar.page.js

function showAlert(msg) {
  const el = document.getElementById("auth-alert");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
}

function clearAlert() {
  const el = document.getElementById("auth-alert");
  if (!el) return;
  el.textContent = "";
  el.classList.remove("show");
}

function safeTrim(v) {
  return (v || "").toString().trim();
}

document.addEventListener("DOMContentLoaded", () => {
  // Se já estiver logado, pode mandar direto pra sua página protegida
  Auth.me()
    .then(() => {
      // troque aqui pra sua página real:
      window.location.href = "minha-equipe.html";
    })
    .catch(() => {});

  const loginForm = document.getElementById("login-form");
  const cadastroForm = document.getElementById("cadastro-form");

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();

      const email = safeTrim(document.getElementById("cadastro-email")?.value).toLowerCase();
      const nome = safeTrim(document.getElementById("cadastro-nome")?.value);
      const senha = document.getElementById("cadastro-senha")?.value || "";
      const confirmar = document.getElementById("cadastro-confirmar")?.value || "";

      if (!email || !nome) return showAlert("Preencha email e nome.");
      if (senha.length < 8) return showAlert("A senha deve ter pelo menos 8 caracteres.");
      if (senha !== confirmar) return showAlert("As senhas não conferem.");

      try {
        await Auth.register({ email, password: senha, name: nome });

        // opcional: já loga após cadastrar
        await Auth.login({ email, password: senha });

        window.location.href = "minha-equipe.html";
      } catch (err) {
        showAlert(err.message || "Erro ao cadastrar.");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAlert();

      const email = safeTrim(document.getElementById("login-email")?.value).toLowerCase();
      const senha = document.getElementById("login-senha")?.value || "";

      if (!email || !senha) return showAlert("Preencha email e senha.");

      try {
        await Auth.login({ email, password: senha });
        window.location.href = "minha-equipe.html";
      } catch (err) {
        showAlert(err.message || "Erro ao logar.");
      }
    });
  }
});
