import {
  Bell,
  Bot,
  Car,
  CheckSquare,
  ChevronDown,
  CloudSun,
  Gift,
  Home,
  Leaf,
  Menu,
  Search,
  Settings,
  Store,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CarbonGauge } from "./components/CarbonGauge.jsx";
import { RecommendationCard } from "./components/RecommendationCard.jsx";
import { SimulationLab } from "./components/SimulationLab.jsx";
import { WeeklyChart } from "./components/WeeklyChart.jsx";
import { useRafNumber } from "./hooks/useRafNumber.js";
import { useReveal } from "./hooks/useReveal.js";
import { api } from "./services/api.js";

const nav = [
  [Home, "Dashboard"],
  [Leaf, "My Footprint"],
  [Bot, "AI Recommender"],
  [CloudSun, "Live Impact"],
  [Trophy, "Green Points"],
  [Users, "Community"],
  [Store, "Marketplace"],
  [CheckSquare, "Simulation Lab"],
  [Settings, "Settings"],
];

const fallback = {
  profile: { name: "Aarav", level: 7, persona: "Eco Warrior", green_points: 2450, recent_rewards: [] },
  environment: { aqi: 118, co2_ppm: 412, temperature_c: 32 },
  recommendation: {
    id: 1,
    prediction: "You will likely take cab around 17:00",
    recommendation: "Take metro",
    impact_percent: 63,
    confidence: 0.78,
  },
  scenario: {
    scenario_id: "ev_adoption_30",
    co2_reduced_kg: 2800000,
    aqi_improvement_percent: 18,
    temp_reduction_c: 0.6,
  },
};

function Stat({ icon: Icon, value, label, tone }) {
  const animated = useRafNumber(value, 900);
  return (
    <div className={`impact-stat ${tone}`}>
      <div><Icon size={36} /></div>
      <b>{value < 10 ? animated.toFixed(1) : Math.round(animated)}</b>
      <span>{label}</span>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(fallback.profile);
  const [environment, setEnvironment] = useState(fallback.environment);
  const [recommendation, setRecommendation] = useState(fallback.recommendation);
  const [scenario, setScenario] = useState(fallback.scenario);
  const [scenarioId, setScenarioId] = useState("ev_adoption_30");
  const [notice, setNotice] = useState("Live model connected");

  useReveal();

  useEffect(() => {
    Promise.allSettled([
      api.profile(),
      api.liveEnvironment(),
      api.recommend({ user_id: 1, time_of_day: 17, location_aqi: 118, weather_temp: 32 }),
      api.simulation("ev_adoption_30"),
    ]).then(([profileResult, envResult, recResult, simResult]) => {
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (envResult.status === "fulfilled") setEnvironment(envResult.value);
      if (recResult.status === "fulfilled") setRecommendation(recResult.value);
      if (simResult.status === "fulfilled") setScenario(simResult.value);
      if ([profileResult, envResult, recResult, simResult].some((result) => result.status === "rejected")) {
        setNotice("Backend offline: showing seeded local preview");
      }
    });
  }, []);

  const rewards = useMemo(
    () =>
      profile.recent_rewards?.length
        ? profile.recent_rewards
        : [
            { source: "Used Metro", points: 50 },
            { source: "Switched to LED", points: 30 },
            { source: "Avoided Plastic", points: 40 },
            { source: "Cycling", points: 60 },
          ],
    [profile],
  );

  const acceptChallenge = async () => {
    setProfile((current) => ({ ...current, green_points: current.green_points + 50 }));
    setNotice("Challenge accepted: +50 Green Points");
    try {
      await api.feedback({
        user_id: 1,
        recommendation_id: recommendation.id,
        accepted: true,
        action_taken: "metro",
      });
    } catch {
      setNotice("Challenge saved locally until backend reconnects");
    }
  };

  const runSimulation = async () => {
    const result = await api.simulation(scenarioId).catch(() => fallback.scenario);
    requestAnimationFrame(() => setScenario(result));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="planet">🌍</div>
          <h1>Carbon<br />Guardian AI</h1>
        </div>
        <nav>
          {nav.map(([Icon, label], index) => (
            <button key={label} className={index === 0 ? "active" : ""}>
              <Icon size={22} />
              <span>{label}</span>
              {label === "Community" && <em>New</em>}
            </button>
          ))}
        </nav>
        <div className="tip">
          <strong>Today’s Tip</strong>
          <p>Using metro instead of car today can save <b>2.4 kg CO₂</b></p>
          <button>Know More</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <Menu size={28} />
          <label className="search">
            <Search size={19} />
            <input placeholder="Search anything..." />
          </label>
          <Bell size={23} />
          <div className="points-pill"><Bot size={21} /> <span>Green Points<br /><b>{profile.green_points.toLocaleString()}</b></span></div>
          <div className="profile">
            <div className="avatar">A</div>
            <span>Hi, {profile.name}<br /><small>Level {profile.level} · {profile.persona}</small></span>
            <ChevronDown size={17} />
          </div>
        </header>

        <section className="hero-row">
          <div>
            <h2>Good Morning, {profile.name}! 👋</h2>
            <p>Together, let’s build a cooler and greener planet.</p>
          </div>
          <div className="live-strip">
            <span>Live City AQI <b>{environment.aqi}</b> <em>Unhealthy</em></span>
            <span>CO₂ in Air <b>{environment.co2_ppm} ppm</b></span>
            <span>Temperature <b>{environment.temperature_c}°C</b></span>
          </div>
        </section>

        <div className="status-line">{notice}</div>

        <section className="dashboard-grid">
          <CarbonGauge score={620} />
          <RecommendationCard recommendation={recommendation} onAccept={acceptChallenge} />
          <div className="card impact-card" data-reveal>
            <h3>Today’s Impact</h3>
            <p>You’ve made a difference!</p>
            <div className="impact-row">
              <Stat icon={Car} value={12.4} label="Travel Emissions Saved" tone="green" />
              <Stat icon={Zap} value={3.6} label="Energy Saved kWh" tone="yellow" />
              <Stat icon={Leaf} value={1.2} label="Waste Reduced kg" tone="green" />
            </div>
          </div>
          <WeeklyChart />
          <div className="card community-card" data-reveal>
            <div className="card-head">
              <h3>Community Impact</h3>
              <a>View All</a>
            </div>
            <p>Your College Community</p>
            <div className="community-panel">
              <div className="tree">🌳</div>
              <div>
                <span>Your community reduced</span>
                <strong>120 kg CO₂</strong>
                <p>this week</p>
              </div>
              <Trophy className="trophy" size={44} />
            </div>
            <b className="rank">Rank #3 out of 12 communities</b>
            <div className="progress"><span /></div>
          </div>
          <div className="card rewards-card" data-reveal>
            <div>
              <h3>Green Points</h3>
              <strong><Leaf size={29} /> {profile.green_points.toLocaleString()}</strong>
              <span>Total Green Points</span>
              <button>Redeem Now</button>
            </div>
            <div className="activity-list">
              <h4>Recent Activity</h4>
              {rewards.map((reward) => (
                <p key={reward.source}><span>{reward.source}</span><b>+{reward.points}</b></p>
              ))}
              <a>View All Activities</a>
            </div>
          </div>
          <SimulationLab
            scenario={scenario}
            selectedScenarioId={scenarioId}
            onScenarioChange={setScenarioId}
            onRun={runSimulation}
          />
          <div className="card marketplace" data-reveal>
            <h3>Local Action Marketplace</h3>
            <p>Join hands with real changemakers</p>
            <div className="campaigns">
              <button>🌳<span>Tree Plantation</span><small>Join Now</small></button>
              <button>💚<span>Donate</span><small>Support Projects</small></button>
              <button>🤝<span>Volunteer</span><small>Make Impact</small></button>
            </div>
            <a>View All Campaigns →</a>
          </div>
        </section>
      </main>
    </div>
  );
}
