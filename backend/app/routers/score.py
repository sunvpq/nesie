from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.credit_score import CreditScore
from app.models.score_factor import ScoreFactor
from app.schemas.score import ScoreResponse, FactorResponse, ScoreHistory, ScoreHistoryResponse
from app.services.pkb_mock import (
    get_score_from_iin,
    get_factors_from_iin,
    get_score_delta_from_iin,
)

router = APIRouter(prefix="/score", tags=["score"])


def _get_grade(score: int) -> tuple[str, str]:
    """Return (grade_key, grade_label) for a score."""
    if score >= 750:
        return "excellent", "Отличный"
    elif score >= 650:
        return "good", "Хороший"
    elif score >= 550:
        return "fair", "Удовлетворительный"
    elif score >= 450:
        return "poor", "Плохой"
    else:
        return "critical", "Критический"


@router.get("/current", response_model=ScoreResponse)
async def get_current_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current credit score for the authenticated user."""
    if not current_user.iin:
        # Return a placeholder score for users who haven't submitted IIN
        grade, label = _get_grade(0)
        return ScoreResponse(
            score=0,
            delta=0,
            grade=grade,
            grade_label=label,
            fetched_at=datetime.now(timezone.utc),
            factors=[],
        )

    # Check if we have a recent score in DB
    result = await db.execute(
        select(CreditScore)
        .where(CreditScore.user_id == current_user.id)
        .order_by(desc(CreditScore.fetched_at))
        .limit(1)
    )
    credit_score = result.scalar_one_or_none()

    if credit_score:
        # Load factors
        factors_result = await db.execute(
            select(ScoreFactor).where(ScoreFactor.credit_score_id == credit_score.id)
        )
        factors = factors_result.scalars().all()
        factor_list = [
            FactorResponse(
                key=f.key,
                value=f.value,
                impact=f.impact,
                description_ru=f.description_ru or "",
            )
            for f in factors
        ]
        grade, label = _get_grade(credit_score.score)
        return ScoreResponse(
            score=credit_score.score,
            delta=credit_score.delta,
            grade=grade,
            grade_label=label,
            fetched_at=credit_score.fetched_at,
            factors=factor_list,
        )

    # Fetch from PKB mock and save to DB
    score = get_score_from_iin(current_user.iin)
    delta = get_score_delta_from_iin(current_user.iin)
    raw_factors = get_factors_from_iin(current_user.iin)

    new_score = CreditScore(
        user_id=current_user.id,
        score=score,
        delta=delta,
    )
    db.add(new_score)
    await db.flush()

    factor_list = []
    for rf in raw_factors:
        sf = ScoreFactor(
            credit_score_id=new_score.id,
            key=rf["key"],
            value=rf["value"],
            impact=rf["impact"],
            description_ru=rf["description_ru"],
        )
        db.add(sf)
        factor_list.append(
            FactorResponse(
                key=rf["key"],
                value=rf["value"],
                impact=rf["impact"],
                description_ru=rf["description_ru"],
            )
        )

    await db.commit()

    grade, label = _get_grade(score)
    return ScoreResponse(
        score=score,
        delta=delta,
        grade=grade,
        grade_label=label,
        fetched_at=new_score.fetched_at,
        factors=factor_list,
    )


@router.get("/history", response_model=ScoreHistoryResponse)
async def get_score_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get credit score history for the last 12 months."""
    if not current_user.iin:
        return ScoreHistoryResponse(history=[])

    result = await db.execute(
        select(CreditScore)
        .where(CreditScore.user_id == current_user.id)
        .order_by(desc(CreditScore.fetched_at))
        .limit(12)
    )
    scores = result.scalars().all()

    history = [
        ScoreHistory(
            date=s.fetched_at,
            score=s.score,
            delta=s.delta,
        )
        for s in scores
    ]

    # If no history, generate mock history from IIN
    if not history and current_user.iin:
        from app.services.pkb_mock import get_score_from_iin, _seed_from_iin
        from datetime import timedelta
        base_score = get_score_from_iin(current_user.iin)
        seed = _seed_from_iin(current_user.iin)
        now = datetime.now(timezone.utc)
        history = []
        current_s = base_score
        for i in range(6, 0, -1):
            monthly_change = ((seed >> (i * 3)) % 30) - 12
            past_score = max(300, min(850, current_s - monthly_change))
            history.append(ScoreHistory(
                date=now - timedelta(days=30 * i),
                score=past_score,
                delta=monthly_change,
            ))
            current_s = past_score
        history.append(ScoreHistory(date=now, score=base_score, delta=base_score - current_s))

    return ScoreHistoryResponse(history=history)


@router.get("/factors", response_model=List[FactorResponse])
async def get_score_factors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get score factors for the current user."""
    if not current_user.iin:
        return []

    # Get latest score
    result = await db.execute(
        select(CreditScore)
        .where(CreditScore.user_id == current_user.id)
        .order_by(desc(CreditScore.fetched_at))
        .limit(1)
    )
    credit_score = result.scalar_one_or_none()

    if not credit_score:
        raw_factors = get_factors_from_iin(current_user.iin)
        return [
            FactorResponse(
                key=f["key"],
                value=f["value"],
                impact=f["impact"],
                description_ru=f["description_ru"],
            )
            for f in raw_factors
        ]

    factors_result = await db.execute(
        select(ScoreFactor).where(ScoreFactor.credit_score_id == credit_score.id)
    )
    factors = factors_result.scalars().all()
    return [
        FactorResponse(
            key=f.key,
            value=f.value,
            impact=f.impact,
            description_ru=f.description_ru or "",
        )
        for f in factors
    ]
