from pydantic import BaseModel, field_validator
import re


class PhoneSendOTP(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Normalize: strip spaces and dashes
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?7\d{10}$", cleaned):
            raise ValueError("Неверный формат номера телефона. Ожидается +7XXXXXXXXXX")
        if not cleaned.startswith("+"):
            cleaned = "+" + cleaned
        return cleaned


class VerifyOTP(BaseModel):
    phone: str
    code: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?7\d{10}$", cleaned):
            raise ValueError("Неверный формат номера телефона")
        if not cleaned.startswith("+"):
            cleaned = "+" + cleaned
        return cleaned

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not re.match(r"^\d{6}$", v):
            raise ValueError("Код должен состоять из 6 цифр")
        return v


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_new_user: bool = False


class TokenRefresh(BaseModel):
    refresh_token: str
