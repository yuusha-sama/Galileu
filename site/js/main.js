// site/js/main.js

const API_BASE = "/api";

function showAlert(msg) {
  const el = document.getElementById("auth-alert");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 4000);
}

async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include", // cookies de sessão
  });

  let data = null;
  try { data = await res.json(); } catch (e) {}

  if (!res.ok) {
    const detail = data?.detail || `Erro ${res.status}`;
    throw new Error(detail);
  }
  return data;
}

document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastro-form");
  const loginForm = document.getElementById("login-form");

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("cadastro-email").value.trim();
      const name = document.getElementById("cadastro-nome").value.trim();
      const senha = document.getElementById("cadastro-senha").value;
      const confirmar = document.getElementById("cadastro-confirmar").value;

      if (senha !== confirmar) {
        showAlert("As senhas não conferem.");
        return;
      }

      try {
        await apiPost("/auth/register/", { email, password: senha, name });
        showAlert("Cadastro feito! Agora faça login.");
        cadastroForm.reset();
      } catch (err) {
        showAlert(err.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const senha = document.getElementById("login-senha").value;

      try {
        await apiPost("/auth/login/", { email, password: senha });
        // depois do login, vai pra Minha Equipe
        window.location.href = "/minha-equipe.html";
      } catch (err) {
        showAlert(err.message);
      }
    });
  }
});
