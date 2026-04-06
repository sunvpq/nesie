from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional


class LoanResponse(BaseModel):
    id: int
    lender_name: str
    loan_type: str
    original_amount: int  # in tiyn
    remaining_balance: int  # in tiyn
    monthly_payment: int  # in tiyn
    next_payment_date: Optional[date] = None
    is_overdue: bool = False
    is_active: bool = True
    opened_at: Optional[date] = None
    synced_at: datetime

    class Config:
        from_attributes = True


class LoanListResponse(BaseModel):
    loans: List[LoanResponse]
    total_balance: int  # in tiyn
    total_monthly: int  # in tiyn
    loan_count: int
    dti: Optional[float] = None
