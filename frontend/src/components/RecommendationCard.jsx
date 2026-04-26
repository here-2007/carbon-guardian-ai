import { Bot, TrainFront } from "lucide-react";

export function RecommendationCard({ recommendation, onAccept }) {
  return (
    <div className="card ai-card" data-reveal>
      <h3><Bot size={24} /> AI Recommendation for You</h3>
      <div className="ai-panel">
        <p className="prediction">{recommendation.prediction}</p>
        <div className="choice">
          <TrainFront size={44} />
          <div>
            <strong>{recommendation.recommendation} today</strong>
            <p>You’ll save <b>{recommendation.impact_percent}%</b> emissions with {Math.round(recommendation.confidence * 100)}% model confidence.</p>
            <button onClick={onAccept}>Accept Challenge</button>
          </div>
        </div>
        <a href="#simulation">See other options</a>
      </div>
    </div>
  );
}
