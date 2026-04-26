from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.database import get_db
from app.services.emissions import calculate_emission

router = APIRouter(prefix="/emission", tags=["emission"])


class EmissionIn(BaseModel):
    user_id: int = 1
    transport_mode: str
    distance_km: float
    electricity_kwh: float
    waste_kg: float


@router.post("/calculate")
def calculate(payload: EmissionIn) -> dict:
    result = calculate_emission(
        payload.transport_mode,
        payload.distance_km,
        payload.electricity_kwh,
        payload.waste_kg,
    )
    with get_db() as db:
        db.execute(
            """
            INSERT INTO emissions_log (user_id, transport_kg, electricity_kg, waste_kg, total_kg)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                payload.user_id,
                result["transport_kg"],
                result["electricity_kg"],
                result["waste_kg"],
                result["total_kg"],
            ),
        )
    return result
