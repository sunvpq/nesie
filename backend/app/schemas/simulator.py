from pydantic import BaseModel, field_validator
from typing import Optional


class SimulatorRequest(BaseModel):
    loan_type: str  # consumer, auto, mortgage, micro
    amount: int  # in tiyn
    term_months: int
    monthly_income: int  # in tiyn

    @field_validator("loan_type")
    @classmethod
    def validate_loan_type(cls, v: str) -> str:
        allowed = ["consumer", "auto", "mortgage", "micro"]
        if v not in allowed:
            raise ValueError(f"Тип кредита должен быть одним из: {', '.join(allowed)}")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: int) -> int:
        if v < 5000_00:  # minimum 5,000 tenge in tiyn
            raise ValueError("Минимальная сумма кредита: 5 000 ₸")
        return v

    @field_validator("term_months")
    @classmethod
    def validate_term(cls, v: int) -> int:
        if v < 1 or v > 360:
            raise ValueError("Срок кредита должен быть от 1 до 360 месяцев")
        return v

    @field_validator("monthly_income")
    @classmethod
    def validate_income(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Доход не может быть отрицательным")
        return v


class SimulatorResult(BaseModel):
    score_before: int
    score_after: int
    score_delta: int
    monthly_payment: int  # in tiyn
    dti_before: float
    dti_after: float
    verdict: str  # recommend, caution, decline
    reason: str
    recovery_months: Optional[int] = None
    loan_type: str
    amount: int  # in tiyn
    term_months: int
