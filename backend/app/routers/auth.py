from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models.user import User
from app.models.otp import OTPCode
from app.schemas.auth import PhoneSendOTP, VerifyOTP, Token, TokenRefresh
from app.services.auth_service import (
    generate_otp,
    send_otp_sms,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp", status_code=200)
async def send_otp(payload: PhoneSendOTP, db: AsyncSession = Depends(get_db)):
    """Send OTP code to phone number. In dev mode, code is always 123456."""
    phone = payload.phone

    # Get or create user
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    if not user:
        user = User(phone=phone)
        db.add(user)
        await db.flush()

    # Invalidate old OTP codes for this phone
    old_codes = await db.execute(
        select(OTPCode).where(OTPCode.phone == phone, OTPCode.is_used == False)
    )
    for old_code in old_codes.scalars().all():
        old_code.is_used = True

    # Generate new OTP
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    otp = OTPCode(
        user_id=user.id,
        phone=phone,
        code=code,
        expires_at=expires_at,
    )
    db.add(otp)
    await db.commit()

    # Send SMS (no-op in dev)
    await send_otp_sms(phone, code)

    return {
        "message": "Код отправлен",
        "phone": phone,
        "expires_in_seconds": 300,
    }


@router.post("/verify-otp", response_model=Token)
async def verify_otp(payload: VerifyOTP, db: AsyncSession = Depends(get_db)):
    """Verify OTP and return JWT tokens."""
    phone = payload.phone
    code = payload.code

    # Find valid OTP
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.phone == phone,
            OTPCode.code == code,
            OTPCode.is_used == False,
        )
    )
    otp = result.scalar_one_or_none()

    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный код подтверждения",
        )

    if otp.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Код подтверждения истёк. Запросите новый код.",
        )

    # Mark OTP as used
    otp.is_used = True

    # Get user
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    is_new_user = False
    if not user:
        user = User(phone=phone)
        db.add(user)
        await db.flush()
        is_new_user = True
    else:
        is_new_user = user.iin is None

    await db.commit()

    # Create tokens
    token_data = {"sub": str(user.id), "phone": user.phone}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        is_new_user=is_new_user,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(payload: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    token_payload = verify_refresh_token(payload.refresh_token)
    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный refresh token",
        )

    user_id = token_payload.get("sub")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден или заблокирован",
        )

    token_data = {"sub": str(user.id), "phone": user.phone}
    access_token = create_access_token(token_data)
    refresh_token_new = create_refresh_token(token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_new,
        token_type="bearer",
        is_new_user=False,
    )
