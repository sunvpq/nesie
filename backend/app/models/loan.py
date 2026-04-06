from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lender_name = Column(String(200), nullable=False)
    loan_type = Column(String(50), nullable=False)  # consumer, auto, mortgage, micro
    original_amount = Column(Integer, nullable=False)  # in tiyn
    remaining_balance = Column(Integer, nullable=False)  # in tiyn
    monthly_payment = Column(Integer, nullable=False)  # in tiyn
    next_payment_date = Column(Date, nullable=True)
    is_overdue = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    opened_at = Column(Date, nullable=True)
    synced_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="loans")
