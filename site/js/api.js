const Api = {
  base() {
    return (window.GALILEU_CONFIG && window.GALILEU_CONFIG.API_BASE) ? window.GALILEU_CONFIG.API_BASE : "";
  },

  async request(path, { method = "GET", body = null, headers = {} } = {}) {
    const url = `${this.base()}${path}`;
    const opts = {
      method,
      headers: { ...headers },
      credentials: "include",
    };

    if (body !== null) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const raw = await res.text();

    let data = raw;
    if (ct.includes("application/json")) {
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = { detail: raw }; }
    } else {
      data = { detail: raw };
    }

    if (!res.ok) {
      const err = new Error((data && data.detail) ? data.detail : "Erro na requisição");
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },
};
