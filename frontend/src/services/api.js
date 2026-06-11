const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  health() {
    return request("/api/health");
  },

  async uploadImage(file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data;
  },

  imageFromUrl(url) {
    return request("/api/image/url", {
      method: "POST",
      body: JSON.stringify({
        url,
      }),
    });
  },

  startStory(payload) {
    return request("/api/story/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  chat(sessionId, message) {
    return request("/api/story/chat", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        message,
      }),
    });
  },

  getSessions() {
    return request("/api/sessions");
  },

  getSession(sessionId) {
    return request(`/api/session/${sessionId}`);
  },

  deleteSession(sessionId) {
    return request(`/api/session/${sessionId}`, {
      method: "DELETE",
    });
  },

  renameSession(sessionId, title) {
    return request(`/api/session/${sessionId}/rename`, {
      method: "PUT",
      body: JSON.stringify({
        title,
      }),
    });
  },

  getDataset() {
    return request("/api/dataset");
  },

  addDataset(entry) {
    return request("/api/dataset", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  updateDataset(index, entry) {
    return request(`/api/dataset/${index}`, {
      method: "PUT",
      body: JSON.stringify(entry),
    });
  },

  deleteDataset(index) {
    return request(`/api/dataset/${index}`, {
      method: "DELETE",
    });
  },
};
