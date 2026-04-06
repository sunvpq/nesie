from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class CreditScore(Base):
    __tablename__ = "credit_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    delta = Column(Integer, default=0)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="credit_scores")
    factors = relationship("ScoreFactor", back_populates="credit_score", cascade="all, delete-orphan")
