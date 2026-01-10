(function () {
  const BASE = (window.GALILEU_CONFIG && window.GALILEU_CONFIG.AUTH_BASE) || "/api/auth";

  async function req(path, options = {}) {
    const res = await fetch(BASE + path, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { detail: text }; }

    if (!res.ok) {
      const msg = data && (data.detail || data.error) ? (data.detail || data.error) : `Erro ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  window.GalileuAuth = {
    health: () => req("/"),
    register: (payload) => req("/register/", { method: "POST", body: JSON.stringify(payload) }),
    login: (payload) => req("/login/", { method: "POST", body: JSON.stringify(payload) }),
    me: () => req("/me/", { method: "GET", headers: {} }),
    logout: () => req("/logout/", { method: "POST", body: JSON.stringify({}) }),
  };
})();
