import { useEffect, useMemo, useState } from "react";

const values = [710, 500, 695, 402, 565, 452, 620];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyChart() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start = 0;
    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const next = Math.min((timestamp - start) / 1100, 1);
      setProgress(1 - Math.pow(1 - next, 3));
      if (next < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const points = useMemo(() => {
    return values
      .map((value, index) => {
        const x = 28 + index * 47;
        const y = 150 - (value / 1000) * 126;
        return `${x},${y}`;
      })
      .join(" ");
  }, []);

  return (
    <div className="card weekly-card" data-reveal>
      <div className="card-head">
        <h3>Your Weekly Trend</h3>
        <div className="trend-pill">↓ 14% <span>vs last week</span></div>
      </div>
      <div className="chart-unit">kg CO₂e</div>
      <svg className="line-chart" viewBox="0 0 330 190" aria-label="Weekly carbon graph">
        {[0, 1, 2, 3].map((row) => (
          <line key={row} x1="28" x2="312" y1={24 + row * 42} y2={24 + row * 42} className="grid-line" />
        ))}
        {days.map((day, index) => (
          <text key={day} x={28 + index * 47} y="180" textAnchor="middle" className="day-label">
            {day}
          </text>
        ))}
        <polyline
          points={points}
          className="chart-line"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        />
        {values.map((value, index) => {
          const x = 28 + index * 47;
          const y = 150 - (value / 1000) * 126;
          return <circle key={index} cx={x} cy={y} r="4.5" className="chart-dot" style={{ opacity: progress }} />;
        })}
        <g style={{ opacity: progress }}>
          <rect x="295" y="41" width="38" height="22" rx="7" className="last-badge" />
          <text x="314" y="56" textAnchor="middle" className="last-text">620</text>
        </g>
      </svg>
    </div>
  );
}
