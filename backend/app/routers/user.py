from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserProfile, UserUpdate, IINSubmit

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Get current user's profile."""
    return UserProfile.model_validate(current_user)


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    await db.commit()
    await db.refresh(current_user)
    return UserProfile.model_validate(current_user)


@router.post("/iin", response_model=UserProfile)
async def submit_iin(
    payload: IINSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit IIN to connect PKB data."""
    iin = payload.iin
    if not iin.isdigit() or len(iin) != 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ИИН должен состоять из 12 цифр",
        )

    # Check if IIN already used by another user
    result = await db.execute(
        select(User).where(User.iin == iin, User.id != current_user.id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Этот ИИН уже привязан к другому аккаунту",
        )

    current_user.iin = iin
    await db.commit()
    await db.refresh(current_user)
    return UserProfile.model_validate(current_user)
