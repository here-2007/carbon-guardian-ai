import { Info } from "lucide-react";
import { useRafNumber } from "../hooks/useRafNumber";

export function CarbonGauge({ score = 620 }) {
  const animated = useRafNumber(score, 1100);
  const normalized = Math.min(Math.max(animated / 1000, 0), 1);
  const circumference = 502;
  const dash = circumference * normalized;

  return (
    <div className="card score-card" data-reveal>
      <h3>Your Carbon Score <span>(Live)</span></h3>
      <div className="gauge-wrap">
        <svg viewBox="0 0 240 140" className="gauge" aria-label="Carbon score gauge">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="48%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path className="gauge-bg" d="M25 120 A95 95 0 0 1 215 120" />
          <path
            className="gauge-value"
            d="M25 120 A95 95 0 0 1 215 120"
            style={{ strokeDasharray: `${dash} ${circumference}` }}
          />
          <path className="gauge-tick" d="M120 28 L120 52" />
          <path className="gauge-tick" d="M58 66 L76 82" />
          <path className="gauge-tick" d="M182 66 L164 82" />
        </svg>
        <div className="gauge-number">
          <strong>{Math.round(animated)}</strong>
          <span>kg CO₂e</span>
        </div>
      </div>
      <p className="impact-label">Moderate Impact <Info size={16} /></p>
      <p className="better">You are better than <b>62%</b> users today</p>
    </div>
  );
}
