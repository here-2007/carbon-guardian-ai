from __future__ import annotations

ACTION_POINTS = {
    "metro": 50,
    "cycling": 60,
    "walk": 45,
    "bus": 35,
    "led": 30,
    "avoid_plastic": 40,
}


def points_for_action(action: str) -> int:
    return ACTION_POINTS.get(action.lower(), 20)
