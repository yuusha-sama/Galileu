// site/js/auth.js

const Auth = {
  async register({ email, password, name }) {
    return apiFetch("/api/auth/register/", {
      method: "POST",
      body: { email, password, name },
    });
  },

  async login({ email, password }) {
    return apiFetch("/api/auth/login/", {
      method: "POST",
      body: { email, password },
    });
  },

  async me() {
    return apiFetch("/api/auth/me/", { method: "GET" });
  },

  async logout() {
    return apiFetch("/api/auth/logout/", { method: "POST" });
  },
};
