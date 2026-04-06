from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    loan_type = Column(String(50), nullable=False)
    amount = Column(Integer, nullable=False)  # in tiyn
    term_months = Column(Integer, nullable=False)
    monthly_income = Column(Integer, nullable=False)  # in tiyn
    score_before = Column(Integer, nullable=False)
    score_after = Column(Integer, nullable=False)
    score_delta = Column(Integer, nullable=False)
    monthly_payment = Column(Integer, nullable=False)  # in tiyn
    dti_before = Column(Float, nullable=False)
    dti_after = Column(Float, nullable=False)
    verdict = Column(String(20), nullable=False)  # recommend, caution, decline
    reason = Column(String(500), nullable=True)
    recovery_months = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="simulations")
