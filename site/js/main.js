async function api(path, opts = {}) {
  const res = await fetch(`/api/auth${path}`, {
    ...opts,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    const msg = (data && (data.error || data.detail)) || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function showAlert(msg) {
  const el = document.querySelector("#auth-alert");
  if (!el) {
    alert(msg);
    return;
  }
  el.textContent = msg;
  el.classList.add("show");
}

function clearAlert() {
  const el = document.querySelector("#auth-alert");
  if (!el) return;
  el.textContent = "";
  el.classList.remove("show");
}

function bindRegisterForm() {
  const form = document.querySelector("#cadastro-form");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    clearAlert();

    const email = document.querySelector("#cadastro-email")?.value?.trim();
    const username = document.querySelector("#cadastro-nome")?.value?.trim();
    const password = document.querySelector("#cadastro-senha")?.value || "";
    const confirm = document.querySelector("#cadastro-confirmar")?.value || "";

    if (password !== confirm) {
      showAlert("As senhas não coincidem.");
      return;
    }

    try {
      // CADASTRO
      await api("/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      // LOGIN AUTOMÁTICO
      await api("/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      window.location.href = "/minha-equipe.html";
    } catch (e) {
      showAlert(e.message);
    }
  });
}

function bindLoginForm() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    clearAlert();

    const email = document.querySelector("#login-email")?.value?.trim();
    const password = document.querySelector("#login-senha")?.value || "";

    try {
      await api("/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      window.location.href = "/minha-equipe.html";
    } catch (e) {
      showAlert(e.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindRegisterForm();
  bindLoginForm();
});
