from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ScoreFactor(Base):
    __tablename__ = "score_factors"

    id = Column(Integer, primary_key=True, index=True)
    credit_score_id = Column(Integer, ForeignKey("credit_scores.id"), nullable=False, index=True)
    key = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    impact = Column(String(20), nullable=False)  # positive, negative, neutral
    description_ru = Column(String(500), nullable=True)

    credit_score = relationship("CreditScore", back_populates="factors")
