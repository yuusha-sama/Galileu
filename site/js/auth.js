(function () {
  const BASE = (window.GALILEU_CONFIG && window.GALILEU_CONFIG.AUTH_BASE) || "/api/auth";

  async function request(path, { method = "GET", body = null, headers = {} } = {}) {
    const opts = {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
    };

    if (body !== null) {
      opts.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const res = await fetch(BASE + path, opts);

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }

    if (!res.ok) {
      const msg = (data && (data.detail || data.error)) ? (data.detail || data.error) : `Erro ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  window.GalileuAuth = {
    health: () => request("/"),
    register: (payload) => request("/register/", { method: "POST", body: payload }),
    login: (payload) => request("/login/", { method: "POST", body: payload }),
    me: () => request("/me/", { method: "GET" }),
    logout: () => request("/logout/", { method: "POST", body: {} }),
  };
})();