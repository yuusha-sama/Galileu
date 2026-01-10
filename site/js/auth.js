// site/js/auth.js
(function () {
  async function me() {
    try {
      return await window.API.get("/auth/me/");
    } catch (e) {
      return { authenticated: false };
    }
  }

  async function register({ email, password, name }) {
    return await window.API.post("/auth/register/", { email, password, name });
  }

  async function login({ email, password }) {
    return await window.API.post("/auth/login/", { email, password });
  }

  async function logout() {
    return await window.API.post("/auth/logout/", {});
  }

  window.Auth = { me, register, login, logout };
})();
