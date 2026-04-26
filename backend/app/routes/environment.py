from __future__ import annotations

from fastapi import APIRouter

from app.services.external import live_environment

router = APIRouter(prefix="/environment", tags=["environment"])


@router.get("/live")
async def live(location: str = "Delhi") -> dict:
    return await live_environment(location)
