from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class UserProfile(BaseModel):
    id: int
    phone: str
    iin: Optional[str] = None
    full_name: Optional[str] = None
    is_pro: bool = False
    pro_expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None


class IINSubmit(BaseModel):
    iin: str

    @field_validator("iin")
    @classmethod
    def validate_iin(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 12:
            raise ValueError("ИИН должен состоять из 12 цифр")
        return v
