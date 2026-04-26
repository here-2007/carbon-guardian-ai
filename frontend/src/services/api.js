const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  profile: () => request("/user/profile"),
  liveEnvironment: () => request("/environment/live?location=Delhi"),
  leaderboard: () => request("/community/leaderboard"),
  recommend: (payload) =>
    request("/ai/recommend", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  feedback: (payload) =>
    request("/ai/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  simulation: (scenarioId) => request(`/simulation/run/${scenarioId}`),
};
