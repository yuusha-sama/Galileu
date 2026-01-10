(function () {
  function qs(s) { return document.querySelector(s); }

  async function me() {
    const r = await fetch("/api/auth/me/", { credentials: "include" });
    if (!r.ok) return null;
    return await r.json();
  }

  async function logout() {
    await fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }).catch(() => {});
    window.location.href = "/cadastrar.html";
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const user = await me();

    // se não estiver logado, manda pra cadastrar/login
    if (!user || !user.authenticated) {
      window.location.href = "/cadastrar.html";
      return;
    }

    // preenche dados básicos
    const emailEl = qs("#me-email");
    const nameEl = qs("#me-name");
    if (emailEl) emailEl.textContent = user.email || "-";
    if (nameEl) nameEl.textContent = user.name || "-";

    // botão sair local
    const btnLocal = qs("#btn-logout-local");
    if (btnLocal) btnLocal.addEventListener("click", logout);

    // demo: adicionar membro/robô (só frontend por enquanto)
    const membersList = qs("#members-list");
    const robotsList = qs("#robots-list");

    const addMemberBtn = qs("#add-member");
    const memberName = qs("#member-name");
    if (addMemberBtn && memberName && membersList) {
      addMemberBtn.addEventListener("click", () => {
        const n = (memberName.value || "").trim();
        if (!n) return;
        const li = document.createElement("li");
        li.innerHTML = `<span>${n}</span><span>—</span>`;
        membersList.appendChild(li);
        memberName.value = "";
      });
    }

    const addRobotBtn = qs("#add-robot");
    const robotName = qs("#robot-name");
    if (addRobotBtn && robotName && robotsList) {
      addRobotBtn.addEventListener("click", () => {
        const n = (robotName.value || "").trim();
        if (!n) return;
        const li = document.createElement("li");
        li.innerHTML = `<span>${n}</span><span>—</span>`;
        robotsList.appendChild(li);
        robotName.value = "";
      });
    }
  });
})();
