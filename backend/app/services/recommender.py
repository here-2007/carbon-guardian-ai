from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from sqlite3 import Connection

from app.services.emissions import reduction_percent


ECO_ALTERNATIVES = {
    "cab": "metro",
    "car": "metro",
    "bus": "metro",
    "metro": "cycling",
    "cycling": "walk",
    "walk": "walk",
    "none": "metro",
}


@dataclass
class RecommendationResult:
    prediction: str
    recommendation: str
    impact_percent: int
    confidence: float
    model: str


class BehaviorRankingModel:
    def __init__(self, rows: list[dict]) -> None:
        self.hour_mode_counts: dict[int, Counter[str]] = defaultdict(Counter)
        self.global_counts: Counter[str] = Counter()
        self.feedback_boosts: Counter[str] = Counter()
        for row in rows:
            mode = row["transport_mode"] or "none"
            hour_bucket = int(row["time_of_day"]) // 3
            self.hour_mode_counts[hour_bucket][mode] += 1
            self.global_counts[mode] += 1

    def predict_mode(self, hour: int) -> tuple[str, float]:
        bucket = hour // 3
        counts = self.hour_mode_counts.get(bucket) or self.global_counts
        if not counts:
            return "car", 0.42
        total = sum(counts.values())
        mode, count = counts.most_common(1)[0]
        return mode, round(count / total, 2)

    def best_alternative(self, predicted_mode: str, aqi: int, weather_temp: float) -> str:
        if predicted_mode in {"cab", "car"} and aqi >= 110:
            return "metro"
        if weather_temp <= 31 and predicted_mode in {"metro", "bus"}:
            return "cycling"
        return ECO_ALTERNATIVES.get(predicted_mode, "metro")


class RecommendationEngine:
    def __init__(self, db: Connection) -> None:
        self.db = db

    def recommend(self, user_id: int, time_of_day: int, location_aqi: int, weather_temp: float) -> RecommendationResult:
        rows = [
            dict(row)
            for row in self.db.execute(
                "SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 250",
                (user_id,),
            ).fetchall()
        ]

        try:
            from app.ml.tfrs_model import CarbonTFRSModel

            ranked = CarbonTFRSModel().rank(
                {
                    "time_of_day": time_of_day,
                    "location_aqi": location_aqi,
                    "weather_temp": weather_temp,
                    "history": rows,
                }
            )
            learned = BehaviorRankingModel(rows)
            predicted, confidence = learned.predict_mode(time_of_day)
            recommendation = ranked[0].replace("take ", "")
            model = "tensorflow-recommenders-ranking"
        except Exception:
            learned = BehaviorRankingModel(rows)
            predicted, confidence = learned.predict_mode(time_of_day)
            recommendation = learned.best_alternative(predicted, location_aqi, weather_temp)
            model = "sqlite-behavior-ranking"

        impact = reduction_percent(predicted, recommendation)
        return RecommendationResult(
            prediction=f"You will likely take {predicted} around {time_of_day}:00",
            recommendation=f"Take {recommendation}",
            impact_percent=impact,
            confidence=confidence,
            model=model,
        )
