(function () {
  const BASE = (window.GALILEU_CONFIG && window.GALILEU_CONFIG.AUTH_BASE) || "/api/auth";

  async function request(path, opts = {}) {
    const method = (opts.method || "GET").toUpperCase();
    const headers = { ...(opts.headers || {}) };

    const hasBody = Object.prototype.hasOwnProperty.call(opts, "body") && opts.body !== undefined;
    const options = {
      method,
      credentials: "include",
      headers,
    };

    if (hasBody) {
      options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
      options.body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
    }

    const res = await fetch(BASE + path, options);
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text };
    }

    if (!res.ok) {
      const msg = (data && (data.detail || data.error)) ? (data.detail || data.error) : `Erro ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  window.GalileuAuth = {
    health: () => request("/"),
    register: (payload) => request("/register/", { method: "POST", body: payload }),
    login: (payload) => request("/login/", { method: "POST", body: payload }),
    me: () => request("/me/"),
    logout: () => request("/logout/", { method: "POST", body: {} }),
  };
})();