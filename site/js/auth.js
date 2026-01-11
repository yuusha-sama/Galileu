(function () {
  const BASE =
    (window.GALILEU_CONFIG && window.GALILEU_CONFIG.AUTH_BASE) || "/api/auth";

  async function req(path, { method = "GET", body = null, headers = {} } = {}) {
    const opts = {
      method,
      credentials: "include",
      headers: { ...headers },
    };

    if (body !== null) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(BASE + path, opts);

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text };
    }

    if (!res.ok) {
      const msg =
        (data && (data.detail || data.error)) ? (data.detail || data.error) : `Erro ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  window.GalileuAuth = {
    health: () => req("/"),
    register: (payload) => req("/register/", { method: "POST", body: payload }),
    login: (payload) => req("/login/", { method: "POST", body: payload }),
    me: () => req("/me/"),
    logout: () => req("/logout/", { method: "POST", body: {} }),
  };
})();
