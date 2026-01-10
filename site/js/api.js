// site/js/api.js
// Wrapper simples para chamar a API do Django via Nginx (/api/*)

async function apiFetch(path, { method = "GET", body = null, headers = {} } = {}) {
  const opts = {
    method,
    credentials: "include", // <-- ESSENCIAL (salva/envia cookie sessionid no browser)
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  };

  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(path, opts);

  // tenta sempre ler JSON; se falhar, cai pra texto
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    const txt = await res.text().catch(() => "");
    data = txt ? { detail: txt } : null;
  }

  if (!res.ok) {
    const msg = (data && (data.detail || data.error)) || `Erro HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
