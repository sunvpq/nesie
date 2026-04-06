from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
import secrets
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEVELOPMENT_OTP = "123456"


def generate_otp() -> str:
    """Generate a 6-digit OTP code. In dev mode always returns 123456."""
    if settings.DEBUG:
        return DEVELOPMENT_OTP
    return str(random.randint(100000, 999999)).zfill(6)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if payload is None:
        return None
    if payload.get("type") != "access":
        return None
    return payload


def verify_refresh_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if payload is None:
        return None
    if payload.get("type") != "refresh":
        return None
    return payload


async def send_otp_sms(phone: str, code: str) -> bool:
    """
    Send OTP via Mobizon SMS API.
    # TODO: integrate Mobizon SMS API
    In development mode, OTP is always 123456 and no SMS is sent.
    """
    if settings.DEBUG:
        print(f"[DEV] OTP for {phone}: {code}")
        return True

    # TODO: integrate Mobizon SMS API
    # import httpx
    # async with httpx.AsyncClient() as client:
    #     resp = await client.post(
    #         "https://api.mobizon.kz/service/message/sendsmsmessage",
    #         params={
    #             "recipient": phone,
    #             "text": f"Ваш код Nesie: {code}",
    #             "apiKey": settings.MOBIZON_API_KEY,
    #             "from": settings.MOBIZON_SENDER,
    #         }
    #     )
    #     return resp.status_code == 200
    return True
