(() => {
  const API = {
    teamMe: "/api/teams/me/",
    members: "/api/teams/members/",
    robots: "/api/teams/robots/",
    authMe: "/api/auth/me/",
    authProfile: "/api/auth/profile/",
    authLogout: "/api/auth/logout/",
  };

  const $ = (sel) => document.querySelector(sel);

  const els = {
    teamCard: $("#teamCard"),
    teamLogo: $("#teamLogo"),
    teamName: $("#teamName"),
    teamCreated: $("#teamCreated"),
    teamSlogan: $("#teamSlogan"),
    btnEditTeam: $("#btnEditTeam"),

    memberList: $("#memberList"),
    memberName: $("#memberName"),
    addMember: $("#addMember"),

    robotList: $("#robotList"),
    robotName: $("#robotName"),
    addRobot: $("#addRobot"),

    profilePhoto: $("#profilePhoto"),
    btnEditPhoto: $("#btnEditPhoto"),

    meEmail: $("#me-email"),
    meNome: $("#me-nome"),
    meNascimento: $("#me-nascimento"),
    meCpf: $("#me-cpf"),

    btnSair: $("#btn-sair"),
  };

  const state = {
    team: { name: "", slogan: "", created_date: "", logo_data: "", banner_data: "" },
    members: [],
    robots: [],
    me: {},
  };

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function toBRDate(iso) {
    const v = (iso || "").trim();
    if (!v) return "-";
    const [yy, mm, dd] = v.split("-");
    if (!yy || !mm || !dd) return "-";
    return `${dd}/${mm}/${yy}`;
  }

  function setText(el, value, fallback = "-") {
    if (!el) return;
    const v = (value ?? "").toString().trim();
    el.textContent = v ? v : fallback;
  }

  async function request(url, opts = {}) {
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text };
    }

    if (!res.ok) {
      throw new Error((data && data.detail) || `Erro ${res.status}`);
    }
    return data;
  }

  async function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ""));
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  async function loadMe() {
    const me = await request(API.authMe, { method: "GET", headers: {} });
    state.me = me;

    setText(els.meEmail, me.email);
    setText(els.meNome, me.name);
    setText(els.meNascimento, me.birthdate ? toBRDate(me.birthdate) : "-");
    setText(els.meCpf, me.cpf || "-");

    if (els.profilePhoto && me.photo_data) {
      els.profilePhoto.src = me.photo_data;
    }
  }

  async function loadTeam() {
    const data = await request(API.teamMe, { method: "GET", headers: {} });
    state.team = data.team || state.team;
    state.members = data.members || [];
    state.robots = data.robots || [];
  }

  function renderTeam() {
    const t = state.team;

    if (els.teamCard) {
      if (t.banner_data) {
        els.teamCard.style.backgroundImage = `url('${t.banner_data}')`;
        els.teamCard.style.backgroundSize = "cover";
        els.teamCard.style.backgroundPosition = "center";
      } else {
        els.teamCard.style.backgroundImage = "none";
      }
    }

    if (els.teamLogo && t.logo_data) els.teamLogo.src = t.logo_data;

    setText(els.teamName, t.name);
    setText(els.teamCreated, toBRDate(t.created_date));
    setText(els.teamSlogan, t.slogan);

    if (els.memberList) {
      els.memberList.innerHTML = "";
      state.members.forEach((m) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.justifyContent = "space-between";
        li.style.gap = "10px";

        const name = document.createElement("span");
        name.textContent = m.name;

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "–";
        del.title = "Remover";
        del.style.border = "none";
        del.style.background = "transparent";
        del.style.cursor = "pointer";
        del.style.fontSize = "20px";

        del.onclick = async () => {
          await request(`${API.members}${m.id}/`, { method: "DELETE" });
          await refresh();
        };

        li.appendChild(name);
        li.appendChild(del);
        els.memberList.appendChild(li);
      });
    }

    if (els.robotList) {
      els.robotList.innerHTML = "";
      state.robots.forEach((r) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.justifyContent = "space-between";
        li.style.gap = "10px";

        const name = document.createElement("span");
        name.textContent = r.name;

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "–";
        del.title = "Remover";
        del.style.border = "none";
        del.style.background = "transparent";
        del.style.cursor = "pointer";
        del.style.fontSize = "20px";

        del.onclick = async () => {
          await request(`${API.robots}${r.id}/`, { method: "DELETE" });
          await refresh();
        };

        li.appendChild(name);
        li.appendChild(del);
        els.robotList.appendChild(li);
      });
    }
  }

  async function refresh() {
    await loadMe();
    await loadTeam();
    renderTeam();
  }

  function openTeamModal() {
    const t = state.team;

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,.55)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const box = document.createElement("div");
    box.style.width = "min(680px, 92vw)";
    box.style.background = "#fff";
    box.style.borderRadius = "14px";
    box.style.padding = "18px";
    box.style.boxShadow = "0 10px 40px rgba(0,0,0,.35)";

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <h3 style="margin:0;">Configurar equipe</h3>
        <button id="closeTeamModal" style="border:none;background:#eee;border-radius:10px;padding:6px 10px;cursor:pointer;">X</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
        <div>
          <label style="font-size:12px;color:#444;">Nome</label>
          <input id="team_name" value="${escapeHtml(t.name)}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;">
        </div>

        <div>
          <label style="font-size:12px;color:#444;">Criado em</label>
          <input id="team_created" type="date" value="${escapeHtml(t.created_date)}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;">
        </div>

        <div style="grid-column:1/3;">
          <label style="font-size:12px;color:#444;">Slogan</label>
          <input id="team_slogan" value="${escapeHtml(t.slogan)}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;">
        </div>

        <div>
          <label style="font-size:12px;color:#444;">Logo (imagem)</label>
          <input id="team_logo" type="file" accept="image/*" style="width:100%;">
        </div>

        <div>
          <label style="font-size:12px;color:#444;">Banner (imagem)</label>
          <input id="team_banner" type="file" accept="image/*" style="width:100%;">
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
        <button id="cancelTeam" style="border:none;background:#eee;border-radius:12px;padding:10px 14px;cursor:pointer;">Cancelar</button>
        <button id="saveTeam" style="border:none;background:#ff7a00;color:#fff;border-radius:12px;padding:10px 14px;cursor:pointer;">Salvar</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector("#closeTeamModal").onclick = () => overlay.remove();
    box.querySelector("#cancelTeam").onclick = () => overlay.remove();

    box.querySelector("#saveTeam").onclick = async () => {
      try {
        const name = box.querySelector("#team_name").value.trim();
        const created_date = box.querySelector("#team_created").value.trim();
        const slogan = box.querySelector("#team_slogan").value.trim();

        const logoFile = box.querySelector("#team_logo").files[0];
        const bannerFile = box.querySelector("#team_banner").files[0];

        const payload = { name, slogan, created_date };
        if (logoFile) payload.logo_data = await readFileAsDataURL(logoFile);
        if (bannerFile) payload.banner_data = await readFileAsDataURL(bannerFile);

        await request(API.teamMe, { method: "POST", body: JSON.stringify(payload) });
        await refresh();
        overlay.remove();
      } catch (e) {
        alert(e.message || "Erro ao salvar equipe");
      }
    };
  }

  function openPhotoModal() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,.55)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const box = document.createElement("div");
    box.style.width = "min(520px, 92vw)";
    box.style.background = "#fff";
    box.style.borderRadius = "14px";
    box.style.padding = "18px";
    box.style.boxShadow = "0 10px 40px rgba(0,0,0,.35)";

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <h3 style="margin:0;">Atualizar foto</h3>
        <button id="closePhotoModal" style="border:none;background:#eee;border-radius:10px;padding:6px 10px;cursor:pointer;">X</button>
      </div>

      <div style="margin-top:14px;">
        <input id="profile_photo" type="file" accept="image/*" style="width:100%;">
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
        <button id="cancelPhoto" style="border:none;background:#eee;border-radius:12px;padding:10px 14px;cursor:pointer;">Cancelar</button>
        <button id="savePhoto" style="border:none;background:#ff7a00;color:#fff;border-radius:12px;padding:10px 14px;cursor:pointer;">Salvar</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector("#closePhotoModal").onclick = () => overlay.remove();
    box.querySelector("#cancelPhoto").onclick = () => overlay.remove();

    box.querySelector("#savePhoto").onclick = async () => {
      try {
        const file = box.querySelector("#profile_photo").files[0];
        if (!file) return;
        const photo_data = await readFileAsDataURL(file);

        await request(API.authProfile, {
          method: "POST",
          body: JSON.stringify({ photo_data }),
        });

        await refresh();
        overlay.remove();
      } catch (e) {
        alert(e.message || "Erro ao salvar foto");
      }
    };
  }

  function wireHandlers() {
    els.addMember?.addEventListener("click", async () => {
      const name = (els.memberName?.value || "").trim();
      if (!name) return;
      try {
        await request(API.members, { method: "POST", body: JSON.stringify({ name }) });
        els.memberName.value = "";
        await refresh();
      } catch (e) {
        alert(e.message || "Erro ao adicionar membro");
      }
    });

    els.addRobot?.addEventListener("click", async () => {
      const name = (els.robotName?.value || "").trim();
      if (!name) return;
      try {
        await request(API.robots, { method: "POST", body: JSON.stringify({ name }) });
        els.robotName.value = "";
        await refresh();
      } catch (e) {
        alert(e.message || "Erro ao adicionar robô");
      }
    });

    els.btnEditTeam?.addEventListener("click", openTeamModal);
    els.btnEditPhoto?.addEventListener("click", openPhotoModal);

    els.btnSair?.addEventListener("click", async () => {
      try {
        await request(API.authLogout, { method: "POST", body: "{}" });
      } catch {}
      window.location.href = "/index.html";
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    wireHandlers();
    try {
      await refresh();
    } catch (e) {
      // se não estiver logado, vai aparecer "Não autenticado" quando tentar salvar
      console.warn(e);
    }
  });
})();
