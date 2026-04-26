const state = {
  recommendationId: null,
  points: 2450,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function rafNumber({ from = 0, to, duration = 900, onUpdate, decimals = 0 }) {
  let frame = 0;
  let start = 0;
  const tick = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = from + (to - from) * eased;
    onUpdate(Number(value.toFixed(decimals)));
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(`${path} failed`);
  return response.json();
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(() => entry.target.classList.add("is-visible"));
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" },
  );
  $$(".reveal").forEach((node) => observer.observe(node));
}

function animateGauge(score) {
  const gauge = $("#gauge-value");
  const scoreNumber = $("#score-number");
  const circumference = 502;
  rafNumber({
    to: score,
    duration: 1200,
    onUpdate: (value) => {
      scoreNumber.textContent = Math.round(value);
      const dash = circumference * Math.min(value / 1000, 1);
      gauge.style.strokeDasharray = `${dash} ${circumference}`;
    },
  });
}

function animateCounters() {
  $$("[data-count]").forEach((node) => {
    const target = Number(node.dataset.count);
    rafNumber({
      to: target,
      duration: 900,
      decimals: target < 10 ? 1 : 0,
      onUpdate: (value) => {
        node.textContent = target < 10 ? value.toFixed(1) : Math.round(value);
      },
    });
  });
}

function animateChart() {
  const line = $("#chart-line");
  const dots = $("#chart-dots");
  const points = [
    [28, 60],
    [75, 87],
    [122, 62],
    [169, 99],
    [216, 79],
    [263, 92],
    [310, 72],
  ];
  dots.innerHTML = points.map(([x, y]) => `<circle class="chart-dot" cx="${x}" cy="${y}" r="4.5"></circle>`).join("");
  rafNumber({
    to: 1,
    duration: 1100,
    decimals: 3,
    onUpdate: (value) => {
      line.style.strokeDashoffset = String(1 - value);
      $$(".chart-dot").forEach((dot) => {
        dot.style.opacity = value;
      });
    },
  });
}

function renderRewards(rewards) {
  const list = $("#activity-list");
  const rows = rewards.length
    ? rewards
    : [
        { source: "Used Metro", points: 50 },
        { source: "Switched to LED", points: 30 },
        { source: "Avoided Plastic", points: 40 },
        { source: "Cycling", points: 60 },
      ];
  list.innerHTML = "<h4>Recent Activity</h4>" + rows.map((reward) => `<p><span>${reward.source}</span><b>+${reward.points}</b></p>`).join("") + "<a>View All Activities</a>";
}

function updatePoints(next) {
  const previous = state.points;
  state.points = next;
  rafNumber({
    from: previous,
    to: next,
    duration: 700,
    onUpdate: (value) => {
      const formatted = Math.round(value).toLocaleString();
      $("#top-points").textContent = formatted;
      $("#points-total").textContent = formatted;
    },
  });
}

async function loadData() {
  try {
    const [profile, env, recommendation] = await Promise.all([
      api("/user/profile"),
      api("/environment/live?location=Delhi"),
      api("/ai/recommend", {
        method: "POST",
        body: JSON.stringify({ user_id: 1, time_of_day: 17, location_aqi: 118, weather_temp: 32 }),
      }),
    ]);

    $("#profile-name").textContent = profile.name;
    $("#hero-name").textContent = profile.name;
    $("#profile-level").textContent = `Level ${profile.level} · ${profile.persona}`;
    state.points = profile.green_points;
    $("#top-points").textContent = profile.green_points.toLocaleString();
    $("#points-total").textContent = profile.green_points.toLocaleString();
    renderRewards(profile.recent_rewards);

    $("#aqi").textContent = env.aqi;
    $("#co2").textContent = `${env.co2_ppm} ppm`;
    $("#temp").textContent = `${env.temperature_c}°C`;

    state.recommendationId = recommendation.id;
    $("#prediction").textContent = recommendation.prediction;
    $("#recommendation").textContent = `${recommendation.recommendation} today`;
    $("#impact").textContent = `${recommendation.impact_percent}%`;
    $("#confidence").textContent = `${Math.round(recommendation.confidence * 100)}%`;
    $("#status-line").textContent = `AI model: ${recommendation.model}`;
  } catch (error) {
    $("#status-line").textContent = "Backend data fallback active. Refresh after server restart if needed.";
    renderRewards([]);
  }
}

async function acceptChallenge() {
  $("#accept-btn").disabled = true;
  $("#accept-btn").style.opacity = "0.72";
  try {
    const result = await api("/ai/feedback", {
      method: "POST",
      body: JSON.stringify({
        user_id: 1,
        recommendation_id: state.recommendationId || 1,
        accepted: true,
        action_taken: "metro",
      }),
    });
    updatePoints(state.points + result.points_awarded);
    $("#status-line").textContent = `Challenge accepted: +${result.points_awarded} Green Points`;
  } catch {
    updatePoints(state.points + 50);
    $("#status-line").textContent = "Challenge accepted locally: +50 Green Points";
  } finally {
    $("#accept-btn").textContent = "Challenge Accepted";
  }
}

async function runSimulation() {
  const scenario = $("#scenario-select").value;
  const result = await api(`/simulation/run/${scenario}`);
  requestAnimationFrame(() => {
    $("#sim-co2").innerHTML = `${(result.co2_reduced_kg / 1000000).toFixed(1)} <small>Million kg</small>`;
    $("#sim-aqi").textContent = `${result.aqi_improvement_percent}%`;
    $("#sim-temp").textContent = `${result.temp_reduction_c}°C`;
    $(".simulation").animate(
      [
        { transform: "translateY(0) scale(1)", opacity: 1 },
        { transform: "translateY(-4px) scale(1.006)", opacity: 0.96 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      { duration: 320, easing: "ease-out" },
    );
  });
}

function boot() {
  setupReveal();
  animateGauge(620);
  animateCounters();
  animateChart();
  loadData();
  $("#accept-btn").addEventListener("click", acceptChallenge);
  $("#run-simulation").addEventListener("click", runSimulation);
}

boot();
