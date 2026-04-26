from __future__ import annotations

SCENARIOS = {
    "ev_adoption_30": {
        "label": "What if 30% of Delhi used EVs?",
        "co2_reduced_kg": 2_800_000,
        "aqi_improvement_percent": 18,
        "temp_reduction_c": 0.6,
    },
    "metro_shift_20": {
        "label": "What if 20% of cab rides shifted to metro?",
        "co2_reduced_kg": 1_650_000,
        "aqi_improvement_percent": 13,
        "temp_reduction_c": 0.4,
    },
    "urban_trees_100k": {
        "label": "What if 100k trees were planted?",
        "co2_reduced_kg": 2_200_000,
        "aqi_improvement_percent": 9,
        "temp_reduction_c": 0.3,
    },
}


def run_simulation(scenario_id: str) -> dict:
    scenario = SCENARIOS.get(scenario_id, SCENARIOS["ev_adoption_30"])
    return {"scenario_id": scenario_id, **scenario}
