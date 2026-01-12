(() => {
  const TEAM_BASE = "/api/team/"; // Nginx: /api/ -> backend:8000/

  function $(sel) { return document.querySelector(sel); }

  // Tenta achar elementos (ajuste se seus IDs forem diferentes)
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
  };

  let state = {
    exists: false,
    team: {
      name: "",
      slogan: "",
      created_on: "",
      logo_data: "",
      banner_data: "",
      members: [],
      robots: [],
    }
  };

  async function apiGet() {
    const r = await fetch(TEAM_BASE, { credentials: "include" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.detail || "Erro ao buscar equipe");
    return data;
  }

  async function apiSave(payload) {
    const r = await fetch(TEAM_BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.detail || "Erro ao salvar equipe");
    return data;
  }

  function setText(el, value, fallback="-") {
    if (!el) return;
    el.textContent = (value && String(value).trim()) ? value : fallback;
  }

  function render() {
    const t = state.team;

    // banner (background no card)
    if (els.teamCard) {
      if (t.banner_data) {
        els.teamCard.style.backgroundImage = `url('${t.banner_data}')`;
        els.teamCard.style.backgroundSize = "cover";
        els.teamCard.style.backgroundPosition = "center";
      } else {
        els.teamCard.style.backgroundImage = "none";
      }
    }

    // logo
    if (els.teamLogo) {
      if (t.logo_data) els.teamLogo.src = t.logo_data;
      // se não tiver logo_data, deixa como está (pode ser placeholder no HTML)
    }

    setText(els.teamName, t.name);
    // converte YYYY-MM-DD -> DD/MM/YYYY (só pra visual)
    let createdPretty = "-";
    if (t.created_on) {
      const [yy, mm, dd] = t.created_on.split("-");
      if (yy && mm && dd) createdPretty = `${dd}/${mm}/${yy}`;
    }
    setText(els.teamCreated, createdPretty);
    setText(els.teamSlogan, t.slogan);

    // membros
    if (els.memberList) {
      els.memberList.innerHTML = "";
      (t.members || []).forEach((name, idx) => {
        const row = document.createElement("div");
        row.className = "row-item";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.gap = "8px";

        const span = document.createElement("span");
        span.textContent = name;

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "–";
        del.style.border = "none";
        del.style.background = "transparent";
        del.style.cursor = "pointer";
        del.onclick = async () => {
          state.team.members.splice(idx, 1);
          await persist({ members: state.team.members });
        };

        row.appendChild(span);
        row.appendChild(del);
        els.memberList.appendChild(row);
      });
    }

    // robôs
    if (els.robotList) {
      els.robotList.innerHTML = "";
      (t.robots || []).forEach((name, idx) => {
        const row = document.createElement("div");
        row.className = "row-item";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.gap = "8px";

        const span = document.createElement("span");
        span.textContent = name;

        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "–";
        del.style.border = "none";
        del.style.background = "transparent";
        del.style.cursor = "pointer";
        del.onclick = async () => {
          state.team.robots.splice(idx, 1);
          await persist({ robots: state.team.robots });
        };

        row.appendChild(span);
        row.appendChild(del);
        els.robotList.appendChild(row);
      });
    }
  }

  async function persist(payload) {
    const saved = await apiSave(payload);
    state.exists = true;
    state.team = saved.team;
    render();
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ""));
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function openTeamModal() {
    // modal simples gerado via JS (não mexe no layout)
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

    const t = state.team;

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <h3 style="margin:0;">Configurar equipe</h3>
        <button id="closeTeamModal" style="border:none;background:#eee;border-radius:10px;padding:6px 10px;cursor:pointer;">X</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
        <div>
          <label style="font-size:12px;color:#444;">Nome</label>
          <input id="team_name" value="${(t.name || "").replaceAll('"', "&quot;")}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;">
        </div>

        <div>
          <label style="font-size:12px;color:#444;">Criado em</label>
          <input id="team_created" type="date" value="${t.created_on || ""}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;">
        </div>

        <div style="grid-column:1/3;">
          <label style="font-size:12px;color:#444;">Slogan</label>
          <input id="team_slogan" value="${(t.slogan || "").replaceAll('"', "&quot;")}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;">
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
        const created_on = box.querySelector("#team_created").value.trim(); // YYYY-MM-DD
        const slogan = box.querySelector("#team_slogan").value.trim();

        const logoFile = box.querySelector("#team_logo").files[0];
        const bannerFile = box.querySelector("#team_banner").files[0];

        const payload = { name, created_on, slogan };

        if (logoFile) payload.logo_data = await readFileAsDataURL(logoFile);
        if (bannerFile) payload.banner_data = await readFileAsDataURL(bannerFile);

        await persist(payload);
        overlay.remove();
      } catch (e) {
        alert(e.message || "Erro ao salvar");
      }
    };
  }

  async function init() {
    // handlers membros/robôs
    if (els.addMember) {
      els.addMember.addEventListener("click", async () => {
        const v = (els.memberName?.value || "").trim();
        if (!v) return;
        state.team.members = [...(state.team.members || []), v];
        if (els.memberName) els.memberName.value = "";
        await persist({ members: state.team.members });
      });
    }

    if (els.addRobot) {
      els.addRobot.addEventListener("click", async () => {
        const v = (els.robotName?.value || "").trim();
        if (!v) return;
        state.team.robots = [...(state.team.robots || []), v];
        if (els.robotName) els.robotName.value = "";
        await persist({ robots: state.team.robots });
      });
    }

    // editar equipe
    if (els.btnEditTeam) {
      els.btnEditTeam.addEventListener("click", openTeamModal);
    }

    // carrega equipe do backend
    try {
      const data = await apiGet();
      state.exists = !!data.exists;
      state.team = data.team || state.team;
    } catch (e) {
      // se não estiver logado, só não renderiza nada
      console.warn(e);
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
