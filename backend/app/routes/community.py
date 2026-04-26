from __future__ import annotations

from fastapi import APIRouter

from app.database import get_db

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/leaderboard")
def leaderboard() -> dict:
    with get_db() as db:
        rows = db.execute("SELECT * FROM community_groups ORDER BY rank ASC").fetchall()
        return {"groups": [dict(row) for row in rows]}
