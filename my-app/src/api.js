import { API_BASE } from "./conifg"; // fixed typo

const api = {
  get: async (path) => {
    const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  post: async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include"
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  put: async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include"
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  delete: async (path) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export default api;
