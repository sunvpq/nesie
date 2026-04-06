from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class FactorResponse(BaseModel):
    key: str
    value: float
    impact: str  # positive, negative, neutral
    description_ru: str

    class Config:
        from_attributes = True


class ScoreResponse(BaseModel):
    score: int
    delta: int
    grade: str
    grade_label: str
    fetched_at: datetime
    factors: List[FactorResponse] = []

    class Config:
        from_attributes = True


class ScoreHistory(BaseModel):
    date: datetime
    score: int
    delta: int

    class Config:
        from_attributes = True


class ScoreHistoryResponse(BaseModel):
    history: List[ScoreHistory]
