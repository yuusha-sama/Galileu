// site/js/api.js
(function () {
  const BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "/api";

  async function request(path, { method = "GET", body = null, headers = {} } = {}) {
    const opts = {
      method,
      credentials: "include",
      headers: {
        ...headers,
      },
    };

    if (body !== null) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE}${path}`, opts);

    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const msg =
        (data && data.detail) ||
        (typeof data === "string" && data) ||
        `Erro ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  window.API = {
    get: (p) => request(p),
    post: (p, b) => request(p, { method: "POST", body: b }),
  };
})();
