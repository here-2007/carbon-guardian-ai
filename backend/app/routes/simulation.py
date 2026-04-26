from __future__ import annotations

from fastapi import APIRouter

from app.services.simulation import SCENARIOS, run_simulation

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.get("/scenarios")
def scenarios() -> dict:
    return {"items": [{"id": key, "label": value["label"]} for key, value in SCENARIOS.items()]}


@router.get("/run/{scenario_id}")
def run(scenario_id: str) -> dict:
    return run_simulation(scenario_id)
