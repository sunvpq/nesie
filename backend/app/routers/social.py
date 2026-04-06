from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.credit_score import CreditScore
from app.services.pkb_mock import get_score_from_iin, _seed_from_iin
from typing import List
from pydantic import BaseModel
import hashlib

router = APIRouter(prefix="/social", tags=["social"])


class LeaderboardEntry(BaseModel):
    rank: int
    initials: str
    score: int
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    current_user_rank: int
    total_friends: int


def _get_initials(name: str | None, phone: str) -> str:
    """Get 2-letter initials from name or phone."""
    if name and len(name.strip()) >= 2:
        parts = name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        return name[:2].upper()
    # Use last 2 digits of phone
    return phone[-2:] if len(phone) >= 2 else "??"


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get leaderboard of friends (mock data for MVP)."""
    # Generate mock friends leaderboard based on current user's IIN/phone seed
    seed_str = current_user.iin or current_user.phone
    seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)

    # Current user score
    if current_user.iin:
        my_score = get_score_from_iin(current_user.iin)
    else:
        # Get from DB
        result = await db.execute(
            select(CreditScore)
            .where(CreditScore.user_id == current_user.id)
            .order_by(desc(CreditScore.fetched_at))
            .limit(1)
        )
        cs = result.scalar_one_or_none()
        my_score = cs.score if cs else 650

    # Generate 11 mock friends
    MOCK_NAMES = [
        "Айдана К.", "Берик М.", "Гульнара Т.", "Данияр Р.",
        "Еркебулан С.", "Жанар Б.", "Зарина Н.", "Ибрагим О.",
        "Карина П.", "Лариса Д.", "Мурат Х.",
    ]

    friends = []
    for i, name in enumerate(MOCK_NAMES):
        friend_seed = (seed >> (i * 3)) & 0xFFFFFFFF
        friend_score = (friend_seed % 400) + 420  # 420-820 range
        initials = (name[0] + name.split(".")[0][-1]).upper() if len(name) > 2 else name[:2]
        friends.append({"name": name, "score": friend_score, "initials": initials})

    # Add current user
    my_initials = _get_initials(current_user.full_name, current_user.phone)
    all_entries = friends + [{"name": "Вы", "score": my_score, "initials": my_initials, "is_me": True}]

    # Sort by score descending
    all_entries.sort(key=lambda x: x["score"], reverse=True)

    entries = []
    my_rank = 1
    for rank, entry in enumerate(all_entries, 1):
        is_me = entry.get("is_me", False)
        if is_me:
            my_rank = rank
        entries.append(LeaderboardEntry(
            rank=rank,
            initials=entry["initials"],
            score=entry["score"],
            is_current_user=is_me,
        ))

    return LeaderboardResponse(
        entries=entries[:12],
        current_user_rank=my_rank,
        total_friends=len(friends),
    )
